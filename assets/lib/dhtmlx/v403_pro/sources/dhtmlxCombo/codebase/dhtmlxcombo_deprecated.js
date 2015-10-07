/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/* deprecated */
dhtmlXCombo.prototype.loadXML = function(url, call) {
	// loads list of options from XML
	this.load(url, call);
};
dhtmlXCombo.prototype.loadXMLString = function(url) {
	// loads list of options from XML string
	this.load(url);
};
dhtmlXCombo.prototype.enableOptionAutoHeight = function() {
	// enables or disables list auto height
};
dhtmlXCombo.prototype.enableOptionAutoPositioning = function() {
	// enables or disables options auto positioning
};
dhtmlXCombo.prototype.enableOptionAutoWidth = function() {
	// enables or disables options auto width
};
dhtmlXCombo.prototype.destructor = function(){
	// destroys object and any related HTML elements
	this.unload();
};
dhtmlXCombo.prototype.render = function() {
	// enables/disables immideatly rendering after changes in combobox
	// performance improved
};
dhtmlXCombo.prototype.setOptionHeight = function() {
	// sets height of combo list
};
dhtmlXCombo.prototype.attachChildCombo = function() {
	// no longer used
};
dhtmlXCombo.prototype.setAutoSubCombo = function() {
	// no longer used
};
