<?php

/*version message*/

	include("required.php");
	$url=$_SERVER["REQUEST_URI"];
  
	$url=explode("url=",$url);
	
	$getNodeValue=$_GET['getNodeValue'];
	
	$url=$url[1];
	
	$doc = new DOMDocument;
	
	$xml= file_get_contents_safe($url);
	
	$doc->preserveWhiteSpace = false;
	
	$doc->loadXML($xml);

	$xpath = new DOMXPath($doc);
	
	$query = $getNodeValue;

	$entries = $xpath->query($query);

	foreach ($entries as $entry) {			 
		 echo $entry->nodeValue;
	}

?>