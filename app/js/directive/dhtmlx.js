/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app'], function (app) {
    app.directive('dhtmlxgrid', function ($resource) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                fields: '@',
                header1: '@',
                header2: '@',
                colwidth: '@',
                colalign: '@',
                coltype: '@',
                colsorting: '@',
                pagingsetting: '@',
                autoheight: '=',
                url: '@',
                params:'@'
            },
            link: function (scope, element, attrs) {
                scope.uid = app.genStr(12);
                element.attr("id", "dhx_grid_" + scope.uid);
                element.css({ "width": "100%", "border-width": "1px 0 0 0"});
                scope.grid = new dhtmlXGridObject(element.attr("id"));
                scope.header1    && scope.grid.setHeader(scope.header1);
                scope.header2    && scope.grid.attachHeader(scope.header2);
                scope.fields     && scope.grid.setFields(scope.fields);
                scope.colwidth   && scope.grid.setInitWidths(scope.colwidth)
                scope.colalign   && scope.grid.setColAlign(scope.colalign)
                scope.coltype    && scope.grid.setColTypes(scope.coltype);
                scope.colsorting && scope.grid.setColSorting(scope.colsorting);

                scope.grid.entBox.onselectstart = function () { return true; };

                if (scope.pagingsetting) {
                    var pagingArr = scope.pagingsetting.split(",");
                    var pageSize = parseInt(pagingArr[0]);
                    var pagesInGrp = parseInt(pagingArr[1]);
                    var pagingArea = document.createElement("div");
                    pagingArea.id = "pagingArea_" + scope.uid;
                    pagingArea.style.borderWidth = "1px 0 0 0";
                    var recinfoArea = document.createElement("div");
                    recinfoArea.id = "recinfoArea_" + scope.uid;
                    element.after(pagingArea);
                    element.after(recinfoArea);
                    scope.grid.enablePaging(true, pageSize, pagesInGrp, pagingArea.id, true, recinfoArea.id);
                    scope.grid.setPagingSkin("toolbar", "dhx_skyblue");
                    scope.grid.i18n.paging = {
                        results: "结果",
                        records: "显示",
                        to: "-",
                        page: "页",
                        perpage: "行每页",
                        first: "首页",
                        previous: "上一页",
                        found: "找到数据",
                        next: "下一页",
                        last: "末页",
                        of: " 的 ",
                        notfound: "查询无数据"
                    };
                }

                scope.grid.setImagePath(app.getProjectRoot("assets/lib/dhtmlx/v403_pro/skins/skyblue/imgs/"));
                scope.grid.init();

                if (scope.autoheight) {
                    var resizeGrid = function () {
                        element.height(element.parent().parent().height() - scope.autoheight);
                        scope.grid.setSizes();
                    };
                    $(window).resize(resizeGrid);
                    resizeGrid();
                }

                //scope.grid.enableSmartRendering(true);

                if (scope.url) {
                    var url = app.getApiUrl(scope.url);
                    var param = scope.$parent[scope.params] || {};
                    var api = $resource(url, {}, { query: { method: 'GET', isArray: false } });
                    scope.grid.setQuery(api.query, param);
                }

                //保存grid到父作用域中
                attrs.dhtmlxgrid && (scope.$parent[attrs.dhtmlxgrid] = scope.grid);
            }
        };
    });

    app.directive('dhtmlxtoolbar', function () {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                iconspath: '@',
                items:'@'
            },
            link: function (scope, element, attrs) {
                scope.uid = app.genStr(12);
                element.attr("id", "dhx_toolbar_" + scope.uid);
                element.css({ "border-width": "0 0 1px 0" });
               

                scope.toolbar = new dhtmlXToolbarObject(element.attr("id"));
                scope.toolbar.setIconsPath(app.getProjectRoot(scope.iconspath));
                var items = eval("(" + scope.items + ")");
                //scope.toolbar.loadStruct(items);
                
                var index = 1;
                var eventmap = {};
                for (var i in items) {
                    var item = items[i];
                    if (item.action)
                        eventmap[item.id] = item.action;

                    if (item.type == 'button') {
                        scope.toolbar.addButton(item.id, index++, item.text, item.img, item.imgdis);
                        item.enabled == false && scope.toolbar.disableItem(item.id);
                    }
                    else if (item.type == 'separator') {
                        scope.toolbar.addSeparator(index++);
                    }
                }
               
                scope.toolbar.attachEvent("onClick", function (id) {
                    var name = eventmap[id];
                    if (name && scope.$parent[name] && angular.isFunction(scope.$parent[name]))
                        scope.$parent[name].call(this);
                });

                //保存grid到父作用域中
                attrs.dhtmlxtoolbar && (scope.$parent[attrs.dhtmlxtoolbar] = scope.toolbar);

                //scope.toolbar.addButton("new", 1, "新增", "add.png");
                //scope.toolbar.addButton("edit", 2, "修改", "edit.gif");
                //scope.toolbar.addButton("del", 3, "删除", "cross.png");
                //scope.toolbar.addButton("test2", 5, "测试", "fa fa-comments", "green");
                //scope.toolbar.disableItem("edit");
                //scope.toolbar.attachEvent("onClick", function (id) {
                //    alert(id);
                //});
            }
        }
    });
});