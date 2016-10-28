<?php

class RESPONSE
{
	//-1 no errors
    //0 serviceException
    //>0 http error code

    public $_errorStatus = -1;

    public $_errorDescription = "";

    public $_responseCode = "";

    public $_response;	

}

?>