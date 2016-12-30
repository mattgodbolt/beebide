require.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        goldenlayout: '../bower_components/golden-layout/dist/goldenlayout',
        events: '../bower_components/eventEmitter/EventEmitter',
        clipboard: '../bower_components/clipboard/dist/clipboard',
        'raven-js': '../bower_components/raven-js/dist/raven',
        promise: '../bower_components/es6-promise/es6-promise',
        vs: '../bower_components/monaco-editor/dev/vs',
        worker: '../bower_components/requirejs-web-workers/src/worker',
        jstree: '../bower_components/jstree/dist/jstree',
        jsbeeb: '../jsbeeb',
        jsunzip: '../jsbeeb/lib/jsunzip',
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
    var Tree = require('tree');
    var GoldenLayout = require('goldenlayout');
    var $ = require('jquery');

    var config = {
        settings: {showPopoutIcon: false},
        content: [{
            type: 'row',
            content: [
                // {type: 'component', width: 10, componentName: 'tree', componentState: {}},
                {type: 'component', width: 50, componentName: 'editor', componentState: {}},
                {type: 'component', width: 40, componentName: 'emulator', componentState: {}}
            ]
        }]
    };

    var root = $("#root");
    var layout = new GoldenLayout(config, root);
    layout.registerComponent('tree', function (container, state) {
        return new Tree(container, state);
    });
    layout.registerComponent('editor', function (container, state) {
        return new Editor(container, state);
    });
    layout.registerComponent('emulator', function (container, state) {
        return new Emulator(container, state);
    });
    layout.init();

    function sizeRoot() {
        var height = $(window).height() - root.position().top;
        root.height(height);
        layout.updateSize();
    }

    $(window).resize(sizeRoot);
    sizeRoot();
});