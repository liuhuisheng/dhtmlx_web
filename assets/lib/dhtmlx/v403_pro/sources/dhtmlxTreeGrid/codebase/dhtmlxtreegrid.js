/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*   @desc: switch current row state (collapse/expand) tree grid row
*   @param: obj - row object
*   @type: private
*/
dhtmlXGridObject.prototype._updateTGRState=function(z){ 
	if (!z.update || z.id==0) return;
	if (this.rowsAr[z.id].imgTag)
	this.rowsAr[z.id].imgTag.src=this.iconTree+z.state+".gif";
	z.update=false;
}


dhtmlXGridObject.prototype.doExpand=function(obj){  
	this.editStop();
    var row = obj.parentNode.parentNode.parentNode;
	var r=this._h2.get[row.idd];
	if (!this.callEvent("onOpen",[row.idd,(r.state=="plus"?-1:1)])) return;
    if(r.state=="plus")
      this.expandKids(row)
    else
   	  if((r.state=="minus")&&(!r._closeable))
          this.collapseKids(row)
}


function dhtmlxHierarchy(){
		
		var z={id:0, childs:[], level:-1, parent:null, index:0, state:dhtmlXGridObject._emptyLineImg};
		this.order=[z];
		this.get={"0":z};

		this.swap=function(a,b){
			var p=a.parent;
			var z=a.index;
			p.childs[z]=b;
			p.childs[b.index]=a;
			a.index=b.index; b.index=z;
		}
		this.forEachChildF=function(id,funct,that,funct2){
			var z=this.get[id];
			for (var i=0; i<z.childs.length; i++){
				if (!funct.apply((that||this),[z.childs[i]])) continue;
				if (z.childs[i].childs.length) this.forEachChildF(z.childs[i].id,funct,that,funct2);
				if (funct2) funct2.call((that||this),z.childs[i]);
			}
		}
		this.forEachChild=function(id,funct,that){
				var z=this.get[id];
				for (var i=0; i<z.childs.length; i++){
					funct.apply((that||this),[z.childs[i]]);
					if (z.childs[i].childs.length) this.forEachChild(z.childs[i].id,funct,that);
				}
		}
		this.change=function(id,name,val){
			var z=this.get[id];
			if (z[name]==val) return;
				z[name]=val;
				z.update=true;
		}
		this.add=function(id,parentId){ 
			return this.addAfter(id,parentId);
		}
		this.addAfter=function(id,parentId,afterId,fix){  
			var z=this.get[parentId||0];
			if (afterId)
				var ind=this.get[afterId].index+(fix?0:1);
			else var ind=z.childs.length;
			
			var x={id:id, childs:[], level:z.level+1, parent:z, index:ind, state:dhtmlXGridObject._emptyLineImg}
			if (z.state==dhtmlXGridObject._emptyLineImg)  this.change(parentId,"state",(parentId==0?"minus":"plus"));
			
			if (afterId){
				for (var i=ind; i<z.childs.length; i++) z.childs[i].index++;
				z.childs=z.childs.slice(0,ind).concat([x]).concat(z.childs.slice(ind,z.childs.length));
			}else
				z.childs.push(x);
			this.get[id]=x;
			return x;
		}
		this.addBefore=function(id,parentId,beforeId){
			return this.addAfter(id,parentId,beforeId,true)
		}		
		this.remove=function(id){  
			var z=this.get[id||0];
			for (var i=0; i<z.childs.length; i++)
				this.deleteAll(z.childs[i].id)
			z.childs=[];	
			z.parent.childs=z.parent.childs.slice(0,z.index).concat(z.parent.childs.slice(z.index+1));				
			for (var i=z.index; i<z.parent.childs.length; i++)
				z.parent.childs[i].index--;
			delete this.get[id];
		}
		this.deleteAll=function(id){
			var z=this.get[id||0];
			for (var i=0; i<z.childs.length; i++)
				this.deleteAll(z.childs[i].id)
				
			z.childs=[];				
			delete this.get[id];
		}		
		
		return this;
	}

dhtmlXGridObject.prototype._getOpenLenght=function(id,start){
	
	var z=this._h2.get[id].childs;
	start+=z.length;
	for (var i=0; i<z.length; i++)
		if (z[i].childs.length && z[i].state=='minus')
			start+=this._getOpenLenght(z[i].id,0);
	return start;
}
/**
*   @desc: close row of treegrid (removes kids from dom)
*   @param: curRow - row to process kids of
*   @type: private
*/
dhtmlXGridObject.prototype.collapseKids=function(curRow){ 
	var r=this._h2.get[curRow.idd];
    if (r.state!="minus") return;
    if (!this.callEvent("onOpenStart",[curRow.idd,1])) return;

    var start = curRow.rowIndex;
    //why Safari doesn't support standards?
    if (start<0) start=this.rowsCol._dhx_find(curRow)+1;

   	this._h2.change(r.id,"state","plus");
   	this._updateTGRState(r);

    if (this._srnd || this.pagingOn){
    	this._h2_to_buff();
    	this._renderSort();
    } else {
    var len=this._getOpenLenght(this.rowsCol[start-1].idd,0);
    for (var i=0; i<len; i++)
    	this.rowsCol[start+i].parentNode.removeChild(this.rowsCol[start+i]);
    this.rowsCol.splice(start,len);
	}

    //if (this._cssEven && !this._cssSP)
    this.callEvent("onGridReconstructed",[]);

    this.setSizes();
    this._h2_to_buff();
    this.callEvent("onOpenEnd",[curRow.idd,-1]);
}



dhtmlXGridObject.prototype._massInsert=function(r,start,ind,skip){  
	var anew=[];
	var par=(_isKHTML?this.obj:this.obj.rows[0].parentNode)
	this._h2_to_buff();
	if (this._srnd || this.pagingOn) return this._renderSort();
	var len=this._getOpenLenght(r.id,0);
	for(var i=0;i<len;i++){
		var ra=this.render_row(ind+i);
		if (start)
			start.parentNode.insertBefore(ra,start);
		else
			par.appendChild(ra);
		anew.push(ra)
		}
	this.rowsCol=dhtmlxArray(this.rowsCol.slice(0,ind).concat(anew).concat(this.rowsCol.slice(ind)));
	
	return r.childs.length+anew.length;
}
/**
*   @desc: change parent of row, correct kids collections
*   @param: curRow - row to process
*   @type: private
*/
dhtmlXGridObject.prototype.expandKids=function(curRow,sEv){

	var r=this._h2.get[curRow.idd];
	if ((!r.childs.length)&&(!r._xml_await)) return;
	if (r.state!="plus") return;
    
    
    if (!r._loading && !sEv)
    	if (!this.callEvent("onOpenStart",[r.id,-1])) return;
        


   var start = this.getRowIndex(r.id)+1;
   if(r.childs.length){
        r._loading=false;
        this._h2.change(r.id,"state","minus")
        this._updateTGRState(r);
		var len=this._massInsert(r,this.rowsCol[start],start);
		
		//if (this._cssEven && !this._cssSP)
		this.callEvent("onGridReconstructed",[]);
			

   }else{	
        if (r._xml_await){
			r._loading=true;
			if (this.callEvent("onDynXLS",[r.id]))
				this.load(this.kidsXmlFile+""+(this.kidsXmlFile.indexOf("?")!=-1?"&":"?")+"id="+encodeURIComponent(r.id), this._data_type);
        }
   }
    this.setSizes();
    if (!r._loading)
    this.callEvent("onOpenEnd",[r.id,1]);
    this._fixAlterCss();
}

dhtmlXGridObject.prototype.kidsXmlFile = "";



/**
*   @desc: sorts treegrid by specified column
*   @param: col - column index
*   @param:   type - str.int.date
*   @param: order - asc.desc
*   @type: public
*   @edition: Professional
*   @topic: 2,3,5,9
*/
dhtmlXGridObject.prototype.sortTreeRows = function(col,type,order){
				var amet="getValue";
				if (this.cells5({parentNode:{grid:this}},this.getColType(col)).getDate){ //FIXME! move inside cells5 in 2.2
					amet="getDate";
					type="str";
				}		
					

	            this.forEachRow(function(id){
                	var z=this._h2.get[id];
                	if (!z) return;
                	
                	var label=this._get_cell_value(z.buff,col,amet);
                	if(type=='int'){
						   z._sort=parseFloat(label);
						   z._sort=isNaN(z._sort)?-99999999999999:z._sort;
                     }else
                        z._sort=label;
                	});
                	
				var self=this;
				var pos=1; var neg=-1;
				if (order=="des") { pos=-1; neg=1; }
					
				var funct=null;
				if (typeof type == "function")
					funct = function(a,b){
						return type(a._sort, b._sort, order, a.id, b.id);
					}
				else {
	                if(type=='cus')
    	                 funct=function(a,b){
                            return self._customSorts[col](a._sort,b._sort,order,a.id,b.id);
                         };
     	
                   if(type=='str')
                     funct=function(a,b){return (a._sort<b._sort?neg:(a._sort==b._sort?0:pos))}

                  if(type=='int')
                     funct=function(a,b){return (a._sort<b._sort?neg:(a._sort==b._sort?0:pos))}

                  if(type=='date')
                     funct=function(a,b){return (Date.parse(new Date(a._sort||"01/01/1900"))-Date.parse(new Date(b._sort||"01/01/1900")))*pos}
                  }
                  this._sortTreeRows(funct,0);
                  this._renderSort(0,true);

            this.callEvent("onGridReconstructed",[]);
               
}

dhtmlXGridObject.prototype._sortTreeRows = function(funct,id){
				var ar=this._h2.get[id].childs;
				if (this.rowsCol.stablesort)
					this.rowsCol.stablesort.call(ar,funct);
				else
					ar.sort(funct);
					
				for (var i=0; i<ar.length; i++){
					if (ar[i].childs.length) 
						this._sortTreeRows(funct,ar[i].id);
					ar[i].index=i;
				}
};
dhtmlXGridObject.prototype._renderSort = function(id,mode){ 
	this._h2_to_buff();
	var top=this.objBox.scrollTop;
	this._reset_view();
	this.objBox.scrollTop=top;
};

dhtmlXGridObject.prototype._fixAlterCssTGR = function(){ 
if (!this._realfake)	
	this._h2.forEachChild(0,function(x){
		if (x.buff.tagName=="TR"){
			var cs=(this._cssSP?(x.level%2):(x.index%2))?this._cssUnEven:this._cssEven;
			this.rowsAr[x.id].className=(cs + (this._cssSU?(" "+cs+"_"+x.level):""))+" "+(this.rowsAr[x.id]._css||"")+((this.rowsAr[x.id].className.indexOf("rowselected") != -1)?" rowselected":"");
		}
	},this);
}
dhtmlXGridObject.prototype.moveRowUDTG = function(id,dir){ 
	var x=this._h2.get[id];
	var p=x.parent.childs[x.index+dir]
	if ((!p) || (p.parent!=x.parent)) return;
	var state=[x.state,p.state];
	this.collapseKids(this.rowsAr[x.id]);
	this.collapseKids(this.rowsAr[p.id]);	
	var ind = this.rowsCol._dhx_find(this.rowsAr[id]);
	var bInd = this.rowsBuffer._dhx_find(this.rowsAr[id]);
	
	var nod=this.obj.rows[0].parentNode.removeChild(this.rowsCol[ind]);	
	var tar=this.rowsCol[ind+((dir==1)?2:dir)];
	if (tar)
		tar.parentNode.insertBefore(nod,tar);
	else
		this.obj.rows[0].parentNode.appendChild(nod);
	this.rowsCol._dhx_swapItems(ind,ind+dir)
	this.rowsBuffer._dhx_swapItems(bInd,bInd+dir);
	this._h2.swap(p,x);
	
	
	if (state[0]=="minus") this.expandKids(this.rowsAr[x.id]);
	if (state[1]=="minus") this.expandKids(this.rowsAr[p.id]);	
	
	this._fixAlterCss(Math.min(ind,ind+dir));
}

/**
*   @desc: TreeGrid cell constructor (only for TreeGrid package)
*   @param: cell - cell object
*   @type: public
*/
function eXcell_tree(cell){
   if (cell){
      this.cell = cell;
      this.grid = this.cell.parentNode.grid;
   }
   this.isDisabled = function(){ return this.cell._disabled||this.grid._edtc; }
   this.edit = function(){
        if ((this.er)||(this.grid._edtc)) return;
        this.er=this.cell.parentNode.valTag;
        this.val=this.getLabel();
        this.cell.atag=((!this.grid.multiLine)&&(_isKHTML||_isMacOS||_isFF)) ? "INPUT" : "TEXTAREA";
        this.er.innerHTML="<"+this.cell.atag+" class='dhx_combo_edit' type='text' style='height:"+(this.cell.offsetHeight-4)+"px;line-height:"+(this.cell.offsetHeight-6)+"px; width:100%; border:0px; margin:0px; padding:0px; overflow:hidden;'></"+this.cell.atag+">";
        this.er.childNodes[0].onmousedown = function(e){(e||event).cancelBubble = true}
        this.er.childNodes[0].onselectstart=function(e){  if (!e) e=event; e.cancelBubble=true; return true;  };
        this.er.className+=" editable";
        this.er.firstChild.onclick = function(e){(e||event).cancelBubble = true};
        this.er.firstChild.value=this.val;
        this.obj=this.er.firstChild;
		this.er.firstChild.style.width=Math.max(0,this.cell.offsetWidth-this.er.offsetLeft-2)+"px";
        this.er.firstChild.focus();
        if (_isIE)
			this.er.firstChild.focus();
    }
   this.detach = function(){
        if (!this.er) return;
            this.setLabel(this.er.firstChild.value);
            this.er.className=this.er.className.replace("editable","");
            var z=(this.val!=this.er.innerHTML);

			this.obj=this.er=null;
        return (z);
    }
   this.getValue = function(){
   		return this.getLabel();
   }

    
    /**
    *   @desc: get image of treegrid item
    *   @param: content - new text of label
    *   @type: private
    */
   this.setImage = function(url){
        this.cell.parentNode.imgTag.nextSibling.src=this.grid.iconURL+url;
        this.grid._h2.get[this.cell.parentNode.idd].image=url;
   }
    /**
    *   @desc: set image of treegrid item
    *   @param: content - new text of label
    *   @type: private
    */
   this.getImage = function(){
   		return this.grid._h2.get[this.cell.parentNode.idd].image;
   }

   /**
   *   @desc: sets text representation of cell ( setLabel doesn't triger math calculations as setValue do)
   *   @param: val - new value
   *   @type: public
   */
   this.setLabel = function(val){
                  this.setValueA(val);
            }

   /**
   *   @desc: sets text representation of cell ( setLabel doesn't triger math calculations as setValue do)
   *   @param: val - new value
   *   @type: public
   */
   this.getLabel = function(val){
     return this.cell.parentNode.valTag.innerHTML;
    }
}
    /**
    *   @desc: set value of grid item
    *   @param: val  - new value (for treegrid this method only used while adding new rows)
    *   @type: private
    */
	
eXcell_tree.prototype = new eXcell;
    /**
    *   @desc: set label of treegrid item
    *   @param: content - new text of label
    *   @type: private
    */
   eXcell_tree.prototype.setValueA = function(content){
 		this.cell.parentNode.valTag.innerHTML=content;
		this.grid.callEvent("onCellChanged",[this.cell.parentNode.idd,this.cell._cellIndex,content])
    }
	eXcell_tree.prototype.setValue = function(valAr){
		if (this.cell.parentNode.imgTag)
			return this.setLabel(valAr);
			
			
		if ((this.grid._tgc.iconTree==null)||(this.grid._tgc.iconTree!=this.grid.iconTree)){
			var _tgc={};
			_tgc.spacer="<img src='"+this.grid.iconTree+"blank.gif'  align='top' class='space'>";
			_tgc.imst="<img style='margin-top:-2px;' src='"+this.grid.iconTree;
			_tgc.imsti="<img style='padding-top:2px;'  src='"+(this.grid.iconURL||this.grid.iconTree);
			_tgc.imact="' align='top' onclick='this."+(_isKHTML?"":"parentNode.")+"parentNode.parentNode.parentNode.parentNode.grid.doExpand(this);event.cancelBubble=true;'>"
			_tgc.plus=_tgc.imst+"plus.gif"+_tgc.imact;
			_tgc.minus=_tgc.imst+"minus.gif"+_tgc.imact;
			_tgc.blank=_tgc.imst+"blank.gif"+_tgc.imact;
			_tgc.start="<div class='treegrid_cell' style='overflow:hidden; white-space : nowrap; line-height:23px; height:"+(_isIE?21:23)+"px;'>";
			
			_tgc.itemim="' align='top' "+(this.grid._img_height?(" height=\""+this.grid._img_height+"\""):"")+(this.grid._img_width?(" width=\""+this.grid._img_width+"\""):"")+" ><span id='nodeval'>";
			_tgc.close="</span></div>";
			this.grid._tgc=_tgc;
		}
		var _h2=this.grid._h2;
		var _tgc=this.grid._tgc;
				
		var rid=this.cell.parentNode.idd;
		var row=this.grid._h2.get[rid];
		
		if (this.grid.kidsXmlFile || this.grid._slowParse) { 
			row.has_kids=(row.has_kids||(this.cell.parentNode._attrs["xmlkids"]&&(row.state!="minus")));
			row._xml_await=!!row.has_kids;
		}
		
		
		row.image=row.image||(this.cell._attrs["image"]||"leaf.gif");
		row.label=valAr;
               
        var html=[_tgc.start];
		
        for(var i=0;i<row.level;i++)
        	html.push(_tgc.spacer);
        
       //if has children
        if(row.has_kids){
        	html.push(_tgc.plus);
        	row.state="plus"
        	}
        else
        	html.push(_tgc.imst+row.state+".gif"+_tgc.imact);
                        
		html.push(_tgc.imsti);
		html.push(row.image);
		html.push(_tgc.itemim);
		html.push(row.label);
		html.push(_tgc.close);
		
                    

		this.cell.innerHTML=html.join("");
		this.cell._treeCell=true;
		this.cell.parentNode.imgTag=this.cell.childNodes[0].childNodes[row.level];
		this.cell.parentNode.valTag=this.cell.childNodes[0].childNodes[row.level+2];
		if (_isKHTML) this.cell.vAlign="top";
		if (row.parent.id!=0 && row.parent.state=="plus") {
				this.grid._updateTGRState(row.parent,false);
				this.cell.parentNode._skipInsert=true;		
			}

		this.grid.callEvent("onCellChanged",[rid,this.cell._cellIndex,valAr]);
	}
    
dhtmlXGridObject.prototype._process_tree_xml=function(xml,top,pid){
	this._parsing=true;
	var main=false;
	if (!top){
		this.render_row=this.render_row_tree;
		main=true;
		top=xml.getXMLTopNode(this.xml.top)	
		pid=top.getAttribute("parent")||0;
		if (pid=="0") pid=0;
		if (!this._h2)	 this._h2=new dhtmlxHierarchy();
		if (this._fake) this._fake._h2=this._h2;
	} 
	//var cr=parseInt(xml.doXPath("//"+this.xml.top)[0].getAttribute("pos")||0);
	//var total=parseInt(xml.doXPath("//"+this.xml.top)[0].getAttribute("total_count")||0);
	var rows=xml.doXPath(this.xml.row,top)
	this._open=this._open||[];
	for (var i=0; i < rows.length; i++) {
		var id=rows[i].getAttribute("id");
		if (!id) {
			id=this.uid();
			rows[i].setAttribute("id",id);
		}
		var row=this._h2.add(id,pid);
		row.buff={ idd:id, data:rows[i], _parser: this._process_xml_row, _locator:this._get_xml_data };
		if (rows[i].getAttribute("open")){
			row.state="minus";
			this._open.push(id);
		}
		
		this.rowsAr[id]=row.buff;
		this._process_tree_xml(xml,rows[i],id);
	}
	if (main){ 
		if (!rows.length) this._h2.change(pid,"state",dhtmlXGridObject._emptyLineImg);
		else if (pid!=0 && !this._srnd) {
			this._h2.change(pid,"state","minus");
		}
		for (var i=0; i < this._open.length; i++) {
			var r=this._h2.get[this._open[i]];
			if (!r.childs.length)
					r.state=dhtmlXGridObject._emptyLineImg;
		};
		
		this._updateTGRState(this._h2.get[pid]);
		this._h2_to_buff();
		if (pid!=0 && this._srnd) this.openItem(pid);
		else {
			if (this.pagingOn)
				this._renderSort();
			else
				this.render_dataset();
		}

		if (this.kidsXmlFile){
			for (var i=0; i < this._open.length; i++) {
				var r=this._h2.get[this._open[i]];
				if (r._xml_await) 
					this.expandKids({idd:r.id});
			}
		}
		this._open=[];

		if (this._slowParse===false){
			this.forEachRow(function(id){
				this.render_row_tree(0,id)
			})
		}
		this._parsing=false;
		if (pid!=0 && !this._srnd) {
		    this.callEvent("onOpenEnd",[pid,1]);
		}
	}
	return xml.xmlDoc.responseXML?xml.xmlDoc.responseXML:xml.xmlDoc;
}	
dhtmlXGridObject.prototype._h2_to_buff=function(top){
	if (!top){
		top=this._h2.get[0];
		this.rowsBuffer = new dhtmlxArray();
		if (this._fake && !this._realfake) this._fake.rowsBuffer = this.rowsBuffer;
	}
	for (var i=0; i < top.childs.length; i++) {
		this.rowsBuffer.push(top.childs[i].buff);
		if (top.childs[i].state == "minus")
			this._h2_to_buff(top.childs[i]);
	}
};
dhtmlXGridObject.prototype.render_row_tree=function(ind,id){ 
	if (id){
		var r=this._h2.get[id];
		r=r?r.buff:r;
	} else
	var r=this.rowsBuffer[ind];
	if (!r) 
		return -1;
	
	if (r._parser){
		if (this.rowsAr[r.idd] && this.rowsAr[r.idd].tagName=="TR")
			return this._h2.get[r.idd].buff=this.rowsBuffer[ind]=this.rowsAr[r.idd];
		var row=this._prepareRow(r.idd);
		this.rowsAr[r.idd]=row;

		if (!id)
			this.rowsBuffer[ind]=row;
		this._h2.get[r.idd].buff=row;	//treegrid specific
		
		r._parser.call(this,row,r.data);
		this._postRowProcessing(row);		
		
		return row;
		}
	return r;
}
    
    /**
    *   @desc: remove row from treegrid
    *   @param: node  - row object
    *   @type: private
    */
dhtmlXGridObject.prototype._removeTrGrRow=function(node,x){ 
		 if(x){
		     this._h2.forEachChild(x.id,function(x){
		     	this._removeTrGrRow(null,x);
	    		delete this.rowsAr[x.id];
    		},this);
    		return;
		 }
		 
		 var ind=this.getRowIndex(node.idd);
		 var x=this._h2.get[node.idd];
		 
		 
		 if (ind!=-1 && ind!==this.undefined){// in case of dnd we can receive delete command for some child item, which was not rendered yet
		 	var len=1;
		 	if (x && x.state=="minus") len+=this._getOpenLenght(x.id,0)
		 	for (var i=0; i<len; i++)
		 		if (this.rowsCol[i+ind])
            		this.rowsCol[i+ind].parentNode.removeChild(this.rowsCol[i+ind]);
            if (this._fake){
            	for (var i=0; i<len; i++)
            		if (this._fake.rowsCol[i+ind])
            			this._fake.rowsCol[i+ind].parentNode.removeChild(this._fake.rowsCol[i+ind]);
            	if (len>1)
            		this._fake.rowsCol.splice(ind+1,len-1);
        	}
            	
	         this.rowsCol.splice(ind,len);
	         this.rowsBuffer.splice(ind,len);
	         
	    }
	    
	    if (!x) return;
	    this._removeTrGrRow(null,x);
    		
    	delete this.rowsAr[x.id];
	
    	if (x.parent.childs.length==1){
    		this._h2.change(x.parent.id,"state",dhtmlXGridObject._emptyLineImg);
    		this._updateTGRState(x.parent);
    	}
    	this._h2.remove(x.id);
      }




/**
*   @desc: expand row
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.openItem=function(rowId){
		var y=this._h2.get[rowId||0];
        var x=this.getRowById(rowId||0);
		if (!x) return;
        if (y.parent && y.parent.id!=0)
        	this.openItem(y.parent.id);
        this.expandKids(x);
}

dhtmlXGridObject.prototype._addRowClassic=dhtmlXGridObject.prototype.addRow;

    /**
    *   @desc: add new row to treeGrid
    *   @param: new_id  - new row id
    *   @param: text  - array of row label
    *   @param: ind  - position of row (set to null, for using parentId)
    *   @param: parent_id  - id of parent row
    *   @param: img  - img url for new row
    *   @param: child - child flag [optional]
    *   @type: public
    *   @edition: Professional
    */
dhtmlXGridObject.prototype.addRow=function(new_id,text,ind,parent_id,img,child){ 
	if (!this._h2) return this._addRowClassic(new_id,text,ind);
	parent_id=parent_id||0;
	var trcol=this.cellType._dhx_find("tree");
    if (typeof(text)=="string") text=text.split(this.delim);
    var row=this._h2.get[new_id];
    if (!row){
	    if (parent_id==0) ind=this.rowsBuffer.length;
	    else{
	    	ind=this.getRowIndex(parent_id)+1;
			if (this._h2.get[parent_id].state=="minus") 
				ind+=this._getOpenLenght(parent_id,0);
            else
				this._skipInsert=true;
            }
}
	row=row||this._h2.add(new_id,parent_id);
	row.image=img;
	row.has_kids=child;
    return row.buff=this._addRowClassic(new_id,text,ind);
}
    /**
    *   @desc: add new row to treeGrid, before some other row
    *   @param: new_id  - new row id
    *   @param: text  - array of row label
    *   @param: sibl_id  - id of row, related to which new one will be added
    *   @param: img  - img url for new row
    *   @param: child - child flag [optional]
    *   @type: public
    *   @edition: Professional
    */
dhtmlXGridObject.prototype.addRowBefore=function(new_id,text,sibl_id,img,child){
	var sb=this.rowsAr[sibl_id];
	if (!sb) return;
	if (!this._h2) return this.addRow(new_id,text,this.getRowIndex(sibl_id));
	var pid=this._h2.get[sibl_id].parent.id;

	var ind=this.getRowIndex(sibl_id);
	if (ind==-1) this._skipInsert=true;
	this._h2.addBefore(new_id,pid,sibl_id);
	return this.addRow(new_id,text,ind,this._h2.get[sibl_id].parent.id,img,child);
}
    /**
    *   @desc: add new row to treeGrid, after some other row
    *   @param: new_id  - new row id
    *   @param: text  - array of row label
    *   @param: sibl_id  - id of row, related to which new one will be added
    *   @param: img  - img url for new row
    *   @param: child - child flag [optional]
    *   @type: public
    *   @edition: Professional
    */
dhtmlXGridObject.prototype.addRowAfter=function(new_id,text,sibl_id,img,child){
	var sb=this.rowsAr[sibl_id];
	if (!sb) return;
	if (!this._h2) return this.addRow(new_id,text,this.getRowIndex(sibl_id)+1);
	var pid=this._h2.get[sibl_id].parent.id;

	var ind=this.getRowIndex(sibl_id);
	if (ind==-1) this._skipInsert=true;
	if (this._h2.get[sibl_id].state=="minus") ind+=this._getOpenLenght(sibl_id,0)+1;	
	else	ind++;
	
	this._h2.addAfter(new_id,pid,sibl_id);
	return this.addRow(new_id,text,ind,pid,img,child);
}





dhtmlXGridObject.prototype.enableSmartXMLParsing=function(mode) {
	this._slowParse=convertStringToBoolean(mode);
};



    /**
    *   @desc: copy content between different rows
    *   @param: frRow  - source row object
    *   @param: from_row_id  - source row id
    *   @param: to_row_id  - target row id
    *   @type: private
    */
dhtmlXGridObject.prototype._copyTreeGridRowContent=function(frRow,from_row_id,to_row_id){
    var z=this.cellType._dhx_find("tree");
    for(i=0;i<frRow.cells.length;i++){
        if (i!=z)
           this.cells(to_row_id,i).setValue(this.cells(from_row_id,i).getValue())
        else
            this.cells(to_row_id,i).setValueA(this.cells(from_row_id,i).getValue())

    }
}

/**
*   @desc: collapse row
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.closeItem=function(rowId){
        var x=this.getRowById(rowId);
        if (!x) return;
        this.collapseKids(x);
}
/**
*   @desc: delete all childs of row in question
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.deleteChildItems=function(rowId){
        var z=this._h2.get[rowId];
        if (!z) return;
        while (z.childs.length)
            this.deleteRow(z.childs[0].id);
            
}
/**
*   @desc: get list of id of all nested rows
*   @param: rowId - id of row
*   @type:  public
*   @returns: list of id of all nested rows
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.getAllSubItems=function(rowId){
        var str=[];
        var z=this._h2.get[rowId||0];
        if (z)
        for (var i=0; i<z.childs.length; i++){
            str.push(z.childs[i].id);
            if (z.childs[i].childs.length)
            str=str.concat(this.getAllSubItems(z.childs[i].id).split(this.delim));
            }

        return str.join(this.delim);
}

/**
*   @desc: get id of child item at specified position
*   @param: rowId - id of row
*   @param: ind - child node index
*   @type:  public
*   @returns: id of child item at specified position
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.getChildItemIdByIndex=function(rowId,ind){
		var z=this._h2.get[rowId||0];
        if (!z) return null;
        return (z.childs[ind]?z.childs[ind].id:null);
}

/**
*   @desc: get real caption of tree col
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @returns: real caption of tree col
*   @topic: 7
*/
dhtmlXGridObject.prototype.getItemText=function(rowId){
        return this.cells(rowId,this.cellType._dhx_find("tree")).getLabel();
}

/**
*   @desc: return open/close state of row
*   @param: rowId - id of row
*   @type:  public
*   @returns: open/close state of row
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.getOpenState=function(rowId){
        var z=this._h2.get[rowId||0];
        if (!z) return;
        if (z.state=="minus") return true;
        return false;
}
/**
*   @desc: return id of parent row
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @returns: id of parent row
*   @topic: 7
*/
dhtmlXGridObject.prototype.getParentId=function(rowId){
        var z=this._h2.get[rowId||0];
        if ((!z) || (!z.parent)) return null;
        return z.parent.id;
}
/**
*   @desc: return list of child row id, sparated by comma
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @returns: list of child rows
*   @topic: 7
*/
dhtmlXGridObject.prototype.getSubItems=function(rowId){
      var str=[];
      var z=this._h2.get[rowId||0];
      if (z)
      	for (var i=0; i<z.childs.length; i++)
      		str.push(z.childs[i].id);
      return str.join(this.delim);
}


/**
*   @desc: expand all tree structure
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.expandAll=function(rowId){
	this._renderAllExpand(rowId||0);
	this._h2_to_buff();
	this._reset_view();
	this.setSizes();
	this.callEvent("onGridReconstructed",[]);
	if (this._redrawLines) this._redrawLines();
}
	
dhtmlXGridObject.prototype._renderAllExpand=function(z){
	var x=this._h2.get[z].childs;
	for (var i=0; i<x.length; i++){
		if (x[i].childs.length){
			this._h2.change(x[i].id,"state","minus")
			this._updateTGRState(x[i]);
			this._renderAllExpand(x[i].id)
		}
	}
}
/**
*   @desc: collapse all tree structure
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.collapseAll=function(rowId){
	this._h2.forEachChild((rowId||0),function(z){
		if (z && z.state=="minus"){
			z.state="plus";
			z.update=true;
			this._updateTGRState(z);
		}
	},this);
	this._h2_to_buff();
	this._reset_view();
	this.setSizes();
	this.callEvent("onGridReconstructed",[]);
	if (this._redrawLines) this._redrawLines();
}

/**
*   @desc: return children count
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @returns: children count
*   @topic: 7
*/
dhtmlXGridObject.prototype.hasChildren=function(rowId){
        var x=this._h2.get[rowId];
        if (x && x.childs.length) return x.childs.length;
        if (x._xml_await) return -1;
        return 0;
}


/**
*   @desc: enable/disable closing of row
*   @param: rowId - id of row
*   @param: status - true/false
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/

dhtmlXGridObject.prototype.setItemCloseable=function(rowId,status){
        var x=this._h2.get[rowId];
        if (!x) return;
        x._closeable=(!convertStringToBoolean(status));
}
/**
*   @desc: set real caption of tree col
*   @param: rowId - id of row
*   @param: newtext - new text
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.setItemText=function(rowId,newtext){
	return this.cells(rowId,this.cellType._dhx_find("tree")).setLabel(newtext);
}


/**
*   @desc: set image of tree col
*   @param: rowId - id of row
*   @param: url - image url
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.setItemImage=function(rowId,url){
	this._h2.get[rowId].image=url; 
	this.rowsAr[rowId].imgTag.nextSibling.src=(this.iconURL||"")+url; 
}

/**
*   @desc: get image of tree col
*   @param: rowId - id of row
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.getItemImage=function(rowId){
	this.getRowById(rowId);
	return this._h2.get[rowId].image;  
}


/**
*   @desc: set size of treegrid images
*   @param: width -  width of image
*   @param: height - height of image
*   @type:  public
*   @edition: Professional
*   @topic: 7
*/
dhtmlXGridObject.prototype.setImageSize=function(width,height){
        this._img_width=width;
        this._img_height=height;
}


dhtmlXGridObject.prototype._getRowImage=function(row){
	return this._h2.get[row.idd].image;    
        }


/**
*     @desc: set function called before tree node opened/closed
*     @param: func - event handling function
*     @type: public
*     @topic: 0,10
*     @event:  onOpenStart
*     @eventdesc: Event raised immideatly after item in tree got command to open/close , and before item was opened//closed. Event also raised for unclosable nodes and nodes without open/close functionality - in that case result of function will be ignored.
            Event not raised if node opened by dhtmlXtree API.
*     @eventparam: ID of node which will be opened/closed
*     @eventparam: Current open state of tree item. -1 - item closed, 1 - item opened.
*     @eventreturn: true - confirm opening/closing; false - deny opening/closing;
*/
   dhtmlXGridObject.prototype.setOnOpenStartHandler=function(func){  this.attachEvent("onOpenStart",func); };
   
/**
*     @desc: set function called after tree node opened/closed
*     @param: func - event handling function
*     @type: public
*     @topic: 0,10
*     @event:  onOpenEnd
*     @eventdesc: Event raised immideatly after item in tree got command to open/close , and before item was opened//closed. Event also raised for unclosable nodes and nodes without open/close functionality - in that case result of function will be ignored.
            Event not raised if node opened by dhtmlXtree API.
*     @eventparam: ID of node which will be opened/closed
*     @eventparam: Current open state of tree item. -1 - item closed, 1 - item opened.
*/
   dhtmlXGridObject.prototype.setOnOpenEndHandler=function(func){  this.attachEvent("onOpenEnd",func);   };


    /**
*     @desc: enable/disable editor of tree cell ; enabled by default
*     @param: mode -  (boolean) true/false
*     @type: public
*     @topic: 0
*/
   dhtmlXGridObject.prototype.enableTreeCellEdit=function(mode){
        this._edtc=!convertStringToBoolean(mode);
    };



/**
*   @desc: return level of treeGrid row
*   @param: rowId - id of row
*   @type:  public
*   @returns: level of treeGrid row
*   @topic: 7
*/
dhtmlXGridObject.prototype.getLevel=function(rowId){      
        var z=this._h2.get[rowId||0];
        if (!z) return -1;
        return z.level;
}

dhtmlXGridObject.prototype._fixHiddenRowsAllTG=function(ind,state){
  for (i in this.rowsAr){
     if ((this.rowsAr[i])&&(this.rowsAr[i].childNodes))
        this.rowsAr[i].childNodes[ind].style.display=state;
  }
}

dhtmlXGridObject._emptyLineImg="blank";
//(c)dhtmlx ltd. www.dhtmlx.com
