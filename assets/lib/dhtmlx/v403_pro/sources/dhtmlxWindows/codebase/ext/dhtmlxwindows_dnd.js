/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXWindows.prototype._dndInitModule = function() {
	
	var that = this;
	
	this._dndOnMouseDown = function(e, id) {
		
		if (that.conf.dblclick_active) return;
		
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		
		that.conf.dnd = {
			id: id,
			x: e.clientX,
			y: e.clientY,
			ready: true,
			css: false,
			tr: null,
			mode: "def", //"def" - move win, "tr" - for translate, "rect" - move rectange
			moved: false
		};
		
		if (that.w[id].conf.keep_in_vp) {
			that.conf.dnd.minX = 0;
			that.conf.dnd.maxX = that.vp.clientWidth-that.w[id].conf.w;
			that.conf.dnd.minY = 0;
			that.conf.dnd.maxY = that.vp.clientHeight-that.w[id].conf.h;
		} else {
			that.conf.dnd.minX = -that.w[id].conf.w+that.conf.vp_pos_ofs;
			that.conf.dnd.maxX = that.vp.clientWidth-that.conf.vp_pos_ofs;
			that.conf.dnd.minY = 0;
			that.conf.dnd.maxY = that.vp.clientHeight-that.conf.vp_pos_ofs;
		}
		
		var k = [
			"MozTransform",
			"WebkitTransform",
			"OTransform",
			"msTransform",
			"transform"
		];
		
		for (var q=0; q<k.length; q++) {
			if (document.documentElement.style[k[q]] != null && that.conf.dnd.tr == null) {
				that.conf.dnd.tr = k[q];
				that.conf.dnd.mode = "tr";
			}
		}
		
		// that.conf.dnd.mode = "def";
		// console.log("dnd ready, mode: "+that.conf.dnd.mode);
		
		if (that.conf.dnd.mode == "tr") that.w[id].win.style[that.conf.dnd.tr] = "translate(0px,0px)";
		
		// init events
		that._dndInitEvents();
		
	}
	
	this._dndOnMouseMove = function(e) {
		
		e = e||event;
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		
		var dnd = that.conf.dnd;
		var w = that.w[dnd.id];
		
		if (!dnd.css) {
			w.win.className += " dhxwin_dnd";
			w.fr_cover.className += " dhxwin_fr_cover_dnd";
			that.vp.className += " dhxwins_vp_dnd";
			dnd.css = true;
		}
		
		var x = e.clientX-dnd.x;
		var y = e.clientY-dnd.y;
		
		dnd.newX = w.conf.x+x;
		dnd.newY = w.conf.y+y;
		
		if (dnd.mode == "tr") {
			
			dnd.newX = Math.min(Math.max(dnd.newX, dnd.minX), dnd.maxX);
			x = dnd.newX-w.conf.x;
			
			dnd.newY = Math.min(Math.max(dnd.newY, dnd.minY), dnd.maxY);
			y = dnd.newY-w.conf.y;
			
			w.win.style[dnd.tr] = "translate("+x+"px,"+y+"px)";
			
		} else {
			
			if (dnd.newX < dnd.minX || dnd.newX > dnd.maxX) {
				dnd.newX = Math.min(Math.max(dnd.newX, dnd.minX), dnd.maxX);
			} else {
				dnd.x = e.clientX;
			}
			
			if (dnd.newY < dnd.minY || dnd.newY > dnd.maxY) {
				dnd.newY = Math.min(Math.max(dnd.newY, dnd.minY), dnd.maxY);
			} else {
				dnd.y = e.clientY;
			}
			
			that._winSetPosition(dnd.id, dnd.newX, dnd.newY);
			
		}
		
		dnd.moved = true;
		
		w = dnd = null;
	}
	
	this._dndOnMouseUp = function() {
		
		if (that.conf.dnd != null) {
			
			var dnd = that.conf.dnd;
			var w = that.w[dnd.id];
			
			if (dnd.newX != null) {
				if (dnd.mode == "tr") {
					that._winSetPosition(dnd.id, dnd.newX, dnd.newY);
					w.win.style[dnd.tr] = "translate(0px,0px)";
				}
			}
			if (dnd.css) {
				w.win.className = String(w.win.className).replace(/\s{0,}dhxwin_dnd/gi,"");
				w.fr_cover.className = String(w.fr_cover.className).replace(/\s{0,}dhxwin_fr_cover_dnd/gi,"");
				that.vp.className = String(that.vp.className).replace(/\s{0,}dhxwins_vp_dnd/gi,"");
			}
			
			that._dndUnloadEvents();
			
			if (dnd.moved) that._callMainEvent("onMoveFinish", dnd.id);
			
			w = dnd = that.conf.dnd = null;
			
		}
	}
	
	this._dndOnSelectStart = function(e) {
		e = e||event;
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		return false;
	}
	
	this._dndInitEvents = function() {
		if (typeof(window.addEventListener) == "function") {
			window.addEventListener("mousemove", this._dndOnMouseMove, false);
			window.addEventListener("mouseup", this._dndOnMouseUp, false);
			window.addEventListener("selectstart", this._dndOnSelectStart, false);
		} else {
			document.body.attachEvent("onmousemove", this._dndOnMouseMove);
			document.body.attachEvent("onmouseup", this._dndOnMouseUp);
			document.body.attachEvent("onselectstart", this._dndOnSelectStart);
		}
	}
	
	this._dndUnloadEvents = function() {
		if (typeof(window.addEventListener) == "function") {
			window.removeEventListener("mousemove", this._dndOnMouseMove, false);
			window.removeEventListener("mouseup", this._dndOnMouseUp, false);
			window.removeEventListener("selectstart", this._dndOnSelectStart, false);
		} else {
			document.body.detachEvent("onmousemove", this._dndOnMouseMove);
			document.body.detachEvent("onmouseup", this._dndOnMouseUp);
			document.body.detachEvent("onselectstart", this._dndOnSelectStart);
		}
	}
	
	this._dndUnloadModule = function() {
		
		this.detachEvent(this.conf.dnd_evid);
		this.conf.dnd_evid = null;
		
		this._dndOnMouseDown = null;
		this._dndOnMouseMove = null;
		this._dndOnMouseUp = null;
		this._dndOnSelectStart = null;
		this._dndInitEvents = null;
		this._dndUnloadEvents = null;
		this._dndInitModule = null;
		this._dndUnloadModule = null;
		
		that = null;
	}
	
	this.conf.dnd_evid = this.attachEvent("_winMouseDown", function(e, data){
		
		if (e.button >= 2) return;
		
		if (!(data.mode == "hdr" && e.type == "mousedown" && this.w[data.id].conf.allow_move == true)) return;
		if (this.w[data.id].conf.maxed && this.w[data.id].conf.max_w == null && this.w[data.id].conf.max_h == null) return;
		
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		this._dndOnMouseDown(e, data.id);
		return false;
		
	});
	
};

