/**
 * Created by liuhuisheng on 2015/2/28.
 * todo using angular-resource to access data
 */
define(['app'], function (app) {
    app.service('myApi', function () {
        this.getMenus = function () {
            var menusData = [
                     {
                         id: "a",
                         text: "开发示例",
                         item: [
                             { id: 91, text: "企业信息", ctrl: 'bas/tenant_list', icon: 'imoon imoon-office' },
                             { id: 24, text: "企业信息-虚拟分页", ctrl: 'bas/tenant_list2', icon: 'imoon imoon-office' },
                             { id: 2, text: "应用管理", ctrl: 'bas/app_list', icon: 'imoon imoon-qrcode' },
                             { id: 3, text: "登陆帐户", href: 'views/demo/page1.html', icon: 'glyphicons glyphicons-keys' },
                             { id: 94, text: "平台参数", ctrl: 'bas/settings', icon: 'imoon imoon-cog2' }
                         ]
                     },
                    {
                        id: "b",
                        text: "测试页面",
                        item: [
                             { id: 1220, text: "查询页面", icon: "icon-home", href: "views/demo/page_search.html" },
                             { id: 22, text: "编辑页面", icon: "icon-note", href: "views/demo/page_edit.html" },
                             {
                                 id: 1, text: "树形菜单", child: 1, open: 0,
                                 item: [
                                      {
                                          id: 11, text: "权限管理", open: 0, item: [
                                            { id: 111, text: "资源定义" }
                                          , { id: 112, text: "用户角色" }
                                          , { id: 113, text: "分配权限" }
                                          ]
                                      },
                                      {
                                          id: 12, text: "系统管理", open: 0, item: [
                                            { id: 121, text: "系统参数" }
                                          , { id: 122, text: "数据字典" }
                                          , { id: 123, text: "查看日志" }
                                          ]
                                      }
                                      ,
                                      {
                                          id: 13, text: "通用管理", open: 0, item: [
                                            { id: 131, text: "编码规则" }
                                          , { id: 132, text: "导入规则" }
                                          , { id: 133, text: "自定义查询" }
                                           , { id: 133, text: "动态表单" }
                                          ]
                                      }
                                 ]
                             }
                        ]
                    }
            ];

            return menusData;
        };

        this.getTasks = function () {
            var tasks = [
                  { name: 'Lorem ipsum dolor sit amet', type: 'Html', time: '4 mins ago', status: 'unread', typeCls: 'label-success' }
                , { name: 'Consectetur adipiscing', type: 'CSS', time: '12 mins ago', status: 'read', typeCls: 'label-info' }
                , { name: 'Tempor incididunt ut', type: 'Javascript', time: '15 mins ago', status: 'read', typeCls: 'label-warning' }
                , { name: 'Ut enim ad minim', type: 'Fix Bug', time: '18 mins ago', status: 'read', typeCls: 'label-default' }
                , { name: 'Sed ut perspiciatis unde omnis', type: 'Html', time: '2 days ago', status: 'read', typeCls: 'label-success' }
                , { name: 'Sed quia non numquam', type: 'CSS', time: '2 days ago', status: 'read', typeCls: 'label-info' }
                , { name: 'Lorem ipsum dolor sit', type: 'Fix Bug', time: '5 days ago', status: 'read', typeCls: 'label-default' }
            ];
            return tasks;
        };

        this.getNotifys = function () {
            var notifys = [
                  { name: 'New Comment', icon: 'fa fa-comment', bgCls: 'label-info', time: '4 mins ago', status: 'unread' }
                , { name: '3 New Followers', icon: 'fa fa-twitter', bgCls: 'label-success', time: '12 mins ago', status: 'unread' }
                , { name: 'Message Sent', icon: 'fa fa-envelope', bgCls: 'label-warning', time: '15 mins ago', status: 'read' }
                , { name: 'New Task', icon: 'fa fa-tasks', bgCls: 'label-success', time: '18 mins ago', status: 'read' }
                , { name: 'Server Rebooted', icon: 'fa fa-upload', bgCls: 'label-danger', time: '19 mins ago', status: 'read' }
                , { name: 'New Task', icon: 'fa fa-tasks', bgCls: 'label-success', time: '2 days ago', status: 'read' }
                , { name: 'Message Sent', icon: 'fa fa-envelope', bgCls: 'label-warning', time: '5 days ago', status: 'read' }
            ];
            return notifys;
        };

        this.getUserName = function () {
            return "萧秦";
        };

        this.getChat = function () {
            var chat = {};
            chat.mine = {
                receiveCount: 2,
                activeCount: 5,
                avatar: app.getAppRoot() + 'img/avatar/men-27.jpg'
            };
            chat.current = {
                id: '', name: 'Judy Russell 123', avatar: app.getAppRoot() + 'img/avatar/claudioguglieri-48.jpg', status: 'is-online', chats: [
                  { message: 'Hi, we have some ideas for this template', status: 'unread', from: 'You', time: '08:44', unread: 1 },
                  { message: 'Great! Let tell us now...', status: 'unread', from: 'Judy Russell', time: '08:44', unread: 1 }]
            };
            chat.groups = [{
                id: '0', name: '最近', friends: [
                    {
                        id: '', name: 'Judy Russell 123', avatar: app.getAppRoot() + 'img/avatar/claudioguglieri-48.jpg', status: 'is-online', chats: [
                          { message: 'Hi, we have some ideas for this template', status: 'unread', from: 'You', time: '08:44', unread: 1 },
                          { message: 'Great! Let tell us now...', status: 'unread', from: 'Judy Russell', time: '08:44', unread: 1 }]
                    },
                    {
                        id: '', name: 'Eugene Turner', avatar: app.getAppRoot() + 'img/avatar/uxceo-48.jpg', status: 'is-online', chats: [
                          { message: 'Hi, we have some ideas for this template', status: 'unread', from: 'You', time: '08:44', unread: 1 },
                          { message: 'Great! Let tell us now...', status: '', from: 'Judy Russell', time: '08:47', unread: 0 }]
                    },
                    {
                        id: '', name: 'Ann Porter', avatar: app.getAppRoot() + 'img/avatar/rssems-48.jpg', status: 'is-busy', chats: [
                        { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44', unread: 1 },
                          { message: 'Great! Let tell us now...', status: '', from: 'Judy Russell', time: '08:44', unread: 1 }]
                    },
                    {
                        id: '', name: 'Benjamin Howell', avatar: app.getAppRoot() + 'img/avatar/jackmcdade-48.jpg', status: 'is-idle', chats: [
                        { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44', unread: 1 },
                          { message: 'Great! Let tell us now...', status: '', from: 'Judy Russell', time: '08:44', unread: 1 }]
                    }
                ]
            },
            {
                id: '0', name: '工作', friends: [
                    {
                        id: '', name: 'Lawrence Larson', avatar: app.getAppRoot() + 'img/avatar/oliveirasimoes-48.jpg', status: 'is-busy', chats: [
                          { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44' },
                          { message: 'Great! Let tell us now...', status: '', from: 'Judy Russell', time: '08:45' }]
                    },
                    {
                        id: '', name: 'Jacqueline Howell', avatar: app.getAppRoot() + 'img/avatar/adellecharles-48.jpg', status: 'is-offline', chats: [
                            { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44', unread: 1 },
                          { message: 'Great! Let tell us now...', status: '', from: 'Judy Russell', time: '08:44', unread: 1 }]
                    },
                    {
                        id: '', name: 'Andrew Brewer', avatar: app.getAppRoot() + 'img/avatar/jackmcdade-48.jpg', status: 'is-busy', chats: [
                            { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44' }
                        ]
                    }
                ]
            }
            ,
            {
                id: '0', name: '朋友', friends: [
                    {
                        id: '', name: 'Marilyn Romero', avatar: app.getAppRoot() + 'img/avatar/adellecharles-48.jpg', status: 'is-online', chats: [
                          { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44' },
                          { message: 'Great! Let tell us now...', status: '', from: 'Marilyn Romero', time: '08:45' }]
                    },
                    {
                        id: '', name: 'Jacqueline Howell', avatar: app.getAppRoot() + 'img/avatar/rssems-48.jpg', status: 'is-offline', chats: [
                            { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44' }]
                    },
                    {
                        id: '', name: 'Andrew Brewer', avatar: app.getAppRoot() + 'img/avatar/jackmcdade-48.jpg', status: 'is-busy', chats: [
                            { message: 'Hi, we have some ideas for this template', status: '', from: 'You', time: '08:44' }
                        ]
                    }
                ]
            }
            ];

            return chat;
        };
    });
});