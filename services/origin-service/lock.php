<?php
require_once __DIR__ . '/json_response.php';


/*
$l = new FileLock('file.lock');

json_ok(["message"=>"\1"]);

$nonBlock = $_GET['type'] == 'non-blocking';

if($l->lock($nonBlock)){	
	sleep(5);
	$l->unlock();
	json_ok(["message"=>"\1"]);
}else{
	json_ok(["message"=>"\1"]);
}
*/


class FileLock{
	
	function __construct($path){
		$this->path = $path;
		$this->f = null;
	}
	
	function lock($nonBlock=false){
		
		$this->f = fopen($this->path,'w');

		if($nonBlock){
			$type = LOCK_EX | LOCK_NB;
		}else{
			$type = LOCK_EX;
		}

		//return flock_t($this->f,LOCK_EX,1000 * 1000 * 2);
		$res =  flock($this->f,$type);
		return $res;
	}
	
	function unlock(){
		if($this->f != null){
			$res = flock($this->f, LOCK_UN);
			fclose($this->f);
			$this->f = null;

			// if you really want to "touch" the file to clear locks, do it safely:
			$h = fopen($this->path, 'c'); // 'c' = create if not exists, open for read/write
			if ($h !== false) {
				fclose($h);
			}

			return $res;
		} else {
			return false;
		}
	}
	
}



/**
 * Acquires a lock using flock, provide it a file stream, the 
 * lock type, a timeout in microseconds, and a sleep_by in microseconds.
 * PHP's flock does not currently have a timeout or queuing mechanism.
 * So we have to hack a optimistic method of continuously sleeping 
 * and retrying to acquire the lock until we reach a timeout.
 * Doing this in microseconds is a good idea, as seconds are too 
 * granular and can allow a new thread to cheat the queue.
 * There's no actual queue of locks being implemented here, so 
 * it is fundamentally non-deterministic when multiple threads 
 * try to acquire a lock with a timeout.
 * This means a possible failure is resource starvation.
 * For example, if there's too many concurrent threads competing for 
 * a lock, then this implementation may allow the second thread to be 
 * starved and allow the third thread to acquire the lock.
 * The trick here is in the combination of LOCK_NB and $blocking.
 * The $blocking variable is assigned by reference, it returns 1 
 * when the flock is blocked from acquiring a lock. With LOCK_NB 
 * the flock returns immediately instead of waiting indefinitely.
 * 
 * @param  resource $lockfile       Lock file resource that is opened.
 * @param  constant $locktype       LOCK_EX or LOCK_SH
 * @param  integer  $timeout_micro  In microseconds, where 1 second = 1,000,000 microseconds
 * @param  float    $sleep_by_micro Microsecond sleep period, by default 0.01 of a second
 * @return boolean
 */
function flock_t ($lockfile, $locktype, $timeout_micro, $sleep_by_micro = 10000) {
    if (!is_resource($lockfile)) {
        throw new \InvalidArgumentException ('The $lockfile was not a file resource or the resource was closed.');
    }
    if ($sleep_by_micro < 1) {
        throw new \InvalidArgumentException ('The $sleep_by_micro cannot be less than 1, or else an infinite loop.');
    }
    if ($timeout_micro < 1) {
        $locked = flock ($lockfile, $locktype | LOCK_NB);
    } else {
        $count_micro = 0;
        $locked = true;
        while (!flock($lockfile, $locktype | LOCK_NB, $blocking)) {
            if ($blocking AND (($count_micro += $sleep_by_micro) <= $timeout_micro)) {
                usleep($sleep_by_micro);
            } else {
                $locked = false;
                break;
            }
        }
    }
    return $locked;
}

?>