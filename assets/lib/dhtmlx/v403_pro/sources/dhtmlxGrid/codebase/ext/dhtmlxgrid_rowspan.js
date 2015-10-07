/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*   @desc: set rowspan with specified length starting from specified cell
*   @param: rowID - row Id
*	@param: colInd - column index
*	@param: length - length of rowspan
*	@edition: professional
*   @type:  public
*/
dhtmlXGridObject.prototype.setRowspan=function(rowID,colInd,length){
    var c=this[this._bfs_cells?"_bfs_cells":"cells"](rowID,colInd).cell;    
   var r=this.rowsAr[rowID];

   if (c.rowSpan && c.rowSpan!=1){
		var ur=r.nextSibling;   
		for (var i=1; i<c.rowSpan; i++){
			var tc=ur.childNodes[ur._childIndexes[c._cellIndex+1]]
			var ti=document.createElement("TD"); 
			ti.innerHTML="&nbsp;"; 
			ti._cellIndex=c._cellIndex;
			ti._clearCell=true;
			if (tc)
				tc.parentNode.insertBefore(ti,tc);
			else
				ur.parentNode.appendChild(ti);
			this._shiftIndexes(ur,c._cellIndex,-1);
	    	ur=ur.nextSibling;
	    }
    }

    c.rowSpan=length;
    if (!this._h2)
		r=r.nextSibling||this.rowsCol[this.rowsCol._dhx_find(r)+1];
	else
		r=this.rowsAr[ this._h2.get[r.idd].parent.childs[this._h2.get[r.idd].index+1].id ];
		
	var kids=[];
	for (var i=1; i<length; i++){
	    var ct=null;
		if (this._fake && !this._realfake)
		    ct=this._bfs_cells3(r,colInd).cell;
		else
		    ct=this.cells3(r,colInd).cell;
		
		

		this._shiftIndexes(r,c._cellIndex,1);
		if (ct)
    	ct.parentNode.removeChild(ct);
    	kids.push(r);
    	
    	if (!this._h2)
			r=r.nextSibling||this.rowsCol[this.rowsCol._dhx_find(r)+1];
		else { 
			var r=this._h2.get[r.idd].parent.childs[this._h2.get[r.idd].index+1];
			if (r) r=this.rowsAr[ r.id ];
		}
    }
    
    this.rowsAr[rowID]._rowSpan=this.rowsAr[rowID]._rowSpan||{};
    this.rowsAr[rowID]._rowSpan[colInd]=kids;
    if (this._fake && !this._realfake && colInd<this._fake._cCount) 
        this._fake.setRowspan(rowID,colInd,length)
}


dhtmlXGridObject.prototype._shiftIndexes=function(r,pos,ind){
		if (!r._childIndexes){
    	r._childIndexes=new Array();
        for (var z=0; z<r.childNodes.length; z++)
            r._childIndexes[z]=z;
		}
		
		for (var z=0; z<r._childIndexes.length; z++)
			if (z>pos)
            	r._childIndexes[z]=r._childIndexes[z]-ind;
				
}

/**
*   @desc: enable rowspan in grid
*   @type:  public
*	@edition: professional
*/
dhtmlXGridObject.prototype.enableRowspan=function(){
    this._erspan=true;
	this.enableRowspan=function(){};
	this.attachEvent("onAfterSorting",function(){
		if (this._dload) return; //can't be helped
		for (var i=1; i<this.obj.rows.length; i++)	
		  if (this.obj.rows[i]._rowSpan){
		  	var master=this.obj.rows[i];
		  	for (var kname in master._rowSpan){
			  	var row=master;
				var kids=row._rowSpan[kname];
			  	for (var j=0; j < kids.length; j++) {
			  		if(row.nextSibling)
			  			row.parentNode.insertBefore(kids[j],row.nextSibling);
			  		else 
			  			row.parentNode.appendChild(kids[j]);
			  		if (this._fake){ // split mode
			  		    var frow=this._fake.rowsAr[row.idd];
			  		    var fkid=this._fake.rowsAr[kids[j].idd];
			  		    if(frow.nextSibling)
			  		  	    frow.parentNode.insertBefore(fkid,frow.nextSibling);
			  		    else 
			  			  frow.parentNode.appendChild(fkid);
			  			 this._correctRowHeight(row.idd);
			  		}
			 		row=row.nextSibling;
			  	}
		    }
	  }
	  var t = this.rowsCol.stablesort;
	  this.rowsCol=new dhtmlxArray();
	  this.rowsCol.stablesort=t;
	  
	  for (var i=1; i<this.obj.rows.length; i++)	
	  	this.rowsCol.push(this.obj.rows[i]);
	  
	}) 
	
	this.attachEvent("onXLE",function(a,b,c,xml){
		for (var i=0; i<this.rowsBuffer.length; i++){
			var row = this.render_row(i);
			var childs = row.childNodes;
			for (var j=0; j<childs.length; j++){
				if (childs[j]._attrs["rowspan"]){
					this.setRowspan(row.idd,j,childs[j]._attrs["rowspan"]);
				}
			}
		}
	});
}
