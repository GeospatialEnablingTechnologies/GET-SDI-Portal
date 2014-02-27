<?php

include("required.php");

header("Cache-Control:no-store,no-cache,must-revalidate");
	
set_time_limit(50000);

class validateWMTSService
{
	var $output="";
	
	var $isValidWMTS="false";
	
	var $versionWMTS="";
	
	var $serviceURL="";
	
	var $serviceNameWMTS="";
	
	var $serviceAbstractWMTS="";
	
	var $serviceType="WMTS";
	
	var $secureUsernameEnc="";
	
	var $securePasswordEnc="";
	
	var $secureUsernameDec="";
	
	var $securePasswordDec="";
	
	var $isSecured="false";
	
	var $isLogged="false";
	
	var $isSecureLogged="false";
	
	var $outputJSON="";
	
	function validateWMTSService()
	{
		$url=$_SERVER["REQUEST_URI"];
 
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

		$this->validateWMTS($xml);
		
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
	
	function validateWMTS($xml)
	{
			
		libxml_use_internal_errors(true);
			
		$dom_xml=new DOMDocument();
			
		$dom_xml->loadXML($xml);
	
		if ($this->validateAgainstSchema($dom_xml,"1.0.1/wmtsGetCapabilities_response.xsd"))
		{
			$rootValid=$dom_xml->getElementsByTagName("Capabilities");
				
			if ($rootValid->length>0)
			{
				$this->versionWMTS=$rootValid->item(0)->getAttribute('version');
				
				$this->isValidWMTS="true";
					
				$pathToTag=$dom_xml->getElementsByTagNameNS("http://www.opengis.net/ows/1.1","ServiceIdentification")->item(0)->childNodes;
				
				$this->serviceNameWMTS=$this->getServiceOneNodeValue($pathToTag,"ows:Title");
				
				$this->serviceAbstractWMTS=$this->getServiceOneNodeValue($pathToTag,"ows:ServiceType");
				
				if ($this->isSecured=="true")
				{
					$this->isSecureLogged="true";
				}
			}

		}
		
		$jsonArray=array(
			"serviceTitle"=>$this->serviceNameWMTS,
			"serviceAbstract"=>$this->serviceAbstractWMTS,
			"serviceType"=>$this->serviceType,
			"serviceUrl"=>$this->serviceURL,
			"version"=>$this->versionWMTS,
			"isValid"=>$this->isValidWMTS,
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
	
	
	function validateAgainstSchema($dom_xml,$schema)
	{
		if (!$dom_xml->schemaValidate('xsds/wmts/'.$schema)) { 
			
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

$validateWMTSService=new validateWMTSService();

echo $validateWMTSService->outputJSON;

?>