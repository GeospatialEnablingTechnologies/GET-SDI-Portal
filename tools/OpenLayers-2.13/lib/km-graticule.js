
/* Original Lat/Lon Graticule Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
* full list of contributors). Published under the 2-clause BSD license.
* See license.txt in the OpenLayers distribution or repository for the
* full text of the license. 
*
*/


/*
* A kilometer graticule for OpenLayers 2.12 derived from the Lat/Lon graticule
*
* This file copyright (c)2012 Bill Chadwick (bill.chadwick2@gmail.com)
*
* This program is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 2
* of the License, or (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
* 
*/


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Rule.js
 * @requires OpenLayers/StyleMap.js
 * @requires OpenLayers/Layer/Vector.js
 *
 * A projection for the graticule e.g. EPSG:27700 (Ordnance Survey / British National Grid)
 * see the constructor. 
 *
 */

/**
 * Class: OpenLayers.Control.KmGraticule
 * The Graticule displays a graticule of kilometer grid lines reprojected on the map.  
 * 
 * Inherits from:
 *  - <OpenLayers.Control>
 *  
 */
OpenLayers.Control.KmGraticule = OpenLayers.Class(OpenLayers.Control, {

    /**
    * APIProperty: autoActivate
    * {Boolean} Activate the control when it is added to a map. Default is
    *     true. 
    */
    autoActivate: true,

    /**
    * APIProperty: maxInterval
    * {Float} biggest permitted graticule line spacings in metres.
    *   bounds width and height should divide by this exactly.
    */
    maxInterval: 500000,

    /**
    * APIProperty: minInterval
    * {Float} smallest permitted graticule line spacings in metres.
    */
    minInterval: 100,

    /**
    * APIProperty: bounds
    * {Array(Float)} The graticule projection bounds to show the grid over in order left, bottom, right, top
    *   this must be set in the constructor
    */
    bounds: null,


    /**
    * APIProperty: displayInLayerSwitcher
    * {Boolean} Allows the Graticule control to be switched on and off by 
    *     LayerSwitcher control. Defaults is true.
    */
    displayInLayerSwitcher: true,

    /**
    * APIProperty: visible
    * {Boolean} should the graticule be initially visible (default=true)
    */
    visible: true,

    /**
    * APIProperty: curvedNumPoints
    * {Integer} The default number of points to use in each curved graticule line.  Higher
    *   numbers result in a smoother curve for projected maps 
    */
    curvedNumPoints: 50,

    /**
    * APIProperty: layerName
    * {String} The name to be displayed in the layer switcher
    */
    layerName: "Km Graticule",

    /**
    * APIProperty: labelled
    * {Boolean} Should the graticule lines be labelled?. default=true
    */
    labelled: true,

    /**
    * APIProperty: lineStyle
    * {style object} the default style used to render lines
    *   The default colour is that used by Ordnance Survey UK
    */
    lineStyle: {
        strokeColor: "#000000",
        strokeWidth: 1,
        strokeOpacity: 0.5
    },

    /**
    * APIProperty: labelStyle
    * {style object} the default style used to render labels
    *   The default colour is that used by Ordnance Survey UK
    */
    labelStyle: {
        fontColor: "#000000",
        fontFamily: 'arial',
        //fontWeight: 'bold',
        labelAlign: "rb",
        labelXOffset: -2,
        labelYOffset: 2
    },

    /**
    * Property: gratLayer
    * {<OpenLayers.Layer.Vector>} vector layer used to draw the graticule on
    */
    gratLayer: null,

    /**
    * Property: projection
    * {<OpenLayers.Projection>} projection for which to draw the graticule
    *   this must be set in the constructor
    */
    projection: null,

    /**
    * Constructor: OpenLayers.Control.OSGraticule
    * Create a new km graticule to display a grid of eastings and northings for projections that have units of metres
    * 
    * Parameters:
    * projectionCode - A code for the projection for the graticule, this should have units of metres
    * boundsArray - The inclusive (graticule projection) extent over which the graticule should be rendered
    * options - {Object} An optional object whose properties will be used to extend the control.
    */
    initialize: function(projectionCode, boundsArray, options) {
        this.projection = new OpenLayers.Projection(projectionCode);
        this.bounds = new OpenLayers.Bounds(boundsArray);
        options = options || {};
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**
    * APIMethod: destroy
    */
    destroy: function() {
        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
        if (this.gratLayer) {
            this.gratLayer.destroy();
            this.gratLayer = null;
        }
    },

    /**
    * Method: draw
    *
    * initializes the graticule layer and does the initial update
    * 
    * Returns:
    * {DOMElement}
    */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (!this.gratLayer) {

            this.gratLayer = new OpenLayers.Layer.Vector(this.layerName, {
                visibility: this.visible,
                displayInLayerSwitcher: this.displayInLayerSwitcher
            });
        }
        return this.div;
    },

    /**
    * APIMethod: activate
    */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.addLayer(this.gratLayer);
            this.map.events.register('moveend', this, this.update);
            this.update();
            return true;
        } else {
            return false;
        }
    },

    /**
    * APIMethod: deactivate
    */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.unregister('moveend', this, this.update);
            this.map.removeLayer(this.gratLayer);
            return true;
        } else {
            return false;
        }
    },
    /**
    * Method: update
    *
    * calculates the grid to be displayed and actually draws it
    * 
    * Returns:
    * {DOMElement}
    */
    update: function() {
        //wait for the map to be initialized before proceeding
        var mapBounds = this.map.getExtent();
        if (!mapBounds) {
            return;
        }

        if (!this.projection) {
            return;
        }

        if (!this.bounds) {
            return;
        }

        if (!this.visible) {
            return;
        }

        //clear out the old grid
        this.gratLayer.destroyFeatures();

        //get the projection objects required
        var gratProj = this.projection;
        var mapProj = this.map.getProjectionObject();
        var mapRes = this.map.getResolution();

        //select the grid interval according to the map resolution
        var llInterval;
        if (mapRes <= 1) {
            llInterval = 100;
        } else if (mapRes <= 2.5) {
            llInterval = 200;
        } else if (mapRes <= 5) {
            llInterval = 500;
        } else if (mapRes <= 10) {
            llInterval = 1000;
        } else if (mapRes <= 25) {
            llInterval = 2000;
        } else if (mapRes <= 50) {
            llInterval = 5000;
        } else if (mapRes <= 100) {
            llInterval = 10000;
        } else if (mapRes <= 250) {
            llInterval = 20000;
        } else if (mapRes <= 500) {
            llInterval = 50000;
        } else if (mapRes <= 1000) {
            llInterval = 100000;
        } else if (mapRes <= 2500) {
            llInterval = 200000;
        } else if (mapRes <= 5000) {
            llInterval = 500000;
        } else if (mapRes <= 10000) {
            llInterval = 1000000;
        } else if (mapRes <= 25000) {
            llInterval = 2000000;
        } else {
            llInterval = 5000000;
        }

        //limit to min/max interval
        if (llInterval < this.minInterval) {
            llInterval = this.minInterval;
        }
        if (llInterval > this.maxInterval) {
            llInterval = this.maxInterval;
        }

        //if the map is in the same projection as the graticule, then the lines are straight and only one point is required
        var numPoints;
        if (mapProj.getCode() === gratProj.getCode()) {
            numPoints = 1;
        } else {
            numPoints = this.curvedNumPoints;
        }

        //get the map center in graticule projection
        var mapCenter = this.map.getCenter(); //lon and lat here are really map x and y
        var mapCenterLL = new OpenLayers.Pixel(mapCenter.lon, mapCenter.lat);
        OpenLayers.Projection.transform(mapCenterLL, mapProj, gratProj);

        //bounds in graticule projection
        var mapTrBounds = mapBounds.clone().transform(mapProj, gratProj);

        //round the LL center to an even number based on the interval
        mapCenterLL.x = Math.floor(mapCenterLL.x / llInterval) * llInterval;
        mapCenterLL.y = Math.floor(mapCenterLL.y / llInterval) * llInterval;


        /* The following 2 blocks calculate the nodes of the grid along a 
        * line of constant eastings (then northings) running through the
        * center of the map until it reaches the map edge.  The calculation
        * goes from the center in both directions to the edge.
        */
        //get the central eastings line, increment the northings
        var iter = 0;
        var centerLonPoints = [mapCenterLL.clone()];
        var newPoint = mapCenterLL.clone();
        var mapXY;
        do {
            newPoint = newPoint.offset({ x: 0, y: llInterval });
            if (newPoint.y > this.bounds.top) {
                newPoint.y = this.bounds.top;
            }
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), gratProj, mapProj);
            centerLonPoints.unshift(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter < 1000 && newPoint.y < this.bounds.top);
        newPoint = mapCenterLL.clone();
        do {
            newPoint = newPoint.offset({ x: 0, y: -llInterval });
            if (newPoint.y < this.bounds.bottom) {
                newPoint.y = this.bounds.bottom;
            }
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), gratProj, mapProj);
            centerLonPoints.push(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter < 1000 && newPoint.y > this.bounds.bottom);

        //get the central northings line, increment the eastings
        iter = 0;
        var centerLatPoints = [mapCenterLL.clone()];
        newPoint = mapCenterLL.clone();
        do {
            newPoint = newPoint.offset({ x: -llInterval, y: 0 });
            if (newPoint.x < this.bounds.left) {
                newPoint.x = this.bounds.left;
            }
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), gratProj, mapProj);
            centerLatPoints.unshift(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter < 1000 && newPoint.x > this.bounds.left);
        newPoint = mapCenterLL.clone();
        do {
            newPoint = newPoint.offset({ x: llInterval, y: 0 });
            if (newPoint.x > this.bounds.right) {
                newPoint.x = this.bounds.right;
            }
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), gratProj, mapProj);
            centerLatPoints.push(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter < 1000 && newPoint.x < this.bounds.right);

        //now generate a line for each node in the central east and north lines
        //first loop over constant eastings

        //compute y pos for eastings labels, lifting up one row if we are drawing curves
        var yLabelPos = Math.ceil((mapTrBounds.bottom + ((numPoints == 1) ? 0 : llInterval)) / llInterval) * llInterval;
        if (yLabelPos < this.bounds.bottom) {
            yLabelPos = this.bounds.bottom;
        }

        var lines = [];
        var i;
        var j;
        var lat;
        var lon;
        var pointList = [];
        var labelPoint = null;
        var gridPoint;
        var labelPos;
        var labelText;
        var style;
        var geom;

        for (i = 0; i < centerLatPoints.length; ++i) {
            lon = centerLatPoints[i].x;
            if (lon < this.bounds.left || lon > this.bounds.right) {
                continue;
            }

            var latEnd = Math.min(centerLonPoints[0].y, this.bounds.top);
            var latStart = Math.max(centerLonPoints[centerLonPoints.length - 1].y, this.bounds.bottom);
            var latDelta = (latEnd - latStart) / numPoints;
            lat = latStart;
            for (j = 0; j <= numPoints; ++j) {
                gridPoint = new OpenLayers.Geometry.Point(lon, lat);
                gridPoint.transform(gratProj, mapProj);
                pointList.push(gridPoint);
                lat += latDelta;
                if (gridPoint.y >= mapBounds.bottom && !labelPoint) {
                    labelPoint = gridPoint.clone().transform(mapProj, gratProj);
                }
            }
            if ((this.labelled) && (labelPoint)) {
                labelPos = new OpenLayers.Geometry.Point(labelPoint.x, yLabelPos);
                //labelText = (lon / 1000.0).toString();
				labelText = (lon).toString();
                style = {
                    label: this.labelled ? labelText : ""
                };
                OpenLayers.Util.extend(style, this.labelStyle);

                labelPos.transform(gratProj, mapProj);

                this.gratLayer.addFeatures(new OpenLayers.Feature.Vector(labelPos, null, style));
            }
            geom = new OpenLayers.Geometry.LineString(pointList);
            lines.push(new OpenLayers.Feature.Vector(geom, null, this.lineStyle));

            pointList = [];
            labelPoint = null;
        }

        //now draw the lines of constant northings

        //compute x pos of northings labels
        var xLabelPos = Math.floor((mapTrBounds.right) / llInterval) * llInterval;
        if (xLabelPos > this.bounds.right) {
            xLabelPos = this.bounds.right;
        }

        for (j = 0; j < centerLonPoints.length; ++j) {
            lat = centerLonPoints[j].y;
            if (lat < this.bounds.bottom || lat > this.bounds.top) {
                continue;
            }

            var lonStart = Math.max(centerLatPoints[0].x, this.bounds.left);
            var lonEnd = Math.min(centerLatPoints[centerLatPoints.length - 1].x, this.bounds.right);
            var lonDelta = (lonEnd - lonStart) / numPoints;
            lon = lonStart;
            labelPoint = null;
            for (i = 0; i <= numPoints; ++i) {
                gridPoint = new OpenLayers.Geometry.Point(lon, lat);
                gridPoint.transform(gratProj, mapProj);
                pointList.push(gridPoint);
                lon += lonDelta;
                if (gridPoint.x <= mapBounds.right) {
                    labelPoint = gridPoint.clone().transform(mapProj, gratProj);
                }
            }
            if ((this.labelled) && (labelPoint)) {

                labelPos = new OpenLayers.Geometry.Point(xLabelPos, labelPoint.y);

                // dont plot two labels in same spot
                if (Math.abs(labelPoint.y - yLabelPos) > (llInterval / 2)) {

                    //labelText = (lat / 1000.0).toString();
					labelText = (lat).toString();
                    style = {
                        label: this.labelled ? labelText : ""
                    };
                    OpenLayers.Util.extend(style, this.labelStyle);

                    labelPos.transform(gratProj, mapProj);
                    this.gratLayer.addFeatures(new OpenLayers.Feature.Vector(labelPos, null, style));
                }
            }
            geom = new OpenLayers.Geometry.LineString(pointList);
            lines.push(new OpenLayers.Feature.Vector(geom, null, this.lineStyle));

            pointList = [];
        }
        this.gratLayer.addFeatures(lines);
    },

    CLASS_NAME: "OpenLayers.Control.OSGraticule"
});

