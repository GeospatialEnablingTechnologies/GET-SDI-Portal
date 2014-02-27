<?php

/*version message*/

include("../../../php_source/proxies/required.php");

class searchArea
{
	var $output=array();
	
	var $bboxesEPSG_Arr=array();
	
	var $csvService="";
	
	function searchArea()
	{
		$url=$_SERVER["REQUEST_URI"];
		
		if (isset($_REQUEST["csvservice"]))
		{
			if (!empty($_REQUEST["csvservice"]))
			{
				$this->csvService=$_REQUEST["csvservice"];
			}
		}

		$servers=explode("&servers=",$url);

		$this->bboxesEPSG($url);
		
		if (empty($_REQUEST["csvservice"]))
		{
			$this->output=$this->fetchResults($servers);
		}
		else
		{
			$this->output=$this->createCSV($this->fetchResults($servers));
		}
		
	}
	
	function createCSV($results)
	{
		foreach($results as $key=>$value)
		{
			if ($value["SERVER"]==$this->csvService)
			{
				$rowResults=$value;
			}
		}
	
		
		$layers=array();
		
		$invisibleHeaders=array("layer","service","authentication");
		
		$output="";
		
		foreach($rowResults["FEATURE_MEMBER"] as $key=>$value)
		{
			if(!in_array($value["layer"],$layers))
			{
				$layers[]=$value["layer"];
				
				$output.="\r\n";
				
				$output.="\r\n";
				
				$output.=$value["layer"];
				
				$output.="\r\n";
				
				$headerArr=$this->getHeadersForCSV($rowResults["FEATURE_MEMBER"],$invisibleHeaders,$value["layer"]);
				
				$output.=implode(";",$headerArr);
				
				$output=substr($output, 0, -1);
				
			}
			
			$output.="\r\n";
			
			foreach($headerArr as $k=>$v)
			{
				if ((isset($value[$v])) && (!in_array($v,$invisibleHeaders)))
				{
					$vs=str_replace("\r\n","",$value[$v]);
					
					$output.=$vs.";";
				}
				elseif((!isset($value[$v])) && (!in_array($v,$invisibleHeaders)))
				{
					$output.=";";
				}
			}
			
			$output=substr($output, 0, -1);
		}
		
		return $output;
	}
	
	function getHeadersForCSV($arr,$invisibleHeaders,$layer)
	{
		$columnCount=0;
	
		foreach($arr as $key=>$value)
		{
			if ($value["layer"]==$layer)
			{
				$vCount=count($value);
				
				if($vCount>=$columnCount) 
				{
					$columnCount=$vCount;
					
					$headers=array();
					
					foreach($value as $ki=>$vi)
					{
						if(!in_array($ki,$invisibleHeaders))
						{
							$headers[]=$ki;
						}
					}
				}
			}
		}
		
		return $headers;
	}
	
	function bboxesEPSG($url)
	{
		$bboxes=$this->between($url,"bboxes=[","]");
		
		$bboxesArr=explode("&bbox=",$bboxes);
		
		foreach($bboxesArr as $key=>$value)
		{
			$vars=$value."_END";
			
			$epsg=$this->between($vars,"EPSG=","&CQL=");
			
			$cql=$this->between($vars,"&CQL=","_END");
		
			$this->bboxesEPSG_Arr[$epsg]=$cql;
		}
	}
	
	function fetchResults($servers)
	{	
	
		$arc=0;
		
		$service_members=array();
		
		foreach($servers as $key=>$value)
		{
			$layers_epsgs=array();
			
			$output=array();
			
			if (($key!="0") && (!empty($value)))
			{

				$layers=$this->between($value,"service_layers=[","]");
				
				$getServiceAuthentication=$this->between($value,"service_authentication=[","]");
				
				$getServiceURLSection=$this->between($value,"service_url=[","]");
				
				$getServiceURLSectionRaw=$getServiceURLSection;
				
				$getServiceURLSection=str_replace("SERVICE=WMS","",$getServiceURLSection);
				$getServiceURLSection=str_replace("service=WMS","",$getServiceURLSection);
				$getServiceURLSection=str_replace("service=wms","",$getServiceURLSection);
				$getServiceURLSection=str_replace("Service=wms","",$getServiceURLSection);
				$getServiceURLSection=str_replace("Service=WMS","",$getServiceURLSection);
				$getServiceURLSection=str_replace("WMS","WFS",$getServiceURLSection);
				$getServiceURLSection=str_replace("wms","wfs",$getServiceURLSection);
				
				if ($getServiceAuthentication!="")
				{
					$authentication=fc_fetchRealCredentialsURI($getServiceAuthentication);
					
					if($getServiceURLSection['scheme'] == 'https')
					{
						$getServiceURLSection=str_replace("https://","https://".$authentication."@",$getServiceURLSection);
					}
					else
					{
						$getServiceURLSection=str_replace("http://","http://".$authentication."@",$getServiceURLSection);
					}
				}else
				{
					$getServiceAuthentication="";
				}
				
				$layersArr=explode(",",$layers);
				
				$separator = (parse_url($getServiceURLSection, PHP_URL_QUERY) == NULL) ? '?' : '&';

				foreach($layersArr as $k=>$v)
				{
					$layerArr=explode("::",$v);
					
					$layer=$layerArr[0];
				
					$layer_EPSG=$layerArr[1];
					
					$layer_GEOM_FIELD=$layerArr[2];
				
					$cql_var=$this->bboxesEPSG_Arr[$layer_EPSG];
				
					$cql=str_replace("the_geom_to_be_replaced",$layer_GEOM_FIELD,$cql_var);
					
					$cql=str_replace(" ","+",$cql);
					
					$url=$getServiceURLSection.$separator."version=1.1.0&service=WFS&request=GetFeature&typename=".$layer."&CQL_FILTER=".urlencode($cql);
					
					$xml=file_get_contents_safe($url);
					
					$resultArr=$this->createRecords($xml,$layer,$getServiceURLSectionRaw,$getServiceAuthentication);
					
					if(!empty($resultArr))
					{
					
						if (empty($this->csvService))
						{
							$output=array_merge($output,$resultArr);
						}
						else
						{
							if($getServiceURLSectionRaw==$this->csvService)
							{
								$output=array_merge($output,$resultArr);
							}
						}
					}
				
				}
				
				$service_members[$arc]["SERVER"]=$getServiceURLSectionRaw;
				$service_members[$arc]["FEATURE_MEMBER"]=$output;
				$arc++;
			}
		}
		
		return $service_members;
	}

	function createRecords($xml,$layer,$service,$authentication)
	{
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($xml);
	
		
		$countFeatureMember=$dom_xml->getElementsByTagName("featureMembers")->length;
		
		if ($countFeatureMember>0)
		{
		
			$childs=$dom_xml->getElementsByTagName("featureMembers")->item(0)->childNodes;
			
			$i=0;
			
			foreach($childs as $key=>$value)
			{
				$featureId=(string)$value->getAttributeNS("http://www.opengis.net/gml","id");
				
				$output[$i]["featureid"]=$featureId;
				
				$output[$i]["layer"]=$layer;
				
				$output[$i]["service"]=$service;
				
				$output[$i]["authentication"]=$authentication;
			
				$childNodes=$value->childNodes;

				$m=1;
				
				foreach($childNodes as $k_child=>$v_child)
				{
					$tag=(string)$v_child->tagName;
					
					$tagArr=explode(":",$tag);
				
					if (count($tagArr)>1)
					$tagTitle=$tagArr[1];
					else
					$tagTitle=$tag;

					$svalue=str_replace("&","&amp;",(string)$v_child->nodeValue);
					
					if (empty($this->csvService))
					{
						if ((strtoupper($tagTitle)!="GEOMETRY") && (strtoupper($tagTitle)!="THE_GEOM") && (strtoupper($tagTitle)!="GEOM"))
						{
							if ($m<=4)
							{
								$output[$i]["ATT_".$m]=$svalue;
							
								$m++;
							}
						}
					}
					else
					{
						if($service==$this->csvService)
						{
							if ((strtoupper($tagTitle)!="GEOMETRY") && (strtoupper($tagTitle)!="THE_GEOM") && (strtoupper($tagTitle)!="GEOM"))
							{
								$output[$i][$tagTitle]=(string)$v_child->nodeValue;
							}
						}
					}
				}
				
				if (empty($this->csvService))
				{
					if ($m<=4)
					{
						for($t=$m;$t<=4;$t++)
						{
							$output[$i]["ATT_".$t]="";
						}
					
					}
				}
				
				$i++;
			}

		}
		
		
		return $output;
	
	}
	
	function between($s,$l,$r) 
	{
	  $il = strpos($s,$l,0)+strlen($l);
	  
	  $ir = strpos($s,$r,$il);
	  
	  return substr($s,$il,($ir-$il));
	}
}



$sa=new searchArea();

if (empty($_REQUEST["csvservice"]))
{
	echo json_encode($sa->output);
}
else
{
	
	header('Content-Encoding: UTF-8');
	header('Content-type: text/csv; charset=UTF-8');
	header('Content-Disposition: attachment; filename=getsdiresults.csv');
	echo "\xEF\xBB\xBF";
	echo $sa->output;
}

?>