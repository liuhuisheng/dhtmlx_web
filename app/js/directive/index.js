/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app'], function (app) {
    app.directive('myHeader', function () {
        return {
            templateUrl: app.getAppRoot() + "views/main/_header.html",
            link: function (scope, element, attr) {
                app.handleToggle();
                app.handleSlimScroll();
                app.handlePulsate();
            }
        };
    });

    app.directive('myFooter', function () {
        return {
            templateUrl: app.getAppRoot() + "views/main/_footer.html",
            link: function (scope, element, attr) {
                element.addClass("dhxlayout_sep");
            }
        };
    });

    app.directive('myLayout', function () {
        return {
            link: function (scope, element, attrs) {
                scope.creator.createLayout();
            }
        };
    });

    app.directive('mySetting', function () {
        return {
            templateUrl: app.getAppRoot() + "views/main/_setting.html",
            link: function (scope, el, attr) {
                app.handleBootstrapSwitch(el);
                app.handleTemplateSetting();
            }
        };
    });

    app.directive('myChat', function () {
        return {
            templateUrl: app.getAppRoot() + "views/main/_chat.html",
            link: function (scope, el, attr) {
                app.handleBootstrapSwitch(el);
                app.handleFormChat(scope);
            }
        };
    });
});