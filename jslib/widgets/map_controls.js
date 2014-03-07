/*version message*/

Ext.override(Ext.Window,{
	constrainHeader:true
});

var map_Zoom_ByArea_var;
var map_Zoom_ByPoint_var;
var map_DeZoom_var;
var map_ZoomMaxExtent;
var map_GetFeatureInfo_var;
var map_Pan_var;
var map_MeasureArea_var;
var map_MeasureDistance_var;
var map_PreviousMap_var;
var map_SaveMap_var;
var vectorLayer_Area;
var map_Point_GetCoordinates_var;
var map_Polygon_GetCoordinates_var;
var map_controlsTTbar;
var toggleGroupMap="map_controls";
var gml_layer;
var count_getInfo=0;
var toggleArrayControls=new Array();
var url_constructor=new Array();
var menu_layer;
var menu_layer_show=0;
var toogle_getinfo=false;
var map_getcoordinates_window;
var map_setcoordinates_window;
var map_selectByRec_BBOX;
var map_drawBBOX_SelectByRectabgle;
var map_drawBBOXControl_SelectByRectabgle;
var map_drawBBOXOptions_SelectByRectabgle;
var get_info_return_name_for_epsg_AJAX;
var getinfo_vector_layers=new Array();
var getinfo_selectControl;


var wmc_saveAjax;


map_controlsTTbar=[
	change_Lang_Btn,
	{xtype: 'tbseparator'},
	{	
		xtype:'button',
		iconCls:'controls_map_pan',
		tooltip:map_Pan_tooltip,
		enableToggle: true,
		toggleGroup:toggleGroupMap,
		toggleHandler:function(btn,pressed)
		{
			if(typeof map_MeasureDistance_var!=="undefined")
			map_MeasureDistance_var.deactivate();
			if(typeof map_MeasureArea_var!=="undefined")
			map_MeasureArea_var.deactivate();
			
			if (btn.pressed)
			{
				if (typeof map_Pan_var==="undefined")
				{
					map_Pan_var=new OpenLayers.Control.Pan();
					
					mapPanel.map.addControl(map_Pan_var);
				}
				
				map_Pan_var.activate();
			}
			else
			{
				map_Pan_var.deactivate();
			}
			
		}
	},
	{	
		xtype:'button',
		iconCls:'controls_map_zoombyarea',
		id:'controls_map_zoombyarea_id',
		tooltip:map_Zoom_ByArea_tooltip,
		enableToggle: true,
		toggleGroup:toggleGroupMap,
		toggleHandler:function(btn,pressed)
		{
			if (btn.pressed)
			{
			
				if (typeof map_Zoom_ByArea_var==="undefined")
				{
					map_Zoom_ByArea_var=new OpenLayers.Control.ZoomBox();
	
					mapPanel.map.addControl(map_Zoom_ByArea_var);
				}

				map_Zoom_ByArea_var.activate();
			}
			else
			{
				map_Zoom_ByArea_var.deactivate();
			}
		}
		
	},
	{
		xtype:'button',
		iconCls:'controls_map_zoomtomapextent',
		tooltip:map_ZoomMaxExtent_tooltip,
		handler:function(){
			
		  map.zoomToMaxExtent();			
			
		}
	},
	{xtype: 'tbseparator'},
	{	
		xtype:'button',
		iconCls:'controls_map_measuredistance',
		tooltip:map_MeasureDistance_tooltip,
		handler:function()
		{
			if(typeof map_Zoom_ByArea_var!=="undefined")
			map_Zoom_ByArea_var.deactivate();
			
			map_MeasureDistance();
		}
	},
	{
		xtype:'button',
		iconCls:'controls_map_measurearea',
		tooltip:map_MeasureArea_tooltip,
		handler: function()
		{
			if(typeof map_Zoom_ByArea_var!=="undefined")
			map_Zoom_ByArea_var.deactivate();
			
			map_MeasureArea();
		}
	},
	{
		xtype:'button',
		iconCls:'controls_map_measureclear',
		tooltip:map_MeasureClear_tooltip,
		handler:function(){

			if(typeof map_MeasureDistance_var!=="undefined")
				map_MeasureDistance_var.deactivate();
				
			if(typeof map_MeasureArea_var!=="undefined")
				map_MeasureArea_var.deactivate();
				
			mapPanel.layers.each(function(layer){
				if (layer.get('layer').name=="measure")
				{
					try{removeLayerMap(layer);}catch(err){}
				}
			});
		}
	},
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		iconCls:'controls_map_getlayerinfo',
		tooltip:map_GetFeatureInfo_tooltip,
		id:'controls_map_getlayerinfo_btn_id',
		enableToggle: true,
		toggleGroup:toggleGroupMap,
		toggleHandler:function(btn,pressed){
			
			if (btn.pressed)
			{
				count_getInfo=0;
				url_constructor="";
				url_constructor=[];

				var activeTree=Ext.getCmp('mapTree_TabPanel').getActiveTab().getId();
					
				var active_node = Ext.getCmp(activeTree).getSelectionModel().getSelectedNode();

				getinfo_vector_layers=new Array();
				
				getAllVisibleLayers(Ext.getCmp(activeTree).root);
				
				try{
					getinfo_selectControl.deactivate();
				}catch(err){}
				
				getinfo_selectControl = new OpenLayers.Control.SelectFeature(
					getinfo_vector_layers,
					{
						clickout: true, toggle: false,
						multiple: false, hover: true,
						toggleKey: "ctrlKey",
						multipleKey: "shiftKey",
						clickFeature:get_infoClickFromNONService,
						overFeature:get_infoHoverFromNONService
					}
				);
				
				map.addControl(getinfo_selectControl);
				
				getinfo_selectControl.activate();
				
				map.events.register("click",map,get_info_FeatureInfoClick);
				
				map.events.register("mousemove",map,map_GetFeatureInfo);
				
				toogle_getinfo=true;
			}
			else
			{
			
				getinfo_selectControl.deactivate();
			
				if(typeof get_info_projection_request!==undefined)
				{
					Ext.Ajax.abort(get_info_projection_request);
				}
				
				map.events.unregister("mousemove",map,map_GetFeatureInfo);
				
				map.events.unregister("click",map,get_info_FeatureInfoClick);
				
				toogle_getinfo=false;
				
				removeGetInfoLayerMap();
				
				try{get_info_win_getInfo.hide();}catch(err){}

			}
			
		}
	},
	{
		xtype:'button',
		iconCls:'search',
		tooltip:map_search_button_tooltip,
		handler:function(){
			
			map_searchWindow.show();
		}
	},
	{xtype: 'tbseparator'},
	quicksearch_Cntrl,
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		iconCls:'controls_map_getpointcoordinates',
		tooltip:map_Point_GetCoordinates_tooltip,
		enableToggle: true,
		toggleGroup:toggleGroupMap,
		toggleHandler:function(btn,pressed)
		{
			
			if(btn.pressed)
			{
				map.events.register("click",map,map_GetCoordinates);
				
				map_getcoordinates_window=new Ext.Window({ 
					width:240,
					height:130,
					id:'map_getcoordinates_region',
					title:map_Point_GetCoordinates_title,
					closeAction:'hide'});
					
					
			}
			else
			{
				map.events.unregister("click",map,map_GetCoordinates);
				map_getcoordinates_window.close();
			}
		
		}
	},
	{
		xtype:'button',
		iconCls:'controls_map_convertcoordinates',
		tooltip:map_Point_SetCoordinates_tooltip,
		enableToggle: true,
		toggleGroup:toggleGroupMap,
		toggleHandler:function(btn,pressed)
		{
			
			if(btn.pressed)
			{
			
				map_setcoordinates_window=new Ext.Window({ 
					width:240,
					height:160,
					id:'map_setcoordinates_region',
					title:map_Point_SetCoordinates_title,
					items:[{
						xtype:'panel',
						layout:'form',
						height:160,
						margin:10,
						items:[{
							xtype:'textfield',
							width:200,
							anchor:'90%',
							fieldLabel:map_Point_SetCoordinates_lon,
							id:'map_setCoordinates_lon'
							},
							{
							xtype:'textfield',
							anchor:'90%',
							width:200,
							fieldLabel:map_Point_SetCoordinates_lat,
							id:'map_setCoordinates_lat'
							},
							{
							xtype:'combo',
							anchor:'90%',
							width:200,
							fieldLabel:map_Point_SetCoordinates_Projection,
							id:'map_setCoordinates_projection',
							emptyText: map_Point_SetCoordinates_Combo_EmptyText,
							store: new Ext.data.SimpleStore({
								fields: ['value','value'],
								data: map_ctrls_projection_systemsArr
							}), 
							displayField: 'value',
							valueField: 'value',
							forceSelection: true,
							triggerAction: 'all',
							selectOnFocus: false,
							mode: 'local',
							editable: false
							}]
					}],
					bbar:['->',
						{
							xtype:'button',
							text:map_Point_SetCoordinates_Clear,
							handler:function()
							{
								removeMarkersFromMap("SetCoordinatesMarker");
							}
						},
						{
							xtype:'button',
							text:map_Point_SetCoordinates_Show,
							handler:function()
							{
							
								var markers = new OpenLayers.Layer.Markers("SetCoordinatesMarker");
									
								map.addLayer(markers);
								
								var size = new OpenLayers.Size(21,25);
									
								var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
									
								var icon = new OpenLayers.Icon('images/marker-green.png', size, offset);
									
								var lon=Ext.get('map_setCoordinates_lon').getValue();
									
								var lat=Ext.get('map_setCoordinates_lat').getValue();
									
								var lonLat = new OpenLayers.LonLat(lon,lat);
									
								if (map_currentMapProjection!=Ext.getCmp("map_setCoordinates_projection").value)
								{
									lonLat = new OpenLayers.LonLat(lon,lat).transform(new OpenLayers.Projection(Ext.getCmp("map_setCoordinates_projection").value), new OpenLayers.Projection(map_currentMapProjection));
								}
										
								markers.addMarker(new OpenLayers.Marker(lonLat,icon));

								var zoomlevel=map.getZoom();
								
								if (zoomlevel<18)
								{
									zoomlevel=18;
								}
								
								map.setCenter(lonLat, zoomlevel);
								
							}
						}]
				});
					
				map_SetCoordinates();
			}
			else
			{
				map_setcoordinates_window.close();
			}
		}
	},
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		id:'wmc_save_btn',
		tooltip:wmc_save_map,
		iconCls:'search_save',
		handler:function(){
			var format = new OpenLayers.Format.WMC({'layerOptions': {buffer: 0}});
			var wmcText = format.write(map);
			
			
			document.getElementById("wmc_hidden_xml").value=wmcText;
			document.forms["wmc_hidden_form"].submit();
			
		}
	
	},
	{
		xtype:'panel',
		hidden:true,
		html:'<form name="wmc_hidden_form" id="wmc_hidden_form_id" action="modules/wmc/php/writeWMC.php" method="POST" target="_blank"><input type="hidden" id="wmc_hidden_xml" name="wmcXML"></input></form>'
	},
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		id:'ge_btn',
		tooltip:google_earth_control_btn_GE,
		iconCls:'ge_control_icon',
		handler:function(){
			initGe();
		}
	
	}

];


function clearQuickLayers()
{
	mapPanel.layers.each(function(layer){
		if (layer.get('layer').name=="getInfoGML")
		{
			var thisLayer=map.getLayer(layer.id);
		
			map.removeLayer(thisLayer);
		}
	});

}

function map_SetCoordinates(evt)
{
	map_setcoordinates_window.show();

}
	
function map_GetCoordinates(evt)
{
	map_getcoordinates_window.show();
	
	var get_map_XY_wgs=map.getLonLatFromViewPortPx(evt.xy);
	
	var output="";
	
	var digitNum=6;
	
	for(var i=0;i<epsgGetCoordinates.length;i++)
	{
	
		var coords=map.getLonLatFromViewPortPx(evt.xy);
	
		if (map.getProjectionObject().toString()!=epsgGetCoordinates[i])
		{
			coords.transform(new OpenLayers.Projection(map.getProjectionObject().toString()),new OpenLayers.Projection(epsgGetCoordinates[i]));
		}
		
		for(var a=0;a<map_display_epsg_digit_format.length;a++)
		{
			var item=map_display_epsg_digit_format[a];
							
			if (item.epsg===epsgGetCoordinates[i])
			{
				digitNum=item.digits;
			}
		}
		
		output+=epsgGetCoordinates[i]+"<br>"+Number(coords.lon.toString()).toFixed(digitNum) +","+Number(coords.lat.toString()).toFixed(digitNum)+"<br><br>";
		
	}
	
	Ext.getCmp('map_getcoordinates_region').update("<div style='margin:5px;'>"+output+"</div>");
	
}

	
var get_info_timeout="";
var get_info_g_iOldX;
var get_info_g_iOldY;
var get_info_eXY;
function map_GetFeatureInfo(e)
{
	if(e && ((e.xy.x!=get_info_g_iOldX) || (e.xy.y!=get_info_g_iOldY)))
	{
		get_info_g_iOldX=e.xy.x;
		get_info_g_iOldY=e.xy.y;
		get_info_eXY=e;

		clearTimeout(get_info_timeout);
		get_info_timeout=setTimeout(get_info_FeatureInfo,50);
	}
	
}

function fetchSpatialReference(epsg)
{
	var head= document.getElementsByTagName('head')[0];
	var script= document.createElement('script');
	script.type= 'text/javascript';
	var nepsg=epsg.replace("EPSG:","");
	script.src= 'http://spatialreference.org/ref/epsg/'+nepsg+'/proj4js/';
	head.appendChild(script);
}

function windowFeatureInfo(featureObj)
{
	var gml_url=featureObj.url_gml;
	
	var gml_fid=featureObj.featureId;
	
	var crs=featureObj.epsg;
	
	var epsgExists=false;
	
	for(var i=0;i<epsgDB.length;i++)
	{
		if ((featureObj.epsg==epsgDB[i]) && (epsgExists==false))
		{
			epsgExists=true;
		}
	}
	
	if (epsgExists==false)
	{
		
		fetchSpatialReference(featureObj.epsg);
		epsgDB.push(featureObj.epsg);
	}
	
	var geometry_url=featureObj.url_geometry;
	
	var current_layer=fc_returnLayerFromObject(featureObj);

	if (typeof current_layer!=="undefined")
	{
		if (typeof current_layer.get("native_srs")!=="undefined")
		{
			geometry_url=geometry_url.replace(featureObj.epsg,current_layer.get("native_srs"));
		}
	}
	
	var layer_Basename=featureObj.layerBasename;
	
	var layer_VectorFormat=featureObj.layerVectorFormat;
	
	var formatVector=new OpenLayers.Format.GML();
	
	var savebtn={
		xtype:'button',
		tooltip:getinfo_title_GetInfo_save,
		iconCls:'save_feature',
		handler:function(){
					
			map_search_DownloadServiceURL=service_url;
						
			map_search_DownloadFeatureId=gml_fid;
						
			map_search_DownloadLayerBasename=layer_Basename;
						
			map_search_DownloadWindowSeperately=false;
						
			map_search_DownloadAuthentication=service_authentication;
						
			chooseDownloadType.show();
			}
		};
	
	switch(layer_VectorFormat)
	{
		case "wkt":
			formatVector=new OpenLayers.Format.WKT();
			savebtn="";
		break;
		
		case "kml":
			formatVector=new OpenLayers.Format.KML();
			savebtn="";
		break;
		
		case "atom":
			formatVector=new OpenLayers.Format.Atom();
			savebtn="";
		break;
		
		case "georss":
			formatVector=new OpenLayers.Format.GeoRSS();
			savebtn="";
		break;
		
	}
	
	var service_url=featureObj.serviceURI;
	
	var service_authentication=featureObj.serviceAuthentication;
	
	var info_url=featureObj.url_attributes;

	var windowAddToSelectedTitle=addToSelected_InfoWindow_Btn_addToSelected_Title;
	
	var windowAddToSelectedClass='addToSelected_Add';
	
	var alreadySelected=false;
	
	if (alreadyToSelected(featureObj))
	{
		windowAddToSelectedTitle=addToSelected_InfoWindow_Btn_RemoveFromSelected_Title;
		
		windowAddToSelectedClass='addToSelected_Remove';
		
		alreadySelected=true;
	}	
	
	var infoWindowId="info_window_"+gml_fid+"_"+service_url;
	
	if (typeof Ext.getCmp(infoWindowId)==="undefined")
	{
		var getinfo_window=new Ext.Window({ 
			width:340,
			height:485,
			title:getinfo_title_GetInfo_Window,
			minimizable:true,
			resizable:false,
			getInfoIsMinimized:false,
			plain:true,
			id:infoWindowId,
			bbar:[],
			tbar:['->',
				
				{
					xtype:'button',
					tooltip:windowAddToSelectedTitle,
					iconCls:windowAddToSelectedClass,
					id:'selectedBtn_'+infoWindowId,
					handler:function(cmp){
					
						if (alreadySelected)
						{
							featureRemoveFromSelected(featureObj);
							
							cmp.setTooltip(addToSelected_InfoWindow_Btn_addToSelected_Title);
							cmp.setIconClass('addToSelected_Add');
							alreadySelected=false;
						}
						else
						{
							featureAddToSelected(featureObj);
							
							cmp.setTooltip(addToSelected_InfoWindow_Btn_RemoveFromSelected_Title);
							cmp.setIconClass('addToSelected_Remove');
							alreadySelected=true;
						}
					}
				},
				savebtn,
				{
					xtype:'button',
					tooltip:getinfo_title_GetInfo_showOnMap,
					iconCls:'show_feature',
					handler:function(){
					
						fc_showVectorOnMap(gml_url,crs,layer_VectorFormat);
						
					}
				
				}
			],
			listeners: {
				show: function() {
				
					var r=Math.floor((Math.random()*5)+1);
					
					var x=Ext.getCmp(infoWindowId).x+(r*10);
					
					var y=Ext.getCmp(infoWindowId).y+(r*10);
					
					Ext.getCmp(infoWindowId).setPosition(x,y);
					
					Ext.getCmp(infoWindowId).tbar.setHeight(27);
					
					Ext.getCmp(infoWindowId).setHeight(485);
					
				},
				minimize:function(win){
					
					if(!Ext.isIE)
					{
						if (win.getInfoIsMinimized==true)
						{
							win.tbar.setHeight(27);
							win.setHeight(485);
							win.getInfoIsMinimized=false;
							
						}
						else
						{
							win.getInfoIsMinimized=true;
							win.tbar.setHeight(0);
							win.setHeight(0);
						}
					}
				}
			},
			items:[{
				xtype:'panel',
				region:'center',
				height:200,
				width:330,
				html:"<div id='getinfo_map_region_"+gml_fid+"'></div>"
				
			},
			{
			xtype:'tabpanel',
			enableTabScroll:true,
			region:'south',
			height:300,
			activeTab:0,
			items:[{
					xtype:'panel',
					id:"info_window_info_panel_"+gml_fid,
					title:getinfo_title_GetInfo_tab_title,
					html:"<iframe src='"+info_url+"' height='190px' width='320px' frameborder='no'></iframe>"
				},
				{
					xtype:'panel',
					title:getinfo_title_GetInfo_tab_geometry,
					id:"info_window_geometry_panel_"+gml_fid,
					height:190,
					html:"<iframe src='"+geometry_url+"' height='190px' width='320px' frameborder='no'></iframe>"
				}]
			}]
		});
	
		getinfo_window.show();

		var getinfo_map_currentDisplayProjection=map_currentDisplayProjection;
		var getinfo_map_currentMapProjection=map_currentDisplayProjection;
		
		var getinfo_options = {
			displayProjection: new OpenLayers.Projection(getinfo_map_currentDisplayProjection),
			units: 'km', 
			maxExtent: new OpenLayers.Bounds.fromString(epsgExtents[getinfo_map_currentMapProjection]),
			zoomMethod:null,
			transitionEffect:null,
			controls:[new OpenLayers.Control.PanZoom(),new OpenLayers.Control.Navigation()]
			
		};

		var get_info_gml_layer_selected_vector=new OpenLayers.Layer.Vector("getInfoGML",
		{
			strategies: [new OpenLayers.Strategy.Fixed()],
			projection:new OpenLayers.Projection(crs),
			displayInLayerSwitcher:false,
			protocol:new OpenLayers.Protocol.HTTP(
			{
				url:gml_url,
				format:formatVector
			})
		});
		
		var getinfo_mapLayers=new Array();
		
		for(var i=0;i<mapLayers.length;i++)
		{
			getinfo_mapLayers.push(mapLayers[i].clone());

		}

		var getinfo_map = new OpenLayers.Map('getinfo_map_region_'+gml_fid,getinfo_options);
		
		getinfo_map.addLayers(getinfo_mapLayers);
		
		getinfo_map.addLayers([get_info_gml_layer_selected_vector]);
		
		getinfo_map.addControl(new OpenLayers.Control.LayerSwitcher());
		
		var getinfo_previousMapExtent;
	
		var getinfo_previousMapProjection=getinfo_map.getProjectionObject().toString();
		
		getinfo_map_currentMapProjection=getinfo_map.getProjectionObject().toString();
		
		getinfo_map.events.on({
			"changebaselayer":function(evtObj)
			{
				getinfo_map_currentMapProjection=getinfo_map.getProjectionObject().toString();
			
				get_info_gml_layer_selected_vector.refresh();
				
				getinfo_map.zoomIn();
					
				getinfo_map.zoomOut();
				
				getinfo_previousMapProjection=getinfo_map.getProjectionObject().toString();
				
				getinfo_map.zoomToExtent(get_info_gml_layer_selected_vector.getDataExtent());
			}
		});

		
		get_info_gml_layer_selected_vector.events.on({
			loadend: function() {
				
				getinfo_map.zoomToExtent(get_info_gml_layer_selected_vector.getDataExtent());
				
			}
		});
	}
	else
	{
		Ext.getCmp(infoWindowId).tbar.setHeight(27);
		Ext.getCmp(infoWindowId).setHeight(485);
		Ext.getCmp(infoWindowId).show();
	}
	
}


var get_info_FeatureInfoClick_projection;

function get_info_FeatureInfoClick()
{
	
	var width=map.size.w;

	var height=map.size.h;
	
	var	gIbbox=map.getExtent().toArray();
	
	var tolerance=0;
	
	var minx=gIbbox[0]-tolerance;
	
	var miny=gIbbox[1]-tolerance;
	
	var maxx=gIbbox[2]+tolerance;
	
	var maxy=gIbbox[3]+tolerance;
	
	var Ibbox=minx+','+miny+','+maxx+','+maxy;
	
	var server_constructor="";
	
	if (url_constructor.length>0)
	{
		server_constructor=url_constructor.join('');
	}
	
	if (server_constructor!="")
	{
		var url_php_gml="php_source/proxies/proxy_gml.php?";
	
		var url_gml=url_php_gml+"gmlLang="+language+"&gmlFormat=gml&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;
		
		var url_geometry=url_php_gml+"gmlLang="+language+"&gmlFormat=geometry&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;
		
		var url_attributes=url_php_gml+"gmlLang="+language+"&gmlFormat=attributes&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;
		
		var url_projection=url_php_gml+"gmlLang="+language+"&gmlFormat=projnfid&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;

		
		if(typeof get_info_FeatureInfoClick_projection!=="undefined")
		{
			Ext.Ajax.abort(get_info_FeatureInfoClick_projection);
		}
		
		get_info_FeatureInfoClick_projection=Ext.Ajax.request({
			url:url_projection,
			success:function(result,response)
			{
				if (typeof result.responseText!=="undefined")
				{
					var randomnumber=Math.floor(Math.random()*1000);
							
					var json=Ext.util.JSON.decode(result.responseText);
					
					var service_url=json.SERVICE_URI;
					
					epsg=json.EPSG;
					
					var fid=json.FID;
					
					if (epsg=="")
					epsg="EPSG:4326";
					
					var hasFId=json.HASFID;
					
					var layer_basename=json.LAYER_BASENAME;
					
					var service_type=json.SERVICE_TYPE;
					
					var service_version=json.VERSION;
					
					var service_authentication=json.AUTHENTICATION;
					
					var featureObj={
						featureId:fid,
						serviceURI:service_url,
						layerBasename:layer_basename,
						hasFId:hasFId,
						epsg:epsg,
						serviceType:service_type,
						serviceVersion:service_version,
						url_gml:url_gml,
						url_geometry:url_geometry,
						url_attributes:url_attributes,
						serviceAuthentication:service_authentication,
						layerVectorFormat:"gml"
					};
					
					windowFeatureInfo(featureObj);
				}
			}
		});
		
		
	}

}

function map_deactivateMeasurements()
{

	if(typeof map_MeasureDistance_var!=="undefined")
		map_MeasureDistance_var.deactivate();
				
	if(typeof map_MeasureArea_var!=="undefined")
		map_MeasureArea_var.deactivate();
		
		
}

function map_deactivateNavigation()
{


}


var get_info_gml_layer;

var get_info_gmlTooltip;

var get_info_html_ToolTip="";

var get_info_gml_layer_attributes;

var get_info_count_ToolTip;

var get_info_win_getInfo;

var get_info_myDiv_layer_getinfo;

var get_info_projection_request;

function get_info_FeatureInfo()
{
	clearQuickLayers();
	
	var width=map.size.w;

	var height=map.size.h;
	
	var	gIbbox=map.getExtent().toArray();
	
	var tolerance=0;
	
	var minx=gIbbox[0]-tolerance;
	
	var miny=gIbbox[1]-tolerance;
	
	var maxx=gIbbox[2]+tolerance;
	
	var maxy=gIbbox[3]+tolerance;
	
	var Ibbox=minx+','+miny+','+maxx+','+maxy;
	
	var server_constructor="";
	
	if (url_constructor.length>0)
	{
		server_constructor=url_constructor.join('');
	}


	try{map.removeLayer(get_info_gml_layer);}catch(err){}

	try{get_info_win_getInfo.destroy();}catch(err){}
	
	if (server_constructor!="")
	{
	
		var url_php_gml="php_source/proxies/proxy_gml.php?";
		
		var url_gml=url_php_gml+"gmlLang="+language+"&gmlFormat=gml&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;
		
		var url_projection=url_php_gml+"gmlLang="+language+"&gmlFormat=projnfid&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;
		
		var url_geometry=url_php_gml+"gmlLang="+language+"&gmlFormat=geometry&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;
		
		var url_attributes=url_php_gml+"gmlLang="+language+"&gmlFormat=attributes&BBOX="+Ibbox+"&SRS="+map_currentMapProjection+"&WIDTH="+width+"&HEIGHT="+height+"&X="+get_info_eXY.xy.x+"&Y="+get_info_eXY.xy.y+server_constructor;
		
		var featureObj;
		
		if(typeof get_info_projection_request!==undefined)
		{
			Ext.Ajax.abort(get_info_projection_request);
		}
		
		get_info_projection_request=Ext.Ajax.request({
			url:url_projection,
			timeout:5000,
			failure:function()
			{
				
				try{get_info_win_getInfo.destroy();}catch(err){}
				
				try{map.removeLayer(get_info_gml_layer);}catch(err){}
				
			},
			success:function(result,response)
			{	
				
				if ((typeof result.responseText!=="undefined") && (result.responseText.toString()!=""))
				{
					
					var json=Ext.util.JSON.decode(result.responseText);
					
					var epsg=json.EPSG;
					
					var service_url=json.SERVICE_URI;
					
					var fid=json.FID;
					
					var hasFId=json.HASFID;
					
					var layer_basename=json.LAYER_BASENAME;
					
					var service_type=json.SERVICE_TYPE;
					
					var service_version=json.VERSION;
					
					var service_authentication=json.AUTHENTICATION;
					
					if (epsg=="")
					epsg="EPSG:4326";
					
					featureObj={
						featureId:fid,
						serviceURI:service_url,
						layerBasename:layer_basename,
						hasFId:hasFId,
						epsg:epsg,
						serviceType:service_type,
						serviceVersion:service_version,
						url_gml:url_gml,
						url_geometry:url_geometry,
						url_attributes:url_attributes,
						serviceAuthentication:service_authentication,
						layerVectorFormat:"gml"
					};
					
					var get_info_gml_layer_vector=new OpenLayers.Layer.Vector("getInfoGML",{
						strategies: [new OpenLayers.Strategy.Fixed()],
						protocol:new OpenLayers.Protocol.HTTP({
							url:url_gml,
							format:new OpenLayers.Format.GML()
						}),
						projection:new OpenLayers.Projection(epsg)
					});

					var recordType = GeoExt.data.LayerRecord.create();
											
					var recordh = new recordType({layer: get_info_gml_layer_vector, title: "getInfoGML",id:"getInfoGML" });
							
					var copy = recordh.clone();

					mapPanel.layers.add(copy);
							
					get_info_gml_layer=copy.get("layer");
							
					var activeTree=Ext.getCmp('mapTree_TabPanel').getActiveTab().getId();
								
					var active_node = Ext.getCmp(activeTree).getSelectionModel().getSelectedNode();
					
					get_info_gml_layer.events.register("loadend", get_info_gml_layer, function (e) {
					
						get_info_myDiv_layer_getinfo = Ext.get(get_info_gml_layer.div.id);
						
						get_info_html_ToolTip="";
									
						try
						{			
							get_info_gml_layer_attributes=this.features[0].attributes;

							get_info_count_ToolTip = 0;
									
							for (var k in get_info_gml_layer_attributes) 
							{
										
								if (get_info_count_ToolTip<=2)
								{
									var b=k.toString();
									var f=b;
									var c=get_info_gml_layer_attributes[b].toString();
									get_info_html_ToolTip=get_info_html_ToolTip+f+":"+c+"<br>";
								}
								else
								{
									get_info_html_ToolTip=get_info_html_ToolTip.toString();
									break;
								}
										
									get_info_count_ToolTip++;
							}
							
							if (typeof get_info_gml_layer_attributes.POWER!=="undefined")
							{
								get_info_html_ToolTip=get_info_html_ToolTip+"POWER:"+get_info_gml_layer_attributes.POWER.toString()+"<br>";
							}
							
							if (typeof get_info_gml_layer_attributes.COMPANY!=="undefined")
							{
								get_info_html_ToolTip=get_info_html_ToolTip+"COMPANY:"+get_info_gml_layer_attributes.COMPANY.toString()+"<br>";
							}
							
						}catch(err){get_info_html_ToolTip="";}
								
						try{get_info_win_getInfo.destroy();}catch(err){}
									
						if (get_info_html_ToolTip!="")
						{
							get_info_win_getInfo = new Ext.Window({
								layout: 'fit',
								renderTo:map.div.id,
								border:false,
								html: get_info_html_ToolTip,
								closable: false,
								floating:true,
								draggable: false,
								width:200,
								resizable:false,
								autoDestroy:true
							});			
							
							get_info_win_getInfo.show();
										
							get_info_win_getInfo.setPosition(get_info_eXY.xy.x+5,get_info_eXY.xy.y+5);
										
						}
						
						if (get_info_myDiv_layer_getinfo!=null)
						{
							Ext.EventManager.on(Ext.get(map.div.id), 'contextmenu', function(e)
							{
											
								try{get_info_win_getInfo.destroy();}catch(err){}
							
								map.events.unregister('mousemove', map, map_GetFeatureInfo);
								
								get_info_menu_layer=new Ext.menu.Menu({  
									floating:true,
									ignoreParentClick: true,  
									items: [{
										text: getinfo_menu_info,
										iconCls:'mapTree_info16',
										handler: function(){
											windowFeatureInfo(featureObj);
											map.events.register('mousemove', map, map_GetFeatureInfo);
										}
									},
									{
										text: getinfo_menu_addToSelected,
										iconCls:'mapTree_add16',
										handler: function(){
											featureAddToSelected(featureObj);
											map.events.register('mousemove', map, map_GetFeatureInfo);
										}
									},
									{
										text: getinfo_menu_close,
										handler: function(){
												map.events.register('mousemove', map, map_GetFeatureInfo);
										}
									}]
								});
												
								get_info_menu_layer.showAt(e.getXY());
								
							});
						
						}
					});
				}
			}
		});

	}
	
	return;
}

function get_infoClickFromNONService(feature)
{

	if(typeof get_info_projection_request!==undefined)
	{
		Ext.Ajax.abort(get_info_projection_request);
	}
	
	var get_layer=mapPanel.layers.getById(feature.layer.id);
	
	var service_type=get_layer.get("service_type");
	
	var featureObj;
	
	switch(service_type)
	{
		case "Shapefile":
		
			featureObj=shapefile_getInfoFeatureObject(feature);
			
			windowFeatureInfo(featureObj);
			
		break;
		
		
		case "KML":
		
			featureObj=kml_getInfoFeatureObject(feature);
			
			windowFeatureInfo(featureObj);
			
		break;
		
		case "ATOM":
		
			featureObj=atom_getInfoFeatureObject(feature);
			
			windowFeatureInfo(featureObj);
			
		break;
		
		case "GEORSS":
		
			featureObj=georss_getInfoFeatureObject(feature);
			
			windowFeatureInfo(featureObj);
			
		break;
	
	}
	
	
	
}

function get_infoHoverFromNONService(feature)
{

	try{map.removeLayer(get_info_gml_layer);}catch(err){}

	try{get_info_win_getInfo.destroy();}catch(err){}
	
	if(typeof get_info_projection_request!==undefined)
	{
		Ext.Ajax.abort(get_info_projection_request);
	}
}


var getinfo_source_id="";

function getAllVisibleLayers(node)
{
	
	var name_layers="";
    node.eachChild(function(n) {
		if (n.getDepth()==3)
		{
			
			var get_layer=map.getLayer(n.layer.id);
			
			var numLayer=mapPanel.layers.getById(n.layer.id);
			
			if ((numLayer.get("queryable")==1) && (n.attributes.checked==true))
			{

				if (name_layers!="")
				{
					var comma=",";
				}
				else
				{
					var comma="";
				}
				
				name_layers=name_layers+comma+numLayer.get("layers_basename");
				
				var projection=numLayer.get("layers_crs");
				
				var authentication=numLayer.get("service_authentication");
				
				var supportedProjections=projection.split(',');
				
				var isSupported=false;
				
				for(var i=0; i<supportedProjections.length; i++)
				{
					var epsg=supportedProjections[i];
					
					if (epsg==map_currentMapProjection)
					{
						isSupported=true;
					}
				}
				
				if (getinfo_source_id!=numLayer.get("source_id"))
				{
					getinfo_source_id=numLayer.get("source_id");
					
					count_getInfo++;
				}
				
				if (numLayer.get("service_type")=="Shapefile")
				{
					getinfo_vector_layers.push(get_layer);
				}
				if (numLayer.get("service_type")=="KML")
				{
					getinfo_vector_layers.push(get_layer);
				}
				if (numLayer.get("service_type")=="ATOM")
				{
					getinfo_vector_layers.push(get_layer);
				}
				if (numLayer.get("service_type")=="GEORSS")
				{
					getinfo_vector_layers.push(get_layer);
				}
				
				
				if ((isSupported) || (numLayer.get("service_type")=="WFS") || (numLayer.get("service_type")=="WFST") || (numLayer.get("service_type")=="Shapefile") || (numLayer.get("service_type")=="KML") || (numLayer.get("service_type")=="ATOM") || (numLayer.get("service_type")=="GEORSS"))
				{
					url_constructor[count_getInfo]="&servers=service_layers=["+name_layers+"]&service_url=["+numLayer.get("source_id")+"]&service_version=["+numLayer.get("service_version")+"]&service_type=["+numLayer.get("service_type")+"]&service_authentication=["+authentication+"]";
				}

				
			}
			
		}
		
		if(n.hasChildNodes())
            getAllVisibleLayers(n);
		});
}
