<?php

/*version message*/

include("required.php");
	$url = $_SERVER["REQUEST_URI"];
	$returnepsg=false;
	$dc=$_GET["_dc"];
	
	$url=str_replace("&_dc=".$dc,"",$url);
	
	$url=explode("&servers",$url);
	
	foreach ($url as $key=>$items)
	{
		

		$full_url=explode("&service_url=",$items);

		$service_url=$full_url[1];

		
		$layers_Service=$full_url[0];

		$layers=explode("service_layers=",$layers_Service);
		
		if ($layers[1]!="")
		{
			$get_layers=$layers[1];
		}

		
		$get_layer=explode(",",$get_layers);
		$layers=null;
		
		foreach($get_layer as $layer_items)
		{
			
			$layers[]=$layer_items;
		}
		
		foreach($layers as $sep_layers)
		{
		
			$get_url="";
			$get_url=$service_url."?SERVICE=".$_GET["SERVICE"]."&REQUEST=GetFeatureInfo&INFO_FORMAT=application/vnd.ogc.gml&SRS=EPSG:4326&BBOX=".$_GET["BBOX"]."&WIDTH=".$_GET["WIDTH"]."&HEIGHT=".$_GET["HEIGHT"]."&X=".$_GET["X"]."&Y=".$_GET["Y"]."&feature_count=1&QUERY_LAYERS=$sep_layers&LAYERS=$sep_layers";
			
			if ($sep_layers!="")
			{
				$isOK=false;
				
				$xml=file_get_contents_safe($get_url);
			
				$xmlp=str_replace("<gml:","<gml_",$xml);
				$xmlp=str_replace("</gml:","</gml_",$xmlp);
				$xmlp=str_replace("<inspire:","<",$xmlp);
				$xmlp=str_replace("</inspire:","</",$xmlp);
				
				foreach($namespaces as $nameitems)
				{
					if (($nameitems!="gml") || ($nameitems!="wfs"))
					{
						$xmlp=str_replace("<".$nameitems.":","<",$xmlp);
						$xmlp=str_replace("</".$nameitems.":","</",$xmlp);
						
					}
				
				}
				
				$xmlpe = simplexml_load_string($xmlp);	
				
				if (array_key_exists("gml_featureMember",$xmlpe))
				{
					$crs=explode("layer_crs=",$sep_layers);
					if($returnepsg==false)
					{
						echo $crs[1];
						$returnepsg=true;
					}
					break;
					
					break;
				}
			
			}
		
		}
		
	}
	
	
?>