<?php

error_reporting(0);

include("../../../src/proxy/proxy.php");

class quicksearch
{
	var $output;
	
	var $searchStr="";
	
	var $_search = array(
		
		array(
			"_serviceUrl"=>"",
			"_layers"=>array(
				"_layerName"=>array(),
				"_searchAtt"=>array(),
				"_displayField"=>"",
				"_resultAtt"=>array()
			)
		)
	);
	
	function quicksearch($data)
	{
		$this->searchStr=$data["query"];
	
		$this->output=json_encode($this->quickSearchCreateResultsXML());
	}
	
	function quickSearchCreateResultsXML()
	{
		libxml_use_internal_errors(true);
		
		require("../../../src/proxy/config.php");
	
		$f_response = array();
	
		foreach($this->_search as $key=>$value)
		{
			$_serviceUrl = $value["_serviceUrl"];
			
			$_layerName = implode(",",$value["_layers"]["_layerName"]);
			
			$_searchAtt = array();
			
			foreach($value["_layers"]["_searchAtt"] as $_k=>$_v)
			{
				$_searchAtt[] = $_v." LIKE '%".$this->searchStr."%'";
			}
			
			$_cqlFilter = implode(" OR ", $_searchAtt);
			
			$p = new PROXY();
			
			$p->_url =  $this->quickSearchUrl($_layerName,$_serviceUrl,$_cqlFilter);
			
			$p->get();
			
			if ($p->o_responseCode == 200)
			{
			
				$xml=new DOMDocument();
				
				$xml->loadXML($p->o_response);
				
				$xpath = new DOMXPath($xml);
			
				foreach($_config["NAMESPACES"] as $kn=>$vn)
				{
					$xpath->registerNamespace($kn,$vn);
				}

				$section = $_config["GML"];

				$countFeatureMembers =$p->xmlNode($section["_featureMemberCount"]);

				for ($i=1;$i<=$countFeatureMembers;$i++)
				{
					$r_attributes = array();

					$nodes = $xpath->query(str_replace("[]","[".$i."]",$section["_featureMember"]));

					$v = array();
					
					foreach ($nodes as $node) 
					{
						$_rslts = array();
					
						foreach($node->firstChild->childNodes as $n)
						{
							
							if ($n->firstChild->namespaceURI!= $_config["NAMESPACES"]["gml"])
							{
								if (in_array($n->localName,$value["_layers"]["_resultAtt"]))
								{
									$_rslts[$n->localName]=$n->nodeValue;
								}
								
							}
							else
							{
								$feature_srs = $n->firstChild->getAttribute("srsName");
							}
						}
						
						$_layerId = $node->firstChild->tagName;
						
						$_layerId = md5($_layerName);
						
						$_serviceId = md5($_serviceUrl);
						
						$v["_layerId"] = $_serviceId.$_layerId;
						
						$v["_label"] = implode("<br>",$_rslts);
					
						$featureId = $node->firstChild->getAttribute("fid");
					}
					
					$v["_featureId"]=$featureId;

					$v["_srsName"]=$feature_srs;
					
					$v["_featureUrl"]=$this->createGetSearchUrl($_serviceUrl, $_layerName, $featureId);
					
					$v["_featureGeomFormat"]="gml";

					$f_response[]=$v;
					
				}
		
			}
			
		}
		
		return $f_response;
	}
	
	function createGetSearchUrl($_serviceUrl, $_layerName, $featureId)
    {
		$_query["REQUEST"]="GETFEATURE";
		$_query["SERVICE"]="WFS";
		$_query["OUTPUTFORMAT"]="GML2";
		$_query["TYPENAME"]=$_layerName;
		$_query["FEATUREID"]=$featureId;
		
        return Proxy::createUriQuery($_serviceUrl, $_query);
    }
	
	
	function quickSearchUrl($_layerName,$_serviceUrl,$_cqlFilter)
	{
		$_query["REQUEST"]="GETFEATURE";
        $_query["SERVICE"]="WFS";
        $_query["OUTPUTFORMAT"]="GML2";
		$_query["VERSION"]="1.0.0";
        $_query["TYPENAME"]=$_layerName;
        $_query["CQL_FILTER"]=str_replace("%","%25",$_cqlFilter);
       
        return Proxy::createUriQuery($_serviceUrl, $_query);
	}
	
}
$seconds_to_cache = 500;

$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";

header("Expires: $ts");

header("Pragma: cache");

header("Cache-Control: max-age=$seconds_to_cache");

$xml=new quicksearch($_REQUEST);

print_r($xml->output);

?>