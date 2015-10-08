/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app','directive/dhtmlx'], function (app) {
    app.controller('bas/tenant_list2Ctrl', ['$scope', '$element', '$resource', function ($scope, $element, $resource) {
 
        var grid = d.tab.attachGrid();
        grid.setFields("tenant_id|#action,tenant_id,tenant_name,charge_person,tel,mobile,is_enabled,addr,memo");
        grid.setHeader("<a href=# class='dhx_grid_add'><i class='fa fa-plus-circle'></i></a>,商户编码, 商户名称, 责任人, 电话, 手机, 是否启用, 地址, 备注");
        grid.attachHeader("#rspan,#text_filter,#text_filter,#select_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
        grid.setInitWidths("55,100,250,*")
        grid.setColAlign("center,left,left,left")
        grid.setColTypes("ro,ro,ro,ed,ro,ro,roch,ro,ro");
        grid.setColSorting("na,int,str,str")
        grid.setImagePath(app.getProjectRoot("assets/lib/dhtmlx/v403_pro/skins/skyblue/imgs/"));
        grid.init();
        grid.enableSmartRendering(true, 30);

        grid.onJsonRowConvert = function (id,row) {
            row["#action"] = "<a href=# class='dhx_grid_btn'><i class='fa fa-pencil-square-o'></i></a> <a href=# class='dhx_grid_btn'><i class='fa fa-trash'></i></a>";
        };
       
        var apiUrl = app.getApiUrl('tenant');
        var api = $resource(apiUrl, {}, { query: { method: 'GET', isArray: false } });
        grid.setQuery(api.query, {});

        var statusbar = d.tab.attachStatusBar();
        grid.attachEvent("onXLS", function () {
            statusbar.setText(' 数据加载中...');
        });
        grid.attachEvent("onXLE", function () {
            statusbar.setText(' 共' + grid.rowsBuffer.length + '条数据');
        });
        grid.entBox.onselectstart = function () { return true; };
        
    }]);

    var d = null;
    return function (o) {d = o;};
});