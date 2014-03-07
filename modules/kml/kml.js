/*version message*/

var kmlAjax_Request;

var kml_chooseType="file";

var kml_store= new Ext.data.ArrayStore({
	fields: [
    {name: 'kml_Title', type:"string"},
	{name: 'kml_Path', type:"string"},
	{name: "kml_FileName", type:"string"},
	{name: "kml_Type", type:"string"},
	{name: "kml_Refresh", type:"string"}
  ]
});

var sm_kml = new Ext.grid.CheckboxSelectionModel({singleSelect:true});

var kml_store_columns=new Ext.grid.ColumnModel([
	sm_kml,
	{header: '',dataIndex:"kml_Path",renderer:kml_BaseName_LayerId,sortable: true,width:24,hidden:false},
	{header:kml_Name_column_Title, dataIndex: "kml_Title", sortable: true,width:460},
	{dataIndex: "kml_Path", sortable: true,hidden:true},
	{dataIndex: "kml_FileName", sortable: true,hidden:true},
	{dataIndex: "kml_Type", sortable: true,hidden:true}
]);


function kml_BaseName_LayerId(val,a,b,ss)
{
	var cellValue=Ext.getCmp('kml_grid_services').getStore().getAt(ss);
	
	var layer_id="kml_"+cellValue.get("kml_Path");
	
	var img="";
	
	if (findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		img="<img src='images/check_16.png' width='14' height='14'\">";
	}
	
	return img;

}

function kml_FileOrWeb(choice)
{
	Ext.getCmp('kml_upload_form').removeAll();
	Ext.getCmp('kml_upload_form').doLayout();

	var choiceObj;
	
	switch(choice)
	{
		case "web":
			choiceObj=[{
					xtype: 'textfield',
					name:'url_name_kml',
					id:'kml_url_id_name',
					anchor:'100%',
					fieldLabel:kml_name,
					width:300
				},{
					xtype: 'textfield',
					name:'url_kml',
					id:'url_id_kml',
					anchor:'100%',
					fieldLabel:kml_url_web,
					width:300
				},
				{
					xtype: 'textfield',
					name:'kml_refresh_time',
					id:'kml_refresh_time_id',
					fieldLabel:kml_url_web_refresh,
					width:50
				},
				{
					xtype:'panel',
					border:false,
					html:'<a href=\"#\" onclick=\"kml_FileOrWeb(\'file\');\">'+kml_switch_toFile+'</a>'
				}];
				
			kml_chooseType="web";
			
		break;
	
		case "file":
			choiceObj=[{
					xtype: 'textfield',
					name:'url_name_kml',
					id:'kml_url_id_name',
					anchor:'100%',
					fieldLabel:kml_name,
					width:300
				},{
					xtype: 'fileuploadfield',
					name:'url_kml',
					id:'url_id_kml',
					anchor:'100%',
					fieldLabel:kml_url,
					width:300
				},
				{
					xtype:'panel',
					border:false,
					html:'<a href=\"#\" onclick=\"kml_FileOrWeb(\'web\');\">'+kml_switch_toWeb+'</a>'
				}];
				
			kml_chooseType="file";
			
		break;
	}

	Ext.getCmp('kml_upload_form').add(choiceObj);
	Ext.getCmp('kml_upload_form').doLayout();
}

var kml_form=new Ext.Panel({
	title:kml_service_title,
	region:'center',
	hidden:true,
	autoHeight:true,
	border:false,
	items:  [{ 
		xtype:'form',
		height:100,
		id:'kml_upload_form',
		fileUpload: true,
		isUpload: true,
		method:'POST',
		enctype:'multipart/form-data',
		items:[
			{
				xtype: 'textfield',
				name:'url_name_kml',
				id:'kml_url_id_name',
				anchor:'100%',
				fieldLabel:kml_name,
				width:300
			},
			{
				xtype: 'fileuploadfield',
				name:'url_kml',
				id:'url_id_kml',
				anchor:'100%',
				fieldLabel:kml_url,
				width:300
			},
			{
				xtype:'panel',
				border:false,
				html:'<a href=\"#\" onclick=\"kml_FileOrWeb(\'web\');\">'+kml_switch_toWeb+'</a>'
			}]
		},{
			xtype:'toolbar',
			anchor:'100%',
			items:['->',{
				xtype:'tbbutton',
				text:kml_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
			
					if (kml_chooseType=="file")
					{
						kml_addFileKMLToList();
					}
					if (kml_chooseType=="web")
					{
						kml_addWebKMLToList();
					}
					
				
				}
			}]
		},{
			xtype:'grid',
			id:'kml_grid_services',
			title:kml_list_name,
			loadMask:true,
			autoScroll:true,
			sm: sm_kml,
			height:374,
			columnLines: true,
			ds:kml_store,
			cm:kml_store_columns,
			bbar:['->',
				{	
					xtype:'button',
					text:kml_remove_btn,
					iconCls:'mapTree_remove16',
					id:'kml_remove_btn_id',
					disabled: true,
					handler:function()
					{
					
						Ext.MessageBox.confirm(kml_remove_Alert_Title,kml_remove_Alert_Msg,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('kml_grid_services').getSelectionModel().each(function(record) {
								
									if (kml_chooseType=="file")
									{
										kml_deleteFileKML(record)
									}
									if (kml_chooseType=="web")
									{
										kml_deleteWebKML(record);
									}
								});
								
							}
						});
						
					}
				},
				{
					xtype:'button',
					id:'kml_add_btn_id',
					text:kml_add_btn,
					disabled: true,
					iconCls:'mapTree_add16',
					handler:function(){
					
						Ext.getCmp('kml_grid_services').getSelectionModel().each(function(record) {
						
							var kml_url=record.get("kml_Path");
							
							var fetchStyles=false;
							
							var kml_type=record.get("kml_Type");
							
							if (kml_type=="web")
							{
								fetchStyles=true;
								
								kml_url="php_source/proxies/fetchKML.php?nocache&url="+kml_url;
							}
							
							var refr_interval=0;
							
							if (record.get("kml_Refresh")>0)
							{
								refr_interval=record.get("kml_Refresh")*1000;
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
							
							var kml_layer=new OpenLayers.Layer.Vector(record.get("kml_Title"), {
								strategies: [new OpenLayers.Strategy.Fixed(),refresh],
								projection:new OpenLayers.Projection("EPSG:4326"),
								styleMap:styleLayer,
								protocol: new OpenLayers.Protocol.HTTP({
									url: kml_url,
									format: new OpenLayers.Format.KML({
										extractStyles: fetchStyles, 
										extractAttributes: true,
										maxDepth: 2
									})
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
	
							var recordh = new recordType({layer: kml_layer, title: record.get("kml_Title")});

							var copy = recordh.clone();
									
							recordh=null;
									
							copy.set("source_id","KML");

							copy.set("layer_title", record.get("kml_Title"));

							copy.set("service_id","KML");
							
							copy.set("kml_type",kml_type);
						
							copy.set("service_type","KML");
							
							copy.set("kml_filename",record.get("kml_FileName"));

							copy.set("service_authentication","");

							copy.set("queryable",1);

							copy.set("abstract","");

							copy.set("bbox","");

							copy.set("layers_crs","EPSG:4326");
							
							copy.set("native_srs","EPSG:4326");

							copy.set("layers_basename",record.get("kml_Path"));

							copy.set("layers_basename_id","kml_"+record.get("kml_Path"));

							copy.set("service_version","");

							var layer_id="kml_"+record.get("kml_Path");
									
							copy.set("service_name","KML");
							
							fc_createLoadLayerIcon(copy,"php_source/proxies/legend_graphic.php?color="+featureColor);
									
							mapPanel.layers.add(copy);
							
							createLayerTree();
						
						});
					
						Ext.getCmp('kml_grid_services').reconfigure(kml_store,kml_store_columns);
					
						Ext.getCmp('kml_add_btn_id').disable();
					
						Ext.getCmp('kml_remove_btn_id').disable();
									
						Ext.getCmp('kml_grid_services').getSelectionModel().clearSelections();
					}
					
					
				}
			]}]
});

Ext.getCmp('kml_grid_services').getSelectionModel().on('rowselect', function(sm, rowIdx, record) {

	var layer_id="kml_"+record.get("kml_Path");
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		Ext.getCmp('kml_add_btn_id').enable();
		
		Ext.getCmp('kml_remove_btn_id').disable();
	}
	else
	{
		Ext.getCmp('kml_add_btn_id').disable();
		
		Ext.getCmp('kml_remove_btn_id').enable();
	}

});

function kml_ValidateUploadFile()
{
	var kml_url=Ext.getCmp('url_id_kml').getValue();
	
	var ext_kml=kml_url.split('.').pop();

	ext_kml=ext_kml.toLowerCase();

	if (ext_kml!="kml")
	{
		Ext.Msg.alert(kml_error_title, kml_error_not_file);
		
		return false;
	}
	
	return true;

}

function kml_getInfoFeatureObject(feature)
{
	
	var get_layer=mapPanel.layers.getById(feature.layer.id);

	var fid=feature.fid;
	
	var layer_basename=get_layer.get("layers_basename");

	var epsg=get_layer.get("layers_crs");
	
	var kml_type=get_layer.get("kml_type");
	
	var url_gml="modules/kml/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=kml&kmlType="+kml_type+"&kml="+get_layer.get("kml_filename");
	
	var url_geometry="modules/kml/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=geometry&kmlType="+kml_type+"&kml="+get_layer.get("kml_filename");

	var url_attributes="modules/kml/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=attributes&kmlType="+kml_type+"&kml="+get_layer.get("kml_filename");
	
	var featureObj={
		featureId:fid,
		serviceURI:"KML",
		layerBasename:layer_basename,
		hasFId:true,
		epsg:epsg,
		serviceType:"KML",
		serviceVersion:"",
		url_gml:url_gml,
		url_geometry:url_geometry,
		url_attributes:url_attributes,
		serviceAuthentication:"",
		layerVectorFormat:"kml"
	};

	return featureObj;
}


function kml_addFileKMLToList()
{
	if (kml_ValidateUploadFile())
	{
		if (Ext.getCmp("kml_url_id_name").getValue()!="")
		{
			if(Ext.getCmp('kml_upload_form').getForm().isValid()){
				Ext.getCmp('kml_upload_form').getForm().submit({
					url: 'modules/kml/php/upload_kml.php',
					waitMsg: 'Uploading...',
					submitEmptyText:false,
					success: function(upload_form, action){
						
						var json=Ext.util.JSON.decode(action.response.responseText);
											
						var uploads=json.uploads;
							
						var kml_tmp_File=uploads[0].file;
						var kml_tmp_Path=uploads[0].path;
							
						TaskLocation = Ext.data.Record.create([
							{name: "kml_Title", type:"string"},
							{name: "kml_Path", type:"string"},
							{name: "kml_FileName", type:"string"},
							{name: "kml_Type", type:"string"},
							{name: "kml_Refresh", type:"string"}
						]);
											
						var record = new TaskLocation({
							kml_Title:Ext.getCmp("kml_url_id_name").getValue(),
							kml_Path:kml_tmp_Path.toString(),
							kml_FileName:kml_tmp_File,
							kml_Type:'file',
							kml_Refresh:'0'
						});
												
						kml_store.add(record);
									
						kml_store.commitChanges();

						Ext.getCmp('kml_grid_services').reconfigure(kml_store,kml_store_columns);
											
						Ext.getCmp('kml_upload_form').getForm().reset();
										
					},
					failure: function(){
										
					}
				});
			}
		}
		else
		{
			Ext.Msg.alert(kml_form_titleAlert, kml_form_titleMsg);
		}
	}
}

function kml_addWebKMLToList()
{
	TaskLocation = Ext.data.Record.create([
		{name: "kml_Title", type:"string"},
		{name: "kml_Path", type:"string"},
		{name: "kml_FileName", type:"string"},
		{name: "kml_Type", type:"string"},
		{name: "kml_Refresh", type:"string"}
	]);

	var kml_refresh_time=0;

	if (Ext.getCmp('kml_refresh_time_id').getValue()!="")
	{
		kml_refresh_time=Ext.getCmp('kml_refresh_time_id').getValue();
	}
	
	
	
	var record = new TaskLocation({
		kml_Title:Ext.getCmp("kml_url_id_name").getValue(),
		kml_Path:Ext.getCmp("url_id_kml").getValue(),
		kml_FileName:Ext.getCmp("url_id_kml").getValue(),
		kml_Type:'web',
		kml_Refresh:kml_refresh_time
	});
												
	kml_store.add(record);
									
	kml_store.commitChanges();

	Ext.getCmp('kml_grid_services').reconfigure(kml_store,kml_store_columns);
											
	Ext.getCmp('kml_upload_form').getForm().reset();

}


function kml_deleteFileKML(record)
{
								
	var kmlfile=record.get("kml_Path");
									
	if(typeof kmlDelete_Ajax!=="undefined")
	{
		Ext.Ajax.abort(kmlDelete_Ajax);
	}
									
	kmlDelete_Ajax=Ext.Ajax.request({
		url:"modules/kml/php/delete_kml.php",
		timeout:5000,
		method: "POST",
		params:{"kml":kmlfile},
		success:function(result,response)
		{
											
			var layer_id="kml_"+record.get("kml_Path");
									
			removeOnlyLayersViaServiceWindow(layer_id);
											
			Ext.Msg.alert(kml_remove_Alert_Title, kml_remove_Done);
											
			Ext.each(kml_store.data.items,function(item,index){
										
				if (item)
				{
					if (item.get('kml_Path')==record.get("kml_Path"))
					{
						var  toBeDeleted=kml_store.getAt(index);
														
						kml_store.remove(toBeDeleted);
														
						kml_store.commitChanges();
					}
				}
			});
											
			Ext.getCmp('kml_grid_services').reconfigure(kml_store,kml_store_columns);
											
			Ext.getCmp('kml_add_btn_id').disable();
				
			Ext.getCmp('kml_remove_btn_id').disable();
													
			Ext.getCmp('kml_grid_services').getSelectionModel().clearSelections();
		},
		failure:function(){
										
			Ext.Msg.alert(kml_remove_Alert_Title, kml_remove_Failure);
											
			Ext.getCmp('kml_add_btn_id').disable();
				
			Ext.getCmp('kml_remove_btn_id').disable();
													
			Ext.getCmp('kml_grid_services').getSelectionModel().clearSelections();
		}
	});
									
}

function kml_deleteWebKML(record)
{

	var layer_id="kml_"+record.get("kml_Path");
									
	removeOnlyLayersViaServiceWindow(layer_id);
											
	Ext.Msg.alert(kml_remove_Alert_Title, kml_remove_Done);
											
	Ext.each(kml_store.data.items,function(item,index){
										
		if (item)
		{
			if (item.get('kml_Path')==record.get("kml_Path"))
			{
				var  toBeDeleted=kml_store.getAt(index);
															
				kml_store.remove(toBeDeleted);
															
				kml_store.commitChanges();
			}
		}
	});
											
	Ext.getCmp('kml_grid_services').reconfigure(kml_store,kml_store_columns);
											
	Ext.getCmp('kml_add_btn_id').disable();
				
	Ext.getCmp('kml_remove_btn_id').disable();
													
	Ext.getCmp('kml_grid_services').getSelectionModel().clearSelections();

}
