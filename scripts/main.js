require.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        goldenlayout: '../bower_components/golden-layout/dist/goldenlayout',
        events: '../bower_components/eventEmitter/EventEmitter',
        clipboard: '../bower_components/clipboard/dist/clipboard',
        'raven-js': '../bower_components/raven-js/dist/raven',
        'promise': '../bower_components/es6-promise/es6-promise',
        'vs': '../bower_components/monaco-editor/dev/vs',
        'worker': '../bower_components/requirejs-web-workers/src/worker',
        'jsbeeb': '../jsbeeb',
        'jsunzip': '../jsbeeb/lib/jsunzip',
        'webgl-debug': '../jsbeeb/lib/webgl-debug'
    },
    shim: {
        underscore: {exports: '_'},
        bootstrap: ['jquery']
    }
});

define(function (require) {
    "use strict";
    var _ = require('underscore');
    var Editor = require('editor');
    var Emulator = require('emulator');
    var GoldenLayout = require('goldenlayout');
    var config = {
        settings: {showPopoutIcon: false},
        content: [{
            type: 'row',
            content: [
                {type: 'component', componentName: 'editor', componentState: {}},
                {type: 'component', componentName: 'emulator', componentState: {}},
            ]
        }]
    };

    var layout = new GoldenLayout(config);
    layout.registerComponent('editor', function (container, state) {
        return new Editor(container, state);
    });
    layout.registerComponent('emulator', function (container, state) {
        return new Emulator(container, state);
    });
    layout.init();
});