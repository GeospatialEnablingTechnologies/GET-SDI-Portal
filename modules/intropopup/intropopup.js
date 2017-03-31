var intropopup_translations ={
	en_us:{
		title:'Εφαρμογή Θέασης & Αναζήτησης Χωρικών Δεδομένων',
		body:'<p style="margin: 10px;" align="center">Καλώς ήρθατε στην Διαδικτυακή Εφαρμογή <br>Θέασης & Αναζήτησης Χωρικών Δεδομένων. </p> <p align="center"><img src="' + host + 'modules/intropopup/images/get_logo.png" alt="" width="200"></p>'
	},
	el_gr:{
		title:'Εφαρμογή Θέασης & Αναζήτησης Χωρικών Δεδομένων',
		body:'<p style="margin: 10px;" align="center">Καλώς ήρθατε στην Διαδικτυακή Εφαρμογή <br>Θέασης & Αναζήτησης Χωρικών Δεδομένων. </p> <p align="center"><img src="' + host + 'modules/intropopup/images/get_logo.png" alt="" width="200"></p>'
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
	closable:false,
	layout:'fit',
	buttonAlign : 'center',
	items:[{
		xtype:'panel',
		border:false,
		html:intropopup_translations[language].body
	}],
	buttons: [{
		text     : 'Είσοδο στην Εφαρμογή',
		handler  : function(){
			intropopup.close();
		}
	}]
});

function intropopup_init()
{
	intropopup.show();
	
}

init_onloadfinished_fn.push(intropopup_init);
