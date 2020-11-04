<?php
require_once('../config.inc.php');
if (!$sandboxServer) die('No sandbox server defined');

$session = null;
$sessionId = null;

function getSessionFilename($session) {
    global $sessionFolder;
    return $sessionFolder . '/' . $session . '.session';
}
if (isset($_REQUEST['session'])) {
    $sessionId = $_REQUEST['session'];
    $session = json_decode(file_get_contents(getSessionFilename($sessionId)));
}

?>

<html>
<head>
    <title><?= $title ?> Editor</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"/>
    <link rel="stylesheet" href="common/css/common.css" />
    <link rel="stylesheet" href="common/css/loading.css" />
    <link rel="stylesheet" href="common/css/user.css"/>
    <link rel="stylesheet" href="css/codemirror.css"/>
    <link rel="stylesheet" href="css/show-hint.css"/>
    <link rel="stylesheet" href="css/lint.css"/>
    <link rel="stylesheet" href="css/ui.fancytree.css"/>
    <link rel="stylesheet" href="css/editor.css"/>
    <link rel="stylesheet" href="css/tutorial.css"/>

    <script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <script src="js/codemirror.js"></script>
    <script src="js/show-hint.js"></script>
    <script src="js/spell-hint.js"></script>
    <script src="js/js-yaml.min.js"></script>
    <script src="js/yaml.js"></script>
    <script src="js/lint.js"></script>
    <script src="js/yaml-lint.js"></script>
    <script src="js/editor.js"></script>
    <script src="js/codeeditor.js"></script>
    <script src="js/tutorial.js"></script>
    <script src="js/main.js"></script>
    <script type="text/javascript">
        var referenceURL = '//<?= $referenceURL ?>';
        var _session = <?= json_encode($session); ?>;
        var _sessionId = <?= json_encode($sessionId); ?>;
    </script>
    <?php if ($analytics) echo $analytics; ?>
</head>
<body>
<div id="container">
    <div id="header">
        <span id="saveButtonContainer">
            <button type="button" id="saveButton" title="Save your spell and reload the sandbox server configs">Save</button>
        </span>
        <span class="controlgroup">
            <button type="button" id="newButton" title="Clear your editor and start fresh">New</button>
            <select id="newSelector">
                <option value="Blank">Blank Spell</option>
                <option value="Basic">Basic Spell</option>
                <option value="AOE">Area of Effect Spell</option>
                <option value="Projectile">Projectile Spell</option>
                <option value="Sphere">Build Sphere Spell</option>
                <option value="Break">Break Block Spell</option>
                <option value="Repeating">Repeating Effect Spell</option>
            </select>
        </span>
        <span id="downloadButtonContainer">
            <button type="button" id="downloadButton" title="Download this config">Download</button>
        </span>
        <span id="helpButtonContainer">
            <button type="button" id="helpButton" title="Show the tutorial">Help</button>
        </span>
        <span id="referenceButtonContainer">
            <button type="button" id="referenceButton" title="Open the reference guide in a new window">Reference</button>
        </span>
        <span id="userInfoContainer">
        <span id="userInfo">
            <div id="skinContainer">
                <span id="userSkin">&nbsp;</span>
                <span id="userOverlay">&nbsp;</span>
            </div>
            <div>
                <span id="userName"></span>
            </div>
        </span>
    </span>
    </div>

    <div id="codeEditor">
        <textarea id="editor"></textarea>
    </div>
</div>

<?php require 'examples.inc.php'; ?>
<?php require 'tutorials.inc.php'; ?>

<div id="saveDialog" title="Configuration Saved" style="display:none">
  <div style="margin-bottom: 0.5em">
      <span>Please use this command to load your configuration: </span>
  </div>
  <div class="code">
    <span id="configPrefix"></span>mconfig load <span id="sessionDiv"></span>
  </div>
</div>

</body>
</html>
