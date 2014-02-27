<?php

include("required.php");


class getRecordsById
{
	var $_recordId="";
	
	var $_serverUrl="";
	
	var $_sendRequest="";
	
	var $xmlResponse="";
	
	var $headersArr;
	
	var $datasetOrServiceNode="gmd:MD_DataIdentification";
	
	var $dmOrmiNode="gmd:MD_Metadata";
	
	var $extendNode="gmd:extent";
	
	var $output;
	
	var $isService=false;
	
	var $onlineResources="";
	
	var $addServiceToMapImg="";
	
	var $addToMapIsValid="false";
	
	var $addToMapServiceType="";
	
	var $addToMapServiceURL="";
	
	var $addToMapServiceLayerName="";
	
	var $viewAsXMLImg="";
	
	var $metadata_headers=array(
		"GR"=>array("fileidentifier"=>"Αναγνωριστικό Μεταδεδομένων",
		"language"=>"Γλώσσα",
		"languagecode"=>"Γλώσσα",
		"md_charactersetcode"=>"Κωδικός Γραμματοσειράς",
		"md_scopecode"=>"Τύπος πόρου",
		"organisationname"=>"Οργανισμός",
		"electronicmailaddress"=>"Ηλ/νική διεύθυνση",
		"voice"=>"Τηλέφωνο",
		"fascimile"=>"ΦΑΞ",
		"ci_rolecode"=>"Ρόλος",
		"title"=>"Τίτλος Πόρου",
		"alternatetitle"=>"Εναλλακτικός τίτλος πόρου",
		"code"=>"Αναγνωριστικό Πόρου",
		"codespace"=>"Κωδικός χώρου ονομάτων",
		"abstract"=>"Σύνοψη πόρου",
		"keyword"=>"Λέξεις Κλειδιά",
		"uselimitation"=>"Όροι για την πρόσβαση και τη χρήση",
		"md_restrictioncode"=>"Περιορισμοί σχετικά με την πρόσβαση του κοινού",
		"otherconstraints"=>"Περιορισμοί σχετικά με την πρόσβαση του κοινού",
		"md_classificationcode"=>"Περιορισμοί Ασφαλείας",
		"westboundlongitude"=>"Δυτικό Γεωγραφικό μήκος",
		"eastboundlongitude"=>"Ανατολικό Γεωγραφικό μήκος",
		"southboundlatitude"=>"Νότιο Γεωγραφικό πλάτος",
		"northboundlatitude"=>"Βόρειο Γεωγραφικό πλάτος",
		"purpose"=>"Σκοπός",
		"url"=>"Σύνδεσμοι",
		"linkage"=>"Σύνδεσμοι",
		"statement"=>"Καταγωγή",
		"description"=>"Περιγραφή",
		"denominator"=>"Παρανομαστής Κλίμακας",
		"date"=>"Ημερομηνία",
		"servicetype"=>"Τύπος Service",
		"ci_datetypecode"=>"Τύπος",
		"header_general"=>"Γενικά",
		"header_metadata"=>"Μεταδεδομένα σχετικά με τα μεταδεδομένα",
		"header_identification"=>"Ταυτοποίηση",
		"viewasxml"=>"Εμφάνιση ως XML",
		"addtomap"=>"Προσθήκη στο χάρτη"),
		"EN"=>array("fileidentifier"=>"File Identifier",
		"language"=>"Language",
		"languagecode"=>"Language",
		"md_charactersetcode"=>"Character Set Code",
		"md_scopecode"=>"Scope Code",
		"organisationname"=>"Organisation Name",
		"electronicmailaddress"=>"Email address",
		"voice"=>"Telephone",
		"fascimile"=>"FAX",
		"ci_rolecode"=>"Role",
		"title"=>"Title",
		"alternatetitle"=>"Alternative Title",
		"code"=>"Code",
		"codespace"=>"Code Space",
		"abstract"=>"Abstract",
		"keyword"=>"Keywords",
		"uselimitation"=>"Use Limitation",
		"md_restrictioncode"=>"Restriction Code",
		"otherconstraints"=>"Constraints",
		"md_classificationcode"=>"Classification Code",
		"westboundlongitude"=>"West Bound",
		"eastboundlongitude"=>"East Bound",
		"southboundlatitude"=>"South Bound",
		"northboundlatitude"=>"North Bound",
		"purpose"=>"Purpose",
		"url"=>"Links",
		"linkage"=>"Linkage",
		"statement"=>"Statement",
		"description"=>"Description",
		"denominator"=>"Denominator",
		"date"=>"Date",
		"servicetype"=>"Service Type",
		"ci_datetypecode"=>"Date Type Code",
		"header_general"=>"General",
		"header_metadata"=>"Metadata about metadata",
		"header_identification"=>"Identification",
		"viewasxml"=>"View as XML",
		"addtomap"=>"Add to map"));
	
	function getRecordsById($data)
	{
		switch(strtolower($data["lang"]))
		{
			case "en":
				$this->headersArr=$this->metadata_headers["EN"];
			break;

			default:
				$this->headersArr=$this->metadata_headers["GR"];
			break;
		}
		
		$this->_serverUrl=$data["serviceUrl"];
		
		$this->_recordId=$data["recordId"];
		
		$this->sendRequest();
		
		$this->viewAsXMLImg="<a href=\"".$GLOBALS["_default_portal_url"]."php_source/proxies/metadata_getRecordsById_XML.php?recordId=".$this->_recordId."&server=".$this->_serverUrl."\" target=\"_new\"><img src=\"".$GLOBALS["_default_portal_url"]."images/gis_icons/xml.png\" alt=\"".$this->headersArr["viewasxml"]."\" style=\"vertical-align: middle\"> ".$this->headersArr["viewasxml"]."</a>";
		
		if($this->addToMapIsValid=="true")
		{
			$this->addServiceToMapImg="<a href=\"javascript:metadataAddToMap();\"><img src=\"".$GLOBALS["_default_portal_url"]."images/add16.png\" alt=\"".$this->headersArr["addtomap"]."\" style=\"vertical-align: middle\"> ".$this->headersArr["addtomap"]."</a>";
		}
		
		
	}
	
	function sendRequest()
	{
		$this->_sendRequest='<?xml version="1.0" encoding="UTF-8"?><GetRecordById xmlns="http://www.opengis.net/cat/csw/2.0.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd" service="CSW" version="2.0.2" outputFormat="application/xml"  outputSchema="http://www.isotc211.org/2005/gmd">
				<Id>'.$this->_recordId.'</Id>
				<ElementSetName>full</ElementSetName>
			</GetRecordById>';

		$this->xmlResponse=file_get_contents_safe($this->_serverUrl,true,$this->_sendRequest);
		
		$this->buildGMDHTML();
		
		$dom_xml = new DOMDocument();
		
		$dom_xml->loadXML($this->xmlResponse);
		
		$this->buildOnlineResource($dom_xml);
		
		return;
	}
 
	
	function buildGMDHTML($xpath,$attribute,$arrTable,$onlyvalue=false,$title)
	{
		$dom_xml = new DOMDocument();
		
		$dom_xml->loadXML($this->xmlResponse);
		
	//	header('Content-type: application/xml');
//echo $this->xmlResponse;

		$dataOrService=$dom_xml->getElementsByTagName("SV_ServiceIdentification")->length;
		
		if ($dataOrService>0)
		{
			$this->isService=true;
			
			$this->datasetOrServiceNode="srv:SV_ServiceIdentification";
			
			$this->extendNode="srv:extent";
		}
		
		$mdOrMi=$dom_xml->getElementsByTagNameNS("http://www.isotc211.org/2005/gmi","MI_Metadata")->length;
		
		if ($mdOrMi>0)
		{
			$this->dmOrmiNode="gmi:MI_Metadata";
		}
		
		if (!empty($arrTable))
		{
			$dxpath = new DOMXPath($dom_xml);
		
			$dxpath->registerNamespace('gmd', "http://www.isotc211.org/2005/gmd");
			
			$dxpath->registerNamespace('srv', "http://www.isotc211.org/2005/srv");
			
			$dxpath->registerNamespace('gmi', "http://www.isotc211.org/2005/gmi");
			
			$entries=$dxpath->query($xpath);
		
			if ($entries->length>0)
			{
				$output="<table><tr>";
				
				foreach($arrTable as $key=>$value)
				{
					$lastGmd=explode("gmd:",$value);
					
					$lastGmd=$lastGmd[count($lastGmd)-1];
				
					if (empty($this->headersArr[strtolower($lastGmd)]))
					{
						$output.="<td>&nbsp</td>";
					}else
					{
						$output.="<td><h4>".$this->headersArr[strtolower($lastGmd)]."</h4></td>";
					}
				}
				
				$output.="</tr>".$this->queryTable($dom_xml,$xpath,$arrTable)."</table>";
				
				
			}
		
		}else
		{
			$output=$this->buildEntityHTML($dom_xml,$xpath,$attribute,$onlyvalue,$title);
		}

		return $output;

	}
	
	function buildEntityHTML($dom_xml,$path,$attribute,$onlyvalue="",$title="")
	{
		
		$contentArr=$this->queryXml($dom_xml,$path,$attribute);
	
		foreach($contentArr as $key=>$value)
		{
			if (!empty($onlyvalue))
			{
				$output=implode($onlyvalue,$value);
			}
			else
			{
				if(!empty($title))
				{
					$output="<div><h4>".$this->headersArr[strtolower($title)]."</h4><ul><li>".implode("</li><li>",$this->replaceLinks($value))."</li></ul></div>";
				}
				else
				{
					$output="<div><h4>".$this->headersArr[strtolower($key)]."</h4><ul><li>".implode("</li><li>",$this->replaceLinks($value))."</li></ul></div>";
				}
			}
		}
		
		return $output;
	}
	
	function buildOnlineResource($dom_xml)
	{
	
		if ($this->isService==true)
		{
			$onlineResourcePath="//".$this->dmOrmiNode."/gmd:identificationInfo/".$this->datasetOrServiceNode."/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL";
			$online_url=$this->buildEntityHTML($dom_xml,$onlineResourcePath,"",',');
			
			$serviceTypePath="//".$this->dmOrmiNode."/gmd:identificationInfo/".$this->datasetOrServiceNode."/srv:serviceType";
			$serviceType=strtolower($this->buildEntityHTML($dom_xml,$serviceTypePath,"",true));
		}
		else
		{
			$onlineResourcePath="//".$this->dmOrmiNode."/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL";
			
			$online_url=$this->buildEntityHTML($dom_xml,$onlineResourcePath,"",',');
			
			$serviceType="wms";
		
		}
		
		$online_arr=explode(",",$online_url);
		
		foreach($online_arr as $k=>$online_value)
		{
			switch($serviceType)
			{
				case "view":
					$url=$GLOBALS["_default_portal_url"]."/php_source/proxies/wms_isvalid_url.php?url=".$online_value;
				break;
				
				case "wms":
					$serviceType="view";
					$url=$GLOBALS["_default_portal_url"]."/php_source/proxies/wms_isvalid_url.php?url=".$online_value;
				break;
				
				case "download":
					$url=$GLOBALS["_default_portal_url"]."/php_source/proxies/wfs_isvalid_url.php?url=".$online_value;
				break;
				
				case "wfs":
					$serviceType="download";
					$url=$GLOBALS["_default_portal_url"]."/php_source/proxies/wfs_isvalid_url.php?url=".$online_value;
				break;
				
				case "discovery":
					$url=$GLOBALS["_default_portal_url"]."/php_source/proxies/csw_isvalid_url.php?url=".$online_value;
				break;
				
				case "csw":
					$serviceType="discovery";
					$url=$GLOBALS["_default_portal_url"]."/php_source/proxies/csw_isvalid_url.php?url=".$online_value;
				break;
			}
			
			
			$output=file_get_contents_safe($url);
			
			$output=json_decode($output);
			
			foreach($output as $key=>$value)
			{
				if($key=="isValid")
				{
					$this->addToMapIsValid=$value;
					break;
				}
			}
		
			if($this->addToMapIsValid=="true")
			{
				if ($this->isService==false)
				{
					$identifiers="//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:citation/gmd:CI_Citation/gmd:identifier/gmd:RS_Identifier/gmd:code";
					$identifiersArr=strtolower($this->buildEntityHTML($dom_xml,$identifiers,"",","));
					$identifiersArr=explode(",",$identifiersArr);
					$this->datasetGetLayerName($online_value,$identifiersArr);
				}
				
				$this->addToMapServiceType=$serviceType;
				
				$this->addToMapServiceURL=fc_cleanServiceUrl($online_value);
				
				break;
			}
			
			
		}
		
	}
	
	function datasetGetLayerName($url,$identifiers)
	{
		if (strpos($url,"?")==""){$seperator = "?";}else{$seperator = "&";}
	
		$url=$url.$seperator."REQUEST=GetCapabilities";
			
		$xml= file_get_contents_safe($url);
		
		$dom_xml = new DOMDocument();
		
		$dom_xml->loadXML($xml);
		
		$root=$dom_xml->getElementsByTagName("Layer")->item(0);
		
		$layers=$root->getElementsByTagName("Layer");
		
		foreach($layers as $key=>$layer)
		{
			$identifier=$layer->getElementsByTagName("Identifier");
			
			foreach($identifier as $k=>$v)
			{
				$identity=(string)$v->nodeValue;
				
				if(in_array($identity,$identifiers))
				{
					$layerName=(string)$layer->getElementsByTagName("Name")->item(0)->nodeValue;
					
					$this->addToMapServiceLayerName=$layerName;
				}
				
			}
			
		}
		
		if (empty($this->addToMapServiceLayerName))
		{
			$this->isService==false;
		}
		
	
	}
	
	function queryTable($dom_xml,$path,$arrTable)
	{
		$xpath = new DOMXPath($dom_xml);
		
		$xpath->registerNamespace('gmd', "http://www.isotc211.org/2005/gmd");
		
		$xpath->registerNamespace('srv', "http://www.isotc211.org/2005/srv");
		
		$xpath->registerNamespace('gmi', "http://www.isotc211.org/2005/gmi");
		
		$entries=$xpath->query($path);
		
		foreach($entries as $entry)
		{
			$output.="<tr>";
			
			$nodevalue=array();
			
			foreach($arrTable as $key=>$value)
			{
				$nodevalue=array();
			
				foreach($xpath->query("./".$value,$entry) as $k=>$v)
				{
					$nodevalue[]=trim((string)$v->nodeValue);
				}
				
				if (empty($nodevalue))
				{
						$output.="<td>&nbsp</td>";
				}else
				{
					$output.="<td>".$this->replaceLinks(implode("<br>",$nodevalue))."</td>";
				}
			}
			
			$output.="</tr>";
		}
		
		return $output;
	}
	
	function replaceLinks($value)
	{
		$output=preg_replace('/((www|https|ftp|http:\/\/)\S+)/', '<a href="$1" target="new">$1</a>', $value);
		
		$output = preg_replace("#(^|[\n ])([a-z0-9&\-_.]+?)@([\w\-]+\.([\w\-\.]+\.)*[\w]+)#i", "\\1<a href=\"mailto:\\2@\\3\">\\2@\\3</a>", $output);
		
		return $output;
	}
	
	function queryXml($dom_xml,$path,$attribute="")
	{
		$xpath = new DOMXPath($dom_xml);
		
		$xpath->registerNamespace('gmd', "http://www.isotc211.org/2005/gmd");
		
		$xpath->registerNamespace('srv', "http://www.isotc211.org/2005/srv");
		
		$xpath->registerNamespace('gmi', "http://www.isotc211.org/2005/gmi");
		
		$entries = $xpath->query($path);
	
		$output=array();
		
		foreach ($entries as $entry) 
		{
			if(empty($attribute))
			{
				$output[$entry->localName][]=trim((string)$entry->nodeValue);
			}
			else
			{
				
				$output[$entry->localName][]=trim((string)$entry->getAttribute($attribute));
			}
		}
		
		return $output;
	}


}
//
$gR=new getRecordsById($_REQUEST);


$md_srv=$gR->datasetOrServiceNode;

$md_mi_srv=$gR->dmOrmiNode;

$md_extend=$gR->extendNode;

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<style>
			body, table{
				font-size:12px;
				font-family:Tahoma;
			}
			table{
				width:95%;
				margin-left:auto;
				margin-right:auto;
			}
			table td{
				border:1px solid #323232;
				empty-cells: show;
				border-collapse: collapse;
				vertical-align:top;
			}
			ul
			{
				list-style-type: circle;
			}
			.md_div{
				
				padding:5px;
			}
			.md_inner_div{
				margin:10px;
			}
			h4{
				padding:0px;
				margin:0px;
			}
			.md_header{
				background:#256E21 url(<?php echo $GLOBALS["_default_portal_url"];?>/images/gis_icons/metadata_header.png);
				color:#FFF278;
				font-size:22px;
				padding:2px;
				padding-left:10px;
			}
			#md_controls{
				padding:5px;
				text-align:right;
			}
			a{
				text-decoration:none;
				font-weight:bold;
				color:#0034C3;
			}
			a:hover{
				text-decoration:underline;
				font-weight:bold;
				color:#0034C3;
			}
			#md_container a{
				color:#0034C3;
			}
			#md_the_map{
				width:600px;
				height:400px;
				margin-left:auto;
				margin-right:auto;
				border:1px solid #323232;
			}
			#md_map_container{
				width:600px;
				height:400px;
				margin-left:auto;
				margin-right:auto;
			}
		</style>
		<link rel="stylesheet" href="<?php echo $GLOBALS["_default_portal_url"];?>tools/jquery/css/smoothness/jquery-ui.css">
		<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/jquery/js/jquery-1.9.1.js"></script>
		<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>tools/jquery/js/jquery-ui.js"></script>
		<script src="<?php echo $GLOBALS["_default_portal_url"];?>tools/proj4js/lib/proj4js.js"></script>
		<script src="<?php echo $GLOBALS["_default_portal_url"];?>tools/OpenLayers-2.13/OpenLayers.js"></script>
		
		
		<script>
			$(function() {
				$("#md_container").accordion({ header: "h3",heightStyle: "content"  });
				$("div").each(function( index ) {
					
					if((($.trim($(this).html()).length)==0) && ($(this).attr('id')!="md_the_map"))
					{
						//$(this).hide();
					}
				
				});
				
				
			});
			<?php
			
				if($gR->addToMapIsValid=="true")
				{
					
					
					$output='function metadataAddToMap()
					{
					
						var metadataAddToMapObj={dataType:"'.$gR->addToMapServiceType.'",resource:"'.$gR->addToMapServiceURL.'",layer:"'.$gR->addToMapServiceLayerName.'"};
						
						parent.metadata_addToMapFromRecord(metadataAddToMapObj);
						
					}';
					
					echo $output;
				}
			
			?>
			
		</script>
		
	</head>
	<body >
		<div id="md_header" class="md_header">
			
			<?php 
				
				$ext=$gR->buildGMDHTML("//".$md_mi_srv."/gmd:hierarchyLevel/gmd:MD_ScopeCode","codeListValue","",true);
				
				if (file_exists("../../images/gis_icons/metadata_".$ext.".png"))
				{
					echo "<img src=\"".$GLOBALS["_default_portal_url"]."/images/gis_icons/metadata_".$ext.".png\">";
				}
			
			?>
			
			<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:citation/gmd:CI_Citation/gmd:title","","",true);?>
			
		</div>
		<div id="md_controls" >
			<?php echo $gR->addServiceToMapImg;?> | <?php echo $gR->viewAsXMLImg;?>
		</div>
		
		<div id="md_container" class="md_div">
		
			<h3><b><?php echo $gR->headersArr["header_general"];?></b></h3>
			<div id="md_general" class="md_div md_inner_div">
			<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:fileIdentifier");?>
			<?php
				$flag=strtolower($gR->buildGMDHTML("//".$md_mi_srv."/gmd:language/gmd:LanguageCode","codeListValue","",true));
			
				$flagArr=explode(",",$flag);
				
				echo "<h4>".$gR->headersArr["languagecode"]."</h4>";
				
				echo "<ul>";
				
				foreach($flagArr as $key=>$value)
				{
					if (file_exists("../../images/gis_icons/flags/".$value.".png"))
					{
						echo "<li>".$value." <img src=\"".$GLOBALS["_default_portal_url"]."images/gis_icons/flags/".$flag.".png\" style=\"vertical-align: middle\" alt=\"".$flag."\"></li>";
					}
					else
					{
						echo "<li>".$value."</li>";
					}
				}
				
				echo "</ul>";

			?>
			
			<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:characterSet/gmd:MD_CharacterSetCode","codeListValue");?>
			<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:hierarchyLevel/gmd:MD_ScopeCode","codeListValue");?>
			<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/srv:serviceType");?>
			</div>
			
			<h3><b><?php echo $gR->headersArr["header_metadata"];?></b></h3>
			<div id="md_contact" class="md_div md_inner_div">
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:contact/gmd:CI_ResponsibleParty/gmd:organisationName");?>
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:contact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice");?>
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:contact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:facsimile");?>
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:contact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress");?>
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:contact/gmd:CI_ResponsibleParty/gmd:role/gmd:CI_RoleCode","codeListValue");?>
			</div>
			
			<h3><b><?php echo $gR->headersArr["header_identification"];?></b></h3 >
			<div id="md_identification" class="md_div md_inner_div" >
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:citation/gmd:CI_Citation/gmd:title");?>
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:citation/gmd:CI_Citation/gmd:alternateTitle");?>
				
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:abstract");?>
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:purpose");?>
				
				<div  class="md_div md_inner_div">
				
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:citation/gmd:CI_Citation/gmd:identifier/gmd:RS_Identifier","",array("/gmd:code","/gmd:codeSpace"));?>
				
				</div>
				
				<div id="md_identification_contact" class="md_div md_inner_div">
				
					<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:pointOfContact/gmd:CI_ResponsibleParty","",array("/gmd:organisationName","/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice","/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:fascimile","/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress","/gmd:role/gmd:CI_RoleCode"));?>
					
					
				</div>
				
				<div id="md_keywords" class="md_div md_inner_div">
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:descriptiveKeywords/gmd:MD_Keywords","",array("/gmd:keyword","/gmd:thesaurusName/gmd:CI_Citation/gmd:title","/gmd:thesaurusName/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date","/gmd:thesaurusName/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode"));?>
				
				</div>
				
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:resourceConstraints/gmd:MD_Constraints/gmd:useLimitation");?>
				
				<?php 
				
					$r=strtolower(strip_tags($gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:resourceConstraints/gmd:MD_LegalConstraints/gmd:accessConstraints/gmd:MD_RestrictionCode","","",true)));
				
					if ($r=="otherrestrictions")
					{
						echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:resourceConstraints/gmd:MD_LegalConstraints/gmd:otherConstraints");
					}
					else
					{
						echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:resourceConstraints/gmd:MD_LegalConstraints/gmd:accessConstraints/gmd:MD_RestrictionCode");
					}
				
				?>
				
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/gmd:resourceConstraints/gmd:MD_SecurityConstraints/gmd:classification/gmd:MD_ClassificationCode");?>
				
				<div id="md_extend" class="md_div md_inner_div">
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/".$md_extend."/gmd:EX_Extent/gmd:geographicElement","",array("/gmd:EX_GeographicBoundingBox/gmd:westBoundLongitude","/gmd:EX_GeographicBoundingBox/gmd:eastBoundLongitude","/gmd:EX_GeographicBoundingBox/gmd:southBoundLatitude","/gmd:EX_GeographicBoundingBox/gmd:northBoundLatitude"));?>
					<div id="md_map_container">
						<div id="md_the_map">
							<script defer="defer" type="text/javascript">
								
								<?php 
								
									$west=$gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/".$md_extend."/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox/gmd:westBoundLongitude","","",true);
									
									$east=$gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/".$md_extend."/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox/gmd:eastBoundLongitude","","",true);
									
									$south=$gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/".$md_extend."/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox/gmd:southBoundLatitude","","",true);
									
									$north=$gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/".$md_srv."/".$md_extend."/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox/gmd:northBoundLatitude","","",true);
									
									$bbox='"'.$west.','.$south.','.$east.','.$north.'"';
								?>
							
								var options = {		
									units: 'km', 
									zoomMethod:null,
									transitionEffect:null,
									controls:[]
								};
							
								var map = new OpenLayers.Map('md_the_map',options);
								var wms = new OpenLayers.Layer.WMS(
									'OpenStreetMap-WGS84',
									"http://maps.opengeo.org/geowebcache/service/wms",
									{
										layers: "openstreetmap", 
										format: "image/png", 
										transparent: true,
									
										buffer:0
									},{
										isBaseLayer: true,
										numZoomLevels: 30,
										projection:new OpenLayers.Projection("EPSG:4326"),
										fractionalZoom:false,
									
										buffer:0
									}
								)
								map.addLayer(wms);
								map.zoomToMaxExtent();
								
								var olbbox=OpenLayers.Bounds.fromString(<?php echo $bbox;?>);
								var drawbbox=olbbox.toGeometry();
								map.zoomToExtent(olbbox,false);
								var style_mark = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
								var metadata_vectorLayer = new OpenLayers.Layer.Vector("MetadataBBOXArea", {style: style_mark});
								var metadata_polygonFeature = new OpenLayers.Feature.Vector(drawbbox, null); 	
								map.addLayer(metadata_vectorLayer);
								metadata_vectorLayer.addFeatures([metadata_polygonFeature]);
								
						  </script>
						</div>
					</div>
				</div>
				
				
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:statement");?>
				
				<?php 
				
					$md_urls=$gR->buildGMDHTML("//".$md_mi_srv."/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL");
				
					$srv_urls=$gR->buildGMDHTML("//".$md_mi_srv."/gmd:identificationInfo/srv:SV_ServiceIdentification/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage");
					
					if ($md_urls==$srv_urls)
					{
						echo $md_urls;
					}
					else
					{
						echo $md_urls;
						
						echo $srv_urls;
					}
				?>
				
				<div id="md_li_source" class="md_div md_inner_div">
				
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:source/gmd:LI_Source","",array("/gmd:description","/gmd:scaleDenominator/gmd:MD_RepresentativeFraction/gmd:denominator"));?>
				
				
				
				</div>
				
				<div id="md_li_report" class="md_div md_inner_div">
				
				<?php echo $gR->buildGMDHTML("//".$md_mi_srv."/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report","",array("/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:title","/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date","/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:specification/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:dateType/gmd:CI_DateTypeCode"));?>
				
				</div>
				
			</div>
		</div>
		
	</body>
</html>
	