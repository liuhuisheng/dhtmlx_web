/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/*
Purpose: temporary loading XML item
Warining - this extension is an experimental and not fully compatible
*/


/**
*     @desc: enable/disable "Loading..." item
*     @param: text - text of temporary item (default is "Loading...")
*     @edition: Professional
*     @type: public
*     @topic: 0
*/
 	dhtmlXTreeObject.prototype.enableLoadingItem=function(text) {
            this.attachEvent("onXLS",this._showFakeItem);
            this.attachEvent("onXLE",this._hideFakeItem);

            this._tfi_text=text||"Loading...";
    };


 	dhtmlXTreeObject.prototype._showFakeItem=function(tree,id) {
        if ((id===null)||(this._globalIdStorageFind("fake_load_xml_"+id))) return;
        var temp = this.XMLsource; this.XMLsource=null;
        this.insertNewItem(id,"fake_load_xml_"+id,this._tfi_text);
        this.XMLsource=temp;
    }
 	dhtmlXTreeObject.prototype._hideFakeItem=function(tree,id) {
        if (id===null) return;
        this.deleteItem("fake_load_xml_"+id);
    }
//(c)dhtmlx ltd. www.dhtmlx.com
