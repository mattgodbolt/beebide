define(function (require) {
    var $ = require('jquery');
    require('jstree');

    function Tree(container, state) {
        this.container = container;
        this.root = container.getElement().html($('#tree').html());
        this.root.find('.tree').jstree();
    }

    return Tree;
});