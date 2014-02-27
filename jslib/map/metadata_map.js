/*version message*/

var map_metadata,mapPanel_metadata;
var mapLayers_metadata=new Array();

var metadata_map_currentDisplayProjection=map_currentDisplayProjection;
var metadata_map_currentMapProjection=map_currentDisplayProjection;



var options_metadata = {
	displayProjection: new OpenLayers.Projection(metadata_map_currentDisplayProjection),
	units: 'km', 
	maxExtent: new OpenLayers.Bounds.fromString(epsgExtents[metadata_map_currentMapProjection]),
	zoomMethod:null,
	transitionEffect:null,
	controls:[new OpenLayers.Control.PanZoom(),new OpenLayers.Control.Navigation()]
};


//var OSM_metadata = new OpenLayers.Layer.OSM("OpenStreetMap");

for(var i=0;i<mapLayers.length;i++)
{
	mapLayers_metadata.push(mapLayers[i].clone());

}

function makeMetadataMap()
{
	
	map_metadata = new OpenLayers.Map("m_map_region",options_metadata);

	map_metadata.addControl(new OpenLayers.Control.MousePosition());
	
	map_metadata.addControl(new OpenLayers.Control.Scale());
	
	map_metadata.addLayers(mapLayers_metadata);

	map_metadata.zoomToMaxExtent();

	map_metadata.events.register("mousemove", map_metadata, function(e) { 
		var position_meta = this.events.getMousePosition(e);
    });
	
	map_metadata.addControl(new OpenLayers.Control.LayerSwitcher());
	
	mapPanel_metadata = new GeoExt.MapPanel({map:map_metadata});
	
	
	var metadata_previousMapExtent=map_metadata.getExtent().toString();
	
	var metadata_previousMapProjection=map_metadata.getProjectionObject().toString();
	
	metadata_map_currentMapProjection=map_metadata.getProjectionObject().toString();
	
	map_metadata.events.on({
		"changebaselayer":function(evtObj)
		{
				metadata_map_currentMapProjection=map_metadata.getProjectionObject().toString();
				
				map_metadata.setCenter(map_metadata.getCenter().transform(new OpenLayers.Projection(metadata_previousMapProjection), new OpenLayers.Projection(metadata_map_currentMapProjection)));
					
				map_metadata.zoomIn();
					
				map_metadata.zoomOut();
				
				metadata_previousMapProjection=map_metadata.getProjectionObject().toString();
		}
	});
	
	setTimeout(function()
		{
			if (custom_wmts_url!="")
			{
				map_metadata.zoomToExtent(custom_wmts_bbox);
				
			}
			else
			{				
				metadata_map_InitPosition();
				
				map_metadata.zoomIn();
				map_metadata.zoomOut();
				
			}
		}, 500);
	
}	

function metadata_map_InitPosition()
{
	map_metadata.setCenter(new OpenLayers.LonLat(24.11,38.53).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(metadata_map_currentMapProjection)),6);
}
