var map_controlsSearchTTbar;

map_controlsSearchTTbar=[
	{
		xtype:'button',
		iconCls:'search',
		tooltip:map_search_button_tooltip,
		handler:function(){
			map_searchWindow.show();
		}
	},
	{xtype: 'tbseparator'},
	{	
		xtype:'button',
		iconCls:'search_polygon',
		id:'map_search_area_polygon_id',
		tooltip:map_search_controls_drawpolygon,
		handler:function(btn,pressed)
		{
			
			Ext.getCmp('controls_map_zoombyarea_id').toggle(0,false);
			
			if (Ext.getCmp('map_search_area_geom_criteria').getValue()=="")
			{
				Ext.getCmp('map_search_area_geom_criteria').setValue(Ext.getCmp('map_search_area_geom_criteria').getStore().getAt(0).get('value'));
			}
				
			map_search_area_vector.destroyFeatures();
			map_search_area_drawControls["polygon"].activate();
				
		}
	},
	{	
		xtype:'button',
		iconCls:'search_line',
		tooltip:map_search_controls_drawline,
		id:'map_search_area_line_id',
		handler:function(btn,pressed)
		{
			Ext.getCmp('controls_map_zoombyarea_id').toggle(0,false);
		
			map_search_area_layer_epsgs=new Array();
			
			if (Ext.getCmp('map_search_area_geom_criteria').getValue()=="")
			{
				Ext.getCmp('map_search_area_geom_criteria').setValue(Ext.getCmp('map_search_area_geom_criteria').getStore().getAt(1).get('value'));
			}
				
			map_search_area_vector.destroyFeatures();
			map_search_area_drawControls["line"].activate();
		}
	},
	{	
		xtype:'button',
		iconCls:'search_bbox',
		tooltip:map_search_controls_drawBBOX,
		id:'map_search_area_bbox_id',
		handler:function(btn,pressed)
		{
			Ext.getCmp('controls_map_zoombyarea_id').toggle(0,false);
		
			map_search_area_layer_epsgs=new Array();
			
			if (Ext.getCmp('map_search_area_geom_criteria').getValue()=="")
			{
				Ext.getCmp('map_search_area_geom_criteria').setValue(Ext.getCmp('map_search_area_geom_criteria').getStore().getAt(0).get('value'));
			}
				
			map_search_area_vector.destroyFeatures();
			map_search_area_drawControls["box"].activate();
		}
	},
	{
		xtype:'button',
		iconCls:'search_clear',
		tooltip:map_search_map_clear,
		id:'map_search_area_clear_id',
		handler: function(btn,pressed)
		{
			map_search_area_layer_epsgs=new Array();
		
			map_search_area_vector.destroyFeatures();
			map_search_area_geometry="";
			
		}
		
	},
	{xtype: 'tbseparator'},
	{
		xtype:'combo',
		loadMask:true,
		autoScroll:true,
		autoShow: true,
		width:200,
		id:'map_search_area_geom_criteria',
		emptyText:map_search_geom_criteria_combo_emptyText,
		store: new Ext.data.SimpleStore({
		fields: ['value','name'],
			data: [["INTERSECTS",map_search_geom_criteria_combo_INTERSECTS],["CROSSES",map_search_geom_criteria_combo_CROSSES],["WITHIN",map_search_geom_criteria_combo_WITHIN]]
		}), 
		displayField: 'name',
		valueField: 'value',
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false
	},
	{xtype:'tbseparator'},
	{
		xtype:'button',
		tooltip:map_search_area_btn_show_result_list_tooltip,
		iconCls:'search_show_result_list',
		handler:function(){
			map_searchArea_window.show();
		}
	
	}];