<?php

/*version message*/

include("../../../php_source/proxies/required.php");

$allowedExts = array("xml");

$output=array("success"=>"no");

session_start();

$sid=session_id();

foreach($_FILES as $key=>$value)
{	
	if (!empty($value["name"]))
	{
		$error="false";
		$reason="none";
		$storedPath="none";
		$filename="";
		$ext="";
		
		$extension = end(explode(".", $value["name"]));
		
		if (in_array(strtolower($extension), $allowedExts))
		{
			if ($value["error"] > 0)
			{

				$error="true";
			}
			else
			{
				
				$file_name=fileExists($sid,$value["name"],0);
			
				if (!is_dir("../tmp_uploads/".$sid))
				{
					mkdir("../tmp_uploads/".$sid, 0777);
						
				}
					
				move_uploaded_file($value["tmp_name"],"../tmp_uploads/".$sid."/".$file_name);
					
				$filename=$file_name;
					
				$ext=$extension;
					
				$storedPath=$geo_url."modules/wmc/tmp_uploads/".$sid."/".$file_name;
					
				$error="false";
				
			}
		}
		else
		{
			$error="true";
			
			$reason="wrong_extension";
		}
		
		$output["uploads"][]=array("error"=>$error,"reason"=>$reason,"path"=>$storedPath,"file"=>$filename,"ext"=>$ext);
	}
	
}

function fileExists($sid,$file_name,$i)
{
	
	if (file_exists("../tmp_uploads/".$sid."/".$file_name))
	{

		$subext=substr($file_name, -4);
		
		$subname=substr($file_name,0,strlen($file_name)-4);
		
		$file_name=$subname."_".$i.$subext;
		
		$i++;
		
		return fileExists($sid,$file_name,$i);
	}
	else
	{
		return $file_name;
	}
}

if (empty($output["uploads"]))
{
	$output["success"]="no";
}

session_destroy(); 

echo json_encode($output);
?>