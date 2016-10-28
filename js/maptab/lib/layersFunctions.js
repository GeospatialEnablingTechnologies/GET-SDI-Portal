Ext.define('serviceLayersStoreModel', {
     extend: 'Ext.data.Model',
     fields: [
		{name: '_layerId', type: 'string'},
		{name: '_layerName', type: 'string'},
        {name: '_layerTitle', type: 'string'},
		{name: '_layerAbstract', type:'string'},
		{name: '_layerLegend', type: 'string'},
		{name: '_loadedStatus', type: 'int'},
		{name: '_supportedEPSG', type: 'string'},
		{name: '_layerObject', type: 'object'},
		{name: '_serviceObject', type: 'object'}
     ]
 });

function fn_storeColumnsServiceLayers()
{
	var obj={
		store:Ext.create('Ext.data.Store', {
			model:'serviceLayersStoreModel',
			data:[]
		}),
		columns:[
			{
				dataIndex:'_layerId',
				hidden:true,
				hideable: false
			},
			{
				dataIndex:'_layerLegend',
				sortable: true,
				width:35,
				maxWidth:35,
				minWidth:35,
				hideable: false,
				renderer:fn_gridLayerLegend
			},
			{
				header:_maptab_services_manager_storecolumns_column_layer_name,
				dataIndex:'_layerName',
				sortable: true,
				width:200
			},
			{
				header:_maptab_services_manager_storecolumns_column_layer_title,
				dataIndex:'_layerTitle',
				sortable: true,
				width:200
			},
			{
				dataIndex:'_loadedStatus',
				sortable: true,
				width:35,
				maxWidth:35,
				minWidth:35,
				hidden:false,
				renderer:fn_loadedStatus
			},
			{
				dataIndex:'_layerObject',
				hidden:true,
				hideable: false
			},
			{
				dataIndex:'_serviceObject',
				hidden:true,
				hideable: false
			}
		]
	};

	return obj;
}

function fn_gridLayerLegend(value, metaData, record, row, col, store, gridView)
{

	if (value.length>0)
	return "<img src=\""+value+"\" width=\"20px\" height=\"20px\" data-qtip=\"<img src='"+value+"'>\">";
	else
	return "";
}

function fn_loadedStatus(value, metaData, record, row, col, store, gridView)
{
	var output="";
	
	var status=mapLayerIsLoaded(record.get("_layerObject")._layerId);
	
	if (status<1)
	{
		status=record.get("_layerObject")._loadedStatus;
	}
	
	switch(status)
	{
		case 1:
			output="<img src=\""+host+"images/layer_loaded_ok.png\" width=\"16px\" height=\"16px\" data-qtip=\""+_maptab_services_manager_loaded_layer_success_tooltip+"\">";
		break;
		
		case 2:
			output="<img src=\""+host+"images/layer_loaded_attention.png\" width=\"16px\" height=\"16px\"  data-qtip=\""+_maptab_services_manager_loaded_layer_attention_tooltip+"\">";
		break;
	}
	
	
	return output;
}

function fn_loadStart(_layerId)
{
	var _node=maptab_west_layer_tree_panel_tree_json_store.getRootNode().findChild("id", _layerId, true);
	
	_node.set("icon",host+"images/loading.gif");
	
	mapFindLayerById(_layerId)._layerObject._isLoaded=false;
}

function fn_loadEnd(_layerId)
{
	var _node=maptab_west_layer_tree_panel_tree_json_store.getRootNode().findChild("id", _layerId, true);
	
	_node.set("icon",mapFindLayerById(_layerId)._layerObject._layerLegend);
	
	mapFindLayerById(_layerId)._layerObject._isLoaded=true;
}

