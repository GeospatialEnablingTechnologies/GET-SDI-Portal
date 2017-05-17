var googlestreet_map;
var googlestreet_fromcontext=false;
var googlestreet_map_marker;
var googlestreet_map_marker_layer;
var googlestreet_window; 
var googlestreet_service;

var googlestreet_translation={
	el_gr:{
		"not_found":'Δεν υπάρχουν δεδομένα για το σημείο αυτό. Παρακαλώ κάντε δεξί κλικ στο χάρτη και επιλέξτε το Google Street View σε σημεία που είναι ενεργοποιημένο',
		"google_tools_tab_title":"Εργαλεία"
	},
	en_us:{
		"not_found":'No data found at this point. Please press right click on the map and select Google Street View when this is activated',
		"google_tools_tab_title":"Tools"
	}

}

var googlestreet_btn=[
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		iconCls:'maptab_toolbar_general_googlestreet',
		id:'maptab_toolbar_general_googlestreet',
		text:'Google Street View',
		tooltip:'Google Street View',
		toggleGroup:'map_control_one_btn_allowed_group',
		enableToggle:false,
		toggleHandler:function(item,state){
			
			if (state)
			{
				if((typeof googlestreet_window=="undefined") && (typeof googlestreet_map=="undefined"))
				{
					googlestreet_window = fn_googlestreet_window();
				}
				
				googlestreet_window.show();
			}
			
			item.toggle(false);
		}
	}];
	
init_onload_fn.push(init_googlestreet);

function googlestreet_addGoogleToolPanel()
{
	if (Ext.getCmp("maptab_toolbar_googletool_tab")==null)
	{
		var googletoolpanel = {
			xtype:'toolbar',
			border:false,
			iconCls:'google',
			id:'maptab_toolbar_googletool_tab',
			title:'Google'
		};
	
		Ext.getCmp("maptab_north_tabpanel").add(googletoolpanel);
	}
}

function init_googlestreet()
{
	googlestreet_addGoogleToolPanel();
	
	Ext.getCmp("maptab_toolbar_googletool_tab").add(googlestreet_btn);
	
	googlestreet_service = new google.maps.StreetViewService();
	
	googlestreet_map_marker_layer = new OpenLayers.Layer.Vector("googlestreet_map_marker",{
		styleMap: new OpenLayers.StyleMap({
			"default": new OpenLayers.Style({
				externalGraphic: host + "images/streetviewarrow.png",
				graphicWidth: 26,
				graphicHeight: 26,
				fillOpacity: 1,
				rotation: "${angle}"
			})
		})
	});
	
	map_contextMenu.on("move",function(){
	
		Ext.getCmp("map_contextmenu_googlestreetview").disable();
	
		var topleft=Ext.getCmp("maptab_mapPanel").getXY();
			
		var p=new OpenLayers.Pixel(Number(map_contextMenu.getXY()[0]-topleft[0]),Number(map_contextMenu.getXY()[1]-topleft[1]));
			
		var lonlat = map.getLonLatFromViewPortPx(p);
			
		var _p = new OpenLayers.LonLat(Number(lonlat.lon),Number(lonlat.lat));
				
		if (mapGetCurrentProjection()!="EPSG:4326")
		{
			_p.transform(new OpenLayers.Projection(mapGetCurrentProjection()), new OpenLayers.Projection("EPSG:4326"));
		}
		
		var googlestreet_point = new google.maps.LatLng(_p.lat, _p.lon);
			
		googlestreet_service.getPanoramaByLocation(googlestreet_point, 50,function(result, status) {
			if (status == google.maps.StreetViewStatus.OK) 
			{
				Ext.getCmp("map_contextmenu_googlestreetview").enable();
			}
		});
		
	});
	
	map_contextMenu.insert(0,[{
		text:'Google Street View',
		id:'map_contextmenu_googlestreetview',
		iconCls:'maptab_toolbar_general_googlestreet',
		disabled:true,
		handler:function()
		{
			googlestreet_fromcontext=true;
		
			Ext.getCmp("maptab_toolbar_general_googlestreet").toggle(true);
			
			var topleft=Ext.getCmp("maptab_mapPanel").getXY();
			
			var p=new OpenLayers.Pixel(Number(map_contextMenu.getXY()[0]-topleft[0]),Number(map_contextMenu.getXY()[1]-topleft[1]));
			
			var lonlat = map.getLonLatFromViewPortPx(p);
			
			var _p = new OpenLayers.LonLat(Number(lonlat.lon),Number(lonlat.lat));
				
			if (mapGetCurrentProjection()!="EPSG:4326")
			{
				_p.transform(new OpenLayers.Projection(mapGetCurrentProjection()), new OpenLayers.Projection("EPSG:4326"));
			}
			
			googlestreet_map_marker_layer.destroyFeatures();

			var googlestreet_point = new google.maps.LatLng(_p.lat, _p.lon);
			
			googlestreet_map.setPosition(googlestreet_point);
		}
	},{
        xtype: 'menuseparator'
    }]);
	
	map.addLayer(googlestreet_map_marker_layer);
}
	
function fn_googlestreet_window()
{
	var _w=new Ext.Window({
		layout: 'fit',
		title: 'Google Street View',
		id:'googlestreet_map_window',
        closeAction: 'hide',
		minimizable:true,
		width:400,
		height:500,
		x: 40,
		y: 60,
		bbar:[{
			xtype:'label',
			id:'googlestreet_window_photo_url',
			height:50,
			text: ''
		}],
		listeners:{
			show:function(){
			
				var _p = new fn_googlestreet_getCenter();
			
				if (typeof googlestreet_map=="undefined")
				{
					googlestreet_map = new google.maps.StreetViewPanorama(document.getElementById('googlestreet_map'));
					
					if (!googlestreet_fromcontext)
					{
						fn_googlestreet_move_map();
					}
					
					google.maps.event.addListener(googlestreet_map, 'pov_changed', function() {
						
						googlestreet_map_marker_layer.destroyFeatures();
						
						var _p = new OpenLayers.Geometry.Point(Number(googlestreet_map.location.latLng.lng()),Number(googlestreet_map.location.latLng.lat()));
						
						if (mapGetCurrentProjection()!="EPSG:4326")
						{
							_p.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(mapGetCurrentProjection()));
						}
						
						googlestreet_map_marker = new OpenLayers.Feature.Vector(_p);
	
						googlestreet_map_marker.attributes={
							angle:googlestreet_map.getPov().heading
						};
						
						googlestreet_map_marker_layer.addFeatures([googlestreet_map_marker]);
						
						Ext.getCmp("googlestreet_window_photo_url").update(fn_googlestreet_createUrl(googlestreet_map.location.latLng.lng(),googlestreet_map.location.latLng.lat(),googlestreet_map.getPov().heading,googlestreet_map.getPov().pitch));
						
					});
					
					google.maps.event.addListener(googlestreet_map, 'position_changed', function() {
						
						
						if (typeof googlestreet_map.location!="undefined")
						{
							googlestreet_map_marker_layer.destroyFeatures();
							
							var _p = new OpenLayers.Geometry.Point(Number(googlestreet_map.location.latLng.lng()),Number(googlestreet_map.location.latLng.lat()));
							
							if (mapGetCurrentProjection()!="EPSG:4326")
							{
								_p.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(mapGetCurrentProjection()));
							}
							
							googlestreet_map_marker = new OpenLayers.Feature.Vector(_p);
		
							googlestreet_map_marker.attributes={
								angle:googlestreet_map.getPov().heading
							};
							
							var _g=new OpenLayers.LonLat(Number(_p.x),Number(_p.y));
							
							if (!map.getExtent().containsLonLat(_g))
							{
								mapSetCenter(Number(_p.x),Number(_p.y),map.getZoom());
							}
							
							googlestreet_map_marker_layer.addFeatures([googlestreet_map_marker]);
							
							Ext.getCmp("googlestreet_window_photo_url").update(fn_googlestreet_createUrl(googlestreet_map.location.latLng.lng(),googlestreet_map.location.latLng.lat(),googlestreet_map.getPov().heading,googlestreet_map.getPov().pitch));
						}
					});
				}else
				{
					fn_googlestreet_move_map();
				}
				
			},
			hide:function()
			{
			
				googlestreet_map_marker_layer.destroyFeatures();
			}
		},
		layout:'fit',
        items: [{
            xtype: 'panel',
            region: 'center',
			html: '<div id=\'googlestreet_map\' style=\'width:100%;height:100%\'></div>'
        }]
	});
	
	return _w;
}

function fn_googlestreet_createUrl(lon,lat,heading,pitch)
{
	var url="https://maps.googleapis.com/maps/api/streetview?size=800x600&location="+lat+","+lon+"&heading="+heading+"&pitch="+pitch;
	
	url="<a href=\""+url+"\" target=\"_new\">"+url+"</a>";
	
	return url;
}


function fn_googlestreet_getCenter()
{
	googlestreet_map_marker_layer.destroyFeatures();

	var _c = map.getCenter();
	
	var _p = new OpenLayers.LonLat(Number(_c.lon),Number(_c.lat));
			
	if (mapGetCurrentProjection()!="EPSG:4326")
	{
		_p = _p.transform(new OpenLayers.Projection(mapGetCurrentProjection()), new OpenLayers.Projection("EPSG:4326"));
	}
	
	return _p;
}

function fn_googlestreet_move_map()
{
	if (Ext.getCmp("googlestreet_map_window"))
	{
		if ((Ext.getCmp("googlestreet_map_window").isVisible()) && (typeof googlestreet_map!="undefined"))
		{
			var _p = new fn_googlestreet_getCenter();
			
			var googlestreet_point = new google.maps.LatLng(_p.lat, _p.lon);
			
			googlestreet_service.getPanoramaByLocation(googlestreet_point, 50,function(result, status) {
				if (status == google.maps.StreetViewStatus.OK) 
				{
					googlestreet_map.setPosition(googlestreet_point);
				}else{
					
					Ext.getCmp("googlestreet_map_window").hide();
					
					alert(googlestreet_translation[language].not_found);
				}
			});
		}
	}
}
