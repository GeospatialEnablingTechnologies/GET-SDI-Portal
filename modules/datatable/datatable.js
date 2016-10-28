var datatable_translation={
	el_gr:{
		title:'Πίνακας Ιδιοτήτων',
		pagingtoolbar_emptymsg:'Δεν υπάρχουν δεδομένα',
		pagingtoolbar_displayMsg:'Εμφανίζονται {0} - {1} από {2}',
		pagingtoolbar_firstText:'Πρώτη σελίδα',
		pagingtoolbar_lastText:'Τελευταία σελίδα',
		pagingtoolbar_beforePageText:'Σελίδα',
		pagingtoolbar_afterPageText:'από {0}',
		pagingtoolbar_refreshText:'Ανανέωση',
		pagingtoolbar_prevText:'Προηγούμενο',
		pagingtoolbar_nextText:'Επόμενο'
	},
	en_us:{
		title:'Attribute Table',
		pagingtoolbar_emptymsg:'No data to display',
		pagingtoolbar_displayMsg:'Displaying {0} - {1} of {2}',
		pagingtoolbar_firstText:'First page',
		pagingtoolbar_lastText:'Last page',
		pagingtoolbar_beforePageText:'Page',
		pagingtoolbar_afterPageText:'of {0}',
		pagingtoolbar_refreshText:'Refresh',
		pagingtoolbar_prevText:'Previous',
		pagingtoolbar_nextText:'Next'
	}

};

init_onload_fn.push(init_datatable);

function init_datatable()
{
	_maptab_west_layer_layer_menu_components.push(new layerdatatable);
	
}

var layerdatatable = function(){return {
	text: datatable_translation[language].title,
	handler:function()
	{
		var _layerId=this.ownerCt._nodeId;
		
		var w = layerdatatable_win(_layerId);
		
		var g = layerdatatable_grid(_layerId);
		
		w.add(g);
		
		w.show();

	}
};}

function layerdatatable_queryObj(_layerId)
{
	var _servicePort = "";
	
	_layer = mapFindLayerById(_layerId);

	if (typeof _layer._serviceObject._servicePort!=="undefined")
	{
		_servicePort = _layer._serviceObject._servicePort;
	}
	
	var _queryObject=[{
		_layerId:_layer._layerObject._layerId,
		_serviceType:_layer._serviceObject._serviceType,
		_serviceName:_layer._serviceObject._serviceName,
		_servicePort:_servicePort,
		_username:_layer._serviceObject._username,
		_serviceUrl:_layer._serviceObject._serviceUrl,
		_password:_layer._serviceObject._password,
		_layerName:_layer._layerObject._layerName,
		_version:_layer._serviceObject._version,
		_isService:_layer._serviceObject._isService,
		_featureType:_layer._layerObject._featureType,
		_cqlFilter:"1=1&MAXFEATURES={limit}&STARTINDEX={start}&SORTBY={sortby}",
		_cqlFilterJSON:"",
		_geometryField:_layer._layerObject._geometryField,
		_nativeSRS:_layer._layerObject._nativeSRS,
		_geomFilter:"",
		_featureInfoFormat:_layer._serviceObject._featureInfoFormat,
		_request:"search"
	}];
	
	return _queryObject;
}

function layerdatatable_grid(_layerId)
{
	var _attributesFields=mapFindLayerById(_layerId)._layerObject._attributesFields;

	var gId=Ext.id();
	
	var pId = gId+"_pager";
	
	var store = fn_createAttributesStore(fn_featureColumnModelForGrid(_attributesFields));
	
	store.autoLoad=true;
	
	store.remoteSort=true;
	
	store.pageSize = 100;
	
	var _params = layerdatatable_queryObj(_layerId);
	
	_params = {data:Ext.JSON.encode(_params)};
	
	var proxy = {
        type: 'ajax',
		method: 'POST',
		extraParams:_params,
        url: _proxy_url+"?proxy=pager",
        reader: {
            type: 'json',
            root: 'data[0]._response._attributes',
            totalProperty: 'data[0]._response._total',
			getData:function(root)
			{
				var _data=[];
				
				var data = root.data[0]._response._attributes
				
				index=0;
				
				Ext.each(data,function(record)
				{
					root.data[0]._response._attributes[index]=record[0];
					
					index++;
				});
				
				return root;
			}
        }
    }
    
	
	store.setProxy(proxy);
	
	store.load();
		
	var g=Ext.create('Ext.grid.Panel',
	{
		border:false,
		columnLines:true,
		id:gId,
		enableColumnMove:mapFindLayerById(_layerId)._layerObject._attributesReorder,
		_layerId:_layerId,
		selModel: Ext.create('Ext.selection.CheckboxModel',{mode:'SIMPLE',checkOnly:true}),
		store:store,
		columns:fn_createAttributesColumnModel(fn_featureColumnModelForGrid(_attributesFields)),
		dockedItems: [{
			xtype: 'pagingtoolbar',
			emptyMsg:datatable_translation[language].pagingtoolbar_emptymsg,
			displayMsg:datatable_translation[language].pagingtoolbar_displayMsg,
			firstText:datatable_translation[language].pagingtoolbar_firstText,
			lastText:datatable_translation[language].pagingtoolbar_lastText,
			beforePageText:datatable_translation[language].pagingtoolbar_beforePageText,
			afterPageText:datatable_translation[language].pagingtoolbar_afterPageText,
			refreshText:datatable_translation[language].pagingtoolbar_refreshText,
			prevText:datatable_translation[language].pagingtoolbar_prevText,
			nextText:datatable_translation[language].pagingtoolbar_nextText,
			store: store,   // same store GridPanel is using
			dock: 'bottom',
			displayInfo: true
		}],
		listeners:{
			select:function(row, record, index, eOpts)
			{
				var _feature=fn_featureObject(record);
				
				fn_featureHighlight(_feature._featureId,_feature._layerId,_feature._srsName,_feature._featureUrl,_feature._featureGeomFormat,'');
				
				fn_toggleHightlightFromAllResultsGrids(_feature._featureId,_feature._layerId,g.id);
				
			},
			show:function()
			{
				
				
				
			},
			deselect:function(row, record, index, eOpts)
			{
				var _feature=fn_featureObject(record);
				
				fn_featureUnHiglighted(_feature._featureId,_feature._layerId);
				
				fn_toggleHightlightFromAllResultsGrids(_feature._featureId,_feature._layerId,g.id);
				
			},
			beforeclose:function(grid, eOpts)
			{
				Ext.Array.remove(fn_grid_results_ids_array,g.id);
				
				Ext.Array.clean(fn_grid_results_ids_array);
			
				grid.store.each(function(item){
					
					if(fn_featureIsHiglighted(item.get("_featureId"),item.get("_layerId")))
					{
						fn_featureUnHiglighted(item.get("_featureId"),item.get("_layerId"));
						
						fn_toggleHightlightFromAllResultsGrids(item.get("_featureId"),item.get("_layerId"),g.id);
					}
				});
			},
			viewready:function(grid, eOpts)
			{
				grid.store.each(function(item){
					
					if(fn_featureIsHiglighted(item.get("_featureId"),item.get("_layerId")))
					{
						grid.getSelectionModel().select(item,true,true);
					}
				});
				
				
				
			}
		}
	});
	
	return g;


}

function layerdatatable_win(_layerId)
{
	var _w_id = Ext.id();
	
	var chartwin = Ext.create('Ext.window.Window', {
		width: 800,
		height: 600,
		id:_w_id,
		minHeight: 400,
		minWidth: 550,
		hidden: false,
		resizable:{
			listeners:{
				resize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().unmask();
				},
				beforeresize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().mask().dom.style.zIndex = Ext.getCmp(_w_id).getEl().dom.style.zIndex;	
				}
			}
		},
		minimizable:true,
		constrain:true,
		listeners:{
			destroy:function(){
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
			},
			show: function(window, eOpts) {
				window.tools.restore.hide();
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
            },
			"minimize": function (window, opts) {
				window.tools.restore.show();
				window.tools.minimize.hide();
                window.collapse();
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
            },
		},
        tools: [{
            type: 'restore',
            handler: function (evt, toolEl, owner, tool) {
                var window = owner.up('window');
				window.tools.restore.hide();
				window.tools.minimize.show();
                window.expand('', false);
            }
        }],
		layout: 'fit'
	});

	return chartwin;
}