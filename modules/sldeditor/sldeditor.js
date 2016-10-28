var sldeditor={};

var sldeditor_criteria_count=0;

var sleditor_edit_mode=false;

_maptab_west_layer_layer_menu_components.push({
	text:_sdleditor_context_menu_title,
	listeners:{
		render:function()
		{
			
		}
	},
	handler:function()
	{
		sleditor_edit_mode=false;
	
		var _w=sldeditor_window(this.ownerCt._nodeId,'');
		
		sldeditor_criteria_count=0;
		
		_w.show();
		
		sldeditor_read_sld_rule(mapFindLayerById(this.ownerCt._nodeId)._layerObject._sld_body,this.ownerCt._nodeId);
	}

});

function sldeditor_window(_layerId,_ruleId)
{
	var _t=sldeditor_rule_form(_layerId,_ruleId);
	
	var _l=sldeditor_rule_list(_layerId,_ruleId);

	var _w=new Ext.Window({ 
		resizable:{
			listeners:{
				resize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().unmask();
				},
				beforeresize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().mask();
				}
			}
		},
		minimizable:true,
		constrain:true,
		listeners:{
			show: function(window, eOpts) {
				window.tools.restore.hide();
				window.doLayout();
            },
			"minimize": function (window, opts) {
				window.tools.restore.show();
				window.tools.minimize.hide();
                window.collapse();
            }
		},
        tools: [{
            type: 'restore',
            handler: function (evt, toolEl, owner, tool) {
                var window = owner.up('window');
				window.tools.restore.hide();
				window.tools.minimize.show();
                window.expand('', false);
            }
        }],
		width:740,
		height:560,
		minWidth:740,
		minHeight:560,
		modal:true,
		shim:true,
		constrain:true,
		id:'sdleditor_window',
		title:_sdleditor_context_menu_title,
		resizable:true,
		closeAction:'destroy',
		layout:'fit',
		items:[{
			xtype:'panel',
			layout:'border',
			id:'sdleditor_window_panel',
			items:[_l,_t]
		}]
	});
	
	return _w;

}

function sldeditor_rule_form(_layerId,_ruleId)
{
	var attrCombo=fn_createAttributesComboBox(mapFindLayerById(_layerId)._layerObject._attributesFields,'');

	attrCombo.store.insert(0,{
		_attributeName:"",
		_attributeTranslation:"",
		_attributeValue:"",
		_attributeType:""
	});
	
	attrCombo.setValue("");
	
	attrCombo.setFieldLabel(_sdleditor_tab_labels_attribute);
	
	attrCombo.anchor='100%';
	
	var _tabPanel=new Ext.tab.Panel({
		region:'center',
		border:false,
		id:'_sdleditor_tab_form',
		layout:'fit',
		bbar:['->',
		{
			xtype:'button',
			text:_sldeditor_add_rule,
			handler:function(){
				sldeditor_add_rule(_layerId);
			}
		},
		{
			xtype:'button',
			text:_sldeditor_delete_rule,
			handler:function(){
				
			}
		},
		{
			xtype:'button',
			text:_sldeditor_save_rule,
			handler:function(){
				sldeditor_save_rule(_layerId);
			}
		},
		{
			xtype:'button',
			text:_sldeditor_apply_to_layer,
			handler:function(){
				sldeditor_apply_to_layer(_layerId);
			}
		}
		],
		listeners:{
			tabchange:function(tabPanel, tab){

				if(tab.id=="sdleditor_tab_general_rule_sld")
				{					
					Ext.getCmp("sdleditor_tab_general_rule_sld_textarea").setValue(sldeditor_build_sld(_layerId,sldeditor_create_ruleSLD()));
				}
				if(tab.id=="sdleditor_tab_general_full_sld")
				{					
					Ext.getCmp("sdleditor_tab_general_full_sld_textarea").setValue(sldeditor_build_sld(_layerId,sldeditor_create_fullSLD()));
				}
			}
			
		},
		items:[
			{
				title:_sdleditor_tab_general_title,
				border:false,
				items:[{
					xtype:'form',
					margin:10,
					border:false,
					items:[
					{
						xtype: 'textfield',
						anchor:'100%',
						hidden:true,
						id:'sdleditor_tab_general_name_field',
						value:fn_id()
					},
					{
						xtype: 'textfield',
						anchor:'100%',
						id:'sdleditor_tab_general_title_field',
						fieldLabel:_sdleditor_tab_general_title_field
					},
					{
						xtype: 'textarea',
						anchor:'100%',
						id:'sdleditor_tab_general_description_field',
						fieldLabel:_sdleditor_tab_general_description_field
					},
					{
						xtype:'combo',
						id:'sdleditor_tab_general_geometry_type',
						fieldLabel:_sdleditor_tab_general_geometry_type,
						emptyText:'',
						displayField: 'name',
						valueField: 'value',
						forceSelection: true,
						anchor:'100%',
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: false,
						store: new Ext.data.SimpleStore({
							fields: ['name','value'],
							data: [
								[_sdleditor_tab_general_geometry_type_point,"PointSymbolizer"],
								[_sdleditor_tab_general_geometry_type_polygon,"PolygonSymbolizer"],
								[_sdleditor_tab_general_geometry_type_line,"LineSymbolizer"]
							]}
						),
						listeners:{
							select:function(combo,record){
							
								sldeditor_change_geometryType();
							}
						}
					},
					{
						xtype: 'fieldset',
						title:_sdleditor_tab_general_fieldset_styling,
						collapsible: false,
						hidden:true,
						id:'sdleditor_tab_general_fieldset_styling',
						anchor:'100%'
					}]
				
				}]
			},
			{
				title:_sdleditor_tab_general_labels,
				items:[{
					xtype:'form',
					margin:10,
					border:false,
					id:'sdleditor_tab_general_labels',
					items:[
						attrCombo,
						sldeditor_font_family('sldeditor_font_family'),
						sldeditor_font_size('sldeditor_font_size'),
						sldeditor_font_color('sldeditor_font_color')
					]
				}]
			},
			{
				title:_sdleditor_tab_general_criteria,
				layout:'fit',
				items:[{
					xtype:'panel',
					autoScroll:true,
					id:'sdleditor_tab_general_criteria'
				}],
				bbar:[
					{
						xtype:'combo',
						fieldLabel:_sdleditor_and_or,
						store: new Ext.data.SimpleStore({
							fields: ['name','value'],
							data: [[_sdleditor_and,"And"],[_sdleditor_or,"Or"]]
						}),
						displayField: 'name',
						valueField: 'value',
						emptyText:_sdleditor_and,
						value:'And',
						id:'sdleditor_and_or',
						width:180,
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: true
					},
					'->',
					{
						xtype:'button',
						iconCls:'map_general_add_btn',
						text:_sdleditor_add_criteria,
						handler:function(){
							Ext.getCmp("sdleditor_tab_general_criteria").add(fn_sldeditor_addCriteria(_layerId));
						}
				}]
			},
			{
				title:_sdleditor_tab_general_rule_sld,
				layout:'fit',
				id:'sdleditor_tab_general_rule_sld',
				items:[{
					xtype:'textarea',
					id:'sdleditor_tab_general_rule_sld_textarea'
				}]
			},
			{
				title:_sdleditor_tab_general_full_sld,
				layout:'fit',
				id:'sdleditor_tab_general_full_sld',
				items:[{
					xtype:'textarea',
					id:'sdleditor_tab_general_full_sld_textarea'
				}]
			}
		]
	});
	
	return _tabPanel;
}

function sldeditor_change_geometryType()
{
	Ext.getCmp("sdleditor_tab_general_fieldset_styling").show();
	
	Ext.getCmp("sdleditor_tab_general_fieldset_styling").removeAll();
	
	var _cmp=[];
	
	var record=Ext.getCmp("sdleditor_tab_general_geometry_type").getValue();
	
	switch (record)
	{
		case "PolygonSymbolizer":
			_cmp=[{
				xtype:'fieldset',
				title:_sdleditor_tab_general_fieldset_styling_fill,
				items:[
					sldeditor_styling_fill_style("sldeditor_styling_fill_style"),
					sldeditor_styling_color("sldeditor_styling_fill_color"),
					sldeditor_styling_opacity("sldeditor_styling_fill_opacity")
				]
			},
			{
				xtype:'fieldset',
				title:_sdleditor_tab_general_fieldset_styling_outline,
				items:[
					sldeditor_styling_outline_style("sldeditor_styling_outline_style"),
					sldeditor_styling_color("sldeditor_styling_outline_color"),
					sldeditor_styling_size("sldeditor_styling_outline_size"),
					sldeditor_styling_opacity("sldeditor_styling_outline_opacity")
				]
			}];
		break;

		case "PointSymbolizer":
			_cmp=[{
					xtype:'fieldset',
					title:_sdleditor_tab_general_styling_point_style,
					items:[
						sldeditor_styling_point_style("sldeditor_styling_point_style"),
						sldeditor_styling_size("sldeditor_styling_point_size"),
						sldeditor_styling_rotation("sldeditor_styling_point_rotation"),
						sldeditor_styling_color("sldeditor_styling_fill_color"),
						sldeditor_styling_opacity("sldeditor_styling_fill_opacity")
					]
				},
				{
					xtype:'fieldset',
					title:_sdleditor_tab_general_fieldset_styling_outline,
					items:[
						sldeditor_styling_outline_style("sldeditor_styling_outline_style"),
						sldeditor_styling_color("sldeditor_styling_outline_color"),
						sldeditor_styling_size("sldeditor_styling_outline_size"),
						sldeditor_styling_opacity("sldeditor_styling_outline_opacity")
					]
				}];
		break;
		
		case "LineSymbolizer":
			_cmp=[{
					xtype:'fieldset',
					title:_sdleditor_tab_general_fieldset_styling_outline,
					items:[
						sldeditor_styling_outline_style("sldeditor_styling_outline_style"),
						sldeditor_styling_color("sldeditor_styling_outline_color"),
						sldeditor_styling_size("sldeditor_styling_outline_size"),
						sldeditor_styling_opacity("sldeditor_styling_outline_opacity")
					]
				}];
		break;
	}

	Ext.getCmp("sdleditor_tab_general_fieldset_styling").add(_cmp);

}

function sldeditor_rule_list(_layerId,_ruleId)
{
	var _store=Ext.create('Ext.data.Store', 
	{
		data:[],
		fields:['_layerId','_isVector','_isSLDEditable','_isService','_ruleId','_ruleTitle','_ruleLegend','_ruleSLD']
	});

	var _ruleList=new Ext.grid.Panel({
		border:true,
		region:'west',
		width:200,
		id:'sldeditor_rule_grid',
		columnLines:true,
		viewConfig:{
			markDirty:false
		},
		store:_store,
		bbar:[
		'->',
		{
			xtype:'button',
			text:_sldeditor_load_sld,
			handler:function(){
				
				var _s=sldeditor_insert_sld_window(_layerId);
				
				_s.show();
			}
		},{
			xtype:'button',
			text:_sldeditor_load_rule,
			handler:function(){
			
				var selectedRecord = Ext.getCmp("sldeditor_rule_grid").getSelectionModel().getSelection()[0];
				
				var _sld_body=(sldeditor_xml_header(_layerId)+selectedRecord.get("_ruleSLD")+sldeditor_xml_footer());
			
				sleditor_edit_mode=true;
			
				sldeditor_read_sld_rule(_sld_body,_layerId);
			}
		}],
		columns:[{
			header: '',
			dataIndex: "_layerId",
			hidden:true,
			hideable:false
		},{
			header: '',
			dataIndex: "_isVector",
			hidden:true,
			hideable:false
		},{
			header: '',
			dataIndex: "_isSLDEditable",
			hidden:true,
			hideable:false
		},{
			header: '',
			dataIndex: "_isService",
			hidden:true,
			hideable:false
		},{
			header: '',
			dataIndex: "_ruleId",
			hidden:true,
			hideable:false
		},{
			header: '',
			dataIndex: "_ruleLegend",
			width:45,
			hidden:false,
			hideable:false,
			renderer:sldeditor_ruleLegend_renderer
		},{
			header: '',
			dataIndex: "_ruleTitle",
			hidden:false,
			hideable:false
		},{
			header: '',
			dataIndex: "_ruleSLD",
			hidden:true,
			hideable:false
		}]
	});
	
	return _ruleList;
}

function sldeditor_ruleLegend_renderer(value, metaData, record, row, col, store, gridView)
{
	return "<img src=\"data:image/png;base64,"+value+"\">";
}

function sldeditor_styling_fill_style(_id)
{
	var _o={
		xtype:'combo',
		fieldLabel:_sdleditor_tab_general_styling_fill_style,
		emptyText:'',
		displayField: 'name',
		valueField: 'value',
		forceSelection: true,
		anchor:'100%',
		id:_id,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [
				["",""],
				[_sdleditor_tab_general_styling_fill_style_color,"fill"],
				[_sdleditor_tab_general_styling_fill_style_horizontal_lines,"shape://horline"],
				[_sdleditor_tab_general_styling_fill_style_vertical_lines,"shape://vertline"],
				[_sdleditor_tab_general_styling_fill_style_slash_lines,"shape://slash"],
				[_sdleditor_tab_general_styling_fill_style_inversed_slash_lines,"shape://backslash"],
				[_sdleditor_tab_general_styling_fill_style_dots,"shape://dot"],
				[_sdleditor_tab_general_styling_fill_style_plus_symbol,"shape://plus"],
				[_sdleditor_tab_general_styling_fill_style_x_symbol,"shape://times"],
				[_sdleditor_tab_general_styling_fill_style_opened_arrow_symbol,"shape://oarrow"],
				[_sdleditor_tab_general_styling_fill_style_closed_arrow_symbol,"shape://carrow"]
			]}
		),
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	};
	
	return _o;
}

function sldeditor_styling_outline_style(_id)
{
	var _o={
		xtype:'combo',
		fieldLabel:_sdleditor_tab_general_styling_outline_style,
		emptyText:'',
		id:_id,
		displayField: 'name',
		valueField: 'value',
		value:"",
		forceSelection: true,
		anchor:'100%',
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [
				["",""],
				[_sdleditor_tab_general_styling_outline_style_solid,"solid"],
				[_sdleditor_tab_general_styling_outline_style_dash,"5 5"],
				[_sdleditor_tab_general_styling_outline_style_dot,"1 4"]
			]}
		),
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	};
	
	return _o;
}

function sldeditor_styling_point_style(_id)
{
	var _o={
		xtype:'combo',
		fieldLabel:_sdleditor_tab_general_styling_point_style,
		emptyText:'',
		displayField: 'name',
		valueField: 'value',
		value:"",
		forceSelection: true,
		anchor:'100%',
		id:_id,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [
				["",""],
				[_sdleditor_tab_general_styling_point_style_square,"square"],
				[_sdleditor_tab_general_styling_point_style_circle,"circle"],
				[_sdleditor_tab_general_styling_point_style_triangle,"triangle"],
				[_sdleditor_tab_general_styling_point_style_star,"star"],
				[_sdleditor_tab_general_styling_point_style_cross,"cross"],
				[_sdleditor_tab_general_styling_point_style_square_with_x,"x"]
			]}
		),
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	};
	
	return _o;
}

function sldeditor_styling_size(_id)
{
	var _o={
		xtype:'combo',
		fieldLabel:_sdleditor_tab_general_styling_size,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [["",""],["1","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"],["9","9"],["10","10"],["12","12"],["14","14"],["17","17"],["18","18"]]
		}),
		displayField: 'name',
		valueField: 'value',
		emptyText:"",
		id:_id,
		value:"",
		anchor:'100%',
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: true,
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	};
	
	return _o;
}

function sldeditor_styling_color(_id)
{
	var _o={
		xtype:'textfield',
		anchor:'100%',
		id:_id,
		fieldLabel:_sdleditor_tab_general_fieldset_styling_color,
		listeners:{
			focus:function(el)
			{
				showColorpickerWindow(el.id,el.getValue());
			}
		}
	};
	
	return _o;
}

function sldeditor_styling_rotation(_id)
{
	var _o={
		xtype:'textfield',
		anchor:'100%',
		id:_id,
		fieldLabel:_sdleditor_tab_general_fieldset_styling_rotation
	};
	
	return _o;
}

function sldeditor_styling_opacity(_id)
{
	var _o={
		xtype:'slider',
		fieldLabel:_sdleditor_tab_general_fieldset_styling_opacity,
		anchor:'100%',
		useTips: true,
		increment: 10,
		value:100,
		id:_id,
		minValue: 0,
		maxValue: 100
	};
	
	return _o;
}

function sldeditor_font_family(_id)
{
	var _o={
		xtype:'combo',
		fieldLabel:_sdleditor_tab_labels_font_family,
		emptyText:"",
		anchor:'100%',
		value:"",
		id:_id,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [
				["",""],
				["Serif","Serif"],
				["Sans Serif","SansSerif"],
				["Arial","Arial"],
				["Courier New","Courier New"],
				["Tahoma","Tahoma"],
				["Times New Roman","Times New Roman"],
				["Verdana","Verdana"]
			]
		}),
		displayField: 'name',
		valueField: 'value',
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false,
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	};
	
	return _o;
}


function sldeditor_font_size(_id)
{
	var _o={
		xtype:'combo',
		fieldLabel:_sdleditor_tab_labels_font_size,
		emptyText:"",
		id:_id,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [
				["",""],
				["4","4"],
				["5","5"],
				["6","6"],
				["7","7"],
				["8","8"],
				["9","9"],
				["10","10"],
				["11","11"],
				["12","12"],
				["13","13"],
				["14","14"],
				["15","15"],
				["16","16"],
				["17","17"],
				["18","18"]
			]
		}),
		displayField: 'name',
		valueField: 'value',
		anchor:'100%',
		value:"",
		forceSelection: false,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: true,
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	};
	
	return _o;
}

function sldeditor_font_color(_id)
{
	var _o={
		xtype:'textfield',
		anchor:'100%',
		id:_id,
		fieldLabel:_sdleditor_tab_general_fieldset_styling_color,
		listeners:{
			focus:function(el)
			{
				showColorpickerWindow(el.id,el.getValue());
			}
		}
	};
	
	return _o;
}

function fn_sldeditor_addCriteria(_layerId)
{
	var attributes=mapFindLayerById(_layerId)._layerObject._attributesFields;
	
	var cmbId="attributes_sldeditor_combobox_id_"+sldeditor_criteria_count;

	var valueId="value_sldeditor_combobox_id_"+sldeditor_criteria_count;
	
	var conditionsId="condition_sldeditor_combobox_id_"+sldeditor_criteria_count;
	
	var cmb=new fn_createAttributesComboBox(attributes,cmbId);
	
	var cnd=Ext.create('Ext.form.ComboBox',{
		id:conditionsId,
		store: new Ext.data.SimpleStore({
			fields: ['condition','disableValue'],
				data: []
			}), 
		displayField: 'condition',
		valueField: 'condition',
		region:'west',
		emptyText:_maptab_east_search_conditions_empty_text,
		width:100,
		queryMode: 'local',
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false,
		listeners:{
			select:function(combo,record)
			{
				var record=record[0];
				
				if(record.data.disableValue)
				{
					Ext.getCmp(valueId).setDisabled(true);
				}
				else
				{
					Ext.getCmp(valueId).setDisabled(false);
				}
			}
		}
	});
	
	cmb.on('select',function(combo,record){
		
		var record=record[0];
		
		var conditions=new fn_createCriteriaComboConditions(record.data._attributeType);
		
		cnd.store.loadData(conditions);
	});
	
	cmb.store.insert(0,{
		_attributeName:"",
		_attributeTranslation:"",
		_attributeValue:"",
		_attributeType:""
	});

	var panelId=Ext.id();
	
	var c=[{
		xtype:'panel',
		border:false,
		id:panelId,
		layout:'form',
		anchor:'100%',
		margin:'0 20 2 5',
		items:[cmb,
			{
				xtype:'panel',
				layout:'border',
				border:false,
				height:22,
				items:[
					cnd,
					{
						xtype:'textfield',
						id:valueId,
						width:200,
						emptyText:_maptab_east_search_value_empty_text,
						region:'center'
					},{
						xtype:'button',
						iconCls:'map_general_remove_btn',
						region:'east',
						handler:function()
						{
							Ext.getCmp("sdleditor_tab_general_criteria").remove(Ext.getCmp(panelId));
						}
					}
				]
			}
		]
	}];
	
	sldeditor_criteria_count++;
	
	return c;
}

function sldeditor_create_ruleSLD()
{
	var _sld="<sld:Rule>";
	
	var _name=Ext.getCmp("sdleditor_tab_general_name_field").getValue();
	
	_sld+="<sld:Name>"+_name+"</sld:Name>";
	
	var _title=Ext.getCmp("sdleditor_tab_general_title_field").getValue();
	
	_sld+="<sld:Title>"+sldeditor_format_literal(_title)+"</sld:Title>";
	
	var _description=Ext.getCmp("sdleditor_tab_general_description_field").getValue();
	
	_sld+="<sld:Abstract>"+sldeditor_format_literal(_description)+"</sld:Abstract>";
	
	var _geometryType=Ext.getCmp("sdleditor_tab_general_geometry_type").getValue();
	
	var _sldeditor_styling_text_attribute=Ext.getCmp("sdleditor_tab_general_labels").items.items[0];
		_sldeditor_styling_text_attribute=_sldeditor_styling_text_attribute.getValue();
	var _font="";
	
	if (_sldeditor_styling_text_attribute!="")
	{
		_font="<sld:TextSymbolizer>";
		
			_sldeditor_styling_text_attribute=(_sldeditor_styling_text_attribute=="")?"":"<sld:Label><ogc:PropertyName>"+_sldeditor_styling_text_attribute+"</ogc:PropertyName></sld:Label>";
		var _sldeditor_font_family=Ext.getCmp("sldeditor_font_family").getValue();
			_sldeditor_font_family=(_sldeditor_font_family=="")?"":"<sld:CssParameter name='font-family'>"+_sldeditor_font_family+"</sld:CssParameter>";
		var _sldeditor_font_size=Ext.getCmp("sldeditor_font_size").getValue();
			_sldeditor_font_size=(_sldeditor_font_size=="")?"":"<sld:CssParameter name='font-size'>"+_sldeditor_font_size+"</sld:CssParameter>";
			
		var _sldeditor_font_color=Ext.getCmp("sldeditor_font_color").getValue();
			_sldeditor_font_color=(_sldeditor_font_color=="")?"":"<sld:CssParameter name='font-color'>"+_sldeditor_font_color+"</sld:CssParameter>";				
		_font+=_sldeditor_styling_text_attribute;
		
		if ((_sldeditor_font_size!="") && (_sldeditor_font_family!="") && (_sldeditor_font_color!=""))
		{
			_font+="<sld:Font>";
			_font+=_sldeditor_font_size;
			_font+=_sldeditor_font_family;
			_font+=_sldeditor_font_color;
			_font+="</sld:Font>";
		}
		
		_font+="</sld:TextSymbolizer>";
	}
	
	
	var _filter=[];

	if (sldeditor_criteria_count>0)
	{
		_filter.push("<ogc:Filter>");
		
		var sldeditor_andor=Ext.getCmp("sdleditor_and_or").getValue();
		
		_filter.push("<ogc:"+sldeditor_andor+">");
		
		for(var i=0;i<sldeditor_criteria_count;i++)
		{
			
			if (typeof Ext.getCmp("attributes_sldeditor_combobox_id_"+i)!=="undefined")
			{
				r=new Array();
				
				var attribute="<ogc:PropertyName>"+Ext.getCmp("attributes_sldeditor_combobox_id_"+i).getValue()+"</ogc:PropertyName>";
			
				var value="<ogc:Literal>"+Ext.getCmp("value_sldeditor_combobox_id_"+i).getValue()+"</ogc:Literal>";
			
				var condition=Ext.getCmp("condition_sldeditor_combobox_id_"+i).getValue();
			
				switch(condition)
				{
					case "=":
						_filter.push("<ogc:PropertyIsEqualTo>"+attribute+value+"</ogc:PropertyIsEqualTo>");
					break;
					
					case "!=":
						_filter.push("<ogc:PropertyIsNotEqualTo>"+attribute+value+"</ogc:PropertyIsNotEqualTo>");
					break;
				
					case ">=":
						_filter.push("<ogc:PropertyIsGreaterThanOrEqualTo>"+attribute+value+"</ogc:PropertyIsGreaterThanOrEqualTo>");
					break;
					
					case ">":
						_filter.push("<ogc:PropertyIsGreaterThan>"+attribute+value+"</ogc:PropertyIsGreaterThan>");
					break;
					
					case "<=":
						_filter.push("<ogc:PropertyIsLessThanOrEqualTo>"+attribute+value+"</ogc:PropertyIsLessThanOrEqualTo>");
					break;
					
					case "<":
						_filter.push("<ogc:PropertyIsLessThan>"+attribute+value+"</ogc:PropertyIsLessThan>");
					break;
					
					case "LIKE":
						_filter.push("<ogc:PropertyIsLike>"+attribute+value+"</ogc:PropertyIsLike>");
					break;
					
					case "NOT LIKE":
					
					break;
					
					case "IS NOT NULL":

					break;
					
					case "IS NULL":
						_filter.push("<ogc:PropertyIsNull>"+attribute+"</ogc:PropertyIsNull>");
					break;
				}
			}
		}
		
		_filter.push("</ogc:"+sldeditor_andor+">");
		
		_filter.push("</ogc:Filter>");
		
		
	}
	
	_sld+=_filter.join('');
	
	switch(_geometryType)
	{
		case "PointSymbolizer":
			
			_sld+="<sld:PointSymbolizer>";
			
			_sld+="<sld:Graphic>";
			
			_sld+="<sld:Mark>";
			
			var _sldeditor_styling_point_style=Ext.getCmp("sldeditor_styling_point_style").getValue();
				_sldeditor_styling_point_style=(_sldeditor_styling_point_style=="")?"":"<sld:WellKnownName>"+_sldeditor_styling_point_style+"</sld:WellKnownName>";
			_sld+=_sldeditor_styling_point_style;
			
			var _fill="<sld:Fill>";
			var _sldeditor_styling_fill_color=Ext.getCmp("sldeditor_styling_fill_color").getValue();
				_sldeditor_styling_fill_color=(_sldeditor_styling_fill_color=="")?"":"<sld:CssParameter name=\"fill\">#"+_sldeditor_styling_fill_color+"</sld:CssParameter>";
			var _sldeditor_styling_fill_opacity=Ext.getCmp("sldeditor_styling_fill_opacity").getValue();
				_sldeditor_styling_fill_opacity=(_sldeditor_styling_fill_opacity=="")?"":"<sld:CssParameter name=\"fill-opacity\">"+(_sldeditor_styling_fill_opacity*0.01)+"</sld:CssParameter>";
			_fill+=_sldeditor_styling_fill_color;
			_fill+=_sldeditor_styling_fill_opacity;
			_fill+="</sld:Fill>";
			
			var _stroke="<sld:Stroke>";
			var _sldeditor_styling_outline_color=Ext.getCmp("sldeditor_styling_outline_color").getValue();
				_sldeditor_styling_outline_color=(_sldeditor_styling_outline_color=="")?"":"<sld:CssParameter name=\"stroke\">#"+_sldeditor_styling_outline_color+"</sld:CssParameter>";
			var _sldeditor_styling_outline_style=Ext.getCmp("sldeditor_styling_outline_style").getValue();
				_sldeditor_styling_outline_style=((_sldeditor_styling_outline_style=="") || (_sldeditor_styling_outline_style=="solid"))?"":"<sld:CssParameter name=\"stroke-dasharray\">"+_sldeditor_styling_outline_style+"</sld:CssParameter>";
			var _sldeditor_styling_outline_size=Ext.getCmp("sldeditor_styling_outline_size").getValue();
				_sldeditor_styling_outline_size=(_sldeditor_styling_outline_size=="")?"":"<sld:CssParameter name=\"stroke-width\">"+_sldeditor_styling_outline_size+"</sld:CssParameter>";
			var _sldeditor_styling_outline_opacity=Ext.getCmp("sldeditor_styling_outline_opacity").getValue();
				_sldeditor_styling_outline_opacity=(_sldeditor_styling_outline_opacity=="")?"":"<sld:CssParameter name=\"stroke-opacity\">"+(_sldeditor_styling_outline_opacity*0.01)+"</sld:CssParameter>";
			_stroke+=_sldeditor_styling_outline_color;
			_stroke+=_sldeditor_styling_outline_style;
			_stroke+=_sldeditor_styling_outline_size;
			_stroke+=_sldeditor_styling_outline_opacity;
			_stroke+="</sld:Stroke>";
			_sld+=_fill;
			_sld+=_stroke;
			_sld+="</sld:Mark>";
			
			var _sldeditor_styling_point_size=Ext.getCmp("sldeditor_styling_point_size").getValue();
				_sldeditor_styling_point_size=(_sldeditor_styling_point_size=="")?"":"<sld:Size><ogc:Literal>"+_sldeditor_styling_point_size+"</ogc:Literal></sld:Size>";
			var _sldeditor_styling_point_rotation=Ext.getCmp("sldeditor_styling_point_rotation").getValue();
				_sldeditor_styling_point_rotation=(_sldeditor_styling_point_rotation=="")?"":"<sld:Rotation><ogc:Literal>"+_sldeditor_styling_point_rotation+"</ogc:Literal></sld:Rotation>";
			_sld+=_sldeditor_styling_point_size;
			_sld+=_sldeditor_styling_point_rotation;
			_sld+="</sld:Graphic>";
			
			_sld+="</sld:PointSymbolizer>";
			
		break;
		
		case "PolygonSymbolizer":
		
			_sld+="<sld:PolygonSymbolizer>";
			
			var _fill="";
			
			var _sldeditor_styling_fill_style=Ext.getCmp("sldeditor_styling_fill_style").getValue();
		
			if (_sldeditor_styling_fill_style!="")
			{
		
				_fill="<sld:Fill>";
				
				var _sldeditor_styling_fill_color=Ext.getCmp("sldeditor_styling_fill_color").getValue();
				
				var _sldeditor_styling_fill_opacity=Ext.getCmp("sldeditor_styling_fill_opacity").getValue();
				
				
				if (_sldeditor_styling_fill_style!="fill")
				{
					_fill+="<sld:GraphicFill><sld:Graphic><sld:Mark>";
					
					_fill+="<sld:WellKnownName>"+_sldeditor_styling_fill_style+"</sld:WellKnownName>";
				
					_fill+=(_sldeditor_styling_fill_color=="")?"":"<sld:Stroke><sld:CssParameter name=\"stroke\">#"+_sldeditor_styling_fill_color+"</sld:CssParameter>";
				
					_fill+=((_sldeditor_styling_fill_opacity=="") && (_sldeditor_styling_fill_color==""))?"</sld:Stroke>":"<sld:CssParameter name=\"stroke-opacity\">"+(_sldeditor_styling_fill_opacity*0.01)+"</sld:CssParameter></sld:Stroke>";
					
					_fill+="</sld:Mark></sld:Graphic></sld:GraphicFill>";
				}	
				else
				{
					_fill+=(_sldeditor_styling_fill_color=="")?"":"<sld:CssParameter name=\"fill\">#"+_sldeditor_styling_fill_color+"</sld:CssParameter>";
				
					_fill+=(_sldeditor_styling_fill_opacity=="")?"":"<sld:CssParameter name=\"fill-opacity\">"+(_sldeditor_styling_fill_opacity*0.01)+"</sld:CssParameter>";
				
				}
				
				_fill+="</sld:Fill>";
			}
			
			_sld+=_fill;
			
			
			var _stroke="<sld:Stroke>";
			var _sldeditor_styling_outline_color=Ext.getCmp("sldeditor_styling_outline_color").getValue();
				_sldeditor_styling_outline_color=(_sldeditor_styling_outline_color=="")?"":"<sld:CssParameter name=\"stroke\">#"+_sldeditor_styling_outline_color+"</sld:CssParameter>";
			var _sldeditor_styling_outline_style=Ext.getCmp("sldeditor_styling_outline_style").getValue();
				_sldeditor_styling_outline_style=((_sldeditor_styling_outline_style=="") || (_sldeditor_styling_outline_style=="solid"))?"":"<sld:CssParameter name=\"stroke-dasharray\">"+_sldeditor_styling_outline_style+"</sld:CssParameter>";
			var _sldeditor_styling_outline_size=Ext.getCmp("sldeditor_styling_outline_size").getValue();
				_sldeditor_styling_outline_size=(_sldeditor_styling_outline_size=="")?"":"<sld:CssParameter name=\"stroke-width\">"+_sldeditor_styling_outline_size+"</sld:CssParameter>";
			var _sldeditor_styling_outline_opacity=Ext.getCmp("sldeditor_styling_outline_opacity").getValue();
				_sldeditor_styling_outline_opacity=(_sldeditor_styling_outline_opacity=="")?"":"<sld:CssParameter name=\"stroke-opacity\">"+(_sldeditor_styling_outline_opacity*0.01)+"</sld:CssParameter>";
			_stroke+=_sldeditor_styling_outline_color;
			_stroke+=_sldeditor_styling_outline_style;
			_stroke+=_sldeditor_styling_outline_size;
			_stroke+=_sldeditor_styling_outline_opacity;
			_stroke+="</sld:Stroke>";
			_sld+=_stroke;
			
			_sld+="</sld:PolygonSymbolizer>";
			
		break;
		
		case "LineSymbolizer":
		
			_sld+="<sld:LineSymbolizer>";
		
			var _stroke="<sld:Stroke>";
			var _sldeditor_styling_outline_color=Ext.getCmp("sldeditor_styling_outline_color").getValue();
				_sldeditor_styling_outline_color=(_sldeditor_styling_outline_color=="")?"":"<sld:CssParameter name=\"stroke\">#"+_sldeditor_styling_outline_color+"</sld:CssParameter>";
			var _sldeditor_styling_outline_style=Ext.getCmp("sldeditor_styling_outline_style").getValue();
				_sldeditor_styling_outline_style=((_sldeditor_styling_outline_style=="") || (_sldeditor_styling_outline_style=="solid"))?"":"<sld:CssParameter name=\"stroke-dasharray\">"+_sldeditor_styling_outline_style+"</sld:CssParameter>";
			var _sldeditor_styling_outline_size=Ext.getCmp("sldeditor_styling_outline_size").getValue();
				_sldeditor_styling_outline_size=(_sldeditor_styling_outline_size=="")?"":"<sld:CssParameter name=\"stroke-width\">"+_sldeditor_styling_outline_size+"</sld:CssParameter>";
			var _sldeditor_styling_outline_opacity=Ext.getCmp("sldeditor_styling_outline_opacity").getValue();
				_sldeditor_styling_outline_opacity=(_sldeditor_styling_outline_opacity=="")?"":"<sld:CssParameter name=\"stroke-opacity\">"+(_sldeditor_styling_outline_opacity*0.01)+"</sld:CssParameter>";
			_stroke+=_sldeditor_styling_outline_color;
			_stroke+=_sldeditor_styling_outline_style;
			_stroke+=_sldeditor_styling_outline_size;
			_stroke+=_sldeditor_styling_outline_opacity;
			_stroke+="</sld:Stroke>";
			_sld+=_stroke;
			
			_sld+="</sld:LineSymbolizer>";
			
		break;
	}
	
	_sld+=_font;
	
	_sld+="</sld:Rule>";
	
	return _sld;
}

function sldeditor_xml_header(_layerId)
{
	var _layerName=mapFindLayerById(_layerId)._layerObject._layerName;

	var _o="<?xml version='1.0' encoding='UTF-8'?><sld:StyledLayerDescriptor xmlns='http://www.opengis.net/ogc' xmlns:sld='http://www.opengis.net/sld' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd'><sld:NamedLayer><sld:Name>"+_layerName+"</sld:Name><sld:UserStyle><sld:Title>Title</sld:Title><sld:Abstract>Abstract</sld:Abstract><sld:FeatureTypeStyle>";
	
	return _o;
}

function sldeditor_xml_footer()
{
	var _o="</sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>";
	
	return _o;
}

function sldeditor_build_sld(_layerId,_sldRule)
{
	return sldeditor_format_xml(sldeditor_xml_header(_layerId)+_sldRule+sldeditor_xml_footer());
}

function sldeditor_build_sld_no_format(_layerId,_sldRule)
{
	return sldeditor_xml_header(_layerId)+_sldRule+sldeditor_xml_footer();
}


function sldeditor_save_rule(_layerId)
{
	var _ruleTitle=Ext.getCmp("sdleditor_tab_general_title_field").getValue();

	var r=new fn_get();
	
	r._data.push({
		_serviceType:"WMS",
		_serviceUrl:mapFindLayerById(_layerId)._serviceObject._serviceUrl,
		_request:"getLegendGraphic",
		_username:mapFindLayerById(_layerId)._serviceObject._username,
		_password:mapFindLayerById(_layerId)._serviceObject._password,
		_layerName:mapFindLayerById(_layerId)._layerObject._layerName,
		_sld_body:(sldeditor_xml_header(_layerId)+sldeditor_create_ruleSLD()+sldeditor_xml_footer())
	});
	
	r._async=false;
	
	var response=Ext.JSON.decode(r.get().responseText);
		
	var image=response[0]._response;
	
	if (sleditor_edit_mode==false)
	{
		Ext.getCmp("sldeditor_rule_grid").store.add({
			_layerId:_layerId,
			_isVector:mapFindLayerById(_layerId)._serviceObject._isVector,
			_isSLDEditable:mapFindLayerById(_layerId)._serviceObject._isSLDEditable,
			_isService:mapFindLayerById(_layerId)._serviceObject._isService,
			_ruleId:Ext.getCmp("sdleditor_tab_general_name_field").getValue(),
			_ruleTitle:_ruleTitle,
			_ruleLegend:image,
			_ruleSLD:sldeditor_create_ruleSLD()
		});
	}
	else
	{
		var _record=Ext.getCmp("sldeditor_rule_grid").store.findRecord('_ruleId', Ext.getCmp("sdleditor_tab_general_name_field").getValue());
		
		_record.set("_ruleLegend",image);
		
		_record.set("_ruleSLD",sldeditor_create_ruleSLD());
		
	}
	
	sldeditor_add_rule(_layerId);
	
	
}

function sldeditor_add_rule(_layerId)
{
	Ext.getCmp("sdleditor_window_panel").remove(Ext.getCmp("_sdleditor_tab_form"));
	
	sldeditor_criteria_count=0;
	
	Ext.getCmp("sdleditor_window_panel").add(sldeditor_rule_form(_layerId,''));
	
	sleditor_edit_mode=false;
	
}

function sldeditor_read_sld_rule(_sld,_layerId)
{
	if ((_sld!="") && (_sld!=null))
	{
		var r=new fn_get();

		r._data.push({
			_serviceType:"SLD",
			_serviceUrl:mapFindLayerById(_layerId)._serviceObject._serviceUrl,
			_username:mapFindLayerById(_layerId)._serviceObject._username,
			_password:mapFindLayerById(_layerId)._serviceObject._password,
			_request:"parseSLD",
			_layerName:mapFindLayerById(_layerId)._layerObject._layerName,
			_sldIsUrl:false,
			_sldBody:_sld
		});
		
		r._async=false;
		
		var response=Ext.JSON.decode(r.get().responseText);
		
		var rules=response[0]._response._sldObjects;
		
		var mask=fn_loadingMask(Ext.getCmp("_sdleditor_tab_form"),_mask_loading_message_default);
								
		mask.show();
		
		Ext.each(rules,function(rule)
		{	
			Ext.getCmp("sdleditor_tab_general_criteria").removeAll();
		
			sldeditor_criteria_count = 0;
		
			Ext.getCmp("sdleditor_tab_general_name_field").setValue(rule._sldRuleName);
			
			Ext.getCmp("sdleditor_tab_general_title_field").setValue(rule._sldRuleTitle);
			
			Ext.getCmp("sdleditor_tab_general_description_field").setValue(rule._sldRuleAbstract);
			
			Ext.getCmp("sdleditor_tab_general_geometry_type").setValue(rule._sldRuleGeometryType);
			
			sldeditor_change_geometryType();
			
			switch(rule._sldRuleGeometryType)
			{
				case "PolygonSymbolizer":
				
					if (((rule._sldFillColor!="") || (rule._sldFillOpacity!="")) && (rule._sldGraphicWellKnownName==""))
					{
						Ext.getCmp("sldeditor_styling_fill_style").setValue("fill");
					}
					
					if (rule._sldGraphicWellKnownName!="")
					{
						Ext.getCmp("sldeditor_styling_fill_style").setValue(rule._sldGraphicWellKnownName);
					}
					
					Ext.getCmp("sldeditor_styling_fill_color").setValue(rule._sldFillColor);
					
					if (rule._sldFillColor!="")
					{
						Ext.getCmp("sldeditor_styling_fill_color").setFieldStyle("background-color: #"+rule._sldFillColor+"; background-image: none;");
					}
					
					var opacity=rule._sldFillOpacity;
					
					if (opacity!="")
					{
						opacity=opacity*100;
					}
					
					Ext.getCmp("sldeditor_styling_fill_opacity").setValue(opacity);
					
					if (((rule._sldStrokeColor!="") || (rule._sldStrokeWidth!="") || (rule._sldStrokeOpacity!="")) && (rule._sldStrokeDashArray==""))
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue("solid");
					}
					
					var strokeStyle=rule._sldStrokeDashArray;
					
					if(strokeStyle!="")
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue(rule._sldStrokeDashArray);
					}
					
					var strokeOpacity=rule._sldStrokeOpacity;
					
					if (strokeOpacity!="")
					{
						strokeOpacity=strokeOpacity*100;
					}
					
					Ext.getCmp("sldeditor_styling_outline_color").setValue(rule._sldStrokeColor);
					
					if (rule._sldStrokeColor!="")
					{
						Ext.getCmp("sldeditor_styling_outline_color").setFieldStyle("background-color: #"+rule._sldStrokeColor+"; background-image: none;");
					}
					
					Ext.getCmp("sldeditor_styling_outline_size").setValue(rule._sldStrokeWidth);
					
					Ext.getCmp("sldeditor_styling_outline_opacity").setValue(strokeOpacity);
					
					if (((rule._sldStrokeColor!="") || (rule._sldStrokeWidth!="") || (rule._sldStrokeOpacity!="")) && (rule._sldStrokeDashArray==""))
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue("solid");
					}
					
					var strokeStyle=rule._sldStrokeDashArray;
					
					if(strokeStyle!="")
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue(rule._sldStrokeDashArray);
					}
					
					var strokeOpacity=rule._sldStrokeOpacity;
					
					if (strokeOpacity!="")
					{
						strokeOpacity=strokeOpacity*100;
					}
					
					Ext.getCmp("sldeditor_styling_outline_color").setValue(rule._sldStrokeColor);
					
					if (rule._sldStrokeColor!="")
					{
						Ext.getCmp("sldeditor_styling_outline_color").setFieldStyle("background-color: #"+rule._sldStrokeColor+"; background-image: none;");
					}
					
					Ext.getCmp("sldeditor_styling_outline_size").setValue(rule._sldStrokeWidth);
					
					Ext.getCmp("sldeditor_styling_outline_opacity").setValue(strokeOpacity);
					
				break;
			
				case "PointSymbolizer":
					
					var _sldRulePointStyle="circle";
					
					if (rule._sldRulePointStyle!="")
					{
						_sldRulePointStyle=rule._sldRulePointStyle;
					}
					
					Ext.getCmp("sldeditor_styling_point_style").setValue(_sldRulePointStyle);
					
					Ext.getCmp("sldeditor_styling_point_size").setValue(rule._sldRulePointSize);
					
					Ext.getCmp("sldeditor_styling_point_rotation").setValue(rule._sldRulePointRotation);
					
					Ext.getCmp("sldeditor_styling_fill_color").setValue(rule._sldRulePointColor);
					
					if (rule._sldRulePointColor!="")
					{
						Ext.getCmp("sldeditor_styling_fill_color").setFieldStyle("background-color: #"+rule._sldRulePointColor+"; background-image: none;");
					}
					
					Ext.getCmp("sldeditor_styling_fill_opacity").setValue(rule._sldRulePointOpacity);
					
					if (((rule._sldRulePointStrokeColor!="") || (rule._sldRulePointStrokeWidth!="") || (rule._sldRulePointStrokeOpacity!="")) && (rule._sldRulePointStrokeDashArray==""))
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue("solid");
					}
					
					var strokeStyle=rule._sldRulePointStrokeDashArray;
					
					if(strokeStyle!="")
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue(rule._sldRulePointStrokeDashArray);
					}
					
					var strokeOpacity=rule._sldRulePointStrokeOpacity;
					
					if (strokeOpacity!="")
					{
						strokeOpacity=strokeOpacity*100;
					}
					
					Ext.getCmp("sldeditor_styling_outline_color").setValue(rule._sldRulePointStrokeColor);
					
					if (rule._sldRulePointStrokeColor!="")
					{
						Ext.getCmp("sldeditor_styling_outline_color").setFieldStyle("background-color: #"+rule._sldRulePointStrokeColor+"; background-image: none;");
					}
					
					Ext.getCmp("sldeditor_styling_outline_size").setValue(rule._sldRulePointStrokeWidth);
					
					Ext.getCmp("sldeditor_styling_outline_opacity").setValue(strokeOpacity);
				
				break;
				
				case "LineSymbolizer":
					var strokeStyle=rule._sldStrokeDashArray;
					
					if(strokeStyle!="")
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue(rule._sldStrokeDashArray);
					}
					
					var strokeOpacity=rule._sldStrokeOpacity;
					
					if (strokeOpacity!="")
					{
						strokeOpacity=strokeOpacity*100;
					}
					
					Ext.getCmp("sldeditor_styling_outline_color").setValue(rule._sldStrokeColor);
					
					if (rule._sldStrokeColor!="")
					{
						Ext.getCmp("sldeditor_styling_outline_color").setFieldStyle("background-color: #"+rule._sldStrokeColor+"; background-image: none;");
					}
					
					Ext.getCmp("sldeditor_styling_outline_size").setValue(rule._sldStrokeWidth);
					
					Ext.getCmp("sldeditor_styling_outline_opacity").setValue(strokeOpacity);
					
					if (((rule._sldStrokeColor!="") || (rule._sldStrokeWidth!="") || (rule._sldStrokeOpacity!="")) && (rule._sldStrokeDashArray==""))
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue("solid");
					}
					
					var strokeStyle=rule._sldStrokeDashArray;
					
					if(strokeStyle!="")
					{
						Ext.getCmp("sldeditor_styling_outline_style").setValue(rule._sldStrokeDashArray);
					}
					
					var strokeOpacity=rule._sldStrokeOpacity;
					
					if (strokeOpacity!="")
					{
						strokeOpacity=strokeOpacity*100;
					}
					
					Ext.getCmp("sldeditor_styling_outline_color").setValue(rule._sldStrokeColor);
					
					if (rule._sldStrokeColor!="")
					{
						Ext.getCmp("sldeditor_styling_outline_color").setFieldStyle("background-color: #"+rule._sldStrokeColor+"; background-image: none;");
					}
					
					Ext.getCmp("sldeditor_styling_outline_size").setValue(rule._sldStrokeWidth);
					
					Ext.getCmp("sldeditor_styling_outline_opacity").setValue(strokeOpacity);
					
				break;
			}
			
			
			Ext.getCmp("sdleditor_tab_general_labels").items.items[0].setValue(rule._sldTextSymbolizerAttribute);
			
			Ext.getCmp("sldeditor_font_family").setValue(rule._sldTextSymbolizerFontFamily);
			
			Ext.getCmp("sldeditor_font_size").setValue(rule._sldTextSymbolizerFontSize);
			
			Ext.getCmp("sldeditor_font_color").setValue(rule._sldTextSymbolizerFontColor);
			
			if (rule._sldTextSymbolizerFontColor!="")
			{
				Ext.getCmp("sldeditor_font_color").setFieldStyle("background-color: #"+rule._sldTextSymbolizerFontColor+"; background-image: none;");
			}
			
			var fp=0;
			
			Ext.each(rule._sldFilterObject,function(filter){
			
				Ext.getCmp("sdleditor_tab_general_criteria").add(fn_sldeditor_addCriteria(_layerId));
				
				Ext.getCmp("attributes_sldeditor_combobox_id_"+fp).setValue(filter._filterPropertyName);
				
				Ext.getCmp("condition_sldeditor_combobox_id_"+fp).setValue(filter._filterPropertyConditionSymbol);
				
				Ext.getCmp("condition_sldeditor_combobox_id_"+fp).setRawValue(filter._filterPropertyConditionSymbol);
				
				Ext.getCmp("value_sldeditor_combobox_id_"+fp).setValue(filter._filterPropertyValue);
				
				fp++;
				
			});
			
			if (sleditor_edit_mode==false)
			{
				sldeditor_save_rule(_layerId);
			}
			
			
		});
		
		mask.hide();
	}
	
	
}

function sldeditor_insert_sld_window(_layerId)
{
	var _s=new Ext.Window({ 
		width:420,
		height:300,
		modal:true,
		shim:true,
		title:_sldeditor_insert_sld_window,
		resizable:true,
		id:'sldeditor_insert_sld_window',
		closeAction:'destroy',
		layout:'fit',
		items:[{
			xtype:'panel',
			layout:'fit',
			items:[{
				xtype:'textarea',
				id:'sldeditor_insert_sld_window_textarea'
			}],
			bbar:[{
				xtype:'button',
				text:_sldeditor_load_sld,
				handler:function(){
					
					sldeditor_read_sld_rule(Ext.getCmp("sldeditor_insert_sld_window_textarea").getValue(),_layerId);
					
					Ext.getCmp("sldeditor_insert_sld_window").hide();
				}
			}]
		}]
	});

	return _s;
}

function sldeditor_create_fullSLD()
{
	var _full_sld="";

	Ext.getCmp("sldeditor_rule_grid").store.each(function(item)
	{
		_full_sld+=item.get("_ruleSLD");
	});
	
	return _full_sld;
}

function sldeditor_apply_to_layer(_layerId)
{
	
	mapFindLayerById(_layerId)._layerObject._sld_body=sldeditor_build_sld_no_format(_layerId,sldeditor_create_fullSLD());
	
	var r=new fn_get();
	
	r._data.push({
		_serviceType:"WMS",
		_serviceUrl:mapFindLayerById(_layerId)._serviceObject._serviceUrl,
		_request:"getLegendGraphic",
		_username:mapFindLayerById(_layerId)._serviceObject._username,
		_password:mapFindLayerById(_layerId)._serviceObject._password,
		_layerName:mapFindLayerById(_layerId)._layerObject._layerName,
		_sld_body:sldeditor_build_sld_no_format(_layerId,sldeditor_create_fullSLD())
	});
	
	r._async=false;
	
	var response=Ext.JSON.decode(r.get().responseText);
		
	var image=response[0]._response;
	
	maptab_west_layer_set_layer_icon(_layerId,"data:image/png;base64,"+image);
	
	mapFindLayerById(_layerId).mergeNewParams({
		sld_body:mapFindLayerById(_layerId)._layerObject._sld_body
	});
	
}

function sldeditor_format_xml(xml)
{
	var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
	var spl=xml.split('\r\n');
	
    for(var a=0;a<spl.length;a++)
	{
		var node=spl[a];
	
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }
 
        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }
 
        formatted += padding + node + '\r\n';
        pad += indent;
    };
 
    return formatted;

}

function sldeditor_format_literal(_value)
{
	var _arrReplace=['&','<','>','"',"'"];
	
	var _arrReplaceWith=['&amp;','&lt;','&gt;','&quot;','&apos;'];

	for(var i = 0; i < _arrReplace.length; i++) {
		_value = _value.replace(new RegExp(_arrReplace[i], 'gi'), _arrReplaceWith[i]);
	}
	
	return _value;
}