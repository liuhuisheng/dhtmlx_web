/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*	@desc: cell with support for math formulas
*	@param: cell - cell object
*	@type:  private
*   @edition: Professional
*/
function eXcell_math(cell){
	if (cell){
		this.cell = cell;
    	this.grid = this.cell.parentNode.grid;
	}
	this.edit = function(){
		this.grid.editor = new eXcell_ed(this.cell);
		this.grid.editor.fix_self=true;
		this.grid.editor.getValue=this.cell.original?(function(){ return this.cell.original}):this.getValue;
		this.grid.editor.setValue=this.setValue;
		this.grid.editor.edit();
	}
	this.isDisabled = function(){ return !this.grid._mathEdit; }
	this.setValue = function(val){
				val=this.grid._compileSCL(val,this.cell,this.fix_self);
                if (this.grid._strangeParams[this.cell._cellIndex])
    				this.grid.cells5(this.cell,this.grid._strangeParams[this.cell._cellIndex]).setValue(val);
                else{
                    this.setCValue(val);
    	            this.cell._clearCell=false;
	            }
    }
    this.getValue = function(){
        if (this.grid._strangeParams[this.cell._cellIndex])
			return this.grid.cells5(this.cell,this.grid._strangeParams[this.cell._cellIndex]).getValue();
        
        return this.cell.innerHTML;
    }
}
eXcell_math.prototype = new eXcell;

dhtmlXGridObject.prototype._init_point_bm=dhtmlXGridObject.prototype._init_point;
dhtmlXGridObject.prototype._init_point = function(){
	this._mat_links={};
	this._aggregators=[];
	this.attachEvent("onClearAll",function(){
		this._mat_links={};
		this._aggregators=[];
	})
	this.attachEvent("onCellChanged",function(id,ind){
		if (this._mat_links[id]){ 
			var cell=this._mat_links[id][ind];
			if (cell){ 
				for (var i=0; i<cell.length; i++)
          if (cell[i].parentNode)
            this.cells5(cell[i]).setValue(this._calcSCL(cell[i]));
			}
		}
		if (!this._parsing && this._aggregators[ind]){
			var pid=this._h2.get[id].parent.id;
			if (pid!=0){
				var ed=this.cells(pid,ind);
				ed.setValue(this._calcSCL(ed.cell));
			}
		}
	})
	this.attachEvent("onAfterRowDeleted",function(id,pid){ //will be called for each delete operation, may be optimized
		if (pid!=0)
			if (!this._parsing && this._aggregators.length){
				for (var ind=0; ind < this._aggregators.length; ind++) {
					if (this._aggregators[ind]){
							var ed=this.cells(pid,ind);
							ed.setValue(this._calcSCL(ed.cell));
					}
				};
			}
		return true;
	})
	this.attachEvent("onXLE",function(){
		for (var i=0; i < this._aggregators.length; i++) {
			if (this._aggregators[i])
				this._h2.forEachChild(0,function(el){
					if (el.childs.length!=0){
						var ed=this.cells(el.id,i);
						ed.setValue(this._calcSCL(ed.cell));
					}
				},this);
		};
	})
	this._init_point=this._init_point_bm;
	if (this._init_point) this._init_point();
}

/**
*	@desc: enable/disable serialization of math formulas
*	@param: status - true/false
*	@type:  public
*   @edition: Professional
*/
dhtmlXGridObject.prototype.enableMathSerialization=function(status){
    this._mathSerialization=convertStringToBoolean(status);
}
/**
*	@desc: enable/disable rounding while math calculations
*	@param: digits - set hom many digits must be rounded, set 0 for disabling
*	@type:  public
*   @edition: Professional
*/
dhtmlXGridObject.prototype.setMathRound=function(digits){
	this._roundDl=digits;
    this._roundD=Math.pow(10,digits);
}
/**
*	@desc: enable/disable editing of math cells
*	@param: status - true/false
*	@type:  public
*   @edition: Professional
*/
dhtmlXGridObject.prototype.enableMathEditing=function(status){
    this._mathEdit=convertStringToBoolean(status);
}

/**
*	@desc: calculate value of math cell
*	@param: cell - math cell
*	@returns: cell value
*	@type:  private
*   @edition: Professional
*/
dhtmlXGridObject.prototype._calcSCL=function(cell){ 
    if (!cell._code) return this.cells5(cell).getValue();
    try{
    	dhtmlx.agrid=this;
    	var z=eval(cell._code);
    } catch(e){ return ("#SCL"); }
    if (this._roundD)
        { 
        	var pre=Math.abs(z)<1?"0":"";
         	if (z<0) pre="-"+pre;
            z=Math.round(Math.abs(z)*this._roundD).toString();
            if (z==0) return 0;
            if (this._roundDl>0){
            	var n=z.length-this._roundDl;
            	if (n<0) {
            		z=("000000000"+z).substring(9+n);
            		n=0;
            	}
            	return (pre+z.substring(0,n)+"."+z.substring(n,z.length));
            }
          return pre+z;
      }
    return z;      
}

dhtmlXGridObject.prototype._countTotal=function(row,cell){ 
	var b=0;
	var z=this._h2.get[row];
	for (var i=0; i<z.childs.length; i++){
		if (!z.childs[i].buff) return b;	// dnd of item with childs, item inserted in hierarchy but not fully processed
		if (z.childs[i].buff._parser){
			this._h2.forEachChild(row,function(el){
				if (el.childs.length==0){
          var value = parseFloat(this._get_cell_value(el.buff,cell),10);
          if (value)
					 b += value;
        }
			},this)
			return b;
		}
    var value = parseFloat(this._get_cell_value(z.childs[i].buff,cell),10);
    if (value)
		  b += value;
	}
	return b;
}

/**
*	@desc: compile pseudo code to correct javascript
*	@param: code - pseudo code
*	@param: cell - math cell
*	@returns: valid js code
*	@type:  private
*   @edition: Professional
*/
dhtmlXGridObject.prototype._compileSCL=function(code,cell,fix){ 
		if (code === null || code === window.undefined) return code;
        code=code.toString();
        if (code.indexOf("=")!=0 || !cell.parentNode) {
        	this._reLink([],cell);
        	if (fix) cell._code = cell.original = null;
            return code;
        }
        cell.original=code;
        
        var linked=null;
        code=code.replace("=","");
        if (code.indexOf("sum")!=-1){ 
            code=code.replace("sum","(dhtmlx.agrid._countTotal('"+cell.parentNode.idd+"',"+cell._cellIndex+"))");
            if (!this._aggregators) this._aggregators=[];
            this._aggregators[cell._cellIndex]="sum";
            cell._code=code;
        	return  this._parsing?"":this._calcSCL(cell);
        }
        if (code.indexOf("[[")!=-1){
          var test = /(\[\[([^\,]*)\,([^\]]*)]\])/g;
          dhtmlx.agrid=this;
          linked=linked||(new Array());
          code=code.replace(test,
              function ($0,$1,$2,$3){
                  if ($2=="-")
                      $2=cell.parentNode.idd;
                  if ($2.indexOf("#")==0)
                      $2=dhtmlx.agrid.getRowId($2.replace("#",""));
                      linked[linked.length]=[$2,$3];
                  return "(parseFloat(dhtmlx.agrid.cells(\""+$2+"\","+$3+").getValue(),10))";
              }
          );
        }
        
        if (code.indexOf(":")!=-1){ 
          var test = /:(\w+)/g;
          dhtmlx.agrid=this;
          var id=cell.parentNode.idd;
          linked=linked||(new Array());
          code=code.replace(test,
              function ($0,$1,$2,$3){
                  linked[linked.length]=[id,dhtmlx.agrid.getColIndexById($1)];
                  return '(parseFloat(dhtmlx.agrid.cells("'+id+'",dhtmlx.agrid.getColIndexById("'+$1+'")).getValue(),10))';
              }
          );
        }
        else{
          var test = /c([0-9]+)/g;
          dhtmlx.agrid=this;
          var id=cell.parentNode.idd;
          linked=linked||(new Array());
          code=code.replace(test,
              function ($0,$1,$2,$3){
                  linked[linked.length]=[id,$1];
                  return "(parseFloat(dhtmlx.agrid.cells(\""+id+"\","+$1+").getValue(),10))";
              }
          );
        }
        
        this._reLink(linked,cell);
        cell._code=code;
        return this._calcSCL(cell);
    }

/**
*	@desc: link math cells to it source cells
*	@param: ar - array of nodes for linking
*	@param: cell - math cell
*	@type:  private
*   @edition: Professional
*/
dhtmlXGridObject.prototype._reLink=function(ar,cell){
		if (!ar.length) return; // basically it would be good to clear unused math links, but it will require a symetric structure 
		for (var i=0; i<ar.length; i++){ 
			if (!this._mat_links[ar[i][0]]) this._mat_links[ar[i][0]]={};
			var t=this._mat_links[ar[i][0]];
			if (!t[ar[i][1]]) t[ar[i][1]]=[];
			t[ar[i][1]].push(cell);
		}
}

if (_isKHTML){
// replace callback support for safari.
 (function(){
   var default_replace = String.prototype.replace;
   String.prototype.replace = function(search,replace){
 // replace is not function
 if(typeof replace != "function"){
 return default_replace.apply(this,arguments)
 }
 var str = "" + this;
 var callback = replace;
 // search string is not RegExp
 if(!(search instanceof RegExp)){
 var idx = str.indexOf(search);
 return (
 idx == -1 ? str :
 default_replace.apply(str,[search,callback(search, idx, str)])
 )
 }
 var reg = search;
 var result = [];
 var lastidx = reg.lastIndex;
 var re;
 while((re = reg.exec(str)) != null){
 var idx  = re.index;
 var args = re.concat(idx, str);
 result.push(
 str.slice(lastidx,idx),
 callback.apply(null,args).toString()
 );
 if(!reg.global){
 lastidx += RegExp.lastMatch.length;
 break
 }else{
 lastidx = reg.lastIndex;
 }
 }
 result.push(str.slice(lastidx));
 return result.join("")
   }
 })();
 }
//(c)dhtmlx ltd. www.dhtmlx.com