/**
 * Created by simeon on 11/24/2016.
 */

var bookmark_translation = {
    el_gr: {
        bookmark_title: 'Χαρτοδείκτες',
        bookmark_place1: 'Βασιλικά',
        bookmark_place2: 'Ταγαράδες',
        bookmark_place3: 'Σουρωτή'

    },
    en_us: {
        bookmark_title: 'Bookmarks',
        bookmark_place1: 'Vasilika',
        bookmark_place2: 'Tagarades',
        bookmark_place3: 'Souroti'
    }
}

var bookmarks_places = [
    {'title': bookmark_translation[language].bookmark_place1, 'bounds': [23.1266,40.4736,23.1466,40.4855], 'projection': 'EPSG:4326'},
    {'title': bookmark_translation[language].bookmark_place2, 'bounds': [23.0136,40.4836,23.0301,40.4936], 'projection': 'EPSG:4326'},
    {'title': bookmark_translation[language].bookmark_place3, 'bounds': [23.0841,40.4663,23.1008,40.4765], 'projection': 'EPSG:4326'}
];

function init_bookmarks() {

    var bookmarks = new OpenLayers.Control.Bookmark({ 'title': bookmark_translation[language].bookmark_title, 'allowRemove': false });

    map.addControl(bookmarks);

    bookmarks.maximizeControl();

    bookmarks_places.forEach(function(item){
        bookmarks.add(item.title,new OpenLayers.Bounds(item.bounds[0],item.bounds[1],item.bounds[2],item.bounds[3]).transform(item.projection, map.getProjectionObject()));
    });

}

init_onload_fn.push(init_bookmarks);


	
