Ext.define('serviceStoreModel', {
     extend: 'Ext.data.Model',
     fields: [
		{name: '_isSecure', type: 'string'},
        {name: '_serviceTitle', type: 'string'},
		{name: '_serviceUrl', type: 'string'},
		{name: '_serviceAbstract', type: 'string'},
		{name: '_version', type: 'string'},
		{name: '_serviceObject', type: 'object'}
     ]
});

function fn_storeColumnsService()
{
	var obj={
		store:Ext.create('Ext.data.Store', {
			model:'serviceStoreModel',
			data:[]
		}),
		columns:[
			{
				dataIndex:'_isSecure',
				sortable: true,
				width:40,
				hideable: false,
				renderer:fn_isSecure
			},
			{
				header:_maptab_services_manager_storecolumns_column_service_title,
				dataIndex:'_serviceTitle',
				sortable: true,
				width:200
			},
			{
				header:_maptab_services_manager_storecolumns_column_service_url,
				dataIndex:'_serviceUrl',
				sortable: true,
				width:200
			},
			{
				header:_maptab_services_manager_storecolumns_column_service_version,
				dataIndex:'_version',
				sortable: true,
				width:60
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

function fn_isSecure(value, metaData, record, row, col, store, gridView)
{

	if (value=="true")
	return "<img src=\""+host+"images/isSecure.png\" width=\"20px\" height=\"20px\">";
	else
	return "";
}

