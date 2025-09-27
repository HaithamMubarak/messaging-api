<?php
require_once __DIR__ . '/json_response.php';

header("Access-Control-Allow-Origin: *");

$pem_private_key = file_get_contents('id_rsa');
$private_key = openssl_pkey_get_private($pem_private_key);

$pem_public_key = openssl_pkey_get_details($private_key)['key'];
$public_key = openssl_pkey_get_public($pem_public_key);

die($pem_public_key);

?>clear