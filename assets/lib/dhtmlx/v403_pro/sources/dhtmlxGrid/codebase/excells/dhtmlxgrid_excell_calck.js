/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

/**
*	@desc: calculator editor
*	@returns: dhtmlxGrid cell editor object
*	@type: public
*/
function eXcell_calck(cell){
	try{
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	}catch(er){}
	this.edit = function(){
					this.val = this.getValue();

					var arPos = this.grid.getPosition(this.cell);
					this.obj = new calcX(arPos[0],arPos[1]+this.cell.offsetHeight,this,this.val);

				}
	this.getValue = function(){
		//this.grid.editStop();
    	return this.grid._aplNFb(this.cell.innerHTML.toString()._dhx_trim(),this.cell._cellIndex);
	}
	this.detach = function(){
                    if (this.obj) {
						this.setValue(this.obj.inputZone.value);
						this.obj.removeSelf();
						}
                    this.obj=null;
					return this.val!=this.getValue();
				}
}
eXcell_calck.prototype = new eXcell;
eXcell_calck.prototype.setValue = function(val){
      if(!val || val.toString()._dhx_trim()=="")
          val="0"
      this.setCValue(this.grid._aplNF(val,this.cell._cellIndex),val);
}

function calcX(left,top,onReturnSub,val){
	this.top=top||0;
	this.left=left||0;
	this.onReturnSub=onReturnSub||null;

	this.operandA=0;
	this.operandB=0;
	this.operatorA="";
	this.state=0;
	this.dotState=0;


this.calckGo=function(){
	return (eval(this.operandA+"*1"+this.operatorA+this.operandB+"*1"));
};

this.isNumeric=function(str){
	return ((str.search(/[^1234567890]/gi)==-1)?(true):(false));
};
this.isOperation=function(str){
	return ((str.search(/[^\+\*\-\/]/gi)==-1)?(true):(false));
}
	this.onCalcKey=function(e)
	{
		that=this.calk;
		var z=this.innerHTML;
		var rZone=that.inputZone;
		if (((that.state==0)||(that.state==2))&&(that.isNumeric(z)))  	if (rZone.value!="0") rZone.value+=z; else rZone.value=z;
		if ((((that.state==0)||(that.state==2))&&(z=='.'))&&(that.dotState==0)) { that.dotState=1; rZone.value+=z; }
		if ((z=="C"))  { rZone.value=0; that.dotState=0; that.state=0; }
		if ((that.state==0)&&(that.isOperation(z)))  { that.operatorA=z;  that.operandA=rZone.value; that.state=1; }
		if ((that.state==2)&&(that.isOperation(z)))  { that.operandB=rZone.value; rZone.value=that.calckGo(); that.operatorA=z;  that.operandA=rZone.value; that.state=1; }
		if ((that.state==2)&&(z=="="))  { that.operandB=rZone.value; rZone.value=that.calckGo(); that.operatorA=z;  that.operandA=rZone.value; that.state=3; }
		if ((that.state==1)&&(that.isNumeric(z))) { rZone.value=z; that.state=2;  that.dotState=0 }
		if ((that.state==3)&&(that.isNumeric(z))) { rZone.value=z; that.state=0; }
		if ((that.state==3)&&(that.isOperation(z))) { that.operatorA=z;  that.operandA=rZone.value; that.state=1; }
		if (z=="e") { rZone.value=Math.E;  if (that.state==1) that.state=2; that.dotState=0   }
		if (z=="p") { rZone.value=Math.PI; if (that.state==1) that.state=2; that.dotState=0  }
		if (z=="Off") that.topNod.parentNode.removeChild(that.topNod);

		if (e||event) (e||event).cancelBubble=true;
	}
	this.sendResult=function(){
		that=this.calk;
		if (that.state==2){
            var rZone=that.inputZone;
            that.operandB=rZone.value;
            rZone.value=that.calckGo();
            that.operatorA=z;
            that.operandA=rZone.value;
            that.state=3; }
		var z=that.inputZone.value;

		that.topNod.parentNode.removeChild(that.topNod);
		that.onReturnSub.grid.editStop(false);
	};
    this.removeSelf=function(){
        if (this.topNod.parentNode)
        	this.topNod.parentNode.removeChild(this.topNod);
    }
	this.keyDown=function(){ this.className="calcPressed"; };
	this.keyUp=function(){ this.className="calcButton"; };
	this.init_table=function(){
		var table=this.topNod.childNodes[0];
		if ((!table)||(table.tagName!="TABLE")) return;
		for (i=1; i<table.childNodes[0].childNodes.length; i++)
			for (j=0; j<table.childNodes[0].childNodes[i].childNodes.length; j++)
			{
				table.childNodes[0].childNodes[i].childNodes[j].onclick=this.onCalcKey;
				table.childNodes[0].childNodes[i].childNodes[j].onmousedown=this.keyDown;
				table.childNodes[0].childNodes[i].childNodes[j].onmouseout=this.keyUp;
				table.childNodes[0].childNodes[i].childNodes[j].onmouseup=this.keyUp;
				table.childNodes[0].childNodes[i].childNodes[j].calk=this;
			}
		this.inputZone=this.topNod.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
		if (this.onReturnSub)
		{
			this.topNod.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].onclick=this.sendResult;
			this.topNod.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].calk=this;
		}
		else this.topNod.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].innerHTML="";
	}
	this.drawSelf=function(){
		var div=document.createElement("div");
		div.className="calcTable";
		div.style.position="absolute";
		div.style.top=this.top+"px";
		div.style.left=this.left+"px";
		div.innerHTML="<table cellspacing='0' id='calc_01' class='calcTable'><tr><td colspan='4'><table cellpadding='1' cellspacing='0' width='100%'><tr><td width='100%' style='overflow:hidden;'><input style='width:100%' class='calcInput' value='0' align='right' readonly='true' style='text-align:right'></td><td class='calkSubmit'>=</td></tr></table></td></tr><tr><td class='calcButton' width='25%'>Off</td><td class='calcButton' width='25%'>p</td><td class='calcButton' width='25%'>e</td><td class='calcButton' width='25%'>/</td></tr><tr><td class='calcButton'>7</td><td class='calcButton'>8</td><td class='calcButton'>9</td><td class='calcButton'>*</td></tr><tr><td class='calcButton'>4</td><td class='calcButton'>5</td><td class='calcButton'>6</td><td class='calcButton'>+</td></tr><tr><td class='calcButton'>1</td><td class='calcButton'>2</td><td class='calcButton'>3</td><td class='calcButton'>-</td></tr><tr><td class='calcButton'>0</td><td class='calcButton'>.</td><td class='calcButton'>C</td><td class='calcButton'>=</td></tr></table>";
		div.onclick=function(e){ (e||event).cancelBubble=true; };
		document.body.appendChild(div);
		this.topNod=div;
	}

	this.drawSelf();
	this.init_table();

    if (val){
            var rZone=this.inputZone;
            rZone.value=val*1;
            this.operandA=val*1;
            this.state=3;
            }
	return this;
};
//(c)dhtmlx ltd. www.dhtmlx.com