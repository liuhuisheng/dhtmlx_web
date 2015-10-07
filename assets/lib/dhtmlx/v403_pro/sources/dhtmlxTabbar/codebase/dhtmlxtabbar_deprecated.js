/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/* deprecated */

dhtmlXTabBar.prototype.destructor = function() {
	// will renamed to unload
	this.unload();
};

dhtmlXTabBar.prototype.normalize = function() {
	// reformats the tabbar to remove tab scrollers
};

dhtmlXTabBar.prototype.setStyle = function() {
	// no longer used
};

dhtmlXTabBar.prototype.setContent = function(id, value) {
	// sets the content of a tab
	this.cells(id).attachObject(value);
	// this.setTabActive(id);
};

dhtmlXTabBar.prototype.setContentHTML = function(id, value) {
	// sets the content of a tab, as HTML string
	this.cells(id).attachHTMLString(value);
	// this.setTabActive(id);
};

dhtmlXTabBar.prototype.setHrefMode = function(mode) {
	// sets the mode that allows loading of external content
	// will replaced by container functionality
        this._hrfmode = mode;
};

dhtmlXTabBar.prototype.setContentHref = function(id, href) {
	// sets the content as the href to an external file
	// will replaced by container functionality
	if (!this._hrfmode) this._hrfmode = "iframe";
	switch (this._hrfmode) {
		case "iframes":
		case "iframe":
		case "iframes-on-demand":
			this.cells(id).attachURL(href);
			break;
		case "ajax":
		case "ajax-html":
			this.cells(id).attachURL(href, true);
			break;
	}
};

dhtmlXTabBar.prototype.setMargin = function() {
	// sets distance between tabs
	// moved to inner skin settings
};

dhtmlXTabBar.prototype.setOffset = function() {
	// sets offset before first tab on tabbar
	// moved to inner skin settings
};

dhtmlXTabBar.prototype.setImagePath = function(id, href) {
	// sets the path to the image folder (not affect already created element until their state changes)
	// no images used for now
};

dhtmlXTabBar.prototype.setSkinColors = function(id, href) {
	// allows setting skin to the specific color, must be used after selecting skin
};

dhtmlXTabBar.prototype.tabWindow = function(id) {
	// returns window of tab content for iframe based tabbar
	return this.cells(id).getFrame();
};

dhtmlXTabBar.prototype.setCustomStyle = function() { // NEEDED!!!
	// sets specific colors for the specific tab
};

dhtmlXTabBar.prototype.enableScroll = function() {
	// enables/disables scrollers (enabled by default)
};

dhtmlXTabBar.prototype.enableForceHiding = function() {
	// enables/disables force hiding mode, solves IE problems with iframes in HTML content, but can cause problems for other dhtmlx components inside tabs
	// code have logic
};

dhtmlXTabBar.prototype.setSize = function(x, y) { // add for all components to adjust parent size in stand-alone init?
	// sets control size (parent size?)
	this.base.style.width = x+"px";
	this.base.style.height = y+"px";
	this.setSizes();
};

dhtmlXTabBar.prototype.enableAutoSize = function() {
	// enables/disables automatic adjusting the height and width to the inner content
};

dhtmlXTabBar.prototype.adjustOuterSize = function() {
	this.setSizes();
};

dhtmlXTabBar.prototype.showInnerScroll = function(id) {
	// shows scroll for content
	for (var a in this.t) {
		if (id == null || id == a) this.t[a].cell.showInnerScroll();
	}
};

dhtmlXTabBar.prototype.loadXML = function(url, call) {
	// loads tabbar from an xml file
	this.loadStruct.apply(this, [url, call]);
};

dhtmlXTabBar.prototype.loadXMLString = function(xmlString, call) {
	// loads tabbar from an xml string
	this.loadStruct.apply(this, [xmlString, call]);
};

dhtmlXTabBar.prototype.hideTab = function(id, mode) {
	this.tabs(id).hide(mode);
};

dhtmlXTabBar.prototype.showTab = function(id, mode) {
	this.tabs(id).show(mode);
};

dhtmlXTabBar.prototype.enableTab = function(id) {
	this.tabs(id).enable();
};

dhtmlXTabBar.prototype.disableTab = function(id) {
	this.tabs(id).disable();
};

dhtmlXTabBar.prototype.getIndex = function(id) {
	return this.tabs(id).getIndex();
};

dhtmlXTabBar.prototype.getLabel = function(id) {
	return this.tabs(id).getText();
};

dhtmlXTabBar.prototype.setLabel = function(id, text) {
	this.tabs(id).setText(text);
};

dhtmlXTabBar.prototype.setTabActive = function(id) {
	this.tabs(id).setActive();
};

dhtmlXTabBar.prototype.removeTab = function(id) {
	this.tabs(id).close();
};

dhtmlXTabBar.prototype.forceLoad = function(id) { // reload attached html content
	this.tabs(id).reloadURL();
};

// onTabContentLoaded => onContentLoaded

