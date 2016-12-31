define(function (require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var Promise = require('promise');

    function FsRoot(files) {
        this.root = files;
    }

    FsRoot.prototype.visit = function (func) {
        function recurse(path, node) {
            _.each(node, function (sub, name) {
                switch (sub.type) {
                    case 'file':
                        func(path, name, sub.contents);
                        break;
                    case 'directory':
                        func(path, name, null);
                        recurse(path + '/' + name, sub.contents);
                        break;
                }
            });
        }

        recurse('', this.root);
    };
    FsRoot.prototype.resolve = function (path) {
        var sub = path.split('/');
        var node = this.root;
        if (sub.length === 0) return node;
        while (sub.length > 1) {
            var thisDir = sub.shift();

            if (!node[thisDir]) return null;
            if (node[thisDir].type !== 'directory') return null;
            node = node[thisDir].contents;
        }
        var leaf = sub[0];
        if (!node[leaf]) return null;
        return node[leaf];
    };

    FsRoot.prototype.load = function (path) {
        var file = this.resolve(path);
        if (!file || file.type !== 'file') return null;
        return file.contents;
    };

    function load() {
        var text = $.ajax({type: "GET", url: 'samples/relocdemo.6502', async: false}).responseText;
        return Promise.resolve({
            name: "Sample Project",
            author: "Matt Godbolt",
            files: new FsRoot({
                'samples': {
                    type: 'directory',
                    contents: {
                        'relocdemo.6502': {type: 'file', contents: text}
                    }
                }
            }),
            buildArgs: ['-i', 'samples/relocdemo.6502', '-boot', 'Code']
        });
    }

    return {
        load: load
    };
});