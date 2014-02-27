/*version message*/


var fileTree = new Ext.tree.TreePanel({
		xtype:'treepanel',
		animate:true, 
        autoScroll:true,
        loader: new Ext.tree.TreeLoader({
                dataUrl:'get-nodes.php' 
            }),
        enableDD:true,
        containerScroll: true,
        border: false,
        width: 250,
        height: 300,
        dropConfig: {appendOnly:true}
    });

	
var fileRoot = new Ext.tree.AsyncTreeNode({
                text: title_fileTab_Panel, 
                draggable:false, 
                id:'files'
            });
			
    fileTree.setRootNode(fileRoot);

	fileTree.on('click', function(node, e){
		if(node.attributes.cls=="file")
		{
			Ext.get('file_frame').set({
			src:node.id
			});
			
		}
	});