var maptab_west_search_settings_store=Ext.create('Ext.data.Store', {
	fields: ['_layerId','_canChangeSearchSettings','_layerLegend','_layerTitle','_isSearchable','_isQueryable'],
	data: []
});


var maptab_west_search_settings_panel ={
	xtype:'panel',
	id:'maptab_west_search_settings_panel',
	title:_maptab_west_search_settings_panel,
	region:'center',
	autoScroll:true,
	layout:'fit',
	iconCls:'maptab_accordion_icon',
	items:[{
		xtype:'gridpanel',
		border:true,
		columnLines:true,
		split: true,
		id:'maptab_west_search_settings_grid',
		store:maptab_west_search_settings_store,
		columns:[
			{
				header: '',
				dataIndex: "_layerId",
				hidden:true,
				hideable:false
			},
			{
				header: '',
				dataIndex: "_canChangeSearchSettings",
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
				header: _maptab_west_search_settings_grid_column_layerTitle,
				dataIndex: "_layerTitle",
				hidden:false,
				hideable:false
			},
			{
				header: "<input type=\"checkbox\" onclick=\"maptab_west_search_settings_panel_checkall_searchable(this);\" checked></input>"+_maptab_west_search_settings_grid_column_isSearchable,
				dataIndex: "_isSearchable",
				sortable:false,
				hidden:false,
				width:40,
				flex:2,
				hideable:false,
				renderer:maptab_west_search_settings_panel_check_renderer
			},
			{
				header: "<input type=\"checkbox\" onclick=\"maptab_west_search_settings_panel_checkall_queryable(this);\" checked ></input>"+_maptab_west_search_settings_grid_column_isQueryable,
				dataIndex: "_isQueryable",
				sortable:false,
				hidden:false,
				flex:2,
				width:40,
				hideable:false,
				renderer:maptab_west_search_settings_panel_check_renderer
			}
		]
	}]
}

function maptab_west_search_settings_panel_checkall_queryable(item)
{
	
	var _g = Ext.getCmp("maptab_west_search_settings_grid");
	
	for (var i = 0; i < _g.getStore().data.length; i++) { 
	
		var record = _g.getStore().getAt(i);
		
		record.data._isQueryable=item.checked;
		
		var _layerId = record.data._layerId;
		
		maptab_west_search_settings_panel_oncheck(item,"_isQueryable",_layerId);
		
	}
	
	_g.getView().refresh();
}

function maptab_west_search_settings_panel_checkall_searchable(item)
{
	var _g = Ext.getCmp("maptab_west_search_settings_grid");
	
	for (var i = 0; i < _g.getStore().data.length; i++) { 
	
		var record = _g.getStore().getAt(i);
		
		record.data._isSearchable=item.checked;
		
		var _layerId = record.data._layerId;
		
		maptab_west_search_settings_panel_oncheck(item,"_isSearchable",_layerId);
	}
	
	_g.getView().refresh();
}

function maptab_west_search_settings_panel_check_renderer(value, metaData, record, row, col, store, gridView)
{
	var disabled="";
	
	var column = gridView.getHeaderAtIndex(col);
    
	var dataIndex = column.dataIndex;
	
	if (value)
	return "<input type=\"checkbox\" checked  value=\""+value+"\" onclick=\"maptab_west_search_settings_panel_oncheck(this,'"+dataIndex+"','"+record.get("_layerId")+"');\"></input>";
	else
	return "<input type=\"checkbox\"  value=\""+value+"\" onclick=\"maptab_west_search_settings_panel_oncheck(this,'"+dataIndex+"','"+record.get("_layerId")+"');\"></input>";
}

function maptab_west_search_settings_panel_oncheck(item,_canDoField,_layerId)
{
		
	var _layer=mapFindLayerById(_layerId);
	
	_layer._layerObject[_canDoField]=item.checked;
	
}

function init_maptab_west_search_settings_grid_store_populate()
{
	mapOnRemoveLayer(maptab_west_search_settings_grid_on_add_remove_layer);
	
	mapOnAddLayer(maptab_west_search_settings_grid_on_add_remove_layer);
}

function maptab_west_search_settings_grid_on_add_remove_layer()
{
	maptab_west_search_settings_store.removeAll();

	var overlayers=mapGetlayersBy("isBaseLayer",false);

	for(var i=(overlayers.length-1);i>=0;i--)
	{
		if (typeof overlayers[i]._layerObject!=="undefined")
		{
			if (overlayers[i]._layerObject._canChangeSearchSettings)
			{
				maptab_west_search_settings_store.add({
					_layerId:overlayers[i]._layerObject._layerId,
					_canChangeSearchSettings:overlayers[i]._layerObject._canChangeSearchSettings,
					_layerLegend:overlayers[i]._layerObject._layerLegend,
					_layerTitle:overlayers[i]._layerObject._layerTitle,
					_isSearchable:overlayers[i]._layerObject._isSearchable,
					_isQueryable:overlayers[i]._layerObject._isQueryable
				});
			}
		}
	}
}
