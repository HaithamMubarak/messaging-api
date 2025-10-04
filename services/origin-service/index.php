<?php
require_once __DIR__ . '/json_response.php';

require 'messages.php';
require 'lock.php';


require 'aes/aes.class.php';     // AES PHP implementation
require 'aes/aesctr.class.php';  // AES Counter Mode implementation

class AgentSessionStatus {
    const AVAILABLE = 'AVAILABLE';
    const NOT_AVAILABLE = 'NOT_AVAILABLE';
    const AVAILABLE_KNOWN = 'AVAILABLE_KNOWN';
}

function getCurrentTime()
{
    if(function_exists("microtime")){
        return round(microtime(true) * 1000);
    }else{
        return (time()) * 1000;
    }
}

ignore_user_abort(false);
error_reporting(E_ERROR | E_PARSE);
//error_reporting(E_ALL ^ E_WARNING);

$oldFileLifeTime = 24 * 60 * 60;

//5 minutes of timeout
set_time_limit(5 * 30);

// set default to utc
//date_default_timezone_set("UTC");

header("Access-Control-Allow-Origin: *");

$action = isset($_GET["action"])?htmlspecialchars($_GET["action"]):"";
$usePubKey = strtolower((isset($_GET["use-pubkey"]) ? $_GET["use-pubkey"]:'false')) == 'true';

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
	json_error("Unsupported Request Method");
}else{
	  $data = isset($_GET["data"])?htmlspecialchars($_GET["data"]):file_get_contents('php://input');
}

if($usePubKey){

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
	$data = json_decode($plain);

}else{
    $data = json_decode($data);
}

error_log("Custom log message from PHP script " . json_encode($data) );

try{

	$controller = new ChannelController($data->session);

	switch($action){

		case 'agent-info':

			$controller->connect();
			$data->channelPassword = $controller->getChannelPassword();
			$response = $controller->getAgentInfo($data->agentName);

			json_ok(json_encode($response));
			break;
		case 'active-agents':

			$controller->connect();

			$data->channelPassword = $controller->getChannelPassword();

			$receivedData = $controller->getActiveAgents();

			json_ok(json_encode($receivedData));
			break;
		case 'connect' :

			$newSession = $controller->setupSession($data->channelName,$data->channelPassword,$data->agentName, $data->agentContext);

			$controller->connect();

			$sessionId = $controller->sessionId;
			$channelId = $controller->channelId;

			$activeAgents = $controller->getActiveAgents();

			if(sizeof($activeAgents) <= 1){
				$controller->dispatch('clear-events');
			}

            if ($newSession)
            {
			    $controller->dispatch('connect');
            }
            else
            {
                $controller->dispatch('re-connect');
            }
            $connectResponse = json_encode([
                    "channelId" => $channelId,
                    "sessionId" => $sessionId,
                    "role" => $role,
                    "date" => getCurrentTime()
            ]);
			json_ok($connectResponse);
		    break;

		case 'event' :
			$controller->connect();
			$controller->dispatch($data);
			json_ok(null, "Success");
            break;

		case 'receive' :
			$controller->connect();
			$data->channelPassword = $controller->getChannelPassword();
			$receivedData = $controller->receive($data->range);
			json_ok(json_encode($receivedData));
		    break;

		case 'disconnect' :
			$controller->connect($data->session);
			$controller->dispatch('disconnect');
			$controller->disconnect();
			json_ok(null, "Success");

		    break;

		default :
			json_error('Operation Not Supported');
		break;
	}


}catch(Exception $e){
	json_error($e->getMessage());
}

class ChannelController{

	public static $PARENT_PATH = './channels';
	public static $SESSION_CHANNEL_MAP_PATH = './channels/map';
	public static $long_poll_enable = false;

	// Max count for active usrs
	public static $MAX_ACTIVE_AGENTS = 5;

	// Timeout idle session in seconds
	public static $SESSION_INACTIVE_TIMEOUT = 2 * 60;

	function __construct($sessionId=NULL){

		if(!file_exists(self::$PARENT_PATH)){
			mkdir(self::$PARENT_PATH, 0777, true);
		}

		if(!file_exists(self::$PARENT_PATH."/.htaccess")){
			$htacessContents = "<files *>\n\tdeny from all\n</files>";
			write_to_file(self::$PARENT_PATH."/.htaccess",$htacessContents);
		}

		if(!file_exists(self::$SESSION_CHANNEL_MAP_PATH)){
			mkdir(self::$SESSION_CHANNEL_MAP_PATH, 0777, true);
		}

		$this->sessionId = $sessionId;
	}

	function connect(){

		if(!$this->sessionId){
			throw new Exception('Session parameter is not defined');
		}

		$this->channelId = read_file(self::$SESSION_CHANNEL_MAP_PATH.'/'.$this->sessionId);
		$this->channelLocker = new FileLock($this::channelLockPath($this->channelId));
		//die('C');
		$this->sessionLocker = new FileLock($this::channelSessionsLocksPath($this->sessionId));
			//die('B:: '.$this::channelSessionsLocksPath($this->sessionId));
		if(!$this->sessionLocker->lock(false)){
			throw new Exception('Session Lock error');
		}

		$this->renewSession();
	}

    function getClientIP() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            // Can contain multiple IPs, take the first one
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ips[0]);
        } else {
            return $_SERVER['REMOTE_ADDR'];
        }
    }

	function setupSession($channelName,$channelPassword,$agentName, $agentContext){

	    $newSession = true;
		if(!$channelName){
			throw new Exception("Channel name is required for connection");
		}
		if(!$channelPassword){
			throw new Exception("Channel password is required for connection and messages encryption");
		}
		if(!$agentName){
			throw new Exception("AgentName/NickName is required. It is used to exchange messages between peers and clients");
		}

		if(preg_match("/[\*\/,\\\\\s]+/",$channelName)){
			throw new Exception("Channel name shouldn't have any chracter in (*\\/,) and no space");
		}
		if(preg_match("/[\*\/,\\\\\s]+/",$channelPassword)){
			throw new Exception("Channel key shouldn't have any chracter in (*\\/,) and no space");
		}
		if(preg_match("/[\*\/,\\\\]+/",$agentName)){
			throw new Exception("Channel agentName/NickName shouldn't have any chracter in (*\\/,) but may have spaces");
		}

		$this->channelId = $channelId = self::getChannelId($channelName,$channelPassword);

		if(sizeof($this->getActiveAgents())>=self::$MAX_ACTIVE_AGENTS){
			throw new Exception('This is free channel, only '.self::$MAX_ACTIVE_AGENTS.' agents are supported.');
		}

        $AgentSessionStatus = $this::getAgentSessionStatus($agentName, $this->sessionId);
		if($AgentSessionStatus == AgentSessionStatus::NOT_AVAILABLE){
 			throw new Exception("Agent $data->agentName is already active, please select another name");
		}else{

            if ($AgentSessionStatus  == AgentSessionStatus::AVAILABLE_KNOWN)
            {
                $sessionId = $this->sessionId;
                $newSession = false;
            }
            else
            {
                $this->sessionId = $sessionId = guid16();
            }

            $agentContext -> ip_address = $this->getClientIP();

            $agentJson = [
                "agentName"    => $agentName,
                "date"         => getCurrentTime(),
                "sessionId"    => $this->sessionId,
                "agentContext" => $agentContext
            ];

			$sessionJson = new stdClass();
			$sessionJson -> agentName = $agentName;

			write_to_file($this::channelAgentsPath($agentName),json_encode($agentJson));
			write_to_file($this::channelSessionsPath($sessionId),json_encode($sessionJson));

			if(!file_exists($this::channelInfoPath())){
				$channelJson = new stdClass();
				$channelJson->channelName = $channelName;
				//note that the frontend api send a hashed value of password not the password itself
				$channelJson->channelPassword = $channelPassword;
				$channelJson->channelId = $channelId;
				write_to_file($this::channelInfoPath(),json_encode($channelJson));
			}

			write_to_file(self::$SESSION_CHANNEL_MAP_PATH.'/'.$sessionId , $this->channelId);

			return $newSession;
		}

	}

	function receive($range){

		if(!$this->sessionLocker->lock(true)){
			throw new Exception('session lock error: current session is already active.');
		}

		$sessionId = $this->sessionId;
		$datafrom = $this->getAgentName();

		if($datafrom == null || $datafrom == ''){
			throw new Exception('Session id is invalid, no agent is connected to this session.');
		}

		$currentAgent = $datafrom;
		$counter_file = $this->channelParentPath()."/events.counter";

		read_counter :

		$event_max_index = (int)read_file($counter_file);

		if(!strrpos($range,"-")){
			$range .= '-';
		}
		$event_range_start = substr($range,0,strrpos($range,"-"));
		$event_range_end = substr($range,strrpos($range,"-")+1);

		if(!$event_range_end){
			$event_range_end = PHP_INT_MAX ;
		}
		$events = Array();

		$max_data_length = $event_range_end - $event_range_start + 1;

		$updateLength = 0;

		for($i = $event_range_start; $i <= $event_max_index && sizeof($events) < $max_data_length; $i++){

			$content = read_file($this->channelEventsPath($i));
			$json = json_decode($content);

			/*$json->session == "$session_id" || */
			if( $json->from != $currentAgent && preg_match("/".$json->to."/",$currentAgent)){
				unset($json->session);
				unset($json->to);
				array_push($events,$json);
			}else{
			}

			$updateLength++;

		}

		$response = new stdClass();
		$response->updateLength = $updateLength;

		// if there are not existing events, we should wait until new event
		// is triggered.
		if(sizeof($events) == 0){
			$c = new MessageConnector($this->channelSessionsSocketsPath($sessionId));

			while(true){

				if(self::$long_poll_enable){
					$msg = $c->receive();
				}else{
					//$msg = ':no-client';
					break;
				}

				// for timeout, the server can send the connected agents as response
				if($msg == ':no-client'){
					//json_ok(["message"=>"\1"]);
					$agents = $this->getActiveAgents();

					foreach ($agents as $agent){
						$obj = new stdClass();
						$obj->type = 'connected-agent';
						$obj->agent = $agent;
						$obj->to = ".*";
						array_push($events,$obj);
					}

					break;
				}else if($msg == ':event'){
					goto read_counter;
				}else if($msg == ':close'){
					$c->close();
					$fl->unlock();
					json_pending('closed');
				}
			}

		}

		$this->sessionLocker->unlock();

		$this->renewSession();

		$response->events = $events;

		return $response;
	}

	function dispatch($data){
		if(is_string($data)){
			$event = new stdClass();
			$event->session = $this->sessionId;
			$event->type = $data;
			$event->to = ".*";

			$data = $event;
		}

		$type = $data->type;

		/**
		** TODO : File type feature to be added later
		**
		**/
		if(!isset($type)){
			throw new Exception('Message type is required, use value like [chat-text|rtc|script-eval|file-put|script-response...].');
		}

		$sessionId = $this->sessionId;
		$datafrom = $this->getAgentName();

		if($datafrom == null || $datafrom == ''){
			throw new Exception('Session id is invalid, no agent is connected to this session');
		}

		$data->from = $datafrom;
        $data->date = getCurrentTime();

		//Use UTC time zone, so each client can map the time using its local timezone
		//$data->date += date("Z") * 1000;

		$tester = new MessageConnector("");

		$retries = 3;
		$timeout = 10;
		$startTime = time();

		while(!($lockState = $this->channelLocker->lock(false)) && $retries>0 && (time()-$startTime)<$timeout){
			$retries--;
		}

		$counter_file = $this->channelParentPath()."/events.counter";
		$this->counter_file = $counter_file;

		if($lockState){

			if($type == 'clear-events'){
				$eventsFolder = $this->channelEventsPath();

				foreach(scandir($eventsFolder) as $eventFileName){
					if($eventFileName == '.' || $eventFileName == '..'){
						continue;
					}
					unlink("$eventsFolder/$eventFileName");
				}

				write_to_file("$counter_file","-1");
				$this->channelLocker->unlock();

			}else{

				//handle the event and unlock the channel
				$this->handleEvent($data);

				//notify other pending mode connections
				// currently it is not used
				foreach (scandir($this->channelSessionsPath()) as $sessionId){
					$sockPath = $this->channelSessionsSocketsPath($sessionId);
					if($tester->check_status($sockPath)){
						$tester->dispatch($sockPath,':event');
					}
				}
			}


			usleep(200);
			$this->renewSession();

		}else{
			throw new Exception("Channel lock error");
		}

	}

	function logChannelEvent($data){
		$counter_file = $this->counter_file;

		if(!file_exists($counter_file)){
			write_to_file("$counter_file","-1");
		}

		$event_index = (int)read_file($counter_file);
		$event_index++;
		write_to_file("$counter_file","$event_index");
		write_to_file($this->channelEventsPath("$event_index"),json_encode($data));
	}

	function handleEvent($data){
		switch($data->type){
			case "file-list":
				$this->channelLocker->unlock();
				$rootPath = $this->channelUploadPath($data->root);

				$files = Array();

				foreach(scandir($rootPath) as $subFile){
					if($subFile == '.' || $subFile == '..'){
						continue;
					}

					$fullpath = "$rootPath/$subFile";
					$obj = new stdClass();
					$obj->name = $subFile;
					if(is_dir($fullpath)){
						$obj->isDirectory = true;
						$obj->size = 'N/A';
					}else{
						$obj->isDirectory = false;
						$obj->size = filesize($fullpath);
					}
					array_push($files,$obj);
				}

				die(json_encode($files));

			break;
			case "file-mv":
				$this->channelLocker->unlock();
				$filepath = $this->channelUploadPath($data->filename);

				if(file_exists($filepath)){
					unlink($filepath);
				}

			break;
			case "file-mkdir":
				$this->channelLocker->unlock();
				//create the directory
				$this->getFolderPath([$this::channelParentPath(),'upload',$data->filename]);
			break;
			case "file-delete":
				$this->channelLocker->unlock();

				$filename = $data->filename;
				if(!is_array($filename)){
					$filename = Array($filename);
				}

				foreach($filename as $filenameItem){
					$filepath = $this->channelUploadPath($filenameItem);

					if(file_exists($filepath)){
						if(is_dir($filepath)){
							rrmdir($filepath);
						}else{
							unlink($filepath);
						}
					}
				}

			break;
			case "file-put":
				$this->channelLocker->unlock();
				$filepath = $this->channelUploadPath($data->filename);

				copyStream('php://input',$filepath,$data->append);
				/*if($data->append == true){
					file_put_contents($filepath, file_get_contents('php://input'), FILE_APPEND);
				}else{
					file_put_contents($filepath, file_get_contents('php://input'));
				}*/
			break;
			case "file-get":

				$this->channelLocker->unlock();

				$file = $this->channelUploadPath($data->filename);

				if(isset($_GET['mime']) && strtolower($_GET['mime']) != 'download'){
					$mime = $_GET['mime'];
					$attachment = false;
				}else{
					$mime = 'application/octet-stream';
					$attachment = true;
				}

				stream_file($file,$mime,$attachment);

			break;
			default :
				$this->logChannelEvent($data);
				$this->channelLocker->unlock();
			break;
		}

	}

	function disconnect(){
		$sessionId = $this->sessionId;
		$tester = new MessageConnector("");

		if($tester->check_status($this->channelSessionsSocketsPath($sessionId))){
			$tester->dispatch($this->channelSessionsSocketsPath($sessionId),":close");
		}

		$deletePaths = Array(
			self::$SESSION_CHANNEL_MAP_PATH.'/'.$this->sessionId,
			$this->channelSessionsSocketsPath($sessionId),
			$this->channelSessionsLocksPath($sessionId),
			$this->channelSessionsPath($sessionId),
			$this->channelAgentsPath($this->getAgentName())
		);

		foreach($deletePaths as $path){
			if(file_exists($path)){
				unlink($path);
			}
		}

	}

	function renewSession($unlock=false){
		$this->sessionLocker->lock(true);
		$this->sessionLocker->unlock();
	}

	function getAgentName(){
		$sessionInfo = read_file($this->channelSessionsPath($this->sessionId));

		if($sessionInfo){
			return json_decode($sessionInfo)->agentName;
		}
	}

	function getSessionFromAgent(){
		$agentInfo = read_file($this->channelAgentsPath($this->sessionId));
		if($agentInfo){
			return json_decode($agentInfo)->sessionId;
		}
	}

	function transformAgentInfo($agentInfo){
		$agentInfoTransform = new \stdClass();

		$agentInfoTransform->agentName = $agentInfo->agentName;
        $agentInfoTransform->date = $agentInfo->date;
		$agentInfoTransform->agentContext = $agentInfo->agentContext;

		return $agentInfoTransform;
	}

	function getAgentInfo($agentName){
		$str = read_file($this->channelAgentsPath($agentName));

		if($str){
			$agentInfo = json_decode($str);
			return $this->transformAgentInfo($agentInfo);
		}else{
			throw new Exception("Agent $agentName is not found");
		}
	}

	function getActiveAgents(){
		$agents = Array();

		$parentPath = $this::channelAgentsPath();
		$agentsFolder = scandir($parentPath);

		foreach($agentsFolder as $agentFileName){
			if($agentFileName == '.' || $agentFileName == '..'){
				continue;
			}

			$path = $parentPath.'/'.$agentFileName;
			$agentInfoString = read_file($path);
			$agentInfo = json_decode($agentInfoString);

			if($this->getAgentSessionStatus($agentInfo->agentName) == AgentSessionStatus::NOT_AVAILABLE){
				array_push($agents, $this->transformAgentInfo($agentInfo));
			}

		}

		return $agents;
	}

	function getChannelPassword(){
		 $str = read_file($this::channelInfoPath());

		 if($str){
			$json = json_decode($str);
			return $json->channelPassword;
		 }
	}

	function getAgentSessionStatus($agentName, $knownSessionId = null){
		$available = false;
		if(!file_exists($this::channelAgentsPath($agentName))){
			$available = true;
		}else{
			$json = json_decode(read_file($this::channelAgentsPath($agentName)));

			$sessionId = $json->sessionId;

			$sessionLockFile = $this::channelSessionsLocksPath($sessionId);
			$sessionFile = $this::channelSessionsPath($sessionId);

			if(file_exists($sessionLockFile) && file_exists($sessionFile)){

                if ($knownSessionId !== null && $sessionId === $knownSessionId) {
                    return AgentSessionStatus::AVAILABLE_KNOWN;
                }

				$fl = new FileLock($sessionLockFile);
				$diff = PHP_INT_MAX;

				if(file_exists($fl->path)){
					$diff = time() - filemtime($sessionLockFile);
				}

				$session_acquired = $fl->lock(true);

				if($session_acquired){
					$fl->unlock();
				}

				$available  = ($diff > $this::$SESSION_INACTIVE_TIMEOUT) && $session_acquired;
			}else{
				$available = true;
			}

		}
		return $available ? AgentSessionStatus::AVAILABLE : AgentSessionStatus::NOT_AVAILABLE;
	}

	function channelParentPath(){
		return $this->getFolderPath([self::$PARENT_PATH,$this->channelId]);
	}
	function channelLockPath(){
		return $this->getFolderPath([$this::channelParentPath()],'channel.lock');
	}
	function channelSessionsLocksPath($sessionId=NULL){
		return $this->getFolderPath([$this::channelParentPath(),'sessions.locks'],$sessionId);
	}
	function channelSessionsSocketsPath($sessionId=NULL){
		return $this->getFolderPath([$this::channelParentPath(),'sessions.sockets'],$sessionId);
	}
	function channelSessionsPath($sessionId=NULL){
		return $this->getFolderPath([$this::channelParentPath(),'sessions'],$sessionId);
	}
	function channelEventsPath($event=NULL){
		return $this->getFolderPath([$this::channelParentPath(),'events'],$event);
	}

	function channelUploadPath($filename=NULL){
		return $this->getFolderPath([$this::channelParentPath(),'upload'],$filename);
	}

	function channelInfoPath(){
		return $this->getFolderPath([$this::channelParentPath()],'info.dat');
	}

	function channelAgentsPath($agentName=NULL){
		if($agentName != NULL){
			$agentName = md5($agentName);
		}
		return $this->getFolderPath([$this::channelParentPath(),'agents'],$agentName);
	}

	static function getChannelId($channelName,$channelPass){
		return sha1(md5($channelName).':'.md5($channelPass));
	}

	function getFolderPath($array,$filename=NULL){

		if(!$this->channelId){
			throw new Exception('Session is expired or connection channel is not valid.');
		}
		$path = '';
		foreach($array as $item){
			if($path == ''){
				$path = $item;
			}else{
				$path = "$path/$item";
			}

			/*if(!file_exists($path)){
				mkdir($path, 0777, true);
			}*/

		}

		if(file_exists($path) && !is_dir($path)){
			throw new Exception("$path is not a directory");
		}

		mkdir($path, 0777, true);
		if(!file_exists($path) || !is_dir($path)){
			throw new Exception("Unable to create directory $path, please check permissions and name syntax");
		}

		if($filename != null){
			$path = $path.'/'.$filename;
		}
		return $path;

	}

}

class MySecurity {

    public static function sha256($input) {
        return hash("sha256", $input);
    }

    public static function encrypt($message, $key) {
        return AesCtr::encrypt($message, $key, 128);
    }

    public static function decrypt($cipherMsg, $key) {
        return AesCtr::decrypt($cipherMsg, $key, 128);
    }

    public static function encryptWithAuth($message, $key) {
        $myObj = new stdClass();
        $myObj->cipher = AesCtr::encrypt($message, $key, 128);
        $myObj->hash   = self::sha256($message); // hash of plaintext for integrity
        return json_encode($myObj);
    }

    public static function decryptWithAuth($cipherMsg, $key) {
        $myObj = json_decode($cipherMsg);

        if (!isset($myObj->cipher) || !isset($myObj->hash)) {
            return false; // malformed input
        }

        $message = AesCtr::decrypt($myObj->cipher, $key, 128);

        // Verify SHA-256 integrity
        if (self::sha256($message) !== $myObj->hash) {
            return false;
        }
        return $message;
    }
}


function copyStream($file_source, $file_target,$append) {
	$rh = fopen($file_source, 'rb');
	if(!$append){
		$wh = fopen($file_target, 'wb');
	}else{
		$wh = fopen($file_target, 'ab');
	}

	if ($rh===false || $wh===false) {
		die("Stream Error");
		// error reading or opening file
		return true;
	}
	while (!feof($rh)) {
		if (fwrite($wh, fread($rh, 1024)) === FALSE) {
			//die('NOOOOOOOOOOOO');
		   return true;
	   }
	}
	fclose($rh);
	fclose($wh);
	//die('YAAAAAAAAA');
	// No error
	return false;
}

function write_to_file($file,$content){
	$f = fopen($file,"w");
	if(true){
		fwrite($f, $content);
		//flock($f, LOCK_UN);
		fclose($f);
		return true;
	}else{
		fclose($f);
		return false;
	}
}

function read_file($file){
	if(filesize($file) == 0){
		return "";
	}

	$f = fopen($file,"r");
	$content = fread($f,filesize($file));
	fclose($f);
	return $content;
}


function my_debug($message){
	json_ok(["message"=>"\1"]);
	flush();
	ob_flush();
}

function guid16()
{
    //if (function_exists('com_create_guid') === true)
        //return trim(com_create_guid(), '{}');

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

function rrmdir($dir) { 
   if (is_dir($dir)) { 
     $objects = scandir($dir); 
     foreach ($objects as $object) { 
       if ($object != "." && $object != "..") { 
         if (is_dir($dir."/".$object))
           rrmdir($dir."/".$object);
         else
           unlink($dir."/".$object); 
       } 
     }
     rmdir($dir); 
   } 
 }
function stream_file($file_path,$ctype,$is_attachment){

	if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
		@apache_setenv('no-gzip', 1);
		@ini_set('zlib.output_compression', 'Off');
	} 

    if (is_file($file_path))
    {		
		$file_name = basename($file_path);

        $file_size  = filesize($file_path);
        $file = @fopen($file_path,"rb");
        if ($file)
        {
            // set the headers, prevent caching
            header("Pragma: public");
            header("Expires: -1");
            header("Cache-Control: public, must-revalidate, post-check=0, pre-check=0");
            //header("Content-Disposition: attachment; filename=\"$file_name\"");
            // set appropriate headers for attachment or streamed file
            if ($is_attachment) {
                header("Content-Disposition: attachment; filename=\"$file_name\"");
            }
            else {
                header('Content-Disposition: inline;');
                header('Content-Transfer-Encoding: binary');
            }
            header("Content-Type: " . $ctype);
            //check if http_range is sent by browser (or download manager)
            if(isset($_SERVER['HTTP_RANGE']))
            {
                list($size_unit, $range_orig) = explode('=', $_SERVER['HTTP_RANGE'], 2);
                if ($size_unit == 'bytes')
                {
                    //multiple ranges could be specified at the same time, but for simplicity only serve the first range
                    //http://tools.ietf.org/id/draft-ietf-http-range-retrieval-00.txt
                    list($range, $extra_ranges) = explode(',', $range_orig, 2);
                }
                else
                {
                    $range = '';
                    header('HTTP/1.1 416 Requested Range Not Satisfiable');
                    exit;
                }
            }
            else
            {
                $range = '';
            }
            //figure out download piece from range (if set)
            ob_clean();
            list($seek_start, $seek_end) = explode('-', $range, 2);
            //set start and end based on range (if set), else set defaults
            //also check for invalid ranges.
            $seek_end   = (empty($seek_end)) ? ($file_size - 1) : min(abs(intval($seek_end)),($file_size - 1));
            $seek_start = (empty($seek_start) || $seek_end < abs(intval($seek_start))) ? 0 : max(abs(intval($seek_start)),0);
            //Only send partial content header if downloading a piece of the file (IE workaround)
			
			$chunk = 50 * 1024;
			
	
			if ($seek_start > 0 || $seek_end < ($file_size - 1))
            {
				if($seek_end - $seek_start > $chunk){
					$seek_end = $seek_start + $chunk - 1;
				}
				
                header('HTTP/1.1 206 Partial Content');
                header('Content-Range: bytes '.$seek_start.'-'.$seek_end.'/'.$file_size);
                header('Content-Length: '.($seek_end - $seek_start + 1));
				
            }
            else{
                header("Content-Length: $file_size");
			}

            header('Accept-Ranges: bytes');
            set_time_limit(0);
            fseek($file, $seek_start);
            while(!feof($file))
            {
                print(@fread($file, $chunk));
                ob_flush();
                flush();
                if (connection_status()!=0)
                {
                    @fclose($file);
                    exit;
                }

            }
            // file save was a success
            @fclose($file);
            exit;
        }
        else
        {
            // file couldn't be opened
            header("HTTP/1.0 500 Internal Server Error");
            exit;
        }
    }
    else
    {
        // file does not exist
        header("HTTP/1.0 404 Not Found");
        exit;
    }
}

?>