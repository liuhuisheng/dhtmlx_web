/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXGridObject.prototype._process_json_row=function(r, data){
	r._attrs=data;
	for (var j = 0; j < r.childNodes.length; j++)r.childNodes[j]._attrs={
	};
	if (data.userdata)
		for (var a in data.userdata)
			this.setUserData(r.idd,a,data.userdata[a]);
			
	data = this._c_order?this._swapColumns(data.data):data.data;

	for (var i=0; i<data.length; i++)
		if (typeof data[i] == "object" && data[i] != null){
			r.childNodes[i]._attrs=data[i];
			if (data[i].type) r.childNodes[i]._cellType=data[i].type;
			data[i]=data[i].value;
		}
	this._fillRow(r, data);
	return r;
};


dhtmlXGridObject.prototype._process_js_row=function(r, data){
	r._attrs=data;
	for (var j = 0; j < r.childNodes.length; j++)
		r.childNodes[j]._attrs={};

	if (data.userdata)
		for (var a in data.userdata)
			this.setUserData(r.idd,a,data.userdata[a]);
			
	var arr = [];
	for (var i=0; i<this.columnIds.length; i++){
		arr[i] = data[this.columnIds[i]];
		if (typeof arr[i] == "object" && arr[i] != null){
			r.childNodes[i]._attrs=arr[i];
			if (arr[i].type) r.childNodes[i]._cellType=arr[i].type;
			arr[i]=arr[i].value;
		}
		if (!arr[i] && arr[i]!==0)
			arr[i]="";
	}

	this._fillRow(r, arr);
	return r;
};

dhtmlXGridObject.prototype.updateFromJSON = function(url, insert_new, del_missed, afterCall){
	if (typeof insert_new == "undefined")
		insert_new=true;
	this._refresh_mode=[
		true,
		insert_new,
		del_missed
	];
	
	this.load(url,afterCall,"json");
},
dhtmlXGridObject.prototype._refreshFromJSON = function(data){
		if (this._f_rowsBuffer) this.filterBy(0,"");
		reset = false;
		if (window.eXcell_tree){
			eXcell_tree.prototype.setValueX=eXcell_tree.prototype.setValue;
			eXcell_tree.prototype.setValue=function(content){
				var r=this.grid._h2.get[this.cell.parentNode.idd]
				if (r && this.cell.parentNode.valTag){
					this.setLabel(content);
				} else
					this.setValueX(content);
			};
		}
	
		var tree = this.cellType._dhx_find("tree");
		var pid = data.parent||0;
	
		var del = {
		};
	
		if (this._refresh_mode[2]){
			if (tree != -1)
				this._h2.forEachChild(pid, function(obj){
					del[obj.id]=true;
				}, this);
			else
				this.forEachRow(function(id){
					del[id]=true;
				});
		}
	
		var rows = data.rows;
	
		for (var i = 0; i < rows.length; i++){
			var row = rows[i];
			var id = row.id;
			del[id]=false;
	
			if (this.rowsAr[id] && this.rowsAr[id].tagName!="TR"){
				if (this._h2)
					this._h2.get[id].buff.data=row;
				else
					this.rowsBuffer[this.getRowIndex(id)].data=row;
				this.rowsAr[id]=row;
			} else if (this.rowsAr[id]){
					this._process_json_row(this.rowsAr[id], row, -1);
					this._postRowProcessing(this.rowsAr[id],true)
				} else if (this._refresh_mode[1]){
					var dadd={
						idd: id,
						data: row,
						_parser: this._process_json_row,
						_locator: this._get_json_data
					};
					
					var render_index = this.rowsBuffer.length;
					if (this._refresh_mode[1]=="top"){
						this.rowsBuffer.unshift(dadd);
						render_index = 0;
					} else
						this.rowsBuffer.push(dadd);
						
					if (this._h2){ 
						reset=true;
						(this._h2.add(id,pid)).buff=this.rowsBuffer[this.rowsBuffer.length-1];
					}
						
					this.rowsAr[id]=row;
					row=this.render_row(render_index);
					this._insertRowAt(row,render_index?-1:0)
				}
		}
				
		if (this._refresh_mode[2])
			for (id in del){
				if (del[id]&&this.rowsAr[id])
					this.deleteRow(id);
			}
	
		this._refresh_mode=null;
		if (window.eXcell_tree)
			eXcell_tree.prototype.setValue=eXcell_tree.prototype.setValueX;
			
		if (reset) this._renderSort();
		if (this._f_rowsBuffer) {
			this._f_rowsBuffer = null;
			this.filterByAll();
		}
	},

	dhtmlXGridObject.prototype._process_js=function(data){
		return this._process_json(data, "js");
	},

	dhtmlXGridObject.prototype._process_json=function(data, mode){
		this._parsing=true;
		try {
			if (data&&data.xmlDoc){
				eval("dhtmlx.temp="+data.xmlDoc.responseText+";");
				data = dhtmlx.temp;
			} else if (typeof data == "string"){
				eval("dhtmlx.temp="+data+";");
				data = dhtmlx.temp;
			}
		} catch(e){
				dhtmlxError.throwError("LoadXML", "Incorrect JSON", [
					(data.xmlDoc||data),
					this
				]);
				data = {rows:[]};
		}
			
		if (this._refresh_mode) return this._refreshFromJSON(data);				

		var cr = parseInt(data.pos||0);
		var total = parseInt(data.total_count||0);
		
		var reset = false;
		if (total){
			if (!this.rowsBuffer[total-1]){
				if (this.rowsBuffer.length)
					reset=true;
			this.rowsBuffer[total-1]=null;
			} 
			if (total<this.rowsBuffer.length){
				this.rowsBuffer.splice(total, this.rowsBuffer.length - total);
				reset = true;
			}
		}
			
		for (var key in data){
			if (key!="rows")
				this.setUserData("",key, data[key]);
		}

		if (mode == "js" && data.collections){
			for (var colkey in data.collections){
				var index = this.getColIndexById(colkey);
				var colrecs = data.collections[colkey];
				if (index !== window.undefined){
					if (this.cellType[index] == "clist"){
						colplaindata=[];
						for (var j=0; j<colrecs.length; j++)
							colplaindata.push(colrecs[j].label);
						this.registerCList(index, colplaindata);
					} else {
						var combo = this.getCombo(index);
						for (var j = 0; j < colrecs.length; j++)
							combo.put(colrecs[j].value, colrecs[j].label);
					}
				}
			}
		}
		
		if (this.isTreeGrid())
			return this._process_tree_json(data, null, null, mode);
			
		if (mode == "js"){
			if (data.data)
				data = data.data;
			for (var i = 0; i < data.length; i++){
				if (this.rowsBuffer[i+cr])
					continue;

				var row = data[i];
				var id  = row.id||(i+1);
				this.rowsBuffer[i+cr]={
					idd: id,
					data: row,
					_parser: this._process_js_row,
					_locator: this._get_js_data
				};

				this.rowsAr[id]=data[i];
			}
		} else {
			for (var i = 0; i < data.rows.length; i++){
				if (this.rowsBuffer[i+cr])
					continue;
				var id = data.rows[i].id;
				this.rowsBuffer[i+cr]={
					idd: id,
					data: data.rows[i],
					_parser: this._process_json_row,
					_locator: this._get_json_data
				};
	
				this.rowsAr[id]=data.rows[i];
			}
		}
		
		if (reset && this._srnd){
			var h = this.objBox.scrollTop;
			this._reset_view();
			this.objBox.scrollTop = h;
		} else {
			this.render_dataset();
		}
		
		this._parsing=false;
}

dhtmlXGridObject.prototype._get_json_data=function(data, ind){
	if (typeof data.data[ind] == "object")
		return data.data[ind].value;
	else
		return data.data[ind];
};

dhtmlXGridObject.prototype._process_tree_json=function(data,top,pid,mode){
	this._parsing=true;
	var main=false;
	if (!top){
		this.render_row=this.render_row_tree;
		main=true;
		top=data;
		pid=top.parent||0;
		if (pid=="0") pid=0;
		if (!this._h2)	 this._h2=new dhtmlxHierarchy();
		if (this._fake) this._fake._h2=this._h2;
	} 
	
	if (mode == "js"){
		if (top.data && !pid) 
			data = top.data;
		if (top.rows)
			top = top.rows;
		for (var i = 0; i < top.length; i++){
			var id = top[i].id;
			var row=this._h2.add(id,pid);
			row.buff={ idd:id, data:top[i], _parser: this._process_js_row, _locator:this._get_js_data };

			if (top[i].open)
			    row.state="minus";
				
			this.rowsAr[id]=row.buff;
		    this._process_tree_json(top[i],top[i],id,mode);
		}
	} else {
		if (top.rows) {
			for (var i = 0; i < top.rows.length; i++){
					var id = top.rows[i].id;
					var row=this._h2.add(id,pid);
					row.buff={ idd:id, data:top.rows[i], _parser: this._process_json_row, _locator:this._get_json_data };
					if (top.rows[i].open)
					    row.state="minus";
					
					this.rowsAr[id]=row.buff;
				    this._process_tree_json(top.rows[i],top.rows[i],id,mode);
			}
		}
	}
		
	if (main){ 
		
		if (pid!=0) this._h2.change(pid,"state","minus")
		this._updateTGRState(this._h2.get[pid]);
		this._h2_to_buff();
		
		if (pid!=0 && (this._srnd || this.pagingOn))
			this._renderSort();
		else
			this.render_dataset();
		
		
	
		if (this._slowParse===false){
			this.forEachRow(function(id){
				this.render_row_tree(0,id)
			})
		}
		this._parsing=false;

		if (pid!=0 && !this._srnd)
		   this.callEvent("onOpenEnd",[pid,1]);	
	}
}	
