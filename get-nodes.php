<?php

$nodes = array();

$path = isset($_REQUEST['path'])&&$_REQUEST['path'] == 'files' ? '/files' : '';

$node = isset($_REQUEST['node']) ? $_REQUEST['node'] : '';

$directory = $path.urldecode(iconv("UTF-8","ISO-8859-7",$node));

$directory=str_replace("..","",$directory);

if (is_dir($directory)){

    $d = dir($directory);
    while($f = $d->read()){
		
		$folder=$f;
		if (($folder!="..") && ($folder!="."))
		{
			$f=iconv("ISO-8859-7","UTF-8",$f);
			if(is_dir($directory.'/'.$folder)){
				$nodes[] = array(
					'text' => $f,
					'id'   => $node.'/'.$f,
					'cls'  => 'folder'
				);
			} else {
				$nodes[] = array(
					'text' => $f,
					'id'   => $node.'/'.$f,
					'leaf' => true,
					'cls'  => 'file'
				);
			}
		}
    }
    $d->close();
}

echo json_encode($nodes);


?>