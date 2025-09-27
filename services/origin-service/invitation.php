<?php
require_once __DIR__ . '/json_response.php';

require 'messages.php';
require 'lock.php';

require 'aes/aes.class.php';     // AES PHP implementation
require 'aes/aesctr.class.php';  // AES Counter Mode implementation

header("Access-Control-Allow-Origin: *");
 

 if($_SERVER['REQUEST_METHOD'] != 'POST' && false){
	endWithError("Only POST requests are supported.");
}

$data = file_get_contents('php://input');
$pem_private_key = file_get_contents('id_rsa');
$private_key = openssl_pkey_get_private($pem_private_key);

$cipher = $data;
$plain = '';

for($i=0;$i<strlen($cipher);$i+=344){	

	$token = substr($cipher,$i,344);
	/*if($action == 'send'){
		json_ok(["message"=>"\1"]);
	}*/
	
	$token = base64_decode($token);
	openssl_private_decrypt($token,$decrypted,$private_key);

	$plain .= $decrypted;
}	

$data = $plain;

//die($plain);

$data = json_decode($plain);

//no-reply@hmdevonline.net
//_&.lN8mBK4?n

mymail();

die('mail sent');

function mymail(){	

	$fromUser = "Haitham Mubarak <myemail@mydomin.net>";
	$joinUrl = "http://hmdevonline.com/services/channel/#auth=ngGaoxrXV1nR4N/EFxwXjf/xAKnvR/VA6uR2FIs6ZAfGfCVCfLZ4NXzQvQGtonTJwo9sdOqt59MskHvMm2X0Q7RoFyk=";
	$toEmailUser = "haitham.mubarak.2015@gmail.com";
	$subject = "Conversation Invitation from $fromUser";

	$message = "
	<html>
	<head>
	<title>$subject</title>
	</head>
	<body>

	<h3>Hi $toEmailUser</h3>

	<p>This email sent to you as an invitation from $fromUser, to join you can use hmdevonline.net
	communication system to exchange messages and video calls between all members who joined
	the invitation as group conference.</p>

	<p>If you wish to join you can click here $joinUrl. Then after that
	you will be prompted to input your email just as your confirmation to 
	join the invitations (the email will be saved to your browswer after
	first time).</p>

	<p>If you received this by mistake, then please report this to the
	system link so the system will block the user from sending more
	invitations to you.</p>

	</body>
	</html>
	";

	// Always set content-type when sending HTML email
	$headers = "MIME-Version: 1.0" . "\r\n";
	$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

	mail($toEmailUser,$subject,$message,$headers);
}


function endResponse($message){
	//header('HTTP/1.1 200 OK');
	die($message);
}

function endWithPending($message){
	header('HTTP/1.1 302 Found');
	die($message);
}

function endWithError($message){
	header('HTTP/1.1 500 Internal Server Error');
	die($message);
}

function endWithInvalidLogin(){
	header('HTTP/1.1 401 Unauthorized');
	die('Invalid Login');
}

function my_debug($message){
	json_ok(["message"=>"\1"]);
	flush();
	ob_flush();
}

function guid16()
{
    if (function_exists('com_create_guid') === true)
        return trim(com_create_guid(), '{}');

    $data = openssl_random_pseudo_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
    return vsprintf('%s%s%s%s%s%s%s%s', str_split(bin2hex($data), 4));
}

function guid32()
{
    $data = openssl_random_pseudo_bytes(32);
    return vsprintf('%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s', str_split(bin2hex($data), 4));
}

class MySecurity{
	
	public static function encrypt($message,$key){
		$myObj =  new stdClass();
		$myObj->cipher = AesCtr::encrypt($message, $key, 128);
		$myObj->md5 = md5($message);
		return json_encode($myObj);
	}
	
	public static function decrypt($cipherMsg,$key){
		$myObj =  json_decode($cipherMsg);
		
		$message = AesCtr::decrypt($myObj->cipher, $key, 128);
		
		if(md5($message) !== $myObj->md5){
			return false;
		}else{
			return $message;
		}

	}
	
}

?>