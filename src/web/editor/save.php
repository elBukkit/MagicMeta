<?php
header('Content-Type: application/json');
require_once('../config.inc.php');
require_once('common/yaml.inc.php');

function getSessionFilename($session) {
    global $sessionFolder;
    return $sessionFolder . '/' . $session . '.session';
}
if (!isset($_REQUEST['id'])) {
    die(json_encode(array('success' => false, 'message' => 'Missing id parameter')));
}
if (!isset($_REQUEST['session'])) {
    die(json_encode(array('success' => false, 'message' => 'Missing session parameter')));
}

$id = $_REQUEST['id'];
$session = $_REQUEST['session'];
$sessionFilename = getSessionFilename($id);

if (file_put_contents($sessionFilename, $session) === FALSE) {
    die(json_encode(array('success' => false, 'message' => 'Could not write to file ' . $sessionFilename)));
}

echo json_encode(array('success' => true, 'message' => 'Saved'));