define(function (require) {
    'use strict';

    return {
        home: {
            id: 'homeTab',
            text: '我的桌面',
            icon: 'icon-home',
            ctrl: 'bas/home',
            href: '',
            close:false
        },
        dashboard: {
            limit: 30
        },
        webapi: 'http://localhost:60959/api',
        signalr: 'http://localhost:14001/signalr/'
    };
});