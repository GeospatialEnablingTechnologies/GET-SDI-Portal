/*version message*/

var map_getinfo_map=[];

var map_getinfo_tabs=[];

var map_getinfo_window=new Ext.Window({ 
	width:740,
	height:510,
	modal:true,
	resizable:false,
	title:window_getinfo_title,
	closeAction:'hide',
	plain:true,
	layout:'border',
	items:[map_getinfo_map,map_getinfo_tabs]
});