
/*version message*/

 var metadata_mapSouthTabs = new Ext.TabPanel({
        activeTab: 0,
        plain:false,
		id:'metadata_map_South_Tabs',
		enableTabScroll:true,
		items:[m_left_metadata_search_column]
    });

var metadataViewport=[{
	xtype: 'panel',
	layout:'border',
	items:[{
			xtype: 'panel',
			border:true,
			region: 'west',
			title:title_mapTab_Panel,
			width: 480,
			layout:'border',
			resizable:true,
			collapsible: true,
			items:[m_left_metadata_search_accordion]
		},
		{
			xtype:'panel',
			region:'center',
			layout:'border',
			border:false,
			items:[
				{
					xtype:'panel',
					html:"<div id='m_map_region' ></div>",
					region:'center',
					border:true,
					tbar:[map_metadata_controlsTTbar]
				},
				{
					xtype:'panel',
					region:'south',
					id:'metadata_map_south_region',
					height:300,
					collapsible: true,
					collapsed:true,
					border:true,
					split: true,
					layout: 'fit',
					items:[metadata_mapSouthTabs],
					listeners:{
						expand:function(){
							if(typeof map_metadata!=="undefined")
							map_metadata.updateSize();
						
						},
						resize:function(){
						
							if(typeof map_metadata!=="undefined")
							map_metadata.updateSize();
						}
					}
				}
				]
		}]
	}];



