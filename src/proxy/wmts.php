<?php

class WMTS
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

                $sectionVersionManager = "WMTS_".$version;

                $section=$_config[$sectionVersionManager];
				
                $_serviceObject = new SERVICEOBJECT();
				
                $_serviceObject->_serviceId = md5($objArr->_serviceUrl);

                $_serviceObject->_serviceType = "WMTS";
				
				$_serviceObject->_isSecure = $_isSecure;

                $_serviceObject->_serviceName = $p->xmlNode($section["_serviceName"]);

                $_serviceObject->_serviceAbstract = $p->xmlNode($section["_serviceAbstract"]);

                $_serviceObject->_serviceTitle = $p->xmlNode($section["_serviceTitle"]);

                $_serviceObject->_serviceUrl = $objArr->_serviceUrl;

                $_serviceObject->_username = $p->_username;

                $_serviceObject->_password = $p->_password;

                $_serviceObject->_version = $p->xmlNode("string(//@version)");

                $_serviceObject->_isVector = false;

                $_serviceObject->_isService = true;
				
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

                $sectionVersionManager = "WMTS_".$version;

                $section=$_config[$sectionVersionManager];

                $countLayer = $p->xmlNode($section["_layer"]);

                $r_layers = Array();

                for ($i =1;$i<=$countLayer;$i++)
                {
                    $layerId = md5($p->xmlNode(str_replace("[]","[".$i."]",$section["_layerName"])));
					
					$serviceId=md5($objArr->_serviceUrl);

                    $supportedEPSG = array();
					
					$layerName = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerName"]));

					$wmtsMatrixSetLinks = $p->xmlNode(str_replace("{_layerName}",$layerName,$section["_matrixSetLinks"]));
					
                    for ($a = 1; $a<=$wmtsMatrixSetLinks;$a++)
                    {
                        $wmtsMatrixSet = str_replace("{_layerName}",$layerName,$section["_matrixSetLink"]);

                        $wmtsMatrixSet = $p->xmlNode(str_replace("[]","[".$a."]",$wmtsMatrixSet));

                        $epsg = $p->xmlNode(str_replace("{_tileMatrixSet}",$wmtsMatrixSet,$section["_supportedEPSG"]));

                        $supportedEPSG[]=$epsg;
                    }
					
					$_layerObject=new LAYEROBJECT();
					
					$_layerObject->_serviceId = $serviceId;

                    $_layerObject->_layerId = $serviceId.$layerId;

                    $_layerObject->_layerName = $layerName;
					
					$_layerObject->_supportedEPSG=$supportedEPSG;

                    $_layerObject->_layerTitle = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerTitle"]));

                    $_layerObject->_layerAbstract = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerAbstract"]));

                    $_layerObject->_layerLegend = $section["_layerLegend"];

                    $_layerObject->_bboxMinX = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMinX"]));

                    $_layerObject->_bboxMaxX = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMaxX"]));

                    $_layerObject->_bboxMinY = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMinY"]));

                    $_layerObject->_bboxMaxY = $p->xmlNode(str_replace("[]","[".$i."]",$section["_bboxMaxY"]));

					$_layerObject->_isQueryable = false;
					
                    $_layerObject->_isSLDEditable=false;
					
					$_layerObject->_isSearchable=false;

                    $_layerObject->_isVector = false;

                    $_layerObject->_isPrintable = true;
					
					$r_layers[]=$_layerObject;
                }
				
				$_serviceObject = new SERVICEOBJECT();
				
                $_serviceObject->_serviceId = md5($objArr->_serviceUrl);

                $_serviceObject->_serviceType = "WMTS";

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

                $sectionVersionManager = "WMTS_".$version;

                $section=$_config[$sectionVersionManager];
				
				$wmtsMatrixSetLinks = $p->xmlNode(str_replace("{_layerName}",$objArr->_layerName,$section["_matrixSetLinks"]));

				$wmtsDetails=array();

				for ($a=1;$a<=$wmtsMatrixSetLinks;$a++)
				{
								
					$wmtsMatrixSet = str_replace("{_layerName}",$objArr->_layerName,$section["_matrixSetLink"]);

                    $wmtsMatrixSet = $p->xmlNode(str_replace("[]","[".$a."]",$wmtsMatrixSet));

                    $epsg = $p->xmlNode(str_replace("{_tileMatrixSet}",$wmtsMatrixSet,$section["_supportedEPSG"]));
					

					$matrixIds = str_replace("{_layerName}",$objArr->_layerName,$section["_matrixIds"]);

					$matrixIdsCount = $p->xmlNode(str_replace("[]","[".$a."]",$matrixIds));

					
					$matrixIdList = array();

					$martixId = str_replace("{_layerName}",$objArr->_layerName,$section["_matrixId"]);

					$martixId = str_replace("[]","[".$a."]",$martixId);

					for ($b=1;$b<=$matrixIdsCount;$b++)
					{
						$matrixIdList[]=$p->xmlNode(str_replace("[{}]","[".$b."]",$martixId));
					}
					
					$_WMTSLayerDetails=new WMTSLAYERDETAILS();
					
					$_WMTSLayerDetails->_matrixEPSG = $epsg;

					$_WMTSLayerDetails->_matrixSet = $wmtsMatrixSet;

					$_WMTSLayerDetails->_matrixIds = $matrixIdList;

					$_WMTSLayerDetails->_topLeftCornerX = $p->xmlNode(str_replace("{_tileMatrixSet}",$wmtsMatrixSet,$section["_topLeftCornerX"]));

					$_WMTSLayerDetails->_topLeftCornerY = $p->xmlNode(str_replace("{_tileMatrixSet}",$wmtsMatrixSet,$section["_topLeftCornerY"]));
					
				}

				$r->_response=$_WMTSLayerDetails;
            }
        }
        else
        {
            $r->_errorDescription = $p->o_response;
        }

        return $r;
    }
	
	
	public function createGetCapabilitiesUri($_url)
    {
		$_query["REQUEST"]="GETCAPABILITIES";
		
		$_query["SERVICE"]="WMTS";

        return PROXY::createUriQuery($_url, $_query);
    }
}

?>