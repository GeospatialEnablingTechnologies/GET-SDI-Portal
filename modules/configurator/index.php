<?php

error_reporting(0);
header('Content-Type: text/html; charset=utf-8');
header('Content-Type: application/javascript');
header('Content-Disposition: attachment; filename="config.js"');

$_j=json_decode($_REQUEST["data"]);

$_config_init_map = "function _config_init_map()
{
	var _config={
		_initCenter:[".$_j->lon.", ".$_j->lat."],
		_initZoom:".$_j->zoom.",
		_defaultScales:[0, 250,500,750,1000,2000,5000,10000],
		_mapControls:{
			navigation:new OpenLayers.Control.Navigation(),
			navigationHistory:new OpenLayers.Control.NavigationHistory(),
			pan:new OpenLayers.Control.Pan(),
			zoomByArea:new OpenLayers.Control.ZoomBox(),
			scaleBar:new OpenLayers.Control.ScaleBar({
				divisions:2,
				subdivisions:2,
				showMinorMeasures:true,
				singleLine:true,
				abbreviateLabel:true
			})
		},
		_mapProjections:[
			{
				_epsg:\"EPSG:2100\",
				_title:\"EPSG:2100\",
				_maxExtent:\"31668.0,3713192.0,1080244.0,4761768.0\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3034\",
				_title:\"EPSG:3034\",
				_maxExtent:\"2122254.2378, 1164627.9290, 5955457.4541, 5021872.0731\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3035\",
				_title:\"EPSG:3035\",
				_maxExtent:\"2426378.0132, 1528101.2618, 6293974.6215, 5446513.5222\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3038\",
				_title:\"EPSG:3038\",
				_maxExtent:\"197427.2404, 2779382.9587, 802572.7596, 7300894.6107\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3039\",
				_title:\"EPSG:3039\",
				_maxExtent:\"203872.6488, 3056487.4888, 796127.3512, 7378848.1182\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3040\",
				_title:\"EPSG:3040\",
				_maxExtent:\"203872.6488, 3056487.4888, 796127.3512, 7384416.4233\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3041\",
				_title:\"EPSG:3041\",
				_maxExtent:\"229578.6300, 3988111.9622, 770421.3700, 6914547.3835\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3042\",
				_title:\"EPSG:3042\",
				_maxExtent:\"225370.7346, 3849419.9580, 774629.2654, 6914547.3835\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3043\",
				_title:\"EPSG:3043\",
				_maxExtent:\"238379.2278, 4265559.3497, 761620.7722, 6914547.3835\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3044\",
				_title:\"EPSG:3044\",
				_maxExtent:\"231991.5007, 4065788.6515, 768008.4993, 7768690.1087\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3045\",
				_title:\"EPSG:3045\",
				_maxExtent:\"227879.8880, 3932632.6543, 772120.1120, 8325798.2469\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3046\",
				_title:\"EPSG:3046\",
				_maxExtent:\"225536.5500, 3854967.2384, 774463.4500, 8325798.2469\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3047\",
				_title:\"EPSG:3047\",
				_maxExtent:\"225536.5500, 3854967.2384, 774463.4500, 8325798.2469\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:3857\",
				_title:\"EPSG:3857\",
				_maxExtent:\"-20037508.34,-20037508.34,20037508.34,20037508.34\",
				_numDigits:3
			},
			{
				_epsg:\"EPSG:4258\",
				_title:\"EPSG:4258\",
				_maxExtent:\"10.6700, 34.5000, 31.5500, 71.0500\",
				_numDigits:7
			},
			{
				_epsg:\"EPSG:4326\",
				_title:\"EPSG:4326\",
				_maxExtent:\"-180.0000, -90.0000, 180.0000, 90.0000\",
				_numDigits:7
			},
			{
				_epsg:\"EPSG:900913\",
				_title:\"EPSG:900913\",
				_maxExtent:\"-20037508.34,-20037508.34,20037508.34,20037508.34\",
				_numDigits:3
			}
			
		],
		_charsets:[
			[\"ISO 8859-1\",\"ISO-8859-1\"],
			[\"ISO 8859-2\",\"ISO-8859-2\"],
			[\"ISO 8859-3\",\"ISO-8859-3\"],
			[\"ISO 8859-4\",\"ISO-8859-4\"],
			[\"ISO 8859-5\",\"ISO-8859-5\"],
			[\"ISO 8859-6\",\"ISO-8859-6\"],
			[\"ISO 8859-7\",\"ISO-8859-7\"],
			[\"ISO 8859-8\",\"ISO-8859-8\"],
			[\"ISO 8859-9\",\"ISO-8859-9\"],
			[\"ISO 8859-10\",\"ISO-8859-10\"],
			[\"ISO 8859-11\",\"ISO-8859-11\"],
			[\"ISO 8859-13\",\"ISO-8859-13\"],
			[\"ISO 8859-14\",\"ISO-8859-14\"],
			[\"ISO 8859-15\",\"ISO-8859-15\"],
			[\"ISO 8859-16\",\"ISO-8859-16\"],
			[\"UTF 8\",\"UTF-8\"]
		],
		_defaultProjection:\"EPSG:900913\",
		_setCoordinatesZoomLevel:20,
		_setMousemoveInfo:false,
		_setCoordinatesDefaultProjections:[\"GGRS 87 (EPSG:2100)\",\"Google Mercator (EPSG:900913)\",\"WGS 84 (EPSG:4326)\"],
		_getCoordinatesDefaultProjections:[\"GGRS 87 (EPSG:2100)\",\"Google Mercator (EPSG:900913)\",\"WGS 84 (EPSG:4326)\"],
		_mapUnits:[],
		_mapOptions:{
			units: \"km\",
			zoomMethod:null,
			transitionEffect:null,
			projection:new OpenLayers.Projection(\"EPSG:900913\"),
			displayProjection: new OpenLayers.Projection(\"EPSG:4326\"),
			maxExtent: new OpenLayers.Bounds.fromString(\"-20037508.34,-20037508.34,20037508.34,20037508.34\"),
			controls:[]
		},
		_canEdit:true,
		_canAddService:true,
		_canRemoveLayer:true,
		_basemapLayers:[
			{
				_layer:new OpenLayers.Layer.OSM(
					\"OpenSreetMap\",
					\"\",{
						icon:'images/earth.png',
						projection:new OpenLayers.Projection(\"EPSG:900913\"),
						fractionalZoom:false,
						isBaseLayer:true,
						maxExtent:new OpenLayers.Bounds.fromString(\"-20037508.34,-20037508.34,20037508.34,20037508.34\")

					})
			},
			{
				_layer:new OpenLayers.Layer.OSM(
					\"OpenStreetMap - Cycle Map\",
					[
						'https://a.tile.thunderforest.com/cycle/\${z}/\${x}/\${y}.png',
						'https://b.tile.thunderforest.com/cycle/\${z}/\${x}/\${y}.png',
                        'https://c.tile.thunderforest.com/cycle/\${z}/\${x}/\${y}.png'
					],{
						icon:'images/earth.png',
						projection:new OpenLayers.Projection(\"EPSG:900913\"),
						fractionalZoom:false,
						isBaseLayer:true,
						maxExtent:new OpenLayers.Bounds.fromString(\"-20037508.34,-20037508.34,20037508.34,20037508.34\")

					})
			},
			{
				_layer:new OpenLayers.Layer.OSM(
					\"OpenStreetMap - Transport Map\",
					[
						\"http://tile2.opencyclemap.org/transport/\${z}/\${x}/\${y}.png\",
					],{
						icon:'images/earth.png',
						projection:new OpenLayers.Projection(\"EPSG:900913\"),
						fractionalZoom:false,
						isBaseLayer:true,
						maxExtent:new OpenLayers.Bounds.fromString(\"-20037508.34,-20037508.34,20037508.34,20037508.34\")

					})
			},
			{
				_layer:new OpenLayers.Layer.OSM(
					\"OpenStreetMap - Humanitarian Data Model\",
					[
						\"http://a.tile.openstreetmap.fr/hot/\${z}/\${x}/\${y}.png\",
						\"http://b.tile.openstreetmap.fr/hot/\${z}/\${x}/\${y}.png\",
						\"http://c.tile.openstreetmap.fr/hot/\${z}/\${x}/\${y}.png\"
					],{
						icon:'images/earth.png',
						projection:new OpenLayers.Projection(\"EPSG:900913\"),
						fractionalZoom:false,
						isBaseLayer:true,
						maxExtent:new OpenLayers.Bounds.fromString(\"-20037508.34,-20037508.34,20037508.34,20037508.34\")

					})
			},
			{
				_layer:new OpenLayers.Layer.Vector(
					\"Blank\",
					{
						icon:'images/earth.png',
						projection:new OpenLayers.Projection(\"EPSG:900913\"),
						fractionalZoom:false,
						isBaseLayer:true,
						maxExtent:new OpenLayers.Bounds.fromString(\"-20037508.34,-20037508.34,20037508.34,20037508.34\")

					})
			}
		]
	}

	return _config;

}";

echo $_config_init_map;

echo "\r\n\r\n";

function replace_unicode_escape_sequence($match) {
    return mb_convert_encoding(pack('H*', $match[1]), 'UTF-8', 'UCS-2BE');
}

function jsonRemoveUnicodeSequences($struct) {
    return preg_replace_callback("/\\\\u([a-f0-9]{4})/i", 'replace_unicode_escape_sequence', json_encode($struct));
  // return json_encode($struct);

}


$_config_create_tree_groups = $_j->_config_create_tree_groups;

echo "var _config_create_tree_groups=".jsonRemoveUnicodeSequences($_config_create_tree_groups);

echo "\r\n\r\n";

$_config_load_layers = $_j->_config_load_layers;


$_config_load_layers = "var _config_load_layers=".jsonRemoveUnicodeSequences($_config_load_layers);

$_config_load_layers = str_replace("\/","/",$_config_load_layers);

$_config_load_layers = str_replace('"#image#"',"fn_createPhotoAttribute",$_config_load_layers);
$_config_load_layers = str_replace('"#link#"',"fn_createLinkAttribute",$_config_load_layers);
$_config_load_layers = str_replace('"#email#"',"fn_createMailAttribute",$_config_load_layers);
$_config_load_layers = str_replace('"#',"",$_config_load_layers);
$_config_load_layers = str_replace('#"',"",$_config_load_layers);
$_config_load_layers = str_replace(',"renderer":""',"",$_config_load_layers);


echo $_config_load_layers;

$_config_print_layouts="var _config_print_layouts=[{
		_print_identifier_title:\"Layout 1\",
		_is_default:true,
		_print_logo:\"\",
		_print_title:\"Title\",
		_print_abstract:\"Abstract\"
	},
	{
		_print_identifier_title:\"Layout 2\",
		_print_logo:\"\",
		_print_title:\"\",
		_print_abstract:\"Abstract\"

}];";

echo "\r\n\r\n";
echo $_config_print_layouts;

?>
