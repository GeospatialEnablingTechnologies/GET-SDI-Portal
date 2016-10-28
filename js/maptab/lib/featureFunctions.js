function fn_featureObject(record)
{
	
	var _featureId=record.get("_featureId");

	var _layerId=record.get("_layerId");
	
	var _srsName=record.get("_srsName");
	
	var _featureUrl=record.get("_featureUrl");
	
	var _featureGeomFormat=record.get("_featureGeomFormat");
	
	var feature={
		_featureId:_featureId,
		_layerId:_layerId,
		_srsName:_srsName,
		_featureUrl:_featureUrl,
		_featureGeomFormat:_featureGeomFormat,
		_featureAttributes:""
	};
	
	return feature;

}

function fn_featureColumnModelForGrid(_appendColumns)
{
	var output=new Array();
	
	output=[
	{
		_attributeName:"_featureUrl",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		hideable:false,
		hidden:true
	},
	{
		_attributeName:"_featureGeomFormat",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		hideable:false,
		hidden:true
	},
	{
		_attributeName:"_srsName",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		hideable:false,
		hidden:true
	},{
		_attributeName:"_featureId",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		width:30,
		hideable:false,
		renderer:fn_featureShowOnMapRenderer
	},
	{
		_attributeName:"_featureId",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		width:30,
		hidden:true,
		hideable:false,
		renderer:fn_featureHighlightRenderer
	},
	{
		_attributeName:"_featureId",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		width:30,
		hidden:true,
		hideable:true,
		renderer:fn_featureAddToSelectedRenderer
	},
	{
		_attributeName:"_featureId",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		width:30,
		hideable:false,
		renderer:fn_featureInfoWindowRenderer
	},
	{
		_attributeName:"_featureId",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		width:30,
		hideable:false,
		hidden:false,
		renderer:fn_featureDownloadRenderer
	},
	{
		_attributeName:"_layerId",
		_attributeSortable:false,
		_attributeType:"string",
		_attributeTranslation:"",
		hidden:!admin,
		width:30,
		hideable:false,
		renderer:fn_featureEditRenderer
	}];
	
	if (typeof _appendColumns!="undefined")
	{
		output.push.apply(output, _appendColumns);
	}
	
	return output;
}

var fetureGridTopBarRightBtns = [];

var fetureGridTopBarLeftBtns = [];

function fn_createFetureGridTopBar()
{
	var tbar=[
		'->',
		{
			xtype:'button',
			tooltip:_feature_gridicons_qtip_showOnMap,
			iconCls:'features_toolbar_showonmap',
			hidden:true,
			handler:function()
			{
			
			}
		},
		{
			xtype:'button',
			tooltip:_feature_gridicons_qtip_highlight,
			iconCls:'features_toolbar_highlight',
			hidden:true,
			handler:function()
			{
			
			}
		},
		{
			xtype:'button',
			tooltip:_feature_gridicons_qtip_featureInfoWindow,
			iconCls:'features_toolbar_showinfow',
			handler:function()
			{
				var selected=Ext.getCmp(this.findParentByType("grid").id).getSelectionModel().getSelection();
				
				Ext.each(selected,function(item)
				{
					fn_callFeatureFnFromGrid(item.get("_featureId"),item.get("_layerId"),item.get("_srsName"),item.get("_featureUrl"),item.get("_featureGeomFormat"),'getInfo');
				});
			}
		},
		{
			xtype:'button',
			tooltip:_feature_gridicons_qtip_download,
			iconCls:'features_toolbar_download',
			handler:function()
			{
				featureDownloadArray=[];
			
				var selected=Ext.getCmp(this.findParentByType("grid").id).getSelectionModel().getSelection();
				
				Ext.each(selected,function(item)
				{
					var _feature={
						_featureId:item.get("_featureId"),
						_layerId:item.get("_layerId"),
						_srsName:item.get("_srsName"),
						_featureUrl:item.get("_featureUrl"),
						_featureGeomFormat:item.get("_featureGeomFormat")
					};
				
					featureDownloadArray.push(_feature);
					
				});
				
				var _w=fn_featureDonwloadWindow();
				
				_w.show();
			}
		},
		{
			xtype:'button',
			tooltip:_feature_gridicons_qtip_addtoselected,
			iconCls:'features_toolbar_addtoselected',
			handler:function()
			{
				var selected=Ext.getCmp(this.findParentByType("grid").id).getSelectionModel().getSelection();
				
				Ext.each(selected,function(item)
				{
					maptab_west_selection_panel_grid_add_record(item.get("_featureId"),item.get("_layerId"),item.get("_featureUrl"),item.get("_srsName"),item.get("_featureGeomFormat"));
					
				});
			}
		},
		{
			xtype:'button',
			tooltip:_feature_gridicons_qtip_edit,
			iconCls:'features_toolbar_edit',
			hidden:!admin,
			handler:function()
			{
				var selected=Ext.getCmp(this.findParentByType("grid").id).getSelectionModel().getSelection();
				
				var _features=[];
				
				var _layerId="";
				
				Ext.each(selected,function(item)
				{
					_layerId=item.get("_layerId");
					
					_features.push(item.get("_featureId"));
					
				});
				
				
				fn_maptab_edit_init_edit_from_grid(_layerId,_features);
				
			}
		}
	
	];
	
	tbar.push.apply(fetureGridTopBarLeftBtns, tbar);
	
	tbar.push.apply(tbar, fetureGridTopBarRightBtns);
	
	return tbar;

}

var featureDownloadArray=new Array();

function fn_featureDonwloadWindow()
{
	var _projection_systems=new Array();

	var _config=new _config_init_map();
	
	for(var i=0;i<_config._mapProjections.length;i++)
	{
		var _proj=_config._mapProjections[i];
	
		_projection_systems.push([_proj._title,_proj._epsg]);
	}

	var _w=new Ext.Window({ 
		width:380,
		height:240,
		modal:true,
		resizable:false,
		plain:true,
		layout:'border',
		listeners:
		{
			show:function(cmp)
			{
				if (featureDownloadArray.length>1)
				{
					Ext.getCmp("featuredownload_separately_id").show();
				}else
				{
					Ext.getCmp("featuredownload_separately_id").hide();
				}
				
			},
			hide:function(){
			
				
			}
		},
		items:[{
			xtype:'form',
			region:'center',
			items:[
			{
				xtype:'combo',
				loadMask:true,
				autoScroll:true,
				autoShow: true,
				id:'featuredownload_outputformat_id',
				fieldLabel:_featuredownload_outputformat,
				store: new Ext.data.SimpleStore({
				fields: ['title','value'],
					data: [
						["GML2","GML2"],
						["GML3","GML3"],
						["Shapefile","shape-zip"],
						["JSON","application/json"],
						["JSONP","text/javascript"],
						["CSV","csv"]
					]
				}), 
				displayField: 'title',
				valueField: 'value',
				emptyText:"Shapefile",
				value:"shape-zip",
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				editable: false
			},
			{
				xtype:'combo',
				loadMask:true,
				autoScroll:true,
				autoShow: true,
				id:'featuredownload_charset_id',
				fieldLabel:_featuredownload_charset,
				store: new Ext.data.SimpleStore({
				fields: ['title','value'],
					data: _config._charsets
				}), 
				displayField: 'title',
				valueField: 'value',
				emptyText:"UTF-8",
				value:"UTF-8",
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				editable: false
			},
			{
				xtype:'combo',
				loadMask:true,
				autoScroll:true,
				autoShow: true,
				id:'featuredownload_srs_id',
				fieldLabel:_featuredownload_srs,
				store: new Ext.data.SimpleStore({
				fields: ['title','value'],
					data: _projection_systems
				}), 
				displayField: 'title',
				valueField: 'value',
				emptyText:_config._mapProjections[0]._title,
				value:_config._mapProjections[0]._epsg,
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: false,
				mode: 'local',
				editable: false
			},
			{
				xtype:'checkbox',
				checked:false,
				id:'featuredownload_separately_id',
				labelStyle: 'width:200px',
				fieldLabel:_featuredownload_download_separately
			}],
			bbar:['->',{
				xtype:'button',
				text:_featuredownload_downloadbtn,
				iconCls:'features_toolbar_download',
				handler:function()
				{
					var _outputFormat=Ext.getCmp("featuredownload_outputformat_id").getValue();
					
					var _charset=Ext.getCmp("featuredownload_charset_id").getValue();
					
					var _srs=Ext.getCmp("featuredownload_srs_id").getValue();
					
					var _seperated=Ext.getCmp("featuredownload_separately_id").getValue();
					
					if (_seperated)
					{
						Ext.each(featureDownloadArray,function(item)
						{
							window.open(fn_featureDonwloadCreateFeatureLink(item._layerId,[item._featureId],_outputFormat,_charset,_srs));
						});
					}
					else
					{
						var _featureId=[];
						
						Ext.each(featureDownloadArray,function(item)
						{
							_featureId.push(item._featureId);
						});
						
						window.open(fn_featureDonwloadCreateFeatureLink(featureDownloadArray[0]._layerId,_featureId,_outputFormat,_charset,_srs));
					}
				}
			}]
		}]
	});
	
	return _w;

}

function fn_featureDonwloadCreateFeatureLink(_layerId,_featureId,_outputFormat,_charset,_srs)
{
	
    var url= mapFindLayerById(_layerId)._serviceObject._serviceUrl;
	
	var parser = document.createElement('a');
	
	parser.href = url;
    
    var queries = parser.search.replace(/^\?/, '').split('&');
	
	var q=[];
	
    for( i = 0; i < queries.length; i++ ) {
        
		var split = queries[i].split('=');
		
		var key=split[0];
		
		var value=split[1];
		
		if ((key.toLowerCase()!="service") && (key.toLowerCase()!="version") && (key!=null) && (key!=""))
		{
			q.push(key+"="+value);
		}
    }
	
	q.push("FEATUREID="+_featureId.join(','));
	q.push("OUTPUTFORMAT="+_outputFormat);
	q.push("SRSNAME="+_srs);
	q.push("REQUEST=GETFEATURE");
	q.push("TYPENAMES="+mapFindLayerById(_layerId)._layerObject._layerName);
	q.push("SERVICE=WFS");
	q.push("VERSION=1.1.0");
	
	if (_charset!="")
	{
		q.push("FORMAT_OPTIONS=CHARSET:"+_charset);
	}
	
	var _scheme=parser.protocol;
	
	var _host= parser.host;
	
	var _path= parser.pathname;
	
	var _security="";
	
	if (((mapFindLayerById(_layerId)._serviceObject._username)!=null) && 
	((mapFindLayerById(_layerId)._serviceObject._username)!="") && 
	((mapFindLayerById(_layerId)._serviceObject._password)!="") && 
	((mapFindLayerById(_layerId)._serviceObject._password)!=null))
	{
		_security=mapFindLayerById(_layerId)._serviceObject._username+":"+mapFindLayerById(_layerId)._serviceObject._password+"@";
	}
	
	var host=_scheme+"//"+_security+_host+_path+"?"+q.join('&');

	return host;

}



function fn_createDateAttribute(value, metaData, record, row, col, store, gridView)
{
	if(value!="")
	{
		value = value.replace('Z','');
		
		//value = Ext.Date.format(value,'d/m/Y');
		
	}
	
	return value;
}

function fn_featureEditRenderer(value, metaData, record, row, col, store, gridView)
{
	var _layerId=record.get("_layerId");
	
	var _feature=fn_featureObject(record);
	
	if (mapFindLayerById(_layerId)._layerObject._isEditable)
	{
		return "<img src=\""+host+"images/edit.png\" data-qtip=\""+_feature_gridicons_qtip_edit+"\" onClick=\"fn_maptab_edit_init_edit_from_grid('"+_layerId+"',['"+_feature._featureId+"']);\">";
	}
	return "";
}

function fn_featureShowOnMapRenderer(value, metaData, record, row, col, store, gridView)
{
	var _feature=fn_featureObject(record);

	return "<img src=\""+host+"images/show.png\" class=\"column_grid_images\" data-qtip=\""+_feature_gridicons_qtip_showOnMap+"\" onClick=\"fn_featureShowOnMap('"+_feature._featureId+"','"+_feature._layerId+"','"+_feature._srsName+"','"+_feature._featureUrl+"','"+_feature._featureGeomFormat+"','');\">";
}

function fn_featureShowOnMap(_featureId,_layerId,_srsName,_featureUrl,_featureGeomFormat,fn_param)
{
	if(mapGetFeatureByFid(_layerId,_featureId)!=null)
	{
		var _fetaure_Extent=mapGetFeatureByFid(_layerId,_featureId).geometry.getBounds();
		
		map.zoomToExtent(_fetaure_Extent);
	}
	else
	{
	
		switch(_featureGeomFormat)
		{
			case "gml":
				var p=new fn_get();
					
				p._async=false;
				
				p._url=fn_surl(_featureUrl,mapFindLayerById(_layerId)._serviceObject._username,mapFindLayerById(_layerId)._serviceObject._password,"getfeatures&method=get");
				
				p._timeout=5000;
				
				var url=p._url;
				
				var _xy=mapFindLayerById(_layerId)._layerObject._xy;
				
				if(url.indexOf("GETFEATUREINFO")>=0)
				{
					_xy=true;
				}
					
				p._success=function(_response, _opts){
					
					var gmlReader = new OpenLayers.Format.GML({
						extractAttributes: true,
						internalProjection:new OpenLayers.Projection(mapGetCurrentProjection()),
						externalProjection: new OpenLayers.Projection(mapFindLayerById(_layerId)._layerObject._nativeSRS),
						xy:_xy
					});
							
					var features = gmlReader.read(_response.responseText);
					
					setTimeout(function()
					{
						map.zoomToExtent(features[0].geometry.getBounds());
					},500);
				};
					
				p.get();
			break;
			
			case "esriJSON":
				
				var feature={
						_featureId:_featureId,
						_layerId:_layerId,
						_srsName:_srsName,
						_featureUrl:_featureUrl,
						_featureGeomFormat:_featureGeomFormat,
						_featureAttributes:""
					};
				
				arcgis93resFetchESRIJSON(feature,"showonmap");
				
			break;
		
		}
	}
}

function fn_featureHighlightRenderer(value, metaData, record, row, col, store, gridView)
{
	var _feature=fn_featureObject(record);
	
	return "<img src=\""+host+"images/highlight.png\" class=\"column_grid_images\" onClick=\"fn_featureHighlight('"+_feature._featureId+"','"+_feature._layerId+"','"+_feature._srsName+"','"+_feature._featureUrl+"','"+_feature._featureGeomFormat+"','');\" data-qtip=\""+_feature_gridicons_qtip_highlight+"\">";
}

function fn_featureIsHiglighted(_featureId,_layerId)
{
	if (mapGetFeatureByFid(map_highlightLayer.id,_featureId))
	{
		return true;
	}
	else
	{
		return false;
	}
}

function fn_featureUnHiglighted(_featureId,_layerId)
{
	if (mapGetFeatureByFid(map_highlightLayer.id,_featureId))
	{
		map_highlightLayer.removeFeatures([mapGetFeatureByFid(map_highlightLayer.id,_featureId)]);
		
	}
}

function fn_toggleHightlightFromAllResultsGrids(_featureId,_layerId,_gridId)
{
	Ext.each(fn_grid_results_ids_array,function(item)
	{
		if (item!=_gridId)
		{
			Ext.getCmp(_gridId).getStore().each(function(record){
				
				var _r=Ext.getCmp(item).getStore().findRecord('_featureId', record.get("_featureId"));
				
				if (mapGetFeatureByFid(map_highlightLayer.id,record.get("_featureId")))
				{
					if(_r)
					{
						Ext.getCmp(item).getSelectionModel().select(_r,true,true);
					}
				}
				else
				{
					if(_r)
					{
						Ext.getCmp(item).getSelectionModel().deselect(_r,true);
					}
				}
				
			});
		}
	});
}


function fn_featureHighlight(_featureId,_layerId,_srsName,_featureUrl,_featureGeomFormat,fn_param)
{
	if (mapGetFeatureByFid(map_highlightLayer.id,_featureId)==null)
	{
		if (mapGetFeatureByFid(_layerId,_featureId))
		{
			var _cloneFeature=mapGetFeatureByFid(_layerId,_featureId).clone();
			
			_cloneFeature.fid=_featureId;
			
			_cloneFeature.attributes=mapGetFeatureByFid(_layerId,_featureId).attributes;
		
			map_highlightLayer.addFeatures(_cloneFeature);
		}
		else
		{
		
			switch(_featureGeomFormat)
			{
			
				case "gml":
					var p=new fn_get();
					
					p._async=false;
					
					p._url=fn_surl(_featureUrl,mapFindLayerById(_layerId)._serviceObject._username,mapFindLayerById(_layerId)._serviceObject._password,"getfeatures&method=get");
					
					p._timeout=5000;
					
					var url=p._url;
					
					var _xy=mapFindLayerById(_layerId)._layerObject._xy;
				
					if(url.indexOf("GETFEATUREINFO")>=0)
					{
						_xy=true;
					}
					
					p._success=function(_response, _opts){
					
						var gmlReader = new OpenLayers.Format.GML({
							extractAttributes: true,
							internalProjection:new OpenLayers.Projection(mapGetCurrentProjection()),
							externalProjection: new OpenLayers.Projection(mapFindLayerById(_layerId)._layerObject._nativeSRS),
							xy:_xy
						});
						
						var features = gmlReader.read(_response.responseText);
						
						map_highlightLayer.addFeatures(features);
					};
					
					p.get();
			
				break; 
				
				case "esriJSON":
				
					var feature={
						_featureId:_featureId,
						_layerId:_layerId,
						_srsName:_srsName,
						_featureUrl:_featureUrl,
						_featureGeomFormat:_featureGeomFormat,
						_featureAttributes:""
					};
				
					arcgis93resFetchESRIJSON(feature,"highlight");

				break;
			
			}
		}
		
		if (fn_param!="")
		{
			fn_param(_featureId,_layerId,_featureUrl,_featureGeomFormat);
		}
	}
}

function fn_featureInfoWindowRenderer(value, metaData, record, row, col, store, gridView)
{
	var _feature=fn_featureObject(record);
	
	return "<img src=\""+host+"images/featureInfoWindow.png\" class=\"column_grid_images\" onClick=\"fn_callFeatureFnFromGrid('"+_feature._featureId+"','"+_feature._layerId+"','"+_feature._srsName+"','"+_feature._featureUrl+"','"+_feature._featureGeomFormat+"','getInfo');\" data-qtip=\""+_feature_gridicons_qtip_featureInfoWindow+"\">";
}

function fn_callFeatureFnFromGrid(_featureId,_layerId,_srsName,_featureUrl,_featureGeomFormat,fn_param)
{
	
	var feature={
		_featureId:_featureId,
		_layerId:_layerId,
		_srsName:_srsName,
		_featureUrl:_featureUrl,
		_featureGeomFormat:_featureGeomFormat
	};
	
	switch(fn_param)
	{
		case "getInfo":
			fn_featureInfoWindow(feature).show();
		break;
	}
}

function fn_featureDownloadRenderer(value, metaData, record, row, col, store, gridView)
{
	var _feature=fn_featureObject(record);

	if (mapFindLayerById(_feature._layerId)._serviceObject._isService)
	{
		return "<img src=\""+host+"images/download.png\" class=\"column_grid_images\"  onClick=\"fn_featureDownload('"+_feature._featureId+"','"+_feature._layerId+"','"+_feature._srsName+"','"+_feature._featureUrl+"','"+_feature._featureGeomFormat+"');\" data-qtip=\""+_feature_gridicons_qtip_download+"\">";
	}
	
	return "";
}

function fn_featureDownload(_featureId,_layerId,_srsName,_featureUrl,_featureGeomFormat)
{
	featureDownloadArray=[];

	var _feature={
		_featureId:_featureId,
		_layerId:_layerId,
		_srsName:_srsName,
		_featureUrl:_featureUrl,
		_featureGeomFormat:_featureGeomFormat
	};
	
	featureDownloadArray.push(_feature);

	var _w=new fn_featureDonwloadWindow();
	
	_w.show();
}

function fn_featurehowOnlySelectedOnMap(_feature)
{
	
}

function fn_featureAddToSelectedRenderer(value, metaData, record, row, col, store, gridView)
{
	var _feature=fn_featureObject(record);
	
	return "<img src=\""+host+"images/addToSelected.png\" class=\"column_grid_images\" onClick=\"fn_featureAddToSelected('"+_feature._featureId+"','"+_feature._layerId+"','"+_feature._featureUrl+"','"+_feature._srsName+"','"+_feature._featureGeomFormat+"');\" data-qtip=\""+_feature_gridicons_qtip_addtoselected+"\">";
}

function fn_featureAddToSelected(_featureId,_layerId,_featureUrl,_srsName,_featureGeomFormat)
{
	maptab_west_selection_panel_grid_add_record(_featureId,_layerId,_featureUrl,_srsName,_featureGeomFormat);
}



function fn_createAttributePanel(_feature)
{
	var a="";
	
	if(mapGetFeatureByFid(_feature._layerId,_feature._featureId)!=null)
	{
		a=fn_createAttributesPivotGrid(_feature);
		
		if (_feature._featureGeomFormat=="CUSTOM")
		{
			var _attributesFields = new Array();
		
			for(var k in mapGetFeatureByFid(_feature._layerId,_feature._featureId).attributes)
			{
				_attributesFields.push({
					"_attributeName":k.toString(),
					"_attributeType":"string",
					"_attributeTranslation":null,
					"_attributeValue":null,
					"_attributeEditor":null,
					"_attributeIsSortable":true,
					"_attributeOrder":0,
					"_attributeIsVisible":true,
					"_attributeIsSearchable":true,
					"_attributeIsGeometry":false,
					"_attributeVisible":true,
					"_geometryIsMulti":false,
					"_attributeShowOnSummary":false
				});
				
			}
			
			var _attributes=fn_createAttributesRecords(mapGetFeatureByFid(_feature._layerId,_feature._featureId).attributes,_attributesFields);
				
			a.getStore().loadData(_attributes);
		
		}else{
	
			
	
			var _attributes=fn_createAttributesRecords(mapGetFeatureByFid(_feature._layerId,_feature._featureId).attributes,mapFindLayerById(_feature._layerId)._layerObject._attributesFields);
			
		
			a.getStore().loadData(_attributes);
		}
	
	}
	else
	{
	
		a=fn_createAttributesPivotGrid(_feature);
	
		var p=new fn_get();
				
		p._async=true;				
		
		var _servicePort="";
		
		if(typeof mapFindLayerById(_feature._layerId)._serviceObject._servicePort!=="undefined")
		{
			_servicePort = mapFindLayerById(_feature._layerId)._serviceObject._servicePort;
		}
		
		p._data=[{
			_layerId:_feature._layerId,
			_serviceType:mapFindLayerById(_feature._layerId)._serviceObject._serviceType,
			_serviceName:mapFindLayerById(_feature._layerId)._serviceObject._serviceName,
			_servicePort:_servicePort,
			_username:mapFindLayerById(_feature._layerId)._serviceObject._username,
			_serviceUrl:mapFindLayerById(_feature._layerId)._serviceObject._serviceUrl,
			_password:mapFindLayerById(_feature._layerId)._serviceObject._password,
			_layerName:mapFindLayerById(_feature._layerId)._layerObject._layerName,
			_version:mapFindLayerById(_feature._layerId)._serviceObject._version,
			_isService:mapFindLayerById(_feature._layerId)._serviceObject._isService,
			_featureType:mapFindLayerById(_feature._layerId)._layerObject._featureType,
			_cqlFilter:mapFindLayerById(_feature._layerId)._layerObject._cqlFilter,
			_featureInfoFormat:mapFindLayerById(_feature._layerId)._serviceObject._featureInfoFormat,
			_featureUrl:_feature._featureUrl,
			_request:"getAttributes"
		}]
				
		p._timeout=5000;
				
		p._success=function(_response, _opts){
				
			var _response=Ext.JSON.decode(_response.responseText)[0];
				
			var t_attributes=_response._response._attributes[0][0];
					
			var _attributes=fn_createAttributesRecords(t_attributes,mapFindLayerById(_feature._layerId)._layerObject._attributesFields);
					
			a.getStore().loadData(_attributes);
				
		};
				
		p.get();
		
	}
	
	
	return a;
}


function fn_fetchGML(_feature)
{

	var _output;

	if(mapGetFeatureByFid(_feature._layerId,_feature._featureId)!=null)
	{
		_output=mapGetFeatureByFid(_feature._layerId,_feature._featureId);
	}
	else
	{
	
		switch(_feature._featureGeomFormat)
		{
		
			case "gml":
			
				var p=new fn_get();
						
				p._async=false;
				
				p._url=fn_surl(_feature._featureUrl,mapFindLayerById(_feature._layerId)._serviceObject._username,mapFindLayerById(_feature._layerId)._serviceObject._password,"getfeatures&method=get");
						
				p._timeout=5000;
				
				var url=p._url;
				
				var _xy=mapFindLayerById(_feature._layerId)._layerObject._xy;
				
				if(url.indexOf("GETFEATUREINFO")>=0)
				{
					_xy=true;
				}
						
				p._success=function(_response, _opts){
						
					var gmlReader = new OpenLayers.Format.GML({
						extractAttributes: true,
						internalProjection:new OpenLayers.Projection(mapGetCurrentProjection()),
						externalProjection: new OpenLayers.Projection(mapFindLayerById(_feature._layerId)._layerObject._nativeSRS),
						xy:_xy
					});
							
					_output=gmlReader.read(_response.responseText)[0];
							
				};
						
				p.get();
			
			break;
			
			case "esriJSON":
			
				_output = arcgis93resFetchESRIJSON(_feature,"");
				
			break;
		
		}
			
	}
	
	return _output;
}

function fn_featureCreateMiniMap(_feature,_mapId,_layerId)
{
	var mini_map = new OpenLayers.Map(_mapId, {controls: []});
				
	mini_map.addControl(new OpenLayers.Control.Navigation());
	
	var _map_config_object=new _config_init_map();
	
	for(var k=0;k<_map_config_object._basemapLayers.length;k++)
	{
		mini_map.addLayer(_map_config_object._basemapLayers[k]._layer);
	}	
	
	var featurelayer=new OpenLayers.Layer.Vector("featureLayer",{
		displayInLayerSwitcher:false,
		styleMap:new OpenLayers.StyleMap({
			"default":new OpenLayers.Style({
				pointRadius: 5, 
				fillColor: "#FFCB50",
				fillOpacity: 0.4, 
				strokeColor:  "#FF9428",
				strokeWidth: 1,
				strokeOpacity:0.8
			})
		})
	});
	
	mini_map.addLayer(featurelayer);
	
	mini_map.addControl(new OpenLayers.Control.LayerSwitcher());
	
	var mini_map_previousMapExtent;
	
	var mini_map_previousMapProjection=mini_map.getProjectionObject().toString();
		
	var mini_map_map_currentMapProjection=mini_map.getProjectionObject().toString();
	
	var _f=_feature.clone();
	
	if (mapGetProjectionCode(mapGetCurrentProjection())!=mapGetProjectionCode(mini_map_map_currentMapProjection))
	{
		_f.geometry.transform(new OpenLayers.Projection(mapGetCurrentProjection()),new OpenLayers.Projection(mapGetProjectionCode(mini_map.getProjectionObject().toString())));
	}
	
	mini_map.events.on({
		"changebaselayer":function(evtObj)
		{
			mini_map_map_currentMapProjection=mini_map.getProjectionObject().toString();
		
			if (mapGetProjectionCode(mini_map_previousMapProjection)!=mapGetProjectionCode(mini_map_map_currentMapProjection))
			{
				_f.geometry.transform(new OpenLayers.Projection(mini_map_previousMapProjection),new OpenLayers.Projection(mapGetProjectionCode(mini_map_map_currentMapProjection)));
			}
		
			featurelayer.refresh();
			
			mini_map.zoomIn();
				
			mini_map.zoomOut();
			
			mini_map_previousMapProjection=mini_map.getProjectionObject().toString();
			
			mini_map.zoomToExtent(featurelayer.getDataExtent());
			
		}
	});

	
	featurelayer.addFeatures(_f);
	
	setTimeout(function()
	{
		mini_map.zoomToExtent(_f.geometry.getBounds());
		
		if(mini_map.getZoom()>12)
		{
			//mini_map.zoomTo(12);
		}
		
	},500);
	
}

function fn_createGeometryPanel(_theFeature,_feature)
{
	var _g="";
	
	if (_theFeature)
	{
		var _data=[];
		
		var i=1;
		
		var _theFeatureClone=_theFeature.clone();
		
		var _theGeometry=_theFeatureClone.geometry;
		
		if (_theGeometry!=null)
		{
			if (mapGetProjectionCode(mapFindLayerById(_feature._layerId)._layerObject._nativeSRS)!=mapGetCurrentProjection())
			{
				_theGeometry=_theGeometry.transform(new OpenLayers.Projection(mapGetCurrentProjection()),new OpenLayers.Projection(mapGetProjectionCode(mapFindLayerById(_feature._layerId)._layerObject._nativeSRS)));
			}
		
	
			var _config=new _config_init_map();

			var _numDigitsIndex=fn_objIndexOf(_config._mapProjections,"_epsg",mapGetProjectionCode(mapFindLayerById(_feature._layerId)._layerObject._nativeSRS));
			
			var _numDigits;
			
			if(_numDigitsIndex>=0)
			{
				_numDigits=_config._mapProjections[_numDigitsIndex]._numDigits;
			}
			
			if (typeof _theGeometry.components=="undefined")
			{
				if (typeof _numDigits!=="undefined")
				{
					var x = _theGeometry.x;
					var y = _theGeometry.y;
				
					_data.push([x.toFixed(_numDigits),y.toFixed(_numDigits),0]);
					
				}else{
					_data.push([_theGeometry.x,_theGeometry.y,0]);
				}
			}
			else
			{
				Ext.each(_theGeometry.components, function(item)
				{
					var _vertices=item.getVertices();
					
					for(var a=0;a<_vertices.length;a++)
					{
					
						var x = _vertices[a].x;
						var y = _vertices[a].y;
					
						if (typeof _numDigits!=="undefined")
						{
							_data.push([x.toFixed(_numDigits),y.toFixed(_numDigits),i]);
						}else{
							_data.push([x,y,i]);
						}
					}
					
					i++;
					
				});
			}
			
			var _s=new Ext.data.SimpleStore({
				fields: ['lon','lat','componentNum'],
				data: _data
			});
			
			_s.group("componentNum");
			
			_g=Ext.create('Ext.grid.Panel',
			{
				border:true,
				columnLines:true,
				split: true,
				store:_s,
				_feature:_feature,
				columns:[{
					header:_feature_geometry_lon,
					dataIndex: 'lon',
					hidden:false,
					sortable:false,
					flex:2,
					hideable:false
				},
				{
					header:_feature_geometry_lat,
					dataIndex:'lat',
					flex:2,
					hidden:false,
					sortable:false,
					hideable:false
				},
				{
					header:'',
					dataIndex: 'componentNum',
					hidden:true,
					hideable:false
				}],
				tbar:[
					{
						xtype:'label',
						text:_feature_projection_system+": "+mapGetProjectionCode(mapFindLayerById(_feature._layerId)._layerObject._nativeSRS)
					}
				],
				features: [{
					ftype: 'grouping',
					groupHeaderTpl: [
						'{name:this.formatName}',
						{
							formatName: function(name) {
								return _feature_geometry_component+":"+name;
							}
						}
					]
				}]
			});
		}
	}

	return _g;
}

function fn_createDetailsPanel(_feature)
{
	var d;
	
	return d;
}

var init_featureInfoWindow_tabs = new Array();

var init_featureInfoWindow_bbar = new Array();

var init_featureInfoWindow_tbar = new Array();

var init_featureInfoWindow_btns = new Array();

var featureInfoWindow_isMinimized=false;

function fn_featureInfoWindow(_feature)
{

	var _w_id = Ext.id();

	var attributes = "";
	
	var geometry = "";
	
	var _theFeature = "";
	
	var _tabsItems = [];
	
	attributes = fn_createAttributePanel(_feature);
	
	_theFeature = fn_fetchGML(_feature);

	geometry = fn_createGeometryPanel(_theFeature,_feature);
	
	var a=Ext.create('Ext.Panel',
	{
		title:_maptab_featureInfoWindow_Attributes_Tab_title,
		border:false,
		id:"attributes_panel_"+_w_id,
		layout:'fit',
		items:[
			attributes
		]
	});
	
	_tabsItems.push(a);
	
	var mapid=Ext.id();
	
	var m = "";
	
	if (geometry!="")
	{
		m = Ext.create('Ext.Panel',
		{
			title:_maptab_featureInfoWindow_Map_Tab_title,
			border:false,
			id:"minimap_panel_"+_w_id,
			_isFirstTime:true,
			layout:'fit',
			listeners:{
				boxready:function(){
				
					if (this._isFirstTime)
					{
						fn_featureCreateMiniMap(_theFeature,mapid,_feature._layerId);
						
						this._isFirstTime=false;
						
					}
				}
			},
			items:[{
				xtype:'panel',
				html:"<div id=\""+mapid+"\" style=\"width:100%;height:100% !important;\"></div>"
			}]
		});
		
		_tabsItems.push(m);
	}
	
	var g="";
	
	if(geometry!="")
	{
		g=Ext.create('Ext.Panel',
		{
			title:_maptab_featureInfoWindow_Geometry_Tab_title,
			border:false,
			id:"geometry_panel_"+_w_id,
			layout:'fit',
			items:[
				geometry
			]
		});
		
		_tabsItems.push(g);
	}
		
	var details=fn_createDetailsPanel(_feature);
		
	var d=Ext.create('Ext.Panel',
	{
		title:_maptab_featureInfoWindow_Details_Tab_title,
		border:false,
		layout:'fit',
		items:[
			details
		]
	});
	
	
	var	_tabs={
		xtype:'tabpanel',
		region:'center',
		layout:'fit',
		_feature:_feature,
		border:false,
		items:_tabsItems
	};
	
	
	
	var i=new Ext.Window({ 
		width:440,
		height:405,
		id:_w_id,
		title:_maptab_featureInfoWindow_title,
		plain:true,
		bbar:init_featureInfoWindow_bbar,
		tbar:init_featureInfoWindow_tbar,
		_feature:_feature,
		shim:true,
		layout:'border',
		closeAction:'destroy',
		minimizable:true,
		constrain:true,
		resizable:{
			listeners:{
				resize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().unmask();
				},
				beforeresize:function()
				{
					Ext.getCmp('maptab_mapPanel').getEl().mask().dom.style.zIndex = Ext.getCmp(_w_id).getEl().dom.style.zIndex;	
				}
			}
		},
		listeners:{
			destroy:function(){
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
			},
			show: function(window, eOpts) {
				window.tools.restore.hide();
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
            },
			"minimize": function (window, opts) {
				window.tools.restore.show();
				window.tools.minimize.hide();
                window.collapse();
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
            },
			render:function(w){
				Ext.each(init_featureInfoWindow_tabs,function(item)
				{
					if(item)
					{
						var _t = item(w);
						
						if ((_t!=null) && (_t!="")){
						
							w.items.items[0].items.items[0].add(_t);
						}
					}
				});
			}
		},
        tools: [{
            type: 'restore',
            handler: function (evt, toolEl, owner, tool) {
                var window = owner.up('window');
				window.tools.restore.hide();
				window.tools.minimize.show();
                window.expand('', false);
				Ext.getCmp('maptab_mapPanel').getEl().unmask();
            }
        }],
		items:[{
			xtype:'panel',
			region:'center',
			layout:'border',
			items:[_tabs]
		}]
	});
	
	return i;
}

function fn_createPhotoAttribute(value, metaData, record, row, col, store, gridView)
{
	if(value!="")
	{
		if (value!=null)
		{
			if (value.indexOf("http")>=0)
			{
				value="<a href=\""+value+"\" target=\"new\"><img src=\""+value+"\" style=\"width:100%;\"></a>";
			}else{
				value="<a href=\""+host+value+"\" target=\"new\"><img src=\""+host+value+"\" style=\"width:100%;\"></a>";
			}
		}
	}
	
	return value;
}

function fn_createLinkAttribute(value, metaData, record, row, col, store, gridView)
{
	if(value!="") 
	{
	
		if (value!=null)
		{
			var valueArr = value.split(', ');
			
			value="";
			
			for(var i=0;i<valueArr.length;i++)
			{
				value+="<a href=\""+valueArr[i]+"\" target=\"new\">"+valueArr[i]+"</a>";
			}
		}
	}
	
	return value;
}

function fn_createMailAttribute(value, metaData, record, row, col, store, gridView)
{
	if(value!="")
	{
		if (value!=null)
		{
			var valueArr = value.split(', ');
			
			value="";
			
			for(var i=0;i<valueArr.length;i++)
			{
				value+="<a href=\"mailto:"+valueArr[i]+"\" target=\"new\">"+valueArr[i]+"</a>";
			}
		}
	}
	
	return value;
}






