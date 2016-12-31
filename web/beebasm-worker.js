importScripts('vendor/requirejs/require.js');
require.config({
    paths: {
        underscore: 'vendor/underscore/underscore'
    },
    shim: {
        underscore: {exports: '_'}
    }
});

var pending = [];
onmessage = function (event) {
    pending.push(event);
};
// NB errors of the form 'importScripts failed for underscore at ...' are probably
// exceptions thrown here...
require(['./beebasm/beebasm', 'underscore'], function (BeebAsm, _) {
    onmessage = function (event) {
        event = event.data;
        console.log(event);
        try {
            var stdout = [];
            var stderr = [];
            var status = -1;
            var module = {
                arguments: event.command,
                preRun: function () {
                    _.each(event.paths, function (path) {
                        module.FS_createPath('/', path);
                    });
                    _.each(event.files, function (data, filename) {
                        module.FS_createDataFile('/', filename, data, true, false, true);
                    });
                },
                print: function (line) {
                    stdout.push(line);
                },
                printErr: function (line) {
                    stderr.push(line);
                },
                onExit: function (status_) {
                    status = status_;
                }
            };
            var before = Date.now();
            BeebAsm(module);
            var after = Date.now();
            var result = null;
            if (module.FS.stat(event.output))
                result = module.FS.readFile(event.output);
            postMessage({
                id: event.id,
                stdout: stdout,
                stderr: stderr,
                result: result,
                status: status,
                timeTaken: after - before
            });
        } catch (e) {
            console.log(e);
            postMessage({
                id: event.id,
                exception: e.toString()
            });
        }
    };
    _.each(pending, onmessage);
});
