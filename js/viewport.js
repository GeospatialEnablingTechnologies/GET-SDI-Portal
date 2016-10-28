/************viewport.js**********************/
/**** creates and initialize the viewport ****/
/**** and basic features of the application **/


/******loads all the necessary extjs libraries*****/
Ext.require(['*']);

/******(ext obj) TabsViewportUi: handles the viewport of the application*****/
TabsViewportUi = Ext.extend(Ext.Viewport, {
    layout: 'border',
    initComponent: function() {
        this.items =[
			{
				xtype:'panel',
				region:'north',
				id:'viewport_north',
				border:false,
				bodyStyle:{"background-color":"#e3e3e3"},
				height:60, /*change the height of the north panel (banner) according to your needs*/
				html:'<img src="'+topBanner+'" style="position: absolute;left:0px;">'
				//<img src="'+topRightBanner+'" style="position: absolute;right:0px;">'
			},
			{
				xtype:'tabpanel',
				id:'viewport_center',
				border:false,
				region:'center',
				listeners:{
				    'tabchange':function(){
						try{map.updateSize();}catch(err){}
						try{metadata_map.updateSize();}catch(err){}
				    }
				},
				items:[
					
					{
						xtype:'panel',
						title:_viewport_maptab,
						id:'viewport_maptab',
						border:false,
						layout:'fit',
						items:[maptab]
					},
					{
						xtype:'panel',
						title:_viewport_metadatatab,
						id:'viewport_metadatatab',
						border:false,
						layout:'fit',
						items:[metadatatab]
					},
					{
						xtype:'panel',
						title:_viewport_filestab,
						border:false,
						layout:'fit',
						items:[filestab]
					},
					{
						xtype:'panel',
						title:_viewport_abouttab,
						border:false,
						layout:'fit',
						html:"<iframe src='"+host+"about/"+aboutFile+"' height='100%' width='100%' frameborder='no'></iframe>"
					}/*,
					{
						xtype:'panel',
						title:_viewport_manualtab,
						border:false,
						layout:'fit',
						html:"<iframe src='"+host+"about/"+manualFile+"' height='100%' width='100%' frameborder='no'></iframe>"
					}*/
				]
			}
		];
		
		TabsViewportUi.superclass.initComponent.call(this);
    }
	
});

/******When Ext is ready, it renders the viewport TabsViewport to the html body*****/
/******it also initialize other features such as quicktips and text selection*****/
Ext.onReady(function() {

    Ext.QuickTips.init();
	Ext.override(Ext.grid.View, { enableTextSelection: true });
    var cmp1 = new TabsViewport({
        renderTo: Ext.getBody()
    });
	
    cmp1.show();
});
 
/******(ext obj) TabsViewport: initialize the viewport object TabsViewportUi*****/
TabsViewport = Ext.extend(TabsViewportUi, {
    initComponent: function() {
        TabsViewport.superclass.initComponent.call(this);
		
    }
});