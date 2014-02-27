
/*version message*/

var get_selected_csw_service;

var get_selected_csw_service_name;

var pending_name_csw="";

var csw_dataStore=[];

var csw_store= new Ext.data.ArrayStore({
	fields: [
    {name: 'nam'},
    {name: 'url'}
  ]
});



var csw_store_layers=new Ext.data.SimpleStore({
    fields: ['name'],
    data :[]
});

var sm = new Ext.grid.CheckboxSelectionModel();

var csw_store_columns=new Ext.grid.ColumnModel([
	sm,
	{header: csw_service_columns_name, dataIndex: "nam", sortable: true,width:200},
	{header: csw_service_columns_url, dataIndex: "url", sortable: true,width:255}
]);

var csw_store_layers_columns=new Ext.grid.ColumnModel([
        {header: "Name", dataIndex:"name", sortable: true,width:100},
        {header: "Title", dataIndex:"title", sortable: true,width:140},
		{dataIndex: "service_URL", hidden: true},
        {header: "Abstract", dataIndex:"abstract",width:200},
		{header: "Queryable", dataIndex:"namespace",width:60}
]);

var csw_form=new Ext.FormPanel({
            title: csw_form_title,
			region:'center',
			hidden:true,
			autoHeight:true,
			items: [{ 
					xtype:'panel',
					layout:'form',
					height:74,
					items:[{xtype: 'textfield',
					id:'url_csw',
					anchor:'100%',
					fieldLabel: csw_url_wms_label,
					width:300}]
            },{
			xtype:'toolbar',
			items:['->',
				{xtype:'tbbutton',
				text:csw_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
				
					csw_AddService(Ext.getCmp('url_csw').getValue());
				}
			}
			]},{
			xtype:'grid',
			id:'csw_grid_services',
			title:csw_list_name,
			loadMask:true,
			sm: sm,
			height:345,
			columnLines: true,
			ds:csw_store,
			cm:csw_store_columns,
			bbar:['->',
				{
				xtype:'button',
				text:csw_service_remove,
				iconCls:'mapTree_remove16',
				handler:function(){
				
					Ext.MessageBox.confirm(csw_remove_service_title,csw_remove_service_message,function(ans)
					{
							if (ans=="yes")
							{
								Ext.getCmp('csw_grid_services').getSelectionModel().each(function(record) {
								
									Ext.each(csw_store.data.items,function(item,index){
										
										if (item)
										{
											if (item.get('url')==record.get('url'))
											{
												var  toBeDeleted=csw_store.getAt(index);
												
												csw_store.remove(toBeDeleted);
												
												csw_store.commitChanges();
											}
										}
									});
									
									Ext.getCmp('csw_grid_services').reconfigure(csw_store,csw_store_columns);
									
								});
							}
					});
				}
				}]
			}]
});

function csw_AddService(csw_url)
{
	Ext.getCmp('csw_grid_services').loadMask.show();

	Ext.Ajax.request({
		url:"php_source/proxies/csw_isvalid_url.php?url="+csw_url,
		timeout:10000,
		success:function(result,response)
		{
			var csw_result=Ext.decode(result.responseText);
							
			var csw_isValid=csw_result.isValid;
							
			if (csw_isValid=="true")
			{
				var isonmap=false;
								
				var csw_ServiceTitle=csw_result.serviceTitle;
								
				csw_store.each(function(item){
								
					if (item.get('url')==csw_url)
					{
						isonmap=true;
					}
				});
							
				if (!isonmap)
				{
								
					TaskLocation = Ext.data.Record.create([
						{name: "nam", type: "string"},
						{name: "url", type: "string"}
					]);

					var record = new TaskLocation({nam:csw_ServiceTitle,url:csw_url});
									
					csw_store.add(record);
									
					csw_store.commitChanges();
									
					Ext.getCmp('csw_grid_services').reconfigure(csw_store,csw_store_columns);
					
					metadata_map_newCheckedService(csw_url,csw_ServiceTitle);
				}
				else
				{
					Ext.Msg.alert(csw_service_title_error, csw_service_message_error_service_already_exists);	
				}
								
			}
			else
			{
				Ext.Msg.alert(csw_service_title_error, csw_service_message_error);

			}
			
			Ext.getCmp('csw_grid_services').loadMask.hide();
		},
		failure:function()
		{
			Ext.Msg.alert(csw_service_title_error, csw_service_message_error_service_not_response);
			
			metadata_map_newCheckedService(csw_url,csw_url);
			
			Ext.getCmp('csw_grid_services').loadMask.hide();
		}
	});

	
	
}