<?php

/*version message*/

class deleteKML
{
	var $output;

	function deleteKML($data)
	{
		session_start();

		$sid=session_id();
		
		$filenameArr=explode('/',$data["georss"]);
		
		$filename=end($filenameArr);
		
		$pathKML="../tmp_uploads/".$sid."/".$filename;
		
		unlink($pathKML);
		
		session_destroy(); 
	
	}

}

$delKml=new deleteKML($_POST);

?>