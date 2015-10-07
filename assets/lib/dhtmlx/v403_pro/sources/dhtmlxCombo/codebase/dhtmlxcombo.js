/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

function dhtmlXCombo(parentId, formName, width, optionType, tabIndex) {
	
	// console.info("allow html in options?");
	// console.info("add placeholder?");
	// console.info("iframe for IE6");
	
	var that = this;
	var apiObj = null;
	var skin = null;
	if (typeof(parentId) == "object" && !parentId.tagName) {
		apiObj = parentId;
		parentId = apiObj.parent;
		width = apiObj.width;
		formName = apiObj.name;
		optionType = apiObj.mode;
		skin = apiObj.skin;
	}
	
	this.cont = (typeof(parentId)=="string"?document.getElementById(parentId):parentId);
	
	this.conf = {
		skin: null,
		form_name: formName||"dhxcombo",
		combo_width: (parseInt(width)||this.cont.offsetWidth||120)-(dhx4.isFF||dhx4.isIE?2:0),
		combo_image: false,
		combo_focus: false,
		opts_type: (typeof(optionType)=="string" && typeof(this.modes[optionType]) !="undefined" ? optionType : "option"),
		opts_count: 8, // count of visible items
		opts_count_min: 3, // min count of visible items (when near screen edge)
		opts_width: null,
		item_h: null,
		list_zi_id: window.dhx4.newId(), // "dhxcombo_list_"+window.dhx4.newId(), // z-index id
		allow_free_text: true,
		allow_empty_value: true, // allow empty value in combo (when free_text not allowed)
		enabled: true,
		// images
		img_path: "",
		img_def: "",
		img_def_dis: true, // if set to true - img_def used for disabled
		// templates
		template: {
			input: "#text#", // template for top-input
			option: "#text#" // template for option text
		},
		// filtering
		f_mode: false, // "start", "between"
		f_url: false,
		f_cache: false,
		f_cache_data: {},
		f_dyn: false,
		f_dyn_end: false, // check if last response have opts
		f_mask: "", // last loaded mask from server
		f_ac: true, // autocomplete if f_mode:"start" filtering mode
		f_ac_text: "",
		f_server_tm: null,
		f_server_last: "",
		// hover-selected
		last_hover: null,
		last_selected: null,
		last_match: null,
		last_text: "",
		last_value: "",
		tm_hover: null,
		tm_confirm_blur: null,
		// nav settings
		clear_click: false,
		clear_blur: false,
		clear_bsp: false,
		clear_key: false,
		// skin params
		sp: {
			dhx_skyblue: {list_ofs: 1},
			dhx_web: {list_ofs: 0},
			dhx_terrace: {list_ofs: 1}
		}
	};
	
	this.conf.combo_image = (this.modes[this.conf.opts_type].image==true);
	
	this.t = {}; // options will here
	
	this.base = document.createElement("DIV");
	//this.base.className = "dhxcombo_"+this.conf.skin;
	
	this.base.style.width = this.conf.combo_width+"px";
	this.base.innerHTML = "<input type='text' class='dhxcombo_input' style='width:"+(this.conf.combo_width-24-(this.conf.combo_image?23:0))+"px;"+(this.conf.combo_image?"margin-left:23px;":"")+"' autocomplete='off'>"+
				"<input type='hidden' value=''>"+ // value
				"<input type='hidden' value='false'>"+ // new_value
				"<div class='dhxcombo_select_button'><div class='dhxcombo_select_img'></div></div>"+
				(this.conf.combo_image?"<div class='dhxcombo_top_image'>"+this.modes[this.conf.opts_type].getTopImage(null, this.conf.enabled)+"</div>":"");
	this.cont.appendChild(this.base);
	
	this.list = document.createElement("DIV");
	//this.list.className = "dhxcombolist_"+this.conf.skin;
	this.list.style.display = "none";
	document.body.insertBefore(this.list, document.body.firstChild);
	
	// apply skin
	this.setSkin(skin||window.dhx4.skin||(typeof(dhtmlx)!="undefined"?dhtmlx.skin:null)||window.dhx4.skinDetect("dhxcombo")||"dhx_skyblue");
	
	this._updateTopImage = function(id) {
		
		if (!this.conf.combo_image) return;
		
		if (id != null) {
			this.base.lastChild.innerHTML = this.t[id].obj.getTopImage(this.t[id].item, this.conf.enabled);
		} else {
			this.base.lastChild.innerHTML = this.modes[this.conf.opts_type].getTopImage(null, this.conf.enabled);
		}
		 
	}
	
	/* filtering */
	
	this._filterOpts = function(hiddenMode) {
		
		if (this.conf.f_server_tm) window.clearTimeout(this.conf.f_server_tm);
		
		var k = String(this.base.firstChild.value).replace(new RegExp(this.conf.f_ac_text+"$","i"),"");
		
		if (this.conf.f_server_last == k.toLowerCase()) {
			this._checkForMatch();
			return;
		}
		
		// check if user-filter specified
		if (this.conf.f_url != null && this.checkEvent("onDynXLS")) {
			this.conf.f_server_last = k.toLowerCase();
			this.callEvent("onDynXLS", [k]);
			return;
		}
		
		if (this.conf.f_url != null) {
			// server
			if (k.length == 0) {
				this.conf.f_server_last = k.toLowerCase();
				this.clearAll();
				return;
			}
			// check cache
			if (this.conf.f_cache == true && this.conf.f_cache_data[k] != null) {
				// load from cache
				this.clearAll();
				this.conf.f_server_last = k.toLowerCase();
				for (var q=0; q<this.conf.f_cache_data[k].data.length; q++) {
					this.load(this.conf.f_cache_data[k].data[q]);
				}
				if (this.conf.f_dyn) {
					this.conf.f_dyn_end = this.conf.f_cache_data[k].dyn_end;
					this.conf.f_mask = this.conf.f_cache_data[k].mask;
				}
				if (hiddenMode !== true) {
					this._showList(true);
					this._checkForMatch();
				}
			} else {
				this.conf.f_server_tm = window.setTimeout(function(){
					that.conf.f_server_last = k.toLowerCase();
					that.conf.f_mask = k;
					var params = "mask="+encodeURIComponent(k);
					if (that.conf.f_dyn) {
						params += "&pos=0";
						that.conf.f_dyn_end = false;
					}
					var callBack = function(r) {
						// cache
						if (that.conf.f_cache) {
							if (!that.conf.f_cache_data[k]) that.conf.f_cache_data[k] = {data:[],dyn_end:false,mask:k};
							that.conf.f_cache_data[k].data.push(r.xmlDoc.responseXML);
						}
						// load opts
						that.clearAll();
						that.load(r.xmlDoc.responseXML);
						// autocomplete if any
						if (that.conf.f_ac && that.conf.f_mode == "start" && that.conf.clear_bsp == false && that.list.firstChild != null) {
							// autocomplete
							var sid = that.list.firstChild._optId;
							var text = String(that.t[sid].obj.getText(that.list.firstChild, true));
							if (String(text).toLowerCase().indexOf(String(k).toLowerCase()) === 0) {
								that.base.firstChild.value = text;
								that._selectRange(k.length, text.length);
							}
						}
						if (hiddenMode !== true) {
							that._showList(true);
							that._checkForMatch();
						}
						callBack = null;
					}
					if (window.dhx4.ajax.method == "post") {
						window.dhx4.ajax.post(that.conf.f_url, params, callBack);
					} else if (window.dhx4.ajax.method == "get") {
						window.dhx4.ajax.get(that.conf.f_url+(String(that.conf.f_url).indexOf("?")>=0?"&":"?")+params, callBack);
					}
				},200);
			}
		} else {
			// client
			this.conf.f_server_last = k.toLowerCase();
			
			var r = (k.length==0?true:new RegExp((this.conf.f_mode=="start"?"^":"")+k,"i"));
			
			var acText = null;
			
			for (var a in this.t) {
				var text = this.t[a].obj.getText(this.t[a].item, true);
				if (r===true || r.test(text) == true) {
					this.t[a].item.style.display = "";
					if (acText == null && k.length > 0) acText = String(this.t[a].obj.getText(this.t[a].item, true));//.replace(new RegExp("^"+k,"i"),"");
				} else {
					this.t[a].item.style.display = "none";
				}
			}
			
			if (this.conf.f_ac && this.conf.f_mode == "start" && this.conf.clear_bsp == false && acText != null) {
				this.conf.f_ac_text = acText.replace(new RegExp("^"+k,"i"),"");
				this.base.firstChild.value = acText;
				this._selectRange(this.conf.f_server_last.length, this.base.firstChild.value.length);
			}
			
			// if any text selected and backspace pressed - clear highlight
			// usefull for "between" mode
			if (this.conf.f_mode == "between" && this.conf.clear_bsp == true) {
				this._checkForMatch(true);
			}
			
			if (hiddenMode !== true) {
				this._showList(true);
				this._checkForMatch();
			}
		}
	}
	
	// data loading
	this._initObj = function(data) {
		if (typeof(data.template) != "undefined") this.setTemplate(data.template);
		this.addOption(data.options);
	}
	
	this._xmlToObj = function(data, selectToObj) {
		
		/*
		xml format:
		
		<complete>
			<option value="xx" selected="1" img_src="icon_url" checked="1">option text</option>
		</complete>
		
		img_src - also add the 4th parameter to combobox constructor - "image"
		checked - checkbox state, for combo with "checkbox" type, 0 by default
		*/
		
		var t = {options:[]};
		
		var root = (selectToObj==true?data:data.getElementsByTagName("complete"));
		
		if (root.length > 0) {
			var nodes = root[0].childNodes;
			for (var q=0; q<nodes.length; q++) {
				if (typeof(nodes[q].tagName) != "undefined") {
					// template
					if (String(nodes[q].tagName).toLowerCase() == "template") {
						for (var w=0; w<nodes[q].childNodes.length; w++) {
							if (nodes[q].childNodes[w].tagName != null) {
								var k = nodes[q].childNodes[w].tagName;
								if (typeof(this.conf.template[k]) != "undefined") {
									this.conf.template[k] = (nodes[q].childNodes[w].firstChild!=null?nodes[q].childNodes[w].firstChild.nodeValue:"");
								}
							}
						}
					}
					// option
					if (String(nodes[q].tagName).toLowerCase() == "option") {
						var optSelected = false;
						if (selectToObj == true) {
							optSelected = (window.dhx4.s2b(nodes[q].selected)||nodes[q].getAttribute("selected")!=null);
						} else {
							optSelected = window.dhx4.s2b(nodes[q].getAttribute("selected"));
						}
						var opt = {
							value: nodes[q].getAttribute("value"),
							text: (nodes[q].firstChild!=null?nodes[q].firstChild.nodeValue:""),
							selected: optSelected,
							checked: window.dhx4.s2b(nodes[q].getAttribute("checked"))
						};
						// images
						for (var a in {img:1,img_dis:1,img_src:1,img_src_dis:1}) {
							if (nodes[q].getAttribute(a) != null) opt[a] = nodes[q].getAttribute(a);
						}
						// text
						for (var w=0; w<nodes[q].childNodes.length; w++) {
							if (nodes[q].childNodes[w].tagName != null && String(nodes[q].childNodes[w].tagName).toLowerCase() == "text") {
								opt.text = {};
								var n = nodes[q].childNodes[w];
								for (var e=0; e<n.childNodes.length; e++) {
									if (n.childNodes[e].tagName != null) {
										opt.text[n.childNodes[e].tagName] = (n.childNodes[e].firstChild!=null?n.childNodes[e].firstChild.nodeValue:"");
									}
								}
							}
						}
						t.options.push(opt);
					}
				}
			}
			root = nodes = null;
		}
		return t;
	}
	
	window.dhx4._enableDataLoading(this, "_initObj", "_xmlToObj", "complete", {data:true});
	window.dhx4._eventable(this);
	
	
	this._getNearItem = function(item, dir) {
		// return nearest next/prev visible item or null
		var sid = null;
		while (item != null) {
			item = item[dir<0?"previousSibling":"nextSibling"];
			if (sid == null && item != null && item.style.display == "" && item._optId != null) {
				sid = item;
				item = null;
			}
		}
		return sid;
	}
	
	this.setName(this.conf.form_name);
	
	// list hightlight/select
	this._doOnListMouseMove = function(e) {
		e = e||event;
		var t = e.target||e.srcElement;
		while (t != null && t != this) {
			if (typeof(t._optId) != "undefined") {
				if (that.conf.tm_hover) window.clearTimeout(that.conf.tm_hover);
				that._setSelected(t._optId);
			}
			t = t.parentNode;
		}
		t = null;
	}
	
	this._doOnListMouseDown = function(e) {
		e = e||event;
		e.cancelBubble = true;
		that.conf.clear_click = true;
		window.setTimeout(function(){that.base.firstChild.focus();},1);
	}
	
	this._doOnListMouseUp = function(e) {
		// select new item
		e = e||event;
		var t = e.target||e.srcElement;
		while (t != null && t != this) {
			if (typeof(t._optId) != "undefined") {
				var r = true;
				if (typeof(that.t[t._optId].obj.optionClick) == "function" && that.t[t._optId].obj.optionClick(t, e, that) !== true) r = false;
				if (r) {
					
					that._setSelected(t._optId, null, true);
					/*
					that._hideList();
					
					that.conf.last_selected = t._optId;
					that.conf.last_text = that.base.firstChild.value = that.t[t._optId].obj.getText(that.t[t._optId].item, true);
					that.conf.f_server_last = that.base.firstChild.value.toLowerCase();
					*/
					that._confirmSelect("click");
				}
			}
			t = t.parentNode;
		}
		t = null;
	}
	
	this._doOnListMouseOut = function(e) {
		// when cursor out of item - clear hover or highlight selected
		if (that.conf.tm_hover) window.clearTimeout(that.conf.tm_hover);
		that.conf.tm_hover = window.setTimeout(function(){
			// select last selected
			var sId = that.conf.last_match||that.conf.last_selected;
			if (that.conf.last_match == null && that.t[sId] != null) {
				// but if no match found, check if entered text is same as in option
				if (that.base.firstChild.value != that.t[sId].obj.getText(that.t[sId].item, true)) sId = null;
			}
			that._setSelected(sId, null, true);
		},1);
	}
	
	this._doOnBaseMouseDown = function(e) {
		
		if (!that.conf.enabled) return;
		
		that.conf.clear_click = true;
		
		e = e||event;
		var t = e.target||e.srcElement;
		if (t != this.firstChild) {
			// focus input if list opened by clicking on arrow
			window.setTimeout(function(){that.base.firstChild.focus();},1);
			
			// top-image click?
			var p = t;
			while (p != this && p != null) {
				if (p == this.lastChild) {
					if (typeof(that.modes[that.conf.opts_type].topImageClick) == "function") {
						var t_id = (that.conf.last_hover||that.conf.last_selected);
						var t_item = (t_id != null?that.t[t_id].item:null);
						if (that.modes[that.conf.opts_type].topImageClick(t_item, that) !== true) {
							t_id = t_item = null;
							return;
						}
					}
					p = null;
				} else {
					p = p.parentNode;
				}
			}
			
		}
		
		if (that._isListVisible()) {
			that._hideList();
		} else {
			if (t != this.firstChild) that.conf.clear_blur = true;
			that._showList();
			that._setSelected(that.conf.last_selected, true, true);
		}
		t = null;
	}
	
	// body click -> hide list if any
	this._doOnBodyMouseDown = function() {
		if (that.conf.clear_click) {
			that.conf.clear_click = false;
			return;
		}
		that._confirmSelect("blur");
	}
	
	// input focus/blur
	this._doOnInputFocus = function() {
		that.conf.clear_blur = false;
		// if forus back to input - cancel confirm (occured when user clicked on arrow while list opened)
		if (that.conf.tm_confirm_blur) window.clearTimeout(that.conf.tm_confirm_blur);
		// ev
		if (that.conf.combo_focus == false) {
			that.conf.combo_focus = true;
			that.callEvent("onFocus",[]);
		}
	}
	this._doOnInputBlur = function() {
		if (that.conf.clear_blur == true) {
			that.conf.clear_blur = false;
			return;
		}
		// start confirm tm
		if (that.conf.tm_confirm_blur) window.clearTimeout(that.conf.tm_confirm_blur);
		that.conf.tm_confirm_blur = window.setTimeout(function(){
			if (that.conf.clear_click == false) {
				// if (that._isListVisible()) that._hideList();
				that._confirmSelect("blur");
				that.conf.combo_focus = false;
				that.callEvent("onBlur",[]);
			}
		},20);
	}
	
	// input events, typing/filtering
	this._doOnInputKeyUp = function(e) {
		
		e = e||event;
		
		if (that.conf.f_mode != false) {
			that.conf.clear_bsp = (e.keyCode==8||e.keyCode==46); // backspace(8) and delete(46)
			that._filterOpts();
			return;
		} else {
			that._checkForMatch();
		}
	}
	
	this._doOnInputKeyDown = function(e) {
		
		e = e||event;
		
		// console.log("onkeypress ", e.keyCode, " ", e.charCode)
		
		// up (38) /down (40)
		if ((e.keyCode == 38 || e.keyCode == 40) && !e.ctrlKey && !e.shiftKey && !e.altKey) {
			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
			e.cancelBubble = true;
			that._keyOnUpDown(e.keyCode==38?-1:1);
		}
		
		// F2
		if (e.keyCode == 113) {
			if (!that._isListVisible()) {
				that._showList();
				if (that.base.firstChild.value == that.conf.last_text) {
					that._setSelected(that.conf.last_selected, true, true);
					that.base.firstChild.value = that.conf.last_text;
					that.conf.f_server_last = that.base.firstChild.value.toLowerCase();
				} else {
					that.conf.f_server_last = that.base.firstChild.value.toLowerCase();
					if (that.conf.f_mode == false) that._checkForMatch();
				}
			} else {
				
			}
		}
		
		// esc
		if (e.keyCode == 27) {
			// cancel operation, restore last value
			if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
			e.cancelBubble = true;
			that._cancelSelect();
		}
		
		// enter
		if (e.keyCode == 13) {
			if (e.preventDefault) e.preventDefault(); // if combo attached to form
			that._confirmSelect("kbd");
		}
		
		that.conf.clear_key = true;
		that.callEvent("onKeyPressed",[e.keyCode||e.charCode]);
	}
	
	this._doOnInputKeyPress = function(e) {
		if (that.conf.clear_key) {
			that.conf.clear_key = false;
			return;
		}
		e = e||event;
		that.callEvent("onKeyPressed",[e.keyCode||e.charCode]);
	}
	
	this._keyOnUpDown = function(dir) {
		
		// select(just hover) next/prev item in a list
		
		var item = null;
		if (this.conf.last_hover) {
			item = this.t[this.conf.last_hover].item;
		} else if (this.conf.last_selected) {
			item = this.t[this.conf.last_selected].item;
		}
		
		if (!item && this._getListVisibleCount() == 0) return;
		if (item != null && item.style.display != "") item = null;
		
		this._showList();
		
		if (item != null) {
			// check if item highlighted
			if (this.t[item._optId].obj.isSelected(item)) item = this._getNearItem(item, dir);
		} else {
			item = this.list.firstChild;
			if (item.style.display != "") item = this._getNearItem(item, 1);
		}
		
		if (item == null) return; // first/last
		
		this._setSelected(item._optId, true, true);
		
		if (this.conf.f_mode == false) {
			this.base.firstChild.value = this.t[item._optId].obj.getText(item, true);
		} else {
			var text = String(this.t[item._optId].obj.getText(item, true));
			if (this.conf.f_mode == "start" && this.conf.f_ac == true) {
				if (text.toLowerCase().indexOf(this.conf.f_server_last) === 0) {
					// try to find match and select part of text
					this.conf.f_ac_text = text.substring(this.conf.f_server_last.length, text.length);
					this.base.firstChild.value = text;
					this._selectRange(this.conf.f_server_last.length, this.base.firstChild.value.length);
				} else {
					// insert all text and select
					this.base.firstChild.value = text;
					this.conf.f_server_last = this.base.firstChild.value.toLowerCase();
					this._selectRange(0, this.base.firstChild.value.length);
				}
			} else {
				// just insert text into main input
				this.base.firstChild.value = text;
				this.conf.f_server_last = this.base.firstChild.value.toLowerCase();
			}
		}
		
		//
		item = null;
	}
	
	this.conf.evs_nodes = [
		{node: document.body, evs: {mousedown: "_doOnBodyMouseDown"}},
		{node: this.base, evs: {mousedown: "_doOnBaseMouseDown"}},
		{node: this.base.firstChild, evs: {keyup: "_doOnInputKeyUp", keydown: "_doOnInputKeyDown", keypress: "_doOnInputKeyPress", focus: "_doOnInputFocus", blur: "_doOnInputBlur"}},
		{node: this.list, evs: {mousemove: "_doOnListMouseMove", mousedown: "_doOnListMouseDown", mouseup: "_doOnListMouseUp", mouseout: "_doOnListMouseOut"}}
	];
	for (var q=0; q<this.conf.evs_nodes.length; q++) {
		for (var a in this.conf.evs_nodes[q].evs) {
			if (window.addEventListener) {
				this.conf.evs_nodes[q].node.addEventListener(a, this[this.conf.evs_nodes[q].evs[a]], false);
			} else {
				this.conf.evs_nodes[q].node.attachEvent("on"+a, this[this.conf.evs_nodes[q].evs[a]]);
			}
		}
	}
	
	
	this.unload = function() {
		
		// remove options
		this.clearAll();
		this.t = null;
		
		// detach dom events
		for (var q=0; q<this.conf.evs_nodes.length; q++) {
			for (var a in this.conf.evs_nodes[q].evs) {
				if (window.addEventListener) {
					this.conf.evs_nodes[q].node.removeEventListener(a, this[this.conf.evs_nodes[q].evs[a]], false);
				} else {
					this.conf.evs_nodes[q].node.detachEvent("on"+a, this[this.conf.evs_nodes[q].evs[a]]);
				}
				this.conf.evs_nodes[q].evs[a] = null;
				delete this.conf.evs_nodes[q].evs[a];
			}
			this.conf.evs_nodes[q].node = null;
			this.conf.evs_nodes[q].evs = null;
			delete this.conf.evs_nodes[q].node;
			delete this.conf.evs_nodes[q].evs;
			this.conf.evs_nodes[q] = null;
		}
		
		window.dhx4._eventable(this, "clear");
		window.dhx4._enableDataLoading(this, null, null, null, "clear");
		
		this.DOMelem_input = this.DOMelem_button = this.DOMlist = null;
		
		for (var a in this.conf) {
			this.conf[a] = null;
			delete this.conf[a];
		}
		this.conf = null;
		
		this.base.parentNode.removeChild(this.base);
		this.list.parentNode.removeChild(this.list);
		this.base = this.list = this.cont = null;
		
		this.modes = null;
		
		for (var a in this) {
			if (typeof(this[a]) == "function") this[a] = null;
		}
		
		that = null;
		
	};
	
	// DEPRECATED props
	this.DOMelem_input = this.base.firstChild; // 3.6 compat, use getInput()
	this.DOMelem_button = this.base.childNodes[this.base.childNodes.length-(this.conf.combo_image?2:1)]; // 3.6 compat, use getButton()
	this.DOMlist = this.list; // 3.6 compat, use getList()
	this.DOMelem = this.base; // 3.6 compat, use getBase()
	this.DOMParent = parentId; // 3.0 compat, use getParent()
	parentId = null;
	
	// check for object api init details
	if (apiObj != null) {
		// filter
		if (apiObj.filter != null) {
			if (typeof(apiObj.filter) == "string") {
				this.enableFilteringMode(true, apiObj.filter, window.dhx4.s2b(apiObj.filter_cache), window.dhx4.s2b(apiObj.filter_sub_load));
			} else {
				this.enableFilteringMode(true);
			}
		}
		// imgs
		if (apiObj.image_path != null) this.setImagePath(apiObj.image_path);
		if (apiObj.default_image != null || apiObj.default_image_dis != null) this.setDefaultImage(apiObj.default_image, apiObj.default_image_dis);
		// opts
		if (apiObj.items || apiObj.options) this.addOption(apiObj.items||apiObj.options);
		if (apiObj.xml || apiObj.json) this.load(apiObj.xml||apiObj.json);
		// misc
		if (typeof(apiObj.readonly) != "undefined") this.readonly(apiObj.readonly);
		//
		apiObj = null;
	}
	
	return this;
	
};

function dhtmlXComboFromSelect(selectId) {
	
	// <select mode="checkbox">
	
	if (typeof(selectId) == "string") selectId = document.getElementById(selectId);
	
	// collect params
	var comboWidth = selectId.offsetWidth;
	var formName = selectId.getAttribute("name")||null;
	
	// add node
	var comboNode = document.createElement("SPAN");
	selectId.parentNode.insertBefore(comboNode, selectId);
	
	// combo mode
	var comboMode = selectId.getAttribute("mode")||selectId.getAttribute("opt_type")||"option";
	
	// init combo
	var combo = new dhtmlXCombo(comboNode, formName, comboWidth, comboMode);
	comboNode = null;
	
	var imagePath = selectId.getAttribute("imagePath");
	if (imagePath) combo.setImagePath(imagePath);
	
	var defImg = selectId.getAttribute("defaultImage");
	var defImgDis = selectId.getAttribute("defaultImageDis");
	if (window.dhx4.s2b(defImgDis) == true) defImgDis = true;
	if (defImg != null || defImgDis != null) combo.setDefaultImage(defImg, defImgDis);
	
	// options
	var opts = combo._xmlToObj([selectId], true);
	if (opts.options.length > 0) combo.addOption(opts.options);
	opts = null;
	
	// remove select
	selectId.parentNode.removeChild(selectId);
	selectId = null;
	
	return combo;
};

/* common funcs */
dhtmlXCombo.prototype.setName = function(name) { // change name for form
	this.conf.form_name = name;
	this.base.childNodes[1].name = name;
	this.base.childNodes[2].name = name+"_new_value";
};

dhtmlXCombo.prototype.readonly = function(mode) { // enable/disable readonly mode
	if (window.dhx4.s2b(mode)) {
		this.base.firstChild.setAttribute("readOnly", "true");
	} else {
		this.base.firstChild.removeAttribute("readOnly");
	}
};

dhtmlXCombo.prototype.setPlaceholder = function(text) { // new in 4.0, limited support
	if (typeof(text) == "undefined" || text == null) text = "";
	this.base.firstChild.setAttribute("placeholder", String(text));
};

dhtmlXCombo.prototype.setTemplate = function(tpl) {
	for (var a in tpl) {
		if (typeof(this.conf.template[a]) != "undefined") this.conf.template[a] = String(tpl[a]);
	};
	// template changed, update combo text and update rendered options
	for (var a in this.t) {
		this.t[a].obj.setText(this.t[a].item, this.t[a].item._conf.text);
	};
	this._confirmSelect();
};

dhtmlXCombo.prototype.setSkin = function(skin) {
	if (skin == this.conf.skin) return;
	this.conf.skin = skin;
	this.base.className = "dhxcombo_"+this.conf.skin+(this.conf.enabled?"":" dhxcombo_disabled");
	this.list.className = "dhxcombolist_"+this.conf.skin;
};

dhtmlXCombo.prototype.getInput = function() { // returns input, new in 4.0
	return this.base.firstChild;
};
dhtmlXCombo.prototype.getButton = function() { // returns button, new in 4.0
	return this.base.childNodes[this.base.childNodes.length-(this.conf.combo_image?2:1)];
};
dhtmlXCombo.prototype.getList = function() { // do we need it?
	return this.list;
};
dhtmlXCombo.prototype.getBase = function() { // do we need it?
	return this.base;
};

dhtmlXCombo.prototype.getParent = function() { // do we need it?
	return this.DOMParent;
};

dhtmlXCombo.prototype.forEachOption = function(handler) { // iterator, new in 4.0
	for (var q=0; q<this.list.childNodes.length; q++) {
		handler.apply(window, [this._getOption(this.list.childNodes[q]._optId, q)]);
	}
};

dhtmlXCombo.prototype.setFocus = function() {
	if (this.conf.enabled) this.base.firstChild.focus();
};
dhtmlXCombo.prototype.setFontSize = function(sizeInp, sizeList) {
	// "11px" or" "0.9em"
	if (sizeInp != null) this.base.firstChild.style.fontSize = sizeInp;
	if (sizeList != null) this.list.style.fontSize = sizeList;
};

/* options */
dhtmlXCombo.prototype.getOption = function(value) { // option by value
	var id = null;
	var index = null;
	for (var q=0; q<this.list.childNodes.length; q++) {
		if (id == null) {
			var a = this.list.childNodes[q]._optId;
			if (this.t[a].obj.getValue(this.t[a].item) == value) { id = a; index = q; }
		}
	}
	return (id==null?null:this._getOption(id, index));
};

dhtmlXCombo.prototype.getOptionByIndex = function(index) { // option by index
	if (index < 0) return null;
	if (this.list.childNodes[index] == null) return null;
	return this._getOption(this.list.childNodes[index]._optId, index);
};

dhtmlXCombo.prototype.getOptionByLabel = function(text) { // rename to getOptionByText ?
	// option by label
	var id = null;
	var index = null;
	for (var q=0; q<this.list.childNodes.length; q++) {
		if (id == null) {
			var a = this.list.childNodes[q]._optId;
			if (this.t[a].obj.getText(this.t[a].item, true) == text) { id = a; index = q; }
		}
	}
	return (id==null?null:this._getOption(id, index));
};

dhtmlXCombo.prototype.getSelectedIndex = function() { // gets index of selected option
	return this._getOptionProp(this.conf.last_selected, "index", -1);
};

dhtmlXCombo.prototype.getSelectedText = function() { // gets text of selected option
	return this._getOptionProp(this.conf.last_selected, "text", "");
};

dhtmlXCombo.prototype.getSelectedValue = function() { // gets value of selected item
	return this._getOptionProp(this.conf.last_selected, "value", null);
};

dhtmlXCombo.prototype.getActualValue = function() { // gets value which will be sent with form
	return this.base.childNodes[1].value;
};
dhtmlXCombo.prototype.getComboText = function() { // gets current text in combobox
	return this.base.childNodes[0].value;
};

dhtmlXCombo.prototype.getIndexByValue = function(value) { // returns index of item by value
	var t = this.getOption(value);
	return (t!=null?t.index:-1);
};

dhtmlXCombo.prototype.setComboText = function(text) {
	// sets text in combobox, only text
	this.conf.last_text = this.base.firstChild.value = text;
	this.conf.f_server_last = this.base.firstChild.value.toLowerCase();
};

dhtmlXCombo.prototype.setComboValue = function(value) {
	// sets text in combobox, only text
	var t = this.getOption(value);
	if (t != null) {
		this.selectOption(t.index);
	} else {
		this.conf.last_value = value;
		this.base.childNodes[1].value = this.conf.last_value;
		this.base.childNodes[2].value = "true";
	}
};

dhtmlXCombo.prototype.selectOption = function(index, filter, conf) { // selects option
	if (index < 0 || index >= this.list.childNodes.length) return;
	var id = this.list.childNodes[index]._optId;
	this._setSelected(id, this._isListVisible(), true);
	this._confirmSelect("script");
};

dhtmlXCombo.prototype.unSelectOption = function() {
	// unselects option
};

dhtmlXCombo.prototype.confirmValue = function() {
	this._confirmSelect("script");
};

/* enable/disable */
dhtmlXCombo.prototype.enable = function(mode) {
	
	mode = (typeof(mode)=="undefined"?true:window.dhx4.s2b(mode));
	if (this.conf.enabled == mode) return;
	
	this.conf.enabled = mode;
	
	if (mode) {
		this.base.className = "dhxcombo_"+this.conf.skin;
		this.base.firstChild.removeAttribute("disabled");
	} else {
		this._hideList();
		this.base.className = "dhxcombo_"+this.conf.skin+" dhxcombo_disabled";
		this.base.firstChild.setAttribute("disabled","true");
	}
	
	// update disabled image if any
	this._updateTopImage(this.conf.last_selected);
};

dhtmlXCombo.prototype.disable = function(mode) {
	mode = (typeof(mode)=="undefined"?true:window.dhx4.s2b(mode));
	this.enable(!mode);
};

dhtmlXCombo.prototype.isEnabled = function() {
	return (this.conf.enabled==true);
};

/* visibility */
dhtmlXCombo.prototype.show = function(mode) {
	if (typeof(mode) == "undefined") mode = true; else mode = window.dhx4.s2b(mode);
	this.base.style.display = (mode==true?"":"none");
};

dhtmlXCombo.prototype.hide = function(mode) {
	if (typeof(mode) == "undefined") mode = true;
	this.show(!mode);
};

dhtmlXCombo.prototype.isVisible = function() {
	return (this.base.style.display=="");
};


/* filtering */
dhtmlXCombo.prototype.enableFilteringMode = function(mode, url, cache, dyn) {
	if (mode == true || mode == "between") {
		this.conf.f_mode = (mode==true?"start":"between");
		if (url != null) {
			this.conf.f_url = url;
			this.conf.f_cache = window.dhx4.s2b(cache);
			this.conf.f_dyn = window.dhx4.s2b(dyn);
		} else {
			this.conf.f_url = null;
			this.conf.f_cache = false;
			this.conf.f_dyn = false;
		}
	} else {
		this.conf.f_mode = false;
		this.conf.f_url = null;
		this.conf.f_cache = false;
		this.conf.f_dyn = false;
	}
};

dhtmlXCombo.prototype.filter = function(handler) { // new in 4.0
	for (var q=0; q<this.list.childNodes.length; q++) {
		var k = handler.apply(window, [this._getOption(this.list.childNodes[q]._optId,q)]);
		this.list.childNodes[q].style.display = (k===true?"":"none");
	}
};

dhtmlXCombo.prototype.sort = function(mode) { // new in 4.0
	var r = [];
	for (var q=0; q<this.list.childNodes.length; q++) {
		var id = this.list.childNodes[q]._optId;
		r.push([id, this._getOption(id, q)]);
	}
	// sort
	if (mode == "asc" || mode == "desc") {
		k = true;
		r.sort(function(a,b){
			a = a[1].text_option.toLowerCase();
			b = b[1].text_option.toLowerCase();
			var r = (mode=="asc"?1:-1);
			return (a>b?r:-1*r);
		});
	} else if (typeof(mode) == "function" || typeof(window[mode]) == "function") {
		if (typeof(window[mode]) == "function") mode = window[mode];
		r.sort(function(a,b){
			return mode.apply(window, [a[1],b[1]]);
		});
	}
	// reorder
	while (this.list.childNodes.length > 0) this.list.removeChild(this.list.lastChild);
	for (var q=0; q<r.length; q++) this.list.appendChild(this.t[r[q][0]].item);
};

dhtmlXCombo.prototype.enableAutocomplete = function(mode) { // autocomplete for f_mode:start, enabled by default
	if (typeof(mode) == "undefined") mode = true; else mode = window.dhx4.s2b(mode);
	this.conf.f_ac = mode;
};
dhtmlXCombo.prototype.disableAutocomplete = function(mode) {
	if (typeof(mode) == "undefined") mode = true; else mode = window.dhx4.s2b(mode);
	this.enableAutocomplete(!mode);
};

dhtmlXCombo.prototype.allowFreeText = function(mode) { // new in 4.0
	this.conf.allow_free_text = (typeof(mode)=="undefined"?true:window.dhx4.s2b(mode));
};

dhtmlXCombo.prototype._checkForMatch = function(forceClear) {
	// check if text matched to any opt_text for opt_hover while user entered text
	var k = window.dhx4.trim(this.base.firstChild.value).toLowerCase();
	var id = null;
	var item = this.list.firstChild;
	while (item != null) {
		if (item.style.display == "" && item._optId != null) {
			var text = window.dhx4.trim(this.t[item._optId].obj.getText(item, true)).toLowerCase();
			if (k == text) {
				id = item._optId;
				item = null;
			}
		}
		if (item != null) item = item.nextSibling;
	}
	// match found, hover item
	if (this.conf.last_match == null) {
		if (id != null) {
			// 1st match
			this._setSelected(id, true, true);
			this.conf.last_match = id;
		} else {
			// nothing found
			// clear current selection if any
			if (this.conf.f_mode != "between" || forceClear == true) {
				this._setSelected(null, true, true);
				this.conf.last_match = null;
			}
		}
	} else {
		if (id != null) {
			// another match, check if same or new
			if (id != this.conf.last_match) {
				this._setSelected(id, true, true);
				this.conf.last_match = id;
			}
		} else {
			// nothing found clear last match if hovered and selection not changed
			this._setSelected(null, true, true);
			this.conf.last_match = null;
		}
	}
	
};

dhtmlXCombo.prototype._selectRange = function(from, to) {
	if (this.conf.combo_focus == true) window.dhx4.selectTextRange(this.base.firstChild, from, to);
};

/* show/hide select list */
dhtmlXCombo.prototype.openSelect = function() { // opens list of options
	if (!this._isListVisible()) this._showList();
};

dhtmlXCombo.prototype.closeAll = function() {
	this._hideList();
};

dhtmlXCombo.prototype._showList = function(autoHide) {
	
	if (this._getListVisibleCount() == 0) {
		if (autoHide && this._isListVisible()) this._hideList();
		return;
	}
	
	if (this._isListVisible()) {
		this._checkListHeight();
		return;
	}
	
	this.list.style.zIndex = window.dhx4.zim.reserve(this.conf.list_zi_id); // get new z-index
	
	this.list.style.visibility = "hidden";
	this.list.style.display = "";
	
	// position
	this.list.style.width = Math.max(this.conf.opts_width||0, this.conf.combo_width)+"px";
	this.list.style.top = window.dhx4.absTop(this.base)+this.base.offsetHeight-1+"px";
	this.list.style.left = window.dhx4.absLeft(this.base)+"px";
	
	// height
	this._checkListHeight();
	
	// check bottom overlay
	this.list.style.visibility = "visible";
	
	this.callEvent("onOpen",[]);
	
};

dhtmlXCombo.prototype._hideList = function() {
	
	if (!this._isListVisible()) return;
	
	window.dhx4.zim.clear(this.conf.list_zi_id); // clear z-index
	this.list.style.display = "none";
	this.conf.clear_click = false;
	
	this.callEvent("onClose",[]);
	
};

dhtmlXCombo.prototype._isListVisible = function() {
	return (this.list.style.display=="");
};

dhtmlXCombo.prototype._getListVisibleCount = function() {
	var k = 0;
	for (var q=0; q<this.list.childNodes.length; q++) k += (this.list.childNodes[q].style.display==""?1:0);
	return k;
};

dhtmlXCombo.prototype._checkListHeight = function() {
	
	if (!this._isListVisible()) return;
	
	if (this.conf.item_h == null) {
		var item = this.list.firstChild;
		while (item != null) {
			if (item.style.display == "") {
				this.conf.item_h = item.offsetHeight;
				item = null;
			} else {
				item = item.nextSibling;
			}
		}
		item = null;
	}
	
	var s = window.dhx4.screenDim();
	var by = window.dhx4.absTop(this.base);
	var bh = this.base.offsetHeight;
	
	var onTop = Math.max(0, Math.floor((by-s.top)/this.conf.item_h));
	var onBottom = Math.max(0, Math.floor((s.bottom-(by+bh))/this.conf.item_h));
	
	var itemsCount = this._getListVisibleCount();
	
	// top/bottom detect
	if (onBottom < Math.min(this.conf.opts_count_min, itemsCount) && onTop > onBottom) onBottom = null;
	
	var itemsToShow = Math.min((onBottom==null?onTop:onBottom), this.conf.opts_count, itemsCount);
	var h = (itemsToShow<itemsCount?(itemsToShow*this.conf.item_h)+"px":"");
	
	var ofs = this.conf.sp[this.conf.skin].list_ofs;
	
	this.list.style.height = h;
	this.list.style.top = (onBottom==null?by-this.list.offsetHeight+ofs:by+bh-ofs)+"px";
	
};

dhtmlXCombo.prototype._scrollToItem = function(id) {
	
	var y1 = this.t[id].item.offsetTop;
	var y2 = y1+this.t[id].item.offsetHeight;
	var a1 = this.list.scrollTop;
	var a2 = a1+this.list.clientHeight;
	
	if (y1 < a1) {
		// on top
		this.list.scrollTop = y1;
	} else if (y2 > a2) {
		// on bottom
		this.list.scrollTop = y2-this.list.clientHeight;
	}
	
};

/* in-list selection/highlighting */
dhtmlXCombo.prototype._setSelected = function(id, scrollToItem, updateImg) {
	
	if (updateImg) this._updateTopImage(id);
	
	if (id != null && this.conf.last_hover == id) {
		if (scrollToItem) this._scrollToItem(id);
		return;
	}
	
	if (this.conf.last_hover != null) {
		this.t[this.conf.last_hover].obj.setSelected(this.t[this.conf.last_hover].item, false);
		this.conf.last_hover = null;
		if (id == null) this.callEvent("onSelectionChange", []);
	}
	
	if (id != null) {
		
		this.t[id].obj.setSelected(this.t[id].item, true);
		this.conf.last_hover = id;
		
		this.callEvent("onSelectionChange", []);
		
		// last item selected, load mode options
		if (this.t[id].item == this.t[id].item.parentNode.lastChild && this.conf.f_url != null && this.conf.f_dyn == true && !this.conf.f_dyn_end) {
			
			var params = "mask="+encodeURIComponent(this.conf.f_mask)+"&pos="+this.list.childNodes.length;
			var t = this;
			var callBack = function(r){
				
				// cache
				if (t.conf.f_cache) t.conf.f_cache_data[t.conf.f_mask].data.push(r.xmlDoc.responseXML);
				var k = t.list.childNodes.length;
				t.load(r.xmlDoc.responseXML);
				// fix list height if any?
				
				// if no more opts left on server, stop dyn requests
				if (k == t.list.childNodes.length) {
					t.conf.f_dyn_end = true;
					if (t.conf.f_cache) t.conf.f_cache_data[t.conf.f_mask].dyn_end = true;
				}
				callBack = t = null;
			}
			if (window.dhx4.ajax.method == "post") {
				window.dhx4.ajax.post(this.conf.f_url, params, callBack);
			} else if (window.dhx4.ajax.method == "get") {
				window.dhx4.ajax.get(this.conf.f_url+(String(this.conf.f_url).indexOf("?")>=0?"&":"?")+params, callBack);
			}
		}
		
		if (scrollToItem) this._scrollToItem(id);
		
	}
	
};

/* add / remove options */
dhtmlXCombo.prototype.addOption = function(value, text, css, img, selected) {
	
	// selected added in 4.0
	
	/*
	
	single option, 4 params
	z.addOption(value, text, css, img_src);
	value, text, css (css string attached to the option, optional), img_src (path to the option icon image, just for "image" combo type)
	
	several options, array of array (in this case you can't use 4th parameter img_src - improve?)
	z.addOption([["a","option A", "color:red;"],[],[],...]);
	
	several options, as an array of objects (you can use 4 parameters)
	z.addOption([{value: "a", text: "option A", img_src: "../images/blue.gif", css:"color:red;"},{},{}...]);
	
	*/
	
	var toSelect = null;
	
	if (!(value instanceof Array)) {
		// single option
		var id = this._renderOption({value:value, text:text, css:css, img:img});
		if (toSelect == null && window.dhx4.s2b(selected) == true) toSelect = id;
		
	} else {
		// array with opts
		for (var q=0; q<value.length; q++) {
			if (value[q] instanceof Array) {
				id = this._renderOption({value:value[q][0], text:value[q][1], css:value[q][2], img:value[q][3]});
				if (toSelect == null && window.dhx4.s2b(value[q][4]) == true) toSelect = id;
			} else {
				var id = this._renderOption(value[q]);
				if (toSelect == null && window.dhx4.s2b(value[q].selected) == true) toSelect = id;
			}
		}
	}
	
	if (toSelect != null) {
		this._setSelected(toSelect, this._isListVisible(), true);
		this._confirmSelect("onInit");
	}
};

dhtmlXCombo.prototype.updateOption = function(oldValue, newValue, newText, newCss) {
	var id = this._getOptionId(oldValue);
	if (id == null) return;
	this.t[id].obj.update(this.t[id].item, {value: newValue, text: newText, css: newCss});
	if (this.conf.last_selected == id) {
		this.conf.last_text = this.base.firstChild.value = this.t[id].obj.getText(this.t[id].item, true);
		this.conf.f_server_last = this.base.firstChild.value.toLowerCase();
	}
};

dhtmlXCombo.prototype.deleteOption = function(value) { // deletes option by value
	
	for (var a in this.t) {
		var v = this.t[a].obj.getValue(this.t[a].item);
		if (v == value) this._removeOption(a);
	}
	
	if (this._isListVisible()) this._showList(true); // resize if any or hide if no more items left
	
};

dhtmlXCombo.prototype.clearAll = function() { // remove all options
	
	for (var a in this.t) this._removeOption(a);
	
	// props
	if (this.conf.tm_hover) window.clearTimeout(this.conf.tm_hover);
	this.conf.last_hover = null;
	this.conf.last_selected = null;
	
	this.list.scrollTop = 0;
	this._hideList();
	
};

dhtmlXCombo.prototype._renderOption = function(data) {
	
	var id = window.dhx4.newId();
	var item = document.createElement("DIV");
	
	item._optId = id;
	item._tpl = this.conf.template;
	
	// wrapper for img_src/img_src_dis
	if (typeof(data.img) == "undefined" && typeof(data.img_src) != "undefined") {
		data.img = data.img_src;
		delete data.img_src;
	}
	if (typeof(data.img_dis) == "undefined" && typeof(data.img_src_dis) != "undefined") {
		data.img_dis = data.img_src_dis;
		delete data.img_src_dis;
	}
	
	data.img_path = this.conf.img_path;
	data.img_def = this.conf.img_def;
	data.img_def_dis = this.conf.img_def_dis;
	
	this.list.appendChild(item);
	
	this.t[item._optId] = {
		obj: this.modes[this.conf.opts_type].render(item, data),
		item: item,
		conf: {
			type: this.conf.opts_type
		}
	};
	item = null;
	
	return id;
};

dhtmlXCombo.prototype._removeOption = function(id) {
	this.t[id].obj.destruct(this.t[id].item);
	this.t[id].obj = null;
	this.t[id].item.parentNode.removeChild(this.t[id].item);
	this.t[id].item = null;
	this.t[id].conf = null;
	this.t[id] = null;
	delete this.t[id];
	
	if (this.conf.last_hover == id) this.conf.last_hover = null;
	if (this.conf.last_selected == id) {
		this.conf.last_selected = null;
		this._confirmSelect("onDelete");
	}
};

dhtmlXCombo.prototype._confirmSelect = function(mode) {
	
	var wasChanged = false;
	
	if (this.conf.f_server_tm) window.clearTimeout(this.conf.f_server_tm);
	
	// confirm selection
	// if any item hovered - select, if not - just apply entered value
	if (this.conf.last_hover != null) {
		// select value
		wasChanged = wasChanged||(this.conf.last_value != this._getOptionValue(this.conf.last_hover));
		this.conf.last_match = this.conf.last_selected = this.conf.last_hover;
		this.conf.last_value = this._getOptionValue(this.conf.last_selected);
		this.conf.last_text = this.base.firstChild.value = this.t[this.conf.last_selected].obj.getText(this.t[this.conf.last_selected].item, true);
		this.conf.f_server_last = this.base.firstChild.value.toLowerCase();
		// inputs
		this.base.childNodes[1].value = this.conf.last_value;
		this.base.childNodes[2].value = "false";
	} else {
		// just a text,
		// check if free text allowed
		if (this.conf.allow_free_text || (this.base.firstChild.value == "" && this.conf.allow_empty_value)) {
			wasChanged = wasChanged||(this.conf.last_text != this.base.firstChild.value);
			this.conf.last_match = this.conf.last_value = this.conf.last_selected = null;
			this.conf.last_text = this.base.firstChild.value;
			this.conf.f_server_last = this.base.firstChild.value.toLowerCase();
			// inputs
			this.base.childNodes[1].value = this.conf.last_text;
			this.base.childNodes[2].value = "true";
		} else {
			this._cancelSelect();
			this._updateTopImage(this.conf.last_selected);
			return;
		}
	}
	
	if (this.conf.f_ac && this.conf.f_mode == "start") {
		this.conf.f_ac_text = "";
		if (mode != "blur") {
			this._selectRange(this.base.firstChild.value.length, this.base.firstChild.value.length);
		}
	}
	
	this._hideList();
	
	if (wasChanged == true && mode != "onInit" && mode != "onDelete") {
		this.callEvent("onChange", [this.conf.last_value, this.conf.last_text]);
	}
	
};

dhtmlXCombo.prototype._cancelSelect = function() {
	
	this._hideList();
	this.base.firstChild.value = this.conf.last_text;
	//this.conf.f_server_last = this.base.firstChild.value.toLowerCase();
	
	// restore filters if any
	if (this.conf.f_mode != false) {
		this._filterOpts(true);
	}
	
};


/* option object operations */
dhtmlXCombo.prototype._getOption = function(id, index) {
	
	if (!this.t[id]) return null;
	
	// autodetect index if any
	if (typeof(index) == "undefined") index = -1;
	if (index < 0) {
		for (var q=0; q<this.list.childNodes.length; q++) {
			if (index < 0 && this.list.childNodes[q]._optId == id) index = q;
		}
	}
	
	// comon data
	var t = {
		value: this.t[id].obj.getValue(this.t[id].item),
		text: this.t[id].obj.getText(this.t[id].item),
		text_input: this.t[id].obj.getText(this.t[id].item, true),
		text_option: this.t[id].obj.getText(this.t[id].item, null, true),
		css: this.t[id].obj.getCss(this.t[id].item),
		selected: (id==this.conf.last_selected),
		index: index
	};
	
	// extra data if any, for example "checked" for checkbox
	if (typeof(this.t[id].obj.getExtraData) == "function") {
		var k = this.t[id].obj.getExtraData(this.t[id].item);
		for (var a in k) { if (typeof(t[a]) == "undefined") t[a] = k[a]; }
	}
	
	return t;
};

dhtmlXCombo.prototype._getOptionProp = function(id, prop, def) { // get any property of any option
	if (id != null) {
		var t = this._getOption(id);
		if (t != null) return t[prop];
	}
	return def;
};
dhtmlXCombo.prototype._getOptionId = function(value) {
	var id = null;
	for (var q=0; q<this.list.childNodes.length; q++) {
		if (id == null) {
			var p = this.list.childNodes[q]._optId;
			if (value == this.t[p].obj.getValue(this.t[p].item)) id = p;
		}
	}
	return id;
};
dhtmlXCombo.prototype._getOptionValue = function(id) {
	return this._getOptionProp(id, "value", null);
};


dhtmlXCombo.prototype.setSize = function(width) { // changes control size
	this.conf.combo_width = parseInt(width);
	this.base.style.width = this.conf.combo_width+"px";
	this.base.firstChild.style.width = (this.conf.combo_width-24-(this.conf.combo_image?23:0))+"px";
	this.base.firstChild.style.marginLeft = (this.conf.combo_image?"23px":"0px");
};

dhtmlXCombo.prototype.setOptionWidth = function(w) { // sets width of combo list
	this.conf.opts_width = (parseInt(w)||null);
};

/****************************************************************************************************************************************************************************************************************/

/* options */
dhtmlXCombo.prototype.modes = {}; // option types

dhtmlXCombo.prototype.doWithItem = function(index, method, param1, param2) { // wrapper to perrofm opt operations from combo
	
	// get option inner id
	var id = (index >= 0 && index < this.list.childNodes.length ? this.list.childNodes[index]._optId : null);
	if (id == null) return null; // opt no found
	if (typeof(this.t[id].obj[method]) != "function") return null; // function not found
	
	// generate params
	var params = [this.t[id].item];
	for (var q=2; q<arguments.length; q++) params.push(arguments[q]);
	
	// call method
	return this.t[id].obj[method].apply(this.t[id].obj, params);
	
};

function dhtmlXComboExtend(to, from) {
	for (var a in dhtmlXCombo.prototype.modes[from]) {
		if (typeof(dhtmlXCombo.prototype.modes[to][a]) == "undefined") {
			dhtmlXCombo.prototype.modes[to][a] = dhtmlXCombo.prototype.modes[from][a];
		}
	};
};
/****************************************************************************************************************************************************************************************************************/

dhtmlXCombo.prototype.modes.option = {
	
	image: false, // top-level image prev-to input
	option_css: "dhxcombo_option_text",
	render: function(item, data) {
		
		item._conf = {value: data.value, css: ""};
		
		item.className = "dhxcombo_option";
		item.innerHTML = "<div class='"+this.option_css+"'>&nbsp;</div>";
		
		if (data.css != null) {
			item.lastChild.style.cssText = data.css;
			item._conf.css = data.css;
		}
		
		this.setText(item, data.text);
		
		return this;
	},
	
	destruct: function(item) {
		item._conf = null;
	},
	
	update: function(item, data) {
		item._conf.value = data.value;
		item._conf.css = data.css;
		item.lastChild.style.cssText = data.css;
		this.setText(item, data.text);
	},
	
	setText: function(item, text) {
		item._conf.text = text;
		var t = (typeof(text) == "object" ? window.dhx4.template(item._tpl.option, item._conf.text, true) : window.dhx4.trim(item._conf.text||""));
		item.lastChild.innerHTML = (t.length==0?"&nbsp;":t);
	},
	
	getText: function(item, asStringInput, asStringOption) {
		if (window.dhx4.s2b(asStringInput) && typeof(item._conf.text) == "object") return window.dhx4.template(item._tpl.input, item._conf.text, true);
		if (window.dhx4.s2b(asStringOption) && typeof(item._conf.text) == "object") return window.dhx4.template(item._tpl.option, item._conf.text, true);
		return item._conf.text;
	},
	
	getValue: function(item) {
		return item._conf.value;
	},
	
	getCss: function(item) {
		return item._conf.css;
	},
	
	setSelected: function(item, state) {
		item.className = "dhxcombo_option"+(state?" dhxcombo_option_selected":"");
	},
	
	isSelected: function(item) {
		return String(item.className).indexOf("dhxcombo_option_selected") >= 0;
	},
	
	getExtraData: function(item) {
		// optional function,
		// adds extra data to option object returned by getOption()
		return {type: "option"};
	}
	
};

/****************************************************************************************************************************************************************************************************************/

dhtmlXCombo.prototype.modes.checkbox = {
	
	image: true,
	
	image_css: "dhxcombo_checkbox dhxcombo_chbx_#state#",
	option_css: "dhxcombo_option_text dhxcombo_option_text_chbx",
	
	render: function(item, data) {
		
		item._conf = {value: data.value, css: "", checked: window.dhx4.s2b(data.checked)};
		
		item.className = "dhxcombo_option";
		item.innerHTML = "<div class='"+String(this.image_css).replace("#state#",(item._conf.checked?"1":"0"))+"'></div>"+
				"<div class='"+this.option_css+"'>&nbsp;</div>";
		
		item.firstChild._optChbxId = item._optId; // mark checkbox
		
		if (data.css != null) {
			item.lastChild.style.cssText += data.css;
			item._conf.css = data.css;
		}
		
		this.setText(item, data.text);
		
		return this;
	},
	
	setChecked: function(item, state) {
		item._conf.checked = window.dhx4.s2b(state);
		item.firstChild.className = String(this.image_css).replace("#state#",(item._conf.checked?"1":"0"));
	},
	
	isChecked: function(item) {
		return (item._conf.checked==true);
	},
	
	getExtraData: function(item) {
		return {type: "checkbox", checked: item._conf.checked};
	},
	
	optionClick: function(item, ev, combo) {
		// called when option clicked, return true allows selection+confirm, return false - not
		var r = true;
		var t = (ev.target||ev.srcElement);
		while (r == true && t != null && t != item) {
			if (t._optChbxId != null) {
				if (combo.callEvent("onCheck", [item._conf.value,!item._conf.checked]) === true) {
					this.setChecked(item, !this.isChecked(item));
				};
				r = false;
			} else {
				t = t.parentNode;
			}
		}
		t = combo = item = null;
		return r;
	},
	
	getTopImage: function(item, enabled) {
		// returns html for top image
		// if item not specified - default image
		// enabled specify if combo enabled
		return "";
	},
	
	topImageClick: function(item, combo) {
		// called when user clicked on top-image,
		// return true/false to allow defailt action (open/close list) ot not
		// for checkbox - perform default action
		return true;
	}
	
};

dhtmlXComboExtend("checkbox", "option");

dhtmlXCombo.prototype.setChecked = function(index, mode) {
	this.doWithItem(index, "setChecked", mode);
};

dhtmlXCombo.prototype.getChecked = function(index, mode) {
	// return checked values
	var t = [];
	for (var q=0; q<this.list.childNodes.length; q++) {
		if (this.isChecked(q)) t.push(this._getOptionProp(this.list.childNodes[q]._optId, "value", ""));
	}
	return t;
};

dhtmlXCombo.prototype.isChecked = function(index) {
	return this.doWithItem(index, "isChecked");
};

/****************************************************************************************************************************************************************************************************************/

dhtmlXCombo.prototype.modes.image = {
	
	image: true,
	
	image_css: "dhxcombo_image",
	option_css: "dhxcombo_option_text dhxcombo_option_text_image",
	
	render: function(item, data) {
		
		item._conf = {value: data.value, css: ""};
		
		item.className = "dhxcombo_option";
		item.innerHTML = "<div class='"+this.image_css+"'></div>"+
				"<div class='"+this.option_css+"'>&nbsp;</div>";
		
		if (data.css != null) {
			item.lastChild.style.cssText += data.css;
			item._conf.css = data.css;
		}
		
		this.setText(item, data.text);
		this.setImage(item, data.img, data.img_dis, data.img_path, data.img_def, data.img_def_dis);
		
		return this;
	},
	
	update: function(item, data) {
		item._conf.value = data.value;
		item._conf.css = data.css;
		item.lastChild.style.cssText = data.css;
		this.setText(item, data.text);
		this.setImage(item, data.img, data.img_dis, data.img_path, data.img_def, data.img_def_dis);
	},
	
	setImage: function(item, img, img_dis, path, def, def_dis) {
		
		// image
		if (img != null && img.length > 0) {
			img = path+img;
		} else if (def != null && def.length > 0) {
			img = path+def;
		} else {
			img = null;
		}
		
		// image
		if (img_dis != null && img_dis.length > 0) {
			img_dis = path+img_dis;
		} else if (def_dis != null && def_dis.length > 0) {
			img_dis = path+def_dis;
		} else if (def_dis == true) {
			img_dis = img;
		} else {
			img_dis = null;
		}
		
		item._conf.img = img;
		item._conf.img_dis = img_dis;
		
		item.firstChild.style.backgroundImage = (img!=null?"url("+img+")":"none");
	},
	
	getExtraData: function(item) {
		return {type: "image"};
	},
	
	getTopImage: function(item, enabled) {
		// returns html for top image
		// if item not specified - default image
		var a = (enabled?"img":"img_dis");
		if (item != null && item._conf[a] != null) return "<div class='"+this.image_css+"' style='background-image:url("+item._conf[a]+");'></div>";
		return "";
	}
	
};

dhtmlXComboExtend("image", "option");

dhtmlXCombo.prototype.setDefaultImage = function(img, imgDis) {
	// sets default image
	// set imgDis to tru to use the same image as for enabled combo, default
	if (img != null) this.conf.img_def = img;
	if (imgDis != null) this.conf.img_def_dis = imgDis;
};
dhtmlXCombo.prototype.setImagePath = function(path) {
	this.conf.img_path = path;
};
