var googlegeocoding_map;
var googlegeocoding_fromcontext=false;
var googlegeocoding_map_marker;
var googlegeocoding_map_marker_layer;
var googlegeocoding_window; 
var googlegeocoding_service;

var googlegeocoding_translation={
	el_gr:{
		_googlegeocoding_results_panel:'Google Γεωκωδικοποίηση',
		_googlegeocoding_search_placeholder:'Αναζήτηση Διεύθυνσης',
		_googlegeocoding_search_btn:'Αναζήτηση',
		_googlegeocoding_clear_btn:'Καθαρισμός'
	},
	en_us:{
		_googlegeocoding_results_panel:'Google Geocoding',
		_googlegeocoding_search_placeholder:'Search Address',
		_googlegeocoding_search_btn:'Search',
		_googlegeocoding_clear_btn:'Clear'
	}

}

var googlegeocoding_store=new Ext.data.Store({
	proxy: {
		type: 'ajax',
		url: host+"modules/googlegeocoding/src/index.php",
		reader: {
			root: 'results'
        }
	},
	fields: [
		{name:'formatted_address', type: 'string'},
		{name:'geometry', type: 'object'}
	]
});

function googlegeocoding_setcoordinates(value, metaData, record, row, col, store, gridView)
{

	var img="<img src='images/zoomExtent.png' width='14' height='14' onclick=\"maptab_toolbar_general_setCoordinates("+value.location.lng+","+value.location.lat+",'EPSG:4326');\">";
	
	return img;
}

var googlegeocoding_results_grid=new Ext.grid.Panel({
		border:true,
		columnLines:true,
		split: true,
		region:'center',
		id:'googlegeocoding_results_grid_id',
		store:googlegeocoding_store,
		tbar:['->',{
			xtype:'button',
			text:googlegeocoding_translation[language]._googlegeocoding_clear_btn,
			iconCls:'maptab_toolbar_search_clear',
			handler:function(){
				
				Ext.getCmp("googlegeocoding_search_text").setValue("");
				
				googlegeocoding_store.removeAll();
				
				if(maptab_toolbar_general_update_setCoordinates_marker_layer)
				{
					maptab_toolbar_general_update_setCoordinates_marker_layer.destroy();
				}
					
			}
		},{
			xtype:'button',
			text:googlegeocoding_translation[language]._googlegeocoding_search_btn,
			iconCls:'maptab_toolbar_search',
			handler:function(){
				
				googlegeocoding_store.removeAll();
				
				googlegeocoding_store.getProxy().extraParams = {
					address:Ext.getCmp("googlegeocoding_search_text").getValue(),
					language:language
				}
				
				googlegeocoding_store.load();
				
			}
		}],
		columns:[
			{dataIndex: "geometry", width:26, renderer:googlegeocoding_setcoordinates},
			{dataIndex: "formatted_address", sortable: true, flex:1}
			
		]
	});

	

var googlegeocoding_results_panel ={
	xtype:'panel',
	id:'googlegeocoding_results_panel',
	title:googlegeocoding_translation[language]._googlegeocoding_results_panel,
	region:'center',
	autoScroll:true,
	layout:'border',
	iconCls:'maptab_accordion_icon',
	items:[{
			xtype:'textfield',
			anchor:'100%',
			id:'googlegeocoding_search_text',
			region:'north',
			emptyText:googlegeocoding_translation[language]._googlegeocoding_search_placeholder
		},
		googlegeocoding_results_grid
	]
}

function init_googlegeocoding()
{
	Ext.getCmp("maptab_west").insert(1,googlegeocoding_results_panel);
	
}

init_onload_fn.push(init_googlegeocoding);