<?php

class SERVICEOBJECT
{
	public $_serviceId=null;

	public $_tiled=false;
	
	public $_api;
	
	public $_bbox=null;
	
	public $_serviceUrl=null;
	
	public $_serviceDbf=null;
	
	public $_serviceShp=null;
	
	public $_serviceProxyUrl=null;
	
	public $_version=null;
	
	public $_username=null;
	
	public $_password=null;

    public $_featureInfoFormat = null;
	
	public $_isSecure=false;
	
	public $_isSecureLogged=false;
	
	public $_serviceType=null;
	
	public $_serviceTitle=null;
	
	public $_serviceAbstract=null;
	
	public $_serviceName=null;
	
	public $_servicePort=null;

    public $_layers = null;
	
	public $_supportedEPSG;

    public $_isVector = false;

    public $_isService = true;
	
	public $_responsible_party = "";
	
	public $_responsible_person = "";
	
	public $_responsible_position = "";
	
	public $_responsible_email = "";
	
	public $_responsible_fees = "";
	
	public $_responsible_access_constrains = "";

}

?>