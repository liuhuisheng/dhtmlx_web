/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*	@desc: multi select list editor
*	@returns: dhtmlxGrid cell editor object
*	@type: public
*/
function eXcell_clist(cell){
	try{
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	}catch(er){}
	this.edit = function(){
					this.val = this.getValue();
                    var a=(this.cell._combo||this.grid.clists[this.cell._cellIndex]);
                    if (!a) return;
					this.obj = document.createElement("DIV");
                    var b=this.val.split(",");
                    var text="";

                    for (var i=0; i<a.length; i++){
                        var fl=false;
                        for (var j=0; j<b.length; j++)
                            if (a[i]==b[j]) fl=true;
                        if (fl)
                         text+="<div><input type='checkbox' id='dhx_clist_"+i+"' checked='true' /><label for='dhx_clist_"+i+"'>"+a[i]+"</label></div>";
                        else
                         text+="<div><input type='checkbox' id='dhx_clist_"+i+"'/><label for='dhx_clist_"+i+"'>"+a[i]+"</label></div>";
                    }
                    text+="<div><input type='button' value='"+(this.grid.applyButtonText||"Apply")+"' style='width:100px; font-size:8pt;' onclick='this.parentNode.parentNode.editor.grid.editStop();'/></div>"

                    this.obj.editor=this;
                    this.obj.innerHTML=text;
                    document.body.appendChild(this.obj);
                    this.obj.style.position="absolute";
					this.obj.className="dhx_clist";
					this.obj.onclick=function(e){  (e||event).cancelBubble=true; return true; };
					var arPos = this.grid.getPosition(this.cell);
                    this.obj.style.left=arPos[0]+"px";
                    this.obj.style.top=arPos[1]+this.cell.offsetHeight+"px";

                    this.obj.getValue=function(){
                        var text="";
                        for (var i=0; i<this.childNodes.length-1; i++)
                            if (this.childNodes[i].childNodes[0].checked){
                                if (text) text+=",";
                                    text+=this.childNodes[i].childNodes[1].innerHTML;
                                }
                        return text.replace(/&amp;/g,"&");
                    }
				}
	this.getValue = function(){
		//this.grid.editStop();
		if (this.cell._clearCell) return "";
		return this.cell.innerHTML.toString()._dhx_trim().replace(/&amp;/g,"&");
	}

	this.detach = function(val){
                    if (this.obj){
    					this.setValue(this.obj.getValue());
                        this.obj.editor=null;
                        this.obj.parentNode.removeChild(this.obj);
                        this.obj=null;
                        }
					return this.val!=this.getValue();
				}
}
eXcell_clist.prototype = new eXcell;

eXcell_clist.prototype.setValue = function(val){
						if (typeof(val)=="object"){
							var optCol=this.grid.xmlLoader.doXPath("./option",val);
                            if (optCol.length)
                            	this.cell._combo=[];
                                for (var j=0;j<optCol.length; j++)
									this.cell._combo.push(optCol[j].firstChild?optCol[j].firstChild.data:"");
							val=val.firstChild.data;
						}
						if (val==="" || val === this.undefined){
							this.setCTxtValue(" ",val);
							this.cell._clearCell=true;
						}
						else{
                        	this.setCTxtValue(val);
                        	this.cell._clearCell=false;
                        }
					}

/**
*	@desc: register list of values for CList cell
*	@param: col - index of CList collumn
*	@param: list - array of list data
*	@type:  public
*   @edition: Professional
*/
dhtmlXGridObject.prototype.registerCList=function(col,list){
    if (!this.clists) this.clists=new Array();
	if (typeof(list)!="object") list=list.split(",");
    this.clists[col]=list;
    }

//(c)dhtmlx ltd. www.dhtmlx.com