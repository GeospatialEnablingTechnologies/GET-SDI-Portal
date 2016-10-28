var metadatatab_toolbar_general=[
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_pan_Left',
		iconCls:'maptab_toolbar_general_pan_left',
		tooltip:_metadatatab_toolbar_general_pan_Left,
		handler:function(){
		
			metadata_map_controls.pan.direction="West";
			metadata_map_controls.pan.trigger();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_pan_Up',
		iconCls:'maptab_toolbar_general_pan_up',
		tooltip:_metadatatab_toolbar_general_pan_Up,
		handler:function(){
		
			metadata_map_controls.pan.direction="North";
			metadata_map_controls.pan.trigger();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_pan_Down',
		iconCls:'maptab_toolbar_general_pan_down',
		tooltip:_metadatatab_toolbar_general_pan_Down,
		handler:function(){
		
			metadata_map_controls.pan.direction="South";
			metadata_map_controls.pan.trigger();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_pan_right',
		iconCls:'maptab_toolbar_general_pan_right',
		tooltip:_metadatatab_toolbar_general_pan_Right,
		handler:function(){
		
			metadata_map_controls.pan.direction="East";
			metadata_map_controls.pan.trigger();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_pan',
		iconCls:'maptab_toolbar_general_pan',
		enableToggle: true,
		pressed:true,
		tooltip:_metadatatab_toolbar_general_pan,
		toggleHandler:function(item,state){

			if (state)
			{
				metadata_map_controls.pan.activate();
			}else
			{
				metadata_map_controls.pan.deactivate();
			}
		}
	},
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_zoomIn',
		iconCls:'maptab_toolbar_general_zoomIn',
		tooltip:_metadatatab_toolbar_general_zoomIn,
		handler:function(){
			
			metadata_map.zoomIn();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_zoomOut',
		iconCls:'maptab_toolbar_general_zoomOut',
		tooltip:_metadatatab_toolbar_general_zoomOut,
		handler:function(){
			
			metadata_map.zoomOut();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_zoomByArea',
		iconCls:'maptab_toolbar_general_zoomByArea',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_metadatatab_toolbar_general_zoomByArea,
		toggleHandler :function(item,state){
			
			if (state)
			{
				metadata_map_controls.zoomByArea.activate();
			}else
			{
				metadata_map_controls.zoomByArea.deactivate();
			}
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_extent',
		iconCls:'maptab_toolbar_general_extent',
		tooltip:_metadatatab_toolbar_general_extent,
		handler:function(){
			metadata_map.zoomToMaxExtent();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_zoomPrevious',
		iconCls:'maptab_toolbar_general_zoomPrevious',
		tooltip:_metadatatab_toolbar_general_zoomPrevious,
		handler:function(){
			
			metadata_map_controls.navigationHistory.previousTrigger();
		}
	},
	{
		xtype:'button',
		id:'metadatatab_toolbar_general_zoomNext',
		iconCls:'maptab_toolbar_general_zoomNext',
		tooltip:_metadatatab_toolbar_general_zoomNext,
		handler:function(){
			
			metadata_map_controls.navigationHistory.nextTrigger();
		}
	}
];

function fn_metadatatab_toolbar_general_handle_zoom_in_out()
{

	if (metadataMapGetZoom()<=0)
	{
		Ext.getCmp("metadatatab_toolbar_general_zoomIn").enable();
		Ext.getCmp("metadatatab_toolbar_general_zoomByArea").enable();
		Ext.getCmp("metadatatab_toolbar_general_zoomOut").disable();
	}
	else if (metadataMapGetZoom()==(metadataMapZoomLevels()-1))
	{
		Ext.getCmp("metadatatab_toolbar_general_zoomIn").disable();
		Ext.getCmp("metadatatab_toolbar_general_zoomByArea").disable();
		Ext.getCmp("metadatatab_toolbar_general_zoomOut").enable();
	}
	else
	{
		Ext.getCmp("metadatatab_toolbar_general_zoomIn").enable();
		Ext.getCmp("metadatatab_toolbar_general_zoomByArea").enable();
		Ext.getCmp("metadatatab_toolbar_general_zoomOut").enable();
	}
	
}

