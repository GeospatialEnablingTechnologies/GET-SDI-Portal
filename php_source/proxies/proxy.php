<?php

/*version message*/

include("required.php");

set_time_limit(120);

class proxy
{
	var $url;
	
	var $path;
	
	var $port=80;
	
	var $host="localhost"; 
	
	var $error_Num;
	
	var $error_Msg;
	
	var $timeout=120;
	
	var $post_data;
	
	var $proxySocket;
	
	var $return_data_from_curl;
	
	var $return_clean_data_from_curl;
	
	var $secureUsernameDec;
	
	var $securePasswordDec;

	function proxy()
	{
		if(array_key_exists('HTTP_SERVERURL', $_SERVER))
		{ 
			$this->url=$_SERVER['HTTP_SERVERURL']; 
			
		}else{ 
		
			$request_url=$_SERVER["REQUEST_URI"];
	  
			$request_url=explode("url=",$request_url);
	  
			$this->url=($request_url[1]);  

		}	
		
		$this->url=create_authentication_url($this->url,$_GET['serviceUsername'],$_GET['servicePassword']);
		
		$parseURL = parse_url($this->url);
		
		if (@$parseURL["host"]!="")
		{
			$this->host = @$parseURL["host"];
		}
		if (@$parseURL["port"]!="")
		{
			$this->port = @$parseURL["port"];
		}
		if (@$parseURL["path"])
		{
			$this->path = @$parseURL["path"] . "?" . @$parseURL["query"];
			
			
		}
		
		$this->post_data = @$GLOBALS["HTTP_RAW_POST_DATA"];
		
		if (empty($this->post_Data))
		{
			$this->proxyCurlSendRequest();
			
			$this->return_clean_data_from_curl=$this->return_data_from_curl;
		}
		else
		{
			if ($this->proxyConnect())
			{
				$this->return_clean_data_from_curl=$this->proxyRequest();
			}
		}
		
	}
	
	
	
	function proxyConnect()
	{
		$this->proxySocket=fsockopen($this->host,$this->port,$this->error_Num,$this->error_Msg,$this->timeout);
		
		if(!$this->proxySocket) 
		{
			return false;
		}
		else
		{
			return true; 
		}
	}
	
	function proxyRequest()
	{
		fwrite($this->proxySocket, 
			"POST ".$this->path." HTTP/1.0\r\n". 
			"Host:$this->host\r\n". 
			"User-Agent: \r\n". 
			"Content-Type: application/xml\r\n". 
			"Content-Length: ".strlen($this->post_data). 
			"\r\n". 
			"\r\n".$this->post_data. 
			"\r\n"); 
	  
		while(!feof($this->proxySocket))
		{
			$return_data.= fgets($this->proxySocket, 4096); 
		}
		
		fclose($this->proxySocket);
		
		return $return_data; 
	
	}
	
	
	function proxyCurlSendRequest()
	{
		
		$this->return_data_from_curl=file_get_contents_safe($this->url,false);
		
		return;
	}
}

$contenttype = @$_REQUEST['FORMAT'];

if(empty($contenttype))
{
	$contenttype = "text/xml";
}


if (isset($_REQUEST["nocache"]))
{
	$seconds_to_cache= -1000;
}
else
{
	$seconds_to_cache = 3600;
}

$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";

header("Expires: $ts");

header("Pragma: cache");

header("Cache-Control: max-age=$seconds_to_cache");

header("Content-type: " . $contenttype);

$proxyClass=new proxy();

$result=$proxyClass->return_clean_data_from_curl;

if ($contenttype=="text/xml")
{
	$len=strlen($result);

	$pos = strpos($result, "<");

	if($pos > 1) {
	  $result = substr($result, $pos, $len);
	}
}
$result=str_replace("xmlns:xml","xms",$result);

echo $result;
?>