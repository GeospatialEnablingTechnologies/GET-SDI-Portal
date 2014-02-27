/*version message*/

var map_search_area_layer_epsgs=new Array();

var map_search_area_layer_bboxes=new Array();

var map_search_area_url_constructor=new Array();

var map_search_area_server_constructor="";

var map_search_area_getinfo_source_id="";

var map_search_area_count_getInfo=0;

var map_search_area_geometry="";

var map_search_area_AJAX;

var map_search_area_default_service="";

var map_searchArea_window=new Ext.Window({ 
	width:740,
	height:500,
	closeAction:'hide',
	title:map_search_area_win_title,
	activeItem: 0,
	layout: 'fit',
	resizable:true,
	items:[
	{				
		xtype:'tabpanel',
		enableTabScroll:true,
		border:false,
		activeTab:0,
		id:'tab_map_searchArea_results',
		items:[]
	}]
});

function map_search_area()
{
	map_search_Area_count_getInfo=0;
	map_search_Area_getinfo_source_id="";
	
	map_search_area_getLayers(Ext.getCmp('layerTree_layers').root);
	
	if (map_search_area_url_constructor.length>0)
	{
		map_search_area_server_constructor=map_search_area_url_constructor.join('');
	}
	
	if(typeof map_search_area_AJAX!==undefined)
	{
		Ext.Ajax.abort(map_search_area_AJAX);
	}
	
	for(var i=0;i<map_search_area_layer_epsgs.length;i++)
	{
		var curGeometry=map_search_area_geometry;
		
		if (map_currentMapProjection!=map_search_area_layer_epsgs[i])
		{
			var map_search_area_geometry_clone=map_search_area_geometry.clone();
		
			curGeometry=map_search_area_geometry_clone.transform(new OpenLayers.Projection(map_currentMapProjection), new OpenLayers.Projection(map_search_area_layer_epsgs[i])).toString();
		}
		
		map_search_area_layer_bboxes[i]="&bbox=EPSG="+map_search_area_layer_epsgs[i]+"&CQL="+Ext.getCmp('map_search_area_geom_criteria').getValue()+"(the_geom_to_be_replaced,"+curGeometry+")";
	}
	
	var map_search_area_layer_bboxes_join=map_search_area_layer_bboxes.join("");
	
	map_search_area_server_constructor="bboxes=["+map_search_area_layer_bboxes_join+"]&"+map_search_area_server_constructor;
	
	map_searchArea_window.show();
	
	Ext.getCmp('tab_map_searchArea_results').removeAll();
	
	var myMask = new Ext.LoadMask('tab_map_searchArea_results', {msg:"Please wait..."});
	myMask.show();
	
	
	map_search_area_AJAX=Ext.Ajax.request({
		url:"modules/search/php/searchArea.php?"+map_search_area_server_constructor,
		timeout:15000,
		success:function(result,response)
		{
			var json=Ext.util.JSON.decode(result.responseText);
			
			for(var i=0;i<json.length;i++)
			{
			
				var grid_id="map_searchArea_grid_id_"+i;
			
				var serviceURL=json[i].SERVER;
				
				var dataStore=json[i].FEATURE_MEMBER;
				
				if((dataStore!="") &&  (dataStore!=null))
				{
					var panels=map_searchAreaCreateTabResults(serviceURL,dataStore,grid_id);
			
					Ext.getCmp('tab_map_searchArea_results').add(panels);
				}
			}
			
			Ext.getCmp('tab_map_searchArea_results').setActiveTab(0);
			
			myMask.hide();
			
		},
		failure:function()
		{
			myMask.hide();
		}
	});

	map_search_area_geometry="";
	
	map_search_area_url_constructor=new Array();
	
	map_search_area_layer_epsgs=new Array();
}


function map_searchAreaCreateTabResults(serviceURL,dataStore,grid_id)
{
	var sm = new Ext.grid.CheckboxSelectionModel();

	var columns=new Ext.grid.ColumnModel([
		sm,
		{dataIndex: "authentication", hidden:true,width:60,hideable: false},
		{width:26,renderer:function(v, p, rec, rowIndex, colIndex, store){return map_searchArea_createDownloadColumnIcon(rowIndex,grid_id);},hideable: false},
		{width:26,renderer:function(v, p, rec, rowIndex, colIndex, store){return map_searchArea_createShowInfoColumnIcon(rowIndex,grid_id);},hideable: false},
		{width:26,renderer:function(v, p, rec, rowIndex, colIndex, store){return map_searchArea_createShowOnMapColumnIcon(rowIndex,grid_id);},hideable: false},
		{header:'', dataIndex: "ATT_1", sortable: true,width:100,hideable: false},
		{header:'', dataIndex: "ATT_2", sortable: true,width:100,hideable: false},
		{header:'', dataIndex: "ATT_3", sortable:true,width:100,hideable: false},
		{header:'', dataIndex: "ATT_4", sortable:true,width:100,hideable: false},
		{header:'', dataIndex: "featureid", sortable:true,width:60,hideable: false},
		{header:'', dataIndex: "layer", sortable:true,width:100,hideable: false},
		{dataIndex: "service", hidden:true,width:60,hideable: false}
		
	]);

	var store = new Ext.data.GroupingStore({
		reader: new Ext.data.JsonReader({},[
			'ATT_1',
			'ATT_2',
			'ATT_3',
			'ATT_4',
			'featureid',
			'layer',
			'service',
			'authentication',
			'grid_id'
		]),
		groupField:'layer',
		data :dataStore
	});
	
	var tabResult=[{
		xtype:'panel',
		title:serviceURL,
		closable: true,
		border:false,
		layout:'fit',
		forceFit:true,
		items:[{
			xtype:'grid',
			loadMask:true,
			border:false,
			id:grid_id,
			view: new Ext.grid.GroupingView({
			groupByText:'layer'
			}),
			sm:sm,
			store:store,
			cm:columns,
			bbar:['->',
				{
					xtype:'button',
					iconCls:'search_export_list_to_csv',
					text:map_search_area_export_to_csv_tooltip,
					handler:function(){
					
						map_searchArea_exportCSV(serviceURL);
					}
				},
				{
					xtype:'button',
					iconCls:'search_save',
					text:map_search_download,
					handler:function(){
						map_search_AreaDonwloadMany(grid_id);
					}
				}
			]
		}]
	}];
	
	return tabResult;
	
}


function map_search_AreaDonwloadMany(grid_id)
{
	map_search_DownloadWindowSeperately=true;
	
	map_search_DownloadAuthentication="";
	
	map_search_DownloadFeatureId="";
	
	Ext.getCmp(grid_id).getSelectionModel().each(function(record) {
		
		map_search_DownloadFeatureId+=record.get("featureid")+",";
		map_search_DownloadAuthentication=record.get("authentication");
		map_search_DownloadServiceURL=record.get('service');
		map_search_DownloadLayerBasename=record.get('layer');
	});
	
	chooseDownloadType.show();
	
	map_search_DownloadFeatureId=map_search_DownloadFeatureId.substring(0, map_search_DownloadFeatureId.length - 1);
	
	return;
}

function map_searchArea_exportCSV(serviceURL)
{

	window.open("modules/search/php/searchArea.php?csvservice="+serviceURL+"&"+map_search_area_server_constructor);
	
	return;
}


function map_searchArea_createDownloadColumnIcon(rowIndex, grid_id)
{
	var img="<img src='images/gis_icons/save1.png' width='16' height='16' onclick=\"javascript:map_searchArea_DonwloadOne("+rowIndex+",'"+grid_id+"');\">";
	
	return img;

}

function map_searchArea_DonwloadOne(ss,grid_id)
{
	map_search_DownloadFromExternal="";

	map_search_DownloadWindowSeperately=false;
	
	var cellValue=Ext.getCmp(grid_id).getStore().getAt(ss);
	
	map_search_DownloadFeatureId=cellValue.get('featureid');
	
	map_search_DownloadLayerBasename=cellValue.get('layer');
	
	map_search_DownloadServiceURL=cellValue.get('service');
	
	map_search_DownloadAuthentication=cellValue.get('authentication');
	
	chooseDownloadType.show();
	
	return;
}

function map_searchArea_createShowInfoColumnIcon(rowIndex, grid_id)
{	
	var img="<img src='images/gis_icons/table.png' width='16' height='16' onclick=\"javascript:map_searchArea_showInfo("+rowIndex+",'"+grid_id+"');\">";
	
	return img;

}

function map_searchArea_showInfo(ss,grid_id)
{
	var geometry_url="";
	
	var info_url="";
	
	map_search_featureid="";
	
	var cellValue=Ext.getCmp(grid_id).getStore().getAt(ss);
	
	var featureid=cellValue.get('featureid');
	
	var service=cellValue.get('service');
	
	var layer=cellValue.get('layer');
	
	var authentication=fc_stringFromXML(cellValue.get('authentication'));
	
	var seperator="";
	
	if (authentication!="")
	{
		seperator="&";
	}
	
	var server_constructor=authentication+seperator+"service=WFS&request=GetFeature&featureid="+featureid+"&outputFormat=GML2&srsName=EPSG:4326&service_layers="+layer+"&service_uri="+service;

	var url_php_gml="php_source/proxies/proxy_gml.php?";
	
	var url_gml=url_php_gml+"gmlLang="+language+"&gmlFormat=gml&"+server_constructor;
		
	var url_geometry=url_php_gml+"gmlLang="+language+"&gmlFormat=geometry&"+server_constructor;
		
	var url_attributes=url_php_gml+"gmlLang="+language+"&gmlFormat=attributes&"+server_constructor;
	
	var featureObj={
		featureId:featureid,
		serviceURI:service,
		layerBasename:layer,
		hasFId:true,
		epsg:"EPSG:4326",
		serviceType:"WFS",
		serviceVersion:"",
		url_gml:url_gml,
		url_geometry:url_geometry,
		url_attributes:url_attributes,
		serviceAuthentication:authentication,
		layerVectorFormat:"gml"
	};
					
	windowFeatureInfo(featureObj);

}

function map_searchArea_createShowOnMapColumnIcon(rowIndex, grid_id)
{

	var img="<img src='images/gis_icons/show.png' width='16' height='16' onclick=\"javascript:map_searchArea_showOnMap("+rowIndex+",'"+grid_id+"');\">";
	
	return img;

}

function map_searchArea_showOnMap(ss,grid_id)
{
	var geometry_url="";
	
	var info_url="";
	
	map_search_featureid="";
	
	var cellValue=Ext.getCmp(grid_id).getStore().getAt(ss);
	
	var service=cellValue.get('service');
	
	var layer=cellValue.get('layer');
	
	var featureid=cellValue.get('featureid');
	
	var authentication=cellValue.get('authentication');
	
	var seperator="";
	
	if (authentication!="")
	{
		seperator="&";
	}
	
	var gml_url="php_source/proxies/proxy_wfs.php?"+authentication+seperator+"url="+Ext.urlAppend(service,"service=WFS&request=GetFeature&featureid="+featureid+"&outputFormat=GML2&srsName=EPSG:4326&typeName="+layer);
	
	fc_showVectorOnMap(gml_url,'EPSG:4326',"gml");

}

function map_searchAreaInitDrawFeatures()
{
	map_search_area_vector=new OpenLayers.Layer.Vector("mapSearchAreaVector");
	
	map.addLayer(map_search_area_vector);
	
	map_search_area_drawControls = {
		point: new OpenLayers.Control.DrawFeature(map_search_area_vector,
			OpenLayers.Handler.Point,{featureAdded:function(){
				map_search_area_drawControls["point"].deactivate();
				
				map_search_area_geometry=map_search_area_vector.features[0].geometry;
				
				map_search_area();
				
				
			}
		}),
		line: new OpenLayers.Control.DrawFeature(map_search_area_vector,
			OpenLayers.Handler.Path,{featureAdded:function(){
				map_search_area_drawControls["line"].deactivate();
				
				map_search_area_geometry=map_search_area_vector.features[0].geometry;
				
				map_search_area();
				
			}
		}),
		polygon: new OpenLayers.Control.DrawFeature(map_search_area_vector,
			OpenLayers.Handler.Polygon,{featureAdded:function(){
				map_search_area_drawControls["polygon"].deactivate();
				
				map_search_area_geometry=map_search_area_vector.features[0].geometry;
				
				map_search_area();
				
			}
		}),
		box: new OpenLayers.Control.DrawFeature(map_search_area_vector,
			OpenLayers.Handler.RegularPolygon, {
				handlerOptions: {
					sides: 4,
					irregular: true
				},featureAdded:function(){
					map_search_area_drawControls["box"].deactivate();
					
					map_search_area_geometry=map_search_area_vector.features[0].geometry;
					
					map_search_area();
				}
			}
		)
	};
	
	for(var key in map_search_area_drawControls) {
		map.addControl(map_search_area_drawControls[key]);
	}
	
}


function map_search_area_toggleControl(element) {
	
    for(key in map_search_drawControls) {
		var control = map_search_drawControls[key];
		if(element.toString() == key.toString()) {
			control.activate();
		} else {
			control.deactivate();
		}
	}
}


function map_search_area_getLayers(node)
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
				
				var native_srs=numLayer.get("native_srs");
				
				var geom_field=numLayer.get("geom_name");

				name_layers=name_layers+comma+numLayer.get("layers_basename")+"::"+native_srs+"::"+geom_field;
				
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
				
				if (map_search_area_getinfo_source_id!=numLayer.get("source_id"))
				{
					map_search_area_getinfo_source_id=numLayer.get("source_id");
					
					map_search_area_count_getInfo++;
				}
				
				if ((isSupported) || (numLayer.get("service_type")=="WFS") || (numLayer.get("service_type")=="WFST"))
				{
					if (!map_search_area_layer_epsgs.containsVal(native_srs))
					map_search_area_layer_epsgs.push(native_srs);
					
					map_search_area_url_constructor[map_search_area_count_getInfo]="&servers=service_layers=["+name_layers+"]&service_url=["+numLayer.get("source_id")+"]&service_version=["+numLayer.get("service_version")+"]&service_type=["+numLayer.get("service_type")+"]&service_authentication=["+authentication+"]";
				}

			}
			
		}
		
		if(n.hasChildNodes())
    	map_search_area_getLayers(n);
		
	});

}


