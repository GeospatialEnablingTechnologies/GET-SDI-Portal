/*version message*/

var checked_Catalog="";
var srch_word;
var vectorLayer;
var polygonFeature;
var checked_profile;
var metadata_srch_store;

var metadata_search_map_store=new Ext.data.SimpleStore({
    fields: ['title','abstract','identifier','icon','bbox','format','west','south','east','north','server'],
    data :[]
});

var metadata_search_map_store_expander = new Ext.grid.RowExpander({
id: 'expander',
tpl : new Ext.Template(
'<p><b>'+csw_url_wms_label+':</b><div style="width:90%;padding:10px">{server}</div><b>'+metadata_search_form_adv_Service_Type+':</b><div style="width:90%;padding:10px">{format}</div><b>'+csw_store_columns_abstract+':</b><div style="width:90%;padding:10px">{abstract}</div></p>'
)
});


var metadata_search_map_columns=new Ext.grid.ColumnModel([
		metadata_search_map_store_expander,
		{header:'', dataIndex: "bbox", sortable: true,width:25,renderer:grid_mapSearchMetadata_Col_ZoomToExtend},
		{header:'', dataIndex: "identifier", sortable: true,width:25,renderer:grid_mapSearchMetadata_Col_ShowInfo},
		{header: grid_mapSearchMetadata_Col_ServiceTitle, dataIndex: "title",width:230,flex:1},
		{header:'', dataIndex: "west", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "south", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "east", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "north", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "server", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "format", sortable: true,hidden:true}
]);

var metadata_vectorLayer_map;

function getZoomExtendMapMetadata(bbox)
{
	var projection = map.getProjectionObject() || (projConfig && new OpenLayers.Projection(projConfig)) || new OpenLayers.Projection("EPSG:4326"); 
	
	var olbbox=OpenLayers.Bounds.fromString(bbox).transform(new OpenLayers.Projection("EPSG:4326"), projection);
	
	var drawbbox=olbbox.toGeometry();
	
	map.zoomToExtent(olbbox,false);
	
	var style_mark = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
	
	clearMapMetadataSearch();
	
	metadata_vectorLayer_map = new OpenLayers.Layer.Vector("MapMetadataSearchBBOX", {style: style_mark});
	
	metadata_polygonFeature = new OpenLayers.Feature.Vector(drawbbox, null); 	

	map.addLayer(metadata_vectorLayer_map);
	
	metadata_vectorLayer_map.addFeatures([metadata_polygonFeature]);	
	
	
	return;
}

function grid_mapSearchMetadata_Col_ZoomToExtend(val,a,b,ss)
{	

	var cellValue=Ext.getCmp('metadata_search_grid_id').getStore().getAt(ss);
	
	var bbox=cellValue.get("bbox");
	
	var img="<img src='images/zoom_in_16.png' width='14' height='14' onclick=\"javascript:getZoomExtendMapMetadata('"+bbox+"');\">";
	
	
	return img;
}

function tab_mapSearchMetadata_Show(url,id,title)
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

function grid_mapSearchMetadata_Col_ShowInfo(val,a,b,ss)
{

	var cellValue=Ext.getCmp('metadata_search_grid_id').getStore().getAt(ss);
	
	var uuid=cellValue.get('identifier');
	
	var url=cellValue.get('server');
	
	var title=cellValue.get('title');
	
	var img="<img src='images/info16.png' width='14' height='14' onclick=\"javascript:tab_mapSearchMetadata_Show('"+url+"','"+uuid+"','"+title+"');\">";

	return img;
}

function clearMapMetadataSearch()
{
	if (metadata_vectorLayer_map)
	{
		map.removeLayer(metadata_vectorLayer_map);
	}
}

var mapSearchMetadata=[{
	xtype:'panel',
	region:'center',
	iconCls:'mapTree_icon16',
	border:false,
	layout:'fit',
	title:title_mapSearchMetadata,
	items:[{ 
		xtype:'panel',
		layout: 'border',
		items:[{
				xtype:'form',
				height:70,
				margin:5,
				region:'north',
				html:"<div id='info_metadata_catalog'  class='info_search_div'></div><div id='info_metadata_profile' class='info_search_div'></div>",
				items:[{
					xtype: 'textfield',
					id:'srch_word_csw',
					width:140,
					fieldLabel:form_mapSearchMetadata_Criteria}],
				bbar:['->',{
						xtype:'button',
						text:menu_mapSearchMetadata_Clear,
						handler:function(){
						
						clearMapMetadataSearch();
						
					}},{
						xtype:'button',
						text:menu_mapSearchMetadata_Search_Btn,
						handler:function(){
						
						clearMapMetadataSearch();
						
						srch_word=Ext.getCmp('srch_word_csw').getValue();
					
						update_metadatasrch_grid();
						
					}}],
				tbar:[
				{
					xtype: 'button',
					id:'metadata_search_add_btn',
					iconCls:'mapTree_add16',
					text:title_mapTree_add_layer,
					handler:function(){
						
						treeMap_service_window.show();
						
						showServiceTreeTab(csw_form);
						
					}
				},
				{
					xtype:'button',
					text:menu_mapSearchMetadata_Title,
					iconCls:'choice_icon16',
					menu:{
						items:[
						{
							text:menu_mapSearchMetadata_Choose_Catalog,
							id:'menu_Catalog',
							menu:{items:[]}
						},
						{
							text:menu_mapSearchMetadata_Choose_Spec,
							
							menu:{id:'menu_Profile',items:[{text:'INSPIRE',id:'inspire_profile',group:'profile',checked:true,checkHandler: onItemCheckProfile},{text:'CSW ISO AP',id:'csw_iso_ap_profile',group:'profile',checked:false,checkHandler: onItemCheckProfile}]}
						}
						]
					},
					handler:function(){
					
						Ext.getCmp('menu_Catalog').menu.removeAll();
						
						Ext.each(csw_store.data.items,function(item,data){

							var checked=false;
						
							if ("csw_Choice_"+item.get('url')==checked_Catalog)
							{
								checked=true;
							}
							else
							{
								checked=false;
							}
							if ((item.get('nam')!=pending_name_csw) && (item.get('nam')!=""))
							{
								Ext.getCmp('menu_Catalog').menu.add({text:item.get('nam'),id:"csw_Choice_"+item.get('url'),group:'catalog',checked: checked,checkHandler: onItemCheck});
							}
						});
					}
				}]
			},
			{
				xtype:'grid',
				title:grid_mapSearchMetadata_Title,
				id:'metadata_search_grid_id',
				region:'center',
				loadMask:true,
				ds:metadata_search_map_store,
				cm:metadata_search_map_columns,
				expander:metadata_search_map_store_expander,
				plugins:[metadata_search_map_store_expander],
				tbar: new Ext.PagingToolbar({
					id:'metadata_search_map_paging',
					pageSize: 25,
					ds:metadata_search_map_store
					
				})
				
			}]
		}]
	}];


	

function onItemCheckProfile(item,checked){

Ext.get('info_metadata_profile').update(menu_mapSearchMetadata_Choose_Spec+':'+item.text);
}
function onItemCheck(item, checked){
checked_Catalog=item.id;

Ext.get('info_metadata_catalog').update(menu_mapSearchMetadata_Choose_Catalog+':<br>'+item.text);
}

function getBBox(val,a,b,ss)
{
	
	return;
}

function update_metadatasrch_grid()
{
	
	Ext.getCmp('metadata_search_grid_id').loadMask.show();
	
	var checked_csw_srv="";
	
	Ext.each(csw_store.data.items,function(item,data){
	
		if ("csw_Choice_"+item.get('url')==checked_Catalog)
		{
			checked_csw_srv=item.get('url');
			
		}
	
	});
	
	
	Ext.getCmp('menu_Profile').items.each(function(item,data){
	
		if (item.checked)
		{
			checked_profile=item.id;
			
			Ext.get('info_metadata_profile').update(menu_mapSearchMetadata_Choose_Spec+':'+item.text);

		}
		
	});
	
	
	if (checked_csw_srv!="")
	{

		var search_metadata_profile;
		
		switch(checked_profile)
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
		
		metadata_srch_store = new Ext.data.Store({
				url: encodeURI('php_source/proxies/metadata_tab_catalog_search.php?profile='+search_metadata_profile+'&word='+srch_word+'&search_request_method=simple&metadata_servers=['+checked_csw_srv+']'),
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
			
			metadata_srch_store.load();
		
			Ext.getCmp('metadata_search_map_paging').bind(metadata_srch_store);
			
			Ext.getCmp('metadata_search_grid_id').reconfigure(metadata_srch_store,metadata_search_map_columns);
		
	}
	
}
 
 


function metadata_addToMapFromRecord(obj)
{
	var dataType=obj.dataType;
	var dataResource=obj.resource;
	var layerName=obj.layer;
	
	if (layerName!="")
	{
		layerName=[layerName];
	}

	switch(dataType)
	{
		case "discovery":
			showServiceTreeTab(csw_form);
			treeMap_service_window.show();
			addPredifinedCSW(dataResource);
		break;
		
		case "download":
			showServiceTreeTab(wfs_form);
			treeMap_service_window.show();
			Ext.getCmp('main_tabpanel').setActiveTab('mapTab');
			addPredifinedWFS(dataResource,"","","","","");
		break;
		
		case "view":
			showServiceTreeTab(wms_form);
			treeMap_service_window.show();
			Ext.getCmp('main_tabpanel').setActiveTab('mapTab');
			addPredifinedWMS(dataResource,"''",layerName,"","","");
		break;
	}
	
	return;
}


var metadata_map_csw_window=new Ext.Window({ 
	width:740,
	height:500,
	title:metadata_map_csw_window_title,
	closeAction:'hide',
	activeItem: 0,
	id:'window_csw_metadata_record',
	resizable:true,
	items:[
	{				
		xtype:'tabpanel',
		enableTabScroll:true,
		region:'center',
		id:'tab_csw_metadata',
		items:[]
	}]
});
