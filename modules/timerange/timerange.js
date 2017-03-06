
var timerange_translation  = {
    el_gr:{
        "title": 'Ενεργοποίσηση Χρονικού Παραθύρου για τα επιλεγμένα επίπεδα',
        "btnTip":'Ενεργοποίηση Χρονικού Παραθύρου',
        "btnPlay":'Play',
        "btnStop":'Stop',
        "btnPrevious":'Previous',
        "btnNext":'Forward',
        "layer": 'Επίπεδο',
        "layergridtitle": 'Επιλέξτε επίπεδο/επίπεδα',
        "translation_interval":'Ανανέωση(ms)'
    },
    en_us:{
        "title": 'Enable time window for selected map layers',
        "btnTip":'Enable Time Window',
        "btnPlay":'Play',
        "btnStop":'Stop',
        "btnPrevious":'Previous',
        "btnNext":'Forward',
        "layer": 'Layer',
        "layergridtitle": 'Selecte layer/layers',
        "translation_interval":'Interval(ms)'

    }
}

var timerange_window;

var timerange_layer_Name_Grid;

var timerange_slider;

var timerange_layer_set = [];

var timerange_min_datetime = 0;

var timerange_max_datetime = 100;

var timerange_t1 = null;
var timerange_t2 = null;

var p=parent;

var timerange_btn=[
    {xtype: 'tbseparator'},
    {
        xtype:'button',
        id:'timeragne_btn',
        iconCls:'maptab_toolbar_timerange',
        tooltip: timerange_translation[language].btnTip,
        handler:function(){

            try {
                timerange_window.destroy();
            } catch (err) {
            }

            var w=fn_timerange_window();

            mapOnRemoveLayer(timerange_remove_layer);

            mapOnAddLayer(timerange_add_layer);

            w.show();
        }
    }]



init_onload_fn.push(init_timerange);

function init_timerange()
{
    Ext.getCmp("maptab_toolbar_navigation_tab").add(timerange_btn);

}

function fn_timerange_window()
{
    var stop = true;

    timerange_window=new Ext.Window({
        id: 'timerange_window',
        width:600,
        height:210,
        title: timerange_translation[language].title,
        closeAction:'destroy',
        modal:false,
        layout:'border',
        tbar:[

            {
                xtype:'button',
                iconCls:'maptab_toolbar_timerange_previous',
                tooltip: timerange_translation[language].btnPrevious,
                handler:function(){
                    timerange_get_selected_layers_from_grid();
                    var interval = Ext.getCmp("timerange_interval_field").getValue();
                    if ((interval=="") || (interval==null) || (interval<3600))
                    {
                        interval=3600;
                    }
                    timerange_slider_move(-interval);
                }
            },

            {
                xtype:'button',
                iconCls:'maptab_toolbar_timerange_play',
                tooltip: timerange_translation[language].btnPlay,
                enableToggle: true,
                //handler:function(){
                //    timerange_get_selected_layers_from_grid();
                //}
                toggleHandler:function(btn,pressed)
                {
                    var interval = Ext.getCmp("timerange_interval_field").getValue();

                    if ((interval=="") || (interval==null) || (interval<3600))
                    {
                        interval=3600;
                    }

                    if(btn.pressed){
                        stop = false;
                        btn.setIconCls('maptab_toolbar_timerange_stop');
                        var task = {
                            run: function(){
                                if(!stop){
                                    timerange_slider_move(interval);
                                }else{
                                    runner.stop(task);
                                }
                            },
                            interval: 3000
                        };
                        var runner = new Ext.util.TaskRunner();
                        runner.start(task);

                        Ext.TaskManager.start({
                            run: function(){
                            },
                            interval: 1000
                        });
                    }
                    else{
                        stop = true;
                        btn.setIconCls('maptab_toolbar_timerange_play');
                    }
                }
            },

            {
                xtype:'button',
                iconCls:'maptab_toolbar_timerange_next',
                tooltip: timerange_translation[language].btnNext,
                handler:function(){
                    timerange_get_selected_layers_from_grid();
                    var interval = Ext.getCmp("timerange_interval_field").getValue();
                    if ((interval=="") || (interval==null) || (interval<3600))
                    {
                        interval=3600;
                    }
                    timerange_slider_move(interval);
                }
            },

            {
                xtype:'numberfield',
                id:'timerange_interval_field',
                width:120,
                emptyText:timerange_translation[language].translation_interval
            },

            timerange_create_slider()


        ],
        items: [
            timerange_create_list_layers()
        ],
        listeners:{
            resize:function(win)
            {


            }
        }

    });



    return timerange_window;
}

function timerange_slider_move(step)
{
    var current_min = timerange_slider.getValue(0);
    var current_max = timerange_slider.getValue(1);
    timerange_slider.setValue(0, current_min + step);
    timerange_slider.setValue(1, current_max + step);
}

function timerange_get_selected_layers_from_grid()
{
    timerange_layer_set = [];
    var layer_selected = timerange_layer_Name_Grid.getView().getSelectionModel().getSelection();
    Ext.each(layer_selected, function (item) {
        timerange_layer_set.push([item.data.layername, item.data.layerid]);
    });
}

function timerange_create_slider()
{
    timerange_slider = Ext.create('Ext.slider.Multi', {
        hideLabel: true,
        width: 380,
        minValue: timerange_min_datetime,
        maxValue: timerange_max_datetime,
        increment: 3600,
        values: [10, 90],
        tipText: function(thumb){
            var t3 = new Date(thumb.value * 1000);
            var year = t3.getFullYear();
            var mon = ('0' + (t3.getMonth() + 1)).slice(-2);
            var d = ('0' + t3.getDate()).slice(-2);
            var hour = ('0' + t3.getHours()).slice(-2);
            var min = ('0' + t3.getMinutes()).slice(-2);
            var sec = ('0' + t3.getSeconds()).slice(-2);
            var t4 = year + '-' + mon + '-' + d + ' ' + hour + ':' + min + ':' + sec;
            return Ext.String.format('{0}', t4);
        },
        listeners: {
            change: function (f, new_val) {
                timerange_get_selected_layers_from_grid();
                var dt1 = new Date(f.thumbs[0].value * 1000);
                var dt2 = new Date(f.thumbs[1].value * 1000);
                var dt = timerange_create_geoserver_time(dt1) + '/' + timerange_create_geoserver_time(dt2);
                Ext.each(timerange_layer_set, function(layer){
                    mapFindLayerById(layer[1]).mergeNewParams({'time':dt});
                });
            }
        }
    });

    return timerange_slider;
}

function timerange_create_geoserver_time(dt1){
    var dt1_year = dt1.getFullYear();
    var dt1_mon = ('0' + (dt1.getMonth() + 1)).slice(-2);
    var dt1_d = ('0' + dt1.getDate()).slice(-2);
    var dt1_hour = ('0' + dt1.getHours()).slice(-2);
    var dt1_min = ('0' + dt1.getMinutes()).slice(-2);
    var dt1_sec = ('0' + dt1.getSeconds()).slice(-2);
    var dt1_t4 = dt1_year + '-' + dt1_mon + '-' + dt1_d + 'T' + dt1_hour + ':' + dt1_min + ':' + dt1_sec + 'Z';
    return dt1_t4;
}

function timerange_create_list_layers()
{
    var timerange_grid_data = [];

    var overlayers=p.mapGetlayersBy("isBaseLayer",false);

    for(var i=0;i<overlayers.length;i++)
    {
        if (typeof overlayers[i]._layerObject!=="undefined")
        {
            var _layer=overlayers[i];

            if( typeof _layer._layerObject._dimension !=="undefined" && _layer._layerObject._dimension !== null)
            {
                timerange_grid_data.push([_layer.name, _layer.id]);

                var dimension = _layer._layerObject._dimension;

                var dimension_firt = dimension[0][0];
                var dimension_last = dimension[0][dimension[0].length-1];

                var min_datetime = new Date(dimension_firt);
                var max_datetime = new Date(dimension_last);

                if(timerange_t1 == null && timerange_t2 == null){
                    timerange_t1 = min_datetime.getTime()/1000;
                    timerange_t2 = max_datetime.getTime()/1000;
                }

                if(min_datetime.getTime()/1000 < timerange_t1){
                    timerange_t1 = min_datetime.getTime()/1000;
                }

                if(max_datetime.getTime()/1000 > timerange_t2){
                    timerange_t2 = max_datetime.getTime()/1000;
                }

                timerange_min_datetime = timerange_t1;
                timerange_max_datetime = timerange_t2;

            }


        }
    }

    timerange_slider.setMinValue(timerange_min_datetime);
    timerange_slider.setMaxValue(timerange_max_datetime);

    Ext.define('LayersDefinition', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'layername'},
            {name: 'layerid'}
        ]
    });

    var getlayersNameLocalStore = function() {
        return Ext.create('Ext.data.ArrayStore', {
            model: 'LayersDefinition',
            data: timerange_grid_data
        });
    };

    var sm = Ext.create('Ext.selection.CheckboxModel');
    timerange_layer_Name_Grid = Ext.create('Ext.grid.Panel', {
        store: getlayersNameLocalStore(),
        selModel: sm,
        columns: [
            {text: timerange_translation[language].layer, width: 540, dataIndex: 'layername'}
        ],
        columnLines: true,
        width: 595,
        height: 150,
        frame: true,
        title: timerange_translation[language].layergridtitle,
        iconCls: 'icon-grid'
    });

    return timerange_layer_Name_Grid;

}

function timerange_add_layer(_layer)
{
    console.log(_layer);
}

function timerange_remove_layer(_layer)
{
    console.log(_layer);
}


