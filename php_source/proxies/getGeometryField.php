<?php

include("required.php");

class getGeometryField
{
	
	var $layerBaseName="";
	
	var $serviceURL="";

	var $serviceAuthentication="";
	
	var $outXML="";
	
	function getGeometryField()
	{
		$this->serviceURL=$_REQUEST["url"];
		
		$this->layerBaseName=$_REQUEST["layer"];
		
		$this->serviceURL=strtolower($this->serviceURL);
			
		$this->serviceURL=str_replace("service=wms","",$this->serviceURL);
		
		$url=$this->serviceURL."?SERVICE=WFS&VERSION=1.1.1&REQUEST=DescribeFeatureType&typename=".$this->layerBaseName;
		
		$url=create_authentication_url($url,$_REQUEST['serviceUsername'],$_REQUEST['servicePassword']);
		
		$xml=file_get_contents_safe($url);
		
		$this->createCleanXML($xml);
		
	}
	
	function createCleanXML($xml)
	{
	
		$dom_xml=new DOMDocument();
			
		$dom_xml->loadXML($xml);
		
		$sequences=$dom_xml->getElementsByTagName("sequence")->item(0)->childNodes;
		
		foreach($sequences as $key=>$value)
		{
			
			foreach($value->attributes as $k=>$v)
			{
				$tagName=(string)$v->nodeName;
				
				if(strtolower($tagName)=="type")
				{
					$type=strtolower((string)$v->nodeValue);
					
					$pos=strpos($type,"gml:");
				
					if ($pos!==false)
					{
						$json=array("GEOM_NAME"=>(string)$value->getAttribute('name'),"GEOM_TYPE"=>str_replace("gml:","",(string)$v->nodeValue));
					}
				}
				
			}
		}
		
		$this->outXML=json_encode($json);
	}

}

header('Content-Type: application/json');

$getGeometryFieldClass=new getGeometryField();

$getGeometryFieldXML=$getGeometryFieldClass->outXML;

print_r($getGeometryFieldXML);

?>