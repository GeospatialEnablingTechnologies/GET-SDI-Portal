/************maptab.js*****************************/
/**** creates and initialize the map tab panel ****/
/**** of the viewport *****************************/

/******(ext obj) maptab_north_tabpanel: creates the search and *****/
/****** print toolbars of the map panel  ***************************/
var maptab_north_tabpanel=
{
	xtype:'tabpanel',
	id:'maptab_north_tabpanel',
	region:'center',
	border:false,
	items:[
		{
			xtype:'toolbar',
			border:false,
			id:'maptab_toolbar_navigation_tab',
			iconCls:'maptab_toolbar_navigation',
			items:maptab_toolbar_navigation,
			title:_maptab_maptab_north_tabpanel_navigation
		},
		{
			xtype:'toolbar',
			border:false,
			id:'maptab_toolbar_search_tab',
			iconCls:'maptab_toolbar_search',
			items:maptab_toolbar_search,
			title:_maptab_maptab_north_tabpanel_search
		},
		{
			xtype:'toolbar',
			border:false,
			id:'maptab_toolbar_measurements_tab',
			iconCls:'maptab_toolbar_general_measureDistance',
			title:_maptab_maptab_north_tabpanel_measurements,
			items:maptab_toolbar_general_measurement_tools
		},
		{
			xtype:'toolbar',
			border:false,
			iconCls:'maptab_toolbar_general_print',
			id:'maptab_toolbar_print_tab',
			title:_maptab_maptab_north_tabpanel_print
		}
		
	]
	
};


/******(ext obj) maptab_center_items: creates the panels *****/
/****** of the map tab center panel  *************************/
var maptab_center_items = {
	xtype:'panel',
	layout:'border',
	items:[
		{
			xtype:'panel',
			region:'center',
			id:'maptab_center',
			layout:'border',
			border:false,
			items:[
				{
					xtype:'panel',
					layout:'border',
					border:false,
					region:'north',
					height:54,
					items:[
						/*{
							xtype:'toolbar',
							region:'north',
							border:false,
							id:'maptab_toolbar_north'
						},*/
						maptab_north_tabpanel
					]
				},
				{
					xtype:'panel',
					region:'center',
					layout:'fit',
					border:false,
					id:'maptab_mapPanel',
					html:'<div id=\'maptab_map\' style=\'width:100%;height:100%\'><a href=\'http://www.getmap.eu\' target=\'new\'><img src=\''+host+'images/logos/rbBanner.png\' class=\'rbLogo\'></a></div>',
					listeners:{
						resize:function(){
							if(typeof map!=="undefined")
							{
								map.updateSize();
							}
						}
					}
				}
			]
		},
		{
			xtype:'panel',
			region:'south',
			id:'maptab_south',
			border:false,
			title:_viewport_south_title,
			collapsible: true,
			collapsed: true,
			layout:'fit',
			split:true,
			height:200,
			items:[{
				xtype:'tabpanel',
				id:'maptab_south_tabpanel',
				layout:'fit',
				plugins: [{
                    ptype: 'tabclosemenu',
					closeAllTabsText: _tab_close_menu_close_all_tabs,
					closeOthersTabsText: _tab_close_menu_close_other_tabs,
					closeTabText: _tab_close_menu_close_this_tab
                }]
			}]
		},
		{
			xtype:'panel',
			region:'north',
			border:false
		},
		{
			xtype:'panel',
			region:'east',
			id:'maptab_east',
			layout:'border',
			title:_viewport_east_title,
			border:false,
			collapsible: true,
			collapsed: true,
			split:true,
			width:340,
			items:[
				{
					xtype:'panel',
					region:'north',
					border:false,
					layout:'fit',
					id:'maptab_east_north',
					split:true,
					height:200,
					hidden:true,
					items:[{
						xtype:'panel',
						layout:'fit',
						title:_maptab_featureInfoWindow_title,
						closable:true,
						closeAction:'hide',
						id:'maptab_east_north_panel',
						tools:[{
							type:'maximize',
							handler: function(event, toolEl, panelHeader) {
								
								Ext.getCmp("maptab_east_north").hide();
								
								featureInfoWindow_isMinimized=false;
								
								var i=fn_featureInfoWindow(Ext.getCmp("maptab_east_north_panel").items.items[0]._feature);
								
								i.show();
							}
						}],
						listeners:{
							hide:function()
							{
								Ext.getCmp("maptab_east_north").hide();
							}
						}
					}]
				},
				{
					xtype:'panel',
					region:'center',
					id:'maptab_east_south',
					layout:'accordion',
					items:[
						maptab_east_search_panel,
						maptab_west_search_settings_panel
					]				
				}
			]
		}
		
	]
};

/******(ext obj) maptab: creates the panels *****/
/****** of the map tab panel  *******************/
var maptab={
	xtype:'panel',
	layout:'border',
	border:false,
	items:[
		{
			xtype:'panel',
			region:'center',
			border:false,
			layout:'fit',
			items:[maptab_center_items]
		},
		{
			xtype:'panel',
			id:'maptab_west',		
			region:'west',
			plain:true,
			layout:'accordion',
			border:false,
			title:_maptab_maptab_west,
			collapsible: true,
			collapsed: false,
			split:true,
			width:420,
			items:[
				maptab_west_layer_tree_panel,
				maptab_west_selection_panel,
				maptab_west_general_settings_panel
			]
		}
	]
};