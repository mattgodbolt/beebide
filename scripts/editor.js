define(function (require) {
    var $ = require('jquery');
    require('vs/editor/editor.main');
    var v6502 = require('6502');
    var beebasm = require('beebasm');

    monaco.languages.register({'id': '6502'});
    monaco.languages.setMonarchTokensProvider('6502', v6502);
    function Editor(container, state) {
        this.container = container;
        this.hub = container.layoutManager.eventHub;
        var root = container.getElement().html($('#editor').html());
        var text = $.ajax({type: "GET", url: 'samples/relocdemo.6502', async: false}).responseText;
        this.editor = monaco.editor.create(root.find(".editor")[0], {
            value: text,
            language: '6502'
        });

        this.container.on('resize', function () {
            this.editor.layout();
        }, this);

        this.container.on('shown', function () {
            this.editor.layout();
        }, this);

        this.container.on('destroy', function () {
            this.editor.dispose();
        }, this);

        var compile = _.debounce(_.bind(function () {
            beebasm(['-i', './test.6502', '-boot', 'Code'], {'test.6502': this.editor.getValue()}).then(_.bind(function (e) {
                console.log("compiled:", e);
                if (e.status === 0) this.hub.emit('start', e);
            }, this)).catch(function (e) {
                console.log("error", e);
            });
        }, this), 1000);

        this.editor.getModel().onDidChangeContent(function () {
            compile();
        });
        compile();
    }

    return Editor;
});