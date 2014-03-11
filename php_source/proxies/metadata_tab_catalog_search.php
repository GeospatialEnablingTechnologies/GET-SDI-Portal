<?php
/*version message*/

include("required.php");

class cswSearch
{
	var $_recordsPerPage=25;

	var $_startPage=1;
	
	var $_totalRecords;
	
	var $_schema="";
	
	var $_cswProfile;
	
	var $_tightSearch="false";
	
	var $_catalogURLs=array();
	
	var $totalRecordsPerCatalog=array();
	
	var $_sendRequest="";
	
	var $_data;
	
	var $_sendServers=array();
	
	var $_currentServerCount=0;
	
	var $_maxResults=0;
	
	var $_maxResultsPerServer=array();
	
	var $_arrayResponse=array();
	
	var $xmlResponse="";
	
	var $output="";
	
	function cswSearch($data)
	{
		$this->_data=$data;
		
		if ($data["tight"]==""){$data["tight"]="false";}
		
		$this->_tightSearch=$data["tight"];
	
		$url=$_SERVER["REQUEST_URI"];
		
		$url=urldecode($url);
		
		$servers=$this->between($url,"metadata_servers=[","]");
		
		$this->_sendServers=explode(",",$servers);
		
		if (count($this->_sendServers)>1)
		{
			array_pop($this->_sendServers);
		}
		
		$this->_cswProfile=$data["profile"];

		$_tmp_pagePerRows=$this->_recordsPerPage;
		
		$this->_maxResults=$this->getTotalRecordsMatched();
		
		if (($data["start"]!=0) || ($data["start"]!="")){$this->_startPage=$data["start"]+1;}
		
		$this->_recordsPerPage=$_tmp_pagePerRows;
		
		$this->sendRequest();		
		
		$this->_arrayResponse=array("rows"=>$this->_arrayResponse,"results"=>$this->_maxResults);
		
		$this->output=json_encode($this->_arrayResponse);
		
	}
	
	function between($s,$l,$r) 
	{
	  $il = strpos($s,$l,0)+strlen($l);
	  
	  $ir = strpos($s,$r,$il);
	  
	  return substr($s,$il,($ir-$il));
	}
	
	function sendRequest()
	{
		$this->buildQuery();
		
		$this->xmlResponse=file_get_contents_safe($this->_sendServers[$this->_currentServerCount],true,$this->_sendRequest);
		
		$this->manipulateResponse();
		
		return;
	}
	
	function manipulateResponse()
	{
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($this->xmlResponse);
		
		if ($dom_xml->getElementsByTagName("SearchResults")->length>0)
		{
		
			switch($this->_cswProfile)
			{
				case "3":
				
					$dom_xml_results=$dom_xml->getElementsByTagName("Record");
					
				break;
			
				default:
					$dom_xml_results=$dom_xml->getElementsByTagName("MD_Metadata");
					
					if ($dom_xml_results->length==0)
					{
						$dom_xml_results=$dom_xml->getElementsByTagName("MI_Metadata");
					}
				break;
				
			}
			
			foreach ($dom_xml_results as $key=>$value)
			{
			
				switch($this->_cswProfile)
				{
					case "3":
						$fileIdentifier=(string)$value->getElementsByTagName("identifier")->item(0)->nodeValue;
						$codeList=(string)$value->getElementsByTagName("type")->item(0)->nodeValue;
						$title=(string)$value->getElementsByTagName("title")->item(0)->nodeValue;
						
						$LowerCorner=(string)$value->getElementsByTagName("LowerCorner")->item(0)->nodeValue;
						$LowerCornerArr=explode(" ",$LowerCorner);
						
						$UpperCorner=(string)$value->getElementsByTagName("UpperCorner")->item(0)->nodeValue;
						$UpperCornerArr=explode(" ",$UpperCorner);
						
						
						$bboxWest=$LowerCornerArr[0];
						$bboxSouth=$LowerCornerArr[1];
						$bboxEast=$UpperCornerArr[0];
						$bboxNorth=$UpperCornerArr[1];
						$abstract=(string)$value->getElementsByTagName("abstract")->item(0)->nodeValue;
					
					break;
					
					default:
					
						$fileIdentifier=(string)$value->getElementsByTagName("fileIdentifier")->item(0)->getElementsByTagName("CharacterString")->item(0)->nodeValue;
						$codeList=(string)$value->getElementsByTagName("MD_ScopeCode")->item(0)->getAttribute("codeListValue");
						$title=(string)$value->getElementsByTagName("CI_Citation")->item(0)->getElementsByTagName("title")->item(0)->nodeValue;
						$bboxWest=(string)$value->getElementsByTagName("EX_GeographicBoundingBox")->item(0)->getElementsByTagName("westBoundLongitude")->item(0)->nodeValue;
						$bboxSouth=(string)$value->getElementsByTagName("EX_GeographicBoundingBox")->item(0)->getElementsByTagName("southBoundLatitude")->item(0)->nodeValue;
						$bboxEast=(string)$value->getElementsByTagName("EX_GeographicBoundingBox")->item(0)->getElementsByTagName("eastBoundLongitude")->item(0)->nodeValue;
						$bboxNorth=(string)$value->getElementsByTagName("EX_GeographicBoundingBox")->item(0)->getElementsByTagName("northBoundLatitude")->item(0)->nodeValue;
						$abstract=(string)$value->getElementsByTagName("abstract")->item(0)->getElementsByTagName("CharacterString")->item(0)->nodeValue;
						
					break;
					
				}
				
				
				$icon=strtolower(trim($codeList));
				
				if (file_exists("../../images/gis_icons/metadata_".strtolower(trim($codeList)).".png"))
				{
					$icon="metadata_".strtolower(trim($codeList)).".png";
				}
				else
				{
					$icon="metadata_nongeographicdataset.png";
				}
				
				$this->_arrayResponse[]=array(
					"serverUrl"=>$this->_sendServers[$this->_currentServerCount],
					"fileIdentifier"=>trim($fileIdentifier),
					"abstract"=>trim($abstract),
					"codeList"=>strtolower(trim($codeList)),
					"title"=>trim($title),
					"icon"=>$icon,
					"west"=>trim($bboxWest),
					"south"=>trim($bboxSouth),
					"east"=>trim($bboxEast),
					"north"=>trim($bboxNorth),
					"bbox"=>trim($bboxWest).",".trim($bboxSouth).",".trim($bboxEast).",".trim($bboxNorth));
			
			}
		}
		
		$this->createPager($dom_xml);
		
	}
	
	function createPager($dom_xml)
	{
		
	
		$dom_xml_search_results=$dom_xml->getElementsByTagName("SearchResults")->item(0);
		
		$dom_xml_RecordsMatched=$dom_xml_search_results->getAttribute("numberOfRecordsMatched");
		
		$dom_xml_RecordsReturned=$dom_xml_results=$dom_xml->getElementsByTagName("MD_Metadata")->length;
	
		$dom_xml_NextRecord=$dom_xml_search_results->getAttribute("nextRecord");
		
		if (($dom_xml_NextRecord==0) || ($dom_xml_NextRecord>$dom_xml_RecordsMatched))
		{
			if(count($this->_sendServers)>($this->_currentServerCount+1))
			{
				$this->_currentServerCount++;
				
				$results=0;
				
				for($i=0;$i<$this->_currentServerCount;$i++)
				{
					$results=$this->_maxResultsPerServer[$i]+$results;
				}
				
				$this->_startPage=$results-$this->_startPage;
				
				if ($this->_startPage<0)
				{
					$this->_startPage=abs($this->_startPage);
				}
				else
				{
					$this->_startPage=1;
				}
				
				$this->_recordsPerPage=$this->_recordsPerPage-$dom_xml_RecordsReturned;
				
				$this->sendRequest();
				
			}
		}
		
	}
	
	function getTotalRecordsMatched()
	{
		$this->_recordsPerPage=1;

		$this->_startPage=1;
		
		$this->buildQuery();
		
		$_factional_servers=array();
		
		foreach($this->_sendServers as $key=>$value)
		{
			
			$response=file_get_contents_safe($value,true,$this->_sendRequest);
			
			$dom_xml=new DOMDocument();
		
			$dom_xml->loadXML($response);
			
			$dom_xml_search_results=0;
			
			if ($dom_xml->getElementsByTagName("SearchResults")->length>0)
			{
				$_factional_servers[]=$value;
			
				$dom_xml_search_results=$dom_xml->getElementsByTagName("SearchResults")->item(0);
				
				$this->_maxResultsPerServer[]=$dom_xml_search_results->getAttribute("numberOfRecordsMatched");
				
				$dom_xml_RecordsMatched=$dom_xml_search_results->getAttribute("numberOfRecordsMatched")+$dom_xml_RecordsMatched;
			}
			else
			{
				
				unset($this->_sendServers[$key]);
			}
			
		}
		
		$this->_sendServers=$_factional_servers;
		
		return $dom_xml_RecordsMatched;
	}
	
	function UTFConvert($value)
	{	
		$utf=urldecode($value);
		
		return $utf;
	}
	
	function buildQuery()
	{
		if ($this->_tightSearch=="false"){$propertyType="PropertyIsLike";$star="*";}
		
		if ($this->_tightSearch=="true"){$propertyType="PropertyIsEqualTo";$star="";}
		
		$prefix="apiso";
		
		switch($this->_cswProfile)
		{
			case "3":
				$prefix="dc";
			break;
		}
		
		$count=0;
		
		if(isset($this->_data["title"]) && ($this->_data["title"]!="")){$property.='<ogc:'.$propertyType.' ><ogc:PropertyName>'.$prefix.':Title</ogc:PropertyName><ogc:Literal>'.$star.$this->UTFConvert($this->_data["title"]).$star.'</ogc:Literal></ogc:'.$propertyType.'>';$count++;}
		
		if(isset($this->_data["abstract"]) && ($this->_data["abstract"]!="")){$property.='<ogc:'.$propertyType.' ><ogc:PropertyName>'.$prefix.':Abstract</ogc:PropertyName><ogc:Literal>'.$star.$this->UTFConvert($this->_data["abstract"]).$star.'</ogc:Literal></ogc:'.$propertyType.'>';$count++;}
		
		if(isset($this->_data["keyword"]) && ($this->_data["keyword"]!="")){$property.='<ogc:'.$propertyType.' ><ogc:PropertyName>'.$prefix.':Subject</ogc:PropertyName><ogc:Literal>'.$star.$this->UTFConvert($this->_data["keyword"]).$star.'</ogc:Literal></ogc:'.$propertyType.'>';$count++;}

		if(isset($this->_data["accessconstraints"]) && ($this->_data["accessconstraints"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':AccessConstraints</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["accessconstraints"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["resourceidentifier"]) && ($this->_data["resourceidentifier"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':ResourceIdentifier</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["resourceidentifier"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["calendartype"]) && ($this->_data["calendartype"]!="") && ($this->_data["from"]!="") && ($this->_data["to"]!=""))
		{
			$fromDate=$this->_data["from"];
			
			$toDate=$this->_data["to"];
			
			switch($this->_data["calendartype"])
			{
				case "tempExtentDate":
					
					$property.='<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>'.$prefix.':TempExtent_begin</ogc:PropertyName><ogc:Literal>'.$fromDate.'</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>';
					$property.='<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>'.$prefix.':TempExtent_end</ogc:PropertyName><ogc:Literal>'.$toDate.'</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>';
					$count++;
					
					break;
				
				case "creationDate":
					
					$property.='<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>'.$prefix.':CreationDate</ogc:PropertyName><ogc:Literal>'.$fromDate.'</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>';
					$property.='<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>'.$prefix.':CreationDate</ogc:PropertyName><ogc:Literal>'.$toDate.'</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>';
					$count++;
					
					break;
					
				case "revisionDate":
				
					$property.='<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>'.$prefix.':RevisionDate</ogc:PropertyName><ogc:Literal>'.$fromDate.'</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>';
					$property.='<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>'.$prefix.':RevisionDate</ogc:PropertyName><ogc:Literal>'.$toDate.'</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>';
					$count++;
					
					break;	
					
				case "publicationDate":
				
					$property.='<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>'.$prefix.':PublicationDate</ogc:PropertyName><ogc:Literal>'.$fromDate.'</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo>';
					$property.='<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>'.$prefix.':PublicationDate</ogc:PropertyName><ogc:Literal>'.$toDate.'</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>';
					$count++;
				
					break;	
				
			}
		}
		
		if(isset($this->_data["topiccategory"]) && ($this->_data["topiccategory"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':TopicCategory</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["topiccategory"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}

		if(isset($this->_data["type"]) && ($this->_data["type"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':Type</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["type"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["organisationname"]) && ($this->_data["organisationname"]!="")){$property.='<ogc:'.$propertyType.' ><ogc:PropertyName>'.$prefix.':OrganisationName</ogc:PropertyName><ogc:Literal>'.$star.$this->UTFConvert($this->_data["organisationname"]).$star.'</ogc:Literal></ogc:'.$propertyType.'>';$count++;}
		
		if(isset($this->_data["responsiblepartyrole"]) && ($this->_data["responsiblepartyrole"]!="")){$property.='<ogc:PropertyIsEqualTo><ogc:PropertyName>'.$prefix.':ResponsiblePartyRole</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["responsiblepartyrole"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["conditionapplyingtoaccessanduse"]) && ($this->_data["conditionapplyingtoaccessanduse"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':ConditionApplyingToAccessAndUse</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["conditionapplyingtoaccessanduse"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["accessconstraints"]) && ($this->_data["accessconstraints"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':AccessConstraints</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["accessconstraints"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["lineage"]) && ($this->_data["lineage"]!="")){$property.='<ogc:'.$propertyType.' ><ogc:PropertyName>'.$prefix.':Lineage</ogc:PropertyName><ogc:Literal>'.$star.$this->UTFConvert($this->_data["lineage"]).$star.'</ogc:Literal></ogc:'.$propertyType.'>';$count++;}
		
		if(isset($this->_data["specificationtitle"]) && ($this->_data["specificationtitle"]!="")){$property.='<ogc:'.$propertyType.' ><ogc:PropertyName>'.$prefix.':SpecificationTitle</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["specificationtitle"]).'</ogc:Literal></ogc:'.$propertyType.'>';$count++;}
		
		if(isset($this->_data["denominator"]) && ($this->_data["denominator"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':Denominator</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["denominator"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["distancevalue"]) && ($this->_data["distancevalue"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':DistanceValue</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["distancevalue"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["distanceuom"]) && ($this->_data["distanceuom"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':DistanceUOM</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["distanceuom"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["degree"]) && ($this->_data["degree"]!="")){$property.='<ogc:PropertyIsEqualTo ><ogc:PropertyName>'.$prefix.':Degree</ogc:PropertyName><ogc:Literal>'.$this->UTFConvert($this->_data["degree"]).'</ogc:Literal></ogc:PropertyIsEqualTo>';$count++;}
		
		if(isset($this->_data["bbox"]) && ($this->_data["bbox"]!="")){$bbox=explode(",",$this->_data["bbox"]);$property.='<ogc:BBOX><ogc:PropertyName>ows:BoundingBox</ogc:PropertyName><gml:Envelope><gml:lowerCorner>'.$bbox[0].' '.$bbox[1].'</gml:lowerCorner> <gml:upperCorner>'.$bbox[2].' '.$bbox[3].'</gml:upperCorner> </gml:Envelope></ogc:BBOX>';$count++;}
		
		
		if($this->_data["search_request_method"]=="simple")
		{
			$property='<ogc:And><ogc:PropertyIsLike >
				<ogc:PropertyName>'.$prefix.':AnyText</ogc:PropertyName>
				<ogc:Literal>'.$this->UTFConvert($this->_data["word"]).'</ogc:Literal>
				</ogc:PropertyIsLike>
				<ogc:PropertyIsEqualTo>
				<ogc:PropertyName>'.$prefix.':Type</ogc:PropertyName>
				<ogc:Literal>dataset</ogc:Literal>
				</ogc:PropertyIsEqualTo></ogc:And>';
				$count++;
		}
		
		if($this->_data["search_request_method"]=="service")
		{
			$property='<ogc:And><ogc:PropertyIsEqualTo>
				<ogc:PropertyName>'.$prefix.':ServiceType</ogc:PropertyName>
				<ogc:Literal>'.$this->_data["word"].'</ogc:Literal>
				</ogc:PropertyIsEqualTo>
				<ogc:PropertyIsEqualTo>
				<ogc:PropertyName>'.$prefix.':Type</ogc:PropertyName>
				<ogc:Literal>service</ogc:Literal>
			</ogc:PropertyIsEqualTo></ogc:And>';
			
				$count++;
		}
		
		if($count>1){$constaringBegin="<ogc:And>";$constaringEnd="</ogc:And>";}
		
		$request="";
		
		if ($count>0)
		{
			switch($this->_cswProfile)
			{
				default:
					$request='<?xml version="1.0"?>
					<csw:GetRecords xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:apiso="http://www.opengis.net/cat/csw/apiso/1.0" xmlns:ows="http://www.opengis.net/ows" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" xmlns:gml="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd" service="CSW" version="2.0.2" resultType="results" outputFormat="application/xml" outputSchema="http://www.isotc211.org/2005/gmd" startPosition="'.$this->_startPage.'" maxRecords="'.$this->_recordsPerPage.'">
								<csw:Query typeNames="gmd:MD_Metadata" >
									<csw:ElementSetName typeNames="gmd:MD_Metadata">full</csw:ElementSetName>
									<csw:Constraint version="1.1.0">
										<ogc:Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">'.$constaringBegin.$property.$constaringEnd.'</ogc:Filter>
									</csw:Constraint>
								</csw:Query>
							</csw:GetRecords>'; 
				break;
				
				case "3":
					$request='<?xml version="1.0"?>
					<csw:GetRecords xmlns="http://www.opengis.net/cat/csw/2.0.2" xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:ogc="http://www.opengis.net/ogc" xmlns:ows="http://www.opengis.net/ows" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" xmlns:gml="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd" service="CSW" version="2.0.2" resultType="results" outputFormat="application/xml" outputSchema="http://www.opengis.net/cat/csw/2.0.2" startPosition="'.$this->_startPage.'" maxRecords="'.$this->_recordsPerPage.'">
								<csw:Query typeNames="csw:Record">
									<csw:ElementSetName typeNames="csw:Record"">full</csw:ElementSetName>
									<csw:Constraint version="1.1.0">
										<ogc:Filter>'.$constaringBegin.$property.$constaringEnd.'</ogc:Filter>
									</csw:Constraint>
								</csw:Query>
							</csw:GetRecords>'; 
				break;
			}
			
		
			
			$this->_sendRequest=$request;
		}
		
		
		return;
	}
	
}



$j=new cswSearch($_REQUEST);
echo $j->output;

?>


