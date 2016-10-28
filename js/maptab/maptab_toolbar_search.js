var maptab_toolbar_search_controls;
var maptab_toolbar_search_draw_layer;
var maptab_toolbar_search_attribute_mode=false;

var maptab_search_geometry_criteria_store=new Ext.data.SimpleStore({
	fields: ['value','name'],
	data: [
		["INTERSECTS",_maptab_search_geometry_criteria_intersects],
		["WITHIN",_maptab_search_geometry_criteria_within]
	],
	autoLoad:true
});

function init_maptab_toolbar_search_controls()
{

	maptab_toolbar_search_draw_layer=new OpenLayers.Layer.Vector("maptab_toolbar_search_vector");

	map.addLayer(maptab_toolbar_search_draw_layer);
		
	maptab_toolbar_search_draw_layer.events.register('beforefeatureadded', ' ', function(){maptab_toolbar_search_draw_layer.removeAllFeatures();});
	
	maptab_toolbar_search_controls=
	{
		drawline: new OpenLayers.Control.DrawFeature(
			maptab_toolbar_search_draw_layer,
			OpenLayers.Handler.Path,
			{
				featureAdded:function(evt)
				{
					if (!maptab_toolbar_search_attribute_mode)
					{
						fn_toolbar_search_create_request();
					}
				}
			}
		),
		drawpolygon: new OpenLayers.Control.DrawFeature(
			maptab_toolbar_search_draw_layer,
			OpenLayers.Handler.Polygon,
			{
				featureAdded:function(evt)
				{
					if (!maptab_toolbar_search_attribute_mode)
					{
						fn_toolbar_search_create_request();
					}
				}
			}
		),
		drawcircle: new OpenLayers.Control.DrawFeature(
			maptab_toolbar_search_draw_layer,
			OpenLayers.Handler.RegularPolygon,
			{
				handlerOptions:
				{
					sides: 40,
					irregular: false
				},
				featureAdded:function(evt)
				{
					if (!maptab_toolbar_search_attribute_mode)
					{
						fn_toolbar_search_create_request();
					}
				}
			}
		),
		drawrectangle: new OpenLayers.Control.DrawFeature(
			maptab_toolbar_search_draw_layer,
			OpenLayers.Handler.RegularPolygon,
			{
				handlerOptions:
				{
					sides: 4,
					irregular: true
				},
				featureAdded:function(evt)
				{
					if (!maptab_toolbar_search_attribute_mode)
					{
						fn_toolbar_search_create_request();
					}
				}
			}
		)
	}
		
	for(var key in maptab_toolbar_search_controls)
	{
		mapRemoveControl(maptab_toolbar_search_controls[key]);
		
		mapAddControl(maptab_toolbar_search_controls[key]);
		
	}
}

var maptab_toolbar_search=[
	{
		xtype:'button',
		id:'maptab_toolbar_general_featureInfo', 
		iconCls:'maptab_toolbar_general_featureInfo',
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_general_featureInfo,
		//text:_maptab_toolbar_general_featureInfo,
		enableToggle: true,
		toggleHandler:function(item,state){
			map_controls_featureInfo(state);
		}
	},
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		id:'maptab_toolbar_search_polygon',
		iconCls:'maptab_toolbar_search_polygon',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_search_polygon,
		toggleHandler:function(item,state){
		
			if (state)
			{
				
				maptab_toolbar_search_attribute_mode=false;
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().removeAll();
				
				var data=[
					["INTERSECTS",_maptab_search_geometry_criteria_intersects],
					["WITHIN",_maptab_search_geometry_criteria_within]
				];
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().loadData(data);
				
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").setValue("INTERSECTS");
				
			}else
			{
				fn_toolbar_search_clear_drawings();
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().removeAll();
			}

			fn_toggleControl('drawpolygon',state,maptab_toolbar_search_controls);
		}
	},
	{
		xtype:'button',
		id:'maptab_toolbar_search_line',
		iconCls:'maptab_toolbar_search_line',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_search_line,
		toggleHandler:function(item,state){
		
			fn_toggleControl('drawline',state,maptab_toolbar_search_controls);
		
			if (state)
			{
				
				maptab_toolbar_search_attribute_mode=false;
				
				maptab_search_geometry_criteria_store.removeAll();
				
				var data=[
					["CROSSES",_maptab_search_geometry_criteria_crosses],
					["INTERSECTS",_maptab_search_geometry_criteria_intersects]
				];
				
				maptab_search_geometry_criteria_store.loadData(data);
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").setValue("INTERSECTS");
				
			}else
			{
				fn_toolbar_search_clear_drawings();
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().removeAll();
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").setValue("INTERSECTS");
				
			}
			
		}
	},
	{
		xtype:'button',
		id:'maptab_toolbar_search_rectangle',
		iconCls:'maptab_toolbar_search_rectangle',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_search_rectangle,
		toggleHandler:function(item,state){
		
			if (state)
			{
				maptab_toolbar_search_attribute_mode=false;
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().removeAll();
				
				var data=[
					["INTERSECTS",_maptab_search_geometry_criteria_intersects],
					["WITHIN",_maptab_search_geometry_criteria_within]
				];
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().loadData(data);
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").setValue("INTERSECTS");
				
			}else
			{
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().removeAll();
				
				fn_toolbar_search_clear_drawings();
			}
			
			fn_toggleControl('drawrectangle',state,maptab_toolbar_search_controls);
		}
	},
	{
		xtype:'button',
		id:'maptab_toolbar_search_circle',
		iconCls:'maptab_toolbar_search_circle',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_search_circle,
		toggleHandler:function(item,state){
		
			if (state)
			{
				maptab_toolbar_search_attribute_mode=false;
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().removeAll();
				
				var data=[
					["INTERSECTS",_maptab_search_geometry_criteria_intersects],
					["WITHIN",_maptab_search_geometry_criteria_within]
				];
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().loadData(data);
				
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").setValue("INTERSECTS");
				
			}else
			{
				Ext.getCmp("maptab_toolbar_search_geometry_criteria").getStore().removeAll();
			
				fn_toolbar_search_clear_drawings();
			}
			
			fn_toggleControl('drawcircle',state,maptab_toolbar_search_controls);
		}
	},
	{
		xtype:'combo',
		loadMask:true,
		width:120,
		id:'maptab_toolbar_search_geometry_criteria',
		emptyText:_maptab_search_geometry_criteria_intersects,
		value:"INTERSECTS",
		store: maptab_search_geometry_criteria_store, 
		displayField: 'name',
		valueField: 'value',
		forceSelection: true,
		selectOnFocus: false,
		queryMode: 'local',
		editable: false,
		listeners: {render: function(e) {this.getStore().load();}}
	},
	{xtype:'tbseparator'},
	{
		xtype:'button',
		id:'maptab_toolbar_search_clear',
		iconCls:'maptab_toolbar_search_clear',
		tooltip:_maptab_toolbar_search_clear,
		handler:function(){
			fn_toolbar_search_clear_drawings();
		}
	},
	{
		xtype:'label',
		id:'maptab_toolbar_search_label',
		html:'',
		hidden:true
	}
];

function fn_toolbar_search_fetch_search_geometry(_layerId,_geometryCriteria)
{
	var _layer=mapFindLayerById(_layerId);

	var _lastFeatureCount=(maptab_toolbar_search_draw_layer.features.length-1);
	
	var _cloneFeature=maptab_toolbar_search_draw_layer.features[_lastFeatureCount].clone();
			
	var _featureGeometry=_cloneFeature.geometry;
		
	if (mapGetCurrentProjection()!=mapGetProjectionCode(_layer._layerObject._nativeSRS))
	{
		_featureGeometry=_featureGeometry.transform(new OpenLayers.Projection(mapGetCurrentProjection()), new OpenLayers.Projection(_layer._layerObject._nativeSRS)).toString();
	}
	
	if (_layer._layerObject._xy==false)
	{
		_featureGeometry=fn_reverseAxis(_featureGeometry);
	}
	
	var _cqlFilter=_geometryCriteria+"("+_layer._layerObject._geometryField+","+_featureGeometry+")";

	return _cqlFilter;
}

function fn_toolbar_search_create_request()
{
	Ext.getCmp("maptab_toolbar_search_label").update("<img src=\""+host+"/images/loading.gif\" align=\"middle\">");

	var overlayers=mapGetlayersBy("isBaseLayer",false);
	
	var _queryObject=new Array();
	
	for(var i=overlayers.length-1;i>=0;i--)
	{
		var _layer=overlayers[i];
		
		if ((_layer._layerObject._isSearchable==true) && (_layer._layerObject._visibility==true))
		{
			var _cqlFilter=fn_toolbar_search_fetch_search_geometry(_layer._layerObject._layerId,Ext.getCmp("maptab_toolbar_search_geometry_criteria").getValue());
			
			var _servicePort = "";
			
			if (typeof _layer._serviceObject._servicePort!=="undefined")
			{
				_servicePort = _layer._serviceObject._servicePort;
			}
			
			_queryObject.push({
				_layerId:_layer._layerObject._layerId,
				_serviceType:_layer._serviceObject._serviceType,
				_servicePort:_servicePort,
				_serviceName:_layer._serviceObject._serviceName,
				_username:_layer._serviceObject._username,
				_serviceUrl:_layer._serviceObject._serviceUrl,
				_password:_layer._serviceObject._password,
				_layerName:_layer._layerObject._layerName,
				_version:_layer._serviceObject._version,
				_isService:_layer._serviceObject._isService,
				_featureType:_layer._layerObject._featureType,
				_geometryField:_layer._layerObject._geometryField,
				_cqlFilter:_cqlFilter,
				_geomFilter:_cqlFilter,
				_nativeSRS:_layer._layerObject._nativeSRS,
				_featureInfoFormat:_layer._serviceObject._featureInfoFormat,
				_request:"search"
			});
		}
	}
	
	var p=new fn_get();
	
	p._async=true;
	
	p._data=_queryObject;
		
	p._timeout=15000;
	
	p._success=function(_response, _opts)
	{		
		
		maptab_search_results_count++;
		
		var _response=Ext.JSON.decode(_response.responseText)
		
		Ext.each(_response,function(item)
		{
			var _data=new Array();
		
			if ((item._errorStatus==-1) && (item._response._attributes.length>0))
			{
				var r=new fn_toolbar_search_create_panel_results_grid(item._response._layerId);
				
				fn_grid_results_ids_array.push(r.id);
				
				r.setTitle(mapFindLayerById(item._response._layerId)._layerObject._layerTitle + " ("+mapFindLayerById(item._response._layerId)._serviceObject._serviceType+")"+" "+maptab_search_results_count);
				
				Ext.getCmp("maptab_south").expand();
	
				Ext.getCmp("maptab_south_tabpanel").add(r);
				
				Ext.getCmp("maptab_south_tabpanel").setActiveTab(r);
				
				//var mask=fn_loadingMask(r,_mask_loading_message_default);
				
				//mask.show();
		
				Ext.each(item._response._attributes,function(record)
				{
					_data.push(record[0]);
					
				});
				
				r.getStore().loadData(_data);
				
				_data=null;
				
				var _f=r.getDockedItems('toolbar[dock="top"]')[0].items.items;
				
				_f[0].setText(mapFindLayerById(item._response._layerId)._layerObject._layerTitle + " ("+mapFindLayerById(item._response._layerId)._serviceObject._serviceType+")");
				
				_f[2].setText(_maptab_east_search_results_count_text+r.getStore().getCount());
				
				_f[4].setText(_maptab_east_search_results_selected_count_text+r.getSelectionModel().getSelection().length);
				
				//mask.hide();
				
			}
		});
		
		Ext.getCmp("maptab_toolbar_search_label").update("");
	};
	
	p._failure=function(_response, _opts)
	{
		Ext.getCmp("maptab_toolbar_search_label").update("");
		
	}
	
	p.get();
}

function fn_toolbar_search_clear_drawings()
{
	Ext.getCmp("maptab_toolbar_search_label").update("");

	maptab_toolbar_search_draw_layer.removeAllFeatures();
}



function fn_toolbar_search_create_panel_results_grid(_layerId)
{
	var _attributesFields=mapFindLayerById(_layerId)._layerObject._attributesFields;

	var toolbar_search_create_panel_results_grid_tbar=fn_createFetureGridTopBar();

	toolbar_search_create_panel_results_grid_tbar.unshift(
	{xtype:'label'},
	{xtype:'tbseparator'},
	{xtype:'label'},
	{xtype:'tbseparator'},
	{xtype:'label'});
	
	var g=Ext.create('Ext.grid.Panel',
	{
		border:false,
		columnLines:true,
		closable:true,
		enableColumnMove:mapFindLayerById(_layerId)._layerObject._attributesReorder,
		_layerId:_layerId,
		title:_maptab_east_search_results,
		selModel: Ext.create('Ext.selection.CheckboxModel',{mode:'SIMPLE',checkOnly:true}),
		store:fn_createAttributesStore(fn_featureColumnModelForGrid(_attributesFields)),
		columns:fn_createAttributesColumnModel(fn_featureColumnModelForGrid(_attributesFields)),
		tbar:toolbar_search_create_panel_results_grid_tbar,
		listeners:{
			show:function()
			{
				var _f=g.getDockedItems('toolbar[dock="top"]')[0].items.items;
				
				_f[4].setText(_maptab_east_search_results_selected_count_text+g.getSelectionModel().getSelection().length);
			},
			select:function(row, record, index, eOpts)
			{
				var _feature=fn_featureObject(record);
				
				fn_featureHighlight(_feature._featureId,_feature._layerId,_feature._srsName,_feature._featureUrl,_feature._featureGeomFormat,'');
				
				fn_toggleHightlightFromAllResultsGrids(_feature._featureId,_feature._layerId,g.id);
				
				var _f=g.getDockedItems('toolbar[dock="top"]')[0].items.items;
				
				_f[4].setText(_maptab_east_search_results_selected_count_text+g.getSelectionModel().getSelection().length);
			},
			deselect:function(row, record, index, eOpts)
			{
				var _feature=fn_featureObject(record);
				
				fn_featureUnHiglighted(_feature._featureId,_feature._layerId);
				
				fn_toggleHightlightFromAllResultsGrids(_feature._featureId,_feature._layerId,g.id);
				
				var _f=g.getDockedItems('toolbar[dock="top"]')[0].items.items;
				
				_f[4].setText(_maptab_east_search_results_selected_count_text+g.getSelectionModel().getSelection().length);
			},
			beforeclose:function(grid, eOpts)
			{
				Ext.Array.remove(fn_grid_results_ids_array,g.id);
					
				Ext.Array.clean(fn_grid_results_ids_array);
			
				grid.store.each(function(item){
					
					if(fn_featureIsHiglighted(item.get("_featureId"),item.get("_layerId")))
					{
						fn_featureUnHiglighted(item.get("_featureId"),item.get("_layerId"));
						
						fn_toggleHightlightFromAllResultsGrids(item.get("_featureId"),item.get("_layerId"),g.id);
					}
				});
			},
			viewready:function(grid, eOpts)
			{
				grid.store.each(function(item){
					
					if(fn_featureIsHiglighted(item.get("_featureId"),item.get("_layerId")))
					{
						grid.getSelectionModel().select(item,true,true);
					}
				});
				
				var _f=g.getDockedItems('toolbar[dock="top"]')[0].items.items;
				
				_f[4].setText(_maptab_east_search_results_selected_count_text+g.getSelectionModel().getSelection().length);
			}
		}
	});
	
	return g;
}