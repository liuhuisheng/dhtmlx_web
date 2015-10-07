/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXMenuObject.prototype.loadXML = function(xmlFile, onLoad) {
	this.loadStruct(xmlFile, onLoad);
};
dhtmlXMenuObject.prototype.loadXMLString = function(xmlString, onLoad) {
	this.loadStruct(xmlString, onLoad);
};
dhtmlXMenuObject.prototype.setIconPath = function(path) {
	this.setIconsPath(path);
};
dhtmlXMenuObject.prototype.setImagePath = function() {
	/* no more used, from 90226 */
};
