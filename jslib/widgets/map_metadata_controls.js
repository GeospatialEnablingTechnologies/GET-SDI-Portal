/*version message*/

var map_metadata_Zoom_ByArea_var;
var map_metadata_controlsTTbar;
var toggleGroupMap_Metadata="map_metadata_controls";
var toogle_getinfo=false;

map_metadata_controlsTTbar=[
	{	
		xtype:'button',
		iconCls:'controls_map_pan',
		tooltip:map_metadata_Pan_tooltip,
		enableToggle: true,
		toggleGroup:toggleGroupMap_Metadata,
		toggleHandler:function(btn,pressed)
		{
			
		}
	},
	{	
		xtype:'button',
		iconCls:'controls_map_zoombyarea',
		tooltip:map_metadata_Zoom_ByArea_tooltip,
		enableToggle: true,
		toggleGroup:toggleGroupMap_Metadata,
		toggleHandler:function(btn,pressed)
		{
			if (btn.pressed)
			{
				map_metadata_Zoom_ByArea_var=new OpenLayers.Control.ZoomBox();
	
				mapPanel_metadata.map.addControl(map_metadata_Zoom_ByArea_var);

				map_metadata_Zoom_ByArea_var.activate();
			}
			else
			{
				map_metadata_Zoom_ByArea_var.deactivate();
			}
		}
		
	},
	{
		xtype:'button',
		iconCls:'controls_map_zoomtomapextent',
		tooltip:map_metadata_ZoomMaxExtent_tooltip,
		handler:function(){
	
			map_metadata.zoomToMaxExtent();			
			
		}
	}
];


