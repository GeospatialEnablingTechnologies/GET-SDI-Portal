var wmts_StoreColumnsService=new fn_storeColumnsService();
var wmts_StoreColumnsServiceLayers=new fn_storeColumnsServiceLayers();

init_onload_fn.push(wmts_init);

function wmts_init()
{
	maptab_services_manager_gridpanel_store.add({servicetype: 'WMTS',serviceform:wmts_service_form});
	Ext.getCmp("maptab_services_manager_gridpanel_columns_service_type").add(wmts_service_form);
}

var wmts_service_form=new Ext.Panel({
	xtype:'panel',
	id:'wmts_service_form',
	layout:'border',
	title:_maptab_services_manager_service_wmts_title_form,
	border:false,
	hidden:true,
	listeners:{
		show:function()
		{
			Ext.getCmp('wmts_service_form_layers_grid').getView().refresh();
		}
	},
	items:[
		{
			xtype:'panel',
			region:'north',
			layout:'form',
			border:true,
			height:80,
			items:[
				{
					xtype: 'textfield',
					fieldLabel:_maptab_services_manager_service_address,
					id:'maptab_services_manager_wmts_service_address',
					width:300
				}
			],
			bbar:['->',
				{
					xtype:'checkbox',
					id:'maptab_services_manager_wmts_service_require_authentication',
					boxLabel:_maptab_services_manager_required_authentication
				},
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_service,
					handler:function()
					{
						Ext.getCmp('wmts_service_form_service_grid').setLoading(true);
						
						if (Ext.getCmp("maptab_services_manager_wmts_service_require_authentication").getValue())
						{
							var _w=wmts_serviceCredentialsWindow(Ext.getCmp('maptab_services_manager_wmts_service_address').getValue());
							
							_w.show();
						}
						else
						{
							wmts_register_service(Ext.getCmp('maptab_services_manager_wmts_service_address').getValue());
						}
						
						Ext.getCmp('wmts_service_form_service_grid').setLoading(false);
					
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
			id:'wmts_service_form_service_grid',
			store:wmts_StoreColumnsService.store,
			columns:wmts_StoreColumnsService.columns,
			selModel: Ext.create('Ext.selection.CheckboxModel'),
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpanderWMTSService',
				rowBodyTpl : [
					'<div style=\"margin-left:50px;width:100%;\"><b>'+_maptab_services_manager_storecolumns_column_service_abstract+':</b><br> {_serviceAbstract}</div>'
				]
			}],
			bbar:['->',
				{
					xtype:'button',
					iconCls:'maptab_services_manager_unregister',
					text:_maptab_services_manager_unregister_service,
					handler:function()
					{
						var selected=Ext.getCmp('wmts_service_form_service_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							var overlayers=mapGetlayersBy("isBaseLayer",false);

							for(var i=(overlayers.length-1);i>=0;i--)
							{
								if (overlayers[i]._serviceObject._serviceUrl==item.get("_serviceUrl"))
								{
									if(typeof overlayers[i]._layerObject!=="undefined")
									{
										maptab_west_layer_remove_node(maptab_west_layer_get_node_from_id(overlayers[i]._layerObject._layerId));
									}
								}
							}
							
							Ext.getCmp('wmts_service_form_service_grid').getStore().remove(item);
						});
					
						Ext.getCmp('wmts_service_form_layers_grid').getStore().removeAll();
					}
				},
				{
					xtype:'button',
					text:_maptab_services_manager_show_layers,
					handler:function(){
					
						var selected=Ext.getCmp('wmts_service_form_service_grid').getSelectionModel().getSelection();
						
						Ext.getCmp('wmts_service_form_layers_grid').setLoading(true);
						
						Ext.each(selected,function(item)
						{
							wmts_fetch_layers(item.get("_serviceObject"));
							
						});
					
						Ext.getCmp('wmts_service_form_layers_grid').setLoading(false);
					}
				}
			]
		},
		{
			xtype:'gridpanel',
			region:'south',
			border:true,
			height:200,
			split: true,
			columnLines:true,
			viewConfig:{preserveScrollOnRefresh:true},
			id:'wmts_service_form_layers_grid',
			store:wmts_StoreColumnsServiceLayers.store,
			columns:wmts_StoreColumnsServiceLayers.columns,
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpanderWMTSLayer',
				rowBodyTpl : [
					'<div style=\"margin-left:50px;width:100%;\"><b>'+_maptab_services_manager_storecolumns_column_service_abstract+':</b><br> {_layerAbstract}</div>'
				]
			}],
			selModel: Ext.create('Ext.selection.CheckboxModel'),
			bbar:['->',
				{
					xtype:'button',
					iconCls:'maptab_services_manager_unregister',
					text:_maptab_services_manager_unregister_layer,
					handler:function()
					{
						var selected=Ext.getCmp('wmts_service_form_layers_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							if (item.get("_layerObject")._loadedStatus>0)
							{
								var _message=_maptab_services_manager_unregister_layer_message;
						
								_message=_message.replace("{_layerTitle}",item.get("_layerTitle"));
							
								_message=_message.replace("{_layerName}",item.get("_layerName")); 
						
								var mask=fn_loadingMask(maptab_services_manager,_message);
							
								mask.show();
							
								maptab_west_layer_remove_node(maptab_west_layer_get_node_from_id(item.get("_layerObject")._layerId));
							
								item.get("_layerObject")._loadedStatus=0;
							
								Ext.getCmp('wmts_service_form_layers_grid').getView().refresh();
								
								mask.hide();
							}
						});
					
					}
				},
				{
					xtype:'button',
					iconCls:'map_general_setting_btn',
					hidden:true,
					text:_maptab_services_manager_settings_layer,
					handler:function()
					{
						wmts_layer_settings_window.show();
					}
				},
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_layer,
					handler:function()
					{
						var selected=Ext.getCmp('wmts_service_form_layers_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							var _message=_maptab_services_manager_loading_layer_message;
						
							_message=_message.replace("{_layerTitle}",item.get("_layerTitle"));
							
							_message=_message.replace("{_layerName}",item.get("_layerName"));
						
							var mask=fn_loadingMask(maptab_services_manager,_message);
							
							mask.show();
						
							wmts_register_layer(item.get("_serviceObject"),item.get("_layerObject"));
							
							Ext.getCmp('wmts_service_form_layers_grid').getView().refresh();
							
							mask.hide();
						});
					}
				}
			]
		}
	]
});

function wmts_map_layer(_serviceObject,_layerObject)
{
	
	var service_url=_serviceObject._serviceUrl;
		
	if (_serviceObject._isSecure==true)
	{
		service_url=fn_surl(_serviceObject._serviceUrl,_serviceObject._username,_serviceObject._password,'proxy');
	}
	
	
	var _matrixSet="";
	var _matrixIds="";
	var _tileOrigin="";
	var _projection="";
	
	if (_layerObject._extras._matrix[mapGetCurrentProjection()])
	{
		_matrixSet = _layerObject._extras._matrix[mapGetCurrentProjection()]._matrixSet;
		_matrixIds = _layerObject._extras._matrix[mapGetCurrentProjection()]._matrixIds;
		_tileOrigin = new OpenLayers.LonLat(_layerObject._extras._matrix[mapGetCurrentProjection()]._tileOriginX,_layerObject._extras._matrix[mapGetCurrentProjection()]._tileOriginY);
		_projection = new OpenLayers.Projection(_layerObject._extras._matrix[mapGetCurrentProjection()]._projection);
	}
	
	var layer= new OpenLayers.Layer.WMTS({
		name: _layerObject._layerTitle,
		url:service_url,
		layer: _layerObject._layerName,
		matrixSet: _matrixSet,
		matrixIds: _matrixIds,
		format: _layerObject._layerFormat,
		transparent: _layerObject._transparent,
		tileOrigin: _tileOrigin,
		style: "",
		isBaseLayer: false,
		tileFullExtent:mapLayerBounds(_layerObject),
		projection: _projection,
		_layerObject:_layerObject,
		_serviceObject:_serviceObject,
		transitionEffect:null,
		visibility:_layerObject._visibility
	},{
		transitionEffect:null,	
		opacity:_layerObject._opacity
	});
	
	layer.id=_layerObject._layerId;
	
	
	
	return layer;
}

function wmts_changeBasemap(_layer)
{	

	if (_layer._layerObject._extras._matrix[mapGetCurrentProjection()])
	{
		_layer.matrixSet=_layer._layerObject._extras._matrix[mapGetCurrentProjection()]._matrixSet;
		
		var matrixIds = new Array();
		
		for (var i=0; i<_layer._layerObject._extras._matrix[mapGetCurrentProjection()]._matrixIds.length; ++i) 
		{
			matrixIds[i] = {identifier: _layer._layerObject._extras._matrix[mapGetCurrentProjection()]._matrixIds[i]};
		}
		
		_layer.matrixIds=matrixIds;
		
		_layer.tileOrigin=new OpenLayers.LonLat(_layer._layerObject._extras._matrix[mapGetCurrentProjection()]._tileOriginX,_layer._layerObject._extras._matrix[mapGetCurrentProjection()]._tileOriginY);
		
		_layer.tileFullExtent=mapLayerBounds(_layer._layerObject);
		
		_layer.projection=new OpenLayers.Projection(_layer._layerObject._extras._matrix[mapGetCurrentProjection()]._projection);
		
		_layer.redraw();
	}
}


function wmts_register_layer(_serviceObject,_layerObject)
{
	if (!mapFindLayerById(_layerObject._layerId))
	{
		var r=new fn_get();
		
		r._async=false;
		
		r._data.push({
			_serviceType:"WMTS",
			_serviceUrl:_serviceObject._serviceUrl,
			_request:"registerLayer",
			_username:_serviceObject._username,
			_password:_serviceObject._password,
			_layerName:_layerObject._layerName
		});
		
		var response=Ext.JSON.decode(r.get().responseText);
		
		var record=response[0]._response;
		
		var _matrix=new Array();
		
		var _supportedEPSG=new Array();
		
		Ext.each(record,function(item)
		{
			_matrix[mapGetProjectionCode(item._matrixEPSG)]={
				_matrixSet:item._matrixSet,
				_matrixIds:item._matrixIds,
				_tileOriginX:item._topLeftCornerX,
				_tileOriginY:item._topLeftCornerY,
				_projection:item._matrixEPSG
			}
			
			_supportedEPSG.push(mapGetProjectionCode(item._matrixEPSG));
		});
		
		_layerObject._extras={
			_matrix:_matrix
		};
		
		
		var _configRecord;
		
		_configRecord = config_findConfig(_layerObject,_serviceObject);
		
		if (!_configRecord){
		
		}else{
		
			_layerObject._visibility = _configRecord._visibility;
			
			_layerObject._opacity = _configRecord._opacity;
		}
		
		_layerObject._loadedStatus=1;
		
		_layerObject._supportedEPSG=_supportedEPSG;
		
		mapBeforeAddLayer(_serviceObject,_layerObject);

		_layerObject._layer=wmts_map_layer(_serviceObject,_layerObject);
		
		mapAddLayer(_serviceObject,_layerObject);
	}
	
}

function wmts_register_service(_serviceUrl,_username,_password)
{	
	var r=new fn_get();
	
	r._async=false;
	
	r._data.push({
		_serviceType:"WMTS",
		_serviceUrl:_serviceUrl,
		_request:"registerService",
		_username:_username,
		_password:_password
	});
	
	var response;
	
	try
	{
		response=Ext.JSON.decode(r.get().responseText);
	}
	catch(err){return;}
	
	
	switch(response[0]._responseCode)
	{
		case "401":
			
			var _w=wmts_serviceCredentialsWindow(_serviceUrl);
			
			_w.show();
			
		break;
		
		case "200":
		
			var records=response[0]._response;
	
			if ((records._version!="") || (records._version!=null))
			{
	
				wmts_StoreColumnsService.store.add({
					_isSecure:records._isSecure,
					_serviceTitle:records._serviceTitle,
					_serviceUrl:records._serviceUrl,
					_serviceAbstract:records._serviceAbstract,
					_version:records._version,
					_serviceObject:records
				});
				
				return records;
			}
		break;
	
	}
}


function wmts_serviceCredentialsWindow(_serviceUrl)
{
	var _w=new Ext.Window({ 
		width:250,
		height:120,
		modal:true,
		shim:true,
		title:_maptab_services_manager_service_credentials,
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
						btn.findParentByType("window").hide();
					}
				},
				{
					xtype:'button',
					text:_maptab_services_manager_register_service,
					iconCls:'maptab_services_issecure',
					tabIndex:4,
					handler:function(btn,e)
					{
						var _panel=btn.findParentByType("panel").items.items;
						
						var _username=fn_encrypt(_panel[0].getValue());
						
						var _password=fn_encrypt(_panel[1].getValue());
						
						if ((_username!="") && (_password!=""))
						{
							wfs_register_service(_serviceUrl,_username,_password);
						}
						
						btn.findParentByType("window").hide();
					}
				}
			],
			items:[
				{
					xtype:'textfield',
					fieldLabel:_maptab_services_manager_service_username,
					tabIndex:1
				},
				{
					xtype:'textfield',
					fieldLabel:_maptab_services_manager_service_password,
					inputType:'password',
					tabIndex:2
				}
			]
		}]
	});

	return _w;
}

function wmts_fetch_layers(_serviceObject)
{	
	if(_serviceObject)
	{
		wmts_StoreColumnsServiceLayers.store.removeAll();

		var r=new fn_get();
		
		r._async=false;
		
		r._data.push({
			_serviceType:"WMTS",
			_serviceUrl:_serviceObject._serviceUrl,
			_request:"fetchLayers",
			_username:_serviceObject._username,
			_password:_serviceObject._password
		});
		
		var response=Ext.JSON.decode(r.get().responseText);
		
		var records=response[0]._response._layers;
		
		Ext.each(records,function(item)
		{
			item._layerTitle=config_getProperty(item,_serviceObject,"_layerTitle",item._layerTitle);
				
			item._layerAbstract=config_getProperty(item,_serviceObject,"_layerAbstract",item._layerAbstract);
		
			wmts_StoreColumnsServiceLayers.store.add({
				_layerId:item._layerId,
				_layerName:item._layerName,
				_layerTitle:item._layerTitle,
				_layerAbstract:item._layerAbstract,
				_layerLegend:item._layerLegend,
				_loadedStatus:item._loadedStatus,
				_layerObject:item,
				_serviceObject:_serviceObject
			});
		});
	}
}

var wmts_layer_settings_window=new Ext.Window({ 
	width:420,
	height:300,
	modal:true,
	shim:true,
	title:_maptab_services_manager_layer_settings_window_title,
	resizable:true,
	closeAction:'hide',
	layout:'fit',
	items:[{
		xtype:'panel',
		layout:'form',
		items:[{
			xtype:'textfield'
		}]
	
	}]
});

init_onload_fn.push(init_wmts_OnChangeBaseLayer);

function init_wmts_OnChangeBaseLayer()
{
	mapOnChangeBaseLayer(wmts_OnChangeBaseLayer);
}

function wmts_OnChangeBaseLayer(_previousProjection,_currentProjection)
{
	var overlayers=mapGetlayersBy("isBaseLayer",false);

	for(var i=0;i<overlayers.length;i++)
	{
		var _serviceType=overlayers[i]._serviceObject._serviceType;
		
		if(_serviceType=="WMTS")
		{
			wmts_changeBasemap(overlayers[i]);
		}
	}
}

