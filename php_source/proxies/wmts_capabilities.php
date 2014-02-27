<?php
/*version message*/

include("required.php");

class wmts_Capabilities
{
	var $output;

	function wmts_Capabilities()
	{
		$url=$_SERVER["REQUEST_URI"];
 
		$url=explode("url=",$url);  
		
		$url=$url[1];
		
		$url=explode("&_dc=",$url);
		
		$url=$url[0];
		
		$url=create_authentication_url($url,$_GET['serviceUsername'],$_GET['servicePassword']);
		
		$xml=file_get_contents_safe($url);
		
		$this->output=$this->wmtsLayers($xml);
	
	}

	function wmtsLayers($xml)
	{
		libxml_use_internal_errors(true);
			
		$dom_xml=new DOMDocument();
			
		$dom_xml->loadXML($xml);
	
		$layers=$dom_xml->getElementsByTagName("Contents")->item(0)->childNodes;
		
		$output="<ROOT>";
		
		foreach ($layers as $key=>$value)
		{
			$layer=$value->childNodes;
			
			$tagLayer=(string)$value->tagName;
			
			$tagLayerName=$this->getTagName($tagLayer);
			
			if (strtolower($tagLayer)=="layer")
			{
				$output.="<RECORD>";
				
				$matrixSets=Array();
				
				$matrixLimits=Array();
				
				foreach($layer as $k=>$v)
				{
					$tag=(string)$v->tagName;
					
					$tagTitle=$this->getTagName($tag);
					
					$svalue=str_replace("&","&amp;",(string)$v->nodeValue);
					
					if (strtolower($tagTitle)=="wgs84boundingbox")
					{
						foreach($v->childNodes as $k_bounds=>$v_bounds)
						{
							$tagBounds=(string)$v_bounds->tagName;
					
							$tagBoundsTitle=$this->getTagName($tagBounds);
							
							if (strtolower($tagBoundsTitle)=="lowercorner")
							{
								$lowercorner=(string)$v_bounds->nodeValue;
								
								$lowercornerArr=explode(" ",$lowercorner);
								
								$minx=$lowercornerArr[0];
								
								$miny=$lowercornerArr[1];
								
								$output.="<MINX>".$minx."</MINX>";
								$output.="<MINY>".$miny."</MINY>";
							}
							
							if (strtolower($tagBoundsTitle)=="uppercorner")
							{
								$uppercorner=(string)$v_bounds->nodeValue;
								
								$uppercornerArr=explode(" ",$uppercorner);
								
								$maxx=$uppercornerArr[0];
								
								$maxy=$uppercornerArr[1];
								
								$output.="<MAXX>".$maxx."</MAXX>";
								$output.="<MAXY>".$maxy."</MAXY>";
							}
						}
					}
					
					if (strtolower($tagTitle)=="title")
					{
						$output.="<TITLE>".$svalue."</TITLE>";
					}
					
					if (strtolower($tagTitle)=="format")
					{
						$format[]=$svalue;
					}
					
					if (strtolower($tagTitle)=="identifier")
					{
						$output.="<IDENTIFIER>".$svalue."</IDENTIFIER>";
					}
					
					if (strtolower($tagTitle)=="tilematrixsetlink")
					{
						
						foreach($v->childNodes as $ms_k=>$m_v)
						{
							$tagMLayer=(string)$m_v->tagName;
			
							$tagMLayerName=$this->getTagName($tagMLayer);

							if (strtolower($tagMLayerName)=="tilematrixset")
							{
								$matrixSet=(string)$m_v->nodeValue;
								
								$mSets=$this->fetchMatrixSets($matrixSet,$xml);
								
								$matrixSets[]=$matrixSet."::".$mSets["SRS"]."::".$mSets["TLC"];
								
								$matrixSRS[]=$mSets["SRS"];
								
								
							}
							
							if (strtolower($tagMLayerName)=="tilematrixsetlimits")
							{
								foreach($m_v->childNodes as $msl_k=>$ml_v)
								{
									foreach($ml_v->childNodes as $k_matixes=>$v_matixes)
									{
										$tagMatrix=(string)$v_matixes->tagName;
				
										$tagMatrixName=$this->getTagName($tagMatrix);
										
										if (strtolower($tagMatrixName)=="tilematrix")
										{
											$matrixvalue=str_replace("&","&amp;",(string)$v_matixes->nodeValue);
											
											$matrixvalueArr=explode(":",$matrixvalue);
										
											$matrixvalue_End=end($matrixvalueArr);
											
											$matrixvalue_End_Len=strlen($matrixvalue_End);
											
											$matrixEPSG=substr_replace($matrixvalue,"",-$matrixvalue_End_Len);
											
											$matrixLimits[$matrixEPSG]=$matrixLimits[$matrixEPSG].":".$matrixvalue_End;
										}
									}
								}
							}
							
							
						}
					}
					
				}
				
				$formatValue="image/png";
				
				if (!in_array("image/png",$format))
				{
					$formatValue=$format[0];
				}
				
				$matrixSetsValue=implode(",",$matrixSets);
				
				$matrixSRSValue=implode(",",$matrixSRS);
				
				$implodeMatrixLimitsArr=Array();
				
				foreach ($matrixLimits as $keyMatrixs=>$valueMatrixs)
				{
					$implodeMatrixLimitsArr[]=$keyMatrixs.$valueMatrixs;
				}
				
				$implodeMatrixLimits=implode(",",$implodeMatrixLimitsArr);
				
				$output.="<FORMAT>".$formatValue."</FORMAT>";
				
				$output.="<SRS>".$matrixSRSValue."</SRS>";
				
				$output.="<MATRIXSETS>".$matrixSetsValue."</MATRIXSETS>";
				
				$output.="<MATRIXLIMITS>".$implodeMatrixLimits."</MATRIXLIMITS>";
				
				$output.="</RECORD>";
			}
			
		}
		
		$output.="</ROOT>";
		
		return $output;
	}
	
	function fetchMatrixSets($matrixSet,$xml)
	{
		$dom_xml=new DOMDocument();
			
		$dom_xml->loadXML($xml);
	
		$layers=$dom_xml->getElementsByTagName("Contents")->item(0)->childNodes;
		
		foreach ($layers as $key=>$value)
		{
			$tagLayer=(string)$value->tagName;
			
			$tagLayerName=$this->getTagName($tagLayer);
			
			if (strtolower($tagLayer)=="tilematrixset")
			{
				$s_epsg=$this->returnSupportedEPSG((string)$value->getElementsByTagName("SupportedCRS")->item(0)->nodeValue);
				
				$s_key=(string)$value->getElementsByTagName("Identifier")->item(0)->nodeValue;
				
				$s_tlc=(string)$value->getElementsByTagName("TileMatrix")->item(0)->getElementsByTagName("TopLeftCorner")->item(0)->nodeValue;
				
				if ($s_epsg!="")
				{
					$supportedEpsgs[$s_key]=array("SRS"=>$s_epsg,"TLC"=>$s_tlc,"IDENTIFIER"=>$s_key);
				}
			}
		}
		
		return $supportedEpsgs[$matrixSet];
	}
	
	function returnSupportedEPSG($epsg)
	{
	
		$ret_epsg="";
		
		foreach($GLOBALS['_supported_EPSGS_CodesOnly'] as $key=>$value)
		{
			$pos=strpos($epsg,$value);
			
			if ($pos!== false) 
			{
				$ret_epsg="EPSG:".$value;
				
			}
		}
	
		return $ret_epsg;
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

header ("content-type: text/xml");

$wmts=new wmts_Capabilities();

print_r($wmts->output);


?>