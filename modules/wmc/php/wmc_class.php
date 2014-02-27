<?php

/*version message*/

include("../../../php_source/proxies/required.php");

class wmc_class
{
	var $output;
	
	var $isValidWMC="false";

	function wmc_class()
	{
		$url=$GLOBALS["_default_portal_url"].$_REQUEST["url"];
		
		$xml= file_get_contents_safe($url,true);
		
		$this->output=$this->createJSONResults($xml);
	}
	
	function createJSONResults($xml)
	{
		libxml_use_internal_errors(true);
			
		$dom_xml=new DOMDocument();
			
		$dom_xml->loadXML($xml);
		
		$layers=$dom_xml->getElementsByTagName("LayerList")->item(0)->childNodes;
		
		$wms=array();
			
		foreach ($layers as $key=>$value)
		{
			$exts=$value->getElementsByTagName("Extension")->item(0)->childNodes;
		
			$layer=(string)$value->getElementsByTagName("Name")->item(0)->nodeValue;
			
			$service=(string)$value->getElementsByTagName("OnlineResource")->item(0)->getAttributeNS('http://www.w3.org/1999/xlink', 'href');
		
			foreach($exts as $k=>$v)
			{
				$tagLayer=(string)$v->tagName;
				
				if ($this->getTagName($tagLayer)=="isBaseLayer")
				{
					$tmp_bl=(string)$v->nodeValue;
					
					if ($tmp_bl=="false")
					{
						$wms[$service][]=$layer;
					}
				}
			}
			
		}
		
		return $wms;
	}
	
	function getTagName($tag)
	{
		$tagArr=explode(":",$tag);
								
		if (count($tagArr)>1)
		$tagName=$tagArr[1];
		else
		$tagName=$tag;
		
		return $tagName;
	}
	
}



$wmc=new wmc_class();

$wmc_json=json_encode($wmc->output);

echo $wmc_json;

?>