var layerdownloads_translation = {
    el_gr: {
        download: 'Τηλεφόρτωση'
    },
    en_us: {
        download: 'Download'
    }

};

function layerDownloadBBOX(_layerObject) {
    var _b = new OpenLayers.Bounds.fromString(mapBBOXToString(_layerObject));

    return _b;
}


var layerdownloads = function () {
    return {
        text: layerdownloads_translation[language].download,
        listeners: {
            render: function () {
                var _layerId = this.ownerCt._nodeId;

                if ((mapFindLayerById(_layerId)._serviceObject._isService) && (mapFindLayerById(_layerId)._serviceObject._serviceUrl.includes('sentinel'))) {
                    this.setMenu(Ext.create("Ext.menu.Menu", {
                        floating: true,
                        items: [{
                            text: 'GeoTIFF',
                            iconCls: 'tiff',
                            handler: function () {
                                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;

                                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                                var _url = fn_downloadLayerSentinel(_layerObject, _serviceObject, "GeoTIFF", "image/tiff", "", "");

                                window.open(_url);
                            }
                        }]
                    }));
                }
                else if ((mapFindLayerById(_layerId)._serviceObject._isService) && ((mapFindLayerById(_layerId)._serviceObject._serviceType == "WFS") || (mapFindLayerById(_layerId)._serviceObject._serviceType == "WMS"))) {
                    this.setMenu(Ext.create("Ext.menu.Menu", {
                        floating: true,
                        items: [{
                            text: 'CSV',
                            iconCls: 'csv',
                            handler: function () {
                                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;

                                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                                var _w = fn_downloadLayerCharset(_layerObject, _serviceObject, "csv", "text/csv");

                                _w.show();
                            }
                        }, {
                            text: 'KML',
                            iconCls: 'kml',
                            handler: function () {
                                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;

                                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                                var _url = fn_downloadLayer(_layerObject, _serviceObject, "kml", "application/vnd.google-earth.kml+xml kml", "", "");

                                window.open(_url);
                            }
                        }, {
                            text: 'PDF',
                            iconCls: 'pdf',
                            handler: function () {
                                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;

                                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                                var _url = fn_downloadLayer(_layerObject, _serviceObject, "application/pdf", "application/pdf", "", "");

                                window.open(_url);
                            }
                        }, {
                            text: 'Shapefile',
                            iconCls: 'shapefile',
                            handler: function () {
                                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;

                                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                                var _w = fn_downloadLayerCharset(_layerObject, _serviceObject, "shape-zip", "application/zip");

                                _w.show();
                            }
                        }, {
                            text: 'SVG',
                            iconCls: 'svg',
                            handler: function () {
                                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;

                                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                                var _url = fn_downloadLayer(_layerObject, _serviceObject, "image/svg", "image/svg", "", "");

                                window.open(_url);
                            }
                        }, {
                            text: 'TIFF',
                            iconCls: 'tiff',
                            handler: function () {
                                var _serviceObject = mapFindLayerById(_layerId)._serviceObject;

                                var _layerObject = mapFindLayerById(_layerId)._layerObject;

                                var _url = fn_downloadLayer(_layerObject, _serviceObject, "image/tiff", "image/tiff", "", "");

                                window.open(_url);
                            }
                        }]
                    }));
                }
            }
        }
    }
}

function fn_downloadLayerCharset(_layerObject, _serviceObject, _format, _content_type) {
    var _projection_systems = new Array();

    var _config = new _config_init_map();

    for (var i = 0; i < _config._mapProjections.length; i++) {
        var _proj = _config._mapProjections[i];

        _projection_systems.push([_proj._title, _proj._epsg]);
    }

    var _w = new Ext.Window({
        width: 380,
        height: 140,
        modal: true,
        resizable: false,
        plain: true,
        layout: 'border',
        items: [{
            xtype: 'form',
            region: 'center',
            items: [
                {
                    xtype: 'combo',
                    loadMask: true,
                    autoScroll: true,
                    autoShow: true,
                    id: 'downloadLayer_charset_id',
                    fieldLabel: _featuredownload_charset,
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: _config._charsets
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: "UTF-8",
                    value: "UTF-8",
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                },
                {
                    xtype: 'combo',
                    loadMask: true,
                    autoScroll: true,
                    autoShow: true,
                    id: 'downloadLayer_srs_id',
                    fieldLabel: _featuredownload_srs,
                    store: new Ext.data.SimpleStore({
                        fields: ['title', 'value'],
                        data: _projection_systems
                    }),
                    displayField: 'title',
                    valueField: 'value',
                    emptyText: _config._mapProjections[0]._title,
                    value: _config._mapProjections[0]._epsg,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus: false,
                    mode: 'local',
                    editable: false
                }],
            bbar: ['->', {
                xtype: 'button',
                text: _featuredownload_downloadbtn,
                iconCls: 'maptab_toolbar_search',
                handler: function () {
                    var _charset = Ext.getCmp("downloadLayer_charset_id").getValue();

                    var _epsg = Ext.getCmp("downloadLayer_srs_id").getValue();

                    var _url = fn_downloadLayer(_layerObject, _serviceObject, _format, _content_type, _charset, _epsg);

                    if ((_format == "shape-zip") || (_format == "csv")) {
                        _url = fn_downloadLayerVector(_layerObject, _serviceObject, _format, _content_type, _charset, _epsg);
                    }

                    window.open(_url);
                }
            }]
        }]
    });

    return _w;

}

function fn_downloadLayer(_layerObject, _serviceObject, _format, _content_type, _charset, _epsg) {
    var _bbox = new layerDownloadBBOX(_layerObject);

    var _width = _bbox.getWidth();

    var _height = _bbox.getHeight();

    var _newWidth = 800;

    var _ratio = (_height / _width);

    var _newHeight = Math.floor(_newWidth * _ratio);

    var _url = Ext.urlAppend(_serviceObject._serviceUrl, "REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1&LAYERS=" + _layerObject._layerName + "&FORMAT=" + _format + "&TRANSPARENT=TRUE&SRS=EPSG:4326&BBOX=" + _bbox.toString() + "&WIDTH=" + _newWidth + "&HEIGHT=" + _newHeight);

    if (_charset != "") {
        _url = Ext.urlAppend(_url, "FORMAT_OPTIONS=CHARSET:" + _charset);
    }

    if (_epsg != "") {
        _url = Ext.urlAppend(_url, "SRSNAME=" + _epsg);
    }

    if (_serviceObject._isSecure) {
        _url = _proxy_url + "?proxy=raw&contentype=" + _content_type + "&url=" + _url;
    }

    return _url;
}

function fn_downloadLayerSentinel(_layerObject, _serviceObject, _format, _content_type, _charset, _epsg) {

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

    if (_layerObject._layer.params['ATMFILTER'] != null) {
        ATMFILTER = _layerObject._layer.params['ATMFILTER'];
    }
    else {
        ATMFILTER = 'NONE';
    }

    if (_layerObject._layer.params['MAXCC'] != null) {
        MAXCC = _layerObject._layer.params['MAXCC'];
    }
    else {
        MAXCC = 20;
    }

    if (_layerObject._layer.params['CLOUDCORRECTION'] != null) {
        CLOUDCORRECTION = _layerObject._layer.params['CLOUDCORRECTION'];
    }
    else {
        CLOUDCORRECTION = 'none';
    }

    if (_layerObject._layer.params['CLOUDBUFFER'] != null) {
        CLOUDBUFFER = _layerObject._layer.params['CLOUDBUFFER'];
    }
    else {
        CLOUDBUFFER = 320;
    }

    if (_layerObject._layer.params['PRIORITY'] != null) {
        PRIORITY = _layerObject._layer.params['PRIORITY'];
    }
    else {
        PRIORITY = 'mostRecent';
    }

    if (_layerObject._layer.params['PREVIEW'] != null) {
        PREVIEW = _layerObject._layer.params['PREVIEW'];
    }
    else {
        PREVIEW = '0';
    }

    if (_layerObject._layer.params['GAIN'] != null) {
        GAIN = _layerObject._layer.params['GAIN'];
    }
    else {
        GAIN = 1;
    }

    if (_layerObject._layer.params['GAMMA'] != null) {
        GAMMA = _layerObject._layer.params['GAMMA'];
    }
    else {
        GAMMA = 1;
    }

    if (_layerObject._layer.params['OFFSET'] != null) {
        OFFSET = _layerObject._layer.params['OFFSET'];
    }
    else {
        OFFSET = 0;
    }

    if (_layerObject._layer.params['QUALITY'] != null) {
        QUALITY = _layerObject._layer.params['QUALITY'];
    }
    else {
        QUALITY = 90;
    }


    if (_layerObject._layer.params['UPSAMPLING'] != null) {
        UPSAMPLING = _layerObject._layer.params['UPSAMPLING'];
    }
    else {
        UPSAMPLING = 'NEAREST';
    }

    if (_layerObject._layer.params['DOWNSAMPLING'] != null) {
        DOWNSAMPLING = _layerObject._layer.params['DOWNSAMPLING'];
    }
    else {
        DOWNSAMPLING = 'NEAREST';
    }

    var _bbox = map.getExtent();

    var _width = _bbox.getWidth();

    var _height = _bbox.getHeight();

    var _newWidth = 800;

    var _ratio = (_height / _width);

    var _newHeight = Math.floor(_newWidth * _ratio);

    var _url = Ext.urlAppend(_serviceObject._serviceUrl.replace('wms', 'wcs'), "REQUEST=GetCoverage&SERVICE=WCS&VERSION=1.0.0&COVERAGE=" + _layerObject._layerName + "&identifiers=" + _layerObject._layerName + "&FORMAT=" + _format  + "&CRS=EPSG:3857&BBOX=" + _bbox.left + "," + _bbox.bottom + "," + _bbox.right + "," + _bbox.top + "&subset=y(" + _bbox.bottom + "," + _bbox.top + ")&subset=x(" + _bbox.left + "," + _bbox.right + ")"
        + "&ATMFILTER=" + ATMFILTER
        + "&MAXCC=" + MAXCC
        + "&CLOUDCORRECTION=" + CLOUDCORRECTION
        + "&CLOUDBUFFER=" + CLOUDCORRECTION
        + "&CLOUDBUFFER=" + CLOUDBUFFER
        + "&PRIORITY=" + PRIORITY
        + "&PREVIEW=" + PREVIEW
        + "&GAIN=" + GAIN
        + "&GAMMA=" + GAMMA
        + "&OFFSET=" + OFFSET
        + "&QUALITY=" + QUALITY
        + "&UPSAMPLING=" + UPSAMPLING
        + "&DOWNSAMPLING=" + DOWNSAMPLING
    );

    if (_charset != "") {
        _url = Ext.urlAppend(_url, "FORMAT_OPTIONS=CHARSET:" + _charset);
    }

    if (_epsg != "") {
        _url = Ext.urlAppend(_url, "SRSNAME=" + _epsg);
    }

    if (_serviceObject._isSecure) {
        _url = _proxy_url + "?proxy=raw&contentype=" + _content_type + "&url=" + _url;
    }

    return _url;
}

function fn_downloadLayerVector(_layerObject, _serviceObject, _format, _content_type, _charset, _epsg) {
    var _bbox = new layerDownloadBBOX(_layerObject);

    var _width = _bbox.getWidth();

    var _height = _bbox.getHeight();

    var _newWidth = 800;

    var _ratio = (_height / _width);

    var _newHeight = Math.floor(_newWidth * _ratio);

    var _url = Ext.urlAppend(_serviceObject._serviceUrl, "REQUEST=GETFEATURE&SERVICE=WFS&VERSION=1.1.0&TYPENAMES=" + _layerObject._layerName + "&OUTPUTFORMAT=" + _format);

    _url = _url.replace("WMS", "WFS");
    _url = _url.replace("Wms", "Wfs");
    _url = _url.replace("wms", "wfs");

    if (_charset != "") {
        _url = Ext.urlAppend(_url, "FORMAT_OPTIONS=CHARSET:" + _charset);
    }

    if (_epsg != "") {
        _url = Ext.urlAppend(_url, "SRSNAME=" + _epsg);
    }

    if (_serviceObject._isSecure) {
        _url = _proxy_url + "?proxy=raw&contentype=" + _content_type + "&url=" + _url;
    }

    return _url;
}

init_onload_fn.push(init_layerdownloads);

function init_layerdownloads() {
    _maptab_west_layer_layer_menu_components.push(new layerdownloads);


}
