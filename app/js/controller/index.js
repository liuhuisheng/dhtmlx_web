/**
 * Created by liuhuisheng on 2015/2/28.
 */
define(['app', 'config'], function (app, config) {
    app.controller('myController', ['$scope', '$compile', 'myApi', '$timeout', function ($scope, $compile, myApi, $timeout) {
        //get data from the api service
        $scope.menus = myApi.getMenus();
        $scope.tasks = myApi.getTasks();
        $scope.notifys = myApi.getNotifys();
        $scope.username = myApi.getUserName();
        //$scope.homePageGridData = myApi.getHomePageGridData();
        $scope.chat = myApi.getChat();

        //create the main layout creator instance
        $scope.creator = new app.layoutCreator();
        $scope.creator.$compile = $compile;
        $scope.creator.$scope = $scope;

        //open the chat box
        $scope.openChat = function (e, f) {
            $scope.chat.current = { chats: [] };
            $("#chat-box li").remove();//for remove the li not binding with ng

            angular.forEach(f.chats, function (item) {
                if (item.from == 'You')
                    item.avatar = $scope.chat.mine.avatar;
                else
                    item.avatar = f.avatar;
            });
            $scope.chat.current = f;
            app.handleFormChatOpen(e, f);
        };

        //watch for menus change
        $scope.$watch('menus', function (newValue, oldValue) {
            $scope.creator.loadNavigationData(newValue);
        });

        ////watch for grid data in home page change
        //$scope.$watch('homePageGridData', function (newValue, oldValue) {
        //    $scope.creator.loadHomePageGridData(newValue);
        //});

        //count unread messages
        $scope.unreadCount = function (list) {
            var unread = 0;
            angular.forEach(list, function (item) {
                item.status == 'unread' && unread++;
            });
            return unread;
        };

        $scope.chatNewCount = function () {
            var count = 0;
            angular.forEach($scope.chat.groups, function (g) {
                angular.forEach(g.friends, function (f) {
                    count += $scope.unreadCount(f.chats);
                });
            });
            return count;
        };

        $scope.appRoot = app.getAppRoot();
    }]);
    
    app.layoutCreator = function () {
        var self = this;

        self.createLayout = function () {
            var layout = self.layout = new dhtmlXLayoutObject({
                parent: 'my_layout',
                pattern: '2U',
                cells: [
                    { id: "a", text: "菜单导航", width: 160, header: true },
                    { id: "b", text: "left", header: false }
                ]
            });
            layout.attachHeader("my_header", 40);
            layout.attachFooter("my_footer", 20);

            //create navigation
            self.accordion = layout.cells("a").attachAccordion();

            //create tabs
            var tabs = self.tabs = layout.cells("b").attachTabbar({
                close_button: true,
                content_zone: true,
                arrows_mode: "auto" // mode of showing tabs arrows (auto, always)
            });

            //create context menu for tabs
            self.createTabsContextMenu(tabs);

            //add tabs right top toolbar
            self.addTabsTitleTools(tabs);

            //add home page tab
            self.tabHandles.openTab(config.home);

            //auto size layout
            self.autoSizeLayout();
        };

        self.onTreeClick = function (id) {
            var tabId = "tab_" + id;
            var current = self.tabs.cells(tabId);
            if (current != null) {
                self.tabHandles.refresh(tabId);
            }
            else {
                var node = this.getUserData(id);
                node.text = this.getItemText(id);
                node.id = tabId;
                self.tabHandles.openTab(node);
            }
            return true;
        };

        self.loadNavigationData = function (data) {
            var acc = self.accordion;
            acc.forEachItem(function (cell) {
                acc.removeItem(cell.getId());
            });

            var treeImgPath = app.getSkinImgPath("dhxtree");
            angular.forEach(data, function (item) {
                acc.addItem(item.id, item.text);
                var tree = acc.cells(item.id).attachTree();
                tree.setImagePath(treeImgPath);
                tree.loadJSONObject({ id: 0, item: item.item });
                tree.attachEvent("onClick", self.onTreeClick);
            });
        };

        self.createTabsContextMenu = function (tabs) {
            self.tabHandles = {};
            self.tabHandles.openTab = function (node) {
                //open a new tab for tabbar
                node = $.extend({
                    id: 'a',
                    text: '我的桌面',
                    icon: '',
                    title: '',
                    href: '',
                    ctrl: '',
                    width: null,
                    position: null,
                    active: true,
                    close: true
                }, node);
                node.title = node.title || ((node.icon ? "<i class='" + node.icon + "'></i> " : "") + node.text);
                self.tabs.addTab(node.id, node.title, node.width, node.position, node.active, node.close);

                //set tabid data to element
                var tab = self.tabs.cells(node.id);
                var $cell = $(tab.cell).attr('data-tabid', node.id);

                if (!node.href && !node.ctrl)
                    node.href = 'views/demo/page1.html';

                //load tab content
                if (node.href) {
                    node.href = app.getAppRoot() + node.href;
                    self.tabs.cells(node.id).attachURL(node.href);
                }
                else if (node.ctrl) {
                    var ctrl = {
                        name: node.ctrl + 'Ctrl',
                        path: 'controller/' + node.ctrl,
                        view: 'text!views/' + node.ctrl + '.html'
                    };
                    $cell.data('ctrl', ctrl).attr('ng-controller', ctrl.name);
                    self.initPartial(tab, ctrl);
                }
            };
            self.initPartial = function (tab, ctrl) {
                var init = function (render, html) {
                    html && tab.attachHTMLString(html);
                    render && $.isFunction(render) && render.call(this, args());
                    self.$compile(tab.cell)(self.$scope);
                    self.$scope.$apply(); //trigger $watch in controller new scope on init
                };
                var args = function () {
                    return {
                        tab: tab,
                        approot: app.getAppRoot(),
                        assets: app.getAssetsRoot(),
                        $element: $(tab.call)
                    };
                };
                var withnoview = function () {
                    require([ctrl.path], init);
                };
                require([ctrl.path, ctrl.view], init, withnoview);
            };
            self.destoryPartial = function (tab, ctrl) {
                tab.detachObject(true);
                tab.detachMenu();
                tab.detachRibbon();
                tab.detachStatusBar();
                tab.detachToolbar();
                $(tab.cell.childNodes[0]).empty();
                require.undef(ctrl.path);
            };
            self.tabHandles.refresh = function (tabId) {
                var tab = tabs.cells(tabId);
                var $cell = $(tab.cell);
                var ctrl = $cell.data("ctrl");

                tab.setActive();

                if (ctrl) {
                    self.destoryPartial(tab, ctrl);
                    self.initPartial(tab, ctrl);
                }
                else {
                    var win = ((tab.cell.childNodes[0] || {}).childNodes[0] || {}).contentWindow;
                    win && tab.reloadURL();
                }
            };
            self.tabHandles.close = function (tabId) {
                if (tabs.t[tabId].conf.close)
                    tabs.close_tab(this.cells(tabId));
            };
            self.tabHandles.close_all = function (tabId) {
                this.forEachCell(function (tab) {
                    if (tabs.t[tab._idd].conf.close)
                        tabs.close_tab(tab);
                });
                if (tabs.getActiveTab() == null) {
                    var defaultId = tabs._getFirstVisible()
                    defaultId && tabs.cells(defaultId).setActive(true);
                }
            };
            self.tabHandles.close_all_except_this = function (tabId) {
                this.forEachCell(function (tab) {
                    if (tabs.t[tab._idd].conf.close && tab._idd != tabId)
                        tabs.close_tab(tab);
                });
            };
            self.tabHandles.close_right = function (tabId) {
                var isRightSide = false;
                this.forEachCell(function (tab) {
                    if (isRightSide && tabs.t[tab._idd].conf.close)
                        tabs.close_tab(tab);

                    if (tab._idd == tabId)
                        isRightSide = true;
                });
            };
            self.tabHandles.close_left = function (tabId) {
                var isRightSide = false;
                this.forEachCell(function (tab) {
                    if (tab._idd == tabId)
                        isRightSide = true;

                    if (!isRightSide && tabs.t[tab._idd].conf.close)
                        tabs.close_tab(tab);
                });
            };

            var menu = new dhtmlXMenuObject({
                context: true,
                items: [
                    { id: "refresh", text: "刷新" },
                    { id: "s1", type: 'separator' },
                    { id: "close", text: "关闭" },
                    { id: "close_all", text: "全部关闭" },
                    { id: "close_all_except_this", text: "除此之外全部关闭" },
                    { id: "s2", type: 'separator' },
                    { id: "close_right", text: "关闭右侧标签" },
                    { id: "close_left", text: "关闭左侧标签" }
                ]
            });
            //右键菜单按钮处理
            menu.renderAsContextMenu();
            menu.attachEvent("onClick", function (id, zoneId, cas) {
                var tabId = zoneId.replace("tabhd_", "");
                self.tabHandles[id].call(tabs, tabId, cas);
            });

            //移除右键菜单
            tabs.attachEvent("onTabClose", function (id) {
                var hid = "tabhd_" + id;
                tabs.t[id].tab.id = hid;
                menu.removeContextZone(hid);
                return true;
            });

            tabs.close_tab = function (tab) {
                var hid = "tabhd_" + tab._idd;
                tabs.t[tab._idd].tab.id = hid;
                menu.removeContextZone(hid);
                tab.close();
            };

            //给每个面签添加右键菜单事件
            var baseAddTab = tabs.addTab;
            tabs.addTab = function (id, text, width, position, active, close) {
                baseAddTab.apply(tabs, arguments);
                var hid = "tabhd_" + id;
                tabs.t[id].tab.id = hid;
                menu.removeContextZone(hid);
                menu.addContextZone(hid);
            };
        }

        self.addTabsTitleTools = function (tabs) {
            var rightBtnHandles = self.rightBtnHandles = {};
            rightBtnHandles.refresh = function () {
                var actvId = tabs.getActiveTab();
                self.tabHandles.refresh.call(tabs, actvId);
            };
            rightBtnHandles.fullscreen = function () {
                if (self._isFullScreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }
                    else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    }
                    else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    }
                    else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    self.layout.setSizes();
                    self._isFullScreen = false;
                }
                else {
                    var docElm = document.documentElement;
                    if (docElm.requestFullscreen) {             //W3C  
                        docElm.requestFullscreen();
                    }
                    else if (docElm.mozRequestFullScreen) {     //FireFox  
                        docElm.mozRequestFullScreen();
                    }
                    else if (docElm.webkitRequestFullScreen) {  //Chrome等  
                        docElm.webkitRequestFullScreen();
                    }
                    else if (docElm.msRequestFullscreen) {        //IE11
                        docElm.msRequestFullscreen();
                    }
                    var bw = self.layout.base.offsetWidth;
                    var bh = self.layout.base.offsetHeight;
                    self.layout.cdata.b._setSize(0, 0, bw, bh, null, null, null);
                    self.layout.sep._setSize(-100, -100, 0, 0);
                    self._isFullScreen = true;
                }
                $(window).trigger('resize');
            }
            rightBtnHandles.closeall = function () {
                var actvId = tabs.getActiveTab();
                if (confirm("确定要关闭所有窗口吗"))
                    self.tabHandles.close_all.call(tabs, actvId);
            }

            var tab_btn = document.createElement("div");
            tab_btn.className = "dhxtabbar_tabs_button_area dhxtabbar_tabs";
            tab_btn.innerHTML = "<a class='dhxtabbar_tabs_button1'></a>"
                              + "<a class='dhxtabbar_tabs_button2'></a>"
                              + "<a class='dhxtabbar_tabs_button3'></a>";
            tabs.tabsArea.appendChild(tab_btn);

            setTimeout(function () { //for ie8
                var currentStyle = tab_btn.currentStyle || getComputedStyle(tab_btn, false);
                tab_btn.style.borderBottomStyle = currentStyle.borderLeftStyle;
                tab_btn.style.borderBottomWidth = currentStyle.borderLeftWidth;
                tab_btn.style.borderBottomColor = currentStyle.borderLeftColor;
                tab_btn.style.height = (tabs.tabsArea.offsetHeight - 2) + "px";
                var margintop = (tabs.tabsArea.offsetHeight - 2 - 16) / 2;
                var tabbtns = tab_btn.children;
                tabbtns[0].style.marginTop = margintop + "px";
                tabbtns[1].style.marginTop = margintop + "px";
                tabbtns[2].style.marginTop = margintop + "px";
                tabbtns[0].onclick = rightBtnHandles.refresh;
                tabbtns[1].onclick = rightBtnHandles.fullscreen;
                tabbtns[2].onclick = rightBtnHandles.closeall;
            }, 100);

            tabs._adjustTabs = function (fixTabsArea) {

                if (this._checkArrows() == true || fixTabsArea == true) {
                    this.tabsArea.childNodes[1].style.left = this.tabsArea.childNodes[0].offsetWidth - 1 + "px";
                    this.tabsArea.childNodes[1].style.width = Math.max(0, this.tabsArea.offsetWidth - this.tabsArea.childNodes[0].offsetWidth - this.tabsArea.childNodes[2].offsetWidth - this.tabsArea.childNodes[3].offsetWidth) + 1 + "px"; // minus 2 arrows
                }

                var p = this.tabsArea.childNodes[1];
                if (p.offsetWidth < 5) {
                    p = null;
                    return;
                }

                var x = parseInt(p.childNodes[0].style[this.conf.align]);

                var k = null;
                for (var q = 0; q < p.childNodes[0].childNodes.length; q++) {
                    var id = p.childNodes[0].childNodes[q]._tabId;
                    if (id != null && this.t[id].conf.visible) {
                        var w = this.t[id].tab.offsetWidth - this.conf.tabsOfs;
                        if (this.t[id].conf.active) {
                            if (x < 0 || p.offsetWidth < w) {
                                k = { d: 1, id: id }; // tab hidden on left side, move to right OR tab width less than space available
                            } else if (x + w > p.offsetWidth) {
                                k = { d: -1, id: id }; // overflow on right
                            }
                        }
                        x += w;
                    }
                }

                if (k != null) {
                    // move selected tab to visible space
                    this._moveTabs(k.d, k.id);
                } else if (p.offsetWidth > x + 1) {
                    // check space on right side
                    p.childNodes[0].style[this.conf.align] = Math.min(0, parseInt(p.childNodes[0].style[this.conf.align]) + (p.offsetWidth - x)) + "px";
                }

                p = k = null;

            }

            tabs._moveTabs = function (d, tabId) {
                // get all visible tabs
                var p = this.tabsArea.childNodes[1].childNodes[0];
                var i = 0;
                var tabs = [];
                var tabInd = null; // index of tabId
                for (var q = 0; q < p.childNodes.length; q++) {
                    var id = p.childNodes[q]._tabId;
                    if (id != null && this.t[id].conf.visible) {
                        tabs.push({ id: id, w: this.t[id].tab.offsetWidth - this.conf.tabsOfs, ind: i });
                        if (id == tabId) tabInd = i;
                        i++;
                    }
                }

                // find 1st/last full visible tabs or null
                var x = parseInt(this.tabsArea.childNodes[1].childNodes[0].style[this.conf.align]);
                var totalSpace = this.tabsArea.offsetWidth - this.tabsArea.childNodes[0].offsetWidth - this.tabsArea.childNodes[2].offsetWidth - 78;

                var f = null;
                var l = null;

                for (var q = 0; q < tabs.length; q++) {
                    tabs[q].x = x;
                    if (f == null && x >= 0 && x + tabs[q].w > 0) f = tabs[q];
                    if (x < totalSpace && x + tabs[q].w <= totalSpace) l = tabs[q];
                    x += tabs[q].w;
                }

                x += this.tabsArea.childNodes[3].offsetWidth;

                if (tabInd != null) {

                    var t = tabs[tabInd];

                } else {

                    var t = null;
                    if (d > 0) {
                        // left arrow clicked
                        // find prev tab (for 1st visible) or last (if 1st is null)
                        if (f == null) {
                            if (tabs.length > 0) t = tabs[tabs.length - 1];
                        } else {
                            if (f.ind > 0 && tabs.length >= f.ind) t = tabs[f.ind - 1];
                        }

                    } else {
                        // right arrow clicked
                        // find next tab (for last visible) or first (if last-visible is null)
                        if (l == null) {
                            if (tabs.length > 0) t = tabs[0];
                        } else {
                            if (tabs.length > l.ind) t = tabs[l.ind + 1];
                        }

                    }
                }

                // move prev/last tab to 1st position
                if (t != null) {
                    if (d > 0) {
                        if (x < totalSpace) {
                            // some tabs are on left and some space left on right
                            p.style[this.conf.align] = Math.min(0, parseInt(p.style[this.conf.align]) + (totalSpace - x)) + "px";
                        } else {
                            // show tab on left
                            p.style[this.conf.align] = parseInt(p.style[this.conf.align]) - t.x + "px";
                        }
                    } else {
                        p.style[this.conf.align] = parseInt(p.style[this.conf.align]) - t.x + totalSpace - t.w + "px";
                    }
                }

                p = t = tabs = null;

            }

            tabs._checkArrows = function () {
                var adj = false;

                if (this.conf.arwMode == "auto") {

                    var w = this.tabsArea.childNodes[3].offsetWidth;
                    for (var a in this.t) w += this.t[a].tab.offsetWidth;

                    var arLeft = this.tabsArea.childNodes[0];
                    var arRight = this.tabsArea.childNodes[2];

                    if (w > this.base.offsetWidth) {
                        // show arows
                        if (arLeft.className.search(/dhxtabbar_tabs_ar_hidden/) >= 0) {
                            arLeft.className = arLeft.className.replace(/\s{0,}dhxtabbar_tabs_ar_hidden/, "");
                            arRight.className = arRight.className.replace(/\s{0,}dhxtabbar_tabs_ar_hidden/, "");
                            adj = true;

                            this.tabsArea.childNodes[3].style.right = arRight.offsetWidth + "px";
                        }
                    } else {
                        // hide arrows
                        if (arLeft.className.search(/dhxtabbar_tabs_ar_hidden/) < 1) {
                            arLeft.className += " dhxtabbar_tabs_ar_hidden";
                            arRight.className += " dhxtabbar_tabs_ar_hidden";
                            adj = true;

                            this.tabsArea.childNodes[3].style.right = "0px";
                        }
                    }
                    arLeft = arRight = null;

                }

                return adj;
            };
        };

        self.autoSizeLayout = function () {
            window.onresize = function () {
                if (self._isFullScreen) {
                    var bw = self.layout.base.offsetWidth;
                    var bh = self.layout.base.offsetHeight;
                    self.layout.cdata.b._setSize(0, 0, bw, bh, null, null, null);
                    self.layout.sep._setSize(-100, -100, 0, 0);
                }
                else {
                    self.layout.setSizes();
                }
            }
        };

        app.getSkinImgPath = function (type) {
            var skinstr = (self.layout.conf.skin || 'dhx_skyblue').split('_')[1] || 'skyblue';
            var path = app.getAssetsRoot() + 'lib/dhtmlx/v403_pro/skins/' + skinstr + '/imgs/';
            if (type)
                path += type + '_' + skinstr + '/';
            return path;
        };

        app.getTab = function (obj) {
            if (typeof obj === 'string') {
                return self.tabs.cells(obj);
            } else {
                if (obj && obj.data('tabid'))
                    return self.tabs.cells(obj.data('tabid'));
                else
                    return null;
            }
        }
    }

    app.handleToggle = function () {
        $("[data-toggle]").click(function (e) {
            var that = this;
            $("[data-toggle]").each(function () {
                var toggleId = $(this).data('toggle');
                var $toggle = $('#' + toggleId);
                this == that ? $toggle.toggle() : $toggle.hide();
            });
            e.stopPropagation();
            e.preventDefault();
        });

        $(window).on('click', function () {
            $("[data-toggle]").each(function () {
                var toggleId = $(this).data('toggle');
                $('#' + toggleId).hide();
            });
        });
    };

    app.handleBootstrapSwitch = function (el) {
        //$('.make-switch', el).bootstrapSwitch()
    };

    app.handleSlimScroll = function () {
        $('.dropdown-slimscroll').slimScroll({
            "width": '100%',
            "height": '250px',
            "wheelStep": 25
        });
    };

    app.handlePulsate = function () {
        $("[data-pulsate]").each(function () {
            var me = $(this);
            var data = eval("(" + $(this).attr('data-pulsate') + ")");
            if (data.onClick == "one" || data.onClick == "crazy") {
                me.click(function () {
                    me.pulsate(data);
                });
            }
            if (data.onClick == "toggle") {
                me.toggle(function () {
                    me.pulsate(data.repeat = false);
                }, function () {
                    me.pulsate(data);
                });
            }
            if (data.onClick == "stop") {
                me.pulsate(data);
                if (data.parent == true) {
                    me.parent().one('click', function () {
                        me.pulsate({ repeat: false });
                    });
                }
                else {
                    me.one('click', function () {
                        me.pulsate({ repeat: false });
                    });
                }
            }
            if (data.onClick == undefined)
                me.pulsate(data);
        });
    };

    app.handleFormChatOpen = function (e, f) {
        var target = e.currentTarget;
        $('#chat-box').hide();
        $('#chat-form .chat-group a').removeClass('active');
        $(target).addClass('active');
        //get user information to set for chat box
        ///var strUserName = $('> small', target).text();
        $('.display-name', '#chat-box').html(f.name);
        //var userStatus = $(target).find('span.user-status').attr('class');
        $('#chat-box > .chat-box-header > span.user-status').removeClass().addClass(f.status);
        //var userAvatar = $(target).find('img').attr('src');
        $('.chat-box-minimize').find('img').attr('src', f.avatar);

        var chatBoxStatus = $('span.user-status', '#chat-box');
        var chatBoxStatusShow = $('#chat-box > .chat-box-header > small');
        chatBoxStatusShow.html(f.status);
        //if (chatBoxStatus.hasClass('is-online')) {
        //    chatBoxStatusShow.html('Online');
        //} else if (chatBoxStatus.hasClass('is-offline')) {
        //    chatBoxStatusShow.html('Offline');
        //} else if (chatBoxStatus.hasClass('is-busy')) {
        //    chatBoxStatusShow.html('Busy');
        //} else if (chatBoxStatus.hasClass('is-idle')) {
        //    chatBoxStatusShow.html('Idle');
        //}

        $('#chat-box').css({ 'top': 'auto' });

        if (!$('#chat-box').is(':visible')) {
            $('#chat-box').toggle();
            $('.chat-box-minimize').toggle();
        }
        // focus to input tag when click an user
        $("#chat-box .chat-textarea input").focus();
        $('.chat-content > .chat-box-body').slimScroll({
            "height": "250px",
            'width': '340px',
            "wheelStep": 30,
            "scrollTo": $(target).height()
        });
    };

    app.handleFormChat = function ($scope) {
        //Open chat form
        $('.btn-chat').click(function () {
            if ($('#chat-box').is(':visible')) {
                $('#chat-form').toggle('slide', {
                    direction: 'right'
                }, 200);
                $('#chat-form').slimScroll();
                $('#chat-box').hide();
            } else {
                $('#chat-form').toggle('slide', {
                    direction: 'right'
                }, 200);
                $('#chat-form > .chat-inner').slimScroll({
                    "height": $(window).height(),
                    'width': '280px',
                    "wheelStep": 30
                });
            }
            $('.chat-box-wrapper').css({ 'right': '280px' });
        });

        //Close event
        $('.chat-box-close').click(function () {
            $('#chat-box').hide();
            $('.chat-box-minimize').hide();
            $('#chat-form .chat-group a').removeClass('active');
        });
        $('.chat-form-close').click(function () {
            $('#chat-form').toggle('slide', {
                direction: 'right'
            }, 200);
            $('#chat-box').hide();
            $('.chat-box-wrapper').css({ 'right': '0px' });
        });

        $('.chat-box-minimize-btn').click(function () {
            $('#chat-box').hide();
            $('.chat-box-minimize').show();
        });

        $('.chat-box-minimize img').click(function () {
            $('#chat-box').show();
        });

        //Open chat box
        $('#chat-form .chat-group a').unbind('*').click(function () {
            $('#chat-box').hide();
            $('#chat-form .chat-group a').removeClass('active');
            $(this).addClass('active');
            //get user information to set for chat box
            var strUserName = $('> small', this).text();
            $('.display-name', '#chat-box').html(strUserName);
            var userStatus = $(this).find('span.user-status').attr('class');
            $('#chat-box > .chat-box-header > span.user-status').removeClass().addClass(userStatus);
            var userAvatar = $(this).find('img').attr('src');
            $('.chat-box-minimize').find('img').attr('src', userAvatar);
            var chatBoxStatus = $('span.user-status', '#chat-box');
            var chatBoxStatusShow = $('#chat-box > .chat-box-header > small');
            if (chatBoxStatus.hasClass('is-online')) {
                chatBoxStatusShow.html('Online');
            } else if (chatBoxStatus.hasClass('is-offline')) {
                chatBoxStatusShow.html('Offline');
            } else if (chatBoxStatus.hasClass('is-busy')) {
                chatBoxStatusShow.html('Busy');
            } else if (chatBoxStatus.hasClass('is-idle')) {
                chatBoxStatusShow.html('Idle');
            }

            $('#chat-box').css({ 'top': 'auto' });

            if (!$('#chat-box').is(':visible')) {
                $('#chat-box').toggle();
                $('.chat-box-minimize').toggle();
            }
            // focus to input tag when click an user
            $("#chat-box .chat-textarea input").focus();
            $('.chat-content > .chat-box-body').slimScroll({
                "height": "250px",
                'width': '340px',
                "wheelStep": 30,
                "scrollTo": $(this).height()
            });
        });
        // Add content to form
        $('.chat-textarea input').on("keypress", function (e) {
            var $obj = $(this);
            var $me = $obj.parent().parent().find('ul.chat-box-body');
            var $my_avt = app.getAppRoot() + 'img/avatar/men-27.jpg';
            var $your_avt = app.getAppRoot() + 'img/avatar/claudioguglieri-48.jpg';
            if (e.which == 13) {
                var $content = $obj.val();

                if ($content !== "") {
                    var d = new Date();
                    var h = d.getHours();
                    var m = d.getMinutes();
                    if (m < 10) m = "0" + m;
                    $obj.val(""); // CLEAR TEXT IN INPUT

                    //var msg = {};
                    //msg.message = $content;
                    //msg.status = '';
                    //msg.from = 'You';
                    //msg.time = h + ":" + m;
                    //msg.avatar = $scope.chat.mine.avatar;
                    //$scope.chat.current.chats.push(msg);
                    //return;

                    var $element = "";
                    $element += "<li>";
                    $element += "<p>";
                    $element += "<img class='avt' src='" + $my_avt + "'>";
                    $element += "<span class='user'>You</span>";
                    $element += "<span class='time'>" + h + ":" + m + "</span>";
                    $element += "</p>";
                    $element = $element + "<p>" + $content + "</p>";
                    $element += "</li>";

                    $me.append($element);
                    var height = 0;
                    $me.find('li').each(function (i, value) {
                        height += parseInt($(this).height());
                    });

                    height += '';
                    $me.scrollTop(height);

                    // RANDOM RESPOND CHAT
                    var $res = "";
                    $res += "<li class='odd'>";
                    $res += "<p>";
                    $res += "<img class='avt' src='" + $your_avt + "'>";
                    $res += "<span class='user'>Jake Rochleau</span>";
                    $res += "<span class='time'>" + h + ":" + m + "</span>";
                    $res += "</p>";
                    $res = $res + "<p>" + "This is a demo respond anwser" + "</p>";
                    $res += "</li>";
                    setTimeout(function () {
                        $me.append($res);
                        $me.scrollTop(height + 100);
                    }, 1000);
                }
            }
        });

        $('#setting-theme-chat').on('switch-change', function () {
            $('.chat-form-wrapper').toggleClass('light');
        });
    }

    app.handleTemplateSetting = function () {
        $('a.btn-template-setting').click(function () {
            if ($('#template-setting').css('right') < '0') {
                $('#template-setting').css('right', '0');
            } else {
                $('#template-setting').css('right', '-255px');
            }
        });

        $('ul.sidebar-color > li').click(function () {
            var color = $(this).attr('data-style');
            $('ul.sidebar-color > li').removeClass('active');
            $(this).addClass('active');
            switch (color) {
                case 'default':
                    $('body').removeClass(function (index, css) {
                        return (css.match(/(^|\s)sidebar-color-\S+/g) || []).join(' ');
                    });
                    break;
                case 'orange':
                    $('body').removeClass(function (index, css) {
                        return (css.match(/(^|\s)sidebar-color-\S+/g) || []).join(' ');
                    }).addClass('sidebar-color-orange');
                    break;
                case 'green':
                    $('body').removeClass(function (index, css) {
                        return (css.match(/(^|\s)sidebar-color-\S+/g) || []).join(' ');
                    }).addClass('sidebar-color-green');
                    break;
                case 'white':
                    $('body').removeClass(function (index, css) {
                        return (css.match(/(^|\s)sidebar-color-\S+/g) || []).join(' ');
                    }).addClass('sidebar-color-white');
                    break;
                case 'blue':
                    $('body').removeClass(function (index, css) {
                        return (css.match(/(^|\s)sidebar-color-\S+/g) || []).join(' ');
                    }).addClass('sidebar-color-blue');
                    break;
                case 'grey':
                    $('body').removeClass(function (index, css) {
                        return (css.match(/(^|\s)sidebar-color-\S+/g) || []).join(' ');
                    }).addClass('sidebar-color-grey');
                    break;
            }
        });

        $('#setting-sidebar-collapsed').on('switch-change', function () {
            $('body').toggleClass('layout-sidebar-collapsed');
            if ($('body').hasClass('layout-sidebar-fixed')) {
                alert('Please go on "Layout sidebar fixed & collapsed" menu');
            }
        });

        $('#setting-sidebar-fixed').on('switch-change', function () {
            if ($('body').hasClass('layout-sidebar-collapsed')) {
                alert('Please go on "Layout sidebar fixed & collapsed" menu to use this option');
                //return false;
            } else if ($('.fluid').hasClass('container')) {
                alert('Unfortunately, you have to edit litte to use this option');
            } else {
                $('body').toggleClass('layout-sidebar-fixed');
                if ($("#sidebar-main").parent().hasClass('slimScrollDiv') || $('body').hasClass('layout-sidebar-collapsed')) {
                    destroySlimscroll('sidebar-main');
                } else {
                    handleSidebarFixed();
                }
            }
        });

        $('#setting-sidebar-hide').on('switch-change', function () {
            $('body').toggleClass('layout-sidebar-hide');
        });


        $('#setting-header-fixed').on('switch-change', function () {
            $('body').toggleClass('layout-header-fixed');
        });

        $('#setting-header-dark').on('switch-change', function () {
            $('body').toggleClass('layout-header-dark');
        });

        $('#setting-horizontal-menu').on('switch-change', function () {
            $('body').toggleClass('layout-full-width');
            $('.logo-wrapper').removeClass('in-sidebar');
        });

        $('#setting-layout-boxed').on('switch-change', function () {
            if ($('body').hasClass('layout-sidebar-fixed')) {
                alert('Unfortunately, you have to edit litte to use this option');
            } else {
                $('.fluid').toggleClass('container');
            }
        });

        $('#setting-logo-status').on('switch-change', function () {
            $('#topbar .logo-wrapper').toggleClass('in-sidebar');
        });

        $('#setting-toggle-status').on('switch-change', function () {
            $('#menu-toggle').toggleClass('show-collapsed');
            $('#menu-toggle').toggleClass('show-hide');
        });

        $("select#font-select")
            .change(function () {
                var value;
                var $font_link = $('#font-layout');
                $("select#font-select option:selected").each(function () {
                    value = $(this).val();
                });

                switch (value) {
                    case 'open-sans':
                        handleRemoveClassFont();
                        break;
                    case 'roboto':
                        handleRemoveClassFont();
                        $font_link.attr('href', 'http://fonts.googleapis.com/css?family=Roboto');
                        $('body').addClass('font-roboto');
                        break;
                    case 'lato':
                        handleRemoveClassFont();
                        $font_link.attr('href', 'http://fonts.googleapis.com/css?family=Lato');
                        $('body').addClass('font-lato');
                        break;
                    case 'source-sans-pro':
                        handleRemoveClassFont();
                        $font_link.attr('href', 'http://fonts.googleapis.com/css?family=Source+Sans+Pro');
                        $('body').addClass('font-source-sans-pro');
                        break;
                    case 'helvetica':
                        handleRemoveClassFont();
                        $('body').addClass('font-helvetica');
                        break;
                    case 'lora':
                        handleRemoveClassFont();
                        $font_link.attr('href', 'http://fonts.googleapis.com/css?family=Lora');
                        $('body').addClass('font-lora');
                        break;

                }
            });

        //set cookie when click save
        $('#save-setting').on('click', function () {
            var cookie_sidebar_color = $('.sidebar-color li.active').attr('data-style');
            var cookie_font = $('select#font-select').val();
            var cookie_array = [];
            if ($('#setting-header-fixed > div').hasClass('switch-on')) {
                cookie_array.push('layout-header-fixed');
            }
            if ($('#setting-sidebar-collapsed > div').hasClass('switch-on')) {
                cookie_array.push('layout-sidebar-collapsed');
            }
            if ($('#setting-sidebar-hide > div').hasClass('switch-on')) {
                cookie_array.push('layout-sidebar-hide');
            }
            if ($('#setting-sidebar-fixed > div').hasClass('switch-on')) {
                cookie_array.push('layout-sidebar-fixed');
            }
            if ($('#setting-toggle-status > div').hasClass('switch-on')) {
                cookie_array.push('layout-toggle-status');
            }
            if ($('#setting-header-dark > div').hasClass('switch-on')) {
                cookie_array.push('layout-header-dark');
            }
            if ($('#setting-logo-status > div').hasClass('switch-on')) {
                cookie_array.push('layout-logo-status');
            }
            if ($('#setting-horizontal-menu > div').hasClass('switch-on')) {
                cookie_array.push('layout-full-width');
            }
            if ($('#setting-footer-light > div').hasClass('switch-on')) {
                cookie_array.push('layout-footer-light');
            }

            $.cookie('sidebar-color', cookie_sidebar_color);
            $.cookie('font-layout', cookie_font);
            $.cookie('setting', cookie_array.join(' '));
        });
        //load cookie on document ready
        if ($.cookie('setting')) {
            var cookie_load_array = $.cookie('setting').split(' ');
            if ($.inArray('layout-header-fixed', cookie_load_array) !== -1) {
                $('#setting-header-fixed').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-sidebar-collapsed', cookie_load_array) !== -1) {
                $('#setting-sidebar-collapsed').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-sidebar-fixed', cookie_load_array) !== -1) {
                $('#setting-sidebar-fixed').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-sidebar-hide', cookie_load_array) !== -1) {
                $('#setting-sidebar-hide').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-header-dark', cookie_load_array) !== -1) {
                $('#setting-header-dark').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-toggle-status', cookie_load_array) !== -1) {
                $('#setting-toggle-status').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-logo-status', cookie_load_array) !== -1) {
                $('#setting-logo-status').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-full-width', cookie_load_array) !== -1) {
                $('#setting-horizontal-menu').bootstrapSwitch('toggleState');
            }
            if ($.inArray('layout-footer-light', cookie_load_array) !== -1) {
                $('#setting-footer-light').bootstrapSwitch('toggleState');
            }
        }

        if ($.cookie('sidebar-color')) {
            $('body').addClass('sidebar-color-' + $.cookie('sidebar-color'));
            $('.sidebar-color li').removeClass('active');
            $('.sidebar-color li.' + $.cookie('sidebar-color')).addClass('active');
        }

        if ($.cookie('font-layout')) {
            $('select#font-select').val($.cookie('font-layout'));
            setFont($.cookie('font-layout'));
        }

        function setFont(value) {
            var $font_layout = $('#font-layout');
            switch (value) {
                case 'open-sans':
                    handleRemoveClassFont();
                    break;
                case 'roboto':
                    handleRemoveClassFont();
                    $font_layout.attr('href', 'http://fonts.googleapis.com/css?family=Roboto');
                    $('body').addClass('font-roboto');
                    break;
                case 'lato':
                    handleRemoveClassFont();
                    $font_layout.attr('href', 'http://fonts.googleapis.com/css?family=Lato');
                    $('body').addClass('font-lato');
                    break;
                case 'source-sans-pro':
                    handleRemoveClassFont();
                    $font_layout.attr('href', 'http://fonts.googleapis.com/css?family=Source+Sans+Pro');
                    $('body').addClass('font-source-sans-pro');
                    break;
                case 'helvetica':
                    handleRemoveClassFont();
                    $('body').addClass('font-helvetica');
                    break;
                case 'lora':
                    handleRemoveClassFont();
                    $font_layout.attr('href', 'http://fonts.googleapis.com/css?family=Lora');
                    $('body').addClass('font-lora');
                    break;
            }
        }
    }

    app.getApiUrl = function (url) {
        return config.webapi.replace(/(\s*$)/g, "") + "/" + (url || '').replace(/(^\s*)/g, "");
    };

    app.getProjectRoot = function (prj) {
        return prj;
    };

    app.getAppRoot = function () {
        return app.getProjectRoot('app/');
    };

    app.getAssetsRoot = function (res) {
        var assets = app.getProjectRoot('assets/');
        return assets + (res || '').replace(/(^\/*)/g, "");
    };

    app.getSkinImgPath = function (type) {
        var skinstr = (app.layoutCreator.layout.conf.skin || 'dhx_skyblue').split('_')[1] || 'skyblue';
        var path = app.getAssetsRoot() + 'lib/dhtmlx/v403_pro/skins/' + skinstr + '/imgs/';
        if (type)
            path += type + '_' + skinstr + '/';

        return path;
    };

    app.genStr = function (w) {
        var s = ""; var z = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var q = 0; q < w; q++) s += z.charAt(Math.round(Math.random() * (z.length - 1)));
        return s;
    };
});