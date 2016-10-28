<?php

class UPLOADFILE
{
	
	var $_uploadedFile = "";
	
	var $_inValidExt = "";
	
	var $_tmpFolder = "";
	
	var $_sessionId = "";
	
	var $_uploadFolder = "";
	
	
	var $_inFileName = "";
	
	var $_inFileType = "";
	
	var $_inFileBaseName = "";
	
	var $_inFileTmpName = "";
	
	var $_inFileExtension = "";
	
	
	
	var $outFileUrl = "";
	
	var $outFileUri = "";
	
	var $outFileName = "";
	
	var $outFileType = "";
	
	var $outFileExtension = "";
	
	var $outError = false;
	
	var $outErrorCode = -1;
	
	var $outMsg = "";
	
	function __construct($_in)
	{
	
		$this->_inValidExt = $_in["ext"];
	
		$this->_uploadedFile = $_in["file"];
		
		$this->_inFileName = $this->_uploadedFile["name"];
	
		$_ext = pathinfo($this->_inFileName);
		
		$this->_inFileExtension = $_ext['extension'];
		
		$this->_inFileBaseName = $_ext['filename'];
		
		if ($this->_inValidExt == $this->_inFileExtension)
		{
			$this->_inFileTmpName = $this->_uploadedFile["tmp_name"];
			
			$this->_inFileType = $this->_uploadedFile["type"];
			
			require("config.php");
			
			$this->_uploadFolder = $_config["UPLOAD_FOLDER"];
			
		}
	}
	
	function upload()
	{
		
		if ($this->fileExists())
		{
			move_uploaded_file($this->_inFileTmpName,$this->_uploadFolder.DIRECTORY_SEPARATOR.$this->_inFileName);
			
			$this->outFileName = $this->_inFileName;
			
			$this->outFileUrl = $this->_inFileName;
			
			$this->outFileUri = $this->_uploadFolder.DIRECTORY_SEPARATOR.$this->_inFileName;
			
		}
		
	}
	
	function fileExists($count = 1)
	{
	
		if (file_exists($this->_uploadFolder.DIRECTORY_SEPARATOR.$this->_inFileName))
		{
			$this->_inFileName = $this->_inFileBaseName."_".$count.".".$this->_inFileExtension;
			
			$count++;
			
			return $this->fileExists($count);
			
		}
		
		return true;
	}


}


?>