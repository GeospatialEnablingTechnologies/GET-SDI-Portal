/*version message*/

var georssAjax_Request;

var georss_chooseType="file";

var georss_store= new Ext.data.ArrayStore({
	fields: [
    {name: 'georss_Title', type:"string"},
	{name: 'georss_Path', type:"string"},
	{name: "georss_FileName", type:"string"},
	{name: "georss_Type", type:"string"},
	{name: "georss_Refresh", type:"string"}
  ]
});

var sm_georss = new Ext.grid.CheckboxSelectionModel({singleSelect:true});

var georss_store_columns=new Ext.grid.ColumnModel([
	sm_georss,
	{header: '',dataIndex:"georss_Path",renderer:georss_BaseName_LayerId,sortable: true,width:24,hidden:false},
	{header:georss_Name_column_Title, dataIndex: "georss_Title", sortable: true,width:460},
	{dataIndex: "georss_Path", sortable: true,hidden:true},
	{dataIndex: "georss_FileName", sortable: true,hidden:true},
	{dataIndex: "georss_Type", sortable: true,hidden:true}
]);


function georss_BaseName_LayerId(val,a,b,ss)
{
	var cellValue=Ext.getCmp('georss_grid_services').getStore().getAt(ss);
	
	var layer_id="georss_"+cellValue.get("georss_Path");
	
	var img="";
	
	if (findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		img="<img src='images/check_16.png' width='14' height='14'\">";
	}
	
	return img;

}

function georss_FileOrWeb(choice)
{
	Ext.getCmp('georss_upload_form').removeAll();
	Ext.getCmp('georss_upload_form').doLayout();

	var choiceObj;
	
	switch(choice)
	{
		case "web":
			choiceObj=[{
					xtype: 'textfield',
					name:'url_name_georss',
					id:'georss_url_id_name',
					anchor:'100%',
					fieldLabel:georss_name,
					width:300
				},{
					xtype: 'textfield',
					name:'url_georss',
					id:'url_id_georss',
					anchor:'100%',
					fieldLabel:georss_url_web,
					width:300
				},
				{
					xtype: 'textfield',
					name:'georss_refresh_time',
					id:'georss_refresh_time_id',
					fieldLabel:georss_url_web_refresh,
					width:50
				},
				{
					xtype:'panel',
					border:false,
					html:'<a href=\"#\" onclick=\"georss_FileOrWeb(\'file\');\">'+georss_switch_toFile+'</a>'
				}];
				
			georss_chooseType="web";
			
		break;
	
		case "file":
			choiceObj=[{
					xtype: 'textfield',
					name:'url_name_georss',
					id:'georss_url_id_name',
					anchor:'100%',
					fieldLabel:georss_name,
					width:300
				},{
					xtype: 'fileuploadfield',
					name:'url_georss',
					id:'url_id_georss',
					anchor:'100%',
					fieldLabel:georss_url,
					width:300
				},
				{
					xtype:'panel',
					border:false,
					html:'<a href=\"#\" onclick=\"georss_FileOrWeb(\'web\');\">'+georss_switch_toWeb+'</a>'
				}];
				
			georss_chooseType="file";
			
		break;
	}

	Ext.getCmp('georss_upload_form').add(choiceObj);
	Ext.getCmp('georss_upload_form').doLayout();
}

var georss_form=new Ext.Panel({
	title:georss_service_title,
	region:'center',
	hidden:true,
	autoHeight:true,
	border:false,
	items:  [{ 
		xtype:'form',
		height:100,
		id:'georss_upload_form',
		fileUpload: true,
		isUpload: true,
		method:'POST',
		enctype:'multipart/form-data',
		items:[
			{
				xtype: 'textfield',
				name:'url_name_georss',
				id:'georss_url_id_name',
				anchor:'100%',
				fieldLabel:georss_name,
				width:300
			},
			{
				xtype: 'fileuploadfield',
				name:'url_georss',
				id:'url_id_georss',
				anchor:'100%',
				fieldLabel:georss_url,
				width:300
			},
			{
				xtype:'panel',
				border:false,
				html:'<a href=\"#\" onclick=\"georss_FileOrWeb(\'web\');\">'+georss_switch_toWeb+'</a>'
			}]
		},{
			xtype:'toolbar',
			anchor:'100%',
			items:['->',{
				xtype:'tbbutton',
				text:georss_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
			
					if (georss_chooseType=="file")
					{
						georss_addFileGEORSSToList();
					}
					if (georss_chooseType=="web")
					{
						georss_addWebGEORSSToList();
					}
					
				
				}
			}]
		},{
			xtype:'grid',
			id:'georss_grid_services',
			title:georss_list_name,
			loadMask:true,
			autoScroll:true,
			sm: sm_georss,
			height:374,
			columnLines: true,
			ds:georss_store,
			cm:georss_store_columns,
			bbar:['->',
				{	
					xtype:'button',
					text:georss_remove_btn,
					iconCls:'mapTree_remove16',
					id:'georss_remove_btn_id',
					disabled: true,
					handler:function()
					{
					
						Ext.MessageBox.confirm(georss_remove_Alert_Title,georss_remove_Alert_Msg,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('georss_grid_services').getSelectionModel().each(function(record) {
								
									if (georss_chooseType=="file")
									{
										georss_deleteFileGEORSS(record)
									}
									if (georss_chooseType=="web")
									{
										georss_deleteWebGEORSS(record);
									}
								});
								
							}
						});
						
					}
				},
				{
					xtype:'button',
					id:'georss_add_btn_id',
					text:georss_add_btn,
					disabled: true,
					iconCls:'mapTree_add16',
					handler:function(){
					
						Ext.getCmp('georss_grid_services').getSelectionModel().each(function(record) {
						
							var georss_url=record.get("georss_Path");
							
							var fetchStyles=false;
							
							var georss_type=record.get("georss_Type");
							
							if (georss_type=="web")
							{
								fetchStyles=true;
								
								georss_url="php_source/proxies/fetchKML.php?nocache&url="+georss_url;
							}
							
							var refr_interval=0;
							
							if (record.get("georss_Refresh")>0)
							{
								refr_interval=record.get("georss_Refresh")*1000;
							}
							
							
							var refresh = new OpenLayers.Strategy.Refresh({interval:refr_interval,force: true, active: true});
							
							var featureColor=(Math.random() * 0xFFFFFF << 0).toString(16);
							
							var styleLayer=new OpenLayers.StyleMap({
									"default":new OpenLayers.Style({
									pointRadius: 5, 
									strokeWidth: 3,
									fillColor: "#"+featureColor,
									fillOpacity: 0.9, 
									strokeColor: "#"+featureColor
									})
								});
							
							var georss_layer=new OpenLayers.Layer.Vector(record.get("georss_Title"), {
								strategies: [new OpenLayers.Strategy.Fixed(),refresh],
								projection:new OpenLayers.Projection("EPSG:4326"),
								styleMap:styleLayer,
								protocol: new OpenLayers.Protocol.HTTP({
									url: georss_url,
									format: new OpenLayers.Format.GeoRSS()
								}),
								eventListeners: {
									"featuresadded": function(evt){
										var features=evt.features;
										
										for(var i=0;i<features.length;i++)
										{
											features[i].fid=i;
										}
										
									}
								}
							});
							
							
							var recordType = GeoExt.data.LayerRecord.create();
	
							var recordh = new recordType({layer: georss_layer, title: record.get("georss_Title")});

							var copy = recordh.clone();
									
							recordh=null;
									
							copy.set("source_id","GEORSS");

							copy.set("layer_title", record.get("georss_Title"));

							copy.set("service_id","GEORSS");
							
							copy.set("georss_type",georss_type);
						
							copy.set("service_type","GEORSS");
							
							copy.set("georss_filename",record.get("georss_FileName"));

							copy.set("service_authentication","");

							copy.set("queryable",1);

							copy.set("abstract","");

							copy.set("bbox","");

							copy.set("layers_crs","EPSG:4326");

							copy.set("native_srs","EPSG:4326");
							
							copy.set("layers_basename",record.get("georss_Path"));

							copy.set("layers_basename_id","georss_"+record.get("georss_Path"));

							copy.set("service_version","");

							var layer_id="georss_"+record.get("georss_Path");
									
							copy.set("service_name","GEORSS");
							
							fc_createLoadLayerIcon(copy,"php_source/proxies/legend_graphic.php?color="+featureColor);
							
							mapPanel.layers.add(copy);
							
							createLayerTree();
						
						});
					
						Ext.getCmp('georss_grid_services').reconfigure(georss_store,georss_store_columns);
					
						Ext.getCmp('georss_add_btn_id').disable();
					
						Ext.getCmp('georss_remove_btn_id').disable();
									
						Ext.getCmp('georss_grid_services').getSelectionModel().clearSelections();
					}
					
					
				}
			]}]
});

Ext.getCmp('georss_grid_services').getSelectionModel().on('rowselect', function(sm, rowIdx, record) {

	var layer_id="georss_"+record.get("georss_Path");
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		Ext.getCmp('georss_add_btn_id').enable();
		
		Ext.getCmp('georss_remove_btn_id').disable();
	}
	else
	{
		Ext.getCmp('georss_add_btn_id').disable();
		
		Ext.getCmp('georss_remove_btn_id').enable();
	}

});

function georss_ValidateUploadFile()
{
	var georss_url=Ext.getCmp('url_id_georss').getValue();
	
	var ext_georss=georss_url.split('.').pop();

	ext_georss=ext_georss.toLowerCase();

	if (ext_georss!="georss")
	{
		Ext.Msg.alert(georss_error_title, georss_error_not_file);
		
		return false;
	}
	
	return true;

}

function georss_getInfoFeatureObject(feature)
{
	
	var get_layer=mapPanel.layers.getById(feature.layer.id);

	var fid=feature.fid;
	
	var layer_basename=get_layer.get("layers_basename");

	var epsg=get_layer.get("layers_crs");
	
	var georss_type=get_layer.get("georss_type");
	
	var url_gml="modules/georss/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=georss&georssType="+georss_type+"&georss="+get_layer.get("georss_filename");
	
	var url_geometry="modules/georss/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=geometry&georssType="+georss_type+"&georss="+get_layer.get("georss_filename");

	var url_attributes="modules/georss/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=attributes&georssType="+georss_type+"&georss="+get_layer.get("georss_filename");
	
	var featureObj={
		featureId:fid,
		serviceURI:"GEORSS",
		layerBasename:layer_basename,
		hasFId:true,
		epsg:epsg,
		serviceType:"GEORSS",
		serviceVersion:"",
		url_gml:url_gml,
		url_geometry:url_geometry,
		url_attributes:url_attributes,
		serviceAuthentication:"",
		layerVectorFormat:"georss"
	};

	return featureObj;
}


function georss_addFileGEORSSToList()
{
	if (georss_ValidateUploadFile())
	{
		if (Ext.getCmp("georss_url_id_name").getValue()!="")
		{
			if(Ext.getCmp('georss_upload_form').getForm().isValid()){
				Ext.getCmp('georss_upload_form').getForm().submit({
					url: 'modules/georss/php/upload_georss.php',
					waitMsg: 'Uploading...',
					submitEmptyText:false,
					success: function(upload_form, action){
						
						var json=Ext.util.JSON.decode(action.response.responseText);
											
						var uploads=json.uploads;
							
						var georss_tmp_File=uploads[0].file;
						var georss_tmp_Path=uploads[0].path;
							
						TaskLocation = Ext.data.Record.create([
							{name: "georss_Title", type:"string"},
							{name: "georss_Path", type:"string"},
							{name: "georss_FileName", type:"string"},
							{name: "georss_Type", type:"string"},
							{name: "georss_Refresh", type:"string"}
						]);
											
						var record = new TaskLocation({
							georss_Title:Ext.getCmp("georss_url_id_name").getValue(),
							georss_Path:georss_tmp_Path.toString(),
							georss_FileName:georss_tmp_File,
							georss_Type:'file',
							georss_Refresh:'0'
						});
												
						georss_store.add(record);
									
						georss_store.commitChanges();

						Ext.getCmp('georss_grid_services').reconfigure(georss_store,georss_store_columns);
											
						Ext.getCmp('georss_upload_form').getForm().reset();
										
					},
					failure: function(){
										
					}
				});
			}
		}
		else
		{
			Ext.Msg.alert(georss_form_titleAlert, georss_form_titleMsg);
		}
	}
}

function georss_addWebGEORSSToList()
{
	TaskLocation = Ext.data.Record.create([
		{name: "georss_Title", type:"string"},
		{name: "georss_Path", type:"string"},
		{name: "georss_FileName", type:"string"},
		{name: "georss_Type", type:"string"},
		{name: "georss_Refresh", type:"string"}
	]);

	var georss_refresh_time=0;

	if (Ext.getCmp('georss_refresh_time_id').getValue()!="")
	{
		georss_refresh_time=Ext.getCmp('georss_refresh_time_id').getValue();
	}
	
	
	
	var record = new TaskLocation({
		georss_Title:Ext.getCmp("georss_url_id_name").getValue(),
		georss_Path:Ext.getCmp("url_id_georss").getValue(),
		georss_FileName:Ext.getCmp("url_id_georss").getValue(),
		georss_Type:'web',
		georss_Refresh:georss_refresh_time
	});
												
	georss_store.add(record);
									
	georss_store.commitChanges();

	Ext.getCmp('georss_grid_services').reconfigure(georss_store,georss_store_columns);
											
	Ext.getCmp('georss_upload_form').getForm().reset();

}


function georss_deleteFileGEORSS(record)
{
								
	var georssfile=record.get("georss_Path");
									
	if(typeof georssDelete_Ajax!=="undefined")
	{
		Ext.Ajax.abort(georssDelete_Ajax);
	}
									
	georssDelete_Ajax=Ext.Ajax.request({
		url:"modules/georss/php/delete_georss.php",
		timeout:5000,
		method: "POST",
		params:{"georss":georssfile},
		success:function(result,response)
		{
											
			var layer_id="georss_"+record.get("georss_Path");
									
			removeOnlyLayersViaServiceWindow(layer_id);
											
			Ext.Msg.alert(georss_remove_Alert_Title, georss_remove_Done);
											
			Ext.each(georss_store.data.items,function(item,index){
										
				if (item)
				{
					if (item.get('georss_Path')==record.get("georss_Path"))
					{
						var  toBeDeleted=georss_store.getAt(index);
														
						georss_store.remove(toBeDeleted);
														
						georss_store.commitChanges();
					}
				}
			});
											
			Ext.getCmp('georss_grid_services').reconfigure(georss_store,georss_store_columns);
											
			Ext.getCmp('georss_add_btn_id').disable();
				
			Ext.getCmp('georss_remove_btn_id').disable();
													
			Ext.getCmp('georss_grid_services').getSelectionModel().clearSelections();
		},
		failure:function(){
										
			Ext.Msg.alert(georss_remove_Alert_Title, georss_remove_Failure);
											
			Ext.getCmp('georss_add_btn_id').disable();
				
			Ext.getCmp('georss_remove_btn_id').disable();
													
			Ext.getCmp('georss_grid_services').getSelectionModel().clearSelections();
		}
	});
									
}

function georss_deleteWebGEORSS(record)
{

	var layer_id="georss_"+record.get("georss_Path");
									
	removeOnlyLayersViaServiceWindow(layer_id);
											
	Ext.Msg.alert(georss_remove_Alert_Title, georss_remove_Done);
											
	Ext.each(georss_store.data.items,function(item,index){
										
		if (item)
		{
			if (item.get('georss_Path')==record.get("georss_Path"))
			{
				var  toBeDeleted=georss_store.getAt(index);
															
				georss_store.remove(toBeDeleted);
															
				georss_store.commitChanges();
			}
		}
	});
											
	Ext.getCmp('georss_grid_services').reconfigure(georss_store,georss_store_columns);
											
	Ext.getCmp('georss_add_btn_id').disable();
				
	Ext.getCmp('georss_remove_btn_id').disable();
													
	Ext.getCmp('georss_grid_services').getSelectionModel().clearSelections();

}
