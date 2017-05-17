/**
 * Created by simeon on 11/14/2016.
 */

var swipe_translation = {
    el_gr: {
        button_title: 'Swipe',
        combo_select: 'Επιλέξτε ένα επίπεδο'
    },
    en_us: {
        button_title: 'Swipe',
        combo_select: 'Select a layer to swipe'
    }
}

var swipe_choose_LayerCombo = new fn_storeColumnsServiceLayers();
var swipe_layer = null;
var swipe_button = null;
var swipe_combo = null;

function init_swipe() {

    var overlayers = mapGetlayersBy("isBaseLayer", false);
    swipe_choose_LayerCombo_populate();

    var swipe = new OpenLayers.Control.Swipe({map: map, swipeLayer: null});
    map.addControls([swipe]);

    swipe_button =
        {
            xtype: 'button',
            id: 'swipebutton',
            iconCls: 'swiper_button',
            enableToggle: true,
            toggleGroup: 'map_control_one_btn_allowed_group',
            tooltip: swipe_translation[language].button_title,
            text: swipe_translation[language].button_title,
            toggleHandler: function (item, state) {


                if (!state) {
                    try {
                        map.removeLayer(swipe_layer);
                    }
                    catch (err){}
                    Ext.getCmp('swipe_choose_layero').setValue(swipe_translation[language].combo_select);
                    Ext.getCmp('swipe_choose_layero').disable();
                    swipe.deactivate();
                }
                else {
                    fn_toggleControl('swipe', state);
                    Ext.getCmp('swipe_choose_layero').enable();
                }
            }
        }
    ;

    swipe_combo = {
        xtype: 'combobox',
        flex: 0,
        id: 'swipe_choose_layero',
        emptyText: swipe_translation[language].combo_select,
        store: swipe_choose_LayerCombo.store,
        queryMode: 'local',
        displayField: '_layerTitle',
        valueField: '_layerId',
        forceSelection: true,
        triggerAction: 'all',
        editable: false,
        disabled: true,
        listeners: {
            afterrender: function (combo) {
                // var recordSelected = combo.getStore().getAt(0);
                // combo.setValue(recordSelected.get('_layerId'));
            },
            select: function (combo, records) {

                swipe.deactivate();

                try {
                    map.removeLayer(swipe_layer);
                }
                catch (err){}


                try{
                    var ly = records[0].data._layerObject;
                    
                    var timest = null;
                    if (typeof ly._layer.params.TIME !=="undefined"){
                        timest = ly._layer.params.TIME;
                    }
                    
                    var ATMFILTER = null;
                    if (typeof ly._layer.params.ATMFILTER !=="undefined"){
                        ATMFILTER = ly._layer.params.ATMFILTER;
                    }

                    var MAXCC = null;
                    if (typeof ly._layer.params.MAXCC !=="undefined"){
                        MAXCC = ly._layer.params.MAXCC;
                    }

                    var CLOUDCORRECTION = null;
                    if (typeof ly._layer.params.CLOUDCORRECTION !=="undefined"){
                        CLOUDCORRECTION = ly._layer.params.CLOUDCORRECTION;
                    }

                    var CLOUDBUFFER = null;
                    if (typeof ly._layer.params.CLOUDBUFFER !=="undefined"){
                        CLOUDBUFFER = ly._layer.params.CLOUDBUFFER;
                    }

                    var PRIORITY = null;
                    if (typeof ly._layer.params.PRIORITY !=="undefined"){
                        PRIORITY = ly._layer.params.PRIORITY;
                    }

                    var PREVIEW = null;
                    if (typeof ly._layer.params.PREVIEW !=="undefined"){
                        PREVIEW = ly._layer.params.PREVIEW;
                    }

                    var GAIN = null;
                    if (typeof ly._layer.params.GAIN !=="undefined"){
                        GAIN = ly._layer.params.GAIN;
                    }

                    var GAMMA = null;
                    if (typeof ly._layer.params.GAMMA !=="undefined"){
                        GAMMA = ly._layer.params.GAMMA;
                    }

                    var OFFSET = null;
                    if (typeof ly._layer.params.OFFSET !=="undefined"){
                        OFFSET = ly._layer.params.OFFSET;
                    }

                    var QUALITY = null;
                    if (typeof ly._layer.params.QUALITY !=="undefined"){
                        QUALITY = ly._layer.params.QUALITY;
                    }

                    var UPSAMPLING = null;
                    if (typeof ly._layer.params.UPSAMPLING !=="undefined"){
                        UPSAMPLING = ly._layer.params.UPSAMPLING;
                    }

                    var DOWNSAMPLING = null;
                    if (typeof ly._layer.params.DOWNSAMPLING !=="undefined"){
                        DOWNSAMPLING = ly._layer.params.DOWNSAMPLING;
                    }

                    swipe_layer = new OpenLayers.Layer.WMS(
                        ly._layerName,
                        ly._layer.url,
                        {
                            "layers": ly._layerName,
                            "format": ly._layerFormat,
                            "version": "1.1.1",
                            "transparent": "TRUE",
                            "styles": "",
                            "time": timest,
                            "ATMFILTER": ATMFILTER,
                            "MAXCC": MAXCC,
                            "CLOUDCORRECTION": CLOUDCORRECTION,
                            "CLOUDBUFFER": CLOUDBUFFER,
                            "PRIORITY": PRIORITY,
                            "PREVIEW": PREVIEW,
                            "GAIN": GAIN,
                            "GAMMA": GAMMA,
                            "OFFSET": OFFSET,
                            "QUALITY": QUALITY,
                            "UPSAMPLING": UPSAMPLING,
                            "DOWNSAMPLING": DOWNSAMPLING
                        });

                    map.addLayers([swipe_layer]);

                    swipe.activate();
                }
                catch (err){}

            }
        }
    };


    Ext.getCmp('maptab_toolbar_search_tab').insert(1, swipe_combo);
    Ext.getCmp('maptab_toolbar_search_tab').insert(1, swipe_button);
    Ext.getCmp('maptab_toolbar_search_tab').insert(1, {xtype: 'tbseparator'});

    mapOnRemoveLayer(swipe_choose_LayerCombo_populate);

    mapOnAddLayer(swipe_choose_LayerCombo_populate);

}

function swipe_choose_LayerCombo_populate() {
    swipe_choose_LayerCombo.store.removeAll();
    var overlayers = mapGetlayersBy("isBaseLayer", false);
    for (var i = overlayers.length - 1; i >= 0; i--) {
        var layer = overlayers[i];
        swipe_choose_LayerCombo.store.add({
            _layerId: layer._layerObject._layerId,
            _layerName: layer._layerObject._layerName,
            _layerTitle: layer._layerObject._layerTitle,
            _layerAbstract: layer._layerObject._layerAbstract,
            _layerLegend: layer._layerObject._layerLegend,
            _loadedStatus: layer._layerObject._loadedStatus,
            _layerObject: layer._layerObject,
            _serviceObject: layer._serviceObject
        });
    }
}

init_onload_fn.push(init_swipe);

