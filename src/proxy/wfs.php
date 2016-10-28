<?php

class WFS
{
	public $output;

	public function get($objArr)
	{
		$_request = $objArr->_request;

        switch ($_request)
        {
            case "registerService":
                $this->output = $this->registerService($objArr);
				
                break;
				
			case "fetchLayers":
                $this->output = $this->fetchLayers($objArr);
				
                break;
	
            case "registerLayer":
                $this->output = $this->registerLayer($objArr);
                break;
				
			case "getAttributes":
                $this->output = $this->getAttributes($objArr);
                break;

            case "getInfo":
                $this->output = $this->getinfo($objArr);
                break;

			case "search":
                $this->output = $this->search($objArr);
                break;
		
        }
	}
	
	public function registerService($objArr)
	{
		require("config.php");
	
		$p = new PROXY();
		
		$objArr->_serviceUrl = PROXY::checkUrlScheme($objArr->_serviceUrl);
		
        $p->_url = $this->createGetCapabilitiesUri($objArr->_serviceUrl);
            
        $_username = $objArr->_username;
		
		$_password = $objArr->_password;
		
		$_isSecure = false;
		
		if((!empty($_username)) && (!empty($_password)))
        {
			$_isSecure = addCredentialsToSession($objArr->_serviceUrl, $objArr->_username, $objArr->_password);
		}else{
			removeCredentialsFromSession($objArr->_serviceUrl);
		}

        $p->get();

        $r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;

        if ($p->o_responseCode == 200)
        {
			
            $exc=$p->xmlNode("//ogc:ServiceExceptionReport/ogc:ServiceException/text()");
			
            if (!empty($exc))
            {
                $r->_errorStatus = 0;
				
                $r->_errorDescription = $p->xmlNode("//ogc:ServiceExceptionReport/ogc:ServiceException/text()");
            }
            else
            {
					
                $version = $p->xmlNode("string(//@version)");

                $sectionVersionManager = "WFS_".$version;

                $section=$_config[$sectionVersionManager];

                $countFeatureInfoFormat = $p->xmlNode($section["_featureInfoFormatCount"]);

                $featureInfoFormat = "";

                foreach($_config["FEATUREINFOFORMAT"] as $key=>$value)
                {
                    for ($i=1;$i<=$countFeatureInfoFormat;$i++)
                    {
                        $currentFeatureInfoFormat=str_replace("[]","[".$i."]",$p->xmlNode($section["_featureInfoFormat"]));

                        if (($featureInfoFormat == "") && ($currentFeatureInfoFormat==$key))
                        {
                            $featureInfoFormat = $currentFeatureInfoFormat;
                        }
                    }
                }
				
				if ($featureInfoFormat=="")
                {
                    $featureInfoFormat = "GML2";
                }
				
                $_serviceObject = new SERVICEOBJECT();
				
                $_serviceObject->_serviceId = md5($objArr->_serviceUrl);

                $_serviceObject->_serviceType = "WFS";
				
				$_serviceObject->_isSecure = $_isSecure;

                $_serviceObject->_serviceName = $p->xmlNode($section["_serviceName"]);

                $_serviceObject->_serviceAbstract = $p->xmlNode($section["_serviceAbstract"]);

                $_serviceObject->_serviceTitle = $p->xmlNode($section["_serviceTitle"]);

                $_serviceObject->_serviceUrl = $objArr->_serviceUrl;

                $_serviceObject->_username = $p->_username;

                $_serviceObject->_password = $p->_password;

                $_serviceObject->_version = $p->xmlNode("string(//@version)");

                $_serviceObject->_isVector = true;

                $_serviceObject->_isService = true;

                $_serviceObject->_featureInfoFormat = $featureInfoFormat;
				
				$r->_response=$_serviceObject;
                
            }
        }
        else
        {
            $r->_errorDescription = $p->o_response;
        }

        return $r;		
	
	}
	
	public function fetchLayers($objArr)
    {
        require("config.php");
	
		$p = new PROXY();
		
        $p->_url = $this->createGetCapabilitiesUri($objArr->_serviceUrl);
            
        $p->_username = $objArr->_username;

        $p->_password = $objArr->_password;

        $p->get();

        $r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;

        if ($p->o_responseCode == 200)
        {
            $exc=$p->xmlNode("//ogc:ServiceExceptionReport/ogc:ServiceException/text()");
			
            if (!empty($exc))
            {
                $r->_errorStatus = 0;
				
                $r->_errorDescription = $p->xmlNode("//ogc:ServiceExceptionReport/ogc:ServiceException/text()");
            }
            else
            {

                $version = $p->xmlNode("string(//@version)");

                $sectionVersionManager = "WFS_".$version;

                $section=$_config[$sectionVersionManager];

                $countLayer = $p->xmlNode($section["_layer"]);

                $r_layers = Array();
				
                for ($i =1;$i<=$countLayer;$i++)
                {
				
                    $layerId = md5($p->xmlNode(str_replace("[]","[".$i."]",$section["_layerName"])));
					
					$serviceId=md5($objArr->_serviceUrl);

                    $color = substr($layerId,0,6);

                    $isEditableStr = $p->xmlNode(str_replace("[]","[".$i."]",$section["_isEditable"]));

                    $isEditable = false;
					
					if ($isEditableStr>0)
					{
						$isEditable=true;
					}
					
					$_layerObject=new LAYEROBJECT();
					
					$_layerObject->_serviceId = $serviceId;

                    $_layerObject->_layerId = $serviceId.$layerId;

                    $_layerObject->_layerName = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerName"]));

                    $_layerObject->_layerTitle = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerTitle"]));

                    $_layerObject->_layerAbstract = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerAbstract"]));

                    $_layerObject->_layerLegend = $_config["PROXY_BASE_URL"]."?proxy=color&color=".$color;

                    $_layerObject->_color=$color;

                    $_layerObject->_bboxMinX = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMinX"]));

                    $_layerObject->_bboxMaxX = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMaxX"]));

                    $_layerObject->_bboxMinY = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMinY"]));

                    $_layerObject->_bboxMaxY = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMaxY"]));

                    $_layerObject->_isSLDEditable = true;

                    $_layerObject->_isEditable = $isEditable;

                    $_layerObject->_isQueryable = true;

                    $_layerObject->_isVector = true;
					
					$r_layers[]=$_layerObject;
                }

				
				
				$_serviceObject = new SERVICEOBJECT();
				
                $_serviceObject->_serviceId = md5($objArr->_serviceUrl);

                $_serviceObject->_serviceType = "WFS";

                $_serviceObject->_serviceName = $p->xmlNode($section["_serviceName"]);

                $_serviceObject->_serviceAbstract = $p->xmlNode($section["_serviceAbstract"]);

                $_serviceObject->_serviceTitle = $p->xmlNode($section["_serviceTitle"]);

                $_serviceObject->_serviceUrl = $objArr->_serviceUrl;

                $_serviceObject->_version = $p->xmlNode("string(//@version)");

                $_serviceObject->_layers = $r_layers;
				
				$r->_response=$_serviceObject;
				
            }
        }
        else
        {
            $r->_errorDescription = $p->o_response;
        }

        return $r;

    }
	
	public function registerLayer($objArr)
    {
		$r = new RESPONSE();
		
		$_layerDetailsObject = new LAYERDETAILSOBJECT();
		
		$_attributes=self::createDescribeFeatureTypeObject($objArr);
		
		$_layerDetailsObject->_attributes = $_attributes;

        $_layerDetailsObject->_nativeSRS = self::getLayerNativeSRS($objArr);

        $_layerDetailsObject->_geometryField=self::getGeoemtryField($_attributes);
		
		$_layerDetailsObject->_geometryIsMulti=self::getGeoemtryFieldIsMulti($_attributes);

        $_layerDetailsObject->_featureNS = self::getPrefixNType($objArr, "prefix");

        $_layerDetailsObject->_featureType = self::getPrefixNType($objArr, "typename");
		
        $r->_response=$_layerDetailsObject;

        return $r;
    }
	
	public function search($objArr)
    {
        $f = new FEATUREINFOOBJECT();

		$r = new RESPONSE();

        $fr = new FEATUREINFORESPONSE();

        $fr->_attributes = $f->readGML($objArr);

        $fr->_layerId=$objArr->_layerId;
		
		$fr->_total = $f->getTotalFeaturesCount();

        $r->_response = $fr;

        return $r;
    }
	
	public function getinfo($objArr)
    {
        $f = new FEATUREINFOOBJECT();

		$r = new RESPONSE();

        $fr = new FEATUREINFORESPONSE();

        $fr->_attributes = $f->readGML($objArr);

        $fr->_layerId=$objArr->_layerId;

        $r->_response = $fr;

        return $r;
    }
	
	public function getAttributes($objArr)
    {
        $f = new FEATUREINFOOBJECT();

		$r = new RESPONSE();

        $fr = new FEATUREINFORESPONSE();

        $fr->_attributes = $f->readGML($objArr);

        $fr->_layerId=$objArr->_layerId;

        $r->_response = $fr;

        return $r;
    }
	
	public function getPrefixNType($objArr, $_type)
    {
        $splitNM = explode(":",$objArr->_layerName);

        $_output="";
		
        if (count($splitNM)>0)
        {
            switch($_type)
            {
                case "prefix":
				
					$p = new PROXY();
		
					$p->_url = $this->createGetCapabilitiesUri($objArr->_serviceUrl);
						
					$p->_username = $objArr->_username;

					$p->_password = $objArr->_password;

					$p->get();
					
                    $_output=$p->nodeNamespace($splitNM[0]);
					
					if (empty($_output))
					{
						$_output = "";
					}
					
                    break;

                case "typename":
				
                    $_output = $splitNM[1];
					
					if (empty($_output))
					{
						$_output = $objArr->_layerName;
					}
					
                    break;
            }
        }
		
        return $_output;
    }
	
	public function getGeoemtryField($attributes)
    {
        foreach($attributes as $key=>$value)
        {
		
            if ($value->_attributeIsGeometry==true)
            {
                return $value->_attributeName;
            }
        }
        return "";
    }
	
	public function getGeoemtryFieldIsMulti($attributes)
    {
        foreach($attributes as $key=>$value)
        {
		
            if ($value->_attributeIsGeometry==true)
            {
                return $value->_geometryIsMulti;
            }
        }
        return "";
    }
	
	public function getLayerNativeSRS($objArr)
    {
		require("config.php");

		$p = new PROXY();
		
		$p->_url = self::createGetCapabilitiesUri($objArr->_serviceUrl);
						
		$p->_username = $objArr->_username;

		$p->_password = $objArr->_password;

		$p->get();

        $r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;

        $version = $p->xmlNode("string(//@version)");

        $sectionVersionManager = "WFS_".$version;

        $section=$_config[$sectionVersionManager];

        if ($section!=null)
        {
			if ($p->o_responseCode == 200)
			{
				return $p->xmlNode(str_replace("{_layerName}",$objArr->_layerName,$section["_nativeSRS"]));
			}
        }
        return "";
    }

	public function createDescribeFeatureTypeObject($objArr)
	{
		require("config.php");
	   
		$p = new PROXY();
		
		$p->_url = self::createDescribeFeatureType($objArr->_serviceUrl, $objArr->_layerName);

		$p->_username = $objArr->_username;

		$p->_password = $objArr->_password;

		$p->get();

        $r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;

        $section = $_config["DESCRIBEFEATURETYPE"];

        $r_attributes = array();

        if ($p->o_responseCode == 200)
        {
			$attributesRoot=$p->xmlNode($section["_attributesRoot"]);
		
			if (!empty($attributesRoot))
			{
				$countAttributes = $p->xmlNode($section["_attributesRoot"]);

				$isgeoemtry = false;

				for ($i=1;$i<=$countAttributes;$i++)
				{
					$_type = $p->xmlNode(str_replace("[]", "[".$i."]",$section["_attributeType"]));

					$_name = $p->xmlNode(str_replace("[]", "[".$i."]",$section["_attributeName"]));

					$isgeoemtry = false;
					
					$geometryIsMulti=false;

					if (strlen($_type)>2)
					{
						if ((substr($_type,0,3))=="gml")
						{
							$isgeoemtry = true;
							
							$geomMulti = strtolower($_type);
							
							if (strpos($geomMulti,"multi")>0)
							{
								$geometryIsMulti=true;
							}
						}
					}

					$_typeExp=explode(":",$_type);
					
					if (count($_typeExp)>=0)
					{
						$_type = $_typeExp[count($_typeExp)-1];
					}

					$_attributesObject=new ATTRIBUTESOBJECT();
					
					$_attributesObject->_attributeName = $_name;
					
					$_attributesObject->_attributeType = $_type;
					
					$_attributesObject->_attributeIsGeometry = $isgeoemtry;
					
					$_attributesObject->_geometryIsMulti = $geometryIsMulti;
					
					$r_attributes[]=$_attributesObject;
					
				}
			}
        }

        return $r_attributes;
    }	
	
	public function createGetCapabilitiesUri($_url)
    {
		$_query["REQUEST"]="GETCAPABILITIES";
		
		$_query["SERVICE"]="WFS";
		
		$_query["VERSION"]="1.1.0";
		
        return PROXY::createUriQuery($_url, $_query);
    }
	
	public function createDescribeFeatureType($_url, $typenames)
    {
	
        $_url = str_replace("wms","wfs",$_url);

        $_query["REQUEST"]="DESCRIBEFEATURETYPE";

        $_query["SERVICE"]="WFS";
		
		$_query["VERSION"]="1.1.0";

        $_query["TYPENAME"]=urlencode($typenames);

        return PROXY::createUriQuery($_url, $_query);
    }
}

?>