/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

	dhtmlXGridObject.prototype.post=function(url, post, call, type){
		this.callEvent("onXLS", [this]);
		if (arguments.length == 3 && typeof call != "function"){
			type=call;
			call=null;
		}
		type=type||"xml";
		post=post||"";
	
		if (!this.xmlFileUrl)
			this.xmlFileUrl=url;
		this._data_type=type;
		this.xmlLoader.onloadAction=function(that, b, c, d, xml){
			xml=that["_process_"+type](xml);
			if (!that._contextCallTimer)
			that.callEvent("onXLE", [that,0,0,xml]);
	
			if (call){
				call();
				call=null;
			}
		}
		this.xmlLoader.loadXML(url,true,post);
	}