<?php
header('Content-Type: application/json');
require_once('../config.inc.php');

// Utility methods
function returnError($message) {
    $response = array(
        'message' => $message,
        'success' => false
    );
    die(json_encode($response));
}

function randomString($length) {
    $key = '';
    $keys = array_merge(range(0, 9), range('a', 'z'));

    for ($i = 0; $i < $length; $i++) {
        $key .= $keys[array_rand($keys)];
    }

    return $key;
}

// Session file management
function getSessionFilename($session) {
    global $sessionFolder;
    return $sessionFolder . '/' . $session . '.session';
}
function createNewSession() {
    $sessionFile = '';
    $session = '';
    $retries = 50;
    while (!$sessionFile || file_exists($sessionFile)) {
        if ($retries-- <= 0) {
            return null;
        }

        $session = randomString(6);
        $sessionFile = getSessionFilename($session);
    }
    return $session;
}

// Check parameters
if (!isset($_REQUEST['action'])) {
    returnError('Missing action parameter');
}
$action = $_REQUEST['action'];
if (!file_exists($sessionFolder)) {
    returnError("Editor is not properly configured");
}

$body = file_get_contents('php://input');
$body = json_decode($body, true);
if (!$body) {
    returnError("Missing post body");
}

if ($action == 'new') {
    // Check for type
    if (!isset($body['type'])) {
        returnError('Missing type parameter');
    }
    if (!isset($body['key']) || !$body['key']) {
        $body['key'] = 'new_changeme';
    }

    // Create new session
    $session = createNewSession();
    if (!$session) {
        returnError("Could not create new session");
    }
    $sessionFile = getSessionFilename($session);
    file_put_contents($sessionFile, json_encode($body));

    // Generate Response
    $response = array('success' => true, 'session' => $session);

    die(json_encode($response));
} else if ($action == 'get') {
    if (!isset($body['session'])) {
        returnError('Missing session parameter');
    }
    $session = $body['session'];
    $sessionFile = getSessionFilename($session);
    if (!file_exists($sessionFile)) {
        returnError("Invalid session: " . $session);
    }

    $session = json_decode(file_get_contents($sessionFile), true);
    $response = array('success' => true, 'session' => $session);
    die(json_encode($response));
} else {
    returnError("Unknown action: " . $action);
}