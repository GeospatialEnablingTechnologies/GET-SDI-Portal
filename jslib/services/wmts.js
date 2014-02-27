
/*version message*/


var pending_name_wmts='Pending...';

var get_selected_wmts_service;
var get_selected_wmts_service_output;
var get_selected_wmts_service_name;
var get_selected_wmts_service_version;
var get_selected_wmts_service_epsg;
var set_selected_wmts_authentication="";
var get_selected_wmts_service_isSecured="false";
var get_selected_wmts_service_saved_username="";
var get_selected_wmts_service_saved_password="";

var ext_ajax_wmts;

var wmts_dataStore=[];

var wmts_store= new Ext.data.ArrayStore({
	fields: [
	{name: 'service_isSecured'},
	{name: 'service_isSecuredIcon'},
    {name: 'service_Title'},
	{name: 'service_Abstract'},
    {name: 'service_URI'},
	{name: 'service_Version'},
	{name: 'service_SecureUsername'},
	{name: 'service_SecurePassword'}
  ]
});

var sm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});

var wmts_store_columns=new Ext.grid.ColumnModel([
	sm,
	{header:'',dataIndex: "service_isSecured",hidden:true},
	{header:'',dataIndex: "service_isSecuredIcon",sortable: true,width:24,renderer:WMTS_isSecured},
	{header:wmts_service_columns_name, dataIndex: "service_Title", sortable: true,width:140},
	{dataIndex: "service_Abstract", hidden: true},
	{header:wmts_service_columns_url, dataIndex: "service_URI", sortable: true,width:210},
	{header:wmts_service_version,dataIndex: "service_Version", sortable: true,width:40},
	{header:wmts_service_outputFormat,dataIndex: "service_OutputFormat",sortable: true,width:60},
	{header:'',dataIndex: "service_SecureUsername",hidden:true},
	{header:'',dataIndex: "service_SecurePassword",hidden:true}
]);

var wmts_store_layers_expander = new Ext.grid.RowExpander({
id: 'expander',
tpl : new Ext.Template(
'<p><b>'+wmts_store_columns_abstract+':</b><br/><div style="width:500px">{Abstract}</div></p>'
)
});

var wmts_store_layers=new Ext.data.SimpleStore({
    fields: ['name','title','abstract','queryable','llbbox'],
    data :[]
	
});

var wmts_empty_store_layers=new Ext.data.SimpleStore({
    fields: ['name','title','abstract','queryable','llbbox'],
    data :[]
});



var wmts_store_layers_columns=new Ext.grid.ColumnModel([
		wmts_store_layers_expander,
		{header: '',dataIndex:"URL",renderer:WMTS_BaseName_LayerId,sortable: true,width:24,hidden:false},
		{dataIndex: "URL_TITLE",hidden:true},
        {header: wmts_store_columns_name, dataIndex: "IDENTIFIER", sortable: true,width:200},
        {header: wmts_store_columns_title, dataIndex: "TITLE", sortable: true,width:270},
		{dataIndex: "SRS",hidden:true},
		{dataIndex: "MATRIXLIMITS",hidden:true},
		{dataIndex: "MATRIXSETS",hidden:true},
		{header: wmts_service_outputFormat, dataIndex: "FORMAT", sortable: true,width:60},
		{dataIndex: "MINX",hidden:true},
		{dataIndex: "MINY",hidden:true},
		{dataIndex: "MAXX",hidden:true},
		{dataIndex: "MAXY",hidden:true},
		{dataIndex: "OUTPUTFORMAT",hidden:true},
		{dataIndex: "VERSION",hidden:true},
		{dataIndex: "AUTHENTICATION",hidden:true}
		
]);

function WMTS_BaseName_LayerId(val,a,b,ss)
{
	var cellValue=Ext.getCmp('wmts_grid_layers').getStore().getAt(ss);
	
	var layer_baseName= cellValue.get('IDENTIFIER');
	
	var layer_url= cellValue.get('URL');
	
	var layer_id=layer_url+"_"+layer_baseName;
	
	var img="";
	
	if (findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		img="<img src='images/check_16.png' width='14' height='14'\">";
	}
	
	return img;

}

function  WMTS_isSecured(val,a,b,ss)
{
	var cellValue=Ext.getCmp('wmts_grid_services').getStore().getAt(ss);
	
	var isSecured=cellValue.get('service_isSecured');
	
	var img="";
	
	if (isSecured=="true")
	{
		img="<img src='images/gis_icons/authenticate.png' width='14' height='14'\">";
	}
	return img;
}

function addWMTSServer(wmts_url,wmts_result)
{
	var service_isValid=wmts_result.isValid;
			
	var service_isSecured=wmts_result.isSecured;
	
	if (service_isValid=="true")
	{
		var isonmap=false;

		wmts_store.each(function(item){

			if (item.get('service_URI')==wmts_result.serviceUrl)
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
				{name: "service_OutputFormat", type:"string"},
				{name: "service_SecureUsername",type:"string"},
				{name: "service_SecurePassword",type:"string"}
			]);
						
						
			var output=Ext.getCmp('wmts_output').getValue();
						
			if (output=="")
			{
				output="image/png";
			}
						
			var service_Title=wmts_result.serviceTitle;
			var service_Abstract=wmts_result.serviceAbstract;
			var service_URI=wmts_result.serviceUrl;
			var service_Version=wmts_result.version;
			var service_OutputFormat=output;
			var service_SecureUsername=wmts_result.serviceUsername;
			var service_SecurePassword=wmts_result.servicePassword;
				
			var record = new TaskLocation({
				service_isSecured:service_isSecured,
				service_Title:service_Title,
				service_Abstract:service_Abstract,
				service_URI:service_URI,
				service_Version:service_Version,
				service_OutputFormat:service_OutputFormat,
				service_SecureUsername:service_SecureUsername,
				service_SecurePassword:service_SecurePassword
			});
						
			wmts_store.add(record);
						
			wmts_store.commitChanges();
						
			Ext.getCmp('wmts_grid_services').reconfigure(wmts_store,wmts_store_columns);
						
			Ext.getCmp('url_wmts').setValue("");
		}
		else
		{
			Ext.Msg.alert(wmts_service_title_error, wmts_service_message_error_service_already_exists);	
		}

	}
	else
	{
		Ext.Msg.alert(wmts_service_title_error, wmts_service_message_error);
	}
}


function setWMTSAuthentication()
{
	var username=Ext.getCmp('wmts_secureUsername').getValue();
	
	var password=Ext.getCmp('wmts_securePassword').getValue();
	
	if ((username!="") && (password!=""))
	{
		set_selected_wmts_authentication="initUsername="+Ext.util.base64.encode(username)+"&initPassword="+Ext.util.base64.encode(password);
		
		return true;
	}
	else
	{
		Ext.Msg.alert(authentication_NullCredentials_Error_Title, authentication_NullCredentials);
		
		return false;
	}
}

var req_WMTSServerAJAX;

function addWMTSServerAJAX(wmts_url,predifined_wmts_authentication)
{
	Ext.getCmp('wmts_grid_services').loadMask.show();
	
	if(typeof req_WMTSServerAJAX!=="undefined")
	{
		Ext.Ajax.abort(req_WMTSServerAJAX);
	}
	
	var seperator="";
	
	if ((predifined_wmts_authentication!==false) && (typeof predifined_wmts_authentication!=="undefined"))
	{
		set_selected_wmts_authentication=predifined_wmts_authentication;
	}
	
	if (set_selected_wmts_authentication!="")
	{
		seperator="&";
	}
	
	req_WMTSServerAJAX=Ext.Ajax.request({
		url:"php_source/proxies/wmts_isvalid_url.php?"+set_selected_wmts_authentication+seperator+"url="+wmts_url,
		timeout:5000,
		success:function(result,response)
		{
			var wmts_result=Ext.decode(result.responseText);
			
			var service_isValid=wmts_result.isValid;
			
			var service_isSecured=wmts_result.isSecured;
			
			var service_isLogged=wmts_result.serviceIsSecureLogged;
			
			var service_require_authentication=Ext.getCmp("wmts_authentication").getValue();
			
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
							id:'wmts_secureUsername',
							fieldLabel:authentication_Username
						},
						{
							xtype:'textfield',
							id:'wmts_securePassword',
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
								if (setWMTSAuthentication())
								{
									addWMTSServerAJAX(wmts_url);
		
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
				addWMTSServer(wmts_url,wmts_result);
				
				set_selected_wmts_authentication="";
			}
			
			Ext.getCmp('wmts_grid_services').loadMask.hide();
		},
		failure:function()
		{
			Ext.Msg.alert(wmts_service_title_error, wmts_service_message_error_service_not_response);
			
			Ext.getCmp('wmts_grid_services').loadMask.hide();
		}
	});
}

var wmts_form=new Ext.FormPanel({
            title:wmts_form_title,
			region:'center',
			hidden:true,
			autoHeight:true,
			border:false,
			items:  [{ 
					xtype:'panel',
					layout:'form',
					height:100,
					items:[
						{xtype: 'textfield',
						id:'url_wmts',
						anchor:'100%',
						fieldLabel:wmts_url_wmts_label,
						width:300
						},
						{
							xtype: 'combo',
							fieldLabel: wmts_output,
							width: 180,
							id:'wmts_output',
							store: new Ext.data.SimpleStore({
									id:'wmts_output_store',
									fields:['id','value'],
									data:[["image/png","image/png"],
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
							id:'wmts_authentication',
							anchor:'100%',
							fieldLabel:wmts_require_authentication,
							width:300,
							listeners:
							{
								change:function(check)
								{
									if(check.checked==false)
									{
										set_selected_wmts_authentication="";
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
				text:wmts_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
					
					addWMTSServerAJAX(Ext.getCmp('url_wmts').getValue());
				}
			}
			]},{
			xtype:'grid',
			id:'wmts_grid_services',
			title:wmts_list_name,
			loadMask:true,
			autoScroll:true,
			sm: sm,
			height:110,
			columnLines: true,
			ds:wmts_store,
			cm:wmts_store_columns,
			bbar:['->',
				{
					xtype:'button',
					text:wmts_service_remove,
					iconCls:'mapTree_remove16',
					handler:function(){
					
						Ext.getCmp('wmts_grid_services').loadMask.show();
						
						Ext.MessageBox.confirm(title_SW_Confirm_Removal,question_SW_Confirm_Removal_Services,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('wmts_grid_services').getSelectionModel().each(function(record) {
								
									removeServiceLayersViaServiceWindow(record.get('service_URI'));
									
									Ext.each(wmts_store.data.items,function(item,index){
										
										if (item)
										{
											if (item.get('service_URI')==record.get('service_URI'))
											{
												var  toBeDeleted=wmts_store.getAt(index);
												
												wmts_store.remove(toBeDeleted);
												
												wmts_store.commitChanges();
											}
										}
									});
									
									Ext.getCmp('wmts_grid_services').reconfigure(wmts_store,wmts_store_columns);
									
									Ext.getCmp('wmts_grid_layers').reconfigure(wmts_empty_store_layers,wmts_store_layers_columns);
									
									
									
								});
							}
							
						});	
						
						Ext.getCmp('wmts_grid_services').loadMask.hide();
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
				id:'wmts_grid_layers',
				title:wmts_list_data,
				height:154,
				loadMask:true,
				expander:wmts_store_layers_expander,
				plugins:[wmts_store_layers_expander],
				ds:wmts_store_layers,
				cm:wmts_store_layers_columns
				}],
				bbar: ['->',
				{
				xtype:'button',
				text: wmts_layer_remove,
				id:'wmts_remove_layer_btn_id',
				disabled: true,
				iconCls:'mapTree_remove16',
				handler: function() {
				
						Ext.MessageBox.confirm(title_SW_Confirm_Removal,question_SW_Confirm_Removal_Layers,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('wmts_grid_layers').getSelectionModel().each(function(record) {
								
								var layer_id=record.get("URL")+"_"+record.get("Name");
									
									removeOnlyLayersViaServiceWindow(layer_id);
									
								});
								
								Ext.getCmp('wmts_grid_layers').reconfigure(wmts_store_layers,wmts_store_layers_columns);
										
								Ext.getCmp('wmts_add_layer_btn_id').disable();
				
								Ext.getCmp('wmts_remove_layer_btn_id').disable();
								
								Ext.getCmp('wmts_grid_layers').getSelectionModel().clearSelections();
							}
						});
					}
				},{
				xtype:'button',
				text: wmts_form_save_to_list,
				id:'wmts_add_layer_btn_id',
				disabled: true,
				iconCls:'mapTree_add16',
				handler: function() {
						Ext.getCmp('wmts_grid_layers').getSelectionModel().each(function(record) {

							wmts_registerLayer(record);

						});
									
					}
				}]
		}]
		
});

function wmts_registerLayer(record)
{
	var matrixsets=record.get("MATRIXSETS");
	
	var wmts_format=record.get("FORMAT");
	
	var wmts_transparent=true;
	
	if (wmts_format!="image/png")
	{
		wmts_transparent=false
	}
	
	var matrixsetsArr=matrixsets.split(",");
	
	var matrixSet="";
	
	var matrixEPSG="";
	
	var tlc="";
	
	for (var i=0;i<matrixsetsArr.length;i++)
	{
		var matrix=matrixsetsArr[i];
		
		var matrixSplit=matrix.split("::");
		
		if (matrixSplit[1]==map_currentMapProjection)
		{
			matrixSet=matrixSplit[0];
			
			matrixEPSG=matrixSplit[1];
			
			tlc=matrixSplit[2];
		}
	
	}
	
	var tlcArr=tlc.split(" ");
	
	var tlcValueX=Number(tlcArr[0])

	var tlcValueY=Number(tlcArr[1]);

	var matrixIds_rec=record.get("MATRIXLIMITS");
	
	var matrixIdsArr=matrixIds_rec.split(",");
	
	var matrixIds=new Array();
	
	for(var i=0;i<matrixIdsArr.length;i++)
	{
		var mLimits=matrixIdsArr[i];
		
		var mLimitsArr=mLimits.split("::");
		
		var mLimitsSet=mLimitsArr[0];
		
		var mLimitsValues=mLimitsArr[1];
		
		if (mLimitsSet==matrixSet)
		{
			var mLimitsValuesArr=mLimitsValues.split(":");
			
			for(var b=0;b<mLimitsValuesArr.length;b++)
			{
				matrixIds[b]=matrixSet+":"+mLimitsValuesArr[b];
			}
			
		}
	
	}
	
	var tileFullExtent=record.get("MINX")+","+record.get("MINY")+","+record.get("MAXX")+","+record.get("MAXY");
	
	var tileFullExtentBounds=new OpenLayers.Bounds.fromString(tileFullExtent).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(matrixEPSG));
	
	if (map_currentMapProjection=="EPSG:4326")
	{
		tileFullExtentBounds=new OpenLayers.Bounds.fromString(tileFullExtent);
	
	}
	
	var minx=record.get("MINX");
	
	var maxy=record.get("MAXY");
	
	var topleft=minx+","+maxy;
	
	var tOrigin=new OpenLayers.LonLat.fromString(topleft).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(matrixEPSG));
	
	if (map_currentMapProjection=="EPSG:4326")
	{
		tOrigin=new OpenLayers.LonLat.fromString(topleft);
	}
	
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

	
	wmts_layers = new OpenLayers.Layer.WMTS({
		name: record.get("TITLE"),
		url: record.get("URL"),
		layer: record.get("IDENTIFIER"),
		matrixSet: matrixSet,
		matrixIds: matrixIds,
		visibility:visibility,
		format: wmts_format,
		transparent: wmts_transparent,
		tileOrigin:OpenLayers.LonLat(tlcValueX,tlcValueY),
		style: "",
		maxExtent:new OpenLayers.Bounds.fromString(epsgExtents[map_currentMapProjection]),
		isBaseLayer: false,
		tileFullExtent:tileFullExtentBounds,
		transitionEffect:null,
		projection:new OpenLayers.Projection(map_currentMapProjection)
	},{
		transitionEffect:null,
		visibility:visibility,
		order:order
	});
	
	
	var recordType = GeoExt.data.LayerRecord.create();
	
	var recordh = new recordType({layer: wmts_layers, title: record.get("TITLE")});
	
	var copy = recordh.clone();
	
	recordh=null;
	
	copy.set("source_id",record.get("URL"));
	
	copy.set("layer_title", record.get("TITLE"));
	
	copy.set("service_id",title_Tree_WMTS);
	
	copy.set("service_type","WMTS");
	
	copy.set("service_authentication",record.get("AUTHENTICATION"));
	
	copy.set("queryable","0");
	
	var bbox_record=record.get("MINX")+","+record.get("MINY")+","+record.get("MAXX")+","+record.get("MAXY");
	
	copy.set("abstract",record.get("Abstract"));
	
	copy.set("bbox",bbox_record);
	
	copy.set("layers_crs",map_currentMapProjection);
	
	copy.set("layers_basename",record.get("IDENTIFIER"));
	
	copy.set("layers_basename_id",record.get("URL")+"_"+record.get("IDENTIFIER"));
	
	copy.set("service_version",record.get("VERSION"));
	
	var layer_id=record.get("URL")+"_"+record.get("IDENTIFIER");
	
	if (record.get("URL_Title")!="")
	{
		copy.set("service_name",record.get("URL_Title"));
	}
	else
	{
		copy.set("service_name",record.get("URL"));
	}
	
	var authentication=record.get("AUTHENTICATION");
	
	copy.set("icon","php_source/proxies/legend_graphic.php?color=raster");
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		mapPanel.layers.add(copy);
		
		Ext.getCmp('wmts_grid_layers').reconfigure(wmts_store_layers,wmts_store_layers_columns);
		
		Ext.getCmp('wmts_add_layer_btn_id').disable();
		
		Ext.getCmp('wmts_remove_layer_btn_id').disable();
	}

	Ext.getCmp('wmts_grid_layers').getSelectionModel().clearSelections();
	
	createLayerTree();	
}

function wmts_SRS(srs)
{
	var epsgs=[];
	
	var epsg="";
	
	epsgs=srs.split(",");
	
	for(var i=0;i<epsgs.length;i++)
	{
		if (map_currentMapProjection==epsgs[i])
		{
			epsg=epsgs[i];
		}
	}
	
	return epsg;
}

Ext.getCmp('wmts_grid_layers').getSelectionModel().on('rowselect', function(sm, rowIdx, record) {

	var layer_id=record.get("URL")+"_"+record.get("Name");
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		Ext.getCmp('wmts_add_layer_btn_id').enable();
		
		Ext.getCmp('wmts_remove_layer_btn_id').disable();
	}
	else
	{
		Ext.getCmp('wmts_add_layer_btn_id').disable();
		
		Ext.getCmp('wmts_remove_layer_btn_id').enable();
	}

});


Ext.getCmp('wmts_grid_services').getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
    
	Ext.getCmp('wmts_grid_layers').loadMask.show();
		
	var wmts_store_fun=wmts_fetchLayers(r);
	
	wmts_store_fun.load();
		
	Ext.getCmp('wmts_grid_layers').reconfigure(wmts_store_fun,wmts_store_layers_columns);

});


function wmts_fetchLayers(record)
{
	get_selected_wmts_service=record.data.service_URI;
	
	get_selected_wmts_service_name=record.data.service_Title;

	get_selected_wmts_service_epsg=record.data.service_SupportedEPSGS;
	
	get_selected_wmts_service_output=record.data.service_OutputFormat;
	
	get_selected_wmts_service_version=record.data.service_Version;
	
	get_selected_wmts_service_isSecured=record.data.service_isSecured;
	
	get_selected_wmts_service_saved_username=record.data.service_SecureUsername;
	
	get_selected_wmts_service_saved_password=record.data.service_SecurePassword;
	
	var wmts_authentication="";
	
	if (get_selected_wmts_service_isSecured=="true")
	{
		wmts_authentication=fc_createAuthentication(get_selected_wmts_service_saved_username,get_selected_wmts_service_saved_password);
	}
	
	if (get_selected_wmts_service_version=="1.0.0")
	{
		var xml_columns=['IDENTIFIER','TITLE','MINX','MINY','MAXX','MAXY','MATRIXLIMITS','MATRIXSETS','FORMAT','SRS',{name:'URL',mapping:function(){return get_selected_wmts_service;}},{name:'OUTPUTFORMAT',mapping:function(){return get_selected_wmts_service_output;}},{name:'VERSION',mapping:function(){return get_selected_wmts_service_version;}},{name:'AUTHENTICATION',mapping:function(){return wmts_authentication;}},{name:'URL_Title',mapping:function(){return get_selected_wmts_service_name;}}];
	}
	if (get_selected_wmts_service_version=="1.0.1")
	{
		var xml_columns=['IDENTIFIER','TITLE','MINX','MINY','MAXX','MAXY','MATRIXLIMITS','MATRIXSETS','FORMAT','SRS',{name:'URL',mapping:function(){return get_selected_wmts_service;}},{name:'OUTPUTFORMAT',mapping:function(){return get_selected_wmts_service_output;}},{name:'VERSION',mapping:function(){return get_selected_wmts_service_version;}},{name:'AUTHENTICATION',mapping:function(){return wmts_authentication;}},{name:'URL_Title',mapping:function(){return get_selected_wmts_service_name;}}];
	}

	
	if (wmts_authentication!="")
	{
		wmts_authentication+="&";
	}
	
	wmts_store_layers = new Ext.data.Store({
		url: "php_source/proxies/wmts_capabilities.php?"+wmts_authentication+"url="+Ext.urlAppend(get_selected_wmts_service,"REQUEST=GetCapabilities"),
		reader: new Ext.data.XmlReader({
		record: 'RECORD'}, xml_columns
		)
	});

	return wmts_store_layers;
}