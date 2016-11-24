var intropopup_translations ={
	en_us:{
		title:'Εφαρμογή Θέασης & Αναζήτησης Δεδομένων Πεδίου',
		body:'<br>Καλώς ήρθατε στην Διαδικτυακή Εφαρμογή Θέασης & Αναζήτησης Δεδομένων Καταγραφής Πεδίου. <br><br>'
	
	},
	el_gr:{
		title:'Εφαρμογή Θέασης & Αναζήτησης Δεδομένων Πεδίου',
		body:'<br>Καλώς ήρθατε στην Διαδικτυακή Εφαρμογή Θέασης & Αναζήτησης Δεδομένων Καταγραφής Πεδίου. <br><br>'
	}
	
}

var intropopup= new Ext.Window({ 
	width:400,
	height:180,
	minWidth:400,
	minHeight:180,
	modal:true,
	shim:true,
	title:intropopup_translations[language].title,
	resizable:false,
	closeAction:'destroy',
	layout:'fit',
	items:[{
		xtype:'panel',
		border:false,
		html:intropopup_translations[language].body
	}]
});

function intropopup_init()
{
	intropopup.show();
	
}

init_onloadfinished_fn.push(intropopup_init);
