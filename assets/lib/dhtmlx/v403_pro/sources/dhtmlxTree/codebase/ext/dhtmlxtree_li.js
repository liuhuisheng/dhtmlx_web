/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/


/*
Purpose: locked item extension for dhtmlxTree
Last updated: 11.01.2006
*/


/**
*     @desc: get locked state of item
*     @param: itemId - id of item
*     @returns: true/false  - locked/unlocked
*     @edition: Professional
*     @type: public
*     @topic: 4
*/
dhtmlXTreeObject.prototype.isLocked=function(itemId)
	{
        if (!this._locker) this._init_lock();
        return  (this._locker[itemId]==true);
	};

dhtmlXTreeObject.prototype._lockItem=function(sNode,state,skipdraw){
	if (!this._locker) this._init_lock();
    if (state){

            if (this._locker[sNode.id]==true) return;
            this._locker[sNode.id]=true;

            sNode.bIm0=sNode.images[0];
            sNode.bIm1=sNode.images[1];
            sNode.bIm2=sNode.images[2];

            sNode.images[0]=this.lico0;
            sNode.images[1]=this.lico1;
            sNode.images[2]=this.lico2;

            var z1=sNode.span.parentNode;
            var z2=z1.previousSibling;

            this.dragger.removeDraggableItem(z1);
            this.dragger.removeDraggableItem(z2);
        }
        else{
            if (this._locker[sNode.id]!=true) return;
            this._locker[sNode.id]=false;

            sNode.images[0]=sNode.bIm0;
            sNode.images[1]=sNode.bIm1;
            sNode.images[2]=sNode.bIm2;

            var z1=sNode.span.parentNode;
            var z2=z1.previousSibling;

            this.dragger.addDraggableItem(z1,this);
            this.dragger.addDraggableItem(z2,this);
        }

       if (!skipdraw) this._correctPlus(sNode);
}
/**
*     @desc: lock/unlock item
*     @param: itemId - id of item
*     @param: state - true/false  - lock/unlock item
*     @edition: Professional
*     @type: public
*     @topic: 4
*/
dhtmlXTreeObject.prototype.lockItem=function(itemId,state)
	{
        if (!this._locker) this._init_lock();
        this._lockOn=false;
		var sNode=this._globalIdStorageFind(itemId);
        this._lockOn=true;
        this._lockItem(sNode,convertStringToBoolean(state));
	}
/**
*     @desc: set icon for locked items
*     @param: im0 - icon for locked leaf
*     @param: im1 - icon for closed branch
*     @param: im2 - icon for opened branch
*     @edition: Professional
*     @type: public
*     @topic: 4
*/
dhtmlXTreeObject.prototype.setLockedIcons=function(im0,im1,im2)
	{
        if (!this._locker) this._init_lock();
        this.lico0=im0;
        this.lico1=im1;
        this.lico2=im2;
    };


dhtmlXTreeObject.prototype._init_lock=function()
	{
        this._locker=new Array();
        this._locker_count="0";
        this._lockOn=true;
        this._globalIdStorageFindA=this._globalIdStorageFind;
        this._globalIdStorageFind=this._lockIdFind;

        if (this._serializeItem){
            this._serializeItemA=this._serializeItem;
            this._serializeItem=this._serializeLockItem;


            this._serializeTreeA=this.serializeTree;
            this.serializeTree=this._serializeLockTree;

            }

        this.setLockedIcons(this.imageArray[0],this.imageArray[1],this.imageArray[2]);
    };


dhtmlXTreeObject.prototype._lockIdFind=function(itemId,skipXMLSearch,skipParsing)
	{
        if (!this.skipLock)
            if ((!skipParsing)&&(this._lockOn==true)&&(this._locker[itemId]==true)) {  return null; }
        return this._globalIdStorageFindA(itemId,skipXMLSearch,skipParsing);
    };
dhtmlXTreeObject.prototype._serializeLockItem=function(node)
	{
        if (this._locker[node.id]==true) return "";
        return this._serializeItemA(node);
    };
dhtmlXTreeObject.prototype._serializeLockTree=function()
	{
        var out=this._serializeTreeA();
        return out.replace(/<item[^>]+locked\=\"1\"[^>]+\/>/g,"");
    };


dhtmlXTreeObject.prototype._moveNodeToA=dhtmlXTreeObject.prototype._moveNodeTo;
dhtmlXTreeObject.prototype._moveNodeTo=function(itemObject,targetObject,beforeNode){
	   	if ((targetObject.treeNod.isLocked)&&(targetObject.treeNod.isLocked(targetObject.id))) {
			return false;
		}
		return this._moveNodeToA(itemObject,targetObject,beforeNode);
		}



/**
*     @desc: lock tree
*     @param: isLock - bool value. True - lock, false - unlock
*     @edition: Professional
*     @type: public
*     @topic: 4
*/
dhtmlXTreeObject.prototype.lockTree=function(isLock)
{
	if (convertStringToBoolean(isLock))
		this._initTreeLocker();
	else
		if (this._TreeLocker) {
			this._TreeLocker.parentNode.removeChild(this._TreeLocker);
			this._TreeLocker=null;
		}
};


dhtmlXTreeObject.prototype._initTreeLocker=function(isLock)
{
	if (this._TreeLocker) return;
	this.parentObject.style.overflow="hidden";
   	if (this.parentObject.style.position != 'absolute')
		this.parentObject.style.position = 'relative';


	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.left = '0px';
	div.style.top = '0px';
	div.className = 'dhx_tree_opacity';

	div.style.width = this.allTree.offsetWidth+'px';
	div.style.backgroundColor = '#FFFFFF';

	div.style.height = this.allTree.offsetHeight+'px';
	//div.style.display = 'none';
	this._TreeLocker = div;
   	this.parentObject.appendChild(this._TreeLocker);
};
//(c)dhtmlx ltd. www.dhtmlx.com