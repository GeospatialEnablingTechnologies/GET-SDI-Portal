Ext.define('serviceType', {
     extend: 'Ext.data.Model',
     fields: [
         {name: 'servicetype', type: 'string'},
		 {name: 'serviceform', type: 'object'}
     ]
 });

var maptab_services_manager_gridpanel_store=Ext.create('Ext.data.Store', {
    model: 'serviceType',
	data:[]
 });

var maptab_services_manager= new Ext.Window({ 
	width:740,
	height:550,
	minWidth:740,
	minHeight:550,
	constrain:true,
	modal:true,
	shim:true,
	title:_maptab_services_manager,
	resizable:true,
	closeAction:'hide',
	layout:'fit',
	listeners:{
		show:function(){
		
			Ext.getCmp('maptab_services_manager_gridpanel_columns_service_type').items.each(function(form){
				if (form.isVisible())
				{
					form.hide();
					form.show();
				}
			});
		}
	
	},
	items:[
		{
			xtype:'panel',
			layout:'border',
			border:false,
			items:
			[
				{
					xtype:'gridpanel',
					region:'west',
					id:'maptab_services_manager_gridpanel_service_type',
					width:160,
					listeners:{
						itemclick:function(dv, record, item, index, e) {
							
							Ext.getCmp('maptab_services_manager_gridpanel_columns_service_type').items.each(function(form){
								form.hide();
							});
							
							record.get('serviceform').show();
						}
					},
					store:maptab_services_manager_gridpanel_store,
					columns:[{
							header:_maptab_services_manager_gridpanel_columns_service_title, dataIndex: "servicetype", sortable: true,width:158
					}]
				},
				{
					xtype:'panel',
					region:'center',
					layout:'fit',
					id:'maptab_services_manager_gridpanel_columns_service_type',
					items:[]
				}
			]
		}
	]
});
