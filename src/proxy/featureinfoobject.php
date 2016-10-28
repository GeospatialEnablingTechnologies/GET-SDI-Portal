<?php

class FEATUREINFOOBJECT
{
	public $_url;

    public function readGML($objArr)
    {
		require("config.php");
	
        $p = new PROXY();
		
        if (empty($objArr->_featureUrl))
        {
			if (empty($objArr->_cqlFilter))
			{
				$p->_url = self::createGetFeatureInfoRequest($objArr);
			}
			else
			{
				$p->_url = self::createSearchUrl($objArr);
				
				$this->_url = $p->_url;
			}
        }else
        {
			$p->_url = $objArr->_featureUrl;
        }
		$p->_url = str_replace("{limit}",$_REQUEST["limit"],$p->_url);
		
		$p->_url = str_replace("{start}",$_REQUEST["start"],$p->_url);
		
		$sort = $_REQUEST["sort"];
		
		$sortBy = "";
		
		if (!empty($sort))
		{
			$sort = json_decode($sort);
			
			$sort = $sort[0];
			
			$sortAttribute = $sort->property;
			
			$sortDirection = $sort->direction;
			
			$sortBy = $sortAttribute;
			
			if ($sortDirection=="ASC")
			{
				$sortBy.="+A";
			}else{
				$sortBy.="+D";
			}
		}
		
		$p->_url = str_replace("{sortby}",$sortBy,$p->_url);
		
		$p->_url = str_replace("{limit}","",$p->_url);
		
		$p->_url = str_replace("{sortby}","",$p->_url);
		
		$p->_url = str_replace("{start}","",$p->_url);
		
        $p->get();

        if ($p->o_responseCode == 200)
        {
			libxml_use_internal_errors(true);
		
			$xml=new DOMDocument();
			
			$xml->loadXML($p->o_response);
			
			$xpath = new DOMXPath($xml);
		
			foreach($_config["NAMESPACES"] as $key=>$value)
			{
				$xpath->registerNamespace($key,$value);
			}

			$section = $_config["GML"];

			$countFeatureMembers =$p->xmlNode($section["_featureMemberCount"]);

			$f_response = array();

			for ($i=1;$i<=$countFeatureMembers;$i++)
			{
				$r_attributes = array();

				$nodes = $xpath->query(str_replace("[]","[".$i."]",$section["_featureMember"]));

				$v = array();
				
				foreach ($nodes as $node) 
				{
					foreach($node->firstChild->childNodes as $n)
					{
						
						if ($n->firstChild->namespaceURI!= $_config["NAMESPACES"]["gml"])
						{
							$v[$n->localName]=$n->nodeValue;
						}
						else
						{
							$feature_srs = $n->firstChild->getAttribute("srsName");
						}
					}
					
					$v["_layerId"]=$objArr->_layerId;
				
					$featureId = $node->firstChild->getAttribute("fid");
				}
				
				if (!empty($objArr->_featureType))
				{
					if (strpos($featureId,$objArr->_featureType)<0)
					{
						$featureId = $objArr->_featureType.".".$featureId;
					}
				}
				
				
				$v["_featureId"]=$featureId;

				$v["_srsName"]=$feature_srs;
				
				if ($objArr->_request=="search")
				{
					$v["_featureUrl"]=self::createGetSearchUrl($objArr, $featureId);
				
				}
				else
				{
					$v["_featureUrl"]=self::createGetFeatureUrl($objArr, $featureId);
				}
				
				$v["_featureGeomFormat"]="gml";

				$r_attributes[]=$v;
				
				$f_response[]=$r_attributes;
				
			}
	
			return $f_response;

        }

        return "";
    }

    public function readJSON()
    {
		//TOBE
        return "";
    }
	
	public function getTotalFeaturesCount()
	{
		require("config.php");
	
        $p = new PROXY();
		
		$p->_url = $this->_url."&RESULTTYPE=HITS";
		
		$p->_url = str_replace("&MAXFEATURES={limit}","",$p->_url);
		
		$p->_url = str_replace("&STARTINDEX={start}","",$p->_url);
		
		$p->_url = str_replace("&SORTBY={sortby}","",$p->_url);
		
		$p->get();
		
		$total = null;
		
		if ($p->o_responseCode == 200)
        {
			$total = (integer)$p->xmlNode("string(//@numberOfFeatures)");
		}
		
		return $total;
	
	}

    public function createGetFeatureInfoRequest($objArr)
    {

        switch($objArr->_serviceType)
        {
			case "WMS":
				$_query["REQUEST"]="GETFEATUREINFO";
				$_query["SERVICE"]="WMS";
				$_query["WIDTH"]=$_REQUEST["_width"];
				$_query["HEIGHT"]=$_REQUEST["_height"];
				$_query["X"]=$_REQUEST["_x"];
				$_query["Y"]=$_REQUEST["_y"];
				$_query["BBOX"]=$_REQUEST["_bbox"];
				$_query["SRS"]=$_REQUEST["_srs"];
				$_query["LAYERS"]=$objArr->_layerName;
				$_query["QUERY_LAYERS"]=$objArr->_layerName;
				$_query["INFO_FORMAT"]=$objArr->_featureInfoFormat;
				if(isset($_REQUEST["_feature_count"])){
					$_query["FEATURE_COUNT"]=$_REQUEST["_feature_count"];
				}else{
					$_query["FEATURE_COUNT"]="1000";
				}
				break;

			case "WFS":
				$_query["REQUEST"]="GETFEATURE";
				$_query["SERVICE"]="WFS";
				$_query["VERSION"]="1.1.0";
				$_query["FEATUREID"]=$objArr->_featureId;
				$_query["OUTPUTFORMAT"]=$objArr->_featureInfoFormat;
				$_query["TYPENAME"]=$objArr->_layerName;
				break;
        }

        return PROXY::createUriQuery($objArr->_serviceUrl, $_query);
    }

    public function createSearchUrl($objArr)
    {
		
		
        $_query["REQUEST"]="GETFEATURE";
        $_query["SERVICE"]="WFS";
		$_query["VERSION"]="1.1.0";
        $_query["OUTPUTFORMAT"]="GML2";
        $_query["TYPENAME"]=$objArr->_layerName;
        $_query["CQL_FILTER"]=str_replace("%","%25",$objArr->_cqlFilter);
       
        return PROXY::createUriQuery($objArr->_serviceUrl, $_query);
    }


    public function createGetSearchUrl($objArr, $featureId)
    {
		
		
		$_query["REQUEST"]="GETFEATURE";
		$_query["SERVICE"]="WFS";
		$_query["VERSION"]="1.1.0";
		$_query["OUTPUTFORMAT"]="GML2";
		$_query["TYPENAME"]=$objArr->_layerName;
		$_query["FEATUREID"]=$featureId;
		
        return PROXY::createUriQuery($objArr->_serviceUrl, $_query);
    }

    public function createGetFeatureUrl($objArr,$featureId)
    {
		
        switch ($objArr->_serviceType)
        {
			case "WMS":
				$_query["REQUEST"]="GETFEATUREINFO";
				$_query["SERVICE"]="WMS";
				$_query["WIDTH"]=$_REQUEST["_width"];
				$_query["HEIGHT"]=$_REQUEST["_height"];
				$_query["X"]=$_REQUEST["_x"];
				$_query["Y"]=$_REQUEST["_y"];
				$_query["BBOX"]=$_REQUEST["_bbox"];
				$_query["SRS"]=$_REQUEST["_srs"];
				$_query["LAYERS"]=$objArr->_layerName;
				$_query["QUERY_LAYERS"]=$objArr->_layerName;
				$_query["INFO_FORMAT"]=$objArr->_featureInfoFormat;
				$_query["FEATUREID"]=$featureId;
				break;

			case "WFS":
				$_query["REQUEST"]="GETFEATURE";
				$_query["SERVICE"]="WFS";
				$_query["VERSION"]="1.1.0";
				$_query["FEATUREID"]=$featureId;
				$_query["OUTPUTFORMAT"]=$objArr->_featureInfoFormat;
				$_query["TYPENAME"]=$objArr->_layerName;
				break;
        }

        return PROXY::createUriQuery($objArr->_serviceUrl, $_query);
    }
}

?>