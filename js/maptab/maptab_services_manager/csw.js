var csw_StoreColumnsService=new fn_storeColumnsService();
var csw_StoreColumnsServiceLayers=new fn_storeColumnsServiceLayers();

init_onload_fn.push(csw_init);

function csw_init()
{
	maptab_services_manager_gridpanel_store.add({servicetype: 'CSW',serviceform:csw_service_form});
	Ext.getCmp("maptab_services_manager_gridpanel_columns_service_type").add(csw_service_form);
}

var csw_service_form=new Ext.Panel({
	xtype:'panel',
	title:_maptab_services_manager_service_csw_title_form,
	id:'csw_service_form',
	layout:'border',
	border:false,
	hidden:true,
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
					id:'maptab_services_manager_csw_service_address',
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
						Ext.getCmp('csw_service_form_service_grid').setLoading(true);
						
						csw_register_service(Ext.getCmp('maptab_services_manager_csw_service_address').getValue());
						
						Ext.getCmp('csw_service_form_service_grid').setLoading(false);
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
			id:'csw_service_form_service_grid',
			store:csw_StoreColumnsService.store,
			columns:csw_StoreColumnsService.columns,
			selModel: Ext.create('Ext.selection.CheckboxModel'),
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpanderCSWService',
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
						var selected=Ext.getCmp('csw_service_form_service_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							var overlayers=mapGetlayersBy("isBaseLayer",false);

							for(var i=(overlayers.length-1);i>=0;i--)
							{
								if (overlayers[i]._serviceObject._serviceUrl==item.get("_serviceUrl"))
								{
									if(typeof overlayers[i]._layerObject!=="undefined")
									{
										maptab_west_layer_remove_node(overlayers[i]._layerObject._layerId);
									}
								}
							}
							
							Ext.getCmp('csw_service_form_service_grid').getStore().remove(item);
						});
					}
				}
			]
		}
	]
});


function csw_register_service(_serviceUrl,_username,_password)
{	
	var r=new fn_get();
	
	r._async=false;
	
	r._data.push({
		_serviceType:"CSW",
		_serviceUrl:_serviceUrl,
		_request:"registerService",
		_username:_username,
		_password:_password
	});
	
	var response=Ext.JSON.decode(r.get().responseText);
	
	switch(response[0]._responseCode)
	{
		case "401":
			
			var _w=csw_serviceCredentialsWindow(_serviceUrl);
			
			_w.show();
			
		break;
		
		case "200":
			var records=response[0]._response;
	
			csw_StoreColumnsService.store.add({
				_isSecure:records._isSecure,
				_serviceTitle:records._serviceTitle,
				_serviceUrl:records._serviceUrl,
				_serviceAbstract:records._serviceAbstract,
				_version:records._version,
				_serviceObject:records
			});
			
			metadata_settings_choose_service_checked_store.add({
				_serviceId:records._serviceId,
				_serviceTitle:records._serviceTitle,
				_serviceUrl:records._serviceUrl
			});
			
			return records;
		break;
	
	}	
}


function csw_serviceCredentialsWindow(_serviceUrl)
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
							csw_register_service(_serviceUrl,_username,_password);
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


