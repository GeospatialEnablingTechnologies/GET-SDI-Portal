var maptab_west_selection_panel_grid_columns=[		
	{_attributeName:"_featureId",_attributeSortable:false,_attributeType:"string",_attributeTranslation:"",	width:28,hideable:false,renderer:fn_featureShowOnMapRenderer},
	{_attributeName:"_featureId",_attributeSortable:false,_attributeType:"string",_attributeTranslation:"",	width:28,hideable:false,renderer:fn_featureInfoWindowRenderer},
	{_attributeName:"_featureId",_attributeSortable:false,_attributeType:"string",_attributeTranslation:"",	width:28,hideable:false,renderer:fn_featureDownloadRenderer},
	{_attributeName:"_featureUrl",_attributeSortable:false,_attributeType:"string",_attributeTranslation:"",hideable:false,hidden:true},
	{_attributeName:"_srsName",	_attributeSortable:false,_attributeType:"string",_attributeTranslation:"",hideable:false,hidden:true},
	{_attributeName:"_featureId",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_feature",_attributeSortable:true,_attributeType:"object",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_layerId",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_featureGeomFormat",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_summary",_attributeSortable:true,_attributeType:"string",_attributeTranslation:_feature_Attributes_Translations_Summary,flex:3}
];



var maptab_west_selection_panel_grid_store=fn_createAttributesStore(maptab_west_selection_panel_grid_columns);

maptab_west_selection_panel_grid_store.group("_layerId");

var maptab_west_selection_panel_grid=new Ext.grid.Panel({
	border:true,
	columnLines:true,
	split: true,
	selModel: Ext.create('Ext.selection.CheckboxModel',{mode:'SIMPLE',checkOnly:true}),
	store:maptab_west_selection_panel_grid_store,
	columns:fn_createAttributesColumnModel(maptab_west_selection_panel_grid_columns),
	features: [{
		ftype: 'grouping',
		groupHeaderTpl: [
			'{name:this.formatName}',
			{
				formatName: function(name) {
					return mapFindLayerById(name)._layerObject._layerTitle + " ("+mapFindLayerById(name)._serviceObject._serviceType+")";
				}
			}
		]
    }]
});

var maptab_west_selection_panel ={
	xtype:'panel',
	id:'maptab_west_selection_panel',
	title:_maptab_west_selection_panel,
	region:'center',
	autoScroll:true,
	iconCls:'maptab_accordion_icon',
	layout:'fit',
	items:[maptab_west_selection_panel_grid],
	tbar:['->',
	{
		xtype:'button',
		tooltip:_maptab_west_selection_panel_remove_btn,
		iconCls:'map_general_remove_btn',
		handler:function()
		{
			var _selected=maptab_west_selection_panel_grid.getSelectionModel().getSelection();
				
			maptab_west_selection_panel_grid.getStore().remove(_selected);
			
			var _count=maptab_west_selection_panel_grid.getStore().getCount();
	
			Ext.getCmp("maptab_west_selection_panel").setTitle(_maptab_west_selection_panel+"("+_count+")");
		}
	}]
}


function maptab_west_selection_panel_grid_add_record(_featureId,_layerId,_featureUrl,_srsName,_featureGeomFormat)
{
	var _data=new Array();
	
	var _feature={
		_featureId:_featureId,
		_layerId:_layerId,
		_srsName:_srsName,
		_featureUrl:_featureUrl,
		_featureGeomFormat:_featureGeomFormat,
		_featureAttributes:""
	};
	
	var feature=fn_fetchGML(_feature);
	
	var _att=clone(feature.attributes);
	
	_att._layerId=_layerId;
		
	_att._featureId=_featureId;
		
	_att._srsName=mapFindLayerById(_layerId)._layerObject._nativeSRS;
		
	_att._featureUrl=_featureUrl;
	
	_att._feature=feature.clone();
		
	_att._featureGeomFormat=_featureGeomFormat;
	
	var _record=fn_createAttributeSummary(_att,mapFindLayerById(_layerId)._layerObject._attributesFields);
			
	_data.push(_record);
	
	maptab_west_selection_panel_grid.getStore().loadData(_data,true);
	
	var _count=maptab_west_selection_panel_grid.getStore().getCount();
	
	Ext.getCmp("maptab_west_selection_panel").setTitle(_maptab_west_selection_panel+"("+_count+")");
}