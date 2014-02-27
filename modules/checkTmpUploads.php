<?php

/*version message*/

include("../php_source/proxies/required.php");

class checkTmpUploads
{
	function checkTmpUploads($data)
	{
		
		if ($GLOBALS["_tmp_uploadsDeleteOnExit"]==true)
		{
			if ($data["me"]=="true")
			{
				session_start();

				$sid=session_id();
			
				foreach($GLOBALS["_tmp_uploadsDeleteOnExitFolders"] as $key=>$value)
				{
					$folderPath=strtolower($value)."/tmp_uploads/".$sid;
					
					if (is_dir($folderPath)) 
					{
						
						if ($handle = opendir($folderPath)) 
						{
							while (false !== ($entry = readdir($handle))) {
								if ($entry != "." && $entry != "..") {
									
									unlink($folderPath."/".$entry);
								}
							}
							closedir($handle);
						}
						
						rmdir($folderPath);
					}
				}
				
				session_destroy(); 
			}
		}
	
	}

}

$chckTmp=new checkTmpUploads($_GET);

?>