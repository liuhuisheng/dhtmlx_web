/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/*
Purpose: keyboard navigation extension
*/

/**
*     @desc: enable keyboard navigation in tree
*     @param: mode - true/false
*     @edition: Professional
*     @type: public
*     @topic: 4
*/
dhtmlXTreeObject.prototype.enableKeyboardNavigation=function(mode){
        this._enblkbrd=convertStringToBoolean(mode);
        if (this._enblkbrd){
            if (_isFF){
                var z=window.getComputedStyle(this.parentObject,null)["position"];
                if ((z!="absolute")&&(z!="relative"))
                    this.parentObject.style.position="relative";
                }
            this._navKeys=[["up",38],["down",40],["open",39],["close",37],["call",13],["edit",113]];
            var self=this;
            var z=document.createElement("INPUT");
                z.className="a_dhx_hidden_input";
                z.autocomplete="off";
                if (window._KHTMLrv) z.style.color="white";
            this.parentObject.appendChild(z);
            this.parentObject[_isOpera?"onkeypress":"onkeydown"]=function(e){
            	if (self.callEvent("onKeyPress",[(e||window.event).keyCode,(e||window.event)]))
                	return self._onKeyDown(e||window.event)
                
            }
            this.parentObject.onclick=function(e){
                    if (_isFF || _isIE)
                    	z.select();
                    if (window._KHTMLrv || _isOpera) 
                    	z.focus();
            }
        }
        else
            this.parentObject.onkeydown=null;
}


dhtmlXTreeObject.prototype._onKeyDown=function(e){
    if (window.globalActiveDHTMLGridObject && globalActiveDHTMLGridObject.isActive) 
        return true;
    var self=this;
    for (var i=0; i<this._navKeys.length; i++)
        if (this._navKeys[i][1]==e.keyCode){
        	
            this["_onkey_"+this._navKeys[i][0]].apply(this,[this.getSelectedItemId()]);
            if (e.preventDefault) e.preventDefault();
			(e||event).cancelBubble=true;
            return false;
            }
    if (this._textSearch) {
    	return this._searchItemByKey(e);
    }
    return true;
}

dhtmlXTreeObject.prototype._onkey_up=function(id){
   	var temp=this._globalIdStorageFind(id);
    if (!temp) return;
    var next=this._getPrevVisibleNode(temp);
    if (next.id==this.rootId) return;
    this.focusItem(next.id);
    this.selectItem(next.id,false);
}
dhtmlXTreeObject.prototype._onkey_down=function(id){
   	var temp=this._globalIdStorageFind(id);
    if (!temp) return;
    var next=this._getNextVisibleNode(temp);
    if (next.id==this.rootId) return;
    this.focusItem(next.id);
    this.selectItem(next.id,false);
}
dhtmlXTreeObject.prototype._onkey_open=function(id){
    this.openItem(id);
}
dhtmlXTreeObject.prototype._onkey_close=function(id){
    this.closeItem(id);
}
dhtmlXTreeObject.prototype._onkey_call=function(id){
	if (this.stopEdit){
		this.stopEdit();
		this.parentObject.lastChild.focus();
		this.parentObject.lastChild.focus();
	    this.selectItem(id,true);
		}
	else
	    this.selectItem(this.getSelectedItemId(),true);
}
dhtmlXTreeObject.prototype._onkey_edit=function(id){
	if (this.editItem)
   		this.editItem(id);
}


dhtmlXTreeObject.prototype._getNextVisibleNode=function(item,mode){
	if ((!mode)&&(this._getOpenState(item)>0)) return item.childNodes[0];
	if ((item.tr)&&(item.tr.nextSibling)&&(item.tr.nextSibling.nodem))
    	return item.tr.nextSibling.nodem;

    if (item.parentObject) return  this._getNextVisibleNode(item.parentObject,1);
	return item;
};

dhtmlXTreeObject.prototype._getPrevVisibleNode=function(item){
	if ((item.tr)&&(item.tr.previousSibling)&&(item.tr.previousSibling.nodem))
    	return this._lastVisibleChild(item.tr.previousSibling.nodem);

	if (item.parentObject)
		return item.parentObject;
	else return item;
};

dhtmlXTreeObject.prototype._lastVisibleChild=function(item){
	if (this._getOpenState(item)>0)
		return this._lastVisibleChild(item.childNodes[item.childsCount-1]);
	else return item;
};


dhtmlXTreeObject.prototype._searchItemByKey=function(e){
	if (e.keyCode==8) {
		this._textSearchString='';
		return true;
	}
    var key = String.fromCharCode(e.keyCode).toUpperCase();
    if (key.match(/[A-Z,a-z,0-9\ ]/)) {
	    this._textSearchString += key;
	    this._textSearchInProgress = true;
		if (!(this.getSelectedItemText()||"").match(RegExp('^'+this._textSearchString,"i"))){
		    this.findItem(this._textSearchString, 0);
		}
		this._textSearchInProgress = false;
	    if (e.preventDefault) e.preventDefault();
	    (e||event).cancelBubble=true;
	    return false;
    }
    return true;
}



/**
*     @desc: configure keys used for keyboard navigation
*     @param: keys - configuration array, please check pro_key_nav.html in samples for more details
*     @edition: Professional
*     @type: public
*     @topic: 4
*/
dhtmlXTreeObject.prototype.assignKeys=function(keys){
      this._navKeys=keys;
}

/**
*     @desc: enable search items by pressing keys (any item in tree should be focused/selected to make search work)
*     @param: mode - true/false
*     @edition: Professional
*     @type: public
*     @topic: 4
*/
dhtmlXTreeObject.prototype.enableKeySearch=function(mode){
	this._textSearch = convertStringToBoolean(mode);
	if (!this._textSearch) return;
	this._textSearchString = '';
	var self = this;
	this._markItem2 = this._markItem;
	this._markItem = function(node)
				     { 
				     	if (!self._textSearchInProgress)
	                    	self._textSearchString = '';
						self._markItem2(node);
				     }

}
//(c)dhtmlx ltd. www.dhtmlx.com
