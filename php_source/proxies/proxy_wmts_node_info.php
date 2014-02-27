<?php

/*version message*/

include("required.php");
	$url=$_SERVER["REQUEST_URI"];
  
	$url=explode("url=",$url);  
	$url=$url[1];


	$xml= file_get_contents_safe($url);

	
	$xml=str_replace("<ows:","<",$xml);
	$xml=str_replace("</ows:","</",$xml);
	$xml=str_replace("<ogc:","<",$xml);
	$xml=str_replace("</ogc:","</",$xml);
	$xml=str_replace("<csw:","<",$xml);
	$xml=str_replace("</csw:","</",$xml);
	$xml=str_replace("<inspire:","<",$xml);
	$xml=str_replace("</inspire:","</",$xml);
	
	
	$xml=simplexml_load_string($xml);

	$xml_out["ContactPerson"]=(string)$xml->Service->ContactInformation->ContactPersonPrimary->ContactPerson;
	
	$xml_out["ContactOrganization"]=(string)$xml->Service->ContactInformation->ContactPersonPrimary->ContactOrganization;
	
	$xml_out["ContactPosition"]=(string)$xml->Service->ContactInformation->ContactPosition;
	
	$xml_out["ContactElectronicMailAddress"]=(string)$xml->Service->ContactInformation->ContactElectronicMailAddress;
	
	$xml_out["Fees"]=(string)$xml->Service->Fees;
	
	$xml_out["AccessConstraints"]=(string)$xml->Service->AccessConstraints;
	
	echo json_encode($xml_out);

?>