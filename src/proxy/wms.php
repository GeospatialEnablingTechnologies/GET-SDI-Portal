<?php

class WMS
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

            case "getInfo":
                $this->output = $this->getinfo($objArr);
                break;

            case "getAttributes":
                $this->output = $this->getAttributes($objArr);
                break;

			case "search":
                $this->output = $this->search($objArr);
                break;

            case "getLegendGraphic":
                $this->output = $this->getLegendGraphic($objArr);
                break;
        }
	}
	
	public function getLegendGraphic($objArr)
	{
		$_query["REQUEST"]="GETLEGENDGRAPHIC";
		
		$_query["LAYER"]=$objArr->_layerName;
		
		$_query["SERVICE"]="WMS";
		
		$_query["FORMAT"]="image/png";
		
		$_query["WIDTH"]="20";
		
		$_query["HEIGHT"]="20";
		
		$_query["SLD_BODY"]=urlencode($objArr->_sld_body);

        $_url = PROXY::createUriQuery($objArr->_serviceUrl, $_query);
		
		$p = new PROXY();
		
		$p->_url = $_url;
			
		$p->get();
			
		$r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;

        if ($p->o_responseCode == 200)
        {
			$r->_response= base64_encode($p->o_response);
		}
		else
        {
            $r->_errorDescription = $p->o_response;
        }

        return $r;	
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
			
			if (addCredentialsToSession($objArr->_serviceUrl, $objArr->_username, $objArr->_password))
			{
				$_isSecure = true;
			}else{
				removeCredentialsFromSession($objArr->_serviceUrl);
			}
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

                $sectionVersionManager = "WMS_".$version;

                $section=$_config[$sectionVersionManager];

                $countFeatureInfoFormat = $p->xmlNode($section["_featureInfoFormatCount"]);

                $featureInfoFormat = "";

                foreach($_config["FEATUREINFOFORMAT"] as $key=>$value)
                {
                    for ($i=1;$i<=$countFeatureInfoFormat;$i++)
                    {
                        $currentFeatureInfoFormat=$p->xmlNode(str_replace("[]","[".$i."]",$section["_featureInfoFormat"]));

                        if (($featureInfoFormat == "") && ($currentFeatureInfoFormat==$value))
                        {
                            $featureInfoFormat = $currentFeatureInfoFormat;
                        }
                    }
                }
				
				foreach($objArr->_projections as $key=>$value)
				{
					$currentSupportedEPSG=$p->xmlNode(str_replace("{_supportedEPSG}",$value,$section["_supportedEPSG"]));
					
					if ($currentSupportedEPSG>0)
					{
						$_supportedEPSG[]=$value;
					}
				}
				
					
                $_serviceObject = new SERVICEOBJECT();
				
                $_serviceObject->_serviceId = md5($objArr->_serviceUrl);

                $_serviceObject->_serviceType = "WMS";

                $_serviceObject->_serviceName = $p->xmlNode($section["_serviceName"]);

                $_serviceObject->_serviceAbstract = $p->xmlNode($section["_serviceAbstract"]);

                $_serviceObject->_serviceTitle = $p->xmlNode($section["_serviceTitle"]);

                $_serviceObject->_serviceUrl = $objArr->_serviceUrl;

                $_serviceObject->_username = $p->_username;

                $_serviceObject->_password = $p->_password;

                $_serviceObject->_version = $p->xmlNode("string(//@version)");
				
				$_serviceObject->_responsible_party = $p->xmlNode($section["_responsible_party"]);
				
				$_serviceObject->_responsible_person = $p->xmlNode($section["_responsible_person"]);
				
				$_serviceObject->_responsible_position = $p->xmlNode($section["_responsible_position"]);
				
				$_serviceObject->_responsible_email = $p->xmlNode($section["_responsible_email"]);
				
				$_serviceObject->_responsible_fees = $p->xmlNode($section["_responsible_fees"]);
				
				$_serviceObject->_responsible_access_constrains = $p->xmlNode($section["_responsible_access_constrains"]);

                $_serviceObject->_isVector = false;

                $_serviceObject->_isService = true;
				
				$_serviceObject->_isSecure = $_isSecure;
				
				$_serviceObject->_supportedEPSG=$_supportedEPSG;

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

                $sectionVersionManager = "WMS_".$version;

                $section=$_config[$sectionVersionManager];

                $countLayer = $p->xmlNode($section["_layer"]);

                $r_layers = Array();

                for ($i =1;$i<=$countLayer;$i++)
                {
					
					$_groupLayer = $p->xmlNode(str_replace("[]","[".$i."]",$section["_groupLayer"]));
					
					if ($_groupLayer>0)
					{
						for($g=1;$g<=$_groupLayer;$g++)
						{
							$layerId = md5($p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_layerName"])));
						
							$serviceId=md5($objArr->_serviceUrl);

							$queryable = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_isQueryable"]));

							$queryableValue = false;

							if($queryable=="1")
							{
								$queryableValue = true;
							}

							$_layerObject=new LAYEROBJECT();
							
							$_layerObject->_serviceId = $serviceId;

							$_layerObject->_layerId = $serviceId.$layerId;

							$_layerObject->_layerName = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_layerName"]));

							$_layerObject->_layerTitle = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_layerTitle"]));

							$_layerObject->_layerAbstract = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_layerAbstract"]));

							$_layerObject->_layerLegend = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_layerLegend"]));

							$_layerObject->_isQueryable = $queryableValue;

							$_layerObject->_bboxMinX = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_bboxMinX"]));

							$_layerObject->_bboxMaxX = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_bboxMaxX"]));

							$_layerObject->_bboxMinY = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_bboxMinY"]));

							$_layerObject->_bboxMaxY = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_bboxMaxY"]));
							
							$_elevation =   $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_elevation"]));
						
							$_layerObject->_elevationDefault = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_elevationDefault"]));
						
							$_layerObject->_elevation = $this->calculateElevation($_elevation);
							
							$_dimension =  $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_dimension"]));
							
							$_layerObject->_dimension = $this->calculateDimension($_dimension);
							
							$_layerObject->_dimensionDefault = $p->xmlNode(str_replace("[]","[".$i."]"."/".$section["_groupLayerSection"]."[".$g."]",$section["_dimensionDefault"]));
							
							$_layerObject->_dimension = $this->calculateDimension($_dimension);
						
							if ($_layerObject->_dimensionDefault=="current")
							{
								$_layerObject->_dimensionDefault = $_layerObject->_dimension[0][0];
							}
							
							$_layerObject->_isSLDEditable=true;

							$_layerObject->_isVector = false;

							$_layerObject->_isPrintable = true;
							
							$r_layers[]=$_layerObject;
					
						}
					
					}elseif (empty($_groupLayer))
					{
						
					
						$layerId = md5($p->xmlNode(str_replace("[]","[".$i."]",$section["_layerName"])));
						
						$serviceId=md5($objArr->_serviceUrl);

						$queryable = $p->xmlNode(str_replace("[]","[".$i."]",$section["_isQueryable"]));

						$queryableValue = false;

						if($queryable=="1")
						{
							$queryableValue = true;
						}

						$_layerObject=new LAYEROBJECT();
						
						$_layerObject->_serviceId = $serviceId;

						$_layerObject->_layerId = $serviceId.$layerId;

						$_layerObject->_layerName = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerName"]));

						$_layerObject->_layerTitle = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerTitle"]));

						$_layerObject->_layerAbstract = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerAbstract"]));

						$_layerObject->_layerLegend = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerLegend"]));

						$_layerObject->_isQueryable = $queryableValue;

						$_layerObject->_bboxMinX = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMinX"]));

						$_layerObject->_bboxMaxX = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMaxX"]));

						$_layerObject->_bboxMinY = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMinY"]));

						$_layerObject->_bboxMaxY = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMaxY"]));
						
						$_elevation =  $p->xmlNode(str_replace("[]","[".$i."]",$section["_elevation"]));
						
						$_layerObject->_elevationDefault = $p->xmlNode(str_replace("[]","[".$i."]",$section["_elevationDefault"]));
						
						$_layerObject->_elevation = $this->calculateElevation($_elevation);
						
						$_dimension =  $p->xmlNode(str_replace("[]","[".$i."]",$section["_dimension"]));
						
						$_layerObject->_dimensionDefault = $p->xmlNode(str_replace("[]","[".$i."]",$section["_dimensionDefault"]));
						
						$_layerObject->_dimension = $this->calculateDimension($_dimension);
						
						if ($_layerObject->_dimensionDefault=="current")
						{
							$_layerObject->_dimensionDefault = $_layerObject->_dimension[0][0];
						}

						$_layerObject->_isSLDEditable=true;

						$_layerObject->_isVector = false;

						$_layerObject->_isPrintable = true;
						
						$r_layers[]=$_layerObject;
					
					}
                }
				
				$_serviceObject = new SERVICEOBJECT();
				
                $_serviceObject->_serviceId = md5($objArr->_serviceUrl);

                $_serviceObject->_serviceType = "WMS";

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
		
		$_attributes=WFS::createDescribeFeatureTypeObject($objArr);
		
		$_layerDetailsObject->_attributes = $_attributes;

		$_nativeSRS = WFS::getLayerNativeSRS($objArr);
		
		if (empty($_nativeSRS))
		{
			$_nativeSRS="EPSG:4326";
		}
		
        $_layerDetailsObject->_nativeSRS = $_nativeSRS;

        $_layerDetailsObject->_geometryField=WFS::getGeoemtryField($_attributes);
		
        $r->_response=$_layerDetailsObject;

        return $r;
    }
	
	public function calculateElevation($_elevation)
	{
		if (!empty($_elevation))
		{
			$_elevationArr = explode(",",$_elevation);
			
			$_output = [];
			
			foreach($_elevationArr as $key=>$value)
			{
				
				$_output[] = trim(preg_replace('/\s+/', ' ', $value));
			}
			
			return $_output;
		}
		
		return;
	}
	
	
	public function calculateDimension($_dimension)
	{
		if (!empty($_dimension))
		{
			
			if(strpos($_dimension,',')>0)
			{
			
				$_c = array();
				
				$_outC = array();
			
				$_d = explode(",",$_dimension);
				
				foreach($_d as $key=>$value)
				{
					if (strpos($value,'/')>0)
					{
						$_d = explode("/",$value);
					
						$_dS = new DateTime($_d[0]);
						
						$_dE = new DateTime($_d[1]);
					
						$_dP = new DateInterval($_d[2]);
						
						$limit = 0;
						
						while(($_dS<=$_dE) && ($limit<=550))
						{
							$_dS = $_dS->add($_dP);
							
						
							$_c[]= $_dS->format(DateTime::ISO8601);
							
							$limit++;
						
						}
					
						//$_c = $_c[count($_c)-1];
					
					}else
					{
				
						$_dS = new DateTime($value);
					
						
						$_c[]= $_dS->format(DateTime::ISO8601);
						
					}
					
				}
				
				$_outC[] = $_c;
				
				return $_outC;
			}else{
				
				$_c = array();
				
				$_outC = array();
				
				$_d = explode("/",$_dimension);
				
				
				if (count($_d)>1)
				{
					$_dS = new DateTime($_d[0]);
					
					$_dE = new DateTime($_d[1]);
					
					$_dP = new DateInterval("P1M");
					
					if (!empty($_d[2]))
					{
						$_dP = new DateInterval($_d[2]);
					}
					
					$limit = 0;
					
					while(($_dS<=$_dE) && ($limit<=550))
					{
						$_dS = $_dS->add($_dP);
							
						$_c[]= $_dS->format(DateTime::ISO8601);
						
						$limit++;
					}
					
					$_outC[] = $_c;
					
				}
				
				return $_outC;
			}
			
		}
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
	
	public function createGetCapabilitiesUri($_url)
    {
		$_query["REQUEST"]="GetCapabilities";
		
		$_query["SERVICE"]="WMS";

        return PROXY::createUriQuery($_url, $_query);
    }
}

?>