var compare_map = null;
var compare_swipe = null;
var compare_layer_1 = null;
var compare_layer_2 = null;
var compare_layerid = null;
var compare_choose_LayerCombo = new fn_storeColumnsServiceLayers();

var comparetimelapse_translation = {
    el_gr: {
        title: 'Sentinel-Hub Χρονική Σύγκριση',
        imageleft: 'Ρυθμίσεις αριστερής εικόνας',
        imageright: 'Ρυθμίσεις δεξιάς εικόνας',
        dayone: 'Ημερoμηνία',
        cloudone: 'Νέφωση Αριστερής Εικόνας (%)',
        cloudtwo: 'Νέφωση Δεξιάς Εικόνας (%)',
        daytwo: 'Ημερομηνία Δεξιάς Εικόνας',
        compare: 'Σύγκριση',
        timecompare: 'Χρονική Σύγκριση',
        combo_select: 'Επιλέξτε ένα επίπεδο',
        alert: 'Προσοχή',
        alertmsg: 'Παρακαλώ επιλέξτε ημερομηνίες σύγκρισης.',
        alertlayer: 'Παρακαλώ επιλέξτε επίπεδο',
        bookmark_place1: 'Θέση Α',
        bookmark_place2: 'Θέση Β'
    },
    en_us: {
        title: 'Sentinel-Hub Time Compare Analysis',
        imageleft: 'Left Image Settings',
        imageright: 'Right Image Settings',
        dayone: 'Image Date',
        daytwo: 'Right Image Date',
        cloudone: 'Left Image Cloud Cover (%)',
        cloudtwo: 'Right Image Cloud Cover (%)',
        compare: 'Compare',
        timecompare: 'Time Compare',
        combo_select: 'Select a layer',
        alert: 'Alert',
        alertmsg: 'Please select dates.',
        alertlayer: 'Please select a layer',
        bookmark_place1: 'Place Α',
        bookmark_place2: 'Place Β'
    }

};

var comparetimelapse = function () {
    return {
        text: comparetimelapse_translation[language].title,
        iconCls: 'clock',
        handler: function () {
            var _layerId = this.ownerCt._nodeId;
            if ((mapFindLayerById(_layerId)._serviceObject._isService) && ((mapFindLayerById(_layerId)._serviceObject._serviceType == "WFS") || (mapFindLayerById(_layerId)._serviceObject._serviceType == "WMS"))) {
                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;
                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                // console.log(_serviceObject);
                // console.log(_layerObject);

                var _w = fn_compareshowwindow(_layerObject, _serviceObject);

                _w.show();
            }
        }
    }
}

function fn_compareshowwindow(_layerObject, _serviceObject) {

    var mapid = Ext.id();

    var ATMFILTER = null;
    var MAXCC = null;
    var CLOUDCORRECTION = null;
    var CLOUDBUFFER = null;
    var PRIORITY = null;
    var PREVIEW = null;
    var GAIN = null;
    var GAMMA = null;
    var OFFSET = null;
    var QUALITY = null;
    var UPSAMPLING = null;
    var DOWNSAMPLING = null;

    var _w = new Ext.Window({
        title: comparetimelapse_translation[language].title + ': ' + _layerObject._layerTitle,
        width: 1200,
        height: 600,
        modal: true,
        resizable: false,
        plain: true,
        layout: 'border',
        items: [

            {
                xtype: 'panel',
                region: 'west',
                layout: 'fit',
                border: false,
                width: 225,
                // items: [
                //     {
                //         xtype: 'label',
                //         styleHtmlContent: true,
                //         height: '100px',
                //         html: comparetimelapse_translation[language].dayone
                //     },
                //     {
                //         xtype: 'datefield',
                //         id: 'compare_date1',
                //         name: 'date_one',
                //         maxValue: new Date()  // limited to the current date or prior
                //     },
                //     {
                //         xtype: 'label',
                //         styleHtmlContent: true,
                //         height: '100px',
                //         html: comparetimelapse_translation[language].cloudone
                //     },
                //     {
                //         xtype: 'numberfield',
                //         id: 'compare_cloud1',
                //         value: 20,
                //         maxValue: 99,
                //         minValue: 0
                //     }
                // ]
                items: [{
                    xtype: 'form',
                    region: 'center',
                    bodyStyle: 'padding: 10px;',
                    title: comparetimelapse_translation[language].imageleft,
                    items: [
                        {
                                xtype: 'datefield',
                                id: 'compare_date1',
                                name: 'date_one',
                                width: 200,
                                fieldLabel:comparetimelapse_translation[language].dayone,
                                maxValue: new Date()  // limited to the current date or prior
                        },
                        {
                            xtype: 'combo',
                            loadMask: true,
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            autoScroll: true,
                            autoShow: true,
                            id: 'ATMFILTER_id_l',
                            fieldLabel: 'Atmospheric Correction Filter',
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
                            id: 'MAXCC_id_l',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Maximum Allowable Cloud Coverage(%)',
                            value: MAXCC,
                            maxValue: 100,
                            minValue: 0,
                            decimalPrecision: 2,
                            step: 0.1
                        },
                        {
                            xtype: 'combo',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'CLOUDCORRECTION_id_l',
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
                            id: 'CLOUDBUFFER_id_l',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Cloud Buffer(m)',
                            value: CLOUDBUFFER,
                            maxValue: 1000,
                            minValue: 0
                        },
                        {
                            xtype: 'combo',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'PRIORITY_id_l',
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
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'PREVIEW_id_l',
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
                            id: 'GAIN_id_l',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Gain',
                            value: GAIN,
                            maxValue: 100,
                            minValue: 0.01,
                            decimalPrecision: 2,
                            step: 0.1,
                        },
                        {
                            xtype: 'numberfield',
                            id: 'GAMMA_id_l',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Gamma',
                            value: GAMMA,
                            maxValue: 10,
                            minValue: 0.1,
                            decimalPrecision: 2,
                            step: 0.1,
                        },
                        {
                            xtype: 'numberfield',
                            id: 'OFFSET_id_l',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Offset',
                            decimalPrecision: 2,
                            step: 0.1,
                            value: OFFSET,
                            maxValue: 1.0,
                            minValue: -1.0
                        },
                        {
                            xtype: 'numberfield',
                            id: 'QUALITY_id_l',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Quality',
                            value: QUALITY,
                            maxValue: 100,
                            minValue: 0
                        },
                        {
                            xtype: 'combo',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'UPSAMPLING_id_l',
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
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'DOWNSAMPLING_id_l',
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

                    ]
                }]
            },

            {
                xtype: 'panel',
                region: 'east',
                layout: 'fit',
                border: false,
                width: 225,
                // items: [
                //     {
                //         xtype: 'datefield',
                //         id: 'compare_date2',
                //         fieldLabel: comparetimelapse_translation[language].daytwo,
                //         width: 200,
                //         bodyPadding: 0,
                //         name: 'date_two',
                //         maxValue: new Date()  // limited to the current date or prior
                //     },
                //     {
                //         xtype: 'numberfield',
                //         id: 'compare_cloud2',
                //         fieldLabel: comparetimelapse_translation[language].cloudtwo,
                //         labelWidth: 150,
                //         width: 200,
                //         margin: "0 10 0 10",
                //         value: 20,
                //         maxValue: 99,
                //         minValue: 0
                //     }
                // ]
                items: [{
                    xtype: 'form',
                    region: 'center',
                    bodyStyle: 'padding: 10px;',
                    title: comparetimelapse_translation[language].imageright,
                    items: [
                        {
                            xtype: 'datefield',
                            id: 'compare_date2',
                            name: 'date_two',
                            width: 200,
                            fieldLabel:comparetimelapse_translation[language].dayone,
                            maxValue: new Date()  // limited to the current date or prior
                        },
                        {
                            xtype: 'combo',
                            loadMask: true,
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            autoScroll: true,
                            autoShow: true,
                            id: 'ATMFILTER_id_r',
                            fieldLabel: 'Atmospheric Correction Filter',
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
                            id: 'MAXCC_id_r',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Maximum Allowable Cloud Coverage(%)',
                            value: MAXCC,
                            maxValue: 100,
                            minValue: 0,
                            decimalPrecision: 2,
                            step: 0.1
                        },
                        {
                            xtype: 'combo',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'CLOUDCORRECTION_id_r',
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
                            id: 'CLOUDBUFFER_id_r',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Cloud Buffer(m)',
                            value: CLOUDBUFFER,
                            maxValue: 1000,
                            minValue: 0
                        },
                        {
                            xtype: 'combo',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'PRIORITY_id_r',
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
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'PREVIEW_id_r',
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
                            id: 'GAIN_id_r',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Gain',
                            value: GAIN,
                            maxValue: 100,
                            minValue: 0.01,
                            decimalPrecision: 2,
                            step: 0.1,
                        },
                        {
                            xtype: 'numberfield',
                            id: 'GAMMA_id_r',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Gamma',
                            value: GAMMA,
                            maxValue: 10,
                            minValue: 0.1,
                            decimalPrecision: 2,
                            step: 0.1,
                        },
                        {
                            xtype: 'numberfield',
                            id: 'OFFSET_id_r',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Offset',
                            decimalPrecision: 2,
                            step: 0.1,
                            value: OFFSET,
                            maxValue: 1.0,
                            minValue: -1.0
                        },
                        {
                            xtype: 'numberfield',
                            id: 'QUALITY_id_r',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            fieldLabel: 'Quality',
                            value: QUALITY,
                            maxValue: 100,
                            minValue: 0
                        },
                        {
                            xtype: 'combo',
                            // anchor: '100%',
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'UPSAMPLING_id_r',
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
                            // labelStyle: 'width:220px',
                            width: 200,
                            loadMask: true,
                            autoScroll: true,
                            autoShow: true,
                            id: 'DOWNSAMPLING_id_r',
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

                    ]
                }]
            },
            {
                xtype: 'panel',
                region: 'center',
                layout: 'fit',
                border: false,
                listeners: {
                    boxready: function () {
                        fn_compareCreateMap(mapid, _layerObject._layerId);
                    }
                },
                items: [{
                    xtype: 'panel',
                    html: "<div id=\"" + mapid + "\" style=\"width:100%;height:100% !important;\"></div>"
                }],

            }],
        dockedItems: [
            {
                xtype: 'toolbar',
                dock: 'bottom',
                layout : {
                    type : 'hbox',
                    pack : 'center'
                },
                items: [
                    {
                        xtype: 'button',
                        text: comparetimelapse_translation[language].compare,
                        iconCls: 'search',
                        margin: "0 10 0 0",
                        handler: function () {

                            var compare_date_1 = Ext.getCmp("compare_date1").getValue();
                            var compare_date_2 = Ext.getCmp("compare_date2").getValue();

                            if (compare_date_1 == null || compare_date_2 == null) {
                                Ext.MessageBox.alert(comparetimelapse_translation[language].alert, comparetimelapse_translation[language].alertmsg, function () {
                                    return true;
                                });
                            }
                            else {

                                compare_swipe.deactivate();

                                try {
                                    compare_map.removeLayer(compare_layer_1);
                                    compare_map.removeLayer(compare_layer_2);
                                }
                                catch (err) {
                                }

                                compare_date_1 = compare_date_1.toISOString();
                                compare_date_1 = compare_date_1.replace("+0000", "Z");
                                compare_date_1 = compare_date_1.replace("T22:", "T00:");

                                compare_date_2 = compare_date_2.toISOString();
                                compare_date_2 = compare_date_2.replace("+0000", "Z");
                                compare_date_2 = compare_date_2.replace("T22:", "T00:");

                                compare_layer_1 = mapFindLayerById(_layerObject._layerId).clone();
                                compare_layer_1.setVisibility(true);
                                compare_layer_1.mergeNewParams({'time': compare_date_1});
                                compare_layer_1.mergeNewParams({'ATMFILTER': Ext.getCmp("compare_date1").getValue()});
                                compare_layer_1.mergeNewParams({'MAXCC': Ext.getCmp("MAXCC_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'CLOUDCORRECTION': Ext.getCmp("CLOUDCORRECTION_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'CLOUDBUFFER': Ext.getCmp("CLOUDBUFFER_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'PRIORITY': Ext.getCmp("PRIORITY_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'PREVIEW': Ext.getCmp("PREVIEW_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'GAIN': Ext.getCmp("GAIN_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'GAMMA': Ext.getCmp("GAMMA_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'OFFSET': Ext.getCmp("OFFSET_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'QUALITY': Ext.getCmp("QUALITY_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'UPSAMPLING': Ext.getCmp("UPSAMPLING_id_l").getValue()});
                                compare_layer_1.mergeNewParams({'DOWNSAMPLING': Ext.getCmp("DOWNSAMPLING_id_l").getValue()});

                                compare_layer_2 = mapFindLayerById(_layerObject._layerId).clone();
                                compare_layer_2.setVisibility(true);
                                compare_layer_2.mergeNewParams({'time': compare_date_2});
                                compare_layer_2.mergeNewParams({'ATMFILTER': Ext.getCmp("compare_date1").getValue()});
                                compare_layer_2.mergeNewParams({'MAXCC': Ext.getCmp("MAXCC_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'CLOUDCORRECTION': Ext.getCmp("CLOUDCORRECTION_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'CLOUDBUFFER': Ext.getCmp("CLOUDBUFFER_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'PRIORITY': Ext.getCmp("PRIORITY_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'PREVIEW': Ext.getCmp("PREVIEW_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'GAIN': Ext.getCmp("GAIN_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'GAMMA': Ext.getCmp("GAMMA_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'OFFSET': Ext.getCmp("OFFSET_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'QUALITY': Ext.getCmp("QUALITY_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'UPSAMPLING': Ext.getCmp("UPSAMPLING_id_r").getValue()});
                                compare_layer_2.mergeNewParams({'DOWNSAMPLING': Ext.getCmp("DOWNSAMPLING_id_r").getValue()});

                                compare_layer_1.params.LAYERS = compare_layer_1.params.LAYERS + ",DATE";
                                compare_layer_2.params.LAYERS = compare_layer_2.params.LAYERS + ",DATE";

                                compare_map.addLayer(compare_layer_2);
                                compare_map.addLayer(compare_layer_1);

                                compare_swipe.activate();
                            }
                        }
                    }
                ]
            }
        ]
    });

    return _w;
}

function fn_compareCreateMap(_mapId, _layerId) {
    compare_map = new OpenLayers.Map(_mapId, {controls: []});

    compare_map.addControl(new OpenLayers.Control.Navigation());

    var _map_config_object = new _config_init_map();

    // for(var k=0;k<_map_config_object._basemapLayers.length;k++)
    // {
    //     compare_map.addLayer(_map_config_object._basemapLayers[k]._layer);
    // }

    compare_map.addLayer(_map_config_object._basemapLayers[1]._layer);

    var init_map_extent = map.getExtent();

    compare_map.zoomToExtent(init_map_extent);

    compare_swipe = new OpenLayers.Control.Swipe({map: compare_map, swipeLayer: null});

    compare_map.addControls([compare_swipe]);

    ///////////////////////

    // var bookmarks = new OpenLayers.Control.Bookmark({ 'title': bookmark_translation[language].bookmark_title, 'allowRemove': false });
    //
    // compare_map.addControl(bookmarks);
    //
    // bookmarks.maximizeControl();
    //
    // var bookmarks_places_compare = [
    //     {'title': comparetimelapse_translation[language].bookmark_place1, 'bounds': [32.7892,34.9344,33.0907,35.0629], 'projection': 'EPSG:4326'},
    //     {'title': comparetimelapse_translation[language].bookmark_place2, 'bounds': [32.4402,35.0150,32.6475,35.1347], 'projection': 'EPSG:4326'}
    // ];
    //
    // bookmarks_places_compare.forEach(function(item){
    //     bookmarks.add(item.title,new OpenLayers.Bounds(item.bounds[0],item.bounds[1],item.bounds[2],item.bounds[3]).transform(item.projection, map.getProjectionObject()));
    // });

    ///////////////////////


}

var comparetime_tabpanel = [
    {
        xtype: 'label',
        text: comparetimelapse_translation[language].compare
    },
    {
        xtype: 'combobox',
        id: 'print_choose_template_525',
        store: new Ext.data.SimpleStore({
            fields: ['index', 'template'],
            data: []
        }),
        editable: false,
        queryMode: 'local',
        displayField: 'template',
        valueField: 'index',
        forceSelection: true,
        triggerAction: 'all',
        selectOnFocus: false,
        listeners: {
            select: function (combo, record, eOpts) {
                var index = combo.getValue();


            }
        }
    }]

init_onload_fn.push(init_comparetimelapse);

function init_comparetimelapse() {
    // _maptab_west_layer_layer_menu_components.push(new comparetimelapse);

    comparetime_choose_LayerCombo_populate();

    Ext.getCmp("maptab_north_tabpanel").add({
        xtype: 'toolbar',
        border: false,
        id: 'compare_time_map_toolbar_tab',
        iconCls: 'clock',
        title: comparetimelapse_translation[language].title,
        items: [
            {
                xtype: 'combobox',
                flex: 0,
                id: 'comparetime_choose_layero',
                emptyText: comparetimelapse_translation[language].combo_select,
                store: compare_choose_LayerCombo.store,
                queryMode: 'local',
                displayField: '_layerTitle',
                valueField: '_layerId',
                forceSelection: true,
                triggerAction: 'all',
                editable: false,
                disabled: false,
                listeners: {
                    afterrender: function (combo) {
                        // var recordSelected = combo.getStore().getAt(0);
                        // combo.setValue(recordSelected.get('_layerId'));
                    },
                    select: function (combo, records) {

                        compare_layerid = records[0].data._layerId;

                    }
                }
            },
            {
                xtype: 'button',
                id: 'comparetimelapse_showbutton',
                iconCls: 'clock',
                enableToggle: false,
                text: comparetimelapse_translation[language].timecompare,
                handler: function () {

                    if (compare_layerid == null) {
                        Ext.MessageBox.alert(comparetimelapse_translation[language].alert, comparetimelapse_translation[language].alertlayer, function () {
                            return true;
                        });
                    } else {
                        var _layerId = compare_layerid;
                        if ((mapFindLayerById(_layerId)._serviceObject._isService) && ((mapFindLayerById(_layerId)._serviceObject._serviceType == "WFS") || (mapFindLayerById(_layerId)._serviceObject._serviceType == "WMS"))) {
                            var _serviceObject = mapFindLayerById(_layerId)._serviceObject;
                            var _layerObject = mapFindLayerById(_layerId)._layerObject;

                            // console.log(_serviceObject);
                            // console.log(_layerObject);

                            var _w = fn_compareshowwindow(_layerObject, _serviceObject);

                            _w.show();
                        }
                    }

                }
            }
        ]
    });

    mapOnRemoveLayer(comparetime_choose_LayerCombo_populate);

    mapOnAddLayer(comparetime_choose_LayerCombo_populate);

}

function comparetime_choose_LayerCombo_populate() {
    compare_choose_LayerCombo.store.removeAll();
    var overlayers = mapGetlayersBy("isBaseLayer", false);
    for (var i = overlayers.length - 1; i >= 0; i--) {
        var layer = overlayers[i];

        if(layer.url.includes('sentinel')){
            compare_choose_LayerCombo.store.add({
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
}
