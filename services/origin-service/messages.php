<?php
require_once __DIR__ . '/json_response.php';

class MessageConnector{
	
	function __construct($socketPath){
		$this->socketPath = $socketPath;
		$this->server_conn = null;
	}	
	
	function receive(){
		
		$sock_file_path = dirname(__FILE__)."/".$this->socketPath;
		$server_side_sock = 'unix://'.dirname(__FILE__)."/".$this->socketPath;
	

		if($this->server_conn == null){
			if(file_exists($sock_file_path)){
				unlink($sock_file_path);
			}
		
			$this->server_conn = stream_socket_server($server_side_sock, $errno, $errorMessage,STREAM_SERVER_BIND | STREAM_SERVER_LISTEN );			
		}
		
		$timeout = 2 * 60;
		stream_set_timeout($this->server_conn,$timeout);
		
		$lastTime = time();
		
		$maxNoClients = 2;
		$noClientError = 0;
		
		try{
			while(true){
				$client = stream_socket_accept($this->server_conn);
				if($client){
					$buff = '';
					
					while(!feof($client)){
						$buff .= fread($client,1024);	
					}
			
					if($buff){
						//usleep(100);
						//fwrite($client,"Ok");
						//fclose($client);			
						return $buff;
					}
				}else{
					$noClientError++;
					
					if($noClientError >= $maxNoClients){
						return ':no-client';
					}
					
				}

				if(($lastTime - time()) > $timeout){
					return ':no-client';
					//return null;
				}
	
			}
		}catch(Exception $ex){
			die('no client, Error#2');
			//return null;
		}
		
	}
	
	function check_status($sock_file_path){
		
		set_error_handler(function($errno, $errstr, $errfile, $errline) {
			// error was suppressed with the @-operator
			if (0 === error_reporting()) {
				return false;
			}

			throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
		});

		try{
			$status = $this->send($sock_file_path,"");	
		}catch(Exception $ex){
			$status = false;
		}
		
		restore_error_handler();
		
		return $status;
	}
	
	function send($sock_file_path,$message){

		$server_side_sock = 'unix://'.dirname(__FILE__)."/".$sock_file_path;
		
		$fp = stream_socket_client($server_side_sock, $errno, $errstr, 30);
		
		stream_set_timeout($fp,10);
		
		if (!$fp) 
		{	return false;
		} else{				
			fwrite($fp,$message);
			usleep(100);
			//echo fread($fp,2);
			fclose($fp);			
			return true;
		}

	}
	
	
	function close(){
		if($this->server_conn != null){
			fclose($this->server_conn);
			$this->server_conn = null;
		}
		
		$sock_file_path = dirname(__FILE__)."/".$this->socketPath;
		
		if(file_exists($sock_file_path)){
			unlink($sock_file_path);
		}
		
	}
	
}


?>