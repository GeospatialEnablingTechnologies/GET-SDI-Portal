<?php

class CSW
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

                $sectionVersionManager = "CSW_".$version;

                $section=$_config[$sectionVersionManager];

                $_serviceObject = new SERVICEOBJECT();
				
                $_serviceObject->_serviceId = md5($objArr->_serviceUrl);

                $_serviceObject->_serviceType = "CSW";

                $_serviceObject->_serviceName = $p->xmlNode($section["_serviceName"]);

                $_serviceObject->_serviceAbstract = $p->xmlNode($section["_serviceAbstract"]);
				
				$_serviceObject->_isSecure = $_isSecure;

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
	
	public function createGetCapabilitiesUri($_url)
    {
		$_query["REQUEST"]="GetCapabilities";
		
		$_query["SERVICE"]="CSW";

        return PROXY::createUriQuery($_url, $_query);
    }
}

?>