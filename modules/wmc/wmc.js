/*version message*/

var wmcAjax_Request;
var wmc_WMS_count=0;

var wmc_WMS_services=new Array();
var wmc_WMS_Layers=new Array();


var wmc_store= new Ext.data.ArrayStore({
	fields: [
    {name: 'wmc_Title'},
	{name: 'wmc_Path'}
  ]
});

var sm_wmc = new Ext.grid.CheckboxSelectionModel({singleSelect:true});

var wmc_store_columns=new Ext.grid.ColumnModel([
	sm_wmc,
	{header:wmc_Name_column_Title, dataIndex: "wmc_Title", sortable: true,width:460},
	{dataIndex: "wmc_Path", sortable: true,hidden:true}
	
]);

var wmc_form=new Ext.Panel({
	title:wmc_service_title,
	region:'center',
	hidden:true,
	autoHeight:true,
	border:false,
	items:  [{ 
		xtype:'form',
		height:60,
		id:'wmc_upload_form',
		fileUpload: true,
		isUpload: true,
		method:'POST',
		enctype:'multipart/form-data',
		items:[
			{xtype: 'fileuploadfield',
			name:'url_wmc',
			id:'url_id_wmc',
			anchor:'100%',
			fieldLabel:wmc_url,
			width:300
			}]
		},{
			xtype:'toolbar',
			anchor:'100%',
			items:['->',
				{xtype:'tbbutton',
				text:wmc_form_save_to_list,
				iconCls:'mapTree_add16',
				handler:function(){
					if (wmc_ValidateUploadFile())
					{
						if(Ext.getCmp('wmc_upload_form').getForm().isValid()){
							Ext.getCmp('wmc_upload_form').getForm().submit({
								url: 'modules/wmc/php/upload_wmc.php',
								waitMsg: 'Uploading...',
								submitEmptyText:false,
								success: function(upload_form, action){
									
									var json=Ext.util.JSON.decode(action.response.responseText);
									
									var uploads=json.uploads;
									
									var wmc_tmp_Title=uploads[0].file;
									var wmc_tmp_Path=uploads[0].path;
									
									TaskLocation = Ext.data.Record.create([
										{name: "wmc_Title", type:"string"},
										{name: "wmc_Path", type:"string"}
									]);
									
									var record = new TaskLocation({
										wmc_Title:wmc_tmp_Title.toString(),
										wmc_Path:wmc_tmp_Path.toString()
									});
										
									wmc_store.add(record);
							
									wmc_store.commitChanges();

									Ext.getCmp('wmc_grid_services').reconfigure(wmc_store,wmc_store_columns);
									
									Ext.getCmp('wmc_upload_form').getForm().reset();
									
									
								},
								failure: function(){
									
								}
							});
						}
					}
					
				}
			}
			]},{
			xtype:'grid',
			id:'wmc_grid_services',
			title:wmc_list_name,
			loadMask:true,
			autoScroll:true,
			sm: sm_wmc,
			height:414,
			columnLines: true,
			ds:wmc_store,
			cm:wmc_store_columns,
			bbar:['->',
				{
					xtype:'button',
					text:wmc_add_btn,
					iconCls:'mapTree_add16',
					handler:function(){
					
						Ext.getCmp('wmc_grid_services').getSelectionModel().each(function(record) {
						
							if(typeof wmcAjax_Request!=="undefined")
							{
								Ext.Ajax.abort(wmcAjax_Request);
							}
							
							var wmc_url=record.get("wmc_Path");
					
							wmc_WMS_services=new Array();
							wmc_WMS_Layers=new Array();
							wmc_WMS_count=0;
					
							wmcAjax_Request=Ext.Ajax.request({
								url:"modules/wmc/php/wmc_class.php",
								timeout:5000,
								params:{url:wmc_url},
								success:function(result,response)
								{
									
									var json=Ext.util.JSON.decode(result.responseText);
								
									var i=0;
								
									
								
									for(var k in json)
									{
									
										var layers=json[k];
										
										wmc_WMS_services[i]=k.toString();
										wmc_WMS_Layers[i]=layers.toString();
										
										i++;
									}
									
									var tobeRemoved=new Array();
									var removeLayers=new Array();
									
									removeLayers=wmc_removeAllLayersFromMap(Ext.getCmp('layerTree_layers').root,tobeRemoved);
									
									Ext.each(removeLayers, function(value) {
										
										removeLayerMap(value);
					
										count_layers_TreeLayer=map.layers.length;
														
										nodeCheck_TreeLayers(Ext.getCmp('layerTree_layers').root);
									
									});
									
									setTimeout(function(){addWMCServers(wmc_WMS_count);},600);
								
								},
								failure:function(){
								
								
								}
							});
							
						
						});
					
					}
				}
			]}]
});


function wmc_removeAllLayersFromMap(node,toberemovedArr)
{

    node.eachChild(function(n) {
		
		if (n.getDepth()==3)
		{
			toberemovedArr.push(n);
			/*removeLayerMap(n);
					
			count_layers_TreeLayer=map.layers.length;
							
			nodeCheck_TreeLayers(Ext.getCmp('layerTree_layers').root);*/

		}
		
		if(n.hasChildNodes())
            wmc_removeAllLayersFromMap(n,toberemovedArr);
	});
	
	return toberemovedArr;
}


function wmc_ValidateUploadFile()
{

	var wmc_url=Ext.getCmp('url_id_wmc').getValue();
	
	var ext_wmc=wmc_url.split('.').pop();

	ext_wmc=ext_wmc.toLowerCase();

	if (ext_wmc!="xml")
	{
		Ext.Msg.alert(wmc_error_title, wmc_error_not_file);
		
		return false;
	}
	
	return true;

}



function reorderWMCServices()
{
	if (wmc_WMS_count<wmc_WMS_services.length)
	{
		addWMCServers(wmc_WMS_count);
	}
	
	wmc_WMS_count++;
}


function addWMCServers(count)
{
	var layers=wmc_WMS_Layers[count];
	
	var splitLayers=layers.split(',');
	
	addWMC_WMS(wmc_WMS_services[count],splitLayers,"",0);
}

function addWMC_WMS(url,layers,exceptions,times)
{
	var output=false;

	times++;
	
	var sec=1500*times;
	
	if (times<=3)
	{
		var alreadyRegistered=false;

		Ext.each(wms_store.data.items,function(item,index){
			if (item.get('service_URI')==url)
			{
				alreadyRegistered=true;
			}
		});
		
		if (alreadyRegistered==false)
		{
			addWMSServerAJAX(url);
		}
		
		var tOut=setTimeout(
		
			function(){
				
				var isRegistered=false;
		
				Ext.each(wms_store.data.items,function(item,index){
					if (item.get('service_URI')==url)
					{
						isRegistered=true;
						
						reorderWMCServices();
						
						var wms_store_fun=wms_fetchLayers(item);
						
						wms_store_fun.load();
						
						wms_store_fun.on('load', function(store,records,options) {
							
							Ext.each(store.data.items,function(itm,indx){
							
								
								if ((layers.indexOf(itm.get("Name"))>-1) || (layers=="all"))
								{
									if ((exceptions.indexOf(itm.get("Name"))==-1) || (exceptions==""))
									{
										wms_registerLayer(itm);
									}
								}
								
							});
						
							output=true;
						
						});
					}
				});
				
				if (isRegistered==false)
				{
					addWMC_WMS(url,layers,exceptions,times);
				}
			
			},
			sec);
	}
	else
	{
		reorderWMCServices();
	}
	
	return output;
}
