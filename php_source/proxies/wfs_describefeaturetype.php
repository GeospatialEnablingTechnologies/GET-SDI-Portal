<?php


include("required.php");

set_time_limit(120);

header("Cache-Control:no-store,no-cache,must-revalidate");

$url = $_SERVER["REQUEST_URI"];


$urlsplit=explode("url=",$url);

$get_url=$urlsplit[1];

$xmlstring=file_get_contents_safe($get_url);

$xml = simplexml_load_string($xmlstring);

$i=0;

foreach($xml->children('xsd', true)->complexType->complexContent->extension->sequence->element as $key=>$value)
{
	$objattr=(array)$value->attributes();
	$attArray[$i]=array_values($objattr);
	$i++;
}

echo json_encode($attArray);

?>