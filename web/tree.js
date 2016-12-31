define(function (require) {
    var $ = require('jquery');
    require('jstree');

    function Tree(container, state) {
        this.container = container;
        this.hub = container.layoutManager.eventHub;
        this.project = null;
        this.root = container.getElement().html($('#tree').html());
        var node = this.root.find('.tree').jstree();
        this.tree = node.jstree(true);
        this.hub.on('projectChange', this.onProjectChange, this);
    }

    Tree.prototype.onProjectChange = function (project) {
        this.project = project;
        var jsonTree = [];
        var nodesById = {'': jsonTree};
        this.project.files.visit(function (path, name, contents) {
            var parent = nodesById[path];
            var fullPath = path + '/' + name;
            if (!contents) {
                var dirNode = {
                    id: fullPath,
                    text: name,
                    children: []
                };
                parent.push(dirNode);
                nodesById[fullPath] = dirNode.children;
            } else {
                parent.push({
                    id: fullPath,
                    text: name
                });
            }
        });
        this.tree.settings.core.data = jsonTree;
        this.tree.refresh();
    };

    return Tree;
});