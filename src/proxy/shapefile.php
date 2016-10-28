<?php


class SHAPEFILE
{
	public $output;
	
	private $_dbf = "";
	
	private $_dbfUri = "";
	
	private $_shp = "";
	
	private $_charset = "UTF-8";
	
	private $_data = array();
	
	private $_attributes = array();
	
	public function get($objArr)
	{
		$_request = $objArr->_request;
		
        switch ($_request)
        {
            case "registerService":
				
				$this->_charset=$objArr->_charset;
			
				if (!empty($_FILES["shapefile"]))
				{
					$_errorShp = $_FILES["shapefile"]["error"];
					
					if (empty($_errorShp))
					{
						require("uploadfile.php");
						
						
						$_shpFile = array();
						
						$_shpFile["file"] = $_FILES["shapefile"];
						
						$_shpFile["ext"] = "shp";
						
						$_uploadFile = new UPLOADFILE($_shpFile);
						
						$_uploadFile->upload();
						
						$this->_shp = $_uploadFile->outFileUrl;
						
						
						if (!empty($_FILES["dbf"]))
						{
							$_errorDbf = $_FILES["dbf"]["error"];
							
							if (empty($_errorDbf))
							{
								$_dbfFile = array();
								
								$_dbfFile["file"] = $_FILES["dbf"];
								
								$_dbfFile["ext"] = "dbf";
								
								$_uploadFile = new UPLOADFILE($_dbfFile);
								
								$_uploadFile->upload();
								
								$this->_dbf = $_uploadFile->outFileUrl;
								
								$this->_dbfUri = $_uploadFile->outFileUri;
								
								$_dataNAttributes = $this->getAttributes();
								
								$this->_attributes = $_dataNAttributes["_attributesFields"];
								
								$this->_data = $_dataNAttributes["_data"];
							}
						}
					}
				}
			
                $this->output = $this->registerService($objArr);
				
                break;
				
			case "getInfo":
                $this->output = $this->getinfo($objArr);
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
			$section=$_config[$version];
				
			$_serviceObject = new SERVICEOBJECT();
			
			$color = substr(md5($this->_shp),-6);

			$_serviceObject->_serviceId = md5($objArr->_serviceUrl);

			$_serviceObject->_serviceType = "SHAPEFILE";

			$_serviceObject->_serviceTitle = $objArr->_serviceTitle;

			$_serviceObject->_serviceUrl = $this->_shp;
			
			$_serviceObject->_serviceShp = $this->_shp;
			
			$_serviceObject->_serviceDbf = $this->_data;

			$_serviceObject->_isVector = true;

			$_serviceObject->_isService = false;
			
			$_layerAttributes = array();
			
			foreach($this->_attributes as $_key=>$_value)
			{
				$_layerAttributesObj = new ATTRIBUTESOBJECT();
			
				$_layerAttributesObj->_attributeName = $_value;
			
				$_layerAttributes[] = $_layerAttributesObj;
			}
			
			$_layerObject=new LAYEROBJECT();

			$_layerObject->_serviceId = md5($this->_shp);

			$_layerObject->_layerId = md5($this->_shp);

			$_layerObject->_layerName = $objArr->_serviceTitle;
			
			$_layerObject->_nativeSRS = $objArr->_nativeSRS;
			
			$_layerObject->_layerLegend = $_config["PROXY_BASE_URL"]."?proxy=color&color=".$color;

            $_layerObject->_color=$color;

			$_layerObject->_isQueryable = true;
			
			$_layerObject->_attributesFields = $_layerAttributes;
			
			$_layerObject->_layerTitle = $objArr->_serviceTitle;

			$_serviceObject->_layers = $_layerObject;
					
			$r->_response=$_serviceObject;
            
        }
        else
        {
            $r->_errorDescription = "";
        }

        return $r;			
	
	}
	
	public function getAttributes()
	{
		$_out = array(
			"_data"=>array(),
			"_attributesFields"=>array()
		);
	
		$db = dbase_open($this->_dbfUri, 2);

		$data = array();
		
		if ($db) 
		{
			$record_numbers = dbase_numrecords($db);
		
			for ($i = 1; $i <= $record_numbers; $i++) {
				
				$_record = dbase_get_record_with_names($db, $i);
				
				$_newRecord = array();
				
				unset($_record["deleted"]);
				
				foreach($_record as $key=>$value)
				{
					if ($this->_charset!="UTF-8")
					{
						$_newRecord[$key]=iconv($this->_charset, 'UTF-8',trim($value));
					}else{
						$_newRecord[$key]=trim($value);
					}
					
				}
				
				if($i==1){
					$_attributes=array_keys($_record);
				}
				
				$data[] = $_newRecord;
			}
			
			dbase_close($db);
		}
		
		$_out=array(
			"_data"=>$data,
			"_attributesFields"=>$_attributes
		);
		return $_out;
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