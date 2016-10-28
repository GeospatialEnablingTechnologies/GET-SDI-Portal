<?php


class WMC
{
	public $output;
	
	private $_wmc = "";
	
	private $_wmcUri = "";
	
	private $_data = array();
	
	private $_attributes = array();
	
	public function get($objArr)
	{
		$_request = $objArr->_request;
		
        switch ($_request)
        {
            case "registerService":
				
				if (!empty($_FILES["wmcfile"]))
				{
					$_errorWMC= $_FILES["wmcfile"]["error"];
					
					if (empty($_errorWMC))
					{
						require("uploadfile.php");
						
						$_wmcFile = array();
						
						$_wmcFile["file"] = $_FILES["wmcfile"];
						
						$_wmcFile["ext"] = "xml";
						
						$_uploadFile = new UPLOADFILE($_wmcFile);
						
						$_uploadFile->upload();
						
						$this->_wmc = "http://localhost/getsdiprojects/release/uploads/".$_uploadFile->outFileUrl;
					}
				}
			
                $this->output = $this->registerService($objArr);
				
				break;
			
        }
	}
	
	
	public function registerService($objArr)
	{
		require("config.php");
	
        $r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;
		
		$_serviceTitle = $objArr->_serviceTitle;

        if (!empty($_serviceTitle))
        {
			$_serviceObject = new SERVICEOBJECT();
			
			$_serviceObject->_serviceId = md5($objArr->_serviceUrl);

			$_serviceObject->_serviceType = "WMCFILE";

			$_serviceObject->_serviceTitle = $objArr->_serviceTitle;

			$_serviceObject->_serviceUrl = $this->_wmc;

			$_serviceObject->_isVector = false;

			$_serviceObject->_isService = false;

			$_layerObject=new LAYEROBJECT();

			$_layerObject->_serviceId = md5($this->_wmc);

			$_layerObject->_layerId = md5($this->_wmc);

			$_layerObject->_layerName = $objArr->_serviceTitle;

			$_layerObject->_attributesFields = $_layerAttributes;
			
			$_layerObject->_layerTitle = $objArr->_serviceTitle;

			$_serviceObject->_layers = $this->wmcjson($objArr);
					
			$r->_response=$_serviceObject;
			
        }
        else
        {
            $r->_errorDescription = "";
        }

        return $r;			
	
	}
	
	public function wmcjson($objArr)
	{
		require("config.php");
		
		$p = new PROXY();
		
        $p->_url = $this->_wmc;
        
        $p->get();
		
		if ($p->o_responseCode == 200)
        {
			$version = $p->xmlNode("string(//@version)");

            $sectionVersionManager = "WMC_".$version;

            $section=$_config[$sectionVersionManager];

            $countLayer = $p->xmlNode($section["_layer"]);

            $r_services = Array();
			
            for ($i =1;$i<=$countLayer;$i++)
            {
				$_layerName = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerName"]));

				$_layerTitle = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerTitle"]));
				
				$_serviceUrl = $p->xmlNode(str_replace("[]","[".$i."]",$section["_serviceUrl"]));
				
				$_serviceType = $p->xmlNode(str_replace("[]","[".$i."]",$section["_serviceType"]));
				
				$_isBaseLayer = $p->xmlNode(str_replace("[]","[".$i."]",$section["_isBaseLayer"]));
				
				$_serviceType = strtolower($_serviceType);
				
				if ($_isBaseLayer!="true")
				{
					$pos = strpos($_serviceType, ":");
					
					if ($pos>0){
						$_serviceTypeArr = explode(":", $_serviceType);
						
						$_serviceType = $_serviceTypeArr[1];
					}

					$_layerVisibility = $p->xmlNode(str_replace("[]","[".$i."]",$section["_layerVisibility"]));
					
					$r_services[] = array(
						"_serviceUrl"=>$_serviceUrl,
						"_serviceType"=>$_serviceType,
						"_layerName" =>$_layerName,
						"_layerTitle" =>$_layerTitle,
						"_visibility"=>$_layerVisibility
					);
				}
			}
			
			return $r_services;
		}
	}
}

?>