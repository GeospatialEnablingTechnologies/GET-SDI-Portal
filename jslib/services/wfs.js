
/*version message*/


var pending_name_wfs='Pending...';

var get_selected_wfs_service;
var get_selected_wfs_service_output;
var get_selected_wfs_service_name;
var get_selected_wfs_service_version;
var get_selected_wfs_service_epsg;
var get_selected_wfs_service_namespaces;
var set_selected_wfs_authentication="";
var get_selected_wfs_service_isSecured="false";
var get_selected_wfs_service_saved_username="";
var get_selected_wfs_service_saved_password="";

var ext_ajax_wfs;

var wfs_dataStore=[];

var wfs_store= new Ext.data.ArrayStore({
	fields: [
	{name: 'service_isSecured'},
	{name: 'service_isSecuredIcon'},
    {name: 'service_Title'},
	{name: 'service_Abstract'},
    {name: 'service_URI'},
	{name: 'service_Version'},
	{name: 'service_NameSpaces'},
	{name: 'service_SecureUsername'},
	{name: 'service_SecurePassword'}
  ]
});

var sm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});

var wfs_store_columns=new Ext.grid.ColumnModel([
	sm,
	{header:'',dataIndex: "service_isSecured",hidden:true},
	{header:'',dataIndex: "service_isSecuredIcon",sortable: true,width:24,renderer:WFS_isSecured},
	{header:wfs_service_columns_name, dataIndex: "service_Title", sortable: true,width:210},
	{dataIndex: "service_Abstract", hidden: true},
	{header:wfs_service_columns_url, dataIndex: "service_URI", sortable: true,width:275},
	{header:wfs_service_version,dataIndex: "service_Version", sortable: true,width:56},
	{dataIndex: "service_NameSpaces", hidden: true},
	{dataIndex: "service_SecureUsername",hidden:true},
	{dataIndex: "service_SecurePassword",hidden:true}
]);

var wfs_store_layers_expander = new Ext.grid.RowExpander({
id: 'expander',
tpl : new Ext.Template(
'<p><b>'+wfs_store_columns_abstract+':</b><br/><div style="width:500px">{Abstract}</div></p>'
)
});

var wfs_store_layers=new Ext.data.SimpleStore({
    fields: ['name','title','abstract','queryable','llbbox'],
    data :[]
	
});

var wfs_empty_store_layers=new Ext.data.SimpleStore({
    fields: ['name','title','abstract','queryable','llbbox'],
    data :[]
});

var wfs_store_layers_columns=new Ext.grid.ColumnModel([
		wfs_store_layers_expander,
		{header: '',dataIndex:"URL",renderer:WFS_BaseName_LayerId,sortable: true,width:24},
		{dataIndex: "URL_Title",hidden:true},
        {header: wfs_store_columns_name, dataIndex: "Name", sortable: true,width:254},
        {header: wfs_store_columns_title, dataIndex: "Title", sortable: true,width:260},
        {header: wfs_store_columns_abstract, dataIndex: "Abstract",width:200,hidden:true},
		{dataIndex: "crs",hidden:true},
		{dataIndex: "Minx",hidden:true},
		{dataIndex: "Miny",hidden:true},
		{dataIndex: "Maxx",hidden:true},
		{dataIndex: "Maxy",hidden:true},
		{dataIndex: "version",hidden:true},
		{dataIndex: "queryable",hidden:true},
		{dataIndex: "authentication",hidden:true},
		{dataIndex: "serviceNameSpaces",hidden:true}
		
]);



function WFS_getMaxy(val,a,b,ss)
{
	var cellValue=Ext.getCmp('wfs_grid_layers').getStore().getAt(ss);
	
	var upperCorner=cellValue.get('Maxy');
	
	var upperCornerSplit=upperCorner.split(' ');
	
	if (upperCornerSplit.length>0)
	{
		return upperCornerSplit[1];
	}
	
	return val;
}


function WFS_BaseName_LayerId(val,a,b,ss)
{
	var cellValue=Ext.getCmp('wfs_grid_layers').getStore().getAt(ss);
	
	var layer_baseName=cellValue.get('Name');
	
	var layer_url= cellValue.get('URL');
	
	var layer_id=layer_url+"_wfs_"+layer_baseName;
	
	var img="";
	
	if (findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		img="<img src='images/check_16.png' width='14' height='14'\">";
	}
	
	return img;

}

function WFS_isSecured(val,a,b,ss)
{
	var cellValue=Ext.getCmp('wfs_grid_services').getStore().getAt(ss);
	
	var isSecured=cellValue.get('service_isSecured');
	
	var img="";
	
	if (isSecured=="true")
	{
		img="<img src='images/gis_icons/authenticate.png' width='14' height='14'\">";
	}
	return img;
}

function addWFSServer(wfs_url,wfs_result)
{
	var service_isValid=wfs_result.isValid;
			
	var service_isSecured=wfs_result.isSecured;
	
	if (service_isValid=="true")
	{
		
			var isonmap=false;

			wfs_store.each(function(item){

				if (item.get('service_URI')==wfs_result.serviceUrl)
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
					{name: "service_Version", type:"string"},
					{name: "service_NameSpaces", type:"object"},
					{name: "service_SecureUsername",type:"string"},
					{name: "service_SecurePassword",type:"string"}
				]);

							
				var service_Title=wfs_result.serviceTitle;
				var service_Abstract=wfs_result.serviceAbstract;
				var service_URI=wfs_result.serviceUrl;
				var service_Version=wfs_result.version;
				var service_NameSpaces=wfs_result.serviceNameSpaces;
				var service_SecureUsername=wfs_result.serviceUsername;
				var service_SecurePassword=wfs_result.servicePassword;
					
				var record = new TaskLocation({
					service_isSecured:service_isSecured,
					service_Title:service_Title,
					service_Abstract:service_Abstract,
					service_URI:service_URI,
					service_Version:service_Version,
					service_NameSpaces:service_NameSpaces,
					service_SecureUsername:service_SecureUsername,
					service_SecurePassword:service_SecurePassword
				});
							
				wfs_store.add(record);
							
				wfs_store.commitChanges();
							
				Ext.getCmp('wfs_grid_services').reconfigure(wfs_store,wfs_store_columns);
							
				Ext.getCmp('url_wfs').setValue("");
			}
			else
			{
				Ext.Msg.alert(wfs_service_title_error, wfs_service_message_error_service_already_exists);	
			}
		
	}
	else
	{
		Ext.Msg.alert(wfs_service_title_error, wfs_service_message_error);
	}
}

var req_WFSServerAJAX;

function addWFSServerAJAX(wfs_url,predifined_wfs_authentication)
{
	Ext.getCmp('wfs_grid_services').loadMask.show();
	
	if(typeof req_WFSServerAJAX!=="undefined")
	{
		Ext.Ajax.abort(req_WFSServerAJAX);
	}
	
	var seperator="";
	
	if ((predifined_wfs_authentication!=="false") && (typeof predifined_wfs_authentication!=="undefined"))
	{
		set_selected_wfs_authentication=predifined_wfs_authentication+"&";
	}
	
	if (set_selected_wfs_authentication!="")
	{
		seperator="&";
	}
	
	
	req_WFSServerAJAX=Ext.Ajax.request({
		url:"php_source/proxies/wfs_isvalid_url.php?"+set_selected_wfs_authentication+seperator+"url="+wfs_url,
		timeout:5000,
		success:function(result,response)
		{
			var wfs_result=Ext.decode(result.responseText);
			
			var service_isValid=wfs_result.isValid;
			
			var service_isSecured=wfs_result.isSecured;
			
			var service_isLogged=wfs_result.serviceIsSecureLogged;
			
			var service_require_authentication=Ext.getCmp("wfs_authentication").getValue();
			
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
							id:'wfs_secureUsername',
							fieldLabel:authentication_Username
						},
						{
							xtype:'textfield',
							id:'wfs_securePassword',
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
								if (setWFSAuthentication())
								{
									addWFSServerAJAX(wfs_url);
		
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
				addWFSServer(wfs_url,wfs_result);
				
				set_selected_wfs_authentication="";
			}
			
			Ext.getCmp('wfs_grid_services').loadMask.hide();
		},
		failure:function()
		{
			Ext.Msg.alert(wfs_service_title_error, wfs_service_message_error_service_not_response);
			Ext.getCmp('wfs_grid_services').loadMask.hide();
		}
	});
}

function setWFSAuthentication()
{
	var username=Ext.getCmp('wfs_secureUsername').getValue();
	
	var password=Ext.getCmp('wfs_securePassword').getValue();
	
	if ((username!="") && (password!=""))
	{
		set_selected_wfs_authentication="initUsername="+Ext.util.base64.encode(username)+"&initPassword="+Ext.util.base64.encode(password)+"&";
		
		return true;
	}
	else
	{
	
	
		Ext.Msg.alert(authentication_NullCredentials_Error_Title, authentication_NullCredentials);
		
		return false;
	}
}

var wfs_form=new Ext.FormPanel({
            title:wfs_form_title,
			region:'center',
			hidden:true,
			autoHeight:true,
			border:false,
			items:  [{ 
					xtype:'panel',
					layout:'form',
					height:80,
					items:[
					{
						xtype: 'textfield',
						id:'url_wfs',
						anchor:'100%',
						fieldLabel:wfs_url_wfs_label,
						width:300
					},
					{
						xtype: 'checkbox',
						id:'wfs_authentication',
						anchor:'100%',
						fieldLabel:wfs_require_authentication,
						width:300,
						listeners:
						{
							change:function(check)
							{
								if(check.checked==false)
								{
									set_selected_wfs_authentication="";
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
				text:wfs_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
					
					addWFSServerAJAX(Ext.getCmp('url_wfs').getValue());
				}
			}
			]},{
			xtype:'grid',
			id:'wfs_grid_services',
			title:wfs_list_name,
			loadMask:true,
			autoScroll:true,
			sm: sm,
			height:110,
			columnLines: true,
			ds:wfs_store,
			cm:wfs_store_columns,
			bbar:['->',
				{
					xtype:'button',
					text:wfs_service_remove,
					iconCls:'mapTree_remove16',
					handler:function(){
					
						Ext.getCmp('wfs_grid_services').loadMask.show();
						
						Ext.MessageBox.confirm(title_SW_Confirm_Removal,question_SW_Confirm_Removal_Services,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('wfs_grid_services').getSelectionModel().each(function(record) {
								
									removeServiceLayersViaServiceWindow(record.get('service_URI'));
									
									Ext.each(wfs_store.data.items,function(item,index){
										
										if (item)
										{
											if (item.get('service_URI')==record.get('service_URI'))
											{
												var  toBeDeleted=wfs_store.getAt(index);
												
												wfs_store.remove(toBeDeleted);
												
												wfs_store.commitChanges();
											}
										}
									});
									
									Ext.getCmp('wfs_grid_services').reconfigure(wfs_store,wfs_store_columns);
									
									Ext.getCmp('wfs_grid_layers').reconfigure(wfs_empty_store_layers,wfs_store_layers_columns);
									
									
									
								});
							}
							
						});	
						
						Ext.getCmp('wfs_grid_services').loadMask.hide();
					}
				}
			]},
			{
				xtype:'panel',
				autoScroll: true,
				height:200,
				items:[
				{
				xtype:'grid',
				anchor:'100%',
				id:'wfs_grid_layers',
				title:wfs_list_data,
				height:172,
				loadMask:true,
				expander:wfs_store_layers_expander,
				plugins:[wfs_store_layers_expander],
				ds:wfs_store_layers,
				cm:wfs_store_layers_columns
				}],
				bbar: ['->',
				{
				xtype:'button',
				text: wfs_layer_remove,
				id:'wfs_remove_layer_btn_id',
				disabled: true,
				iconCls:'mapTree_remove16',
				handler: function() {
				
						Ext.MessageBox.confirm(title_SW_Confirm_Removal,question_SW_Confirm_Removal_Layers,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('wfs_grid_layers').getSelectionModel().each(function(record) {
								
								var layer_id=record.get("URL")+"_"+record.get("Name");
									
									removeOnlyLayersViaServiceWindow(layer_id);
									
								});
								
								Ext.getCmp('wfs_grid_layers').reconfigure(wfs_store_layers,wfs_store_layers_columns);
										
								Ext.getCmp('wfs_add_layer_btn_id').disable();
				
								Ext.getCmp('wfs_remove_layer_btn_id').disable();
								
								Ext.getCmp('wfs_grid_layers').getSelectionModel().clearSelections();
							}
						});
					}
				},{
				xtype:'button',
				text: wfs_form_save_to_list,
				id:'wfs_add_layer_btn_id',
				disabled: true,
				iconCls:'mapTree_add16',
				handler: function() {
				
						Ext.getCmp('wfs_grid_layers').getStore().commitChanges();
						
						Ext.getCmp('wfs_grid_layers').getSelectionModel().each(function(record) {
						
							wfs_registerLayer(record);

						});
						
						Ext.getCmp('wfs_grid_layers').getSelectionModel().clearSelections();
						
						createLayerTree();				
					}
				}]
		}]
		
});

function wfs_returnBBOX(record)
{
	var bbox=record.get("Minx")+","+record.get("Miny")+","+record.get("Maxx")+","+record.get("Maxy");
	
	if (record.get("Minx").indexOf(' ')>0)
	{
		var upperCornerSplit=record.get("Maxx").split(' ');
		
		var lowerCornerSplit=record.get("Minx").split(' ');
		
		bbox=lowerCornerSplit[0]+","+lowerCornerSplit[1]+","+upperCornerSplit[0]+","+upperCornerSplit[1];
	}
	
	return bbox;
}


function wfs_registerLayer(record)
{
	var fName=record.get('Name');
						
	var fTitle=record.get('Title');
							
	var splitfName=fName.split(":");

	var fNameNS=splitfName[0];
							
	var fNameRaw=splitfName[1];
	
	var r_namespaces=record.get('serviceNameSpaces');
	
	if (typeof record.get('layer_namespace')==="undefined")
	{
		var featureNSlink=r_namespaces[fNameNS].toString();
	}
	else
	{
		var featureNSlink=record.get('layer_namespace').toString();
	}
	
	var wfs_version=record.get('version');

	var featureColor=(Math.random() * 0xFFFFFF << 0).toString(16);
	
	var authentication=record.get("authentication");
	
	if (authentication!="")
	{
		authentication+="&";
	}
	
	var visibility=false;
	
	if (typeof record.visibility!=="undefined")
	{
		visibility=record.visibility;
	}
	
	var order=0;
	
	if (typeof record.order!=="undefined")
	{
		order=record.order;
	}
	
	var styleLayer=new OpenLayers.StyleMap({
			"default":new OpenLayers.Style({
			pointRadius: 5, 
			fillColor: "#"+featureColor,
			fillOpacity: 0.5, 
			strokeColor: "#"+featureColor,
			strokeWidth: 1,
			strokeOpacity:1
			})
	});
	
	var rec_sld_full_id="";
	var rec_sld_id="";
	var rec_graphic="";
	
	var newIcon="php_source/proxies/legend_graphic.php?color="+featureColor;
	
	if(typeof record.get("sld_body")!=="undefined")
	{
		var sld_body=record.get("sld_body").replace(/(\r\n|\n|\r|\t)/gm,"");
		
		sld_body=record.get("sld_body").replace(/(0x)/gm,"#");
		
		var format = new OpenLayers.Format.SLD();
		
		sld = format.read(sld_body);
		
		styleLayer.styles["default"]=sld.namedLayers[fName].userStyles[0];
		
		rec_sld_full_id=record.get("sld_id");
		
		
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
		
		var towms=record.get("URL");
							
		towms=towms.replace(/wfs/gm, 'wms');
		towms=towms.replace(/WFS/gm, 'WMS');
							
		newIcon="php_source/proxies/legend_graphic.php?"+authentication+"urlGraphic="+Ext.urlAppend(towms,"REQUEST=GetLegendGraphic&VERSION=1.1.1&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER="+record.get("Name")+"&"+rec_graphic);
	}
	
	
	var refresh = new OpenLayers.Strategy.Refresh({force: true, active: true});
	
	var crs=new OpenLayers.Projection(record.get("crs")).getCode();
	
	var wfs_layers = new OpenLayers.Layer.Vector(fTitle, {
		strategies: [new OpenLayers.Strategy.BBOX({resFactor:3}),refresh],
		styleMap:styleLayer,
		visibility: visibility,
		projection:new OpenLayers.Projection(crs),
		protocol: new OpenLayers.Protocol.HTTP({
			url: "php_source/proxies/proxy_wfs.php?"+authentication+"url="+Ext.urlAppend(record.get('URL'),"SRSNAME="+crs+"&typeName="+fName+"&request=GetFeature&version="+wfs_version),
			srsInBBOX:true,
			format:new OpenLayers.Format.WFST({
				featureType: fNameRaw.toString(),
				featureNS: featureNSlink.toString(),
				srsName: crs,
				service: "wfs",
				extractAttributes:true,
				version:wfs_version
			})
		})
	},
	{
		visibility: visibility
	});
	
	var recordType = GeoExt.data.LayerRecord.create();
	
	var recordh = new recordType({layer: wfs_layers, title: record.get("Name")});
	
	var copy = recordh.clone();
	
	copy.set("source_id",record.get('URL'));
	
	copy.set("layer_title", record.get("Title"));
	
	copy.set("service_id",title_Tree_WFS);
	
	copy.set("layer_namespace",featureNSlink);
	
	copy.set("layer_raw_name",fNameRaw.toString());
	
	copy.set("service_type","WFS");
	
	copy.set("queryable",record.get("queryable"));
	
	copy.set("service_authentication",record.get("authentication"));
	
	copy.set("native_srs",crs);
	
	var bbox_record=wfs_returnBBOX(record);
	
	copy.set("abstract",record.get("Abstract"));
	
	copy.set("bbox",bbox_record);
	
	copy.set("layers_crs",crs);
	
	copy.set("layers_basename",record.get("Name"));
	
	copy.set("layers_basename_id",record.get("URL")+"_wfs_"+record.get("Name"));
	
	copy.set("service_version",record.get("version"));
	
	copy.set("layers_sld",rec_sld_full_id);
	
	var layer_id=record.get("URL")+"_wfs_"+record.get("Name")+rec_sld_full_id;
	
	if (record.get("URL_Title")!="")
	{
		copy.set("service_name",record.get("URL_Title"));
	}
	else
	{
		copy.set("service_name",record.get('URL'));
	}
	
	fc_createLoadLayerIcon(copy,newIcon);
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
	
		var native_srs="";

		var geom_name="";
		
		var geom_type="";
		
		Ext.Ajax.request({
			url:"php_source/proxies/getGeometryField.php?"+authentication+"layer="+record.get("Name")+"&url="+record.get('URL'),
			timeout:8000,
			success:function(result,response)
			{
				var json=Ext.util.JSON.decode(result.responseText);
			
				geom_name=json.GEOM_NAME.toString();
				
				geom_type=json.GEOM_TYPE.toString();
	
				copy.set("geom_name",geom_name);
				
				copy.set("geom_type",geom_type);
				
				mapPanel.layers.add(copy);
		
				Ext.getCmp('wfs_grid_layers').reconfigure(wfs_store_layers,wfs_store_layers_columns);
				
				Ext.getCmp('wfs_add_layer_btn_id').disable();
				
				Ext.getCmp('wfs_remove_layer_btn_id').disable();
				
				Ext.getCmp('wfs_grid_layers').getSelectionModel().clearSelections();
	
				createLayerTree();	
				
			},
			failure:function()
			{
	
				copy.set("geom_name",geom_name);
				
				copy.set("geom_type",geom_type);
				
				mapPanel.layers.add(copy);
			
				Ext.getCmp('wfs_grid_layers').reconfigure(wfs_store_layers,wfs_store_layers_columns);
				
				Ext.getCmp('wfs_add_layer_btn_id').disable();
				
				Ext.getCmp('wfs_remove_layer_btn_id').disable();
				
				Ext.getCmp('wfs_grid_layers').getSelectionModel().clearSelections();
	
				createLayerTree();	
			}
		});
		
			
	}	
}


Ext.getCmp('wfs_grid_layers').getSelectionModel().on('rowselect', function(sm, rowIdx, record) {

	var layer_id=record.get("URL")+"_"+record.get("Name");
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		Ext.getCmp('wfs_add_layer_btn_id').enable();
		
		Ext.getCmp('wfs_remove_layer_btn_id').disable();
	}
	else
	{
		Ext.getCmp('wfs_add_layer_btn_id').disable();
		
		Ext.getCmp('wfs_remove_layer_btn_id').enable();
	}

});


Ext.getCmp('wfs_grid_services').getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
    
	Ext.getCmp('wfs_grid_layers').loadMask.show();
	
	var wfs_store_fun=wfs_fetchLayers(r);
	
	wfs_store_fun.load();
		
	Ext.getCmp('wfs_grid_layers').reconfigure(wfs_store_layers,wfs_store_layers_columns);

});

function wfs_fetchLayers(record)
{
	get_selected_wfs_service=record.data.service_URI;
	
	get_selected_wfs_service_name=record.data.service_Title;

	get_selected_wfs_service_epsg="EPSG:4326";
	
	get_selected_wfs_service_namespaces=record.data.service_NameSpaces;
	
	get_selected_wfs_service_version=record.data.service_Version;
	
	get_selected_wfs_service_isSecured=record.data.service_isSecured;
	
	get_selected_wfs_service_saved_username=record.data.service_SecureUsername;
	
	get_selected_wfs_service_saved_password=record.data.service_SecurePassword;
	
	var wfs_authentication="";
	
	if (get_selected_wfs_service_isSecured=="true")
	{
		wfs_authentication=fc_createAuthentication(get_selected_wfs_service_saved_username,get_selected_wfs_service_saved_password);
	}

		
	
	if (get_selected_wfs_service_version=="1.0.0")
	{
		var xml_columns=['Name','Title','Abstract',{name:'Minx',mapping:'LatLongBoundingBox/@minx'},{name:'Miny',mapping:'LatLongBoundingBox/@miny'},{name:'Maxx',mapping:'LatLongBoundingBox/@maxx'},{name:'Maxy',mapping:'LatLongBoundingBox/@maxy'},{name:"version",mapping:function(){return get_selected_wfs_service_version;}},{name:'queryable',mapping:function(){return true;}},{name:'URL',mapping:function(){return get_selected_wfs_service;}},{name:'crs',mapping:function(){return get_selected_wfs_service_epsg;}},{name:'namespace',mapping:function(){return "";}},{name:'authentication',mapping:function(){return wfs_authentication;}},{name:'serviceNameSpaces',mapping:function(){return get_selected_wfs_service_namespaces}},{name:'URL_Title',mapping:function(){return get_selected_wfs_service_name;}}];
	}
	if (get_selected_wfs_service_version=="1.1.0")
	{
		var xml_columns=['Name','Title','Abstract',{name:'Minx',mapping:'ows|WGS84BoundingBox/ows|LowerCorner'},{name:'Miny',mapping:'ows|WGS84BoundingBox/ows|LowerCorner'},{name:'Maxx',mapping:'ows|WGS84BoundingBox/ows|UpperCorner'},{name:'Maxy',mapping:'ows|WGS84BoundingBox/ows|UpperCorner'},{name:"version",mapping:function(){return get_selected_wfs_service_version;}},{name:'queryable',mapping:function(){return true;}},{name:'URL',mapping:function(){return get_selected_wfs_service;}},{name:'crs',mapping:'DefaultSRS'},{name:'namespace',mapping:function(){return "";}},{name:'authentication',mapping:function(){return wfs_authentication;}},{name:'serviceNameSpaces',mapping:function(){return get_selected_wfs_service_namespaces}},{name:'URL_Title',mapping:function(){return get_selected_wfs_service_name;}}];
	}
	if (get_selected_wfs_service_version=="2.0.0")
	{
		var xml_columns=['Name','Title','Abstract',{name:'Minx',mapping:'ows|WGS84BoundingBox/ows|LowerCorner'},{name:'Miny',mapping:'ows|WGS84BoundingBox/ows|LowerCorner'},{name:'Maxx',mapping:'ows|WGS84BoundingBox/ows|UpperCorner'},{name:'Maxy',mapping:'ows|WGS84BoundingBox/ows|UpperCorner'},{name:"version",mapping:function(){return get_selected_wfs_service_version;}},{name:'queryable',mapping:function(){return true;}},{name:'URL',mapping:function(){return get_selected_wfs_service;}},{name:'crs',mapping:'DefaultSRS'},{name:'namespace',mapping:function(){return "";}},{name:'authentication',mapping:function(){return wfs_authentication;}},{name:'serviceNameSpaces',mapping:function(){return get_selected_wfs_service_namespaces}},{name:'URL_Title',mapping:function(){return get_selected_wfs_service_name;}}];
	}
	
	if (wfs_authentication!="")
	{
		wfs_authentication+="&";
	}
	
	wfs_store_layers = new Ext.data.Store({
		url: "php_source/proxies/proxy.php?"+wfs_authentication+"url="+Ext.urlAppend(get_selected_wfs_service,"REQUEST=GetCapabilities"),
		reader: new Ext.data.XmlReader({
		record: 'FeatureType'}, xml_columns
		)
	});
		
	return wfs_store_layers;

}
