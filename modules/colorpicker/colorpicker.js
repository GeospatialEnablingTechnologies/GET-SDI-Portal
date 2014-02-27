var colorpickerWindow;

function showColorpickerWindow(colorpickerFiredId,colorpickerDefaultColor)
{
	colorpickerWindow=new Ext.Window({
		width:365,
		height:200,
		modal:true,
		resizable:false,
		id:'thematicLayerWindowColorId',
		title:thematicLayerWindowColorTitle,
		plain:true,
		html:"<iframe src='"+getsdiportal_URI+"modules/colorpicker/colorpicker.php?id="+colorpickerFiredId+"&color="+colorpickerDefaultColor+"' height='200px' width='360px' frameborder='no'></iframe>"
	});

	colorpickerWindow.show();
}

function closeColorPickerWindow()
{
	colorpickerWindow.close();

}

