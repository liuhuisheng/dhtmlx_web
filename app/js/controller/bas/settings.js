/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app'], function (app) {
    app.controller('bas/settingsCtrl', ['$scope', '$element', function ($scope, $element) {
        $scope.test = "liuhuisheng test";
        $scope.chk1 = true;

        $scope.form = {};
        $scope.form.enablemultitenant = true;
        //$scope.form.enablepush = false;
        //$scope.form.copyright = "abcdefg";
        //$scope.form.systemname = "xxxxxx";
    }]);
     
    return function (o) {
        var toolbar = o.tab.attachToolbar();
        toolbar.setIconsPath(o.assets + "img/btn/");
        toolbar.addButton("save", 3, "保存", "save.gif", "save_dis.gif");
        o.$element.find(".tab-content").height(o.$element.height() - 65);
    };
});