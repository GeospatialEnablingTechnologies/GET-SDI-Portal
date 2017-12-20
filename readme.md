GET SDI Portal v4.5
===================
**GET SDI Portal**, is a web mapping application providing a comprehensive platform for viewing, downloading, analyzing, querying, editing and styling data originating from multiple geospatial sources. It constitutes a simple and ready to deploy solution for any organization who wants to setup a Geoportal based on **ISO/OGC** Standards.

**GET SDI Portal** has been developed in order to support the implementation of the **Infrastructure for Spatial Information for Europe (INSPIRE) Directive (2007/2/EC)**, as well as to serve needs of organizations targeting to share their geospatial resources. Its modular architecture allows implementing widgets for the realization of specific functionalities, integrated smoothly in a configurable and easy to use web application.

----------

Requirements
------------
HTTP Web Server with PHP>=5.3.0

Installation
-------------
1. Copy the folder inside to your web server 
2. Enable php_curl, php_xsl, php_gd2 extensions in the php.ini file
3. Restart your web server

Configuration
-------------
The new version of the GET SDI Portal, provides an easy way to configure your map. Just follow the below steps:

1. Open your application through a browser.
2. Create groups and subgroups as needed, by pressing right click on the 'Layer' node inside the layer tree panel.
3. Add your layers through the 'Service Manager' Window by pressing the 'add' button in the layer tree panel.
4. Reorder and place the layers inside the desired groups.
5. Press right click on a layer node and select 'Configurator' from the pop-up menu.
6. Change the properties of the layer's attributes as needed.
7. Press the 'Save Configuration' button located on the toolbar menu.
8. Replace the 'config' file located inside the /js folder with the new one.
9. Refresh the browser.
> **Note:** To remove the 'Save Configuration' button, just comment "modules/configurator/configurator.js", inside the /js/loader.js file as shown.
```
	
	"modules/layerdownload/layerdownload.js",
	
	//"modules/configurator/configurator.js",
	
	"modules/datatable/datatable.js",
```

Inside the 'loader.js' you can add or remove all the modules as needed by comment them or not.

> **Note:** Modules that require Google API, are commented out by default due to Google's terms of use. Refer to https://developers.google.com/maps/terms. 
