<?php

/*version message*/

include("required.php");

$seconds_to_cache = 3600;

$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";

header("Expires: $ts");

header("Pragma: cache");

header("Cache-Control: max-age=$seconds_to_cache");

class proxy_GML
{
	var $gml="";

	var $isValidGML=false;
	
	var $gmlAttributes="";
	
	var $gmlFeatureId="";
	
	var $gmlGeometry="";
	
	var $gmlProjection;
	
	var $lang="GR";
	
	var $gmlProjNFidJSON="";
	
	var $langTransArray;

	var $langTrans;
	
	var $attribute_ProxyTranslations;

	function proxy_GML()
	{
		$this->langTransArray=$GLOBALS["_getFeatureInfoTables"];
	
		$url=$_SERVER["REQUEST_URI"];
		
		$url=urldecode($url);

		$servers=explode("&servers=",$url);
		
		$this->lang=strtoupper($_GET["gmlLang"]);
		
		if (empty($this->lang))
		{
			$this->lang=$GLOBALS["_default_Language"];
		}
		
		$this->langTrans=$this->langTransArray[$this->lang];
		
		$this->attribute_ProxyTranslations=$GLOBALS["_attributes_Translation"][$this->lang];
		
		if(isset($_GET["request"]))
		{
			if (strtolower($_GET["request"])=="getfeature")
			{
				$this->fetchFeature();
			}
			else
			{
				$this->fetchLayers($servers);
			}
			
		}else
		{
			
			$this->fetchLayers($servers);
		}
	}
	
	function fetchFeature()
	{
		$serviceURI=$_REQUEST["service_uri"];
		
		$featureid=$_REQUEST["featureid"];
		
		$username=$_REQUEST["serviceUsername"];
		
		$password=$_REQUEST["servicePassword"];
		
		$getServiceAuthentication="serviceUsername=".$username."&servicePassword=".$password;
		
		$currentlayer=$_REQUEST["service_layers"];
		
		$getEPSG=$_REQUEST["srsName"];
		
		if (empty($getEPSG))
		{
			$getEPSG="EPSG:4326";
		}
		
		if(strpos($serviceURI,'?') !== false) {
		   $serviceURI.='&';
		} else {
		   $serviceURI.='?';
		}

		$url=$serviceURI."service=WFS&request=GetFeature&featureid=".$featureid."&outputFormat=GML2&srsName=".$getEPSG."&typeName=".$currentlayer;
		
		$url=create_authentication_url($url,$username,$password);
		
		$this->fetchNvalidateGML($url,$getServiceURL,$currentLayer,$getVersionSection,"WFS",$getServiceAuthentication);
	
	}
	
	function fetchLayers($servers)
	{
		foreach($servers as $key=>$value)
		{
			
			if (($key!="0") && (!$this->isValidGML) && (!empty($value)))
			{
			
				$getLayersSection=$this->between($value,"service_layers=[","]");
				
				$getVersionSection=$this->between($value,"service_version=[","]");
				
				$getServiceURLSection=$this->between($value,"service_url=[","]");
				
				$getServiceURL=$getServiceURLSection;
				
				$getServiceType=$this->between($value,"service_type=[","]");
				
				$getServiceAuthentication=$this->between($value,"service_authentication=[","]");
				
				if ($getServiceAuthentication!="")
				{
					
					$authentication=fc_fetchRealCredentialsURI($getServiceAuthentication);
					
					$surl=parse_url($getServiceURLSection);
					
					if($surl['scheme'] == 'https')
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
				
				$splitLayers=explode(",",$getLayersSection);
				
				
				/*examine each layer for each service*/
				foreach ($splitLayers as $layerKey=>$currentLayer)
				{
					
					if (!$this->isValidGML)
					{
					
						if(strpos($getServiceURLSection,'?') !== false) {
							$conctStr="&";
						}
						else
						{
							$conctStr="?";
						}
					
						if ($getServiceType=="WMS")
						{
							switch ($getVersionSection)
							{
								/*special treatment for WMS 1.3.0 :O :/ ^_^ */
								case "1.3.0":
									
									$bbox=$_GET["BBOX"];
									
									$bboxArr=explode(",",$bbox);
									
									if ($_GET["SRS"]=="EPSG:4326")
									{
										$bbox=$bboxArr[1].",".$bboxArr[0].",".$bboxArr[3].",".$bboxArr[2];
									}
								
									$url=$getServiceURLSection.$conctStr."SERVICE=WMS&VERSION=".$getVersionSection."&REQUEST=GetFeatureInfo&INFO_FORMAT=application/vnd.ogc.gml&STYLES=&CRS=".$_GET["SRS"]."&SRS=".$_GET["SRS"]."&BBOX=".$bbox."&WIDTH=".$_GET["WIDTH"]."&HEIGHT=".$_GET["HEIGHT"]."&I=".round($_GET["X"])."&J=".round($_GET["Y"])."&feature_count=10&QUERY_LAYERS=".$currentLayer."&LAYERS=".$currentLayer;
							
								break;
								
								default:
									$url=$getServiceURLSection.$conctStr."SERVICE=WMS&VERSION=".$getVersionSection."&REQUEST=GetFeatureInfo&INFO_FORMAT=application/vnd.ogc.gml&CRS=".$_GET["SRS"]."&SRS=".$_GET["SRS"]."&BBOX=".$_GET["BBOX"]."&WIDTH=".$_GET["WIDTH"]."&HEIGHT=".$_GET["HEIGHT"]."&X=".round($_GET["X"])."&Y=".round($_GET["Y"])."&feature_count=10&QUERY_LAYERS=".$currentLayer."&LAYERS=".$currentLayer;
								break;
							
							}
						}
						else
						{
							$getServiceURLSection=str_replace("SERVICE=WFS","",$getServiceURLSection);
							$getServiceURLSection=str_replace("service=WFS","",$getServiceURLSection);
							$getServiceURLSection=str_replace("service=wfs","",$getServiceURLSection);
							$getServiceURLSection=str_replace("Service=wfs","",$getServiceURLSection);
							$getServiceURLSection=str_replace("Service=WFS","",$getServiceURLSection);
						
							$url=$getServiceURLSection.$conctStr."SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&INFO_FORMAT=application/vnd.ogc.gml&SRS=".$_GET["SRS"]."&BBOX=".$_GET["BBOX"]."&WIDTH=".$_GET["WIDTH"]."&HEIGHT=".$_GET["HEIGHT"]."&X=".round($_GET["X"])."&Y=".round($_GET["Y"])."&feature_count=10&QUERY_LAYERS=".$currentLayer."&LAYERS=".$currentLayer;
							
						}
							
							
						$this->fetchNvalidateGML($url,$getServiceURL,$currentLayer,$getVersionSection,$getServiceType,$getServiceAuthentication);
					}

				}

			}
		}
	
	}	

	function fetchNvalidateGML($url,$serviceURI,$currentLayer,$getVersionSection,$getServiceType,$getServiceAuthentication)
	{
		
		$gml=file_get_contents_safe($url);
		
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($gml);
			
		$countFeatureMember=$dom_xml->getElementsByTagName("featureMember")->length;
	
		if ($countFeatureMember>0)
		{
			$this->isValidGML=true;
			
			
			if ($countFeatureMember>1)
			{
				$element=$dom_xml->documentElement;
					
				for($i=1;$i<$countFeatureMember;$i++)
				{
					$otherFeatures=$element->getElementsByTagName('featureMember')->item(0);
					
					$removedFeature=$element->removeChild($otherFeatures);			
				}
			}
			$this->gml=$dom_xml->saveXML();
			
			$this->fetchProjection($dom_xml,$gml,$serviceURI,$currentLayer,$getVersionSection,$getServiceType,$getServiceAuthentication);
			
			$this->createAttributesGrid($dom_xml);
			
			$this->createGeometryGrid($dom_xml);
			
		}
		
		return;
	}
	
	function between($s,$l,$r) 
	{
	  $il = strpos($s,$l,0)+strlen($l);
	  
	  $ir = strpos($s,$r,$il);
	  
	  return substr($s,$il,($ir-$il));
	}
	
	function fetchProjection($dom_xml,$gml,$serviceURI,$currentLayer,$getVersionSection,$getServiceType,$getServiceAuthentication)
	{
		
		$countFeatureMember=$dom_xml->getElementsByTagName("featureMember")->length;
		
		if ($countFeatureMember>0)
		{
			$featureId=$dom_xml->getElementsByTagName("featureMember")->item(0)->childNodes->item(0)->getAttribute("fid");
			
			$srsName=$this->between($gml,"srsName=",">");
			
			if (strpos($srsName,"2100")!== false)
			$srsNameP="EPSG:2100";
			elseif (strpos($srsName,"4326")!== false)
			$srsNameP="EPSG:4326";
			elseif (strpos($srsName,"900913")!== false)
			$srsNameP="EPSG:900913";
			elseif (strpos($srsName,"3857")!== false)
			$srsNameP="EPSG:3857";
			elseif (strpos($srsName,"84")!== false)
			$srsNameP="EPSG:4326";
			else
			{
				foreach($GLOBALS["_epsg_DB"] as $key=>$value)
				{
					if(strpos($srsName,$value)!== false)
					{
						$srsNameP="EPSG:".$value;
					}
				}
			
			}
		
			$this->gmlFeatureId=(string)$featureId;
			
			$hasFid="false";
			if ($this->gmlFeatureId!="")
			$hasFid="true";
	
			$this->gmlProjection=$srsNameP;
			
			$json=array("EPSG"=>$this->gmlProjection,"FID"=>$this->gmlFeatureId,"HASFID"=>$hasFid,"SERVICE_URI"=>$serviceURI,"LAYER_BASENAME"=>$currentLayer,"VERSION"=>$getVersionSection,"SERVICE_TYPE"=>$getServiceType,"AUTHENTICATION"=>$getServiceAuthentication);
			
			$this->gmlProjNFidJSON=json_encode($json);
			
		}
	}
	
	function createAttributesGrid($dom_xml)
	{
		
		$countFeatureMember=$dom_xml->getElementsByTagName("featureMember")->length;
		
		$attributeTable="";
		
		if ($countFeatureMember>0)
		{
			$attributeTable="<table class=\"tableinfo\">";
		
			$childs=$dom_xml->getElementsByTagName("featureMember")->item(0)->childNodes->item(0)->childNodes;
			
			foreach($childs as $key=>$value)
			{
				
				$tag=(string)$value->tagName;
				
				$tagArr=explode(":",$tag);
				
				if (count($tagArr)>0)
				$tagTitle=$tagArr[1];
				else
				$tagTitle=$tag;
				
				$tagValue=(string)$value->nodeValue;
				
				if (in_array($tagTitle,array_keys($this->attribute_ProxyTranslations)))
				{
					$tagTitle=$this->attribute_ProxyTranslations[$tagTitle];
				}
				
				if ((strtoupper($tagTitle)!="GEOMETRY") && (strtoupper($tagTitle)!="THE_GEOM") && (strtoupper($tagTitle)!="GEOM"))
				$attributeTable.="<tr><td><b>".$tagTitle."</b></td><td>".$tagValue."</td></tr>";
			}
			
			$attributeTable.="</table>";
			
			$this->gmlAttributes=$this->createAttributeHTML($attributeTable);
		}
		
		return;
	}
	
	function createAttributesGridFromArray($array,$charset)
	{
		$attributeTable="<table class=\"tableinfo\">";
			
		foreach($array as $key=>$value)
		{
			if($charset!="UTF-8")
			{
				$value=iconv($charset,"UTF-8",$value);
			}
			
			$attributeTable.="<tr><td><b>".$key."</b></td><td>".trim($value)." </td></tr>";
		}
			
		$attributeTable.="</table>";
		
		return $attributeTable;
	}
	
	function createAttributesFromString($string,$charset="UTF-8")
	{
		$attributeTable="<table class=\"tableinfo\">";
			
		foreach($array as $key=>$value)
		{
			if($charset!="UTF-8")
			{
				$value=iconv($charset,"UTF-8",$value);
			}
			
			$attributeTable.="<tr><td><b>".$key."</b></td><td>".trim($value)." </td></tr>";
		}
			
		$attributeTable.="</table>";
		
		return $attributeTable;
	}
	
	function createGeometryGrid($dom_xml)
	{
		$countCordinates=$dom_xml->getElementsByTagName("coordinates")->length;
		
		$featureId=$dom_xml->getElementsByTagName("featureMember")->item(0)->childNodes->item(0)->getAttribute("fid");
			
		$srsName=$this->between($this->gml,"srsName=",">");
			
		if (strpos($srsName,"2100")!== false)
		$srsNameP="EPSG:2100";
		elseif (strpos($srsName,"4326")!== false)
		$srsNameP="EPSG:4326";
		elseif (strpos($srsName,"900913")!== false)
		$srsNameP="EPSG:900913";
		elseif (strpos($srsName,"3857")!== false)
		$srsNameP="EPSG:3857";
		elseif (strpos($srsName,"84")!== false)
		$srsNameP="EPSG:4326";
		else
		{
			foreach($GLOBALS["_epsg_DB"] as $key=>$value)
			{
				if(strpos($srsName,$value)!== false)
				{
					$srsNameP="EPSG:".$value;
				}
			}
			
		}
		
		$geometryTable="<table class=\"tableinfo\">";
		
		if ($countCordinates>0)
		{			
			$childs=$dom_xml->getElementsByTagName("coordinates");
		
			$geometryTable.="<tr><td colspan=\"2\"><b>".$this->langTrans["GEOMETRY_NUMBER"].": ".$countCordinates."</b></td></tr>";
			
			$geometryTable.="<tr><td colspan=\"2\"><b>".$this->langTrans["PROJECTION_SYSTEM"].": ".$srsNameP."</b></td></tr>";
		
			foreach($childs as $key=>$value)
			{
				$coordinates=(string)$value->nodeValue;
			
				$coordinatesArray=explode(" ",$coordinates);
				
				$countCoords=count($coordinatesArray);
				
				$geometryTable.="<tr><td colspan=\"2\"><b>".$this->langTrans["GEOMETRY_EDGE_NUMBER"].": ".$countCoords."</b></td></tr>";
				
				foreach($coordinatesArray as $k_coords=>$v_coords)
				{
					$splitCoords=(string)$v_coords;
					
					$splitCoordsArr=explode(",",$splitCoords);
					
					$x=(string)$splitCoordsArr[0];
					
					$y=(string)$splitCoordsArr[1];
					
					$format_dec=$GLOBALS["_default_geometry_decimal_format"];
					
					$format_dec_epsg=$format_dec[$this->gmlProjection];
					
					$x=number_format($x, $format_dec_epsg["dec_num"], $format_dec_epsg["dec_symbol"], $format_dec_epsg["thousand_symbol"]);
						
					$y=number_format($y, $format_dec_epsg["dec_num"], $format_dec_epsg["dec_symbol"], $format_dec_epsg["thousand_symbol"]);
					
					
					
					$geometryTable.="<tr><td align=\"right\">".$x."</td><td align=\"right\">".$y."</td></tr>";
				}
			}
			
			$geometryTable.="</table>";
			
			$this->gmlGeometry=$this->createGeometryHTML($geometryTable);
		}
	}
	
	function createGeometryGridFromArray($array,$tHeaders,$epsg="")
	{
		if(empty($epsg))
		{
			$epsg=$this->gmlProjection;
		}
	
		$geometryTable="<table class=\"tableinfo\">";
		
		$countCordinates=count($array);
		
		if ($countCordinates>0)
		{					
			$geometryTable.="<tr><td colspan=\"2\"><b>".$tHeaders["GEOMETRY_NUMBER"].": ".$countCordinates."</b></td></tr>";
			
			$geometryTable.="<tr><td colspan=\"2\"><b>".$tHeaders["PROJECTION_SYSTEM"].": ".$epsg."</b></td></tr>";
		
			foreach($array as $key=>$value)
			{
				$countCoords=count($value);
				
				$geometryTable.="<tr><td colspan=\"2\"><b>".$tHeaders["GEOMETRY_EDGE_NUMBER"].": ".$countCoords."</b></td></tr>";
				
				foreach($value as $k_coords=>$v_coords)
				{
					$x=$v_coords["x"];
					
					$y=$v_coords["y"];
					
					$format_dec=$GLOBALS["_default_geometry_decimal_format"];
					
					$format_dec_epsg=$format_dec[$epsg];
					
					$x=number_format($x, $format_dec_epsg["dec_num"], $format_dec_epsg["dec_symbol"], $format_dec_epsg["thousand_symbol"]);
						
					$y=number_format($y, $format_dec_epsg["dec_num"], $format_dec_epsg["dec_symbol"], $format_dec_epsg["thousand_symbol"]);
					
					$geometryTable.="<tr><td align=\"right\">".$x."</td><td align=\"right\">".$y."</td></tr>";
				}
			}
			
			$geometryTable.="</table>";
			
			return $geometryTable;
		}
	}

	function createAttributeHTML($theAttributes)
	{
		$html="<html>
			<head>
			<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">
			<style>
				body
				{
					margin:10px;
					background-color: #eaeaea;
					font-family:Tahoma;
					font-size:10px;
				}
				.coords
				{
					font-size:10px;
				}
				.coords_header
				{
					font-size:12px;
					font-weight:bold;
				}
				.a_coords
				{
					font-size:10px;
					color:#000000;
					text-decoration:none;
				}
				a:hover.a_coords
				{
					font-size:10px;
					color:#000000;
					text-decoration:underline;
				}
				.tableinfo
				{
					width:100%;
					font-family:Tahoma;
					font-size:10px;
					margin:5px;
				}
				.tableinfo tr td{
					border:1px solid #333333;
				}
			</style>
		</head>
		<body>
			".$theAttributes."
		</body>
		</html>";
		
		return $html;
	
	}
	
	function createGeometryHTML($theGeometry)
	{
		$html="<html>
			<head>
			<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">
			<style>
				body
				{
					margin:10px;
					background-color: #eaeaea;
					font-family:Tahoma;
					font-size:10px;
				}
				.coords
				{
					font-size:10px;
				}
				.coords_header
				{
					font-size:12px;
					font-weight:bold;
				}
				.a_coords
				{
					font-size:10px;
					color:#000000;
					text-decoration:none;
				}
				a:hover.a_coords
				{
					font-size:10px;
					color:#000000;
					text-decoration:underline;
				}
				.tableinfo
				{
					width:100%;
					font-family:Tahoma;
					font-size:10px;
					margin:5px;
				}
				.tableinfo tr td{
					border:1px solid #333333;
				}
			</style>
		</head>
		<body>
			".$theGeometry."
		</body>
		</html>";
	
		return $html;
	}
	
}

if (empty($_REQUEST["getWhat"]))
{
	$p_gml=new proxy_GML();

	switch($_GET["gmlFormat"])
	{
		case "attributes":
			echo $p_gml->gmlAttributes;
		break;
		
		case "geometry":
			echo $p_gml->gmlGeometry;
		
		break;
		
		case "projnfid":
			echo $p_gml->gmlProjNFidJSON;
		break;
		
		default:
			header('Content-type: application/xml');
			echo $p_gml->gml;
		break;

	}
}



?>