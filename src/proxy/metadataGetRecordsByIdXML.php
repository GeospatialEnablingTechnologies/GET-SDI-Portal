<?php

require_once("proxy.php");

error_reporting(0);

function metadataRecordXML()
{
	

	$request='<?xml version="1.0" encoding="UTF-8"?><GetRecordById xmlns="http://www.opengis.net/cat/csw/2.0.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd" service="CSW" version="2.0.2" outputFormat="application/xml"  outputSchema="http://www.isotc211.org/2005/gmd">
			<Id>'.$_REQUEST["recordId"].'</Id>
			<ElementSetName>full</ElementSetName>
		</GetRecordById>';
		
	$p=new PROXY();
	
	$_url=$_SERVER["REQUEST_URI"];
	  
	$_url=explode("server=",$_url);
	 
	$p->_url=$_url[1];
	
	$p->_postData = $request;
	
	$p->get();
	
	$xml = $p->o_response;
	
	return $xml;
}


header('Content-type: application/xml');

echo metadataRecordXML();

?>