
/*version message*/

function map_MeasureDistance()
{
	var lineLayer=new OpenLayers.Layer.Vector("measure",{
		styleMap: new OpenLayers.StyleMap({'default':{
		strokeColor: "#00FF00",
		strokeOpacity: 0,
		strokeWidth: 0,
		fontColor: "${favColor}",
		fillColor: "#FF5500",
		fontSize: "10px",
		fontFamily: "Courier New, monospace",
		fillOpacity: 0,
		pointRadius: 1,
		pointerEvents: "visiblePainted",
		label : "${distance}" + "${units}"
		}})
	});
	
	
	
	var cursorMeasure=new OpenLayers.Layer.Vector("measure",{
		styleMap: new OpenLayers.StyleMap({'default':{
		strokeColor: "#00FF00",
		strokeOpacity: 0,
		strokeWidth: 0,
		fontColor: "${favColor}",
		fillColor: "#FF5500",
		fontSize: "10px",
		fontFamily: "Courier New, monospace",
		fillOpacity: 0,
		pointRadius: 1,
		pointerEvents: "visiblePainted",
		label : "${distance}" + "${units}",
		labelXOffset: "${xOffset}",
		labelYOffset: "${yOffset}"
		}})
	});
	
	function drawDistancePoints(evt)
	{
		var vertexes = evt.geometry.getVertices();		
			
		lineLayer.removeAllFeatures();
			
		var segment_distance_total_Area=0;
		
		for(var i=0;i<vertexes.length-1;i++)
		{
			if(vertexes[i+1])
			{
				var point_Area = new OpenLayers.Geometry.Point((vertexes[i].x + vertexes[i+1].x)/2, (vertexes[i].y + vertexes[i+1].y)/2);
							
				var point_Area_Last=new OpenLayers.Geometry.Point(vertexes[i].x, vertexes[i].y);
							
				var point_Area_Previous=new OpenLayers.Geometry.Point(vertexes[i+1].x, vertexes[i+1].y);
							
			}
						
			var pointFeature_Area_Middle = new OpenLayers.Feature.Vector(point_Area);
							
			var pointFeature_Area_Edge = new OpenLayers.Feature.Vector(point_Area_Previous);
	
			var linedis = new OpenLayers.Geometry.LineString([point_Area_Previous, point_Area_Last]);
				
			var measure_Seg_abs_Area=linedis.getGeodesicLength(new OpenLayers.Projection(map.getProjection()));
						
			segment_distance_total_Area=segment_distance_total_Area+measure_Seg_abs_Area;
						
			if (parseFloat(measure_Seg_abs_Area)>=1000)
			{
								
				measure_Seg_abs_Area=measure_Seg_abs_Area/1000;
								
				var measure_dist_Seg_units_Area="km";
			}
			else
			{
								
				var measure_dist_Seg_units_Area="m";
			}
							
			pointFeature_Area_Middle.attributes = {
				distance: measure_Seg_abs_Area.toFixed(2),
				units:measure_dist_Seg_units_Area,
				favColor: 'black',
				align: "cm"
				};
						
			if (parseFloat(segment_distance_total_Area)>=1000)
			{
										
				var segment_distance_total_Area_sum=segment_distance_total_Area/1000;
							
				total_dist_Area_partial_units="km";
										
			}
			else
			{	
				var segment_distance_total_Area_sum=segment_distance_total_Area;
				
				total_dist_Area_partial_units="m";				
			}
						
			pointFeature_Area_Edge.attributes = {
				distance: segment_distance_total_Area_sum.toFixed(2),
				units:total_dist_Area_partial_units,
				favColor:'red',
				align:"cm"
				};
						
			lineLayer.addFeatures([pointFeature_Area_Edge]);
						
			lineLayer.addFeatures([pointFeature_Area_Middle]);
			}
	}	
	
	var segment_distance=0;
	
	var segment_distance_cursor=0;
	
	var segment_distance_total=0;
	
	map_MeasureDistance_var=new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
		persist: false,
		callbacks:{
			create:function(){
				map.addLayer(lineLayer);
				map.addLayer(cursorMeasure);
			
			},
			modify:function(point,evt){
				
				var vertexes = evt.geometry.getVertices();

				if (vertexes[vertexes.length-2])
				{
				var pointCursor2 = new OpenLayers.Geometry.Point(vertexes[vertexes.length-2].x, vertexes[vertexes.length-2].y);
				
				var pointCursor3 = new OpenLayers.Geometry.Point(vertexes[vertexes.length-1].x, vertexes[vertexes.length-1].y);				
				
				var linedis = new OpenLayers.Geometry.LineString([pointCursor2, pointCursor3]);
				
				var measure_dist_abs=linedis.getGeodesicLength(new OpenLayers.Projection(map.getProjection()));
				
				var measure_dist_cursor=measure_dist_abs;
				
				var measure_dist_cursor_units="";
				
				if (parseFloat(measure_dist_cursor)>=1000)
				{
					
					measure_dist_cursor=measure_dist_abs/1000;
					
					measure_dist_cursor_units="km";
				}
				else
				{
					measure_dist_cursor=measure_dist_abs;
					
					measure_dist_cursor_units="m";
				}
				
				
				var pointCursor = new OpenLayers.Geometry.Point(vertexes[vertexes.length-1].x, vertexes[vertexes.length-1].y);
		
				var pointCursorFeature = new OpenLayers.Feature.Vector(pointCursor);
				
				var pointCursorFeatureTotal = new OpenLayers.Feature.Vector(pointCursor);
				
				if (measure_dist_abs!=0)
				{
				
					var total_dist=parseFloat(segment_distance_total)+parseFloat(measure_dist_abs.toFixed(2));
					
					if (parseFloat(total_dist)>=1000)
					{
						
						total_dist=total_dist/1000;
						
					}
					else
					{
						measure_dist_cursor=measure_dist_abs;
						
					}
					
					pointCursorFeature.attributes = {
						distance: measure_dist_cursor.toFixed(2),
						units:measure_dist_cursor_units,
						favColor: 'black',
						align: "cm",
						xOffset:60,
						yOffset:-10
					};

					pointCursorFeatureTotal.attributes = {
						distance: total_dist.toFixed(2),
						units:measure_dist_cursor_units,
						favColor: 'red',
						align: "cm",
						xOffset:60,
						yOffset:-30
					};						

					
					cursorMeasure.destroyFeatures();
					
					cursorMeasure.addFeatures([pointCursorFeature]);
					
					cursorMeasure.addFeatures([pointCursorFeatureTotal]);
				}
			}
			}
		},
		eventListeners: {
			measure: function(evt) {
				drawDistancePoints(evt);
				segment_distance=0;
				
				segment_distance_total=0;
				
				cursorMeasure.destroyFeatures();
				
				var vectorLayer = new OpenLayers.Layer.Vector("measure");
				
				var style_green =
				{
					strokeColor: "#FF0000",
					strokeOpacity: 0.7,
					strokeWidth: 1
				};
				
				var lineFeature = new OpenLayers.Feature.Vector(evt.geometry, null, style_green);
				
				map.addLayer(vectorLayer);
				
				vectorLayer.addFeatures([lineFeature]);

				map_MeasureDistance_var.deactivate();
			}
		}
	});
	
	map_MeasureDistance_var.geodesic=true;
	
	mapPanel.map.addControl(map_MeasureDistance_var);
	
	map_MeasureDistance_var.activate(); 

	map_MeasureDistance_var.events.on({
	
		measurepartial: function(evt) {
				
		map_MeasureDistance_var.showDistances = true;     
		
		var vertexes = evt.geometry.getVertices();		

		var point = new OpenLayers.Geometry.Point((vertexes[vertexes.length-2].x + vertexes[vertexes.length-3].x)/2, (vertexes[vertexes.length-2].y + vertexes[vertexes.length-3].y)/2);
		
		var point2 = new OpenLayers.Geometry.Point(vertexes[vertexes.length-1].x, vertexes[vertexes.length-1].y);
		
		var pointFeature = new OpenLayers.Feature.Vector(point);
		
		var pointFeature2 = new OpenLayers.Feature.Vector(point2);
		
		if (vertexes[vertexes.length-2])
		{
				var pointSeg2 = new OpenLayers.Geometry.Point(vertexes[vertexes.length-3].x, vertexes[vertexes.length-3].y);
				
				var pointSeg3 = new OpenLayers.Geometry.Point(vertexes[vertexes.length-2].x, vertexes[vertexes.length-2].y);				
				
				var linedis = new OpenLayers.Geometry.LineString([pointSeg2, pointSeg3]);

				var measure_Seg_abs=linedis.getGeodesicLength(new OpenLayers.Projection(map.getProjection()));
				
				var measure_dist_Seg=measure_Seg_abs;
				
				var measure_dist_Seg_units="";
				
				segment_distance_total=segment_distance_total+measure_dist_Seg;

				if (parseFloat(measure_dist_Seg)>=1000)
				{
					
					measure_dist_Seg=measure_Seg_abs/1000;
					
					measure_dist_Seg_units="km";
				}
				else
				{
					measure_dist_Seg=measure_Seg_abs;
					
					measure_dist_Seg_units="m";
				}
				
				pointFeature.attributes = {
					distance: measure_dist_Seg.toFixed(2),
					units:measure_dist_Seg_units,
					favColor: 'black',
					align: "cm"
				};		
		}
		
		
		pointFeature2.attributes = {
			distance: evt.measure.toFixed(2) ,
			units:evt.units,
			favColor: 'red',
			align: "cm"
		};

		lineLayer.addFeatures([pointFeature]);		
		lineLayer.addFeatures([pointFeature2]);
		}
	});

}


function map_MeasureArea()
{

	var lineLayer_Area=new OpenLayers.Layer.Vector("measure",{
		styleMap: new OpenLayers.StyleMap({'default':{
		strokeColor: "#00FF00",
		strokeOpacity: 0,
		strokeWidth: 0,
		fontColor: "${favColor}",
		fillColor: "#FFFFFF",
		fontSize: "10px",
		fontFamily: "Courier New, monospace",
		fillOpacity: 0.5,
		pointRadius: 1,
		pointerEvents: "visiblePainted",
		label : "${distance}" + "${units}"
		}})
	});

	var cursorMeasure_Area=new OpenLayers.Layer.Vector("measure",{
		styleMap: new OpenLayers.StyleMap({'default':{
		strokeColor: "#00FF00",
		strokeOpacity: 0,
		strokeWidth: 0,
		fontColor: "${favColor}",
		fillColor: "#FFFFFF",
		fontSize: "10px",
		fontFamily: "Courier New, monospace",
		fillOpacity: 0.5,
		pointRadius: 1,
		pointerEvents: "visiblePainted",
		label : "${distance}" + "${units}",
		labelXOffset: "${xOffset}",
		labelYOffset: "${yOffset}"
		}})
	});

	function drawAreaPoints(evt)
	{
		var vertexes = evt.geometry.getVertices();		
			
		lineLayer_Area.removeAllFeatures();
			
		var segment_distance_total_Area=0;
		
		for(var i=0;i<vertexes.length;i++)
		{
			if(vertexes[i+1])
			{
				var point_Area = new OpenLayers.Geometry.Point((vertexes[i].x + vertexes[i+1].x)/2, (vertexes[i].y + vertexes[i+1].y)/2);
							
				var point_Area_Last=new OpenLayers.Geometry.Point(vertexes[i].x, vertexes[i].y);
							
				var point_Area_Previous=new OpenLayers.Geometry.Point(vertexes[i+1].x, vertexes[i+1].y);
							
			}
			else
			{
				var point_Area = new OpenLayers.Geometry.Point((vertexes[0].x + vertexes[vertexes.length-1].x)/2, (vertexes[0].y + vertexes[vertexes.length-1].y)/2);
							
				var point_Area_Last=new OpenLayers.Geometry.Point(vertexes[vertexes.length-1].x, vertexes[vertexes.length-1].y);
							
				var point_Area_Previous=new OpenLayers.Geometry.Point(vertexes[0].x, vertexes[0].y);
						
			}
						
			var pointFeature_Area_Middle = new OpenLayers.Feature.Vector(point_Area);
							
			var pointFeature_Area_Edge = new OpenLayers.Feature.Vector(point_Area_Previous);

			var linedis = new OpenLayers.Geometry.LineString([point_Area_Previous, point_Area_Last]);
				
			var measure_Seg_abs_Area=linedis.getGeodesicLength(new OpenLayers.Projection(map.getProjection()));
						
			segment_distance_total_Area=segment_distance_total_Area+measure_Seg_abs_Area;
						
			if (parseFloat(measure_Seg_abs_Area)>=1000)
			{
								
				measure_Seg_abs_Area=measure_Seg_abs_Area/1000;
								
				var measure_dist_Seg_units_Area="km";
			}
			else
			{
								
				var measure_dist_Seg_units_Area="m";
			}
							
			pointFeature_Area_Middle.attributes = {
				distance: measure_Seg_abs_Area.toFixed(2),
				units:measure_dist_Seg_units_Area,
				favColor: 'black',
				align: "cm"
				};
						
			if (parseFloat(segment_distance_total_Area)>=1000)
			{
										
				var segment_distance_total_Area_sum=segment_distance_total_Area/1000;
							
				total_dist_Area_partial_units="km";
										
			}
			else
			{	
				var segment_distance_total_Area_sum=segment_distance_total_Area;
				
				total_dist_Area_partial_units="m";				
			}
						
			pointFeature_Area_Edge.attributes = {
				distance: segment_distance_total_Area_sum.toFixed(2),
				units:total_dist_Area_partial_units,
				favColor:'red',
				align:"cm"
				};
						
			lineLayer_Area.addFeatures([pointFeature_Area_Edge]);
						
			lineLayer_Area.addFeatures([pointFeature_Area_Middle]);
			}
	}	
	var segment_distance_Area=0;

	var segment_distance_cursor_Area=0;

	var segment_distance_total_Area=0;

	map_MeasureArea_var=new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
		persist: false,
		callbacks:{
			create:function(){
				map.addLayer(lineLayer_Area);
	
				map.addLayer(cursorMeasure_Area);

			},
			modify:function(point,evt){
				
				var vertexes = evt.geometry.getVertices();
	
				if (vertexes[vertexes.length-2])
				{
					var pointCursor2_Area = new OpenLayers.Geometry.Point(vertexes[vertexes.length-2].x, vertexes[vertexes.length-2].y);
					
					var pointCursor3_Area = new OpenLayers.Geometry.Point(vertexes[vertexes.length-1].x, vertexes[vertexes.length-1].y);			
					
					var linedis = new OpenLayers.Geometry.LineString([pointCursor3_Area, pointCursor2_Area]);
				
					var measure_dist_abs_Area=linedis.getGeodesicLength(new OpenLayers.Projection(map.getProjection()));
					
					var measure_dist_cursor_Area=measure_dist_abs_Area;
					
					var measure_dist_cursor_units_Area="";
					
					if (parseFloat(measure_dist_cursor_Area)>=1000)
					{
						
						measure_dist_cursor_Area=measure_dist_abs_Area/1000;
						
						measure_dist_cursor_units_Area="km";
					}
					else
					{
						measure_dist_cursor_Area=measure_dist_abs_Area;
						
						measure_dist_cursor_units_Area="m";
					}
					
					
					var pointCursor_Area = new OpenLayers.Geometry.Point(vertexes[vertexes.length-1].x, vertexes[vertexes.length-1].y);
			
					var pointCursorFeature_Area= new OpenLayers.Feature.Vector(pointCursor_Area);
					
					var pointCursorFeatureTotal_Area = new OpenLayers.Feature.Vector(pointCursor_Area);
					
					if (measure_dist_abs_Area!=0)
					{
					
						var total_dist_Area=parseFloat(segment_distance_total_Area)+parseFloat(measure_dist_abs_Area.toFixed(2));
						
						if (parseFloat(total_dist_Area)>=1000)
						{
							
							total_dist_Area=total_dist_Area/1000;
							
						}
						else
						{
							total_dist_Area=total_dist_Area;
							
						}
						
						pointCursorFeature_Area.attributes = {
							distance: measure_dist_cursor_Area.toFixed(2),
							units:measure_dist_cursor_units_Area,
							favColor: 'black',
							align: "cm",
							xOffset:60,
							yOffset:-10
						};

						pointCursorFeatureTotal_Area.attributes = {
							distance: total_dist_Area.toFixed(2),
							units:measure_dist_cursor_units_Area,
							favColor: 'red',
							align: "cm",
							xOffset:60,
							yOffset:-30
						};					

						
						cursorMeasure_Area.destroyFeatures();
						
						cursorMeasure_Area.addFeatures([pointCursorFeature_Area]);
						
						cursorMeasure_Area.addFeatures([pointCursorFeatureTotal_Area]);
					}
				}
			}
		},
		eventListeners: {
			measure: function(evt) {
					
				drawAreaPoints(evt);
				
				segment_distance_Area=0;
				
				segment_distance_total_Area=0;
				
				cursorMeasure_Area.destroyFeatures();
				
				vectorLayer_Area = new OpenLayers.Layer.Vector("measure");
				
				var style_green_Area =
				{
					strokeColor: "#FF0000",
					strokeOpacity: 0.7,
					strokeWidth: 1,
					fillColor: "#FFFFFF",
					fontSize: "10px",
					fontFamily: "Courier New, monospace",
					fillOpacity: 0.5,
					label:evt.measure.toFixed(2) + evt.units + "^2"
				};
				
				var lineFeature_Area = new OpenLayers.Feature.Vector(evt.geometry, null, style_green_Area);
				
				map.addLayer(vectorLayer_Area);
				
				vectorLayer_Area.addFeatures([lineFeature_Area]);
				
				map_MeasureArea_var.deactivate();
				
			}
		}
	});

	map_MeasureArea_var.geodesic=true;

	mapPanel.map.addControl(map_MeasureArea_var);
	
	map_MeasureArea_var.activate(); 

	map_MeasureArea_var.events.on({

		measurepartial: function(evt) {
		
		map_MeasureArea_var.showDistances = true;     
		
		var vertexes = evt.geometry.getVertices();		

		var point_Area = new OpenLayers.Geometry.Point((vertexes[vertexes.length-2].x + vertexes[vertexes.length-3].x)/2, (vertexes[vertexes.length-2].y + vertexes[vertexes.length-3].y)/2);
		
		var point2_Area = new OpenLayers.Geometry.Point(vertexes[vertexes.length-1].x, vertexes[vertexes.length-1].y);
		
		var pointFeature_Area = new OpenLayers.Feature.Vector(point_Area);
		
		var pointFeature2_Area = new OpenLayers.Feature.Vector(point2_Area);
		
		
			if (vertexes[vertexes.length-2])
			{
				var pointSeg2_Area = new OpenLayers.Geometry.Point(vertexes[vertexes.length-3].x, vertexes[vertexes.length-3].y);
				
				var pointSeg3_Area = new OpenLayers.Geometry.Point(vertexes[vertexes.length-2].x, vertexes[vertexes.length-2].y);			
				
				var linedis = new OpenLayers.Geometry.LineString([pointSeg3_Area, pointSeg2_Area]);
				
				var measure_Seg_abs_Area=linedis.getGeodesicLength(new OpenLayers.Projection(map.getProjection()));
				
				var measure_dist_Seg_Area=measure_Seg_abs_Area;
				
				var measure_dist_Seg_units_Area="";
				
				segment_distance_total_Area=segment_distance_total_Area+measure_dist_Seg_Area;

				if (parseFloat(measure_dist_Seg_Area)>=1000)
				{
					
					measure_dist_Seg_Area=measure_Seg_abs_Area/1000;
					
					measure_dist_Seg_units_Area="km";
				}
				else
				{
					measure_dist_Seg_Area=measure_Seg_abs_Area;
					
					measure_dist_Seg_units_Area="m";
				}
				
				pointFeature_Area.attributes = {
					distance: measure_dist_Seg_Area.toFixed(2),
					units:measure_dist_Seg_units_Area,
					favColor: 'black',
					align: "cm"
				};		
			}
		
			var total_dist_Area_partial;
			
			var total_dist_Area_partial_units;
		
			if (parseFloat(segment_distance_total_Area)>=1000)
			{
							
				total_dist_Area_partial=segment_distance_total_Area/1000;
				
				total_dist_Area_partial_units="km";
							
			}
			else
			{
				total_dist_Area_partial=segment_distance_total_Area;
				
				total_dist_Area_partial_units="m";
			}
			
			pointFeature2_Area.attributes = {
				distance: total_dist_Area_partial.toFixed(2),
				units:total_dist_Area_partial_units,
				favColor: 'red',
				align: "cm"
			};

			lineLayer_Area.addFeatures([pointFeature_Area]);		
			lineLayer_Area.addFeatures([pointFeature2_Area]);
		}
	});


}