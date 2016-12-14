/**
 * Created by simeon on 11/14/2016.
 */


function init_configuration() {

    // Hide Language button
    var maptab_toolbar_navigation_tab = Ext.getCmp('maptab_toolbar_navigation_tab');
    maptab_toolbar_navigation_tab.child('#languageBtn').hide();

    // Expand Basemap tree
    maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_basemaps_node').expand();

    // Set active Basemap
    maptab_west_layer_tree_panel_tree_json_store.getNodeById('maptab_west_layer_tree_panel_tabs_layers_basemaps_node').eachChild(function (node) {
        if (node.isLeaf()) {
            if (node.data.text === 'Google Satellite') {
                maptab_west_layer_check_node(node, true);
            }
        }
    });

    // Hide Metadata tab
    var viewport_center = Ext.getCmp('viewport_center');
    viewport_center.child('#viewport_metadatatab').tab.hide();

    // Set Search tab active
    Ext.getCmp('maptab_north_tabpanel').setActiveTab('maptab_toolbar_search_tab');

    // Toogle Point Info tool
    Ext.getCmp('maptab_toolbar_general_featureInfo').toggle(true);

    // Hide Add/Revome Layer buttons
    // Ext.getCmp('maptab_west_layer_tree_panel_add_btn').hide();
    // Ext.getCmp('maptab_west_layer_tree_panel_remove_btn').hide();

    // Set Legend accordion expand
	//setTimeout(function () {
    //    Ext.getCmp('legendPanelID').expand();
    //}, 2000);
    

}

init_onload_fn.push(init_configuration);

