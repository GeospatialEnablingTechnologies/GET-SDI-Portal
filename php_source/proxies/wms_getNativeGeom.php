<?php

/*version message*/

include("required.php");

class wmsGetNativeSRS
{
	var $output=array("NATIVE_SRS"=>"EPSG:4326");
	
	var $layerName="";
	
	var $defaultSRS="EPSG:4326";
	
	var $shouldSupportEPSGS;
	
	var $geometryField;

	var $geometryType;
	
	function wmsGetNativeSRS()
	{
		$this->shouldSupportEPSGS=$GLOBALS["_supported_EPSGS_CodesOnly"];
	
		$url=$_SERVER["REQUEST_URI"];
 
		$url=explode("url=",$url);  
		
		$url=$url[1];
		
		$url=explode("&_dc=",$url);
		
		$url=$url[0];
		
		$url=str_replace("WMS","WFS",$url);
		$url=str_replace("wms","wfs",$url);
		
		$urlArr=explode("?",$url);
		
		$this->layerName=$_REQUEST['layerName'];
		
		$url=$urlArr[0]."?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetCapabilities";
		
		$url=create_authentication_url($url,$_REQUEST['serviceUsername'],$_REQUEST['servicePassword']);
		
		$xml=file_get_contents_safe($url);
		
		$this->nativeSRS($xml);
		
		$geomFieldUrl="serviceUsername=".$_REQUEST['serviceUsername']."&servicePassword=".$_REQUEST['servicePassword']."&layer=".$this->layerName."&url=".$urlArr[0];
		
		$geomFieldData=file_get_contents_safe($GLOBALS["_default_portal_url"]."php_source/proxies/getGeometryField.php?".$geomFieldUrl);
		
		$dec_json=(array)json_decode($geomFieldData);
		
		$this->geometryField=$dec_json["GEOM_NAME"];
		
		$this->geometryType=$dec_json["GEOM_TYPE"];
		
		$geomArr=array("GEOM_NAME"=>$this->geometryField,"GEOM_TYPE"=>$this->geometryType);
		
		$this->output["GEOMETRY_FIELD"]=$geomArr;
		
		
	}

	function nativeSRS($xml)
	{
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($xml);
	
		$layers=$dom_xml->getElementsByTagName("FeatureTypeList")->item(0)->childNodes;
		
		$defaultSRS="EPSG:4326";
		
		foreach ($layers as $key=>$value)
		{
			$tagLayers=(string)$value->tagName;
			
			$tagName=$this->getTagName($tagLayers);
			
			if (strtolower($tagName)=="featuretype")
			{
				$i=0;
				foreach($value->childNodes as $k=>$v)
				{
					
					if ((strtolower((string)$v->tagName)=="name") && (strtolower((string)$v->nodeValue)==strtolower($this->layerName)))
					{
						$this->defaultSRS=(string)$value->getElementsByTagName("DefaultSRS")->item(0)->nodeValue;
						
						$this->output["NATIVE_SRS"]=$this->returnSupportedDefault();
						
						return;
					}
					
					$i++;
				}
			
			}
		}
		
	}
	
	function returnSupportedDefault()
	{
		
		foreach($this->shouldSupportEPSGS as $key=>$value)
		{
			$pos=strpos($this->defaultSRS,$value);
			
			if ($pos !== false) 
			{
				$this->defaultSRS="EPSG:".$value;
			}
		}
		
		return $this->defaultSRS;
		
	}
	
	function getTagName($tag)
	{
		$tagArr=explode(":",$tag);
								
		if (count($tagArr)>1)
		$tagName=$tagArr[1];
		else
		$tagName=$tag;
		
		return $tagName;
	}
}

header('Content-Type: application/json');

$x=new wmsGetNativeSRS();
echo json_encode($x->output);


?>