<?php

include("required.php");

header("Cache-Control:no-store,no-cache,must-revalidate");
	
set_time_limit(50000);

class validateWFSService
{
	var $output="";
	
	var $isValidWFS="false";
	
	var $versionWFS="";
	
	var $serviceNameWFS="";
	
	var $serviceURL="";
	
	var $serviceAbstractWFS="";
	
	var $serviceType="WFS";
	
	var $serviceNamespaces="";
	
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
	
	function validateWFSService()
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
	
		$this->validateWFS($xml);
		
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
	
	function validateWFS($xml)
	{
		libxml_use_internal_errors(true);
		
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($xml);
		
		$rootValid=$dom_xml->getElementsByTagNameNS("http://www.opengis.net/wfs/2.0","WFS_Capabilities");
			
		if ($rootValid->length>0)
		{
			$this->versionWFS=(string)$rootValid->item(0)->getAttribute('version');
		}
		else
		{
			$rootValid=$dom_xml->getElementsByTagNameNS("http://www.opengis.net/wfs","WFS_Capabilities");
			
			if ($rootValid->length>0)
			{
				$this->versionWFS=(string)$rootValid->item(0)->getAttribute('version');
				
			}
		}
		
		switch ($this->versionWFS)
		{
			case "2.0.0":
			
				if ($this->validateAgainstSchema($dom_xml,"2.0.0/wfs.xsd"))
				{
					$this->isValidWFS="true";
					
					$pathToTag=$dom_xml->getElementsByTagName("ServiceIdentification")->item(0)->childNodes;
					
					$this->serviceNameWFS=$this->getServiceOneNodeValue($pathToTag,"ows:Title");
					$this->serviceAbstractWFS=$this->getServiceOneNodeValue($pathToTag,"ows:Abstract");
					
					if ($this->isSecured=="true")
					{
						$this->isSecureLogged="true";
					}
				}
			
			break;
			
			case "1.1.0":
				
				if ($this->validateAgainstSchema($dom_xml,"1.1.0/wfs.xsd"))
				{
					$this->isValidWFS="true";
					
					$pathToTag=$dom_xml->getElementsByTagNameNS("http://www.opengis.net/ows","ServiceIdentification")->item(0)->childNodes;
					
					$this->serviceNameWFS=$this->getServiceOneNodeValue($pathToTag,"ows:Title");
					$this->serviceAbstractWFS=$this->getServiceOneNodeValue($pathToTag,"ows:Abstract");
					
					if ($this->isSecured=="true")
					{
						$this->isSecureLogged="true";
					}
				}
			
			break;
			
			case "1.0.0":
			
				$this->isValidWFS="true";
					
				$pathToTag=$dom_xml->getElementsByTagName("Service")->item(0)->childNodes;
					
				$this->serviceNameWFS=$this->getServiceOneNodeValue($pathToTag,"Title");
				$this->serviceAbstractWFS=$this->getServiceOneNodeValue($pathToTag,"Abstract");
				
				if ($this->isSecured=="true")
				{
					$this->isSecureLogged="true";
				}
				
			break;
		}
		
		if ($this->versionWFS=="2.0.0")
		{
			$this->versionWFS="1.1.0";
		}
		
		$jsonArray=array(
			"serviceTitle"=>$this->serviceNameWFS,
			"serviceAbstract"=>$this->serviceAbstractWFS,
			"serviceType"=>$this->serviceType,
			"serviceUrl"=>$this->serviceURL,
			"serviceNameSpaces"=>$this->getServiceNamespaces($dom_xml),
			"version"=>$this->versionWFS,
			"isValid"=>$this->isValidWFS,
			"isSecured"=>$this->isSecured,
			"serviceUsername"=>$this->secureUsernameEnc,
			"servicePassword"=>$this->securePasswordEnc,
			"serviceIsSecureLogged"=>$this->isSecureLogged
			);
		
		$this->outputJSON=json_encode($jsonArray);
		
		return;
	}
	
	function getServiceNamespaces($dom_xml)
	{
		$nameSpacesArray=array();
	
		$context = $dom_xml->documentElement;

		$xpath = new DOMXPath($dom_xml);
		foreach( $xpath->query('namespace::*', $context) as $nameXMLNS=>$node ) {
		
			$namespaceValue=(string)$node->nodeValue;
			$namespaceName=(string)$node->nodeName;
			$namespaceNameSplit=explode(":",$namespaceName);
			$countNamespaceNameSplit=count($namespaceNameSplit);
			if ($countNamespaceNameSplit>0)
			{
				$currentNameSpace=$namespaceNameSplit[$countNamespaceNameSplit-1];
				$nameSpacesArray[$currentNameSpace]=$namespaceValue;

			}
			else
			{
				$nameSpacesArray[$namespaceName]=$namespaceValue;
			}
			
		}
	
		return $nameSpacesArray;
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
		if (!$dom_xml->schemaValidate('xsds/wfs/'.$schema)) { 
			
			$temp_validation=true;
			
			$err_code="";
			
			$libxml_errs=libxml_get_errors();
			
			foreach($libxml_errs as $k_err=>$k_val)
			{
				$err_code=(string)$k_val->code;
				
				if (($err_code=="1872") || ($err_code=="1845"))
				{
					$temp_validation="false";
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

$validateWFSService=new validateWFSService();

echo $validateWFSService->outputJSON;

?>