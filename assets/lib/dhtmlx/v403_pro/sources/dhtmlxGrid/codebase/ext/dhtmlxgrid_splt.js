/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/*
    Limitation:
        a) Width of column in px
        b) Grid not autoresizable
        c) Initialize grid in visible state
*/

dhtmlXGridObject.prototype._init_point_bspl=dhtmlXGridObject.prototype._init_point;
dhtmlXGridObject.prototype._init_point = function(){
    if (this._split_later)
        this.splitAt(this._split_later);
   this._init_point=this._init_point_bspl;
   if (this._init_point) this._init_point();
}


/**
*   @desc:  split grid in two parts, with separate scrolling
*   @param:  ind - index of column to split after
*   @edition: Professional
*   @type:  public$
*/
dhtmlXGridObject.prototype.splitAt=function(ind){
    if (!this.obj.rows[0]) return this._split_later=ind;
    ind=parseInt(ind);
    
    var leftBox=document.createElement("DIV");
    this.entBox.appendChild(leftBox);
    var rightBox=document.createElement("DIV");
    this.entBox.appendChild(rightBox);
    
    for (var i=this.entBox.childNodes.length-3; i>=0; i--)
    	rightBox.insertBefore(this.entBox.childNodes[i],rightBox.firstChild);
    
    this.entBox.style.position="relative";	
    this.globalBox=this.entBox;
    this.entBox=rightBox; rightBox.grid=this;
    

    leftBox.style.cssText+="border:0px solid red !important;";
    rightBox.style.cssText+="border:0px solid red !important;";
    
	rightBox.style.top="0px";
    rightBox.style.position="absolute";
        
    leftBox.style.position="absolute";
    leftBox.style.top="0px";
    leftBox.style.left="0px";
    leftBox.style.zIndex=11;
        
    rightBox.style.height=leftBox.style.height=this.globalBox.clientHeight;
    
    
    this._fake=new dhtmlXGridObject(leftBox);
    
    this.globalBox=this._fake.globalBox=this.globalBox;
    this._fake._fake=this;
    this._fake._realfake=true;
    
	//copy properties    
    this._treeC=this.cellType._dhx_find("tree");
    this._fake.delim=this.delim;
    this._fake.customGroupFormat=this.customGroupFormat;
    
    this._fake.setImagesPath(this._imgURL);
    this._fake.iconURL = this.iconURL;
    this._fake._customSorts=this._customSorts;
	this._fake.noHeader=this.noHeader;
	this._fake._enbTts=this._enbTts;
	this._fake._htkebl = this._htkebl;
	this._fake.clists = this.clists;
    this._fake.fldSort=new Array();
    this._fake.selMultiRows=this.selMultiRows;
    this._fake.multiLine=this.multiLine;
    
    if (this.multiLine || this._erspan){
    	this.attachEvent("onCellChanged",this._correctRowHeight);
    	this.attachEvent("onRowAdded",this._correctRowHeight);
    	var corrector=function(){
    		this.forEachRow(function(id){
    			this._correctRowHeight(id);
			})
		};
		this.attachEvent("onPageChanged",corrector);
    	this.attachEvent("onXLE",corrector);
    	this.attachEvent("onResizeEnd",corrector);
    	if (!this._ads_count) //in case of distribute parsing - use special event instead
    		this.attachEvent("onAfterSorting",corrector);
        if (this._srnd)
            this.attachEvent("onFilterEnd", corrector);
    	this.attachEvent("onDistributedEnd",corrector);
		
    	//this._fake.attachEvent("onCellChanged",this._correctRowHeight);
    	}
    this.attachEvent("onGridReconstructed",function(){
    	this._fake.objBox.scrollTop = this.objBox.scrollTop;
	})
    
	this._fake.loadedKidsHash=this.loadedKidsHash;
	if (this._h2) this._fake._h2=this._h2;
	this._fake._dInc=this._dInc;
	
	//collect grid configuraton
    var b_ha=[[],[],[],[],[],[],[]];
    var b_ar=["hdrLabels","initCellWidth","cellType","cellAlign","cellVAlign","fldSort","columnColor"];
    var b_fu=["setHeader","setInitWidths","setColTypes","setColAlign","setColVAlign","setColSorting","setColumnColor"];

    this._fake.callEvent=function(){
    	var result = true;
    	this._fake._split_event=true;
    	var hidden = (arguments[0] == "onScroll");
    	if (arguments[0]=="onGridReconstructed" || hidden)
    		this._fake.callEvent.apply(this,arguments);
    	
    	if (!hidden) result = this._fake.callEvent.apply(this._fake,arguments);
    	this._fake._split_event=false;	
    	return result;
    }
    	
    if (this._elmn)
		this._fake.enableLightMouseNavigation(true);

    if (this.__cssEven||this._cssUnEven)
        this._fake.attachEvent("onGridReconstructed",function(){
            this._fixAlterCss();
        });

	this._fake._cssEven=this._cssEven;
	this._fake._cssUnEven=this._cssUnEven;
	this._fake._cssSP=this._cssSP;
	this._fake.isEditable=this.isEditable;
	this._fake._edtc=this._edtc;
	if (this._sst) this._fake.enableStableSorting(true);

	this._fake._sclE=this._sclE;
	this._fake._dclE=this._dclE;
	this._fake._f2kE=this._f2kE;
	this._fake._maskArr=this._maskArr;
	this._fake._dtmask=this._dtmask;
	this._fake.combos=this.combos;

    var width=0;

	var m_w=this.globalBox.offsetWidth;
    for (var i=0; i<ind; i++){
        for (var j=0; j<b_ar.length; j++){
            if (this[b_ar[j]])
                b_ha[j][i]=this[b_ar[j]][i];
            if (typeof b_ha[j][i] == "string") b_ha[j][i]=b_ha[j][i].replace(new RegExp("\\"+this.delim,"g"),"\\"+this.delim);
        }
        if (_isFF) b_ha[1][i]=b_ha[1][i]*1;
		if ( this.cellWidthType == "%"){
			b_ha[1][i]=Math.round(parseInt(this[b_ar[1]][i])*m_w/100);
			width+=b_ha[1][i];
		} else
	        width+=parseInt(this[b_ar[1]][i]);
        	this.setColumnHidden(i,true);
        }


    for (var j=0; j<b_ar.length; j++){
        var str=b_ha[j].join(this.delim);
       
	if (b_fu[j]!="setHeader"){
		if (str!="")
    		this._fake[b_fu[j]](str);
	} else
	    this._fake[b_fu[j]](str,null,this._hstyles);
    }


	this._fake._strangeParams=this._strangeParams;
    this._fake._drsclmn=this._drsclmn;

	width = Math.min(this.globalBox.offsetWidth, width);
    rightBox.style.left=width+"px";    leftBox.style.width=width+"px";
    rightBox.style.width=Math.max(this.globalBox.offsetWidth-width,0);

    if (this._ecspn) this._fake._ecspn=true;

//    this._fake.setNoHeader(true);
    this._fake.init();
    if (this.dragAndDropOff)
		this.dragger.addDragLanding(this._fake.entBox, this);
		
    this._fake.objBox.style.overflow="hidden";
    if (!dhtmlx.$customScroll)
    	this._fake.objBox.style.overflowX="scroll";
	else    
		this._fake.objBox._custom_scroll_mode = "";

   	this._fake._srdh=this._srdh||20;
   	this._fake._srnd=this._srnd;


   	var selfmaster = this;
	function _on_wheel(e){
		var dir  = e.wheelDelta/-40;
		if (e.wheelDelta === window.undefined)
			dir = e.detail;
		var cont = selfmaster.objBox;
		cont.scrollTop += dir*40;
		if (e.preventDefault)
			e.preventDefault();
	}
	dhtmlxEvent(this._fake.objBox,"mousewheel",_on_wheel);
	dhtmlxEvent(this._fake.objBox,"DOMMouseScroll",_on_wheel);


//inner methods

	
		function change_td(a,b){ 
			b.style.whiteSpace="";
			var c=b.nextSibling;
			var cp=b.parentNode;
			a.parentNode.insertBefore(b,a);
			if (!c)
				cp.appendChild(a);
			else
				cp.insertBefore(a,c);
			var z=a.style.display;
			a.style.display=b.style.display;
			b.style.display=z;
				}
		function proc_hf(i,rows,mode,frows){
			var temp_header=(new Array(ind)).join(this.delim);
			var temp_rspan=[];
			if (i==2)
				for (var k=0; k<ind; k++){
					var r=rows[i-1].cells[rows[i-1]._childIndexes?rows[i-1]._childIndexes[k]:k];
					if (r.rowSpan && r.rowSpan>1){
						temp_rspan[r._cellIndex]=r.rowSpan-1;
						frows[i-1].cells[frows[i-1]._childIndexes?frows[i-1]._childIndexes[k]:k].rowSpan=r.rowSpan;
						r.rowSpan=1;
					}
				}
				
				for (i; i<rows.length; i++){
					this._fake.attachHeader(temp_header,null,mode);
					frows=frows||this._fake.ftr.childNodes[0].rows;
					var max_ind=ind;
					var r_cor=0;
					for (var j=0; j<max_ind; j++){
						
						if (temp_rspan[j]) { 
							temp_rspan[j]=temp_rspan[j]-1;
							if (_isIE || (_isFF && _FFrv >= 1.9 ) || _isOpera) {
								var td=document.createElement("TD");
								if (_isFF) td.style.display="none";
								rows[i].insertBefore(td,rows[i].cells[0])
							}
							
							r_cor++;
							continue;
						}

						var a=frows[i].cells[j-r_cor];
						var b=rows[i].cells[j-(_isIE?0:r_cor)];
						var t=b.rowSpan;
						
						change_td(a,b);
						if (t>1){ 
							temp_rspan[j]=t-1;
							b.rowSpan=t;
						}
						if (frows[i].cells[j].colSpan>1){
							rows[i].cells[j].colSpan=frows[i].cells[j].colSpan;
							max_ind-=frows[i].cells[j].colSpan-1;
							for (var k=1; k < frows[i].cells[j].colSpan; k++) 
								frows[i].removeChild(frows[i].cells[j+1]);
				}
		}
	}
		}
		
		if (this.hdr.rows.length>2)
			proc_hf.call(this,2,this.hdr.rows,"_aHead",this._fake.hdr.rows);
		if (this.ftr){
			proc_hf.call(this,1,this.ftr.childNodes[0].rows,"_aFoot");
			this._fake.ftr.parentNode.style.bottom=(_isFF?2:1)+"px";
		}
		

        if (this.saveSizeToCookie){
		   this.saveSizeToCookie=function(name,cookie_param){
		   		if (this._realfake)
					return this._fake.saveSizeToCookie.apply(this._fake,arguments);

				if (!name) name=this.entBox.id;
				var z=new Array();
				var n="cellWidthPX";
		
				for (var i=0; i<this[n].length; i++)
					if (i<ind)
						z[i]=this._fake[n][i];
					else
						z[i]=this[n][i];
				z=z.join(",")
				this.setCookie(name,cookie_param,0,z);
				var z=(this.initCellWidth||(new  Array)).join(",");
				this.setCookie(name,cookie_param,1,z);

			    return true;
			}
		this.loadSizeFromCookie=function(name){
			if (!name) name=this.entBox.id;
			var z=this._getCookie(name,1);

			if (!z) return
			this.initCellWidth=z.split(",");
			var z=this._getCookie(name,0);
			var n="cellWidthPX";
			this.cellWidthType="px";
			
            var summ2=0;
			if ((z)&&(z.length)){
				z=z.split(",");
				for (var i=0; i<z.length; i++)
					if (i<ind){
					   this._fake[n][i]=z[i];
					   summ2+=z[i]*1;
					   }
					else
					   this[n][i]=z[i];
			}

    		this._fake.entBox.style.width=summ2+"px";
    		this._fake.objBox.style.width=summ2+"px";
   			var pa=this.globalBox.childNodes[1];
			    pa.style.left=summ2-(_isFF?0:0)+"px";
			if (this.ftr)
	    		this.ftr.style.left=summ2-(_isFF?0:0)+"px";
    			pa.style.width=this.globalBox.offsetWidth-summ2+"px";

			this.setSizes();
		    return true;
		}
		   	this._fake.onRSE=this.onRSE;
		}


			this.setCellTextStyleA=this.setCellTextStyle;
			this.setCellTextStyle=function(row_id,i,styleString){
				if  (i<ind) this._fake.setCellTextStyle(row_id,i,styleString);
				this.setCellTextStyleA(row_id,i,styleString);
			}
			this.setRowTextBoldA=this.setRowTextBold;
   			this.setRowTextBold = function(row_id){
				this.setRowTextBoldA(row_id);
				this._fake.setRowTextBold(row_id);
            }
            
            this.setRowColorA=this.setRowColor;
   			this.setRowColor = function(row_id,color){
				this.setRowColorA(row_id,color);
				this._fake.setRowColor(row_id,color);
            } 
                       
			this.setRowHiddenA=this.setRowHidden;
   			this.setRowHidden = function(id,state){
				this.setRowHiddenA(id,state);
				this._fake.setRowHidden(id,state);
            }

			this.setRowTextNormalA=this.setRowTextNormal;
   			this.setRowTextNormal = function(row_id){
				this.setRowTextNormalA(row_id);
				this._fake.setRowTextNormal(row_id);
            }


			this.getChangedRows = function(and_added){
				var res = new Array();
				function test(row){
						for (var j = 0; j < row.childNodes.length; j++) 
							if (row.childNodes[j].wasChanged)
								return res[res.length]=row.idd;
				}
				this.forEachRow(function(id){
					var row = this.rowsAr[id];
					var frow = this._fake.rowsAr[id];
					if (row.tagName!="TR" || !frow || frow.tagName!="TR") return;
					if (and_added && row._added)
						res[res.length]=row.idd;
					else{
						if (!test(row)) test(frow);
					}
				});
				return res.join(this.delim);
			};
			this.setRowTextStyleA=this.setRowTextStyle;
   			this.setRowTextStyle = function(row_id,styleString){
				this.setRowTextStyleA(row_id,styleString);
				if (this._fake.rowsAr[row_id])
				this._fake.setRowTextStyle(row_id,styleString);
            }

			this.lockRowA = this.lockRow;
			this.lockRow = function(id,mode){ this.lockRowA(id,mode); this._fake.lockRow(id,mode); }
			
			this.getColWidth = function(i){
				if  (i<ind) return parseInt(this._fake.cellWidthPX[i]);
				else return parseInt(this.cellWidthPX[i]);
            };
            this.getColumnLabel = function(i){
            	return this._fake.getColumnLabel.apply(((i<ind)?this._fake:this) ,arguments);
            };
			this.setColWidthA=this._fake.setColWidthA=this.setColWidth;
			this.setColWidth = function(i,value){
				i=i*1;
				if  (i<ind) this._fake.setColWidthA(i,value);
				else this.setColWidthA(i,value);
				if ((i+1)<=ind) this._fake._correctSplit(Math.min(this._fake.objBox.offsetWidth,this._fake.obj.offsetWidth));
            }
			this.adjustColumnSizeA=this.adjustColumnSize;
			this.setColumnLabelA=this.setColumnLabel;
			this.setColumnLabel=function(a,b,c,d){
				var that  = this;
				if (a<ind) that = this._fake;
				return this.setColumnLabelA.apply(that,[a,b,c,d]);
			}
			this.adjustColumnSize=function(aind,c){
				if  (aind<ind) {
					if (_isIE) this._fake.obj.style.tableLayout="";
					this._fake.adjustColumnSize(aind,c);
					if (_isIE) this._fake.obj.style.tableLayout="fixed";
				    this._fake._correctSplit();
					}
				else return this.adjustColumnSizeA(aind,c);
			}

            var zname="cells";
            this._bfs_cells=this[zname];
            this[zname]=function(){
                    if (arguments[1]<ind){
                        return this._fake.cells.apply(this._fake,arguments);
                    } else
                        return this._bfs_cells.apply(this,arguments);
                    }
            
            this._bfs_isColumnHidden=this.isColumnHidden;        
            this.isColumnHidden=function(){
				if (parseInt(arguments[0])<ind)
					return this._fake.isColumnHidden.apply(this._fake,arguments);
				else
					return this._bfs_isColumnHidden.apply(this,arguments);
            }                    


            this._bfs_setColumnHidden=this.setColumnHidden;        
            this.setColumnHidden=function(){
                    if (parseInt(arguments[0])<ind){
                        this._fake.setColumnHidden.apply(this._fake,arguments);
                        return this._fake._correctSplit();
            		}
                    else
                        return this._bfs_setColumnHidden.apply(this,arguments);
                    }                    

            var zname="cells2";
            this._bfs_cells2=this[zname];
            this[zname]=function(){
                    if (arguments[1]<ind)
                        return this._fake.cells2.apply(this._fake,arguments);
                    else
                        return this._bfs_cells2.apply(this,arguments);
                    }

            var zname="cells3";
            this._bfs_cells3=this[zname];
            this[zname]=function(a,b){
                    if (arguments[1]<ind && this._fake.rowsAr[arguments[0].idd]){
                        //fall back for totally rowspanned row
                        if (this._fake.rowsAr[a.idd] && this._fake.rowsAr[a.idd].childNodes.length==0)  return this._bfs_cells3.apply(this,arguments);
                        arguments[0]=arguments[0].idd;
                        return this._fake.cells.apply(this._fake,arguments);
                        }
                    else
                        return this._bfs_cells3.apply(this,arguments);
                    }

            var zname="changeRowId";
            this._bfs_changeRowId=this[zname];
            this[zname]=function(){
                this._bfs_changeRowId.apply(this,arguments);
                if (this._fake.rowsAr[arguments[0]])
                	this._fake.changeRowId.apply(this._fake,arguments);
            }
            this._fake.getRowById=function(id){
            	var row = this.rowsAr[id];
            	if (!row && this._fake.rowsAr[id]) row=this._fake.getRowById(id);
				
			
				if (row){
					if (row.tagName != "TR"){
						for (var i = 0; i < this.rowsBuffer.length; i++)
							if (this.rowsBuffer[i] && this.rowsBuffer[i].idd == id)
								return this.render_row(i);
						if (this._h2) return this.render_row(null,row.idd);
					}
					return row;
				}
				return null;
			}

            if (this.collapseKids){
				//tree grid
	            this._fake["_bfs_collapseKids"]=this.collapseKids;
				this._fake["collapseKids"]=function(){
					return this._fake["collapseKids"].apply(this._fake,[this._fake.rowsAr[arguments[0].idd]]);
				}
				
	            this["_bfs_collapseKids"]=this.collapseKids;
				this["collapseKids"]=function(){
					var z=this["_bfs_collapseKids"].apply(this,arguments);
					this._fake._h2syncModel();
					if (!this._cssSP) this._fake._fixAlterCss();
				}				
				
				
	            this._fake["_bfs_expandKids"]=this.expandKids;
				this._fake["expandKids"]=function(){
					this._fake["expandKids"].apply(this._fake,[this._fake.rowsAr[arguments[0].idd]]);
					if (!this._cssSP) this._fake._fixAlterCss();
				}
				

				this["_bfs_expandAll"]=this.expandAll;
				this["expandAll"]=function(){
					this._bfs_expandAll();
					this._fake._h2syncModel();
					if (!this._cssSP) this._fake._fixAlterCss();
				}

				this["_bfs_collapseAll"]=this.collapseAll;
				this["collapseAll"]=function(){
					this._bfs_collapseAll();
					this._fake._h2syncModel();
					if (!this._cssSP) this._fake._fixAlterCss();
				}								
				
	            this["_bfs_expandKids"]=this.expandKids;
				this["expandKids"]=function(){
					var z=this["_bfs_expandKids"].apply(this,arguments);
					this._fake._h2syncModel();
					if (!this._cssSP) this._fake._fixAlterCss();
				}				
				
				this._fake._h2syncModel=function(){
					if (this._fake.pagingOn) this._fake._renderSort();
					else this._renderSort();
				}
				this._updateTGRState=function(a){
					return this._fake._updateTGRState(a);
				}
			}



				//split


      if (this._elmnh){
			this._setRowHoverA=this._fake._setRowHoverA=this._setRowHover;
			this._unsetRowHoverA=this._fake._unsetRowHoverA=this._unsetRowHover;
			this._setRowHover=this._fake._setRowHover=function(){
				var that=this.grid;
				that._setRowHoverA.apply(this,arguments);
				var z=(_isIE?event.srcElement:arguments[0].target);
				z=that._fake.rowsAr[that.getFirstParentOfType(z,'TD').parentNode.idd];
				if (z){
					that._fake._setRowHoverA.apply(that._fake.obj,[{target:z.childNodes[0]},arguments[1]]);
				   	}
			};
			this._unsetRowHover=this._fake._unsetRowHover=function(){
				if (arguments[1]) var that=this;
				else	var that=this.grid;
				that._unsetRowHoverA.apply(this,arguments);
				that._fake._unsetRowHoverA.apply(that._fake.obj,arguments);
			};
		  		this._fake.enableRowsHover(true,this._hvrCss);
		  		this.enableRowsHover(false);
		  		this.enableRowsHover(true,this._fake._hvrCss);
			}

			this._updateTGRState=function(z){ 
				if (!z.update || z.id==0) return;
				if (this.rowsAr[z.id].imgTag)
					this.rowsAr[z.id].imgTag.src=this.iconTree+z.state+".gif";
				if (this._fake.rowsAr[z.id] && this._fake.rowsAr[z.id].imgTag)
					this._fake.rowsAr[z.id].imgTag.src=this.iconTree+z.state+".gif";
				z.update=false;
			}
			this.copy_row=function(row){
				    var x=row.cloneNode(true);
                    x._skipInsert=row._skipInsert;
                    var r_ind=ind;
                    x._attrs={};
                    x._css = row._css;
                    
                    if (this._ecspn){
                    	r_ind=0;
                    	for (var i=0; (r_ind<x.childNodes.length && i<ind); i+=(x.childNodes[r_ind].colSpan||1))
                    		r_ind++;
                    }
                                
                    while (x.childNodes.length>r_ind)
                        x.removeChild(x.childNodes[x.childNodes.length-1]);
                        var zm=r_ind;
                    for (var i=0; i<zm; i++){
                    	
						if (this.dragAndDropOff)
							this.dragger.addDraggableItem(x.childNodes[i], this);                        
                        x.childNodes[i].style.display=(this._fake._hrrar?(this._fake._hrrar[i]?"none":""):"");
                        x.childNodes[i]._cellIndex=i;
                        //TODO - more universal solution
                        x.childNodes[i].combo_value=arguments[0].childNodes[i].combo_value;
                        x.childNodes[i]._clearCell=arguments[0].childNodes[i]._clearCell;
                        x.childNodes[i]._cellType=arguments[0].childNodes[i]._cellType;
						x.childNodes[i]._brval=arguments[0].childNodes[i]._brval;
						x.childNodes[i].val =arguments[0].childNodes[i].val;
						x.childNodes[i]._attrs=arguments[0].childNodes[i]._attrs;
						x.childNodes[i].chstate=arguments[0].childNodes[i].chstate;
						if (row._attrs['style']) x.childNodes[i].style.cssText+=";"+row._attrs['style'];
						

                        if(x.childNodes[i].colSpan>1) 
                            this._childIndexes=this._fake._childIndexes;
                            }
                    
                    if (this._h2 && this._treeC < ind){
						var trow=this._h2.get[arguments[0].idd];
                		x.imgTag=x.childNodes[this._treeC].childNodes[0].childNodes[trow.level];
						x.valTag=x.childNodes[this._treeC].childNodes[0].childNodes[trow.level+2];
                        }

					
                        x.idd=row.idd;
                        x.grid=this._fake;
                        
                	return x;
                        	}
                    	
            var zname="_insertRowAt";
            this._bfs_insertRowAt=this[zname];
            this[zname]=function(){ 
                        var r=this["_bfs_insertRowAt"].apply(this,arguments);
                        arguments[0]=this.copy_row(arguments[0]);

                        var r2=this._fake["_insertRowAt"].apply(this._fake,arguments);
                        if (r._fhd){
							r2.parentNode.removeChild(r2);
                            this._fake.rowsCol._dhx_removeAt(this._fake.rowsCol._dhx_find(r2));
							r._fhd=false;
						}

						return r;
            }
            /*
var quirks = (_isIE && document.compatMode=="BackCompat");
		
		var isVScroll = this.parentGrid?false:(this.objBox.scrollHeight > this.objBox.offsetHeight);
		var isHScroll = this.parentGrid?false:(this.objBox.scrollWidth > this.objBox.offsetWidth); 
		var scrfix = _isFF?20:18;
		
		var outerBorder=(this.entBox.offsetWidth-this.entBox.clientWidth)/2;
				
		var gridWidth=this.entBox.clientWidth;
		var gridHeight=this.entBox.clientHeight;
		*/
            this._bfs_setSizes=this.setSizes;
            this.setSizes=function(){
            		if (this._notresize) return;
                	this._bfs_setSizes(this,arguments);
                	
					this.sync_headers()
					if (this.sync_scroll() && this._ahgr) this.setSizes(); //if scrolls was removed - check once more to correct auto-height
					
					var height = this.dontSetSizes ? (this.entBox.offsetHeight+"px") : this.entBox.style.height;
					this._fake.entBox.style.height = height;

                    this._fake.objBox.style.height=this.objBox.style.height;
                    this._fake.hdrBox.style.height=this.hdrBox.style.height;
                    
                    this._fake.objBox.scrollTop=this.objBox.scrollTop;
                    
                    this._fake.setColumnSizes(this._fake.entBox.clientWidth);
                    
                    this.globalBox.style.width=parseInt(this.entBox.style.width)+parseInt(this._fake.entBox.style.width);
                    if (!this.dontSetSizes)
                    	this.globalBox.style.height = height;
                    
            }
            
            this.sync_scroll=this._fake.sync_scroll=function(end){
            		var old=this.objBox.style.overflowX;
            	    if (this.obj.offsetWidth<=this.objBox.offsetWidth)
                    {
                    	if (!end) return this._fake.sync_scroll(true);
                        this.objBox.style.overflowX="hidden";
                        this._fake.objBox.style.overflowX="hidden";
                    }
                    else if (!dhtmlx.$customScroll){
                        this.objBox.style.overflowX="scroll";
                        this._fake.objBox.style.overflowX="scroll";
                    }
                    return old!=this.objBox.style.overflowX;
        	}
            this.sync_headers=this._fake.sync_headers=function(){
            	if (this.noHeader || (this._fake.hdr.scrollHeight==this.hdr.offsetHeight)) return;
            //	if (this.hdr.rows.length!=2){
            		for (var i=1; i<this.hdr.rows.length; i++){
            			var td = ind;
            			while (!this.hdr.rows[i].childNodes[td]) td--;
            			var ha=Math.min(this.hdr.rows[i].childNodes[td].scrollHeight+2, this.hdr.rows[i].scrollHeight);
						var hb=this._fake.hdr.rows[i].scrollHeight;
						if (ha!=hb)
							this._fake.hdr.rows[i].style.height=this.hdr.rows[i].style.height=Math.max(ha,hb)+"px";
						if (window._KHTMLrv) 
							this._fake.hdr.rows[i].childNodes[0].style.height=this.hdr.rows[i].childNodes[td].style.height=Math.max(ha,hb)+"px";
					}
					this._fake.sync_headers;
			//	} else this._fake.hdr.style.height=this.hdr.offsetHeight+"px";
        	}
        	this._fake._bfs_setSizes=this._fake.setSizes;
            this._fake.setSizes=function(){
            		if (this._fake._notresize) return;
            		this._fake.setSizes();
            }

            var zname="_doOnScroll";
            this._bfs__doOnScroll=this[zname];
            this[zname]=function(){
                    this._bfs__doOnScroll.apply(this,arguments);
                    this._fake.objBox.scrollTop=this.objBox.scrollTop;
                    this._fake["_doOnScroll"].apply(this._fake,arguments);
            }
            
            var zname="selectAll";
            this._bfs__selectAll=this[zname];
            this[zname]=function(){
                    this._bfs__selectAll.apply(this,arguments);
                    this._bfs__selectAll.apply(this._fake,arguments);
            }
            
            



            var zname="doClick";
            this._bfs_doClick=this[zname];
            this[zname]=function(){
                    this["_bfs_doClick"].apply(this,arguments);
                        if (arguments[0].tagName=="TD"){
                            var fl=(arguments[0]._cellIndex>=ind);
							if (!arguments[0].parentNode.idd) return;
							if (!fl)
                            	arguments[0].className=arguments[0].className.replace(/cellselected/g,"");
                            //item selected but it left part not rendered yet
							if (!this._fake.rowsAr[arguments[0].parentNode.idd])
								this._fake.render_row(this.getRowIndex(arguments[0].parentNode.idd));
                            arguments[0]=this._fake.cells(arguments[0].parentNode.idd,(fl?0:arguments[0]._cellIndex)).cell;
                            if (fl) this._fake.cell=null;
                            this._fake["_bfs_doClick"].apply(this._fake,arguments);
                            if (fl) this._fake.cell=this.cell;
                            else this.cell=this._fake.cell;
                            if (this._fake.onRowSelectTime) clearTimeout(this._fake.onRowSelectTime)
                            if (fl) {
                                arguments[0].className=arguments[0].className.replace(/cellselected/g,"");
                                globalActiveDHTMLGridObject=this;
                                this._fake.cell=this.cell;                                
                                }
                            else{
                                this.objBox.scrollTop=this._fake.objBox.scrollTop;
	                            }
                        }
            }
            this._fake._bfs_doClick=this._fake[zname];
            this._fake[zname]=function(){
                    this["_bfs_doClick"].apply(this,arguments);
                        if (arguments[0].tagName=="TD"){
                            var fl=(arguments[0]._cellIndex<ind);
							if (!arguments[0].parentNode.idd) return;
                            arguments[0]=this._fake._bfs_cells(arguments[0].parentNode.idd,(fl?ind:arguments[0]._cellIndex)).cell;
                            this._fake.cell=null;
this._fake["_bfs_doClick"].apply(this._fake,arguments);
							this._fake.cell=this.cell;
                            if (this._fake.onRowSelectTime) clearTimeout(this._fake.onRowSelectTime)
                            if (fl) {
                                arguments[0].className=arguments[0].className.replace(/cellselected/g,"");
                                globalActiveDHTMLGridObject=this;
								this._fake.cell=this.cell;                                
								this._fake.objBox.scrollTop=this.objBox.scrollTop;
                                }
                        }
            }


this.clearSelectionA = this.clearSelection;
this.clearSelection = function(mode){
    if (mode) this._fake.clearSelection();
    this.clearSelectionA();
}


this.moveRowUpA = this.moveRowUp;
this.moveRowUp = function(row_id){
	if (!this._h2)
    	this._fake.moveRowUp(row_id);
    this.moveRowUpA(row_id);
    if (this._h2) this._fake._h2syncModel();
}
this.moveRowDownA = this.moveRowDown;
this.moveRowDown = function(row_id){
	if (!this._h2)
    	this._fake.moveRowDown(row_id);
    this.moveRowDownA(row_id);
    if (this._h2) this._fake._h2syncModel();
}



this._fake.getUserData=function(){	return this._fake.getUserData.apply(this._fake,arguments); }
this._fake.setUserData=function(){	return this._fake.setUserData.apply(this._fake,arguments); }

this.getSortingStateA=this.getSortingState;
this.getSortingState = function(){
	var z=this.getSortingStateA();
	if (z.length!=0) return z;
	return this._fake.getSortingState();
}

this.setSortImgStateA=this._fake.setSortImgStateA=this.setSortImgState;
this.setSortImgState = function(a,b,c,d){
	this.setSortImgStateA(a,b,c,d);
	if (b*1<ind) {
		this._fake.setSortImgStateA(a,b,c,d);
		this.setSortImgStateA(false);
	} else 
		this._fake.setSortImgStateA(false);
}


this._fake.doColResizeA = this._fake.doColResize;
this._fake.doColResize = function(ev,el,startW,x,tabW){ 
    var a=-1;
    var z=0;
    if (arguments[1]._cellIndex==(ind-1)){
            a = this._initalSplR + (ev.clientX-x);
            if (!this._initalSplF) this._initalSplF=arguments[3]+this.objBox.scrollWidth-this.objBox.offsetWidth;
            if (this.objBox.scrollWidth==this.objBox.offsetWidth && (this._fake.alter_split_resize || (ev.clientX-x)>0 )){
            	arguments[3]=(this._initalSplF||arguments[3]);
            	z=this.doColResizeA.apply(this,arguments);
            } 
            else
            	z=this.doColResizeA.apply(this,arguments);
    }
    else{
        if (this.obj.offsetWidth<this.entBox.offsetWidth)
    		a=this.obj.offsetWidth;
    	z=this.doColResizeA.apply(this,arguments);
	}
	
	this._correctSplit(a);
	this.resized=this._fake.resized=1;
    return z;
}

		this._fake.changeCursorState = function(ev){
                     var el = ev.target||ev.srcElement;
                     if(el.tagName!="TD")
                           el = this.getFirstParentOfType(el,"TD")
                           if ((el.tagName=="TD")&&(this._drsclmn)&&(!this._drsclmn[el._cellIndex])) return;
                           var check = (ev.layerX||0)+(((!_isIE)&&(ev.target.tagName=="DIV"))?el.offsetLeft:0);
                           var pos = parseInt(this.getPosition(el,this.hdrBox)); 
                           
                           if(((el.offsetWidth - (ev.offsetX||(pos-check)*-1))<(_isOpera?20:10))||((this.entBox.offsetWidth - (ev.offsetX?(ev.offsetX+el.offsetLeft):check) + this.objBox.scrollLeft - 0)<(_isOpera?20:10))){
                              el.style.cursor = "E-resize";
                           }else
                              el.style.cursor = "default";
                       if (_isOpera) this.hdrBox.scrollLeft = this.objBox.scrollLeft;
                        }
			
		this._fake.startColResizeA = this._fake.startColResize;
		this._fake.startColResize = function(ev){
                                    var z=this.startColResizeA(ev);
                                    this._initalSplR=this.entBox.offsetWidth;
                                    this._initalSplF=null;
                                    if (this.entBox.onmousemove){
                                        var m=this.entBox.parentNode;   
                                        if (m._aggrid) return z;
										m._aggrid=m.grid;   m.grid=this;
                                        this.entBox.parentNode.onmousemove=this.entBox.onmousemove;
                                        this.entBox.onmousemove=null;
                                        }
                                    return z;
								}

		this._fake.stopColResizeA = this._fake.stopColResize;
		this._fake.stopColResize = function(ev){
                                    if (this.entBox.parentNode.onmousemove){
                                        var m=this.entBox.parentNode;   m.grid=m._aggrid;   m._aggrid=null;
                                        this.entBox.onmousemove=this.entBox.parentNode.onmousemove;
                                        this.entBox.parentNode.onmousemove=null;
                                        if (this.obj.offsetWidth<this.entBox.offsetWidth)
                                        	this._correctSplit(this.obj.offsetWidth);
                                        }
                                    return this.stopColResizeA(ev);
								}



this.doKeyA = this.doKey;
this._fake.doKeyA = this._fake.doKey;
this._fake.doKey=this.doKey=function(ev){
                            if (!ev) return true;
                            if (this._htkebl) return true;
		if ((ev.target||ev.srcElement).value !== window.undefined){
			var zx = (ev.target||ev.srcElement);

			if ((!zx.parentNode)||(zx.parentNode.className.indexOf("editable") == -1))
				return true;
		}
		                            
    switch (ev.keyCode){
        case 9:
            if (!ev.shiftKey){
                if (this._realfake){
                    if ((this.cell)&&(this.cell._cellIndex==(ind-1))){
                        if (ev.preventDefault)
					       ev.preventDefault();
					   var ind_t=ind;
					   while (this._fake._hrrar && this._fake._hrrar[ind_t]) ind_t++;
                       this._fake.selectCell(this._fake.getRowIndex(this.cell.parentNode.idd),ind_t,false,false,true);
                       return false;
            		}
				  else
                       var z=this.doKeyA(ev);
                       globalActiveDHTMLGridObject=this;
                       return z;
                    }
                else{
                    if (this.cell){
                        var ind_t=this.cell._cellIndex+1;
                        while (this.rowsCol[0].childNodes[ind_t] && this.rowsCol[0].childNodes[ind_t].style.display=="none") ind_t++;
                        if (ind_t == this.rowsCol[0].childNodes.length){
					   if (ev.preventDefault)
					       ev.preventDefault();					
						var z=this.rowsBuffer[this.getRowIndex(this.cell.parentNode.idd)+1];
					    if (z) {
					    	this.showRow(z.idd);
					    	this._fake.selectCell(this._fake.getRowIndex(z.idd),0,false,false,true);
					    	return false;
				    	}
	                    }
                    }
                        return  this.doKeyA(ev);
                }
            }
            else{
                if (this._realfake){
                    if ((this.cell)&&(this.cell._cellIndex==0)){
					   if (ev.preventDefault)
					       ev.preventDefault();
					    var z=this._fake.rowsBuffer[this._fake.getRowIndex(this.cell.parentNode.idd)-1];
						if (z) {
							this._fake.showRow(z.idd);
							
							var ind_t=this._fake._cCount-1;
                        	while (z.childNodes[ind_t].style.display=="none") 
                        		ind_t--;
                        		
							this._fake.selectCell(this._fake.getRowIndex(z.idd),ind_t,false,false,true);
						}
                       return false;
                       }
                    else
                       return this.doKeyA(ev);
                    }
                else{
                    if ((this.cell)&&(this.cell._cellIndex==ind)){
					   if (ev.preventDefault)
					       ev.preventDefault();
                        this._fake.selectCell(this.getRowIndex(this.cell.parentNode.idd),ind-1,false,false,true);
                        return false;
                    }
                    else
                        return  this.doKeyA(ev);
                }
            }
       break;
    }
    return  this.doKeyA(ev);
}


this.editCellA=this.editCell;
this.editCell=function(){
	if (this.cell && this.cell.parentNode.grid != this) return this._fake.editCell();
	return this.editCellA();
}

this.deleteRowA = this.deleteRow;
this.deleteRow=function(row_id,node){
/*	if (!this._realfake)
		this._fake.loadedKidsHash=this.loadedKidsHash;*/

    if (this.deleteRowA(row_id,node)===false) return false;
    if (this._fake.rowsAr[row_id])
    	this._fake.deleteRow(row_id);
}

this.clearAllA = this.clearAll;
this.clearAll=function(){
    this.clearAllA();
    this._fake.clearAll();
}
this.editStopA = this.editStop;
this.editStop=function(mode){
	if (this._fake.editor)
		this._fake.editStop(mode);
	else 
    	this.editStopA(mode);
};


this.attachEvent("onAfterSorting",function(i,b,c){
	if (i>=ind) 
		this._fake.setSortImgState(false)
});



this._fake.sortField = function(a,b,c){ 
	this._fake.sortField.call(this._fake,a,b,this._fake.hdr.rows[0].cells[a]);
	if (this.fldSort[a]!="na" && this._fake.fldSorted){
		var mem = this._fake.getSortingState()[1];
		this._fake.setSortImgState(false);
		this.setSortImgState(true,arguments[0],mem)
	}
}

this.sortTreeRowsA = this.sortTreeRows;
this._fake.sortTreeRowsA = this._fake.sortTreeRows;
this.sortTreeRows=this._fake.sortTreeRows=function(col,type,order,ar){
    if (this._realfake) return this._fake.sortTreeRows(col,type,order,ar)

    this.sortTreeRowsA(col,type,order,ar);
    this._fake._h2syncModel();

                this._fake.setSortImgStateA(false);
	this._fake.fldSorted=null;
    }

/* SRND mode */
this._fake._fillers=[];
this._fake.rowsBuffer=this.rowsBuffer;
this.attachEvent("onClearAll",function(){
	this._fake.rowsBuffer=this.rowsBuffer;	
})
this._add_filler_s=this._add_filler;
this._add_filler=function(a,b,c,e){
	
	if (!this._fake._fillers) this._fake._fillers=[];
	if (this._realfake || !e){
		var d;
		if (c || !this._fake._fillers.length){
			if (c && c.idd) d=this._fake.rowsAr[c.idd];
			else if (c && c.nextSibling) {
				d = {};
				d.nextSibling=this._fake.rowsAr[c.nextSibling.idd];
				d.parentNode=d.nextSibling.parentNode;
			}		
		this._fake._fillers.push(this._fake._add_filler(a,b,d));
		}
	}
	
	return this._add_filler_s.apply(this,arguments);
}
this._add_from_buffer_s=this._add_from_buffer;
this._add_from_buffer=function() { 
	var res=this._add_from_buffer_s.apply(this,arguments);
	if (res!=-1){
		this._fake._add_from_buffer.apply(this._fake,arguments);
		if (this.multiLine) this._correctRowHeight(this.rowsBuffer[arguments[0]].idd);
	}
	return res;
    }
this._fake.render_row=function(ind){
	var row=this._fake.render_row(ind);

	if (row == -1) return -1;
	if (row) {
		return this.rowsAr[row.idd]=this.rowsAr[row.idd]||this._fake.copy_row(row);
    }
	return null;
        }
this._reset_view_s=this._reset_view;
this._reset_view=function(){
	this._fake._reset_view(true);
	this._fake._fillers=[];
	this._reset_view_s();
    }

this.moveColumn_s=this.moveColumn;
this.moveColumn=function(a,b){
	if (b>=ind) return this.moveColumn_s(a,b);
}

    
this.attachEvent("onCellChanged",function(id,i,val){
	if (this._split_event && i<ind && this.rowsAr[id]){
		
		var cell=this._fake.rowsAr[id];
		if (!cell) return;
		if (cell._childIndexes)
			cell=cell.childNodes[cell._childIndexes[i]];
		else
			cell=cell.childNodes[i];
		var tcell = this.rowsAr[id].childNodes[i];
	
		if (tcell._treeCell && tcell.firstChild.lastChild)
			tcell.firstChild.lastChild.innerHTML = val;
		else
			tcell.innerHTML=cell.innerHTML;
		tcell._clearCell=false;
		tcell.combo_value = cell.combo_value;
		tcell.chstate=cell.chstate;	//TODO - more universal solution
	}
})





    this._fake.combos=this.combos;
	this.setSizes();
	if (this.rowsBuffer[0]) this._reset_view();
	this.attachEvent("onXLE",function(){this._fake._correctSplit()})
	this._fake._correctSplit();
}

dhtmlXGridObject.prototype._correctSplit=function(a){ 
    a=a||(this.obj.scrollWidth-this.objBox.scrollLeft);
    a=Math.min(this.globalBox.offsetWidth, a);
    if (a>-1){
	    this.entBox.style.width=a+"px";
	    this.objBox.style.width=a+"px";
	
		var outerBorder=(this.globalBox.offsetWidth-this.globalBox.clientWidth)/2;
	    this._fake.entBox.style.left=a+"px";
	    this._fake.entBox.style.width=Math.max(0,this.globalBox.offsetWidth-a-(this.quirks?0:2)*outerBorder)+"px";
	    if (this._fake.ftr)
	    	this._fake.ftr.parentNode.style.width=this._fake.entBox.style.width;
	    if (_isIE){
		    var quirks=_isIE && !window.xmlHttpRequest;
			var outerBorder=(this.globalBox.offsetWidth-this.globalBox.clientWidth);
			this._fake.hdrBox.style.width=this._fake.objBox.style.width=Math.max(0,this.globalBox.offsetWidth-(quirks?outerBorder:0)-a)+"px";
		}
	}
}

dhtmlXGridObject.prototype._correctRowHeight=function(id,ind){
	if (!this.rowsAr[id] || !this._fake.rowsAr[id]) return;
	var h=this.rowsAr[id].offsetHeight;
	var h2=this._fake.rowsAr[id].offsetHeight;
	var max = Math.max(h,h2);
	if (!max) return;
	this.rowsAr[id].style.height=this._fake.rowsAr[id].style.height=max+"px";
	if (window._KHTMLrv) {
		var j = this._fake._cCount;
		var td;
		while (!td && j>=0){
			td = this.rowsAr[id].childNodes[j];
			j-=1;
		}
		var td2 = this._fake.rowsAr[id].firstChild;
		if (td && td2)
			td.style.height=td2.style.height=max+"px";
	}
}
//(c)dhtmlx ltd. www.dhtmlx.com
