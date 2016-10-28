Ext.define('Ext.ux.grid.column.ActionPro', {
	extend: 'Ext.grid.column.Action',
	alias: 'widget.actioncolumnpro',

	enableContextMenu: true,

	draggable: false,
	hideable: false,
	menuDisabled: true,
	sortable: false,
	resizable: false,
	fixed: true,
	autoWidth: true,
	iconWidth: 22,
	align: 'center',
	hideIndex: null,
	hiddenCls: Ext.baseCSSPrefix + 'action-col-img-noaction',

	constructor: function(config) {
		var cfg = Ext.apply({}, Ext.clone(config)),
			items = cfg.items || [this];

		for (var index = 0; index < items.length; index++) {
			var item = items[index];
			// patch for 4.1 beta bug
			//if (item.iconCls) {
			//	this.iconCls = item.iconCls;
			//}
			if (item.hideIndex || item.clsFn) {
				item.tmpIconCls = item.iconCls || '';
				item.tmpTooltip = item.tooltip || '';
				if (item.iconCls) delete item.iconCls;
				if (item.tooltip) delete item.tooltip;
				Ext.apply(item, {
					getClass: function(v, meta, record) {
						var i = 0;
						if (v) i = v.match(/<img/g).length;

						if (this.items[i].hideIndex) {
							if (record.get(this.items[i].hideIndex)) {
								this.items[i].tooltip = '';
								return this.hiddenCls;
							}
						}
						if (!this.items[i].clsFn) {
							this.items[i].tooltip = this.items[i].tmpTooltip;
							return this.items[i].tmpIconCls;
						} else {
							var cls = this.items[i].clsFn.call(this, record, this.items[i]);
							return cls;
						}
					}
				});
			}
		}
		cfg.itemCount = items.length;

		this.callParent([cfg]);
	},

	initComponent: function() {
		if (this.autoWidth) {
			this.width = (this.iconWidth * this.itemCount);
		}
		if (this.width) {
			this.minWidth = this.width;
			this.maxWidth = this.width;
		}

		this.callParent();

		this.addEvents(
			'actionclick'
		);
	},

	onRender: function() {
		this.callParent(arguments);
		if (this.enableContextMenu) {
			this.grid = this.up('tablepanel');
			this.grid.menu = Ext.create('Ext.menu.Menu');
			this.grid.on('itemcontextmenu', this.showContextMenu, this);
		}
	},

	onDestroy: function() {
		if (this.rendered && this.grid.menu) {
			this.grid.menu.destroy();
			this.grid.menu = null;
			delete this.grid.menu;
		}
		this.callParent(arguments);
	},

	showContextMenu: function(view, record, el, index, e, ops) {
		var actionIndex = this.ownerCt.getHeaderIndex(this);
		var actionEl = Ext.get(Ext.get(el).query('td')[actionIndex]).first();
		var imgs = actionEl.query('img');
		this.grid.menu.items.each(function(item) {
			item.destroy();
		});
		this.grid.menu.items.clear();
		Ext.each(imgs, function(item) {
			var img = Ext.get(item);
			if (!img.hasCls(this.hiddenCls)) {
				var clss = Ext.String.trim(img.getAttribute('class')).split(' ');
				var cls = clss[clss.length - 1];
				this.grid.menu.add({
					text: img.getAttribute('data-qtip'),
					iconCls: cls,
					handler: function() {
						this.fireEvent('actionclick', this.grid, this.grid.getStore(), record, cls);
					},
					scope: this
				});
			}
		}, this);
		if (this.grid.menu.items.getCount()) {
			this.grid.getSelectionModel().select(record);
			this.grid.menu.showAt(e.getX(), e.getY(), true);
			e.stopEvent();
		}
	},

	processEvent: function(type, view, cell, recordIndex, cellIndex, e){
		if (type == 'dblclick') {
			return false;
		}
		if (type == 'click') {
			var match = e.getTarget().className.match(this.actionIdRe);
			if (match) {
				var tmp = Ext.String.trim(e.getTarget().className).split(' ');
				var action = tmp[tmp.length - 1];
				if (action != '' && action != this.hiddenCls) {
					this.fireEvent('actionclick', view.ownerCt, view.getStore(), view.getStore().getAt(recordIndex), action);
				}
			}
		}

		return this.callParent(arguments);
	}
});
