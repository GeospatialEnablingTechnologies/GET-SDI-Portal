var _configurator_config_groups;

var _configurator_config_layers;

var _configurator_config_map;

var _configurator_general;

var _configurator_layer_general;

var _configurator_layer_attributes;

var configurator_translation={
	el_gr:{
		configurator:'Παραμετροποίηση',
		save_configurator:'Αποθήκευση Παραμετροποίησης',
		save_layer:'Αποθήκευση Επιπέδου',
		_attribute_configurator:'Ιδιότητες',
		_attributeName:'Όνομα Ιδιότητας',
		_attributeType:'Τύπος Ιδιότητας',
		_attributeInclude:'Ενεργή',
		_attributeTranslation:'Μετάφραση',
		_attributeEditor:'Αντικείμενο Επεξεργασίας',
		_attributeIsSortable:'Σορτάρισμα',
		_attributeIsVisible:'Εμφάνιση',
		_attributeIsSearchable:'Αναζητήσιμο',
		_attributeVisible:'Είναι εμφανή',
		_renderer:'Απόδοση',
		_attributeShowOnSummary:'Στην περίληψη',
		_refresh:'Ανανέωση Ιδιοτήτων Επιπέδου'
	},
	en_us:{
		configurator:'Configurator',
		save_configurator:'Save Configuration',
		save_layer:'Save Layer',
		_attribute_configurator:'Attributes',
		_attributeName:'Attribute Name',
		_attributeType:'Attribute Type',
		_attributeInclude:'Publish',
		_attributeTranslation:'Translation',
		_attributeEditor:'Editor',
		_attributeIsSortable:'Sortable',
		_attributeIsVisible:'Is Visible',
		_attributeIsSearchable:'Searchable',
		_attributeVisible:'Visible',
		_renderer:'Renderer',
		_attributeShowOnSummary:'On Summary',
		_refresh:'Resfresh Layer Attributes'
	}

};

var configurator_btn=[
	{
		xtype:'button',
		iconCls:'features_toolbar_download',
		id:'configurator_save',
		tooltip:configurator_translation[language].save_configurator,
		text:configurator_translation[language].save_configurator,
		handler:function(item,state){
			fn_configurator_create();
		}
	},{
		html:"<form id=\"configurator_form\" action=\""+host+"modules/configurator/index.php\" method=\"post\" target=\"configurator_iframe\" ><input type=\"hidden\" id=\"configurator_form_hidden\" name=\"data\"></input></form><iframe name=\"configurator_iframe\"></frame>",
		hidden:true
	
	}];

var configurator = function(){return {
	text: configurator_translation[language].configurator,
	handler:function(){
	
		var _layerId=this.ownerCt._nodeId;
			
		if(mapFindLayerById(_layerId)._layerObject)
		{
			var _w = new fn_configurator_create_window(mapFindLayerById(_layerId)._layerObject, mapFindLayerById(_layerId)._serviceObject);
			
			_w.show();
		}
	}
}};

init_onload_fn.push(init_layerdownloads);

function init_layerdownloads()
{
	Ext.getCmp("maptab_north_tabpanel").add({
		xtype:'toolbar',
		border:false,
		id:'maptab_toolbar_configurator_tab',
		iconCls:'maptab_toolbar_general_icon',
		title:configurator_translation[language].configurator,
		items:configurator_btn
	});
	
	
	_maptab_west_layer_layer_menu_components.push(new configurator);
	
}

Ext.define('configuratorLayersStoreModel', {
    extend: 'Ext.data.Model',
    fields: [
		{name: '_attributeName', type: 'string'},
		{name: '_attributeType', type: 'string'},
		{name: '_attributeInclude', type: 'string'},
		{name: '_attributeTranslation', type: 'string'},
		{name: 'renderer', type: 'string'},
		{name: '_attributeEditor', type: 'string'},
		{name: '_attributeIsSortable', type: 'string'},
		{name: '_attributeIsVisible', type: 'string'},
		{name: '_attributeIsSearchable', type: 'string'},
		{name: '_attributeVisible', type: 'string'},
		{name: '_attributeShowOnSummary', type: 'string'}
    ]
});
 

function fn_configurator_create()
{
	var _a =fn_configurator_get_groups(maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_layers_node'));
	
	var _l = fn_get_layers();
	
	var _mc=map.getCenter();
	
	if (mapGetCurrentProjection()!="EPSG:4326")
	{
		_mc.transform(new OpenLayers.Projection(mapGetCurrentProjection()), new OpenLayers.Projection("EPSG:4326"));
	}
	
	var _mz=map.getZoom();
	
	var _data={
		_config_create_tree_groups:_a,
		_config_load_layers:_l,
		lon:_mc.lon,
		lat:_mc.lat,
		zoom:_mz
		};
	
	
	document.getElementById("configurator_form_hidden").value=Ext.JSON.encode(_data);
	
	document.getElementById("configurator_form").submit();
	
}

function fn_get_layers()
{
	var _s = fn_get_services();

	var overlayers=mapGetlayersBy("isBaseLayer",false);
	
	var _layerConfigArr=new Array();
	
	var _layerNames = new Array();
	
	for(var i=overlayers.length-1;i>=0;i--)
	{
		var layer=overlayers[i];
		
		if (typeof layer._layerObject!=="undefined")
		{
			var _attributes = new Array();
			
			var _attributesFields = new Array();
		
			Ext.each(layer._layerObject._attributesFields,function(item){
			
				if ((item._attributeInclude==true) || (typeof item._attributeInclude=="undefined"))
				{
					_attributes.push(item._attributeName);
					
					var renderer = item.renderer;
		
					if (typeof renderer === "function") {
					
						item.renderer = "#"+renderer.name+"#";
					}
					
					_attributesFields.push(item);
				}
				
			});
			
			var _serviceIndex =fn_objIndexOf(_s,"_serviceUrl",layer._serviceObject._serviceUrl);
			
			if (_serviceIndex>=0)
			{
				var _groupId = maptab_west_layer_get_node_from_id(layer._layerObject._layerId).parentNode;
			
				if (_groupId.data._groupId!="layers")
				{
					_groupId="_groupId_"+fn_configurator_getNodePath(_groupId);
				}else{
					_groupId="layers";
				}
			
				var _perlayerConfig={
					_layerName:layer._layerObject._layerName,
					_layerTitle:maptab_west_layer_get_layer_title(layer._layerObject._layerId),
					_layerAbstract:'',
					_singleTile:false,
					_groupId:_groupId,
					_sld_body:'',
					_isSearchable:layer._layerObject._isSearchable,
					_attributesReorder:true,
					_sld_url:'',
					_singleTile:true,
					_visibility:layer.visibility,
					_nativeSRS:layer._layerObject._nativeSRS,
					_geometryIsMulti:layer._layerObject._geometryIsMulti,
					_geometryType:layer._layerObject._geometryType,
					_xy:layer._layerObject._xy,
					_featureType:layer._layerObject._featureType,
					_featureNS:layer._layerObject._featureNS,
					_editServiceUrl:layer._layerObject._editServiceUrl,
					_geometryField:layer._layerObject._geometryField,
					_opacity:layer.opacity,
					_attributes:_attributes,
					_attributesExceptions:[],
					_attributesFields:_attributesFields
				};
				
				_s[_serviceIndex]._layerName.push(layer._layerObject._layerName);
				_s[_serviceIndex]._perLayerProperties.push(_perlayerConfig);
			}
			
		}
	}
	
	return _s;

}

function fn_get_services()
{
	var _config_layers=new Array();

	maptab_services_manager_gridpanel_store.each(function(item){
	
		var _storeId = item.data.servicetype+"_service_form_service_grid";
		
		_storeId=_storeId.toLowerCase();
		
		Ext.getCmp(_storeId).getStore().each(function(_service){

			var _serviceobj={
				_serviceUrl:_service.get("_serviceUrl"),
				_serviceType:_service.get("_serviceObject")._serviceType,
				_username:_service.get("_serviceObject")._username,
				_password:_service.get("_serviceObject")._password,
				_layerName:[],
				_groupId:'layers',
				_generalProperties:{
					_isQueryable:'inherit',
					_isSearchable:'inherit',
					_isEditable:'inherit',
					_isPrintable:'inherit',
					_isSLDEditable:'inherit',
					_singleTile:'*',
					_tiled:'inherit',
					_transparent:'inherit',
					_visibility:'*'
				},
				_perLayerProperties:[]
			};
				
			_config_layers.push(_serviceobj);
		});
	});
	
	return _config_layers;
}

function fn_configurator_getNodePath(_node)
{
	
	var groupId="";
	
	if (_node!=null)
	{
		if ((_node.hasChildNodes()) && (!_node.isLeaf()) && (typeof _node!=="undefined") )
		{
			groupId += _node.data.depth+"_"+_node.data.index+"_"+fn_configurator_getNodePath(_node.parentNode);
		}
	}
	
	return groupId;
	
}


function fn_configurator_get_groups(_node)
{
	if ((_node.hasChildNodes()) && (!_node.isLeaf()))
	{
		var arr=new Array();
		
		Ext.each(_node.childNodes,function(item)
		{
		
			if (!item.isLeaf())
			{
				arr.push({
					text:item.data.text,
					children:fn_configurator_get_groups(item),
					_groupId:"_groupId_"+fn_configurator_getNodePath(item),
					checked:item.data.checked,
					expanded:item.data.expanded,
					leaf: false
				});
			}
			
		});
		
		return arr;
	}
	
}

function fn_configurator_create_attribute_grid(_layerObject,_serviceObject)
{
	var _data=new Array();

	Ext.each(_layerObject._attributesFields,function(item){
		
		
		if (typeof item._attributeInclude=="undefined")
		{
			item._attributeInclude=true;
		}
		
		var renderer = item.renderer;
		
		if (typeof renderer === "function") {
		
			renderer = renderer.name;
		}
		
		var _r ={
			'_attributeName':item._attributeName,
			'_attributeType':item._attributeType,
			'_attributeInclude':item._attributeInclude,
			'_attributeTranslation':item._attributeTranslation,
			'renderer':renderer,
			'_attributeEditor':item._attributeEditor,
			'_attributeIsSortable':item._attributeIsSortable,
			'_attributeIsVisible':item._attributeIsVisible,
			'_attributeIsSearchable':item._attributeIsSearchable,
			'_attributeVisible':item._attributeVisible,
			'_attributeShowOnSummary':item._attributeShowOnSummary
		}
		
		_data.push(_r);
	})

	var _s = Ext.create('Ext.data.Store', {
			model:'configuratorLayersStoreModel',
			data:_data});
			
	var cellEditing= Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 2,
			_layerId:_layerObject._layerId,
			listeners:{
				'afteredit':function(editor, e, eOpts)
				{
					var _index = fn_objIndexOf(mapFindLayerById(this._layerId)._layerObject._attributesFields,"_attributeName",e.record.data._attributeName);
				
					var value = e.record.data[e.field];
				
					switch(e.record.data[e.field])
					{
						case "false":
							value=false;
						break;
						
						case "true":
							value=true;
						break;
						
						
					}
					mapFindLayerById(this._layerId)._layerObject._attributesFields[_index][e.field]=value;
					
				}
			}
		});

	var _g = Ext.create('Ext.grid.Panel',{
			store:_s,
			plugins:cellEditing,
			_layerId:_layerObject._layerId,
			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop',
					dragText: 'Drag and drop to reorganize'
				},
				listeners: {
					drop: function(node, data, dropRec, dropPosition) {
					
						//alert(data.records[0].get("_attributeName"));
						
						var _reorderLayers = new Array();
						
						_s.each(function(item, index){
						
							var _index = fn_objIndexOf(mapFindLayerById(_g._layerId)._layerObject._attributesFields,"_attributeName",item.get("_attributeName"));
							
							var _layerAttribute = mapFindLayerById(_g._layerId)._layerObject._attributesFields[_index];
							
							_reorderLayers.push(_layerAttribute);
						});
						//
						
						mapFindLayerById(_g._layerId)._layerObject._attributesFields = _reorderLayers;
					}
				}
			},
			border:false,
			bbar:['->',{
				xtype:'button',
				iconCls:'refresh',
				text:configurator_translation[language]._refresh,
				handler:function()
				{
					var r=new fn_get();
		
					r._async=true;
					
					r._data.push({
						_serviceType:_serviceObject._serviceType,
						_serviceUrl:_serviceObject._serviceUrl,
						_request:"registerLayer",
						_username:_serviceObject._username,
						_password:_serviceObject._password,
						_layerName:_layerObject._layerName,
						_layerId:_layerObject._layerId
					});
					
					r._success = function(_response, _opts)
					{
						var response=Ext.JSON.decode(_response.responseText);
			
						record = response[0]._response;
						
						var _new_attributes = new Array();
						
						Ext.each(record._attributes,function(_recordAttr){
						
							var _attrExists = false;
						
							Ext.each(_layerObject._attributesFields,function(_currentAttr){
								
								if (_recordAttr._attributeName == _currentAttr._attributeName)
								{
									_attrExists = true;
									
									_new_attributes.push(_currentAttr);
								}
							});
							
							if (_attrExists===false)
							{
								_new_attributes.push(_recordAttr);
							}
						
						});
						
						_layerObject._attributesFields=_new_attributes;
						
						var _w_id = _g.findParentByType('window').id;
						
						_g.findParentByType('window').removeAll();
						
						Ext.getCmp(_w_id).add(fn_configurator_create_attribute_grid(_layerObject,_serviceObject));
					}
					
					r.get();
				
				}
			},{
				xtype:'button',
				iconCls:'save',
				text:configurator_translation[language].save_layer,
				handler:function()
				{
					_g.findParentByType('window').close();
				
				}
			
			}],
			columns: [
				{
					text: configurator_translation[language]._attributeName,
					dataIndex: '_attributeName'
				},
				{
					text: configurator_translation[language]._attributeType,
					dataIndex: '_attributeType'
				},
				{
					text: configurator_translation[language]._attributeInclude,
					dataIndex: '_attributeInclude',
					field: {
						xtype:'checkbox'
					}
				},
				{
					text: configurator_translation[language]._attributeTranslation,
					dataIndex: '_attributeTranslation',
					field: {
						xtype:'textfield'
					}
				},
				{
					text: configurator_translation[language]._renderer,
					dataIndex: 'renderer',
					field: {
							xtype:'combobox',
							displayField: 'name',
							valueField: 'value',
							store:new Ext.data.SimpleStore({
								fields: ['name','value'],
								data:[["none",""],["image","#image#"],["link","#link#"],["email","#email#"]]
							}),
							displayField: 'name',
							valueField: 'value',
							forceSelection: true,
							triggerAction: 'all',
							selectOnFocus: false,
							mode: 'local',
							editable: false
						}
				},
				{
					text: configurator_translation[language]._attributeEditor,
					dataIndex: '_attributeEditor',
					hidden:true
				},
				{
					text: configurator_translation[language]._attributeIsSortable,
					dataIndex: '_attributeIsSortable',
					field: {
						xtype:'checkbox'
					}
				},
				{
					text: configurator_translation[language]._attributeIsVisible,
					dataIndex: '_attributeIsVisible',
					field: {
						xtype:'checkbox'
					}
				},
				{
					text: configurator_translation[language]._attributeIsSearchable,
					dataIndex: '_attributeIsSearchable',
					field: {
						xtype:'checkbox'
					}
				},
				{
					text: configurator_translation[language]._attributeVisible,
					dataIndex: '_attributeVisible',
					field: {
						xtype:'checkbox'
					}
				},
				{
					text: configurator_translation[language]._attributeShowOnSummary,
					dataIndex: '_attributeShowOnSummary',
					field: {
						xtype:'checkbox'
					}
				}
			]
		});

	return _g;
}


function fn_configurator_create_window(_layerObject,_serviceObject)
{
	var _g = new fn_configurator_create_attribute_grid(_layerObject,_serviceObject);

	var _w = new Ext.Window({ 
		width:740,
		height:550,
		minWidth:740,
		minHeight:550,
		title: configurator_translation[language].configurator,
		modal:true,
		shim:true,
		resizable:true,
		closeAction:'hide',
		layout:'fit',
		items:[_g]
	});
	
	return _w;
}

