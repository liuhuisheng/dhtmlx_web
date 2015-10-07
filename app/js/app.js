define(function (require) {
    'use strict';
 
    var app = angular.module('chituApp', ['ngResource']);

    app.init = function () {
        angular.bootstrap(document, ['chituApp']);
    };
 
    app.config(function ($controllerProvider, $provide, $compileProvider, $resourceProvider) {

        // Save the older references.
        app._controller = app.controller;
        app._service = app.service;
        app._factory = app.factory;
        app._value = app.value;
        app._directive = app.directive;

        // Provider-based controller.
        app.controller = function (name, constructor) {
            $controllerProvider.register(name, constructor);
            return (this);

        };

        // Provider-based service.
        app.service = function (name, constructor) {
            $provide.service(name, constructor);
            return (this);

        };

        // Provider-based factory.
        app.factory = function (name, factory) {
            $provide.factory(name, factory);
            return (this);

        };

        // Provider-based value.
        app.value = function (name, value) {
            $provide.value(name, value);
            return (this);

        };

        // Provider-based directive.
        app.directive = function (name, factory) {
            $compileProvider.directive(name, factory);
            return (this);

        };
 
        // $resource settings
        $resourceProvider.defaults.stripTrailingSlashes = false;
    });

    app.run(function (){
        //run some code here ...
    });

    return app;
});