/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*	@desc: enable pop up menu which allows hidding/showing columns
*	@edition: Professional
*	@type: public
*/
dhtmlXGridObject.prototype.enableHeaderMenu=function(columns)
{
	if (typeof columns == "string")
		columns = columns.split(",");
	this._hm_config = columns;
	var that=this;
	this.attachEvent("onInit",function(){
    	this.hdr.oncontextmenu = function(e){ return that._doHContClick(e||window.event); };   
		{
			this.startColResizeA=this.startColResize;
			this.startColResize=function(e){
					if (e.button==2 || (_isMacOS&&e.ctrlKey))
						return this._doHContClick(e)
					return this.startColResizeA(e);
			}
		}
		this._chm_ooc=this.obj.onclick;
		this._chm_hoc=this.hdr.onclick;
		this.hdr.onclick=function(e){
			if (e && ( e.button==2  || (_isMacOS&&e.ctrlKey))) return false;
			that._showHContext(false);	
			return that._chm_hoc.apply(this,arguments)
		}
		this.obj.onclick=function(){
			that._showHContext(false);	
			return that._chm_ooc.apply(this,arguments)
		}
	    	
	});
	dhtmlxEvent(document.body,"click",function(){
		if (that._hContext)
			that._showHContext(false);
	})
	if (this.hdr.rows.length) this.callEvent("onInit",[]);
	this.enableHeaderMenu=function(){};
}

dhtmlXGridObject.prototype._doHContClick=function(ev)
{
		function mouseCoords(ev){
            if(ev.pageX || ev.pageY){
                return {x:ev.pageX, y:ev.pageY};
            }
            var d  =  ((_isIE)&&(document.compatMode != "BackCompat"))?document.documentElement:document.body;
            return {
                x:ev.clientX + d.scrollLeft - d.clientLeft,
                y:ev.clientY + d.scrollTop  - d.clientTop
            };
        }

		this._createHContext();
		var coords = mouseCoords(ev);
		this._showHContext(true,coords.x,coords.y);
        ev[_isIE?"srcElement":"target"].oncontextmenu = function(e){ (e||event).cancelBubble=true; return false; };
		
		ev.cancelBubble=true;
		if (ev.preventDefault) ev.preventDefault();
    	return false;
}

dhtmlXGridObject.prototype._createHContext=function()
{
	if (this._hContext) return this._hContext;
	var d = document.createElement("DIV");
	d.oncontextmenu = function(e){ (e||event).cancelBubble=true; return false; };
	d.onclick=function(e){
		(e||event).cancelBubble=true;
		return true;
		}
	d.className="dhx_header_cmenu";
	d.style.width=d.style.height="5px";
	d.style.display="none";
	var a=[];
	var i=0;
	if (this._fake)
		i=this._fake._cCount;	
	
	var true_ind=i;
	
	for (var i; i<this.hdr.rows[1].cells.length; i++){
		var c=this.hdr.rows[1].cells[i];
		if (!this._hm_config || (this._hm_config[i] &&  this._hm_config[i] != "false")){
			if (c.firstChild && c.firstChild.tagName=="DIV") var val=c.firstChild.innerHTML;
			else var val = c.innerHTML;
			val = val.replace(/<[^>]*>/gi,"");
			a.push("<div class='dhx_header_cmenu_item'><input type='checkbox' column='"+true_ind+"' len='"+(c.colSpan||1)+"' checked='true' />"+val+"</div>");			
		}
		true_ind+=(c.colSpan||1);
	}
	d.innerHTML=a.join("");

	var that=this;	
	var f=function(){
    	var c=this.getAttribute("column");
    	if (!this.checked && !that._checkLast(c)) return this.checked=true;
    	if (that._realfake) that=that._fake;
    	for (var i=0; i<this.getAttribute("len"); i++)
			that.setColumnHidden((c*1+i*1),!this.checked);
		if(this.checked && that.getColWidth(c)==0) 
			that.adjustColumnSize(c);
	}
	for (var i=0; i<d.childNodes.length; i++)
		d.childNodes[i].firstChild.onclick=f;
	
	document.body.insertBefore(d,document.body.firstChild);
	this._hContext=d;
	
	d.style.position="absolute";
	d.style.zIndex=999;
	d.style.width='auto'
	d.style.height='auto'
	d.style.display='block';
}
dhtmlXGridObject.prototype._checkLast=function(ind){
	for (var i=0; i < this._cCount; i++)
		if ((!this._hrrar || !this._hrrar[i])&&(i!=ind))
			return true;
	return false;
}
dhtmlXGridObject.prototype._updateHContext=function()
{
	for (var i=0; i<this._hContext.childNodes.length; i++){
		var c=this._hContext.childNodes[i].firstChild;
		var col=c.getAttribute("column");
		if (this.isColumnHidden(col) || (this.getColWidth(col)==0))
			c.checked=false;
	}
}

dhtmlXGridObject.prototype._showHContext=function(mode,x,y)
{
	if (mode && this.enableColumnMove) {
		 this._hContext.parentNode.removeChild(this._hContext);
		 this._hContext=null;
	}
    this._createHContext();
	this._hContext.style.display=(mode?'block':'none');
	if (mode){
		this._updateHContext(true);
		this._hContext.style.left=x+"px";
		this._hContext.style.top=y+"px";
	}
	
}
//(c)dhtmlx ltd. www.dhtmlx.com
