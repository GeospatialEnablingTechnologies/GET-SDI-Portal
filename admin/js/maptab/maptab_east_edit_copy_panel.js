var maptab_east_edit_copy_panel_grid_columns=[
	{_attributeName:"_featureId",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_layerId",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_featureGeomFormat",_attributeSortable:true,_attributeType:"string",_attributeTranslation:"",hidden:true,hideable:false},
	{_attributeName:"_summary",_attributeSortable:true,_attributeType:"string",_attributeTranslation:_feature_Attributes_Translations_Summary,flex:3},
	{_attributeName:"_theFeature",hidden:true,_attributeType:"object"}
];

var maptab_east_edit_copy_panel_grid_store=fn_createAttributesStore(fn_featureColumnModelForGrid(maptab_east_edit_copy_panel_grid_columns));

maptab_east_edit_copy_panel_grid_store.group("_layerId");

var maptab_east_edit_copy_panel_grid=new Ext.grid.Panel({
	border:true,
	columnLines:true,
	split: true,
	selModel: Ext.create('Ext.selection.CheckboxModel',{mode:'SIMPLE',checkOnly:true}),
	store:maptab_east_edit_copy_panel_grid_store,
	columns:fn_createAttributesColumnModel(fn_featureColumnModelForGrid(maptab_east_edit_copy_panel_grid_columns)),
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

var maptab_east_edit_copy_panel ={
	xtype:'panel',
	id:'maptab_east_edit_copy_panel',
	title:_maptab_east_edit_copy_panel,
	region:'center',
	autoScroll:true,
	iconCls:'maptab_accordion_icon',
	layout:'fit',
	items:[maptab_east_edit_copy_panel_grid],
	tbar:[
	{
		xtype:'button',
		tooltip:_maptab_east_edit_copy_panel_remove_btn,
		iconCls:'map_general_remove_btn',
		handler:function()
		{
			var _selected=maptab_east_edit_copy_panel_grid.getSelectionModel().getSelection();
				
			Ext.each(_selected,function(item)
			{
				Ext.each(fn_grid_results_ids_array,function(_grid)
				{
					var _r=Ext.getCmp(_grid).getStore().findRecord('_featureId', item.get("_featureId"));
							
					if (mapGetFeatureByFid(map_highlightLayer.id,item.get("_featureId")))
					{
						Ext.getCmp(_grid).getSelectionModel().deselect(_r,true);
					}

				});
			});
			
			maptab_east_edit_copy_panel_grid.getStore().remove(_selected);
		}
	},
	{
		xtype:'button',
		tooltip:_maptab_east_edit_copy_panel_paste_btn,
		iconCls:'maptab_toolbar_edit_paste',
		handler:function()
		{
			fn_maptab_toolbar_edit_paste();
			
		}
	}]
}

function maptab_east_edit_copy_panel_grid_remove_record(_featureId,_layerId)
{
	var _r=maptab_east_edit_copy_panel_grid.getStore().findRecord('_featureId', _featureId);
	
	if(_r)
	{
		maptab_east_edit_copy_panel_grid.getStore().remove(_r);
	}
}

function maptab_east_edit_copy_panel_grid_add_record(_featureId,_layerId,_featureUrl,_featureGeomFormat,_theFeature)
{
	var _data=new Array();
	
	var _att=clone(mapGetFeatureByFid(_layerId,_featureId).attributes);
	
	_att._layerId=_layerId;
		
	_att._featureId=_featureId;
		
	_att._srsName=mapFindLayerById(_layerId)._layerObject._nativeSRS;
		
	_att._featureUrl=_featureUrl;
		
	_att._featureGeomFormat=_featureGeomFormat;
	
	_att._theFeature=_theFeature;
	
	var _record=fn_createAttributeSummary(_att,mapFindLayerById(_layerId)._layerObject._attributesFields);
			
	_data.push(_record);
	
	maptab_east_edit_copy_panel_grid.getStore().loadData(_data,true);
}