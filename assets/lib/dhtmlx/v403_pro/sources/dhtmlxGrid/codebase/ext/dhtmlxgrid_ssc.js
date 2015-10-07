/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*   @desc: enable automatic size saving to cookie
*   @param: name - optional, cookie name
*   @param: cookie_param - additional parameters added to cookie
*   @type: public
*     @edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.enableAutoSizeSaving = function(name,cookie_param){
		this.attachEvent("onResizeEnd",function(){ this.saveSizeToCookie(name,cookie_param) });
}

/**
*   @desc: store opene state of TreeGrid in cookie
*   @param: name - optional, cookie name
*   @param: cookie_param - additional parameters added to cookie
*   @type: public
*   @edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.saveOpenStates = function(name,cookie_param){
	if (!name) name=this.entBox.id;
	var t=[];
	this._h2.forEachChild(0,function(el){
		if (el.state=="minus") t.push(el.id);
	});
	var str = "gridOpen"+(name||"") + "=" + t.join("|") +  (cookie_param?("; "+cookie_param):"");
	document.cookie = str;
}


/**
*   @desc: load open state of TreeGrid in cookie
*   @param: name - optional, cookie name
*   @param: cookie_param - additional parameters added to cookie
*   @type: public
*   @edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.loadOpenStates = function(name,cookie_param){
	var val=this.getCookie(name,"gridOpen");
	if (!val) return;
	val=val.split("|");
	for (var i = 0; i < val.length; i++) {
		var pid = this.getParentId(val[i]);
		if (!this.getOpenState(pid)) continue;
		this.openItem(val[i]);
	}
}

/**
*   @desc: enable automatic saving column state ( hidden | shown )
*   @param: name - optional, cookie name
*   @param: cookie_param - additional parameters added to cookie
*   @type: public
*     @edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.enableAutoHiddenColumnsSaving = function(name,cookie_param){
		this.attachEvent("onColumnHidden",function(){ 
				this.saveHiddenColumnsToCookie(name,cookie_param); 
		});
}

/**
*   @desc: enable automatic sorting state saving to cookie
*   @param: name - optional, cookie name
*   @param: cookie_param - additional parameters added to cookie
*   @type: public
*     @edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.enableSortingSaving = function(name,cookie_param){
	this.attachEvent("onBeforeSorting",function(){ 
		var that=this;
		window.setTimeout(function(){
			that.saveSortingToCookie(name,cookie_param);
			},1);
		return true;
		});	
}

/**
*   @desc: enable automatic column order saving to cookie
*   @param: name - optional, cookie name
*   @param: cookie_param - additional parameters added to cookie
*   @type: public
*     @edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.enableOrderSaving = function(name,cookie_param){
	this.attachEvent("onAfterCMove",function(){ 
		this.saveOrderToCookie(name,cookie_param);  
		this.saveSizeToCookie(name,cookie_param);
	});
}

/**
*   @desc: enable automatic saving of all possible params
*   @param: name - optional, cookie name
*   @param: cookie_param - additional parameters added to cookie
*   @type: public
*     @edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.enableAutoSaving = function(name,cookie_param){
		this.enableOrderSaving(name,cookie_param);
		this.enableAutoSizeSaving(name,cookie_param);
		this.enableSortingSaving(name,cookie_param);
}


/**   @desc: save grid layout to cookie
*     @type: public
*     @param: name - optional, cookie name
*     @param: cookie_param - additional parameters added to cookie
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.saveSizeToCookie=function(name,cookie_param){
	if (this.cellWidthType=='px')
		var z=this.cellWidthPX.join(",");
	else
		var z=this.cellWidthPC.join(",");
	var z2=(this.initCellWidth||(new  Array)).join(",");
	this.setCookie(name,cookie_param,0,z);
	this.setCookie(name,cookie_param,1,z2);
}

/**   @desc: save hidden columns to cookie
*     @type: public
*     @param: name - optional, cookie name
*     @param: cookie_param - additional parameters added to cookie
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.saveHiddenColumnsToCookie=function(name,cookie_param){

    var hs=[].concat(this._hrrar||[]);
    if (this._fake && this._fake._hrrar)
        for (var i=0; i < this._fake._cCount; i++)
            hs[i]=this._fake._hrrar[i]?"1":"";
	this.setCookie(name,cookie_param,4,hs.join(",").replace(/display:none;/g,"1"));
}

/**   @desc: load sorting order from cookie
*     @type: public
*     @param: name - optional,cookie name
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.loadHiddenColumnsFromCookie=function(name){
	var z=this._getCookie(name,4);
	var ar=(z||"").split(",");
	for (var i=0; i < this._cCount; i++) 
		this.setColumnHidden(i,(ar[i]?true:false));
}



/**   @desc: save sorting order to cookie
*     @type: public
*     @param: name - optional, cookie name
*     @param: cookie_param - additional parameters added to cookie
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.saveSortingToCookie=function(name,cookie_param){
	this.setCookie(name,cookie_param,2,(this.getSortingState()||[]).join(","));
}


/**   @desc: load sorting order from cookie
*     @type: public
*     @param: name - optional,cookie name
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.loadSortingFromCookie=function(name){
	var z=this._getCookie(name,2);
	z=(z||"").split(",");
	if (z.length>1 && z[0]<this._cCount){
		this.sortRows(z[0],null,z[1]);
		this.setSortImgState(true,z[0],z[1]);
	}
}



/**   @desc: save sorting order to cookie
*     @type: public
*     @param: name - optional, cookie name
*     @param: cookie_param - additional parameters added to cookie
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.saveOrderToCookie=function(name,cookie_param){
	if (!this._c_order) {
		this._c_order=[];
		var l=this._cCount;
		for (var i=0; i<l; i++)
			this._c_order[i]=i;
	}
	this.setCookie(name,cookie_param,3,((this._c_order||[]).slice(0,this._cCount)).join(","));
	this.saveSortingToCookie();
}


/**   @desc: load sorting order from cookie
*     @type: public
*     @param: name - optional,cookie name
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.loadOrderFromCookie=function(name){
	var z=this._getCookie(name,3);
	z=(z||"").split(",");
	if (z.length>1 && z.length<=this._cCount){
			//code below probably may be optimized
			for (var i=0; i<z.length; i++)
				if ((!this._c_order && z[i]!=i)||(this._c_order && z[i]!=this._c_order[i])){
					var t=z[i];
					if (this._c_order)
						for (var j=0; j<this._c_order.length; j++) {
							if (this._c_order[j]==z[i]) {
								t=j; break;
								}
						}
					this.moveColumn(t*1,i);
				}
	}
}


/**   @desc: load grid layout from cookie
*     @type: public
*     @param: name - optional,cookie name
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.loadSizeFromCookie=function(name){ 
	var z=this._getCookie(name,1);
	if (z)
		this.initCellWidth=z.split(",");
	var z=this._getCookie(name,0);
	if ((z)&&(z.length)){
		if (!this._fake && this._hrrar) 
			for (var i=0; i<z.length; i++) 
				if ( this._hrrar[i]) z[i]=0;
		if (this.cellWidthType=='px')
			this.cellWidthPX=z.split(",");
		else
			this.cellWidthPC=z.split(",");
		}
	this.setSizes();
    return true;
}

/**   @desc: clear cookie with grid config details
*     @type: public
*     @param: name - optional,cookie name
*     @edition: Professional
*     @topic: 2
*/
dhtmlXGridObject.prototype.clearConfigCookie=function(name){
	if (!name) name=this.entBox.id;
	var str = "gridSettings"+name + "=||||";
	document.cookie = str;
}
dhtmlXGridObject.prototype.clearSizeCookie=dhtmlXGridObject.prototype.clearConfigCookie;


/**   @desc: save cookie
*     @type: private
*     @param: name - cookie name
*     @param: value - cookie value
*     @param: cookie_param - additional parameters added to cookie
*     @edition: Professional
*     @topic: 0
*/

dhtmlXGridObject.prototype.setCookie=function(name,cookie_param,pos,value) {
	if (!name) name=this.entBox.id;
	var t=this.getCookie(name);
	t=(t||"||||").split("|");
	t[pos]=value;
	var str = "gridSettings"+name + "=" + t.join("|").replace(/,/g,"-") +  (cookie_param?("; "+cookie_param):"");
//	console.log("save",str)
	document.cookie = str;
}

/**   @desc: get cookie
*     @type: private
*     @param: name - cookie name
*     @edition: Professional
*     @topic: 0
*/
dhtmlXGridObject.prototype.getCookie=function(name,surname) { 
	if (!name) name=this.entBox.id;
	name=(surname||"gridSettings")+name;
	var search = name + "=";
	if (document.cookie.length > 0) {
		var offset = document.cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			var end = document.cookie.indexOf(";", offset);
			if (end == -1)
				end = document.cookie.length;
			return document.cookie.substring(offset, end);
						}		}
};
dhtmlXGridObject.prototype._getCookie=function(name,pos) {
//	console.log("get",this.getCookie(name))
	return ((this.getCookie(name)||"||||").replace(/-/g,",").split("|"))[pos];
}
//(c)dhtmlx ltd. www.dhtmlx.com