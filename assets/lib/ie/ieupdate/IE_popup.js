
window.onload = function() {
	var elmnt = document.createElement('div');
	elmnt.className += 'blackout';
	elmnt.innerHTML = '<div id="ie_popup"> \
						<h1>您正在使用Internet Explorer版本太低</h1> \
						<p> \
							建议您升级到 Internet Explorer 8+ 或以下其它浏览器： \
						</p> \
						<ul class="browsers_list big"> \
							<li> \
								<a href="http://www.baidu.com/s?wd=google%E6%B5%8F%E8%A7%88%E5%99%A8" target="_blank" class="download_link chrome"><span class="caption">Chrome</span></a> \
							</li> \
							<li> \
								<a href="http://www.mozilla.org/" target="_blank" class="download_link firefox"><span class="caption">Firefox</span></a> \
							</li> \
							<li> \
								<a href="http://windows.microsoft.com/ie" target="_blank" class="download_link ie"><span class="caption">IE 8+</span></a> \
							</li> \
						</ul> \
					</div> ';
	document.body.appendChild(elmnt);
};

