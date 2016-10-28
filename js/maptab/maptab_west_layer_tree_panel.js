var maptab_west_layer_tree_panel_tree_json_store=Ext.create('Ext.data.TreeStore', {
	fields: ['text','tools','_groupId'],
	root: {
		text: 'root',
		children: [
			{
				text:_maptab_west_layer_tree_panel_tabs_layers_node_title_basemaps,
				id:'maptab_west_layer_tree_panel_tabs_layers_basemaps_node',
				expanded: false
			},{
				text:_maptab_west_layer_tree_panel_tabs_layers_node_title_layers,
				id:'maptab_west_layer_tree_panel_tabs_layers_layers_node',
				_groupId:'layers',
				expanded: true,
				checked:true
			}	
		]
	}
});

var maptab_west_layer_tree_panel_tree={
	xtype: 'tree-grid',
	rootVisible: false,
	id:'maptab_west_layer_tree_panel_tree',
	border:false,
	multiSelect: true, 
    plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
        })
    ],
	viewConfig: {
		markDirty:false,
        plugins: {
            ptype: 'treeviewdragdrop'
        },
		listeners:{
			drop:function()
			{
				maptab_west_layer_reorder_layer();
			}
		}
    },
	listeners: {
		checkchange:function(node, checked)
		{
			maptab_west_layer_check_node(node,checked);
		},
		itemcontextmenu:function(view, node, item, index, event)
		{
			if(node.isLeaf())
			{
				event.preventDefault();
				
				maptab_west_layer_layer_menu_show(view, node, item, index, event);
			}
			else
			{
				event.preventDefault();
				
				maptab_west_layer_folder_menu_show(view, node, item, index, event);
			}
		}
	},
	store:maptab_west_layer_tree_panel_tree_json_store,
	columns: [
	{
		dataIndex: 'tools',
		width:40
	},
	{
		dataIndex: '_groupId',
		width:40,
		hidden:true,
		hideable:false
	},
	{
		xtype: 'treecolumn',
		dataIndex: 'text',
		autoSizeColumn: true,
		flex:2,
		editor:{
			xtype:"textfield",
			allowBlank: false
        }
	}]
}

var maptab_west_layer_tree_panel_tabs={
	xtype:'tabpanel',
	id:'maptab_west_layer_tree_panel_tabs',
	region:'center',
	border:false,
	layout:'fit',
	items:[
		{
			xtype:'panel',
			border:false,
			layout:'fit',
			title:_maptab_west_layer_tree_panel_tabs_layers,
			items:[maptab_west_layer_tree_panel_tree]
		}]
	}

var maptab_west_layer_tree_panel ={
	xtype:'panel',
	id:'maptab_west_layer_tree_panel',
	title:_maptab_west_layer_tree_panel,
	region:'center',
	layout:'border',
	iconCls:'maptab_accordion_icon',
	items:[
		maptab_west_layer_tree_panel_tabs
	],
	tbar:[
		{
			xtype:'button',
			id:'maptab_west_layer_tree_panel_add_btn',
			text:_map_general_add_btn,
			iconCls:'map_general_add_btn',
			tooltip:_map_general_add_btn,
			handler:function()
			{
				maptab_services_manager.show();
			}
		},
		{
			xtype:'button',
			id:'maptab_west_layer_tree_panel_remove_btn',
			text:_map_general_remove_btn,
			iconCls:'map_general_remove_btn',
			tooltip:_map_general_remove_btn,
			handler:function()
			{
				var _selected_Nodes=Ext.getCmp('maptab_west_layer_tree_panel_tree').getSelectionModel().getSelection();
				
				Ext.each(_selected_Nodes,function(item)
				{
					maptab_west_layer_remove_node(item);
				
				});
				
			}
		}			
	]
}

function maptab_west_layer_add_BaseLayer(_layer,_node)
{
	_node.insertBefore({
		id: _layer.id,
		text:_layer.name,
		leaf: true,
		icon:_layer.icon,
		iconCls:'maptab_services_manager_layer_legend_size',
		checked: _layer.visibility,
		tools: ""
	},_node.firstChild);
}


function maptab_west_layer_add_layer(_layer,_node)
{
	_node.insertBefore({
		id: _layer._layerObject._layerId,
		text:_layer._layerObject._layerTitle,
		leaf: true,
		qtip: '<img src=\"'+_layer._layerObject._layerLegend+'\">',
		icon:_layer._layerObject._layerLegend,
		iconCls:'maptab_services_manager_layer_legend_size',
		checked: _layer.visibility,
		tools: "<img src=\""+host+"images/layer_info.png\" width=\"12px\" data-qtip=\"<div style='width:260px;'><b>"+_layer._layerObject._layerTitle +"</b><br>"+_layer._layerObject._layerName+"</b><br>"+_layer._layerObject._layerAbstract+"</div>\">  <img src=\""+host+"images/reorder.png\" width=\"12px\" style='cursor:move;'>"
	},_node.firstChild);
	
	return _node;
}

function maptab_west_layer_get_layer_title(_layerId)
{
	var _node=maptab_west_layer_tree_panel_tree_json_store.getRootNode().findChild("id", _layerId, true);
	
	return _node.data.text;
}

function maptab_west_layer_set_layer_icon(_layerId,_icon)
{
	var _node=maptab_west_layer_tree_panel_tree_json_store.getRootNode().findChild("id", _layerId, true);
	
	_node.set("icon",_icon);
}

function maptab_west_layer_set_edit_layer(_layerId)
{
	var _node=maptab_west_layer_tree_panel_tree_json_store.getRootNode().findChild("id", _layerId, true);
	
	var _layer=mapFindLayerById(_layerId);
	
	_node.data.tools="<img src=\"images/edit.png\" width=\"12px\" data-qtip=\"<div style='width:260px;'><b>"+_layer._layerObject._layerTitle +"</b><br>"+_layer._serviceObject._serviceAbstract+"</div>\">"
}

function maptab_west_layer_remove_node(_node)
{
	
	if (typeof _node!=="undefined")
	{
		if (_node.hasChildNodes())
		{
			while(_node.firstChild)
			{
				maptab_west_layer_remove_node(_node.firstChild);
			}
		}
		
		if(_node.isLeaf())
		{
			mapRemoveLayer(mapFindLayerById(_node.data.id));
		}
			
		_node.remove();
	}
}

function maptab_west_layer_check_node(_node,checked)
{
	if (_node.hasChildNodes())
	{
		Ext.each(_node.childNodes,function(item)
		{
			maptab_west_layer_check_node(item,checked);
		});
	}
	
	if(_node.isLeaf()&&(!mapLayerIsBaseLayer(_node.data.id)))
	{
		mapChangeLayerVisibility(_node.data.id,checked);
	}
	
	if(_node.isLeaf()&&(mapLayerIsBaseLayer(_node.data.id)))
	{
		maptab_west_layer_set_BaseLayer(_node.data.id);
		
		_node.set('checked',true);
		
		return;
	}
		
	_node.set('checked',checked);
	
}

function maptab_west_layer_set_BaseLayer(_layerId)
{
	maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_basemaps_node').eachChild(function(node){
		
		if (node.isLeaf())
		{
			node.set('checked',false);
		}
	});
	
	mapSetBaseMapLayer(_layerId);

}

function maptab_west_layer_reorder_layer()
{	
	var _index=mapGetCountOfOverlayers();
	
	var _node=maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_layers_node');
	
	_node.cascadeBy(function(node){
		if(node.isLeaf())
		{
			mapReorderLayer(node.data.id,_index);
			
			_index--;
		}
	});
	
}

function maptab_west_layer_folder_menu_show(view, node, item, index, event)
{
	var menu = new Ext.menu.Menu({
		items: [
			{
				text: _maptab_west_layer_tree_panel_tabs_layers_node_create_subfolder_menu_title,
				iconCls:'map_general_add_btn',
				handler:function()
				{
					maptab_west_layer_folder_add_group(node, Ext.id(), _maptab_west_layer_tree_panel_tabs_layers_node_new_subfolder_title, true, true);
				}
			},
			{
				text: _maptab_west_layer_tree_panel_tabs_layers_node_remove_subfolder_menu_title,
				iconCls:'map_general_remove_btn',
				handler:function()
				{
					maptab_west_layer_remove_node(node);
				}
			}
		]
	});

	menu.showAt(event.getXY());
}

function maptab_west_layer_folder_add_group(_node, _nodeId, _nodeTitle, _nodeExpanded, _nodeChecked)
{
	_node.insertBefore({
		text:_nodeTitle,
		expanded: _nodeExpanded,
		checked:_nodeChecked,
		id:_nodeId,
		tools: "<img src=\""+host+"images/reorder.png\" width=\"12px\" style='cursor:move;'>"
	},_node.firstChild);
}


var _maptab_west_layer_layer_menu_components=[];

function maptab_west_layer_layer_menu_show(view, node, item, index, event)
{

	if (!mapLayerIsBaseLayer(node.data.id))
	{
		var _current_opacity=Number(mapGetOpacity(node.data.id)*100);
					
		var _opacity={
			text: _maptab_west_layer_tree_panel_tabs_layers_node_opacity_layer_menu_title,
			iconCls:'maptab_layer_tree_opacity',
			menu:[{
				xtype:'slider',
				width: 100,
				hideLabel: true,
				useTips: true,
				increment: 10,
				value:_current_opacity,
				minValue: 0,
				maxValue: 100,
				listeners: {
					change: function (slider, value, thumb){
					
						var opacity=(value*0.01);
						
						mapSetOpacity(node.data.id,Number(opacity));
					}
				}
			}]
		};
		
		var _maxExtent={
			text: _maptab_west_layer_tree_panel_tabs_layers_node_extent_layer_menu_title,
			iconCls:'maptab_toolbar_general_extent',
			handler:function()
			{
				mapExtentToLayer(node.data.id);
				
			}
		};
		
		
		
		var _scales="";
		
		_scales ={
			text:_maptab_west_layer_tree_panel_tabs_layers_node_scales_layer_menu_title,
			menu: maptab_west_layer_layer_menu_create_scales(mapFindLayerById(node.data.id)._layerObject._scales,node.data.id)
		};
		
		
		var _serviceObject = mapFindLayerById(node.data.id)._serviceObject;
		
		var _layerObject = mapFindLayerById(node.data.id)._layerObject;
		
		var _removeLayer="";
		
		var _config=new _config_init_map();
		
		if (typeof _config._canRemoveLayer!=="undefined")
		{
			if (_config._canRemoveLayer)
			{
				_removeLayer={
					text: _maptab_west_layer_tree_panel_tabs_layers_node_remove_layer_menu_title,
					iconCls:'map_general_remove_btn',
					disabled: _layerObject._isEdited,
					handler:function()
					{
						maptab_west_layer_remove_node(node);
					}
				}
			}
		}
		
		var _refresh="";
		
		var _information = "";
		
		if (_serviceObject._isService)
		{
			
			_refresh={
				text: _maptab_west_layer_tree_panel_tabs_layers_node_refresh_layer_menu_title,
				iconCls:'maptab_layer_tree_refresh',
				disabled: _layerObject._isEdited,
				handler:function()
				{
					var _serviceObject = mapFindLayerById(node.data.id)._serviceObject;
					
					var _layerObject = mapFindLayerById(node.data.id)._layerObject;
					
					if (_serviceObject._isService)
					{
						if (_serviceObject._isVector)
						{
							mapFindLayerById(node.data.id).refresh();
							
						}else{
						
							mapFindLayerById(node.data.id).redraw(true);
						}
					
					}
				}
			};
			
			var _layerInfoHTML = "";
			_layerInfoHTML+="<b>"+_maptab_west_layer_tree_panel_tabs_layers_node_information_layer_responsible_party +"</b> : "+ _serviceObject._responsible_party+" <br>";
			_layerInfoHTML+="<b>"+_maptab_west_layer_tree_panel_tabs_layers_node_information_layer_responsible_person +"</b> : "+ _serviceObject._responsible_person+" <br>";
			_layerInfoHTML+="<b>"+_maptab_west_layer_tree_panel_tabs_layers_node_information_layer_responsible_position +"</b> : "+ _serviceObject._responsible_position+" <br>";
			_layerInfoHTML+="<b>"+_maptab_west_layer_tree_panel_tabs_layers_node_information_layer_responsible_email +"</b> : "+ _serviceObject._responsible_email+" <br>";
			_layerInfoHTML+="<b>"+_maptab_west_layer_tree_panel_tabs_layers_node_information_layer_responsible_fees +"</b> : "+ _serviceObject._responsible_fees+" <br>";
			_layerInfoHTML+="<b>"+_maptab_west_layer_tree_panel_tabs_layers_node_information_layer_responsible_access_constrains +"</b> : "+ _serviceObject._responsible_access_constrains
			
			
			_information={
				text: _maptab_west_layer_tree_panel_tabs_layers_node_information_layer_menu_title,
				menu:[{
					xtype:'panel',
					html:_layerInfoHTML
				}]
			};
			
		}
		
		var _elevation = "";
		
		if (typeof mapFindLayerById(node.data.id)._layerObject._elevationDefault!=="undefined")
		{
			if ((mapFindLayerById(node.data.id)._layerObject._elevationDefault!=null) && (mapFindLayerById(node.data.id)._layerObject._elevationDefault!=""))
			{
				_elevation ={
					text:_maptab_west_layer_tree_panel_tabs_layers_node_elevation_layer_menu_title,
					menu: maptab_west_layer_layer_menu_create_elevation(mapFindLayerById(node.data.id)._layerObject._elevationDefault,node.data.id)
				};
			
			}
			
		}
		
		var menu = new Ext.menu.Menu({
			_nodeId:node.data.id,
			closeAction :'destroy',
			items: [
				_information,
				_maxExtent,
				_refresh,
				_opacity,
				_scales,
				_elevation,
				_removeLayer
			]
		});
		
		menu.add(_maptab_west_layer_layer_menu_components);
		
		menu.showAt(event.getXY()); 
	}
}

function maptab_west_layer_get_node_from_id(_id)
{
	var _node=maptab_west_layer_tree_panel_tree_json_store.getNodeById(_id);
	
	return _node;
}

function maptab_west_layer_layer_menu_create_scales(_scales,_layerId)
{
	var _scalesMenu=[];
	
	var _config=new _config_init_map();
	
	var _defaultScales=_config._defaultScales;
	
	var _layerScales=mapFindLayerById(_layerId)._layerObject._scales;
	
	if (_layerScales!=null)
	{
		for(var i=0;i<_defaultScales.length;i++)
		{
			
			var _text="1:"+_defaultScales[i]+"  <1:"+_defaultScales[i+1];
			
			var _min=_defaultScales[i];
				
			var _max;
				
			if (_defaultScales[i+1])
			{
				_max=_defaultScales[i+1];
				
				_text="1:"+_defaultScales[i]+"  <1:"+_defaultScales[i+1];
			}
			else
			{
			
				_text=">"+_defaultScales[i];
				
				_max=-1;
			}
				
			var _currentScale=[_min,_max];
			
			var _checked=false;
			
			var _currentLayerScale=_layerScales[i];
			
			if (_currentLayerScale[0]==_min)
			{
				_checked=true;
			}
			
			_scalesMenu.push({
				xtype:'menucheckitem',
				text:_text,
				checked:_checked,
				_currentScale:_currentScale,
				_currentScaleIndex:i,
				listeners: {
					checkchange: function(item,_checked)
					{
						_layerScales[item._currentScaleIndex]=0;
						
						if(_checked)
						{
							_layerScales[item._currentScaleIndex]=item._currentScale;
						}
							
						mapFindLayerById(_layerId)._layerObject._scales=_layerScales;
						
						mapSetVisibilityBaseOnScales();
					
					}
				}
			});
		}
	}
	
	return _scalesMenu;
}

function maptab_west_layer_layer_menu_create_elevation(_elevation,_layerId)
{
	var _elevationMenu=[];
	
	var _layerElevation=mapFindLayerById(_layerId)._layerObject._elevation;
	
	if (_layerElevation!=null)
	{
		for(var i=0;i<_layerElevation.length;i++)
		{
			var _checked=false;
			
			var _currentLayerElavation=_layerElevation[i];
			
			if (_currentLayerElavation == _elevation)
			{
				_checked=true;
			}
			
			 var _text = _currentLayerElavation;
			
			_elevationMenu.push({
				xtype:'menucheckitem',
				text:_text,
				checked:_checked,
				listeners: {
					checkchange: function(item,_checked)
					{
						mapFindLayerById(_layerId)._layerObject._elevationDefault = item.text;
						
						mapFindLayerById(_layerId).mergeNewParams({'elevation':item.text});
						
					}
				}
			});
		}
	}
	
	return _elevationMenu;
}
