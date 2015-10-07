/*
Product Name: dhtmlxSuite 
Version: 4.1.2 
Edition: Standard 
License: content of this file is covered by GPL. Usage outside GPL terms is prohibited. To obtain Commercial or Enterprise license contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXWindows.prototype._dndInitModule = function() {
	
	var that = this;
	
	this.conf.dnd_tm = null;
	this.conf.dnd_time = 0; // 400 or 0
	
	if (window.navigator.msPointerEnabled == true) {
		this.conf.dnd_evs = {
			start: "MSPointerDown",
			move: "MSPointerMove",
			end: "MSPointerUp"
		};
	} else {
		this.conf.dnd_evs = {
			start: "touchstart",
			move: "touchmove",
			end: "touchend"
		};
	}
	
	
	this._dndOnMouseDown = function(e, id) {
		
		if (that.conf.dblclick_active) return;
		
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		
		
		that.conf.dnd = {
			id: id,
			x: e[that.conf.dnd_ev_prefix+"X"]||e.touches[0][that.conf.dnd_ev_prefix+"X"],
			y: e[that.conf.dnd_ev_prefix+"Y"]||e.touches[0][that.conf.dnd_ev_prefix+"Y"],
			ready: true,
			css: false,
			css_touch: false,
			css_vp: false,
			tr: null,
			mode: "def", //"def" - move win, "tr" - for translate, "rect" - move rectange
			moved: false,
			prevent: false
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
		
		// touch indicator
		if (e.type == that.conf.dnd_evs.start) {
			if (that.conf.dnd.css_touch == false) {
				that.w[id].win.className += " dhxwin_dnd_touch";
				that.conf.dnd.css_touch = true;
			}
			if (that.conf.dnd.css_vp == false) {
				that.vp.className += " dhxwins_vp_dnd";
				that.conf.dnd.css_vp = true;
			}
		} else {
			// init events
			that._dndInitEvents();
		}
	}
	
	this._dndOnMouseMove = function(e) {
		
		// dhtmlx.message({text: "a", expire: 100});
		e = e||event;
		
		var dnd = that.conf.dnd;
		
		var x = (e[that.conf.dnd_ev_prefix+"X"]||e.touches[0][that.conf.dnd_ev_prefix+"X"])-dnd.x;
		var y = (e[that.conf.dnd_ev_prefix+"Y"]||e.touches[0][that.conf.dnd_ev_prefix+"Y"])-dnd.y;
		
		// check if user will move body while timer is active, allow 10px interval from touch point
		if (e.type == that.conf.dnd_evs.move) {
			
			if (dnd.moved != true && (Math.abs(x) > 20 || Math.abs(y) > 20)) {
				
				if (that.conf.dnd_tm != null) {
					window.clearTimeout(that.conf.dnd_tm);
					that.conf.dnd_tm = null;
				}
				window.removeEventListener(that.conf.dnd_evs.start, that._dndOnMouseMove, false);
				//if (window.dhx4.isIE) document.body.style.msTouchAction = "";
				
				return;
			}
		}
		
		
		if (dnd.ready != true) return;
		
		var w = that.w[dnd.id];
		
		// dhtmlx.message({text:x+","+y,expire:100});
		
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		
		
		if (dnd.css != true) {
			if (dnd.css_touch == false) w.win.className += " dhxwin_dnd";
			w.fr_cover.className += " dhxwin_fr_cover_dnd";
			dnd.css = true;
		}
		if (dnd.css_vp != true) {
			that.vp.className += " dhxwins_vp_dnd";
			dnd.css_vp = true;
		}
		
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
				dnd.x = e[that.conf.dnd_ev_prefix+"X"]||e.touches[0][that.conf.dnd_ev_prefix+"X"];
			}
			
			if (dnd.newY < dnd.minY || dnd.newY > dnd.maxY) {
				dnd.newY = Math.min(Math.max(dnd.newY, dnd.minY), dnd.maxY);
			} else {
				dnd.y = e[that.conf.dnd_ev_prefix+"Y"]||e.touches[0][that.conf.dnd_ev_prefix+"Y"];
			}
			
			that._winSetPosition(dnd.id, dnd.newX, dnd.newY);
			
		}
		
		dnd.moved = true;
		
		w = dnd = null;
	}
	
	this._dndOnMouseUp = function(e) {
		
		e = e||event;
		
		if (that.conf.dnd != null) {
			
			var dnd = that.conf.dnd;
			var w = that.w[dnd.id];
			
			if (dnd.newX != null) {
				if (dnd.mode == "tr") {
					that._winSetPosition(dnd.id, dnd.newX, dnd.newY);
					w.win.style[dnd.tr] = "translate(0px,0px)";
				}
			}
			if (dnd.css == true) {
				if (dnd.css_touch == false) w.win.className = String(w.win.className).replace(/\s{0,}dhxwin_dnd/gi,"");
				w.fr_cover.className = String(w.fr_cover.className).replace(/\s{0,}dhxwin_fr_cover_dnd/gi,"");
			}
			if (dnd.css_touch == true) {
				w.win.className = String(w.win.className).replace(/\s{0,}dhxwin_dnd_touch/gi,"");
			}
			if (dnd.css_vp == true) {
				that.vp.className = String(that.vp.className).replace(/\s{0,}dhxwins_vp_dnd/gi,"");
			}
			
			that._dndUnloadEvents();
			
			if (dnd.moved) that._callMainEvent("onMoveFinish", dnd.id);
			
			w = dnd = that.conf.dnd = null;
			
		}
		
		if (window.dhx4.isIE == true && e.type == that.conf.dnd_evs.end && window.navigator.msPointerEnabled == true) {
			document.body.style.msTouchAction = "";
			window.removeEventListener(that.conf.dnd_evs.end, that._dndOnMouseUp, false);
			window.removeEventListener(that.conf.dnd_evs.move, that._dndOnMouseMove, false);
			if (that.conf.dnd_tm != null) window.clearTimeout(that.conf.dnd_tm);
			that.conf.dnd_tm = null;
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
		
		if (e.type == this.conf.dnd_evs.start) {
			
			if (data.mode == "hdr") {
				
				if (this.w[data.id].conf.maxed && this.w[data.id].conf.max_w == null && this.w[data.id].conf.max_h == null) return;
				
				this.conf.dnd_ev_prefix = "page";
				this.conf.dnd = {
					x: e[this.conf.dnd_ev_prefix+"X"]||e.touches[0][this.conf.dnd_ev_prefix+"X"],
					y: e[this.conf.dnd_ev_prefix+"Y"]||e.touches[0][this.conf.dnd_ev_prefix+"Y"]
				};
				if (this.conf.dnd_time < 1) {
					this._dndOnMouseDown(e, data.id);
				} else {
					if (this.conf.dnd_tm != null) window.clearTimeout(this.conf.dnd_tm);
					this.conf.dnd_tm = window.setTimeout(function(){that._dndOnMouseDown(e,data.id);}, this.conf.dnd_time);
				}
				
				if (window.dhx4.isIE == true && window.navigator.msPointerEnabled == true) {
					document.body.style.msTouchAction = "none";
					window.addEventListener(this.conf.dnd_evs.end, this._dndOnMouseUp, false);
				}
				
				window.addEventListener(this.conf.dnd_evs.move, this._dndOnMouseMove, false);
				
			}
			
			return false;
		}
		
		if (e.type == this.conf.dnd_evs.end) {
			
			if (this.conf.dnd_tm != null) {
				window.clearTimeout(this.conf.dnd_tm);
				this.conf.dnd_tm = null;
			}
			
			this._dndOnMouseUp();
			window.removeEventListener(this.conf.dnd_evs.move, this._dndOnMouseMove, false);
			
			return false;
		}
		
		if (e.button >= 2) return;
		
		this.conf.dnd_ev_prefix = "client";
		if (!(data.mode == "hdr" && e.type == "mousedown" && this.w[data.id].conf.allow_move == true)) return;
		if (this.w[data.id].conf.maxed && this.w[data.id].conf.max_w == null && this.w[data.id].conf.max_h == null) return;
		
		if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
		this._dndOnMouseDown(e, data.id);
		return false;
		
	});
	
};

