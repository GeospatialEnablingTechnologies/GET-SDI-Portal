<?php

/*version message*/

include("../../../php_source/proxies/required.php");

class quicksearch
{
	var $output;
	
	var $searchStr="";
	
	//e.x. var $ServiceURL="http://mydomain/geoserver/wfs";
	var $ServiceURL="";
	
	//e.x. var $visibleWMSLayerService="http://mydomain/geoserver/wms";
	var $visibleWMSLayerService="";
	
	var $ServiceUsername="";
	
	var $ServicePassword="";
	
	//var $searchLayers=array("layer1"=>"epsg1","layer2"=>"epsg2","layer3"=>"epsg3",...);
	var $searchLayers=array();
	
	//var $searchAttributes=array(ATT1,ATT2,ATT3,...);
	var $searchAttributes=array();
	
	//var $resultAttributes=array(ATT1,ATT2,ATT3,...);
	var $resultAttributes=array();
	
	function quicksearch($data)
	{
		$this->searchStr=$data["query"];
	
		$this->output=$this->quickSearchCreateResultsXML();
	}
	
	function quickSearchCreateResultsXML()
	{
		$cql=str_replace(" ","+",$this->searchStr);
	
		$implLayers=implode(",",array_keys($this->searchLayers));
	
		$url=create_authentication_url($this->ServiceURL,fc_encryptValue($this->ServiceUsername),fc_encryptValue($this->ServicePassword));
	
		if(strpos($url,'?') !== false) {
		   $url.='&';
		} else {
		   $url.='?';
		}
		
		$searchCriteria=str_replace(" ","+",$this->createSearchAttributesString());
		
		$url=$url."version=1.1.0&service=WFS&request=GetFeature&typename=".$implLayers."&CQL_FILTER=".$searchCriteria;
			
		$gml=file_get_contents_safe($url,false);
		
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($gml);
			
		$countFeatureMember=(int)$dom_xml->getElementsByTagName("featureMembers")->length;
		
		$output="<ROOT totalRecords='0'>";
		
		if ($countFeatureMember>0)
		{
			$childs=$dom_xml->getElementsByTagName("featureMembers")->item(0)->childNodes;
			
			$output="<ROOT totalRecords='".$countFeatureMember."'>";
			
			foreach($childs as $key=>$value)
			{
				$childNodes=$value->childNodes;
				
				$i=0;
				
				$baselayer=(string)$value->tagName;
				
				$output.="<RECORD>";
				
				$featureId=(string)$value->getAttributeNS("http://www.opengis.net/gml","id");
				
				$output.="<featureid>".$featureId."</featureid>";
				$output.="<serviceURL>".$this->ServiceURL."</serviceURL>";
				$output.="<visibleWMS>".$this->visibleWMSLayerService."</visibleWMS>";
				$output.="<baselayer>".$baselayer."</baselayer>";
				$output.="<serviceUsername>".fc_encryptValue($this->ServiceUsername)."</serviceUsername>";
				$output.="<servicePassword>".fc_encryptValue($this->ServicePassword)."</servicePassword>";
				$output.="<epsg>".$this->searchLayers[$baselayer]."</epsg>";
				
				foreach($childNodes as $k_child=>$v_child)
				{
					$tag=(string)$v_child->tagName;
					
					$tagArr=explode(":",$tag);
				
					if (count($tagArr)>1)
					$tagTitle=$tagArr[1];
					else
					$tagTitle=$tag;

					
					if (in_array($tagTitle,$this->resultAttributes))
					{
						$i++;
						
						$svalue=str_replace("&","&amp;",(string)$v_child->nodeValue);
						
						$output.="<ATT".$i.">".$svalue."</ATT".$i.">";
					}
				
				}
				
				$output.="</RECORD>";
			}
		
		}
	
		$output.="</ROOT>";
		
		return $output;
	}
	
	function createSearchAttributesString()
	{
		$outputArr=array();
		
		$output="";
	
		foreach($this->searchAttributes as $key=>$value)
		{
			$outputArr[]=$value." LIKE '".$this->searchStr."%25'";
		}
		
		$output=implode(" OR ",$outputArr);
		
		return $output;
	}

}

header('Content-type: application/xml');

$seconds_to_cache = 500;

$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";

header("Expires: $ts");

header("Pragma: cache");

header("Cache-Control: max-age=$seconds_to_cache");

$xml=new quicksearch($_REQUEST);

print_r($xml->output);

?>