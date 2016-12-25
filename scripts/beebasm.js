define(function (require) {
    var _ = require('underscore');
    var BeebAsm = require('../beebasm/beebasm');

    return function (command, files) {
        var module = {
            arguments: command,
            preRun: function () {
                _.each(files, function (data, filename) {
                    module.FS_createDataFile('.', filename, data, true, false, true);
                });
            },
            // noInitialRun: true,
            locateFile: function() {
                console.log(arguments);
            },
            logReadFiles: true
        };
        BeebAsm(module);
        console.log("ooh");
        window.moo = module;
    };
});
