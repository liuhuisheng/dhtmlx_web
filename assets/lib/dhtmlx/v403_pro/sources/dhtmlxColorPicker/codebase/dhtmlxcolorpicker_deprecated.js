/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

window.dhtmlXColorPickerInput = function() {
	return dhtmlXColorPicker.apply(window, arguments);
};

dhtmlXColorPicker.prototype.init = function(){
	// inited automatically
};

dhtmlXColorPicker.prototype.setOnSelectHandler = function(fn) {
	if (typeof fn == "function") this.attachEvent("onSelect", fn);
};

dhtmlXColorPicker.prototype.setOnCancelHandler = function(fn) {
	if (typeof fn == "function") this.attachEvent("onCancel", fn);
};

dhtmlXColorPicker.prototype._mergeLangModules = function(){
	if (typeof dhtmlxColorPickerLangModules != "object") return;
	for (var key in dhtmlxColorPickerLangModules) {
		this.i18n[key] = dhtmlxColorPickerLangModules[key];
	}
};

window.dhtmlxColorPickerLangModules = dhtmlXColorPicker.prototype.i18n;

dhtmlXColorPicker.prototype.close = function() {
	this.hide();
};

dhtmlXColorPicker.prototype.setImagePath = function(path){
	// no longer used
};
