define(function (require) {
    var _ = require('underscore');
    require('promise');
    var worker = require('worker!beebasm-worker.js');
    var pending = {};
    worker.onmessage = function (event) {
        event = event.data;
        if (event.exception) {
            pending[event.id].reject(event.exception);
        } else {
            pending[event.id].resolve(event);
        }
        delete pending[event.id];
    };
    return function (command, root) {
        command.push('-do');
        command.push('./output.ssd');
        var paths = {};
        var files = {};
        root.visit(function (path, name, contents) {
            var fullPath = path + '/' + name;
            if (contents) {
                files[fullPath] = contents;
            } else {
                paths[fullPath] = true;
            }
        });
        return new Promise(function (resolve, reject) {
            var id = _.uniqueId();
            pending[id] = {resolve: resolve, reject: reject};
            worker.postMessage({id: id, command: command, paths: _.keys(paths), files: files, output: './output.ssd'});
        });
    };
});
