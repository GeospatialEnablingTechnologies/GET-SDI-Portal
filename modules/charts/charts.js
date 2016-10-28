var tbarChartLang={
	"en_us":{
		chartTbarBtn:'Diagrams',
		chartTitle:'Diagrams',
		chooseLayer:'Choose Layer',
		x_axis:'X Axis',
		y_axis:'Y Axis',
		chartType:'Chart Type',
		chartShowBtn:'Show Chart',
		chartTypePie:'Pie Chart',
		chartTypeColumn:'Column Chart',
		chartTypeLine:'Line Chart',
		columnCountTitle:'Count'
	},
	"el_gr":{
		chartTbarBtn:'Διαγράμματα',
		chartTitle:'Διαγράμματα',
		chooseLayer:'Επιλογή Επιπέδου',
		x_axis:'Άξονας Χ',
		y_axis:'Άξονας Υ',
		chartType:'Τύπος Διαγράμματος',
		chartShowBtn:'Εμφάνιση Διαγράμματος',
		chartTypePie:'Διάγραμμα Πίτας',
		chartTypeColumn:'Διάγραμμα Στηλών',
		chartTypeLine:'Διάγραμμα Γραμμής',
		columnCountTitle:'Πλήθος'
	}
}

var chartStore = "";

var chartBtnGeneralTab=[
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		iconCls:'chart',
		tooltip:tbarChartLang[language].chartTitle,
		handler:function(){
			
			var _w = new fn_ChartWinSettings('');
			
			_w.show();
		}
	}];



var tbarChartWindowBtn={
	xtype:'button',
	iconCls:'chart',
	tooltip:tbarChartLang[language].chartTbarBtn,
	handler:function(){

		var _layerId; 
		
		if (typeof Ext.getCmp(this.findParentByType("grid").id)._layerId!=="undefined")
		{
			var _store = Ext.getCmp(this.findParentByType("grid").id).getStore();
		
			_layerId = Ext.getCmp(this.findParentByType("grid").id)._layerId;
		
			var _w = fn_ChartWinSettings(_store,_layerId);
			
			_w.show();
			
			var record = Ext.getCmp("chartLayerCombo").getStore().findRecord('_layerId', _layerId);
			
			Ext.getCmp("chartLayerCombo").fireEvent('select', Ext.getCmp("chartLayerCombo"), [record]);
			
			Ext.getCmp("chartLayerCombo").disable();
		}
	}
}

function init_chart()
{
	fetureGridTopBarRightBtns.push(tbarChartWindowBtn);
	
	//Ext.getCmp("maptab_toolbar_north").add(chartBtnGeneralTab);
	
	mapOnRemoveLayer(chartLayersComboStorePopulate);
	
	mapOnAddLayer(chartLayersComboStorePopulate);
	
	chartLayersComboStorePopulate();
	
}

init_onload_fn.push(init_chart);


function chartLayersCombo()
{ 	
	var _arr = new mapGetlayersBy("isBaseLayer",false);
}


var chartLayerStore = Ext.create('Ext.data.Store', {
	fields: ['_layerTitle', '_layerId','_layerLegend'],
	data: []
});

function chartLayersComboStorePopulate()
{
	chartLayerStore.removeAll();

	var overlayers=mapGetlayersBy("isBaseLayer",false);

	for(var i=(overlayers.length-1);i>=0;i--)
	{
		if (typeof overlayers[i]._layerObject!=="undefined")
		{
			if (overlayers[i]._layerObject._attributesFields!=null)
			{		
				if (overlayers[i]._layerObject._attributesFields.length>0)
				{
					chartLayerStore.add({
						_layerTitle:overlayers[i]._layerObject._layerTitle,
						_layerId:overlayers[i]._layerObject._layerId,
						_layerLegend:overlayers[i]._layerObject._layerLegend
					});
				}
			}
		}
	}
}

function chartLayerAttributeStore()
{


}

function fn_ChartWinSettings(_store,_layerId)
{
	if (typeof _layerId==="undefined")
	{
		_layerId = "";
	}

	var chartwin = Ext.create('Ext.window.Window', {
		width: 400,
		height: 300,
		modal:true,
		closeAction:'destroy',
		hidden: false,
		id:'chartgeneralwin_id',
		maximizable: true,
		title: tbarChartLang[language].chartTitle,
		layout: 'fit',
		padding:5,
		items:[{
			xtype:'panel',
			layout:'form',
			items:[{
				xtype:'combo',
				fieldLabel:tbarChartLang[language].chooseLayer,
				id:'chartLayerCombo',
				store:chartLayerStore,
				editable:false,
				queryMode: 'local',
				displayField: '_layerTitle',
				valueField: '_layerId',
				value:_layerId,
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				listConfig: {
					getInnerTpl: function() {
						
						var tpl = '<img src="{_layerLegend}" align="left" width="20px" height="20px">{_layerTitle}';
						
						return tpl;
					}
				},
				listeners:{
					select:function(combo, record, eOpts)
					{
						var _layerId = Ext.getCmp('chartLayerCombo').getValue();
					
						var _x_Store = new fn_createAttributesComboStore(mapFindLayerById(_layerId)._layerObject._attributesFields);
						
						var _y_Store = new fn_createAttributesComboStore(mapFindLayerById(_layerId)._layerObject._attributesFields);
						
						Ext.getCmp("chartXAxisCombo").bindStore(_x_Store);
						Ext.getCmp("chartYAxisCombo").bindStore(_y_Store);
					}
				}
			},{
				xtype:'combo',
				fieldLabel:tbarChartLang[language].x_axis,
				id:'chartXAxisCombo',
				queryMode: 'local',
				displayField: '_attributeTranslation',
				valueField: '_attributeName',
				emptyText:_maptab_east_search_panel_criteria_choose_attribute,
				value:"",
				forceSelection: true,
				selectOnFocus: false,
				triggerAction: 'all',
				tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{_attributeTranslation}' + '</li></tpl>'),
				editable: false
			},{
				xtype:'combo',
				fieldLabel:tbarChartLang[language].y_axis,
				id:'chartYAxisCombo',
				queryMode: 'local',
				displayField: '_attributeTranslation',
				valueField: '_attributeName',
				emptyText:_maptab_east_search_panel_criteria_choose_attribute,
				value:"",
				forceSelection: true,
				selectOnFocus: false,
				triggerAction: 'all',
				tpl: new Ext.XTemplate('<tpl for=".">' + '<li style="height:22px;" class="x-boundlist-item" role="option">' + '{_attributeTranslation}' + '</li></tpl>'),
				editable: false
			},{
				xtype:'combo',
				fieldLabel:tbarChartLang[language].chartType,
				id:'chartTypeCombo',
				store: new Ext.data.SimpleStore({
				fields: ['title','value'],
					data: [
						[tbarChartLang[language].chartTypePie,"pie"],
						[tbarChartLang[language].chartTypeColumn,"column"],
						[tbarChartLang[language].chartTypeLine,"line"]
						
					]
				}), 
				displayField: 'title',
				valueField: 'value',
				emptyText:tbarChartLang[language].chartTypePie,
				value:"pie",
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				editable: false
			}]
		}],
		bbar:[
		'->',
		{
			xtype:'button',
			text:tbarChartLang[language].chartShowBtn,
			tooltip:tbarChartLang[language].chartShowBtn,
			iconCls:'chart',
			handler:function(){
			
				var _type = Ext.getCmp("chartTypeCombo").getValue();
				
				switch(_type)
				{
					case "pie":
						
						var y_axis = Ext.getCmp("chartYAxisCombo").getValue();
					
						var _w = fn_createPieChartWin(_store, mapFindLayerById(_layerId)._layerObject._attributesFields, y_axis);
						
						_w.show();
						
					break;
					
					case "column":
					
						var x_axis = Ext.getCmp("chartXAxisCombo").getValue();
					
						var x_axis_record = Ext.getCmp("chartXAxisCombo").getStore().findRecord("_attributeName",x_axis,0,false,true,true);
					
						
					
						var y_axis = Ext.getCmp("chartYAxisCombo").getValue();
						
						var y_axis_record = Ext.getCmp("chartXAxisCombo").getStore().findRecord("_attributeName",y_axis,0,false,true,true);
						
						
						
						var _w = fn_createColumnChartWin(_store, mapFindLayerById(_layerId)._layerObject._attributesFields, x_axis_record.data, y_axis_record.data);
						
						_w.show();
						
					break;
					
					case "line":
					
						var x_axis = Ext.getCmp("chartXAxisCombo").getValue();
					
						var x_axis_record = Ext.getCmp("chartXAxisCombo").getStore().findRecord("_attributeName",x_axis,0,false,true,true);
					
						
					
						var y_axis = Ext.getCmp("chartYAxisCombo").getValue();
						
						var y_axis_record = Ext.getCmp("chartXAxisCombo").getStore().findRecord("_attributeName",y_axis,0,false,true,true);
						
						
						
						var _w = fn_createLineChartWin(_store, mapFindLayerById(_layerId)._layerObject._attributesFields, x_axis_record.data, y_axis_record.data);
						
						_w.show();
						
					break;
				}
			
			}
		}],
		listeners:{
			"show":function(){
			
				
			}
		}
	});
	
	return chartwin;

}


function fn_createColumnChartWin(_store, _attributesFields, x_axis, y_axis)
{
	var cmbId=Ext.id();
	
	var chartBars=[];
	
	if ((typeof y_axis!=="undefined") && (y_axis!="") && (y_axis!=null))
	{
		var target = Ext.create('Ext.data.Store', {
			model: _store.model
		});

		Ext.each(_store.getRange(), function (record) {
		
			var newRecordData = Ext.clone(record.copy().data);
			
			var model = new _store.model(newRecordData, newRecordData.id);
			
			target.add(model);
		});
		
		var y_axis_title = y_axis._attributeTranslation;
		
		var y_axis_field = y_axis._attributeName;
		
		if (y_axis._attributeName == x_axis._attributeName)
		{
			target.group(y_axis._attributeName);
			
			var groups = target.getGroups();
			
			var groupStore = Ext.create('Ext.data.Store', {
				fields: [{
					name: x_axis._attributeName, mapping: 'name'
				},{
					name: 'total', convert: function(value, record){
						return record.raw.children.length;
					}
				}],
				data: groups
			});
			
			y_axis_title = tbarChartLang[language].columnCountTitle;
			
			y_axis_field = 'total';
			
		}else{
		
			var groupStore = target;
		
		}
		
		
		
		chartBars.push(Ext.create('Ext.chart.Chart', {
			style: 'background:#fff',
			animate: true,
			shadow: true,
			store: groupStore,
			axes: [{
                type: 'Numeric',
                position: 'left',
                fields: [y_axis_field],
                /*label: {
                    renderer: Ext.util.Format.numberRenderer('0,0')
                },*/
                title: y_axis_title,
                grid: true,
                minimum: 0
            }, {
                type: 'Category',
                position: 'bottom',
                fields: [x_axis._attributeName],
                title: x_axis._attributeTranslation
            }],
			series: [{
                type: 'column',
                axis: 'left',
                highlight: true,
                tips: {
                  trackMouse: true,
                  width: 160,
                  height: 28,
                  renderer: function(storeItem, item) {
						this.setTitle(storeItem.get(x_axis._attributeName)+"<br>"+storeItem.get(y_axis_field));
					}
                },
                label: {
					display: 'insideEnd',
					'text-anchor': 'middle',
                    field: y_axis._attributeTranslation,
                    renderer: Ext.util.Format.numberRenderer('0'),
                    orientation: 'vertical',
                    color: '#333'
                },
                xField: x_axis._attributeName,
                yField: y_axis_field
            }]
		}))
		
	}
	
	var chartwin = Ext.create('Ext.window.Window', {
		width: 800,
		height: 600,
		minHeight: 400,
		minWidth: 550,
		hidden: false,
		maximizable: true,
		title: 'Column Chart',
		layout: 'fit',
		items:chartBars
		
	});
	
	return chartwin;

}

function fn_createLineChartWin(_store, _attributesFields, x_axis, y_axis)
{
	var cmbId=Ext.id();
	
	var chartBars=[];
	
	if ((typeof y_axis!=="undefined") && (y_axis!="") && (y_axis!=null))
	{
		var target = Ext.create('Ext.data.Store', {
			model: _store.model
		});

		Ext.each(_store.getRange(), function (record) {
		
			var newRecordData = Ext.clone(record.copy().data);
			
			var model = new _store.model(newRecordData, newRecordData.id);
			
			target.add(model);
		});
		
		var y_axis_title = y_axis._attributeTranslation;
		
		var y_axis_field = y_axis._attributeName;
		
		if (y_axis._attributeName == x_axis._attributeName)
		{
			target.group(y_axis._attributeName);
			
			var groups = target.getGroups();
			
			var groupStore = Ext.create('Ext.data.Store', {
				fields: [{
					name: x_axis._attributeName, mapping: 'name'
				},{
					name: 'total', convert: function(value, record){
						return record.raw.children.length;
					}
				}],
				data: groups
			});
			
			y_axis_title = tbarChartLang[language].columnCountTitle;
			
			y_axis_field = 'total';
			
		}else{
		
			var groupStore = target;
		
		}
		
		chartBars.push(Ext.create('Ext.chart.Chart', {
			style: 'background:#fff',
			animate: true,
			shadow: true,
			store: groupStore,
			axes: [{
                type: 'Numeric',
                position: 'left',
                fields: [y_axis_field],
                /*label: {
                    renderer: Ext.util.Format.numberRenderer('0,0')
                },*/
                title: y_axis_title,
                grid: true
            }, {
                type: 'Category',
                position: 'bottom',
                fields: [x_axis._attributeName],
                title: x_axis._attributeTranslation,
				label: {
					rotate: {
						degrees: 90
					}
			   }
            }],
			series: [{
                type: 'line',
                axis: 'left',
				smooth: true,
                highlight: true,
                tips: {
					trackMouse: true,
					width: 240,
					smooth: true,
					renderer: function(storeItem, item) {
						this.setTitle(storeItem.get(x_axis._attributeName)+"<br>"+storeItem.get(y_axis_field));
					}
                },
                label: {
					display: 'insideEnd',
					'text-anchor': 'middle',
                    field: y_axis._attributeTranslation,
                    renderer: Ext.util.Format.numberRenderer('0'),
                    orientation: 'vertical',
                    color: '#333'
                },
				
                xField: x_axis._attributeName,
                yField: y_axis_field,
				markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0
                }
            }]
		}))
		
	}
	
	var chartwin = Ext.create('Ext.window.Window', {
		width: 800,
		height: 600,
		minHeight: 400,
		minWidth: 550,
		hidden: false,
		maximizable: true,
		title: 'Column Chart',
		layout: 'fit',
		items:chartBars/*[{
			xtype:'grid',
			store:groupStore,
			columns:[{
				header:'x_axis',
				dataIndex:x_axis._attributeName
			},{
				header:'y_axis',
				dataIndex:y_axis_field
			}]
		
		
		}]*/
		
	});
	
	return chartwin;

}

function fn_createPieChartWin(_store, _attributesFields, _groupField)
{
	
	var cmbId=Ext.id();
	
	var chartBars=[];
	
	if ((typeof _groupField!=="undefined") && (_groupField!="") && (_groupField!=null))
	{
		var target = Ext.create('Ext.data.Store', {
			model: _store.model
		});

		Ext.each(_store.getRange(), function (record) {
		
			
		
			var newRecordData = Ext.clone(record.copy().data);
			
			var model = new _store.model(newRecordData, newRecordData.id);
			
			target.add(model);
		});
		
		
		target.group(_groupField);
		
		var groups = target.getGroups();
		
		var groupStore = Ext.create('Ext.data.Store', {
			fields: [{
				name:_groupField, mapping: 'name'
			}, {
				name: 'total', convert: function(value, record){
					return record.raw.children.length;
				}
			}],
			data: groups
		});
		
		
		chartBars.push(Ext.create('Ext.chart.Chart', {
			style: 'background:#fff',
			animate: true,
			shadow: true,
			store: groupStore,
			series: [{
				type: 'pie',
				field: 'total',
				showInLegend: true,
				donut: false,
				highlight: {
					segment: {
						margin: 20
					}
				},
				tips: {
					trackMouse: true,
					width: 160,
					height: 28,
					renderer: function(storeItem, item) {
						
						this.setTitle(storeItem.get(_groupField) + ': ' + storeItem.get('total'));
					}
				},
				label: {
					field: _groupField,
					display: 'rotate',
					contrast: true,
					font: '18px Arial'
				}
			}]
		}))
		
	}
	
	if (Ext.getCmp("chartwin_id"))
	{
		Ext.getCmp("chartwin_id").destroy();
	}
	
	var chartwin = Ext.create('Ext.window.Window', {
		width: 800,
		height: 600,
		minHeight: 400,
		minWidth: 550,
		hidden: false,
		id:'chartwin_id',
		maximizable: true,
		title: 'Column Chart',
		layout: 'fit',
		items:chartBars
	});
	
	return chartwin;
}