/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

function dhtmlXCellObject(idd, css) {
	
	this.cell = document.createElement("DIV");
	this.cell.className = "dhx_cell"+(css||"");
	
	this._idd = idd;
	this._isCell = true;
	
	this.conf = {
		borders: true,
		idx: {},
		css: css||"",
		idx_data: {
			cont: "dhx_cell_cont",
			pr1: "dhx_cell_progress_bar",
			pr2: "dhx_cell_progress_img",
			menu: "dhx_cell_menu",
			toolbar: "dhx_cell_toolbar",
			ribbon: "dhx_cell_ribbon",
			sb: "dhx_cell_statusbar"
		},
		ofs_nodes: { t:{}, b:{} }	// attached dataNodes (menu/toolbar/status), can be true, false;
						// in case of layout - "func" for header
	}
	
	this.dataNodes = {}; // menu/toolbar/status
	
	this.views = {};
	
	// cont
	var p = document.createElement("DIV");
	p.className = "dhx_cell_cont"+this.conf.css;
	this.cell.appendChild(p);
	p = null;
	
	this._updateIdx = function() {
		for (var a in this.conf.idx) {
			this.conf.idx[a] = null;
			delete this.conf.idx[a];
		}
		for (var q=0; q<this.cell.childNodes.length; q++) {
			var css = this.cell.childNodes[q].className;
			for (var a in this.conf.idx_data) {
				var r = new RegExp(this.conf.idx_data[a]);
				if (css.match(r) != null) this.conf.idx[a] = q;
			}
		}
		
		this.callEvent("_onIdxUpdated",[]);
	}
	
	this._adjustAttached = function() {
		// mtb/ribbon
		for (var a in this.dataNodes) {
			if (this.dataNodes[a] != null && typeof(this.dataNodes[a].setSizes) == "function") {
				this.dataNodes[a].setSizes();
			}
		}
		// attached node
		if (this.dataObj != null && typeof(this.dataObj.setSizes) == "function") {
			this.dataObj.setSizes.apply(this.dataObj, arguments);
		}
	}
	
	this._setSize = function(x, y, w, h, parentIdd, noCalcCont, actionType) {
		
		if (!this.conf.size) this.conf.size = {};
		
		this.conf.size.x = x;
		this.conf.size.y = y;
		this.conf.size.w = w;
		this.conf.size.h = h;
		
		this.cell.style.left = x+"px";
		this.cell.style.top = y+"px";
		this.cell.style.width = w+"px";
		this.cell.style.height = h+"px";
		
		this.callEvent("_onSetSize",[]);
		
		if (noCalcCont !== true) {
			this._adjustCont(parentIdd, actionType);
		} else {
			this._adjustAttached(parentIdd);
		}
		
		this._adjustProgress();
	}
	
	this._adjustCont = function(parentIdd, actionType) {
		
		var t = this.cell.childNodes[this.conf.idx.cont];
		
		// header height, menu, toolbar if any
		var ht = 0;
		for (var a in this.conf.ofs_nodes.t) {
			var k = this.conf.ofs_nodes.t[a];
			ht += (k=="func"?this[a]():(k==true?this.cell.childNodes[this.conf.idx[a]].offsetHeight:0));
		}
		
		// bottom offset (height reduce if status attached)
		var hb = 0;
		for (var a in this.conf.ofs_nodes.b) {
			var k = this.conf.ofs_nodes.b[a];
			hb += (k=="func"?this[a]():(k==true?this.cell.childNodes[this.conf.idx[a]].offsetHeight:0));
		}
		
		t.style.left = "0px";
		t.style.top = ht+"px";
		
		if (!this.conf.cells_cont) {
			this.conf.cells_cont = {};
			t.style.width = this.cell.offsetWidth+"px";
			t.style.height = Math.max(this.cell.offsetHeight-ht-hb,0)+"px";
			this.conf.cells_cont.w = parseInt(t.style.width)-t.offsetWidth;
			this.conf.cells_cont.h = parseInt(t.style.height)-t.offsetHeight;
		}
		
		t.style.left = "0px";
		t.style.top = ht+"px";
		t.style.width = Math.max(this.cell.offsetWidth+this.conf.cells_cont.w,0)+"px";
		t.style.height = Math.max(this.conf.size.h-ht-hb+this.conf.cells_cont.h,0)+"px";
		t = null;
		
		// move out?
		this._adjustAttached(parentIdd); // for layout only 1 arg should be here
		
		// editor adjust cont here, browser check needed ( !!make some tests :)
		if (actionType == "expand" && this.dataType == "editor" && this.dataObj != null) {
			this.dataObj._prepareContent(true);
		}
	}
	
	this._mtbUpdBorder = function() {
		
		var t = ["menu","toolbar"];
		for (var q=0; q<t.length; q++) {
			if (this.conf.idx[t[q]] != null) {
				var p = this.cell.childNodes[this.conf.idx[t[q]]];
				var c1 = "dhx_cell_"+t[q]+"_no_borders";
				var c2 = "dhx_cell_"+t[q]+"_def";
				p.className = p.className.replace(new RegExp(this.conf.borders?c1:c2), this.conf.borders?c2:c1);
				p = null;
			}
		}
	}
	
	this._resetSizeState = function() {
		// delete autosize settings, autocalc for cell_cont borders, paddings, useful on skinchange
		this.conf.cells_cont = null;
	}
	
	/* views */
	
	// test with url and getFrame()
	
	// current view
	this.conf.view = "def";
	
	// views loaded at least once
	this.conf.views_loaded = {};
	this.conf.views_loaded[this.conf.view] = true;
	
	// move current data to archive
	this._viewSave = function(name) {
		
		this.views[name] = {
			borders: this.conf.borders,
			ofs_nodes: {t:{},b:{}},
			dataType: this.dataType,
			dataObj: this.dataObj,
			cellCont: [],
			dataNodes: {},
			dataNodesCont: {}
		};
		
		// attached cont
		var cellCont = this.cell.childNodes[this.conf.idx.cont];
		while (cellCont.childNodes.length > 0) {
			this.views[name].cellCont.push(cellCont.firstChild);
			cellCont.removeChild(cellCont.firstChild);
		}
		
		this.dataType = null;
		this.dataObj = null;
		
		// menu/toolbar/status
		for (var a in this.dataNodes) {
			
			for (var b in this.conf.ofs_nodes) {
				if (typeof(this.conf.ofs_nodes[b][a]) != "undefined") {
					this.views[name].ofs_nodes[b][a] = this.conf.ofs_nodes[b][a];
					this.conf.ofs_nodes[b][a] = null;
					delete this.conf.ofs_nodes[b][a];
				}
			}
			
			this.views[name].dataNodesCont[a] = this.cell.childNodes[this.conf.idx[a]];
			this.cell.removeChild(this.cell.childNodes[this.conf.idx[a]]);
			
			this.views[name].dataNodes[a] = this.dataNodes[a];
			this.dataNodes[a] = null;
			delete this.dataNodes[a];
			
			this._updateIdx();
		}
		
		this.callEvent("_onViewSave", [name]);
		
	}
	
	this._viewRestore = function(name) {
		
		if (this.views[name] == null) return;
		
		// content
		this.dataObj = this.views[name].dataObj;
		this.dataType = this.views[name].dataType;
		for (var q=0; q<this.views[name].cellCont.length; q++) this.cell.childNodes[this.conf.idx.cont].appendChild(this.views[name].cellCont[q]);
		
		// data nodes (menu/toolbar/status)
		for (var a in this.views[name].dataNodes) {
			
			this.dataNodes[a] = this.views[name].dataNodes[a];
			// below is not very universal solution for extending
			if (a == "menu") this.cell.insertBefore(this.views[name].dataNodesCont[a], this.cell.childNodes[this.conf.idx.toolbar||this.conf.idx.cont]);
			if (a == "toolbar") this.cell.insertBefore(this.views[name].dataNodesCont[a], this.cell.childNodes[this.conf.idx.cont]);
			if (a == "sb") this.cell.appendChild(this.views[name].dataNodesCont[a]);
			
			this._updateIdx();
		}
		
		// ofs_nodes
		for (var a in this.views[name].ofs_nodes) {
			for (var b in this.views[name].ofs_nodes[a]) this.conf.ofs_nodes[a][b] = this.views[name].ofs_nodes[a][b];
		}
		
		if (this.conf.borders != this.views[name].borders) {
			this[this.views[name].borders?"_showBorders":"_hideBorders"](true);
		}
		
		this.callEvent("_onViewRestore", [name]);
		
		this._viewDelete(name);
		
	}
	
	this._viewDelete = function(name) {
		
		if (this.views[name] == null) return;
		
		this.views[name].borders = null;
		
		for (var a in this.views[name].ofs_nodes) {
			for (var b in this.views[name].ofs_nodes[a]) this.views[name].ofs_nodes[a][b] = null;
			this.views[name].ofs_nodes[a] = null;
		}
		
		this.views[name].dataType = null;
		this.views[name].dataObj = null;
		
		for (var q=0; q<this.views[name].cellCont.length; q++) this.views[name].cellCont[q] = null;
		this.views[name].cellCont = null;
		
		for (var a in this.views[name].dataNodes) {
			this.views[name].dataNodes[a] = null;
			this.views[name].dataNodesCont[a] = null;
		}
		
		this.views[name].dataNodes = this.views[name].dataNodesCont = null;
		
		this.views[name] = null;
		delete this.views[name];
		
	}
	
	/* views end */
	
	window.dhx4._eventable(this);
	this._updateIdx();
	
	return this;
	
};

// views
dhtmlXCellObject.prototype.showView = function(name) {
	
	if (this.conf.view == name) return false; // alredy visible
	
	// save current view
	this._viewSave(this.conf.view);
	
	// restore requested view if exists
	this._viewRestore(name);
	
	// update cell rendering
	this._updateIdx();
	this._adjustCont();
	
	this.conf.view = name;
	
	var t = (typeof(this.conf.views_loaded[this.conf.view]) == "undefined");
	this.conf.views_loaded[this.conf.view] = true;
	
	return t;
	
};

dhtmlXCellObject.prototype.getViewName = function() {
	return this.conf.view;
};

dhtmlXCellObject.prototype.unloadView = function(name) {
	// hidden view, unload menu/toolbar/status, etc
	
	// unload actve view
	if (name == this.conf.view) {
		
		// set unloading flag to prevent some adjust operations
		var t = this.conf.unloading;
		this.conf.unloading = true;
		
		// remove content
		this.detachMenu();
		this.detachToolbar();
		this.detachStatusBar();
		this.detachRibbon();
		this._detachObject(null, true);
		
		// restore unloading flag
		this.conf.unloading = t;
		if (!this.conf.unloading) this._adjustCont(this._idd);
		
		return;
	}
	
	if (this.views[name] == null) return;
	
	var v = this.views[name];
	for (var a in v.dataNodes) {
		if (typeof(v.dataNodes[a].unload) == "function") v.dataNodes[a].unload();
		v.dataNodes[a] = null;
		v.dataNodesCont[a] = null;
	}
	if (v.dataType == "url") {
		if (v.cellCont != null && v.cellCont[0] != "null") {
			this._detachURLEvents(v.cellCont[0]);
		}
	} else if (v.dataObj != null) {
		if (typeof(v.dataObj.unload) == "function") {
			v.dataObj.unload();
		} else if (typeof(v.dataObj.destructor) == "function") {
			v.dataObj.destructor();
		}
		v.dataObj = null;
	}
	v = null;
	
	this._viewDelete(name);
	
	if (typeof(this.conf.views_loaded[name]) != "undefined") {
		delete this.conf.views_loaded[name];
	}
	
};


// id
dhtmlXCellObject.prototype.getId = function() {
	return this._idd;
};

// progress
dhtmlXCellObject.prototype.progressOn = function() {
	
	if (this.conf.progress) return;
	
	this.conf.progress = true;
	
	var t1 = document.createElement("DIV");
	t1.className = "dhx_cell_progress_bar";
	this.cell.appendChild(t1);
	
	var t2 = document.createElement("DIV");
	t2.className = "dhx_cell_progress_img";
	this.cell.appendChild(t2);
	
	t1 = t2 = null;
	
	this._updateIdx();
	this._adjustProgress();
	
};

dhtmlXCellObject.prototype.progressOff = function() {
	
	if (!this.conf.progress) return;
	
	this.cell.childNodes[this.conf.idx.pr2].parentNode.removeChild(this.cell.childNodes[this.conf.idx.pr2]);
	this.cell.childNodes[this.conf.idx.pr1].parentNode.removeChild(this.cell.childNodes[this.conf.idx.pr1]);
	
	this.conf.progress = false;
	
	this._updateIdx();
};

dhtmlXCellObject.prototype._adjustProgress = function() {
	
	if (this.conf.idx.pr1 == null) return;
	
	if (!this.conf.pr) this.conf.pr = {};
	
	var p1 = this.cell.childNodes[this.conf.idx.pr1]; // half-transparent cover
	var p2 = this.cell.childNodes[this.conf.idx.pr2]; // image
	
	if (!this.conf.pr.ofs) {
		p2.style.width = p1.offsetWidth + "px";
		p2.style.height = p1.offsetHeight + "px";
		this.conf.pr.ofs = {
			w: p2.offsetWidth-p2.clientWidth,
			h: p2.offsetHeight-p2.clientHeight
		};
	}
	
	p2.style.width = p1.offsetWidth - this.conf.pr.ofs.w + "px";
	p2.style.height = p1.offsetHeight - this.conf.pr.ofs.h + "px";
	
	p1 = p2 = null;
};

// borders
dhtmlXCellObject.prototype._showBorders = function(noAdjust) {
	
	if (this.conf.borders) return;
	
	this.conf.borders = true;
	
	this.cell.childNodes[this.conf.idx.cont].className = "dhx_cell_cont"+this.conf.css;
	
	this.conf.cells_cont = null;
	this._mtbUpdBorder();
	
	this.callEvent("_onBorderChange",[true]);
	
	if (noAdjust !== true) this._adjustCont(this._idd);
	
};
	
dhtmlXCellObject.prototype._hideBorders = function(noAdjust) {
	
	if (!this.conf.borders) return;
	
	this.conf.borders = false;
	
	this.cell.childNodes[this.conf.idx.cont].className = "dhx_cell_cont"+this.conf.css+" dhx_cell_cont_no_borders";
	this.conf.cells_cont = null;
	this._mtbUpdBorder();
	
	this.callEvent("_onBorderChange",[false]);
	
	if (noAdjust !== true) this._adjustCont(this._idd);
	
};

// basic width/height
dhtmlXCellObject.prototype._getWidth = function() {
	return this.cell.offsetWidth;
};

dhtmlXCellObject.prototype._getHeight = function() {
	return this.cell.offsetHeight;
};


dhtmlXCellObject.prototype.showInnerScroll = function() {
	this.cell.childNodes[this.conf.idx.cont].style.overflow = "auto";
};

/* unload */
dhtmlXCellObject.prototype._unload = function() {
	
	this.conf.unloading = true;
	
	this.callEvent("_onCellUnload",[]);
	
	this.progressOff();
	
	// unload current view (remove attached content)
	this.unloadView(this.conf.view);
	
	this.dataNodes = null;
	
	this.cell.parentNode.removeChild(this.cell);
	this.cell = null;
	
	window.dhx4._eventable(this, "clear");
	
	// views
	for (var a in this.views) this.unloadView(a);
	
	this.conf = null;
	
	// others
	for (var a in this) this[a] = null; // no mercy
	
};

dhtmlXCellObject.prototype.attachObject = function(obj, adjust) {
	
	// adjust - for windows only
	if (window.dhx4.s2b(adjust) && !(typeof(window.dhtmlXWindowsCell) != "undefined" && (this instanceof window.dhtmlXWindowsCell))) {
		adjust = false;
	}
	
	if (typeof(obj) == "string") obj = document.getElementById(obj);
	
	// already attached
	if (obj.parentNode == this.cell.childNodes[this.conf.idx.cont]) {
		obj = null;
		return;
	}
	
	if (adjust) {
		obj.style.display = "";
		var w = obj.offsetWidth;
		var h = obj.offsetHeight;
	}
	
	this._attachObject(obj);
	this.dataType = "obj";
	obj.style.display = "";
	obj = null;
	
	if (adjust) this._adjustByCont(w,h);
	
};

dhtmlXCellObject.prototype.appendObject = function(obj) {
	
	if (typeof(obj) == "string") obj = document.getElementById(obj);
	
	// already attached
	if (obj.parentNode == this.cell.childNodes[this.conf.idx.cont]) {
		obj = null;
		return;
	}
	
	
	if (!this.conf.append_mode) {
		this.cell.childNodes[this.conf.idx.cont].style.overflow = "auto";
		this.conf.append_mode = true;
	}
	
	this._attachObject(obj, null, null, true);
	this.dataType = "obj";
	obj.style.display = "";
	obj = null;
	
};

dhtmlXCellObject.prototype.detachObject = function(remove, moveTo) {
	this._detachObject(null, remove, moveTo);
};

dhtmlXCellObject.prototype.getAttachedMenu = function() {
	return this.dataNodes.menu;
};
dhtmlXCellObject.prototype.getAttachedToolbar = function() {
	return this.dataNodes.toolbar;
};
dhtmlXCellObject.prototype.getAttachedRibbon = function() {
	return this.dataNodes.ribbon;
};
dhtmlXCellObject.prototype.getAttachedStatusBar = function() {
	return this.dataNodes.sb;
};
dhtmlXCellObject.prototype.getAttachedObject = function() {
	return this.dataObj;
};

dhtmlXCellObject.prototype.attachURL = function(url, useAjax, postData) {
	
	// prepare POST if any, postData should be true or {} otherwise GET
	if (postData == true) postData = {};
	var postReq = (typeof(postData) != "undefined" && postData != false && postData != null);
	
	if (!this.conf.url_data) this.conf.url_data = {};
	this.conf.url_data.url = url;
	this.conf.url_data.ajax = (useAjax == true);
	this.conf.url_data.post_data = (postData==true?{}:(postData||null)); // true or object
	
	if (useAjax == true) {
		
		var t = this;
		if (postReq) {
			var params = "";
			for (var a in postData) params += "&"+encodeURIComponent(a)+"="+encodeURIComponent(postData[a]);

			dhx4.ajax.post(url, params, function(r){
				t.attachHTMLString("<div style='position:relative;width:100%;height:100%;overflow:auto;'>"+r.xmlDoc.responseText+"</div>");
				if (typeof(t._doOnFrameContentLoaded) == "function") t._doOnFrameContentLoaded();
				t.dataType = "url-ajax";
				t = r = null;
			});
		} else {
			dhx4.ajax.get(url, function(r){
				t.attachHTMLString("<div style='position:relative;width:100%;height:100%;overflow:auto;'>"+r.xmlDoc.responseText+"</div>");
				if (typeof(t._doOnFrameContentLoaded) == "function") t._doOnFrameContentLoaded();
				t.dataType = "url-ajax";
				t = r = null;
			});
		}
		
	} else {
		if (this.dataType == "url") {
			var fr = this.getFrame();
		} else {
			var fr = document.createElement("IFRAME");
			fr.frameBorder = 0;
			fr.border = 0;
			fr.style.width = "100%";
			fr.style.height = "100%";
			fr.style.position = "relative";
			this._attachObject(fr);
			this.dataType = "url";
			this._attachURLEvents();
		}
		if (postReq) {
			var firstLoad = (typeof(this.conf.url_data.post_ifr) == "undefined");
			this.conf.url_data.post_ifr = true; // load later
			if (firstLoad) this._attachURLEvents();
			fr.src = "about:blank";
		} else {
			fr.src = url+(url.indexOf("?")>=0?"&":"?")+"dhxr"+new Date().getTime();
		}
		fr = null;
	}
	
	fr = null;
};

dhtmlXCellObject.prototype.reloadURL = function() {
	if (!(this.dataType == "url" || this.dataType == "url-ajax")) return;
	if (this.conf.url_data == null) return;
	this.attachURL(this.conf.url_data.url, this.conf.url_data.ajax, this.conf.url_data.post_data);
};

dhtmlXCellObject.prototype.attachHTMLString = function(str) {
	this._attachObject(null, null, str);
	// esec script
	var z = str.match(/<script[^>]*>[^\f]*?<\/script>/g)||[];
	for (var i=0; i<z.length; i++) {
		var s = z[i].replace(/<([\/]{0,1})script[^>]*>/gi,"");
		if (s) {
			if (window.execScript) window.execScript(s); else window.eval(s);
		}
	}
};

dhtmlXCellObject.prototype.attachLayout = function(conf) {
	
	if (this.conf.skin == "dhx_skyblue"  && typeof(window.dhtmlXWindowsCell) != "undefined" && (this instanceof dhtmlXWindowsCell)) {
		// don't hide layout's borders in window
	}
	if (this instanceof dhtmlXLayoutCell) {
		this._hideBorders();
	}
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	obj.style.overflow = "hidden";
	this._attachObject(obj);
	
	if (typeof(this._layoutMainInst) != "undefined") {
		obj._layoutMainInst = this._layoutMainInst;
	}
	
	if (this instanceof window.dhtmlXLayoutCell) {
		//this.hideHeader();
		// this.cell.childNodes[this.conf.idx.cont].style.backgroundColor = "#f1f1f1";
		// obj._ofs = {t:5,b:5,l:5,r:5};
	}
	
	
	if (typeof(window.dhtmlXLayoutCell) != "undefined" && this instanceof dhtmlXLayoutCell) {
		obj._isParentCell = true;
	}
	
	// acc, move layout 1px-up to hide top borders
	if (typeof(window.dhtmlXAccordionCell) != "undefined" && (this instanceof window.dhtmlXAccordionCell)) {
		obj._ofs = {t:-1};
	}
	
	if (typeof(conf) == "string") conf = {pattern: conf};
	if (typeof(conf.skin) == "undefined") conf.skin = this.conf.skin;
	conf.parent = obj;
	
	this.dataType = "layout";
	this.dataObj = new dhtmlXLayoutObject(conf);
	
	if (this instanceof dhtmlXLayoutCell) {
		this.dataObj.parentLayout = this.layout;
	}
	
	obj._layoutMainInst = null;
	conf.parent = null;
	obj = conf = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
	
};

dhtmlXCellObject.prototype.attachTree = function(rootId) {
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	obj.style.overflow = "hidden";
	
	this._attachObject(obj);
	
	this.dataType = "tree";
	this.dataObj = new dhtmlXTreeObject(obj, "100%", "100%", (rootId||0));
	this.dataObj.setSkin(this.conf.skin);
	
	// cosmetic fix
	this.dataObj.allTree.childNodes[0].style.marginTop = "2px";
	this.dataObj.allTree.childNodes[0].style.marginBottom = "2px";
	
	//obj.style.overflow = "auto";
	obj = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
	
};

dhtmlXCellObject.prototype.attachGrid = function() {
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	obj.style.overflow = "hidden";
	this._attachObject(obj);
	
	this.dataType = "grid";
	this.dataObj = new dhtmlXGridObject(obj);
	this.dataObj.setSkin(this.conf.skin);
	
	// keep border for window and remove for other
	if (this.conf.skin == "dhx_skyblue" && typeof(window.dhtmlXWindowsCell) != "undefined" && this instanceof window.dhtmlXWindowsCell) {
		this.dataObj.entBox.style.border = "1px solid #a4bed4";
		this.dataObj._sizeFix = 0;
	} else {
		this.dataObj.entBox.style.border = "0px solid white";
		this.dataObj._sizeFix = 2;
	}
	
	obj = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
};

dhtmlXCellObject.prototype.attachTabbar = function(conf) {
	
	if (typeof(window.dhtmlXLayoutCell) != "undefined" && this instanceof dhtmlXLayoutCell) {
		this._hideBorders()
	}
	
	// 3.6 init - attachTabbar(mode)
	if (typeof(conf) == "string") {
		conf = {mode:conf};
	} else if (typeof(conf) != "object" || conf == null) {
		conf = {};
	}
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	obj.style.overflow = "hidden";
	
	// acc, move tabbar 1px-up to hide top borders
	if (typeof(window.dhtmlXAccordionCell) != "undefined" && (this instanceof window.dhtmlXAccordionCell)) {
		obj._ofs = {t:-1};
	}
	
	this._attachObject(obj);
	
	conf.skin = this.conf.skin;
	conf.parent = obj;
	
	this.dataType = "tabbar";
	this.dataObj = new dhtmlXTabBar(conf);
	
	conf.parent = obj = null;
	conf = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
};

dhtmlXCellObject.prototype.attachAccordion = function(conf) {
	
	if (typeof(window.dhtmlXWindowsCell) != "undefined" && (this instanceof dhtmlXWindowsCell)) {
		// don't hide layout's borders in window
	} else {
		if (this._isCell) this._hideBorders();
	}
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	this._attachObject(obj);
	
	if (typeof(conf) == "undefined") conf = {};
	if (typeof(conf.skin) == "undefined") conf.skin = this.conf.skin;
	conf.parent = obj;
	
	if (typeof(window.dhtmlXAccordionCell) != "undefined" && (this instanceof window.dhtmlXAccordionCell)) {
		obj._ofs = {
			s:{first:-1},
			m:{first:4}
		}
	}
	
	this.dataType = "acc";
	this.dataObj = new dhtmlXAccordion(conf);
	
	conf.obj = null;
	obj = conf = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
};

dhtmlXCellObject.prototype.attachEditor = function(conf) {
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	obj.style.overflow = "hidden";
	this._attachObject(obj);
	
	if (!(typeof(conf) == "object" && conf != null)) conf = {};
	conf.parent = obj;
	
	this.dataType = "editor";
	this.dataObj = new dhtmlXEditor(conf);
	
	obj = null;
	conf.parent = null;
	conf = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
	
};

dhtmlXCellObject.prototype.attachDataView = function(conf) {
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	obj.style.overflow = "hidden";
	this._attachObject(obj);
	
	if (typeof(conf) == "undefined") conf = {};
	obj.id = "DataViewObject_"+new Date().getTime();
	conf.container = obj.id;
	conf.skin = this.conf.skin;
	
	
	this.dataType = "dataview";
	this.dataObj = new dhtmlXDataView(conf);
	
	
	this.dataObj.setSizes = function(){
		this.render();
	}
	
	obj = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
};

dhtmlXCellObject.prototype.attachScheduler = function(day, mode, cont_id, scheduler) {
	
	scheduler = scheduler || window.scheduler;
	
	var ready = false;
	if (cont_id) {
		var obj = document.getElementById(cont_id);
		if (obj) ready = true;
	}
	if (!ready) {
		var tabs = cont_id || '<div class="dhx_cal_tab" name="day_tab" style="right:204px;"></div><div class="dhx_cal_tab" name="week_tab" style="right:140px;"></div><div class="dhx_cal_tab" name="month_tab" style="right:76px;"></div>';
		var obj = document.createElement("DIV");
		obj.id = "dhxSchedObj_"+new Date().getTime();
		obj.style.width = "100%";
		obj.style.height = "100%";
		obj.style.position = "relative";
		obj.style.overflow = "hidden";
		obj.className = "dhx_cal_container";
		obj.innerHTML = '<div class="dhx_cal_navline"><div class="dhx_cal_prev_button">&nbsp;</div><div class="dhx_cal_next_button">&nbsp;</div><div class="dhx_cal_today_button"></div><div class="dhx_cal_date"></div>'+tabs+'</div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>';
	}
	
	this._attachObject(obj);
	
	this.dataType = "scheduler";
	this.dataObj = scheduler;
	this.dataObj.setSizes = function(){
		this.update_view();
	}
	
	scheduler.init(obj.id, day, mode);
	
	obj = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
};

dhtmlXCellObject.prototype.attachForm = function(data) {
	
	var obj = document.createElement("DIV");
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	
	if (window.dhtmlx && dhtmlx.$customScroll) dhtmlx.CustomScroll.enable(obj); else obj.style.overflow = "auto";
	
	this._attachObject(obj);
	
	this.dataType = "form";
	this.dataObj = new dhtmlXForm(obj, data);
	this.dataObj.setSkin(this.conf.skin);
	
	obj = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
	
}

dhtmlXCellObject.prototype.attachMap = function(opts) {
	
	var obj = document.createElement("DIV");
	obj.id = "GMapsObj_"+this._genStr(12);
	obj.style.width = "100%";
	obj.style.height = "100%";
	obj.style.position = "relative";
	obj.style.overflow = "hidden";
	this._attachObject(obj);
	
	if (!opts) opts = {center: new google.maps.LatLng(40.719837,-73.992348), zoom: 11, mapTypeId: google.maps.MapTypeId.ROADMAP};
	
	this.dataType = "maps";
	this.dataObj = new google.maps.Map(obj, opts);
	
	this.dataObj.setSizes = function() {
		google.maps.event.trigger(this, "resize");
	}
	
	obj = null;
	
	this.callEvent("_onContentAttach",[]);
	
	return this.dataObj;
	
};

dhtmlXCellObject.prototype.attachChart = function(conf) {
	
	var obj = document.createElement("DIV");
	obj.id = "dhxChartObj_"+window.dhx4.newId();
	obj.style.width = "100%";
	obj.style.height = "100%";
	document.body.appendChild(obj);
	this._attachObject(obj);
	
	conf.container = obj.id;
	
	this.dataType = "chart";
	this.dataObj = new dhtmlXChart(conf);
	
	if (!this.dataObj.setSizes) {
		this.dataObj.setSizes = function() {
			if (this.resize) this.resize(); else this.render();
		};
	}
	
	return this.dataObj;
};

/* menu/toolbar/ribbon/status */

// menu
dhtmlXCellObject.prototype.attachMenu = function(conf) {
	
	if (this.dataNodes.menu) return; // return this.dataNodes.menu?
	
	if (typeof(conf) == "undefined") conf = {};
	if (typeof(conf.skin) == "undefined") conf.skin = this.conf.skin;
	conf.parent = this._attachObject("menu").firstChild;
	
	this.dataNodes.menu = new dhtmlXMenuObject(conf);
	this._adjustCont(this._idd);
	
	conf.parent = null;
	conf = null;
	
	return this.dataNodes.menu;
	
};

dhtmlXCellObject.prototype.detachMenu = function() {
	
	if (!this.dataNodes.menu) return;
	this.dataNodes.menu.unload();
	this.dataNodes.menu = null;
	delete this.dataNodes.menu;
	
	this._detachObject("menu");
	
};

dhtmlXCellObject.prototype.showMenu = function() {
	this._mtbShowHide("menu", "");
};

dhtmlXCellObject.prototype.hideMenu = function() {
	this._mtbShowHide("menu", "none");
};

// toolbar

dhtmlXCellObject.prototype.attachToolbar = function(conf) {
	
	if (!(this.dataNodes.ribbon == null && this.dataNodes.toolbar == null)) return;
	
	if (typeof(conf) == "undefined") {
		conf = {};
	} else if (typeof(conf) == "string") {
		conf = {skin:conf};
	}
	if (typeof(conf.skin) == "undefined") conf.skin = this.conf.skin;
	conf.parent = this._attachObject("toolbar").firstChild;
	
	this.dataNodes.toolbar = new dhtmlXToolbarObject(conf);
	this._adjustCont(this._idd);
	
	this.dataNodes.toolbar._masterCell = this;
	this.dataNodes.toolbar.attachEvent("_onIconSizeChange", function(){
		this._masterCell._adjustCont();
	});
	
	conf.parent = null;
	conf = null;
	
	return this.dataNodes.toolbar;
	
};

dhtmlXCellObject.prototype.detachToolbar = function() {
	
	if (!this.dataNodes.toolbar) return;
	this.dataNodes.toolbar._masterCell = null; // link to this
	this.dataNodes.toolbar.unload();
	this.dataNodes.toolbar = null;
	delete this.dataNodes.toolbar;
	
	this._detachObject("toolbar");
	
};

dhtmlXCellObject.prototype.showToolbar = function() {
	this._mtbShowHide("toolbar", "");
};

dhtmlXCellObject.prototype.hideToolbar = function() {
	this._mtbShowHide("toolbar", "none");
};

// ribbon, added in 4.0
dhtmlXCellObject.prototype.attachRibbon = function(conf) {
	
	if (!(this.dataNodes.ribbon == null && this.dataNodes.toolbar == null)) return;
	
	if (typeof(conf) == "undefined") conf = {};
	if (typeof(conf.skin) == "undefined") conf.skin = this.conf.skin;
	
	conf.parent = this._attachObject("ribbon").firstChild;
	
	this.dataNodes.ribbon = new dhtmlXRibbon(conf);
	
	var t = this;
	this.dataNodes.ribbon.attachEvent("_onHeightChanged", function(){
		t._adjustCont(t._idd);
	});
	
	this._adjustCont();
	
	conf.parent = null;
	conf = null;
	
	return this.dataNodes.ribbon;
	
};

dhtmlXCellObject.prototype.detachRibbon = function() {
	
	if (!this.dataNodes.ribbon) return;
	this.dataNodes.ribbon.unload();
	this.dataNodes.ribbon = null;
	delete this.dataNodes.ribbon;
	
	this._detachObject("ribbon");
	
};

dhtmlXCellObject.prototype.showRibbon = function() {
	this._mtbShowHide("ribbon", "");
};

dhtmlXCellObject.prototype.hideRibbon = function() {
	this._mtbShowHide("ribbon", "none");
};


// status bar

dhtmlXCellObject.prototype.attachStatusBar = function(conf) { // args-optinal, new in version
	
	if (this.dataNodes.sb) return;  // return this.dataNodes.sb?
	
	if (this.conf.skin == "dhx_skyblue"  && typeof(window.dhtmlXWindowsCell) != "undefined" && (this instanceof dhtmlXWindowsCell)) {
		 this.cell.childNodes[this.conf.idx.cont].className += " dhx_cell_statusbar_attached";
	}
	this.dataNodes.sb = this._attachObject("sb", conf);
	
	this.dataNodes.sb.setText = function(text) { this.childNodes[0].innerHTML = text; }
	this.dataNodes.sb.getText = function() { return this.childNodes[0].innerHTML; }
	this.dataNodes.sb.onselectstart = function(e) { return false; }
	
	return this.dataNodes.sb;
	
};

dhtmlXCellObject.prototype.detachStatusBar = function() {
	
	if (!this.dataNodes.sb) return;
	
	if (this.conf.skin == "dhx_skyblue"  && typeof(window.dhtmlXWindowsCell) != "undefined" && (this instanceof dhtmlXWindowsCell)) {
		 this.cell.childNodes[this.conf.idx.cont].className = this.cell.childNodes[this.conf.idx.cont].className.replace(/\s{0,}dhx_cell_statusbar_attached/,"");
	}
	
	this.dataNodes.sb.setText = this.dataNodes.sb.getText = this.dataNodes.sb.onselectstart = null;
	this.dataNodes.sb = null;
	delete this.dataNodes.sb;
	
	this._detachObject("sb");
	
};

dhtmlXCellObject.prototype.showStatusBar = function() {
	this._mtbShowHide("sb", "");
};

dhtmlXCellObject.prototype.hideStatusBar = function() {
	this._mtbShowHide("sb", "none");
};

dhtmlXCellObject.prototype._mtbShowHide = function(name, disp) {
	if (!this.dataNodes[name]) return;
	this.cell.childNodes[this.conf.idx[name]].style.display = disp;
	this._adjustCont();
};


/* private logic */

// !!! fix
dhtmlXCellObject.prototype.getFrame = dhtmlXCellObject.prototype._getFrame = function() { // _getFrame deprecated, use getFrame
	if (this.dataType != "url") return null;
	return this.cell.childNodes[this.conf.idx.cont].firstChild;
};


dhtmlXCellObject.prototype._genStr = function() {
	if (!this._genStrId) this._genStrId = new Date().getTime();
	return this._genStrId++;
};

dhtmlXCellObject.prototype._attachURLEvents = function() {
	
	if (this.dataType != "url") return;
	
	var t = this;
	var cId = this._idd;
	var fr = this.cell.childNodes[this.conf.idx.cont].firstChild;
	
	if (typeof(this._doOnFrameMouseDown) != "function") {
		this._doOnFrameMouseDown = function(e) {
			// console.log("frame mouse down"); // needed for windows to activate window
			t.callEvent("_onContentMouseDown", [cId,e||event]);
		}
	}
	
	if (typeof(window.addEventListener) == "function") {
		fr.onload = function() {
			try { if (typeof(t._doOnFrameMouseDown) == "function") this.contentWindow.document.body.addEventListener("mousedown", t._doOnFrameMouseDown, false); } catch(e) {};
			try { if (typeof(t._doOnFrameContentLoaded) == "function") t._doOnFrameContentLoaded(); } catch(e) {};
		}
	} else {
		// ie8-
		fr.onreadystatechange = function(a) {
			if (this.readyState == "complete") {
				try { if (typeof(t._doOnFrameMouseDown) == "function") this.contentWindow.document.body.attachEvent("onmousedown", t._doOnFrameMouseDown); } catch(e) {};
				try { if (typeof(t._doOnFrameContentLoaded) == "function") t._doOnFrameContentLoaded(); } catch(e) {};
			}
		}
	}
	//fr = null;
};


dhtmlXCellObject.prototype._doOnFrameContentLoaded = function() {
	if (this.conf.url_data.post_ifr == true) {
		var d = this.getFrame().contentWindow.document;
		var f = d.createElement("FORM");
		f.method = "POST";
		f.action = this.conf.url_data.url;
		d.body.appendChild(f);
		var postData = {};
		postData["dhxr"+new Date().getTime()] = "1";
		for (var a in this.conf.url_data.post_data) postData[a] = this.conf.url_data.post_data[a];
		for (var a in postData) {
			var k = d.createElement("INPUT");
			k.type = "hidden";
			k.name = a;
			k.value = postData[a];
			f.appendChild(k);
			k = null;
		}
		this.conf.url_data.post_ifr = false;
		f.submit();
	} else {
		this.callEvent("_onContentLoaded", [this._idd]);
	}
};

dhtmlXCellObject.prototype._detachURLEvents = function(fr) {
	if (fr == null) {
		if (this.dataType != "url") return;
		fr = this.cell.childNodes[this.conf.idx.cont].firstChild;
	}
	if (typeof(window.addEventListener) == "function") {
		fr.onload = null;
		try { fr.contentWindow.document.body.removeEventListener("mousedown", this._doOnFrameMouseDown, false); } catch(e) {/* console.log("error: url detach mousedown event fail"); */};
	} else {
		fr.onreadystatechange = null;
		try { fr.contentWindow.document.body.detachEvent("onmousedown", this._doOnFrameMouseDown); } catch(e) { };
	}
	fr = null;
};




dhtmlXCellObject.prototype._attachObject = function(obj, type, htmlString, append, node) {
	
	if (obj == "menu") {
		
		if (typeof(node) != "undefined") {
			obj = node;
		} else {
			obj = document.createElement("DIV");
			obj.className = "dhx_cell_menu_"+(this.conf.borders?"def":"no_borders");
			obj.appendChild(document.createElement("DIV"));
		}
		
		this.cell.insertBefore(obj, this.cell.childNodes[this.conf.idx.toolbar||this.conf.idx.cont]); // before toolbar or before cont, 0=hdr
		
		this.conf.ofs_nodes.t.menu = true;
		this._updateIdx();
		// adjust cont will performed after toolbar init
		
		return obj;
	}
	
	if (obj == "toolbar") {
		
		if (typeof(node) != "undefined") {
			obj = node;
		} else {
			obj = document.createElement("DIV");
			obj.className = "dhx_cell_toolbar_"+(this.conf.borders?"def":"no_borders");
			obj.appendChild(document.createElement("DIV"));
			obj.firstChild.className = "dhx_toolbar_base_18_dhx_skyblue";
		}

		this.cell.insertBefore(obj, this.cell.childNodes[this.conf.idx.cont]); // before cont only
		
		this.conf.ofs_nodes.t.toolbar = true;
		this._updateIdx();
		// adjust cont will performed after toolbar init
		
		return obj;
	}
	
	if (obj == "ribbon") {
		
		if (typeof(node) != "undefined") {
			obj = node;
		} else {
			obj = document.createElement("DIV");
			obj.className = "dhx_cell_ribbon_"+(this.conf.borders?"def":"no_borders");
			obj.appendChild(document.createElement("DIV"));
		}
		
		this.cell.insertBefore(obj, this.cell.childNodes[this.conf.idx.cont]); // before cont only
		this.conf.ofs_nodes.t.ribbon = true;
		this._updateIdx();
		this._adjustCont(this._idd);
		
		return obj;
	}
	
	if (obj == "sb") {
		
		// type -> (object) conf={text:string,height:number}
		
		if (typeof(node) != "undefined") {
			obj = node;
		} else {
			var conf = type||{};
			var text = (typeof(conf.text)=="string" && conf.text.length > 0 ? conf.text : "&nbsp;");
			var h = (typeof(conf.height) == "number" ? conf.height : false);
			var obj = document.createElement("DIV");
			//obj.className = "dhx_cell_statusbar_"+(this.conf.borders?"def":"no_borders");
			obj.className = "dhx_cell_statusbar_def";
			obj.innerHTML = "<div class='dhx_cell_statusbar_text'>"+text+"</div>";
			
			// height, optional
			if (h != false) obj.firstChild.style.height = obj.firstChild.style.lineHeight = h+"px";
		}
		
		// before progress or last
		if (this.conf.idx.pr1 != null) {
			this.cell.insertBefore(obj, this.cell.childNodes[this.conf.idx.pr1]);
		} else {
			this.cell.appendChild(obj);
		}
		
		this.conf.ofs_nodes.b.sb = true;
		this._updateIdx();
		this._adjustCont(this._idd);
		
		return obj;
	}
	
	if (append != true) this._detachObject(null, true, null);
	
	if (typeof(htmlString) == "string") {
		this.cell.childNodes[this.conf.idx.cont].innerHTML = htmlString;
	} else {
		this.cell.childNodes[this.conf.idx.cont].appendChild(obj);
	}
	
	obj = null;
};
	
dhtmlXCellObject.prototype._detachObject = function(obj, remove, moveTo) {
	
	this.callEvent("_onBeforeContentDetach",[]);
	
	if (obj == "menu" || obj == "toolbar" || obj == "ribbon" || obj == "sb") {
		
		var p = this.cell.childNodes[this.conf.idx[obj]];
		p.parentNode.removeChild(p);
		p = null;
		
		this.conf.ofs_nodes[obj=="sb"?"b":"t"][obj] = false;
		
		this._updateIdx();
		if (!this.conf.unloading) this._adjustCont(this._idd);
		
		return;
	}
	
	if (remove == true) {
		moveTo = false;
	} else {
		if (typeof(moveTo) == "undefined") {
			moveTo = document.body;
		} else {
			if (typeof(moveTo) == "string") moveTo = document.getElementById(moveTo);
		}
	}
	
	// clear obj
	
	if (moveTo === false) {
		if (this.dataType == "url") {
			this._detachURLEvents();
		} else if (this.dataObj != null) {
			if (typeof(this.dataObj.unload) == "function") {
				this.dataObj.unload();
			} else if (typeof(this.dataObj.destructor) == "function") {
				this.dataObj.destructor(); // at least for grid
			}
		}
	}
	
	// clear cell cont
	var p = this.cell.childNodes[this.conf.idx.cont];
	while (p.childNodes.length > 0) {
		if (moveTo === false) {
			p.removeChild(p.lastChild);
		} else {
			p.firstChild.style.display = "none"; // replace with/add - visibility:hidden?
			moveTo.appendChild(p.firstChild);
		}
	}
	
	if (this.conf.append_mode) {
		p.style.overflow = "";
		this.conf.append_mode = false;
	}
	
	var resetHdrBrd = (this.dataType == "tabbar");
	
	this.dataObj = null;
	this.dataType = null;
	
	moveTo = p = null;
	
	if (this.conf.unloading != true && resetHdrBrd) {
		this.showHeader(true);
		this._showBorders();
	}
	
};

// for dock/undock
dhtmlXCellObject.prototype._attachFromCell = function(cell) {
	
	// clear existing
	this.detachObject(true);
	
	var mode = "layout";
	if (typeof(window.dhtmlXWindowsCell) != "undefined" && this instanceof window.dhtmlXWindowsCell) {
		mode = "window";
	}
	
	// check opacity:
	// 1) detach from window cell, opacity set to 0.4
	if (typeof(window.dhtmlXWindowsCell) != "undefined" && cell instanceof window.dhtmlXWindowsCell && cell.wins.w[cell._idd].conf.parked) {
		cell.wins._winCellSetOpacity(cell._idd, "open", false);
	}
	// 2) acc-cell collapsed
	if (typeof(window.dhtmlXAccordionCell) != "undefined" && cell instanceof window.dhtmlXAccordionCell && cell.conf.opened == false) {
		cell._cellSetOpacity("open", false);
	}
	
	// menu, toolbar, status
	for (var a in cell.dataNodes) {
		
		this._attachObject(a, null, null, null, cell.cell.childNodes[cell.conf.idx[a]]);
		this.dataNodes[a] = cell.dataNodes[a];
		
		cell.dataNodes[a] = null;
		cell.conf.ofs_nodes[a=="sb"?"b":"t"][a] = false;
		cell._updateIdx();
		
	}
	
	this._mtbUpdBorder();
	
	if (cell.dataType != null && cell.dataObj != null) {
		this.dataType = cell.dataType;
		this.dataObj = cell.dataObj;
		while (cell.cell.childNodes[cell.conf.idx.cont].childNodes.length > 0) {
			this.cell.childNodes[this.conf.idx.cont].appendChild(cell.cell.childNodes[cell.conf.idx.cont].firstChild);
		}
		cell.dataType = null;
		cell.dataObj = null;
		
		// fixes
		if (this.dataType == "grid") {
			if (mode == "window" && this.conf.skin == "dhx_skyblue") {
				this.dataObj.entBox.style.border = "1px solid #a4bed4";
				this.dataObj._sizeFix = 0;
			} else {
				this.dataObj.entBox.style.border = "0px solid white";
				this.dataObj._sizeFix = 2;
			}
		}
	} else {
		// for attached urls and objects simple move them
		while (cell.cell.childNodes[cell.conf.idx.cont].childNodes.length > 0) {
			this.cell.childNodes[this.conf.idx.cont].appendChild(cell.cell.childNodes[cell.conf.idx.cont].firstChild);
		}
	}
	
	this.conf.view = cell.conf.view;
	cell.conf.view = "def";
	for (var a in cell.views) {
		this.views[a] = cell.views[a];
		cell.views[a] = null;
		delete cell.views[a];
	}
	
	cell._updateIdx();
	cell._adjustCont();
	
	this._updateIdx();
	this._adjustCont();
	
	// check opacity, set opacity to 0.4
	// 1) attach to window cell, window parked
	if (mode == "window" && this.wins.w[this._idd].conf.parked) {
		this.wins._winCellSetOpacity(this._idd, "close", false);
	}
	
};
