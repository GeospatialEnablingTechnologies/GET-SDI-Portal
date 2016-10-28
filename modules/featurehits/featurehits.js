var featurehits_translations={
	el_gr:{
		featurehits_refresh_count:'Ανανέωση πλήθους οντοτήτων'
	},
	en_us:{
		featurehits_refresh_count:'Refresh Feature Count'
	}
}

var featurehits_layer_menu=function(){return {
	text:featurehits_translations[language].featurehits_refresh_count,
	handler:function()
	{
		var _layerId=this.ownerCt._nodeId;
		
		if ((mapFindLayerById(_layerId)._serviceObject._serviceType == "WMS") || (mapFindLayerById(_layerId)._serviceObject._serviceType == "WFS"))
		{
			featurehits_perLayerRequestMenu(mapFindLayerById(_layerId));
		}
	}
}};

function featurehits_init()
{
	if (typeof configurator_translation==="undefined")
	{
		featurehits_perServiceRequest();
		
		mapOnAddLayer(featurehits_perLayerRequest);
		
		_maptab_west_layer_layer_menu_components.push(new featurehits_layer_menu);
	}
}

init_onloadfinished_fn.push(featurehits_init);

function featurehits_perLayerRequestMenu(_layer)
{
	var _p = new fn_get();
	
	var _request = new Array();
	
	if (typeof _layer._layerObject!=="undefined")
	{
		
		_request.push({
			_serviceUrl:_layer._serviceObject._serviceUrl,
			_layers:[_layer._layerObject._layerName]
		});
	
	}
	
	featurehits_request(_request);
}

function featurehits_perLayerRequest(_layer)
{
	var _p = new fn_get();
	
	var _request = new Array();
	
	if (typeof _layer.layer._layerObject!=="undefined")
	{
		
		_request.push({
			_serviceUrl:_layer.layer._serviceObject._serviceUrl,
			_layers:[_layer.layer._layerObject._layerName]
		});
	
	}
	
	featurehits_request(_request);
}
	
function featurehits_perServiceRequest()
{
	var overlayers=mapGetlayersBy("isBaseLayer",false);
	
	var _request = new Array();
	
	for(var i=overlayers.length-1;i>=0;i--)
	{
		var _layer=overlayers[i];
		
		if ((_layer._serviceObject._serviceType == "WMS") || (_layer._serviceObject._serviceType == "WFS"))
		{
			var _requestIndex = fn_objIndexOf(_request,"_serviceUrl",_layer._serviceObject._serviceUrl);
			
			if (_requestIndex<0)
			{	
				_request.push({
					_serviceUrl:_layer._serviceObject._serviceUrl,
					_layers:[]
				});
				
				_requestIndex = _request.length-1;
				
			}
			
			_request[_requestIndex]._layers.push(_layer._layerObject._layerName);
		}
		
	}
	
	featurehits_request(_request);
	
}

function featurehits_request(_request)
{
	var _p = new fn_get();
	
	_p._url = host + 'modules/featurehits/src/index.php';
	
	_p._async = true;
	
	_p._timeout = 30000;
	
	_p._data = _request;
	
	_p._success = featurehits_success;
	
	_p.get();
}


function featurehits_success(_response, _opts)
{
	
	var _response=Ext.JSON.decode(_response.responseText);
	
	Ext.each(_response,function(item)
	{
		var _node=maptab_west_layer_tree_panel_tree_json_store.getRootNode().findChild("id", item._layerId, true);
		
		var _currentText = mapFindLayerById(item._layerId)._layerObject._layerTitle;
		
		var _newText = _currentText + " ("+item._featureCount+")";
		
		_node.set("text",_newText);
	
	});
}