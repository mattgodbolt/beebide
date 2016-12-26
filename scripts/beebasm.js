define(function (require) {
    var _ = require('underscore');
    require('es6-promise');
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
    return function (command, files) {
        command.push('-do');
        command.push('./output.ssd');
        return new Promise(function (resolve, reject) {
            var id = _.uniqueId();
            pending[id] = {resolve: resolve, reject: reject};
            worker.postMessage({id: id, command: command, files: files, output: './output.ssd'});
        });
    };
});
