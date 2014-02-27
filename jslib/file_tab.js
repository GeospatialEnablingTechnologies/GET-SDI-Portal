/*version message*/


var fileViewport=[{
	xtype: 'panel',
	layout:'border',
	items:[{
			xtype: 'panel',
			border:true,
			region: 'west',
			title:title_fileTab_Panel,
			width: 260,
			layout: 'accordion',
			collapsible: true,
			resizable:true,
			activeItem: 0,
			layoutConfig: {
				animate: true,
				sequence: true
			},
			items:[fileTree]
		},
		{
			xtype:'panel',
			region:'center',
			layout:'border',
			border:false,
			resizable:true,
			items:[
				{
					xtype:'panel',
					html:"<iframe id='file_frame' height='100%' width='100%' frameborder='no'></frame>",
					region:'center',
					border:true
				}
				]
		}]
	}];
