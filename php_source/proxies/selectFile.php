<?php

/*version message*/

$lang=$_GET["lang"];

$file=$_GET["file"];

switch($lang)
{

	case "EN":
	if ($file=="help")
	{
		header("Location: ../../help/GETSDIPortalv3.0_Help_EN_v1.0.pdf");
	}
	if ($file=="about")
	{
		header("Location: ../../help/about_en_v3.pdf");
	}
	break;

	default:
	if ($file=="help")
	{
		header("Location: ../../help/GETSDIPortalv3.0_Help_GR_v1.0.pdf");
	}
	if ($file=="about")
	{
		header("Location: ../../help/about_gr_v3.pdf");
	}	
	break;
	
}



?>