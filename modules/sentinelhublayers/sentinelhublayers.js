/**
 * Created by taskaris on 2017-04-25.
 */

var sentinellayers_translation = {
    el_gr: {
        settings: 'Ρυθμίσεις Sentinel-Hub',
        apply: 'Εφαρμογή',
        alert: 'Δεν υποστηρίζεται για το συγκεκριμένο επίπεδο'
    },
    en_us: {
        settings: 'Sentinel-Hub Settings',
        apply: 'Εφαρμογή',
        alert: 'Δεν υποστηρίζεται για το συγκεκριμένο επίπεδο'
    }

};

var sentinellayers_sentinel_option = 0;

function sentinellayers_setoptions(_layer) {

    if(typeof _layer.layer.url !== 'undefined'){
        if (_layer.layer.url.includes('sentinel') && sentinellayers_sentinel_option == 0) {
            _maptab_west_layer_layer_menu_components.push(new sentinellayers_options);
            sentinellayers_sentinel_option = 1;
        }
    }

}

var sentinellayers_options = function () {
    return {
        text: sentinellayers_translation[language].settings,
        handler: function () {
            var _layerId = this.ownerCt._nodeId;
            if (mapFindLayerById(_layerId).url.includes('sentinel')) {
                var _w = sentinellayers_option_w(_layerId);
                _w.show();
            }
            else {
                alert(sentinellayers_translation[language].alert);
            }
        }
    }

};

function sentinellayers_option_w(_layerId) {

    var ATMFILTER;
    var MAXCC;
    var CLOUDCORRECTION;
    var CLOUDBUFFER;
    var PRIORITY;
    var PREVIEW;
    var GAIN;
    var GAMMA;
    var OFFSET;
    var QUALITY;
    var UPSAMPLING;
    var DOWNSAMPLING;

    if (mapFindLayerById(_layerId).params['ATMFILTER'] != null) {
        ATMFILTER = mapFindLayerById(_layerId).params['ATMFILTER'];
    }
    else {
        ATMFILTER = null;
    }

    if (mapFindLayerById(_layerId).params['MAXCC'] != null) {
        MAXCC = mapFindLayerById(_layerId).params['MAXCC'];
    }
    else {
        MAXCC = null;
    }

    if (mapFindLayerById(_layerId).params['CLOUDCORRECTION'] != null) {
        CLOUDCORRECTION = mapFindLayerById(_layerId).params['CLOUDCORRECTION'];
    }
    else {
        CLOUDCORRECTION = null;
    }

    if (mapFindLayerById(_layerId).params['CLOUDBUFFER'] != null) {
        CLOUDBUFFER = mapFindLayerById(_layerId).params['CLOUDBUFFER'];
    }
    else {
        CLOUDBUFFER = null;
    }

    if (mapFindLayerById(_layerId).params['PRIORITY'] != null) {
        PRIORITY = mapFindLayerById(_layerId).params['PRIORITY'];
    }
    else {
        PRIORITY = null;
    }

    if (mapFindLayerById(_layerId).params['PREVIEW'] != null) {
        PREVIEW = mapFindLayerById(_layerId).params['PREVIEW'];
    }
    else {
        PREVIEW = null;
    }

    if (mapFindLayerById(_layerId).params['GAIN'] != null) {
        GAIN = mapFindLayerById(_layerId).params['GAIN'];
    }
    else {
        GAIN = null;
    }

    if (mapFindLayerById(_layerId).params['GAMMA'] != null) {
        GAMMA = mapFindLayerById(_layerId).params['GAMMA'];
    }
    else {
        GAMMA = null;
    }

    if (mapFindLayerById(_layerId).params['OFFSET'] != null) {
        OFFSET = mapFindLayerById(_layerId).params['OFFSET'];
    }
    else {
        OFFSET = null;
    }

    if (mapFindLayerById(_layerId).params['QUALITY'] != null) {
        QUALITY = mapFindLayerById(_layerId).params['QUALITY'];
    }
    else {
        QUALITY = null;
    }


    if (mapFindLayerById(_layerId).params['UPSAMPLING'] != null) {
        UPSAMPLING = mapFindLayerById(_layerId).params['UPSAMPLING'];
    }
    else {
        UPSAMPLING = null;
    }

    if (mapFindLayerById(_layerId).params['DOWNSAMPLING'] != null) {
        DOWNSAMPLING = mapFindLayerById(_layerId).params['DOWNSAMPLING'];
    }
    else {
        DOWNSAMPLING = null;
    }

    var _w = new Ext.Window({
        width: 410,
        height: 400,
        modal: true,
        resizable: false,
        plain: true,
        layout: 'border',
        title: sentinellayers_translation[language].settings + ': ' + mapFindLayerById(_layerId).options._layerObject._layerTitle,
        items: [{
            xtype: 'form',
            region: 'center',
            bodyStyle: 'padding: 10px;',
            items: [
                {
                    xtype: 'combo',
                    loadMask: true,
                    // anchor: '100%',
                    autoScroll: true,
                    autoShow: true,
                    id: 'ATMFILTER_id',
                    fieldLabel: 'Atmospheric Correction Filter',
                    labelStyle: 'width:220px',
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: [["NONE", "NONE"], ["DOS1", "DOS1"], ["ATMCOR", "ATMCOR"]]
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: ATMFILTER,
                    value: ATMFILTER,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                },
                {
                    xtype: 'numberfield',
                    id: 'MAXCC_id',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    fieldLabel: 'Maximum Allowable Cloud Coverage(%)',
                    value: MAXCC,
                    maxValue: 100,
                    minValue: 0,
                    decimalPrecision: 2,
                    step: 0.1,
                },
                {
                    xtype: 'combo',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    loadMask: true,
                    autoScroll: true,
                    autoShow: true,
                    id: 'CLOUDCORRECTION_id',
                    fieldLabel: 'Cloud Correction',
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: [["NONE", "none"], ["REPLACE", "replace"]]
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: CLOUDCORRECTION,
                    value: CLOUDCORRECTION,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                },
                {
                    xtype: 'numberfield',
                    id: 'CLOUDBUFFER_id',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    fieldLabel: 'Cloud Buffer(m)',
                    value: CLOUDBUFFER,
                    maxValue: 1000,
                    minValue: 0
                },
                {
                    xtype: 'combo',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    loadMask: true,
                    autoScroll: true,
                    autoShow: true,
                    id: 'PRIORITY_id',
                    fieldLabel: 'Priority',
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: [["mostRecent", "mostRecent"], ["leastRecent", "leastRecent"], ["leastCC", "leastCC"]]
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: PRIORITY,
                    value: PRIORITY,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                },
                {
                    xtype: 'combo',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    loadMask: true,
                    autoScroll: true,
                    autoShow: true,
                    id: 'PREVIEW_id',
                    fieldLabel: 'Preview',
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: [["0", "0"], ["1", "1"], ["2", "2"]]
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: PREVIEW,
                    value: PREVIEW,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                },
                {
                    xtype: 'numberfield',
                    id: 'GAIN_id',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    fieldLabel: 'Gain',
                    value: GAIN,
                    maxValue: 100,
                    minValue: 0.01,
                    decimalPrecision: 2,
                    step: 0.1,
                },
                {
                    xtype: 'numberfield',
                    id: 'GAMMA_id',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    fieldLabel: 'Gamma',
                    value: GAMMA,
                    maxValue: 10,
                    minValue: 0.1,
                    decimalPrecision: 2,
                    step: 0.1,
                },
                {
                    xtype: 'numberfield',
                    id: 'OFFSET_id',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    fieldLabel: 'Offset',
                    decimalPrecision: 2,
                    step: 0.1,
                    value: OFFSET,
                    maxValue: 1.0,
                    minValue: -1.0
                },
                {
                    xtype: 'numberfield',
                    id: 'QUALITY_id',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    fieldLabel: 'Quality',
                    value: QUALITY,
                    maxValue: 100,
                    minValue: 0
                },
                {
                    xtype: 'combo',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    loadMask: true,
                    autoScroll: true,
                    autoShow: true,
                    id: 'UPSAMPLING_id',
                    fieldLabel: 'Image Upsampling Method',
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: [["NEAREST", "NEAREST"], ["BILINEAR", "BILINEAR"], ["BICUBIC", "BICUBIC"]]
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: UPSAMPLING,
                    value: UPSAMPLING,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                },
                {
                    xtype: 'combo',
                    // anchor: '100%',
                    labelStyle: 'width:220px',
                    loadMask: true,
                    autoScroll: true,
                    autoShow: true,
                    id: 'DOWNSAMPLING_id',
                    fieldLabel: 'Image Downsampling Method',
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: [["NEAREST", "NEAREST"], ["BILINEAR", "BILINEAR"], ["BICUBIC", "BICUBIC"], ["BOX", "BOX"]]
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: DOWNSAMPLING,
                    value: DOWNSAMPLING,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                }

            ],
            bbar: ['->', {
                xtype: 'button',
                text: sentinellayers_translation[language].apply,
                handler: function () {

                    ATMFILTER = Ext.getCmp("ATMFILTER_id").getValue();
                    MAXCC = Ext.getCmp("MAXCC_id").getValue();
                    CLOUDCORRECTION = Ext.getCmp("CLOUDCORRECTION_id").getValue();
                    CLOUDBUFFER = Ext.getCmp("CLOUDBUFFER_id").getValue();
                    PRIORITY = Ext.getCmp("PRIORITY_id").getValue();
                    PREVIEW = Ext.getCmp("PREVIEW_id").getValue();
                    GAIN = Ext.getCmp("GAIN_id").getValue();
                    GAMMA = Ext.getCmp("GAMMA_id").getValue();
                    OFFSET = Ext.getCmp("OFFSET_id").getValue();
                    QUALITY = Ext.getCmp("QUALITY_id").getValue();
                    UPSAMPLING = Ext.getCmp("UPSAMPLING_id").getValue();
                    DOWNSAMPLING = Ext.getCmp("DOWNSAMPLING_id").getValue();

                    mapFindLayerById(_layerId).mergeNewParams({'ATMFILTER': ATMFILTER});
                    mapFindLayerById(_layerId).mergeNewParams({'MAXCC': MAXCC});
                    mapFindLayerById(_layerId).mergeNewParams({'CLOUDCORRECTION': CLOUDCORRECTION});
                    mapFindLayerById(_layerId).mergeNewParams({'CLOUDBUFFER': CLOUDBUFFER});
                    mapFindLayerById(_layerId).mergeNewParams({'PRIORITY': PRIORITY});
                    mapFindLayerById(_layerId).mergeNewParams({'PREVIEW': PREVIEW});
                    mapFindLayerById(_layerId).mergeNewParams({'GAIN': GAIN});
                    mapFindLayerById(_layerId).mergeNewParams({'GAMMA': GAMMA});
                    mapFindLayerById(_layerId).mergeNewParams({'OFFSET': OFFSET});
                    mapFindLayerById(_layerId).mergeNewParams({'QUALITY': QUALITY});
                    mapFindLayerById(_layerId).mergeNewParams({'UPSAMPLING': UPSAMPLING});
                    mapFindLayerById(_layerId).mergeNewParams({'DOWNSAMPLING': DOWNSAMPLING});

                    // console.log(mapFindLayerById(_layerId));

                }
            }]
        }]
    });

    return _w;
}

init_onload_fn.push(init_sentinelhublayers);

function init_sentinelhublayers() {

    mapOnAddLayer(sentinellayers_setoptions);

    var overlayers = mapGetlayersBy("isBaseLayer", false);

    for (var i = overlayers.length - 1; i >= 0; i--) {

        var _layer = {
            layer: overlayers[i]
        };

        sentinellayers_setoptions(_layer);
    }
}