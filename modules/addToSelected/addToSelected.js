/*version message*/

var addToSelected;

var addToSelected_store;

var addToSelected_countItems=0;

var addToSelected_columns;

var addToSelected_Download;

var sm = new Ext.grid.CheckboxSelectionModel();

var addToSelected_columns=new Ext.grid.ColumnModel([
	sm,
	{header:addToSelected_grid_column_featureId, dataIndex: "addToSelected_FeatureId", sortable: true,width:60},
	{header:addToSelected_grid_column_layer, dataIndex: "addToSelected_Layer_Name", sortable: true,width:80},
	{header:addToSelected_grid_column_service,dataIndex: "addToSelected_Service_URI", hidden:true,width:60},
	{dataIndex: "addToSelected_Layer_BaseName", hidden:true},
	{dataIndex: "addToSelected_Service_Version", hidden:true},
	{dataIndex: "addToSelected_Service_Type", hidden:true},
	{dataIndex: "addToSelected_hasFeatureId", hidden:true},
	{dataIndex: "addToSelected_featureObj", hidden:true},
	{dataIndex: "addToSelected_ServiceAuthentication", hidden:true},
	{header:addToSelected_grid_column_groupField,dataIndex: "addToSelected_groupField", hidden:true},
	{header:'',width:26, renderer:addToSelected_createDownloadColumnIcon},
	{header:'',width:26, renderer:addToSelected_createShowOnMapColumnIcon}
	
]);

addToSelected_store=new Ext.data.GroupingStore({
    reader: new Ext.data.JsonReader({},[
		'addToSelected_FeatureId',
		'addToSelected_Layer_Name',
		'addToSelected_Service_URI',
		'addToSelected_Layer_BaseName',
		'addToSelected_Service_Version',
		'addToSelected_Service_Type',
		'addToSelected_hasFeatureId',
		'addToSelected_featureObj',
		'addToSelected_ServiceAuthentication',
		'addToSelected_groupField'
	]),
	groupField:'addToSelected_groupField',
	groupOnSort: true,
    data :[]
});

addToSelected=[{
	xtype:'panel',
	region:'center',
	iconCls:'mapTree_icon16',
	border:false,
	layout:'fit',
	id:'addToSelected_Accordion',
	title:addToSelected_tab_title+" ("+addToSelected_store.getCount()+")",
	items:[{ 
		xtype:'panel',
		border:false,
		layout: 'border',
		items:[
			{
				xtype:'grid',
				id:'addToSelected_grid',
				region:'center',
				loadMask:true,
				view: new Ext.grid.GroupingView({}),
				sm:sm,
				store:addToSelected_store,
				cm:addToSelected_columns,
				tbar:[
				{
					xtype:'button',
					iconCls:'addToSelected_Remove',
					text:addToSelected_Grid_Btn_RemoveFromSelected_Title,
					handler:function(){
					
						Ext.getCmp('addToSelected_grid').getSelectionModel().each(function(record) {
	
							addToSelected_store.each(function(item,index){

									if ((item.get('addToSelected_FeatureId')==record.get('addToSelected_FeatureId')) && (item.get('addToSelected_Service_URI')==record.get('addToSelected_Service_URI')))
									{
										var  toBeDeleted=addToSelected_store.getAt(index);

										addToSelected_store.remove(toBeDeleted);

										addToSelected_store.commitChanges();
										
										var infoWindowId="info_window_"+item.get('addToSelected_FeatureId')+"_"+item.get('addToSelected_Service_URI');
										
										if (typeof Ext.getCmp(infoWindowId)!=="undefined")
										{
											Ext.getCmp('selectedBtn_'+infoWindowId).setText(addToSelected_InfoWindow_Btn_addToSelected_Title);
											Ext.getCmp('selectedBtn_'+infoWindowId).setIconClass('addToSelected_Add');
										}
										
										
									}
								
							});
						
							Ext.getCmp('addToSelected_grid').reconfigure(addToSelected_store,addToSelected_columns);

						});
					
						Ext.getCmp('addToSelected_Accordion').setTitle(addToSelected_tab_title+" ("+addToSelected_store.getCount()+")");
					}
				},
				{
					xtype:'button',
					iconCls:'search_save',
					text:map_search_download,
					handler:function(){
						
						map_search_DownloadFromExternal="addToSelected";
						
						map_search_DownloadWindowSeperately=true;
					
						chooseDownloadType.show();
					}
				},
				{
					xtype:'button',
					iconCls:'addToSelected_Grid_Show',
					text:addToSelected_Grid_Btn_Show_Title,
					handler:function(){
					
						Ext.getCmp('addToSelected_grid').getSelectionModel().each(function(record) {
							
							var infoWindowId="info_window_"+record.get("addToSelected_FeatureId")+"_"+record.get("addToSelected_Service_URI");
							
							if (typeof Ext.getCmp(infoWindowId)==="undefined")
							{
								windowFeatureInfo(record.get("addToSelected_featureObj"));
							}
							else
							{
								Ext.getCmp(infoWindowId).show();
							}
						});
					
					}
				}]
			}]
		}]
	}];


function addToSelected_showOnMap(ss,grid_id)
{
	var cellValue=Ext.getCmp('addToSelected_grid').getStore().getAt(ss);
	
	var featureid=cellValue.get('addToSelected_FeatureId');
	
	var service_URI=cellValue.get('addToSelected_Service_URI');
	
	var typeName=cellValue.get('addToSelected_Layer_BaseName');
	
	var authentication=cellValue.get('addToSelected_ServiceAuthentication');
	
	if (authentication!="")
	{
		authentication+="&";
	}
	
	var gml_url="php_source/proxies/proxy_wfs.php?"+authentication+"url="+Ext.urlAppend(service_URI,"service=WFS&request=GetFeature&featureid="+featureid+"&outputFormat=GML2&srsName=EPSG:4326&typeName="+typeName);
	
	fc_showVectorOnMap(gml_url,'EPSG:4326',"gml");

}
	
function addToSelected_createShowOnMapColumnIcon(v, p, rec, rowIndex, colIndex, store)
{
	var img="<img src='images/gis_icons/show.png' width='16' height='16' onclick=\"javascript:addToSelected_showOnMap("+rowIndex+");\">";
	
	return img;
}

function addToSelected_createDownloadColumnIcon(v, p, rec, rowIndex, colIndex, store)
{
	var img="<img src='images/gis_icons/save1.png' width='16' height='16' onclick=\"javascript:addToSelected_DonwloadOne("+rowIndex+");\">";
	
	return img;
}

function addToSelected_DonwloadOne(ss)
{
	map_search_DownloadFromExternal="";

	map_search_DownloadWindowSeperately=false;
	
	map_search_featureid="";
	
	var cellValue=Ext.getCmp('addToSelected_grid').getStore().getAt(ss);
	
	map_search_featureid=cellValue.get('addToSelected_FeatureId');
	
	map_search_layer_basename=cellValue.get('addToSelected_Layer_BaseName');
	
	map_search_service_url=cellValue.get('addToSelected_Service_URI');
	
	map_search_DownloadAuthentication=cellValue.get('addToSelected_ServiceAuthentication');
	
	chooseDownloadType.show();
	
	return;
}

function addToSelected_Download()
{
	var outputformat=Ext.getCmp('map_search_outputformat_combo').getValue();
				
	var charset=Ext.getCmp('map_search_charset_combo').getValue();
				
	if (charset=="")
	{
		charset="ISO-8859-7";
	}
				
	var srsname=Ext.getCmp('map_search_SRS_combo').getValue();
				
	if (srsname!="")
	{
		srsname="&srsName="+srsname;
	}else
	{
		srsname="";
	}
				
	var format_options="&format_options=charset:"+charset;
				
	var seperateFiles=Ext.getCmp('map_search_save_seperately_check_id').checked;
	
	if (seperateFiles)
	{
		Ext.getCmp('addToSelected_grid').getSelectionModel().each(function(item,index){
			
			var authentication=item.get('addToSelected_ServiceAuthentication');
			
			if (authentication!="")
			{
				authentication+="&";
			}
			
			window.open("php_source/proxies/proxy_redirect.php?"+authentication[index]+"url="+Ext.urlAppend(item.get('addToSelected_Service_URI'),"service=WFS&request=GetFeature"+format_options+"&featureid="+item.get('addToSelected_FeatureId')+"&typeName="+item.get('addToSelected_Layer_BaseName')+"&outputFormat="+outputformat+srsname));
		});
	}
	else
	{
		var groupLayers=new Array();
		var featuresIds=new Array();
		var services=new Array();
		var layers=new Array();
		var authentication=new Array();
		var i=0;
		
		Ext.getCmp('addToSelected_grid').getSelectionModel().each(function(item,index){
			if (!groupLayers.containsVal(item.get('addToSelected_groupField')))
			{
				groupLayers[i]=item.get('addToSelected_groupField');
				services[i]=item.get('addToSelected_Service_URI');
				featuresIds[i]=item.get('addToSelected_FeatureId');
				layers[i]=item.get('addToSelected_Layer_BaseName');
				authentication[i]=item.get('addToSelected_ServiceAuthentication');
				
				i++;
			}
			else
			{
				var indexOfValue=groupLayers.indexOf(item.get('addToSelected_groupField'));
				featuresIds[indexOfValue]=featuresIds[indexOfValue]+','+item.get('addToSelected_FeatureId');	
			}
		});
	
		Ext.each(groupLayers, function(value,index) {
			
			if (authentication[index]!="")
			{
				authentication[index]=authentication[index]+"&";
			}
		
			window.open("php_source/proxies/proxy_redirect.php?"+authentication[index]+"url="+Ext.urlAppend(services[index],"service=WFS&request=GetFeature"+format_options+"&featureid="+featuresIds[index]+"&typeName="+layers[index]+"&outputFormat="+outputformat+srsname));
		});
	}
}	
	
	
function fetchLayerNameAddToSelected(featureObj)
{
	var layer_name=featureObj.layerBasename.toString();

	mapPanel.layers.each(function(layer){
			
		if ((layer.get("layers_basename")==featureObj.layerBasename) && (layer.get("source_id")==featureObj.serviceURI))
		{
			layer_name=layer.get("layer_title").toString();
		}
			
	});
	
	return layer_name;
}
	
function featureAddToSelected(featureObj)
{
	if (!alreadyToSelected(featureObj))
	{
		
		var recordType = Ext.data.Record.create([
			{name:'addToSelected_FeatureId',type:'string'},
			{name:'addToSelected_Layer_Name',type:'string'},
			{name:'addToSelected_Service_URI',type:'string'},
			{name:'addToSelected_Layer_BaseName',type:'string'},
			{name:'addToSelected_Service_Version',type:'string'},
			{name:'addToSelected_hasFeatureId',type:'string'},
			{name:'addToSelected_Service_Type',type:'string'},
			{name:'addToSelected_featureObj',type:'object'},
			{name:'addToSelected_ServiceAuthentication',type:'string'},
			{name:'addToSelected_groupField',type:'string'}
		]);
		
		var layer_name=fetchLayerNameAddToSelected(featureObj);
		
		var groupField_name= layer_name+" ("+featureObj.serviceURI+")";
		
		var record = new recordType({
			addToSelected_FeatureId:featureObj.featureId, 
			addToSelected_Layer_Name:layer_name,
			addToSelected_Service_URI:featureObj.serviceURI,
			addToSelected_Layer_BaseName:featureObj.layerBasename,
			addToSelected_Service_Version:featureObj.serviceVersion,
			addToSelected_hasFeatureId:featureObj.hasFId,
			addToSelected_Service_Type:featureObj.serviceType,
			addToSelected_featureObj:featureObj,
			addToSelected_ServiceAuthentication:featureObj.serviceAuthentication,
			addToSelected_groupField:groupField_name
		});

		addToSelected_store.add(record);
						
		addToSelected_store.commitChanges();
						
		Ext.getCmp('addToSelected_grid').reconfigure(addToSelected_store,addToSelected_columns);
		
		addToSelected_store.sort('addToSelected_groupField');
		
		Ext.getCmp('addToSelected_Accordion').expand();
	}
	
	Ext.getCmp('addToSelected_Accordion').setTitle(addToSelected_tab_title+" ("+addToSelected_store.getCount()+")");
}


function featureRemoveFromSelected(featureObj)
{	
	
	addToSelected_store.each(function(item,index){
			
			if ((item.get('addToSelected_FeatureId')==featureObj.featureId) && (item.get('addToSelected_Service_URI')==featureObj.serviceURI))
			{
				var  toBeDeleted=addToSelected_store.getAt(index);
		
				addToSelected_store.remove(toBeDeleted);
		
				addToSelected_store.commitChanges();
			}
		
	});
	
	Ext.getCmp('addToSelected_grid').reconfigure(addToSelected_store,addToSelected_columns);	
	
	Ext.getCmp('addToSelected_Accordion').setTitle(addToSelected_tab_title+" ("+addToSelected_store.getCount()+")");
}


function alreadyToSelected(featureObj)
{
	var service_URI=featureObj.serviceURI;
	
	var featureId=featureObj.featureId;
	
	var alreadyExists=false;
	
	addToSelected_store.each(function(item){
		if ((item.get('addToSelected_FeatureId')==featureId) && (item.get('addToSelected_Service_URI')==service_URI))
		{
			alreadyExists=true;
		}
	});

	return alreadyExists;
}