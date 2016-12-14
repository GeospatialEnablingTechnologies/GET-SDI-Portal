<?php

    error_reporting(1);

    include("../../../src/proxy/proxy.php");

    $p = new PROXY();

    $p->_url = "http://maps.googleapis.com/maps/api/geocode/json?address=".urlencode($_GET["address"])."&sensor=false&language=".$_GET["langage"];

    $p->get();

    if ($p->o_responseCode == 200){

        print_r($p->o_response);

    }

?>