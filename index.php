<?php

/*version message*/

include("php_source/proxies/required.php");

function _init_fetch_Language()
{
	$output=array("language"=>$GLOBALS["_default_Language"],"logo"=>$GLOBALS["_default_Logo"],"lang_script"=>"<script type=\"text/javascript\" src=\"".$GLOBALS["_default_portal_url"]."jslib/language/translations_".strtolower($GLOBALS["_default_Language"]).".js\"></script>");
	
	$lang=$_GET['lang'];
	
	$lang=strtoupper($lang);
	
	if (!empty($lang))
	{
		$lang_file="jslib/language/translations_".strtolower($lang).".js";
		
		if (file_exists($lang_file))
		{	
			$output=array("language"=>$lang,"logo"=>$GLOBALS["_default_Other_Languages_N_Logos"][$lang],"lang_script"=>"<script type=\"text/javascript\" src=\"".$GLOBALS["_default_portal_url"]."jslib/language/translations_".strtolower($lang).".js\"></script>");
		}
	}
	
	return $output;
}

$_init_fetch_region_settings=_init_fetch_Language();

function _init_load_Proj4JSScripts()
{
	$output="";

	foreach($GLOBALS["_supported_EPSGS"] as $key=>$value)
	{
		$epsg=str_replace(":","",$value);
		
		$output.="\t<script src=\"".$GLOBALS["_default_portal_url"]."tools/proj4js/lib/defs/".$epsg.".js\"></script>\r\n";
	
	}
	
	return $output;
}

function _init_load_Proj4JSEPSG()
{

	$epsgs=implode("','",$GLOBALS["_default_get_Map_Coordinates_Projection_Systems"]);
		
	$epsgsArray=implode("'),Array('",$GLOBALS["_supported_EPSGS"]);
	
	$output="\t\tvar epsgGetCoordinates=Array('".$epsgs."');\r\n";
	
	$epsgs=implode("','",$GLOBALS["_supported_EPSGS"]);
	
	$output.="\t\tvar epsgDB=Array('".$epsgs."');\r\n";
	
	$output.="\t\tvar epsgDBArr=Array(Array('".$epsgsArray."'));\r\n";
	
	return $output;
}

function _init_write_EPSG_BBOX()
{
	$output="var epsgExtents=new Array();\r\n";
	
	foreach($GLOBALS["_default_EPSGS_BBOX"] as $key=>$value)
	{		
		$output.="\t\tepsgExtents[\"".$key."\"]=\"".$value."\";\r\n";
	}

	return $output;
}

function _init_default_Projection()
{
	$output="\t\tvar map_currentMapProjection=\"EPSG:900913\";\r\n";
	
	if (!empty($GLOBALS["_default_Projection"]))
	{
		$output="\t\tvar map_currentMapProjection=\"".$GLOBALS["_default_Projection"]."\";\r\n";
	}
	
	return $output;
}

function _init_default_Display_Projection()
{
	$output="\t\tvar map_currentDisplayProjection=\"EPSG:900913\";\r\n";
	
	if (!empty($GLOBALS["_default_display_Projection"]))
	{
		$output="\t\tvar map_currentDisplayProjection=\"".$GLOBALS["_default_display_Projection"]."\";\r\n";
	}
	
	return $output;
}

function _init_default_Projection_Systems()
{
	$epsgs=implode("','",$GLOBALS["_default_projection_systems"]);
	
	$epsgsArray=implode("'), Array('",$GLOBALS["_default_projection_systems"]);
	
	$output="\t\tvar map_ctrls_projection_systemsArr=Array(Array('".$epsgsArray."'));\r\n";
	
	return $output;
}

function _init_default_digit_format()
{
	$output="[";

	foreach($GLOBALS["_default_geometry_decimal_format"] as $key=>$value)
	{
		if ($key!="default")
		{
			$digits[]="{epsg:'".$key."',digits:".$value["dec_num"]."}";
		}
		else
		{
			$default="\t\tvar map_display_default_digit_format=".$value["dec_num"].";\r\n";
		}
		
	}
	
	
	$output.=implode(",",$digits)."]";

	$output="\t\tvar map_display_epsg_digit_format=".$output.";\r\n";
	$output=$default.$output;
	
	return $output;
}

function _init_google_enabled()
{
	$output="var googleEnabled=false;";

	if ($GLOBALS["_googleMaps_Enable"]==true)
	{
		$output="var googleEnabled=true;";
	}
	
	return "\t\t".$output."\r\n";
}

function _init_change_language_menu()
{
	$output="";
	
	if (count($GLOBALS["_default_Other_Languages_Titles"])>2)
	{	
		$output=array();
		
		foreach($GLOBALS["_default_Other_Languages_Titles"] as $key=>$value)
		{
			if ($key!=$GLOBALS["_default_Language"])
			{
				$output[]="{
					text:'".$value."',
					iconCls:'".strtolower($value)."',
					handler:function()
					{
						window.location='".$GLOBALS["_default_portal_url"]."index.php?lang=".strtoupper($key)."';
					}
				}";
			}
		}

		$output=implode(",",$output);
		
		$output="var change_Lang_Btn={
				xtype:'button',
				text:change_language,
				menu:[".$output."]}";
	}
	else
	{
		foreach($GLOBALS["_default_Other_Languages_Titles"] as $key=>$value)
		{
			if ($key!=$GLOBALS["_default_Language"])
			{
				$output="var change_Lang_Btn={
				xtype:'button',
				iconCls:'".strtolower($value)."',
				text:'".$value."',
				handler:function()
				{
					window.location='".$GLOBALS["_default_portal_url"]."index.php?lang=".strtoupper($key)."';
				}
				};";
			}
		}
	}
	
	return $output;
}

$version="3.0";

?>
<!--

/*GET SDI Portal v.3.0 (R) from Geospatial Enabling Technologies Ltd. (C) is an open source

Platform that acts as a client for spatial data infrastructure (SDI) services.



At its core,  the GET SDI Portal v.3.0 (R) is based on open source components OpenLayers,

ExtJS, GeoExt and Proj4js that provide a platform for sophisticated web

Browser spatial visualization and analysis. It is installed and configured on a Web

Application Server so multiple users can access the site via Web browsers. It is used to

find, view, and query geospatial data published with standard SDI Web services and

integrate multiple sources into a single map view that can be easily navigated



GET SDI Portal v.3.0 (R) optimizes the client browsing experience when connecting to open

standards-based services



Copyright (C) 2014  Geospatial Enabling Technologies Ltd. url: http:www.getmap.gr, e-mail: contact@getmap.gr

Authors: S. Kamilieris / T. Vakkas / A. Mitrou
Core Developer: Simos Kamilieris


This file is part of GET SDI Portal v.3.0 (R) from Geospatial Enabling Technologies Ltd (C).



GET SDI Portal v.3.0 (R) from Geospatial Enabling Technologies Ltd (C) is free software:

you can redistribute it and/or modify

it under the terms of the GNU General Public License as published by

the Free Software Foundation, version 3 of the License.



This program is distributed in the hope that it will be useful,

but WITHOUT ANY WARRANTY; without even the implied warranty of

MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the

GNU General Public License for more details.



You should have received a copy of the GNU General Public License version 3

along with this program.  If not, see http:www.gnu.org/licenses/gpl-3.0.html.*/


-->
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
	<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>GET SDI Portal v.3.0</title>
	<script src="<?php echo $GLOBALS["_default_portal_url"];?>tools/proj4js/lib/proj4js.js"></script>
	<?php
		echo _init_load_Proj4JSScripts();
	?>
	<?php 
	
		if ($GLOBALS["_googleMaps_Enable"]==true)
		{
			echo "\t<script src='http://maps.google.com/maps/api/js?v=3&amp;sensor=false&language=el'></script>\r\n";
		}
	?>
	<script src='http://www.google.com/jsapi?key=myGoogleEarthDomainKey'></script>
	<link rel="stylesheet" type="text/css" href="<?php echo $GLOBALS["_default_portal_url"];?>css/main.css"/>
	<link rel="stylesheet" type="text/css" href="<?php echo $GLOBALS["_default_portal_url"];?>css/scalebar-thin.css"/>
	
    <link rel="stylesheet" type="text/css" href="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/resources/css/ext-all.css"/>
	<link rel="stylesheet" type="text/css" href="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/resources/css/xtheme-gray.css"/>
	
	<script>
		var language="<?php echo $_init_fetch_region_settings["language"]; ?>";
		var logopic="<?php echo $_init_fetch_region_settings["logo"]; ?>";
		var getsdiportal_URI="<?php echo $GLOBALS["_default_portal_url"];?>";
		<?php
			echo _init_write_EPSG_BBOX();
			echo _init_default_Projection();
			echo _init_google_enabled();
			echo _init_load_Proj4JSEPSG();
			echo _init_default_Display_Projection();
			echo _init_default_Projection_Systems();
			echo _init_default_digit_format();
		?>
	</script>
	
	<script src="<?php echo $GLOBALS["_default_portal_url"];?>tools/OpenLayers-2.13/OpenLayers.js"></script>
	<script src="<?php echo $GLOBALS["_default_portal_url"];?>tools/OpenLayers-2.13/lib/OpenLayers/Control/ScaleBar.js"></script>
	<script src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js"></script>
	
    <script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/adapter/ext/ext-base.js"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/ext-all.js"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/examples/ux/RowExpander.js"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/examples/ux/fileuploadfield/FileUploadField.js"></script>
	<link rel="stylesheet" type="text/css" href="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/examples/ux/css/ux-all.css"/>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/extBase64.js"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/ext-3.3.1/Ext.ux.PanelCollapsedTitle.js"></script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/GeoExt/script/GeoExt.js"></script>
	
	<?php 
		echo $_init_fetch_region_settings["lang_script"];
		
	?>
	<script>
	<?php
		echo _init_change_language_menu();
	?>
	</script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/tabs.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/googleEarth/googleEarth.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/functions.js<?php echo "?".$version;?>"></script>

	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/quickSearch/quicksearch.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/google/geo_google.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/search/search.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/search/area_search.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/addToSelected/addToSelected.js<?php echo "?".$version;?>"></script>
	

	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/colorpicker/colorpicker.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/thematicLayers/thematicLayers.js<?php echo "?".$version;?>"></script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/map_controls.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/map_controls_measurements.js<?php echo "?".$version;?>"></script>
	
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/map_metadata_controls.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/search/map_search_controls.js<?php echo "?".$version;?>"></script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/map/map.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/tree_map.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/map_settings.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/tree_node_wms_contextmenu.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/metadata_search_map.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/services_search_map.js<?php echo "?".$version;?>"></script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/metadata_search_metadata_form.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/map/metadata_map.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/metadata_search_metadata.js<?php echo "?".$version;?>"></script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/file_tree_tab.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/map_tab.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/metadata_tab.js<?php echo "?".$version;?>"></script>	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/file_tab.js<?php echo "?".$version;?>"></script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/wmc/wmc.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/kml/kml.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/atom/atom.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/georss/georss.js<?php echo "?".$version;?>"></script>
	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/services/wms.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/services/wfs.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/services/csw.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/services/wmts.js<?php echo "?".$version;?>"></script>

	
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/widgets/treeMap_services_window.js<?php echo "?".$version;?>"></script>
	<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>jslib/map/map_predifined_layers.php<?php echo "?".$version;?>"></script>
</head>
<body>
	<div id="platform_div"></div>
	<div id="logo_div" style="height:100%;width:100%;text-align:center;">
		<img src="<?php echo $GLOBALS["_default_portal_url"];?>images/welcome.jpg">
	</div>
</body>
</html>