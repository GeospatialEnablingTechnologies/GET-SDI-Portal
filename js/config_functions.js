
function init_config_create_tree_groups()
{

	if (typeof _config_create_tree_groups!=="undefined")
	{
		if (_config_create_tree_groups.length>0)
		{
			Ext.each(_config_create_tree_groups,function(item){
			
				maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_layers_node').appendChild(item);
	
				Ext.getCmp("maptab_west_layer_tree_panel_tree").getView().refresh(false);
			});
			
		}
	}
}

function init_config_add_layer()
{
	var mask=fn_loadingMask(Ext.getBody(),_mask_loading_message_default);
	
	mask.show();
	
	Ext.each(_config_load_layers,function(item){
		
		var _layerObject;
		
		switch(item._serviceType)
		{
			case "WMS":
				
				var _serviceObject=wms_register_service(item._serviceUrl,item._username,item._password);
				
				wms_fetch_layers(_serviceObject);
				
				var _layers=item._layerName;
				
				if (item._layerName=="*")
				{
					var _layers=wms_StoreColumnsServiceLayers.store;
					
					for(var i=0;i<=i<_layers.getCount();i++)
					{
						try{
						
							var _layer=_layers.getAt(i);
						
							var _layerObject = _layer.get("_layerObject");
							
							_layerObject._groupId = config_getPerLayer_GroupId(item,_layerObject._layerName);
								
							wms_register_layer(_serviceObject,_layerObject);
							
						}catch(err){}
					}
					
				}
				else
				{
					var _layers=_layers.reverse();
					
					for(var i=0;i<_layers.length;i++)
					{
						try{
							var _layer=_layers[i];
					
							var _layerObject;
					
							_layerObject = wms_StoreColumnsServiceLayers.store.findRecord('_layerName', _layer,0,false,true,true).get("_layerObject");
							
							if (_layerObject)
							{
								_layerObject._groupId = config_getPerLayer_GroupId(item,_layer);
								
								wms_register_layer(_serviceObject,_layerObject);
								
							}
						
						}catch(err){}
					
					}
				}
				
			break;
			
			case "WMTS":
				
				var _serviceObject=wmts_register_service(item._serviceUrl,item._username,item._password);
				
				wmts_fetch_layers(_serviceObject);
				
				var _layers=item._layerName;
				
				if (item._layerName=="*")
				{
					var _layers=wmts_StoreColumnsServiceLayers.store;
					
					for(var i=0;i<=i<_layers.getCount();i++)
					{
						try{
							var _layer=_layers.getAt(i);
						
							var _layerObject = _layer.get("_layerObject");
							
							_layerObject._groupId = config_getPerLayer_GroupId(item,_layerObject._layerName);
								
							wmts_register_layer(_serviceObject,_layerObject);
							
							
						}catch(err){}
					}
					
				}
				else
				{
					var _layers=_layers.reverse();
					
					for(var i=0;i<_layers.length;i++)
					{
					
						try
						{
							var _layer=_layers[i];
						
							var _layerObject;
						
							_layerObject = wmts_StoreColumnsServiceLayers.store.findRecord('_layerName', _layer,0,false,true,true).get("_layerObject");
							
							if (_layerObject)
							{
								_layerObject._groupId = config_getPerLayer_GroupId(item,_layer);
								
								wmts_register_layer(_serviceObject,_layerObject);
								
							}
						}catch(err){}
					
					}
				}
				
			break;
			
			case "WFS":
				
				var _serviceObject=wfs_register_service(item._serviceUrl,item._username,item._password);
				
				wfs_fetch_layers(_serviceObject);
				
				var _layers=item._layerName;
				
				if (item._layerName=="*")
				{
					var _layers=wfs_StoreColumnsServiceLayers.store;
					
					for(var i=0;i<=i<_layers.getCount();i++)
					{
						try{
						
							var _layer=_layers.getAt(i);
						
							var _layerObject = _layer.get("_layerObject");
							
							_layerObject._groupId = config_getPerLayer_GroupId(item,_layerObject._layerName);
								
							wfs_register_layer(_serviceObject,_layerObject);
							
							
						}catch(err){}
					}
					
				}
				else
				{
					var _layers=_layers.reverse();
					
					for(var i=0;i<_layers.length;i++)
					{
						try{
							var _layer=_layers[i];
					
							var _layerObject;
					
							_layerObject = wfs_StoreColumnsServiceLayers.store.findRecord('_layerName', _layer,0,false,true,true).get("_layerObject");
							
							if (_layerObject)
							{
								_layerObject._groupId = config_getPerLayer_GroupId(item,_layer);
								
								wfs_register_layer(_serviceObject,_layerObject);
								
							}
						
						}catch(err){}
					
					}
				}
				
			break;
			
			
			case "CSW":
				
				var _serviceObject=csw_register_service(item._serviceUrl,item._username,item._password);
				
			break;
		}
		
	});
	
	maptab_west_layer_reorder_layer();
	
	mask.hide();
	
}

function config_getPerLayer_GroupId(item,_layerName)
{

	var _groupId= item._groupId;

	if (typeof item._perLayerProperties!=="undefined")
	{
		Ext.each(item._perLayerProperties,function(_layerProperties){

			Ext.iterate(_layerProperties,function(_propertyKey,_propertyValue){
				
				if ((_propertyKey=="_layerName") && (_propertyValue==_layerName))
				{
					if (typeof _layerProperties._groupId!=="undefined")
					{
						_groupId=_layerProperties._groupId;
					}
				}
			});
		});
	}
	
	return _groupId;
}

function config_update_layerObjectProperties(_layerObject,_configItem)
{
	if (_layerObject)
	{
		Ext.iterate(_configItem._generalProperties,function(_propertyKey,_propertyValue)
		{
			var _hasCustomIndex=fn_objIndexOf(_configItem._perLayerProperties,"_layerName",_layerObject._layerName);
			
			var _hasCustom=false;
			
			if (_hasCustomIndex>=0)
			{
				var _perLayerItem=_configItem._perLayerProperties[_hasCustomIndex];
				
				if (typeof _perLayerItem[_propertyKey]!=="undefined")
				{
					_propertyValue=_perLayerItem[_propertyKey];
					
					_hasCustom=true;
					
					if (_propertyValue!="inherit")
					{
						_layerObject[_propertyKey]=_propertyValue;
					}
				}
				
				if((typeof _perLayerItem._attributes!=="undefined") && (_perLayerItem._attributes!=""))
				{
					if ((_perLayerItem._attributes=="*") && ((typeof _perLayerItem._attributesExceptions!=="undefined") || (_perLayerItem._attributesExceptions!=="")))
					{
						Ext.each(_perLayerItem._attributesExceptions,function(_exceptAttribute){
							
							var _attributeIndex=fn_objIndexOf(_layerObject._attributesFields,"_attributeName",_exceptAttribute);
							
							if (_attributeIndex>=0)
							{
								Ext.Array.erase(_layerObject._attributesFields,_attributeIndex,1);
								
								Ext.Array.clean(_layerObject._attributesFields);
							}
						
						});
						
					}
					else if (_perLayerItem._attributes!="*")
					{
					
						var _attributesRemoved=[];
						
						Ext.each(_layerObject._attributesFields,function(_attribute)
						{
							if (_perLayerItem._attributes.indexOf(_attribute._attributeName)<0)
							{
								_attributesRemoved.push(_attribute);
							}
						});
						
						for(var i=0;i<_attributesRemoved.length;i++)
						{
							Ext.Array.remove(_layerObject._attributesFields,_attributesRemoved[i]);
						}
						
						Ext.Array.clean(_layerObject._attributesFields);
						
						var _orderAttributes=[];
						
						Ext.each(_perLayerItem._attributes,function(_attribute){
						
							var _attributeIndex=fn_objIndexOf(_layerObject._attributesFields,"_attributeName",_attribute);
							
							if (_attributeIndex>=0)
							{
								_orderAttributes.push(_layerObject._attributesFields[_attributeIndex]);
							}
						})
						
						_layerObject._attributesFields=_orderAttributes;
						
					}
				}
				
				if((typeof _perLayerItem._attributesFields!=="undefined") && (_perLayerItem._attributesFields.length>0))
				{
					Ext.each(_perLayerItem._attributesFields, function(_attribute)
					{
						
						var _attributeIndex=fn_objIndexOf(_layerObject._attributesFields,"_attributeName",_attribute._attributeName);
						
						if (_attributeIndex>=0)
						{
							if (typeof _attribute._attributeType!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeType=_attribute._attributeType;
							}
							
							if (typeof _attribute._attributeTranslation!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeTranslation=_attribute._attributeTranslation;
							}
							
							if (typeof _attribute._attributeEditor!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeEditor=_attribute._attributeEditor;
							}
							
							if (typeof _attribute._attributeIsSortable!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeIsSortable=_attribute._attributeIsSortable;
							}
							
							if (typeof _attribute._attributeIsVisible!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeIsVisible=_attribute._attributeIsVisible;
							}
							
							if (typeof _attribute._attributeIsSearchable!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeIsSearchable=_attribute._attributeIsSearchable;
							}
							
							if (typeof _attribute._attributeVisible!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeVisible=_attribute._attributeVisible;
							}
							
							if (typeof _attribute._attributeShowOnSummary!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex]._attributeShowOnSummary=_attribute._attributeShowOnSummary;
							}
							
							if (typeof _attribute.renderer!=="undefined")
							{
								_layerObject._attributesFields[_attributeIndex].renderer=_attribute.renderer;
							}
							
						}
					
					});
				}
			}
			
			if ((_propertyValue!="inherit") && (!_hasCustom))
			{
				
				if (_propertyValue=="*")
				{
					_layerObject[_propertyKey]=true;
				
				}else if ((_propertyKey=="_layerTitle") || (_propertyKey=="_layerAbstract") || (_propertyKey=="_opacity"))
				{
						if (_layerObject[_propertyKey]!="")
						{
							_layerObject[_propertyKey]=_propertyValue;
						}
				}else
				{
					_layerObject[_propertyKey]=false;
					
					if (Ext.Array.contains(_propertyValue, _layerObject._layerName))
					{
						_layerObject[_propertyKey]=true;
					}
					
				}
				
			}	
		});
		
	}
}

function config_init_layerScales(_layerObject)
{
	
	var _config=new _config_init_map();
	
	var _defaultScales=_config._defaultScales;
		
	if(typeof _defaultScales!=="undefined")
	{
		var _arrayScales=[];
		
		for(var i=0;i<_defaultScales.length;i++)
		{
			var _min=_defaultScales[i];
			
			var _max;
			
			if (_defaultScales[i+1])
			{
				_max=_defaultScales[i+1];
			}
			else
			{
				_max=-1;
			}
			
			var _minmax=[_min,_max];
			
			
			_arrayScales.push(_minmax);
			
		}
		
		_layerObject._scales=_arrayScales;
	}
	
}

function config_update_addLayer(_layerObject,_serviceObject)
{
	if ((_layerObject) && (_serviceObject))
	{
		Ext.each(_config_load_layers,function(item)
		{
			if(item._serviceUrl==_serviceObject._serviceUrl)
			{
				if (item._layerName=="*")
				{
					
					config_update_layerObjectProperties(_layerObject,item);
				}
				else
				{
					
					if (Ext.Array.contains(item._layerName, _layerObject._layerName))
					{
						config_update_layerObjectProperties(_layerObject,item);
					}
				}
			}
		});
	}
}

function config_findConfig(_layerObject,_serviceObject)
{
	var output=false;

	if (installing==false)
	{
		
		if ((_layerObject) && (_serviceObject))
		{
			for(var k in _config_load_layers)
			{
				var item = _config_load_layers[k];
				
				if(item._serviceUrl==_serviceObject._serviceUrl)
				{
					if (Ext.Array.contains(item._layerName, _layerObject._layerName))
					{	
						var _hasCustomIndex=fn_objIndexOf(item._perLayerProperties,"_layerName",_layerObject._layerName);
						
						if (_hasCustomIndex>=0)
						{
							output=item._perLayerProperties[_hasCustomIndex];
						}
					}
				}
			}
		}
		
	}
	
	return output;
}

function config_getProperty(_layerObject,_serviceObject,_propertyName,_currentValue)
{
	var output=_currentValue;
	
	if ((_layerObject) && (_serviceObject))
	{
		Ext.each(_config_load_layers,function(item)
		{
			if(item._serviceUrl==_serviceObject._serviceUrl)
			{
				if (typeof item._perLayerProperties!=="undefined")
				{
					Ext.each(item._perLayerProperties,function(layeritem)
					{
						if(layeritem._layerName==_layerObject._layerName)
						{
							if(typeof layeritem[_propertyName]!=="undefined")
							{
								if ((layeritem[_propertyName]!="") && (layeritem[_propertyName]!=null))
								{
									output=layeritem[_propertyName];
								}
							}
						}
						
					});
				}
			}
		});
	}
	
	return output;
}

function config_setProperty(_layerObject,_serviceObject,_propertyName,_propertyValue)
{
	if ((_layerObject) && (_serviceObject))
	{
		Ext.each(_config_load_layers,function(item)
		{
			if(item._serviceUrl==_serviceObject._serviceUrl)
			{
				if (typeof item._perLayerProperties!=="undefined")
				{
					Ext.each(item._perLayerProperties,function(layeritem)
					{
						if(layeritem._layerName==_layerObject._layerName)
						{
							layeritem[_propertyName] = _propertyValue;
						}
						
					});
				}
			}
		});
	}
}

function init_config_congigure_portal()
{
	var _config=new _config_init_map();
	
	if (Ext.getCmp("maptab_toolbar_edit_tab"))
	{
		if (typeof _config._canEdit!=="undefined")
		{
			if (_config._canEdit)
			{
				Ext.getCmp("maptab_toolbar_edit_tab").enable();
			}
			else
			{
				Ext.getCmp("maptab_toolbar_edit_tab").disable();
			}
		}
	}
	if (typeof _config._canAddService!=="undefined")
	{
		if (_config._canAddService)
		{
			Ext.getCmp("maptab_west_layer_tree_panel_add_btn").enable();
		}
		else
		{
			Ext.getCmp("maptab_west_layer_tree_panel_add_btn").disable();
		}
	}
	if (typeof _config._canRemoveLayer!=="undefined")
	{
		if (_config._canRemoveLayer)
		{
			Ext.getCmp("maptab_west_layer_tree_panel_remove_btn").enable();
		}
		else
		{
			Ext.getCmp("maptab_west_layer_tree_panel_remove_btn").disable();
		}
	}

}

function config_add_layer_from_url()
{
	var url=fn_getParameterByName("service_url");

	if ((url!=null) && (url!=""))
	{
		var _serviceObject=wms_register_service(url,"","");
		
		wms_fetch_layers(_serviceObject);
		
		var _layers=wms_StoreColumnsServiceLayers.store;
		
		var _layerObject;
		
		var layer_name=fn_getParameterByName("layer_name");
		
		_layerObject = wms_StoreColumnsServiceLayers.store.findRecord('_layerName',layer_name,0,false,true,true).get("_layerObject");

		if (_layerObject)
		{
			wms_register_layer(_serviceObject,_layerObject);
		}
		
		var bbox=fn_getParameterByName("bbox");
		
		if ((bbox!=null) && (bbox!=""))
		{
			bbox=new OpenLayers.Bounds.fromString(bbox);
			
			if (mapGetCurrentProjection()!="EPSG:4326")
			{
				bbox=bbox.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection(mapGetCurrentProjection()));
			}
		
			map.zoomToExtent(bbox);
		}
	}
}

var init_onloadfinished_fn = new Array();


Ext.onReady(function()
{
	if (typeof fn_setConfigPolicy == 'function') { 
		fn_setConfigPolicy();
	}
	

	init_map();
	
	init_config_congigure_portal();

	init_config_create_tree_groups();
	
	setTimeout(function(){
	
		init_config_add_layer();
		
		config_add_layer_from_url();
		
		maptab_west_search_settings_grid_on_add_remove_layer();
		
		init_maptab_west_search_settings_grid_store_populate();
		
		Ext.each(init_onloadfinished_fn,function(item)
		{
			if(item)
			{
				item();
				
			}
		});
	},0);
	
	
});

