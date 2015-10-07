/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXTreeObject.prototype.parserExtension={
	_parseExtension:function(p,a,pid) {
		this._idpull[a.id]._attrs=a;
	}
};

dhtmlXTreeObject.prototype.getAttribute=function(id,name){
	this._globalIdStorageFind(id)
	var t=this._idpull[id]._attrs;
	return t?t[name]:window.undefined;
}
dhtmlXTreeObject.prototype.setAttribute=function(id,name,value){
	this._globalIdStorageFind(id)
	var t=(this._idpull[id]._attrs)||{};
	t[name]=value;
	this._idpull[id]._attrs=t;
}
