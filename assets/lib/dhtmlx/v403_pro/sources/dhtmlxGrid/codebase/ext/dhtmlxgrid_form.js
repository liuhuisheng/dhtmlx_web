/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXGridObject.prototype.attachHeaderA=dhtmlXGridObject.prototype.attachHeader;
dhtmlXGridObject.prototype.attachHeader=function()
{
	this.attachHeaderA.apply(this,arguments);
	if (this._realfake) return true;
	this.formAutoSubmit();
	if (typeof(this.FormSubmitOnlyChanged)=="undefined")
		this.submitOnlyChanged(true);
		
	if (typeof(this._submitAR)=="undefined")
		this.submitAddedRows(true);
		
	var that=this;
	
	this._added_rows=[];
	this._deleted_rows=[];
	
	this.attachEvent("onRowAdded",function(id){ 
		that._added_rows.push(id);
		that.forEachCell(id,function(a){ a.cell.wasChanged=true; })
		return true;
	});
	this.attachEvent("onBeforeRowDeleted",function(id){
		that._deleted_rows.push(id);
		return true;
	});
	
	this.attachHeader=this.attachHeaderA;
}

dhtmlXGridObject.prototype.formAutoSubmit = function()
{
	this.parentForm = this.detectParentFormPresent();
	if (this.parentForm === false) {
		return false;
	}
	if (this.formEventAttached)
		return;
    this.formInputs = new Array();
	var self = this;
	dhtmlxEvent(this.parentForm, 'submit', function() {if (self.entBox) self.parentFormOnSubmit();});
	this.formEventAttached = true;
}

dhtmlXGridObject.prototype.parentFormOnSubmit = function()
{
	this.formCreateInputCollection();
	if (!this.callEvent("onBeforeFormSubmit",[])) return false;
}

/**
*   @desc: include only changed rows in form submit
*   @type: public
*   @param: mode - {boolean}  enable|disable mode
*   @topic: 0
*/
dhtmlXGridObject.prototype.submitOnlyChanged = function(mode)
{
	this.FormSubmitOnlyChanged = convertStringToBoolean(mode);
}

dhtmlXGridObject.prototype.submitColumns=function(names){
	if (typeof names == "string") names=names.split(this.delim);
	this._submit_cols=names;	
}

/**
*   @desc: allows to define input name which will be used for data sending, name may contain next auto-replaced elements - GRID_ID - ID of grids container, ROW_ID - ID of row, ROW_INDEX - index of row, COLUMN_ID - id of column, COLUMN_INDEX - index of column
*   @type: public
*   @param: name - input name mask
*   @topic: 0
*/
dhtmlXGridObject.prototype.setFieldName=function(mask){
	mask=mask.replace(/\{GRID_ID\}/g,"'+a1+'");
	mask=mask.replace(/\{ROW_ID\}/g,"'+a2+'");
	mask=mask.replace(/\{ROW_INDEX\}/g,"'+this.getRowIndex(a2)+'");
	mask=mask.replace(/\{COLUMN_INDEX\}/g,"'+a3+'");
	mask=mask.replace(/\{COLUMN_ID\}/g,"'+this.getColumnId(a3)+'");
	this._input_mask=Function("a1","a2","a3","return '"+mask+"';");
}
 
   
/**
*   @desc: include serialized grid as part of form submit
*   @type: public
*   @param: mode - {boolean}  enable|disable mode
*   @topic: 0
*/
dhtmlXGridObject.prototype.submitSerialization = function(mode)
{
	this.FormSubmitSerialization = convertStringToBoolean(mode);
}

/**
*   @desc: include additional data with info about which rows was added and which deleted, enabled by default
*   @type: public
*   @param: mode - {boolean}  enable|disable mode
*   @topic: 0
*/
dhtmlXGridObject.prototype.submitAddedRows = function(mode)
{
	this._submitAR = convertStringToBoolean(mode);
}




/**
*   @desc: include only selected rows in form submit
*   @type: public
*   @param: mode - {boolean}  enable|disable mode
*   @topic: 0
*/
dhtmlXGridObject.prototype.submitOnlySelected = function(mode)
{
	this.FormSubmitOnlySelected = convertStringToBoolean(mode);
}


/**
*   @desc: include only  row's IDS in form submit
*   @type: public
*   @param: mode - {boolean}  enable|disable mode
*   @topic: 0
*/
dhtmlXGridObject.prototype.submitOnlyRowID = function(mode)
{
	this.FormSubmitOnlyRowID = convertStringToBoolean(mode);
}


dhtmlXGridObject.prototype.createFormInput = function(name,value){
    var input = document.createElement('input');
    input.type = 'hidden';
    if (this._input_mask && (typeof name != "string"))
    	input.name=this._input_mask.apply(this,name);
    else
    	input.name =((this.globalBox||this.entBox).id||'dhtmlXGrid')+'_'+name;
    input.value = value;
    this.parentForm.appendChild(input);
    this.formInputs.push(input);
}

dhtmlXGridObject.prototype.createFormInputRow = function(r){ 
	var id=(this.globalBox||this.entBox).id;
	for (var j=0; j<this._cCount; j++){
		var foo_cell = this.cells3(r, j);
		if (((!this.FormSubmitOnlyChanged) || foo_cell.wasChanged()) && (!this._submit_cols || this._submit_cols[j]))
			this.createFormInput(this._input_mask?[id,r.idd,j]:(r.idd+'_'+j),foo_cell.getValue());
	}
}


dhtmlXGridObject.prototype.formCreateInputCollection = function()
{
	if (this.parentForm == false) {
		return false;
	}
	for (var i=0; i<this.formInputs.length; i++) {
		this.parentForm.removeChild(this.formInputs[i]);
	}
    this.formInputs = new Array();
    
    if (this.FormSubmitSerialization){
    	this.createFormInput("serialized",this.serialize());
    } else if (this.FormSubmitOnlySelected){
    	//submit selected
    	if (this.FormSubmitOnlyRowID)
    		this.createFormInput("selected",this.getSelectedId());
    	else
    		for(var i=0;i<this.selectedRows.length;i++)
    			this.createFormInputRow(this.selectedRows[i]);
    	}
    else{
    	//submit all
    		if (this._submitAR){
    			if (this._added_rows.length)
    				this.createFormInput("rowsadded",this._added_rows.join(","));
    			if (this._deleted_rows.length)
    				this.createFormInput("rowsdeleted",this._deleted_rows.join(","));
	    		}
    		this.forEachRow(function(id){
    			this.getRowById(id);
    			this.createFormInputRow(this.rowsAr[id]);
			})
    		
    	}
}

dhtmlXGridObject.prototype.detectParentFormPresent = function()
{
	var parentForm = false;
	var parent = this.entBox;
	while(parent && parent.tagName && parent != document.body) {
		if (parent.tagName.toLowerCase() == 'form') {
			parentForm = parent;
			break;
		} else {
        	parent = parent.parentNode;
		}
	}
	return parentForm;
}
//(c)dhtmlx ltd. www.dhtmlx.com
