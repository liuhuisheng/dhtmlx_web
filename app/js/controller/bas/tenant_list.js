/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app','directive/dhtmlx'], function (app) {
    app.controller('bas/tenant_listCtrl', ['$scope', '$element', function ($scope, $element) {
        //$scope.form = {
        //    tenant_id: "angular test",
        //    tenant_name: "tenant_name test",
        //    charge_person: "charge_person",
        //    addr: "",
        //    tel: "",
        //    enable:true
        //};

        $scope.addClick = function () {
            alert("addClick");
        };

        $scope.searchClick = function () {
            $scope.grid.query($scope.form);
        };
        $scope.clearClick = function () {
            for (var i in $scope.form)
                $scope.form[i] = null;

            $scope.grid.query($scope.form);
        };

        //$scope.grid.enableSmartRendering(true);
    }]);
});