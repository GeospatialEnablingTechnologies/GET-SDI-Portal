<?php


include("required.php");

function metadataRecordXML($data)
{
	$request='<?xml version="1.0" encoding="UTF-8"?><GetRecordById xmlns="http://www.opengis.net/cat/csw/2.0.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd" service="CSW" version="2.0.2" outputFormat="application/xml"  outputSchema="http://www.isotc211.org/2005/gmd">
			<Id>'.$data["recordId"].'</Id>
			<ElementSetName>full</ElementSetName>
		</GetRecordById>';
		
	$output=file_get_contents_safe($data["server"],true,$request);
	
	return $output;
}


header('Content-type: application/xml');

echo metadataRecordXML($_REQUEST);

?>