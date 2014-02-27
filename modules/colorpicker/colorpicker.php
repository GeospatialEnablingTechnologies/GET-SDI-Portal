<?php

include("../../php_source/proxies/required.php");

if ($_GET["color"]=="")
{
	$color="FF0000";
}
else
{
	$color=$_GET["color"];
}


?>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />	
		<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8" />
		<link rel="stylesheet" type="text/css" href="<?php echo $GLOBALS["_default_portal_url"];?>modules/colorpicker/css/colorpicker.css"/>
		<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/colorpicker/js/jquery.js"></script>
		<script type="text/javascript" src="<?php echo $GLOBALS["_default_portal_url"];?>modules/colorpicker/js/colorpicker.js"></script>
	</head>
	<body style="margin:0px;">
		 <p id="colorpickerHolder"></p>
		 <script>
		 
		 
		 $('#colorpickerHolder').ColorPicker({
			flat: true,
			onSubmit: function(hsb, hex, rgb, el) {
				
				$('#<?php echo $_GET["id"];?>', window.parent.document).val(hex);
				
				window.parent.closeColorPickerWindow();
			}
		});
		$('#colorpickerHolder').ColorPickerSetColor('<?php echo $color;?>');
		</script>
	</body>
</html>