/*version message*/

var metadata_search_metadata_simple=[
{
		xtype:'panel',
		layout:'fit',
		html:"<div id='info_metadata_catalog_metadata_tab'  class='info_search_div'></div><div id='info_metadata_profile_metadata_tab' class='info_search_div'></div>"
},
{	
	xtype: 'fieldset',
	title: metadata_search_form_title_what,
	autoHeight: true,
	anchor:'80%',
	margin:10,
	items:[
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_title_id',
		width:220,
		fieldLabel:metadata_search_form_adv_title
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_abstract_id',
		width:220,
		fieldLabel:metadata_search_form_adv_abstract
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Resource_Identifier_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Resource_Identifier
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Keyword_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Keyword
	},
	{
		xtype:'combo',
		anchor:'95%',
		id:'metadata_search_form_adv_Topic_Category_id',
		fieldLabel:metadata_search_form_adv_Topic_Category,
		emptyText: metadata_search_form_adv_Topic_Category_all,
		hiddenName: 'ddi_resolution',
		width:220,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [[metadata_search_form_adv_Topic_Category_all,""],[metadata_search_form_adv_Topic_Category_imageryBaseMapsEarthCover,"imageryBaseMapsEarthCover"],[metadata_search_form_adv_Topic_Category_biota,"biota"],[metadata_search_form_adv_Topic_Category_environment,"environment"],[metadata_search_form_adv_Topic_Category_farming,"farming"],[metadata_search_form_adv_Topic_Category_boundaries, "boundaries"],[metadata_search_form_adv_Topic_Category_climatologyMeteorologyAtmosphere,"climatologyMeteorologyAtmosphere"],[metadata_search_form_adv_Topic_Category_economy, "economy"], [metadata_search_form_adv_Topic_Category_elevation, "elevation"], [metadata_search_form_adv_Topic_Category_geoscientificInformation, "geoscientificInformation"],[metadata_search_form_adv_Topic_Category_intelligenceMilitary, "intelligenceMilitary"],[metadata_search_form_adv_Topic_Category_health, "health"],[metadata_search_form_adv_Topic_Category_inlandWaters, "inlandWaters"], [metadata_search_form_adv_Topic_Category_location, "location"],[metadata_search_form_adv_Topic_Category_oceans, "oceans"],  [metadata_search_form_adv_Topic_Category_planningCadastre, "planningCadastre"],[metadata_search_form_adv_Topic_Category_society,"society"],[metadata_search_form_adv_Topic_Category_structure, "structure"],[metadata_search_form_adv_Topic_Category_transportation, "transportation"],[metadata_search_form_adv_Topic_Category_utilitiesCommunication, "utilitiesCommunication"]]
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
	title: metadata_search_form_title_where,
	autoHeight: true,
	anchor:'80%',
	margin:10,
	items:[
		{
			xtype:'radiogroup',
			autoHeight: true,
			vertical: true,
			id:'where_radio_id',
			itemCls: 'x-check-group-alt',
			columns: 1,
			anchor:'80%',
			margin:10,
			listeners:{
			change:function(radiogroup,radio)
						{

							radioWhereBtnHandler(radio.inputValue);
						}
			},
			items:[
					{
						anchor:'95%',
						boxLabel:metadata_search_form_title_where_everywhere,
						name: 'metadata_search_where',
						inputValue:'1',
						checked:true
						
					},
					{
						anchor:'95%',
						boxLabel:metadata_search_form_title_where_draw,
						name: 'metadata_search_where',
						inputValue:'2'
					},
					{
						anchor:'95%',
						boxLabel:metadata_search_form_title_where_map_interaction,
						name: 'metadata_search_where',
						inputValue:'3'
					}]
		}
	]
},
{	
	xtype: 'fieldset',
	title: metadata_search_form_title_when,
	autoHeight: true,
	anchor:'80%',
	margin:10,
	items:[{
		xtype:'datefield',
		anchor:'95%',
		id:'metadata_search_form_adv_From_id',
		width:220,
		fieldLabel:metadata_search_form_adv_From
	},
	{
		xtype:'datefield',
		anchor:'95%',
		id:'metadata_search_form_adv_To_id',
		width:220,
		fieldLabel:metadata_search_form_adv_To
	},	
	{
		xtype:'combo',
		anchor:'95%',
		id:'metadata_search_calendar_type_id',
		fieldLabel:metadata_search_form_title_Calendar_Type,
		emptyText: metadata_search_calendar_type_all,
		width:220,
		store: new Ext.data.SimpleStore({
		fields: ['name','value'],
			data: [[metadata_search_calendar_type_tempExtentDate,"tempExtentDate"],[metadata_search_calendar_type_creationDate,"creationDate"],[metadata_search_calendar_type_revisionDate,"revisionDate"],[metadata_search_calendar_type_publicationDate,"publicationDate"]]
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
	title: metadata_search_form_title_type,
	autoHeight: true,
	anchor:'80%',
	margin:10,
	items:[
	{
		xtype:'combo',
		anchor:'95%',
		id:'metadata_search_form_adv_Service_Type_id',
		fieldLabel:metadata_search_form_adv_Service_Type,
		emptyText: metadata_search_form_adv_Service_Type_all,
		multiselect:true,
		hiddenName: 'service_type',
		width:220,
		store: new Ext.data.SimpleStore({
			fields: ['name','value'],
			data: [[metadata_search_form_adv_Service_Type_all,"all"],[metadata_search_form_adv_Service_Type_dataset,"dataset"],[metadata_search_form_adv_Service_Type_series,"series"],[metadata_search_form_adv_Service_Type_service,"service"]]
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
	title: metadata_search_form_title_adv,
	autoHeight: true,
	anchor:'80%',
	checkboxToggle:true,
	items:[
	
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Responsible_Party_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Responsible_Party
	},
	{
		xtype:'combo',
		anchor:'95%',
		id:'metadata_search_form_adv_Responsible_Party_Role_id',
		fieldLabel:metadata_search_form_adv_Responsible_Party_Role,
		emptyText: metadata_search_form_adv_Responsible_Party_Role_all,
		width:220,
		store: new Ext.data.SimpleStore({
		fields: ['name','value'],
			data: [[metadata_search_form_adv_Responsible_Party_Role_all,"All"],[metadata_search_form_adv_Responsible_Party_Role_author,"author"],[metadata_search_form_adv_Responsible_Party_Role_custodian,"custodian"],[metadata_search_form_adv_Responsible_Party_Role_distributor,"distributor"],[metadata_search_form_adv_Responsible_Party_Role_notdefined,"notdefined"],[metadata_search_form_adv_Responsible_Party_Role_originator,"originator"],[metadata_search_form_adv_Responsible_Party_Role_owner,"owner"],[metadata_search_form_adv_Responsible_Party_Role_pointOfContact,"pointOfContact"],[metadata_search_form_adv_Responsible_Party_Role_principalInvestigator,"principalInvestigator"],[metadata_search_form_adv_Responsible_Party_Role_processor,"processor"],[metadata_search_form_adv_Responsible_Party_Role_publisher,"publisher"],[metadata_search_form_adv_Responsible_Party_Role_resourceProvider,"resourceProvider"],[metadata_search_form_adv_Responsible_Party_Role_user,"user"]]
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
		id:'metadata_search_form_adv_Access_and_Use_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Access_and_Use
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Limitation_on_Public_Access_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Limitation_on_Public_Access
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Lineage_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Lineage
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Specification_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Specification
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Scale_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Scale
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Distance_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Distance
	},
	{
		xtype:'textfield',
		anchor:'95%',
		id:'metadata_search_form_adv_Unit_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Unit
	},
	{
		xtype:'combo',
		anchor:'95%',
		id:'metadata_search_form_adv_Degree_id',
		width:220,
		fieldLabel:metadata_search_form_adv_Degree,
		emptyText: metadata_search_form_adv_Degree_all,
		store: new Ext.data.SimpleStore({
		fields: ['name','value'],
			data: [[metadata_search_form_adv_Degree_Not_evaluated,"Not evaluated"],[metadata_search_form_adv_Degree_Conformant,"true"],[metadata_search_form_adv_Degree_Not_Conformant,"false"]]
		}), 
		displayField: 'name',
		valueField: 'value',
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		mode: 'local',
		editable: false
	}]
}];

