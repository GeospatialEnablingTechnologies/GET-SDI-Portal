/*version message*/

 var mapTopControlTabs = new Ext.TabPanel({
        activeTab: 0,
		border:false,
		id:'map_north_tabs',
        items:[
			{
                title: map_controls_tab_general,
				xtype:'toolbar',
				id:'map_controls_tab_general_id',
				height:26,
				border:false,
                items:[map_controlsTTbar]
            },{
                title: map_controls_tab_search,
				xtype:'toolbar',
				id:'map_controls_tab_search_id',
				height:26,
				border:false,
				items:[map_controlsSearchTTbar]
            }
        ]
    });

 var mapSouthTabs = new Ext.TabPanel({
        activeTab: 0,
        plain:false,
		id:'map_south_tabs',
		enableTabScroll:true
    });

var mapViewport=[{
	xtype: 'panel',
	layout:'border',
	border:false,
	items:[{
			xtype: 'panel',
			border:false,
			region: 'west',
			id:'map_panel',
			title:title_mapTab_Panel,
			width: 300,
			layout: 'accordion',
			split: true,
			collapsible: true,
			resizable:true,
			activeItem: 0,
			layoutConfig: {
				animate: true,
				sequence: true
			},
			items:[
				mapTree,
				mapSearchMetadata,
				mapSearchService,
				mapGoogle,
				addToSelected,
				mapSettings
			],
			listeners:{
				resize:function(){
				
					if(typeof map!=="undefined")
					map.updateSize();
				}
			}
		},
		{
			xtype:'panel',
			region:'center',
			layout:'border',
			id:'map_tab_borders_id',
			border:false,
			resizable:true,
			items:[
				{
					xtype:'panel',
					border:false,
					region:'north',
					items:[mapTopControlTabs],
					listeners:{
						resize:function(){
							if(typeof map!=="undefined")
							map.updateSize();
						}
					}
				},
				{
					xtype:'panel',
					region:'center',
					id:'center_region',
					border:false,
					resizable:true,
					layout:'fit',
					bbar:[
					{
						xtype:'label',
						text:map_scale_combo_fieldtext,
						id:'map_scale_combo_label'
					},
					{
						xtype:'combo',
						loadMask:true,
						autoScroll:true,
						autoShow: true,
						width:100,
						id:'map_scale_combo',
						store:new Ext.data.SimpleStore({
							fields: ['value','name'],
							data: map_scales
						}),
						displayField: 'name',
						valueField: 'value',
						forceSelection: true,
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: false,
						listeners:{
							select:function(combo,record){
								map.zoomToScale(record.data.value);
							}
						}
					},
					'->',
					{
						xtype:'label',
						id:'map_label_currentScale_text_id'
						
					},
					{xtype: 'tbseparator'},
					{
						xtype:'label',
						id:'map_label_currentProjection_text_id'
						
					},
					{xtype: 'tbseparator'},
					{
						xtype:'label',
						id:'map_label_mouseposition_text_id',
						text:map_mouseposition_fieldtext+" ("+map_currentDisplayProjection+"): "
						
					},
					{
						xtype:'label',
						id:'map_label_mouseposition_id'
						
					},
					{xtype: 'tbseparator'},
					{
						xtype:'label',
						html:"GET SDI Portal is powered by <a href='http://www.getmap.eu' target='new'>GET Ltd</a>"
					
					}],
					items:[{
							xtype:'panel',
							id:'map_center_panel',
							html:"<div id='map_region'></div>"
						}
					],
					listeners:{
						resize:function(){
							if(typeof map!=="undefined")
							map.updateSize();
							
							if (typeof Ext.getCmp('ge_panel')!=="undefined")
							{
								var geh=Ext.getCmp('center_region').getHeight();
					
								Ext.getCmp('ge_panel').setHeight(geh);
							}
			
						}
					}
				},
				{
					xtype:'panel',
					region:'south',
					id:'map_south_region',
					height:200,
					collapsible: true,
					collapsed:true,
					border:true,
					split: true,
					layout: 'fit',
					items:[mapSouthTabs],
					listeners:{
						expand:function(){
						
						},
						resize:function(){
						
							if(typeof map!=="undefined")
							map.updateSize();
						}
					}
				}]
		}]
	}];
	

