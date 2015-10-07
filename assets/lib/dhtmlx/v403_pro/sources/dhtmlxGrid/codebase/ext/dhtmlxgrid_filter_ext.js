/*
Product Name: dhtmlxSuite 
Version: 4.0.3 
Edition: Professional 
License: content of this file is covered by DHTMLX Commercial or Enterprise license. Usage without proper license is prohibited. To obtain it contact sales@dhtmlx.com
Copyright UAB Dinamenta http://www.dhtmlx.com
*/

dhtmlXGridObject.prototype._in_header_number_filter=function(t,i){
	this._in_header_text_filter.call(this,t,i);
	var self = this;
	t.firstChild._filter=function(){
		var filters = self._get_filters(this.value, 'num');
		return function(value) {
			var result = filters.length > 0 ? false : true;
			for (var i = 0; i < filters.length; i++)
				result = result || filters[i](value);
			return result;
		}
	};
}


dhtmlXGridObject.prototype._in_header_string_filter=function(t,i){
	this._in_header_text_filter.call(this,t,i);
	var self = this;
	t.firstChild._filter=function(){
		var filters = self._get_filters(this.value, 'str');
		return function(value) {
			var result = filters.length > 0 ? false : true;
			for (var i = 0; i < filters.length; i++)
				result = result || filters[i](value);
			return result;
		}
	};
}


dhtmlXGridObject.prototype._get_filters=function(value, type) {
	var fs = value.split(',');
	var filters = [];
	
	for (var i = 0; i < fs.length; i++) {
		if (fs[i] == '') continue;
		var f = this['_get_' + type + '_filter'](fs[i]);
		filters.push(f);
	}
	return filters;
}


dhtmlXGridObject.prototype._get_str_filter=function(value) {
	// empty, null
	if (value == 'null' || value == 'empty') {
		return new Function('value', 'if (value == null || value == "") return true; return false;');
	}
	
	// not empty, not null
	if (value == '!null' || value == '!empty') {
		return new Function('value', 'if (value == null || value == "") return false; return true;');
	}
	// not equals
	if (value.substr(0, 1) === '!') {
		var substr = value.substr(1);
		return new Function('value', 'if (value !== "' + substr + '") return true; return false;');
	}
	// contains
	if (value.substr(0, 1) === '~') {
		var substr = value.substr(1);
		return new Function('value', 'if (value.indexOf("' + substr + '") !== -1) return true; return false;');
	}
	// ^keyword& 
	if (value.substr(0, 1) === '^' && value.substr(value.length - 1, 1) === '&') {
		value = '=' + value.substr(1, value.length - 2);
	}
	// start with
	if (value.substr(0, 1) === '^') {
		var substr = value.substr(1);
		return new Function('value', 'if (value.substr(0, ' + substr.length + ') === "' + substr + '") return true; return false;');
	}
	// end with
	if (value.substr(value.length - 1, 1) === '&') {
		var substr = value.substr(0, value.length - 1);
		return new Function('value', 'if (value.substr(value.length - ' + substr.length + ') === "' + substr + '") return true; return false;');
	}
	// equals
	if (value.substr(0, 1) === '=')
		var substr = value.substr(1);
	else
		var substr = value;
	return new Function('value', 'if (value === "' + substr + '") return true; return false;');
}


dhtmlXGridObject.prototype._get_num_filter=function(value) {
	// empty, null
	if (value == 'null' || value == 'empty') {
		return new Function('value', 'if (value == null || value == "") return true; return false;');
	}

	// not empty, not null
	if (value == '!null' || value == '!empty') {
		return new Function('value', 'if (value == null || value == "") return false; return true;');
	}
	// in range
	var range = value.split('..');
	if (range.length == 2) {
		var num1 = parseFloat(range[0]);
		var num2 = parseFloat(range[1]);
		return new Function('value', 'if (value >= ' + num1 + ' && value <= ' + num2 + ') return true; return false;');
	}
	var r = value.match(/<>|>=|<=|>|<|=/);
	if (r) {
		var op = r[0];
		var num = parseFloat(value.replace(op, ""));
	} else {
		var op = '==';
		num = parseFloat(value);
	}
	if (op == '<>') op = '!=';
	if (op == '=') op = '==';
	return new Function("value"," if (value " + op + " " + num + " ) return true; return false;");
}