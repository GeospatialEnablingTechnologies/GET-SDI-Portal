/*version message*/

var atomAjax_Request;

var atom_chooseType="file";

var atom_store= new Ext.data.ArrayStore({
	fields: [
    {name: 'atom_Title', type:"string"},
	{name: 'atom_Path', type:"string"},
	{name: "atom_FileName", type:"string"},
	{name: "atom_Type", type:"string"},
	{name: "atom_Refresh", type:"string"}
  ]
});

var sm_atom = new Ext.grid.CheckboxSelectionModel({singleSelect:true});

var atom_store_columns=new Ext.grid.ColumnModel([
	sm_atom,
	{header: '',dataIndex:"atom_Path",renderer:atom_BaseName_LayerId,sortable: true,width:24,hidden:false},
	{header:atom_Name_column_Title, dataIndex: "atom_Title", sortable: true,width:460},
	{dataIndex: "atom_Path", sortable: true,hidden:true},
	{dataIndex: "atom_FileName", sortable: true,hidden:true},
	{dataIndex: "atom_Type", sortable: true,hidden:true}
]);


function atom_BaseName_LayerId(val,a,b,ss)
{
	var cellValue=Ext.getCmp('atom_grid_services').getStore().getAt(ss);
	
	var layer_id="atom_"+cellValue.get("atom_Path");
	
	var img="";
	
	if (findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		img="<img src='images/check_16.png' width='14' height='14'\">";
	}
	
	return img;

}

function atom_FileOrWeb(choice)
{
	Ext.getCmp('atom_upload_form').removeAll();
	Ext.getCmp('atom_upload_form').doLayout();

	var choiceObj;
	
	switch(choice)
	{
		case "web":
			choiceObj=[{
					xtype: 'textfield',
					name:'url_name_atom',
					id:'atom_url_id_name',
					anchor:'100%',
					fieldLabel:atom_name,
					width:300
				},{
					xtype: 'textfield',
					name:'url_atom',
					id:'url_id_atom',
					anchor:'100%',
					fieldLabel:atom_url_web,
					width:300
				},
				{
					xtype: 'textfield',
					name:'atom_refresh_time',
					id:'atom_refresh_time_id',
					fieldLabel:atom_url_web_refresh,
					width:50
				},
				{
					xtype:'panel',
					border:false,
					html:'<a href=\"#\" onclick=\"atom_FileOrWeb(\'file\');\">'+atom_switch_toFile+'</a>'
				}];
				
			atom_chooseType="web";
			
		break;
	
		case "file":
			choiceObj=[{
					xtype: 'textfield',
					name:'url_name_atom',
					id:'atom_url_id_name',
					anchor:'100%',
					fieldLabel:atom_name,
					width:300
				},{
					xtype: 'fileuploadfield',
					name:'url_atom',
					id:'url_id_atom',
					anchor:'100%',
					fieldLabel:atom_url,
					width:300
				},
				{
					xtype:'panel',
					border:false,
					html:'<a href=\"#\" onclick=\"atom_FileOrWeb(\'web\');\">'+atom_switch_toWeb+'</a>'
				}];
				
			atom_chooseType="file";
			
		break;
	}

	Ext.getCmp('atom_upload_form').add(choiceObj);
	Ext.getCmp('atom_upload_form').doLayout();
}

var atom_form=new Ext.Panel({
	title:atom_service_title,
	region:'center',
	hidden:true,
	autoHeight:true,
	border:false,
	items:  [{ 
		xtype:'form',
		height:100,
		id:'atom_upload_form',
		fileUpload: true,
		isUpload: true,
		method:'POST',
		enctype:'multipart/form-data',
		items:[
			{
				xtype: 'textfield',
				name:'url_name_atom',
				id:'atom_url_id_name',
				anchor:'100%',
				fieldLabel:atom_name,
				width:300
			},
			{
				xtype: 'fileuploadfield',
				name:'url_atom',
				id:'url_id_atom',
				anchor:'100%',
				fieldLabel:atom_url,
				width:300
			},
			{
				xtype:'panel',
				border:false,
				html:'<a href=\"#\" onclick=\"atom_FileOrWeb(\'web\');\">'+atom_switch_toWeb+'</a>'
			}]
		},{
			xtype:'toolbar',
			anchor:'100%',
			items:['->',{
				xtype:'tbbutton',
				text:atom_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
			
					if (atom_chooseType=="file")
					{
						atom_addFileATOMToList();
					}
					if (atom_chooseType=="web")
					{
						atom_addWebATOMToList();
					}
					
				
				}
			}]
		},{
			xtype:'grid',
			id:'atom_grid_services',
			title:atom_list_name,
			loadMask:true,
			autoScroll:true,
			sm: sm_atom,
			height:374,
			columnLines: true,
			ds:atom_store,
			cm:atom_store_columns,
			bbar:['->',
				{	
					xtype:'button',
					text:atom_remove_btn,
					iconCls:'mapTree_remove16',
					id:'atom_remove_btn_id',
					disabled: true,
					handler:function()
					{
					
						Ext.MessageBox.confirm(atom_remove_Alert_Title,atom_remove_Alert_Msg,function(ans)
						{
							if (ans=="yes")
							{
								Ext.getCmp('atom_grid_services').getSelectionModel().each(function(record) {
								
									if (atom_chooseType=="file")
									{
										atom_deleteFileATOM(record)
									}
									if (atom_chooseType=="web")
									{
										atom_deleteWebATOM(record);
									}
								});
								
							}
						});
						
					}
				},
				{
					xtype:'button',
					id:'atom_add_btn_id',
					text:atom_add_btn,
					disabled: true,
					iconCls:'mapTree_add16',
					handler:function(){
					
						Ext.getCmp('atom_grid_services').getSelectionModel().each(function(record) {
						
							var atom_url=record.get("atom_Path");
							
							var fetchStyles=false;
							
							var atom_type=record.get("atom_Type");
							
							if (atom_type=="web")
							{
								fetchStyles=true;
								
								atom_url="php_source/proxies/fetchKML.php?nocache&url="+atom_url;
							}
							
							var refr_interval=0;
							
							if (record.get("atom_Refresh")>0)
							{
								refr_interval=record.get("atom_Refresh")*1000;
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
							
							var atom_layer=new OpenLayers.Layer.Vector(record.get("atom_Title"), {
								strategies: [new OpenLayers.Strategy.Fixed(),refresh],
								projection:new OpenLayers.Projection("EPSG:4326"),
								styleMap:styleLayer,
								protocol: new OpenLayers.Protocol.HTTP({
									url: atom_url,
									format: new OpenLayers.Format.Atom()
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
	
							var recordh = new recordType({layer: atom_layer, title: record.get("atom_Title")});

							var copy = recordh.clone();
									
							recordh=null;
									
							copy.set("source_id","ATOM");

							copy.set("layer_title", record.get("atom_Title"));

							copy.set("service_id","ATOM");
							
							copy.set("atom_type",atom_type);
						
							copy.set("service_type","ATOM");
							
							copy.set("atom_filename",record.get("atom_FileName"));

							copy.set("service_authentication","");

							copy.set("queryable",1);

							copy.set("abstract","");

							copy.set("bbox","");

							copy.set("layers_crs","EPSG:4326");
							
							copy.set("native_srs","EPSG:4326");

							copy.set("layers_basename",record.get("atom_Path"));

							copy.set("layers_basename_id","atom_"+record.get("atom_Path"));

							copy.set("service_version","");

							var layer_id="atom_"+record.get("atom_Path");
									
							copy.set("service_name","ATOM");
							
							fc_createLoadLayerIcon(copy,"php_source/proxies/legend_graphic.php?color="+featureColor);
							
							mapPanel.layers.add(copy);
							
							createLayerTree();
						
						});
					
						Ext.getCmp('atom_grid_services').reconfigure(atom_store,atom_store_columns);
					
						Ext.getCmp('atom_add_btn_id').disable();
					
						Ext.getCmp('atom_remove_btn_id').disable();
									
						Ext.getCmp('atom_grid_services').getSelectionModel().clearSelections();
					}
					
					
				}
			]}]
});

Ext.getCmp('atom_grid_services').getSelectionModel().on('rowselect', function(sm, rowIdx, record) {

	var layer_id="atom_"+record.get("atom_Path");
	
	if (!findBaseNameLayerIfAlreadyInTree(layer_id))
	{
		Ext.getCmp('atom_add_btn_id').enable();
		
		Ext.getCmp('atom_remove_btn_id').disable();
	}
	else
	{
		Ext.getCmp('atom_add_btn_id').disable();
		
		Ext.getCmp('atom_remove_btn_id').enable();
	}

});

function atom_ValidateUploadFile()
{
	var atom_url=Ext.getCmp('url_id_atom').getValue();
	
	var ext_atom=atom_url.split('.').pop();

	ext_atom=ext_atom.toLowerCase();

	if (ext_atom!="atom")
	{
		Ext.Msg.alert(atom_error_title, atom_error_not_file);
		
		return false;
	}
	
	return true;

}

function atom_getInfoFeatureObject(feature)
{
	
	var get_layer=mapPanel.layers.getById(feature.layer.id);

	var fid=feature.fid;
	
	var layer_basename=get_layer.get("layers_basename");

	var epsg=get_layer.get("layers_crs");
	
	var atom_type=get_layer.get("atom_type");
	
	var url_gml="modules/atom/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=atom&atomType="+atom_type+"&atom="+get_layer.get("atom_filename");
	
	var url_geometry="modules/atom/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=geometry&atomType="+atom_type+"&atom="+get_layer.get("atom_filename");

	var url_attributes="modules/atom/php/fetch_getinfo.php?lang="+language+"&featureId="+fid+"&getWhat=attributes&atomType="+atom_type+"&atom="+get_layer.get("atom_filename");
	
	var featureObj={
		featureId:fid,
		serviceURI:"ATOM",
		layerBasename:layer_basename,
		hasFId:true,
		epsg:epsg,
		serviceType:"ATOM",
		serviceVersion:"",
		url_gml:url_gml,
		url_geometry:url_geometry,
		url_attributes:url_attributes,
		serviceAuthentication:"",
		layerVectorFormat:"atom"
	};

	return featureObj;
}


function atom_addFileATOMToList()
{
	if (atom_ValidateUploadFile())
	{
		if (Ext.getCmp("atom_url_id_name").getValue()!="")
		{
			if(Ext.getCmp('atom_upload_form').getForm().isValid()){
				Ext.getCmp('atom_upload_form').getForm().submit({
					url: 'modules/atom/php/upload_atom.php',
					waitMsg: 'Uploading...',
					submitEmptyText:false,
					success: function(upload_form, action){
						
						var json=Ext.util.JSON.decode(action.response.responseText);
											
						var uploads=json.uploads;
							
						var atom_tmp_File=uploads[0].file;
						var atom_tmp_Path=uploads[0].path;
							
						TaskLocation = Ext.data.Record.create([
							{name: "atom_Title", type:"string"},
							{name: "atom_Path", type:"string"},
							{name: "atom_FileName", type:"string"},
							{name: "atom_Type", type:"string"},
							{name: "atom_Refresh", type:"string"}
						]);
											
						var record = new TaskLocation({
							atom_Title:Ext.getCmp("atom_url_id_name").getValue(),
							atom_Path:atom_tmp_Path.toString(),
							atom_FileName:atom_tmp_File,
							atom_Type:'file',
							atom_Refresh:'0'
						});
												
						atom_store.add(record);
									
						atom_store.commitChanges();

						Ext.getCmp('atom_grid_services').reconfigure(atom_store,atom_store_columns);
											
						Ext.getCmp('atom_upload_form').getForm().reset();
										
					},
					failure: function(){
										
					}
				});
			}
		}
		else
		{
			Ext.Msg.alert(atom_form_titleAlert, atom_form_titleMsg);
		}
	}
}

function atom_addWebATOMToList()
{
	TaskLocation = Ext.data.Record.create([
		{name: "atom_Title", type:"string"},
		{name: "atom_Path", type:"string"},
		{name: "atom_FileName", type:"string"},
		{name: "atom_Type", type:"string"},
		{name: "atom_Refresh", type:"string"}
	]);

	var atom_refresh_time=0;

	if (Ext.getCmp('atom_refresh_time_id').getValue()!="")
	{
		atom_refresh_time=Ext.getCmp('atom_refresh_time_id').getValue();
	}
	
	
	
	var record = new TaskLocation({
		atom_Title:Ext.getCmp("atom_url_id_name").getValue(),
		atom_Path:Ext.getCmp("url_id_atom").getValue(),
		atom_FileName:Ext.getCmp("url_id_atom").getValue(),
		atom_Type:'web',
		atom_Refresh:atom_refresh_time
	});
												
	atom_store.add(record);
									
	atom_store.commitChanges();

	Ext.getCmp('atom_grid_services').reconfigure(atom_store,atom_store_columns);
											
	Ext.getCmp('atom_upload_form').getForm().reset();

}


function atom_deleteFileATOM(record)
{
								
	var atomfile=record.get("atom_Path");
									
	if(typeof atomDelete_Ajax!=="undefined")
	{
		Ext.Ajax.abort(atomDelete_Ajax);
	}
									
	atomDelete_Ajax=Ext.Ajax.request({
		url:"modules/atom/php/delete_atom.php",
		timeout:5000,
		method: "POST",
		params:{"atom":atomfile},
		success:function(result,response)
		{
											
			var layer_id="atom_"+record.get("atom_Path");
									
			removeOnlyLayersViaServiceWindow(layer_id);
											
			Ext.Msg.alert(atom_remove_Alert_Title, atom_remove_Done);
											
			Ext.each(atom_store.data.items,function(item,index){
										
				if (item)
				{
					if (item.get('atom_Path')==record.get("atom_Path"))
					{
						var  toBeDeleted=atom_store.getAt(index);
														
						atom_store.remove(toBeDeleted);
														
						atom_store.commitChanges();
					}
				}
			});
											
			Ext.getCmp('atom_grid_services').reconfigure(atom_store,atom_store_columns);
											
			Ext.getCmp('atom_add_btn_id').disable();
				
			Ext.getCmp('atom_remove_btn_id').disable();
													
			Ext.getCmp('atom_grid_services').getSelectionModel().clearSelections();
		},
		failure:function(){
										
			Ext.Msg.alert(atom_remove_Alert_Title, atom_remove_Failure);
											
			Ext.getCmp('atom_add_btn_id').disable();
				
			Ext.getCmp('atom_remove_btn_id').disable();
													
			Ext.getCmp('atom_grid_services').getSelectionModel().clearSelections();
		}
	});
									
}

function atom_deleteWebATOM(record)
{

	var layer_id="atom_"+record.get("atom_Path");
									
	removeOnlyLayersViaServiceWindow(layer_id);
											
	Ext.Msg.alert(atom_remove_Alert_Title, atom_remove_Done);
											
	Ext.each(atom_store.data.items,function(item,index){
										
		if (item)
		{
			if (item.get('atom_Path')==record.get("atom_Path"))
			{
				var  toBeDeleted=atom_store.getAt(index);
															
				atom_store.remove(toBeDeleted);
															
				atom_store.commitChanges();
			}
		}
	});
											
	Ext.getCmp('atom_grid_services').reconfigure(atom_store,atom_store_columns);
											
	Ext.getCmp('atom_add_btn_id').disable();
				
	Ext.getCmp('atom_remove_btn_id').disable();
													
	Ext.getCmp('atom_grid_services').getSelectionModel().clearSelections();

}
