
/*version message*/


var pending_name_wms='Pending...';

var get_selected_wms_service;
var get_selected_wms_service_output;
var get_selected_wms_service_name;
var get_selected_wms_service_version;
var get_selected_wms_service_epsg;
var set_selected_wms_authentication="";
var get_selected_wms_service_isSecured="false";
var get_selected_wms_service_saved_username="";
var get_selected_wms_service_saved_password="";

var ext_ajax_wms;

var wms_dataStore=[];

var wms_store= new Ext.data.ArrayStore({
	fields: [
	{name: 'service_isSecured'},
	{name: 'service_isSecuredIcon'},
    {name: 'service_Title'},
	{name: 'service_Abstract'},
    {name: 'service_URI'},
	{name: 'service_SupportedEPSGS'},
	{name: 'service_Version'},
	{name: 'service_SecureUsername'},
	{name: 'service_SecurePassword'}
  ]
});

var sm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});

var wms_store_columns=new Ext.grid.ColumnModel([
	sm,
	{header:'',dataIndex: "service_isSecured",hidden:true,hideable: false},
	{header:'',dataIndex: "service_isSecuredIcon",sortable: true,width:24,renderer:WMS_isSecured,hideable: false},
	{header:wms_service_columns_name, dataIndex: "service_Title", sortable: true,width:140},
	{header:'',dataIndex: "service_Abstract", hidden: true},
	{header:wms_service_columns_url, dataIndex: "service_URI", sortable: true,width:210},
	{header:wms_service_version,dataIndex: "service_Version", sortable: true,width:60},
	{header:wms_service_outputFormat,dataIndex: "service_OutputFormat",sortable: true,width:60},
	{header:wms_service_supportedProjections,dataIndex: "service_SupportedEPSGS",sortable: true,width:75},
	{header:'',dataIndex: "service_SecureUsername",hidden:true,hideable: false},
	{header:'',dataIndex: "service_SecurePassword",hidden:true,hideable: false}
]);

var wms_store_layers_expander = new Ext.grid.RowExpander({
id: 'expander',
tpl : new Ext.Template(
'<p><b>'+wms_store_columns_abstract+':</b><br/><div style="width:500px">{Abstract}</div></p>'
)
});

var wms_store_layers=new Ext.data.SimpleStore({
    fields: ['name','title','abstract','queryable','llbbox'],
    data :[]
	
});

var wms_empty_store_layers=new Ext.data.SimpleStore({
    fields: ['name','title','abstract','queryable','llbbox'],
    data :[]
});

var wms_store_layers_columns=new Ext.grid.ColumnModel([
		wms_store_layers_expander,
		{header: '',dataIndex:"URL",renderer:WMS_BaseName_LayerId,sortable: true,width:24,hidden:false,hideable: false},
        {header: wms_store_columns_name, dataIndex: "Name", sortable: true,width:252},
        {header: wms_store_columns_title, dataIndex: "Title", sortable: true,width:280},
        {header: wms_store_columns_abstract, dataIndex: "Abstract",width:200,hidden:true},
		{header: '', dataIndex: "URL_Title",hidden:true,hideable: false},
		{header: '', dataIndex: "crs",hidden:true,hideable: false},
		{header: '', dataIndex: "Minx",hidden:true,hideable: false},
		{header: '', dataIndex: "Miny",hidden:true,hideable: false},
		{header: '', dataIndex: "Maxx",hidden:true,hideable: false},
		{header: '', dataIndex: "Maxy",hidden:true,hideable: false},
		{header: '', dataIndex: "outputFormat",hidden:true,hideable: false},
		{header: '', dataIndex: "version",hidden:true,hideable: false},
		{header: '', dataIndex: "queryable",hidden:true,hideable: false},
		{header: '', dataIndex: "authentication",hidden:true,hideable: false}
		
]);

function WMS_BaseName_LayerId(val,a,b,ss)
{
	var cellValue=Ext.getCmp('wms_grid_layers').getStore().getAt(ss);
	
	var layer_baseName= cellValue.get('Name');
	
	var layer_url= cellValue.get('URL');
	
	var layer_id=layer_url+"_"+layer_baseName;
	
	var img="";
	
	if (findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		img="<img src='images/check_16.png' width='14' height='14'\">";
	}
	
	return img;

}

function  WMS_isSecured(val,a,b,ss)
{
	var cellValue=Ext.getCmp('wms_grid_services').getStore().getAt(ss);
	
	var isSecured=cellValue.get('service_isSecured');
	
	var img="";
	
	if (isSecured=="true")
	{
		img="<img src='images/gis_icons/authenticate.png' width='14' height='14'\">";
	}
	return img;
}

function addWMSServer(wms_url,wms_result)
{
	var service_isValid=wms_result.isValid;
			
	var service_isSecured=wms_result.isSecured;
	
	if (service_isValid=="true")
	{
		var isonmap=false;

		wms_store.each(function(item){

			if (item.get('service_URI')==wms_result.serviceUrl)
			{
				isonmap=true;
			}
		});
						
		if (!isonmap)
		{
			TaskLocation = Ext.data.Record.create([
				{name: "service_isSecured", type:"string"},
				{name: "service_Title", type:"string"},
				{name: "service_Abstract", type:"string"},
				{name: "service_URI", type:"string"},
				{name: "service_SupportedEPSGS", type:"string"},
				{name: "service_Version", type:"string"},
				{name: "service_OutputFormat", type:"string"},
				{name: "service_SecureUsername",type:"string"},
				{name: "service_SecurePassword",type:"string"}
			]);
						
						
			var output=Ext.getCmp('wms_output').getValue();
						
			if (output=="")
			{
				output="image/png";
			}
						
			var service_Title=wms_result.serviceTitle;
			var service_Abstract=wms_result.serviceAbstract;
			var service_URI=wms_result.serviceUrl;
			var service_SupportedEPSGS=wms_result.supportedEPSGS;
			var service_Version=wms_result.version;
			var service_OutputFormat=output;
			var service_SecureUsername=wms_result.serviceUsername;
			var service_SecurePassword=wms_result.servicePassword;
				
			var record = new TaskLocation({
				service_isSecured:service_isSecured,
				service_Title:service_Title,
				service_Abstract:service_Abstract,
				service_URI:service_URI,
				service_SupportedEPSGS:service_SupportedEPSGS.toString(),
				service_Version:service_Version,
				service_OutputFormat:service_OutputFormat,
				service_SecureUsername:service_SecureUsername,
				service_SecurePassword:service_SecurePassword
			});
						
			wms_store.add(record);
						
			wms_store.commitChanges();
						
			Ext.getCmp('wms_grid_services').reconfigure(wms_store,wms_store_columns);
						
			Ext.getCmp('url_wms').setValue("");
		}
		else
		{
			Ext.Msg.alert(wms_service_title_error, wms_service_message_error_service_already_exists);	
		}

	}
	else
	{
		Ext.Msg.alert(wms_service_title_error, wms_service_message_error);
	}
}


function setWMSAuthentication()
{
	var username=Ext.getCmp('wms_secureUsername').getValue();
	
	var password=Ext.getCmp('wms_securePassword').getValue();
	
	if ((username!="") && (password!=""))
	{
		set_selected_wms_authentication="initUsername="+Ext.util.base64.encode(username)+"&initPassword="+Ext.util.base64.encode(password);
		
		return true;
	}
	else
	{
		Ext.Msg.alert(authentication_NullCredentials_Error_Title, authentication_NullCredentials);
		
		return false;
	}
}

var req_WMSServerAJAX;

function addWMSServerAJAX(wms_url,predifined_wms_authentication)
{

	Ext.getCmp('wms_grid_services').loadMask.show();
	
	if(typeof req_WMSServerAJAX!=="undefined")
	{
		Ext.Ajax.abort(req_WMSServerAJAX);
	}
	
	
	var seperator="";
	
	if ((predifined_wms_authentication!==false)  && (typeof predifined_wms_authentication!=="undefined"))
	{
		set_selected_wms_authentication=predifined_wms_authentication;
	}
	
	if (set_selected_wms_authentication!="")
	{
		seperator="&";
	}
	
	req_WMSServerAJAX=Ext.Ajax.request({
		url:"php_source/proxies/wms_isvalid_url.php?"+set_selected_wms_authentication+seperator+"url="+wms_url,
		timeout:5000,
		success:function(result,response)
		{
			var wms_result=Ext.decode(result.responseText);
			
			var service_isValid=wms_result.isValid;
			
			var service_isSecured=wms_result.isSecured;
			
			var service_isLogged=wms_result.serviceIsSecureLogged;
			
			var service_require_authentication=Ext.getCmp("wms_authentication").getValue();
			
			if (((service_isSecured=="true") && (service_isLogged=="false")) || ((service_isSecured=="false") && (service_require_authentication==true)))
			{
				var authenticationWindow=new Ext.Window({
					width:300,
					height:110,
					shim:true,
					modal:true,
					resizable:false,
					title:authentication_Service_isSecure,
					items:[{
						xtype:'panel',
						layout:'form',
						items:[{
							xtype:'textfield',
							id:'wms_secureUsername',
							fieldLabel:authentication_Username
						},
						{
							xtype:'textfield',
							id:'wms_securePassword',
							inputType: 'password',
							fieldLabel:authentication_Password
						}]
					}],
					bbar:['->',
						{
							xtype:'button',
							iconCls:'authenicate_Lock',
							text:authentication_LoginBtn,
							handler:function()
							{
								if (setWMSAuthentication())
								{
									addWMSServerAJAX(wms_url,false);
		
									authenticationWindow.close();
								}	
							}
						},
						{	
							xtype:'button',
							iconCls:'authenticate_Cancel',
							text:authentication_CancelBtn,
							handler:function()
							{
								authenticationWindow.close();
							}
						}
					]
				});	

				authenticationWindow.show();

			}
			else
			{
				addWMSServer(wms_url,wms_result);
				
				set_selected_wms_authentication="";
				
			}
			
			Ext.getCmp('wms_grid_services').loadMask.hide();
		},
		failure:function()
		{
			Ext.Msg.alert(wms_service_title_error, wms_service_message_error_service_not_response);
			
			Ext.getCmp('wms_grid_services').loadMask.hide();

		}
	});

}

var wms_form=new Ext.FormPanel({
            title:wms_form_title,
			region:'center',
			hidden:true,
			autoHeight:true,
			border:false,
			items:  [{ 
					xtype:'panel',
					layout:'form',
					height:100,
					items:[
						{
							xtype: 'textfield',
							id:'url_wms',
							anchor:'100%',
							fieldLabel:wms_url_wms_label,
							width:300
						},
						{
							xtype: 'combo',
							fieldLabel: wms_output,
							width: 180,
							id:'wms_output',
							store: new Ext.data.SimpleStore({
									id:'wms_output_store',
									fields:['id','value'],
									data:[
									["image/png","image/png"],
									["image/png8","image/png8"],
									["image/jpeg","image/jpeg"],
									["image/gif","image/gif"],
									["image/svg","image/svg"]]
								}),
							valueField:'id',
							displayField:'value',
							mode:'local',
							emptyText:'image/png',
							editable: false,
							forceSelection: true,
							triggerAction: 'all',
							selectOnFocus: false
						
						},
						{
							xtype: 'checkbox',
							id:'wms_authentication',
							anchor:'100%',
							fieldLabel:wms_require_authentication,
							width:300,
							listeners:
							{
								change:function(check)
								{
									if(check.checked==false)
									{
										set_selected_wms_authentication="";
									}
									
									return;
								}
							
							}
						}]

            },{
			xtype:'toolbar',
			anchor:'100%',
			items:['->',
				{xtype:'tbbutton',
				text:wms_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
					
					addWMSServerAJAX(Ext.getCmp('url_wms').getValue());
				}
			}
			]},{
			xtype:'grid',
			id:'wms_grid_services',
			title:wms_list_name,
			loadMask:true,
			autoScroll:true,
			sm: sm,
			height:110,
			columnLines: true,
			ds:wms_store,
			cm:wms_store_columns,
			bbar:['->',
				{
					xtype:'button',
					text:wms_service_remove,
					iconCls:'mapTree_remove16',
					handler:function(){
					
						Ext.getCmp('wms_grid_services').loadMask.show();
						
						Ext.MessageBox.confirm(title_SW_Confirm_Removal,question_SW_Confirm_Removal_Services,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('wms_grid_services').getSelectionModel().each(function(record) {
								
									removeServiceLayersViaServiceWindow(record.get('service_URI'));
									
									Ext.each(wms_store.data.items,function(item,index){
										
										if (item)
										{
											if (item.get('service_URI')==record.get('service_URI'))
											{
												var  toBeDeleted=wms_store.getAt(index);
												
												wms_store.remove(toBeDeleted);
												
												wms_store.commitChanges();
											}
										}
									});
									
									Ext.getCmp('wms_grid_services').reconfigure(wms_store,wms_store_columns);
									
									Ext.getCmp('wms_grid_layers').reconfigure(wms_empty_store_layers,wms_store_layers_columns);
									
									
									
								});
							}
							
						});	
						
						Ext.getCmp('wms_grid_services').loadMask.hide();
					}
				}
			]},
			{
				xtype:'panel',
				autoScroll: true,
				height:182,
				items:[
				{
				xtype:'grid',
				anchor:'100%',
				id:'wms_grid_layers',
				title:wms_list_data,
				height:154,
				loadMask:true,
				expander:wms_store_layers_expander,
				plugins:[wms_store_layers_expander],
				ds:wms_store_layers,
				cm:wms_store_layers_columns
				}],
				bbar: ['->',
				{
				xtype:'button',
				text: wms_layer_remove,
				id:'wms_remove_layer_btn_id',
				disabled: true,
				iconCls:'mapTree_remove16',
				handler: function() {
				
						Ext.MessageBox.confirm(title_SW_Confirm_Removal,question_SW_Confirm_Removal_Layers,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('wms_grid_layers').getSelectionModel().each(function(record) {
								
								var layer_id=record.get("URL")+"_"+record.get("Name");
									
									removeOnlyLayersViaServiceWindow(layer_id);
									
								});
								
								Ext.getCmp('wms_grid_layers').reconfigure(wms_store_layers,wms_store_layers_columns);
										
								Ext.getCmp('wms_add_layer_btn_id').disable();
				
								Ext.getCmp('wms_remove_layer_btn_id').disable();
								
								Ext.getCmp('wms_grid_layers').getSelectionModel().clearSelections();
							}
						});
					}
				},{
				xtype:'button',
				text: wms_form_save_to_list,
				id:'wms_add_layer_btn_id',
				disabled: true,
				iconCls:'mapTree_add16',
				handler: function() {
					
					Ext.getCmp('wms_grid_layers').getSelectionModel().each(function(record) {
					
						wms_registerLayer(record);

					});
				
				}}]
		}]
		
});


function wms_registerLayer(record)
{
	
	var rec_sld_body;
	var rec_sld_id="";
	var rec_sld_full_id="";
	var rec_graphic="";
	
	var visibility=true;
	
	if (typeof record.visibility!=="undefined")
	{
		visibility=record.visibility;
	}
	
	var order=0;
	
	if (typeof record.order!=="undefined")
	{
		order=record.order;
	}
	
	if (typeof record.get("sld_body")!=='undefined')
	{
		if (thematicLayers_fileBased==false)
		{
			rec_sld_body=record.get("sld_body").replace(/(\r\n|\n|\r|\t)/gm,"");
			
			rec_graphic="&SLD_BODY="+record.get("sld_legent_graphic").replace(/(\r\n|\n|\r|\t)/gm,"");
		}
		if (thematicLayers_fileBased==true)
		{
			rec_sld_body=record.get("sld_body");
			
			rec_graphic="&SLD="+record.get("sld_legent_graphic");
		}
		
		rec_sld_id="_"+record.get("sld_id");
		
		rec_sld_full_id=record.get("sld_id");
		
	}

	var wms_layers = new OpenLayers.Layer.WMS(record.get("Title"),
	record.get("URL"),
	{
		layers: record.get("Name"), 
		format: record.get("outputFormat"), 
		tiled:false,
		transparent: true,
		sld_body:rec_sld_body,
		version: record.get("version"),
		transitionEffect:null,
		visibility:visibility
	},
	{
		layers: record.get("Name"),
		format:record.get("outputFormat"),
		projSrs:record.get("crs"),
		version: record.get("version"),
		tiled:false,
		isBaseLayer: false, 
		sld_body:rec_sld_body,
		authentication:record.get("authentication"),
		getURL:wms_generate_url,
		transitionEffect:null,
		visibility:visibility,
		order:order
	});

	
	var recordType = GeoExt.data.LayerRecord.create();

	var recordh = new recordType({layer: wms_layers, title: record.get("Name")});

	var copy = recordh.clone();

	recordh=null;
	
	copy.set("sld_body",rec_sld_body);
	
	copy.set("source_id",record.get("URL"));

	copy.set("layer_title", record.get("Title"));

	copy.set("service_id",title_Tree_WMS);

	copy.set("service_type","WMS");

	copy.set("service_authentication",record.get("authentication"));

	copy.set("queryable",record.get("queryable"));

	var bbox_record=record.get("Minx")+","+record.get("Miny")+","+record.get("Maxx")+","+record.get("Maxy");

	copy.set("abstract",record.get("Abstract"));

	copy.set("bbox",bbox_record);

	var authentication=record.get("authentication");

	if (authentication!="")
	{
		authentication+="&";
	}

	copy.set("outputFormat",record.get("outputFormat"));
	
	copy.set("layers_crs",record.get("crs"));

	copy.set("layers_basename",record.get("Name"));

	copy.set("layers_basename_id",record.get("URL")+"_"+record.get("Name")+rec_sld_id);

	copy.set("service_version",record.get("version"));
	
	copy.set("layers_sld",rec_sld_full_id);

	var layer_id=record.get("URL")+"_"+record.get("Name")+rec_sld_id;

	if (record.get("URL_Title")!="")
	{
		copy.set("service_name",record.get("URL_Title"));
	}
	else
	{
		copy.set("service_name",record.get("URL"));
	}
	
	fc_createLoadLayerIcon(copy,"php_source/proxies/legend_graphic.php?"+authentication+"urlGraphic="+Ext.urlAppend(record.get("URL"),"REQUEST=GetLegendGraphic&VERSION=1.1.1&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER="+record.get("Name")+rec_graphic));
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{

		var native_srs="";

		var geom_name="";
		
		var geom_type="";
		
		Ext.Ajax.request({
			url:"php_source/proxies/wms_getNativeGeom.php?"+authentication+"layerName="+record.get("Name")+"&url="+record.get("URL"),
			timeout:8000,
			success:function(result,response)
			{
				var json=Ext.util.JSON.decode(result.responseText);
			
				var nativeSRS=json.NATIVE_SRS;
			
				native_srs=nativeSRS;
				
				try
				{
					geom_name=json.GEOMETRY_FIELD.GEOM_NAME.toString();
				
					geom_type=json.GEOMETRY_FIELD.GEOM_TYPE.toString();
				}
				catch(err){}
				
				copy.set("native_srs",native_srs);

				copy.set("geom_name",geom_name);
				
				copy.set("geom_type",geom_type);
				
				mapPanel.layers.add(copy);
		
				Ext.getCmp('wms_grid_layers').reconfigure(wms_store_layers,wms_store_layers_columns);
				
				Ext.getCmp('wms_add_layer_btn_id').disable();
				
				Ext.getCmp('wms_remove_layer_btn_id').disable();
				
				Ext.getCmp('wms_grid_layers').getSelectionModel().clearSelections();

				createLayerTree();	
				
			},
			failure:function()
			{
				nativeSRS="EPSG:4326";
				
				copy.set("native_srs",native_srs);

				copy.set("geom_name",geom_name);
				
				copy.set("geom_type",geom_type);
				
				mapPanel.layers.add(copy);
		
				Ext.getCmp('wms_grid_layers').reconfigure(wms_store_layers,wms_store_layers_columns);
				
				Ext.getCmp('wms_add_layer_btn_id').disable();
				
				Ext.getCmp('wms_remove_layer_btn_id').disable();
				
				Ext.getCmp('wms_grid_layers').getSelectionModel().clearSelections();

				createLayerTree();	
			}
		});
		
		
	}

}


function wms_generate_url(bounds) 
{
	var projection=this.projSrs;
	
	var supportedProjections=projection.split(',');
	
	var bbox;
	
	bbox=bounds;
	
	var isSupported=false;
	
	for(var i=0; i<supportedProjections.length; i++)
	{
		var epsg=supportedProjections[i];
		
		if (epsg.toString()==map_currentMapProjection.toString()) 
		{
			isSupported=true;
		}
	}
	
	
	if (isSupported==true)
	{
		var format="image/png";
		
		if (this.format!="")
		{
			format=this.format;
		}

		var sld_url="";
		
		if (typeof this.sld_body!=='undefined')
		{
			if (thematicLayers_fileBased==false)
			{
				sld_url="&SLD_BODY="+ this.sld_body;
			}
			
			if (thematicLayers_fileBased==true)
			{
				sld_url="&SLD="+ this.sld_body;
			}
		}
		
		var bboxstr=bbox.toBBOX();
		
		var srs_crs="SRS";
		
		if ((this.version=="1.3.0") && (map_currentMapProjection=="EPSG:4326"))
		{
			var bboxArr=bbox.toArray();
			
			bboxstr=bboxArr[1]+","+bboxArr[0]+","+bboxArr[3]+","+bboxArr[2];
			
			srs_crs="CRS";
		}
		
		var url = "REQUEST=GetMap";
		url += "&STYLES=";
		url += "&TILED="+this.tiled;
		//url += "&RANDOM="+Math.random();
		url += "&EXCEPTIONS=INIMAGE";
		url += "&VERSION="+this.version;
		url += "&LAYERS=" + this.layers;
		url += "&FORMAT=" + format;
		url += "&TRANSPARENT=TRUE";
		url += "&"+srs_crs+"="+map_currentMapProjection;
		url += "&BBOX=" + bboxstr;
		url += "&WIDTH=" + this.tileSize.w;
		url += "&HEIGHT=" + this.tileSize.h;
		url += sld_url;
	
		url=Ext.urlAppend(this.url,url);
		
		if (this.authentication!="")
		{
			url="php_source/proxies/proxy.php?"+this.authentication+"&url="+url;
			
		}
		
		return url;
	}
	else
	{
	
		return;
	}
}


Ext.getCmp('wms_grid_layers').getSelectionModel().on('rowselect', function(sm, rowIdx, record) {

	var layer_id=record.get("URL")+"_"+record.get("Name");
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		Ext.getCmp('wms_add_layer_btn_id').enable();
		
		Ext.getCmp('wms_remove_layer_btn_id').disable();
	}
	else
	{
		Ext.getCmp('wms_add_layer_btn_id').disable();
		
		Ext.getCmp('wms_remove_layer_btn_id').enable();
	}

});


Ext.getCmp('wms_grid_services').getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
    
	Ext.getCmp('wms_grid_layers').loadMask.show();
	
	var wms_store_fun=wms_fetchLayers(r);
	
	wms_store_fun.load();
		
	Ext.getCmp('wms_grid_layers').reconfigure(wms_store_fun,wms_store_layers_columns);

});

function wms_fetchLayers(record)
{
	get_selected_wms_service=record.data.service_URI;
	
	get_selected_wms_service_name=record.data.service_Title;

	get_selected_wms_service_epsg=record.data.service_SupportedEPSGS;
	
	get_selected_wms_service_output=record.data.service_OutputFormat;
	
	get_selected_wms_service_version=record.data.service_Version;
	
	get_selected_wms_service_isSecured=record.data.service_isSecured;
	
	get_selected_wms_service_saved_username=record.data.service_SecureUsername;
	
	get_selected_wms_service_saved_password=record.data.service_SecurePassword;
	
	var wms_authentication="";
	
	if (get_selected_wms_service_isSecured=="true")
	{
		wms_authentication=fc_createAuthentication(get_selected_wms_service_saved_username,get_selected_wms_service_saved_password);
	}

	if (get_selected_wms_service_version=="1.1.0")
	{
		var xml_columns=['Name','Title','Abstract',{name:'Minx',mapping:'LatLonBoundingBox/@minx'},{name:'Miny',mapping:'LatLonBoundingBox/@miny'},{name:'Maxx',mapping:'LatLonBoundingBox/@maxx'},{name:'Maxy',mapping:'LatLonBoundingBox/@maxy'},{name:'queryable',mapping:'@queryable'},{name:'URL',mapping:function(){return get_selected_wms_service;}},{name:'URL_Title',mapping:function(){return get_selected_wms_service_name;}},{name:'crs',mapping:function(){return get_selected_wms_service_epsg;}},{name:'outputFormat',mapping:function(){return get_selected_wms_service_output;}},{name:'version',mapping:function(){return get_selected_wms_service_version;}},{name:'authentication',mapping:function(){return wms_authentication;}}];
	}
	if (get_selected_wms_service_version=="1.1.1")
	{
		var xml_columns=['Name','Title','Abstract',{name:'Minx',mapping:'LatLonBoundingBox/@minx'},{name:'Miny',mapping:'LatLonBoundingBox/@miny'},{name:'Maxx',mapping:'LatLonBoundingBox/@maxx'},{name:'Maxy',mapping:'LatLonBoundingBox/@maxy'},{name:'queryable',mapping:'@queryable'},{name:'URL',mapping:function(){return get_selected_wms_service;}},{name:'URL_Title',mapping:function(){return get_selected_wms_service_name;}},{name:'crs',mapping:function(){return get_selected_wms_service_epsg;}},{name:'outputFormat',mapping:function(){return get_selected_wms_service_output;}},{name:'version',mapping:function(){return get_selected_wms_service_version;}},{name:'authentication',mapping:function(){return wms_authentication;}}];
	}
	if (get_selected_wms_service_version=="1.3.0")
	{
		var xml_columns=['Name','Title','Abstract',{name:'Minx',mapping:'EX_GeographicBoundingBox/westBoundLongitude'},{name:'Maxx',mapping:'EX_GeographicBoundingBox/eastBoundLongitude'},{name:'Miny',mapping:'EX_GeographicBoundingBox/southBoundLatitude'},{name:'Maxy',mapping:'EX_GeographicBoundingBox/northBoundLatitude'},{name:'queryable',mapping:'@queryable'},{name:'URL_Title',mapping:function(){return get_selected_wms_service_name;}},{name:'URL',mapping:function(){return get_selected_wms_service;}},{name:'crs',mapping:function(){return get_selected_wms_service_epsg;}},{name:'outputFormat',mapping:function(){return get_selected_wms_service_output;}},{name:'version',mapping:function(){return get_selected_wms_service_version;}},{name:'authentication',mapping:function(){return wms_authentication;}}];
	}
	
	var seperator="";
	
	if (wms_authentication!="")
	{
		seperator="&";
	}
	
	wms_store_layers = new Ext.data.Store({
		url: "php_source/proxies/proxy.php?"+wms_authentication+seperator+"url="+Ext.urlAppend(get_selected_wms_service,"REQUEST=GetCapabilities"),
		reader: new Ext.data.XmlReader({
		record: 'Layer/Layer'}, xml_columns
		)
	});
	
	
	return wms_store_layers;
}
