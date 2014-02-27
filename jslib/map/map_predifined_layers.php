<?php

include("../../php_source/proxies/required.php");


header('Cache-control: no-store, no-cache, must-revalidate');
header('Content-type: application/x-javascript');


class mapPredifined
{

	var $output="";
	
	var $max_count=0;
	
	var $services=array(
	
		//examples:
		//array("SERVICE_TYPE"=>"WMS","SERVICE_URL"=>"http://mydomain/geoserver/wms","SERVICE_AUTHENTICATION"=>array("USERNAME"=>"","PASSWORD"=>""),"LAYERS_LOAD"=>"['layer1','layer2','layer3']","LAYERS_EXCLUDED"=>"''","NOT_VISIBLE_LAYERS"=>"['layer1','layer2']"),
	
		//array("SERVICE_TYPE"=>"CSW","SERVICE_URL"=>"http://mydomain/geonetwork/srv/eng/csw?service=CSW")
		
		
	);
	
	function mapPredifined()
	{
		
		if (!empty($this->services))
		{
			$i=0;
		
			$services_array=array();
			
			foreach($this->services as $key=>$value)
			{
				$credentials="''";
			
				if (!empty($value["SERVICE_AUTHENTICATION"]))
				{
					$authArr=$value["SERVICE_AUTHENTICATION"];
					
					if (!empty($authArr["USERNAME"]))
					{
						if (!empty($authArr["PASSWORD"]))
						{
							$credentials="serviceUsername=".fc_encryptValue($authArr["USERNAME"])."&servicePassword=".fc_encryptValue($authArr["PASSWORD"]);
						}
					}
			
				}
				
				switch(strtolower($value["SERVICE_TYPE"]))
				{
					case "wms":
						$services_array[$i]="case ".$i.":
			addPredifinedWMS(\"".fc_cleanServiceUrl($value["SERVICE_URL"])."\",\"".$credentials."\",".$value["LAYERS_LOAD"].",".$value["LAYERS_EXCLUDED"].",".$value["NOT_VISIBLE_LAYERS"].",0);
		break;";
					break;
					
					case "wfs":
						$services_array[$i]="case ".$i.":
			addPredifinedWFS(\"".fc_cleanServiceUrl($value["SERVICE_URL"])."\",\"".$credentials."\",".$value["LAYERS_LOAD"].",".$value["LAYERS_EXCLUDED"].",".$value["NOT_VISIBLE_LAYERS"].",0);
		break;";
					break;
					
					case "wfst":
						$services_array[$i]="case ".$i.":
			addPredifinedWFST(\"".fc_cleanServiceUrl($value["SERVICE_URL"])."\",\"".$credentials."\",".$value["LAYERS_LOAD"].",".$value["LAYERS_EXCLUDED"].",".$value["NOT_VISIBLE_LAYERS"].",0);
		break;";
					break;
					
					case "wmts":
						$services_array[$i]="case ".$i.":
			addPredifinedWMTS(\"".fc_cleanServiceUrl($value["SERVICE_URL"])."\",\"".$credentials."\",".$value["LAYERS_LOAD"].",".$value["LAYERS_EXCLUDED"].",".$value["NOT_VISIBLE_LAYERS"].",0);
		break;";
					break;
					
					case "csw":
						$services_array[$i]="case ".$i.":
			addPredifinedCSW(\"".fc_cleanServiceUrl($value["SERVICE_URL"])."\");
		break;";
					break;
				
				}
				
				$i++;
			}
			
			$this->max_count=count($this->services);
			
			$this->output=implode("\r\n",$services_array);
	
		}
	
	}
}

$_map_predifined=new mapPredifined();

?>


/*version message*/
var predifinedArrayCount=0;

var predifinedArrayMaxCount=<?php echo $_map_predifined->max_count;?>;

Ext.onReady(function() {

	setTimeout(function(){addPredifinedServers(predifinedArrayCount);},1000);
	

});

var reorderLayersActive=true;

function reorderLayers()
{

	mapPanel.layers.each(function(layer){
	
		var service_type=layer.get("service_type");
		
		if (service_type=="WMS")
		{
			map.setLayerIndex(layer.get("layer"),(map.layers.length-layer.get("layer").order));
		}
	});
	
}




function reorderPredifinedServices()
{
	predifinedArrayCount++;
	
	addPredifinedServers(predifinedArrayCount);
	
}


function addPredifinedServers(count)
{
	
	
	switch(count)
	{
		<?php 
		
			echo $_map_predifined->output;
		
		?>
		
		default:
		
		break;
		
	}
	
}

function addPredifinedWMS(url,authentication,layers,exceptions,not_visible_layers,times)
{
	var output=false;

	times++;
	
	var sec=1500*times;
	
	if (times<=3)
	{
		var alreadyRegistered=false;

		Ext.each(wms_store.data.items,function(item,index){
			if (item.get('service_URI')==url)
			{
				alreadyRegistered=true;
				
			}
		});
		
		if (alreadyRegistered==false)
		{
			addWMSServerAJAX(url,authentication);
		}
		
		var tOut=setTimeout(
		
			function(){
				
				var isRegistered=false;
		
				Ext.each(wms_store.data.items,function(item,index){
					if (item.get('service_URI')==url)
					{
						isRegistered=true;
						
						reorderPredifinedServices();
						
						var wms_store_fun=wms_fetchLayers(item);
						
						wms_store_fun.load();
						
						wms_store_fun.on('load', function(store,records,options) {
							
							Ext.each(store.data.items,function(itm,indx){
							
								
								if ((layers.indexOf(itm.get("Name"))>-1) || (layers=="all"))
								{
									if ((exceptions.indexOf(itm.get("Name"))==-1) || (exceptions==""))
									{
										if ((not_visible_layers.indexOf(itm.get("Name"))>-1) || (not_visible_layers=="all"))
										{
											itm.visibility=false;
										}
										
										itm.order=layers.indexOf(itm.get("Name"));
										
										wms_registerLayer(itm);
										
									}
								}
								
							});
							
							output=true;
						
						});
					}
				});
				
				
				
				if (isRegistered==false)
				{
					addPredifinedWMS(url,authentication,layers,exceptions,not_visible_layers,times);
				}
			
			},
			sec);
	}
	else
	{
		reorderPredifinedServices();
	}
	
	return output;
}


function addPredifinedWFST(url,authentication,layers,exceptions,not_visible_layers,times)
{
	var output=false;

	times++;
	
	var sec=1500*times;
	
	if (times<=3)
	{
		var alreadyRegistered=false;
	
		Ext.each(wfst_store.data.items,function(item,index){
			if (item.get('service_URI')==url)
			{
				alreadyRegistered=true;
			}
		});
		
		if (alreadyRegistered==false)
		{
			addWFSTServerAJAX(url);
		}
		
		var tOut=setTimeout(
		
			function(){
				
				var isRegistered=false;
			
				Ext.each(wfst_store.data.items,function(item,index){
					if (item.get('service_URI')==url)
					{
						isRegistered=true;
						
						reorderPredifinedServices();
						
						var wfst_store_fun=wfst_fetchLayers(item);
						
						wfst_store_fun.load();
						
						wfst_store_fun.on('load', function(store,records,options) {
							
							Ext.each(store.data.items,function(itm,indx){
							
								if ((layers.indexOf(itm.get("Name"))>-1) || (layers=="all"))
								{
									if ((exceptions.indexOf(itm.get("Name"))==-1) || (exceptions==""))
									{
										if ((not_visible_layers.indexOf(itm.get("Name"))>-1) || (not_visible_layers=="all"))
										{
											itm.visibility=false;
										}
										
										itm.order=layers.indexOf(itm.get("Name"));
										reorderLayersActive=true;
										wfst_registerLayer(itm);
									}
								}
								
							});
						
							output=true;
						
						});
					}
				});
				
				if (isRegistered==false)
				{
					addPredifinedWFST(url,authentication,layers,exceptions,not_visible_layers,times);
				}
			
			},
			sec);
	}
	else
	{
		reorderPredifinedServices();
	}
	
	return output;
}

function addPredifinedWFS(url,authentication,layers,exceptions,not_visible_layers,times)
{
	var output=false;

	times++;
	
	var sec=1500*times;
	
	if (times<=3)
	{
		var alreadyRegistered=false;
	
		Ext.each(wfs_store.data.items,function(item,index){
			if (item.get('service_URI')==url)
			{
				alreadyRegistered=true;
			}
		});
		
		if (alreadyRegistered==false)
		{
			addWFSServerAJAX(url);
		}
		
		var tOut=setTimeout(
		
			function(){
				
				var isRegistered=false;
			
				Ext.each(wfs_store.data.items,function(item,index){
					if (item.get('service_URI')==url)
					{
						isRegistered=true;
						
						reorderPredifinedServices();
						
						var wfs_store_fun=wfs_fetchLayers(item);
						
						wfs_store_fun.load();
						
						wfs_store_fun.on('load', function(store,records,options) {
							
							Ext.each(store.data.items,function(itm,indx){
							
								if ((layers.indexOf(itm.get("Name"))>-1) || (layers=="all"))
								{
									if ((exceptions.indexOf(itm.get("Name"))==-1) || (exceptions==""))
									{
										if ((not_visible_layers.indexOf(itm.get("Name"))>-1) || (not_visible_layers=="all"))
										{
											itm.visibility=false;
										}
										
										itm.order=layers.indexOf(itm.get("Name"));
										
										
										wfs_registerLayer(itm);
									}
								}
								
							});
						
							output=true;
						
						});
					}
				});
				
				if (isRegistered==false)
				{
					addPredifinedWFS(url,authentication,layers,exceptions,not_visible_layers,times);
				}
			
			},
			sec);
	}
	else
	{
		reorderPredifinedServices();
	}
	
	return output;
}

function addPredifinedWMTS(url,authentication,layers,exceptions,not_visible_layers,times)
{
	var output=false;

	times++;
	
	var sec=1500*times;
	
	if (times<=3)
	{
		var alreadyRegistered=false;
	
		Ext.each(wmts_store.data.items,function(item,index){
			if (item.get('service_URI')==url)
			{
				alreadyRegistered=true;
			}
		});
		
		if (alreadyRegistered==false)
		{
			addWMTSServerAJAX(url);
		}
		
		var tOut=setTimeout(
		
			function(){
				
				var isRegistered=false;
			
				Ext.each(wmts_store.data.items,function(item,index){
					if (item.get('service_URI')==url)
					{
						isRegistered=true;
						
						reorderPredifinedServices();
						
						var wmts_store_fun=wmts_fetchLayers(item);
						
						wmts_store_fun.load();
						
						wmts_store_fun.on('load', function(store,records,options) {
							
							Ext.each(store.data.items,function(itm,indx){
							
								if ((layers.indexOf(itm.get("IDENTIFIER"))>-1) || (layers=="all"))
								{
									if ((exceptions.indexOf(itm.get("IDENTIFIER"))==-1) || (exceptions==""))
									{
										if ((not_visible_layers.indexOf(itm.get("Name"))>-1) || (not_visible_layers=="all"))
										{
											itm.visibility=false;
										}
										
										itm.order=layers.indexOf(itm.get("Name"));
										
										reorderLayersActive=true;
										wmts_registerLayer(itm);
									}
								}
								
							});
						
							output=true;
						
						});
					}
				});
				
				if (isRegistered==false)
				{
					addPredifinedWMTS(url,authentication,layers,exceptions,not_visible_layers,times);
				}
			
			},
			sec);
	}
	else
	{
		reorderPredifinedServices();
	}
	
	return output;
}


function addPredifinedCSW(url)
{
	csw_AddService(url);
	
	reorderPredifinedServices();
}