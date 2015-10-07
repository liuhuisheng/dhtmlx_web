!function () {
    //config requirejs
    require.config({
        baseUrl: './app/js/',
        paths: {
            assets: '../../assets/',
            css: '../../assets/lib/requirejs/css',
            text: '../../assets/lib/requirejs/text',
            views: '../views',
            config: 'config/global',
            'angular-resource': '../../assets/lib/angularjs/1.3.9/angular-resource'
        },
        shim: {},
        urlArgs: 'v=201502100127&r='+Math.random()
    });

    //init main
    require(['app',
        'config',
        'angular-resource',
        'service/index',
        'directive/index',
        'controller/index'],
        function (app, config) {
            app.init();
        }
    );
}();

