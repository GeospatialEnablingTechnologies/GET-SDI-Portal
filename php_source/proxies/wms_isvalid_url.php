<?php

include("required.php");

header("Cache-Control:no-store,no-cache,must-revalidate");
	
set_time_limit(50000);

class validateWMSService
{
	var $output="";
	
	var $isValidWMS="false";
	
	var $versionWMS="";
	
	var $serviceNameWMS="";
	
	var $serviceURL="";
	
	var $serviceAbstractWMS="";
	
	var $serviceType="WMS";
	
	var $shouldSupportEPSGS;
	
	var $supportedEPSGS=array();
	
	var $secureUsernameEnc="";
	
	var $securePasswordEnc="";
	
	var $secureUsernameDec="";
	
	var $securePasswordDec="";
	
	var $isSecured="false";
	
	var $isLogged="false";
	
	var $isSecureLogged="false";
	
	var $outputJSON="";
	
	function validateWMSService()
	{
		$url=$_SERVER["REQUEST_URI"];
		
		$this->shouldSupportEPSGS=$GLOBALS["_supported_EPSGS"];
 
		$url=explode("url=",$url);  
		
		$url=$url[1];
		
		$url=explode("&_dc=",$url);
		
		$url=$url[0];
		
		$url=fc_cleanServiceUrl($url);
		
		$this->serviceURL=$url;
		
		if (strpos($url,"?")==""){$seperator = "?";}else{$seperator = "&";}
		
		if (isset($_GET["initUsername"]))
		{
			$url=$url.$seperator."REQUEST=GetCapabilities";
			
			$this->secureUsernameEnc=fc_encryptValue(base64_decode($_GET['initUsername']));
			
			$this->securePasswordEnc=fc_encryptValue(base64_decode($_GET['initPassword']));
			
			$url=create_authentication_url($url,$this->secureUsernameEnc,$this->securePasswordEnc);
			
			$this->isSecured="true";

			$xml= file_get_contents_safe($url);
		}
		elseif (isset($_GET["serviceUsername"]))
		{
			$url=$url.$seperator."REQUEST=GetCapabilities";
		
			$url=create_authentication_url($url,$_GET['serviceUsername'],$_GET['servicePassword']);
			
			$this->secureUsernameEnc=$_GET['serviceUsername'];
			
			$this->securePasswordEnc=$_GET['servicePassword'];
			
			$this->isSecured="true";
			
			$xml= file_get_contents_safe($url);
		
		}
		else
		{
			$url=$url.$seperator."REQUEST=GetCapabilities";
			
			$xml= file_get_contents_safe($url);
		
			$this->isSecureStatus($xml);
		}

		$this->validateWMS($xml);
		
	}
	
	
	function isSecureStatus($xml)
	{
		if ($xml=="error:401")
		{
			$this->isSecured="true";
			return true;
		}
		else
		{
			$this->isSecured="false";
			return false;
		}
	}
	
	function validateWMS($xml)
	{
			
		libxml_use_internal_errors(true);
			
		$dom_xml=new DOMDocument();
			
		$dom_xml->loadXML($xml);
		
		$rootValid=$dom_xml->getElementsByTagName("WMT_MS_Capabilities");
			
		/******* Check for validation against WMS 1.3.0 xsd************/
		if ($this->validateAgainstSchema($dom_xml,"1.3.0/capabilities_1_3_0.xsd"))
		{
			$this->versionWMS="1.3.0";
			$this->isValidWMS="true";
				
			$pathToEPSGs=$dom_xml->getElementsByTagName("Layer")->item(0)->childNodes;
			$this->supportedEPSGS=$this->getSupportedEPSGS($pathToEPSGs,"CRS");
				
			$pathToTag=$dom_xml->getElementsByTagName("Service")->item(0)->childNodes;
				
			$this->serviceNameWMS=$this->getServiceOneNodeValue($pathToTag,"Title");
			$this->serviceAbstractWMS=$this->getServiceOneNodeValue($pathToTag,"Abstract");
				
			if ($this->isSecured=="true")
			{
				$this->isSecureLogged="true";
			}
		}
		/******* Check for validation against WMS dtd if not 1.3.0************/
		elseif ($rootValid->length>0)
		{
			
			
			//$rootValid=$dom_xml->getElementsByTagName("WMT_MS_Capabilities");
				
			if ($rootValid->length>0)
			{
				$this->versionWMS=$rootValid->item(0)->getAttribute('version');
				$this->isValidWMS="true";
					
				$pathToEPSGs=$dom_xml->getElementsByTagName("Layer")->item(0)->childNodes;
				$this->supportedEPSGS=$this->getSupportedEPSGS($pathToEPSGs,"SRS");
					
				$pathToTag=$dom_xml->getElementsByTagName("Service")->item(0)->childNodes;
				
				$this->serviceNameWMS=$this->getServiceOneNodeValue($pathToTag,"Title");
				$this->serviceAbstractWMS=$this->getServiceOneNodeValue($pathToTag,"Abstract");
				
				if ($this->isSecured=="true")
				{
					$this->isSecureLogged="true";
				}
			}
			
			
		}
		
		$jsonArray=array(
			"serviceTitle"=>$this->serviceNameWMS,
			"serviceAbstract"=>$this->serviceAbstractWMS,
			"serviceType"=>$this->serviceType,
			"serviceUrl"=>$this->serviceURL,
			"version"=>$this->versionWMS,
			"isValid"=>$this->isValidWMS,
			"supportedEPSGS"=>$this->supportedEPSGS,
			"isSecured"=>$this->isSecured,
			"serviceUsername"=>$this->secureUsernameEnc,
			"servicePassword"=>$this->securePasswordEnc,
			"serviceIsSecureLogged"=>$this->isSecureLogged
			);
		
		$this->outputJSON=json_encode($jsonArray);
		
		return;
	}
	
	function getServiceOneNodeValue($pathToTag,$nodeName)
	{
		$tagValue="";
	
		foreach ($pathToTag as $key=>$value)
		{
			$keyName=(string)$value->tagName;
			
			if ($keyName==$nodeName)
			{	
				$tagValue=(string)$value->nodeValue;
			}
		}
	
		return $tagValue;
	}
	
	function getSupportedEPSGS($pathToEPSGS,$srsTagName)
	{
		$supportedEPSGArray=Array();
		
		foreach ($pathToEPSGS as $key=>$value)
		{
			$keyName=(string)$value->tagName;
			
			if ($keyName==$srsTagName)
			{	
				$epsg=(string)$value->nodeValue;
				
				if (in_array($epsg,$this->shouldSupportEPSGS))
				{
					$supportedEPSGArray[]=(string)$value->nodeValue;
				}
			}
		}
		
		if (count($supportedEPSGArray)==0)
		{
			$supportedEPSGArray[]="EPSG:4326";
		}
		
		return $supportedEPSGArray;
	}
	
	function validateAgainstSchema($dom_xml,$schema)
	{
		if (!$dom_xml->schemaValidate('xsds/wms/'.$schema)) { 
			
			$temp_validation=true;
			
			$err_code="";
			
			$libxml_errs=libxml_get_errors();
			
			foreach($libxml_errs as $k_err=>$k_val)
			{
				$err_code=(string)$k_val->code;
				
				if (($err_code=="1872") || ($err_code=="1845"))
				{
					$temp_validation=false;
				}
			}
			
			return $temp_validation;
		}
		else
		{
			return true;
		}
	}
	
}

$validateWMSService=new validateWMSService();

echo $validateWMSService->outputJSON;

?>