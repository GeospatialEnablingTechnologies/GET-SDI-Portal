<?php

/*version message*/

include("required.php");

header("Cache-Control:no-store,no-cache,must-revalidate");
	
set_time_limit(50000);

class validateCSWService
{
	var $output="";
	
	var $isValidCSW="false";
	
	var $CSW_Title="";
	
	var $serviceURL="";
	
	function validateCSWService()
	{
		$url=$_SERVER["REQUEST_URI"];
 
		$url=explode("url=",$url);  
		
		$url=$url[1];
		
		$url=explode("&_dc=",$url);
		
		$url=$url[0];
		
		$url=fc_cleanServiceUrl($url);
		
		$this->serviceURL=$url;
		
		if (strpos($url,"?")==""){$seperator = "?";}else{$seperator = "&";}
		
		$xml= file_get_contents_safe($url.$seperator."REQUEST=GetCapabilities");
		
		$this->isValidCSW=$this->validateCSW($xml);
		
		if ($this->isValidCSW)
		{
			$doc = new DOMDocument;
			
			$doc->preserveWhiteSpace = false;
			
			$doc->loadXML($xml);
		
			$xpath = new DOMXPath($doc);
	
			$entries = $xpath->query("//ows:ServiceIdentification/ows:Title");
			
			foreach ($entries as $entry) {			 
				 $this->CSW_Title=$entry->nodeValue;
			}
			
			if (empty($this->CSW_Title))
			{
				$this->CSW_Title=$url;
			}
		}
		
		$this->output=array(
			"isValid"=>$this->isValidCSW,
			"serviceTitle"=>$this->CSW_Title,
			"serviceUrl"=>$this->serviceURL
		);
		
	}
	
	function validateCSW($xml)
	{
		libxml_use_internal_errors(true);
		
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($xml);
		
		if (!$dom_xml->schemaValidate('xsds/csw/2.0.2/csw.xsd')) { 
			
			$temp_validation="true";
			
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
		else {  
			
			return "true";
		} 
	}
	
}

$validateCSWService=new validateCSWService();

echo json_encode($validateCSWService->output);

?>