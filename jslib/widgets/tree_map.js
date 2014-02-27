
/*version message*/

var count_layers_TreeLayer=6;

var layerRoot_layers = new Ext.tree.TreeNode({
		text: title_mapTree_Root_Layers,
		expanded: true,
		plugins: [{ptype:'nodedisabled'}]
	});
	
var layerRoot_databases = new Ext.tree.TreeNode({
		text: title_mapTree_Root_Databases,
		expanded: true
	});

var layerRoot_services = new Ext.tree.TreeNode({
		text: title_mapTree_Root_Services,
		expanded: true
	});
	
var treeMap_service_window_init=true;	
	
var mapTree=[{
	xtype:'panel',
	layout:'fit',
	iconCls:'mapTree_icon16',
	border:false,
	title:title_mapTree,
	tbar: [
		{
			xtype: 'button',
			id:'mapTree_add_btn',
			iconCls:'mapTree_add16',
			text:title_mapTree_add_layer,
			handler:function(){
			
				treeMap_service_window.show();
				
				if (treeMap_service_window_init===true)
				{
					showServiceTreeTab(wms_form);
					
					treeMap_service_window_init=false;
				}
				
			}
		},
		{
			xtype: 'button',
			id:'mapTree_remove_btn',
			iconCls:'mapTree_remove16',
			disabled:true,
			text:title_mapTree_remove_layer,
			handler:function(){
			
				var activeTree=Ext.getCmp('mapTree_TabPanel').getActiveTab().getId();
				
				var active_node = Ext.getCmp(activeTree).getSelectionModel().getSelectedNode();
				
				Ext.MessageBox.confirm(title_Confirm_Removal,question_Confirm_Removal+map.getLayer(active_node.id).name,function(ans){
					
					if (ans=="yes")
					{
						removeLayerMap(active_node);
				
						count_layers_TreeLayer=map.layers.length;
				
						nodeCheck_TreeLayers(Ext.getCmp(activeTree).root);
					}
				});
				
			}
		}

	],
	items:[{
		xtype:'tabpanel',
		id:'mapTree_TabPanel',
		border:false,
		activeItem: 0,
		listeners:{		
				tabchange: function(tabpanel,tab){
					
					try
					{
						count_layers_TreeLayer=map.layers.length;
									
						nodeCheck_TreeLayers(Ext.getCmp(tab.getId()).root);
						
					}catch(err){};
					
					var activeTab=Ext.getCmp('mapTree_TabPanel').getActiveTab().getId();
				
					var active_node = Ext.getCmp(activeTab).getSelectionModel().getSelectedNode();
					
					if (active_node==null)
					{
						Ext.getCmp("mapTree_remove_btn").disable();
						
					
					}
				}
		},
		items:[{
			title:title_mapTree_LayerTab,
			xtype: 'treepanel',
			enableDD: true,
			border:false,
			id:'layerTree_layers',
			root:layerRoot_layers,
			autoScroll:true,
			collapsible:false,
			listeners:{
				nodedrop: function(tree, node, oldParent, newParent, index, mindex) {
					
					count_layers_TreeLayer=map.layers.length;
					
					nodeCheck_TreeLayers(Ext.getCmp('layerTree_layers').root);
					
					getAllVisibleLayers(Ext.getCmp('layerTree_layers').root);
					
				}
				
			}
		},
		{
			title:title_mapTree_DatabaseTab,
			xtype: 'treepanel',
			border:false,
			enableDD: true,
			id:'layerTree_databases',
			root:layerRoot_databases,
			autoScroll:true,
			collapsible:false,
			border:false,
			hidden:true,
			listeners:{
				nodedrop: function(tree, node, oldParent, newParent, index, mindex) {
					
					count_layers_TreeLayer=map.layers.length;
								
					nodeCheck_TreeLayers(Ext.getCmp('layerTree_databases').root);
					
					getAllVisibleLayers(Ext.getCmp('layerTree_databases').root);
				}
			}
		},
		{
			title:title_mapTree_ServiceTab,
			xtype: 'treepanel',
			border:false,
			enableDD: true,
			id:'layerTree_services',
			autoScroll:true,
			root:layerRoot_services,
			collapsible:false,
			border:false,
			listeners:{
				nodedrop: function(tree, node, oldParent, newParent, index, mindex) {
					
					count_layers_TreeLayer=map.layers.length;
					
					nodeCheck_TreeLayers(Ext.getCmp('layerTree_services').root);
					
					getAllVisibleLayers(Ext.getCmp('layerTree_services').root);
				}
			}
		}]
	}]
}];

Ext.onReady(function() {

	var baseContainer=new GeoExt.tree.BaseLayerContainer({
		text: title_mapTree_BaseLayers,
		expanded: true,
		id:"treeMap_baselayers",
		loader:
		{
			baseAttrs:{
				iconCls:'base_layers',
				icon:'images/earth.png'
			}
		}
	});

	layerRoot_layers.appendChild(baseContainer);

	layerRoot_services.appendChild(new Ext.tree.TreeNode({
		text: title_mapTree_Services,
		id:'layer_services_id',
		expanded: false,
		allowChildren:false
	}));
	
});

function findBaseNameLayerIfAlreadyInTree(layer_id)
{

	var isonmap=false;
	
	mapPanel.layers.each(function(layer){
	
		if (layer.get("layers_basename_id")==layer_id)
		{
			isonmap=true;
		}
	
	});

	return isonmap;
}


function removeServiceLayersViaServiceWindow(service_id)
{
	
			
	mapPanel.layers.each(function(layer){
			
		if (layer.get("source_id")==service_id)
		{
			removeLayerMap(layer);
		}
			
	});
		
	
	return;
}


function removeOnlyLayersViaServiceWindow(layer_id)
{
	
	mapPanel.layers.each(function(layer){
			
		if (layer.get("layers_basename_id")==layer_id)
		{
			removeLayerMap(layer);
		}
			
	});
	
	
	return;
}

function createLayerTree()
{
	
	mapPanel.layers.each(function(layer){
		
		var layer_id=layer.get("layer").id;
		
		var service_id=layer.get("service_id");
		
		var service_type=layer.get("service_type");
		
		var service_name=layer.get("service_name");
		
		var source_id=layer.get("source_id");
		
		var service_layer=layer.get("layer");
		
		var layer_icon=layer.get("icon");
		
		var service_layer_id=service_layer.id;
		
		var serviceNode_id=service_id+"_"+source_id;

		if (service_id!=null)
		{
			var getLayerTreeServiceNodeId=Ext.getCmp('layerTree_layers').getNodeById(service_type);
			
			if (getLayerTreeServiceNodeId==null)
			{			
				layerRoot_layers.appendChild(new Ext.tree.TreeNode({
					text:service_id,
					id:service_type,
					expanded: true,
					enableDD: true
				}));
			}
			
			var getLayerTreeDatabaseNodeId=Ext.getCmp('layerTree_layers').getNodeById(serviceNode_id);
		
			if (getLayerTreeDatabaseNodeId==null)
			{	
					Ext.getCmp('layerTree_layers').getNodeById(service_type).appendChild(new Ext.tree.TreeNode({
						text:service_name,
						id:serviceNode_id,
						expanded: true,
						enableDD: true,
						checked: true,
						listeners:{
							checkchange:function(node,checked)
							{
								if(node.hasChildNodes()) 
								{
									if(checked == false) {
									  node.eachChild(function(child) {
										child.getUI().toggleCheck(false);
									  });
									  
									}
									
									if(checked == true) {
									  node.eachChild(function(child) {
										child.getUI().toggleCheck(true);
									  });
									}
								}

							}
						}
					}));
			}
			
			var getLayerTreeLayerNodeId=Ext.getCmp('layerTree_layers').getNodeById(service_layer_id);
			
			if (getLayerTreeLayerNodeId==null)
			{
				Ext.getCmp('layerTree_layers').getNodeById(serviceNode_id).appendChild(new GeoExt.tree.LayerNode({
					layer:service_layer,
					icon:layer_icon,
					id:layer_id,
					listeners:{
						click:function(layer){
						
							checkLayer(layer);
						
						},
						checkchange:function(layer,checkstatus)
						{
						
							if (toogle_getinfo)
							{
								count_getInfo=0;
								
								url_constructor="";
								
								url_constructor=[];
								
								getAllVisibleLayers(Ext.getCmp('layerTree_layers').root);
								
								map.events.unregister("mousemove",map,map_GetFeatureInfo);
					
								map.events.unregister("click",map,get_info_FeatureInfoClick);
								
								removeGetInfoLayerMap();
								
								map.events.register("click",map,get_info_FeatureInfoClick);
					
								map.events.register("mousemove",map,map_GetFeatureInfo);
							}
							
						},
						contextmenu:function(node, event,idx){

							create_wms_node_context_menu(node,event);
							
						}
					}
				}));
			}
		}
		

		if (service_id!=null)
		{
		
			var array_source_id=source_id.split("?");
			
			var main_source_id=array_source_id[0];
			
			var getLayerTreeDatabaseNodeId=Ext.getCmp('layerTree_databases').getNodeById(main_source_id);
		
			if (getLayerTreeDatabaseNodeId==null)
			{	
					layerRoot_databases.appendChild(new Ext.tree.TreeNode({
						text:service_name,
						id:main_source_id,
						expanded: true,
						enableDD: true
					}));
			}
			
			var databaseTreeNodeService=main_source_id+"_"+service_id;
			
			var getLayerTreeServiceNodeId=Ext.getCmp('layerTree_databases').getNodeById(databaseTreeNodeService);
			
			if (getLayerTreeServiceNodeId==null)
			{			
				Ext.getCmp('layerTree_databases').getNodeById(main_source_id).appendChild(new Ext.tree.TreeNode({
					text:service_id,
					id:databaseTreeNodeService,
					expanded: true,
					enableDD: true
				}));
			}
			
			var getLayerTreeLayerNodeId=Ext.getCmp('layerTree_databases').getNodeById(service_layer_id);
			
			if (getLayerTreeLayerNodeId==null)
			{
				Ext.getCmp('layerTree_databases').getNodeById(databaseTreeNodeService).appendChild(new GeoExt.tree.LayerNode({
					layer:service_layer,
					icon:layer_icon,
					id:layer_id,
					listeners:{
						click:function(layer){
						
							checkLayer(layer);
						
						},
						checkchange:function(layer,checkstatus)
						{
						
							if (toogle_getinfo)
							{
								count_getInfo=0;
								
								url_constructor="";
								
								url_constructor=[];
								
								
								getAllVisibleLayers(Ext.getCmp('layerTree_databases').root);
								
								map.events.unregister("mousemove",map,map_GetFeatureInfo);
					
								map.events.unregister("click",map,get_info_FeatureInfoClick);
								
								removeGetInfoLayerMap();
								
								map.events.register("click",map,get_info_FeatureInfoClick);
					
								map.events.register("mousemove",map,map_GetFeatureInfo);
							}
							
						},
						contextmenu:function(node, event,idx){

							create_wms_node_context_menu(node,event);

						}
					}
				}));
			}
		
		
		}
		

		if (service_id!=null)
		{
			var getLayerTreeServiceNodeId=Ext.getCmp('layerTree_services').getNodeById(service_id);
			
			if (getLayerTreeServiceNodeId==null)
			{			
				Ext.getCmp('layerTree_services').getNodeById('layer_services_id').appendChild(new Ext.tree.TreeNode({
					text:service_id,
					id:service_id,
					expanded: true,
					enableDD: true
				}));
			}
			
			var getLayerTreeLayerNodeId=Ext.getCmp('layerTree_services').getNodeById(service_layer_id);
			
			if (getLayerTreeLayerNodeId==null)
			{
				Ext.getCmp('layerTree_services').getNodeById(service_id).appendChild(new GeoExt.tree.LayerNode({
					layer:service_layer,
					icon:layer_icon,
					id:layer_id,
					listeners:{
						click:function(layer){
							
							checkLayer(layer);
						},
						checkchange:function(layer,checkstatus)
						{
						
							if (toogle_getinfo)
							{
								count_getInfo=0;
								
								url_constructor="";
								
								url_constructor=[];
								
								
								getAllVisibleLayers(Ext.getCmp('layerTree_services').root);
								
								map.events.unregister("mousemove",map,map_GetFeatureInfo);
					
								map.events.unregister("click",map,get_info_FeatureInfoClick);
								
								removeGetInfoLayerMap();
								
								map.events.register("click",map,get_info_FeatureInfoClick);
					
								map.events.register("mousemove",map,map_GetFeatureInfo);
							}
							
						},
						contextmenu:function(node, event,idx){
						
							
							
							create_wms_node_context_menu(node,event);
							
							
							
						}
					}
				}));
			}
		
		}
		
	});
	
	count_layers_TreeLayer=map.layers.length;
	
	nodeCheck_TreeLayers(Ext.getCmp('layerTree_layers').root);
	
	getAllVisibleLayers(Ext.getCmp('layerTree_layers').root);

	toggleLayersNodeIfEPSGNotSupported(Ext.getCmp('layerTree_layers').root,map_currentMapProjection,tooltip_mapTree_notSupportedBaseMapEPSG);
	
	
	
}

var map_form_firstTime=true;

function showServiceTreeTab(selForm)
{

	if (map_form_firstTime)
	{
		map_form_firstTime=false;
	}
	form_panel.items.each(function(list){
		list.hide();
	});
		
	selForm.show();
	

}

function removeGetInfoLayerMap()
{
	mapPanel.layers.each(function(layer){
			
		if ((layer.get("layer").name=="getInfoGML") )
		{
			map.removeLayer(layer.get("layer"));
		}
			
	});
}

function removeMarkersFromMap(marker_name)
{		
	mapPanel.layers.each(function(layer){
			
		if ((layer.get("layer").name==marker_name) )
		{
			map.removeLayer(layer.get("layer"));
		}
			
	});
}

function removeLayerMap(layer)
{
		
		var thisLayer=map.getLayer(layer.id);
		
		map.removeLayer(thisLayer);
		
		var testLayer=map.getLayer(layer.id);
			
		if (testLayer==null)
		{
			var layerTree_layers_Parent=Ext.getCmp('layerTree_layers').getNodeById(layer.id).parentNode;
			var layerTree_layers_Parent_Parent=Ext.getCmp('layerTree_layers').getNodeById(layer.id).parentNode.parentNode;
			Ext.getCmp('layerTree_layers').getNodeById(layer.id).remove();
			if (!layerTree_layers_Parent.hasChildNodes()){layerTree_layers_Parent.remove();}
			if (!layerTree_layers_Parent_Parent.hasChildNodes()){layerTree_layers_Parent_Parent.remove();}
				
			var layerTree_databases_Parent=Ext.getCmp('layerTree_databases').getNodeById(layer.id).parentNode;
			var layerTree_databases_Parent_Parent=Ext.getCmp('layerTree_databases').getNodeById(layer.id).parentNode.parentNode;
			Ext.getCmp('layerTree_databases').getNodeById(layer.id).remove();
			if (!layerTree_databases_Parent.hasChildNodes()){layerTree_databases_Parent.remove();}
			if (!layerTree_databases_Parent_Parent.hasChildNodes()){layerTree_databases_Parent_Parent.remove();}
				
			var layerTree_services_Parent=Ext.getCmp('layerTree_services').getNodeById(layer.id).parentNode;
			Ext.getCmp('layerTree_services').getNodeById(layer.id).remove();
			if (!layerTree_services_Parent.hasChildNodes()){layerTree_services_Parent.remove();}
				
			Ext.getCmp("mapTree_remove_btn").disable();

		}
	

	
}

function checkLayer(node)
{
	
	if(!node.layer) {
		Ext.getCmp("mapTree_remove_btn").disable();

		return;  
	}
	else
	{
		Ext.getCmp("mapTree_remove_btn").enable();

		return;
	}

}


function checkIfEPSGNotSupportedOneLayer(layer,epsg)
{

	var layer_crs=layer.get("layers_crs");
			
	var supportedProjections=layer_crs.split(',');
			
	var isSupported=false;
			
	for(var i=0; i<supportedProjections.length; i++)
	{
		var layer_epsg=supportedProjections[i];
				
		if (layer_epsg==epsg) 
		{
			isSupported=true;
		}
	}
			
	var layer_service_type=layer.get("service_type");
			
	if ((layer_service_type=="WFS") || (layer_service_type=="WFST") || (layer_service_type=="Shapefile") || (layer_service_type=="KML") || (layer_service_type=="ATOM"))
	{
			
		isSupported=true;
	}

	return isSupported;
}


function toggleLayersNodeIfEPSGNotSupported(node,epsg,tooltip)
{
	
	node.eachChild(function(n) {
		
		if (n.getDepth()==3)
		{
			var get_layer=mapPanel.layers.getByLayer(n.layer);
			
			var layer_crs=get_layer.get("layers_crs");
			
			var supportedProjections=layer_crs.split(',');
			
			var isSupported=false;
			
			for(var i=0; i<supportedProjections.length; i++)
			{
				var layer_epsg=supportedProjections[i];
				
				if (layer_epsg==epsg) 
				{
					isSupported=true;
				}
			}
			
			var layer_service_type=get_layer.get("service_type");
			
			if ((layer_service_type=="WFS") || (layer_service_type=="WFST") || (layer_service_type=="Shapefile") || (layer_service_type=="KML") || (layer_service_type=="ATOM") || (layer_service_type=="GEORSS"))
			isSupported=true;
			
			if (isSupported)
			{
				Ext.getCmp('layerTree_layers').getNodeById(get_layer.id).enable();
				Ext.getCmp('layerTree_databases').getNodeById(get_layer.id).enable();
				Ext.getCmp('layerTree_services').getNodeById(get_layer.id).enable();
				
				Ext.getCmp('layerTree_layers').getNodeById(get_layer.id).setTooltip("");
				Ext.getCmp('layerTree_databases').getNodeById(get_layer.id).setTooltip("");
				Ext.getCmp('layerTree_services').getNodeById(get_layer.id).setTooltip("");
				
				
			}
			else
			{
				Ext.getCmp('layerTree_layers').getNodeById(get_layer.id).disable();
				Ext.getCmp('layerTree_databases').getNodeById(get_layer.id).disable();
				Ext.getCmp('layerTree_services').getNodeById(get_layer.id).disable();
				
				Ext.getCmp('layerTree_layers').getNodeById(get_layer.id).setTooltip(tooltip);
				Ext.getCmp('layerTree_databases').getNodeById(get_layer.id).setTooltip(tooltip);
				Ext.getCmp('layerTree_services').getNodeById(get_layer.id).setTooltip(tooltip);
				
				
			}

		}
		
		if(n.hasChildNodes())
            toggleLayersNodeIfEPSGNotSupported(n,epsg,tooltip);
		
		
	});
}


function toggleLayerNodeIfEPSGNotSupported(layer,showhide,tooltip)
{
	if (showhide)
	{
		try
		{
			Ext.getCmp('layerTree_layers').getNodeById(layer.id).enable();
			Ext.getCmp('layerTree_databases').getNodeById(layer.id).enable();
			Ext.getCmp('layerTree_services').getNodeById(layer.id).enable();
		
			Ext.getCmp('layerTree_layers').getNodeById(layer.id).setTooltip("");
			Ext.getCmp('layerTree_databases').getNodeById(layer.id).setTooltip("");
			Ext.getCmp('layerTree_services').getNodeById(layer.id).setTooltip("");
		}catch(err){}
	}
	else
	{
		
		try
		{
			Ext.getCmp('layerTree_layers').getNodeById(layer.id).disable();
			Ext.getCmp('layerTree_databases').getNodeById(layer.id).disable();
			Ext.getCmp('layerTree_services').getNodeById(layer.id).disable();
		
			Ext.getCmp('layerTree_layers').getNodeById(layer.id).setTooltip(tooltip);
			Ext.getCmp('layerTree_databases').getNodeById(layer.id).setTooltip(tooltip);
			Ext.getCmp('layerTree_services').getNodeById(layer.id).setTooltip(tooltip);
		}catch(err){}
	}
}



function nodeCheck_TreeLayers(node) {

    node.eachChild(function(n) {
		if (n.getDepth()==3)
		{

			var numLayer=mapPanel.map.layers.indexOf(n.layer);
			var get_layer=map.getLayer(n.layer.id);
			count_layers_TreeLayer--;
			mapPanel.map.setLayerIndex(get_layer,count_layers_TreeLayer);

		}
		if(n.hasChildNodes())
            nodeCheck_TreeLayers(n);
		});
}
