var wmc_StoreColumnsService=new fn_storeColumnsService();
var wmc_StoreColumnsServiceLayers=new fn_storeColumnsServiceLayers();

init_onload_fn.push(wmc_init);

function wmc_init()
{
	maptab_services_manager_gridpanel_store.add({servicetype: 'WMC',serviceform:wmc_service_form});
	Ext.getCmp("maptab_services_manager_gridpanel_columns_service_type").add(wmc_service_form);
}

var wmc_service_form=new Ext.Panel({
	xtype:'panel',
	title:_maptab_services_manager_service_wmc_title_form,
	id:'wmc_service_form',
	layout:'border',
	border:false,
	hidden:true,
	items:[
		{
			xtype:'form',
			region:'north',
			border:true,
			anchor:'100%',
			fileUpload: true,
			isUpload: true,
			id:'maptab_services_manager_wmc_form',
			method:'POST',
			enctype:'multipart/form-data',
			height:100,
			items:[
				{
					xtype: 'textfield',
					fieldLabel:_maptab_services_manager_service_title,
					id:'maptab_services_manager_wmc_service_title',
					anchor:'100%'
				},
				{
					xtype: 'filefield',
					fieldLabel:_maptab_services_manager_wmcfile,
					name:'wmcfile',
					id:'maptab_services_manager_wmcfile',
					anchor:'100%',
				}
			],
			bbar:['->',
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_service,
					handler:function()
					{
						
						
						
						Ext.getCmp('wmc_service_form_service_grid').setLoading(true);
						
						var _params = [{
							_serviceType:"WMC",
							_serviceUrl:'',
							_serviceTitle:Ext.getCmp('maptab_services_manager_wmc_service_title').getValue(),
							_request:"registerService",
							_username:'',
							_password:''
						}]
					
						Ext.getCmp('maptab_services_manager_wmc_form').submit({
							url: _proxy_url,
							params:{data:Ext.JSON.encode(_params)},
							success: function(result, response){
								
							},
							failure: function(form, action){
								
								var records = Ext.JSON.decode(action.response.responseText);
								
								var record = records[0];
								
								if(record._errorStatus<0)
								{
									var _response = record._response;
									
									wmc_StoreColumnsService.store.add({
										_isSecure:_response._isSecure,
										_serviceTitle:_response._serviceTitle,
										_serviceUrl:_response._serviceUrl,
										_serviceAbstract:_response._serviceAbstract,
										_version:_response._version,
										_serviceObject:_response
									});
									
									Ext.getCmp('wmc_service_form_service_grid').setLoading(false);
								}
								
							}
						});
					}
				}
			]
		},
		{
			xtype:'gridpanel',
			region:'center',
			border:true,
			minHeight:180,
			columnLines:true,
			split: true,
			id:'wmc_service_form_service_grid',
			store:wmc_StoreColumnsService.store,
			columns:wmc_StoreColumnsService.columns,
			selModel: Ext.create('Ext.selection.CheckboxModel'),
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpanderWMCService',
				rowBodyTpl : [
					'<div style=\"margin-left:50px;width:100%;\"><b>'+_maptab_services_manager_storecolumns_column_service_abstract+':</b><br> {_serviceAbstract}</div>'
				]
			}],
			bbar:['->',
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_layer,
					handler:function()
					{
						
						var selected=Ext.getCmp('wmc_service_form_service_grid').getSelectionModel().getSelection();
						
						if (selected.length>0)
						{
							wmc_OptionsWindow().show();
						}
						
						
					}
				}
			]
		}
	]
});

function wmc_OptionsWindow()
{
	var _w=new Ext.Window({ 
		width:250,
		height:120,
		modal:true,
		shim:true,
		title:_maptab_services_manager_add_choices,
		resizable:true,
		closeAction:'destroy',
		layout:'fit',
		items:[{
			xtype:'panel',
			layout:'form',
			bbar:['->',
				{
					xtype:'button',
					text:_maptab_services_manager_service_cancel,
					iconCls:'map_general_cancel_btn',
					tabIndex:3,
					handler:function(btn,e)
					{
						btn.findParentByType("window").close();
					}
				},
				{
					xtype:'button',
					text:_maptab_services_manager_register_layer,
					iconCls:'maptab_services_manager_register',
					tabIndex:4,
					handler:function(btn,e)
					{
						var remove_layers = Ext.getCmp("maptab_services_manager_add_choices_remove_layers").getValue();
						
						var remove_groups = Ext.getCmp("maptab_services_manager_add_choices_remove_groups").getValue();
						
						if (remove_groups==true)
						{
							wmc_remove_groups();
						}else{
							if(remove_layers==true)
							{
								wmc_remove_layers();
							}
						}
						
						btn.findParentByType("window").close();
						
						wmc_add_layers();
					}
				}
			],
			items:[
				{
					xtype:'checkbox',
					labelSeparator: '',
					hideLabel: true,
					id:'maptab_services_manager_add_choices_remove_groups',
					boxLabel: _maptab_services_manager_add_choices_remove_groups,
					fieldLabel:_maptab_services_manager_add_choices_remove_groups, 
					tabIndex:1,
					handler:function(obj)
					{
						if(obj.checked)
						{
							Ext.getCmp("maptab_services_manager_add_choices_remove_layers").setValue(true);
							
							Ext.getCmp("maptab_services_manager_add_choices_remove_layers").disable();
							
						}else{
							
							Ext.getCmp("maptab_services_manager_add_choices_remove_layers").enable();
							
						}
					}	
				},
				{
					xtype:'checkbox',
					labelSeparator: '',
					hideLabel: true,
					id:'maptab_services_manager_add_choices_remove_layers',
					boxLabel: _maptab_services_manager_add_choices_remove_layers,
					fieldLabel:_maptab_services_manager_add_choices_remove_layers,
					tabIndex:2
				}
			]
		}]
	});

	return _w;
}

function wmc_add_layers()
{
	var selected=Ext.getCmp('wmc_service_form_service_grid').getSelectionModel().getSelection();
	
	Ext.each(selected,function(item){
	
		var _obj = item.get("_serviceObject");
	
		Ext.each(_obj._layers,function(_layer)
		{
			var _serviceUrl = _layer._serviceUrl;
		
			var _serviceType = _layer._serviceType;
			
			var _layerName = _layer._layerName;
			
			var _layerTitle = _layer._layerTitle;
				
			var _visibility = _layer._visibility;
			
			var _message=_maptab_services_manager_loading_layer_message;
				
			_message=_message.replace("{_layerTitle}",_layerTitle);
				
			_message=_message.replace("{_layerName}",_layerName);
			
			var mask=fn_loadingMask(maptab_services_manager,_message);
			
			mask.show();
			
			switch(_serviceType)
			{
				case "wmts":

					try{

						var _serviceObject
	
						_serviceObject = wmts_StoreColumnsService.store.findRecord('_serviceUrl', _serviceUrl,0,false,true,true);

						if(_serviceObject === null)
						{
							_serviceObject = wmts_register_service(_serviceUrl,"","");
						}else{
							_serviceObject = _serviceObject.get("_serviceObject");
						}
						
						wmts_fetch_layers(_serviceObject);

						var _layerObject;

						_layerObject = wmts_StoreColumnsServiceLayers.store.findRecord('_layerName', _layerName,0,false,true,true).get("_layerObject");
					
						if (_layerObject)
						{
							wmts_register_layer(_serviceObject,_layerObject);
						}
					
					}catch(err){}
			
				break;
			
				case "wms":
			
					try{
						
						var _serviceObject
		
						_serviceObject = wms_StoreColumnsService.store.findRecord('_serviceUrl', _serviceUrl,0,false,true,true);

						if(_serviceObject === null)
						{
							_serviceObject = wms_register_service(_serviceUrl,"","");
						}else{
							_serviceObject = _serviceObject.get("_serviceObject");
						}
						
						wms_fetch_layers(_serviceObject);
						
						var _layerObject;

						_layerObject = wms_StoreColumnsServiceLayers.store.findRecord('_layerName', _layerName,0,false,true,true).get("_layerObject");
						
						if (_layerObject)
						{
							wms_register_layer(_serviceObject,_layerObject);
						}
						
					}catch(err){}
					
				break;
				
				case "wfs":
				
					try{
						
						var _serviceObject
		
						_serviceObject = wfs_StoreColumnsService.store.findRecord('_serviceUrl', _serviceUrl,0,false,true,true);

						if(_serviceObject === null)
						{
							_serviceObject = wfs_register_service(_serviceUrl,"","");
						}else{
							_serviceObject = _serviceObject.get("_serviceObject");
						}
						
						wfs_fetch_layers(_serviceObject);
						
						var _layerObject;

						_layerObject = wfs_StoreColumnsServiceLayers.store.findRecord('_layerName', _layerName,0,false,true,true).get("_layerObject");
						
						if (_layerObject)
						{
							wfs_register_layer(_serviceObject,_layerObject);
						}
						
					}catch(err){}
				
				break;
			}
		
			Ext.getCmp('wmc_service_form_service_grid').getView().refresh();
			
			mask.hide();
		
		});
	});	
}

function wmc_remove_layers()
{
	var overlayers=mapGetlayersBy("isBaseLayer",false);

	for(var i=(overlayers.length-1);i>=0;i--)
	{
		if (typeof overlayers[i]._layerObject!=="undefined")
		{
			maptab_west_layer_remove_node(maptab_west_layer_get_node_from_id(overlayers[i]._layerObject._layerId));
		}
	}
	
}

function wmc_remove_groups()
{
	wmc_remove_layers();
	
	maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_layers_node').removeAll();
}
