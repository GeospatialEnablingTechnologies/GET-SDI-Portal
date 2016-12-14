var googlereversegeocoding_translation = {
	el_gr:{
		address:'Διεύθυνση:',
		pleasewait:'Παρακαλώ περιμένετε...',
		notfound:'Δεν βρέθηκε καμμία διεύθυνση'
	},
	en_us:{
		address:'Address:',
		pleasewait:'Please wait...',
		notfound:'Address not found'
	}
}

var googlereversegeocoding_geocoder = new google.maps.Geocoder;

function googlereversegeocoding_contextmenu()
{
	map_contextMenu.on("move",function(){
		
		var _text = googlereversegeocoding_translation[language].address + "<br>" + googlereversegeocoding_translation[language].pleasewait;
		
		Ext.getCmp("googlereversegeocoding_contextmenu_id").update(_text);
		
		Ext.getCmp("googlereversegeocoding_contextmenu_id").disable();
		
		var topleft=Ext.getCmp("maptab_mapPanel").getXY();
			
		var p=new OpenLayers.Pixel(Number(map_contextMenu.getXY()[0]-topleft[0]),Number(map_contextMenu.getXY()[1]-topleft[1]));
			
		var lonlat = map.getLonLatFromViewPortPx(p);
			
		var _p = new OpenLayers.LonLat(Number(lonlat.lon),Number(lonlat.lat));
				
		if (mapGetCurrentProjection()!="EPSG:4326")
		{
			_p.transform(new OpenLayers.Projection(mapGetCurrentProjection()), new OpenLayers.Projection("EPSG:4326"));
		}
		
		var latlng = {lat: parseFloat(_p.lat), lng: parseFloat(_p.lon)};
		
		googlereversegeocoding_geocoder.geocode({'location': latlng,'language': 'el'}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK)
			{
				if (results[0])
				{
					var _text= googlereversegeocoding_translation[language].address + "<br>" + results[0].formatted_address;
					
					Ext.getCmp("googlereversegeocoding_contextmenu_id").update(_text);
					
					Ext.getCmp("googlereversegeocoding_contextmenu_id").enable();
					
				}else{
				
					var _text= googlereversegeocoding_translation[language].address + "<br>" + googlereversegeocoding_translation[language].notfound;
					
					Ext.getCmp("googlereversegeocoding_contextmenu_id").update(_text);
					
					Ext.getCmp("googlereversegeocoding_contextmenu_id").disable();
				}
			}else{
				
				var _text= googlereversegeocoding_translation[language].address + "<br>" + googlereversegeocoding_translation[language].notfound;
					
				Ext.getCmp("googlereversegeocoding_contextmenu_id").update(_text);
					
				Ext.getCmp("googlereversegeocoding_contextmenu_id").disable();
			}
		});
	});
	
	
	map_contextMenu.insert(0,[{
		xtype:'label',
		id:'googlereversegeocoding_contextmenu_id',
		disabled:true,
		text:googlereversegeocoding_translation[language].address + "<br>" + googlereversegeocoding_translation[language].pleasewait
	},{
        xtype: 'menuseparator'
    }]);
	
	
}

function googlereversegeocoding_init()
{
	googlereversegeocoding_contextmenu();
}


init_onload_fn.push(googlereversegeocoding_init);