/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app'], function (app) {
    app.directive('myCheckbox', function () {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                iconspath: '@'
            },
            link: function (scope, element, attrs) {
                element.attr("id", "dhx_toolbar_" + scope.uid);
                element.css({ "border-width": "0 0 1px 0" });
                scope.toolbar = new dhtmlXToolbarObject(element.attr("id"));
                scope.toolbar.setIconsPath(app.getProjectRoot(scope.iconspath));

                scope.toolbar.addButton("new", 1, "新增", "add.png");
                scope.toolbar.addButton("edit", 2, "修改", "edit.gif");
                scope.toolbar.addButton("del", 3, "删除", "cross.png");
                scope.toolbar.addButton("test2", 5, "测试", "fa fa-comments", "green");
                scope.toolbar.disableItem("edit");
                scope.toolbar.attachEvent("onClick", function (id) {
                    alert(id);
                });
            }
        }
    });

    //todo more controls
});