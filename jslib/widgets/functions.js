/*version message*/

Array.prototype.containsVal = function(obj) {
			var i = this.length;
			while (i--) {
				if (this[i] === obj) {
					return true;
				}
			}
			return false;
		}

if(!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(what, i) {
		i = i || 0;
		var L = this.length;
		while (i < L) {
			if(this[i] === what) return i;
			++i;
		}
		return -1;
	};
}

function fc_isVisibleLayerFromBasename(basename,url)
{
	var output=false;
	
	mapPanel.layers.each(function(layer){
		
		var service_url=layer.get("source_id");
		
		var layer_basename=layer.get("layers_basename");
		
		if ((service_url==url) && (layer_basename==basename))
		{
			if (layer.get("layer").getVisibility()===true)
			{
				output=true;
			}

		}
	
	});
	
	return output;
}


function fc_returnLayerFromObject(obj)
{
	var output;

	mapPanel.layers.each(function(layer){
		
		var service_url=layer.get("source_id");
		
		var layer_basename=layer.get("layers_basename");
		
		if ((service_url==obj.serviceURI) && (layer_basename==obj.layerBasename))
		{
			output=layer;
		}
	
	});
	

	return output;
}

function fc_returnEPSG_forBBOX(layes_crs)
{
	var epsg="";
	
	var supportedProjections=layes_crs.split(",");
	
	for(var i=0; i<supportedProjections.length; i++)
	{
		var epsg=supportedProjections[i];
		
		if (epsg==map_currentMapProjection) 
		{
			epsg=map_currentMapProjection;
		}
	}
	
	return epsg;
}

function fc_returnHasWGS(layes_crs)
{
	var hasWGS=false;
	
	var supportedProjections=layes_crs.split(",");
	
	for(var i=0; i<supportedProjections.length; i++)
	{
		var epsg=supportedProjections[i];
		
		if (epsg=="EPSG:4326") 
		{
			hasWGS=true;
		}
	}
	
	return hasWGS;
}

function fc_showVectorOnMap(gml_url,epsg,layer_VectorFormat)
{
	
	var formatVector=new OpenLayers.Format.GML();
	
	switch(layer_VectorFormat)
	{
		case "wkt":
			formatVector=new OpenLayers.Format.WKT();
		break;
		
	}
	
	try{
		map.removeLayer(get_info_gml_layer);
	}
	catch(err)
	{}
	
	var get_info_gml_layer_vector=new OpenLayers.Layer.Vector("getInfoGML",
	{
		strategies: [new OpenLayers.Strategy.Fixed()],
		projection:new OpenLayers.Projection(epsg),
		protocol:new OpenLayers.Protocol.HTTP(
		{
			url:gml_url,
			format:formatVector
		})
	});
	
	var recordType = GeoExt.data.LayerRecord.create();

	var recordh = new recordType({layer: get_info_gml_layer_vector, title: "getInfoGML",id:"getInfoGML" });

	var copy = recordh.clone();

	mapPanel.layers.add(copy);

	get_info_gml_layer=copy.get("layer");
	
	get_info_gml_layer.events.on({
		loadend: function() {
			map.zoomToExtent(get_info_gml_layer.getDataExtent());
		}
	});

}


function fc_createAuthentication(username,password)
{
	var wms_authentication="";
	
	wms_authentication="serviceUsername="+username+"&servicePassword="+password;
	
	return wms_authentication;
}

function fc_createLoadLayerIcon(copy,icon)
{

	copy.get("layer").events.on({
		loadend: function() {
		
				var layer_id=copy.get("layer").id;
				var layer_icon=icon;
				Ext.getCmp('layerTree_layers').getNodeById(layer_id).setIcon(layer_icon);
				Ext.getCmp('layerTree_layers').getNodeById(layer_id).setTooltip(copy.get("layer_title"));
				Ext.getCmp('layerTree_databases').getNodeById(layer_id).setIcon(layer_icon);
				Ext.getCmp('layerTree_databases').getNodeById(layer_id).setTooltip(copy.get("layer_title"));
				Ext.getCmp('layerTree_services').getNodeById(layer_id).setIcon(layer_icon);
				Ext.getCmp('layerTree_services').getNodeById(layer_id).setTooltip(copy.get("layer_title"));
			
		},
		loadstart: function(){
			
		
			try
			{
				if (checkIfEPSGNotSupportedOneLayer(copy,map_currentMapProjection.toString()))
				{
					var layer_id=copy.get("layer").id;
					var layer_icon="images/gis_icons/loading.gif";
					Ext.getCmp('layerTree_layers').getNodeById(layer_id).setIcon(layer_icon);
					Ext.getCmp('layerTree_layers').getNodeById(layer_id).setTooltip(layer_load_please_wait_tooltip);
					Ext.getCmp('layerTree_databases').getNodeById(layer_id).setIcon(layer_icon);
					Ext.getCmp('layerTree_databases').getNodeById(layer_id).setTooltip(layer_load_please_wait_tooltip);
					Ext.getCmp('layerTree_services').getNodeById(layer_id).setIcon(layer_icon);
					Ext.getCmp('layerTree_services').getNodeById(layer_id).setTooltip(layer_load_please_wait_tooltip);
				}
			}catch(err){}
		}
	});
	
	copy.set("layer_icon",icon);
	
	if (checkIfEPSGNotSupportedOneLayer(copy,map_currentMapProjection.toString()))
	{
		if (copy.get("layer").visibility==false)
		{
			copy.set("icon",icon);
		}
		else
		{
			copy.set("icon","images/gis_icons/loading.gif");
		}
	}
	else
	{
		copy.set("icon",icon);
	}
}

function fc_stringFromXML(str)
{
	str.replace(/&amp;/g , "&");
	
	return str;
}

var fc_clearTmpUploads_AJAX;

function fc_clearTmpUploads()
{
	if(typeof fc_clearTmpUploads_AJAX!=="undefined")
	{
		Ext.Ajax.abort(fc_clearTmpUploads_AJAX);
	}
			
	fc_clearTmpUploads_AJAX=Ext.Ajax.request({
		url:"modules/checkTmpUploads.php?me=true",
		timeout:5000
	});
	
	alert(title_exit_alert);
}

window.onbeforeunload=fc_clearTmpUploads;