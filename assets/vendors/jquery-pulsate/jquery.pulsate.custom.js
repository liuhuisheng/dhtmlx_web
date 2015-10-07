(function ($) {
    var methods = {
        init: function (options) {
            var settings = {
                color: $(this).css("background-color"),
                reach: 20,
                speed: 1000,
                pause: 0,
                glow: true,
                repeat: true,
                onHover: false,
                border: true
            };
            if (settings.border == false) {
                settings.color = rgba(0, 0, 0, 0);
            }
            $(this).css({
                "-moz-outline-radius": $(this).css("border-top-left-radius"),
                "-webkit-outline-radius": $(this).css("border-top-left-radius"),
                "outline-radius": $(this).css("border-top-left-radius")
            });

            if (options) {
                $.extend(settings, options);
            }
            settings.color = $("<div style='background:" + settings.color + "'></div>").css("background-color");
            if (settings.repeat !== true && !isNaN(settings.repeat) && settings.repeat > 0) {
                settings.repeat -= 1;
            }

            return this.each(function () {
                if (settings.onHover) {
                    $(this).bind("mouseover", function () {
                        pulse(settings, this, 0);
                    })
                        .bind("mouseout", function () {
                            $(this).pulsate("destroy");
                        });
                } else {
                    pulse(settings, this, 0);
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                clearTimeout(this.timer);
                $(this).css("outline", 0);
            });
        }
    };

    var colorRgb = function () {
        var sColor = this.toLowerCase();
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值  
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return "RGB(" + sColorChange.join(",") + ")";
        } else {
            return sColor;
        }
    };

    var pulse = function (options, el, count) {
        //add by liuhuisheng start for ie8
        if (options.color && options.color.indexOf('#') > -1)
            options.color = colorRgb.call(options.color);
        //add by liuhuisheng end
        var reach = options.reach,
            count = count > reach ? 0 : count,
            opacity = (reach - count) / reach,
            colorarr = options.color.split(","),
            color = "rgba(" + colorarr[0].split("(")[1] + "," + colorarr[1] + "," + colorarr[2].split(")")[0] + "," + opacity + ")",
            cssObj = {
                "outline": "2px solid " + color
            };
        if (options.border == false) {
            cssObj.outline = "2px solid rgba(0, 0, 0, 0)";
        }
        if (options.glow) {
            cssObj["box-shadow"] = "0px 0px " + parseInt((count / 1.5)) + "px " + color;
            if (options.border == false) {
                cssObj["box-shadow"] = "0px 0px " + parseInt((count * 2)) + "px " + color;
            }
            //modify by liuhuisheng start for ie8
            //userAgent = navigator.userAgent || '';
            userAgent = (navigator || {}).userAgent || '';
            //modify by liuhuisheng end
            if (/(chrome)[ \/]([\w.]+)/.test(userAgent.toLowerCase())) {
                cssObj["outline-offset"] = count + "px";
                cssObj["outline-radius"] = "100 px";
            }
        } else {
            cssObj["outline-offset"] = count + "px";
        }
        $(el).css(cssObj);

        var innerfunc = function () {
            if (count >= reach && !options.repeat) {
                $(el).pulsate("destroy");
                return false;
            } else if (count >= reach && options.repeat !== true && !isNaN(options.repeat) && options.repeat > 0) {
                options.repeat = options.repeat - 1;
            } else if (options.pause && count >= reach) {
                pause(options, el, count + 1);
                return false;
            }
            pulse(options, el, count + 1);
        };

        if (el.timer) {
            clearTimeout(el.timer);
        }
        el.timer = setTimeout(innerfunc, options.speed / reach);
    };

    var pause = function (options, el, count) {
        innerfunc = function () {
            pulse(options, el, count);
        };
        el.timer = setTimeout(innerfunc, options.pause);
    };

    $.fn.pulsate = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pulsate');
        }

    };
})(jQuery);

