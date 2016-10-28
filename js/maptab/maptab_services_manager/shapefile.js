var shapefile_StoreColumnsService=new fn_storeColumnsService();
var shapefile_StoreColumnsServiceLayers=new fn_storeColumnsServiceLayers();

var shapefile_charsets = new _config_init_map();

shapefile_charsets = shapefile_charsets._charsets;

init_onload_fn.push(shapefile_init);

function shapefile_init()
{
	maptab_services_manager_gridpanel_store.add({servicetype: 'SHAPEFILE',serviceform:shapefile_service_form});
	Ext.getCmp("maptab_services_manager_gridpanel_columns_service_type").add(shapefile_service_form);
}

var shapefile_service_form=new Ext.Panel({
	xtype:'panel',
	title:_maptab_services_manager_service_shapefile_title_form,
	id:'shapefile_service_form',
	layout:'border',
	border:false,
	hidden:true,
	items:[
		{
			xtype:'form',
			region:'north',
			anchor:'100%',
			fileUpload: true,
			isUpload: true,
			id:'maptab_services_manager_shapefile_form',
			method:'POST',
			enctype:'multipart/form-data',
			border:true,
			height:180,
			items:[
				{
					xtype: 'textfield',
					fieldLabel:_maptab_services_manager_service_name,
					id:'maptab_services_manager_shapefile_name',
					anchor:'100%'
				},
				{
					xtype: 'filefield',
					fieldLabel:_maptab_services_manager_shapefile_shp,
					name:'shapefile',
					id:'maptab_services_manager_shapefile_shp',
					anchor:'100%'
				},
				{
					xtype: 'filefield',
					fieldLabel:_maptab_services_manager_shapefile_dbf,
					name:'dbf',
					id:'maptab_services_manager_shapefile_dbf',
					anchor:'100%'
				},
				{
					xtype:'combo',
					loadMask:true,
					autoScroll:true,
					autoShow: true,
					anchor:'100%',
					id:'maptab_services_manager_shapefile_projection',
					fieldLabel:_maptab_services_manager_shapefile_projection,
					store: new Ext.data.SimpleStore({
						fields: ['value','name'],
						data:[
							["EPSG:2100","EPSG:2100"],
							["EPSG:4326","EPSG:4326"],
							["EPSG:3785","EPSG:3785"],
							["EPSG:3857","EPSG:3857"],
							["EPSG:32717","EPSG:32717"]
						]
					}), 
					displayField: 'name',
					valueField: 'value',
					emptyText:"",
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: false,
					mode: 'local',
					editable: false
				},
				{
					xtype:'combo',
					anchor:'100%',
					loadMask:true,
					autoScroll:true,
					autoShow: true,
					id:'maptab_services_manager_shapefile_charset',
					fieldLabel:_maptab_services_manager_shapefile_charset,
					store: new Ext.data.SimpleStore({
						fields: ['name','value'],
						data:shapefile_charsets
					}), 
					displayField: 'name',
					valueField: 'value',
					emptyText:"",
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: false,
					mode: 'local',
					editable: false
				}
			],
			bbar:['->',
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_service,
					handler:function()
					{
						
						Ext.getCmp('shapefile_service_form_service_grid').setLoading(true);
						
						var _params = [{
							_serviceType:"SHAPEFILE",
							_serviceUrl:'',
							_serviceTitle:Ext.getCmp('maptab_services_manager_shapefile_name').getValue(),
							_request:"registerService",
							_nativeSRS:Ext.getCmp('maptab_services_manager_shapefile_projection').getValue(),
							_charset:Ext.getCmp('maptab_services_manager_shapefile_charset').getValue(),
							_username:'',
							_password:''
						}]
					
						Ext.getCmp('maptab_services_manager_shapefile_form').submit({
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
								
									shapefile_register_service(_response);
									
									Ext.getCmp('shapefile_service_form_service_grid').setLoading(false);
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
			id:'shapefile_service_form_service_grid',
			store:shapefile_StoreColumnsService.store,
			columns:shapefile_StoreColumnsService.columns,
			selModel: Ext.create('Ext.selection.CheckboxModel'),
			plugins: [{
				ptype: 'rowexpander',
				pluginId: 'rowexpandershapefileService',
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
						var selected=Ext.getCmp('shapefile_service_form_service_grid').getSelectionModel().getSelection();
						
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
							
							Ext.getCmp('shapefile_service_form_service_grid').getStore().remove(item);
						});
					}
				},
				{
					xtype:'button',
					iconCls:'maptab_services_manager_register',
					text:_maptab_services_manager_register_layer,
					handler:function()
					{
						var selected=Ext.getCmp('shapefile_service_form_service_grid').getSelectionModel().getSelection();
						
						Ext.each(selected,function(item)
						{
							var _message=_maptab_services_manager_loading_layer_message;
						
							_message=_message.replace("{_layerTitle}",item.get("_layerTitle"));
							
							var mask=fn_loadingMask(maptab_services_manager,_message);
							
							mask.show();
						
							shapefile_register_layer(item.get("_serviceObject"),item.get("_serviceObject")._layers);
							
							Ext.getCmp('shapefile_service_form_service_grid').getView().refresh();
							
							mask.hide();
						});
					}
				}
			]
		}
	]
});


function shapefile_register_service(record)
{	
	shapefile_StoreColumnsService.store.add({
		_isSecure:record._isSecure,
		_serviceTitle:record._serviceTitle,
		_serviceUrl:record._serviceUrl,
		_serviceAbstract:record._serviceAbstract,
		_version:record._version,
		_serviceObject:record,
		_nativeSRS:record._nativeSRS
	});
}

function shapefile_register_layer(_serviceObject,_layerObject)
{

	if (!mapFindLayerById(_layerObject._layerId))
	{
		mapBeforeAddLayer(_serviceObject,_layerObject);
		
		_layerObject._loadedStatus=1;
		
		_layerObject._layer=shapefile_map_layer(_serviceObject,_layerObject);
		
		mapAddLayer(_serviceObject,_layerObject);
		
	}	
}


function shapefile_map_layer(_serviceObject, _layerObject)
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
			projection:new OpenLayers.Projection(_layerObject._nativeSRS),
			styleMap:style,
			rendererOptions: { zIndexing: true },
			_layerObject:_layerObject,
			_serviceObject:_serviceObject,
			_currentProjection:mapGetCurrentProjection(),
			visibility:_layerObject._visibility,
			eventListeners: {
				"featuresadded": function(evt)
				{
					var features=evt.features;
					
					for(var i=0;i<features.length;i++)
					{
						features[i].fid="shapefile."+i;
						
						features[i].attributes = _serviceObject._serviceDbf[i];
					}
				}
			}
		},
		{
			rendererOptions: { zIndexing: true },
			opacity:_layerObject._opacity,
			visibility:_layerObject._visibility,
			projection:new OpenLayers.Projection(_layerObject._nativeSRS)
		}
	);
	
	var parser = new OpenLayers.Format.GeoJSON({
		'internalProjection': new OpenLayers.Projection(mapGetCurrentProjection()),
		'externalProjection': new OpenLayers.Projection(_layerObject._nativeSRS)
	}), shpFeatures;

	var shapefile = new Shapefile({
		shp: host+"uploads/"+_serviceObject._serviceShp,
	}, function (data) {
		shpFeatures = parser.read(data.geojson);
		layer.addFeatures(shpFeatures);
	});
	
	layer.id=_layerObject._layerId;
	
	return layer;

}

function shapefile_changeBasemap(_layer)
{	
	if (_layer._currentProjection.toString()!=mapGetCurrentProjection())
	{
		for(var i=0;i<_layer.features.length;i++)
		{
			_layer.features[i].geometry.transform(new OpenLayers.Projection(_layer._currentProjection.toString()),new OpenLayers.Projection(mapGetCurrentProjection()));
		}
		
		_layer._currentProjection=mapGetCurrentProjection()
	}
}

init_onload_fn.push(init_shapefile_OnChangeBaseLayer);

function init_shapefile_OnChangeBaseLayer()
{
	mapOnChangeBaseLayer(shapefile_OnChangeBaseLayer);
}

function shapefile_OnChangeBaseLayer(_previousProjection,_currentProjection)
{
	var overlayers=mapGetlayersBy("isBaseLayer",false);
	
	for(var i=0;i<overlayers.length;i++)
	{
		var _serviceType=overlayers[i]._serviceObject._serviceType;
		
		if(_serviceType=="SHAPEFILE")
		{
			shapefile_changeBasemap(overlayers[i]);
		}
	}
}

function shapefile_serviceCredentialsWindow(_serviceUrl)
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
							shapefile_register_service(_serviceUrl,_username,_password);
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