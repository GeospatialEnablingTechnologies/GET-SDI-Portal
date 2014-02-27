/*version message*/

var quicksearch_Columns = [
	{name:'featureid',mapping:'featureid'},
	{name:'serviceURL',mapping:'serviceURL'},
	{name:'visibleWMS',mapping:'visibleWMS'},
	{name:'epsg',mapping:'epsg'},
	{name:'baselayer',mapping:'baselayer'},
	{name:'serviceUsername',mapping:'serviceUsername'},
	{name:'servicePassword',mapping:'servicePassword'},
	{name:'ATT1',mapping:'ATT1'},
	{name:'ATT2',mapping:'ATT2'},
	{name:'ATT3',mapping:'ATT3'}
	
];


var quicksearch_store = new Ext.data.Store({
		url: "modules/quickSearch/php/quicksearch.php",
		reader: new Ext.data.XmlReader({
			record: 'RECORD'
			}, 
			quicksearch_Columns
		),
		listeners:{
			beforeload:function(store){
				if (typeof store.proxy.activeRequest.read != 'undefined') 
				{ 
					Ext.Ajax.abort(store.proxy.activeRequest.read); 
				} 
			
			},
			load: function(store, options) {
			
				store.clearFilter();
			
				store.filterBy(function(record)
				{
					return fc_isVisibleLayerFromBasename(record.get("baselayer"),record.get("visibleWMS"));
					
				});
				
			}
		}
});



var quicksearch_templace = new Ext.XTemplate(
        '<tpl for="."><div class="search-item" style="border-bottom:1px solid #e3e3e3;">',
            '<h3><span>{ATT1}<br />{ATT2}</span><br/>{ATT3}</h3>',
        '</div></tpl>'
    );

var quicksearch_Cntrl=new Ext.form.ComboBox({
	emptyText:quickSearch_emptyText,
	typeAhead: false,
	hideTrigger:true,
	width: 220,
	height:300,
	store:quicksearch_store,
	valueField: 'ATT1',
	tpl: quicksearch_templace,
	itemSelector: 'div.search-item',
	displayField: 'ATT1',
	mode: 'remote',
	minChars : 1,
	onSelect: function(record){
		
		var server_constructor="&service=WFS&request=GetFeature&featureid="+record.data.featureid+"&outputFormat=GML2&srsName="+record.data.epsg+"&service_layers="+record.data.baselayer+"&service_uri="+record.data.serviceURL;

		var authentication=fc_createAuthentication(record.data.serviceUsername,record.data.servicePassword);
		
		var url_php_gml="php_source/proxies/proxy_gml.php?"+authentication+"&";
		
		var url_gml=url_php_gml+"gmlLang="+language+"&gmlFormat=gml&"+server_constructor;
		
		var url_geometry=url_php_gml+"gmlLang="+language+"&gmlFormat=geometry&"+server_constructor;
			
		var url_attributes=url_php_gml+"gmlLang="+language+"&gmlFormat=attributes&"+server_constructor;
	
		var featureObj={
			featureId:record.data.featureid,
			serviceURI:record.data.serviceURL,
			layerBasename:record.data.baselayer,
			hasFId:true,
			epsg:record.data.epsg,
			serviceType:"WFS",
			serviceVersion:"",
			url_gml:url_gml,
			url_geometry:url_geometry,
			url_attributes:url_attributes,
			serviceAuthentication:authentication,
			layerVectorFormat:"gml"
		};
						
		windowFeatureInfo(featureObj);
		
		fc_showVectorOnMap(url_gml,record.data.epsg,"gml");
	}
});

quicksearch_Cntrl.store.filter("patron", 'ddd');