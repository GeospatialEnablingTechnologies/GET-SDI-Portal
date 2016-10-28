var print_template=0;

var print_code="";

var print_btn=[
	{xtype: 'tbseparator'},
	{
		xtype:'button',
		id:'print_btn',
		iconCls:'maptab_toolbar_general_print',
		tooltip:_maptab_toolbar_general_print,
		text:_maptab_toolbar_general_print,
		handler:function(){
			
			var w=fn_print_window();
			
			w.show();
		}
	}]

var print_tabpanel=[
	{
		xtype:'label',
		text:_maptab_toolbar_general_print_layout
	},
	{
		xtype:'combobox',
		id:'print_choose_template',
		store:new Ext.data.SimpleStore({
			fields: ['index','template'],
			data:[]
		}),
		editable:false,
        queryMode: 'local',
        displayField: 'template',
        valueField: 'index',
		forceSelection: true,
		triggerAction: 'all',
		selectOnFocus: false,
		listeners:{
			select:function(combo, record, eOpts)
			{
				var index = combo.getValue();
				
				print_template=_config_print_layouts[index];
			}
		}
	}]

init_onload_fn.push(init_print);

function init_print()
{
	//Ext.getCmp("maptab_toolbar_north").add(print_btn);
	
	var _layout_data=[];
	
	Ext.getCmp("maptab_toolbar_print_tab").add(print_tabpanel);
	Ext.getCmp("maptab_toolbar_print_tab").add(print_btn);
	
	var i=0;
	
	Ext.each(_config_print_layouts,function(item)
	{
		if (item._is_default)
		{
			Ext.getCmp("print_choose_template").emptyText=[item._print_identifier_title];
			
			print_template=item;
		}
	
		_layout_data.push([i,item._print_identifier_title]);
		
		i++;
	});
	
	Ext.getCmp("print_choose_template").getStore().loadData(_layout_data);
}

function fn_print()
{
	var p=new fn_get();
		
	p._async=true;
		
	p._data=[{
		_serviceType:"PRINTCLASS",
		_html:print_code
	}]
		
	p._timeout=5000;
	
	p._success=function(_response, _opts){
		
		var _response=Ext.JSON.decode(_response.responseText)[0];
		
		window.open(_response._response);
	};
		
	p.get();
	
	print_code="";
}

function fn_print_window()
{
	var _w_id = Ext.id();
	
	var _w=new Ext.Window({ 
		width:800,
		height:600,
		id:_w_id,
		closeAction:'destroy',
		modal:false,
		layout:'border',
		resizable:{
			listeners:{
				resize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().unmask();
					
					Ext.get("print_frame_id").setHeight(Ext.getCmp(_w_id).getHeight()-60);
				
					Ext.get("print_frame_id").setWidth(Ext.getCmp(_w_id).getWidth()-15);
				},
				beforeresize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().mask().dom.style.zIndex = Ext.getCmp(_w_id).getEl().dom.style.zIndex;
				}
			}
		},
		minimizable:true,
		constrain:true,
		tbar:[{
			xtype:'button',
			iconCls:'maptab_toolbar_general_print',
			tooltip:_maptab_toolbar_general_print,
			handler:function(){
				
				print_code=window.frames["print_frame"].createCode();
				
				fn_print();
			}
		}],
		listeners:{
			destroy:function(){
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
			},
			show: function(window, eOpts) {
				window.tools.restore.hide();
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
            },
			"minimize": function (window, opts) {
				window.tools.restore.show();
				window.tools.minimize.hide();
                window.collapse();
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
            },
		},
        tools: [{
            type: 'restore',
            handler: function (evt, toolEl, owner, tool) {
                var window = owner.up('window');
				window.tools.restore.hide();
				window.tools.minimize.show();
                window.expand('', false);
            }
        }],
		html:"<iframe width='100%' height='800px' name=\"print_frame\" id=\"print_frame_id\" frameborder='0' src='modules/print/print.html'></iframe>"
	});
	
	return _w;
}