/*version message*/

var mmk=0;
TabsViewportUi = Ext.extend(Ext.Viewport, {
    width: 555,
    layout: 'border',
	
    initComponent: function() {
        this.items = 
			[{
				xtype: 'panel',
				resizable:true,
				region: 'north',
				id:'north_id',
				height: 100,
				html:'<div id="top_panel" class="top_panel"><img src="images/'+logopic+'"></div>'
			},{				
				xtype:'tabpanel',
				region:'center',
				id:'main_tabpanel',
				activeItem: 0,
				border:false,
				listeners: {
					'tabchange': function(tabPanel, tab){
						if ((tab.id=="metadataTab") && (mmk==0))
						{
							makeMetadataMap();
							mmk=1;
						}
						if ((tab.id=="map3dTab") && (mmk==0))
						{
							make3DMap();
							mmk=1;
						}
                }},
				items: [{
					title:title_mapTab,
					id:'mapTab',
					border:false,
					layout:'fit',
					items:[mapViewport]
				}
				,{
					title:title_metadataTab,
					id:'metadataTab',
					border:false,
					layout:'fit',
					items:[metadataViewport]
				},
				
				{
					title:title_fileTab,
					id:'fileTab',
					layout:'fit',
					items:[fileViewport]
				},{
					title:title_help,
					id:'helpTab',
					layout:'fit',
					html:"<iframe src='"+getsdiportal_URI+"php_source/proxies/selectFile.php?lang="+language+"&file=help' height='100%' width='100%' frameborder='no'></iframe>"
				},{
					title:title_about,
					id:'aboutTab',
					layout:'fit',
					html:"<iframe src='"+getsdiportal_URI+"php_source/proxies/selectFile.php?lang="+language+"&file=about' height='100%' width='100%' frameborder='no'></iframe>"
				}]
			}];
			
        TabsViewportUi.superclass.initComponent.call(this);
    }
	
	
});

	
Ext.onReady(function() {
    Ext.QuickTips.init();
    var cmp1 = new TabsViewport({
        renderTo: "platform_div"
    });
	
    cmp1.show();
});
 
TabsViewport = Ext.extend(TabsViewportUi, {
    initComponent: function() {
        TabsViewport.superclass.initComponent.call(this);
    }
});


