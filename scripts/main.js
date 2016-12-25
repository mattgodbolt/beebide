require.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        goldenlayout: '../bower_components/golden-layout/dist/goldenlayout',
        events: '../bower_components/eventEmitter/EventEmitter',
        clipboard: '../bower_components/clipboard/dist/clipboard',
        'raven-js': '../bower_components/raven-js/dist/raven',
        'es6-promise': '../bower_components/es6-promise/es6-promise',
        'vs': '../bower_components/monaco-editor/dev/vs'
    },
    packages: [{
        name: "codemirror",
        location: "ext/codemirror",
        main: "lib/codemirror"
    }],
    shim: {
        underscore: {exports: '_'},
        bootstrap: ['jquery']
    }
});

define(function (require) {
    "use strict";
    var _ = require('underscore');
    var Editor = require('editor');
    var GoldenLayout = require('goldenlayout');
    var config = {
        settings: {showPopoutIcon: false},
        content: [{
            type: 'row',
            content: [
                {type: 'component', componentName: 'editor', componentState: {}}
            ]
        }]
    };

    var layout = new GoldenLayout(config);
    layout.registerComponent('editor', function (container, state) {
        return new Editor(container, state);
    });
    layout.init();
});