
!function () {
    //放在[if lte IE 8]下，所以不为ie8则版本低于ie8，不再支持
    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0")
        return;
    
    var style = document.createElement('link');
    style.href = '/assets/lib/ie/ieupdate/ie_popup.css';
    style.rel = 'stylesheet';
    style.type = 'text/css';
    document.getElementsByTagName('head').item(0).appendChild(style);

    var elmnt = document.createElement('div');
    elmnt.className += 'blackout';
    var arr = ['<div id="ie_popup">'];
    arr.push('<h1>您正在使用Internet Explorer版本太低</h1>');
    arr.push('<p>建议您升级到 Internet Explorer 8+ 或以下其它浏览器：</p>');
    arr.push('<ul class="browsers_list big">');
    arr.push('<li><a href="http://www.baidu.com/s?wd=google%E6%B5%8F%E8%A7%88%E5%99%A8" target="_blank" class="download_link chrome"><span class="caption">Chrome</span></a></li>');
    arr.push('<li><a href="http://www.mozilla.org/" target="_blank" class="download_link firefox"><span class="caption">Firefox</span></a></li>');
    arr.push('<li><a href="http://windows.microsoft.com/ie" target="_blank" class="download_link ie"><span class="caption">IE 8+</span></a></li>');
    arr.push('</ul>');
    arr.push('</div>');
    elmnt.innerHTML = arr.join("");

    window.onload = function () {
        document.body.appendChild(elmnt);
    };
 
    window.onerror = function () {
        console.log('error:您正在使用Internet Explorer版本太低,需要IE8+');
        return true;
    };
}();

