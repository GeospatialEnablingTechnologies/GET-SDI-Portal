<?php

include("required.php");

class getAttributes
{
	var $layerBaseName="";
	
	var $serviceURL="";

	var $output="";
	
	var $featureId="";
	
	var $fetchUrl="";
	
	var $attributesTypeArray=array();
	
	var $fetchTypeUrl="";
	
	var $username="";
	
	var $password="";
	
	var $lang;
	
	var $attribute_ProxyTranslations;
	
	function getAttributes()
	{
		$this->serviceURL=$_REQUEST["service"];
		
		$this->layerBaseName=$_REQUEST["layer"];
		
		$this->featureId=$_REQUEST["featureId"];
		
		$this->username=$_REQUEST["serviceUsername"];
		
		$this->password=$_REQUEST["servicePassword"];
		
		if (!empty($_REQUEST["service_authenication"]))
		{
			$creds=$_REQUEST["service_authenication"];
		
			$credentialsArr=explode("&",$creds);
			
			$serviceUsernameArr=explode("=",$credentialsArr[0]);
			
			$this->username=$serviceUsernameArr[1];
			
			
			$servicePasswordArr=explode("=",$credentialsArr[1]);
		
			$servicePassword=$servicePasswordArr[1];
		
			$this->password=$servicePassword;
		
		}
		
		$this->lang=strtoupper($_REQUEST["lang"]);
		
		if (empty($this->lang))
		{
			$this->lang=$GLOBALS["_default_Language"];
		}
		
		$this->attribute_ProxyTranslations=$GLOBALS["_attributes_Translation"][$this->lang];
		
		
		
		
		if ($this->featureId=="")
		{
			$url=create_authentication_url($this->serviceURL,$this->username,$this->password);
		
			if (strpos($url,"?")==""){$seperator = "?";}else{$seperator = "&";}
		
			$url=strtolower($url);
			
			$url=str_replace("service=wms","",$url);
		
			$this->fetchUrl=$url.$seperator."SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType&typename=".$this->layerBaseName;
		
			$this->output=$this->fetchEmptyAttributes();
		}
		else
		{
			$url=create_authentication_url($this->serviceURL,$this->username,$this->password);
			
			if (strpos($url,"?")==""){$seperator = "?";}else{$seperator = "&";}
			
			$url=strtolower($url);
			
			$url=str_replace("service=wms","",$url);
			
			$this->fetchUrl=$url.$seperator."service=WFS&request=GetFeature&featureid=".$this->featureId."&outputFormat=GML2&srsName=EPSG:4326&typeName=".$this->layerBaseName;
			
			$this->fetchTypeUrl=$url.$seperator."SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType&typename=".$this->layerBaseName;
			
			$this->output=$this->fetchFilledAttributes();
		}
	
	
	echo $this->url;
		
	}
	
	function fetchXML()
	{	
	
		$gml=file_get_contents_safe($this->fetchUrl);
		
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($gml);
	
		return $dom_xml;
	}
	
	function fetchEmptyAttributes()
	{
		$dom_xml=$this->fetchXML();
		
		$sequences=$dom_xml->getElementsByTagName("sequence")->item(0)->childNodes;
		
		foreach($sequences as $key=>$value)
		{
			foreach($value->attributes as $k=>$v)
			{
				$tagName=(string)$v->nodeName;
				
				if(strtolower($tagName)=="type")
				{
					$type=strtolower((string)$v->nodeValue);
					
					$pos=strpos($type,"gml:");
					
					if (in_array((string)$value->getAttribute('name'),array_keys($this->attribute_ProxyTranslations)))
					{
						$tagTitleTrans=$this->attribute_ProxyTranslations[(string)$value->getAttribute('name')];
					}
					else
					{
						$tagTitleTrans=(string)$value->getAttribute('name');
					}
					
					if ($pos===false)
					{
						$typeArr=explode(":",$type);
						if (count($typeArr)>0)
						$type=(string)$typeArr[1];
						else
						$type=(string)$type;
					
						$json[]=array("name"=>(string)$value->getAttribute('name'),"type"=>$type,"value"=>'',"translation"=>$tagTitleTrans);
					}
				}
			}
		}
		
		$json=array("results"=>count($json),"rows"=>$json);
		
		return json_encode($json);
	}
	
	function fetchFilledAttributes()
	{
		$dom_xml=$this->fetchXML();
	
		$countFeatureMember=$dom_xml->getElementsByTagName("featureMember")->length;
		
		$attributeTable="";
		
		if ($countFeatureMember>0)
		{
			$childs=$dom_xml->getElementsByTagName("featureMember")->item(0)->childNodes->item(0)->childNodes;
			
			$this->fetchAttributeType();
			
			foreach($childs as $key=>$value)
			{
				$tag=(string)$value->tagName;
				
				$tagArr=explode(":",$tag);
				
				if (count($tagArr)>0)
				$tagTitle=(string)$tagArr[1];
				else
				$tagTitle=(string)$tag;
				
				if (in_array($tagTitle,array_keys($this->attribute_ProxyTranslations)))
				{
					$tagTitleTrans=$this->attribute_ProxyTranslations[$tagTitle];
				}
				else
				{
					$tagTitleTrans=$tagTitle;
				}
				
				$tagValue=(string)$value->nodeValue;
				
				if ((strtoupper($tagTitle)!="GEOMETRY") && (strtoupper($tagTitle)!="THE_GEOM") && (strtoupper($tagTitle)!="GEOM"))
				$json[]=array("name"=>$tagTitle,"type"=>$this->attributesTypeArray[$tagTitle],"value"=>$tagValue,"translation"=>$tagTitleTrans);
			}
		}
		
		$json=array("results"=>count($json),"rows"=>$json);
		
		return json_encode($json);
	}
	
	function fetchAttributeType()
	{
		$gml=file_get_contents_safe($this->fetchTypeUrl);
		
		$dom_xml=new DOMDocument();
		
		$dom_xml->loadXML($gml);
		
		$sequences=$dom_xml->getElementsByTagName("sequence")->item(0)->childNodes;
		
		foreach($sequences as $key=>$value)
		{
			foreach($value->attributes as $k=>$v)
			{
				$tagName=(string)$v->nodeName;
				
				if(strtolower($tagName)=="type")
				{
					$type=strtolower((string)$v->nodeValue);
					
					$pos=strpos($type,"gml:");
					
					if ($pos===false)
					{
						$typeArr=explode(":",$type);
						if (count($typeArr)>0)
						$type=(string)$typeArr[1];
						else
						$type=(string)$type;
					
						$this->attributesTypeArray[(string)$value->getAttribute('name')]=$type;
					}
				}
			}
		}
		
	
	}
}

header('Content-type: application/json');

$getAttributesClass=new getAttributes();

$getAttributesXML=$getAttributesClass->output;

print_r($getAttributesXML);

?>