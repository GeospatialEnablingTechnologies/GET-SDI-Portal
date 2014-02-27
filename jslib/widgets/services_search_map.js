/*version message*/

var checked_Service_Catalog;
var srch_Service_word;
var checked_srv_profile;
var service_srch_store;

var Service_search_map_store=new Ext.data.SimpleStore({
    fields: ['title','abstract','identifier','icon','bbox','format','west','south','east','north','server'],
    data :[]
});

var Service_search_map_store_expander = new Ext.grid.RowExpander({
id: 'expander',
tpl : new Ext.Template(
'<p><b>'+csw_url_wms_label+':</b><div style="width:90%;padding:10px">{server}</div><b>'+metadata_search_form_adv_Service_Type+':</b><div style="width:90%;padding:10px">{format}</div><b>'+csw_store_columns_abstract+':</b><div style="width:90%;padding:10px">{abstract}</div></p>'
)
});


var Service_search_map_columns=new Ext.grid.ColumnModel([
		Service_search_map_store_expander,
		{header:'', dataIndex: "bbox", sortable: true,width:25,renderer:grid_mapSearchService_Col_ZoomToExtend},
		{header:'', dataIndex: "identifier", sortable: true,width:25,renderer:grid_mapSearchService_Col_ShowInfo},
		{header: grid_mapSearchMetadata_Col_ServiceTitle, dataIndex: "title",width:230,flex:1},
		{header:'', dataIndex: "west", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "south", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "east", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "north", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "server", sortable: true,width:25,hidden:true},
		{header:'', dataIndex: "format", sortable: true,hidden:true}
]);

function tab_mapSearchService_Show(url,id,title)
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

function grid_mapSearchService_Col_ShowInfo(val,a,b,ss)
{

	var cellValue=Ext.getCmp('service_search_grid_id').getStore().getAt(ss);
	
	var uuid=cellValue.get('identifier');
	
	var url=cellValue.get('server');
	
	var title=cellValue.get('title');
	
	var img="<img src='images/info16.png' width='14' height='14' onclick=\"javascript:tab_mapSearchService_Show('"+url+"','"+uuid+"','"+title+"');\">";

	return img;
}

var metadata_service_vectorLayer_map;

function getZoomExtendMapService(bbox)
{
	var projection = map.getProjectionObject() || (projConfig && new OpenLayers.Projection(projConfig)) || new OpenLayers.Projection("EPSG:4326"); 
	
	var olbbox=OpenLayers.Bounds.fromString(bbox).transform(new OpenLayers.Projection("EPSG:4326"), projection);
	
	var drawbbox=olbbox.toGeometry();
	
	map.zoomToExtent(olbbox,false);
	
	var style_mark = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
	
	clearMapServiceSearch();
	
	metadata_service_vectorLayer_map = new OpenLayers.Layer.Vector("MapServiceSearchBBOX", {style: style_mark});
	
	metadata_polygonFeature = new OpenLayers.Feature.Vector(drawbbox, null); 	

	map.addLayer(metadata_service_vectorLayer_map);
	
	metadata_service_vectorLayer_map.addFeatures([metadata_polygonFeature]);	
	
	return;
}

function grid_mapSearchService_Col_ZoomToExtend(val,a,b,ss)
{	
	
	var cellValue=Ext.getCmp('service_search_grid_id').getStore().getAt(ss);
	
	var bbox=cellValue.get("bbox");
	
	var img="<img src='images/zoom_in_16.png' width='14' height='14' onclick=\"javascript:getZoomExtendMapService('"+bbox+"');\">";
	
	
	return img;
}

function addMapService(url,format)
{
	addWMSServer(url);
	
	treeMap_service_window.show();
	
	showServiceTreeTab(wms_form);

	return;
}

function clearMapServiceSearch()
{
	if (metadata_service_vectorLayer_map)
	{
		map.removeLayer(metadata_service_vectorLayer_map);
	}

}

var store_combo_service_search=new Ext.data.SimpleStore({
		fields: ['name','value'],
		data: [[search_for_viewing_services,"view"],[search_for_download_services,"download"]]
	});
 
var mapSearchService=[{
	xtype:'panel',
	region:'center',
	iconCls:'mapTree_icon16',
	layout:'fit',
	autoScroll:true,
	title:title_mapSearchService,
	items:[{ 
		xtype:'panel',
		layout: 'border',
		items:[{
				xtype:'form',
				height:80,
				margin:5,
				region:'north',
				html:"<div id='info_service_metadata_catalog'  class='info_search_div'></div><div id='info_service_metadata_profile' class='info_search_div'></div>",
				items:[{
					xtype: 'combo',
					id:'srch_service_word_csw',
					width:140,
					store: store_combo_service_search,
					displayField: 'name',
					valueField: 'value',
					mode: 'local',
					triggerAction: 'all',
					fieldLabel:form_mapSearchService_Criteria}],
					bbar:['->',{
					xtype:'button',
					text:search_clear_map,
					handler:function(){
					
						clearMapServiceSearch();
						
					}},{
					xtype:'button',
					text:menu_mapSearchService_Search_Btn,
					handler:function(){
					
						clearMapServiceSearch();
						
						srch_Service_word=Ext.getCmp('srch_service_word_csw').getValue();
					
						update_Servicesrch_grid();
						
					}}],
				tbar:[
				{
					xtype: 'button',
					id:'service_search_add_btn',
					iconCls:'mapTree_add16',
					text:title_mapTree_add_layer,
					handler:function(){
						
						treeMap_service_window.show();
						
						showServiceTreeTab(csw_form);
					}
				},
				{
					xtype:'button',
					text:menu_mapSearchService_Title,
					iconCls:'choice_icon16',
					menu:{
						items:[
						{
							text:menu_mapSearchService_Choose_Catalog,
							id:'menu_Service_Catalog',
							menu:{items:[]}
						},
						{
							text:menu_mapSearchService_Choose_Spec,
							
							menu:{id:'menu_service_Profile',items:[{text:'INSPIRE',id:'inspire_service_profile',group:'service_profile',checked:true,checkHandler: onServiceItemCheckProfile},{text:'CSW ISO AP',id:'csw_iso_ap_service_profile',group:'service_profile',checked:false,checkHandler: onServiceItemCheckProfile}]}
						}
						]
					},
					handler:function(){
					
						Ext.getCmp('menu_Service_Catalog').menu.removeAll();
						
						Ext.each(csw_store.data.items,function(item,data){

						var checked=false;
						
							if ("csw_service_Choice_"+item.get('url')==checked_Service_Catalog)
							{
								checked=true;
							}
							else
							{
								checked=false;
							}
							if ((item.get('nam')!=pending_name_csw) && (item.get('nam')!=""))
							{
								Ext.getCmp('menu_Service_Catalog').menu.add({text:item.get('nam'),id:"csw_service_Choice_"+item.get('url'),group:'Service_catalog',checked: checked,checkHandler: onServiceItemCheck});
							}
						});
					}
				}]
			},
			{
				xtype:'grid',
				title:grid_mapSearchService_Title,
				id:'service_search_grid_id',
				region:'center',
				loadMask:true,
				ds:Service_search_map_store,
				cm:Service_search_map_columns,
				expander:Service_search_map_store_expander,
				plugins:[Service_search_map_store_expander],
				tbar: new Ext.PagingToolbar({
					id:'service_search_map_paging',
					pageSize: 25,
					ds:Service_search_map_store
				
				})
				
			}]
		}]
	}];
function onServiceItemCheckProfile(item,checked){

Ext.get('info_service_metadata_profile').update(menu_mapSearchMetadata_Choose_Spec+':'+item.text);
}
	
function onServiceItemCheck(item, checked){
checked_Service_Catalog=item.id;
Ext.get('info_service_metadata_catalog').update(menu_mapSearchMetadata_Choose_Catalog+':<br>'+item.text);
}

function getBBox(val,a,b,ss)
{

	return;
}

function update_Servicesrch_grid()
{
	Ext.getCmp('service_search_grid_id').loadMask.show();
	
	var checked_service_csw_srv="";
	
	Ext.each(csw_store.data.items,function(item,data){
	
		if ("csw_service_Choice_"+item.get('url')==checked_Service_Catalog)
		{
			checked_service_csw_srv=item.get('url');
		}
	
	});
	
	
	Ext.getCmp('menu_service_Profile').items.each(function(item,data){
	
		if (item.checked)
		{
			checked_srv_profile=item.id;
			
			Ext.get('info_service_metadata_profile').update(menu_mapSearchMetadata_Choose_Spec+':'+item.text);
		}
		
	});
	
	
	
	if (checked_service_csw_srv!="")
	{

		var search_metadata_profile;
		
		switch(checked_srv_profile)
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
		
		Service_srch_store = new Ext.data.Store({
				url: encodeURI('php_source/proxies/metadata_tab_catalog_search.php?profile='+search_metadata_profile+'&word='+srch_Service_word+'&search_request_method=service&metadata_servers=['+checked_service_csw_srv+']'),
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
			

			Service_srch_store.load();
		
			Ext.getCmp('service_search_map_paging').bind(Service_srch_store);
			
			Ext.getCmp('service_search_grid_id').reconfigure(Service_srch_store,Service_search_map_columns);
		
	}
	
}
