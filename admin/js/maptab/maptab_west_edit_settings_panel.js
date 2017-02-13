var maptab_west_edit_settings_store=Ext.create('Ext.data.Store', {
	fields: ['_layerId','_canChangeEditSettings','_layerLegend','_layerTitle','_canCopy','_canTrace','_canSnapVertex','_canSnapEdge'],
	data: []
});


var maptab_west_edit_settings_panel ={
	xtype:'panel',
	id:'maptab_west_edit_settings_panel',
	title:_maptab_west_edit_settings_panel,
	region:'center',
	autoScroll:true,
	layout:'fit',
	iconCls:'maptab_accordion_icon',
	items:[{
		xtype:'gridpanel',
		border:true,
		columnLines:true,
		split: true,
		id:'maptab_west_edit_settings_grid',
		store:maptab_west_edit_settings_store,
		columns:[
			{
				header: '',
				dataIndex: "_layerId",
				hidden:true,
				hideable:false
			},
			{
				header: '',
				dataIndex: "_canChangeEditSettings",
				hidden:true,
				hideable:false
			},
			{
				header: '',
				dataIndex: "_layerLegend",
				hidden:false,
				sortable: true,
				width:35,
				maxWidth:35,
				minWidth:35,
				hideable:false,
				renderer:fn_gridLayerLegend
			},
			{
				header: _maptab_west_edit_settings_grid_column_layerTitle,
				dataIndex: "_layerTitle",
				hidden:false,
				hideable:false
			},
			{
				header: _maptab_west_edit_settings_grid_column_canCopy,
				dataIndex: "_canCopy",
				hidden:false,
				width:40,
				hideable:false,
				renderer:maptab_west_edit_settings_panel_check_renderer
			},
			{
				header: _maptab_west_edit_settings_grid_column_canTrace,
				dataIndex: "_canTrace",
				hidden:false,
				width:40,
				hideable:false,
				renderer:maptab_west_edit_settings_panel_check_renderer
			},
			{
				header: _maptab_west_edit_settings_grid_column_canSnapVertex,
				dataIndex: "_canSnapVertex",
				hidden:false,
				width:40,
				hideable:false,
				renderer:maptab_west_edit_settings_panel_check_renderer
			},
			{
				header: _maptab_west_edit_settings_grid_column_canSnapEdge,
				dataIndex: "_canSnapEdge",
				hidden:false,
				width:40,
				hideable:false,
				renderer:maptab_west_edit_settings_panel_check_renderer
			}
		]
	}]
}

function maptab_west_edit_settings_panel_check_renderer(value, metaData, record, row, col, store, gridView)
{
	var disabled="";
	
	var column = gridView.getHeaderAtIndex(col);
    
	var dataIndex = column.dataIndex;
	
	if (!record.get("_canChangeEditSettings"))
	{
		disabled="disabled";
	}

	if (value)
	return "<input type=\"checkbox\" checked "+disabled+" value=\""+value+"\" onclick=\"maptab_west_edit_settings_panel_oncheck(this,'"+dataIndex+"','"+record.get("_layerId")+"');\"></input>";
	else
	return "<input type=\"checkbox\" "+disabled+" value=\""+value+"\" onclick=\"maptab_west_edit_settings_panel_oncheck(this,'"+dataIndex+"','"+record.get("_layerId")+"');\"></input>";
}

function maptab_west_edit_settings_panel_oncheck(item,_canDoField,_layerId)
{
	var _layer=mapFindLayerById(_layerId);
	
	_layer._layerObject[_canDoField]=item.checked;
	
	init_maptab_west_edit_settings_snapping_controls();
	
	maptab_toolbar_edit_toggle_btns_can_copy();
	
}

function init_maptab_west_edit_settings_grid_store_populate()
{
	mapOnRemoveLayer(maptab_west_edit_settings_grid_on_add_remove_layer);
	
	mapOnAddLayer(maptab_west_edit_settings_grid_on_add_remove_layer);
	
	mapOnChangeLayer(maptab_west_edit_settings_grid_on_change_layer_visibility);
	
	Ext.getCmp("maptab_toolbar_edit_choose_layer").on("select",init_maptab_west_edit_settings_snapping_controls);
}


function init_maptab_west_edit_settings_snapping_controls()
{
	Ext.getCmp("maptab_west_edit_settings_grid").store.each(function(item){
	
		if (maptab_edit_controls)
		{
			maptab_edit_controls["snapping"].removeTargetLayer(mapFindLayerById(item.get("_layerId")));
			
			if (mapFindLayerById(item.get("_layerId"))._layerObject._visibility)
			{
				var _target={
					tolerance:10,
					layer:mapFindLayerById(item.get("_layerId")),
					vertex:mapFindLayerById(item.get("_layerId"))._layerObject._canSnapVertex,
					edge:mapFindLayerById(item.get("_layerId"))._layerObject._canSnapEdge,
					node:mapFindLayerById(item.get("_layerId"))._layerObject._canSnapVertex
				};
					
				maptab_edit_controls["snapping"].addTarget(_target);
				
				if(maptab_edit_layer)
				{
					if (item.get("_layerId")==maptab_edit_layer._layerObject._layerId)
					{
						if (mapFindLayerById(item.get("_layerId"))._layerObject._canTrace)
						{
							maptab_edit_active_trace();
						}else
						{
							maptab_edit_deactive_trace();
						}
					}
				}
			}
		}
	});
}

function maptab_west_edit_settings_enable_trace()
{
	maptab_edit_controls["drawpolygon"].handler.freehand=mapFindLayerById(item.get("_layerId"))._layerObject._canTrace;

	maptab_edit_controls["drawline"].handler.freehand=mapFindLayerById(item.get("_layerId"))._layerObject._canTrace;
}

function maptab_west_edit_settings_grid_on_add_remove_layer()
{
	maptab_west_edit_settings_store.removeAll();

	var overlayers=mapGetlayersBy("isBaseLayer",false);

	for(var i=(overlayers.length-1);i>=0;i--)
	{
		if (typeof overlayers[i]._layerObject!=="undefined")
		{
			if (overlayers[i]._layerObject._isEditable)
			{
				
				maptab_west_edit_settings_store.add({
					_layerId:overlayers[i]._layerObject._layerId,
					_canChangeEditSettings:overlayers[i]._layerObject._canChangeEditSettings,
					_layerLegend:overlayers[i]._layerObject._layerLegend,
					_layerTitle:overlayers[i]._layerObject._layerTitle,
					_canCopy:overlayers[i]._layerObject._canCopy,
					_canTrace:overlayers[i]._layerObject._canTrace,
					_canSnapVertex:overlayers[i]._layerObject._canSnapVertex,
					_canSnapEdge:overlayers[i]._layerObject._canSnapEdge
				});
				
				init_maptab_west_edit_settings_snapping_controls();
			}
		}
	}
}

function maptab_west_edit_settings_grid_on_change_layer_visibility(event)
{
	if (event.property=="visibility")
	{
		Ext.getCmp("maptab_toolbar_edit_polygon").toggle(false);
	
		init_maptab_west_edit_settings_snapping_controls();
	}
}
