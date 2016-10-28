<?php
	
error_reporting(0);

include("../../../src/proxy/proxy.php");
include("../../../src/proxy/wfs.php");

header('Content-type: application/json');

class featurehits
{
	var $output;
	
	var $_data;
	
	function __construct($_in=array())
	{
	
		if(!empty($_in["data"]))
		{
			$this->_data = json_decode($_in["data"]);
			
			$this->output = $this->featureHitsFetch();
		}
		
	}
	
	function featureHitsFetch()
	{
		libxml_use_internal_errors(true);
		
		require("../../../src/proxy/config.php");
		
		$_out = array();
	
		foreach($this->_data as $key=>$value)
		{
			foreach($value->_layers as $k_layer=>$_layer)
			{		
				$p = new PROXY();
				
				$p->_url =  $this->createGetFeatureHits($value->_serviceUrl, $_layer);
				
				$p->get();
				
				$_numberOfFeatures = $p->xmlNode("string(//wfs:FeatureCollection/@numberOfFeatures)");
				
				if (is_numeric($_numberOfFeatures))
				{
					$layerId = md5($_layer);
					
					$serviceId=md5($value->_serviceUrl);
			
					$_layerId = $serviceId.$layerId;
			
					$_out[] = array(
						"_layerId"=>$_layerId,
						"_featureCount"=>$_numberOfFeatures
					);
				}
			}
		}
		
		return $_out;
	}
	
	private function createGetFeatureHits($_url,$_typeNames)
    {
		$_query["REQUEST"]="GETFEATURE";
		
		$_query["SERVICE"]="WFS";
		
		$_query["VERSION"]="1.1.0";
		
		$_query["RESULTTYPE"]="hits";
		
		$_query["TYPENAME"]=$_typeNames;
		
        return PROXY::createUriQuery($_url, $_query);
    }
}


$_fCount = new featurehits($_POST);

echo json_encode($_fCount->output, JSON_NUMERIC_CHECK);
	
?>