/*version message*/

function wms_node_downloadLayer(layer_url,layer_basename,layer_bbox,output,layer_crs,arrayBounds,authentication)
{

		var format;
		
		switch(output)
		{
			case "tiff":
			format="image/tiff";
			break;
			
			case "geotiff":
			format="image/geotiff";
			break;
			
			case "pdf":
			format="application/pdf";
			break;
			
			case "svg":
			format="image/svg";
			break;
			
			case "kml":
			format="kml";
			break;
			
			case "kmz":
			format="kmz";
			break;
		
		}
		var bounds=OpenLayers.Bounds.fromString(layer_bbox);
		
		var w_dominator=100;
		var h_dominator=100;
		
		if ((bounds.getSize().w)<1)
		{
			w_dominator=1000;
		}
		if ((bounds.getSize().h)<1)
		{
			h_dominator=1000;
		}
		
		var width=Math.round((bounds.getSize().w)*w_dominator);
		
		var height=Math.round((bounds.getSize().h)*h_dominator);
		
		var download_url="php_source/proxies/proxy_redirect.php?"+authentication+"url="+Ext.urlAppend(layer_url,"REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1&LAYERS="+layer_basename+"&FORMAT="+format+"&TRANSPARENT=TRUE&SRS=EPSG:4326&BBOX="+layer_bbox+"&WIDTH="+width+"&HEIGHT="+height);
		
		window.open(download_url);
		
		return;
		
}

function create_wms_node_context_menu(node,event)
{
	var numLayer=mapPanel.map.layers.indexOf(node.layer);
	
	var layers_basename=mapPanel.layers.getAt(numLayer).get('layers_basename');
	var layer_abstract=mapPanel.layers.getAt(numLayer).get('abstract');
	var layer_service_type=mapPanel.layers.getAt(numLayer).get('service_type');
	var layer_crs=fc_returnEPSG_forBBOX(mapPanel.layers.getAt(numLayer).get('layers_crs'));
	var layer_name=mapPanel.layers.getAt(numLayer).get('layer').name;
	var layer_url=mapPanel.layers.getAt(numLayer).get('source_id');
	var layer_bbox=mapPanel.layers.getAt(numLayer).get('bbox');
	var layers_basename_id=mapPanel.layers.getAt(numLayer).get('layers_basename_id');
	var authentication=mapPanel.layers.getAt(numLayer).get('service_authentication');
	var sld_body="";
	
	if(layer_service_type=="WMS")
	{
		sld_body=mapPanel.layers.getAt(numLayer).get('sld_body');
		
		if((sld_body!="") && (typeof sld_body!=="undefined"))
		{
			if (thematicLayers_fileBased==false)
			{
				sld_body="&SLD_BODY="+sld_body;
			}
			else
			{
				sld_body="&SLD="+sld_body;
			}
		}
		else
		{
			sld_body="";
		}
	}
	
	
	
	if(authentication!="")
	{
		authentication+="&";
	}
	
	var projection = mapPanel.map.getProjectionObject() || (projConfig && new OpenLayers.Projection(projConfig)) || new OpenLayers.Projection("EPSG:4326"); 

	var arrayBounds=OpenLayers.Bounds.fromString(layer_bbox);
	
	if ((layer_service_type=="Shapefile") || (layer_service_type=="KML"))
	{
		if (layer_crs!=map_currentMapProjection)
		{
			arrayBounds=mapPanel.layers.getAt(numLayer).get('layer').getDataExtent().transform(new OpenLayers.Projection(map_currentMapProjection), new OpenLayers.Projection("EPSG:4326"));
			
		}else
		{
		
			arrayBounds=mapPanel.layers.getAt(numLayer).get('layer').getDataExtent();
		}
		
		
		layer_bbox=arrayBounds.toString();
		
	}
	
	var arrayBoundsString=OpenLayers.Bounds.fromString(layer_bbox).toString();
	
	if (map_currentMapProjection!="EPSG:4326")
	{
		arrayBounds=OpenLayers.Bounds.fromString(layer_bbox).transform(new OpenLayers.Projection("EPSG:4326"), projection);
		
		arrayBoundsString=OpenLayers.Bounds.fromString(layer_bbox).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(layer_crs)).toString();
	}

	var sliderOptions;
	
	sliderOptions = Ext.applyIf({layer: node.layer}, this.sliderOptions);

	if((layer_service_type=="WMS") || (layer_service_type=="WFS") || (layer_service_type=="WFST"))
	{
		Ext.Ajax.request({url:"php_source/proxies/proxy_wms_node_info.php?"+authentication+"url="+Ext.urlAppend(layer_url,"request=GetCapabilities"),
			timeout:3000,
			success:function(result,response)
			{
				var icon="php_source/proxies/legend_graphic.php?"+authentication+"urlGraphic="+Ext.urlAppend(layer_url,"REQUEST=GetLegendGraphic&VERSION=1.1.1&FORMAT=image/png&LAYER="+layers_basename+sld_body);
				
				var data_result=Ext.util.JSON.decode(result.responseText);
				
				if (document.getElementsByTagName("img")) {
					img1 = document.createElement("img");
					img1.src = icon;
					
					
				}
				
				var infoBox="<table class='wms_info_table' style='max-width:600px !important;'><tr><td valign=\"top\" ><img src=\""+icon+"\" ></td><td valign=\"top\"><table class='wms_info_table'><td>"+wms_node_info_LayerName+"</td><td>"+layer_name+"</tr>"+
				"<tr><td>"+wms_node_info_LayerDescription+"</td><td>"+layer_abstract+"</tr>"+
				"<tr><td>"+wms_node_info_ContactPerson+"</td><td>"+data_result.ContactPerson +"</td></tr>"+
				"<tr><td>"+wms_node_info_ContactOrganization+"</td><td>"+data_result.ContactOrganization +"</td></tr>"+
				"<tr><td>"+wms_node_info_ContactPosition+"</td><td>"+data_result.ContactPosition +"</td></tr>"+
				"<tr><td>"+wms_node_info_ContactElectronicMailAddress+"</td><td><a href='mailto:"+data_result.ContactElectronicMailAddress +"'>"+data_result.ContactElectronicMailAddress +"</a></td></tr>"+
				"<tr><td>"+wms_node_info_Fees+"</td><td>"+data_result.Fees +"</td></tr>"+
				"<tr><td>"+wms_node_info_AccessConstraints+"</td><td>"+data_result.AccessConstraints +"</td></tr></table></td></tr></table>";
				
				
				tree_showContextMenu(node,numLayer,infoBox,arrayBounds,arrayBoundsString);
				
				img1="";
				
			},
			failure:function(){
				tree_showContextMenu(node,numLayer,"",arrayBounds,arrayBoundsString);
			}
		});
	}
	else
	{
		tree_showContextMenu(node,numLayer,"",arrayBounds,arrayBoundsString);
	}
	
}


function tree_showContextMenu(node,numLayer,infoBox,arrayBounds,arrayBoundsString)
{

	var layers_basename=mapPanel.layers.getAt(numLayer).get('layers_basename');
	var layer_abstract=mapPanel.layers.getAt(numLayer).get('abstract');
	var layer_service_type=mapPanel.layers.getAt(numLayer).get('service_type');
	var layer_crs=fc_returnEPSG_forBBOX(mapPanel.layers.getAt(numLayer).get('layers_crs'));
	var layer_name=mapPanel.layers.getAt(numLayer).get('layer').name;
	var layer_url=mapPanel.layers.getAt(numLayer).get('source_id');
	var layer_bbox=mapPanel.layers.getAt(numLayer).get('bbox');
	var layers_basename_id=mapPanel.layers.getAt(numLayer).get('layers_basename_id');
	var authentication=mapPanel.layers.getAt(numLayer).get('service_authentication');
	
	
	
	if(authentication!="")
	{
		authentication+="&";
	}
	
	
	var gEarthDisableContextNode=false;
	
	
	
	if (googleEarthMode)
	{
		gEarthDisableContextNode=true;
	}
	
	var informationObj="";
	
	var downloadObj="";
	
	if (infoBox!="")
	{
		informationObj={
			text:wms_node_info_information,
			iconCls:'mapTree_info16',
			menu:[{
				xtype:'panel',
				html:infoBox
			}]
		};
	}
	
	if((layer_service_type=="WMS") || (layer_service_type=="WFS") || (layer_service_type=="WFST"))
	{
		downloadObj={
				text:wms_node_info_Download,
				menu:[{
					text:wms_node_info_Download_TIFF,
					iconCls:'download_format_tiff',
					handler:function(){
						wms_node_downloadLayer(layer_url,layers_basename,layer_bbox,'tiff',layer_crs,arrayBounds,authentication);
						}
					},
					{
						text:wms_node_info_Download_GEOTIFF,
						iconCls:'download_format_geotiff',
						handler:function(){
							wms_node_downloadLayer(layer_url,layers_basename,layer_bbox,'geotiff',layer_crs,arrayBounds,authentication);
						}
					},
					{
						text:wms_node_info_Download_PDF,
						iconCls:'download_format_pdf',
						handler:function(){
							wms_node_downloadLayer(layer_url,layers_basename,layer_bbox,'pdf',layer_crs,arrayBounds,authentication);
						}
					},
					{
						text:wms_node_info_Download_SVG,
						iconCls:'download_format_svg',
						handler:function(){
							wms_node_downloadLayer(layer_url,layers_basename,layer_bbox,'svg',layer_crs,arrayBounds,authentication);
						}
					},
					{
						text:wms_node_info_Download_KML,
						iconCls:'download_format_kml',
						handler:function(){
							wms_node_downloadLayer(layer_url,layers_basename,layer_bbox,'kml',layer_crs,arrayBounds,authentication);
						}
					},
					{
						text:wms_node_info_Download_KMZ,
						iconCls:'download_format_kmz',
						handler:function(){
							wms_node_downloadLayer(layer_url,layers_basename,arrayBoundsString,'kmz',layer_crs,arrayBounds,authentication);
						}
					}
				]
			};
	
	}
	
	var thematicObj="";
	
	if((layer_service_type=="WMS") || (layer_service_type=="WFST") || (layer_service_type=="WFS"))
	{
		var layers_sld_id=mapPanel.layers.getAt(numLayer).get('layers_sld');
		
		thematicObj={
				text:thematicLayerMenuTitle,
				iconCls:'edit_thematic_layer',
				disabled:gEarthDisableContextNode,
				handler:function(){
					thematicNodeIndexLayer=numLayer;
					
					thematicBaseLayer=layers_basename;
					
					thematicServiceURL=layer_url;
					
					thematicAuthentication=authentication;
					
					thematicLayers_SLD_ID_EDIT=layers_sld_id;
					
					thematicLayers_BaseNameLayerId=layers_basename_id;
					
					thematicLayers_TreeMapNodeId=node.id;
					
					thematicLayer.show();
				}
			};
	
	}
	
	node.menu = new Ext.menu.Menu({ 			
		items:[
			informationObj,
			{
				text:title_mapTree_remove_layer,
				iconCls:'mapTree_remove16',
				handler:function(){
					removeLayerMap(node);
					var activeTree=Ext.getCmp('mapTree_TabPanel').getActiveTab().getId();
					nodeCheck_TreeLayers(Ext.getCmp(activeTree).root);
				}
			},
			{
				text:wms_node_info_ZoomToLayerExtend,
				iconCls:'layer_zoomtoextent',
				disabled:gEarthDisableContextNode,
				handler:function(){
					mapPanel.map.zoomToExtent(arrayBounds);
				}
			},
			thematicObj,
			{
				text:wms_node_info_Transparency,
				disabled:gEarthDisableContextNode,
				menu:[{
					xtype: "gx_opacityslider",
					layout:'panel',
					iconCls:'blank16',
					aggressive: true,
					vertical: false,
					width:120,
					layer:mapPanel.layers.getAt(numLayer).get('layer')
					}]
			},
			downloadObj
			]
		});
			
	node.menu.show(node.ui.getAnchor());


}
