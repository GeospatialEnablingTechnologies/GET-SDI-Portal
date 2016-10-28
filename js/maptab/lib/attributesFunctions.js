function fn_createAttributesStore(_layerAttributes)
{
	Ext.define('featureAttributes', {
		extend: 'Ext.data.Model',
		idProperty: 'featureAttributes_id',
		fields: fn_createAttributesColumns(_layerAttributes)
	});

	var s=Ext.create('Ext.data.Store', 
	{
		data:[],
		model:'featureAttributes'
	});
	
	return s;
}

function fn_createAttributesColumns(_layerAttributes)
{
	var _fields=new Array();
	
	Ext.each(_layerAttributes,function(item)
	{
		var columnexist=fn_objIndexOf(_fields,"name",item._attributeName);
	
		if ((!item._attributeIsGeometry) && (columnexist<0))
		{
			_fields.push({
				name: item._attributeName, 
				type: item._attributeType
			});
		}
	});
	
	return _fields;
}

function fn_createAttributesColumnModel(_layerAttributes)
{
	var _columns=new Array();
	
	Ext.each(_layerAttributes,function(item){
		
		if (!item._attributeIsGeometry)
		{
			var _trans=item._attributeTranslation;
			
			if ((_trans==null) || (typeof _trans=="undefined"))
			{
				_trans=item._attributeName;
			}
			
			var width=140;
			
			if (item.width)
			{
				width=item.width;
			}
			
			var renderer="";
			
			if (item.renderer)
			{
				renderer=item.renderer;
			}
			
			var flex="";
			
			if (item.flex)
			{
				flex=item.flex;
			}
			
			var hidden=false;
			
			if (item.hidden)
			{
				hidden=item.hidden;
			}
			
			if (typeof item._attributeIsVisible!=="undefined")
			{
				if(item._attributeIsVisible==false)
				{
					hidden=true;
				}
				else
				{
					hidden=false;
				}
			}
			
			var hideable=true;
			
			if (item.hideable==false)
			{
				hideable=false;
			}
			
			
			if (typeof item._attributeVisible!=="undefined")
			{
				hideable=item._attributeVisible;
			}
			
			_columns.push({
				header: _trans,
				dataIndex: item._attributeName,
				sortable: item._attributeIsSortable,
				width:width,
				renderer:renderer,
				hidden:hidden,
				hideable:hideable,
				flex:flex
			});
			
		}
	});

	return _columns;
}

function fn_addRecordsToStore(_store,_data)
{
	_store.loadData(_data);
}

function fn_createAttributeSummary(_record,_layerAttributes)
{
	var _summary=new Array();
	
	if (_layerAttributes.length>0)
	{
		Ext.each(_layerAttributes,function(item){
		
			if ((item._attributeShowOnSummary) && (!item._attributeIsGeometry) && (item._attributeVisible))
			{
				var _trans=item._attributeTranslation;
				
				if ((_trans==null) || (typeof _trans=="undefined"))
				{
					_trans=item._attributeName;
				}
				
				var _value=_record[item._attributeName];
				
				if(typeof _value=="undefined")
				{
					_value="";
				}
				
				_summary.push("<b>"+_trans+"</b> : "+_value);
			}
		});
		
		if (_summary.length==0)
		{
			var i=0;
			
			Ext.each(_layerAttributes,function(item){
		
				if (i<4)
				{
					var _trans=item._attributeTranslation;
					
					if ((!item._attributeIsGeometry) && (item._attributeVisible))
					{
						if ((_trans==null) || (typeof _trans=="undefined"))
						{
							_trans=item._attributeName;
						}
						
						var _value=_record[item._attributeName];
						
						if(typeof _value=="undefined")
						{
							_value="";
						}
						
						_summary.push("<b>"+_trans+"</b> : "+_value);
						
						i++;
					}
				}
				
			});
			
		}
		
	}else{
	
		var _attributesFields = [];
	
		for(var _k in _record)
		{
			if ((_k!="_layerId") && (_k!="_featureId") && (_k!="_srsName") && (_k!="_featureUrl") && (_k!="_featureGeomFormat")) 
			{
				_attributesFields.push({
					"_attributeName":_k.toString(),
					"_attributeType":"string",
					"_attributeTranslation":null,
					"_attributeValue":null,
					"_attributeEditor":null,
					"_attributeIsSortable":true,
					"_attributeOrder":0,
					"_attributeIsVisible":true,
					"_attributeIsSearchable":true,
					"_attributeIsGeometry":false,
					"_attributeVisible":true,
					"_geometryIsMulti":false,
					"_attributeShowOnSummary":true
				});
			
				_summary.push("<b>"+_k+"</b> : "+_record[_k]);
			}
		}
		
		if(typeof _record!=="undefined")
		{
			mapFindLayerById(_record._layerId)._layerObject._attributesFields=_attributesFields;
		}
	
	}
	
	_record._summary=_summary.join("<br>");
	
	return _record;
}

function fn_createAttributesGrid(_layerAttributes)
{

	var g=Ext.create('Ext.grid.Panel',
	{
		border:true,
		columnLines:true,
		split: true,
		store:fn_createAttributesStore(_layerAttributes),
		columns:fn_createAttributesColumnModel(_layerAttributes)
	});
	
	return g;
	
}

        

function fn_createAttributesPivotGrid(_feature)
{
	var _store=fn_createStorePivotGrid();

	var cellEditing = "";
	
	var _editBbar="";
	
	if (mapFindLayerById(_feature._layerId)._layerObject._isEdited)
	{
	
		cellEditing= Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 2,
			listeners:{
				'beforeedit': function(editor, e, eOpts )
				{
					var _editor=e.record.get("_attributeEditor");
					
					if ((_editor=="") || (_editor==null) || (typeof _editor==="undefined"))
					{
						_editor={xtype:'textfield'};
					}
					
					e.column.setEditor(_editor);
				},
				'afteredit':function(editor, e, eOpts)
				{
					var isDirty=false;
					
					_store.each(function(item){
						if(item.dirty == true){
							isDirty = true;
						}
					});
					
					var _f=this.getCmp().getDockedItems('toolbar[dock="bottom"]')[0].items.items;
					
					if (isDirty)
					{
						_f[1].enable();
					}else
					{
						_f[1].disable();
					}
				}
			}
		});
		
		_editBbar=[
			'->',
			{
				xtype:'button',
				iconCls:'features_toolbar_save',
				disabled:true,
				tooltip:_maptab_edit_windowinfo_save_attributes_button,
				handler:function(cmp, e)
				{
					var _newAttributes=[];
				
					_store.each(function(item){
						if(item.dirty == true){
							_newAttributes.push({
								_attributeName:item.get("_attributeName"),
								_attributeValue:item.get("_attributeValue")
							});
						}
					});
				
					maptab_edit_change_attributes(_feature,_newAttributes);
				}
			},
			{
				xtype:'button',
				iconCls:'features_toolbar_cancel',
				tooltip:_maptab_edit_windowinfo_cancel_attributes_button,
				handler:function(cmp, e)
				{
					
					Ext.getCmp(this.findParentByType("window").id).destroy();
				}
			}
		]
	}
	
	var g=Ext.create('Ext.grid.Panel',
	{
		border:true,
		columnLines:true,
		split: true,
		bbar:_editBbar,
		store:_store,
		_feature:_feature,
		columns:fn_createColumnModelPivotGrid(),
		plugins:cellEditing,
		selModel: 
		{
            selType: 'cellmodel'
        }
	});
	
	
	
	return g;
	
}

function fn_createStorePivotGrid()
{
	Ext.define('propertyAttributes', {
		extend: 'Ext.data.Model',
		idProperty: 'featureAttributes_id',
		fields:['_attributeName','_attributeTranslation','_attributeValue','_attributeType','_attributeEditor']
	});

	var s=Ext.create('Ext.data.Store', 
	{
		data:[],
		model: 'propertyAttributes'
	});
	
	return s;
}

function fn_createColumnModelPivotGrid()
{
	var _columns=[{
		header: '',
		dataIndex: "_attributeName",
		hidden:true,
		hideable:false
	},
	{
		header: _feature_Attributes_Pivot_AttributeName,
		dataIndex: "_attributeTranslation",
		hidden:false,
		hideable:false
	},
	{
		header: _feature_Attributes_Pivot_AttributeValue,
		dataIndex: "_attributeValue",
		hidden:false,
		hideable:false,
		flex: 3,
		field: {
			allowBlank: false
        }
	},
	{
		header: '',
		dataIndex: "_attributeType",
		hidden:true,
		hideable:false
	},
	{
		header: '',
		dataIndex: "_attributeEditor",
		hidden:true,
		hideable:false
	}];
	
	return _columns;
}

function fn_createAttributesRecords(_data,_layerAttributes)
{
	var _records=new Array();

	Ext.each(_layerAttributes,function(item){
		
		var _trans=item._attributeTranslation;
				
		if ((!item._attributeIsGeometry) && (item._attributeVisible==true))
		{
			if ((_trans==null) || (typeof _trans=="undefined"))
			{
				_trans=item._attributeName;
			}
			
			var _value="";
			
			if (typeof _data!=="undefined")
			{
				_value=_data[item._attributeName];
				
				if(typeof _value=="undefined")
				{
					_value="(Null)";
				}
			}
			
			
			if(typeof item.renderer!=="undefined")
			{
				_value=item.renderer(_value,"","","","","","");
			}
			
			_records.push({
				_attributeName:item._attributeName,
				_attributeTranslation:_trans,
				_attributeValue:_value,
				_attributeType:item._attributeType,
				_attributeEditor:item._attributeEditor
			});
			
		}
		
	});

	return _records;
}

function fn_createAttributesComboBox(_layerAttributes,_cmpId)
{
	
	var s = new fn_createAttributesComboStore(_layerAttributes);

	if ((typeof _cmpId==="undefined") || (_cmpId==""))
	{
		_cmpId=Ext.id();
	}
	
	var c=Ext.create('Ext.form.ComboBox',
	{
		border:false,
		store: s,
		id:_cmpId,
		queryMode: 'local',
		displayField: '_attributeTranslation',
		valueField: '_attributeName',
		emptyText:_maptab_east_search_panel_criteria_choose_attribute,
		value:"",
		forceSelection: true,
		selectOnFocus: false,
		triggerAction: 'all',
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{_attributeTranslation}' + '</li></tpl>'),
		editable: false
	});
	
	return c;
}

function fn_createAttributesComboStore(_layerAttributes)
{
	var s=new fn_createStorePivotGrid();
	
	var _records=new Array();

	Ext.each(_layerAttributes,function(item){
		
		var _trans=item._attributeTranslation;
			
		if ((!item._attributeIsGeometry) && (item._attributeVisible==true) && (item._attributeIsSearchable==true))
		{
			
			if ((_trans==null) || (typeof _trans=="undefined"))
			{
				_trans=item._attributeName;
			}
			
			var _value="";
			
			if (typeof _data!=="undefined")
			{
				_value=_data[item._attributeName];
				
				if(typeof _value=="undefined")
				{
					_value="(Null)";
				}
			}
			
			_records.push({
				_attributeName:item._attributeName,
				_attributeTranslation:_trans,
				_attributeValue:_value,
				_attributeType:item._attributeType,
				_attributeEditor:item._attributeEditor
			});
			
		}
		
	});
	
	s.loadData(_records);

	return s;
}

function fn_createCriteriaComboConditions(_attributeType)
{
	var _data=new Array();

	switch(_attributeType)
	{
		case "string":
			_data=[{"condition":'=',"disableValue":false},{"condition":'!=',"disableValue":false},{"condition":'LIKE',"disableValue":false},{"condition":'NOT LIKE',"disableValue":false},{"condition":'IS NOT NULL',"disableValue":true},{"condition":'IS NULL',"disableValue":true}];
		break;
	
		case "int":
			_data=[{condition:'=',disableValue:false},{condition:'>=',disableValue:false},{condition:'>',disableValue:false},{condition:'<=',disableValue:false},{condition:'<',disableValue:false},{condition:'IS NOT NULL',disableValue:true},{condition:'IS NULL',disableValue:true}];
		break;
		
		case "integer":
			_data=[{condition:'=',disableValue:false},{condition:'>=',disableValue:false},{condition:'>',disableValue:false},{condition:'<=',disableValue:false},{condition:'<',disableValue:false},{condition:'IS NOT NULL',disableValue:true},{condition:'IS NULL',disableValue:true}];
		break;
		
		case "double":
			_data=[{condition:'=',disableValue:false},{condition:'>=',disableValue:false},{condition:'>',disableValue:false},{condition:'<=',disableValue:false},{condition:'<',disableValue:false},{condition:'IS NOT NULL',disableValue:true},{condition:'IS NULL',disableValue:true}];
		break;
		
		case "decimal":
			_data=[{condition:'=',disableValue:false},{condition:'>=',disableValue:false},{condition:'>',disableValue:false},{condition:'<=',disableValue:false},{condition:'<',disableValue:false},{condition:'IS NOT NULL',disableValue:true},{condition:'IS NULL',disableValue:true}];
		break;
		
		case "date":
			_data=[{condition:'=',disableValue:false},{condition:'>=',disableValue:false},{condition:'>',disableValue:false},{condition:'<=',disableValue:false},{condition:'<',disableValue:false},{condition:'IS NOT NULL',disableValue:true},{condition:'IS NULL',disableValue:true}];
		break;
		
		default:
			_data=[{condition:'=',disableValue:false},{condition:'!=',disableValue:false},{condition:'LIKE',disableValue:false},{condition:'NOT LIKE',disableValue:false},{condition:'>=',disableValue:false},{condition:'>',disableValue:false},{condition:'<=',disableValue:false},{condition:'<',disableValue:false},{condition:'IS NOT NULL',disableValue:true},{condition:'IS NULL',disableValue:true}];
		break;
	}
	
	return _data;
}

function fn_createCriteriaAndOrCombo(_cmpId)
{

	if ((typeof _cmpId==="undefined") || (_cmpId==""))
	{
		_cmpId=Ext.id();
	}
	

	var c=Ext.create('Ext.form.ComboBox',
	{
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [
				["",""],
				["AND","AND"],
				["OR","OR"]
			]
		}),
		displayField: 'name',
		valueField: 'value',
		emptyText:"AND",
		width:60,
		id:_cmpId,
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false,
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	});
	
	return c;
}

function fn_createCriteriaParenthesis()
{
	var c=Ext.create('Ext.form.ComboBox',
	{
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [
				["",""],
				["(","("],
				[")",")"]
			]
		}),
		displayField: 'name',
		valueField: 'value',
		emptyText:"",
		width:60,
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false,
		tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{name}' + '</li></tpl>')
	});
	
	return c;
}

