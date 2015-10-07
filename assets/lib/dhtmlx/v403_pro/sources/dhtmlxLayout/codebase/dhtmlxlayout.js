/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

function dhtmlXLayoutObject(base, pattern, skin) {
	
	// console.log("resize over iframe");
	
	var autoload = null;
	if (base != null && typeof(base) == "object" && typeof(base.tagName) == "undefined" && base._isCell != true) {
		// api-init
		autoload = {};
		if (base.autosize != null) autoload.autosize = base.autosize;
		if (base.cells != null) autoload.cells = base.cells;
		if (base.pattern != null) pattern = base.pattern;
		if (base.skin != null) skin = base.skin;
		if (base.offsets != null) autoload.offsets = base.offsets;
		base = base.parent;
	}
	
	if (base == document.body) {
		// fullscreen
		this.base = base;
	} else if (typeof(base) == "string") {
		// id
		this.base = document.getElementById(base);
	} else {
		// attach
		if (base._isCell == true) {
			
			var conf = (typeof(autoload) != "undefined" && autoload != null ? autoload : {});
			if (conf.pattern == null && pattern != null) conf.pattern = pattern;
			if (conf.skin == null && skin != null) conf.skin = skin;
			
			var layout = base.attachLayout(conf);
			return layout;
			
		}
		
		this.base = base;
	}
	
	if (this.base != document.body) {
		while (this.base.childNodes.length > 0) this.base.removeChild(this.base.lastChild);
	}
	
	this.cdata = {};
	this.conf = {
		skin: (skin||window.dhx4.skin||(typeof(dhtmlx)!="undefined"?dhtmlx.skin:null)||window.dhx4.skinDetect("dhxlayout")||"dhx_skyblue"),
		hh: 20, // header height collapsed, add auto-detect?
		progress: false,
		autosize: "b", // cell which will sized when parent size changed
		nextCell: {a:"b",b:"a"},
		ofs: {t:0,b:0,l:0,r:0}, // base outer offset (fullscreen margins)
		ofs_nodes: {t:{},b:{}}, // attached menu/toolbar/sb/hdr/ftr
		inited: false,
		b_size: {w:-1,h:-1} // base size for onResize
	};
	
	// deparator width
	this.conf.sw = this._detectSW();
	
	// apply only to 1st parent
	if (true||this.base._isParentCell !== true) this.base.className += " dhxlayout_base_"+this.conf.skin;
	
	// custom offset for body
	if (this.base == document.body) {
		var ofsDef = {
			dhx_skyblue: {t: 2, b: 2, l: 2, r: 2},
			dhx_web:     {t: 8, b: 8, l: 8, r: 8},
			dhx_terrace: {t: 9, b: 9, l: 8, r: 8}
		};
		this.conf.ofs = (ofsDef[this.conf.skin] != null ? ofsDef[this.conf.skin] : ofsDef.dhx_skyblue);
	}
	
	// conf-offsets override (attachObject usualy)
	if (autoload != null && autoload.offsets != null) {
		this.setOffsets(autoload.offsets);
	} else if (this.base._ofs != null) {
		this.setOffsets(this.base._ofs);
		this.base._ofs = null;
		delete this.base._ofs;
	}
	
	
	this.dataNodes = {}; // menu/toolbar/ribbon/sb/hdr/ftr
	
	var that = this;
	
	this._getLayout = function() {
		return this;
	}
	
	this.mainInst = (base._layoutMainInst != null ? base._layoutMainInst : null);
	
	this._getMainInst = function(){
		if (this.mainInst != null) return this.mainInst._getMainInst();
		return this;
	}
	
	this._init = function(pattern) {
		
		var t = (typeof(pattern) == "string" ? this.tplData[pattern] : pattern );
		
		this.conf.mode = t.mode;
		
		if (this.conf.mode == "c") {
			this.cdata.a = new dhtmlXLayoutCell("a", this);
		} else {
			this.cdata.a = new dhtmlXLayoutCell("a", this);
			this.cdata.b = new dhtmlXLayoutCell("b", this);
		}
		
		for (var a in this.cdata) {
			this.base.appendChild(this.cdata[a].cell);
			this.cdata[a].conf.init = { w: 0.5, h: 0.5 };
		}
		
		if (this.conf.mode != "c") {
			
			var mainInst = this._getMainInst();
			if (mainInst.conf.sep_idx == null) mainInst.conf.sep_idx = 1; else mainInst.conf.sep_idx++;
			
			this.sep = new dhtmlXLayoutSepObject(this.conf.mode, mainInst.conf.sep_idx);
			this.base.appendChild(this.sep.sep);
			
			this.sep._getLayout = function() {
				return that._getLayout();
			}
			
			mainInst = null;
		}
		
		if (t.cells != null) {
			for (var a in t.cells) {
				if (t.cells[a].width != null) this.cdata[a].conf.init.w = t.cells[a].width;
				if (t.cells[a].height != null) this.cdata[a].conf.init.h = t.cells[a].height;
				if (t.cells[a].name != null) {
					this.cdata[a].conf.name = t.cells[a].name;
					this.cdata[a].setText(t.cells[a].name);
				}
				// fixed size conf
				if (t.cells[a].fsize != null) this.cdata[a].conf.fsize = t.cells[a].fsize;
			}
		}
		
		this.setSizes();
		
		for (var a in this.cdata) this.cdata[a].conf.init = {};
			
		if (t.cells != null) {
			for (var a in t.cells) {
				if (t.cells[a].layout != null) {
					this.cdata[a].dataNested = true;
					this.cdata[a]._layoutMainInst = this;
					this.cdata[a].attachLayout({pattern:t.cells[a].layout});
					this.cdata[a]._layoutMainInst = null;
				}
			}
		}
		
	}
	
	this.setSizes = function(parentIdd, autosize, noCalcCont, actionType) {
		
		var rEv = (this.conf.inited==true && this._getMainInst()==this && this.checkEvent("onResizeFinish")==true ? {}:false); // resize event
		
		// noCalcCont - skip inner content adjusting, for autoexpand
		
		var ofsYT = this.conf.ofs.t;
		for (var a in this.conf.ofs_nodes.t) ofsYT += (this.conf.ofs_nodes.t[a]==true ? this.dataNodes[a].offsetHeight:0);
		
		var ofsYB = this.conf.ofs.b;
		for (var a in this.conf.ofs_nodes.b) ofsYB += (this.conf.ofs_nodes.b[a]==true ? this.dataNodes[a].offsetHeight:0);
		
		var ofsXL = this.conf.ofs.l;
		var ofsXR = this.conf.ofs.r;
		
		var baseW = this.base.offsetWidth;
		var baseH = this.base.offsetHeight;
		
		if (this.conf.mode == "c") {
			
			var ax = ofsXR;
			var ay = ofsYT;
			var aw = baseW-ofsXL-ofsXR;
			var ah = baseH-ofsYT-ofsYB;
			
			this.cdata.a._setSize(ax, ay, aw, ah, parentIdd, noCalcCont, actionType);
			
			this.callEvent("_onSetSizes", []);
			
			if (rEv && (!(this.conf.b_size.w == baseW && this.conf.b_size.h == baseH))) {
				this._callMainEvent("onResizeFinish", []);
			}
			
			this.conf.b_size = {w: baseW, h: baseH};
			
			return;
		}
		
		if (typeof(autosize) == "undefined") {
			
			var k = (this.conf.mode=="v"?"w":"h");
			
			autosize = this.conf.autosize;
			
			if (this.cdata.a.conf.collapsed) {
				autosize = "b";
			} else if (this.cdata.b.conf.collapsed) {
				autosize = "a";
			} else if (parentIdd == "a" || parentIdd == "b") {
				autosize = this.conf.nextCell[parentIdd];
			}
			
		} else {
			//debugger
		}
		
		
		if (this.conf.mode == "v") {
			
			if (autosize == "a") {
				
				// fix "b", fit "a"
				
				if (this.cdata.b.conf.init.w != null) {
					var bw = Math.round(baseW*this.cdata.b.conf.init.w-this.conf.sw/2)-ofsXR;
				} else {
					var bw = this.cdata.b.conf.size.w;
				}
				var bx = baseW-bw-ofsXR;
				var by = ofsYT;
				var bh = baseH-ofsYT-ofsYB;
				
				//
				
				var ax = ofsXL;
				var ay = by;
				var aw = bx-ax-this.conf.sw;
				var ah = bh;
				
				
			} else {
				
				// fix "a", fit "b"
				var ax = ofsXL;
				var ay = ofsYT;
				
				// check if init stage
				if (this.cdata.a.conf.init.w != null) {
					
					var aw = Math.round(baseW*this.cdata.a.conf.init.w-this.conf.sw/2)-ax;
				} else {
					var aw = this.cdata.a.conf.size.w;
				}
				
				var ah = baseH-ay-ofsYB;
				
				//
				var bx = ax+aw+this.conf.sw;
				var by = ay;
				var bw = baseW-bx-ofsXR;
				var bh = ah;
				
				
			}
			
			
			this.cdata.a._setSize(ax, ay, aw, ah, parentIdd, noCalcCont, actionType);
			this.cdata.b._setSize(bx, by, bw, bh, parentIdd, noCalcCont, actionType);
			
			this.sep._setSize(ax+aw, ay, this.conf.sw, ah);
			
			
		} else {
			
			if (autosize == "a") {
				
				// fix "b", fit "a"
				
				if (this.cdata.b.conf.init.h != null) {
					var bh = Math.round((baseH-ofsYT)*this.cdata.b.conf.init.h-this.conf.sw/2);
				} else {
					var bh = this.cdata.b.conf.size.h;
				}
				var bx = ofsXL;
				var by = baseH-ofsYB-bh;
				var bw = baseW-bx-ofsXR;
				
				//
				
				var ax = bx;
				var ay = ofsYT;
				var aw = bw;
				var ah = by-ay-this.conf.sw;
				
				
			} else {
				
				// if (this.cdata.b.conf.name == "e") debugger
				
				// fix "a", fit "b"
				
				var ax = ofsXL;
				var ay = ofsYT;
				var aw = baseW-ax-ofsXR;
				
				// check if init stage
				if (this.cdata.a.conf.init.h != null) {
					var ah = Math.round((baseH-ofsYT)*this.cdata.a.conf.init.h-this.conf.sw/2);
				} else {
					var ah = this.cdata.a.conf.size.h;
				}
				
				
				//
				var bx = ax;
				var by = ay+ah+this.conf.sw;
				var bw = aw;
				var bh = baseH-by-ofsYB;
				
			}
			
			this.cdata.a._setSize(ax, ay, aw, ah, parentIdd, noCalcCont, actionType);
			this.cdata.b._setSize(bx, by, bw, bh, parentIdd, noCalcCont, actionType);
			
			this.sep._setSize(ax, ay+ah, aw, this.conf.sw);
			
			
		}
		
		this.callEvent("_onSetSizes", []);
		
		// public event for main instance
		
		if (rEv && (!(this.conf.b_size.w == baseW && this.conf.b_size.h == baseH))) {
			this._callMainEvent("onResizeFinish", []);
		}
		
		this.conf.b_size = {w: baseW, h: baseH};
	}
	
	
	this._getAvailWidth = function() {
		
		// logic:
		// 1) take width of all not-collapsed cells marked as "autosize"
		// 2) if cell collapsed - try next cell
		// 3) get min alaiv width
		// 4) base.ofsW - minW -> allowed min
		
		var w = [];
		
		for (var q=0; q<this.conf.as_cells.h.length; q++) {
			var cell = this.cells(this.conf.as_cells.h[q]);
			var k = cell.layout;
			var a = k.conf.autosize;
			if (cell.conf.collapsed) {
				cell = k.cdata[k.conf.nextCell[cell._idd]];
				a = k.conf.nextCell[a];
			}
			w.push(Math.max(0, cell.getWidth()-cell._getMinWidth(a))); // current_width - min_width = size allowed for cell shrink
			k = cell = null;
		}
		var r = (w.length>0?Math.min.apply(window, w):0);
		return this.base.offsetWidth-r;
		
	}
	
	this._getAvailHeight = function() {
		
		var h = [];
		
		for (var q=0; q<this.conf.as_cells.v.length; q++) {
			var cell = this.cells(this.conf.as_cells.v[q]);
			var k = cell.layout;
			var a = k.conf.autosize;
			if (cell.conf.collapsed) {
				cell = k.cdata[k.conf.nextCell[cell._idd]];
				a = k.conf.nextCell[a];
			}
			h.push(Math.max(0, cell.getHeight()-cell._getHdrHeight()-cell._getMinHeight(a))); // current_height - hdr_height - min_height = size allowed for cell shrink
			k = cell = null;
		}
		var r = Math.min.apply(window, h);
		return this.base.offsetHeight-r;
		
	}
	
	this.setSkin = function(skin) {
		this.base.className = this.base.className.replace(new RegExp("dhxlayout_dhx_"+this.conf.skin,"gi"), "dhxlayout_dhx_"+skin);
		this.conf.skin = skin;
	}
	
	this.unload = function() {
		
		this.conf.unloading = true;
		
		this.mainInst = null;
		this.parentLayout = null;
		
		this._mtbUnload();
		this.detachHeader();
		this.detachFooter();
		
		window.dhx4._eventable(this, "clear");
		
		var r = new RegExp("\s{0,}dhxlayout_base_"+this.conf.skin,"gi");
		this.base.className = this.base.className.replace(r,"");
		
		// deprecated in 4.0
		if (this.items != null) {
			for (var q=0; q<this.items.length; q++) this.items[q] = null;
			this.items = null;
		}
		
		if (this.conf.fs_mode == true) {
			if (window.addEventListener) {
				window.removeEventListener("resize", this._doOnResizeStart, false);
			} else {
				window.detachEvent("onresize", this._doOnResizeStart);
			}
		}
		
		if (this.dhxWins != null) {
			this.dhxWins.unload();
			this.dhxWins = null;
		}
		
		if (this.sep != null) {
			this.sep._unload();
			this.sep = null;
		}
		
		for (var a in this.cdata) {
			this.cdata[a]._unload();
			//this.cdata[a] = null;
		}
		
		this.base = null;
		for (var a in this) this[a] = null;
		
		that = null;
	}
	
	// old container version compat
	this._getWindowMinDimension = function(win) {
		
		var w = that._getAvailWidth()+7+7; // + window left/right borders, move to conf?
		var h = that._getAvailHeight()+7+31; // + window hdr height + bottom border
		
		var t = {w: Math.max(w,200), h: Math.max(h, 140)}; // default window min width/height
		win = null;
		
		return t;
	}
	
	// resize events
	if (this.base == document.body) {
		
		this.conf.fs_mode = true;
		
		this._tmTime = null;
		this._doOnResizeStart = function() {
			window.clearTimeout(that._tmTime);
			that._tmTime = window.setTimeout(that._doOnResizeEnd, 200);
		}
		
		this._doOnResizeEnd = function() {
			that.setSizes();
		}
		
		if (window.addEventListener) {
			window.addEventListener("resize", this._doOnResizeStart, false);
		} else {
			window.attachEvent("onresize", this._doOnResizeStart);
		}
		
	}
	
	
	window.dhx4._eventable(this);
	this._callMainEvent = function(name, args) {
		return this.callEvent(name, args);
	}
	this._init(pattern||"3E");
	
	var a = this._availAutoSize[pattern];
	if (a != null) {
		this.conf.pattern = pattern;
		this.setAutoSize(a.h[a.h.length-1], a.v[a.v.length-1]);
	}
	
	if (typeof(window.dhtmlXWindows) == "function") {
		// console.log("init windows on demand and only for first instance");
		this.dhxWins = new dhtmlXWindows();
		this.dhxWins.setSkin(this.conf.skin);
	}
	
	this.conf.inited = true;
	
	// deprecated in 4.0
	if (this == this._getMainInst()) {
		var idx = 0;
		this.items = [];
		this.forEachItem(function(cell){
			that.items.push(cell);
			cell.conf.index = idx++;
		});
	}
	
	// autoload
	if (this == this._getMainInst() && autoload != null) {
		if (autoload.autosize != null) this.setAutoSize.apply(this, autoload.autosize);
		if (autoload.cells != null) {
			for (var q=0; q<autoload.cells.length; q++) {
				var data = autoload.cells[q];
				var cell = this.cells(data.id);
				if (data.width) cell.setWidth(data.width);
				if (data.height) cell.setHeight(data.height);
				if (data.text) cell.setText(data.text);
				if (data.collapsed_text) cell.setCollapsedText(data.collapsed_text);
				if (data.collapse) cell.collapse();
				if (data.fix_size) cell.fixSize(data.fix_size[0], data.fix_size[1]);
				if (typeof(data.header) != "undefined" && window.dhx4.s2b(data.header) == false) cell.hideHeader();
			}
		}
		
	}
	autoload = null;
	
	return this;
};

// cell access
dhtmlXLayoutObject.prototype.cells = function(name) {
	for (var a in this.cdata) {
		if (this.cdata[a].conf.name == name) return this.cdata[a];
		if (this.cdata[a].dataType == "layout" && this.cdata[a].dataNested == true && this.cdata[a].dataObj != null) {
			var k = this.cdata[a].dataObj.cells(name);
			if (k != null) return k;
		}
	}
	return null;
};

// iterator
dhtmlXLayoutObject.prototype.forEachItem = function(handler, env) {
	if (typeof(handler) != "function") return;
	if (typeof(env) == "undefined") env = this;
	for (var a in this.cdata) {
		if (typeof(this.cdata[a].conf.name) != "undefined") handler.apply(env, [this.cdata[a]]);
		if (this.cdata[a].dataType == "layout" && this.cdata[a].dataNested == true && this.cdata[a].dataObj != null) {
			this.cdata[a].dataObj.forEachItem(handler, env);
		}
	}
	env = null;
};

dhtmlXLayoutObject.prototype._forEachSep = function(handler, env) {
	if (typeof(handler) != "function") return;
	if (typeof(env) == "undefined") env = this;
	if (this.sep != null) handler.apply(env, [this.sep])
	for (var a in this.cdata) {
		if (this.cdata[a].dataType == "layout" && this.cdata[a].dataNested == true && this.cdata[a].dataObj != null) {
			this.cdata[a].dataObj._forEachSep(handler, env);
		}
	}
	env = null;
};

// outer offsets
dhtmlXLayoutObject.prototype.setOffsets = function(data) {
	var t = false;
	for (var a in data) {
		var k = a.charAt(0);
		if (typeof(this.conf.ofs[k]) != "undefined" && !isNaN(data[a])) {
			this.conf.ofs[k] = parseInt(data[a]);
			t = true;
		}
	}
	if (typeof(this.setSizes) == "function" && t == true) this.setSizes();
};

// separator width/height detect
dhtmlXLayoutObject.prototype._detectSW = function() {
	if (dhtmlXLayoutObject.prototype._confGlob.sw == null) dhtmlXLayoutObject.prototype._confGlob.sw = {};
	if (dhtmlXLayoutObject.prototype._confGlob.sw[this.conf.skin] == null) {
		var t = document.createElement("DIV");
		t.className = "dhxlayout_sep_sw_"+this.conf.skin;
		if (document.body.firstChild != null) {
			document.body.insertBefore(t, document.body.firstChild);
		} else {
			document.body.appendChild(t);
		}
		dhtmlXLayoutObject.prototype._confGlob.sw[this.conf.skin] = t.offsetWidth;
		document.body.removeChild(t);
		t = null;
	}
	return dhtmlXLayoutObject.prototype._confGlob.sw[this.conf.skin];
};


// conf
dhtmlXLayoutObject.prototype._confGlob = {};
// top margin (2px for skyblue) for fullscreen will always adjusted automatcaly
// bottom margin - can be generated by user-content, write in documentstion
// same for footer

dhtmlXLayoutObject.prototype.attachHeader = function(obj, height) {

	if (this.dataNodes.haObj != null) return; // already attached
	
	if (typeof(obj) != "object") obj = document.getElementById(obj);
	
	this.dataNodes.haObj = document.createElement("DIV");
	this.dataNodes.haObj.className = "dhxlayout_hdr_attached";
	this.dataNodes.haObj.style.height = (height||obj.offsetHeight)+"px";
	
	this.base.insertBefore(this.dataNodes.haObj, this.dataNodes.menuObj||this.dataNodes.toolbarObj||this.cdata.a.cell);
	
	this.dataNodes.haObj.appendChild(obj);
	obj.style.visibility = "visible";
	obj = null;
	
	this.dataNodes.haEv = this.attachEvent("_onSetSizes", function(){
		this.dataNodes.haObj.style.left = this.conf.ofs.l+"px";
		this.dataNodes.haObj.style.marginTop = this.conf.ofs.t+"px";
		this.dataNodes.haObj.style.width = this.base.offsetWidth-this.conf.ofs.l-this.conf.ofs.r+"px";
	});
	
	this.conf.ofs_nodes.t.haObj = true;
	
	this.setSizes();
	
};

dhtmlXLayoutObject.prototype.detachHeader = function() {
	
	if (!this.dataNodes.haObj) return;
	
	while (this.dataNodes.haObj.childNodes.length > 0) {
		this.dataNodes.haObj.lastChild.style.visibility = "hidden";
		document.body.appendChild(this.dataNodes.haObj.lastChild);
	}
	this.dataNodes.haObj.parentNode.removeChild(this.dataNodes.haObj);
	this.dataNodes.haObj = null;
	
	this.detachEvent(this.dataNodes.haEv);
	this.dataNodes.haEv = null;
	
	this.conf.ofs_nodes.t.haObj = false;
	
	delete this.dataNodes.haEv;
	delete this.dataNodes.haObj;
	
	if (!this.conf.unloading) this.setSizes();

};

dhtmlXLayoutObject.prototype.attachFooter = function(obj, height) {
	
	if (this.dataNodes.faObj != null) return;
	
	if (typeof(obj) != "object") obj = document.getElementById(obj);
	
	this.dataNodes.faObj = document.createElement("DIV");
	this.dataNodes.faObj.className = "dhxlayout_ftr_attached";
	this.dataNodes.faObj.style.height = (height||obj.offsetHeight)+"px";
	
	var p = (this.dataNodes.sbObj||(this.conf.pattern=="1C"?this.cdata.a:this.sep.sep));
	if (this.base.lastChild == p) {
		this.base.appendChild(this.dataNodes.faObj);
	} else {
		this.base.insertBefore(this.dataNodes.faObj, p.nextSibling);
	}
	
	this.dataNodes.faEv = this.attachEvent("_onSetSizes", function(){
		this.dataNodes.faObj.style.left = this.conf.ofs.l+"px";
		this.dataNodes.faObj.style.bottom = this.conf.ofs.t+"px";
		this.dataNodes.faObj.style.width = this.base.offsetWidth-this.conf.ofs.l-this.conf.ofs.r+"px";
	});
	
	this.dataNodes.faObj.appendChild(obj);
	obj.style.visibility = "visible";
	p = obj = null;
	
	this.conf.ofs_nodes.b.faObj = true;
	
	this.setSizes();
	
};

dhtmlXLayoutObject.prototype.detachFooter = function() {
	
	if (!this.dataNodes.faObj) return;
	
	while (this.dataNodes.faObj.childNodes.length > 0) {
		this.dataNodes.faObj.lastChild.style.visibility = "hidden";
		document.body.appendChild(this.dataNodes.faObj.lastChild);
	}
	this.dataNodes.faObj.parentNode.removeChild(this.dataNodes.faObj);
	this.dataNodes.faObj = null;
	
	this.detachEvent(this.dataNodes.faEv);
	this.dataNodes.faEv = null;
	
	this.conf.ofs_nodes.b.faObj = false;
	
	delete this.dataNodes.faEv;
	delete this.dataNodes.faObj;
	
	if (!this.conf.unloading) this.setSizes();
	
};
// top-level menu/toolbar/status
dhtmlXLayoutObject.prototype.attachMenu = function(conf) {
	
	if (this.dataNodes.menu != null) return;
	
	this.dataNodes.menuObj = document.createElement("DIV");
	this.dataNodes.menuObj.className = "dhxlayout_menu";
	
	this.base.insertBefore(this.dataNodes.menuObj, this.dataNodes.toolbarObj||this.dataNodes.ribbonObj||this.cdata.a.cell);
	
	if (typeof(conf) != "object" || conf == null) conf = {};
	conf.skin = this.conf.skin;
	conf.parent = this.dataNodes.menuObj;
	
	this.dataNodes.menu = new dhtmlXMenuObject(conf);
	
	this.dataNodes.menuEv = this.attachEvent("_onSetSizes", function(){
		if (this.dataNodes.menuObj.style.display == "none") return;
		this.dataNodes.menuObj.style.left = this.conf.ofs.l+"px";
		this.dataNodes.menuObj.style.marginTop = (this.dataNodes.haObj!=null?0:this.conf.ofs.t)+"px";
		this.dataNodes.menuObj.style.width = this.base.offsetWidth-this.conf.ofs.l-this.conf.ofs.r+"px";
	});
	
	this.conf.ofs_nodes.t.menuObj = true;
	
	this.setSizes();
	
	conf.parnt = null;
	conf = null;
	
	return this.dataNodes.menu;
};

dhtmlXLayoutObject.prototype.detachMenu = function() {
	
	if (this.dataNodes.menu == null) return;
	
	this.dataNodes.menu.unload();
	this.dataNodes.menu = null;
	
	this.dataNodes.menuObj.parentNode.removeChild(this.dataNodes.menuObj);
	this.dataNodes.menuObj = null;
	
	this.detachEvent(this.dataNodes.menuEv);
	this.dataNodes.menuEv = null;
	
	delete this.dataNodes.menu;
	delete this.dataNodes.menuObj;
	delete this.dataNodes.menuEv;
	
	this.conf.ofs_nodes.t.menuObj = false;
	
	if (!this.conf.unloading) this.setSizes();
};

// toolbar

dhtmlXLayoutObject.prototype.attachToolbar = function(conf) {
	
	if (!(this.dataNodes.ribbon == null && this.dataNodes.toolbar == null)) return;
	
	this.dataNodes.toolbarObj = document.createElement("DIV");
	this.dataNodes.toolbarObj.className = "dhxlayout_toolbar";
	this.base.insertBefore(this.dataNodes.toolbarObj, this.cdata.a.cell);
	this.dataNodes.toolbarObj.appendChild(document.createElement("DIV"));
	
	if (typeof(conf) != "object" || conf == null) conf = {};
	conf.skin = this.conf.skin;
	conf.parent = this.dataNodes.toolbarObj.firstChild;
	
	this.dataNodes.toolbar = new dhtmlXToolbarObject(conf);
	
	this.dataNodes.toolbarEv = this.attachEvent("_onSetSizes", function() {
		if (this.dataNodes.toolbarObj.style.display == "none") return;
		this.dataNodes.toolbarObj.style.left = this.conf.ofs.l+"px";
		this.dataNodes.toolbarObj.style.marginTop = (this.dataNodes.haObj!=null||this.dataNodes.menuObj!=null?0:this.conf.ofs.t)+"px";
		this.dataNodes.toolbarObj.style.width = this.base.offsetWidth-this.conf.ofs.l-this.conf.ofs.r+"px";
	});
	
	this.dataNodes.toolbar._masterCell = this;
	this.dataNodes.toolbar.attachEvent("_onIconSizeChange", function(){
		this._masterCell.setSizes();
	});
	
	this.conf.ofs_nodes.t.toolbarObj = true;
	
	this.setSizes();
	
	conf.parnt = null;
	conf = null;
	
	return this.dataNodes.toolbar;
};

dhtmlXLayoutObject.prototype.detachToolbar = function() {
	
	if (this.dataNodes.toolbar == null) return;
	
	this.dataNodes.toolbar._masterCell = null; // link to this
	this.dataNodes.toolbar.unload();
	this.dataNodes.toolbar = null;
	
	this.dataNodes.toolbarObj.parentNode.removeChild(this.dataNodes.toolbarObj);
	this.dataNodes.toolbarObj = null;
	
	this.detachEvent(this.dataNodes.toolbarEv);
	this.dataNodes.toolbarEv = null;
	
	this.conf.ofs_nodes.t.toolbarObj = false;
	
	delete this.dataNodes.toolbar;
	delete this.dataNodes.toolbarObj;
	delete this.dataNodes.toolbarEv;
	
	if (!this.conf.unloading) this.setSizes();
};

// toolbar

dhtmlXLayoutObject.prototype.attachRibbon = function(conf) {
	
	if (!(this.dataNodes.ribbon == null && this.dataNodes.toolbar == null)) return;
	
	this.dataNodes.ribbonObj = document.createElement("DIV");
	this.dataNodes.ribbonObj.className = "dhxlayout_ribbon";
	this.base.insertBefore(this.dataNodes.ribbonObj, this.cdata.a.cell);
	this.dataNodes.ribbonObj.appendChild(document.createElement("DIV"));
	
	if (typeof(conf) != "object" || conf == null) conf = {};
	conf.skin = this.conf.skin;
	conf.parent = this.dataNodes.ribbonObj.firstChild;
	
	this.dataNodes.ribbon = new dhtmlXRibbon(conf);
	
	this.dataNodes.ribbonEv = this.attachEvent("_onSetSizes", function() {
		if (this.dataNodes.ribbonObj.style.display == "none") return;
		this.dataNodes.ribbonObj.style.left = this.conf.ofs.l+"px";
		this.dataNodes.ribbonObj.style.marginTop = (this.dataNodes.haObj!=null||this.dataNodes.menuObj!=null?0:this.conf.ofs.t)+"px";
		this.dataNodes.ribbonObj.style.width = this.base.offsetWidth-this.conf.ofs.l-this.conf.ofs.r+"px";
		this.dataNodes.ribbon.setSizes();
	});
	
	this.conf.ofs_nodes.t.ribbonObj = true;
	
	var t = this;
	this.dataNodes.ribbon.attachEvent("_onHeightChanged", function(){
		t.setSizes();
	});
	
	this.setSizes();
	
	conf.parnt = null;
	conf = null;
	
	return this.dataNodes.ribbon;
};

dhtmlXLayoutObject.prototype.detachRibbon = function() {
	
	if (this.dataNodes.ribbon == null) return;
	
	this.dataNodes.ribbon.unload();
	this.dataNodes.ribbon = null;
	
	this.dataNodes.ribbonObj.parentNode.removeChild(this.dataNodes.ribbonObj);
	this.dataNodes.ribbonObj = null;
	
	this.detachEvent(this.dataNodes.ribbonEv);
	this.dataNodes.ribbonEv = null;
	
	this.conf.ofs_nodes.t.ribbonObj = false;
	
	delete this.dataNodes.ribbon;
	delete this.dataNodes.ribbonObj;
	delete this.dataNodes.ribbonEv;
	
	if (!this.conf.unloading) this.setSizes();
};


// status
dhtmlXLayoutObject.prototype.attachStatusBar = function(conf) { // arg-optional, new in version
	
	if (this.dataNodes.sbObj) return;
	
	if (typeof(conf) == "undefined") conf = {};
	
	this.dataNodes.sbObj = document.createElement("DIV");
	this.dataNodes.sbObj.className = "dhxlayout_statusbar";
	
	if (this.dataNodes.faObj != null) {
		this.base.insertBefore(this.dataNodes.sbObj, this.dataNodes.faObj);
	} else {
		if (this.sep == null || this.base.lastChild == this.sep.sep) {
			this.base.appendChild(this.dataNodes.sbObj);
		} else {
			this.base.insertBefore(this.dataNodes.sbObj, this.sep.sep.nextSibling);
		}
	}
	
	this.dataNodes.sbObj.innerHTML = "<div class='dhxcont_statusbar'>"+(typeof(conf.text)=="string" && conf.text.length > 0 ? conf.text:"&nbsp;")+"</div>";
	if (typeof(conf.height) == "number") this.dataNodes.sbObj.firstChild.style.height = this.dataNodes.sbObj.firstChild.style.lineHeight = conf.height+"px";
	
	this.dataNodes.sbObj.setText = function(text) { this.childNodes[0].innerHTML = text; }
	this.dataNodes.sbObj.getText = function() { return this.childNodes[0].innerHTML; }
	this.dataNodes.sbObj.onselectstart = function(e) { return false; }
	
	
	this.dataNodes.sbEv = this.attachEvent("_onSetSizes", function(){
		if (this.dataNodes.sbObj.style.display == "none") return;
		this.dataNodes.sbObj.style.left = this.conf.ofs.l+"px";
		this.dataNodes.sbObj.style.bottom = (this.dataNodes.faObj != null?this.dataNodes.faObj.offsetHeight:0)+this.conf.ofs.t+"px";
		this.dataNodes.sbObj.style.width = this.base.offsetWidth-this.conf.ofs.l-this.conf.ofs.r+"px";
	});
	
	this.conf.ofs_nodes.b.sbObj = true;
	
	this.setSizes();
	
	return this.dataNodes.sbObj;
	
};

dhtmlXLayoutObject.prototype.detachStatusBar = function() {
	
	if (!this.dataNodes.sbObj) return;
	
	this.dataNodes.sbObj.setText = this.dataNodes.sbObj.getText = this.dataNodes.sbObj.onselectstart = null;
	this.dataNodes.sbObj.parentNode.removeChild(this.dataNodes.sbObj);
	this.dataNodes.sbObj = null;
	
	this.detachEvent(this.dataNodes.sbEv);
	this.dataNodes.sbEv = null;
	
	this.conf.ofs_nodes.b.sbObj = false;
	
	delete this.dataNodes.sb;
	delete this.dataNodes.sbObj;
	delete this.dataNodes.sbEv;
	
	if (!this.conf.unloading) this.setSizes();
	
};

// show/hide

dhtmlXLayoutObject.prototype.showMenu = function() {
	this._mtbShowHide("menuObj", "");
};

dhtmlXLayoutObject.prototype.hideMenu = function() {
	this._mtbShowHide("menuObj", "none");
};

dhtmlXLayoutObject.prototype.showToolbar = function(){
	this._mtbShowHide("toolbarObj", "");
};

dhtmlXLayoutObject.prototype.hideToolbar = function(){
	this._mtbShowHide("toolbarObj", "none");
};

dhtmlXLayoutObject.prototype.showRibbon = function(){
	this._mtbShowHide("ribbonObj", "");
};

dhtmlXLayoutObject.prototype.hideRibbon = function(){
	this._mtbShowHide("ribbonObj", "none");
};

dhtmlXLayoutObject.prototype.showStatusBar = function() {
	this._mtbShowHide("sbObj", "");
};

dhtmlXLayoutObject.prototype.hideStatusBar = function(){
	this._mtbShowHide("sbObj", "none");
};

dhtmlXLayoutObject.prototype._mtbShowHide = function(name, disp) {
	if (this.dataNodes[name] == null) return;
	this.dataNodes[name].style.display = disp;
	this.setSizes();
};

dhtmlXLayoutObject.prototype._mtbUnload = function(name, disp) {
	this.detachMenu();
	this.detachToolbar();
	this.detachStatusBar();
	this.detachRibbon();
};

// getters
dhtmlXLayoutObject.prototype.getAttachedMenu = function() {
	return this.dataNodes.menu;
};
dhtmlXLayoutObject.prototype.getAttachedToolbar = function() {
	return this.dataNodes.toolbar;
};
dhtmlXLayoutObject.prototype.getAttachedRibbon = function() {
	return this.dataNodes.ribbon;
};
dhtmlXLayoutObject.prototype.getAttachedStatusBar = function() {
	return this.dataNodes.sbObj;
};

// top-level progress
dhtmlXLayoutObject.prototype.progressOn = function() {
	
	if (this.conf.progress) return;
	
	this.conf.progress = true;
	
	var t1 = document.createElement("DIV");
	t1.className = "dhxlayout_progress";
	this.base.appendChild(t1);
	
	var t2 = document.createElement("DIV");
	t2.className = "dhxlayout_progress_img";
	this.base.appendChild(t2);
	
	t1 = t2 = null;
	
};

dhtmlXLayoutObject.prototype.progressOff = function() {
	
	if (!this.conf.progress) return;
	
	var p = {dhxlayout_progress: true, dhxlayout_progress_img: true};
	for (var q=0; q<this.base.childNodes.length; q++) {
		if (typeof(this.base.childNodes[q].className) != "undefined" && p[this.base.childNodes[q].className] == true) {
			p[this.base.childNodes[q].className] = this.base.childNodes[q];
		}
	}
	
	for (var a in p) {
		if (p[a] != true) this.base.removeChild(p[a]);
		p[a] = null;
	}
	
	this.conf.progress = false;
	p = null;
	
};
dhtmlXLayoutObject.prototype.listPatterns = function() {
	var t = [];
	for (var a in this.tplData) t.push(a);
	return t;
};

dhtmlXLayoutObject.prototype.listAutoSizes = function() {
	
	var curH = (this.conf.as_cells != null ? (this.conf.as_cells.h).join(";") : "");
	var curV = (this.conf.as_cells != null ? (this.conf.as_cells.v).join(";") : "");
	
	var allH = this._availAutoSize[this.conf.pattern].h;
	var allV = this._availAutoSize[this.conf.pattern].v;
	
	return [curH, curV, allH, allV];
	
};


dhtmlXLayoutObject.prototype._getCellsNames = function(cId) {
	var names = {};
	if (this.cdata[cId].conf.name != null) names[this.cdata[cId].conf.name] = true;
	if (this.cdata[cId].dataType == "layout" && this.cdata[cId].dataObj != null && this.cdata[cId].dataObj.mainInst == this) {
		var k0 = this.cdata[cId].dataObj._getCellsNames("a");
		var k1 = this.cdata[cId].dataObj._getCellsNames("b");
		for (var a in k0) names[a] = k0[a];
		for (var a in k1) names[a] = k1[a];
	}
	return names;
};

dhtmlXLayoutObject.prototype.setAutoSize = function(hor, ver, innerCall) {
	
	if (innerCall !== true) {
	
		var t = this.listAutoSizes();
		if (t[0] == hor && t[1] == ver) return;
		
		var t0 = false;
		var t1 = false;
		for (var q=0; q<t[2].length; q++) t0 = t0||t[2][q]==hor;
		for (var q=0; q<t[3].length; q++) t1 = t1||t[3][q]==ver;
		
		if (!t0 || !t1) {
			// console.log("set autosize, incorect values, aborted", hor, ver, t[2], t[3])
			return;
		}
		
	}
	
	this.conf.as_cells = { h: hor.split(";"), v: ver.split(";") };
	var m = (this.conf.mode=="v"?"h":"v");
	
	for (var a in this.cdata) {
		var k = this._getCellsNames(a);
		var s = false;
		for (var q=0; q<this.conf.as_cells[m].length; q++) s = s||k[this.conf.as_cells[m][q]];
		if (s) this.conf.autosize = a;
		if (this.cdata[a].dataType == "layout" && this.cdata[a].dataObj != null) this.cdata[a].dataObj.setAutoSize(hor, ver, true);
	}
	
};

dhtmlXLayoutObject.prototype.tplData = {
	
	// fsize - separators near specified cell for fix_size
	
	"1C": { mode: "c", cells: { a: { name: "a" } } },
	
	"2E": { mode: "h", cells: { a: { name: "a", fsize: {v:1} }, b: { name: "b", fsize: {v:1} } } },
	"2U": { mode: "v", cells: { a: { name: "a", fsize: {h:1} }, b: { name: "b", fsize: {h:1} } } },
	
	"3E": { mode: "h", cells: { a: { name: "a", height: 1/3, fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { name: "b", fsize: {v:[1,2]} }, b: { name: "c", fsize: {v:2} } } } } } },
	"3W": { mode: "v", cells: { a: { name: "a",  width: 1/3, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { name: "b", fsize: {h:[1,2]} }, b: { name: "c", fsize: {h:2} } } } } } },
	"3J": { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "a", fsize: {h:1, v:2} }, b: { name: "c", fsize: {h:1, v:2} } } } }, b: { name: "b", fsize: {h:1} } } },
	"3L": { mode: "v", cells: { a: { name: "a", fsize: {h:1} }, b: { layout: { mode: "h", cells: { a: { name: "b", fsize: {h:1, v:2} }, b: { name: "c", fsize: {h:1, v:2} } } } } } },
	"3T": { mode: "h", cells: { a: { name: "a", fsize: {v:1} }, b: { layout: { mode: "v", cells: { a: { name: "b", fsize: {h:2, v:1} }, b: { name: "c", fsize: {h:2, v:1} } } } } } },
	"3U": { mode: "h", cells: { a: { layout: { mode: "v", cells: { a: { name: "a", fsize: {h:2, v:1} }, b: { name: "b", fsize: {h:2, v:1} } } } }, b: { name: "c", fsize: {v:1} } } },
	
	"4H": { mode: "v", cells: { a: { name: "a",  width: 1/3, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "b", fsize: {h:[1,2], v:3} }, b: { name: "c", fsize: {h:[1,2], v:3} } } } }, b: { name: "d", fsize: {h:2} } } } } } },
	"4I": { mode: "h", cells: { a: { name: "a", height: 1/3, fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { layout: { mode: "v", cells: { a: { name: "b", fsize: {h:3, v:[1,2]} }, b: { name: "c", fsize: {h:3, v:[1,2]} } } } }, b: { name: "d", fsize: {v:2} } } } } } },
	"4T": { mode: "h", cells: { a: { name: "a", fsize: {v:1} }, b: { layout: { mode: "v", cells: { a: { name: "b", width: 1/3, fsize: {h:2, v:1} }, b: { layout: { mode: "v", cells: { a: { name: "c", fsize: {h:[2,3], v:1} }, b: { name: "d", fsize: {h:3, v:1} } } } } } } } } },
	"4U": { mode: "h", cells: { a: { layout: { mode: "v", cells: { a: { name: "a", width: 1/3, fsize: {h:2, v:1} }, b: { layout: { mode: "v", cells: { a: { name: "b", fsize: {h:[2,3], v:1} }, b: { name: "c", fsize: {h:3, v:1} } } } } } } }, b: { name: "d", fsize: {v:1} } } },
	"4E": { mode: "h", cells: { a: { name: "a", height: 1/4, fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { name: "b", height: 1/3, fsize: {v:[1,2]} }, b: { layout: { mode: "h", cells: { a: { name: "c", fsize: {v:[2,3]} }, b: { name: "d", fsize: {v:3} } } } } } } } } },
	"4W": { mode: "v", cells: { a: { name: "a",  width: 1/4, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { name: "b",  width: 1/3, fsize: {h:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "c", fsize: {h:[2,3]} }, b: { name: "d", fsize: {h:3} } } } } } } } } },
	"4A": { mode: "v", cells: { a: {  width: 1/3, layout: { mode: "h", cells: { a: { name: "a", fsize: {h:1, v:2} }, b: { name: "b", fsize: {h:1, v:2} } } } }, b: { layout: { mode: "v", cells: { a: { name: "c", fsize: {h:[1,3]} }, b: { name: "d", fsize: {h:3} } } } } } },
	"4L": { mode: "v", cells: { a: { name: "a",  width: 1/3, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { name: "b", fsize: {h:[1,2]} }, b: { layout: { mode: "h", cells: { a: { name: "c", fsize: {h:2, v:3} }, b: { name: "d", fsize: {h:2, v:3} } } } } } } } } },
	"4J": { mode: "h", cells: { a: { name: "a", height: 1/3, fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { name: "b", fsize: {v:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "c", fsize: {h:3, v:2} }, b: { name: "d", fsize: {h:3, v:2} } } } } } } } } },
	"4F": { mode: "h", cells: { a: { height: 1/3, layout: { mode: "v", cells: { a: { name: "a", fsize: {h:2, v:1} }, b: { name: "b", fsize: {h:2, v:1} } } } }, b: { layout: { mode: "h", cells: { a: { name: "c", fsize: {v:[1,3]} }, b: { name: "d", fsize: {v:3} } } } } } },
	"4G": { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "a", height: 1/3, fsize: {h:1, v:2} }, b: { layout: { mode: "h", cells: { a: { name: "b", fsize: {h:1, v:[2,3]} }, b: { name: "c", fsize: {h:1, v:3} } } } } } } }, b: { name: "d", fsize: {h:1} } } },
	"4C": { mode: "v", cells: { a: { name: "a", fsize: {h:1} }, b: { layout: { mode: "h", cells: { a: { name: "b", height: 1/3, fsize: {h:1, v:2} }, b: { layout: { mode: "h", cells: { a: { name: "c", fsize: {h:1, v:[2,3]} }, b: { name: "d", fsize: {h:1, v:3} } } } } } } } } },
	
	"5H": { mode: "v", cells: { a: {  width: 1/3, name: "a", fsize: {h:1}}, b: { layout: { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "b", height: 1/3, fsize: {h:[1,2], v:3} }, b: { layout: { mode: "h", cells: { a: { name: "c", fsize: {h:[1,2], v:[3,4]} }, b: { name: "d", fsize: {h:[1,2], v:4} } } } } } } }, b: { name: "e", fsize: {h:2} } } } } } },
	"5I": { mode: "h", cells: { a: { height: 1/3, name: "a", fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { layout: { mode: "v", cells: { a: { name: "b", width: 1/3, fsize: {h:3, v:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "c", fsize: {h:[3,4], v:[1,2]} }, b: { name: "d", fsize: {h:4, v:[1,2]} } } } } } } }, b: { name: "e", fsize: {v:2} } } } } } },
	"5U": { mode: "h", cells: { a: { layout: { mode: "v", cells: { a: { name: "a",  width: 1/4, fsize: {h:2, v:1} }, b: { layout: { mode: "v", cells: { a: { name: "b",  width: 1/3, fsize: {h:[2,3], v:1} }, b: { layout: { mode: "v", cells: { a: { name: "c", fsize: {h:[3,4], v:1} }, b: { name: "d", fsize: {h:4, v:1} } } } } } } } } } }, b: { name: "e", fsize: {v:1} } } },
	"5E": { mode: "h", cells: { a: { name: "a", height: 1/5, fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { name: "b", height: 1/4, fsize: {v:[1,2]} }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/3, fsize: {v:[2,3]} }, b: { layout: { mode: "h", cells: { a: { name: "d", fsize: {v:[3,4]} }, b: { name: "e", fsize: {v:4} } } } } } } } } } } } },
	"5W": { mode: "v", cells: { a: { name: "a",  width: 1/5, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { name: "b",  width: 1/4, fsize: {h:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "c",  width: 1/3, fsize: {h:[2,3]} }, b: { layout: { mode: "v", cells: { a: { name: "d", fsize: {h:[3,4]} }, b: { name: "e", fsize: {h:4} } } } } } } } } } } } },
	"5K": { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "a", height: 1/3, fsize: {h:1, v:2} }, b: { layout: { mode: "h", cells: { a: { name: "b", fsize: {h:1, v:[2,3]} }, b: { name: "c", fsize: {h:1, v:3} } } } } } } }, b: { layout: { mode: "h", cells: { a: { name: "d", fsize: {h:1, v:4} }, b: { name: "e", fsize: {h:1, v:4} } } } } } },
	"5S": { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "a", fsize: {h:1, v:2} }, b: { name: "b", fsize: {h:1, v:2} } } } }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/3, fsize: {h:1, v:3} }, b: { layout: { mode: "h", cells: { a: { name: "d", fsize: {h:1, v:[3,2]} }, b: { name: "e", fsize: {h:1, v:4} } } } } } } } } },
	"5G": { mode: "v", cells: { a: {  width: 1/3, layout: { mode: "h", cells: { a: { name: "a", height: 1/3, fsize: {h:1, v:2} }, b: { layout: { mode: "h", cells: { a: { name: "b", fsize: {h:1, v:[2,3]} }, b: { name: "c", fsize: {h:1, v:3} } } } } } } }, b: { layout: { mode: "v", cells: { a: { name: "d", fsize: {h:[1,4]} }, b: { name: "e", fsize: {h:4} } } } } } },
	"5C": { mode: "v", cells: { a: {  width: 2/3, layout: { mode: "v", cells: { a: { name: "a", fsize: {h:2} }, b: { name: "b", fsize: {h:[2,1]} } } } }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/3, fsize: {h:1, v:3} }, b: { layout: { mode: "h", cells: { a: { name: "d", fsize: {h:1, v:[3,4]} }, b: { name: "e", fsize: {h:1, v:4} } } } } } } } } },
	
	"6H": { mode: "v", cells: { a: {  width: 1/3, name: "a", fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "b", height: 1/4, fsize: {h:[1,2], v:3} }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/3, fsize: {h:[1,2], v:[3,4]} }, b: { layout: { mode: "h", cells: { a: { name: "d", fsize: {h:[1,2], v:[4,5]} }, b: { name: "e", fsize: {h:[1,2], v:5} } } } } } } } } } }, b: { name: "f", fsize: {h:2} } } } } } },
	"6I": { mode: "h", cells: { a: { height: 1/3, name: "a", fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { layout: { mode: "v", cells: { a: { name: "b",  width: 1/4, fsize: {h:3, v:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "c",  width: 1/3, fsize: {h:[3,4], v:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "d", fsize: {h:[4,5], v:[1,2]} }, b: { name: "e", fsize: {h:5, v:[1,2]} } } } } } } } } } }, b: { name: "f", fsize: {v:2} } } } } } },
	"6A": { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "a", height: 1/5, fsize: {h:1, v:2} }, b: { layout: { mode: "h", cells: { a: { name: "b", height: 1/4, fsize: {h:1, v:[2,3]} }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/3, fsize: {h:1, v:[3,4]} }, b: { layout: { mode: "h", cells: { a: { name: "d", fsize: {h:1, v:[4,5]} }, b: { name: "e", fsize: {h:1, v:5} } } } } } } } } } } } } }, b: { name: "f", fsize: {h:1} } } },
	"6C": { mode: "v", cells: { a: { name: "a", fsize: {h:1} }, b: { layout: { mode: "h", cells: { a: { name: "b", height: 1/5, fsize: {h:1, v:2} }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/4, fsize: {h:1, v:[2,3]} }, b: { layout: { mode: "h", cells: { a: { name: "d", height: 1/3, fsize: {h:1, v:[3,4]} }, b: { layout: { mode: "h", cells: { a: { name: "e", fsize: {h:1, v:[4,5]} }, b: { name: "f", fsize: {h:1, v:5} } } } } } } } } } } } } } } },
	"6J": { mode: "v", cells: { a: {  width: 1/3, layout: { mode: "h", cells: { a: { name: "a", height: 1/4, fsize: {h:1, v:2} }, b: { layout: { mode: "h", cells: { a: { name: "b", height: 1/3, fsize: {h:1, v:[2,3]} }, b: { layout: { mode: "h", cells: { a: { name: "c", fsize: {h:1, v:[3,4]} }, b: { name: "d", fsize: {h:1, v:4} } } } } } } } } } }, b: { layout: { mode: "v", cells: { a: { name: "e", fsize: {h:[1,5]} }, b: { name: "f", fsize: {h:5} } } } } } },
	"6E": { mode: "v", cells: { a: { name: "a",  width: 1/3, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { name: "b", fsize: {h:[1,2]} }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/4, fsize: {h:2, v:3} }, b: { layout: { mode: "h", cells: { a: { name: "d", height: 1/3, fsize: {h:2, v:[3,4]} }, b: { layout: { mode: "h", cells: { a: { name: "e", fsize: {h:2, v:[4,5]} }, b: { name: "f", fsize: {h:2, v:5} } } } } } } } } } } } } } } },
	"6W": { mode: "v", cells: { a: { name: "a",  width: 1/6, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { name: "b", width: 1/5, fsize: {h:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "c", width: 1/4, fsize: {h:[2,3]} }, b: { layout: { mode: "v", cells: { a: { name: "d", width: 1/3, fsize: {h:[3,4]} }, b: { layout: { mode: "v", cells: { a: { name: "e", fsize: {h:[4,5]} }, b: { name: "f", fsize: {h:5} } } } } } } } } } } } } } } },
	
	"7H": { mode: "v", cells: { a: { name: "a",  width: 1/3, fsize: {h:1} }, b: { layout: { mode: "v", cells: { a: { layout: { mode: "h", cells: { a: { name: "b", height: 1/5, fsize: {h:[1,2], v:3} }, b: { layout: { mode: "h", cells: { a: { name: "c", height: 1/4, fsize: {h:[1,2], v:[3,4]} }, b: { layout: { mode: "h", cells: { a: { name: "d", height: 1/3, fsize: {h:[1,2], v:[4,5]} }, b: { layout: { mode: "h", cells: { a: { name: "e", fsize: {h:[1,2], v:[5,6]} }, b: { name: "f", fsize: {h:[1,2], v:6} } } } } } } } } } } } } }, b: { name: "g", fsize: {h:2} } } } } } },
	"7I": { mode: "h", cells: { a: { name: "a", height: 1/3, fsize: {v:1} }, b: { layout: { mode: "h", cells: { a: { layout: { mode: "v", cells: { a: { name: "b",  width: 1/5, fsize: {h:3, v:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "c",  width: 1/4, fsize: {h:[3,4], v:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "d",  width: 1/3, fsize: {h:[4,5], v:[1,2]} }, b: { layout: { mode: "v", cells: { a: { name: "e", fsize: {h:[5,6], v:[1,2]} }, b: { name: "f", fsize: {h:6, v:[1,2]} } } } } } } } } } } } } }, b: { name: "g", fsize: {v:2} } } } } } }
	
};

dhtmlXLayoutObject.prototype._availAutoSize = {
	
	"1C": { h: ["a"], v: ["a"] },
	
	"2E": { h: ["a;b"], v: ["a", "b"] },
	"2U": { h: ["a", "b"], v: ["a;b"] },
	
	"3E": { h: ["a;b;c"], v: ["a", "b", "c"] },
	"3W": { h: ["a", "b", "c"], v: ["a;b;c"] },
	"3J": { h: ["a;c", "b"], v: ["a;b", "b;c"] },
	"3L": { h: ["a", "b;c"], v: ["a;b", "a;c"] },
	"3T": { h: ["a;b", "a;c"], v: ["a", "b;c"] },
	"3U": { h: ["a;c", "b;c"], v: ["a;b", "c"] },
	
	"4H": { h: ["a", "b;c", "d"], v: ["a;b;d", "a;c;d"] },
	"4I": { h: ["a;b;d", "a;c;d"], v: ["a", "b;c", "d"] },
	"4T": { h: ["a;b", "a;c", "a;d"], v: ["a", "b;c;d"] },
	"4U": { h: ["a;d", "b;d", "c;d"], v: ["a;b;c", "d"] },
	"4E": { h: ["a;b;c;d"], v: ["a", "b", "c", "d"] },
	"4W": { h: ["a", "b", "c", "d"], v: ["a;b;c;d"] },
	"4A": { h: ["a;b", "c", "d"], v: ["a;c;d", "b;c;d"] },
	"4L": { h: ["a", "b", "c;d"], v: ["a;b;c", "a;b;d"] },
	"4J": { h: ["a;b;c", "a;b;d"], v: ["a", "b", "c;d"] },
	"4F": { h: ["a;c;d", "b;c;d"], v: ["a;b", "c", "d"] },
	"4G": { h: ["a;b;c", "d"], v: ["a;d", "b;d", "c;d"] },
	"4C": { h: ["a", "b;c;d"], v: ["a;b", "a;c", "a;d"] },
	
	"5H": { h: ["a", "b;c;d", "e"], v: ["a;b;e", "a;c;e", "a;d;e"] },
	"5I": { h: ["a;b;e", "a;c;e", "a;d;e"], v: ["a", "b;c;d", "e"] },
	"5U": { h: ["a;e", "b;e", "c;e", "d;e"], v: ["a;b;c;d", "e"] },
	"5E": { h: ["a;b;c;d;e"], v: ["a", "b", "c", "d", "e"] },
	"5W": { h: ["a", "b", "c", "d", "e"], v: ["a;b;c;d;e"] },
	"5K": { h: ["a;b;c", "d;e"], v: ["a;d", "b;d", "c;d", "a;e", "b;e", "c;e"] },
	"5S": { h: ["a;b", "c;d;e"], v: ["a;c", "a;d", "a;e", "b;c", "b;d", "b;e"] },
	"5G": { h: ["a;b;c", "d", "e"], v: ["a;d;e", "b;d;e", "c;d;e"] },
	"5C": { h: ["a", "b", "c;d;e"], v: ["a;b;c", "a;b;d", "a;b;e"] },
	
	"6H": { h: ["a", "b;c;d;e", "f"], v: ["a;b;f", "a;c;f", "a;d;f", "a;e;f"] },
	"6I": { h: ["a;b;f", "a;c;f", "a;d;f", "a;e;f"], v: ["a", "b;c;d;e", "f"] },
	"6A": { h: ["a;b;c;d;e", "f"], v: ["a;f", "b;f", "c;f", "d;f", "e;f"] },
	"6C": { h: ["a", "b;c;d;e;f"], v: ["a;b", "a;c", "a;d", "a;e", "a;f"] },
	"6J": { h: ["a;b;c;d", "e", "f"], v: ["a;e;f", "b;e;f", "c;e;f", "d;e;f"] },
	"6E": { h: ["a", "b", "c;d;e;f"], v: ["a;b;c", "a;b;d", "a;b;e", "a;b;f"] },
	"6W": { h: ["a", "b", "c", "d", "e", "f"], v: ["a;b;c;d;e;f"] },
	
	"7H": { h: ["a", "b;c;d;e;f", "g"], v: ["a;b;g", "a;c;g", "a;d;g", "a;e;g", "a;f;g"] },
	"7I": { h: ["a;b;g", "a;c;g", "a;d;g", "a;e;g", "a;f;g"], v: ["a", "b;c;d;e;f", "g"] }
	
};
function dhtmlXLayoutSepObject(mode, idx) {
	
	var that = this;
	
	this.conf = {
		mode: mode,
		idx: idx,
		blocked: false, // by expand/collapse
		locked: false // by fix cell size
	};
	
	this._isLayoutSep = true;
	
	this.sep = document.createElement("DIV");
	this.sep.className = "dhxlayout_sep";
	
	
	/*
	// dev, show sep index
	this.sep.innerHTML = "<span style='font-size: 11px; color: red; line-height: 9px;'>"+idx+"</span>";
	this.sep.style.overflow = "visible";
	*/
	
	
	this._btnLeft = (window.dhx4.isIE&&!window.addEventListener?1:0); // 1 for IE8-
	
	if (window.dhx4.isIE) {
		this.sep.onselectstart = function(){return false;};
	}
	
	this.sep.className = "dhxlayout_sep dhxlayout_sep_resize_"+this.conf.mode;
	
	this._setSize = function(x, y, w, h) {
		this.sep.style.left = x+"px";
		this.sep.style.top = y+"px";
		this.sep.style.width = w+"px";
		this.sep.style.height = h+"px";
	}
	
	this._lockSep = function(mode) { // by fix cell size
		this.conf.locked = (mode==true);
		this._blockSep();
	}
	
	this._blockSep = function() { // by expand/collapse
		var k = this._getLayout();
		var state = k.cdata.a.conf.collapsed||k.cdata.b.conf.collapsed||this.conf.locked;
		k = null;
		if (this.conf.blocked == state) return;
		this.sep.className = "dhxlayout_sep"+(state?"":" dhxlayout_sep_resize_"+this.conf.mode);
		this.conf.blocked = state;
	}
	
	this._beforeResize = function(e) {
		
		if (this.conf.blocked) return;
		
		if (this.conf.resize != null && this.conf.resize.active == true) return;
		
		if (e.button !== this._btnLeft) return;
		
		var k = this._getLayout();
		
		//console.log("resize init point");
		//console.log(k);
		
		this.conf.resize = {
			sx: e.clientX,
			sy: e.clientY,
			tx: e.layerX,
			ty: e.layerY,
			sep_x: parseInt(this.sep.style.left),
			sep_y: parseInt(this.sep.style.top),
			min_wa: k.cdata.a._getAvailWidth("a"),
			min_wb: k.cdata.b._getAvailWidth("b"),
			min_ha: k.cdata.a._getAvailHeight("a"),
			min_hb: k.cdata.b._getAvailHeight("b")
		}
		
		this.conf.resize.nx = this.conf.resize.sep_x;
		this.conf.resize.ny = this.conf.resize.sep_y;
		
		// console.log(this.conf.resize)
		
		if (window.addEventListener) {
			document.body.addEventListener("mousemove", this._doOnMouseMove, false);
			document.body.addEventListener("mouseup", this._doOnMouseUp, false);
		} else {
			document.body.attachEvent("onmousemove", this._doOnMouseMove);
			document.body.attachEvent("onmouseup", this._doOnMouseUp);
		}
		
		k = null;
		
	}
	
	this._onResize = function(e) {
		
		if (!this.conf.resize.active) {
			
			this._initResizeArea();
			this.conf.resize.active = true;
			
		}
		
		if (this.conf.mode == "v") {
			
			var ofs = this.conf.resize.sx-e.clientX;
			this.conf.resize.nx = this.conf.resize.sep_x-ofs;
			
			if (this.conf.resize.nx > this.conf.resize.sep_x+this.conf.resize.min_wb) {
				this.conf.resize.nx = this.conf.resize.sep_x+this.conf.resize.min_wb;
			} else if (this.conf.resize.nx < this.conf.resize.sep_x-this.conf.resize.min_wa) {
				this.conf.resize.nx = this.conf.resize.sep_x-this.conf.resize.min_wa;
			}
			
			this.r_sep.style.left = this.conf.resize.nx+"px";
			
		} else {
			
			var ofs = this.conf.resize.sy-e.clientY;
			this.conf.resize.ny = this.conf.resize.sep_y-ofs;
			
			if (this.conf.resize.ny > this.conf.resize.sep_y+this.conf.resize.min_hb) {
				this.conf.resize.ny = this.conf.resize.sep_y+this.conf.resize.min_hb;
			} else if (this.conf.resize.ny < this.conf.resize.sep_y-this.conf.resize.min_ha) {
				this.conf.resize.ny = this.conf.resize.sep_y-this.conf.resize.min_ha;
			}
			
			this.r_sep.style.top = this.conf.resize.ny+"px";
		}
		
	}
	
	this._afterResize = function(e) {
		
		if (window.addEventListener) {
			document.body.removeEventListener("mousemove", this._doOnMouseMove, false);
			document.body.removeEventListener("mouseup", this._doOnMouseUp, false);
		} else {
			document.body.detachEvent("onmousemove", this._doOnMouseMove);
			document.body.detachEvent("onmouseup", this._doOnMouseUp);
		}
		
		if (!this.conf.resize.active) {
			this.conf.resize = null;
			return;
		}
		
		if (e.button !== this._btnLeft) return;
		
		var k = this._getLayout();
		
		var mainInst = k._getMainInst();
		var rCells = (mainInst.checkEvent("onPanelResizeFinish")==true?{}:false);
		
		if (rCells !== false) {
			mainInst.forEachItem(function(cell){
				rCells[cell.conf.name] = {w: cell.conf.size.w, h: cell.conf.size.h};
				cell = null;
			});
		}
		
		var ofs_x = this.conf.resize.nx-this.conf.resize.sep_x;
		var ofs_y = this.conf.resize.ny-this.conf.resize.sep_y;
		
		k.cdata.a._setSize(k.cdata.a.conf.size.x, k.cdata.a.conf.size.y, k.cdata.a.conf.size.w+ofs_x, k.cdata.a.conf.size.h+ofs_y, "a");
		k.cdata.b._setSize(k.cdata.b.conf.size.x+ofs_x, k.cdata.b.conf.size.y+ofs_y, k.cdata.b.conf.size.w-ofs_x, k.cdata.b.conf.size.h-ofs_y, "b");
		
		this._setSize(parseInt(this.r_sep.style.left), parseInt(this.r_sep.style.top), parseInt(this.r_sep.style.width), parseInt(this.r_sep.style.height));
		
		if (window.dhx4.isIE) {
			// w/o timeout cursor not changed to normal state in IE
			var p0 = this;
			window.setTimeout(function(){p0._removeResizeArea();p0=null;},1);
		} else {
			this._removeResizeArea();
		}
		
		
		if (rCells !== false) {
			var p = [];
			mainInst.forEachItem(function(cell){
				var t = rCells[cell.conf.name];
				if (!(t.w == cell.conf.size.w && t.h == cell.conf.size.h)) p.push(cell.conf.name);
				cell = null;
			});
			mainInst._callMainEvent("onPanelResizeFinish", [p]);
		}
		
		mainInst = k = null;
		
		this.conf.resize.active = false;
		this.conf.resize = null;
		
	}
	
	this._initResizeArea = function() {
		
		if (!this.r_sep) {
			
			this.r_sep = document.createElement("DIV");
			this.r_sep.className = "dhxlayout_resize_sep";
			this.r_sep.style.left = this.sep.style.left;
			this.r_sep.style.top = this.sep.style.top;
			this.r_sep.style.width = this.sep.style.width;
			this.r_sep.style.height = this.sep.style.height;
			this.sep.parentNode.appendChild(this.r_sep);
			
			if (window.dhx4.isIE) this.r_sep.onselectstart = function(){return false;};
			
		}
		
		if (!this.r_area) {
			
			this.r_area = document.createElement("DIV");
			this.r_area.className = "dhxlayout_resize_area";
			this.sep.parentNode.appendChild(this.r_area);
			
			if (window.dhx4.isIE) this.r_area.onselectstart = function(){return false;};
			
			if (this.conf.mode == "v") {
				var x = parseInt(this.r_sep.style.left)-this.conf.resize.min_wa;
				var y = parseInt(this.r_sep.style.top);
				var w = this.conf.resize.min_wa+this.conf.resize.min_wb+parseInt(this.r_sep.style.width);
				var h = parseInt(this.r_sep.style.height);
			} else {
				var x = parseInt(this.r_sep.style.left);
				var y = parseInt(this.r_sep.style.top)-this.conf.resize.min_ha;
				var w = parseInt(this.r_sep.style.width);
				var h = this.conf.resize.min_ha+this.conf.resize.min_hb+parseInt(this.r_sep.style.height);
			}
			
			this.r_area.style.left = x+"px";
			this.r_area.style.top = y+"px";
			
			if (!dhtmlXLayoutObject.prototype._confGlob.reszieCover) {
				dhtmlXLayoutObject.prototype._confGlob.reszieCover = {};
				this.r_area.style.width = w+"px";
				this.r_area.style.height = h+"px";
				dhtmlXLayoutObject.prototype._confGlob.reszieCover.w = parseInt(this.r_area.style.width)-this.r_area.offsetWidth;
				dhtmlXLayoutObject.prototype._confGlob.reszieCover.h = parseInt(this.r_area.style.height)-this.r_area.offsetHeight;
			}
			
			this.r_area.style.width = w+dhtmlXLayoutObject.prototype._confGlob.reszieCover.w+"px";
			this.r_area.style.height = h+dhtmlXLayoutObject.prototype._confGlob.reszieCover.h+"px";
		}
		
		document.body.className += " dhxlayout_resize_"+this.conf.mode;
	}
	
	this._removeResizeArea = function() {
		
		this.r_sep.onselectstart = null;
		this.r_sep.parentNode.removeChild(this.r_sep);
		this.r_sep = null;
		
		this.r_area.onselectstart = null;
		this.r_area.parentNode.removeChild(this.r_area);
		this.r_area = null;
		
		document.body.className = String(document.body.className).replace(/\s{0,}dhxlayout_resize_[vh]/gi,"");
		
	}
	
	this._doOnMouseDown = function(e) {
		e = e||event;
		if (e.preventDefault) e.preventDefault(); else e.cancelBubble = true;
		that._beforeResize(e);
	}
	
	this._doOnMouseMove = function(e) {
		e = e||event;
		if (e.preventDefault) e.preventDefault(); else e.cancelBubble = true;
		that._onResize(e);
	}
	
	this._doOnMouseUp = function(e) {
		e = e||event;
		that._afterResize(e);
	}
	
	if (typeof(window.addEventListener) == "function") {
		this.sep.addEventListener("mousedown", this._doOnMouseDown, false);
	} else {
		this.sep.attachEvent("onmousedown", this._doOnMouseDown);
	}
	
	this._unload = function() {
		
		if (typeof(window.addEventListener) == "function") {
			this.sep.removeEventListener("mousedown", this._doOnMouseDown, false);
		} else {
			this.sep.detachEvent("onmousedown", this._doOnMouseDown);
		}
		
		this.sep.parentNode.removeChild(this.sep);
		this.sep = null;
		
		for (var a in this) this[a] = null;
		
		that = null;
	}
	
	return this;
	
};

window.dhtmlXLayoutCell = function(id, layout) {
	
	dhtmlXCellObject.apply(this, [id, "_layout"]);
	
	var that = this;
	this.layout = layout;
	
	this.conf.skin = this.layout.conf.skin;
	this.conf.mode = this.layout.conf.mode;
	this.conf.collapsed = false;
	this.conf.fixed = {w: false, h: false}; // fix size
	this.conf.docked = true;
	
	this.attachEvent("_onCellUnload", function(){
		// dblclick header
		this.cell.childNodes[this.conf.idx.hdr].ondblclick = null;
		this._unloadDocking();
		this.layout = null;
		that = null;
	});
	
	// init header
	this._hdrInit();
	this.cell.childNodes[this.conf.idx.hdr].ondblclick = function(){
		var mainInst = that.layout._getMainInst();
		mainInst._callMainEvent("onDblClick", [that.conf.name]);
		mainInst = null;
	};
	
	// onContentLoaded
	this.attachEvent("_onContentLoaded", function() {
		var mainInst = this.layout._getMainInst();
		mainInst._callMainEvent("onContentLoaded", [this.conf.name]);
		mainInst = null;
	});
	
	// init expand/collapse
	if (this.conf.mode != "c") {
		
		var t = document.createElement("DIV");
		t.className = "dhxlayout_arrow dhxlayout_arrow_"+this.conf.mode+this._idd;
		this.cell.childNodes[this.conf.idx.hdr].appendChild(t);
		t.onclick = function(e) {
			if (that.conf.collapsed) that.expand(); else that.collapse();
		}
		t = null;
	}
	
	this._initDocking();
	
	return this;
	
};

dhtmlXLayoutCell.prototype = new dhtmlXCellObject();

dhtmlXLayoutCell.prototype.getId = function() {
	return this.conf.name;
};

dhtmlXLayoutCell.prototype._initDocking = function() {
	
	var that = this;
	
	this.dock = function() {
		
		var mainInst = this.layout._getMainInst();
		
		if (mainInst.dhxWins == null || this.conf.docked) {
			mainInst = null;
			return;
		}
		
		var w1 = mainInst.dhxWins.window(this.conf.name);
		w1.close();
		
		// move content
		this._attachFromCell(w1);
		
		this.conf.docked = true;
		if (!this.conf.dock_collapsed) this.expand();
		
		mainInst._callMainEvent("onDock",[this.conf.name]);
		
		mainInst = w1 = null;
		
	};
	
	this.undock = function(x, y, w, h) {
		
		var mainInst = this.layout._getMainInst();
		
		if (mainInst.dhxWins == null || this.conf.docked == false) {
			mainInst = null;
			return;
		}
		
		this.conf.dock_collapsed = this.conf.collapsed;
		if (!this.conf.collapsed) this.collapse();
		
		if (mainInst.dhxWins.window(this.conf.name) != null) {
			var w1 = mainInst.dhxWins.window(this.conf.name);
			w1.show();
		} else {
			if (x == null) x = 20;
			if (y == null) y = 20;
			if (w == null) w = 320;
			if (h == null) h = 200;
			
			var w1 = mainInst.dhxWins.createWindow(this.conf.name, x, y, w, h);
			w1.button("close").hide();
			
			// dock button
			w1.addUserButton("dock", 99, "Dock");
			w1.button("dock").show();
			w1.button("dock").attachEvent("onClick", this._doOnDockClick);
			
			// text update only first time
			w1.setText(this.getText());
			
			// closeing
			w1.attachEvent("onClose", this._doOnDockWinClose);
		}
		this.conf.docked = false;
		
		// move content
		w1._attachFromCell(this);
		
		mainInst._callMainEvent("onUnDock",[this.conf.name]);
		
		mainInst = w1 = null;
		
	}
	
	this._doOnDockClick = function() {
		that.dock();
	}
	this._doOnDockWinClose = function(win) {
		win.hide();
		return false;
	}
	
	this._unloadDocking = function() {
		that = null;
	}
};
dhtmlXLayoutCell.prototype._hdrInit = function() {
	
	var cssExt = "";
	if (window.dhx4.isIE) {
		if (navigator.userAgent.indexOf("MSIE 8.0") != -1) {
			cssExt = " dhx_cell_hdr_text_ie8";
		} else if (navigator.userAgent.indexOf("MSIE 7.0") != -1) {
			cssExt = " dhx_cell_hdr_text_ie7";
		} else if (navigator.userAgent.indexOf("MSIE 6.0") != -1) {
			cssExt = " dhx_cell_hdr_text_ie6";
		}
	} else if (window.dhx4.isChrome) {
		cssExt = " dhx_cell_hdr_text_chrome";
	}
	
	var t = document.createElement("DIV");
	t.className = "dhx_cell_hdr";
	t.innerHTML = "<div class='dhx_cell_hdr_text"+cssExt+"'></div>";
	this.cell.insertBefore(t, this.cell.childNodes[this.conf.idx.cont]);
	t = null;
	
	// include into content top offset calculation
	this.conf.ofs_nodes.t._getHdrHeight = "func";
	
	// show/hide
	this.conf.hdr = {visible: true};
	
	// include into index
	this.conf.idx_data.hdr = "dhx_cell_hdr";
	this._updateIdx();
	
	// fit header when cell changed
	this.attachEvent("_onSetSize", this._hdrOnSetSize);
	this.attachEvent("_onBorderChange", this._hdrOnBorderChange);
	
	// keep visibility state of header if view changed
	this.attachEvent("_onViewSave", this._hdrOnViewSave);
	this.attachEvent("_onViewRestore", this._hdrOnViewRestore);
	
};

dhtmlXLayoutCell.prototype.showHeader = function(noCalcCont) {
	
	if (this.conf.hdr.visible || this.conf.collapsed) return;
	
	if (this.conf.hdr.w_saved > this._getAvailWidth() || this.conf.hdr.h_saved > this._getAvailHeight()) {
		// console.log("no space to show header");
		return;
	}
	
	this.conf.hdr.w_saved = this.conf.hdr.h_saved = null;
	
	this.conf.hdr.visible = true;
	this.cell.childNodes[this.conf.idx.hdr].className = "dhx_cell_hdr";
	
	if (noCalcCont !== true) this._adjustCont(this._idd);
};

dhtmlXLayoutCell.prototype.hideHeader = function(noCalcCont) {
	
	if (!this.conf.hdr.visible || this.conf.collapsed) return;
	
	this.conf.hdr.w_saved = this._getMinWidth();
	this.conf.hdr.h_saved = this._getMinHeight();
	
	this.conf.hdr.visible = false;
	this.cell.childNodes[this.conf.idx.hdr].className = "dhx_cell_hdr dhx_cell_hdr_hidden";
	this._hdrUpdBorder();
	this._mtbUpdBorder();
	
	if (noCalcCont !== true) this._adjustCont(this._idd);
};

dhtmlXLayoutCell.prototype.isHeaderVisible = function() {
	return (this.conf.hdr.visible==true);
};

// arrow
dhtmlXLayoutCell.prototype.showArrow = function() {
	this.cell.childNodes[this.conf.idx.hdr].childNodes[1].style.display = "";
};

dhtmlXLayoutCell.prototype.hideArrow = function() {
	this.cell.childNodes[this.conf.idx.hdr].childNodes[1].style.display = "none";
};

dhtmlXLayoutCell.prototype.isArrowVisible = function() {
	return (this.cell.childNodes[this.conf.idx.hdr].childNodes[1].style.display == "");
};

// text
dhtmlXLayoutCell.prototype.setText = function(text) {
	this.conf.hdr.text = text;
	this._hdrUpdText();
};

dhtmlXLayoutCell.prototype.getText = function() {
	return this.conf.hdr.text;
};

dhtmlXLayoutCell.prototype.setCollapsedText = function(text) {
	this.conf.hdr.text_collapsed = text;
	this._hdrUpdText();
};

dhtmlXLayoutCell.prototype.getCollapsedText = function() {
	return (this.conf.hdr.text_collapsed != null ? this.conf.hdr.text_collapsed : this.conf.hdr.text );
};

dhtmlXLayoutCell.prototype._hdrUpdText = function() {
	var text = (this.conf.collapsed == true && this.conf.hdr.text_collapsed != null ? this.conf.hdr.text_collapsed : this.conf.hdr.text);
	this.cell.childNodes[this.conf.idx.hdr].firstChild.innerHTML = "<span>"+text+"</span>";
};

dhtmlXLayoutCell.prototype._hdrUpdBorder = function() {
	if (this.conf.borders == true) {
		this.cell.childNodes[this.conf.idx.hdr].className = "dhx_cell_hdr"+(this.conf.hdr.visible?"":" dhx_cell_hdr_hidden");
	} else {
		if (!this.conf.hdr.visible) {
			this.cell.childNodes[this.conf.idx.hdr].className = "dhx_cell_hdr dhx_cell_hdr_hidden_no_borders";
		}
	}
};

dhtmlXLayoutCell.prototype._hdrOnSetSize = function() {
	if (this.conf.collapsed && this.conf.mode == "v") this._fitHdr();
};
dhtmlXLayoutCell.prototype._hdrOnBorderChange = function() {
	this.hideHeader(true);
	this._hdrUpdBorder();
};
dhtmlXLayoutCell.prototype._hdrOnViewSave = function(name) {
	this.views[name].hdr_vis = this.conf.hdr.visible;
};
dhtmlXLayoutCell.prototype._hdrOnViewRestore = function(name){
	if (this.conf.hdr.visible != this.views[name].hdr_vis) {
		this[this.views[name].hdr_vis?"showHeader":"hideHeader"](true);
	}
	this.views[name].hdr_vis = null;
	delete this.views[name].hdr_vis;
};
dhtmlXLayoutCell.prototype._getHdrHeight = function(incColl) {
	
	if (this.conf.collapsed && this.conf.mode == "v" && incColl !== true) {
		// collapsed vertical cell, move to conf?
		// offsetHeight returns full cell height, needed only for adjusting bottom border
		return 27;
	}
	return this.cell.childNodes[this.conf.idx.hdr].offsetHeight;
};

dhtmlXLayoutCell.prototype._fitHdr = function() {
	if (this.conf.collapsed) {
		if (typeof(dhtmlXLayoutObject.prototype._confGlob.hdrColH) == "undefined") {
			this.cell.childNodes[this.conf.idx.hdr].style.height = this.cell.offsetHeight+"px";
			dhtmlXLayoutObject.prototype._confGlob.hdrColH = parseInt(this.cell.childNodes[this.conf.idx.hdr].style.height)-this._getHdrHeight(true);
		}
		this.cell.childNodes[this.conf.idx.hdr].style.height = this.cell.offsetHeight+dhtmlXLayoutObject.prototype._confGlob.hdrColH+"px";
	} else {
		this.cell.childNodes[this.conf.idx.hdr].style.height = null;
		
	}
};

/* expand */
dhtmlXLayoutCell.prototype.expand = function(autoExpand) {
	
	if (!this.conf.collapsed) return true;
	
	var k = this.layout;
	
	if (this.conf.mode == "v") {
		
		var w_nextCell = (autoExpand ? k.conf.hh : k.cdata[k.conf.nextCell[this._idd]]._getMinWidth(this._idd));
		var w_avl = k.base.offsetWidth-k.conf.sw;
		
		if (w_nextCell + this.conf.size.w_avl > w_avl) {
			k = null;
			return false;
		}
		
	} else {
		
		// if autoExpand - next cell coing to be collapsed, move value to conf?
		// min heigth of next cell = min_height+hdr_height
		
		var h_nextCell = (autoExpand ? k.conf.hh : k.cdata[k.conf.nextCell[this._idd]]._getMinHeight(this._idd)+k.cdata[k.conf.nextCell[this._idd]]._getHdrHeight());
		var h_avl = k.base.offsetHeight-k.conf.sw; // avail height for both cells = base_h-sep_h
		
		if (h_nextCell + this.conf.size.h_avl > h_avl) {
			// new logic, menu/tb attached
			k = null;
			return false;
		}
		
	}
	
	if (this.conf.docked == false) {
		this.dock();
		return;
	}
	
	this.cell.className = String(this.cell.className).replace(/\s{0,}dhxlayout_collapsed_[hv]/gi, "");
	this.conf.collapsed = false;
	
	if (this.conf.mode == "v") {
		this.conf.size.w = Math.min(w_avl-w_nextCell, this.conf.size.w_saved);
		this.conf.size.w_saved = this.conf.size.w_avl = null;
	} else {
		this.conf.size.h = Math.min(h_avl-h_nextCell, this.conf.size.h_saved);
		this.conf.size.h_saved = this.conf.size.h_avl = null;
	}
	
	if (this.conf.mode == "v") this._fitHdr();
	
	k.setSizes(k.conf.nextCell[this._idd], k.conf.nextCell[this._idd], autoExpand==true, "expand");
	k.sep._blockSep();
	
	k = null;
	
	this._hdrUpdText();
	
	var mainInst = this.layout._getMainInst();
	mainInst._callMainEvent("onExpand", [this.conf.name]);
	mainInst = null;
	
	return true;
};

/* collapse */
dhtmlXLayoutCell.prototype.collapse = function() {
	
	if (this.conf.collapsed) return false;
	
	var k = this.layout;
	
	if (k.cdata[k.conf.nextCell[this._idd]].expand(true) == false) return false; // no space to expand next cell if it collapsed
	
	if (this.conf.mode == "v") {
		this.conf.size.w_saved = this.conf.size.w;
		this.conf.size.w_avl = this._getMinWidth(this._idd); // save min width
	} else {
		this.conf.size.h_saved = this.conf.size.h;
		this.conf.size.h_avl = this._getMinHeight(this._idd)+this._getHdrHeight(); // save min height
	}
	
	this.cell.className += " dhxlayout_collapsed_"+this.conf.mode;
	this.conf.collapsed = true;
	
	if (this.conf.mode == "v") {
		this.conf.size.w = k.conf.hh; // move to conf?
	} else {
		this.conf.size.h = this._getHdrHeight();
	}
	
	k.setSizes(k.conf.nextCell[this._idd], k.conf.nextCell[this._idd], false, "collapse");
	k.sep._blockSep();
	
	k = null;
	
	this._hdrUpdText();
	
	var mainInst = this.layout._getMainInst();
	mainInst._callMainEvent("onCollapse", [this.conf.name]);
	mainInst = null;
	
	return true;
	
};

dhtmlXLayoutCell.prototype.isCollapsed = function() {
	return (this.conf.collapsed==true);
};
// cell sizing
dhtmlXLayoutCell.prototype._getMinWidth = function(parentIdd) {
	// min space should allow to collapse ?
	if (this.dataType == "layout" && this.dataObj != null) {
		
		if (this.dataObj.conf.pattern == "1C") {
			return this.dataObj.cdata.a._getMinWidth(parentIdd);
		} else if (this.dataObj.conf.mode == "v") {
			
			var c1 = parentIdd;
			if (this.dataObj.cdata[c1].conf.collapsed) c1 = this.dataObj.conf.nextCell[c1];
			
			return this.dataObj.cdata[c1]._getMinWidth(parentIdd)+this.dataObj.cdata[this.dataObj.conf.nextCell[c1]]._getWidth()+this.dataObj.conf.sw; // c1 min width + c2 full width + sw
			
		} else {
			return Math.max(this.dataObj.cdata.a._getMinWidth(parentIdd), this.dataObj.cdata.b._getMinWidth(parentIdd));
		}
		
	}
	return 26;
};

dhtmlXLayoutCell.prototype._getMinHeight = function(parentIdd) {
	
	var h = 26;
	if (this.conf.idx.menu != null) h += this.cell.childNodes[this.conf.idx.menu].offsetHeight;
	
	if (this.dataType == "layout" && this.dataObj != null) {
		
		if (this.dataObj.conf.pattern == "1C") {
			return this.dataObj.cdata.a._getMinHeight(parentIdd);
		} else if (this.dataObj.conf.mode == "h") {
			
			var c1 = parentIdd;
			if (this.dataObj.cdata[c1].conf.collapsed) c1 = this.dataObj.conf.nextCell[c1];
			
			return this.dataObj.cdata[c1]._getMinHeight(parentIdd)+this.dataObj.cdata[c1]._getHdrHeight()+this.dataObj.cdata[this.dataObj.conf.nextCell[c1]]._getHeight()+this.dataObj.conf.sw; // c1 min height + c1 hdr height + c2 full height + sw
			
		} else {
			return Math.max(this.dataObj.cdata.a._getMinHeight(parentIdd)+this.dataObj.cdata.a._getHdrHeight(), this.dataObj.cdata.b._getMinHeight(parentIdd)+this.dataObj.cdata.b._getHdrHeight());
		}

	}
	
	return h;
};

dhtmlXLayoutCell.prototype._getAvailWidth = function(parentIdd) {
	
	if (this.dataType == "layout" && this.dataObj != null) {
		if (this.dataObj.conf.pattern == "1C") {
			return this.dataObj.cdata.a._getAvailWidth(parentIdd);
		} else if (this.dataObj.conf.mode == "v") {
			var ac = (this.dataObj.cdata.a.conf.collapsed == true);
			var bc = (this.dataObj.cdata.b.conf.collapsed == true);
			
			if (parentIdd == "a") {
				return this.dataObj.cdata[bc?"a":"b"]._getAvailWidth(parentIdd);
			} else {
				return this.dataObj.cdata[ac?"b":"a"]._getAvailWidth(parentIdd);
			}
		} else {
			return Math.min(this.dataObj.cdata.a._getAvailWidth(parentIdd), this.dataObj.cdata.b._getAvailWidth(parentIdd));
		}
		
	}
	return this.cell.offsetWidth-this._getMinWidth();
};

dhtmlXLayoutCell.prototype._getAvailHeight = function(parentIdd) {
	
	if (this.dataType == "layout" && this.dataObj != null) {
		if (this.dataObj.conf.pattern == "1C") {
			return this.dataObj.cdata.a._getAvailHeight(parentIdd);
		} else if (this.dataObj.conf.mode == "h") {
			
			var ac = (this.dataObj.cdata.a.conf.collapsed == true);
			var bc = (this.dataObj.cdata.b.conf.collapsed == true);
			
			if (parentIdd == "a") {
				return this.dataObj.cdata[bc?"a":"b"]._getAvailHeight(parentIdd);
			} else {
				return this.dataObj.cdata[ac?"b":"a"]._getAvailHeight(parentIdd);
			}
		} else {
			return Math.min(this.dataObj.cdata.a._getAvailHeight(parentIdd), this.dataObj.cdata.b._getAvailHeight(parentIdd));
		}
		
	}
	
	var hh = this._getHdrHeight();
	if (this.conf.mode == "v" && this.conf.collapsed) hh = this.conf.hh; // not include header if v-cell is collapsed
	
	return this.cell.offsetHeight-hh-this._getMinHeight();
};

dhtmlXLayoutCell.prototype.setWidth = function(w) {
	
	if (this.conf.mode == "v") {
		
		if (this.conf.collapsed) return;
		
		var k = this.layout;
		var nextCell = k.cdata[k.conf.nextCell[this._idd]];
		
		if (nextCell.conf.collapsed) {
			
			// try to change parent cell
			
			w = w + k.conf.sw + nextCell._getWidth(); // increase width including nextCell and sw
			
			/*
			var p = this.layout._getMainInst();
			if (p != this.layout) {
				for (var a in p.cdata) if (p.cdata[a].dataObj == k) p.cdata[a].setWidth(w);
			}
			*/
			
			p = k = nextCell = null;
			
			return;
			
		}
		
		var minW = this._getMinWidth(this._idd);
		var maxW = k.base.offsetWidth-nextCell._getMinWidth(this._idd)-k.conf.sw;
		w = Math.max(minW, Math.min(w, maxW));
		
		this.conf.size.w = w;
		
		k.setSizes(nextCell._idd, nextCell._idd);
		k = nextCell = null;
		
	} else {
		// check parent's width
		if (this.layout == null || this.layout.parentLayout == null) return;
		
		var p = this.layout.parentLayout;
		
		var k = this.layout;
		var nextCell = k.cdata[k.conf.nextCell[this._idd]];
		
		for (var a in p.cdata) if (p.cdata[a].dataObj == k) p.cdata[a].setWidth(w);
		
		p = k = null;
	}
	
};

dhtmlXLayoutCell.prototype.setHeight = function(h) {
	
	if (this.conf.mode == "h") {
		
		if (this.conf.collapsed) return;
		
		var k = this.layout;
		var nextCell = k.cdata[k.conf.nextCell[this._idd]];
		
		if (nextCell.conf.collapsed) {
			
			// try to change parent cell
			
			h = h + k.conf.sw + nextCell._getHeight(); // increase with including nextCell and sw, header=cell_height due it collapsed
			
			var p = (this.layout != null && this.layout.parentLayout != null ? this.layout.parentLayout : null);
			if (p != null) {
				for (var a in p.cdata) if (p.cdata[a].dataObj == k) p.cdata[a].setHeight(h);
			}
			
			p = k = nextCell = null;
			
			return;
			
		}
		
		var minH = this._getMinHeight(this._idd)+this._getHdrHeight();
		var maxH = k.base.offsetHeight-nextCell._getMinHeight(this._idd)-nextCell._getHdrHeight()-k.conf.sw;
		h = Math.max(minH, Math.min(h, maxH));
		
		this.conf.size.h = h;
		
		k.setSizes(nextCell._idd, nextCell._idd);
		k = nextCell = null;
		
	} else {
		// check parent's height
		if (this.layout == null || this.layout.parentLayout == null) return;
		
		var p = this.layout.parentLayout;
		
		var k = this.layout;
		var nextCell = k.cdata[k.conf.nextCell[this._idd]];
		
		for (var a in p.cdata) if (p.cdata[a].dataObj == k) p.cdata[a].setHeight(h);
		
		p = k = null;
	}
	
};

dhtmlXLayoutCell.prototype.getWidth = function() {
	return this.conf.size.w;
};

dhtmlXLayoutCell.prototype.getHeight = function() {
	return this.conf.size.h;
};

dhtmlXLayoutCell.prototype.fixSize = function(w, h) {
	
	this.conf.fixed.w = window.dhx4.s2b(w);
	this.conf.fixed.h = window.dhx4.s2b(h);
	
	var mainInst = this.layout._getMainInst();
	var s = {};
	
	mainInst.forEachItem(function(cell){
		if (cell.conf.fsize != null) {
			var id = cell.getId();
			var p = {
				h: (cell.conf.fixed.w==true),
				v: (cell.conf.fixed.h==true)
			};
			for (var a in p) {
				if (p[a] == true && cell.conf.fsize[a] != null) {
					if (!(cell.conf.fsize[a] instanceof Array)) cell.conf.fsize[a] = [cell.conf.fsize[a]];
					for (var q=0; q<cell.conf.fsize[a].length; q++) s[cell.conf.fsize[a][q]] = true;
				}
			}
		}
		cell = null;
	});
	
	mainInst._forEachSep(function(sep){
		sep._lockSep(s[sep.conf.idx]==true);
		sep = null;
	});
	
	mainInst = null;
	
};

