<?php

/*version message*/

	include("required.php");
	$url=$_SERVER["REQUEST_URI"];
  
	$url=explode("url=",$url);  
	$url=$url[1];

	$url=create_authentication_url($url,$_GET['serviceUsername'],$_GET['servicePassword']);

	header("Location: ".$url);


?>