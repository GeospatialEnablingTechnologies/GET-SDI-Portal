/*version message*/

 
var mapSettings=[{
	xtype:'panel',
	region:'center',
	autoScroll:true,
	iconCls:'mapTree_icon16',
	width:260,
	title:title_mapSettings,
	items:[	{
            xtype:'fieldset',
            defaultType: 'textfield',
            items :[{
					xtype: 'fieldset',
					title: title_mapSettings_General,
					items:[{
							xtype: 'checkbox',
							fieldLabel: title_mapSettings_Top_Banner,
							checked:true,
							handler:function(checkbox)
							{
								if (checkbox.checked)
								{
									
									Ext.getCmp('north_id').expand(true);
								}
								else
								{
									Ext.getCmp('north_id').collapse(true);
								}
							}
						}]
				},{
			xtype: 'fieldset',
            title: title_mapSettings_Graticule,
			items:[
				
				{
					xtype: 'checkbox',
					fieldLabel: title_mapSettings_Grid,
					handler:function(checkbox)
					{
						if (checkbox.checked)
						{
							mapGraticule.activate();
						}
						else
						{
							mapGraticule.deactivate();
						}
					}
				}]
			},
			
			{
				xtype: 'fieldset',
                title: title_mapSettings_Scale,
				items:[{
					xtype: 'combo',
					fieldLabel: title_mapSettings_ScaleMetric,
					width: 80,
					store: new Ext.data.SimpleStore({
						id:0,
						fields:['id','value'],
						data:[["metric","metric"],["english","english"]]
					}),
					valueField:'id',
					displayField:'value',
					value: 'metric',
					mode:'local',
					editable: false,
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: false,
					listeners:{select:{fn:function(combo, value) {
						mapScaleBar.displaySystem = combo.getValue();
						mapScaleBar.update();
					}}}
				},
				{
					xtype: 'combo',
					fieldLabel: title_mapSettings_Major_Divisions,
					width: 40,
					store: new Ext.data.SimpleStore({
						id:0,
						fields:['id','value'],
						data:[[1,"1"],[2,"2"],[3,"3"],[4,"4"]]
					}),
					valueField:'id',
					displayField:'value',
					value: 2,
					mode:'local',
					editable: false,
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: false,
					listeners:{select:{fn:function(combo, value) {
						mapScaleBar.divisions=combo.getValue();
						mapScaleBar.update();
					}}}
				},
				{
					xtype: 'combo',
					fieldLabel: title_mapSettings_Subivisions,
					width: 40,
					store: new Ext.data.SimpleStore({
						id:0,
						fields:['id','value'],
						data:[[1,"1"],[2,"2"],[3,"3"],[4,"4"]]
					}),
					valueField:'id',
					displayField:'value',
					mode:'local',
					value: 2,
					editable: false,
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: false,
					listeners:{select:{fn:function(combo, value) {
						mapScaleBar.subdivisions =combo.getValue();
						mapScaleBar.update();
					}}}
				},
				{
					xtype: 'checkbox',
					fieldLabel: title_mapSettings_Abbreviation,
					handler:function(checkbox)
					{
						if (checkbox.checked)
						{
							mapScaleBar.abbreviateLabel=true;
							mapScaleBar.update();
						}
						else
						{
							mapScaleBar.abbreviateLabel=false;
							mapScaleBar.update();
						}
					}
				},
				{
					xtype: 'checkbox',
					fieldLabel: title_mapSettings_Showsubdivision,
					handler:function(checkbox)
					{
						if (checkbox.checked)
						{
							mapScaleBar.showMinorMeasures=true;
							mapScaleBar.update();
						}
						else
						{
							mapScaleBar.showMinorMeasures=false;
							mapScaleBar.update();
						}
					}
				},
				{
					xtype: 'checkbox',
					fieldLabel: title_mapSettings_Single_Line,
					handler:function(checkbox)
					{
						if (checkbox.checked)
						{
							mapScaleBar.singleLine=true;
							mapScaleBar.update();
							problemWindow();
							getsdiStyler.show();
						}
						else
						{
							mapScaleBar.singleLine=false;
							mapScaleBar.update();
						}
					}
				}]
            },
			{
			
			
				xtype: 'fieldset',
                title: title_mapSettings_Display_Projection,
				items:[{
					xtype: 'combo',
					fieldLabel: title_mapSettings_Choose_Projection,
					width: 130,
					store: new Ext.data.SimpleStore({
						fields: ['value'],
						data: map_ctrls_projection_systemsArr
					}), 
					displayField: 'value',
					valueField: 'value',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: false,
					mode: 'local',
					emptyText:map_currentDisplayProjection,
					value: map_currentDisplayProjection,
					editable: false,
					listeners:{select:{fn:function(combo, value) {
						map.setOptions({displayProjection:new OpenLayers.Projection(combo.getValue())});
						map.removeControl(map_mousePosCtr);
						
						var digitNum=map_display_default_digit_format;
						
						for(var i=0;i<map_display_epsg_digit_format.length;i++)
						{
							var item=map_display_epsg_digit_format[i];
							
							if (item.epsg===combo.getValue())
							{
								digitNum=item.digits;
							}
						}
						
						map_mousePosCtr=new OpenLayers.Control.MousePosition({div: document.getElementById("map_label_mouseposition_id"),numDigits:digitNum});
						map.addControl(map_mousePosCtr);
						map_currentDisplayProjection=combo.getValue();
						Ext.getCmp('map_label_mouseposition_text_id').setText(map_mouseposition_fieldtext+" ("+map_currentDisplayProjection+"): ");
					}}}
				}]
			}]
	  
	  }]
}];
