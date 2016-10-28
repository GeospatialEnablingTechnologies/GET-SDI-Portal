<?php

function __autoload($class_name) {
    require strtolower($class_name).'.php';
}

set_time_limit(120);

error_reporting(0);

session_start();

function removeCredentialsFromSession($_serviceUrl)
{
	unset($_SESSION["credentials"][$_serviceUrl]);
}

function addCredentialsToSession($_serviceUrl, $_username,$_password)
{
	
	if ((!empty($_username)) && (!empty($_password)))
	{
		
		if (strpos($_serviceUrl,"http")>0)
		{
			$url = parse_url($_serviceUrl);
			
			$_pathSplit=explode("/",$url["path"]);
			
			if (!empty($_pathSplit[1]))
			{
				$_path = "/".$_pathSplit[1];
			}
			
			$port = "";
	
			if (!empty($url["port"]))
			{
				$port = ":".$url["port"];
			}
			
			$_serviceUrl = $url["host"].$port.$_path;
		}
		
		$_SESSION["credentials"][$_serviceUrl]=array("username"=>$_username,"password"=>$_password);
		
		return true;
	}
	
	$url = parse_url($_serviceUrl);
	
	$_pathSplit=explode("/",$url["path"]);
			
	if (!empty($_pathSplit[1]))
	{
		$_path = "/".$_pathSplit[1];
	}
			
	$port = "";
	
	if (!empty($url["port"]))
	{
		$port = ":".$url["port"];
	}
			
	$_serviceUrl = $url["host"].$port.$_path;

	if(isset($_SESSION["credentials"][$_serviceUrl]))
	{
		return true;
	}
	
	return false;
}

class SDIPORTAL
{
	public $output;
	
	public $r_objects=array();
	
	private $_data;
	
	public function __construct($_data)
	{	
		$this->_data=$_data;
		
		switch($_REQUEST["proxy"])
		{
			case "getfeatures":
				$this->proxyRequest();
			break;
			
			case "proxy":
				$this->proxyRequest();
			break;
			
			case "dbf":
				$this->proxyDBFRequest();
			break;
			
			case "color":
				$this->proxyColorRequest();
			break;
			
			case "raw":
				$this->proxyRawRequest();
			break;
			
			case "db":
				$this->proxyDBRequest();
			break;
			
			case "pager":
				$this->proxyPager();
			break;
			
			default:
			
				header("Cache-Control: max-age=2592000");
		
				header("Content-type: application/json");
			
				$this->constructRequest();
				
				$this->output=json_encode($this->r_objects);
				
			break;
		
		}
	}
	
	public function proxyRequest()
	{
		$p = new PROXY();
			
		$url = explode("url=",$_SERVER["REQUEST_URI"]);

		$url=str_replace("??_t","?",$url[1]);
		
		$url=str_replace("?http","http",$url);
		
		if(isset($_REQUEST['URLDECODE']))
		{
			$url=urldecode($url);
		}
		
		$p->_url = $url;
			
		$p->_postData=$GLOBALS["HTTP_RAW_POST_DATA"];
			
		$p->get();
			
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
		
		$this->output=$p->o_response;		
	}
	
	public function proxyDBFRequest()
	{
		require("config.php");
		
		header("Content-type: text/plain; charset=ISO-8859-7;");
		
		$_acceptedExtensions = array("dbf");
		
		$_file = $_REQUEST["url"];
		
		if(!empty($_file))
		{
			$_fileExtension = pathinfo($_file, PATHINFO_EXTENSION);
			
			$_fileExtension = strtolower($_fileExtension);
			
			if(in_array($_fileExtension,$_acceptedExtensions))
			{
				readfile($_config["UPLOAD_FOLDER"].DIRECTORY_SEPARATOR.$_file);
			}
		}
	}
	
	public function proxyColorRequest()
	{
		$color=$_REQUEST["color"];
		
		$leftR = hexdec(substr($color,0,2));
		
		$leftG = hexdec(substr($color,2,2));
		
		$leftB = hexdec(substr($color,4,2));
		
		$im = imagecreate(17, 17);
			
		$white = imagecolorallocate($im, $leftR , $leftG, $leftB);
			
		if (!empty($border))
		{
			$leftBR = hexdec(substr($border,0,2));
			
			$leftBG = hexdec(substr($border,2,2));
			
			$leftBB = hexdec(substr($border,4,2));
		
			$borderRec = imagecolorallocate($im, $leftBR, $leftBG, $leftBB);
			
			if (!empty($borderWidth))
			{
				imagesetthickness($im, $borderWidth);
			}
			else
			{
				imagesetthickness($im, 2);
			}
		}
		else
		{
			imagesetthickness($im, 3);
			
			$borderRec = imagecolorallocate($im, 0xFF, 0xFF, 0xFF);
		}
			
		imagerectangle($im, 0, 0, 16, 16, $borderRec);
			
		header("Content-type: image/png");
			
		imagepng($im);
		
		imagedestroy($im);
	}
	
	public function proxyRawRequest()
	{
		$p = new PROXY();
			
		$url = explode("url=",$_SERVER["REQUEST_URI"]);
		
		$url=str_replace("??_t","?",$url[1]);
		
		$p->_url = $url;
		
		$p->get();
		
		$this->output=$p->o_response;
		
		if (!empty($_REQUEST['contenttype']))
		{
			$contenttype = @$_REQUEST['contenttype'];
				
			header("Content-type: " . $contenttype);
		}
	}
	
	public function proxyPager()
	{
		header("Content-type: application/json");
		
		$this->constructRequest();
			
		$this->output=json_encode(array("data"=>$this->r_objects));
	}
	
	public function constructRequest()
	{
        $jsonR = json_decode($this->_data);

        foreach ($jsonR as $key=>$objArr)
        {
            $_serviceType = $objArr->_serviceType;
			
			$_class_name = strtoupper($_serviceType);
			
			$_class_output = new $_class_name();

			$_class_output->get($objArr);

			$this->r_objects[]=$_class_output->output;

		}
	}
}

$sdi=new SDIPORTAL($_REQUEST["data"]);

echo $sdi->output;
?>