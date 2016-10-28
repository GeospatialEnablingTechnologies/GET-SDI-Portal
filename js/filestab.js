var filestree_store = Ext.create('Ext.data.TreeStore', {
	proxy: {
		type: 'ajax',
		url: host+'getFiles.php'
	},
	root: {
		text: _filestab_title,
		id: 'files',
		expanded: true
	}
});

var filestree = Ext.create('Ext.tree.Panel', {
	store: filestree_store,
	height: 300,
	width: 250,
	title: _filestab_title,
	useArrows: true,
	viewConfig : {
		listeners: {
			itemclick:function(tree, record, item, index, e, eOpts)
			{
				if(record.get("cls")=="file")
				{
					Ext.get('file_frame').set({
						src:record.get("id")
					});		
				}
			}
		}
	}
});

var filestab={
	xtype: 'panel',
	layout:'border',
	items:[{
		xtype: 'panel',
		border:false,
		region: 'west',
		title:_filestab_title,
		width: 260,
		split:true,
		layout: 'accordion',
		collapsible: true,
		activeItem: 0,
		items:[filestree]
	},
	{
		xtype:'panel',
		region:'center',
		layout:'border',
		border:false,
		items:[
			{
				xtype:'panel',
				html:"<iframe id='file_frame' height='100%' width='100%' frameborder='no'></frame>",
				region:'center',
				border:true
			}
		]
	}]
};