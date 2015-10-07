/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

//beware that function started from _in_header_ must not be obfuscated


/**
*   @desc: allows to define , which level of tree must be used for filtering
*   @type: public
*   @param: level - level value, -1 value means last one
*	@edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.setFiltrationLevel=function(level,show_lower,show_upper){
	this._tr_strfltr=level;
	this._tr_fltr_c=show_lower;
	this._tr_fltr_d=show_upper;
	this.refreshFilters();
}


/**
*   @desc: filter grid by mask
*   @type: public
*   @param: column - {number} zero based index of column
*   @param: value - {string} filtering mask
*   @param: preserve - {bool} filter current or initial state ( false by default )
*	@edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.filterTreeBy=function(column, value, preserve){
	var origin = this._h2;
	if (typeof this._tr_strfltr == "undefined") this._tr_strfltr=-1;
	if (this._f_rowsBuffer){
		if (!preserve){
			this._h2=this._f_rowsBuffer;
			if (this._fake) this._fake._h2=this._h2;
		}
	} else
		this._f_rowsBuffer=this._h2;	//backup copy
	
	//if (!this.rowsBuffer.length && preserve) return;
	var d=true;
	this.dma(true)
	this._fbf={};
	if (typeof(column)=="object")
		for (var j=0; j<value.length; j++)
			this._filterTreeA(column[j],value[j]);
	else
			this._filterTreeA(column,value);
	this._fbf=null;
	this.dma(false)
	this._fix_filtered_images(this._h2,origin);
	this._renderSort()
	this.callEvent("onGridReconstructed",[])
}
dhtmlXGridObject.prototype._filterTreeA=function(column,value){ 
	if (value=="") return;
	var d=true;
	if (typeof(value)=="function") d=false;
	else value=(value||"").toString().toLowerCase();
	
	var add_line=function(el,s,t){
			var z=t.get[el.parent.id];
			if (!z) z=add_line(el.parent,s,t)
			var t=temp.get[el.id];
			if (!t){
				t={id:el.id, childs:[], level:el.level, parent:z, index:z.childs.length, image:el.image, state:el.state, buff:el.buff, has_kids:el.has_kids, _xml_await:el._xml_await};
			z.childs.push(t);
			temp.get[t.id]=t;
			}
			return t;
	}
	var fbf=this._fbf;
	var temp = new dhtmlxHierarchy();
	var check; 
	var mode = this._tr_strfltr;
	var that=this;	
	var temp_c=function(el){
		for (var i=0; i < el.childs.length; i++) 
			that.temp(el.childs[i]);
	}
	switch(mode.toString()){
		case "-2": check=function(el){ if (fbf[el.id]) return false; temp_c(el); return true;}; break;
		case "-1": check=function(el){return !el.childs.length;}; break;
		default: check=function(el){return mode==el.level}; break;
	}
	this.temp=function(el){
		if (el.id!=0 && check(el)){
			if (d?(this._get_cell_value(el.buff,column).toString().toLowerCase().indexOf(value)==-1):(!value(this._get_cell_value(el.buff,column),el.id))){
				fbf[el.id]=true;
				if (this._tr_fltr_c) add_line(el.parent,this._h2,temp);
				return false;
			} else {
				add_line(el,this._h2,temp);
				if (el.childs && mode!=-2)
					this._h2.forEachChild(el.id,function(cel){
						add_line(cel,this._h2,temp);
					},this)
				return true;
			}
		} else {
			if (this._tr_fltr_d && this._tr_strfltr > el.level && el.id!=0) add_line(el,this._h2,temp);
			temp_c(el);
		}
	}

	
	this.temp(this._h2.get[0]);
	this._h2=temp;	
	if (this._fake) this._fake._h2=this._h2;
}

dhtmlXGridObject.prototype._fix_filtered_images=function(temp,origin){
		temp.forEachChild(0,function(el){
		if (!el.childs.length && !el.has_kids){
			if (el.state!=dhtmlXGridObject._emptyLineImg){
				el.state=dhtmlXGridObject._emptyLineImg;
				el.update=true;
				this._updateTGRState(el);
			}
		} else {
			if (el.buff.tagName=="TR"){
				var prev=origin.get[el.id];
				if (prev && prev.state!=dhtmlXGridObject._emptyLineImg)
					el.state=prev.state;
				el.update=true;
				this._updateTGRState(el);
			}
		}
	},this)
}
/**
*   @desc: get all possible values in column
*   @type: public
*   @param: column - {number} zero based index of column
*   @returns: {array} array of all possible values in column
*	@edition: Professional
*   @topic: 0
*/
dhtmlXGridObject.prototype.collectTreeValues=function(column){
	if (typeof this._tr_strfltr == "undefined") this._tr_strfltr=-1;
	this.dma(true)
	this._build_m_order();		
	column=this._m_order?this._m_order[column]:column;
	var c={}; var f=[];
	var col=this._f_rowsBuffer||this._h2;
	col.forEachChild(0,function(el){
		if (this._tr_strfltr==-2 || (this._tr_strfltr==-1 && !el.childs.length) || (this._tr_strfltr==el.level)){
			var val=this._get_cell_value(el.buff,column);
			if (val) c[val]=true;
    	}
	},this);
	this.dma(false)
	
	var vals=this.combos[column];
	for (var d in c) 
		if (c[d]===true) f.push(vals?(vals.get(d)||d):d);
	
	return f.sort();			
}




dhtmlXGridObject.prototype._in_header_stat_tree_total=function(t,i,c){
	var calck=function(){
		var summ=0;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		this._h2.forEachChild(0,function(el){
			var v=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			summ+=isNaN(v)?0:v;
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):(Math.round(summ*100)/100);
	}
	this._stat_in_header(t,calck,i,c,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_total_leaf=function(t,i,c){
	var calck=function(){
		var summ=0;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		this._h2.forEachChild(0,function(el){
			if (el.childs.length) return;
			var v=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			summ+=isNaN(v)?0:v;
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):(Math.round(summ*100)/100);
	}
	this._stat_in_header(t,calck,i,c,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_multi_total=function(t,i,c){
	var cols=c[1].split(":"); c[1]="";
	var calck=function(){
		var summ=0;
		this._h2.forEachChild(0,function(el){
			var v=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),cols[0]))*parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),cols[1]));
			summ+=isNaN(v)?0:v;
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):(Math.round(summ*100)/100);
	}
	this._stat_in_header(t,calck,i,c,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_multi_total_leaf=function(t,i,c){
	var cols=c[1].split(":"); c[1]="";
	var calck=function(){
		var summ=0;
		this._h2.forEachChild(0,function(el){
			if (el.childs.length) return;
			var v=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),cols[0]))*parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),cols[1]));
			summ+=isNaN(v)?0:v;
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):(Math.round(summ*100)/100);
	}
	this._stat_in_header(t,calck,i,c,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_max=function(t,i,c){
	var calck=function(){
		var summ=-999999999;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		if (this.getRowsNum()==0) return "";
		this._h2.forEachChild(0,function(el){
			var d=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			if (!isNaN(d))
				summ=Math.max(summ,d);
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):summ;
	}
	this._stat_in_header(t,calck,i,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_min=function(t,i,c){
	var calck=function(){
		var summ=999999999;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		if (this.getRowsNum()==0) return "";
		this._h2.forEachChild(0,function(el){
			var d=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			if (!isNaN(d))
				summ=Math.min(summ,d);
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):summ;
	}
	this._stat_in_header(t,calck,i,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_average=function(t,i,c){
	var calck=function(){
		var summ=0; var count=0;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		this._h2.forEachChild(0,function(el){
			var v=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			summ+=isNaN(v)?0:v;
			count++;
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):(Math.round(summ/count*100)/100);
	}
	this._stat_in_header(t,calck,i,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_max_leaf=function(t,i,c){
	var calck=function(){
		var summ=-999999999;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		if (this.getRowsNum()==0) return "";
		this._h2.forEachChild(0,function(el){
			if (el.childs.length) return;
			var d=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			if (!isNaN(d))
				summ=Math.max(summ,d);
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):summ;
	}
	this._stat_in_header(t,calck,i,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_min_leaf=function(t,i,c){
	var calck=function(){
		var summ=999999999;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		if (this.getRowsNum()==0) return "";
		this._h2.forEachChild(0,function(el){
			if (el.childs.length) return;
			var d=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			if (!isNaN(d))
				summ=Math.min(summ,d);
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):summ;
	}
	this._stat_in_header(t,calck,i,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_average_leaf=function(t,i,c){
	var calck=function(){
		var summ=0; var count=0;
		this._build_m_order();
		var ii = this._m_order?this._m_order[i]:i;
		this._h2.forEachChild(0,function(el){
			if (el.childs.length) return;
			var v=parseFloat(this._get_cell_value((el.buff||this.rowsAr[el.id]),ii));
			summ+=isNaN(v)?0:v;
			count++;
		},this)
		return this._maskArr[i]?this._aplNF(summ,i):(Math.round(summ/count*100)/100);
	}
	this._stat_in_header(t,calck,i,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_count=function(t,i,c){
	var calck=function(){
		var count=0;
		this._h2.forEachChild(0,function(el){
			count++;
		},this)
		return count;
	}
	this._stat_in_header(t,calck,i,c);
}
dhtmlXGridObject.prototype._in_header_stat_tree_count_leaf=function(t,i,c){
	var calck=function(){
		var count=0;
		this._h2.forEachChild(0,function(el){
			if (!el.childs.length) count++;
		},this)
		return count;
	}
	this._stat_in_header(t,calck,i,c);
}

dhtmlXGridObject.prototype._stat_in_header=function(t,calck,i,c){
//	if (this._realfake) return this._fake._stat_in_header(t,calck,i,c);
	var that=this;
	var f=function(){
		this.dma(true)
		t.innerHTML=(c[0]?c[0]:"")+calck.call(this)+(c[1]?c[1]:"");
		this.dma(false)
		this.callEvent("onStatReady",[])
	}
	if (!this._stat_events) {
		this._stat_events=[];
		this.attachEvent("onClearAll",function(){ 
			if (!this.hdr.rows[1]){
				for (var i=0; i<this._stat_events.length; i++)
					for (var j=0; j < 4; j++) 
						this.detachEvent(this._stat_events[i][j]);
				this._stat_events=[];	
			}
		})
	}
	
	this._stat_events.push([
	this.attachEvent("onGridReconstructed",f),
	this.attachEvent("onXLE",f),
	this.attachEvent("onFilterEnd",f),
	this.attachEvent("onEditCell",function(stage,id,ind){
		if (stage==2 && ind==i) f.call(this);
		return true;
		})]);
	t.innerHTML="";
}
dhtmlXGridObject.prototype._build_m_order=function(){
	if (this._c_order){
		this._m_order=[]
		for (var i=0; i < this._c_order.length; i++) {
			this._m_order[this._c_order[i]]=i;
		};
	}
}


//(c)dhtmlx ltd. www.dhtmlx.com
