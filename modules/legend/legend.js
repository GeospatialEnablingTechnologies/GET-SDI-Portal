/**
 * Created by simeon on 11/14/2016.
 */

var legend_translation = {
    el_gr: {
        legend_title: 'Υπόμνημα'
    },
    en_us: {
        legend_title: 'Legend'
    }
}

function init_legend() {
    
    var mapLegend = [{
        xtype: 'panel',
        id: 'legendPanelID',
        region: 'center',
        autoScroll: true,
        iconCls:'maptab_accordion_icon',
        width: 260,
        title: legend_translation[language].legend_title,
        items: [],
        listeners: {
            expand: function () {
                create_wms_legend();
            }
        }

    }];

    Ext.getCmp("maptab_west").insert(1,mapLegend);
}

init_onload_fn.push(init_legend);



function create_wms_legend() {
    Ext.getCmp('legendPanelID').removeAll();

    var overlayers = mapGetlayersBy("isBaseLayer",false);

    for(var i=overlayers.length-1;i>=0;i--)
    {

        var _layer={
            layer:overlayers[i]
        };

        if(_layer.layer.getVisibility()){
            var layerobject = _layer.layer._layerObject;

            var layerTitle = layerobject._layerTitle;
            var layerLegend = layerobject._layerLegend;
            var legendItemComponent = new Ext.Panel({
                    html: "<table ><tr><td>" + layerTitle + "</td></tr><tr><td><img src=\"" + layerLegend + " \" /></td></tr></table>"
                });

            Ext.getCmp('legendPanelID').add(legendItemComponent);
            Ext.getCmp('legendPanelID').doLayout();

        }

    }

}
