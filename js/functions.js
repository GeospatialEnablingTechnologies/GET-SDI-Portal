var maptab_search_results_count=0;

var _proxy_url=host+"src/proxy/index.php";

/************* IE HACK ************************/
/********* creates the indexOf for array ******/
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    }
}

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

/********* remove unnecessary namespaces the IE *******/
/********* adds when reading xml documents ************/
var _class = OpenLayers.Format.XML;

var originalWriteFunction = _class.prototype.write;

var patchedWriteFunction = function()
{
	var child = originalWriteFunction.apply( this, arguments );
	
	child = child.replace( new RegExp( 'xmlns:NS1="" NS1:', 'g' ), '' );
	
	child = child.replace(new RegExp('xmlns:NS\\d+="" NS\\d+:', 'g'), '');
	
	return child;
}

_class.prototype.write = patchedWriteFunction;


/***********************************************/

var fn_grid_results_ids_array=[];

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function fn_objIndexOf(obj,name,value)
{

	for(var i=0;i<obj.length;i++)
	{ 
		var c=obj[i];
		
		if (c[name]==value)
		{
			return i;
		}
	}
	
	return -1;
}

function fn_toggleControl(name,toogle,controls)
{


	if (typeof controls==="undefined")
	{
		controls=map_controls;
	}

	if (typeof toogle==="undefined")
	{
		if (controls[name])
		{
			if(controls[name].active)
			{
				controls[name].deactivate();
			}
			else
			{
				controls[name].activate();
			}
		}
	}
	else
	{
	
		if (controls[name])
		{
			if (toogle)
			{
				controls[name].activate();
			}
			else
			{
				controls[name].deactivate();
			}
		}
	}
}

function fn_createGetQuery(object)
{
	var arr=new Array();
	
	for(var k in object)
	{
		arr.push(k.toString()+"="+object[k]);
	}
	
	return arr.join("&");
}

function fn_get()
{
	//request can be
	//a)registerService
	//b)registerLayer
	//c)fetchLayers
	//d)getInfo
	//e)getAttributes
	//f)search

	this._url=_proxy_url;
	
	this._query="";
	
	this._data=new Array();
	
	this._async=false;
	
	this._timeout=1000;
	
	this._extAjax;
	
	this._success;
	
	this._failure;
	
	this._ajax=function()
	{
		var _q_url=Ext.urlAppend(this._url,this._query);
	
		var _params={};
	
		if (this._data.length>0)
		{
			_params={data:Ext.JSON.encode(this._data)};
		}
		
	
		this._extAjax=Ext.Ajax.request({
			url: _q_url,
			method: 'POST',
			params:_params,
			async:this._async,
			callback:function(){
				Ext.getCmp("maptab_bbar_general_wait_label").update('');
			},
			success:this._success,
			failure:this._failure
		});
		
		return this._extAjax;
	}
	
	this.get=function()
	{
		Ext.getCmp("maptab_bbar_general_wait_label").update(_map_general_please_wait);
		Ext.getCmp("maptab_bbar_general_wait_label").show();
	
		if(typeof this._extAjax!=="undefined")
		{
			Ext.Ajax.abort(this._extAjax);
		}
		
		return this._ajax();
	}
}



function fn_loadingMask(_element,_message)
{
	var m = new Ext.LoadMask(_element, {msg:_message});
	
	return m;
}

function fn_getDateTime()
{
	var date = new Date();
	
	var t = (date.getMonth()+1) + "/" + date.getDate() + "/" +  date.getFullYear() + "  " + date.getHours() +":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());

	return t;
}

function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor();

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}


function trim(str) {
    return str.replace(/^\s+|\s+$/g,"");
}

function fn_replace(_value,_arrReplace,_arrReplaceWith)
{
	for(var i = 0; i < _arrReplace.length; i++) {
		_value = _value.replace(new RegExp('{' + _arrReplace[i] + '}', 'gi'), _arrReplaceWith[i]);
	}
	
	return _value;
}

function fn_id(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function fn_surl(_url,_username,_password,_proxy)
{
	if (_url.indexOf("?")<0)
	{
		_url=Ext.urlAppend(_url,"?_t");
	}
	
	_url=Ext.urlAppend(_proxy_url,"proxy="+_proxy+"&url="+_url);
	
	return _url;
}

function fn_encrypt(_value)
{
	return _value;
}

function fn_decrypt(_value)
{
	return _value;
}

function fn_reverseAxis(_geometry)
{
	var _coords=_geometry.match(/-?\d+\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	
	var temp_geom=_geometry;
	
	for(var i=0;i<_coords.length-1;i++)
	{
		temp_geom=temp_geom.replace(_coords[i]+" "+_coords[i+1],_coords[i+1]+"#"+_coords[i]);
	}
	
	temp_geom=temp_geom.replace(/#/g," ");
	
	return temp_geom;
}

function fn_determineAxisOrder(_nativeSRS)
{
	try
	{
		var _sub=_nativeSRS.substring(0,3);

		_sub=_sub.toLowerCase();
		
		if (_sub=="urn")
		{
			if ((mapGetProjectionCode(_nativeSRS)=="EPSG:4326") ||
				(mapGetProjectionCode(_nativeSRS)=="EPSG:3035"))
			{
				return false;
			}
		}
		
		return true;
	}catch(err){return false;}
}


var fn_dateDiff = {

    inDays: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000));
    },

    inWeeks: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000*7));
    },

    inMonths: function(d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();

        return (d2M+12*d2Y)-(d1M+12*d1Y);
    },

    inYears: function(d1, d2) {
        return d2.getFullYear()-d1.getFullYear();
    }
}
