/*version message*/

var map_google_store=new Ext.data.SimpleStore({
    fields: ['title','identifier','identifier'],
    data :[]
});
var geo_google_srch="";
var map_google_columns=new Ext.grid.ColumnModel([
        {header: grid_mapSearchMetadata_Col_ServiceTitle, dataIndex: "title", sortable: true,width:170},
		{dataIndex: "lng", sortable: true,width:30,hidden:true},
		{dataIndex: "lat", sortable: true,width:30,hidden:true},
		{sortable: true,width:25,renderer:grid_mapGeoGoole_Col_ShowInfo}
]);

function grid_mapGeoGoole_Col_ShowInfo(val,a,b,ss)
{

	var cellValue=Ext.getCmp('geo_google_results_grid').getStore().getAt(ss);

	var img="<img src='images/zoom_in_16.png' width='14' height='14' onclick=\"javascript:gotopoiGeoGoogle("+cellValue.get('lng')+","+cellValue.get('lat')+");\">";
	
	return img;

}

function gotopoiGeoGoogle(lng,lat)
{
	if (typeof googleEarthMode!=="undefined")
	{
		if (googleEarthMode==true)
		{
			gotoLocationGE(lat,lng,150.0,ge);
		}
		

		
		if (googleEarthMode==false)
		{
			if (map_currentMapProjection!="EPSG:4326")
			{
				map.setCenter(new OpenLayers.LonLat(lng,lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(map_currentMapProjection)), 18);
				
				var lonLat = new OpenLayers.LonLat(lng,lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(map_currentMapProjection));
				
				var size = new OpenLayers.Size(21,25);
									
				var icon = new OpenLayers.Icon('images/marker-green.png', size);
				
				var markers = new OpenLayers.Layer.Markers("GoogleCoordinatesMarker");
												
				map.addLayer(markers);
				
				map.setCenter(lonLat, 18);
				
				markers.addMarker(new OpenLayers.Marker(lonLat,icon));
			}
			else
			{
				var lonLat = new OpenLayers.LonLat(lng,lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(map_currentMapProjection));
				
				var size = new OpenLayers.Size(21,25);
									
				var icon = new OpenLayers.Icon('images/marker-green.png', size);
				
				var markers = new OpenLayers.Layer.Markers("GoogleCoordinatesMarker");
												
				map.addLayer(markers);
			
				map.setCenter(lonLat,18);
			}
		}
	}
	else
	{
		if (map_currentMapProjection!="EPSG:4326")
		{
			map.setCenter(new OpenLayers.LonLat(lng,lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(map_currentMapProjection)), 18);
		}
		else
		{
			map.setCenter(new OpenLayers.LonLat(lng,lat),18);
		}
	}
}


var mapGoogle=[{
	xtype:'panel',
	region:'center',
	iconCls:'mapTree_icon16',
	border:false,
	layout:'fit',
	title:title_Geo_Google_Panel,
	items:[{ 
		xtype:'panel',
		layout: 'border',
		items:[{
				xtype:'form',
				height:50,
				margin:5,
				region:'north',
				items:[{
					xtype: 'textfield',
					width:140,
					id:'geo_google_srchtxt',
					fieldLabel:title_Geo_Google_SearchTXT}],
				bbar:['->',{
						xtype:'button',
						text:title_Geo_Google_SearchCLR,
						handler:function(){
						
							removeMarkersFromMap("GoogleCoordinatesMarker");
						}
					},{
						xtype:'button',
						text:title_Geo_Google_SearchBTN,
						handler:function(){
						
							geo_google_srch=Ext.getCmp('geo_google_srchtxt').getValue();
							
							updateGoogleGrid();
						}
					}]
			},
			{
				xtype:'grid',
				title:grid_mapSearchMetadata_Title,
				id:'geo_google_results_grid',
				region:'center',
				loadMask:true,
				ds:map_google_store,
				cm:map_google_columns
			}]
		}]
	}];

function updateGoogleGrid()
{

	Ext.getCmp('geo_google_results_grid').loadMask.show();
	
	map_google_store = new Ext.data.Store({
				url: encodeURI('modules/google/google_proxy.php?address='+geo_google_srch),
				reader: new Ext.data.XmlReader({
					record: 'result'},
					[{name:'title',mapping:'formatted_address'},{name:'lng',mapping:'geometry/location/lng'},{name:'lat',mapping:'geometry/location/lat'}])
	});
			
			
	map_google_store.load();
			
	Ext.getCmp('geo_google_results_grid').reconfigure(map_google_store,map_google_columns);

}
	
	
