<?php

class ATOM
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
	
	public function registerService($objArr)
	{
		require("config.php");
	
		$p = new PROXY();
		
        $p->_url = $objArr->_serviceUrl;
            
        $_isSecure = addCredentialsToSession($objArr->_serviceUrl, $objArr->_username,$objArr->_password);

        $p->get();

        $r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;

        if ($p->o_responseCode == 200)
        {
			$section=$_config[$version];
			
			$_serviceObject = new SERVICEOBJECT();
				
			$_serviceObject->_serviceId = md5($objArr->_serviceUrl);

			$_serviceObject->_serviceType = "ATOM";
			
			$color = substr(md5($objArr->_serviceUrl),0,6);

			$_serviceObject->_serviceTitle = $objArr->_serviceTitle;

			$_serviceObject->_serviceUrl = $objArr->_serviceUrl;

			$_serviceObject->_username = $p->_username;

			$_serviceObject->_password = $p->_password;
			
			$_serviceObject->_isSecure = $_isSecure;

			$_serviceObject->_isVector = true;

			$_serviceObject->_isService = false;
			
			$_layerObject=new LAYEROBJECT();

			$_layerObject->_serviceId = md5($objArr->_serviceUrl);

			$_layerObject->_layerId = md5($objArr->_serviceUrl);
			
			$_layerObject->_layerName = $objArr->_serviceTitle;

			$_layerObject->_layerTitle = $objArr->_serviceTitle;
			
			$_layerObject->_nativeSRS = "EPSG:4326";

			$_layerObject->_isQueryable = true;
			
			$_layerObject->_layerLegend = $_config["PROXY_BASE_URL"]."?proxy=color&color=".$color;

            $_layerObject->_color=$color;

			$_serviceObject->_layers = $_layerObject;
					
			$r->_response=$_serviceObject;
            
        }
        else
        {
            $r->_errorDescription = $p->o_response;
        }

        return $r;			
	
	}
	
	public function getinfo($objArr)
    {
		$_features = $objArr->_featureId;
		
		$_featuresArr = explode(",",$_features);
		
		if (count($_featuresArr)>0) 
		{
			$_attributes = array();
			
			foreach($_featuresArr as $key=>$value)
			{
				$_attr = array();
			
				$_attr["_layerId"] = $objArr->_layerId;
					
				$_attr["_featureId"] = $value;
					
				$_attr["_featureUrl"] = "";
					
				$_attr["_featureGeomFormat"] = "CUSTOM";
					
				$_attributes[] = array($_attr);
					
			}
			
			$fr->_attributes = $_attributes;
			
		}
		
		$fr->_layerId= $objArr->_layerId;

        $r->_response = $fr;

        return $r;
    }
	
}

?>