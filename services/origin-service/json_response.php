<?php
// json_response.php
// Include this helper and use json_ok/json_error instead of echo

function json_ok($data = []) {
    header('Content-Type: application/json');
    echo json_encode(['ok'=>true] + $data);
    exit;
}

function json_error($msg, $code=400) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['ok'=>false,'error'=>$msg]);
    exit;
}
?>
