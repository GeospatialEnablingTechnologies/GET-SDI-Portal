var maptab_west_general_settings_store=new Ext.data.Store({
	fields: [
			{name:"_generalSettingId", type:"string"},
			{name:"_generalSettingTitle", type:"string"},
			{name:"_generalSettingRawValue", type:"string"},
			{name:"_generalSettingRenderer", type:"object"},
			{name:"_generalSettingValue", type:"string"},
			{name:"_generalSettingEditor", type:"object"},
			{name:"_generalSettingGroup", type:"string"}
		],
	data: [],
	groupField: "_generalSettingGroup"
});

function init_maptab_west_general_settings_store_load_data()
{
	var _config=new _config_init_map();
	
	var _defaultProjectionObjIndex=fn_objIndexOf(_config._mapProjections,"_epsg",_config._mapOptions.displayProjection.toString());
	

	var maptab_west_general_settings_store_data=[
		{
			_generalSettingId:'maptab_west_general_settings_data_map_projection',
			_generalSettingTitle:_maptab_west_general_settings_data_map_projection,
			_generalSettingRawValue:_config._mapProjections[_defaultProjectionObjIndex]._title,
			_generalSettingValue:_config._mapProjections[_defaultProjectionObjIndex]._epsg,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.Store({
					fields: ['_epsg','_title','_maxExtent','_numDigits'],
					data: _config._mapProjections
				}),
				listeners:{
					select:function(combo,record)
					{
						var record=record[0];
						
						mapSetDisplayProjection(record.data._epsg);
						
						fn_maptab_bbar_general_mouse_position();
						
						fn_maptab_bbar_general_map_center();
					}
				},
				displayField: '_title',
				valueField: '_epsg',
				emptyText:_config._mapProjections[_defaultProjectionObjIndex]._title,
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_settings
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_show_mouse_position',
			_generalSettingTitle:_maptab_west_general_settings_data_show_mouse_position,
			_generalSettingRawValue:"",
			_generalSettingValue:true,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				displayField: 'name',
				listeners:{
					select:function(combo,record)
					{
						var record=record[0];
						
						if (record.data.value)
						{
							Ext.getCmp("maptab_bbar_general_mouse_position_label").show();
							Ext.getCmp("maptab_bbar_general_mouse_position").show();
						}else{
							Ext.getCmp("maptab_bbar_general_mouse_position_label").hide();
							Ext.getCmp("maptab_bbar_general_mouse_position").hide();
						}
					}
				},
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				value:true,
				selectOnFocus: false,
				mode: 'local',
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_settings
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_show_basemap_projection',
			_generalSettingTitle:_maptab_west_general_settings_data_show_basemap_projection,
			_generalSettingRawValue:"",
			_generalSettingValue:false,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				displayField: 'name',
				listeners:{
					select:function(combo,record)
					{
						var record=record[0];
						
						if (record.data.value)
						{
							Ext.getCmp("maptab_bbar_general_basemap_projection").show();
						}else{
							Ext.getCmp("maptab_bbar_general_basemap_projection").hide();
						}
					}
				},
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				value:false,
				selectOnFocus: false,
				mode: 'local',
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_settings
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_show_current_scale',
			_generalSettingTitle:_maptab_west_general_settings_data_show_current_scale,
			_generalSettingRawValue:"",
			_generalSettingValue:true,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				displayField: 'name',
				valueField: 'value',
				listeners:{
					select:function(combo,record)
					{
						var record=record[0];
						
						if (record.data.value)
						{
							Ext.getCmp("maptab_bbar_general_current_scale").show();
						}else{
							Ext.getCmp("maptab_bbar_general_current_scale").hide();
						}
					}
				},
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				value:true,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_settings
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_get_coordinates_projections',
			_generalSettingTitle:_maptab_west_general_settings_data_get_coordinates_projections,
			_generalSettingRawValue:_config._getCoordinatesDefaultProjections.join(", "),
			_generalSettingValue:_config._getCoordinatesDefaultProjections.join(", "),
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				displayField: '_title',
				valueField: '_epsg',
				store:new Ext.data.Store({
					fields: ['_epsg','_title','_maxExtent','_numDigits'],
					data: _config._mapProjections
				}),
				listeners:{
					change:function(cmp,record)
					{
						if (!(cmp.getRawValue().length > 0))
						{
							cmp.collapse();
						}
						
					},
					beforeselect: function(cmp, record, index, opts) {
					
						var terms = cmp.getRawValue().split(/,\s*/);
						
						terms.pop();
						
						terms.push(record.data._title);
						
						terms.push("");
						
						cmp.setValue(terms.join(", "));
						
						cmp.collapse();
					
						return false;
					}
				},
				hideTrigger: true,
				selectOnFocus: true,
				typeAhead: true,
				minChars: 1,
				hideTrigger: true,
				mode: 'local'
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_tools
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_set_coordinates_projections',
			_generalSettingTitle:_maptab_west_general_settings_data_set_coordinates_projections,
			_generalSettingRawValue:_config._setCoordinatesDefaultProjections.join(", "),
			_generalSettingValue:_config._setCoordinatesDefaultProjections.join(", "),
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				displayField: '_title',
				valueField: '_epsg',
				store:new Ext.data.Store({
					fields: ['_epsg','_title','_maxExtent','_numDigits'],
					data: _config._mapProjections
				}),
				listeners:{
					change:function(cmp,record)
					{
						if (!(cmp.getRawValue().length > 0))
						{
							cmp.collapse();
						}
					},
					beforeselect: function(cmp, record, index, opts) {
					
						var terms = cmp.getRawValue().split(/,\s*/);
						
						terms.pop();
						
						if (terms.indexOf(record.data._title)<0)
						{
							terms.push(record.data._title);
						}
						
						terms.push("");
						
						cmp.setValue(terms.join(", "));
						
						cmp.collapse();
					
						return false;
					}
				},
				hideTrigger: true,
				selectOnFocus: true,
				typeAhead: true,
				minChars: 1,
				hideTrigger: true,
				mode: 'local'
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_tools
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_set_coordinates_zoom',
			_generalSettingTitle:_maptab_west_general_settings_data_set_coordinates_zoom,
			_generalSettingRawValue:_config._setCoordinatesZoomLevel,
			_generalSettingValue:_config._setCoordinatesZoomLevel,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				displayField: 'value',
				valueField: 'value',
				store:new Ext.data.SimpleStore({
					fields: ['value'],
					data:[[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12],[13],[14],[15],[16],[17],[18],[19],[20]]
				}),
				listeners:{
					select:function(combo,record)
					{
					
					}
				},
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				value: _config._setCoordinatesZoomLevel,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_tools
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_set_coordinates_marker',
			_generalSettingTitle:_maptab_west_general_settings_data_set_coordinates_marker,
			_generalSettingRawValue:"",
			_generalSettingValue:true,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				listeners:{
					select:function(combo,record)
					{
						var record=record[0];
						
						if (record.data.value)
						{
							Ext.getCmp("maptab_bbar_general_current_scale").show();
						}else{
							Ext.getCmp("maptab_bbar_general_current_scale").hide();
						}
					}
				},
				displayField: 'name',
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				value: true,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_map_tools
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_scale_bar_showMinorMeasures',
			_generalSettingTitle:_maptab_west_general_settings_data_scale_bar_showMinorMeasures,
			_generalSettingRawValue:"",
			_generalSettingValue:_config._mapControls.scaleBar.showMinorMeasures,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				listeners:{
					select:function(cmp,record)
					{
						var record=record[0];
					
						map_controls["scaleBar"].showMinorMeasures=record.data.value;
						
						map_controls["scaleBar"].update();
					}
				},
				displayField: 'name',
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				value:_config._mapControls.scaleBar.showMinorMeasures,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_scale_bar
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_scale_bar_singleLine',
			_generalSettingTitle:_maptab_west_general_settings_data_scale_bar_singleLine,
			_generalSettingRawValue:"",
			_generalSettingValue:_config._mapControls.scaleBar.singleLine,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				listeners:{
					select:function(cmp,record)
					{
						var record=record[0];
					
						map_controls["scaleBar"].singleLine=record.data.value;
						
						map_controls["scaleBar"].update();
					}
				},
				displayField: 'name',
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				value:_config._mapControls.scaleBar.singleLine,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_scale_bar
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_scale_bar_abbreviateLabel',
			_generalSettingTitle:_maptab_west_general_settings_data_scale_bar_abbreviateLabel,
			_generalSettingRawValue:"",
			_generalSettingValue:_config._mapControls.scaleBar.abbreviateLabel,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				listeners:{
					select:function(cmp,record)
					{
						var record=record[0];
					
						map_controls["scaleBar"].abbreviateLabel=record.data.value;
						
						map_controls["scaleBar"].update();
					}
				},
				displayField: 'name',
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				value:_config._mapControls.scaleBar.abbreviateLabel,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_scale_bar
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_scale_bar_divisions',
			_generalSettingTitle:_maptab_west_general_settings_data_scale_bar_divisions,
			_generalSettingRawValue:_config._mapControls.scaleBar.divisions,
			_generalSettingValue:_config._mapControls.scaleBar.divisions,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['value'],
					data:[[0],[1],[2],[3],[4],[5]]
				}),
				listeners:{
					select:function(cmp,record)
					{
						var record=record[0];
					
						map_controls["scaleBar"].divisions=record.data.value;
						
						map_controls["scaleBar"].update();
					}
				},
				displayField: 'value',
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				emptyText:_config._mapControls.scaleBar.divisions,
				value:_config._mapControls.scaleBar.divisions,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_scale_bar
		},
		{
			_generalSettingId:'maptab_west_general_settings_data_scale_bar_subdivisions',
			_generalSettingTitle:_maptab_west_general_settings_data_scale_bar_subdivisions,
			_generalSettingRawValue:_config._mapControls.scaleBar.subdivisions,
			_generalSettingValue:_config._mapControls.scaleBar.subdivisions,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['value'],
					data:[[0],[1],[2],[3],[4],[5]]
				}),
				listeners:{
					select:function(cmp,record)
					{
						var record=record[0];
					
						map_controls["scaleBar"].subdivisions =record.data.value;
						
						map_controls["scaleBar"].update();
					}
				},
				displayField: 'value',
				valueField: 'value',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				emptyText:_config._mapControls.scaleBar.subdivisions,
				value:_config._mapControls.scaleBar.subdivisions,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_scale_bar
		},
		{
			_generalSettingId:'maptab_west_general_settings_group_toggle_banner',
			_generalSettingTitle:_maptab_west_general_settings_group_toggle_banner,
			_generalSettingRawValue:"",
			_generalSettingValue:true,
			_generalSettingEditor:{
				xtype:'combobox',
				viewConfig: {
					markDirty:false
				},
				store:new Ext.data.SimpleStore({
					fields: ['name','value'],
					data:[[_map_general_yes,true],[_map_general_no,false]]
				}),
				displayField: 'name',
				valueField: 'value',
				listeners:{
					select:function(combo,record)
					{
						var record=record[0];
						
						if (record.data.value)
						{
							Ext.getCmp("viewport_north").show();
						}else{
							Ext.getCmp("viewport_north").hide();
						}
					}
				},
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				value:true,
				editable: false
			},
			_generalSettingGroup:_maptab_west_general_settings_group_general
		}
	];
	
	maptab_west_general_settings_store.loadData(maptab_west_general_settings_store_data);
	
	init_maptab_general_default_state();
	
}

var maptab_west_general_settings_grid_columns=[
	{
		header: '',
		dataIndex: '_generalSettingId',
		hidden:true,
		hideable:false
	},
	{
		header: '',
		dataIndex: '_generalSettingTitle'
	},
	{
		header: '',
		dataIndex: '_generalSettingRawValue',
		renderer:maptab_west_general_settings_generalSettingRawValue_renderer,
		flex:1,
		field: {
			allowBlank: false,
			markDirty:false
        }
	},
	{
		header: '',
		dataIndex: '_generalSettingValue',
		hidden:true,
		hideable:false
	},
	{
		header: '',
		dataIndex: '_generalSettingEditor',
		hidden:true,
		hideable:false
	},
	{
		header: '',
		dataIndex: '_generalSettingGroup',
		hidden:true,
		hideable:false
	}
]

function  maptab_west_general_settings_generalSettingRawValue_renderer(value, metaData, record, row, col, store, gridView)
{
	var _value=record.get("_generalSettingValue");
	
	switch(_value)
	{
		case "true":
			value=_map_general_yes;
		break;
	
		case "false":
			value=_map_general_no;
		break;
		
		default:
			switch(record.get("_generalSettingId"))
			{
				case "maptab_west_general_settings_data_map_projection":
				
					var _config=new _config_init_map();
	
					var _defaultProjectionObjIndex=fn_objIndexOf(_config._mapProjections,"_epsg",_value);
					
					value = _config._mapProjections[_defaultProjectionObjIndex]._title;
					
				break;
				
				default:
					value=_value;
				break;
			}
			
		break;
	}
	
	return value;
}

var maptab_west_general_settings_cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
		listeners:{
			'beforeedit': function(editor, e, eOpts )
			{
				e.column.setEditor(e.record.get("_generalSettingEditor"));
			},
			'afteredit': function(editor, e, eOpts )
			{
				if (e.value!=null)
				{
					e.record.set("_generalSettingValue",e.value);
			
					e.record.commit();
				}
				
				Ext.getCmp("maptab_west_general_settings_grid_id").getView().refresh();
			}
		}
    });

var maptab_west_general_settings_grid=new Ext.grid.Panel({
		border:true,
		columnLines:true,
		split: true,
		id:'maptab_west_general_settings_grid_id',
		viewConfig:{
			makeDirty:false
		},
		store:maptab_west_general_settings_store,
		columns:maptab_west_general_settings_grid_columns,
		plugins:[maptab_west_general_settings_cellEditing],
		selModel:{selType: 'cellmodel'},
		features: [{
            ftype: 'grouping'
        }]
	});


var maptab_west_general_settings_panel ={
	xtype:'panel',
	id:'maptab_west_general_settings_panel',
	title:_maptab_west_general_settings_panel,
	region:'center',
	autoScroll:true,
	iconCls:'maptab_accordion_icon',
	layout:'fit',
	items:[maptab_west_general_settings_grid]
}

function fn_maptab_bbar_general_map_center()
{
	var _config=new _config_init_map();

	var _numDigitsIndex=fn_objIndexOf(_config._mapProjections,"_epsg",mapGetCurrentDisplayProjection());
	
	var _titleEPSG = _config._mapProjections[_numDigitsIndex]["_title"];
	
	var _numDigits=_config._mapProjections[_numDigitsIndex]._numDigits;

	var _c=mapGetCenter();
	
	var _mapCenter=_c.lon.toFixed(_numDigits)+", "+ _c.lat.toFixed(_numDigits);
	
	var _mapZoom=_c.zoom;

	Ext.getCmp("maptab_bbar_general_map_center").update(fn_replace(_maptab_bbar_general_map_center_zoom,['displayProjection','mapCenter','mapZoom'],[_titleEPSG,_mapCenter,_mapZoom]));
}

function fn_maptab_bbar_general_current_scale()
{
	Ext.getCmp("maptab_bbar_general_current_scale").update(fn_replace(_maptab_bbar_general_current_scale,['mapScale'],["1:"+Math.round(mapGetCurrentScale())]));
}


function fn_maptab_bbar_general_basemap_projection()
{
	Ext.getCmp("maptab_bbar_general_basemap_projection").update(fn_replace(_maptab_bbar_general_basemap_projection,['mapProjection'],[mapGetCurrentProjection()]));
}


var mapMousePosition;

function fn_maptab_bbar_general_mouse_position()
{
	if (mapMousePosition)
	{
		map.removeControl(mapMousePosition);
	}
	
	var _config=new _config_init_map();
	
	var _numDigitsIndex=fn_objIndexOf(_config._mapProjections,"_epsg", mapGetCurrentDisplayProjection());
	
	var _numDigits=_config._mapProjections[_numDigitsIndex]._numDigits;
	
	var _titleEPSG = _config._mapProjections[_numDigitsIndex]["_title"];

	var positionText='<div id=\"mapMouseCoordinatesDiv\" style=\"white-space: nowrap;\">'+_maptab_bbar_general_mouse_position_outside_of_map+'</div>';
	
	Ext.getCmp("maptab_bbar_general_mouse_position").update(positionText);
	
	mapMousePosition=new OpenLayers.Control.MousePosition({
		numDigits:Number(_numDigits),
		element: document.getElementById("mapMouseCoordinatesDiv"),
		emptyString:_maptab_bbar_general_mouse_position_outside_of_map
	});
	
	map.addControl(mapMousePosition);
	
	var maptab_bbar_general_mouse_position_label=fn_replace(_maptab_bbar_general_mouse_position,['displayProjection'],[_titleEPSG]);
	
	Ext.getCmp("maptab_bbar_general_mouse_position_label").update(maptab_bbar_general_mouse_position_label);

}

function init_maptab_general_default_state()
{
	
	var maptab_west_general_settings_data_show_mouse_position_state = maptab_west_general_settings_store.findRecord("_generalSettingId", "maptab_west_general_settings_data_show_mouse_position");

	maptab_west_general_settings_data_show_mouse_position_state = maptab_west_general_settings_data_show_mouse_position_state.get("_generalSettingValue");

	if (maptab_west_general_settings_data_show_mouse_position_state=='true')
	{
		Ext.getCmp("maptab_bbar_general_mouse_position_label").show();
		Ext.getCmp("maptab_bbar_general_mouse_position").show();
	}else{
		Ext.getCmp("maptab_bbar_general_mouse_position_label").hide();
		Ext.getCmp("maptab_bbar_general_mouse_position").hide();
	}


	var maptab_west_general_settings_data_show_basemap_projection_state= maptab_west_general_settings_store.findRecord("_generalSettingId", "maptab_west_general_settings_data_show_basemap_projection");

	maptab_west_general_settings_data_show_basemap_projection_state = maptab_west_general_settings_data_show_basemap_projection_state.get("_generalSettingValue");

	if (maptab_west_general_settings_data_show_basemap_projection_state=='true')
	{
		Ext.getCmp("maptab_bbar_general_basemap_projection").show();
	}else{
		Ext.getCmp("maptab_bbar_general_basemap_projection").hide();
	}


	var maptab_west_general_settings_data_show_current_scale_state= maptab_west_general_settings_store.findRecord("_generalSettingId", "maptab_west_general_settings_data_show_current_scale");

	maptab_west_general_settings_data_show_current_scale_state = maptab_west_general_settings_data_show_current_scale_state.get("_generalSettingValue");

	if (maptab_west_general_settings_data_show_current_scale_state=='true')
	{
		Ext.getCmp("maptab_bbar_general_current_scale").show();
	}else{
		Ext.getCmp("maptab_bbar_general_current_scale").hide();
	}


	var maptab_west_general_settings_data_set_coordinates_marker_state= maptab_west_general_settings_store.findRecord("_generalSettingId", "maptab_west_general_settings_data_set_coordinates_marker");

	maptab_west_general_settings_data_set_coordinates_marker_state = maptab_west_general_settings_data_set_coordinates_marker_state.get("_generalSettingValue");

	if (maptab_west_general_settings_data_set_coordinates_marker_state=='true')
	{
		Ext.getCmp("maptab_bbar_general_current_scale").show();
	}else{
		Ext.getCmp("maptab_bbar_general_current_scale").hide();
	}



	var maptab_west_general_settings_group_toggle_banner_state = maptab_west_general_settings_store.findRecord("_generalSettingId", "maptab_west_general_settings_group_toggle_banner");

	maptab_west_general_settings_group_toggle_banner_state = maptab_west_general_settings_group_toggle_banner_state.get("_generalSettingValue");

	if (maptab_west_general_settings_group_toggle_banner_state=='true')
	{
		Ext.getCmp("viewport_north").show();
	}else{
		
		Ext.getCmp("viewport_north").hide();
	}
	
	
	
}

function init_maptab_bbar_general_bbar()
{
	mapOnChangeBaseLayer(fn_maptab_bbar_general_basemap_projection);

	mapOnZoomEnd(fn_maptab_bbar_general_current_scale);
	
	mapOnMoveEnd(fn_maptab_bbar_general_map_center);
	
	var mapBbar=[
		{
			xtype:'combobox',
			displayField: 'name',
			valueField: 'value',
			emptyText:_maptab_bbar_general_zoom_to_scale,
			id:'maptab_bbar_general_zoom_to_scale',
			width:200,
			store:new Ext.data.SimpleStore({
				fields: ['value','name'],
				data:mapGetBasemapResolutions()
			}),
			listeners:{
				select:function(combo,record)
				{
					var record=record[0];
				
					mapZoomToScale(record.get("value"));
				}
			},
			forceSelection: true,
			triggerAction: 'all',
			selectOnFocus: false,
			mode: 'local',
			editable: false
		},
		{
			xtype:'textfield',
			id:'maptab_bbar_general_zoom_to_x',
			emptyText:_maptab_bbar_general_zoom_to_x,
			width:60
		},
		{
			xtype:'textfield',
			id:'maptab_bbar_general_zoom_to_y',
			emptyText:_maptab_bbar_general_zoom_to_y,
			width:60
		},
		{
			xtype:'button',
			text:_maptab_bbar_general_zoom_to_go,
			handler:function()
			{
				var lon=Ext.getCmp("maptab_bbar_general_zoom_to_x").getValue();
				
				var lat=Ext.getCmp("maptab_bbar_general_zoom_to_y").getValue();
				
				if(Ext.isNumeric(lon) && Ext.isNumeric(lat))
				{
					maptab_toolbar_general_setCoordinates(lon,lat,mapGetCurrentDisplayProjection());
				}
			}
		},{
			xtype:'label',
			id:'maptab_bbar_general_wait_label',
			html:_map_general_please_wait
		},
		'->',
		{
			xtype:'label',
			id:'maptab_bbar_general_map_center'
		},
		{
			xtype:'label',
			id:'maptab_bbar_general_current_scale'
		},
		{
			xtype:'label',
			id:'maptab_bbar_general_basemap_projection'
		},
		{
			xtype:'label',
			id:'maptab_bbar_general_mouse_position_label'
		},
		{
			xtype:'label',
			width:150,
			id:'maptab_bbar_general_mouse_position'
		}
	]
	
	
	Ext.getCmp("maptab_mapPanel").addDocked({
        xtype: 'toolbar',
        dock: 'bottom',
		flex:1,
        items: mapBbar
    });
	
	fn_maptab_bbar_general_map_center();

	fn_maptab_bbar_general_current_scale();
	
	fn_maptab_bbar_general_basemap_projection();
	
	fn_maptab_bbar_general_mouse_position();
}
