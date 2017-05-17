init_onload_fn.push(init_adminfn);

function init_adminfn()
{
	Ext.getCmp("maptab_east_south").add(maptab_east_edit_copy_panel);
	
	Ext.getCmp("maptab_west").add(maptab_west_edit_settings_panel);
	
	
	var maptab_north_tabpanel_edit_tab = {
			xtype:'toolbar',
			border:false,
			iconCls:'features_toolbar_edit',
			id:'maptab_toolbar_edit_tab',
			items:maptab_toolbar_edit,
			title:_maptab_maptab_north_tabpanel_edit
		}
	
	Ext.getCmp("maptab_north_tabpanel").insert(1, maptab_north_tabpanel_edit_tab);
	
	init_maptab_toolbar_edit_choose_layer_store_populate();

	init_maptab_west_edit_settings_grid_store_populate();
	
	init_maptab_edit_history_grid();
	
}