var maptab_edit_controls;
var maptab_edit_layer;
var maptab_edit_snapping_layers;
var maptab_edit_onselect_mode=true;
var maptab_edit_feature_has_changed=false;
var maptab_edit_selected=[];
var maptab_edit_new_featureid_count=0;

var maptab_edit_features_before_edit;
var maptab_edit_features_after_edit;
var maptab_edit_active_control="";
var maptab_edit_selectedFeatures=[];

var maptab_edit_undo_redo_drawing_control="";

function maptab_edit_controls_init()
{
	var _layerId=Ext.getCmp('maptab_toolbar_edit_choose_layer').getValue();
	
	maptab_west_layer_check_node(maptab_west_layer_get_node_from_id(_layerId),true);
	
	if(maptab_edit_layer)
	{
		maptab_edit_layer._layerObject._isEdited=false;
		
		maptab_edit_layer.events.remove("beforefeaturemodified");
		
		maptab_edit_layer.events.remove("featuremodified");
		
		maptab_edit_layer.events.remove("beforefeaturesadded");
		
		maptab_edit_layer.events.remove("featuresadded");
		
		maptab_edit_layer.events.remove("beforefeaturesremoved");
		
		maptab_edit_layer.events.remove("featuresremoved");
		
		maptab_edit_layer.events.remove("beforefeaturesadded");
		
		maptab_edit_controls.selectfeaturebybox.unselectAll();
		
		maptab_edit_controls.selectfeaturebypoint.unselectAll();
		
		Ext.getCmp("maptab_toolbar_edit_select_by_point").toggle(false);
		
		Ext.getCmp("maptab_toolbar_edit_select_by_box").toggle(false);
		
		maptab_edit_controls["snapping"].deactivate();
	
	}
	
	maptab_edit_layer=mapFindLayerById(_layerId);
	
	maptab_edit_layer.strategies[0].deactivate();
	
	maptab_edit_layer._layerObject._isEdited=true;
	
	var _isMulti=maptab_edit_layer._layerObject._geometryIsMulti;
	
	maptab_edit_controls={
		snapping:new OpenLayers.Control.Snapping({
			layer:maptab_edit_layer,
			greedy:true
		}),
		drawpoint: new OpenLayers.Control.DrawFeature(
			maptab_edit_layer,
			OpenLayers.Handler.Point,
			{
				featureAdded:function(evt)
				{
					maptab_edit_features_before_edit="";
				
					maptab_edit_active_control="_drawpoint";
				
					evt.fid=maptab_edit_return_new_featureid();
				
					maptab_edit_features_after_edit=maptab_edit_features_assign([evt]);
					
					maptab_edit_add_to_history();
					
					maptab_edit_controls.selectfeaturebybox.unselectAll();
					
					maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,evt.fid));
					
					fn_callFeatureFnFromGrid(evt.fid,maptab_edit_layer._layerObject._layerId,maptab_edit_layer._layerObject._nativeSRS,"","","getInfo");
				},
				multi:_isMulti
			}
		),
		drawline: new OpenLayers.Control.DrawFeature(
			maptab_edit_layer,
			OpenLayers.Handler.Path,
			{
				featureAdded:function(evt)
				{
					maptab_edit_features_before_edit="";
				
					maptab_edit_active_control="_drawline";
				
					evt.fid=maptab_edit_return_new_featureid();
				
					maptab_edit_features_after_edit=maptab_edit_features_assign([evt]);
					
					maptab_edit_add_to_history();
					
					maptab_edit_controls.selectfeaturebybox.unselectAll();
					
					maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,evt.fid));
					
					fn_callFeatureFnFromGrid(evt.fid,maptab_edit_layer._layerObject._layerId,maptab_edit_layer._layerObject._nativeSRS,"","","getInfo");
				},
				multi:_isMulti
			}
		),
		drawpolygon: new OpenLayers.Control.DrawFeature(
			maptab_edit_layer,
			OpenLayers.Handler.Polygon,
			{
				featureAdded:function(evt)
				{
					maptab_edit_features_before_edit="";
				
					maptab_edit_active_control="_drawpolygon";
				
					evt.fid=maptab_edit_return_new_featureid();
				
					maptab_edit_features_after_edit=maptab_edit_features_assign([evt]);
				
					maptab_edit_add_to_history();
					
					maptab_edit_controls.selectfeaturebybox.unselectAll();
					
					maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,evt.fid));
					
					fn_callFeatureFnFromGrid(evt.fid,maptab_edit_layer._layerObject._layerId,maptab_edit_layer._layerObject._nativeSRS,"","","getInfo");
				},
				handlerOptions:
				{
					holeModifier: "ctrlKey"
					
				},
				multi:_isMulti
			}
		),
		drawbox: new OpenLayers.Control.DrawFeature(
			maptab_edit_layer,
			OpenLayers.Handler.RegularPolygon,
			{
				handlerOptions:
				{
					sides: 4,
					irregular: true
				}
			}
		),
		selectfeaturebypoint:new OpenLayers.Control.SelectFeature(
			maptab_edit_layer,
			{
				clickout: true,
				multiple: false,
				multipleKey:"ctrlKey",
				toggleKey: "ctrlKey",
				onSelect:maptab_edit_onselect,
				onUnselect:maptab_edit_onselect
			}
		),
		selectfeaturebybox:new OpenLayers.Control.SelectFeature(
			maptab_edit_layer,
			{
				clickout: true,
				multiple: false,
				toggleKey: "ctrlKey",
				toggle:true,
				box:true,
				onSelect:maptab_edit_onselect,
				onUnselect:maptab_edit_onselect
			}
		),
		hoverfeature:new OpenLayers.Control.SelectFeature(
			maptab_edit_layer,
			{
				renderIntent: "temporary",
				highlightOnly: true,
				hover: true
			}
		),
		modifyfeature: new OpenLayers.Control.ModifyFeature(
			maptab_edit_layer,
			{
				clickout: true,
				standalone:false,
				toggle:false,
				mode:OpenLayers.Control.ModifyFeature.RESHAPE
			}
		),
		movefeature: new OpenLayers.Control.ModifyFeature(
			maptab_edit_layer,
			{
				clickout: true,
				standalone:true,
				mode:OpenLayers.Control.ModifyFeature.DRAG,
				dragComplete:function(evt)
				{
					maptab_edit_selectedFeatures=maptab_edit_clone_selected();
					
					maptab_edit_populate_selected_grid();
				}
			}
		),
		splitfeature:new OpenLayers.Control.DrawFeature(
			maptab_edit_layer,
			OpenLayers.Handler.Path,
			{
				featureAdded:fn_maptab_toolbar_edit_split
			}
		)
	}
	
	for(var key in maptab_edit_controls)
	{
		mapRemoveControl(maptab_edit_controls[key]);
		
		mapAddControl(maptab_edit_controls[key]);
		
	}

	
	if (Ext.getCmp("maptab_edit_selected_tabpanel"))
	{
		Ext.getCmp("maptab_edit_selected_tabpanel").getStore().removeAll();
		
		Ext.getCmp("maptab_south_tabpanel").remove(Ext.getCmp("maptab_edit_selected_tabpanel"));
		
	}
	
	maptab_edit_select_features_grid();
	
	
	maptab_toolbar_edit_toggle_btns_one_features_allowed();
	
	maptab_toolbar_edit_toggle_btns_multiple_features_allowed();
	
	maptab_edit_selectedFeatures=[];
	
	maptab_edit_clear_history();
	
	maptab_edit_layer.events.on({
		"beforefeaturemodified":function(evt)
		{
			maptab_edit_features_before_edit=maptab_edit_features_assign([evt.feature]);
		},
		"featuremodified":function(evt)
		{
			maptab_edit_features_after_edit=maptab_edit_features_assign([evt.feature]);
			
			maptab_edit_add_to_history();
			
			maptab_edit_features_before_edit=maptab_edit_features_assign([evt.feature]);
		},
		"afterfeaturemodified":function(evt)
		{
			maptab_edit_features_before_edit="";
			
			maptab_edit_features_after_edit="";
		}
		
	});
	
	maptab_edit_controls["snapping"].activate();
	
	
	
}

function maptab_edit_active_trace()
{
	if (maptab_edit_layer._layerObject._canTrace)
	{
		map.events.unregister("mousedown",map,maptab_edit_active_trace);
		
		map.events.register("mouseup",map,maptab_edit_deactive_trace,true);
		
		maptab_edit_controls["drawpolygon"].handler.freehand=true;
	}
}

function maptab_edit_deactive_trace()
{
	if (maptab_edit_layer._layerObject._canTrace)
	{
		map.events.unregister("mouseup",map,maptab_edit_deactive_trace);
	
		map.events.register("mousedown",map,maptab_edit_active_trace,true);
		
		maptab_edit_controls["drawpolygon"].handler.freehand=false;
	}
}


function fn_maptab_edit_init_edit_from_grid(_layerId,_features)
{
	Ext.getCmp("maptab_toolbar_edit_choose_layer").setValue(_layerId);
	
	maptab_edit_controls_init();
	
	init_maptab_west_edit_settings_snapping_controls();
	
	maptab_edit_selectedFeatures=[];
	
	maptab_toolbar_edit_activate_btns();
	
	maptab_edit_controls.selectfeaturebybox.unselectAll();
	
	maptab_edit_onselect_mode=false;
	
	Ext.each(_features, function (item) 
	{
		maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(_layerId,item));
	});
	
	maptab_edit_selectedFeatures=maptab_edit_clone_selected();
	
	maptab_edit_populate_selected_grid();
	
	Ext.getCmp("maptab_north_tabpanel").setActiveTab("maptab_toolbar_edit_tab");
	
	Ext.getCmp("maptab_south_tabpanel").setActiveTab("maptab_edit_selected_tabpanel");
	
	Ext.getCmp("maptab_toolbar_search_circle").toggle(true);
	
	Ext.getCmp("maptab_toolbar_search_circle").toggle(false);
	
	fn_toolbar_search_clear_drawings();

}

function maptab_edit_features_assign(_feature)
{
	
	if(typeof _feature  === 'string' )
	{
		return "";
		
	}else
	{
		var _features=[];
	
		for(var i=0;i<_feature.length;i++)
		{
			var _f=_feature[i].clone();
			
			if(typeof _feature[i].attributes!=="undefined")
			{
				if (_feature[i].attributes!=null)
				{
					_f.attributes=clone(_feature[i].attributes);
				}
			}
			
			_f.fid=_feature[i].fid;
			
			_features.push(_f);
			
		}
	
		return _features;
	}
}


function maptab_edit_clone_selected()
{
	var selectedFeatures=mapSelectedFeatures(maptab_edit_layer._layerObject._layerId);
	
	var _features=[];
	
	var _fids=[];
	
	for(var i=0;i<selectedFeatures.length;i++)
	{
		if (Ext.Array.contains(_fids,selectedFeatures[i].fid)==false)
		{
			_fids.push(selectedFeatures[i].fid);
		
			var _f=selectedFeatures[i].clone();
		
			_f.attributes=selectedFeatures[i].attributes;
			
			_f.fid=selectedFeatures[i].fid;
			
			_f.state=selectedFeatures[i].state;
			
			_features.push(_f);
		}
	}
	
	return _features;
}


function maptab_edit_onselect()
{
	
	if (maptab_edit_onselect_mode==false)
	{
		return;
	}

	maptab_edit_selectedFeatures=maptab_edit_clone_selected();
	
	maptab_edit_populate_selected_grid();
}

function maptab_edit_populate_selected_grid()
{
	Ext.getCmp("maptab_edit_selected_tabpanel").getStore().removeAll();
	
	for(var i=0;i<maptab_edit_selectedFeatures.length;i++)
	{
		var _feature=maptab_edit_selectedFeatures[i];
		
		var att=clone(_feature.attributes);
		
		if ((typeof att=="undefined") || (att==null))
		{
			att={};
		}
		
		att._layerId=maptab_edit_layer._layerObject._layerId;
		
		att._featureId=_feature.fid;
		
		att._srsName=mapFindLayerById(maptab_edit_layer._layerObject._layerId)._layerObject._nativeSRS;
		
		att._featureUrl="";
		
		att._featureGeomFormat="";
		
		Ext.getCmp("maptab_edit_selected_tabpanel").getStore().add(att);

	}
	
	maptab_toolbar_edit_toggle_btns_one_features_allowed();
	
	maptab_toolbar_edit_toggle_btns_multiple_features_allowed();
}

function maptab_edit_select_features_grid()
{
	var _attributesFields=mapFindLayerById(maptab_edit_layer._layerObject._layerId)._layerObject._attributesFields;

	var g=Ext.create('Ext.grid.Panel',
	{
		border:false,
		columnLines:true,
		enableColumnMove:mapFindLayerById(maptab_edit_layer._layerObject._layerId)._layerObject._attributesReorder,
		viewConfig: {
			plugins: [
				Ext.create('Ext.grid.plugin.DragDrop', {
					ptype: 'gridviewdragdrop'
				})
			]
		},
		id:'maptab_edit_selected_tabpanel',
		closable:false,
		title:_maptab_edit_selected_tabpanel,
		selModel: Ext.create('Ext.selection.CheckboxModel',{
			mode: 'SIMPLE',
			listeners: {
				select: function(model, records) {
				
					maptab_edit_onselect_mode=false;
				
					maptab_edit_controls.selectfeaturebybox.unselectAll();
					
					maptab_edit_controls.selectfeaturebypoint.unselectAll();
					
					var selected=Ext.getCmp('maptab_edit_selected_tabpanel').getSelectionModel().getSelection();
					
					Ext.each(selected, function (item) 
					{
						maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,item.data._featureId));
						
					});
					
					maptab_edit_selectedFeatures=maptab_edit_clone_selected();
					
					maptab_toolbar_edit_toggle_btns_one_features_allowed();
	
					maptab_toolbar_edit_toggle_btns_multiple_features_allowed();
					
					maptab_edit_onselect_mode=true;
				}
			}
		}),
		store:fn_createAttributesStore(fn_featureColumnModelForGrid(_attributesFields)),
		columns:fn_createAttributesColumnModel(fn_featureColumnModelForGrid(_attributesFields)),
		tbar:fn_createFetureGridTopBar()
	});
	
	
	Ext.getCmp("maptab_south").expand();
	
	Ext.getCmp("maptab_south_tabpanel").insert(1,g);
	
	Ext.getCmp("maptab_south_tabpanel").setActiveTab(g);
	
}

function fn_maptab_toolbar_edit_copy()
{
	for(var i=0;i<maptab_edit_selectedFeatures.length;i++)
	{

		var _theFeature=maptab_edit_selectedFeatures[i].clone();
	
		var _featureId=maptab_edit_selectedFeatures[i].fid;
		
		var _layerId=maptab_edit_layer._layerObject._layerId;

		var _r=maptab_east_edit_copy_panel_grid.getStore().findRecord('_featureId', _featureId);
	
		if(!_r)
		{
			maptab_east_edit_copy_panel_grid_add_record(_featureId,_layerId,"","",_theFeature);
		}
	}
}

function fn_maptab_toolbar_edit_paste()
{
	var _selected=maptab_east_edit_copy_panel_grid.getSelectionModel().getSelection();
				
	Ext.each(_selected,function(item)
	{
		var _theFeature=item.get("_theFeature");
	
		_theFeature.fid=maptab_edit_return_new_featureid();
		
		_theFeature.state = OpenLayers.State.INSERT;
	
		mapAddFeatures(maptab_edit_layer._layerObject._layerId,[_theFeature]);
		
		maptab_edit_features_before_edit="";
				
		maptab_edit_active_control="_pasteFeature";
				
		maptab_edit_features_after_edit=maptab_edit_features_assign([_theFeature]);
					
		maptab_edit_add_to_history();
		
	});
}



function fn_maptab_toolbar_edit_merge()
{
	maptab_edit_features_before_edit=maptab_edit_features_assign(maptab_edit_selectedFeatures);
	
	maptab_edit_active_control="_mergefeature";
	
	var jstsFromWkt = new jsts.io.WKTReader();
    
	var wktFromOl = new OpenLayers.Format.WKT();
    
	var olFromJsts = new jsts.io.OpenLayersParser();
	
    var union = false;
	
	try
	{
	
		for(var i=0;i<maptab_edit_selectedFeatures.length;i++)
		{
			
			if(!union) 
			{
				union = jstsFromWkt.read(wktFromOl.write(maptab_edit_selectedFeatures[i]));
					
			} else {
			
				var polygon = jstsFromWkt.read(wktFromOl.write(maptab_edit_selectedFeatures[i]));
				
				union = union.union(polygon);

			}
		}
	}
	catch(err)
	{
		maptab_edit_unselect_features();
	
		var _err_msg=_maptab_toolbar_edit_merge_error_msg+"<br><br><textarea readonly cols=50 rows=6>"+err.message+"</textarea><br>";
	
		var _m=Ext.Msg.show({
			title:_maptab_toolbar_edit_merge,
			msg: _err_msg,
			buttons: Ext.Msg.OK,
			icon: Ext.MessageBox.ERROR
		});
	
		return;
	}
	
	var _newFeature = new OpenLayers.Feature.Vector(olFromJsts.write(union));
	
	_newFeature.fid=maptab_edit_return_new_featureid();
	
	_newFeature.state = OpenLayers.State.INSERT;
	
	var _select_Attribute_Window=maptab_edit_merge_select_attribute_window(_newFeature.fid);
	
	_select_Attribute_Window.show();
	
	mapAddFeatures(maptab_edit_layer._layerObject._layerId,[_newFeature]);
	
	mapRemoveEditFeatures(maptab_edit_layer._layerObject._layerId,maptab_edit_selectedFeatures);

	maptab_edit_features_after_edit=maptab_edit_features_assign([mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,_newFeature.fid)]);
	
	maptab_toolbar_edit_toggle_btns_one_features_allowed();

	maptab_toolbar_edit_toggle_btns_multiple_features_allowed();
	
	maptab_edit_add_to_history();
}

function maptab_edit_merge_select_attribute_window(_featureId)
{	
	var g=Ext.create('Ext.grid.Panel',
	{
		border:false,
		columnLines:true,
		id:'maptab_toolbar_edit_merge_select_attribute_grid',
		selModel: Ext.create('Ext.selection.CheckboxModel',{
			mode:'SINGLE',
			listeners: {
				selectionchange: function(model, records) {
					
				}
			}
		}),
		store:fn_createAttributesStore(mapFindLayerById(maptab_edit_layer._layerObject._layerId)._layerObject._attributesFields),
		columns:fn_createAttributesColumnModel(mapFindLayerById(maptab_edit_layer._layerObject._layerId)._layerObject._attributesFields),
		bbar:['->',
			{
				xtype:'button',
				iconCls:'map_general_cancel_btn',
				text:_maptab_edit_copy_attributes_from_cancel,
				handler:function(){
				
				
					Ext.getCmp("maptab_toolbar_edit_merge_select_attribute_window").destroy();
				}
			},
			{
				xtype:'button',
				iconCls:'map_general_copy_btn',
				text:_maptab_edit_copy_attributes_from_copy,
				handler:function(){
				
					
					var selectedRecord = Ext.getCmp("maptab_toolbar_edit_merge_select_attribute_grid").getSelectionModel().getSelection()[0];
					
					var row = Ext.getCmp("maptab_toolbar_edit_merge_select_attribute_grid").getStore().indexOf(selectedRecord);
					
					if (row>-1)
					{
						mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,_featureId).attributes=selectedAttributesArray[row];
					}
					Ext.getCmp("maptab_toolbar_edit_merge_select_attribute_window").destroy();
					
				}
			}
		]
	});
	
	var selectedAttributesArray=[];
	
	for(var i=0;i<maptab_edit_selectedFeatures.length;i++)
	{
		var _feature=maptab_edit_selectedFeatures[i];
		
		var att=_feature.attributes;
		
		selectedAttributesArray.push(att);
	}
	
	g.getStore().loadData(selectedAttributesArray);
	
	var i=new Ext.Window({ 
		width:500,
		height:285,
		title:_maptab_edit_copy_attributes_from_window_title,
		id:'maptab_toolbar_edit_merge_select_attribute_window',
		modal:true,
		layout:'border',
		listeners:{
			destroy:function()
			{
				maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,_featureId));
			}
		},
		items:[{
			xtype:'panel',
			region:'center',
			layout:'fit',
			items:[g]
		}]
	});
	
	return i;
	
}

function fn_maptab_toolbar_edit_split(evt)
{
	var _splitLine=evt.geometry.toString();
	
	mapRemoveFeatures(maptab_edit_layer._layerObject._layerId,evt);
	
	var _reader = new jsts.io.WKTReader();
	
	maptab_edit_active_control="_splitfeature";
	
	var _splitedFeature=maptab_edit_selectedFeatures[0];
	
	maptab_edit_features_before_edit=maptab_edit_features_assign(maptab_edit_selectedFeatures);
	
	var _newFeaturesArray=[];
	
	try
	{
		for(var _cmpnts=0;_cmpnts<(_splitedFeature.geometry.components.length);_cmpnts++)
		{
			var _splitedFeatureReader;
			
			var _splitLineReader= _reader.read(_splitLine);
			
			var _componentClassname="";
		
			if (_splitedFeature.geometry.CLASS_NAME== 'OpenLayers.Geometry.Polygon')
			{
				_splitedFeatureReader = _reader.read(_splitedFeature.geometry.toString());
				
				_componentClassname=_splitedFeature.geometry.CLASS_NAME;
				
			}else
			{
				_splitedFeatureReader = _reader.read(_splitedFeature.geometry.components[_cmpnts].toString());
			
				_componentClassname=_splitedFeature.geometry.components[_cmpnts].CLASS_NAME;
			}
			
			if(_componentClassname == 'OpenLayers.Geometry.Polygon')
			{
				var _unionFeature = _splitedFeatureReader.getExteriorRing().union(_splitLineReader);

				var _polygonizer = new jsts.operation.polygonize.Polygonizer();

				_polygonizer.add(_unionFeature);
				
				var _parser = new jsts.io.OpenLayersParser();
				
				var _polygons = _polygonizer.getPolygons();
				
				for (var i = _polygons.iterator(); i.hasNext();) 
				{
					var _polygon = i.next();
					
					var _newFeature = new OpenLayers.Feature.Vector(_parser.write(_polygon));
					
					_newFeature.attributes=clone(_splitedFeature.attributes);
					
					_newFeature.fid=maptab_edit_return_new_featureid();
					
					_newFeature.state = OpenLayers.State.INSERT;
					
					_newFeaturesArray.push(_newFeature);
					
				}
			}
			if(_componentClassname == 'OpenLayers.Geometry.LineString')
			{
				var _pointsArray = [];
				
				var _endPoint;
				
				var _parser = new jsts.io.OpenLayersParser();
				
				for(var i = 0; i < _splitedFeature.points.length -1; i++) 
				{
					var _startPoint = _splitedFeature.points[i];
					
					_endPoint = _splitedFeature.points[i+1];

					var _segment = new jsts.geom.LineString([_startPoint, _endPoint]);

					if(_segment.intersects(_splitLine)) {
					
						var _splitPoint = _segment.intersection(_splitLine).coordinate;
						
						var _newLine= new jsts.geom.LineString(_pointsArray.concat([_startPoint, _splitPoint]));
						
						_pointsArray = [_splitPoint];
						
						_newFeaturesArray.push(new OpenLayers.Feature.Vector(_parser.write(_newLine)));
					
					} else {
						
						_pointsArray.push(_startPoint);
					}
				}
			
				var _restLine = new jsts.geom.LineString(_pointsArray.concat([_endPoint]));
				
				var _newFeature=new OpenLayers.Feature.Vector(_parser.write(_restLine));
				
				_newFeaturesArray.push(new OpenLayers.Feature.Vector(_parser.write(_restLine)));
				
				_newFeature.attributes=clone(_splitedFeature.attributes);
					
				_newFeature.fid=fn_maptab_toolbar_edit_return_new_featureid();
			
				_newFeature.state = OpenLayers.State.INSERT;
			
				_newFeaturesArray.push(_newFeature);
			
			}
		}
	}catch(err)
	{
		maptab_edit_unselect_features();
	
		var _err_msg=_maptab_toolbar_edit_split_error_msg+"<br><br><textarea readonly cols=50 rows=6>"+err.message+"</textarea><br>";
		
		var _m=Ext.Msg.show({
			title:_maptab_toolbar_edit_split,
			msg: _err_msg,
			buttons: Ext.Msg.OK,
			icon: Ext.MessageBox.ERROR
		});
	
		return;
	}
	
	mapAddFeatures(maptab_edit_layer._layerObject._layerId,_newFeaturesArray);
	
	maptab_edit_features_after_edit=maptab_edit_features_assign(_newFeaturesArray);
	
	mapRemoveEditFeatures(maptab_edit_layer._layerObject._layerId,maptab_edit_selectedFeatures);
	
	for(var i=0;i<_newFeaturesArray.length;i++)
	{
		maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,_newFeaturesArray[i].fid));
	}
	
	Ext.getCmp("maptab_toolbar_edit_split").toggle(false);
	
	maptab_toolbar_edit_toggle_btns_one_features_allowed();
	
	maptab_toolbar_edit_toggle_btns_multiple_features_allowed();
	
	maptab_edit_add_to_history();
	
}

function maptab_edit_change_attributes(_feature,_newAttributes)
{
	maptab_edit_active_control="_attributesChanged";

	maptab_edit_features_before_edit=maptab_edit_features_assign([mapGetFeatureByFid(_feature._layerId,_feature._featureId)]);
	
	Ext.each(_newAttributes,function(item)
	{
		mapGetFeatureByFid(_feature._layerId,_feature._featureId).attributes[item._attributeName]=item._attributeValue;
		
		if (mapGetFeatureByFid(_feature._layerId,_feature._featureId).state!=OpenLayers.State.INSERT)
		{
			mapGetFeatureByFid(_feature._layerId,_feature._featureId).state = OpenLayers.State.UPDATE;
		}
	});
	
	maptab_edit_features_after_edit=maptab_edit_features_assign([mapGetFeatureByFid(_feature._layerId,_feature._featureId)]);
	
	maptab_edit_add_to_history();
	
	maptab_edit_change_attributes_update_selected_grid(_feature,_newAttributes);
	
}

function maptab_edit_change_attributes_update_selected_grid(_feature,_newAttributes)
{
	var updatedRecord=Ext.getCmp("maptab_edit_selected_tabpanel").getStore().findRecord("_featureId",_feature._featureId);
	
	Ext.each(_newAttributes,function(item)
	{
		updatedRecord.set(item._attributeName,item._attributeValue);
	});
	
	Ext.getCmp("maptab_edit_selected_tabpanel").getStore().commitChanges();
	
	Ext.getCmp("maptab_edit_selected_tabpanel").reconfigure(Ext.getCmp("maptab_edit_selected_tabpanel").getStore());
}

function maptab_edit_return_new_featureid()
{
	var _o="new_feature_"+maptab_edit_new_featureid_count;
	
	maptab_edit_new_featureid_count++;
	
	return _o;
}

function fn_maptab_toolbar_edit_delete()
{
	maptab_edit_features_before_edit=maptab_edit_features_assign(maptab_edit_selectedFeatures);
	
	maptab_edit_active_control="_deletefeature";
	
	for(var i=0;i<maptab_edit_features_before_edit.length;i++)
	{
		mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,maptab_edit_features_before_edit[i].fid).state = OpenLayers.State.DELETE;
	}
	
	mapRemoveEditFeatures(maptab_edit_layer._layerObject._layerId,maptab_edit_features_before_edit);
	
	maptab_edit_selectedFeatures=[];
	
	maptab_toolbar_edit_toggle_btns_one_features_allowed();

	maptab_toolbar_edit_toggle_btns_multiple_features_allowed();
	
	maptab_edit_features_after_edit="";
	
	Ext.getCmp("maptab_toolbar_edit_delete").toggle(false);
	
	maptab_edit_add_to_history();
	
}

var maptab_edit_features_to_be_removed=[];

function mapAddEditRemovedFeatures()
{
	for(var i=0;i<maptab_edit_features_to_be_removed.length;i++)
	{
		if (mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,maptab_edit_features_to_be_removed[i].fid)==null)
		{
			mapAddFeatures(maptab_edit_layer._layerObject._layerId,maptab_edit_features_to_be_removed[i]);
			
			mapEraseFeatures(maptab_edit_layer._layerObject._layerId,maptab_edit_features_to_be_removed[i]);
		}
	}
}

function mapRemoveEditFeatures(_layerId,_features)
{
	if(_features.length>0)
	{
		var p=_features.length;
		
		for(var i=0;i<p;i++)
		{
			var _f=mapGetFeatureByFid(_layerId,_features[i].fid);
			
			var _fClone=mapGetFeatureByFid(_layerId,_features[i].fid).clone();
			
			_fClone.fid=_features[i].fid;
			
			maptab_edit_features_to_be_removed.push(_fClone);
			
			mapRemoveFeatures(_layerId,mapGetFeatureByFid(_layerId,_features[i].fid));
			
		}
	}
	else
	{
		var _fClone=mapGetFeatureByFid(_layerId,_features.fid).clone();
			
		_fClone.fid=_features.fid;
			
		maptab_edit_features_to_be_removed.push(_fClone);
		
		mapRemoveFeatures(_layerId,_features);
	}
}

function init_maptab_edit_history_grid()
{
	
	Ext.define('editHistory', {
		extend: 'Ext.data.Model',
		fields: [{
			name:'_timeStamp',
			type:'string'
		},
		{
			name:'_editReason',
			type:'string'
		},
		{
			name:'_featureId',
			type:'string'
		},
		{
			name:'_featureBefore',
			type:'object'
		},
		{
			name:'_featureAfter',
			type:'object'
		}]
	});

	var s=Ext.create('Ext.data.Store', 
	{
		data:[],
		model:'editHistory'
	});
	
	
	var g=Ext.create('Ext.grid.Panel',
	{
		border:false,
		columnLines:true,
		id:'maptab_edit_history_tabpanel',
		closable:false,
		title:_maptab_edit_history_tabpanel,
		store:s,
		columns:[
			{
				header:'',
				dataIndex:'_timeStamp',
				sortable:false,
				width:120,
				hideable:false
			},
			{
				header: _maptab_toolbar_edit_history_column_featureId,
				dataIndex: '_featureId',
				sortable: false,
				width:200,
				hideable:false
			},
			{
				header: _maptab_toolbar_edit_history_column_editReason,
				dataIndex: '_editReason',
				sortable: false,
				flex:2,
				width:350,
				hideable:false
			},
			{
				header: '',
				dataIndex: '_featureBefore',
				sortable: false,
				hidden:true,
				hideable:false
			},
			{
				header: '',
				dataIndex: '_featureAfter',
				sortable: false,
				hidden:true,
				hideable:false
			}
		]
	});
	
	Ext.getCmp("maptab_south_tabpanel").add(g);
}


var maptab_edit_history_current_position=0;

var maptab_edit_undoredo="";

function maptab_edit_add_to_history()
{
	var _fIds=[];

	var _featureId="";
	
	for(var i=0;i<maptab_edit_features_after_edit.length;i++)
	{
		_fIds.push(maptab_edit_features_after_edit[i].fid);
	}
	
	_featureId=_fIds.join(', ');

	if ((maptab_edit_active_control=="_mergefeature") || (maptab_edit_active_control=="_splitfeature"))
	{
		_fIds=[];
		
		for(var i=0;i<maptab_edit_features_before_edit.length;i++)
		{
			_fIds.push(maptab_edit_features_before_edit[i].fid);
		}
	
		_featureId=_fIds.join(', ')+" => "+_featureId;
	}
	
	if (maptab_edit_active_control=="_deletefeature")
	{
		_fIds=[];
		
		for(var i=0;i<maptab_edit_features_before_edit.length;i++)
		{
			_fIds.push(maptab_edit_features_before_edit[i].fid);
		}
	
		_featureId=_fIds.join(', ');
	}
	
	maptab_edit_remove_from_history();
	
	Ext.getCmp("maptab_edit_history_tabpanel").getStore().add({
		_timeStamp:'['+fn_getDateTime()+']',
		_featureId:_featureId,
		_editReason:_maptab_toolbar_edit_history_reason[maptab_edit_active_control],
		_featureBefore:maptab_edit_features_before_edit,
		_featureAfter:maptab_edit_features_after_edit
	});
	
	maptab_edit_history_current_position=(Ext.getCmp("maptab_edit_history_tabpanel").getStore().getCount()-1);
	
	Ext.getCmp('maptab_toolbar_edit_undo').setDisabled(false);
	
	Ext.getCmp('maptab_toolbar_edit_redo').setDisabled(true);
	
	Ext.getCmp("maptab_edit_history_tabpanel").getSelectionModel().clearSelections();
	
	Ext.getCmp("maptab_edit_history_tabpanel").getView().focusRow(maptab_edit_history_current_position);
	
	maptab_edit_undoredo="";
}

function fn_maptab_edit_undo_redo_drawing_control(state)
{
	if (state)
	{
		document.onkeydown=function(evt)
		{
			
			evt = evt || window.event;
				
			if (evt.keyCode == 90 && evt.ctrlKey)
			{
				maptab_edit_undo_redo_drawing_control.undo();
			}
			
		}
	}
	else
	{
		document.onkeydown=null;
	}

}

function fn_maptab_toolbar_edit_undo()
{
	
	if(maptab_edit_history_current_position<=0)
	{
		Ext.getCmp('maptab_toolbar_edit_undo').setDisabled(true);
		
		Ext.getCmp("maptab_edit_history_tabpanel").getSelectionModel().clearSelections();
	}
	
	Ext.getCmp('maptab_toolbar_edit_redo').setDisabled(false);
	
	maptab_edit_features_from_history("undo");
	
	maptab_edit_history_current_position--;
	
	Ext.getCmp("maptab_edit_history_tabpanel").getView().focusRow(maptab_edit_history_current_position);
}

function fn_maptab_toolbar_edit_redo()
{
	
	maptab_edit_history_current_position++;
	
	if (maptab_edit_history_current_position<0)
	{
		Ext.getCmp("maptab_edit_history_tabpanel").getView().focusRow(0);
	}
	else
	{
		Ext.getCmp("maptab_edit_history_tabpanel").getView().focusRow(maptab_edit_history_current_position);
		
		Ext.getCmp('maptab_toolbar_edit_undo').setDisabled(false);
	}
	
	if(maptab_edit_history_current_position>=(Ext.getCmp("maptab_edit_history_tabpanel").getStore().getCount()-1))
	{
		Ext.getCmp('maptab_toolbar_edit_undo').setDisabled(false);
		
		Ext.getCmp('maptab_toolbar_edit_redo').setDisabled(true);
		
		maptab_edit_history_current_position=(Ext.getCmp("maptab_edit_history_tabpanel").getStore().getCount()-1);
	}
	
	maptab_edit_features_from_history("redo");
	
}

function maptab_edit_features_from_history(_undoredo)
{
	var record = Ext.getCmp("maptab_edit_history_tabpanel").getStore().getAt(maptab_edit_history_current_position);

	Ext.getCmp("maptab_toolbar_edit_select_by_point").toggle(true);
	
	switch(_undoredo)
	{
		case "undo":
			
			maptab_edit_undoredo="undo";
			
			mapRemoveFeatures(maptab_edit_layer._layerObject._layerId,record.get("_featureAfter"));
			
			mapAddFeatures(maptab_edit_layer._layerObject._layerId,record.get("_featureBefore"));
			
		break;
		
		case "redo":
		
			maptab_edit_undoredo="redo";
		
			mapAddFeatures(maptab_edit_layer._layerObject._layerId,record.get("_featureAfter"));
			
			mapRemoveFeatures(maptab_edit_layer._layerObject._layerId,record.get("_featureBefore"));
			
		break;
	}
	
}


function maptab_edit_remove_from_history()
{
	if (maptab_edit_history_current_position<(Ext.getCmp("maptab_edit_history_tabpanel").getStore().getCount()-1))
	{
		var p=maptab_edit_history_current_position;
		
		var c=Ext.getCmp("maptab_edit_history_tabpanel").getStore().getCount();
		
		if(p<0){p=0;}
		
		if (maptab_edit_undoredo=="undo")
		{
			p=maptab_edit_history_current_position+1;
		}
		
		for(var i=p;i<c;i++)
		{
			Ext.getCmp("maptab_edit_history_tabpanel").getStore().removeAt((Ext.getCmp("maptab_edit_history_tabpanel").getStore().getCount()-1));
		}
	}

}

function maptab_edit_unselect_features()
{
	maptab_edit_onselect_mode=true;
	
	if (maptab_edit_controls)
	{
		maptab_edit_controls.selectfeaturebybox.unselectAll();
			
		maptab_edit_controls.selectfeaturebypoint.unselectAll();
	}
	
	maptab_edit_selectedFeatures=[];

}

function maptab_edit_clear_history()
{
	Ext.getCmp("maptab_edit_history_tabpanel").getStore().removeAll();
	
	maptab_edit_history_current_position=0;
}

function maptab_edit_unsaved_data_exists()
{
	if (Ext.getCmp("maptab_edit_history_tabpanel").getStore().getCount()>0)
	{
		var _m=Ext.Msg.show({
			title:_maptab_edit_has_changes_before_close_title,
			msg: _maptab_edit_has_changes_before_close,
			buttons: Ext.Msg.YESNOCANCEL,
			icon: Ext.MessageBox.WARNING,
			fn:function(ans,text)
			{
				if (ans=="yes")
				{
					fn_maptab_toolbar_edit_save();
					
					return true;
				}
				else if (ans=="no")
				{
					fn_maptab_toolbar_edit_refresh();
					
					return true;
				}
				else if (ans=="cancel")
				{
					return false;
				}
			}
		});
		
	}else
	{
		fn_maptab_toolbar_edit_refresh();
		
		return false;
	}
}


function maptab_edit_initialize()
{
	maptab_edit_clear_history();
	
	maptab_edit_controls.selectfeaturebybox.unselectAll();
	
	maptab_edit_controls.selectfeaturebypoint.unselectAll();
	
	Ext.getCmp("maptab_edit_selected_tabpanel").getStore().removeAll();
	
	map.events.unregister("mousedown",map,maptab_edit_active_trace);
		
	map.events.unregister("mouseup",map,maptab_edit_deactive_trace);
	
	if (typeof maptab_edit_layer!=="undefined")
	{
		maptab_edit_layer.strategies[0].activate();
	}
	
	maptab_edit_features_to_be_removed=[];
	
}


function fn_maptab_edit_save_success(event)
{
	var msgContent=_maptab_toolbar_edit_save_success_title;
	
	msgContent+="<br><br><br><label for=\"wfst_error_details_text\">"+_maptab_toolbar_edit_save_response+"</label>";
	
	msgContent+="<br><br><textarea readonly cols=50 rows=6  id=\"wfst_error_details_text\" >"+event.response.priv.responseText+"</textarea><br>";
	
	Ext.MessageBox.show({
		title:_maptab_toolbar_edit_save_success_message,
		msg: msgContent,
		icon: Ext.MessageBox.INFO,
		buttons: Ext.MessageBox.OK
	});
	
	maptab_edit_initialize();
	
	maptab_edit_layer.strategies[0].deactivate();
}

function fn_maptab_edit_save_failure(event)
{

	var msgContent=_maptab_toolbar_edit_save_fail_message;
	
	msgContent+="<br><br><br><label for=\"wfst_error_details_text\">"+_maptab_toolbar_edit_save_response+"</label>";
	
	msgContent+="<br><br><textarea readonly cols=50 rows=6  id=\"wfst_error_details_text\" >"+event.response.priv.responseText+"</textarea><br>";
	
	Ext.MessageBox.show({
		title:_maptab_toolbar_edit_save_fail_title,
		msg: msgContent,
		icon: Ext.MessageBox.ERROR,
		buttons: Ext.MessageBox.OK
	});
	
	
	
}

function fn_maptab_toolbar_edit_save()
{
	mapAddEditRemovedFeatures();
	
	var _saveStrategy=maptab_edit_layer.strategies[2];
	
	if ((typeof _saveStrategy.events.listeners.success==="undefined") || (_saveStrategy.events.listeners.success==null))
	{
		_saveStrategy.events.on({
			'success':fn_maptab_edit_save_success,
			'fail':fn_maptab_edit_save_failure,
			scope: this
		});
	}
	
	_saveStrategy.save();
	
}

function fn_maptab_toolbar_edit_refresh()
{
	if (typeof maptab_edit_layer!=="undefined")
	{
		maptab_edit_layer.strategies[0].activate();
	
		maptab_edit_layer.refresh({force: true});
			
		maptab_edit_layer.strategies[0].deactivate();

		maptab_toolbar_edit_activate_btns();
	}
}