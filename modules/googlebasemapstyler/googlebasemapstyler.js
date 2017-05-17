/**
 * Created by simeon on 11/24/2016.
 */

var googlebasemapstyler_translation = {
    el_gr: {},
    en_us: {}
}

var googlebasemapstyler_style1 = [{
    "featureType": "administrative",
    "stylers": [{"visibility": "off"}]
}, {"featureType": "poi", "stylers": [{"visibility": "simplified"}]}, {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{"visibility": "simplified"}]
}, {"featureType": "water", "stylers": [{"visibility": "simplified"}]}, {
    "featureType": "transit",
    "stylers": [{"visibility": "simplified"}]
}, {"featureType": "landscape", "stylers": [{"visibility": "simplified"}]}, {
    "featureType": "road.highway",
    "stylers": [{"visibility": "off"}]
}, {"featureType": "road.local", "stylers": [{"visibility": "on"}]}, {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"visibility": "on"}]
}, {
    "featureType": "water",
    "stylers": [{"color": "#84afa3"}, {"lightness": 52}]
}, {"stylers": [{"saturation": -17}, {"gamma": 0.36}]}, {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{"color": "#3f518c"}]
}];

function init_googlebasemapstyler() {

    var basemaps = map.getLayersBy("isBaseLayer", true);

    basemaps[2].mapObject.setOptions({
        styles : googlebasemapstyler_style1
    });

}

init_onload_fn.push(init_googlebasemapstyler);



