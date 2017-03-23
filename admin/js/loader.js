/************loader.js**********************/
/**** loads all the necessary files and ****/
/**** configuration of the application *****/

/**** (var) init_onload_fn:stores all the function names to be executed on load of the application ****/
var init_onload_fn=new Array();
var admin=false;

/**** (var) global_date_format:date time format for all the date time variables****/
var global_date_format = "dd/mm/yyyy";
var global_time_format = "hh:MM:ss";

var installing=false;

/**** (function) fn_execOnloadFn:executes all the functions that are stored to the init_onload_fn variable****/
/**** 100 ms after the loading of the application *************************************************************/
function fn_execOnloadFn()
{
	setTimeout(function()
	{
		Ext.each(init_onload_fn,function(item)
		{
			if(item)
			{
				item();
			}
		});
		 
	},100);
}

/**** (function) fn_getParameterByName(arg name(String)):get url variables values****/
function fn_getParameterByName(name) 
{    
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
 
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    
	results = regex.exec(location.search);
    
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function fn_host()
{
	var _scheme=window.location.protocol;
	
	var _host=window.location.host;
	
	var _path=window.location.pathname;
	
	var host=_scheme+"//"+_host+_path;
	
	host=host.replace("admin/","");
	
	host=host.replace(/[^\/]*$/, ''); 
	
	return host;
	
}


var host=fn_host();

var languageBtn;

var topBanner = host + "images/logos/logo.png";

var topRightBanner = host + "images/logos/topRightBanner.png";

var configFile = "config_gr.js";

var aboutFile = "About_GET_SDI_Portalv4_EN.pdf";

var manualFile = "GETSDIPortalv4_Help_GR_v1.0.pdf";

var languageFile = "el_gr.js";

fn_getLanguageFile();

function fn_getLanguageFile()
{
	var lang=fn_getParameterByName("lang");
	
	lang=lang.toLowerCase();
	
	switch(lang)
	{
		
		case "gr":
		
			languageFile = "el_gr.js";
			
			topBanner = host + "images/logos/logo.png";
			
			configFile = "config.js";
			
			aboutFile = "About_GET_SDI_Portalv4_GR.pdf";
			
			manualFile = "GETSDIPortalv4_Help_GR_v1.0.pdf";
			
			languageBtn={
				xtype:"button",
				id: "languageBtn",
				iconCls:"en_us",
				handler:function()
				{
					window.location=host+"?lang=EN";
				}
			};
			
		break;
		
		default:
		
			languageFile = "en_us.js";
			
			topBanner = host + "images/logos/logo.png";
			
			configFile = "config.js";
			
			aboutFile = "About_GET_SDI_Portalv4_EN.pdf";
			
			manualFile = "GETSDIPortalv4_Help_GR_v1.0.pdf";
			
			languageBtn={
				xtype:"button",
				id: "languageBtn",
				iconCls:"el_gr",
				handler:function()
				{
					window.location=host;
				}
			};
		
		break;
	}
}


var loader_script_urls=[
	"https://maps.googleapis.com/maps/api/js?key=AIzaSyCW1r76P8CrMJ27JbSyK-InFSmtrC6L28A",
	"http://www.google.com/jsapi?language=el"
]

var loader_script_files=[
	"tools/extjs/ext-all.js",
	"tools/extjs/src/ux/TabCloseMenu.js",
	"tools/extjs/src/ux/FilterRow/FilterRow.js",
	
	"tools/extjs/plugins/boxselect/BoxSelect.js",

	"tools/proj4js/lib/proj4js-combined.js",
	"tools/shapefileToGeoJson/stream.js",
	"tools/shapefileToGeoJson/shapefile.js",
	"tools/shapefileToGeoJson/dbf.js",
	
	//"tools/OpenLayers/OpenLayers.js",
	"tools/OpenLayers/OpenLayers.2.13.2.js",
	"tools/OpenLayers/lib/OpenLayers/Control/ScaleBar.js",
	"tools/OpenLayers/lib/OpenLayers/Handler/Path.js",
	"tools/OpenLayers/lib/OpenLayers/Layer/EsriGeoJSON.js",
	"tools/jsts/lib/javascript.util.js",
	"tools/jsts/lib/jsts.js",
	"tools/jsts/lib/attache.array.min.js",
	"tools/utils/date.format.js",
	"js/language/"+languageFile,
	
	
	"js/functions.js",
	"js/maptab/lib/servicesFunctions.js",
	"js/maptab/lib/layersFunctions.js",
	"js/maptab/lib/attributesFunctions.js",
	"js/maptab/lib/featureFunctions.js",
	
	"admin/js/"+configFile,
	
	"admin/js/maptab/maptab_toolbar_edit.js",
	
	"js/maptab/maptab_toolbar_general.js",
	"js/maptab/maptab_toolbar_search.js",
	"js/viewport.js",
	"js/maptab/maptab_west_layer_tree_panel.js",
	"js/maptab/maptab_west_selection_panel.js",
	"js/maptab/maptab_west_search_settings_panel.js",
	"js/maptab/maptab_west_general_settings_panel.js",
	"js/maptab/maptab_east_search_panel.js",
	
	"admin/js/maptab/maptab_west_edit_settings_panel.js",
	"js/maptab/maptab_east_search_panel.js",
	"admin/js/maptab/maptab_east_edit_copy_panel.js",
	"admin/js/maptab/maptab_toolbar_edit/maptab_edit_controls.js",
	
	"js/maptab/maptab_services_manager/wms.js",
	"js/maptab/maptab_services_manager/wfs.js",
	"js/maptab/maptab_services_manager/wmts.js",
	"js/maptab/maptab_services_manager/csw.js",
	"js/maptab/maptab_services_manager/kml.js",
	"js/maptab/maptab_services_manager/atom.js",
	"js/maptab/maptab_services_manager/georss.js",
	"js/maptab/maptab_services_manager/shapefile.js",
	"js/maptab/maptab_services_manager/wmc.js",
	"js/maptab/maptab_services_manager.js",
	"js/maptab.js",
	"admin/js/maptab/admin.js",
	"js/maptab/map.js",
	
	"js/maptab/maptab_toolbar_general/map_controls_featureInfo.js",
	"js/maptab/maptab_toolbar_general/map_controls_measureDistance.js",
	"js/maptab/maptab_toolbar_general/map_controls_measureArea.js",
	
	
	"modules/colorpicker/colorpicker.js",
	"modules/sldeditor/language/"+languageFile,
	"modules/sldeditor/sldeditor.js",
	"modules/print/print.js",
	
	"modules/charts/charts.js",
	
	"modules/quicksearch/quicksearch.js",
	
	"modules/layerdownload/layerdownload.js",

	"modules/configurator/configurator.js",

	"modules/datatable/datatable.js",

	"js/metadatatab/metadatatab_west_form_panel.js",
	"js/metadatatab/metadatatab_toolbar_general.js",
	"js/metadatatab.js",
	"js/metadatatab/metadatatab_map.js",

	"js/filestab.js",

	"js/config_functions.js",

	"modules/featurehits/featurehits.js",

	"modules/bookmarks/lib/AddIns/Bookmark.js",
	"modules/bookmarks/bookmarks.js",

	"modules/intropopup/intropopup.js",

	"modules/configuration/configuration.js",

	"modules/googlegeocoding/googlegeocoding.js",
	"modules/googlestreet/googlestreet.js",
	"modules/googlereversegeocoding/googlereversegeocoding.js",

	"modules/legend/legend.js",

	"modules/googlebasemapstyler/googlebasemapstyler.js"
];

var loader_css_files=[
	"tools/extjs/resources/css/ext-all.css",
	"tools/extjs/resources/ext-theme-gray/ext-theme-gray-all.css",
	"modules/bookmarks/lib/AddIns/bookmark.css",
	"tools/extjs/plugins/boxselect/BoxSelect.css",
	"css/style.css"
];



function init_loader_files()
{
	
	var URLscriptTags = new Array(loader_script_urls.length);
    
	for (var i=0, len=loader_script_urls.length; i<len; i++) 
	{
		URLscriptTags[i] = "<script src='"+loader_script_urls[i]+"'></script>"; 
	}
	
	if (URLscriptTags.length > 0)
	{
		document.write(URLscriptTags.join(""));
	}

	var cssTags = new Array(loader_css_files.length);
    
	for (var i=0, len=loader_css_files.length; i<len; i++) 
	{
		cssTags[i] = "<link rel='stylesheet' type='text/css' href='" + host + loader_css_files[i] +"' />"; 
	}
	
	if (cssTags.length > 0)
	{
		document.write(cssTags.join(""));
	}
	
	var scriptTags = new Array(loader_script_files.length);
    
	for (var i=0, len=loader_script_files.length; i<len; i++) 
	{
		scriptTags[i] = "<script type='text/javascript' src='" + host + loader_script_files[i] +"'></script>"; 
	}
	
	if (scriptTags.length > 0)
	{
		document.write(scriptTags.join(""));
	}
	
}

init_loader_files();
