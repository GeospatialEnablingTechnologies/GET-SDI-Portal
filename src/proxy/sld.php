<?php

class SLD
{
	public $output;

    public function get($objArr)
    {
        $_request = $objArr->_request;

        switch ($_request)
        {
			
			case "parseSLD":
				
				$this->output = $this->parseSLD($objArr);
				
				break;
        }

    }

    public function parseSLD($objArr)
    {
		require("config.php");
	
		$p = new PROXY();
		
        if ($objArr->_sldIsUrl == true)
        {
			$p->_url = $this->createGetSLDUri($objArr->_serviceUrl);

			$p->_username = $objArr->_username;

			$p->_password = $objArr->_password;

			$p->get();

        }else
        {
			$p->o_response = $objArr->_sldBody;
			
        }

        $r = new RESPONSE();

        $r->_responseCode = $p->o_responseCode;

        $version = $p->xmlNode("string(//@version)");

		$section = $_config["SLD_".$version];
	
        $countRules = $p->xmlNode($section["_sldRules"]);

        $geometryType = "";

        $xml=new DOMDocument();
			
		$xml->loadXML($p->o_response);
			
		$xpath = new DOMXPath($xml);
		
		foreach($_config["NAMESPACES"] as $key=>$value)
		{
			$xpath->registerNamespace($key,$value);
		}
        
		$_sldRules = array();
		
        for ($i=1;$i<=$countRules;$i++)
        {
			$_sldGraphicWellKnownName = "";

			$nodes = $xpath->query(str_replace("[]","[".$i."]",$section["_sldRuleNode"]));
			
			foreach ($nodes as $node) 
			{
				
				foreach($node->childNodes as $n)
				{
					
					switch ($n->localName)
					{
						case "PointSymbolizer":

							$_sldGraphicWellKnownName = $p->xmlNode(str_replace("[]","[".$i."]",$section["_sldRulePointStyle"]));  
							
							$geometryType = "PointSymbolizer";

							break;

						case "PolygonSymbolizer":

							$_sldGraphicWellKnownName = $p->xmlNode(str_replace("[]","[".$i."]",$section["_sldGraphicWellKnownName"])); 

							$geometryType = "PolygonSymbolizer";

							break;

						case "LineSymbolizer":

							$geometryType = "LineSymbolizer";

							break;
					}
				}
			}
			
			$_sldFillColor = "_sldRuleFillColor";

			$_sldFillOpacity = "_sldRuleFillOpacity";

			if ($_sldGraphicWellKnownName != "")
			{
				$_sldFillColor = "_sldRuleGraphicFillColor";

				$_sldFillOpacity = "_sldRuleGraphicFillOpacity";
			}

			$r_sld=array();

			$_SLDObject=new sldObject();
			
			$_SLDObject->_sldRuleName = $p->xmlNode(str_replace("[]","[".$i."]",$section["_sldRuleName"])); 

			$_SLDObject->_sldRuleTitle = $p->xmlNode(str_replace("[]","[".$i."]",$section["_sldRuleTitle"])); 

			$_SLDObject->_sldRuleAbstract = $p->xmlNode(str_replace("[]","[".$i."]",$section["_sldRuleAbstract"])); 

			$_SLDObject->_sldRuleGeometryType = $geometryType;

			$_SLDObject->_sldIsGraphicFill = "";

			$_SLDObject->_sldRulePointStyle = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRuleName"]))); 

			$_SLDObject->_sldRulePointColor = str_replace("#","",$p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointColor"])))); 

			$_SLDObject->_sldRulePointOpacity = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointOpacity"]))); 

			$_SLDObject->_sldRulePointSize = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointSize"]))); 
			
			$_SLDObject->_sldRulePointRotation = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointRotation"])));

			$_SLDObject->_sldStrokeDashArray = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRuleStrokeDashArray"])));

			$_SLDObject->_sldStrokeColor = str_replace("#","",$p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRuleStrokeColor"]))));

			$_SLDObject->_sldStrokeWidth =  $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRuleStrokeWidth"])));

			$_SLDObject->_sldStrokeOpacity = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRuleStrokeOpacity"])));

			$_SLDObject->_sldGraphicWellKnownName = $_sldGraphicWellKnownName;

			$_SLDObject->_sldFillColor =str_replace("#","", $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section[$_sldFillColor]))));

			$_SLDObject->_sldFillOpacity = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section[$_sldFillOpacity])));

			$_SLDObject->_sldRulePointStrokeDashArray = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointStrokeDashArray"])));

			$_SLDObject->_sldRulePointStrokeColor = $p->xmlNode(str_replace("#","",str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointStrokeColor"]))));

			$_SLDObject->_sldRulePointStrokeWidth = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointStrokeWidth"])));

			$_SLDObject->_sldRulePointStrokeOpacity = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldRulePointStrokeOpacity"])));

			$_SLDObject->_sldTextSymbolizerAttribute = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldTextSymbolizerProperty"])));

			$_SLDObject->_sldTextSymbolizerFontFamily =  $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldTextSymbolizerFontFamily"])));

			$_SLDObject->_sldTextSymbolizerFontSize = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldTextSymbolizerFontSize"])));

			$_SLDObject->_sldTextSymbolizerFontColor = $p->xmlNode(str_replace("{_symbolizer}", $geometryType,str_replace("[]","[".$i."]",$section["_sldTextSymbolizerFontColor"])));
			
			$_filter =  $xpath->query(str_replace("[]","[".$i."]",$section["_sldFilter"]));
			
			$_filterArr = array();
			
			foreach ($_filter as $node) 
			{
				foreach($node->childNodes as $_conditions)
				{
					foreach($_conditions->childNodes as $n)
					{
						$_filterObject = new SLDFilter();
					
						$_filterObject->_filterPropertyCondition=$n->localName;
						
						$conditionSymbol = "";
						
						switch(strtolower($n->localName))
						{
							case "propertyisequalto":
								$conditionSymbol  = "=";
							break;
							
							case "propertyisnotequalto":
								$conditionSymbol = "!=";
							break;
							
							case "propertyisgreaterthanorequalto":
								$conditionSymbol = ">=";
							break;
							
							case "propertyisgreaterthan":
							
								$conditionSymbol = ">";
							break;
							
							case "propertyislessthanorequalto":
								$conditionSymbol = "<=";
							break;
							
							case "propertyislessthan":
							
								$conditionSymbol = "<";
							break;
							
							case "propertyislike":
								$conditionSymbol = "LIKE";
							break;
							
							case "propertyisnull":
								$conditionSymbol = "IS NULL";
							break;
						
						}
	
						$_filterObject->_filterPropertyConditionSymbol = $conditionSymbol;
	
						foreach ($n->childNodes as $prop)
						{
							if ($prop->localName == "PropertyName")
							{
								$_filterObject->_filterPropertyName=$prop->nodeValue;
							}
							if ($prop->localName == "Literal")
							{
								$_filterObject->_filterPropertyValue=$prop->nodeValue;
							}
						}
						
						$_filterArr[]=$_filterObject;
					}
				}
				
			}
			
			$_SLDObject->_sldFilterObject = $_filterArr;
			
			$_sldRules[] = $_SLDObject;
        }

		$_SLDResponse=new SLDResponse();
		
		$_SLDResponse->_sldName=$objArr->_layerName;
		
		$_SLDResponse->_sldObjects=$_sldRules;
		
		$r->_response = $_SLDResponse;
		
        return $r;

    }

    public function createGetSLDUri($objArr)
    {

        $_query["REQUEST"]="GETSTYLES";

        $_query["SERVICE"]="WMS";

        $_query["LAYERS"]=$objArr->_layerName;

		return PROXY::createUriQuery($objArr->_serviceUrl, $_query);
    }

    }

?>