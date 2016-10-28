var map;
var map_previousProjection;
var map_currentProjection;
var map_controls;
var map_highlightLayer;
var map_basemapProjections = new Array();
var map_isGeodesic = true;

var map_contextMenu=Ext.create("Ext.menu.Menu",{
	floating:true,
	ignoreParentClick: true,
	items:[{
		text:_map_contextMenu_Cancel
	}]
});

Proj4js.defs["EPSG:900913"]= "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
Proj4js.defs["EPSG:2100"] = "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=-199.87,74.79,246.62,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:3857"]="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
Proj4js.defs["EPSG:32661"] = "+proj=stere +lat_0=90 +lat_ts=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
Proj4js.defs["EPSG:4258"] = "+proj=longlat +ellps=GRS80 +no_defs";
Proj4js.defs["EPSG:32717"] = "+proj=utm +zone=17 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
Proj4js.defs["EPSG:3035"] = "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs";

function init_map()
{
	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
	
	OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
	
	OpenLayers.Util.onImageLoadErrorColor = 'transparent';
	
	map = new OpenLayers.Map("maptab_map",{controls:[]});
	
	_map_config_object = new _config_init_map();
	
	for(var k=0;k<_map_config_object._basemapLayers.length;k++)
	{
		map.addLayer(_map_config_object._basemapLayers[k]._layer);
		
		var layerProjection = _map_config_object._basemapLayers[k]._layer.projection.getCode().toString();
		
		if (map_basemapProjections.indexOf(layerProjection)<0)
		{
			map_basemapProjections.push(layerProjection);
		}
		
		maptab_west_layer_add_BaseLayer(_map_config_object._basemapLayers[k]._layer,maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_basemaps_node'));
	}
	
	map.setOptions(_map_config_object._mapOptions);
	
	map_controls = _map_config_object._mapControls;
	
	init_map_controls_measureDistance();
	
	init_map_controls_measureArea();
	
	for(var key in map_controls)
	{
		map.addControl(map_controls[key]);
	}
	
	//map.addControl(new OpenLayers.Control.LayerSwitcher());
	
	mapListOfBasemapProjections();
	
	map_previousProjection = mapGetCurrentProjection();
	
	map_currentProjection = mapGetCurrentProjection();
	
	map.div.oncontextmenu = function noContextMenu(e) {return false;}
	
	Ext.EventManager.on(Ext.get(map.div.id), 'contextmenu', function(e)
	{
		if (map_contextMenu.items.length>1)
		{
			map_contextMenu._pos = e.getXY();
			map_contextMenu.showAt(e.getXY());
		}
	});
	
	var _initCenter= new OpenLayers.LonLat(_map_config_object._initCenter[0],_map_config_object._initCenter[1]);
	
	if (map_currentProjection!="EPSG:4326")
	{
		_initCenter.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(map_currentProjection));
	}
	
	map_highlightLayer=new OpenLayers.Layer.Vector("map_highlightLayer",{
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
	
	map.addLayer(map_highlightLayer);
	
	mapSetCenter(Number(_initCenter.lon),Number(_initCenter.lat),_map_config_object._initZoom);
	
	init_maptab_bbar_general_bbar();
	
	init_map_controls_eastPanel_foundFeaturesGrid();
	
	init_maptab_toolbar_search_controls();
	
	init_maptab_west_general_settings_store_load_data();
	
	fn_execOnloadFn();
	
	mapOnChangeBaseLayer(mapChangeBaseLayer);
	
	mapOnChangeBaseLayer(mapCheckLayerSupportedProjection);
	
	mapOnAddLayer(mapCheckLayerSupportedProjection);
	
	mapOnZoomEnd(mapSetVisibilityBaseOnScales);
	
	mapOnZoomEnd(fn_maptab_toolbar_general_handle_zoom_in_out);
	
	map.updateSize();
	
}


function mapCheckLayerSupportedProjection()
{
	var overlayers=mapGetlayersBy("isBaseLayer",false);
	
	for(var i=overlayers.length-1;i>=0;i--)
	{
		var layer=overlayers[i];
		
		if (typeof layer._layerObject!=="undefined")
		{
			if ((!layer._serviceObject._isVector) &&(layer._serviceObject._isService))
			{
				if (layer._layerObject._supportedEPSG!=null)
				{
					var _supportedEPSG=layer._layerObject._supportedEPSG;
					
					if (_supportedEPSG.indexOf(mapGetCurrentProjection())<0)
					{
						maptab_west_layer_get_node_from_id(layer._layerObject._layerId).set('cls', 'disabled');
						
					}else{
					
						maptab_west_layer_get_node_from_id(layer._layerObject._layerId).set('cls', '');
						
					}
				}
			}
		}
	}

}

function mapChangeBaseLayer(a,b)
{

	if (typeof map.baseLayer._restrictedExtent!=="undefined")
	{
		map.setOptions({restrictedExtent:map.baseLayer._restrictedExtent});
		
	}else
	{
		map.setOptions({restrictedExtent:null});
	}
	
	if (typeof map.baseLayer.isGeodesic!=="undefined")
	{
		map_isGeodesic = map.baseLayer.isGeodesic;
	}
	
	if (a!=b)
	{
	
		for(var i=0;i<map_highlightLayer.features.length;i++)
		{
			
			map_highlightLayer.features[i].geometry.transform(new OpenLayers.Projection(b), new OpenLayers.Projection(a));
		}
		
		map_highlightLayer.refresh();
	
		for(var i=0;i<map_highlightLayerFeatureInfo.features.length;i++)
		{
			
			map_highlightLayerFeatureInfo.features[i].geometry.transform(new OpenLayers.Projection(b), new OpenLayers.Projection(a));
		}
		
		map_highlightLayerFeatureInfo.refresh();
	
		map.setCenter(new OpenLayers.LonLat(Number(map.getCenter().lon),Number(map.getCenter().lat)).transform(new OpenLayers.Projection(b), new OpenLayers.Projection(a)),map.getZoom());
			
		map.setOptions({projection:new OpenLayers.Projection(a)});
			
		map_currentProjection=map.getProjectionObject().toString();
			
		var overlayers=mapGetlayersBy("isBaseLayer",false);
	
		for(var i=overlayers.length-1;i>=0;i--)
		{
			var _layer=overlayers[i];
		
			if (_layer._serviceObject._serviceType=="WMS")
			{
				_layer.projection=new OpenLayers.Projection(map_currentProjection);
			}
		}
		
		map.updateSize();
		
	}
	
	map.zoomOut();
	
	map.zoomIn();
	
}

function mapRedrawNonVector()
{
	var overlayers=mapGetlayersBy("isBaseLayer",false);
	
	for(var i=overlayers.length-1;i>=0;i--)
	{
		var layer=overlayers[i];
	
		if(!layer._layerObject._isVector)
		{
			layer.redraw();
		}
	}
}

function mapSetVisibilityBaseOnScales()
{
	var overlayers=mapGetlayersBy("isBaseLayer",false);
	
	for(var i=overlayers.length-1;i>=0;i--)
	{
		var layer=overlayers[i];
		
		if ((typeof layer._layerObject._scales!=="undefined") && (layer._layerObject._visibility===true) && (layer._layerObject._scales!==null))
		{
			
			layer.setVisibility(false);
			
			for(var l=0;l<layer._layerObject._scales.length;l++)
			{
				var item=layer._layerObject._scales[l];
				
				if (item!=0)
				{
					var _min=Number(item[0]);
					
					var _max=Number(item[1]);
					
					var _currentMapScale=Number(mapGetCurrentScale());
					
					if (_max<0)
					{
						_max=_currentMapScale+1000;
					}
					
					if((_currentMapScale>=_min) && (_currentMapScale<_max))
					{
						layer.setVisibility(true);
							
						break;
					}
					
					
				}
			
			}
			
		}
		
	}
	
}


function mapSetCenter(lon,lat,zoom)
{
	map.setCenter(new OpenLayers.LonLat(Number(lon),Number(lat)),zoom);
}

function mapGetZoom()
{
	return map.getZoom();
}

function mapGetCenter()
{
	var _mc=map.getCenter();
	
	if (mapGetCurrentProjection()!=mapGetCurrentDisplayProjection())
	{
		_mc.transform(new OpenLayers.Projection(mapGetCurrentProjection()), new OpenLayers.Projection(mapGetCurrentDisplayProjection()));
	}
	
	var _mz=map.getZoom();
	
	var _c={
		lon:_mc.lon,
		lat:_mc.lat,
		zoom:_mz
	}
	
	return _c
}

function mapSetDisplayProjection(_epsg)
{
	map.setOptions({displayProjection:new OpenLayers.Projection(_epsg)});
}

function mapBeforeAddLayer(_serviceObject,_layerObject)
{
	
	if (installing)
	{
		config_update_addLayer(_layerObject,_serviceObject);
	}
	
}

function mapAddLayer(_serviceObject,_layerObject)
{
	var _node=maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_layers_node');

	if(_layerObject._groupId!="")
	{
		_node=maptab_west_layer_tree_panel_tree_json_store.getRootNode().findChild("_groupId",_layerObject._groupId,true);
	}
	
	if (_node==null)
	{
		_node=maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_layers_node');
	}

	if (!mapFindLayerById(_layerObject._layerId))
	{
		var _layerNode=maptab_west_layer_add_layer(_layerObject._layer,_node);
	
		mapOnLayerLoadStart(_layerObject._layer,fn_loadStart);
		
		mapOnLayerLoadEnd(_layerObject._layer,fn_loadEnd);
	
		map.addLayer(_layerObject._layer);
	
		if (installing)
		{
			config_update_addLayer(_layerObject,_serviceObject);
		}
		
		config_init_layerScales(_layerObject);
		
		maptab_west_layer_reorder_layer();
	
	}
	
}

function mapRemoveLayerNode(_layer)
{
	if (mapRemoveLayer(_layer))
	{
		maptab_west_layer_remove_node(_layer._layerObject._layerId);
		
	}
}

function mapRemoveLayer(_layer)
{
	if (_layer)
	{
		if ((typeof _layer._layerObject!=="undefined") && (_layer._layerObject!=null))
		{
			if (mapFindLayerById(_layer._layerObject._layerId))
			{
				map.removeLayer(_layer);
				
				_layer._layerObject._isLoaded=false;
			
				_layer._layerObject._loadedStatus=0;
				
				return true;
			}
		}
	}
	return false;
}


function mapFindLayerById(_layerId)
{
	return map.getLayer(_layerId);
}

function mapChangeLayerVisibility(_layerId,_visibility)
{
	mapFindLayerById(_layerId).setVisibility(_visibility);
	
	if (mapFindLayerById(_layerId)._layerObject)
	{
		mapFindLayerById(_layerId)._layerObject._visibility=_visibility;
	}
}

function mapGetCountOfOverlayers()
{
	return mapGetlayersBy("isBaseLayer",false).length;
}

function mapGetlayersBy(_find,_value)
{
	var _array=[];

	var _layers=map.getLayersBy(_find,_value);
	
	for(var i=0;i<_layers.length;i++)
	{
		if ((typeof _layers[i]._layerObject!=="undefined") && (typeof _layers[i]._serviceObject!=="undefined"))
		{
			_array.push(_layers[i]);
		}
	}

	return _array;
}

function mapReorderLayer(_layerId,_index)
{
	
	map.setLayerIndex(mapFindLayerById(_layerId),_index);
	
}

function mapLayerIsLoaded(_layerId)
{
	if(mapFindLayerById(_layerId))
	{
		return mapFindLayerById(_layerId)._layerObject._loadedStatus;
	}
	
	return false;
}

function mapListOfBasemapProjections()
{
	var basemaps=map.getLayersBy("isBaseLayer",true);
	
	var _supportedEPSG=new Array();
	
	for(var i=0;i<basemaps.length;i++)
	{
		if(_supportedEPSG.indexOf(basemaps[i].projection.toString())==-1)
		{
			_supportedEPSG.push(basemaps[i].projection.toString());
		}
	}
	
	return _supportedEPSG;
}

function mapGetCurrentProjection()
{
	var p=map.getProjectionObject().toString();
	
	return p;
}

function mapGetCurrentDisplayProjection()
{
	var p=map.displayProjection.toString();
	
	return p;
}

function mapGetCurrentScale()
{
	var p=map.getScale().toString();
	
	return p;
}

function mapGetBasemapResolutions()
{
	var resolutions = map.baseLayer.resolutions;
        
	var units = map.baseLayer.units;
		
	var mapScales=new Array();
		
    for (var i=resolutions.length-1; i >= 0; i--) {
		
		var res = resolutions[i];
		
		mapScales.push([(OpenLayers.Util.getScaleFromResolution(res, units)-1),"1:"+Math.round(OpenLayers.Util.getScaleFromResolution(res, units))]);
    }
	
	return mapScales;
}

function mapZoomToScale(scale)
{
	map.zoomToScale(scale);
}

function mapGetProjectionCode(projection)
{
	var p=new OpenLayers.Projection(projection);
	
	return p.getCode().toString();
}

function mapBBOXToString(_layerObject)
{
	var b=_layerObject._bboxMinX+","+_layerObject._bboxMinY+","+_layerObject._bboxMaxX+","+_layerObject._bboxMaxY;
	
	return b.toString();
}


function mapOnChangeBaseLayer(fn_param)
{
	map.events.on({
		"changebaselayer":function()
		{
			
			fn_param(map_previousProjection,map_currentProjection);
			
			map_previousProjection=map.getProjectionObject().toString();
		}
	});
}

function mapOnZoomEnd(fn_param)
{
	map.events.on({
		"zoomend":function()
		{
			fn_param();
		}
	});
}

function mapOnMoveEnd(fn_param)
{
	map.events.on({
		"moveend":function()
		{
			fn_param();
		}
	});
}

function mapOnBeforeAddLayer(fn_param)
{
	map.events.on({
		"preaddlayer":fn_param
	});
}

function mapOnAddLayer(fn_param)
{
	map.events.on({
		"addlayer":fn_param
	});
}

function mapOnRemoveLayer(fn_param)
{
	map.events.on({
		"removelayer":function(_layer)
		{
			fn_param(_layer);
		}
	});
}

function mapOnMouseMove(fn_param)
{
	map.events.on({
		"mousemove":fn_param
	});
}

function mapOnChangeLayer(fn_param)
{
	map.events.on({
		"changelayer":fn_param
	});
}

function mapOnFeatureOver(fn_param)
{
	map.events.on({
		"featureover":fn_param
	});
}

function mapOnFeatureOut(fn_param)
{
	map.events.on({
		"featureout":fn_param
	});
}

function mapOnClick(fn_param)
{
	map.events.on({
		"click":fn_param
	});

}

function mapOnLayerLoadStart(layer,fn_param)
{
	layer.events.on({
		loadstart: function() 
		{
			fn_param(layer.id);
		}
	});
}

function mapOnLayerLoadEnd(layer,fn_param)
{
	layer.events.on({
		loadend: function() 
		{
			fn_param(layer.id);
		}
	});
}

function mapUnregisterEvents(event,fn_param)
{
	map.events.unregister(event,map,fn_param);
}

function mapExtentToLayer(_layerId)
{
	
	map.zoomToExtent(mapLayerBounds(mapFindLayerById(_layerId)._layerObject));
}


function mapLayerBounds(_layerObject)
{
	var b=new OpenLayers.Bounds.fromString(mapBBOXToString(_layerObject));
	
	if(mapGetCurrentProjection()!="EPSG:4326")
	{
		b=b.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(mapGetCurrentProjection()));
	}
	
	if (mapFindLayerById(_layerObject._layerId)!==null)
	{
		if ((mapFindLayerById(_layerObject._layerId)._serviceObject._isVector) && (!mapFindLayerById(_layerObject._layerId)._serviceObject._isService))
		{
			return mapFindLayerById(_layerObject._layerId).getDataExtent();
		}
	}
	
	return b;
}

function mapCoordinatesFromPixels(xy)
{
	return map.getLonLatFromViewPortPx(xy);
}

function mapSetOpacity(_layerId,_value)
{
	mapFindLayerById(_layerId).setOpacity(_value);
	
	mapFindLayerById(_layerId)._layerObject._opacity=_value;
}

function mapGetOpacity(_layerId)
{
	return mapFindLayerById(_layerId).opacity;
}

function mapGetSize()
{
	return map.size;
}

function mapGetExtent()
{
	return map.getExtent();
}

function mapAddControl(_control)
{
	map.addControl(_control);
}

function mapZoomLevels()
{
	return map.getNumZoomLevels();
}

function mapGetFeatureByFid(_layerId,_featureId)
{
	try{
		return mapFindLayerById(_layerId).getFeatureByFid(_featureId);
	}catch(err){
		return;
	}
}

function mapGetFeatureByAttribute(_layerId,_attributeName,_attributeValue)
{
	try{
		return mapFindLayerById(_layerId).getFeaturesByAttribute(_attributeName,_attributeValue);
	}catch(err){
		return;
	}
}

function mapSetBaseMapLayer(_layerId)
{
	map.setBaseLayer(mapFindLayerById(_layerId));
	
	map.setLayerIndex(mapFindLayerById(_layerId),0);
}

function mapLayerIsBaseLayer(_layerId)
{
	return mapFindLayerById(_layerId).isBaseLayer;
}

function mapGetFeatureById(_layerId,_featureId)
{
	return mapFindLayerById(_layerId).getFeatureById(_featureId);
}

function mapRemoveControl(_control)
{
	map.removeControl(_control);
}

function mapAddFeatures(_layerId,_features)
{
	if (_features!="")
	{
		if(_features.length>0)
		{
			var p=_features.length;
		
			for(var i=0;i<p;i++)
			{
				mapFindLayerById(_layerId).addFeatures(_features[i]);
			}
		}
		else
		{
			mapFindLayerById(_layerId).addFeatures(_features);
		}
		
	}
}

function mapEraseFeatures(_layerId,_features)
{
	if (_features!="")
	{
		if(_features.length>0)
		{
			var p=_features.length;
		
			for(var i=0;i<p;i++)
			{
				var _f=mapGetFeatureByFid(_layerId,_features[i].fid);
				
				_f.state=OpenLayers.State.DELETE;
				
				mapFindLayerById(_layerId).eraseFeatures(_f);
			}
		}
		else
		{
			_features.state=OpenLayers.State.DELETE;
			
			mapFindLayerById(_layerId).eraseFeatures(_features);
		}
		
	}
}

function mapRemoveFeatures(_layerId,_features)
{
	if (_features!="")
	{
		if(_features.length>0)
		{
			var p=_features.length;
		
			for(var i=0;i<p;i++)
			{
				var _f=mapGetFeatureByFid(_layerId,_features[i].fid);
				
				mapFindLayerById(_layerId).removeFeatures(_f);
			}
		}
		else
		{
		
			mapFindLayerById(_layerId).removeFeatures(_features);
		}
		
	}
}

function mapSelectedFeatures(_layerId)
{
	return mapFindLayerById(_layerId).selectedFeatures;
}

function formatXML(_filter)
{
	var _node = new OpenLayers.Format.Filter({version: '1.1.0'}).write(_filter);

	var xml = new OpenLayers.Format.XML().write(_node);
	
	return xml;
}

function createSpatialFilter(_geometryCriteria, _featureGeometry)
{
	switch(_geometryCriteria)
	{
		case "BBOX":
			_geometryCriteria = OpenLayers.Filter.Spatial.BBOX;
		break;
	
		case "INTERSECTS":
			_geometryCriteria = OpenLayers.Filter.Spatial.INTERSECTS;
		break;
		
		case "DWITHIN":
			_geometryCriteria = OpenLayers.Filter.Spatial.DWITHIN;
		break;
		
		case "WITHIN":
			_geometryCriteria = OpenLayers.Filter.Spatial.WITHIN;
		break;
		
		case "CONTAINS":
			_geometryCriteria = OpenLayers.Filter.Spatial.CONTAINS;
		break;
	
	}
	
	var _filter = new OpenLayers.Filter.Spatial({
		type: _geometryCriteria,
		value: _featureGeometry
	});
	
	return _filter;
	
}

function createAttributeFilter(_propertyName, _comparison, _propertyValue)
{
	switch(_comparison)
	{
		case "=":
			_comparison = OpenLayers.Filter.Comparison.EQUAL_TO;
		break;
		
		case "!=":
			_comparison = OpenLayers.Filter.Comparison.NOT_EQUAL_TO;
		break;
		
		case "<":
			_comparison = OpenLayers.Filter.Comparison.LESS_THAN;
		break;
		
		case ">":
			_comparison = OpenLayers.Filter.Comparison.GREATER_THAN;
		break;
		
		case "<=":
			_comparison = OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO;
		break;
		
		case ">=":
			_comparison = OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO;
		break;
		
		case "LIKE":
			_comparison = OpenLayers.Filter.Comparison.LIKE;
		break;
		
		case "IS NULL":
			_comparison = OpenLayers.Filter.Comparison.IS_NULL;
			_propertyValue = true;
		break;
		
		case "IS NOT NULL":
			_comparison = OpenLayers.Filter.Comparison.IS_NULL;
			_propertyValue = false;
		break;
	}

	var _filter = new OpenLayers.Filter.Comparison(
		{
			type: _comparison,
			property: _propertyName,
			value: _propertyValue
		});
		
	return _filter;
}

function createLogicalFilter(_operator, _filter)
{
	switch(_operator)
	{
		case "OR":
			_operator = OpenLayers.Filter.Logical.OR;
		break;
		
		default:
			_operator = OpenLayers.Filter.Logical.AND;
		break;
	}
	
	var _filter = new OpenLayers.Filter.Logical({
		type: _operator,
		filters: _filter
	});

	return _filter;
}