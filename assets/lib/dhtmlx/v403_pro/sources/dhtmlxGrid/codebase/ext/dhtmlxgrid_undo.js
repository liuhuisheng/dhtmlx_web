/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*	@desc: enable Undo/Redo functionality in grid
*	@type: public
*	@edition: Professional
*/
dhtmlXGridObject.prototype.enableUndoRedo = function()
{ 
	var self = this;
	var func = function() {return self._onEditUndoRedo.apply(self,arguments);}
	this.attachEvent("onEditCell", func);
	var func2 = function(a,b,c) {return self._onEditUndoRedo.apply(self,[2,a,b,(c?1:0),(c?0:1)]);}		
	this.attachEvent("onCheckbox", func2);
	this._IsUndoRedoEnabled = true;
	this._UndoRedoData = [];
	this._UndoRedoPos = -1;
}
/**
*	@desc: disable Undo/Redo functionality in grid
*	@type: public
*	@edition: Professional
*/
dhtmlXGridObject.prototype.disableUndoRedo = function()
{
	this._IsUndoRedoEnabled = false;
	this._UndoRedoData = [];
	this._UndoRedoPos = -1;
}

dhtmlXGridObject.prototype._onEditUndoRedo = function(stage, row_id, cell_index, new_value, old_value)
{
	if (this._IsUndoRedoEnabled && stage == 2 && old_value != new_value) {
	    if (this._UndoRedoPos !== -1 && this._UndoRedoPos != ( this._UndoRedoData.length-1 ) ) {
	        this._UndoRedoData = this._UndoRedoData.slice(0, this._UndoRedoPos+1);
	    } else if (this._UndoRedoPos === -1 && this._UndoRedoData.length > 0) {
	        this._UndoRedoData = [];
	    }

	    var obj = { old_value:old_value,
	                new_value:new_value,
	                row_id:row_id,
	                cell_index:cell_index
	    };
	    this._UndoRedoData.push(obj);
	    this._UndoRedoPos++;
	}
	return true;
}
/**
*	@desc: UnDo
*	@type: public
*	@edition: Professional
*/
dhtmlXGridObject.prototype.doUndo = function()
{
	if (this._UndoRedoPos === -1)
		return false;
	var obj = this._UndoRedoData[this._UndoRedoPos--];
	var c=this.cells(obj.row_id, obj.cell_index);
	if (this.getColType(obj.cell_index)=="tree")
		c.setLabel(obj.old_value);
	else
		c.setValue(obj.old_value);

	this.callEvent("onUndo", [obj.row_id]);
}
/**
*	@desc: ReDo
*	@type: public
*	@edition: Professional
*/
dhtmlXGridObject.prototype.doRedo = function()
{
	if (this._UndoRedoPos == this._UndoRedoData.length-1)
		return false;
	var obj = this._UndoRedoData[++this._UndoRedoPos];
	this.cells(obj.row_id, obj.cell_index).setValue(obj.new_value);

	this.callEvent("onUndo", [obj.row_id]);
}
/**
*	@desc: get length of available ReDo operations
*	@type: public
*	@edition: Professional
*/
dhtmlXGridObject.prototype.getRedo = function()
{
	if (this._UndoRedoPos == this._UndoRedoData.length-1)
		return [];
	return this._UndoRedoData.slice(this._UndoRedoPos+1);
}
/**
*	@desc: get length of available UnDo operations
*	@type: public
*	@edition: Professional
*/
dhtmlXGridObject.prototype.getUndo = function()
{
	if (this._UndoRedoPos == -1)
		return [];
	return this._UndoRedoData.slice(0, this._UndoRedoPos+1);
}
//(c)dhtmlx ltd. www.dhtmlx.com