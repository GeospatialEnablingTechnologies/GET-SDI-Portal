<?php

/*version message*/

	include("required.php");

	$url = $_SERVER["REQUEST_URI"];
	
	$layername=$_REQUEST["LAYER"];
	
	$url=explode("urlGraphic=",$url);
		
	$url=$url[1];
	
	$url=create_authentication_url($url,$_GET['serviceUsername'],$_GET['servicePassword']);
	
	$color=$_REQUEST["color"];
	$border=$_REQUEST["border"];
	$borderWidth=$_REQUEST["borderWidth"];

	if ($color=="")
	{
		$url=str_replace("\"","'",$url);
		
		$image=file_get_contents_safe($url,false);

		if ($image!="")
		{
			header('Content-Type: image/png');
			echo $image;
		}
		else
		{
			header('Content-Type: image/png');
			readfile('../../images/icon16.png');
		}
	}
	elseif($color=="raster")
	{
		header('Content-Type: image/png');
		readfile('../../images/icon16.png');
	}
	else
	{
		$leftR = hexdec(substr($color,0,2));
		$leftG = hexdec(substr($color,2,2));
		$leftB = hexdec(substr($color,4,2));
	
		$im = imagecreate(16, 16);
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
				imagesetthickness($im, 1);
			}
		}
		else
		{
			$borderRec = imagecolorallocate($im, $leftR, $leftG, $leftB);
		}
		
		imagerectangle($im, 0, 0, 15, 15, $borderRec);
		
		header("Content-type: image/png");
		
		imagepng($im);
		imagedestroy($im);
	}

?>