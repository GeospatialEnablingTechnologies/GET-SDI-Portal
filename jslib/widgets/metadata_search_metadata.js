/*version message*/
var checked_Catalog_metadata_array=[];
var checked_Catalog_metadata_tab_label="";
var checked_profile_metadata_tab;
var metadata_srch_store_metadata_tab;
var metadata_vectorLayer;
var metadata_polygonFeature;
var metadata_map_BBOX="";
var metadata_map_dynamicSearch=false;
var metadata_map_tight_search=false;


var checked_Catalog_metadata_array_store= new Ext.data.ArrayStore({
	fields: [
    {name: 'service_metadata_url'},
	{name: 'service_metadata_name'}
  ]
});

checked_Catalog_metadata_array_store.loadData(checked_Catalog_metadata_array);

var metadata_search_metadata_store=new Ext.data.SimpleStore({
    fields: ['title','abstract','identifier','icon','bbox','format','west','south','east','north','server'],
    data :[]
});

var metadata_search_metadata_store_expander = new Ext.grid.RowExpander({
id: 'expander',
tpl : new Ext.Template(
'<p><b>'+csw_url_wms_label+':</b><div style="width:90%;padding:10px">{server}</div><b>'+metadata_search_form_adv_Service_Type+':</b><div style="width:90%;padding:10px">{format}</div><b>'+csw_store_columns_abstract+':</b><div style="width:90%;padding:10px">{abstract}</div></p>'
)
});

var metadata_search_metadata_columns=new Ext.grid.ColumnModel([
		metadata_search_metadata_store_expander,
		{header:'', dataIndex: "bbox", sortable: true,width:25,renderer:grid_MetadataSearchMetadata_Col_ZoomToExtend},
		{header:'', dataIndex: "identifier", sortable: true,width:25,renderer:grid_MetadataSearchMetadata_Col_ShowInfo},
		{header:metadata_search_form_adv_Service_Type, dataIndex: "icon", sortable: true,width:56,renderer:grid_MetadataSearchMetadata_Col_Format},
		{header: grid_mapSearchMetadata_Col_ServiceTitle, dataIndex: "title",width:800,flex:1},
		{header:'', dataIndex: "west", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "south", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "east", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "north", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "server", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "format", sortable: true,hidden:true}
]);

function grid_MetadataSearchMetadata_Col_Format(val,a,b,ss)
{	

	var cellValue=Ext.getCmp('metadata_search_grid_id_metadata_tab').getStore().getAt(ss);
	
	var format=cellValue.get("format");
	
	var icon=cellValue.get("icon");
	
	var img="<img src='images/gis_icons/"+icon+"' width='50' height='16' alt='"+format+"'>";
	
	
	return img;
}


function getZoomExtendMetadataMetadata(bbox)
{
	
	var projection = mapPanel_metadata.map.getProjectionObject() || (projConfig && new OpenLayers.Projection(projConfig)) || new OpenLayers.Projection("EPSG:4326"); 
	
	var olbbox=OpenLayers.Bounds.fromString(bbox).transform(new OpenLayers.Projection("EPSG:4326"), projection);
	
	var drawbbox=olbbox.toGeometry();
	
	mapPanel_metadata.map.zoomToExtent(olbbox,false);
	
	var style_mark = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
	
	if (metadata_vectorLayer)
	{
		map_metadata.removeLayer(metadata_vectorLayer);
	}
	
	metadata_vectorLayer = new OpenLayers.Layer.Vector("MetadataBBOXArea", {style: style_mark});
	
	metadata_polygonFeature = new OpenLayers.Feature.Vector(drawbbox, null); 	

	map_metadata.addLayer(metadata_vectorLayer);
	
	metadata_vectorLayer.addFeatures([metadata_polygonFeature]);	
	
	return;
}

function grid_MetadataSearchMetadata_Col_ZoomToExtend(val,a,b,ss)
{	

	var cellValue=Ext.getCmp('metadata_search_grid_id_metadata_tab').getStore().getAt(ss);
	
	var bbox=cellValue.get("bbox");
	
	var img="<img src='images/zoom_in_16.png' width='14' height='14' onclick=\"javascript:getZoomExtendMetadataMetadata('"+bbox+"');\">";
	
	
	return img;
}

function grid_MetadataSearchMetadata_Col_ShowInfo(val,a,b,ss)
{

	var cellValue=Ext.getCmp('metadata_search_grid_id_metadata_tab').getStore().getAt(ss);
	
	var uuid=cellValue.get('identifier');
	
	var url=cellValue.get('server');
	
	var title=cellValue.get('title');
	
	var img="<img src='images/info16.png' width='14' height='14' onclick=\"javascript:tab_MetadataSearchMetadata_Show('"+url+"','"+uuid+"','"+title+"');\">";

	return img;
}

function tab_MetadataSearchMetadata_Show(url,id,title)
{
	
	
	var panels=[{
			xtype:'panel',
			title:title,
			closable: true,
			tootltip:title,
			layout:'fit',
			listeners:{
				resize:function(win)
				{
					win.setHeight(Ext.getCmp("window_csw_metadata_record").getHeight()-60);
					
					Ext.get("iframe_tab_"+url+id).setHeight(Ext.getCmp("window_csw_metadata_record").getHeight()-60);
					
					Ext.getCmp("tab_"+url+id).doLayout();
				}
			},
			id:"tab_"+url+id,
			html:"<iframe width='100%' id='iframe_tab_"+url+id+"' frameborder='0' src='php_source/proxies/metadata_getRecordsById.php?lang="+language+"&recordId="+id+"&serviceUrl="+url+"'></iframe>"
			}];
			
		metadata_map_csw_window.show();		
		
		Ext.getCmp('tab_csw_metadata').add(panels);
		
		Ext.getCmp('tab_csw_metadata').setActiveTab("tab_"+url+id);

	return;
}



var m_left_metadata_search_column={
		xtype:'grid',
		title:grid_metadataSearchMetadata_Title,
		id:'metadata_search_grid_id_metadata_tab',
		loadMask:true,
		ds:metadata_search_metadata_store,
		cm:metadata_search_metadata_columns,
		expander:metadata_search_metadata_store_expander,
		plugins:[metadata_search_metadata_store_expander],
		tbar: new Ext.PagingToolbar({
			id:'metadata_search_metadata_paging',
			pageSize: 25,
			ds:metadata_search_metadata_store			
		})
};

var m_left_metadata_search_accordion=[
{
	xtype:'panel',
	autoScroll:true,
	region:'center',
	collapsible: true,
	items:[metadata_search_metadata_simple],
	tbar:[{
				xtype: 'button',
				id:'metadata_search_add_btn_metadata_tab',
				iconCls:'mapTree_add16',
				text:title_mapTree_add_layer,
				handler:function(){
						
					treeMap_service_window.show();
					
					showServiceTreeTab(csw_form);
				}
			},
			{xtype:'button',
			text:menu_mapSearchMetadata_Title,
			iconCls:'choice_icon16',
			menu:{
				items:[
				{
					text:menu_mapSearchMetadata_Choose_Catalog,
					id:'menu_Catalog_metadata_tab',
					hideOnClick:false,
					menu:{items:[],hideOnClick:false}
				},
				{
					text:menu_mapSearchMetadata_Choose_Spec,
					hideOnClick:false,
					menu:{id:'menu_Profile_metadata_tab',items:[{text:'INSPIRE',id:'inspire_profile_metadata_tab',group:'profile_metadata_tab',checked:true,checkHandler: onItemCheckProfile_metadata_tab},{text:'CSW ISO AP',id:'csw_iso_ap_profile_metadata_tab',group:'profile_metadata_tab',checked:false,checkHandler: onItemCheckProfile_metadata_tab,hideOnClick:false},{text:'DC',id:'dc_profile_metadata_tab',group:'profile_metadata_tab',checked:false,checkHandler: onItemCheckProfile_metadata_tab,hideOnClick:false}]}
				}
				]
			},
			handler:function(){
										
					Ext.getCmp('menu_Catalog_metadata_tab').menu.removeAll();
						
					Ext.each(csw_store.data.items,function(item,data){

						var checked=false;
							
						if(checked_Catalog_metadata_array_store.find("service_metadata_url","csw_Choice_metadata_tab_"+item.get('url'))!=-1)
						{
							checked=true;
						}
						else
						{
							checked=false;
						}
						if ((item.get('nam')!=pending_name_csw) && (item.get('nam')!=""))
						{
							Ext.getCmp('menu_Catalog_metadata_tab').menu.add({text:item.get('nam'),id:"csw_Choice_metadata_tab_"+item.get('url'),iconCls:'blank16',checked: checked,checkHandler: onItemCheck_metadata_tab,hideOnClick:false});
						}
					});
						
					create_metadata_Div_Search_Catalog_Info();
				}
			}],
	bbar:['->',
		{
			xtype:'checkbox',
			boxLabel:metadata_search_metadata_tight_search,
			handler:function(checkbox)
			{
				if (checkbox.checked)
				{
					metadata_map_tight_search="true";
				}
				else
				{
					metadata_map_tight_search="false";
				}
			}
		},
		{
			xtype:'checkbox',
			boxLabel:metadata_search_metadata_Interaction_with_Map,
			handler:function(checkbox)
			{
				if (checkbox.checked)
				{
					metadata_map_dynamicSearch=true;
				}
				else
				{
					metadata_map_dynamicSearch=false;
				}
			}
		},
		{
		xtype:'button',
		text:metadata_search_metadata_Clear_Btn,
		iconCls:'clear16',
		handler:function(){
				clearMapMetadataAll();
			}
		},{
		xtype:'button',
		text:metadata_search_metadata_Search_Btn,
		iconCls:'search16',
		handler:function(){
		
				Ext.getCmp('metadata_map_south_region').expand();
				metadata_Search_Metadata_Populate_Grid();
			}
		}
		]
}];

function create_metadata_Div_Search_Catalog_Info()
{

	Ext.get('info_metadata_catalog_metadata_tab').update(" ");
	
	checked_Catalog_metadata_tab_label="";
	
	Ext.each(checked_Catalog_metadata_array_store.data.items,function(item,index){
		
		checked_Catalog_metadata_tab_label=item.get("service_metadata_name")+"<br>"+checked_Catalog_metadata_tab_label;
		
	});

	Ext.get('info_metadata_catalog_metadata_tab').update(menu_mapSearchMetadata_Choose_Catalog+':<br>'+checked_Catalog_metadata_tab_label);
}


function metadata_map_newCheckedService(url,name)
{
	var csw_id="csw_Choice_metadata_tab_"+url;
	
	var csw_name=name;
	
	var record_conf = Ext.data.Record.create([{name: "service_metadata_url", type: "string"},{name: "service_metadata_name", type: "string"}]);

	var record = new record_conf({service_metadata_url:csw_id,service_metadata_name:csw_name});
										
	checked_Catalog_metadata_array_store.add(record);
										
	checked_Catalog_metadata_array_store.commitChanges();
	
}

function onItemCheck_metadata_tab(item, checked){

	if (checked)
	{
	
		if (checked_Catalog_metadata_array_store.find("service_metadata_url",item.id)==-1)
		{
			var record_conf = Ext.data.Record.create([{name: "service_metadata_url", type: "string"},{name: "service_metadata_name", type: "string"}]);

			var record = new record_conf({service_metadata_url:item.id,service_metadata_name:item.text});
										
			checked_Catalog_metadata_array_store.add(record);
										
			checked_Catalog_metadata_array_store.commitChanges();
		}
		

		
	}
	else
	{
	
		var tobeDeletedIndex=checked_Catalog_metadata_array_store.find("service_metadata_url",item.id);
		
		if (tobeDeletedIndex!=-1)
		{
			var  toBeDeleted=checked_Catalog_metadata_array_store.getAt(tobeDeletedIndex);
												
			checked_Catalog_metadata_array_store.remove(toBeDeleted);
												
			checked_Catalog_metadata_array_store.commitChanges();
		}
	
	}
	
	create_metadata_Div_Search_Catalog_Info();
}

function metadata_Search_Metadata_Populate_Grid()
{
	var checked_csw_srv_metadata_tab="";
	
	Ext.getCmp("metadata_search_grid_id_metadata_tab").loadMask.show();
	
	Ext.each(csw_store.data.items,function(item,data){
	
		if(checked_Catalog_metadata_array_store.find("service_metadata_url","csw_Choice_metadata_tab_"+item.get('url'))!=-1)
		{
			checked_csw_srv_metadata_tab=item.get('url')+","+checked_csw_srv_metadata_tab;
		}
		
	
	});
	
	
	if (checked_csw_srv_metadata_tab=="")
	{
		checked_csw_srv_metadata_tab=csw_dataStore[0][1];
	}

	Ext.getCmp('menu_Profile_metadata_tab').items.each(function(item,data){
	
		if (item.checked)
		{
			checked_profile_metadata_tab=item.id;
			
			Ext.get('info_metadata_profile_metadata_tab').update(menu_mapSearchMetadata_Choose_Spec+':'+item.text);

		}
		
	});
	
	
	if (checked_csw_srv_metadata_tab!="")
	{
		var search_criteria=createRequestUrlMetadata_Tab_Search();

		var search_metadata_profile;
		
		switch(checked_profile_metadata_tab)
		{
			case "dc_profile_metadata_tab":
				search_metadata_profile=3;
			break;
			
			case "csw_iso_ap_profile_metadata_tab":
				search_metadata_profile=2;
			break;
			
			default:
				search_metadata_profile=1;
			break;
		}
		
		metadata_srch_store_metadata_tab = new Ext.data.Store({
				url: encodeURI('php_source/proxies/metadata_tab_catalog_search.php?profile='+search_metadata_profile+'&search_request_method=advance&metadata_servers=['+checked_csw_srv_metadata_tab+']'+search_criteria),
				reader: new Ext.data.JsonReader({
					root: 'rows',
					id:'fileIdentifier',
					totalProperty: 'results'}, 
					[{name:'title',mapping:'title'},
					{name:'identifier',mapping:'fileIdentifier'},
					{name:'abstract',mapping:'abstract'},
					{name:'format',mapping:'codeList'},
					{name:'west',mapping:'west'},
					{name:'south',mapping:'south'},
					{name:'east',mapping:'east'},
					{name:'north',mapping:'north'},
					{name:'bbox',mapping:'bbox'},
					{name:'server',mapping:'serverUrl'},
					{name:'icon',mapping:'icon'}])
			});
			

			metadata_srch_store_metadata_tab.load();
		
			Ext.getCmp('metadata_search_metadata_paging').bind(metadata_srch_store_metadata_tab);
			
			Ext.getCmp('metadata_search_grid_id_metadata_tab').reconfigure(metadata_srch_store_metadata_tab,metadata_search_metadata_columns);
		
		
		
	}
	

}

function onItemCheckProfile_metadata_tab()
{
	Ext.getCmp('menu_Profile_metadata_tab').items.each(function(item,data){
	
		if (item.checked)
		{
			checked_profile_metadata_tab=item.id;
			
			Ext.get('info_metadata_profile_metadata_tab').update(menu_mapSearchMetadata_Choose_Spec+':'+item.text);

		}
		
	});
}

function createRequestUrlMetadata_Tab_Search()
{

	var dateFrom=Ext.getCmp('metadata_search_form_adv_From_id').getValue();
	
	var dateTo=Ext.getCmp('metadata_search_form_adv_To_id').getValue();
	
	if (dateFrom!=""){dateFrom=dateFrom.format('Y-m-d');}else{dateFrom="";}
	
	if (dateTo!=""){dateTo=dateTo.format('Y-m-d');}else{dateTo="";}
	
	
	url="&title="+encodeURI(Ext.getCmp('metadata_search_form_adv_title_id').getValue())+
		"&abstract=" + Ext.getCmp('metadata_search_form_adv_abstract_id').getValue() +
		"&resourceidentifier=" + Ext.getCmp('metadata_search_form_adv_Resource_Identifier_id').getValue() +
		"&type=" + Ext.getCmp('metadata_search_form_adv_Service_Type_id').getValue() +
		"&keyword=" + Ext.getCmp('metadata_search_form_adv_Keyword_id').getValue() +
		"&topiccategory=" + Ext.getCmp('metadata_search_form_adv_Topic_Category_id').getValue() +
		"&from=" + dateFrom +
		"&to=" + dateTo +
		"&calendartype=" + Ext.getCmp('metadata_search_calendar_type_id').getValue() +
		"&organisationname="+ Ext.getCmp('metadata_search_form_adv_Responsible_Party_id').getValue() +
		"&responsiblepartyrole="+ Ext.getCmp('metadata_search_form_adv_Responsible_Party_Role_id').getValue() +
		"&conditionapplyingtoaccessanduse="+ Ext.getCmp('metadata_search_form_adv_Access_and_Use_id').getValue() +
		"&accessconstraints="+ Ext.getCmp('metadata_search_form_adv_Limitation_on_Public_Access_id').getValue() +
		"&lineage="+ Ext.getCmp('metadata_search_form_adv_Lineage_id').getValue() +
		"&specificationtitle="+ Ext.getCmp('metadata_search_form_adv_Specification_id').getValue() +
		"&denominator="+ Ext.getCmp('metadata_search_form_adv_Scale_id').getValue() +
		"&distancevalue="+ Ext.getCmp('metadata_search_form_adv_Distance_id').getValue() +
		"&distanceuom="+ Ext.getCmp('metadata_search_form_adv_Unit_id').getValue() +
		"&degree="+ Ext.getCmp('metadata_search_form_adv_Degree_id').getValue() +
		"&bbox=" + metadata_map_BBOX+
		"&tight="+metadata_map_tight_search;

	return url;
}

function clearMapMetadataAll()
{
	Ext.getCmp('metadata_search_form_adv_title_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_abstract_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Resource_Identifier_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Service_Type_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Keyword_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Topic_Category_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_From_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_To_id').setValue("");
	Ext.getCmp('metadata_search_calendar_type_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Responsible_Party_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Responsible_Party_Role_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Access_and_Use_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Limitation_on_Public_Access_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Lineage_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Specification_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Scale_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Distance_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Unit_id').setValue("");
	Ext.getCmp('metadata_search_form_adv_Degree_id').setValue("");
	
	mapPanel_metadata.layers.each(function(layer){
	
		if (layer.get('layer').name=="MetadataBBOXArea")
		{
		
			
			var thisLayer=map_metadata.getLayer(layer.id);
			
			thisLayer.destroyFeatures();

		}
		
	});

}

var cycleRadio=true;

function getMetadataMapBBOX()
{
	if (metadata_map_BBOX!="")
	{
		metadata_map_BBOX=map_metadata.getExtent();
		
		if (metadata_map_currentMapProjection!="EPSG:4326")
		{
			metadata_map_BBOX.transform(new OpenLayers.Projection(metadata_map_currentMapProjection), new OpenLayers.Projection("EPSG:4326")).toArray();
		}
		
	}
	
	if (metadata_map_dynamicSearch)
	{
		metadata_Search_Metadata_Populate_Grid();
	}
	
	return;
}

function removeMetatataSearchBBOXLayers()
{
	mapPanel_metadata.layers.each(function(layer){
	
		if (layer.get('layer').name=="metatataSearchBBOX")
		{
			var thisLayer=map_metadata.getLayer(layer.id);
		
			map_metadata.removeLayer(thisLayer);
		}
		
	});
	
	return;
}
var drawBBOXControl;
var drawBBOXOptions;
var drawBBOX;

function getMetadataDrawBBOX(vectorBBOX)
{

	var BBOXGeom = vectorBBOX.geometry;
	
	if (metadata_map_currentMapProjection!="EPSG:4326")
	{
		BBOXGeom.transform(new OpenLayers.Projection(metadata_map_currentMapProjection), new OpenLayers.Projection("EPSG:4326"));
	}
	
	
	for(var i=0; i<drawBBOX.features.length-1;i++)
	{
		drawBBOX.removeFeatures(drawBBOX.features[i]);
	}

	metadata_map_BBOX=BBOXGeom.getBounds().toArray();
	
	if (metadata_map_dynamicSearch)
	{
		metadata_Search_Metadata_Populate_Grid();
	}
	return;
	
}

function radioWhereBtnHandler(inputvalue)
{

	map_metadata.events.unregister('moveend', map_metadata, getMetadataMapBBOX);
				
	try{drawBBOXControl.deactivate();drawBBOX.destroyFeatures();}catch(err){}
				
	removeMetatataSearchBBOXLayers();

	switch(inputvalue)
	{
		case "1":
			metadata_map_BBOX="";
		break;
					  
		case "2":
		
			drawBBOX = new OpenLayers.Layer.Vector("metatataSearchBBOX");
							
			map_metadata.addLayer(drawBBOX);
							
			drawBBOXOptions = {sides: 4, irregular: true};
						
			drawBBOXControl = new OpenLayers.Control.DrawFeature(drawBBOX, OpenLayers.Handler.RegularPolygon,{handlerOptions: drawBBOXOptions,'featureAdded': getMetadataDrawBBOX});
							
			map_metadata.addControl(drawBBOXControl);
							
			drawBBOXControl.activate();
							
		break;
					  
		case "3":
					
				metadata_map_BBOX=map_metadata.getExtent();
						
				map_metadata.events.register('moveend', map_metadata, getMetadataMapBBOX);
						
		break;
	}
	
}
