/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXToolbarObject.prototype.loadXML = function(xmlFile, onLoad) {
	this.loadStruct(xmlFile, onLoad);
};
dhtmlXToolbarObject.prototype.loadXMLString = function(xmlString, onLoad) {
	this.loadStruct(xmlString, onLoad);
};
dhtmlXToolbarObject.prototype.setIconPath = function(path) {
	this.setIconsPath(path);
};

/*
misc:
conf.icon_path => conf.icons_path for objectr api init
*/
