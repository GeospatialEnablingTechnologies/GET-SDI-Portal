

var metadatatab_center_items = {
	xtype:'panel',
	layout:'border',
	items:[
		{
			xtype:'panel',
			region:'center',
			layout:'border',
			tbar:metadatatab_toolbar_general,
			border:false,
			items:[
				{
					xtype:'panel',
					region:'center',
					layout:'fit',
					id:'metadatatab_mapPanel',
					html:'<div id=\'metadatatab_map\' style=\'width:100%;height:100%\'></div>',
					listeners:{
						resize:function(){
							if(typeof metadata_map!=="undefined")
							{
								metadata_map.updateSize();
							}
						}
					}
				}
			]
		},
		{
			xtype:'panel',
			region:'south',
			id:'metadatatab_south',
			border:false,
			collapsible: true,
			collapsed: true,
			layout:'fit',
			split:true,
			height:200,
			items:[{
				xtype:'tabpanel',
				id:'metadatatab_south_tabpanel',
				layout:'fit',
				items:[metadata_search_results_grid_var]
			}]
		}
	]
};

var metadatatab={
	xtype:'panel',
	layout:'border',
	border:false,
	items:[
		{
			xtype:'panel',
			region:'center',
			border:false,
			layout:'fit',
			items:[metadatatab_center_items],
			listeners:{
				afterrender:function()
				{
					init_metadata_map();
				}
			}
		},
		{
			xtype:'panel',
			id:'metadatatab_west',		
			region:'west',
			layout:'accordion',
			border:false,
			collapsible: true,
			collapsed: false,
			split:true,
			width:360,
			items:[
				metadatatab_west_form_panel
			]
		}
	]
};