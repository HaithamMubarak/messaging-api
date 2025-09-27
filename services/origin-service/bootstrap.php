<?php
// bootstrap.php (optional include for each endpoint)
// Provides input sanitization and path safety helpers.

function cfg_data_root() {
    // Adjust to your data directory. Must be an absolute path.
    return __DIR__ . DIRECTORY_SEPARATOR . 'data';
}

function safe_id($value) {
    if (!preg_match('/^[A-Za-z0-9._-]{1,64}$/', $value)) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['ok'=>false, 'error'=>'invalid identifier']);
        exit;
    }
    return $value;
}

function safe_join($base, $segments) {
    $path = $base;
    foreach ($segments as $s) {
        $path .= DIRECTORY_SEPARATOR . $s;
    }
    $real = realpath($path) ?: $path;
    $realBase = realpath($base);
    if ($realBase === false) { $realBase = $base; }
    if (strpos($real, $realBase) !== 0) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['ok'=>false, 'error'=>'unsafe path']);
        exit;
    }
    return $path;
}

umask(0077);
header('X-Content-Type-Options: nosniff');
?>
