<?php
	
error_reporting(0);

session_destroy();

require(dirname(__DIR__).DIRECTORY_SEPARATOR."src".DIRECTORY_SEPARATOR."proxy".DIRECTORY_SEPARATOR."proxy.php");

class Login
{
	var $output="";
	
	var $_loginUrl = "http://localhost:8080/geoserver/j_acegi_security_check";

	var $_geofenceUrl = "http://localhost:8080/geoserver/geofence/";

	var $_userGroup = array();

	var $_userName = "";

	var $_rules = array();

	function Login()
	{
		$username = $_POST["username"];

		$password = $_POST["password"];

		if ((!empty($username)) && (!empty($password)))
		{
			session_start();

			$_p = new PROXY();

			$_p->_url = $this->_loginUrl;

			$url = parse_url($_p->_url);

			$_pathSplit=explode("/",$url["path"]);

			if (!empty($_pathSplit[1]))
			{
				$_path = "/".$_pathSplit[1];
			}

			$port = "";

			if (!empty($url["port"]))
			{
				$port = ":".$url["port"];
			}

			$_serviceUrl = $url["host"].$port.$_path;

			$_SESSION["credentials"][$_serviceUrl]["username"] = $username;

			$_SESSION["credentials"][$_serviceUrl]["password"] = $password;

			$_p->get();

			if($_p->o_responseCode=="200")
			{
				$this->_userName = $username;

				$this->getGeofenceUserGroup();

				$this->getGeofenceGroupRules();

				$this->getGeofenceUserRules();

				$this->output=$this->valid();

			}else{

				$this->output=$this->invalid();
			}

		}else{

			$this->output=$this->invalid();
		}
		
	}
	
	function createConfigPolicyFunction()
	{
		$_notVisibleLayers = array();
		
		$_editableLayers = array();
		
		foreach($this->_rules as $_key=>$_value)
		{
			if (strtolower($_value["request"])=="transaction")
			{
				if (strtolower($_value["grant"])=="allow")
				{
					if (!empty($_value["layer"]))
					{
						$_editableLayers[] = $_value["workspace"].":".$_value["layer"];
					}else{
						$_editableLayers[] = "all";
					}
				}
			}else{
				
				if (strtolower($_value["grant"])=="deny")
				{
					if (!empty($_value["layer"]))
					{
						$_notVisibleLayers[] = $_value["workspace"].":".$_value["layer"];
					}
				}
			}
		}
		
		$_out="function fn_setConfigPolicy(){";
		
		$_out.="
			var _notVisibleLayers = ".json_encode($_notVisibleLayers)."
			
			var _editableLayers = ".json_encode($_editableLayers)."
		
			Ext.each(_config_load_layers,function(item)
			{
				if (typeof item._layerName!==\"undefined\")
				{
					if (item._serviceType == \"WFS\")
					{
						var _indexAll = _editableLayers.indexOf(\"all\");
						
						Ext.each(item._layerName,function(layerName, _itemIndex)
						{
							var _index = _editableLayers.indexOf(layerName);
							
							if (_indexAll<0)
							{							
								if (_index<0)
								{
									item._layerName[_itemIndex] = null;
								}
							}
						});
						
						Ext.each(item._perLayerProperties, function(_layerProperty){
							
							var _index = _editableLayers.indexOf(_layerProperty._layerName);
							
							if (_indexAll<0)
							{								
								if (_index>=0)
								{
									_layerProperty._isEditable = true;
									
								}else{
									_layerProperty._isEditable = false;
								}
							}else{
								_layerProperty._isEditable = true;
							}
						});
						
					}else{
						
						Ext.each(_notVisibleLayers,function(layerName)
						{
							var _index = item._layerName.indexOf(layerName);
							
							if (_index>=0)
							{
								//Ext.Array.remove(item._layerName,item._layerName[_index]);
								
								item._layerName[_index] = null;
							}
						});
					}
					
					Ext.Array.clean(item._layerName);
				}
				
			});";
			
		$_out.="}";
		
		return $_out;
	}
	
	function getGeofenceUserGroup()
	{
		$_p = new PROXY();
		
		$_p->_url = $this->_geofenceUrl."rest/users/name/".$this->_userName;
		
		$_p->get();
		
		if($_p->o_responseCode=="200")
		{
			$_countGroups = $_p->xmlNode("string(count(//User/groups/group))");
			
			for($i=1;$i<=$_countGroups;$i++)
			{
				$this->_userGroup[]=$_p->xmlNode("string(//User/groups/group[".$i."]/name/text())");
			}
		}
		
		return;
	}
	
	function getGeofenceGroupRules()
	{
		foreach($this->_userGroup as $_key=>$_value)
		{
			$_p = new PROXY();
			
			$_p->_url = $this->_geofenceUrl."rest/rules/?groupName=".urlencode($_value)."&groupAny=false";
		
			$_p->get();
		
			if($_p->o_responseCode=="200")
			{
				$_countGroupRules = $_p->xmlNode("string(count(//RuleList/rule))");
				
				for($i=1;$i<=$_countGroupRules;$i++)
				{
					$_ruleId = $_p->xmlNode("string(//RuleList/rule[".$i."]/id/text())");
					
					$_rulePriority = $_p->xmlNode("string(//RuleList/rule[".$i."]/priority/text())");
					
					$_ruleGrant = $_p->xmlNode("string(//RuleList/rule[".$i."]/@grant)");
					
					$_ruleService = $_p->xmlNode("string(//RuleList/rule[".$i."]/service/text())");
					
					$_ruleRequest = $_p->xmlNode("string(//RuleList/rule[".$i."]/request/text())");
					
					$_ruleWorkspace = $_p->xmlNode("string(//RuleList/rule[".$i."]/workspace/text())");
					
					$_ruleLayer = $_p->xmlNode("string(//RuleList/rule[".$i."]/layer/text())");
					
					$this->_rules[$_rulePriority] = array(
						"id"=>$_ruleId,
						"priority"=>$_rulePriority,
						"grant"=>$_ruleGrant,
						"service"=>$_ruleService,
						"request"=>$_ruleRequest,
						"workspace"=>$_ruleWorkspace,
						"layer"=>$_ruleLayer
					);
				}
			}
		}
		
	}
	
	function getGeofenceUserRules()
	{
		$_p = new PROXY();
		
		$_p->_url = $this->_geofenceUrl."rest/rules/?userName=".$this->_userName."&userAny=false";
		
		$_p->get();
		
		if($_p->o_responseCode=="200")
		{
			$_countUserRules = $_p->xmlNode("string(count(//RuleList/rule))");
				
			for($i=1;$i<=$_countUserRules;$i++)
			{
				$_ruleId = $_p->xmlNode("string(//RuleList/rule[".$i."]/id/text())");
				
				$_rulePriority = $_p->xmlNode("string(//RuleList/rule[".$i."]/priority/text())");
				
				$_ruleGrant = $_p->xmlNode("string(//RuleList/rule[".$i."]/@grant)");
				
				$_ruleService = $_p->xmlNode("string(//RuleList/rule[".$i."]/service/text())");
				
				$_ruleRequest = $_p->xmlNode("string(//RuleList/rule[".$i."]/request/text())");
				
				$_ruleWorkspace = $_p->xmlNode("string(//RuleList/rule[".$i."]/workspace/text())");
				
				$_ruleLayer = $_p->xmlNode("string(//RuleList/rule[".$i."]/layer/text())");
				
				$this->_rules[$_rulePriority] = array(
					"id"=>$_ruleId,
					"priority"=>$_rulePriority,
					"grant"=>$_ruleGrant,
					"service"=>$_ruleService,
					"request"=>$_ruleRequest,
					"workspace"=>$_ruleWorkspace,
					"layer"=>$_ruleLayer
				);
			}
		}
		
	}
	
	function valid()
	{
		$output='<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
				<style>
					html, body { height:100%; }
				</style>
				<script>'.
					$this->createConfigPolicyFunction()
				.'</script>
				<script type="text/javascript" src="js/loader.js"></script>
			</head>
		</html>';
		
		return $output;
	}
	
	function invalid()
	{
		$output='<html>
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
				<link href="http://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
				<style>
					body {
                        <!--background: url("http://www.getmap.eu/wp-content/uploads/2016/02/sdi_portal_sshot_1.png") no-repeat fixed center center;-->
                        background-size: cover;
                        font-family: Montserrat;
                    }
					
					#sdilogo, #loginform{
						float:left;
					}
					
					#loginform{
						margin-top: 50px;
					}

                    .logo {
                        width: 475px;
                        height: 142px;
                        background: url("../images/logos/10years.png") no-repeat;
                        margin: 30px auto;
                    }

                    .login-block {
                        width: 460px;
                        padding: 20px;
                        background: #fff;
                        border-radius: 5px;
                        border: 3px solid #50757C;
                        margin: 0 auto;
                    }

                    .login-block h1 {
                        text-align: center;
                        color: #000;
                        font-size: 18px;
                        text-transform: uppercase;
                        margin-top: 0;
                        margin-bottom: 20px;
                    }

                    .login-block input {
                        width: 100%;
                        height: 42px;
                        box-sizing: border-box;
                        border-radius: 5px;
                        border: 1px solid #ccc;
                        margin-bottom: 20px;
                        font-size: 14px;
                        font-family: Montserrat;
                        padding: 0 20px 0 50px;
                        outline: none;
                    }

                    .login-block input#username {
                        background: #fff url("http://i.imgur.com/u0XmBmv.png") 20px top no-repeat;
                        background-size: 16px 80px;
                    }

                    .login-block input#username:focus {
                        background: #fff url("http://i.imgur.com/u0XmBmv.png") 20px bottom no-repeat;
                        background-size: 16px 80px;
                    }

                    .login-block input#password {
                        background: #fff url("http://i.imgur.com/Qf83FTt.png") 20px top no-repeat;
                        background-size: 16px 80px;
                    }

                    .login-block input#password:focus {
                        background: #fff url("http://i.imgur.com/Qf83FTt.png") 20px bottom no-repeat;
                        background-size: 16px 80px;
                    }

                    .login-block input:active, .login-block input:focus {
                        border: 1px solid #ff656c;
                    }

                    .login-block .button {
                        width: 100%;
                        height: 40px;
                        background: #50757C;
                        box-sizing: border-box;
                        border-radius: 5px;
                        border: 1px solid #50757C;
                        color: #fff;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 14px;
                        font-family: Montserrat;
                        outline: none;
                        cursor: pointer;
                    }

                    .login-block .button:hover {
                        background: #94B45F;
                    }
				</style>
			</head>
			<body bgcolor="#50757C">
				
				<div id="sdilogo">
					<img src="http://www.getmap.eu/wp-content/uploads/2016/02/sdi_portal_sshot_1.png"/>
				</div>
				<div id="loginform">
					
					<div class="login-block">
						<div class="logo"></div>					
						<h1>Login</h1>
						<form name="login" method="post">
											<table align="center">
												<tr>
													<td colspan="2">

													</td>
												</tr>
												<tr align="center">
													<td colspan="2">
														<input type="text" name="username" placeholder="Username" id="username"/>
													</td>
												</tr>
												<tr align="center">
													<td colspan="2">
														<input type="password" name="password"  placeholder="Password" id="password"/>
													</td>
												</tr>
												<tr align="center">
													<td >
														<input type="reset" class="button" value="Clear"/>
													</td>
													<td >
														<input type="submit" class="button" value="Login"/>
													</td>
												</tr>
											</table>
										</form>

					</div>
				</div>
			</body>
		</html>';
		
		return $output;
	}

}

$l=new Login();

echo $l->output;

?>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	</head>
</html>