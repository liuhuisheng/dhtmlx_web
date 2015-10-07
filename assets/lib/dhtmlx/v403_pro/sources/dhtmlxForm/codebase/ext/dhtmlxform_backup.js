/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXForm.prototype.saveBackup = function() {
	if (!this._backup) {
		this._backup = {};
		this._backupId = new Date().getTime();
	}
	this._backup[++this._backupId] = this.getFormData();
	return this._backupId;
};

dhtmlXForm.prototype.restoreBackup = function(id) {
	if (this._backup != null && this._backup[id] != null) {
		this.setFormData(this._backup[id]);
	}
};

dhtmlXForm.prototype.clearBackup = function(id) {
	if (this._backup != null && this._backup[id] != null) {
		this._backup[id] = null;
		delete this._backup[id];
	}
};
