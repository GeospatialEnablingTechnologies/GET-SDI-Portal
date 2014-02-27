<?php

/*version message*/

class deleteAtom
{
	var $output;

	function deleteAtom($data)
	{
		session_start();

		$sid=session_id();
		
		$filenameArr=explode('/',$data["atom"]);
		
		$filename=end($filenameArr);
		
		$pathKML="../tmp_uploads/".$sid."/".$filename;
		
		unlink($pathKML);
		
		session_destroy(); 
	
	}

}

$delKml=new deleteAtom($_POST);

?>