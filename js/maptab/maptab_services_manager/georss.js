var georss_StoreColumnsService=new fn_storeColumnsService();
var georss_StoreColumnsServiceLayers=new fn_storeColumnsServiceLayers();

init_onload_fn.push(georss_init);

function georss_init()
{
	maptab_services_manager_gridpanel_store.add({servicetype: 'GEORSS',serviceform:georss_service_form});
	Ext.getCmp("maptab_services_manager_gridpanel_columns_service_type").add(georss_service_form);
}

var georss_service_form=new Ext.Panel({
	xtype:'panel',
	title:_maptab_services_manager_service_georss_title_form,
	id:'georss_service_form',
	layout:'border',
	border:false,
	hidden:true,
	items:[
		{
			xtype:'panel',
			region:'north',
			layout:'form',
			border:true,
			height:100,
			items:[
				{
					xtype: 'textfield',
					fieldLabel:_maptab_services_manager_service_title,
					id:'maptab_services_manager_georss_service_title',
					width:300
				},
				{
					xtype: 'textfield',
					fieldLabel:_maptab_services_manager_service_address,
					id:'maptab_services_manager_georss_service_address',
					width:300
				}
			],
			bbar:['->',
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_service,
					handler:function()
					{
						Ext.getCmp('georss_service_form_service_grid').setLoading(true);
						
						georss_register_service(Ext.getCmp('maptab_services_manager_georss_service_address').getValue(),Ext.getCmp('maptab_services_manager_georss_service_title').getValue());
						
						Ext.getCmp('georss_service_form_service_grid').setLoading(false);
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
			id:'georss_service_form_service_grid',
			store:georss_StoreColumnsService.store,
			columns:georss_StoreColumnsService.columns,
			selModel: Ext.create('Ext.selection.CheckboxModel'),
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpanderGEORSSService',
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
						var selected=Ext.getCmp('georss_service_form_service_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							var overlayers=mapGetlayersBy("isBaseLayer",false);

							for(var i=(overlayers.length-1);i>=0;i--)
							{
								if (overlayers[i]._serviceObject._serviceUrl==item.get("_serviceUrl"))
								{
									if(typeof overlayers[i]._layerObject!=="undefined")
									{
											alert(overlayers[i]._layerObject._layerId);
										maptab_west_layer_remove_node(maptab_west_layer_get_node_from_id(overlayers[i]._layerObject._layerId));
									}
								}
							}
							
							Ext.getCmp('georss_service_form_service_grid').getStore().remove(item);
						});
					}
				},
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_layer,
					handler:function()
					{
						var selected=Ext.getCmp('georss_service_form_service_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							var _message=_maptab_services_manager_loading_layer_message;
						
							_message=_message.replace("{_layerTitle}",item.get("_layerTitle"));
							
							var mask=fn_loadingMask(maptab_services_manager,_message);
							
							mask.show();
						
							georss_register_layer(item.get("_serviceObject"),item.get("_serviceObject")._layers);
							
							Ext.getCmp('georss_service_form_service_grid').getView().refresh();
							
							mask.hide();
						});
					}
				}
			]
		}
	]
});


function georss_register_service(_serviceUrl,_serviceTitle,_username,_password)
{	
	var r=new fn_get();
	
	r._async=false;
	
	r._data.push({
		_serviceType:"GEORSS",
		_serviceUrl:_serviceUrl,
		_serviceTitle:_serviceTitle,
		_request:"registerService",
		_username:_username,
		_password:_password
	});
	
	var response=Ext.JSON.decode(r.get().responseText);
	
	switch(response[0]._responseCode)
	{
		case "401":
			
			var _w=georss_serviceCredentialsWindow(_serviceUrl);
			
			_w.show();
			
		break;
		
		case "200":
			var records=response[0]._response;
	
			georss_StoreColumnsService.store.add({
				_isSecure:records._isSecure,
				_serviceTitle:records._serviceTitle,
				_serviceUrl:records._serviceUrl,
				_serviceAbstract:records._serviceAbstract,
				_version:records._version,
				_serviceObject:records
			});
			
			return records;
		break;
	
	}	
}

function georss_register_layer(_serviceObject,_layerObject)
{

	if (!mapFindLayerById(_layerObject._layerId))
	{
		mapBeforeAddLayer(_serviceObject,_layerObject);
		
		_layerObject._loadedStatus=1;
		
		_layerObject._layer=georss_map_layer(_serviceObject,_layerObject);
		
		mapAddLayer(_serviceObject,_layerObject);
		
	}	
}


function georss_map_layer(_serviceObject, _layerObject)
{
	var _refreshStrategy = new OpenLayers.Strategy.Refresh({force: true, active: true});
	
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
	
	var _strategies=[];
	_strategies.push(new OpenLayers.Strategy.Fixed());
	_strategies.push(_refreshStrategy);
	
	var service_url=fn_surl(_serviceObject._serviceUrl,_serviceObject._username,_serviceObject._password,'proxy');
	
	var layer=new OpenLayers.Layer.Vector(
		_layerObject._layerTitle,
		{
			strategies: _strategies,
			styleMap:style,
			projection:new OpenLayers.Projection("EPSG:4326"),
			rendererOptions: { zIndexing: true },
			protocol: new OpenLayers.Protocol.HTTP({
				url: service_url,
				format: new OpenLayers.Format.GeoRSS()
			}),
			_layerObject:_layerObject,
			_serviceObject:_serviceObject,
			visibility:_layerObject._visibility,
			eventListeners: {
				"featuresadded": function(evt){
					var features=evt.features;
			
					for(var i=0;i<features.length;i++)
					{
						features[i].fid="georss."+i;
						
					}
			
				}
			}
		
		},
		{
			rendererOptions: { zIndexing: true },
			opacity:_layerObject._opacity,
			visibility:_layerObject._visibility,
			projection:new OpenLayers.Projection("EPSG:4326")
		}
	);
	
	layer.id=_layerObject._layerId;
	
	return layer;

}

function georss_serviceCredentialsWindow(_serviceUrl)
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
					handler:function(btn,e)
					{
						btn.findParentByType("window").hide();
					}
				},
				{
					xtype:'button',
					text:_maptab_services_manager_register_service,
					iconCls:'maptab_services_issecure',
					handler:function(btn,e)
					{
						var _panel=btn.findParentByType("panel").items.items;
						
						var _username=fn_encrypt(_panel[0].getValue());
						
						var _password=fn_encrypt(_panel[1].getValue());
						
						if ((_username!="") && (_password!=""))
						{
							georss_register_service(_serviceUrl,_username,_password);
						}
						
						btn.findParentByType("window").hide();
					}
				}
			],
			items:[
				{
					xtype:'textfield',
					fieldLabel:_maptab_services_manager_service_username
				},
				{
					xtype:'textfield',
					fieldLabel:_maptab_services_manager_service_password
				}
			]
		}]
	});

	return _w;
}


