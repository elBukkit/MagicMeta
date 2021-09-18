<?php
require_once('../config.inc.php');
require_once('meta.inc.php');
header('Content-Type: application/json');

$legacyIcons = false;
if (isset($_REQUEST['legacyIcons'])) {
    $legacyIcons = $_REQUEST['legacyIcons'] === 'true';
}

$forceUpdate = false;
if (isset($_REQUEST['update'])) {
    $forceUpdate = $_REQUEST['update'] === 'true';
}

echo getMetadata($legacyIcons, $forceUpdate);
