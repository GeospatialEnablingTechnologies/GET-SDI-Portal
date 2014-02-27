<?php

/*version message*/

include("../../../php_source/proxies/required.php");


class xmlgetfeature
{

	var $output;

	var $service_authentication="";
	
	function xmlgetfeature($data)
	{
		$separator = (parse_url($data['url'], PHP_URL_QUERY) == NULL) ? '?' : '&';
		
		$cql=$data["cql"];
		
		//$cql=str_replace(" ","+",$data["cql"]);
		
		//$cql=str_replace("%","%25",$cql);
		
		$url=$data['url'].$separator."version=1.1.0&service=WFS&request=GetFeature&typename=".$data['layer_basename']."&CQL_FILTER=".urlencode($cql);
		
		$this->service_authentication=$_REQUEST["service_authenication"];
		
		$creds=fc_fetchRealCredentialsURI($this->service_authentication);
		
		$credsArr=explode(":",$creds);
		
		$url=create_authentication_noEncode_url($url,$credsArr[0],$credsArr[1]);
		
		$this->output=$this->fetchNvalidateGML($url,$data);
		
	}
	
	
	function fetchNvalidateGML($url,$data)
	{
		
		$gml=file_get_contents_safe($url,false);
		
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($gml);
			
		$countFeatureMember=$dom_xml->getElementsByTagName("featureMembers")->length;
		
		if ($countFeatureMember>0)
		{
			
			return $this->fetchAttributes($dom_xml,$data);
		}
	
		return;
	}
	
	
	function fetchAttributes($dom_xml,$data)
	{
		$countFeatureMember=$dom_xml->getElementsByTagName("featureMembers")->length;
		
		if ($countFeatureMember>0)
		{
			
			$childs=$dom_xml->getElementsByTagName("featureMembers")->item(0)->childNodes;
			
			$totalRecords=$childs->length;
			
			$i=0;
			
			$output.="<ROOT totalRecords='".$totalRecords."'>";
			
			foreach($childs as $key=>$value)
			{
				$featureId=(string)$value->getAttributeNS("http://www.opengis.net/gml","id");
			
				$output.="<RECORD>";
				
				$output.="<featureid>".$featureId."</featureid>";
				
				$authentication=str_replace("&","&amp;",$this->service_authentication);
				
				$output.="<authentication>".$authentication."</authentication>";
				
				$output.="<serviceURL>".$data['url']."</serviceURL>";
				
				$output.="<basename>".$data['layer_basename']."</basename>";
			
				$childNodes=$value->childNodes;

				foreach($childNodes as $k_child=>$v_child)
				{
					$tag=(string)$v_child->tagName;
					
					$tagArr=explode(":",$tag);
				
					if (count($tagArr)>1)
					$tagTitle=$tagArr[1];
					else
					$tagTitle=$tag;

					$svalue=(string)$v_child->nodeValue;
					
					if ((strtoupper($tagTitle)!="GEOMETRY") && (strtoupper($tagTitle)!="THE_GEOM") && (strtoupper($tagTitle)!="GEOM"))
					{
						$output.="<".$tagTitle.">".htmlspecialchars($svalue)."</".$tagTitle.">";
					}
					
				}
				
				$output.="</RECORD>";
				
				$i++;
			}
			
			$output.="</ROOT>";
			
		}
		
		return $output;
	}

}

header('Content-type: application/xml');

$xml=new xmlgetfeature($_REQUEST);

print_r($xml->output);


?>