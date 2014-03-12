/*version message*/
var map_search_label_values_attributes_columns=['name','type','value','translation'];
var map_search_service_url="";
var map_search_featureid="";
var map_search_service_version="";
var map_search_layer_basename="";
var map_search_layer_sld="";
var map_search_layer_geometry_field="";
var map_search_layer_service_type="";
var map_search_layer_name="";
var map_search_layer_crs="";
var map_search_layer_supported_crs="";
var map_search_add_criteria_count=0;
var map_search_sql_statement_value="";
var map_search_count=0;
var map_search_map;
var map_search_overlay;
var map_search_vector;
var map_search_drawControls;
var map_search_geometry="";
var map_search_from_history=false;
var map_search_newSearch=false;
var map_search_dynamicSearch=false;
var map_search_history_count=0;
var map_search_DownloadWindowSeperately=false;
var map_search_DownloadFromExternal="";
var map_search_service_authentication="";
var map_search_DownloadAuthentication="";
var map_search_DownloadServiceURL="";
var map_search_DownloadLayerBasename="";
var map_search_DownloadFeatureId="";
var map_search_map_currentMapProjection="EPSG:900913";
var map_search_mapLayers=new Array();

var chooseDownloadType=new Ext.Window({ 
	width:380,
	height:240,
	modal:true,
	resizable:false,
	closeAction:'hide',
	plain:true,
	layout:'border',
	listeners:
	{
		show:function(cmp)
		{
			if (map_search_DownloadWindowSeperately)
			{	
				Ext.getCmp('map_search_save_seperately_check_id').show();
			}
			else
			{
				Ext.getCmp('map_search_save_seperately_check_id').hide();
				
				Ext.getCmp('map_search_save_seperately_check_id').setValue(false);
			}
			
		},
		hide:function(){
		
			map_search_DownloadFromExternal="";
		}
		
	},
	items:[{
		xtype:'form',
		region:'center',
		id:'map_search_form_save',
		items:[
		{
			xtype:'combo',
			loadMask:true,
			autoScroll:true,
			autoShow: true,
			id:'map_search_outputformat_combo',
			fieldLabel:map_search_outputformat,
			store: new Ext.data.SimpleStore({
			fields: ['name','value'],
				data: [["GML2","GML2"],["GML3","GML3"],["Shapefile","shape-zip"],["JSON","application/json"],["JSONP","text/javascript"],["CSV","csv"]]
			}), 
			displayField: 'name',
			valueField: 'value',
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus: false,
			mode: 'local',
			editable: false
		},
		{
			xtype:'combo',
			loadMask:true,
			autoScroll:true,
			autoShow: true,
			id:'map_search_charset_combo',
			fieldLabel:map_search_outputcharset,
			store: new Ext.data.SimpleStore({
			fields: ['name','value'],
				data: [["ISO 8859-1","ISO-8859-1"],["ISO 8859-2","ISO-8859-2"],["ISO 8859-3","ISO-8859-3"],["ISO 8859-4","ISO-8859-4"],["ISO 8859-5","ISO-8859-5"],["ISO 8859-6","ISO-8859-6"],["ISO 8859-7","ISO-8859-7"],["ISO 8859-8","ISO-8859-8"],["ISO 8859-9","ISO-8859-9"],["ISO 8859-10","ISO-8859-10"],["ISO 8859-11","ISO-8859-11"],["ISO 8859-13","ISO-8859-13"],["ISO 8859-14","ISO-8859-14"],["ISO 8859-15","ISO-8859-15"],["ISO 8859-16","ISO-8859-16"],["UTF 8","UTF-8"]]
			}), 
			displayField: 'name',
			valueField: 'value',
			emptyText:"UTF-8",
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus: false,
			mode: 'local',
			editable: false
		},
		{
			xtype:'combo',
			loadMask:true,
			autoScroll:true,
			autoShow: true,
			id:'map_search_SRS_combo',
			fieldLabel:map_search_outputSRS,
			store: new Ext.data.SimpleStore({
			fields: ['value'],
				data: map_ctrls_projection_systemsArr
			}), 
			displayField: 'value',
			valueField: 'value',
			emptyText:"",
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus: false,
			mode: 'local',
			editable: false
		},
		{
			xtype:'checkbox',
			checked:false,
			id:'map_search_save_seperately_check_id',
			labelStyle: 'width:200px',
			fieldLabel:map_search_save_seperate
		}],
		bbar:['->',{
			xtype:'button',
			text:map_search_download,
			iconCls:'search_save',
			handler:function()
			{
				switch(map_search_DownloadFromExternal)
				{
					case "addToSelected":
						addToSelected_Download();
					break;
					
					default:
						map_search_Download_Default();
					break;
				}
				
			}
		}]
	}]
});


function map_search_Download_Default()
{
	var outputformat=Ext.getCmp('map_search_outputformat_combo').getValue();
				
	var charset=Ext.getCmp('map_search_charset_combo').getValue();
				
	if (charset=="")
	{
		charset="UTF-8";
	}
				
	var srsname=Ext.getCmp('map_search_SRS_combo').getValue();
				
	if (srsname!="")
	{
		srsname="&srsName="+srsname;
	}else
	{
		srsname="";
	}
				
	var format_options="&format_options=charset:"+charset;
				
	var seperateFiles=Ext.getCmp('map_search_save_seperately_check_id').checked;
	
	if(map_search_DownloadAuthentication!="")
	{
		map_search_DownloadAuthentication+="&";
	}

	if (seperateFiles)
	{
		var map_search_featureid_arr=map_search_DownloadFeatureId.split(",");
		
		Ext.each(map_search_featureid_arr, function(value) {
			window.open("php_source/proxies/proxy_redirect.php?"+map_search_DownloadAuthentication+"url="+Ext.urlAppend(map_search_DownloadServiceURL,"service=WFS&request=GetFeature"+format_options+"&featureid="+value+"&typeName="+map_search_DownloadLayerBasename+"&outputFormat="+outputformat+srsname));
		});	
	}
	else
	{
		window.open("php_source/proxies/proxy_redirect.php?"+map_search_DownloadAuthentication+"url="+Ext.urlAppend(map_search_DownloadServiceURL,"service=WFS&request=GetFeature"+format_options+"&featureid="+map_search_DownloadFeatureId+"&typeName="+map_search_DownloadLayerBasename+"&outputFormat="+outputformat+srsname));	
	}
}


var map_search_history_sm=new Ext.grid.CheckboxSelectionModel({singleSelect:false});

var map_search_history_columns_model=new Ext.grid.ColumnModel([
	map_search_history_sm,
	{header:map_search_history_grid_column_history_id, dataIndex: "history_id", sortable: true,width:50,hideable: false},
	{header:map_search_history_grid_column_basename_layer_id, dataIndex: "basename_layer", sortable: true,width:100,hideable: false},
	{header:map_search_history_grid_column_url_layer_id, dataIndex: "url_layer", sortable: true,width:100,hideable: false},
	{header:map_search_history_grid_column_cql_text_id, dataIndex: "cql_text", sortable: true,width:300,hideable: false},	
	{header:'', dataIndex: "json_Criteria",hidden:true,hideable: false},
	{header:'', dataIndex: "service_Authentication",hidden:true,hideable: false}
	
]);

var map_search_history_store_columns=["history_id","basename_layer","url_layer","cql_text","json_Criteria","service_Authentication"];

var map_search_history_store=new Ext.data.SimpleStore({
    fields: map_search_history_store_columns,
    data :[]
});


var map_search_label_values_attributes_store=new Ext.data.SimpleStore({
    fields: map_search_label_values_attributes_columns,
    data :[]
});

var map_search_searchableLayersStore=new Ext.data.SimpleStore({
			fields: ['name','value','layer_id','layer_basename'],
			data: []
		});

var map_searchWindow_Form_ChooseLayer_Panel=new Ext.Panel({
	border:true,
	layout:'form',
	region:'north',
	items:[{
		xtype:'combo',
		fieldLabel:map_search_default_chooseLayer,
		width:200,
		height:60,
		id:'map_search_chooseLayer_Combo',
		store: map_search_searchableLayersStore, 
		displayField: 'name',
		editable:false,
		emptyText:map_search_default_chooseLayer,
		valueField: 'value',
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus:true,
		mode: 'local',
		listeners:{
			select:function(combo,record){
				
				if ((record.get('layer_geometryField')!="") && (typeof record.get('layer_geometryField')!=="undefined"))
				{
					this.setValue(record.data.name);
					map_search_service_url=record.get('value');
					map_search_layer_basename=record.get('layer_basename');
					map_search_service_version=record.get('service_version');
					map_search_layer_name=record.data.name;
					map_search_layer_service_type=record.get('service_type');
					map_search_service_authentication=record.get('service_authentication');
					map_search_layer_crs=record.get('native_srs');
					map_search_layer_geometry_field=record.get('layer_geometryField');
					map_search_layer_sld=record.get('sld_body');
					map_search_layer_supported_crs=record.get('layer_crs');
					
					//map_search_checkBaseLayerSupportedEPSG();
					map_search_populateAttributeCombo();
					map_search_label_values_attributes_store.load();					
				
					Ext.getCmp('map_search_dynamic_search_id').setValue(false);
					map_search_dynamicSearch=false;
					
					Ext.getCmp('map_search_condition_list_id').removeAll();
					map_search_add_criteria_count=0;
					
					map_search_change_layer();
					
				}
				else
				{
				
					map_search_service_url="";
					map_search_layer_basename="";
					map_search_service_version="";
					map_search_layer_name="";
					map_search_layer_service_type="";
					map_search_service_authentication="";
					map_search_layer_crs="";
					map_search_layer_geometry_field="";
					map_search_layer_sld="";
					map_search_layer_supported_crs="";
					
					
					Ext.getCmp('map_search_condition_list_id').removeAll();
					map_search_add_criteria_count=0;
				
					Ext.Msg.alert(map_Search_Cannot_Search_Error_Title, map_Search_Cannot_Search_Error_Msg);
				}
				
			}
		}
	}]
});


function map_search_BaseLayerSupportedEPSG(baseLayerProjection)
{
	var isSupported=false;
	
	var supportedProjections=map_search_layer_supported_crs.split(",");
	
	for(var i=0; i<supportedProjections.length; i++)
	{
		var epsg=supportedProjections[i];
		
		if (epsg==baseLayerProjection) 
		{
			isSupported=true;
		}
	}
	
	return isSupported;
}


function map_search_checkBaseLayerSupportedEPSG()
{

	for(var i=0;i<map_search_map.layers.length;i++)
	{
		if (map_search_map.layers[i].isBaseLayer)
		{
			var baseLayerProjection=map_search_map.layers[i].projection;
			
			if (!map_search_BaseLayerSupportedEPSG(baseLayerProjection.toString()))
			{
				map_search_map.layers[i].displayInLayerSwitcher=false;
			}else
			{
				map_search_map.layers[i].displayInLayerSwitcher=true;
				
				map_search_map.setBaseLayer(map_search_map.layers[i]);
			}
		}
	}

}


var map_searchWindow_Add_Criteria_Panel=new Ext.Panel({
	id:'map_search_condition_list_id',
	border:true,
	region:'center',
	title:map_search_what_title,
	iconCls:'mapTree_icon16',
	forceFit:true,
	autoScroll:true,
	bbar:['->',{
		xtype:'button',
		iconCls:'mapTree_add16',
		text:map_search_button_add_criteria,
		handler:function(){
			
			if (map_search_createSQL()==true)
			{
				map_search_addRow();
			}
			
		}
	}]
});



function map_searchInitDrawFeatures()
{		


	map_search_vector=new OpenLayers.Layer.Vector("mapSearchVector",{displayInLayerSwitcher:false});
	
	map_search_map.addLayer(map_search_vector);
	
	map_search_drawControls = {
		point: new OpenLayers.Control.DrawFeature(map_search_vector,
			OpenLayers.Handler.Point,{featureAdded:function(){
				map_search_drawControls["point"].deactivate();
				
				if(map_search_layer_crs!=map_search_map_currentMapProjection)
				{
					var map_search_vector_clone=map_search_vector.clone();
				
					map_search_geometry=map_search_vector_clone.features[0].geometry.transform(new OpenLayers.Projection(map_search_map_currentMapProjection), new OpenLayers.Projection(map_search_layer_crs)).toString();
				}
				else
				{
					map_search_geometry=map_search_vector.features[0].geometry.toString();
				}
			}
		}),
		line: new OpenLayers.Control.DrawFeature(map_search_vector,
			OpenLayers.Handler.Path,{featureAdded:function(){
				map_search_drawControls["line"].deactivate();
				
				if(map_search_layer_crs!=map_search_map_currentMapProjection)
				{
					var map_search_vector_clone=map_search_vector.clone();
				
					map_search_geometry=map_search_vector_clone.features[0].geometry.transform(new OpenLayers.Projection(map_search_map_currentMapProjection), new OpenLayers.Projection(map_search_layer_crs)).toString();
				}
				else
				{
					map_search_geometry=map_search_vector.features[0].geometry.toString();
				}
			}
		}),
		polygon: new OpenLayers.Control.DrawFeature(map_search_vector,
			OpenLayers.Handler.Polygon,{featureAdded:function(){
				map_search_drawControls["polygon"].deactivate();
				
				if(map_search_layer_crs!=map_search_map_currentMapProjection)
				{
					var map_search_vector_clone=map_search_vector.clone();
				
					map_search_geometry=map_search_vector_clone.features[0].geometry.transform(new OpenLayers.Projection(map_search_map_currentMapProjection), new OpenLayers.Projection(map_search_layer_crs)).toString();
				}
				else
				{
					map_search_geometry=map_search_vector.features[0].geometry.toString();
				}
			}
		}),
		box: new OpenLayers.Control.DrawFeature(map_search_vector,
			OpenLayers.Handler.RegularPolygon, {
				handlerOptions: {
					sides: 4,
					irregular: true
				},featureAdded:function(){
					map_search_drawControls["box"].deactivate();
				
					if(map_search_layer_crs!=map_search_map_currentMapProjection)
					{
						var map_search_vector_clone=map_search_vector.clone();
					
						map_search_geometry=map_search_vector_clone.features[0].geometry.transform(new OpenLayers.Projection(map_search_map_currentMapProjection), new OpenLayers.Projection(map_search_layer_crs)).toString();
					}
					else
					{
						map_search_geometry=map_search_vector.features[0].geometry.toString();
					}
				}
			}
		)
	};
	
	for(var key in map_search_drawControls) {
		map_search_map.addControl(map_search_drawControls[key]);
	}
	
}

function map_searchtoggleControl(element) {
	
    for(key in map_search_drawControls) {
		var control = map_search_drawControls[key];
		if(element.toString() == key.toString()) {
			control.activate();
		} else {
			control.deactivate();
		}
	}
}

function map_search_dynamic_search_fn()
{
		
	if (map_search_createSQL())
	{
		map_search_show_grid_results();
	}

}


function map_search_sync()
{
	map.events.unregister('moveend', map, map_search_sync);
	
	var zoom=map.getZoom();
	
	if ((map_search_dynamicSearch) && (map.getZoom()<=15))
	{
		zoom=15;
	}
	
	if ((map_search_dynamicSearch) && (Ext.getCmp('map_search_window_id').isVisible()))
	{
		map_search_dynamic_search_fn();
	}
	
	
	if (map_search_map_currentMapProjection!=map_currentMapProjection)
	{
		map_search_map.setCenter(map.getCenter().transform(new OpenLayers.Projection(map_currentMapProjection), new OpenLayers.Projection(map_search_map_currentMapProjection)), zoom);
	}
	else
	{
		map_search_map.setCenter(map.getCenter(), zoom);
	}
	
	map.events.register('moveend', map, map_search_sync);
}

function map_search_main_map_sync()
{
	map_search_map.events.unregister('moveend', map_search_map, map_search_main_map_sync);
	
	if (map_search_dynamicSearch)
	{
		if (map_search_map_currentMapProjection!=map_currentMapProjection)
		{
			map.setCenter(map_search_map.getCenter().transform(new OpenLayers.Projection(map_search_map_currentMapProjection), new OpenLayers.Projection(map_currentMapProjection)));
		}
		else
		{
			map.setCenter(map_search_map.getCenter());
		}
		
		map_search_dynamic_search_fn();
		
	}
	else
	{
		if (map_search_map_currentMapProjection!=map_currentMapProjection)
		{
			
			map.setCenter(map_search_map.getCenter().transform(new OpenLayers.Projection(map_search_map_currentMapProjection), new OpenLayers.Projection(map_currentMapProjection)),map_search_map.getZoom());
		}
		else
		{
			map.setCenter(map_search_map.getCenter(),map_search_map.getZoom());
		}
	}
	
	map_search_map.events.register('moveend', map_search_map, map_search_main_map_sync);
}

var map_searchWindow_Add_Spatial_Criteria_Panel=new Ext.Panel({
	title:map_search_where_title,
	region:'center',
	iconCls:'mapTree_icon16',
	listeners:{
		expand:function(){
			if(map_search_map!=undefined)
			{
				map_search_map.updateSize();
				if (map_search_overlay!=undefined)
				map_search_overlay.redraw();
				
			}
		},
		collapse:function(){
		
			if(map_search_map!=undefined)
			{
				map_search_map.updateSize();
				if (map_search_overlay!=undefined)
				map_search_overlay.redraw();
				
			}
		}
	},
	bbar:[{
		xtype:'checkbox',
		boxLabel:map_search_synch_with_map,
		id:'map_search_synch_with_map_id',
		handler:function(checkbox)
		{
			if (checkbox.checked)
			{
				
				if (map_search_map_currentMapProjection!=map_currentMapProjection)
				{
					map_search_map.setCenter(map.getCenter().transform(new OpenLayers.Projection(map_currentMapProjection), new OpenLayers.Projection(map_search_map_currentMapProjection)), map.getZoom());
				}
				else
				{
					map_search_map.setCenter(map.getCenter(), map.getZoom());
				}
				
				map.events.register('moveend', map, map_search_sync);
				
				map_search_map.events.register('moveend', map_search_map, map_search_main_map_sync);
				
				
			}
			else
			{
			
				
				map.events.unregister('moveend', map, map_search_sync);
				
				map_search_map.events.unregister('moveend', map_search_map, map_search_main_map_sync);
			}
		}
	},{
		xtype:'checkbox',
		boxLabel:map_search_dynamic_search,
		id:'map_search_dynamic_search_id',
		handler:function(checkbox)
		{
			if (checkbox.checked)
			{
				Ext.getCmp('map_search_polygon_id').disable();
				Ext.getCmp('map_search_line_id').disable();
				Ext.getCmp('map_search_bbox_id').disable();
				Ext.getCmp('map_search_clear_id').disable();
				
				Ext.getCmp('map_search_geom_criteria').disable();
				map_search_dynamicSearch=true;
				
				map_search_map.events.register('moveend', map_search_map, map_search_dynamic_search_fn);
			}
			else
			{
				Ext.getCmp('map_search_polygon_id').enable();
				Ext.getCmp('map_search_line_id').enable();
				Ext.getCmp('map_search_bbox_id').enable();
				Ext.getCmp('map_search_clear_id').enable();
				
				Ext.getCmp('map_search_geom_criteria').enable();
				map_search_dynamicSearch=false;
				
				map_search_map.events.unregister('moveend', map_search_map, map_search_dynamic_search_fn);
			}
		}
	}],
	tbar:[{	
			xtype:'button',
			iconCls:'search_polygon',
			id:'map_search_polygon_id',
			tooltip:map_search_controls_drawpolygon,
			handler:function(btn,pressed)
			{
				if (Ext.getCmp('map_search_geom_criteria').getValue()=="")
				{
					Ext.getCmp('map_search_geom_criteria').setValue(Ext.getCmp('map_search_geom_criteria').getStore().getAt(0).get('value'));
				}
				
				map_search_vector.destroyFeatures();
				map_search_drawControls["polygon"].activate();
				
			}
		},
		{	
			xtype:'button',
			iconCls:'search_line',
			tooltip:map_search_controls_drawline,
			id:'map_search_line_id',
			handler:function(btn,pressed)
			{
				if (Ext.getCmp('map_search_geom_criteria').getValue()=="")
				{
					Ext.getCmp('map_search_geom_criteria').setValue(Ext.getCmp('map_search_geom_criteria').getStore().getAt(1).get('value'));
				}
				
				map_search_vector.destroyFeatures();
				map_search_drawControls["line"].activate();
			}
		},
		{	
			xtype:'button',
			iconCls:'search_bbox',
			tooltip:map_search_controls_drawBBOX,
			id:'map_search_bbox_id',
			handler:function(btn,pressed)
			{
				if (Ext.getCmp('map_search_geom_criteria').getValue()=="")
				{
					Ext.getCmp('map_search_geom_criteria').setValue(Ext.getCmp('map_search_geom_criteria').getStore().getAt(0).get('value'));
				}
				
				map_search_vector.destroyFeatures();
				map_search_drawControls["box"].activate();
			}
		},
		{
			xtype:'button',
			iconCls:'search_clear',
			tooltip:map_search_map_clear,
			id:'map_search_clear_id',
			handler: function(btn,pressed)
			{
				map_search_vector.destroyFeatures();
				map_search_geometry="";
				map_searchtoggleControl("");
			
			}
		
		},
		{xtype: 'tbseparator'},
		{
			xtype:'combo',
			loadMask:true,
			autoScroll:true,
			autoShow: true,
			width:200,
			id:'map_search_geom_criteria',
			emptyText:map_search_geom_criteria_combo_emptyText,
			store: new Ext.data.SimpleStore({
			fields: ['value','name'],
				data: [["INTERSECTS",map_search_geom_criteria_combo_INTERSECTS],["CROSSES",map_search_geom_criteria_combo_CROSSES],["WITHIN",map_search_geom_criteria_combo_WITHIN]]
			}), 
			displayField: 'name',
			valueField: 'value',
			emptyText:map_search_geom_criteria_combo_emptyText,
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus: false,
			mode: 'local',
			editable: false
		}],
	items:[{
		xtype:'panel',
		id:'map_search_map_div',
		layout:'fit'
	}]
});


function map_search_change_layer()
{
	if (typeof map_search_overlay!=="undefined")
	{
		map_search_map.removeLayer(map_search_overlay);
	}
	
	var rec_sld_body="";
	
	if ((typeof map_search_layer_sld!=="undefined") && (map_search_layer_sld!=""))
	{
		if (thematicLayers_fileBased==false)
		{
			
			map_search_overlay=new OpenLayers.Layer.WMS(
				map_search_layer_name,
				"php_source/proxies/proxy.php?"+map_search_service_authentication+"url="+Ext.urlAppend(map_search_service_url,"SERVICE=WMS"),
				{
					layers: map_search_layer_basename, 
					format: "image/png", 
					transparent: true,
					sld_body:map_search_layer_sld,
					transitionEffect:null,
					displayInLayerSwitcher:false
				},
				{	
					isBaseLayer: false,
					transitionEffect:null,
					displayInLayerSwitcher:false
				}
			);
		}
		if (thematicLayers_fileBased==true)
		{
			map_search_overlay=new OpenLayers.Layer.WMS(
				map_search_layer_name,
				"php_source/proxies/proxy.php?"+map_search_service_authentication+"url="+Ext.urlAppend(map_search_service_url,"SERVICE=WMS"),
				{
					layers: map_search_layer_basename, 
					format: "image/png", 
					transparent: true,
					sld:map_search_layer_sld,
					transitionEffect:null,
					displayInLayerSwitcher:false
				},
				{	
					isBaseLayer: false,
					transitionEffect:null,
					displayInLayerSwitcher:false
				}
			);
		}
	}
	else
	{
		map_search_overlay=new OpenLayers.Layer.WMS(
			map_search_layer_name,
			"php_source/proxies/proxy.php?"+map_search_service_authentication+"url="+Ext.urlAppend(map_search_service_url,"SERVICE=WMS"),
			{
				layers: map_search_layer_basename, 
				format: "image/png", 
				transparent: true,
				transitionEffect:null,
				displayInLayerSwitcher:false
			},
			{	
				isBaseLayer: false,
				transitionEffect:null,
				displayInLayerSwitcher:false
			}
		);
	}
	map_search_map.addLayer(map_search_overlay);
}





function map_search_mapInit()
{
	for(var i=0;i<mapLayers.length;i++)
	{
		map_search_mapLayers.push(mapLayers[i].clone());

	}

	var map_search_map_options = {
			displayProjection: new OpenLayers.Projection(epsgExtents[map_search_map_currentMapProjection]),
			units: 'km', 
			maxExtent: new OpenLayers.Bounds.fromString(epsgExtents[map_search_map_currentMapProjection]),
			zoomMethod:null,
			transitionEffect:null
	};
	
	map_search_map = new OpenLayers.Map('map_search_map_div',map_search_map_options);
	
	map_search_map.addControl(new OpenLayers.Control.LayerSwitcher());

	map_search_map.addLayers(map_search_mapLayers);
	
	var map_search_map_previousMapProjection=map_search_map.getProjectionObject().toString();
	
	map_search_map_currentMapProjection=map_search_map.getProjectionObject().toString();
	
	map_search_map.events.on({
		"changebaselayer":function(evtObj)
		{
			setTimeout(function(){
				map_search_map_currentMapProjection=map_search_map.getProjectionObject().toString();
				
				if (map_search_map_currentMapProjection!=map_search_map_previousMapProjection)
				{
					map_search_map.setCenter(map_search_map.getCenter().transform(new OpenLayers.Projection(map_search_map_previousMapProjection), new OpenLayers.Projection(map_search_map_currentMapProjection)));
					
					map_search_map.zoomIn();
					map_search_map.zoomOut();
				}
				
				map_search_map_previousMapProjection=map_search_map.getProjectionObject().toString();
				
			},300);
			
		}
	});
	
}

var map_searchWindow_View_SQL_Panel=new Ext.Panel({
	border:true,
	region:'center',
	iconCls:'mapTree_icon16',
	title:map_search_SQL_statement,
	height:100,
	layout:'fit',
	items:[{
		xtype:'textarea',
		id:'map_search_sql_textarea',
		anchor:'100%'
	}]
});		
		
var map_searchWindow=new Ext.Window({ 
	width:640,
	height:600,
	modal:false,
	border:false,
	minimizable:true,
	resizable:true,
	title:map_search_title,
	closeAction:'hide',
	x:screen.width-680,
	y:40,
	id:'map_search_window_id',
	layout:'border',
	listeners:{
		show:function(){
		
			if (map_search_map==undefined)
			{
				map_search_mapInit();
				map_searchInitDrawFeatures();
			}
			
			if (map_search_map_currentMapProjection!=map_currentMapProjection)
			{
				map_search_map.setCenter(map.getCenter().transform(new OpenLayers.Projection(map_currentMapProjection), new OpenLayers.Projection(map_search_map_currentMapProjection)), map.getZoom());
				map_search_map.zoomIn();
				map_search_map.zoomOut();
			}
			else
			{
				map_search_map.setCenter(map.getCenter(), map.getZoom());
				map_search_map.zoomIn();
				map_search_map.zoomOut();
			}
			
		
		},
		move:function()
		{
			if (map_search_map!=undefined)
			{
				map_search_map.updateSize();
				if (map_search_overlay!=undefined)
				map_search_overlay.redraw();
				if (map_search_vector!=undefined)
				map_search_vector.redraw();
			}
		},
		minimize: function(win,obj) {
			if (map_search_map!=undefined)
			{
				map_search_map.updateSize();
			}
		},
		resize:function(){
		
			if (map_search_map!=undefined)
			{
				
				map_search_map.updateSize();
				if (map_search_overlay!=undefined)
				map_search_overlay.redraw();
				
			}
			
		}
	
	},
	items:[{				
		xtype:'tabpanel',
		enableTabScroll:true,
		id:'map_search_tabpanel_id',
		region:'center',
		activeItem:0,
		border:false,
		items:[{
                title: map_search_form_title,
				layout:'border',
				id:'map_search_form_tab_id',
				items:[map_searchWindow_Form_ChooseLayer_Panel,
				{
					xtype:'panel',
					region: 'center',
					layout: 'accordion',
					activeItem: 0,
					layoutConfig: {
						animate: true,
						sequence: true
					},
					items:[map_searchWindow_Add_Spatial_Criteria_Panel,map_searchWindow_Add_Criteria_Panel,map_searchWindow_View_SQL_Panel]
				}],
				bbar:[
				'->',
				{
					xtype:'checkbox',
					boxLabel:map_search_check_new,
					id:'map_search_check_new_id',
					handler:function(checkbox){
						
						map_search_newSearch=checkbox.checked;
						
					}
				
				},
				{
					xtype:'button',
					text:map_search_button,
					iconCls:'search',
					handler:function(){
						
						if (map_search_createSQL())
						{
							map_search_show_grid_results();
						}
						
					}
				
				}]
            },{
                title: map_search_history_title,
				id:'map_search_history_tab_id',
				layout:'border',
				items:[{
					xtype:'grid',
					sm: map_search_history_sm,
					region:'center',
					id:'map_search_history_grid_id',
					loadMask:true,
					columnLines: true,
					ds:map_search_history_store,
					cm:map_search_history_columns_model
				}],
				bbar:['->',
				{
					xtype:'button',
					text:map_search_history_remove,
					iconCls:'mapTree_remove16',
					handler:function(){
						map_search_removeHistory();
					}
				},
				{
					xtype:'button',
					text:map_search_history_restore,
					iconCls:'search',
					handler:function(){
						map_search_restoreHistory();
					}
				}]
			}]
		}]
});
	
function map_search_createSQL()
{

	if (Ext.getCmp('map_search_chooseLayer_Combo').getValue()=="")
	{
		Ext.Msg.alert(map_search_choose_layer_err_title, map_search_choose_layer_err_msg);
		
		return false;
	}
	else
	{
		map_search_sql_statement_value="";
		
		if (map_search_add_criteria_count>0)
		{
			Ext.getCmp('map_search_andor_'+(map_search_add_criteria_count-1)).setValue("");
		
			for(var i=0;i<map_search_add_criteria_count;i++)
			{
				if (typeof Ext.getCmp('map_search_criteria_att_name_'+i)!=="undefined")
				{
					map_search_sql_statement_value+=Ext.getCmp('map_search_criteria_att_name_'+i).getValue();
					
					if (Ext.getCmp('map_search_criteria_contition_'+i).getValue()=="=")
					{
						map_search_sql_statement_value+="=";
					}
					else if (Ext.getCmp('map_search_criteria_contition_'+i).getValue()=="LIKE")
					{
						map_search_sql_statement_value+=" LIKE ";
					}
					else if (Ext.getCmp('map_search_criteria_contition_'+i).getValue()=="NOT LIKE")
					{
						map_search_sql_statement_value+=" NOT LIKE ";
					}
					else
					{
						map_search_sql_statement_value+=Ext.getCmp('map_search_criteria_contition_'+i).getValue();
					}
					
					if ((Ext.getCmp('map_search_criteria_contition_'+i).getValue()=="LIKE") || (Ext.getCmp('map_search_criteria_contition_'+i).getValue()=="NOT LIKE"))
					{
						map_search_sql_statement_value+="'"+Ext.getCmp('map_search_criteria_value_'+i).getValue()+"'";
					}
					else
					{
					
						var seperator="";
						var FIndex = Ext.getCmp('map_search_criteria_contition_'+i).getStore().find("value",Ext.getCmp('map_search_criteria_contition_'+i).getValue());
						var record=Ext.getCmp('map_search_criteria_contition_'+i).getStore().getAt(FIndex);
						
						if (FIndex>=0)
						{
							if (record.get("value_type")=="string")
							{
								seperator="'";
							}
						}
						
						map_search_sql_statement_value+=seperator+Ext.getCmp('map_search_criteria_value_'+i).getValue()+seperator;
					}
					
					if ((Ext.getCmp('map_search_andor_'+i).getValue()!="") && (typeof Ext.getCmp('map_search_andor_'+i).getValue()!=="undefined") && (Ext.getCmp('map_search_andor_'+i).getValue()!='undefined'))
					{
						
						map_search_sql_statement_value+=" "+Ext.getCmp('map_search_andor_'+i).getValue()+" ";
					}
				}
			}
			
		}
		var spatial_criteria="";
		
		if ((typeof map_search_sql_statement_value.trim()==="undefined") || (map_search_sql_statement_value.trim()=='undefined') || (map_search_sql_statement_value.trim()==""))
		{
			map_search_sql_statement_value="";
		}
		
		
		if (!map_search_dynamicSearch)
		{
			if (map_search_geometry!="")
			{			
				if (map_search_sql_statement_value!="")
				{
					spatial_criteria=' AND ';
				}
				
				spatial_criteria+=Ext.getCmp('map_search_geom_criteria').getValue()+"("+map_search_layer_geometry_field+","+map_search_geometry+')';
				
			}
			
		}
		else
		{
			var map_search_bbox="";

				
			if(map_search_layer_crs!=map_search_map_currentMapProjection)
			{
				map_search_bbox=map_search_map.getExtent().transform(new OpenLayers.Projection(map_search_map_currentMapProjection), new OpenLayers.Projection(map_search_layer_crs)).toString();
			}
			else
			{
				map_search_bbox=map_search_map.getExtent().toString();
			}
			
			
		
			if (map_search_sql_statement_value!="")
			{
				spatial_criteria=' AND ';
			}
		
			spatial_criteria+="BBOX("+map_search_layer_geometry_field+","+map_search_bbox+")";
		
		}
		
		map_search_sql_statement_value=map_search_sql_statement_value+spatial_criteria;
		
		Ext.getCmp('map_search_sql_textarea').setValue(map_search_sql_statement_value);
		
		return true;
	}
	
	
}



function map_search_addRow()
{
	map_search_createSQL();
	
	var previous_criteria_count=map_search_add_criteria_count-1;
	
	if (previous_criteria_count>-1)
	{
		if (Ext.getCmp("map_search_andor_"+previous_criteria_count).getValue()=="")
		{
			Ext.getCmp("map_search_andor_"+previous_criteria_count).setValue("AND");
		}
	}
	
	var map_search_conditionRows=new Ext.Panel({
		layout:'hbox',
		border:false,
		anchor:"10",
		items:[
		{
			xtype:'label',
			text:map_search_form_criteria_label,
			style:'margin: 3',
			width:60
		},
		{
			xtype:'combo',
			loadMask:true,
			autoScroll:true,
			displayField: 'translation',
			valueField: 'name',
			id:"map_search_criteria_att_name_"+map_search_add_criteria_count,
			autoShow: true,
			store:map_search_label_values_attributes_store,
			selectOnFocus: true,
			triggerAction:'all',
			width:120,
			mode: 'remote',
			editable: false,
			listeners:{
				select:function(combo,record){
				
					var map_search_condition_new = Ext.data.Record.create([
							{name: "name", type: "string"},
							{name: "value", type: "string"},
							{name: "value_type", type: "string"}
						]);
					
					Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.removeAll();
					
					if (record.get("type")=="string")
					{
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:"=",value:"=",value_type:"string"}));
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:"LIKE",value:"LIKE",value_type:"string"}));
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:"NOT LIKE",value:"NOT LIKE",value_type:"string"}));
					}else
					{
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:"=",value:"=",value_type:"numeric"}));
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:">=",value:">=",value_type:"numeric"}));
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:">",value:">",value_type:"numeric"}));
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:"<=",value:"<=",value_type:"numeric"}));
						Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).store.add(new map_search_condition_new({name:"<",value:"<",value_type:"numeric"}));
					}
					
					Ext.getCmp("map_search_criteria_contition_"+(map_search_add_criteria_count-1)).setValue("=");
				}
			
			}
		},
		{
			xtype:'label',
			text:map_search_form_condition_label,
			style:'margin: 3',
			width:60
		},
		{
			xtype:'combo',
			loadMask:true,
			autoScroll:true,
			id:"map_search_criteria_contition_"+map_search_add_criteria_count,
			autoShow: true,
			width:50,
			store: new Ext.data.SimpleStore({
			fields: ['name','value'],
				data: []
			}), 
			displayField: 'name',
			valueField: 'value',
			emptyText:'',
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus: false,
			mode: 'local',
			editable: false
		},
		{
			xtype:'label',
			text:map_search_form_value_label,
			style:'margin: 3',
			width:40
		},
		{
			xtype:'textfield',
			id:"map_search_criteria_value_"+map_search_add_criteria_count,
			width:200
		},
		{
			xtype:'combo',
			loadMask:true,
			autoScroll:true,
			autoShow: true,
			width:50,
			store: new Ext.data.SimpleStore({
			fields: ['name','value'],
				data: [["AND","AND"],["OR","OR"]]
			}), 
			displayField: 'name',
			id:"map_search_andor_"+map_search_add_criteria_count,
			valueField: 'value',
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus: false,
			mode: 'local',
			editable: false
		},
		{
			xtype:'button',
			iconCls:'mapTree_remove16',
			handler:function()
			{
				Ext.getCmp('map_search_condition_list_id').remove(map_search_conditionRows);
				Ext.getCmp('map_search_condition_list_id').doLayout();
				map_search_add_criteria_count--;
			}
		}]
	});
	
	Ext.getCmp('map_search_condition_list_id').add(map_search_conditionRows);
	Ext.getCmp('map_search_condition_list_id').doLayout();
	
	map_search_add_criteria_count++;
}

function map_search_populateAttributeCombo()
{

	map_search_label_values_attributes_store = new Ext.data.Store({
			url:"php_source/proxies/getAttributes.php?lang="+language,
			reader: new Ext.data.JsonReader({
			root: 'rows',
			totalProperty: 'results'
			}, 
			map_search_label_values_attributes_columns
		),
		listeners: {
			beforeload: function(){
				
					this.baseParams.service = map_search_service_url;
					this.baseParams.layer = map_search_layer_basename;
					this.baseParams.service_authenication=map_search_service_authentication;
			}
		}
	});
}




function map_search_getLayers()
{
		
		map_search_searchableLayersStore=new Ext.data.SimpleStore({
			fields: ['name','value','layer_id','layer_basename','service_type','layer_crs','service_authentication','native_srs','layer_geometryField','sld_body'],
			data: []
		});
		
		mapPanel.layers.each(function(layer){
		
			var layer_id=layer.get("layer").id;
			
			var service_id=layer.get("service_id");
			
			var service_title=layer.get("layer_title");
			
			var service_name=layer.get("service_name")+"_edit";
			
			var service_type=layer.get("service_type");
			
			var source_id=layer.get("source_id");
			
			var layer_crs=layer.get("layers_crs");
			
			
			
			var service_layer=layer.get("layer");
			
			var service_version=layer.get("service_version");
			
			var layer_basename=layer.get("layers_basename");
			
			var layer_geometryField=layer.get("geom_name");
			
			var layer_icon=layer.get("icon");
			
			var native_srs=layer.get("native_srs");
			
			
			
			var layer_sld=layer.get("sld_body");
	
			var service_authentication=layer.get("service_authentication");
			
			var service_layer_id=service_layer.id+"_edit";
			
			var serviceNode_id=service_id+"_"+source_id+"_edit";
			
			if ((service_id!=null) && (service_type=="WMS") && (layer_geometryField!="") && (typeof layer_geometryField!=="undefined"))
			{
				map_search_searchableLayersStore.add(new Ext.data.Record({'name':service_title,'value':source_id,'layer_id':layer_id,'layer_basename':layer_basename,'service_type':service_type,'layer_crs':layer_crs,'service_authentication':service_authentication,'native_srs':native_srs,'layer_geometryField':layer_geometryField,"sld_body":layer_sld,"service_version":service_version}));
			}
			
		});
		
		Ext.getCmp('map_search_chooseLayer_Combo').displayField='name';
		
		Ext.getCmp('map_search_chooseLayer_Combo').valueField='value';
		
		Ext.getCmp('map_search_chooseLayer_Combo').bindStore(map_search_searchableLayersStore);
}




/************************************************************************/
/********************** Grid Results ************************************/


function map_search_show_grid_results()
{
	
	var this_count;
	
	map_search_newSearch=Ext.getCmp('map_search_check_new_id').checked;
	
	if (((!map_search_from_history) && (map_search_newSearch)) || (map_search_count==0))
	{
		map_search_count++;
		
		this_count=map_search_count;
		
		map_search_history_count=0;
		
		
	}
	else if ((!map_search_from_history) && (!map_search_newSearch)){
	
		if (map_search_history_count!=0)
		{
			this_count=map_search_history_count;
		
		}else
		{
			this_count=map_search_count;
		}
	
		
		Ext.getCmp('map_south_tabs').remove(Ext.getCmp('map_south_search_results_panel_'+this_count));
		
		
	}
	else
	{

		this_count=Number(map_search_history_count);
		
		Ext.getCmp('map_south_tabs').remove(Ext.getCmp('map_south_search_results_panel_'+this_count));
		
		
	}

	
	
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect:false});

	var map_search_resutls_columns=new Array();
	
	var map_search_xml_columns=new Array();
	
	var map_search_resutls_columns_model=new Array();
	
	var map_search_resutls_store=new Ext.data.SimpleStore({
    fields: map_search_resutls_columns,
    data :[]});
	
	map_search_resutls_columns[0]=sm;
	map_search_xml_columns[0]="";
	
	var i=0;
	
	i++;
	map_search_resutls_columns[i]={width:26, renderer:map_search_createDownloadColumnIcon,hideable: false};
	i++;
	map_search_resutls_columns[i]={width:26, renderer:map_search_createShowInfoColumnIcon,hideable: false};
	i++;
	map_search_resutls_columns[i]={width:26, renderer:map_search_createShowOnMapColumnIcon,hideable: false};

	
	var colmns=0;
	
	map_search_label_values_attributes_store.each(function(item,index){
		
		i++;
		
		map_search_resutls_columns[i]={header:item.data.translation,dataIndex:item.data.name,sortable:true};
		
		colmns++;
		
		map_search_xml_columns[colmns]={name:item.data.name};
		
	});
	
	i++;
	map_search_resutls_columns[i]={dataIndex:'featureid',hidden:true,hideable: false};
	colmns++;
	map_search_xml_columns[colmns]={name:'featureid'};
	i++;
	map_search_resutls_columns[i]={dataIndex:'grid_id',hidden:true,hideable: false};
	colmns++;
	map_search_xml_columns[colmns]={name:'grid_id',mapping:function(){return this_count;}};
	i++;
	map_search_resutls_columns[i]={dataIndex:'authentication',hidden:true,hideable: false};
	colmns++;
	map_search_xml_columns[colmns]={name:'authentication'};
	i++;
	map_search_resutls_columns[i]={dataIndex:'serviceURL',hidden:true,hideable: false};
	colmns++;
	map_search_xml_columns[colmns]={name:'serviceURL'};
	i++;
	map_search_resutls_columns[i]={dataIndex:'basename',hidden:true,hideable: false};
	colmns++;
	map_search_xml_columns[colmns]={name:'basename'};
	
	
	
	var gid='map_search_resutls_grid_'+this_count;
	
	gid=gid.toString();
	
	map_search_resutls_columns_model=new Ext.grid.ColumnModel(map_search_resutls_columns);
	
	var map_search_south_resutls_grid=new Ext.Panel({
			title: map_south_tab_search_results_title+" ("+this_count+")",
			xtype:'panel',
			id:'map_south_search_results_panel_'+this_count,
			layout: 'fit',
			closable:true,
			items:[{
						xtype:'grid',
						sm: sm,
						id:gid,
						loadMask:true,
						columnLines: true,
						ds:map_search_resutls_store,
						cm:map_search_resutls_columns_model,
						tbar:[
						{
							xtype:'label',
							id:'search_count_result_label'
						
						},
						'->',
						{
							xtype:'button',
							text:map_search_download,
							iconCls:'search_save',
							handler:function()
							{
								
								map_search_DonwloadMany(this_count);
							}
						},
						{
							xtype:'button',
							text:map_search_edit_this_search,
							iconCls:'search_edit',
							handler:function()
							{
								map_searchWindow.show();
								map_search_restoreHistoryFromId(this_count);	
							}
						}]
					}]
	});
	
	Ext.getCmp('map_south_tabs').add(map_search_south_resutls_grid);
	
	
	
	Ext.getCmp('map_south_region').expand(true);
	
	Ext.getCmp('map_south_tabs').setActiveTab('map_south_search_results_panel_'+this_count);
	
	Ext.getCmp(gid).loadMask.show();
	
	map_search_resutls_store = new Ext.data.Store({
		url: "modules/search/php/search.php",
		reader: new Ext.data.XmlReader({
		record: 'RECORD'}, map_search_xml_columns
		),
		listeners: {
			beforeload: function(){
					this.baseParams.url = map_search_service_url;
					this.baseParams.geom_field = map_search_layer_geometry_field;
					this.baseParams.layer_basename = map_search_layer_basename;
					this.baseParams.service_authenication=map_search_service_authentication;
					this.baseParams.cql = Ext.getCmp('map_search_sql_textarea').getValue();
			},
			load: function(){
				
				Ext.getCmp('search_count_result_label').setText(map_south_tab_search_count_results_title+map_search_resutls_store.getCount());
			
			}
		}
	});
			
	map_search_resutls_store.load();
	
	Ext.getCmp(gid).reconfigure(map_search_resutls_store,map_search_resutls_columns_model);
	
	map_search_saveToHistory(this_count);

	map_search_from_history=false;
	
}


function map_search_DonwloadOne(ss,grid_id)
{
	map_search_DownloadWindowSeperately=false;
	
	map_search_DownloadAuthentication="";
	
	map_search_featureid="";
	
	var cellValue=Ext.getCmp('map_search_resutls_grid_'+grid_id).getStore().getAt(ss);
	
	map_search_DownloadAuthentication=cellValue.get("authentication");
	
	map_search_DownloadServiceURL=cellValue.get('serviceURL');
	
	map_search_DownloadLayerBasename=cellValue.get('basename');
	
	map_search_DownloadFeatureId=cellValue.get('featureid');
	
	chooseDownloadType.show();
	
	return;
}

function map_search_DonwloadMany(grid_id)
{
	map_search_DownloadWindowSeperately=true;
	
	map_search_DownloadAuthentication="";
	
	map_search_DownloadFeatureId="";
	
	Ext.getCmp('map_search_resutls_grid_'+grid_id).getSelectionModel().each(function(record) {
		map_search_DownloadFeatureId+=record.get("featureid")+",";
		map_search_DownloadAuthentication=record.get("authentication");
		map_search_DownloadServiceURL=record.get('serviceURL');
		map_search_DownloadLayerBasename=record.get('basename');
	});
	
	chooseDownloadType.show();
	
	map_search_DownloadFeatureId=map_search_DownloadFeatureId.substring(0, map_search_DownloadFeatureId.length - 1);
	
	return;
}

function map_search_showInfo(ss,grid_id)
{
	var geometry_url="";
	
	var info_url="";
	
	map_search_featureid="";
	
	var cellValue=Ext.getCmp('map_search_resutls_grid_'+grid_id).getStore().getAt(ss);
	
	var featureid=cellValue.get('featureid');
	
	var authentication=fc_stringFromXML(cellValue.get('authentication'));
	
	if (authentication!="")
	{
		authentication+="&";
	}
	
	var layer_basename=cellValue.get('basename');
	
	var service_url=cellValue.get('serviceURL');
	
	var server_constructor="&"+authentication+"service=WFS&request=GetFeature&featureid="+featureid+"&outputFormat=GML2&srsName=EPSG:4326&service_layers="+layer_basename+"&service_uri="+service_url;

	var url_php_gml="php_source/proxies/proxy_gml.php?";
	
	var url_gml=url_php_gml+"gmlLang="+language+"&gmlFormat=gml&"+server_constructor;
		
	var url_geometry=url_php_gml+"gmlLang="+language+"&gmlFormat=geometry&"+server_constructor;
		
	var url_attributes=url_php_gml+"gmlLang="+language+"&gmlFormat=attributes&"+server_constructor;

	var serviceAuthentication=fc_stringFromXML(cellValue.get('authentication'));
	
	var featureObj={
		featureId:featureid,
		serviceURI:map_search_service_url,
		layerBasename:map_search_layer_basename,
		hasFId:true,
		epsg:"EPSG:4326",
		serviceType:"WFS",
		serviceVersion:"",
		url_gml:url_gml,
		url_geometry:url_geometry,
		url_attributes:url_attributes,
		serviceAuthentication:serviceAuthentication,
		layerVectorFormat:"gml"
	};
					
	windowFeatureInfo(featureObj);

}

function map_search_showOnMap(ss,grid_id)
{
	var geometry_url="";
	
	var info_url="";
	
	map_search_featureid="";
	
	var cellValue=Ext.getCmp('map_search_resutls_grid_'+grid_id).getStore().getAt(ss);
	
	var featureid=cellValue.get('featureid');
	
	var authentication=cellValue.get('authentication');
	
	var layer_basename=cellValue.get('basename');
	
	var service_url=cellValue.get('serviceURL');
	
	if (authentication!="")
	{
		authentication+="&";
	}
	
	var gml_url="php_source/proxies/proxy_wfs.php?"+authentication+"url="+Ext.urlAppend(service_url,"service=WFS&request=GetFeature&featureid="+featureid+"&outputFormat=GML2&srsName=EPSG:4326&typeName="+layer_basename);
	
	fc_showVectorOnMap(gml_url,'EPSG:4326',"gml");

}

function map_search_createDownloadColumnIcon(v, p, rec, rowIndex, colIndex, store)
{
	var grid_id=store.getAt(rowIndex).data['grid_id'];
	
	var img="<img src='images/gis_icons/save1.png' width='16' height='16' onclick=\"javascript:map_search_DonwloadOne("+rowIndex+","+grid_id+");\">";
	
	return img;

}

function map_search_createShowInfoColumnIcon(v, p, rec, rowIndex, colIndex, store)
{
	var grid_id=store.getAt(rowIndex).data['grid_id'];
	
	var img="<img src='images/gis_icons/table.png' width='16' height='16' onclick=\"javascript:map_search_showInfo("+rowIndex+","+grid_id+");\">";
	
	return img;

}

function map_search_createShowOnMapColumnIcon(v, p, rec, rowIndex, colIndex, store)
{
	var grid_id=store.getAt(rowIndex).data['grid_id'];
	
	var img="<img src='images/gis_icons/show.png' width='16' height='16' onclick=\"javascript:map_search_showOnMap("+rowIndex+","+grid_id+");\">";
	
	return img;

}


/************************************************************************/
/********************** Search History **********************************/

function map_search_saveToHistory(searchId)
{
	
	var map_search_historyArray=new Object();
	var map_search_history_criteria=new Array();

	for(var i=0;i<map_search_add_criteria_count;i++)
	{
		if (Ext.getCmp('map_search_criteria_att_name_'+i)!=undefined)
		{
			map_search_history_criteria[i]={"map_search_criteria_att_name":Ext.getCmp('map_search_criteria_att_name_'+i).getValue(),"map_search_criteria_contition":Ext.getCmp('map_search_criteria_contition_'+i).getValue(),"map_search_criteria_value":Ext.getCmp('map_search_criteria_value_'+i).getValue(),"map_search_andor":Ext.getCmp('map_search_andor_'+i).getValue()};
		}
	}
	
	var map_search_chooseLayer_Combo_history=Ext.getCmp("map_search_chooseLayer_Combo").getValue();
	var map_search_chooseLayer_Combo_history_name=Ext.getCmp("map_search_chooseLayer_Combo").getRawValue();
	var map_search_geom_criteria_history=Ext.getCmp("map_search_geom_criteria").getValue();
	var map_search_sql_textarea_history=Ext.getCmp("map_search_sql_textarea").getValue();
	var map_search_synch_with_map_id_history=Ext.getCmp("map_search_synch_with_map_id").checked;
	var map_search_dynamic_search_id_history=Ext.getCmp("map_search_dynamic_search_id").checked;
	var map_search_service_authentication_history=map_search_service_authentication;
	
	map_search_historyArray={"history_id":searchId,"map_search_geometry_field":map_search_layer_geometry_field,"url_layer":map_search_service_url,"basename_layer":map_search_layer_basename,"map_search_criteria":map_search_history_criteria,"map_search_chooseLayer_Combo":map_search_chooseLayer_Combo_history,"map_search_chooseLayer_Combo_name":map_search_chooseLayer_Combo_history_name,"map_search_geom_criteria":map_search_geom_criteria_history,"map_search_sql_textarea":map_search_sql_textarea_history,"map_search_synch_with_map_id":map_search_synch_with_map_id_history,"map_search_dynamic_search_id":map_search_dynamic_search_id_history,"map_search_geom":map_search_geometry,"map_search_service_authentication":map_search_service_authentication_history};
	
	var jsonCriteria=Ext.util.JSON.encode(map_search_historyArray);
	
	var map_search_history_record = Ext.data.Record.create([
					{name: "history_id", type: "string"},
					{name: "basename_layer", type: "string"},
					{name: "url_layer", type: "string"},
					{name: "cql_text", type: "string"},
					{name: "json_Criteria", type: "string"},
					{name: "service_Authentication", type:"string"}
				]);
				
	Ext.each(map_search_history_store.data.items,function(item,index){
										
		if (item)
		{
			if (item.get('history_id')==searchId)
			{
				var  toBeDeleted=map_search_history_store.getAt(index);
											
				map_search_history_store.remove(toBeDeleted);
												
				map_search_history_store.commitChanges();
			}
		}
	});
	
	var record = new map_search_history_record({history_id:searchId,basename_layer:map_search_layer_basename,service_Authentication:map_search_service_authentication_history,url_layer:map_search_service_url,cql_text:map_search_sql_textarea_history,json_Criteria:jsonCriteria});
	
	map_search_history_store.add(record);
	
	return;
}

function map_search_removeHistory()
{

	Ext.getCmp('map_search_history_grid_id').getSelectionModel().each(function(record,index) {
	
		Ext.getCmp('map_south_tabs').remove(Ext.getCmp("map_south_search_results_panel_"+record.get("history_id")));
		
		Ext.getCmp('map_search_history_grid_id').store.remove(record);
	
	});

	Ext.getCmp('map_search_history_grid_id').getSelectionModel().clearSelections();
}

function map_search_restoreHistoryFromId(searchId)
{

		Ext.getCmp('map_search_history_grid_id').store.each(function(record,index) {
		
			var jsonCriteria=Ext.util.JSON.decode(record.get("json_Criteria"));
			
			if (jsonCriteria.history_id==searchId)
			{
				map_search_service_url=jsonCriteria.url_layer;
				map_search_layer_basename=jsonCriteria.basename_layer;
				map_search_layer_geometry_field=jsonCriteria.map_search_geometry_field;
				map_search_service_authentication=jsonCriteria.map_search_service_authentication;
				
				map_search_populateAttributeCombo();
				map_search_label_values_attributes_store.load();
				
				Ext.getCmp("map_search_synch_with_map_id").setValue(jsonCriteria.map_search_synch_with_map_id);
				Ext.getCmp("map_search_dynamic_search_id").setValue(jsonCriteria.map_search_synch_with_map_id);
				map_search_add_criteria_count=0;
				Ext.getCmp('map_search_condition_list_id').removeAll();
				
				map_search_history_count=Number(jsonCriteria.history_id);
				
				var i=0;
				
				for(var k in jsonCriteria.map_search_criteria)
				{
					if ((k.toString()!="remove") && (k.toString()!="containsVal"))
					{
						map_search_addRow();
						Ext.getCmp('map_search_criteria_att_name_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_criteria_att_name);
						Ext.getCmp('map_search_criteria_contition_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_criteria_contition);
						Ext.getCmp('map_search_criteria_value_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_criteria_value);
						Ext.getCmp('map_search_andor_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_andor);
						i++;
					}
				}
				
				Ext.getCmp("map_search_chooseLayer_Combo").setValue(jsonCriteria.map_search_chooseLayer_Combo_name);
			
				Ext.getCmp('map_search_sql_textarea').setValue(jsonCriteria.map_search_sql_textarea);
				
				map_search_from_history=true;

				Ext.getCmp('map_search_tabpanel_id').setActiveTab('map_search_form_tab_id');
				
				Ext.getCmp('map_search_condition_list_id').expand(true);
			}
		});
		
		
}

function map_search_restoreHistory()
{
	if (Ext.getCmp('map_search_history_grid_id').getSelectionModel().getSelections().length==1)
	{
		Ext.getCmp('map_search_history_grid_id').getSelectionModel().each(function(record,index) {
		
			var jsonCriteria=Ext.util.JSON.decode(record.get("json_Criteria"));
			
			map_search_service_url=jsonCriteria.url_layer;
			map_search_layer_basename=jsonCriteria.basename_layer;
			map_search_layer_geometry_field=jsonCriteria.map_search_geometry_field;
			map_search_service_authentication=jsonCriteria.map_search_service_authentication;
			
			map_search_populateAttributeCombo();
			map_search_label_values_attributes_store.load();
			
			Ext.getCmp("map_search_synch_with_map_id").setValue(jsonCriteria.map_search_synch_with_map_id);
			Ext.getCmp("map_search_dynamic_search_id").setValue(jsonCriteria.map_search_synch_with_map_id);
			map_search_add_criteria_count=0;
			Ext.getCmp('map_search_condition_list_id').removeAll();
			
			map_search_history_count=Number(jsonCriteria.history_id);
			
			var i=0;
			
			for(var k in jsonCriteria.map_search_criteria)
			{
				if ((k.toString()!="remove") && (k.toString()!="containsVal"))
				{
					map_search_addRow();
					Ext.getCmp('map_search_criteria_att_name_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_criteria_att_name);
					Ext.getCmp('map_search_criteria_contition_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_criteria_contition);
					Ext.getCmp('map_search_criteria_value_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_criteria_value);
					Ext.getCmp('map_search_andor_'+i).setValue(jsonCriteria.map_search_criteria[k].map_search_andor);
					i++;
				}
			}
			
			Ext.getCmp("map_search_chooseLayer_Combo").setValue(jsonCriteria.map_search_chooseLayer_Combo_name);
		
			Ext.getCmp('map_search_sql_textarea').setValue(jsonCriteria.map_search_sql_textarea);
			
		});
		
		map_search_from_history=true;

		Ext.getCmp('map_search_tabpanel_id').setActiveTab('map_search_form_tab_id');
		
		Ext.getCmp('map_search_condition_list_id').expand(true);
		
	}else
	{
		Ext.Msg.alert(map_search_history_restore_many_err_title, map_search_history_restore_many_err);
	}
	
}
