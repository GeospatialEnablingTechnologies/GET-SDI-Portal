var metadata_settings_choose_service_checked_store= new Ext.data.ArrayStore({
	fields: [
		{name: '_serviceId'},
		{name: '_serviceTitle'},
		{name: '_serviceUrl'}
	]
});

 Ext.define('Metadata',{
     extend: 'Ext.data.Model',
     fields: [
        {name: 'title', type: 'string'},
        {name: 'abstract', type: 'string'},
        {name: 'fileIdentifier', type: 'string'},
        {name: 'icon', type: 'string'},
		{name: 'bbox', type: 'string'},
		{name: 'format', type: 'string'},
		{name: 'west', type: 'string'},
		{name: 'south', type: 'string'},
		{name: 'east', type: 'string'},
		{name: 'north', type: 'string'},
		{name: 'serverUrl', type: 'string'}
     ]
 });


var metadata_search_store=new Ext.data.Store({
    model: 'Metadata',
	autoDestroy:true,
	proxy:{
        type: "ajax",
        url: "",  
        reader: {
            type: 'json',
            root: 'rows',
			id:'fileIdentifier',
            totalProperty: "results"
        }
    }
});

var metadata_search_results_grid_var={
	xtype:'gridpanel',
	title:_metadata_search_results_grid_title,
	id:'metadata_search_results_grid',
	region:'center',
	columnLines:true,
	store:metadata_search_store,
	columns:[
		{header:'', dataIndex: "bbox", sortable: true,width:25,renderer:metadata_search_store_columns_zoomtoextent_renderer,hidable:false},
		{header:'', dataIndex: "fileIdentifier", sortable: true,width:25,renderer:metadata_search_store_columns_showinfo_renderer,hidable:false},
		{header: _metadata_results_lecture_service_type, dataIndex: "icon", sortable: true,width:60,renderer:metadata_search_store_columns_format_renderer},
		{header: _metadata_results_lecture_service_title, dataIndex: "title",width:800,flex:1},
		{header:'', dataIndex: "west", sortable: true,width:25,hidden:true,hidable:false},
		{header:'', dataIndex: "south", sortable: true,width:25,hidden:true,hidable:false},
		{header:'', dataIndex: "east", sortable: true,width:25,hidden:true,hidable:false},
		{header:'', dataIndex: "north", sortable: true,width:25,hidden:true,hidable:false},
		{header:'', dataIndex: "serverUrl", sortable: true,width:25,hidden:true,hidable:false},
		{header:'', dataIndex: "format", sortable: true,hidden:true,hidable:false}
	],
	tbar: new Ext.PagingToolbar({
		id:'metadata_search_metadata_paging',
		pageSize: 25,
		store:metadata_search_store			
	}),
	plugins: [{
		ptype: 'rowexpander',
		pluginId: 'rowexpanderMetadataService',
		rowBodyTpl : [
			'<p><b>'+_metadata_results_lecture_service_url+
			':</b><div style="width:90%;padding:10px">{serverUrl}</div><b>'+_metadata_results_lecture_service_type+
			':</b><div style="width:90%;padding:10px">{format}</div><b>'+_metadata_results_lecture_service_abstract+
			':</b><div style="width:90%;padding:10px">{abstract}</div></p>'
		]
	}]
};

function metadata_search_store_columns_zoomtoextent_renderer(value, metaData, record, row, col, store, gridView)
{
	var _extent=record.get("bbox");
	
	var img="<img src='images/zoomExtent.png' width='14' height='14' onclick=\"javascript:metadata_search_store_columns_zoomtoextent('"+_extent+"');\">";
	
	return img;
}

function metadata_search_store_columns_zoomtoextent(_extent)
{
	metadata_map_result_extent_layer.removeAllFeatures();

	_extent = new OpenLayers.Bounds.fromString(_extent);
	
	if (metadataMapGetCurrentProjection()!="EPSG:4326")
	{
		 _extent=_extent.transform(new OpenLayers.Projection("EPSG:4326"), metadataMapGetCurrentProjection());
	}
	
	metadataMapZoomToExtent(_extent);
	
	_extent=_extent.toGeometry();
	
	var _extent_feature = new OpenLayers.Feature.Vector(_extent, null); 
	
	metadata_map_result_extent_layer.addFeatures([_extent_feature]);
	
}

function metadata_search_store_columns_showinfo_renderer(value, metaData, record, row, col, store, gridView)
{
	var uuid=record.get('fileIdentifier');
	
	var url=record.get('serverUrl');
	
	var title=record.get('title');
	
	var img="<img src='images/layer_info.png' width='14' height='14' onclick=\"javascript:metadata_search_store_columns_showinfo('"+url+"','"+uuid+"','"+title+"');\">";

	return img;
}

function metadata_search_store_columns_format_renderer(value, metaData, record, row, col, store, gridView)
{
	var format=record.get("format");
	
	var icon=record.get("icon");
	
	var img="<img src='images/"+icon+"' width='50' height='16' alt='"+format+"'>";
	
	return img;
}

var metadata_info_window_var=new Ext.Window({ 
	width:740,
	height:500,
	title:_metadata_info_window_title,
	closeAction:'hide',
	activeItem: 0,
	id:'metadata_info_window',
	resizable:true,
	items:[
	{				
		xtype:'tabpanel',
		enableTabScroll:true,
		region:'center',
		id:'metadata_info_window_tabs',
		items:[]
	}]
});

function metadata_search_store_columns_showinfo(url,id,title)
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
				win.setHeight(Ext.getCmp("metadata_info_window").getHeight()-60);
				
				Ext.get("iframe_tab_"+url+id).setHeight(Ext.getCmp("metadata_info_window").getHeight()-60);
				
				Ext.getCmp("tab_"+url+id).doLayout();
			}
		},
		id:"tab_"+url+id,
		html:"<iframe width='100%' id='iframe_tab_"+url+id+"' frameborder='0' src='src/proxy/metadataGetRecordsById.php?lang="+language+"&recordId="+id+"&serviceUrl="+url+"'></iframe>"
	}];
			
	metadata_info_window_var.show();		
		
	Ext.getCmp('metadata_info_window_tabs').add(panels);
		
	Ext.getCmp('metadata_info_window_tabs').setActiveTab("tab_"+url+id);

	return;	
}


function fn_metadata_settings_choose_service_menu_handler(item,checked)
{
	if (checked)
	{
		if (metadata_settings_choose_service_checked_store.find("_serviceId",item._serviceId)==-1)
		{
			metadata_settings_choose_service_checked_store.add({
				_serviceId:item._serviceId,
				_serviceTitle:item.text,
				_serviceUrl:item._serviceUrl
			});
			
			metadata_settings_choose_service_checked_store.commitChanges();
		}
	}
	else
	{
		var tobeDeletedIndex=metadata_settings_choose_service_checked_store.find("_serviceId",item._serviceId);
		
		if (tobeDeletedIndex!=-1)
		{
			var  toBeDeleted=metadata_settings_choose_service_checked_store.getAt(tobeDeletedIndex);
	
			metadata_settings_choose_service_checked_store.remove(toBeDeleted);
	
			metadata_settings_choose_service_checked_store.commitChanges();
		}	
	}
}

var metadata_search_map_search_area="";

function metadata_search_form_title_where_radio_onchange()
{
	metadata_map.updateSize();

	var _value=Ext.getCmp("metadata_search_where_group").getChecked()[0].inputValue;
	
	metadata_map_search_layer_control.deactivate();
	
	metadata_map_search_layer.destroyFeatures();

	metadata_map.events.unregister('moveend', metadata_map, metadata_search_get_map_search_area);

	switch(_value)
	{
		case "1":
			metadata_search_map_search_area="";			
		break;
		
		case "2":
			metadata_map_search_layer_control.activate();
		break;
		
		case "3":
			metadata_map.events.register('moveend', metadata_map, metadata_search_get_map_search_area);
		break;
	}
	
}

function metadata_search_get_map_search_area(evt)
{

	if(typeof evt.geometry!=="undefined")
	{
		metadata_search_map_search_area=evt.geometry.getBounds();
	}else
	{
		metadata_search_map_search_area=metadataMapGetExtent();
	}

	if (metadataMapGetCurrentProjection()!="EPSG:4326")
	{
		metadata_search_map_search_area.transform(new OpenLayers.Projection(metadataMapGetCurrentProjection()), new OpenLayers.Projection("EPSG:4326"));
	}
	
	metadata_search_map_search_area=metadata_search_map_search_area.toString();
	
	if (Ext.getCmp("metadata_search_where_group").getChecked()[0].inputValue=="3")
	{
		metadata_search();
	}
}


function metadata_search()
{
	var _format=1;
	
	var _servers=[];
	
	metadata_settings_choose_service_checked_store.each(function(item)
	{
		_servers.push(item.get("_serviceUrl"));
	});
	
	Ext.getCmp('metadata_settings_choose_format_list').items.each(function(item,data)
	{
		if (item.checked)
		{
			_format=item._format;
		}
	});
	
	metadata_search_store.getProxy().url='src/proxy/metadataSearch.php?profile='+_format+'&search_request_method=advance&metadata_servers=['+_servers.join(',')+']'+metadata_create_search_criteria();
	
	metadata_search_store.load();
	
	Ext.getCmp("metadatatab_south").expand();
	
}

function metadata_create_search_criteria()
{

	var dateFrom=Ext.getCmp('metadata_search_form_adv_from_id').getValue();
	
	var dateTo=Ext.getCmp('metadata_search_form_adv_to_id').getValue();
	
	if ((dateFrom!="")&&(dateFrom!=null)){dateFrom=dateFrom.format('Y-m-d');}else{dateFrom="";}
	
	if ((dateTo!="")&&(dateTo!=null)){dateTo=dateTo.format('Y-m-d');}else{dateTo="";}
	
	var url="&title="+encodeURI(Ext.getCmp('metadata_search_form_adv_title_id').getValue())+
		"&abstract=" + Ext.getCmp('metadata_search_form_adv_abstract_id').getValue() +
		"&resourceidentifier=" + Ext.getCmp('metadata_search_form_adv_resource_identifier_id').getValue() +
		"&type=" + Ext.getCmp('metadata_search_form_adv_service_type_id').getValue() +
		"&keyword=" + Ext.getCmp('metadata_search_form_adv_keyword_id').getValue() +
		"&topiccategory=" + Ext.getCmp('metadata_search_form_adv_topic_category_id').getValue() +
		"&from=" + dateFrom +
		"&to=" + dateTo +
		"&calendartype=" + Ext.getCmp('metadata_search_calendar_type_id').getValue() +
		"&organisationname="+ Ext.getCmp('metadata_search_form_adv_responsible_party_id').getValue() +
		"&responsiblepartyrole="+ Ext.getCmp('metadata_search_form_adv_responsible_party_role_id').getValue() +
		"&conditionapplyingtoaccessanduse="+ Ext.getCmp('metadata_search_form_adv_access_and_use_id').getValue() +
		"&accessconstraints="+ Ext.getCmp('metadata_search_form_adv_limitation_on_public_access_id').getValue() +
		"&lineage="+ Ext.getCmp('metadata_search_form_adv_lineage_id').getValue() +
		"&specificationtitle="+ Ext.getCmp('metadata_search_form_adv_specification_id').getValue() +
		"&denominator="+ Ext.getCmp('metadata_search_form_adv_scale_id').getValue() +
		"&distancevalue="+ Ext.getCmp('metadata_search_form_adv_distance_id').getValue() +
		"&distanceuom="+ Ext.getCmp('metadata_search_form_adv_unit_id').getValue() +
		"&degree="+ Ext.getCmp('metadata_search_form_adv_degree_id').getValue() +
		"&bbox=" + metadata_search_map_search_area +
		"&tight=false";

	url=url.replace(/=null/g,"=");
		
	return url;
}


var metadatatab_west_form_panel={
	xtype:'panel',
	region:'center',
	title:_metadatatab_west_form,
	iconCls:'maptab_accordion_icon',
	autoScroll:true,
	bbar:['->',
	
		{
			xtype:'button',
			text:_metadata_clear_btn,
			handler:function()
			{
				metadata_map_result_extent_layer.removeAllFeatures();
			
				Ext.getCmp("metadatatab_west_form_panel_id").getForm().reset();
			}
		},
		{
			xtype:'button',
			text:_metadata_search_btn,
			handler:metadata_search
		}
	],
	tbar:[
		{
			xtype: 'button',
			id:'metadatatab_west_panel_add_btn',
			iconCls:'map_general_add_btn',
			text:_map_general_add_btn,
			handler:function()
			{
				maptab_services_manager.show();
			}
		},
		{
			xtype:'button',
			iconCls:'map_general_settings_btn',
			text:_map_general_settings_btn,
			menu:{
				items:[
					{
						text:_metadata_settings_choose_service,
						id:'metadata_settings_choose_service',
						hideOnClick:false,
						menu:{
							items:[],
							hideOnClick:false
						}
					},
					{
						text:_metadata_settings_choose_format,
						id:'metadata_settings_choose_format',
						hideOnClick:false,
						menu:{
							id:'metadata_settings_choose_format_list',
							items:[
								{
									text:_metadata_settings_choose_format_inspire,
									id:'metadata_settings_choose_format_inspire',
									group:'metadata_settings_choose_format_group',
									_format:1,
									checked:true,
									hideOnClick:false
								},
								{
									text:_metadata_settings_choose_format_csw_iso_ap,
									id:'metadata_settings_choose_format_csw_iso_ap',
									group:'metadata_settings_choose_format_group',
									_format:2,
									checked:false,
									hideOnClick:false
								},
								{
									text:_metadata_settings_choose_format_dc,
									id:'metadata_settings_choose_format_dc',
									group:'metadata_settings_choose_format_group',
									_format:3,
									checked:false,
									hideOnClick:false
								}
							]
						}
					}
				]
			},
			handler:function()
			{
				Ext.getCmp('metadata_settings_choose_service').menu.removeAll();
						
				csw_StoreColumnsService.store.each(function(item)
				{
					var checked=false;
					
					
					if(metadata_settings_choose_service_checked_store.find("_serviceId",item.get("_serviceObject")._serviceId)!=-1)
					{
						checked=true;
					}
					else
					{
						checked=false;
					}
					
					if (item.get('_serviceTitle')!="")
					{
						Ext.getCmp('metadata_settings_choose_service').menu.add({
							text:item.get('_serviceTitle'),
							_serviceId:item.get("_serviceObject")._serviceId,
							_serviceUrl:item.get('_serviceUrl'),
							checked: checked,
							checkHandler: fn_metadata_settings_choose_service_menu_handler,
							hideOnClick:false
						});
					}
				});
			}
		}
	],
	items:[{
			xtype:'form',
			anchor:'95%',
			id:'metadatatab_west_form_panel_id',
			items:[
	
				{
						xtype:'panel',
						html:"<div id='info_metadata_catalog_metadata_tab' class='info_search_div'></div><div id='info_metadata_profile_metadata_tab' class='info_search_div'></div>"
				},
				{	
					xtype: 'fieldset',
					title: _metadata_search_form_title_what,
					autoHeight: true,
					anchor:'100%',
					margin:10,
					items:[
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_title_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_title
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_abstract_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_abstract
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_resource_identifier_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_Resource_Identifier
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_keyword_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_Keyword
					},
					{
						xtype:'combo',
						anchor:'95%',
						id:'metadata_search_form_adv_topic_category_id',
						fieldLabel:_metadata_search_form_adv_topic_category,
						emptyText: _metadata_search_form_adv_topic_category_all,
						value:"",
						hiddenName: 'ddi_resolution',
						width:220,
						store: new Ext.data.SimpleStore({
							fields: ['name','value'],
							data: [
								[_metadata_search_form_adv_topic_category_all,""],
								[_metadata_search_form_adv_topic_category_imageryBaseMapsEarthCover,"imageryBaseMapsEarthCover"],
								[_metadata_search_form_adv_topic_category_biota,"biota"],
								[_metadata_search_form_adv_topic_category_environment,"environment"],
								[_metadata_search_form_adv_topic_category_farming,"farming"],
								[_metadata_search_form_adv_topic_category_boundaries, "boundaries"],
								[_metadata_search_form_adv_topic_category_climatologyMeteorologyAtmosphere,"climatologyMeteorologyAtmosphere"],
								[_metadata_search_form_adv_topic_category_economy, "economy"], 
								[_metadata_search_form_adv_topic_category_elevation, "elevation"], 
								[_metadata_search_form_adv_topic_category_geoscientificInformation, "geoscientificInformation"],
								[_metadata_search_form_adv_topic_category_intelligenceMilitary, "intelligenceMilitary"],
								[_metadata_search_form_adv_topic_category_health, "health"],
								[_metadata_search_form_adv_topic_category_inlandWaters, "inlandWaters"], 
								[_metadata_search_form_adv_topic_category_location, "location"],
								[_metadata_search_form_adv_topic_category_oceans, "oceans"],  
								[_metadata_search_form_adv_topic_category_planningCadastre, "planningCadastre"],
								[_metadata_search_form_adv_topic_category_society,"society"],
								[_metadata_search_form_adv_topic_category_structure, "structure"],
								[_metadata_search_form_adv_topic_category_transportation, "transportation"],
								[_metadata_search_form_adv_topic_category_utilitiesCommunication, "utilitiesCommunication"]
							]
						}), 
						displayField: 'name',
						valueField: 'value',
						forceSelection: true,
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: false
					}]
				},
				{	
					xtype: 'fieldset',
					title: _metadata_search_form_title_where,
					autoHeight: true,
					anchor:'100%',
					margin:10,
					items:[
						{
							xtype:'radiogroup',
							autoHeight: true,
							vertical: true,
							id:'metadata_search_where_group',
							columns: 1,
							anchor:'80%',
							margin:10,
							listeners:{
								change:metadata_search_form_title_where_radio_onchange
							},
							items:[
								{
									anchor:'95%',
									boxLabel:_metadata_search_form_title_where_everywhere,
									name: 'metadata_search_where',
									inputValue:'1',
									checked:true
									
								},
								{
									anchor:'95%',
									boxLabel:_metadata_search_form_title_where_draw,
									name: 'metadata_search_where',
									inputValue:'2'
								},
								{
									anchor:'95%',
									boxLabel:_metadata_search_form_title_where_map_interaction,
									name: 'metadata_search_where',
									inputValue:'3'
								}
							]
						}
					]
				},
				{	
					xtype: 'fieldset',
					title: _metadata_search_form_title_when,
					autoHeight: true,
					anchor:'100%',
					margin:10,
					items:[{
						xtype:'datefield',
						anchor:'95%',
						id:'metadata_search_form_adv_from_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_From
					},
					{
						xtype:'datefield',
						anchor:'95%',
						id:'metadata_search_form_adv_to_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_To
					},	
					{
						xtype:'combo',
						anchor:'95%',
						id:'metadata_search_calendar_type_id',
						fieldLabel:_metadata_search_form_title_calendar_type,
						emptyText: _metadata_search_calendar_type_all,
						width:220,
						value:"",
						store: new Ext.data.SimpleStore({
						fields: ['name','value'],
							data: [
								[_metadata_search_calendar_type_tempExtentDate,"tempExtentDate"],
								[_metadata_search_calendar_type_creationDate,"creationDate"],
								[_metadata_search_calendar_type_revisionDate,"revisionDate"],
								[_metadata_search_calendar_type_publicationDate,"publicationDate"]
							]
						}), 
						displayField: 'name',
						valueField: 'value',
						forceSelection: true,
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: false
					}]
				},
				{	
					xtype: 'fieldset',
					title: _metadata_search_form_title_type,
					autoHeight: true,
					anchor:'100%',
					margin:10,
					items:[
					{
						xtype:'combo',
						anchor:'95%',
						id:'metadata_search_form_adv_service_type_id',
						fieldLabel:_metadata_search_form_adv_Service_Type,
						emptyText: _metadata_search_form_adv_service_type_all,
						multiselect:true,
						value:"",
						hiddenName: 'service_type',
						width:220,
						store: new Ext.data.SimpleStore({
							fields: ['name','value'],
							data: [
								[_metadata_search_form_adv_service_type_all,""],
								[_metadata_search_form_adv_service_type_dataset,"dataset"],
								[_metadata_search_form_adv_service_type_series,"series"],
								[_metadata_search_form_adv_service_type_service,"service"]
								]
							}), 
						displayField: 'name',
						valueField: 'value',
						forceSelection: true,
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: false
					}]
				},
				{
					xtype: 'fieldset',
					title: _metadata_search_form_title_adv,
					autoHeight: true,
					anchor:'100%',
					margin:10,
					items:[
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_responsible_party_id',
						value:"",
						width:220,
						fieldLabel:_metadata_search_form_adv_Responsible_Party
					},
					{
						xtype:'combo',
						anchor:'95%',
						id:'metadata_search_form_adv_responsible_party_role_id',
						value:"",
						fieldLabel:_metadata_search_form_adv_Responsible_Party_Role,
						emptyText: _metadata_search_form_adv_responsible_party_role_all,
						width:220,
						store: new Ext.data.SimpleStore({
						fields: ['name','value'],
							data: [
								[_metadata_search_form_adv_responsible_party_role_all,"All"],
								[_metadata_search_form_adv_responsible_party_role_author,"author"],
								[_metadata_search_form_adv_responsible_party_role_custodian,"custodian"],
								[_metadata_search_form_adv_responsible_party_role_distributor,"distributor"],
								[_metadata_search_form_adv_responsible_party_role_notdefined,"notdefined"],
								[_metadata_search_form_adv_responsible_party_role_originator,"originator"],
								[_metadata_search_form_adv_responsible_party_role_owner,"owner"],
								[_metadata_search_form_adv_responsible_party_role_pointOfContact,"pointOfContact"],
								[_metadata_search_form_adv_responsible_party_role_principalInvestigator,"principalInvestigator"],
								[_metadata_search_form_adv_responsible_party_role_processor,"processor"],
								[_metadata_search_form_adv_responsible_party_role_publisher,"publisher"],
								[_metadata_search_form_adv_responsible_party_role_resourceProvider,"resourceProvider"],
								[_metadata_search_form_adv_responsible_party_role_user,"user"]
							]
						}), 
						displayField: 'name',
						valueField: 'value',
						forceSelection: true,
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: false
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_access_and_use_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_Access_and_Use
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_limitation_on_public_access_id',
						width:220,
						value:"",
						fieldLabel:_metadata_search_form_adv_Limitation_on_Public_Access
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_lineage_id',
						value:"",
						width:220,
						fieldLabel:_metadata_search_form_adv_Lineage
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_specification_id',
						value:"",
						width:220,
						fieldLabel:_metadata_search_form_adv_Specification
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_scale_id',
						value:"",
						width:220,
						fieldLabel:_metadata_search_form_adv_Scale
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_distance_id',
						value:"",
						width:220,
						fieldLabel:_metadata_search_form_adv_Distance
					},
					{
						xtype:'textfield',
						anchor:'95%',
						id:'metadata_search_form_adv_unit_id',
						value:"",
						width:220,
						fieldLabel:_metadata_search_form_adv_Unit
					},
					{
						xtype:'combo',
						anchor:'95%',
						id:'metadata_search_form_adv_degree_id',
						value:"",
						width:220,
						fieldLabel:_metadata_search_form_adv_Degree,
						emptyText: _metadata_search_form_adv_degree_all,
						store: new Ext.data.SimpleStore({
						fields: ['name','value'],
							data: [
								[_metadata_search_form_adv_degree_Not_evaluated,"Not evaluated"],
								[_metadata_search_form_adv_degree_Conformant,"true"],
								[_metadata_search_form_adv_degree_Not_Conformant,"false"]
							]
						}), 
						displayField: 'name',
						valueField: 'value',
						forceSelection: true,
						triggerAction: 'all',
						selectOnFocus: false,
						mode: 'local',
						editable: false
					}]
				}
			]
		}
		
	]
}

