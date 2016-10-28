var measurearea_units = 'm';

var measurearea_labels=new OpenLayers.Layer.Vector("measurearea_labels",{
		rendererOptions :{ zIndexing: true },
		styleMap: new OpenLayers.StyleMap({
			'default':{
				fontColor: "${fontColor}",
				fillColor: "#FF5500",
				fontSize: "${fontSize}",
				fontFamily: "Tahoma",
				fillOpacity: 0,
				pointRadius: 1,
				pointerEvents: "visiblePainted",
				labelOutlineColor:"#FFFFFF",
				labelOutlineWidth:2,
				label : "${distance}" + "${units}"
			}
		})
	});

var measurearea_cursor=new OpenLayers.Layer.Vector("measurearea_cursor",{
		rendererOptions :{ zIndexing: true },
		styleMap: new OpenLayers.StyleMap({
			'default':{
				fontColor: "${fontColor}",
				fillColor: "#FF9900",
				fontSize: "${fontSize}",
				fontFamily: "Tahoma",
				fillOpacity: 0,
				pointRadius: 1,
				pointerEvents: "visiblePainted",
				labelOutlineColor:"#FFFFFF",
				labelOutlineWidth:2,
				label : "${distance}" + "${units}"
			}
		})
	});

var measurearea_layer=new OpenLayers.Layer.Vector("measurearea_layer",{
		styleMap: new OpenLayers.StyleMap({
			'default':{
				fontColor: '${fontColor}',
				fontSize: "${fontSize}",
				strokeColor:"#FF7700",
				fillColor: "#FF9900",
				fontFamily: "Tahoma",
				fillOpacity: 0,
				pointRadius: 1,
				pointerEvents: "visiblePainted",
				labelOutlineColor:"#FFFFFF",
				labelOutlineWidth:2,
				strokeColor:"#FF7700",
				strokeWidth:2,
				strokeDashstyle:"dashdot",
				labelOutlineColor:"#FFFFFF",
				labelOutlineWidth:5,
				label : "${distance}" + "${units}"
			}
		})
	});	

var measurearea_layer_style = {
		strokeColor:"#FF7700",
		fillColor:"#FFB050",
		fillOpacity:0.5,
		strokeWidth:2,
		strokeDashstyle:"dashdot",
		labelOutlineColor:"#FFFFFF",
		labelOutlineWidth:5
	};
	
var measurearea_distance_segment_total=0;
	
function init_map_controls_measureArea()
{	
	map_controls.measurearea=new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon,{
			persist: false,
			geodesic: map_isGeodesic,
			showDistances:true,
			handlerOptions: {
				layerOptions: 
				{
					styleMap: new OpenLayers.StyleMap({
						strokeColor:"#FF7700",
						fillColor:"#FFB050",
						fillOpacity:0.5,
						strokeWidth:2,
						strokeDashstyle:"dashdot",
						labelOutlineColor:"#FFFFFF",
						labelOutlineWidth:5
					})
				}
			},
			callbacks:{
				create:function()
				{
					try{
						
						map.removeLayer(measurearea_labels);
	
						map.removeLayer(measurearea_cursor);
						
					}catch(err){};
					
					if (map.getLayersByName("measurearea_layer")=="")
					{
						map.addLayer(measurearea_layer);
					}
					
					map.addLayer(measurearea_labels);
	
					map.addLayer(measurearea_cursor);
					
					measurearea_distance_segment_total = 0;
				},
				modify:function(_cursorPoint,evt)
				{
					if (map_isGeodesic==true)
					{
						var _v=((evt.geometry.getGeodesicLength(new OpenLayers.Projection(map_currentProjection)))/2);
					}else{
						var _v=((evt.geometry.getLength())/2);
					}
					
					measurearea_cursor.destroyFeatures();
					
					var _cursor = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(_cursorPoint.x, _cursorPoint.y));
					
					if(evt.geometry.getVertices().length==2)
					{
						measurearea_labels.destroyFeatures();
						
					}
					
					if (_v>0)
					{
						
						_cursor.attributes={
							distance: _v.toFixed(2),
							units:measurearea_units,
							fontColor: '#989898',
							align: "cm",
							fontSize:"14px"
						}
						
						//measurearea_cursor.addFeatures([_cursor]);
					}
				}
			},
			eventListeners: {
				measure: function(evt)
				{
					var _v = evt.geometry.getVertices();
					
					if (_v.length>2)
					{					
						var _preLastVertex = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point((_v[_v.length-1].x + _v[_v.length-2].x)/2, (_v[_v.length-1].y + _v[_v.length-2].y)/2));
			
						var _lastVertex = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(_v[_v.length-1].x, _v[_v.length-1].y));
					
						var _segment = new OpenLayers.Geometry.LineString([new OpenLayers.Geometry.Point(_v[_v.length-2].x, _v[_v.length-2].y), new OpenLayers.Geometry.Point(_v[_v.length-1].x, _v[_v.length-1].y)]);
						
						if (map_isGeodesic==true)
						{
							var measurearea_distance_segment=_segment.getGeodesicLength(new OpenLayers.Projection(map_currentProjection));
						}else{
							var measurearea_distance_segment=_segment.getLength();
						}
					
						measurearea_distance_segment_total=measurearea_distance_segment+measurearea_distance_segment_total;
					
						_preLastVertex.attributes={
							distance: measurearea_distance_segment.toFixed(2),
							units:measurearea_units,
							fontColor: '#808080',
							align: "cm",
							fontSize:"12px"
						};
					
						_lastVertex.attributes = {
							distance: measurearea_distance_segment_total.toFixed(2),
							units:measurearea_units,
							fontColor: '#FF6600',
							align: "cm",
							fontSize:"14px"
						};
						
						var _firstVertex = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(_v[0].x, _v[0].y));
						
						var _toFirstVertex = new OpenLayers.Geometry.LineString([new OpenLayers.Geometry.Point(_v[_v.length-1].x, _v[_v.length-1].y), new OpenLayers.Geometry.Point(_v[0].x, _v[0].y)]);
						
						if (map_isGeodesic==true)
						{	
							measurearea_distance_segment_total=_toFirstVertex.getGeodesicLength(new OpenLayers.Projection(map_currentProjection))+measurearea_distance_segment_total;
						}else{
							measurearea_distance_segment_total=_toFirstVertex.getLength()+measurearea_distance_segment_total;
						}
						
						_firstVertex.attributes = {
							distance: measurearea_distance_segment_total.toFixed(2),
							units:measurearea_units,
							fontColor: '#FF6600',
							align: "cm",
							fontSize:"14px"
						};
						
						var _lastSegment = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point((_v[_v.length-1].x + _v[0].x)/2, (_v[_v.length-1].y + _v[0].y)/2));
						
						
						if (map_isGeodesic==true)
						{	
							var _toFirstVertexGetLength=_toFirstVertex.getGeodesicLength(new OpenLayers.Projection(map_currentProjection));
						}else{
							var _toFirstVertexGetLength=_toFirstVertex.getLength();
						}
						
						_lastSegment.attributes={
							distance: _toFirstVertexGetLength.toFixed(2),
							units:measurearea_units,
							fontColor: '#808080',
							align: "cm"
						}
						
						_lastSegment.attributes={
							distance: _toFirstVertexGetLength.toFixed(2),
							units:measurearea_units,
							fontColor: '#808080',
							align: "cm"
						}
						
						var _areaPoint = new OpenLayers.Feature.Vector(evt.geometry.getCentroid());
						
						_areaPoint.attributes={
							distance:evt.measure.toFixed(2),
							units:evt.units +"^2",
							fontColor: '#FF6600',
							align: "cm"
						}
						
						//measurearea_labels.addFeatures([_preLastVertex,_lastVertex,_firstVertex,_lastSegment,_areaPoint]);
						measurearea_layer.addFeatures(new OpenLayers.Feature.Vector(evt.geometry,null,measurearea_layer_style));
						
						measurearea_layer.addFeatures([_preLastVertex.clone(),_lastVertex.clone(),_firstVertex.clone(),_lastSegment.clone(),_areaPoint.clone()]);
						
					}
					
				},
				measurepartial:function(evt)
				{
					var _v = evt.geometry.getVertices();
					
					if (_v.length>2)
					{					
						var _preLastVertex = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point((_v[_v.length-2].x + _v[_v.length-3].x)/2, (_v[_v.length-2].y + _v[_v.length-3].y)/2));
			
						var _lastVertex = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(_v[_v.length-1].x, _v[_v.length-1].y));
					
						var _segment = new OpenLayers.Geometry.LineString([new OpenLayers.Geometry.Point(_v[_v.length-3].x, _v[_v.length-3].y), new OpenLayers.Geometry.Point(_v[_v.length-2].x, _v[_v.length-2].y)]);
					
						if (map_isGeodesic==true)
						{	
							var measurearea_distance_segment=_segment.getGeodesicLength(new OpenLayers.Projection(map_currentProjection));
						}else{
							var measurearea_distance_segment=_segment.getLength();
						}
					
						_preLastVertex.attributes={
							distance: measurearea_distance_segment.toFixed(2),
							units:measurearea_units,
							fontColor: '#808080',
							align: "cm",
							fontSize:"12px"
						};
						
						measurearea_distance_segment_total=measurearea_distance_segment+measurearea_distance_segment_total;
						
						
						_lastVertex.attributes = {
							distance: measurearea_distance_segment_total.toFixed(2),
							units:measurearea_units,
							fontColor: '#FF6600',
							align: "cm",
							fontSize:"14px"
						};
						
						//measurearea_labels.addFeatures([_preLastVertex,_lastVertex]);
						
						measurearea_layer.addFeatures([_preLastVertex.clone(),_lastVertex.clone()]);
						
					}
				}
			}
		});
}