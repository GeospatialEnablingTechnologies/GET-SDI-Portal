var map_controls_featureInfo_TimeOut;

var map_controls_featureInfo_moveEvent_oldX;

var map_controls_featureInfo_moveEvent_oldY;

var map_controls_featureInfo_moveEvent_eXY;

var map_controls_featureInfo_request;

var map_contextMenu_deactivate_featureInfo={
	text: _map_contextMenu_deactivate_featureInfo,
	id:'_map_contextMenu_deactivate_featureInfo',
	handler: function()
	{
		Ext.getCmp("maptab_toolbar_general_featureInfo").toggle(false);
	}
};

function map_controls_featureInfo()
{
	mapUnregisterEvents("click",map_controls_featureInfo_moveEvent);
	
	var state=Ext.getCmp("maptab_toolbar_general_featureInfo").pressed;
	
	map_contextMenu.remove("_map_contextMenu_deactivate_featureInfo");
	
	document.onkeydown = null;
	
	if (state)
	{
		map_controls_featureInfo_request=new fn_get();
		
		mapOnClick(map_controls_featureInfo_moveEvent);
		
		map_contextMenu.add(map_contextMenu_deactivate_featureInfo);
		
		Ext.getCmp('maptab_east').expand();
		
		Ext.getCmp('maptab_east_feature_panel').expand();
		
		document.onkeydown=function(evt)
		{
			evt = evt || window.event;
			if (evt.keyCode == 27) {
				Ext.getCmp("maptab_toolbar_general_featureInfo").toggle(false);
			}
		}
		
	}
}

var map_highlightLayerFeatureInfo;

init_onload_fn.push(init_map_controls_featureInfo);

function init_map_controls_featureInfo()
{
	map_highlightLayerFeatureInfo=new OpenLayers.Layer.Vector("map_highlightLayerFeatureInfo",{
		styleMap:new OpenLayers.StyleMap({
			"default":new OpenLayers.Style({
				pointRadius: 5, 
				fillColor: "#FFCB50",
				fillOpacity: 0.4, 
				strokeColor:  "#FF9428",
				strokeWidth: 1,
				strokeOpacity:0.8
			})
		})
	});

	map.addLayer(map_highlightLayerFeatureInfo);

	mapOnRemoveLayer(map_controls_featureInfo);
	
	mapOnAddLayer(map_controls_featureInfo);
}

function map_controls_featureInfo_moveEvent(e)
{

	map_controls_featureInfo_moveEvent_eXY=e;
	
	
	map_controls_featureInfo_query();
	
	/*if(e && ((e.xy.x!=map_controls_featureInfo_moveEvent_oldX) || (e.xy.y!=map_controls_featureInfo_moveEvent_oldY)))
	{
		map_controls_featureInfo_moveEvent_oldX=e.xy.x;
		
		map_controls_featureInfo_moveEvent_oldY=e.xy.y;
		
		map_controls_featureInfo_moveEvent_eXY=e;

		clearTimeout(map_controls_featureInfo_TimeOut);
		
		map_controls_featureInfo_TimeOut=setTimeout(map_controls_featureInfo_query,50);
	}*/	
}

var map_controls_eastPanel_foundFeaturesGrid_mask;

function map_controls_featureInfo_query()
{
	map_highlightLayerFeatureInfo.removeAllFeatures();

	var _queryObject=map_controls_featureInfo_fetch_querable_layers();

	if (_queryObject.length>0)
	{
		map_controls_featureInfo_request._async=true;
		
		var lonlat = map.getLonLatFromPixel(map_controls_featureInfo_moveEvent_eXY.xy);
		
		map_controls_featureInfo_request._query=fn_createGetQuery({
			_width:Math.round(mapGetSize().w),
			_height:Math.round(mapGetSize().h),
			_x:Math.round(map_controls_featureInfo_moveEvent_eXY.xy.x),
			_y:Math.round(map_controls_featureInfo_moveEvent_eXY.xy.y),
			_bbox:mapGetExtent().toString(),
			_srs:mapGetCurrentProjection(),
			_lon:lonlat.lon,
			_lat:lonlat.lat
		});
		
		map_controls_featureInfo_request._data=_queryObject;
		
		map_controls_featureInfo_request._timeout=15000;
		
		map_controls_featureInfo_request._success=map_controls_featureInfo_success;
		
		map_controls_featureInfo_request._failure=map_controls_featureInfo_failure;

		map_controls_eastPanel_foundFeaturesGrid_mask.show();
	
		map_controls_featureInfo_request.get();
		
	}
}

function map_controls_featureInfo_failure(_response, _opts)
{
	map_controls_eastPanel_foundFeaturesGrid_mask.hide();
}

function map_controls_featureInfo_success(_response, _opts)
{
	
	var _response=Ext.JSON.decode(_response.responseText);
	
	var _data=new Array();
	
	Ext.each(_response,function(item)
	{
		Ext.each(item._response._attributes,function(record)
		{
			var _record=fn_createAttributeSummary(record[0],mapFindLayerById(item._response._layerId)._layerObject._attributesFields);
			
			_data.push(_record);
			
		});
		
	});
	
	map_controls_foundFeaturesGrid.getStore().loadData(_data);
	
	map_controls_eastPanel_foundFeaturesGrid_mask.hide();
	
	var countRecords=map_controls_foundFeaturesGrid.getStore().getCount();
	
	if (countRecords>0)
	{
		var _record = map_controls_foundFeaturesGrid.getStore().getAt(0);
		
		var _feature=fn_featureObject(_record);
	
		map_controls_foundFeaturesGrid.getView().select(_record);
		
		if (mapFindLayerById(_feature._layerId)._layerObject._nativeSRS!="")
		{
			fn_callFeatureFnFromGrid(_feature._featureId,_feature._layerId,_feature._srsName,_feature._featureUrl,_feature._featureGeomFormat,'getInfo');
		}
	}
	
	countRecords=" (" +countRecords+ ")";
	
	Ext.getCmp("maptab_east_hover_feature_panel").setTitle(_maptab_east_hover_feature_panel+countRecords);
}


var map_controls_foundFeaturesGrid_Columns=[
	{_attributeName:"_featureId",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_layerId",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_featureGeomFormat",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_summary",_attributeSortable:true,_attributeType:"string",_attributeTranslation:_feature_Attributes_Translations_Summary,flex:3}
];

var map_controls_foundFeaturesGrid_Store=fn_createAttributesStore(fn_featureColumnModelForGrid(map_controls_foundFeaturesGrid_Columns));

map_controls_foundFeaturesGrid_Store.group("_layerId");

var map_controls_foundFeaturesGrid=Ext.create('Ext.grid.Panel',
{
	border:false,
	columnLines:true,
	selModel: Ext.create('Ext.selection.CheckboxModel',{mode:'SIMPLE',checkOnly:true}),
	store:map_controls_foundFeaturesGrid_Store,
	columns:fn_createAttributesColumnModel(fn_featureColumnModelForGrid(map_controls_foundFeaturesGrid_Columns)),
	features: [{
		ftype: 'grouping',
		groupHeaderTpl: [
			'{name:this.formatName}',
			{
				formatName: function(name) {
					return mapFindLayerById(name)._layerObject._layerTitle + " ("+mapFindLayerById(name)._serviceObject._serviceType+")";
				}
			}
		]
	}],
	tbar:fn_createFetureGridTopBar(),
	listeners:{
		select:function(row, record, index, eOpts)
		{
			var _feature=fn_featureObject(record);
			
			fn_featureHighlightFeatureInfo(_feature);
			
		},
		deselect:function(row, record, index, eOpts)
		{
			var _feature=fn_featureObject(record);
			
			fn_featureUnHiglightedFeatureInfo(_feature);
		}
	}
});

function fn_featureHighlightFeatureInfo(_feature)
{
	var _theFeature=fn_fetchGML(_feature);
	
	if (typeof _theFeature!=="undefined")
	{
		var _f=_theFeature.clone();
		
		_f.fid=_theFeature.fid;
		
		map_highlightLayerFeatureInfo.addFeatures(_f);
	}
}

function fn_featureUnHiglightedFeatureInfo(_feature)
{
	map_highlightLayerFeatureInfo.removeFeatures([mapGetFeatureByFid(map_highlightLayerFeatureInfo.id,_feature._featureId)]);
}

function init_map_controls_eastPanel_foundFeaturesGrid()
{
	var featuresPanel={
		xtype:'panel',
		region:'center',
		layout:'fit',
		title:_maptab_east_hover_feature_panel,
		id:'maptab_east_feature_panel',
		iconCls:'maptab_accordion_icon',
		items:[{
			xtype:'panel',
			layout:'fit',
			id:'maptab_east_hover_feature_panel',
			items:[
			map_controls_foundFeaturesGrid]
		}]
	}

	
	Ext.getCmp('maptab_east_south').add(featuresPanel);
	
	fn_grid_results_ids_array.push(map_controls_foundFeaturesGrid.id);
	
	map_controls_eastPanel_foundFeaturesGrid_mask=fn_loadingMask(Ext.getCmp('maptab_east_hover_feature_panel'),_mask_loading_message_default);
}

function map_controls_featureInfo_fetch_querable_layers()
{
	var overlayers=map.getLayersBy("isBaseLayer",false);
	
	var features = [], targets = [], layers = [], layer, target, feature, i, len, b=[];
	
	for(var i=overlayers.length-1;i>=0;i--)
	{
		layer = overlayers[i];
		
		features = []
		
        if (layer.div.style.display !== "none")
		{
            if ((layer instanceof OpenLayers.Layer.Vector) && (typeof layer._layerObject!=="undefined"))
			{
			
				if (layer._layerObject._isQueryable)
				{
					target = document.elementFromPoint(map_controls_featureInfo_moveEvent_eXY.clientX, map_controls_featureInfo_moveEvent_eXY.clientY);
					
					while (target && target._featureId) 
					{
						feature = mapGetFeatureById(layer._layerObject._layerId, target._featureId);
						
						if (feature) 
						{
							var featureid=feature.fid;
						
							if (featureid!=null)
							{
								if ((layer._layerObject._featureType!=null) && (typeof layer._layerObject._featureType!=="undefined"))
								{
									if ((featureid.indexOf(layer._layerObject._featureType))<0)
									{
										featureid=layer._layerObject._featureType+"."+featureid;
									}
								}
							
							}
							
							features.push(featureid);
							
							target.style.display = "none";
								
							targets.push(target);
								
							target = document.elementFromPoint(map_controls_featureInfo_moveEvent_eXY.clientX, map_controls_featureInfo_moveEvent_eXY.clientY);
							
						} 
						else 
						{
							target = false;
						}
					}
				}
            }
		
			if (((layer instanceof OpenLayers.Layer.Vector) && (features.length>0)) || (!(layer instanceof OpenLayers.Layer.Vector)))
			{
				if (typeof layer._layerObject!=="undefined")
				{
					if (layer._layerObject._isQueryable)
					{
					
						var lonlat = map.getLonLatFromPixel(map_controls_featureInfo_moveEvent_eXY.xy);
						
						if (layer._layerObject._nativeSRS!=mapGetCurrentProjection())
						{
							lonlat.transform(new OpenLayers.Projection(mapGetCurrentProjection()),new OpenLayers.Projection(layer._layerObject._nativeSRS));
						}
						
						var _servicePort = "";
			
						if (typeof layer._serviceObject._servicePort!=="undefined")
						{
							_servicePort = layer._serviceObject._servicePort;
						}
						
						var _timeDimension = "";
						
						var _serviceUrl = layer._serviceObject._serviceUrl;
						
						if (typeof layer.params!=="undefined")
						{
							if (typeof layer.params["TIME"]!=="undefined")
							{
								_timeDimension = layer.params["TIME"];
								
								_serviceUrl = Ext.urlAppend(_serviceUrl, "TIME="+_timeDimension);
							}
						}
					
						b.push({
							_layerId:layer._layerObject._layerId,
							_serviceType:layer._serviceObject._serviceType,
							_username:layer._serviceObject._username,
							_serviceUrl:_serviceUrl,
							_serviceName:layer._serviceObject._serviceName,
							_servicePort:_servicePort,
							_geometryField:layer._layerObject._geometryField,
							_password:layer._serviceObject._password,
							_layerName:layer._layerObject._layerName,
							_version:layer._serviceObject._version,
							_isService:layer._serviceObject._isService,
							_featureType:layer._layerObject._featureType,
							_cqlFilter:layer._layerObject._cqlFilter,
							_infoLon:lonlat.lon,
							_infoLat:lonlat.lat,
							_nativeSRS:layer._layerObject._nativeSRS,
							_featureInfoFormat:layer._serviceObject._featureInfoFormat,
							_featureId:features.join(","),
							_request:"getInfo"
						});
					}
				}
			}
			
            layers.push(layer);
			
            layer.div.style.display = "none";
        }
    }

    for (i=0, len=targets.length; i<len; ++i) 
	{
        targets[i].style.display = "";
    }

    for (i=layers.length-1; i>=0; --i) 
	{
        layers[i].div.style.display = "block";
    }
	
	return b;
}

