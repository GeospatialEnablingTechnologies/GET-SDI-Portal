var wfs_StoreColumnsService=new fn_storeColumnsService();
var wfs_StoreColumnsServiceLayers=new fn_storeColumnsServiceLayers();

init_onload_fn.push(wfs_init);

function wfs_init()
{
	maptab_services_manager_gridpanel_store.add({servicetype: 'WFS',serviceform:wfs_service_form});
	Ext.getCmp("maptab_services_manager_gridpanel_columns_service_type").add(wfs_service_form);
}

var wfs_service_form=new Ext.Panel({
	xtype:'panel',
	id:'wfs_service_form',
	title:_maptab_services_manager_service_wfs_title_form,
	layout:'border',
	border:false,
	hidden:true,
	listeners:{
		show:function()
		{
			Ext.getCmp('wfs_service_form_layers_grid').getView().refresh();
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
					id:'maptab_services_manager_wfs_service_address',
					width:300
				}
			],
			bbar:['->',
				{
					xtype:'checkbox',
					id:'maptab_services_manager_wfs_service_require_authentication',
					boxLabel:_maptab_services_manager_required_authentication
				},
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_service,
					handler:function()
					{
						Ext.getCmp('wfs_service_form_service_grid').setLoading(true);
						
						if (Ext.getCmp("maptab_services_manager_wfs_service_require_authentication").getValue())
						{
							var _w=wfs_serviceCredentialsWindow(Ext.getCmp('maptab_services_manager_wfs_service_address').getValue());
							
							_w.show();
						}
						else
						{
							wfs_register_service(Ext.getCmp('maptab_services_manager_wfs_service_address').getValue());
						}
						
						Ext.getCmp('wfs_service_form_service_grid').setLoading(false);
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
			id:'wfs_service_form_service_grid',
			store:wfs_StoreColumnsService.store,
			columns:wfs_StoreColumnsService.columns,
			selModel: Ext.create('Ext.selection.CheckboxModel'),
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpanderwfsService',
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
						var selected=Ext.getCmp('wfs_service_form_service_grid').getSelectionModel().getSelection();
						
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
							
							Ext.getCmp('wfs_service_form_service_grid').getStore().remove(item);
						});
						
						Ext.getCmp('wfs_service_form_layers_grid').getStore().removeAll();
					
					}
				},
				{
					xtype:'button',
					text:_maptab_services_manager_show_layers,
					handler:function(){
					
						var selected=Ext.getCmp('wfs_service_form_service_grid').getSelectionModel().getSelection();
						
						Ext.getCmp('wfs_service_form_layers_grid').setLoading(true);
						
						Ext.each(selected,function(item)
						{
							wfs_fetch_layers(item.get("_serviceObject"));
							
						});
					
						Ext.getCmp('wfs_service_form_layers_grid').setLoading(false);
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
			id:'wfs_service_form_layers_grid',
			store:wfs_StoreColumnsServiceLayers.store,
			columns:wfs_StoreColumnsServiceLayers.columns,
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpanderwfsLayer',
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
						var selected=Ext.getCmp('wfs_service_form_layers_grid').getSelectionModel().getSelection();
						
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
							
								Ext.getCmp('wfs_service_form_layers_grid').getView().refresh();
								
								mask.hide();
							}
						});
					
					}
				},
				{
					xtype:'button',
					iconCls:'map_general_setting_btn',
					text:_maptab_services_manager_settings_layer,
					hidden:true,
					handler:function()
					{
						wfs_layer_settings_window.show();
					}
				},
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_layer,
					handler:function()
					{
						var selected=Ext.getCmp('wfs_service_form_layers_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							var _message=_maptab_services_manager_loading_layer_message;
						
							_message=_message.replace("{_layerTitle}",item.get("_layerTitle"));
							
							_message=_message.replace("{_layerName}",item.get("_layerName"));
						
							var mask=fn_loadingMask(maptab_services_manager,_message);
							
							mask.show();
						
							wfs_register_layer(item.get("_serviceObject"),item.get("_layerObject"));
							
							Ext.getCmp('wfs_service_form_layers_grid').getView().refresh();
							
							mask.hide();
						});
					}
				}
			]
		}
	]
});

function wfs_map_layer(_serviceObject,_layerObject)
{

	var style=new OpenLayers.StyleMap({
			"default":new OpenLayers.Style({
				pointRadius: 5, 
				fillColor: "#"+_layerObject._color,
				fillOpacity: 0.6, 
				strokeColor: "#"+_layerObject._color,
				strokeWidth: 1,
				strokeOpacity:1
			}),
			"select":{
				fillColor: '#a9a8a7',
				strokeColor: '#5d7cc4',
				strokeWidth: 1,
				cursor: 'pointer',
				graphicZIndex: 100
			}
	});

	var _refreshStrategy = new OpenLayers.Strategy.Refresh({force: true, active: true});
	
	var _strategies=[];
	
	_strategies.push(new OpenLayers.Strategy.BBOX({resFactor:1,ratio:0.8}));
	
	_strategies.push(_refreshStrategy);
	
	var _saveStrategy;
	
	if(_layerObject._isEditable)
	{
		_saveStrategy=new OpenLayers.Strategy.Save();
		
		_strategies.push(_saveStrategy);
	}
	
	var layer=new OpenLayers.Layer.Vector(
		_layerObject._layerTitle,
		{
			strategies: _strategies,
			styleMap:style,
			projection:new OpenLayers.Projection(_layerObject._nativeSRS),
			rendererOptions: { zIndexing: true },
			protocol:new OpenLayers.Protocol.WFS({
				version: _serviceObject._version,
				url:fn_surl(_serviceObject._serviceUrl,_serviceObject._username,_serviceObject._password,'getfeatures'),
				srsName:mapGetProjectionCode(_layerObject._nativeSRS),
				srsInBBOX:true,
				featureType: _layerObject._featureType,
				featureNS:_layerObject._featureNS,
				geometryName: _layerObject._geometryField
			}),
			_layerObject:_layerObject,
			_serviceObject:_serviceObject,
			visibility:_layerObject._visibility
		
		},
		{
			rendererOptions: { zIndexing: true },
			opacity:_layerObject._opacity,
			visibility:_layerObject._visibility,
			projection:new OpenLayers.Projection(_layerObject._nativeSRS)
		}
	);
	
	layer.id=_layerObject._layerId;
	
	return layer;
}

function wfs_create_ogc_filter_request(_layerId, _filter)
{
	
	

}

function wfs_register_layer(_serviceObject,_layerObject)
{
	if (!mapFindLayerById(_layerObject._layerId))
	{
		var r=new fn_get();
		
		r._async=false;
		
		r._data.push({
			_serviceType:"WFS",
			_serviceUrl:_serviceObject._serviceUrl,
			_request:"registerLayer",
			_username:_serviceObject._username,
			_password:_serviceObject._password,
			_layerName:_layerObject._layerName
		});
		
		
		var record;
		
		record = config_findConfig(_layerObject,_serviceObject);
		
		if (!record)
		{		
			var response=Ext.JSON.decode(r.get().responseText);
			
			record = response[0]._response;
			
			_layerObject._attributesFields=record._attributes;
			
		}else{
		
			_layerObject._attributesFields=record._attributesFields;
			
			_layerObject._visibility = record._visibility;
			
			_layerObject._opacity = record._opacity;
			
			_layerObject._singleTile = record._singleTile;
		}
		
		if (typeof record._isEditable!=="undefined")
		{
			_layerObject._isEditable =  record._isEditable;
		}
		
		_layerObject._nativeSRS=record._nativeSRS;
		
		_layerObject._geometryIsMulti=record._geometryIsMulti;
		
		_layerObject._geometryField=record._geometryField;
		
		_layerObject._featureType=record._featureType;
		
		_layerObject._featureNS=record._featureNS;
		
		_layerObject._xy=fn_determineAxisOrder(record._featureNS);
		
		mapBeforeAddLayer(_serviceObject,_layerObject);
		
		if ((_layerObject._nativeSRS) && (_layerObject._geometryField))
		{
			_layerObject._isSearchable=true;
			
			_layerObject._loadedStatus=1;
			
		}else
		{
			_layerObject._loadedStatus=2;
		}
		
		_layerObject._layer=wfs_map_layer(_serviceObject,_layerObject);
		
		mapAddLayer(_serviceObject,_layerObject);
	
	}
	
}

function wfs_register_service(_serviceUrl,_username,_password)
{	
	var r=new fn_get();
	
	r._async=false;
	
	r._data.push({
		_serviceType:"WFS",
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
			
			var _w=wfs_serviceCredentialsWindow(_serviceUrl);
			
			_w.show();
			
		break;
		
		case "200":
		
			var records=response[0]._response;
	
			if ((records._version!="") || (records._version!=null))
			{
	
				wfs_StoreColumnsService.store.add({
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

function wfs_serviceCredentialsWindow(_serviceUrl)
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

function wfs_fetch_layers(_serviceObject)
{	
	wfs_StoreColumnsServiceLayers.store.removeAll();

	var r=new fn_get();
	
	r._async=false;
	
	r._data.push({
		_serviceType:"WFS",
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
	
		wfs_StoreColumnsServiceLayers.store.add({
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

var wfs_layer_settings_window=new Ext.Window({ 
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



