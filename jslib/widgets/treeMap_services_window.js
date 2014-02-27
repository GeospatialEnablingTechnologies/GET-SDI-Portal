/*version message*/

Ext.namespace('service_store'); 
Ext.namespace('service_columns'); 
Ext.namespace('wms_form');
Ext.useShims=true;

var store_services_grid=new Ext.grid.GridPanel({
	title:'Services',
	ds: store_service_store,
	cm: store_service_columns
});

var store_service_columns=new Ext.grid.ColumnModel([
	{header: "Name", dataIndex: "name", sortable: true,width:116},
	{header: "Url", dataIndex: "url", sortable: true,width:116}
]);

var store_service_store=new Ext.data.SimpleStore({
    fields: ['id', 'name','url'],
    data :[['WMS','name','url']],
	autoLoad:true
});

var service_store=new Ext.data.SimpleStore({
    fields: ['id', 'value'],
    data :[
		
		['WMS',wms_form],
		['WFS',wfs_form],
		['CSW',csw_form],
		['WMTS',wmts_form],
		['WMC',wmc_form],
		['KML',kml_form],
		['ATOM',atom_form],
		['GeoRSS',georss_form]
		],
	autoLoad:true
});


var service_columns=new Ext.grid.ColumnModel([
	{header: treeMap_services_window_service_column, dataIndex: "id", sortable: true,width:116}
]);

var service_list=new Ext.grid.GridPanel({
	height:400,
	width:120,
	region:'west',
	ds: service_store,
	cm: service_columns,
	listeners:{
			click:function() {
            service_list.getSelectionModel().each(function(record) {
				form_panel.getEl().mask();
				form_panel.items.each(function(list){
					list.hide();
				});
				record.get('value').show();
				form_panel.getEl().unmask();
				
            });}
	}
});




var form_panel=new Ext.Panel({
	region:'center',
	items:[wms_form,wfs_form,csw_form,wmts_form,wmc_form,kml_form,atom_form,georss_form]
});


var treeMap_service_window=new Ext.Window({ 
	width:740,
	height:560,
	modal:true,
	shim:true,
	resizable:false,
	title:treeMap_services_window_service_list,
	closeAction:'hide',
	plain:true,
	layout:'border',
	items:[form_panel,service_list]
});
