/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

function eXcell_time(cell){

		this.base = eXcell_ed;
		this.base(cell)
		this.getValue = function(){
				return this.cell.innerHTML.toString();
		}
		this.setValue = function(val){
		var re = new RegExp(" ","i")
		val = val.replace(re,":")
		if((val=="")) val = "00:00"
		else
		{
			var re = new RegExp("[a-zA-Z]","i")
			var res = val.match(re)
			
			if(res) val = "00:00";
			else{
				var re = new RegExp("[0-9]+[\\.\\/;\\-,_\\]\\[\\?\\: ][0-9]+","i")
				var res = val.search(re)
				if(res!=-1){
					var re = new RegExp("[\\./\\;\\-\\,\\_\\]\\[ \\?]","i")
					val = val.replace(re,":")
				}
				else
				{
					var re = new RegExp("[^0-9]","i")
					res1 = val.search(re)
					if(res = val.match(re) ) { val = "00:00";}
					else
					{
					if(val.length == 1)
					{
						val = "00:0"+val;
					}
					else
					{
						if(parseInt(val) < 60) val = "00:"+val;
						else
						if(val.length < 5)
						{
							var minutes = parseInt(val);
							var hours =  Math.floor(minutes/60);
							minutes = minutes - 60*hours;
							var hours = hours.toString();
							var minutes = minutes.toString();
							while(hours.length < 2){
								hours = "0" + hours;
							}
							while(minutes.length < 2){
								minutes = "0" + minutes;
							}
							val = hours+":"+minutes;
						}
					}
					}
						
				}
			}
		}
		this.cell.innerHTML = val;
		}

		
	}
	   eXcell_time.prototype = new eXcell_ed;
	   //(c)dhtmlx ltd. www.dhtmlx.com