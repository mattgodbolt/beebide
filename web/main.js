require.config({
    paths: {
        jquery: 'vendor/jquery/dist/jquery',
        underscore: 'vendor/underscore/underscore',
        goldenlayout: 'vendor/golden-layout/dist/goldenlayout',
        events: 'vendor/eventEmitter/EventEmitter',
        clipboard: 'vendor/clipboard/dist/clipboard',
        'raven-js': 'vendor/raven-js/dist/raven',
        promise: 'vendor/es6-promise/es6-promise',
        vs: 'vendor/monaco-editor/dev/vs',
        worker: 'vendor/requirejs-web-workers/src/worker',
        jstree: 'vendor/jstree/dist/jstree',
        jsbeeb: 'jsbeeb',
        jsunzip: 'jsbeeb/lib/jsunzip',
        'webgl-debug': 'jsbeeb/lib/webgl-debug'
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
