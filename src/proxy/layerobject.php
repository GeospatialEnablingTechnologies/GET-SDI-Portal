<?php

class LAYEROBJECT
{
    public $_layerId = null;

    public $_serviceId = null;

    public $_isLoaded = false;

    public $_layerName = null;

    public $_layerTitle = null;

    public $_layerAbstract = null;

    public $_layerLegend = null;
	
	public $_dimension = null;
	
	public $_dimensionDefault = null;
	
	public $_elevation = null;
	
	public $_elevationDefault = null;

    public $_layerLegendSmall = null;

    public $_groupId = "";

    public $_isBaseLayer = false;

    public $_layerFormat = "image/png";

    public $_tiled = false;

    public $_singleTile = false;

    public $_transparent = true;

    public $_opacity = 1;

    public $_layer = null;

    public $_bboxMinX = null;

    public $_bboxMinY = null;

    public $_bboxMaxX = null;

    public $_bboxMaxY = null;

    public $_serviceObject;

    public $_visibility = true;

    public $_sld_body = null;

    public $_sld_url = null;

    public $_layerType = null;

    public $_isEdited = false;

    public $_attributesReorder = true;

    public $_canChangeEditSettings = true;

    public $_canChangeSearchSettings = true;

    public $_canCopy = true;

    public $_canTrace = true;

    public $_canSnapVertex = true;

    public $_canSnapEdge = true;

    public $_isVector = false;

    public $_isQueryable=false; //for feature info

    public $_isSearchable = false; //for search

    public $_isEditable = false;

    public $_isPrintable = false;

    public $_isSLDEditable = false;

    public $_supportedEPSG=null;

    public $_attributesFields=array();

    public $_nativeSRS;
	
	public $_geometryField;

    public $_scales;

    public $_loadedStatus = 0;

    public $_color;

    public $_extras = null;

    public $_featureInfoFormat = null;

    public $_cqlFilter = null;
	
	
		
}

?>