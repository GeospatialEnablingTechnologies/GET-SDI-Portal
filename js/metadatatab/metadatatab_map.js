var metadata_map;
var metadata_map_search_layer;
var metadata_map_result_extent_layer;
var metadata_map_search_layer_control;

var metadata_map_controls;

function init_metadata_map()
{

	metadata_map_controls={
		navigation:new OpenLayers.Control.Navigation(),
		navigationHistory:new OpenLayers.Control.NavigationHistory(),
		pan:new OpenLayers.Control.Pan(),
		zoomByArea:new OpenLayers.Control.ZoomBox()
	};

	metadata_map = new OpenLayers.Map("metadatatab_map",{controls:[]});
	
	var _metadata_map_config_object=new _config_init_map();
	
	for(var k=0;k<_metadata_map_config_object._basemapLayers.length;k++)
	{
		metadata_map.addLayer(_metadata_map_config_object._basemapLayers[k]._layer);
	}
	
	metadata_map.setOptions(_metadata_map_config_object._mapOptions);
	
	for(var key in metadata_map_controls)
	{
		metadata_map.addControl(metadata_map_controls[key]);
	}
	
	metadata_map.div.oncontextmenu = function noContextMenu(e) {return false;}
	
	var _initCenter= new OpenLayers.LonLat(_metadata_map_config_object._initCenter[0],_metadata_map_config_object._initCenter[1]);
	
	if (metadataMapGetCurrentProjection()!="EPSG:4326")
	{
		_initCenter.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(metadataMapGetCurrentProjection()));
	}
	
	metadataMapSetCenter(Number(_initCenter.lon),Number(_initCenter.lat),_map_config_object._initZoom);
	
	metadata_map_search_layer=new OpenLayers.Layer.Vector("metadata_map_search_layer_draw");
	
	metadata_map_result_extent_layer=new OpenLayers.Layer.Vector("metadata_map_result_extent_layer");
	
	metadata_map.addLayer(metadata_map_search_layer);
	
	metadata_map.addLayer(metadata_map_result_extent_layer);
	
	metadata_map_search_layer_control=new OpenLayers.Control.DrawFeature(
		metadata_map_search_layer, 
		OpenLayers.Handler.RegularPolygon,
		{
			handlerOptions: {
				sides: 4, 
				irregular: true
			},
			'featureAdded': metadata_search_get_map_search_area
		});

	metadata_map.addControl(metadata_map_search_layer_control);
	
	metadata_map.updateSize();
	
	metadata_map.events.on({
		"zoomend":fn_metadatatab_toolbar_general_handle_zoom_in_out
	});
}

function metadataMapGetCurrentProjection()
{
	var p=metadata_map.getProjectionObject().toString();
	
	return p;
}

function metadataMapSetCenter(lon,lat,zoom)
{
	metadata_map.setCenter(new OpenLayers.LonLat(Number(lon),Number(lat)),zoom);
}

function metadataMapGetExtent()
{
	var p=metadata_map.getExtent();
	
	return p;
}

function metadataMapZoomToExtent(_extent)
{
	metadata_map.zoomToExtent(_extent,false);
}

function metadataMapGetZoom()
{
	return metadata_map.getZoom();
}

function metadataMapZoomLevels()
{
	return metadata_map.getNumZoomLevels();
}