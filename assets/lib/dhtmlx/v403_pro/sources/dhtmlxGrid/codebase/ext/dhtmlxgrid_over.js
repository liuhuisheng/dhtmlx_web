/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXGridObject.prototype.mouseOverHeader=function(func){
		var self=this;
		dhtmlxEvent(this.hdr,"mousemove",function(e){
				e=e||window.event;
				var el=e.target||e.srcElement;
            	if(el.tagName!="TD")
                	el = self.getFirstParentOfType(el,"TD")				
                if (el && (typeof(el._cellIndex)!="undefined"))
					func(el.parentNode.rowIndex,el._cellIndex);
		});
}
dhtmlXGridObject.prototype.mouseOver=function(func){
		var self=this;	
		dhtmlxEvent(this.obj,"mousemove",function(e){
				e=e||window.event;
				var el=e.target||e.srcElement;
            	if(el.tagName!="TD")
                	el = self.getFirstParentOfType(el,"TD")				
                if (el && (typeof(el._cellIndex)!="undefined"))
					func(el.parentNode.rowIndex,el._cellIndex);
		});
}
//(c)dhtmlx ltd. www.dhtmlx.com