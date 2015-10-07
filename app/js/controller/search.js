/**
 * Created by liuhuisheng on 2015/1/31.
 */
define(['app'], function (app) {
 
    app.controller('searchCtrl', ['$scope', '$element', function ($scope, $element) {
        var tab = app.getTab($element.data('tabid'));
        tab.attachHTMLString();
    }]);
});