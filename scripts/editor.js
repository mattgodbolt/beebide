define(function (require) {
    var $ = require('jquery');
    require('vs/editor/editor.main');
    var v6502 = require('6502');
    var beebasm = require('beebasm');

    monaco.languages.register({'id': '6502'});
    monaco.languages.setMonarchTokensProvider('6502', v6502);
    function Editor(container, state) {
        this.container = container;
        var root = container.getElement().html($('#editor').html());
        var text = $.ajax({type: "GET", url: 'samples/relocdemo.6502', async: false}).responseText;
        this.editor = monaco.editor.create(root.find(".editor")[0], {
            value: text,
            language: '6502'
        });

        this.container.on('resize', function () {
            this.editor.layout();
        }, this);
        
        beebasm(['-i', './test.6502', '-do', './foo.ssd'], {'test.6502': text});
    }

    return Editor;
});