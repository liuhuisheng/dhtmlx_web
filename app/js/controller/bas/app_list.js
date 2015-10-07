/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app','directive/dhtmlx'], function (app) {
    app.controller('bas/app_listCtrl', ['$scope', '$element', function ($scope, $element) {
         
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
    }]);
});