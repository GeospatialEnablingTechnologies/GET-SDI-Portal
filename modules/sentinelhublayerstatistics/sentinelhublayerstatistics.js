/**
 * Created by taskaris on 2017-05-02.
 */

var sentinelhublayerstatistics_translation = {
    el_gr: {
        title: 'Εργαλεία Sentinel-Hub',
        combo_select: 'Επιλέξτε ένα επίπεδο',
        fromdate: 'Από',
        todate: 'Έως',
        btn_title: 'Δημιουργία Στατιστικών',
        tooltip: 'Σχεδιάστε ένα πολύγωνο',
        alert: 'Προσοχή',
        alertlayer: 'Παρακαλώ επιλέξτε επίπεδο'
    },
    en_us: {
        title: 'Sentinel-Hub Tools',
        combo_select: 'Select a layer',
        fromdate: 'From',
        todate: 'To',
        btn_title: 'Create Statistics',
        tooltip: 'Draw a polygon',
        alert: 'Alert',
        alertlayer: 'Please select a layer'
    }
};

var sentinelhublayerstatistics_drawControls = null;
var sentinelhublayerstatistics_polygonLayer = null;
var sentinelhublayerstatistics_choose_LayerCombo = new fn_storeColumnsServiceLayers();
var sentinelhublayerstatistics_layer_id = null;

var sentinelhublayerstatistics_btn = [
    {xtype: 'tbseparator'},
    {
        xtype: 'combobox',
        flex: 0,
        id: 'maptab_toolbar_general_sentinelhublayerstatistics_combo',
        emptyText: sentinelhublayerstatistics_translation[language].combo_select,
        fieldLabel: sentinelhublayerstatistics_translation[language].layer,
        store: sentinelhublayerstatistics_choose_LayerCombo.store,
        width: 150,
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

                sentinelhublayerstatistics_layer_id = records[0].data._layerId;

            }
        }
    },
    {
        xtype: 'datefield',
        width: 120,
        id: 'sentinelhublayerstatistics_date1',
        name: 'sentinelhublayerstatistics_date_one',
        fieldLabel: sentinelhublayerstatistics_translation[language].fromdate,
        labelWidth: 20,
        maxValue: new Date()  // limited to the current date or prior
    },
    {
        xtype: 'datefield',
        width: 120,
        id: 'sentinelhublayerstatistics_date2',
        name: 'sentinelhublayerstatistics_date_two',
        fieldLabel: sentinelhublayerstatistics_translation[language].todate,
        labelWidth: 20,
        maxValue: new Date()  // limited to the current date or prior
    },
    {
        xtype: 'button',
        iconCls: 'maptab_toolbar_edit_polygon',
        id: 'maptab_toolbar_general_sentinelhublayerstatistics',
        text: sentinelhublayerstatistics_translation[language].btn_title,
        tooltip: sentinelhublayerstatistics_translation[language].tooltip,
        enableToggle: false,
        handler: function () {

            if (sentinelhublayerstatistics_layer_id == null) {
                Ext.MessageBox.alert(sentinelhublayerstatistics_translation[language].alert, sentinelhublayerstatistics_translation[language].alertlayer, function () {
                    return true;
                });
            }
            else {
                sentinelhublayerstatistics_polygonLayer.destroyFeatures();
                sentinelhublayerstatistics_drawControls['polygon'].activate();
            }
        }
    }];

function sentinelhublayerstatistics_run_statistics() {
    var _layer = mapFindLayerById(sentinelhublayerstatistics_layer_id);

    var _extraparams = '';

    for (var key in _layer.params) {
        if (key.toString() == 'FORMAT' || key.toString() == 'TILED' || key.toString() == 'TRANSPARENT' || key.toString() == 'VERSION'
            || key.toString() == 'EXCEPTIONS' || key.toString() == 'SERVICE' || key.toString() == 'REQUEST' || key.toString() == 'STYLES'
            || key.toString() == 'CRS') {
        }
        else {
            if (_layer.params[key] != null) {
                _extraparams = _extraparams + '&' + key + '=' + _layer.params[key]
            }
        }
    }

    var _url = _layer.url.replace('wms', 'fis');
    var _layername = _layer._layerObject._layerName;

    var wkt = new OpenLayers.Format.WKT();
    var _geometry = wkt.write(sentinelhublayerstatistics_polygonLayer.features[0]);

    var sentinelhublayerstatistics_date_1 = Ext.getCmp("sentinelhublayerstatistics_date1").getValue();
    var sentinelhublayerstatistics_date_2 = Ext.getCmp("sentinelhublayerstatistics_date2").getValue();
    sentinelhublayerstatistics_date_1 = sentinelhublayerstatistics_date_1.toISOString().substring(0, 10);
    sentinelhublayerstatistics_date_2 = sentinelhublayerstatistics_date_2.toISOString().substring(0, 10);

    window.open(_url + '?STYLE=INDEX' +
        _extraparams.replace('LAYERS=', 'LAYER=') +
        '&CRS=EPSG%3A3857' +
        '&GEOMETRY=' + _geometry +
        '&TIME=' + sentinelhublayerstatistics_date_1 + '/' + sentinelhublayerstatistics_date_2 +
        '&RESOLUTION=10' +
        '&BINS=100');
}

function init_sentinelhublayerstatistics() {

    if (Ext.getCmp("sentinelhub_map_toolbar_tab") == null) {
        var sentinelhub_toolbar_tab = {
            xtype: 'toolbar',
            border: false,
            iconCls: 'sentinelhubico',
            id: 'sentinelhub_map_toolbar_tab',
            title: sentinelhublayerstatistics_translation[language].title
        };

        Ext.getCmp("maptab_north_tabpanel").add(sentinelhub_toolbar_tab);
    }

    Ext.getCmp("sentinelhub_map_toolbar_tab").add(sentinelhublayerstatistics_btn);

    sentinelhublayerstatistics_polygonLayer = new OpenLayers.Layer.Vector("Sentinel Hub Statistics Polygon Layer");

    map.addLayers([sentinelhublayerstatistics_polygonLayer]);

    sentinelhublayerstatistics_drawControls = {
        polygon: new OpenLayers.Control.DrawFeature(sentinelhublayerstatistics_polygonLayer,
            OpenLayers.Handler.Polygon,
            {
                featureAdded: function (evt) {
                    sentinelhublayerstatistics_drawControls['polygon'].deactivate();
                    sentinelhublayerstatistics_run_statistics();
                }
            }
        )
    };

    for (var key in sentinelhublayerstatistics_drawControls) {
        map.addControl(sentinelhublayerstatistics_drawControls[key]);
    }

    mapOnRemoveLayer(sentinelhublayerstatistics_choose_LayerCombo_populate);

    mapOnAddLayer(sentinelhublayerstatistics_choose_LayerCombo_populate);

}

init_onload_fn.push(init_sentinelhublayerstatistics);

function sentinelhublayerstatistics_choose_LayerCombo_populate() {
    sentinelhublayerstatistics_choose_LayerCombo.store.removeAll();
    var overlayers = mapGetlayersBy("isBaseLayer", false);
    for (var i = overlayers.length - 1; i >= 0; i--) {
        var layer = overlayers[i];

        if (layer.url.includes('sentinel')) {
            sentinelhublayerstatistics_choose_LayerCombo.store.add({
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

