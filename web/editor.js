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
        this.project = null;
        var root = container.getElement().html($('#editor').html());
        this.editor = monaco.editor.create(root.find(".editor")[0], {
            value: '',
            language: '6502'
        });

        this.editor.addAction({
            id: 'compile',
            label: 'Compile The Project',
            keybindings: [monaco.KeyMod.Ctrl | monaco.KeyCode.F9],
            run: _.bind(function () {
                this.compile();
                return monaco.Promise.wrap(true);
            }, this)
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

        this.hub.on('projectChange', this.onProjectChange, this);
    }

    Editor.prototype.compile = function () {
        beebasm(this.project.buildArgs, this.project.files)
            .then(_.bind(function (e) {
                console.log("compiled:", e);
                if (e.status === 0) this.hub.emit('start', e);
            }, this)).catch(function (e) {
            console.log("error", e);
        });
    };

    Editor.prototype.onProjectChange = function (project) {
        this.project = project;
        console.log(project);
        this.editor.getModel().setValue(project.files.load('samples/relocdemo.6502'));
    };

    return Editor;
});