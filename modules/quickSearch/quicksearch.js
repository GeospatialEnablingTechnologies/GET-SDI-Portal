/*version message*/

var quicksearchLang={
	"en_us":{
		emptyComboText:'Quick Search'
	},
	"el_gr":{
		emptyComboText:'Γρήγορη Αναζήτηση'
	}
}

Ext.define('QuickSearchModel', {
    extend: 'Ext.data.Model',
    fields: [{
        name: '_displayField',
        type: 'string'
    },{
        name: '_label',
        type: 'string'
    },{
        name: '_featureId',
        type: 'string'
    },{
        name: '_layerId',
        type: 'string'
    },{
        name: '_srsName',
        type: 'string'
    },{
        name: '_featureUrl',
        type: 'string'
    },{
        name: '_featureGeomFormat',
        type: 'string'
    },{
        name: '_featureAttributes',
        type: 'string'
    }]
});


var quickSearchStore = Ext.create('Ext.data.Store', {
    model: 'QuickSearchModel',
    autoLoad: 'true',
	proxy: {
		type: 'ajax',
		url: host+"modules/quicksearch/src/index.php",
		reader: {
			type: 'json'
		}
	},
	listeners:{
		beforeload:function(store){
			Ext.Ajax.abort(); 
		}
	}
});

var quicksearch_template = new Ext.XTemplate(
        '<tpl for="."><div class="x-boundlist-item" style="border-bottom:1px solid #e3e3e3;">',
            '<span>{_label}</span>',
        '</div></tpl>'
    );

var quicksearch_field=[
	{xtype: 'tbseparator'},
	{
		xtype:'combo',
		emptyText:quicksearchLang[language].emptyComboText,
		typeAhead: false,
		hideTrigger:true,
		width:300,
		store:quickSearchStore,
		tpl:quicksearch_template,
		valueField: '_displayField',
		displayField: '_displayField',
		mode: 'remote',
		minChars : 1,
		listeners:
		{
			select: function(combo,record){
				
				var record=record[0];
				
				var _feature={
					_featureId:record.data._featureId,
					_layerId:record.data._layerId,
					_srsName:record.data._srsName,
					_featureUrl:record.data._featureUrl,
					_featureGeomFormat:record.data._featureGeomFormat,
					_featureAttributes:""
				};
				
				var _w = fn_featureInfoWindow(_feature);
				
				_w.show();
				
				fn_featureShowOnMap(record.data._featureId,record.data._layerId,record.data._srsName,record.data._featureUrl,record.data._featureGeomFormat,"");
				
				fn_featureHighlightFeatureInfo(_feature);
			}
		}
	}]

init_onload_fn.push(init_quicksearch);

function init_quicksearch()
{
	Ext.getCmp("maptab_toolbar_navigation_tab").add(quicksearch_field);	
}
