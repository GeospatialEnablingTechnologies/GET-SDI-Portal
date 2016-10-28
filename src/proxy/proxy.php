<?php

class PROXY
{
	public $_url;

    public $_username;

    public $_password;

    public $_method = "GET";

    public $_timeout=8000;

    public $o_response;

	public $o_responseCode;

    public $_postData = "";
	
	public $_postTxtData = "";
	
	public $_proxy_Server="";
	
	public $_proxy_Port="";
	
	public $_proxy_auth_type="";
	
	public $_proxy_username="";
	
	public $_proxy_password="";
	
	public $_bypass=array();
	
	private $_xmlDocument;
	
	public function get()
	{
		$url=$this->_url;
	
		$ba=$this->createAuthUrl($url);
	
		foreach($this->_bypass as $key=>$value)
		{
			$url=str_replace($key,$value,$url);
		}
		
		$url=str_replace("&amp","&",$url);
		
		$curl = curl_init($url);
		
		if (!empty($ba))
		{
			
			curl_setopt($curl, CURLOPT_USERPWD, $ba);
		}
		
		curl_setopt($curl, CURLOPT_MUTE, true);
		
		curl_setopt($curl, CURLOPT_ENCODING, 'UTF-8');
		
		curl_setopt($curl,CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
		
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		
		curl_setopt($curl,CURLOPT_FOLLOWLOCATION,true);
		
		if (!empty($this->_proxy_Server)){
		
			curl_setopt($curl, CURLOPT_PROXY,$this->_proxy_Server);
			
			if (!empty($this->_proxy_Port)){
				curl_setopt($curl, CURLOPT_PROXYPORT,$this->_proxy_Port);
			}
			
			if (!empty($this->_proxy_auth_type)){
				curl_setopt($curl, CURLOPT_HTTPAUTH, $this->_proxy_auth_type);
			}
			
			if (!empty($this->_proxy_username)){
				curl_setopt($curl, CURLOPT_PROXYUSERPWD, $this->_proxy_username.':'.$this->_proxy_password);
			}
		}
		
		if (!empty($this->_postData))
		{
			curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/xml'));
		
			curl_setopt($curl, CURLOPT_POSTFIELDS, $this->_postData);
		}
		
		if (!empty($this->_postTxtData))
		{
			curl_setopt($curl, CURLOPT_POSTFIELDS, $this->_postTxtData);
		} 		

		$this->o_response = curl_exec($curl);

		$this->o_responseCode = (string)curl_getinfo($curl, CURLINFO_HTTP_CODE);
		
		
		curl_close($curl);
	}
	
	public function createAuthUrl($url)
	{
		$_ba = "";
		
		foreach($_SESSION["credentials"] as $key=>$value)
		{
		
			if (strpos($url,$key)!==FALSE)
			{
				
				$serviceUsername = $_SESSION["credentials"][$key]["username"];
				$servicePassword = $_SESSION["credentials"][$key]["password"];

				if ($serviceUsername!="")
				{	
					$purl=parse_url($url);
						
					$_ba = $serviceUsername.":".$servicePassword;
				}

			}
			
			break;
		}
		
		return $_ba;
	}

	public function xmlNode($_xpath)
    {
		require("config.php");
	
		libxml_use_internal_errors(true);
		
		if (empty($this->_xmlDocument))
		{
			$xml=new DOMDocument();
			
			$xml->loadXML($this->o_response);
			
			$this->_xmlDocument = $xml;
		}
		
		$xpath = new DOMXPath($this->_xmlDocument);
	
        foreach($_config["NAMESPACES"] as $key=>$value)
        {
			$xpath->registerNamespace($key,$value);
        }

		$value=$xpath->evaluate($_xpath);
		
		if ($value->length===0)
		{
			return "";
		}
		
        return $value;

    }
	
	public function jsonNode($_xpath)
	{
		$_json = json_decode($this->o_response,true);
		
		$_exp = explode("/",$_xpath);
		
		$value = &$_json;
		
		foreach($_exp as $key)
		{
			$value = &$value[$key];
		}
		
		return $value;
	}
	
	public function checkUrlScheme($_url)
	{
		$uri = parse_url($_url);
		
		$_url = isset($uri['scheme']) ? $_url : 'http://'.$_url;
		
		return $_url;
		
	}
	
	public function nodeNamespace($prefix)
    {
        $xml=new DOMDocument();
		
		$xml->loadXML($this->o_response);

		return $xml->documentElement->lookupnamespaceURI($prefix);
	}
	
	public static function createUriQuery($_uri,$_query)
    {
        $uri = parse_url($_uri);

        $uriQuery =explode("&",$uri["query"]);
		
		$_newQuery=array();
		
		$_newUri[] = isset($uri['scheme']) ? $uri['scheme'] . '://' : '';
		
		$_newUri[] = isset($uri['host']) ? $uri['host'] : '';
		
		$_newUri[] = isset($uri['port']) ? ':'.$uri['port']:'';
		
		$_newUri[] = isset($uri['path']) ? $uri['path'] : '';
		
        if ($_query != null)
        {
            foreach($uriQuery as $key=>$value)
            {
                $queryVars = explode("=",$value);
             
                $queryVarsField = $queryVars[0];
             
                if (((strtolower($queryVarsField)!= "request") && (strtolower($queryVarsField)!= "service")) && (!empty($value)) && (!empty($queryVarsField)))
                {
                    $_newQuery[] = $value;
                }
            }

            foreach($_query as $key=>$value)
            {
                $_newQuery[] =$key."=".$value;

            }
        }
		

		$_newUri=implode("",$_newUri);
		
		if(count($_newQuery)>0)
		{
			$_newUri=$_newUri."?".implode("&",$_newQuery);
		}
		
		$_newUri=str_replace(" ","+",$_newUri);
		
        return $_newUri;
    }
	
}


?>