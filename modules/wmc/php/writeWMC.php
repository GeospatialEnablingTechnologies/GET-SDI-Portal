<?php

/*version message*/

function createWMCXML($xml)
{
	ob_clean();
    header('Content-type: text/xml; charset=UTF-8');
    header('Content-Disposition: attachment; filename="WMC_File.xml"');
	header("Content-Transfer-Encoding: binary");
	header('Accept-Ranges: bytes');
	echo ltrim($xml);
    ob_flush();
    exit;
}

createWMCXML($_POST["wmcXML"]);
?>