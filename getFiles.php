<?php

session_start();

$nodes = array();

$path = isset($_REQUEST['path'])&&$_REQUEST['path'] == 'files' ? '/files' : '';

$node = isset($_REQUEST['node']) ? $_REQUEST['node'] : '';

$directory = $path.urldecode($node);

if (is_dir($directory)){

    $d = dir($directory);
	
    while($f = $d->read()){
		
		$folder=$f;
		
		$folder = str_replace("./","",$folder);
		
		if (($folder!="..") && ($folder!="."))
		{
			
			$st = $node.'/'.$f;
			if(isset($_SESSION['credentials'])){
			    $st = '../'.$node.'/'.$f;
			}
			else {
			    $st = $node.'/'.$f;
			}
	
			if(is_dir($directory.'/'.$folder)){
				$nodes[] = array(
					'text' => $f,
					'id'   => $node.'/'.$f,
					'cls'  => 'folder'
				);
			} else {
				$nodes[] = array(
					'text' => $f,
					'id'   => $st,
					'leaf' => true,
					'cls'  => 'file'
				);
			}
		}
    }
    $d->close();
}

sort($nodes);

echo json_encode($nodes);


?>
