/*version message*/

var map,mapPanel,map_mousePosCtr,mapGraticule,mapScaleBar;
var mapLayers=new Array();
var map_scales=new Array();


/****************CUSTOM*****************/

var map_fractional_scales=[[250,'1:250'],[500,'1:500'],[750,'1:750'],[1000,'1:1000'],[2000,'1:2000'],[2500,'1:2500'],[5000,'1:5000'],[10000,'1:10000'],[20000,'1:20000'],[25000,'1:25000'],[50000,'1:50000'],[75000,'1:75000'],[100000,'1:100000'],[250000,'1:250000'],[500000,'1:500000'],[750000,'1:750000'],[1000000,'1:1000000'],[2000000,'1:2000000'],[4000000,'1:4000000'],[5000000,'1:5000000'],[10000000,'1:10000000']];

var custom_wmts_url="";
var custom_wmts_url="";
var custom_wmts_layer="";
var custom_projection="";
var custom_wmts_maxExtent="";
var custom_wmts_bbox="";

	var options = {
		
		displayProjection: new OpenLayers.Projection(map_currentDisplayProjection),
		units: 'km', 
		//restrictedExtent:custom_wmts_bbox,
		maxExtent: new OpenLayers.Bounds.fromString(epsgExtents[map_currentMapProjection]),
		zoomMethod:null,
		transitionEffect:null,
		controls:[new OpenLayers.Control.PanZoom(),new OpenLayers.Control.Navigation()]
	};

	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
	OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
	OpenLayers.Util.onImageLoadErrorColor = 'transparent';
	
	
	if (custom_wmts_url!="")
	{
		var custom_matrixIds= new Array(26);
		for (var i=0; i<26; ++i) {
			custom_matrixIds[i] = custom_projection+":" + i;
		}

		mapLayers.push(new OpenLayers.Layer.WMTS({
			name: customTitleBaseMap,
			url: custom_wmts_url,
			layer: custom_wmts_layer,
			matrixSet: custom_projection,
			matrixIds: custom_matrixIds,
			format: "image/png",
			style: "_null",
			fractionalZoom:false,
			maxExtent:custom_wmts_maxExtent,
			isBaseLayer: true,
			tileFullExtent:custom_wmts_bbox,
			transitionEffect:null,
			projection:new OpenLayers.Projection(custom_projection)
		}));
	}
	
	
	if (googleEnabled==true)
	{
		
		mapLayers.push(new OpenLayers.Layer.Google(
			"Google Satellite",
			{
				type: google.maps.MapTypeId.SATELLITE, 
				numZoomLevels: 20,
				'sphericalMercator': true,
				fractionalZoom:false,
				maxExtent:new OpenLayers.Bounds.fromString(epsgExtents["EPSG:900913"])
			}
		));
		
		mapLayers.push(new OpenLayers.Layer.Google(
			"Google Streets",
			{
				type: google.maps.MapTypeId.ROADMAP,
				numZoomLevels: 20,
				'sphericalMercator': true,
				fractionalZoom:false,
				maxExtent:new OpenLayers.Bounds.fromString(epsgExtents["EPSG:900913"])
			}
		));
		
		mapLayers.push(new OpenLayers.Layer.Google(
			"Google Hybrid",
			{
				type: google.maps.MapTypeId.HYBRID, 
				numZoomLevels: 20,
				'sphericalMercator': true,
				fractionalZoom:false,
				maxExtent:new OpenLayers.Bounds.fromString(epsgExtents["EPSG:900913"])
			}
		));
		
		
		mapLayers.push(new OpenLayers.Layer.Google(
			"Google Physical",
			{
				type: google.maps.MapTypeId.TERRAIN,
				numZoomLevels: 20,
				'sphericalMercator': true,
				fractionalZoom:false,
				maxExtent:new OpenLayers.Bounds.fromString(epsgExtents["EPSG:900913"])
			}
		));
	}
	
	
	mapLayers.push(new OpenLayers.Layer.OSM("OpenStreetMap"));
	
	mapLayers.push(new OpenLayers.Layer.WMS(
		'OpenStreetMap-WGS84',
		"http://maps.opengeo.org/geowebcache/service/wms",
		{
			layers: "openstreetmap", 
			format: "image/png", 
			transparent: true,
			maxExtent:new OpenLayers.Bounds.fromString(epsgExtents["EPSG:4326"]),
			buffer:0
		},{
			isBaseLayer: true,
			numZoomLevels: 30,
			projection:new OpenLayers.Projection("EPSG:4326"),
			fractionalZoom:false,
			maxExtent:new OpenLayers.Bounds.fromString(epsgExtents["EPSG:4326"]),
			buffer:0
		}
	));
	
	mapLayers.push(new OpenLayers.Layer.WMS(
		map_wms_default_kthmatologio,
		"http://gis.ktimanet.gr/wms/wmsopen/wmsserver.aspx",
		{
			layers: "KTBASEMAP", 
			format: "image/png", 
			transparent: true,
			maxExtent: new OpenLayers.Bounds.fromString(epsgExtents["EPSG:4326"])
		},{
			isBaseLayer: true,
			numZoomLevels: 30,
			fractionalZoom:true,
			projection:new OpenLayers.Projection("EPSG:4326"),
			maxExtent: new OpenLayers.Bounds.fromString(epsgExtents["EPSG:4326"])
		}
	));

	
		
Ext.onReady(function() {

	map = new OpenLayers.Map("map_region",options);
	
	map_mousePosCtr=new OpenLayers.Control.MousePosition({numDigits:2,div: document.getElementById("map_label_mouseposition_id")});
	
	map.addControl(map_mousePosCtr);
	
	mapGraticule=new OpenLayers.Control.Graticule({labelled: true,targetSize: 200});	
	
	mapScaleBar=new OpenLayers.Control.ScaleBar();
	
	map.addControl(mapScaleBar);
	
	map.addControl(mapGraticule);
	
	mapGraticule.deactivate();
	
	map.addLayers(mapLayers);
	
	Ext.QuickTips.init();
	
	mapPanel = new GeoExt.MapPanel({map:map});
	
	treeMap_service_window.show();
	
	treeMap_service_window.hide();
	
	map.div.oncontextmenu = function noContextMenu(e) {return false;}
	
	map_InitPosition();
	
	var previousMapExtent=map.getExtent().toString();
	
	var previousMapProjection=mapPanel.map.getProjectionObject().toString();
	
	map_currentMapProjection=mapPanel.map.getProjectionObject().toString();
	
	map_isFractional()
	
	map.events.on({
		"changebaselayer":function(evtObj)
		{
				map_currentMapProjection=mapPanel.map.getProjectionObject().toString();
				
				map.setOptions({
					fractionalZoom:map.baseLayer.fractionalZoom
				});
				
				map_isFractional();
				
				map.setCenter(map.getCenter().transform(new OpenLayers.Projection(previousMapProjection), new OpenLayers.Projection(map_currentMapProjection)));
					
				map.zoomIn();
					
				map.zoomOut();
				
				previousMapProjection=mapPanel.map.getProjectionObject().toString();
				
				toggleLayersNodeIfEPSGNotSupported(Ext.getCmp('layerTree_layers').root,map_currentMapProjection,tooltip_mapTree_notSupportedBaseMapEPSG);
				
				map_currentScale();
			
		}
	});
	
	
	setTimeout(function()
		{
			if (custom_wmts_url!="")
			{
				map.zoomToExtent(custom_wmts_bbox);
				
			}
			else
			{				
				map_InitPosition();
				
				map.zoomIn();
				map.zoomOut();
				
			}
		}, 500);
		
	map.events.on({
		"removelayer": map_search_getLayers,
		"addlayer": map_search_getLayers,
		"zoomend":map_currentScale,
		"updatesize":map_currentScale
	});
	

	map_searchAreaInitDrawFeatures();
	
	map_currentScale();
	
	
});

function map_currentScale()
{
	Ext.getCmp('map_label_currentScale_text_id').setText(map_current_scale_fieldtext+" 1:"+Math.round(map.getScale()));
	
	Ext.getCmp('map_label_currentProjection_text_id').setText(map_current_projection_system_fieldtext+map_currentMapProjection);

}

function map_isFractional()
{
	if (map.baseLayer.fractionalZoom)
	{
		map_scales=new Array();
		map_scales=map_fractional_scales;
	}else
	{
		var resolutions = map.baseLayer.resolutions;
        
		var units = map.baseLayer.units;
		
		map_scales=new Array();
		
        for (var i=resolutions.length-1; i >= 0; i--) {
            var res = resolutions[i];
			map_scales.push([(OpenLayers.Util.getScaleFromResolution(res, units)-1),"1:"+Math.round(OpenLayers.Util.getScaleFromResolution(res, units))])
        }
	}
	
	var comboStore = Ext.getCmp('map_scale_combo').store;
	
	comboStore.loadData(map_scales, false);
	
}

function map_InitPosition()
{
	map.setCenter(new OpenLayers.LonLat(24.11,38.53).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(map_currentMapProjection)),6);
}



