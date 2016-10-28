<?php


class PRINTCLASS
{

    public $output;

    public function get($objArr)
    {
		require("config.php");
			
        $_data = $objArr->_html;

		$section = $_config["PRINT"];
		
        $_tmpFolder = $section["_tmpFolder"];

        $_wkexe = $section["_pathToWkhtml"];
		
		session_start();

        $sessionId = session_id();

        $_htmlFile=$_tmpFolder.$sessionId.".html";
	
		$fh = fopen($_htmlFile,'w') or die("can't open file");
		
        fwrite($fh, $_data);
		
		fclose($fh);
		
		$_outputFile = $_tmpFolder.$sessionId.".".$section["_outExtension"];
		
		$_outputWWWFile = $section["_tmpWWWFolder"].$sessionId.".".$section["_outExtension"];
		
		$execCmd=$section["_pathToWkhtml"]." ".$section["_arguments"]." ".$_htmlFile." ".$_outputFile;

		exec($execCmd,$_printFile);
		
		$r = new RESPONSE();
		
		$r->_response = $_outputWWWFile;
		
		$this->output=$r;

    }

}

?>