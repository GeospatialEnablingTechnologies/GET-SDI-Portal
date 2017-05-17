function init_maptab_toolbar_edit_choose_layer_store_populate()
{
	
	mapOnRemoveLayer(maptab_toolbar_edit_choose_layer_store_populate);
	
	mapOnAddLayer(maptab_toolbar_edit_choose_layer_store_populate);
}

var maptab_toolbar_edit_choose_layer_store=Ext.create('Ext.data.Store', {
	fields: ['_layerTitle', '_layerId','_layerLegend'],
	data: []
});

var maptab_toolbar_edit =[
	{
		xtype:'combobox',
		id:'maptab_toolbar_edit_choose_layer',
		store: maptab_toolbar_edit_choose_layer_store,
		emptyText: _maptab_toolbar_edit_choose_layer,
		width:300,
		editable:false,
        queryMode: 'local',
        displayField: '_layerTitle',
        valueField: '_layerId',
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		listConfig: {
			getInnerTpl: function() {
				
				var tpl = '<img src="{_layerLegend}" align="left" width="20px" height="20px">{_layerTitle}';
				
				return tpl;
			}
		},
		listeners:{
			select:function(combo, record, eOpts)
			{
				
				Ext.getCmp("maptab_toolbar_edit_point").toggle(false);
				Ext.getCmp("maptab_toolbar_edit_line").toggle(false);
				Ext.getCmp("maptab_toolbar_edit_polygon").toggle(false);
				
				if (combo.getValue()!="")
				{
					fn_maptab_toolbar_edit_refresh();
				
					Ext.getCmp("maptab_toolbar_edit_unselect").toggle(true);
					
					Ext.getCmp("maptab_toolbar_edit_unselect").toggle(false);
					
					maptab_edit_controls_init();
					
				}
				else
				{
					combo.setRawValue('');
					
					maptab_edit_selectedFeatures=[];
					
					maptab_edit_initialize();
					
					if (maptab_edit_layer){
						maptab_edit_layer._layerObject._isEdited=false;
					}
				}
				
				maptab_toolbar_edit_activate_btns();
			},
			blur:function(combo, record, eOpts)
			{
				
				if (combo.getValue()=="")
				{
					combo.setRawValue('');
				}
			}
		}
	},
	{xtype:'tbseparator'},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_select_by_point',
		iconCls:'maptab_toolbar_edit_select_by_point',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_edit_select_by_point,
		toggleHandler:function(item,state){
		
			fn_toggleControl('selectfeaturebypoint',state,maptab_edit_controls);
			
			if (state)
			{
				maptab_edit_onselect_mode=true;
				
				maptab_edit_selectedFeatures=[];
			}
			
		}
	},{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_select_by_box',
		iconCls:'maptab_toolbar_edit_select_by_box',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_edit_select_by_box,
		toggleHandler:function(item,state){
			
			fn_toggleControl('selectfeaturebybox',state,maptab_edit_controls);
			
			if (state)
			{
				maptab_edit_onselect_mode=true;
				
				maptab_edit_selectedFeatures=[];
			}
			
		}
	},
	,{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_unselect',
		iconCls:'maptab_toolbar_edit_unselect',
		enableToggle: false,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_edit_unselect,
		toggleHandler:function(item,state)
		{
			
			if (state)
			{
				maptab_edit_unselect_features();
			}
			
		}
	},
	{xtype:'tbseparator'},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_point',
		iconCls:'maptab_toolbar_edit_point',
		tooltip:_maptab_toolbar_edit_point,
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		toggleHandler:function(item,state){
			fn_toggleControl('drawpoint',state,maptab_edit_controls);
			
			if (state)
			{
				maptab_edit_undo_redo_drawing_control=maptab_edit_controls["drawpoint"];
			}else
			{
				maptab_edit_undo_redo_drawing_control="";
			}
			
			fn_maptab_edit_undo_redo_drawing_control(state);
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_line',
		iconCls:'maptab_toolbar_edit_line',
		tooltip:_maptab_toolbar_edit_line,
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		toggleHandler:function(item,state){
			fn_toggleControl('drawline',state,maptab_edit_controls);
			
			if (state)
			{
				maptab_edit_undo_redo_drawing_control=maptab_edit_controls["drawline"];
			}else
			{
				maptab_edit_undo_redo_drawing_control="";
			}
			
			fn_maptab_edit_undo_redo_drawing_control(state);
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_polygon',
		iconCls:'maptab_toolbar_edit_polygon',
		tooltip:_maptab_toolbar_edit_polygon,
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		toggleHandler:function(item,state){
			fn_toggleControl('drawpolygon',state,maptab_edit_controls);
			
			if (state)
			{
				maptab_edit_undo_redo_drawing_control=maptab_edit_controls["drawpolygon"];
			}else
			{
				maptab_edit_undo_redo_drawing_control="";
			}
			
			fn_maptab_edit_undo_redo_drawing_control(state);
		}
	},
	{xtype:'tbseparator'},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit',
		iconCls:'maptab_toolbar_edit',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_edit,
		toggleHandler:function(item,state)
		{
		
			fn_toggleControl('modifyfeature',state,maptab_edit_controls);
		
			if(state)
			{
				var _fid=maptab_edit_selectedFeatures[0];
				
				maptab_edit_controls["modifyfeature"].selectFeature(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,_fid.fid));
				
				maptab_edit_active_control="_modifyfeature";
			}else
			{
				Ext.each(maptab_edit_selectedFeatures, function (item) 
				{
					maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,item.fid));
				});
			
			}
			
			
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_copy',
		iconCls:'maptab_toolbar_edit_copy',
		tooltip:_maptab_toolbar_edit_copy,
		handler:function(){
		
			fn_maptab_toolbar_edit_copy();
			
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_move',
		iconCls:'maptab_toolbar_edit_move',
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		tooltip:_maptab_toolbar_edit_move,
		toggleHandler:function(item,state){
			
			fn_toggleControl('movefeature',state,maptab_edit_controls);
			
			if(state)
			{
				var _fid=maptab_edit_selectedFeatures[0];
				
				maptab_edit_controls["movefeature"].selectFeature(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,_fid.fid));
				
				maptab_edit_active_control="_movefeature";
			}else
			{
				Ext.each(maptab_edit_selectedFeatures, function (item) 
				{
					maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,item.fid));
				});
			
			}
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_delete',
		toggleGroup:'map_control_one_btn_allowed_group',
		enableToggle: false,
		iconCls:'maptab_toolbar_edit_delete',
		tooltip:_maptab_toolbar_edit_delete,
		handler:function(){
			
			fn_maptab_toolbar_edit_delete();
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_merge',
		iconCls:'maptab_toolbar_edit_merge',
		tooltip:_maptab_toolbar_edit_merge,
		handler:function(){
		
			fn_maptab_toolbar_edit_merge();
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_split',
		iconCls:'maptab_toolbar_edit_split',
		tooltip:_maptab_toolbar_edit_split,
		enableToggle: true,
		toggleGroup:'map_control_one_btn_allowed_group',
		toggleHandler:function(item,state){
		
			fn_toggleControl('splitfeature',state,maptab_edit_controls);
			
			if (state)
			{
				Ext.each(maptab_edit_selectedFeatures, function (item) 
				{
					maptab_edit_controls.selectfeaturebybox.select(mapGetFeatureByFid(maptab_edit_layer._layerObject._layerId,item.fid));
				});
			}
		}
	},
	{xtype:'tbseparator'},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_undo',
		iconCls:'maptab_toolbar_edit_undo',
		tooltip:_maptab_toolbar_edit_undo,
		handler:function(){
		
			fn_maptab_toolbar_edit_undo();
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_redo',
		iconCls:'maptab_toolbar_edit_redo',
		tooltip:_maptab_toolbar_edit_redo,
		handler:function(){
		
			fn_maptab_toolbar_edit_redo();
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_save',
		iconCls:'maptab_toolbar_edit_save',
		toggleGroup:'map_control_one_btn_allowed_group',
		enableToggle: false,
		tooltip:_maptab_toolbar_edit_save,
		toggleHandler:function(item,state)
		{
			if (state)
			{
				fn_maptab_toolbar_edit_save();
				
				Ext.getCmp("maptab_toolbar_edit_save").toggle(false);
			}
		}
	},
	{
		xtype:'button',
		disabled:true,
		id:'maptab_toolbar_edit_refresh',
		iconCls:'maptab_toolbar_edit_refresh',
		tooltip:_maptab_toolbar_edit_refresh,
		handler:function(){
		
			maptab_edit_unsaved_data_exists();
		}
	}		
];


function maptab_toolbar_edit_choose_layer_store_populate()
{
	maptab_toolbar_edit_choose_layer_store.removeAll();

	var overlayers=mapGetlayersBy("isBaseLayer",false);

	for(var i=(overlayers.length-1);i>=0;i--)
	{
		if (typeof overlayers[i]._layerObject!=="undefined")
		{
			if (overlayers[i]._layerObject._isEditable)
			{
				maptab_toolbar_edit_choose_layer_store.add({
					_layerTitle:overlayers[i]._layerObject._layerTitle,
					_layerId:overlayers[i]._layerObject._layerId,
					_layerLegend:overlayers[i]._layerObject._layerLegend
				});
				
			}
		}
	}
	
	maptab_toolbar_edit_choose_layer_store.add({
		_layerTitle:_maptab_toolbar_edit_deactivate_edit,
		_layerId:'',
		_layerLegend:'../images/edit_deactivate.png'
	});
}

function maptab_toolbar_edit_toggle_btns_one_features_allowed()
{
	var _btns_id=["maptab_toolbar_edit","maptab_toolbar_edit_move","maptab_toolbar_edit_split"];
	
	var selectedFeatures=0;
	
	var _enabled=true;
	
	selectedFeatures=maptab_edit_selectedFeatures.length;
		
	if (selectedFeatures==1)
	{
		_enabled=false;
	}
	
	Ext.each(_btns_id,function(item){
		
		Ext.getCmp(item).setDisabled(_enabled);
	
	});
	
	maptab_toolbar_edit_toggle_btns_can_copy();
}

function maptab_toolbar_edit_toggle_btns_multiple_features_allowed()
{
	var _btns_id=["maptab_toolbar_edit_copy","maptab_toolbar_edit_delete","maptab_toolbar_edit_merge"];
	
	var selectedFeatures=0;
	
	var _enabled=true;
	
	selectedFeatures=maptab_edit_selectedFeatures.length;
	
	if (selectedFeatures>=1)
	{
		_enabled=false;
	}
	
	Ext.each(_btns_id,function(item){
		
		Ext.getCmp(item).setDisabled(_enabled);
	
	});
	
	if (selectedFeatures==1)
	{
		Ext.getCmp("maptab_toolbar_edit_merge").setDisabled(true);
	}
	
	maptab_toolbar_edit_toggle_btns_can_copy();
}

function maptab_toolbar_edit_toggle_btns_can_copy()
{
	Ext.getCmp("maptab_toolbar_edit_copy").setDisabled(!maptab_edit_layer._layerObject._canCopy)
	
}

function maptab_toolbar_edit_activate_btns()
{
	var _btns_id=["maptab_toolbar_edit_select_by_point","maptab_toolbar_edit_select_by_box","maptab_toolbar_edit_unselect","maptab_toolbar_edit_point","maptab_toolbar_edit_line","maptab_toolbar_edit_polygon","maptab_toolbar_edit_save","maptab_toolbar_edit_refresh"];
	
	var _enabled=true;
	
	if (mapFindLayerById(Ext.getCmp("maptab_toolbar_edit_choose_layer").getValue()))
	{
		_enabled=false;
	}
	
	Ext.each(_btns_id,function(item){
		
		Ext.getCmp(item).setDisabled(_enabled);
	
	});
	
	maptab_toolbar_edit_toggle_btns_one_features_allowed();
	
	maptab_toolbar_edit_toggle_btns_multiple_features_allowed();

}



