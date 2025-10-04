<?php
// json_response.php
// Include this helper and use json_ok/json_error instead of echo


// --- Unified JSON Response Functions ---
function json_ok($data = null, $message = "Success") {
    header('Content-Type: application/json');
    echo json_encode([
        "status"  => "ok",
        "message" => $message,
        "data"    => json_decode($data)
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($message, $code = 500) {
    header('Content-Type: application/json');
    http_response_code($code);
    echo json_encode([
        "status"  => "error",
        "message" => $message
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_pending($message = "Pending") {
    header('Content-Type: application/json');
    http_response_code(202);
    echo json_encode([
        "status"  => "pending",
        "message" => $message
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_unauthorized($message = "Invalid Login") {
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode([
        "status"  => "unauthorized",
        "message" => $message
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

?>
