/**
 * lotusbreath FilterRow plugin for extjs 4.2.1
 * 
 * @version 0.0.1
 * @author lotusbreath http://www.lotusbreath.com
 */
Ext.namespace('Ext.ux.grid');

Ext.ux.grid.FilterRow = function(config) {
	Ext.apply(this, config);
	this.addEvents("change");
	Ext.ux.grid.FilterRow.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.grid.FilterRow, Ext.util.Observable, {
			options : {
				marginWidth : 100
			},
			init : function(grid) {

				this.grid = grid;
				this.grid.addClass('filter-row');
				var view = grid.getView();
				grid.on('afterRender', this.renderFields, this);
				grid.on('resize', this.resizeFields, this);
				grid.on('columnresize', this.resizeFields, this);
				this.on('change', function(filterRow) {
							grid.store.baseParams = {};
							grid.store.clearFilter();
							
							for (var i in filterRow.data) {
								if (i && filterRow.data[i] != null)
									//grid.store.filter(i, filterRow.data[i]);
								if(filterRow.data[i]!=""){				
								
									var s= new RegExp(filterRow.data[i], "g");
									grid.store.filter(i,s);
									//grid.store.filter([Ext.create('Ext.util.Filter', {property: "TITLOS", value: /407/, anyMatch:false })]);
								}
							}
						}, grid);
			},
			'renderFields' : function() {
				var grid = this.grid;
				var filterRow = this;
				var cols = (grid.columns);
				var gridId = grid.id;
				Ext.each(cols, function(col) {
							var filterDivId = gridId + "-filter-" + col.id;
							Ext.get(col.id).appendChild({
										tag : 'div',
										cls : 'x-small-filterEle filterElement',
										id : filterDivId,
										html : ''
									});
							if (!col.hidden) {
								var filterEle = col.filterElement;
								if (filterEle) {
									if (filterEle.getXType() == 'combo') {
										filterEle.on('select',
												this.applyChangeEvent, this,
												editor);
									} else {
										filterEle.on('change',
												this.applyChangeEvent, this,
												filterEle);
									}
									new Ext.Panel({
												border : false,
												layout : 'fit',
												items : filterEle,
												renderTo : filterDivId
											});
								}

							}
						}, this);
			},
			onChange : function() {
				this.fireEvent("change", {
							filter : this,
							data : this.getFilterData()
						});
			},
			resizeFields : function() {
				var grid = this.grid;
				var cols = grid.columns;

				Ext.each(cols, function(col) {
							if (!col.hidden) {
								var filterEle = col.filterElement;
								if (filterEle) {
									filterEle.setWidth(col.width
											- this.options.marginWidth);
								}
							}
						}, this);
			},
			applyChangeEvent : function(filterEle) {
				if (filterEle.filterOption == 'NoFilter') {
					filterEle.filterOption = '';
				}
				this.onChange();

			},
			getFilterData : function() {
				var grid = this.grid;
				var cols = grid.columns;
				var data = {};
				var value = '';
				var dataIndex = '';
				Ext.each(cols, function(col) {
							if (!col.hidden) {
								var filterEle = col.filterElement;
								if (filterEle) {
									value = filterEle.getValue();
									if (filterEle.getXType() == 'datefield'
											&& value && value.format) {
										value = value.format(filterEle.format);
									}
									dataIndex = filterEle.dataIndex
											? filterEle.dataIndex
											: col.dataIndex;
									data[dataIndex] = value;
								}
							}
						});
				return data;
			}
		});