/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXGridObject.prototype._init_point_bcg = dhtmlXGridObject.prototype._init_point;
dhtmlXGridObject.prototype._init_point = function() {
	
	if (!window.dhx_globalImgPath) window.dhx_globalImgPath = this.imgURL;
	
	this._col_combos = [];
	for (var i=0; i<this._cCount; i++) {
		if(this.cellType[i].indexOf("combo") == 0) {
			this._col_combos[i] = eXcell_combo.prototype.initCombo.call({grid:this},i);
		}
	}
	
	if (!this._loading_handler_set) {
		this._loading_handler_set = this.attachEvent("onXLE", function(a,b,c,xml){
				eXcell_combo.prototype.fillColumnCombos(this,xml);
				this.detachEvent(this._loading_handler_set);
				this._loading_handler_set = null;
		});
	}
	
	if (this._init_point_bcg) this._init_point_bcg();
};


function eXcell_combo(cell) {
	
	if (!cell) return;
	
	this.cell = cell;
	this.grid = cell.parentNode.grid;
	this._combo_pre = "";
	
	this.edit = function(){
		
		if (!window.dhx_globalImgPath) window.dhx_globalImgPath = this.grid.imgURL;
		
		this.val = this.getValue();
		var val = this.getText();
		if (this.cell._clearCell) val="";
		this.cell.innerHTML = "";
		
		if (!this.cell._brval) {
			this.combo = (this.grid._realfake?this.grid._fake:this.grid)._col_combos[this.cell._cellIndex];
		} else {
			this.combo = this.cell._brval;
		}
		this.cell.appendChild(this.combo.DOMParent);

		this.combo.DOMParent.style.margin = "0";
		
		this.combo.DOMelem_input.focus();
		this.combo.setSize(this.cell.offsetWidth-2);
		if (!this.combo._xml) {
			if (this.combo.getIndexByValue(this.cell.combo_value)!=-1) {
				this.combo.selectOption(this.combo.getIndexByValue(this.cell.combo_value));
			} else {
				if (this.combo.getOptionByLabel(val)) {
					this.combo.selectOption(this.combo.getIndexByValue(this.combo.getOptionByLabel(val).value));
				} else {
					this.combo.setComboText(val);
				}
			}
		} else {
			this.combo.setComboText(val);
		}
		this.combo.openSelect();
	}
	
	this.selectComboOption = function(val,obj){
		obj.selectOption(obj.getIndexByValue(obj.getOptionByLabel(val).value));
	}
	
	this.getValue = function(val){
		return this.cell.combo_value||"";
	}
	
	this.getText = function(val){
		var c = this.cell;
		if (this._combo_pre == "" && c.childNodes[1]) {
			c = c.childNodes[1];
		} else {
			c.childNodes[0].childNodes[1];
		}
		return (_isIE ? c.innerText : c.textContent);
	}
	
	this.setValue = function(val){
		
		if (typeof(val) == "object"){
			
			this.cell._brval = this.initCombo();
			var index = this.cell._cellIndex;
			var idd = this.cell.parentNode.idd;
			if (!val.firstChild) {
				this.cell.combo_value = "&nbsp;";
				this.cell._clearCell = true;
			} else {
				this.cell.combo_value = val.firstChild.data;
			}
			this.setComboOptions(this.cell._brval, val, this.grid, index, idd);
			
		} else {
			this.cell.combo_value = val;
			var cm = null;
			if ((cm = this.cell._brval) && (typeof(this.cell._brval) == "object")) {
				val = (cm.getOption(val)||{}).text||val;
			} else if (cm = this.grid._col_combos[this.cell._cellIndex]||((this.grid._fake) && (cm = this.grid._fake._col_combos[this.cell._cellIndex]))) {
				val = (cm.getOption(val)||{}).text||val;
			}
			
			if ((val||"").toString()._dhx_trim()=="") val = null;
			
			if (val !== null) {
				this.setComboCValue(val);
			} else {
				this.setComboCValue("&nbsp;", "");
				this.cell._clearCell = true;
			}
		}
	}
	
	this.detach = function(){
		this.cell.removeChild(this.combo.DOMParent);
		var val = this.cell.combo_value;
		if (!this.combo.getComboText() || this.combo.getComboText().toString()._dhx_trim()==""){
			this.setComboCValue("&nbsp;");
			this.cell._clearCell=true;
		}
		else{
			this.setComboCValue(this.combo.getComboText().replace(/\&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),this.combo.getActualValue());
			this.cell._clearCell = false;
		}
		this.combo._confirmSelect();
		this.cell.combo_value = this.combo.getActualValue();
		this.combo.closeAll();
		this.grid._still_active=true;
		this.grid.setActive(1);
		return val!=this.cell.combo_value;
	}
}


eXcell_combo.prototype = new eXcell;
eXcell_combo_v = function(cell){
	var combo = new eXcell_combo(cell);
	combo._combo_pre = "<img src='"+(window.dhx_globalImgPath?window.dhx_globalImgPath:this.grid.imgURL)+"combo_select"+(dhtmlx.skin?"_"+dhtmlx.skin:"")+".gif' class='dhxgrid_combo_icon'/>";
	return combo;
};

eXcell_combo.prototype.initCombo = function(index){
	
	var container = document.createElement("DIV");
	var type = this.grid.defVal[arguments.length?index:this.cell._cellIndex];
	var combo = new dhtmlXCombo(container, "combo", 0, type);
	this.grid.defVal[arguments.length?index:this.cell._cellIndex] = "";
	
	combo.DOMelem.className += " dhxcombo_in_grid";
	var grid = this.grid;
	combo.DOMelem.onselectstart = function(){
		event.cancelBubble = true;
		return true;
	};
	
	combo.attachEvent("onKeyPressed",function(ev){
		if (ev==13 || ev==27) {
			grid.editStop();
			if (grid._fake) grid._fake.editStop();
		}
	});
	
	dhtmlxEvent(combo.DOMlist, "click", function(){
						grid.editStop();
						if (grid._fake) grid._fake.editStop();
	});
	
	return combo;
	
};

eXcell_combo.prototype.fillColumnCombos = function(grid,xml){
	if (!xml) return;
	grid.combo_columns = grid.combo_columns||[];
	columns = grid.xmlLoader.doXPath("//column", xml);
	for (var i=0; i<columns.length; i++) {
		if ((columns[i].getAttribute("type")||"").indexOf("combo") == 0) {
			grid.combo_columns[grid.combo_columns.length] = i;
			this.setComboOptions(grid._col_combos[i], columns[i], grid, i);
		}
	}
};

eXcell_combo.prototype.setComboCValue = function(value, value2) {
   	if (this._combo_pre != "") {
		var height = (this.cell.offsetHeight?this.cell.offsetHeight+"px":0);
   		value = "<div style='width:100%;position:relative;height:100%;overflow:hidden;'>"+this._combo_pre+"<span>"+value+"</span></div>";
   	}
   	if (arguments.length > 1) {
  		this.setCValue(value,value2);
	} else {
		this.setCValue(value);
	}
};

eXcell_combo.prototype.setComboOptions = function(combo, obj, grid, index, idd) {
	
	if (window.dhx4.s2b(obj.getAttribute("xmlcontent"))) {
		
		if (!obj.getAttribute("source")) {
			options = obj.childNodes;
			var _optArr = [];
			for (var i=0; i < options.length; i++){
				if(options[i].tagName =="option"){
					var text_opt = options[i].firstChild? options[i].firstChild.data:"";
					_optArr[_optArr.length]= [options[i].getAttribute("value"),text_opt];
				}
			}
			combo.addOption(_optArr)
			if(arguments.length == 4){
				grid.forEachRowA(function(id){
						var c = grid.cells(id,index);
						if(!c.cell._brval&&!c.cell._cellType&&(c.cell._cellIndex==index)){
							if(c.cell.combo_value=="") c.setComboCValue("&nbsp;","");
							else{
								if(!combo.getOption(c.cell.combo_value))
									c.setComboCValue(c.cell.combo_value);
								else c.setComboCValue(combo.getOption(c.cell.combo_value).text);
							}
						}
				});	
			}
			else {
				var c = (this.cell)?this:grid.cells(idd,index);
				if(obj.getAttribute("text")) {
					if(obj.getAttribute("text")._dhx_trim()=="") c.setComboCValue("&nbsp;",""); 
					else c.setComboCValue(obj.getAttribute("text")); 
				}
				else{
					if((!c.cell.combo_value)||(c.cell.combo_value._dhx_trim()=="")) c.setComboCValue("&nbsp;","");
					else{
						if(!combo.getOption(c.cell.combo_value))
							c.setComboCValue(c.cell.combo_value);
						else c.setComboCValue(combo.getOption(c.cell.combo_value).text);
					}
				}
			}
			
		}
	}
	
	if (obj.getAttribute("source")) {
		if (obj.getAttribute("auto") && window.dhx4.s2b(obj.getAttribute("auto"))) {
			
			if (obj.getAttribute("xmlcontent")) {
				var c = (this.cell)?this:grid.cells(idd,index);
				if (obj.getAttribute("text")) c.setComboCValue(obj.getAttribute("text"));
			} else {
				grid.forEachRowA(function(id){
					var c = grid.cells(id,index);
					if (!c.cell._brval && !c.cell._cellType) {
						var str = c.cell.combo_value.toString();
						if (str.indexOf("^") != -1) {
							var arr = str.split("^");
							c.cell.combo_value = arr[0];
							c.setComboCValue(arr[1]);
						}
					}
				});
			}
			combo.enableFilteringMode(true, obj.getAttribute("source"), window.dhx4.s2b(obj.getAttribute("cache")||true), window.dhx4.s2b(obj.getAttribute("sub")||false));
			
		} else {
			
			var that = this;
			var length = arguments.length; 
			combo.load(obj.getAttribute("source"), function(){
				if (length == 4) {
					grid.forEachRow(function(id){
						var c = grid.cells(id,index);
						if (!c.cell._brval && !c.cell._cellType) {
							if (combo.getOption(c.cell.combo_value)) {
								c.setComboCValue(combo.getOption(c.cell.combo_value).text);
							} else {
								if ((c.cell.combo_value||"").toString()._dhx_trim() == "") {
									c.setComboCValue("&nbsp;","");
									c.cell._clearCell=true;
								} else {
									c.setComboCValue(c.cell.combo_value);
								}
							}
						}
					});
				} else {
					//var c = (that.cell)? that : grid.cells(idd,index);
					var c = grid.cells(idd,index);
					//c.setCValue(obj.getAttribute("text"));
					if (combo.getOption(c.cell.combo_value)) {
						c.setComboCValue(combo.getOption(c.cell.combo_value).text);
					} else {
						c.setComboCValue(c.cell.combo_value);
					}
				}
			});
			
		}
	}
	if (!obj.getAttribute("auto") || !window.dhx4.s2b(obj.getAttribute("auto"))) {
		if (obj.getAttribute("editable") && !window.dhx4.s2b(obj.getAttribute("editable"))) combo.readonly(true);
		if (obj.getAttribute("filter") && window.dhx4.s2b(obj.getAttribute("filter"))) combo.enableFilteringMode(true);
	}
	
};

eXcell_combo.prototype.getCellCombo = function() {
	
	if (this.cell._brval) return this.cell._brval;
	
	this.cell._brval = this.initCombo();
	return this.cell._brval;
	
};

eXcell_combo.prototype.refreshCell = function() {
	this.setValue(this.getValue());
};

dhtmlXGridObject.prototype.getColumnCombo = function(index) {
	if (this._col_combos && this._col_combos[index]) return this._col_combos[index];
	
	if (!this._col_combos) this._col_combos = [];
	this._col_combos[index] = eXcell_combo.prototype.initCombo.call({grid:this},index);
	return this._col_combos[index];
	
};

dhtmlXGridObject.prototype.refreshComboColumn = function(index) {
	this.forEachRow(function(id){
		if (this.cells(id,index).refreshCell) this.cells(id,index).refreshCell();
	});
};


