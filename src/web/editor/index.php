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
    $sessionFileName = getSessionFilename($sessionId);
    if (!file_exists($sessionFileName)) {
        echo "What're you up to there? :|";
        die();
    }
    $session = json_decode(file_get_contents($sessionFileName), true);
}
$fileType = $session && isset($session['type']) ? $session['type'] : '';

$seenTutorial = isset($_COOKIE['tutorial']);
setcookie('tutorial', true, time()+60*60*24*30);

?>

<html>
<head>
    <title><?= $title ?> Editor</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"/>
    <link rel="stylesheet" href="common/css/common.css" />
    <link rel="stylesheet" href="common/css/loading.css" />
    <link rel="stylesheet" href="common/css/user.css"/>
    <link rel="stylesheet" href="common/css/codemirror.css"/>
    <link rel="stylesheet" href="common/css/show-hint.css"/>
    <link rel="stylesheet" href="common/css/dialog.css"/>
    <link rel="stylesheet" href="common/css/lint.css"/>
    <link rel="stylesheet" href="common/css/ui.fancytree.css"/>
    <link rel="stylesheet" href="css/editor.css"/>
    <link rel="stylesheet" href="css/tutorial.css"/>

    <script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <script src="common/js/codemirror.js"></script>
    <script src="common/js/show-hint.js"></script>
    <script src="common/js/js-yaml.min.js"></script>
    <script src="common/js/yaml.js"></script>
    <script src="common/js/lint.js"></script>
    <script src="common/js/yaml-lint.js"></script>
    <script src="common/js/dialog.js"></script>
    <script src="common/js/searchcursor.js"></script>
    <script src="common/js/search.js"></script>
    <script src="js/editor.js"></script>
    <script src="common/js/codeeditor.js"></script>
    <script src="js/tutorial.js"></script>
    <script src="js/main.js"></script>
    <script src="common/js/common-hint.js"></script>

    <?php if ($fileType == 'spells') { ?>
    <script src="common/js/spell-hint.js"></script>
    <?php } ?>

    <?php if ($fileType == 'wands') { ?>
    <script src="common/js/wand-hint.js"></script>
    <?php } ?>

    <?php if ($fileType == 'mobs') { ?>
    <script src="common/js/mob-hint.js"></script>
    <?php } ?>

    <?php if ($fileType == 'effects') { ?>
    <script src="common/js/effect-hint.js"></script>
    <?php } ?>

    <script type="text/javascript">
        var referenceURL = '//<?= $referenceURL ?>';
        var _session = <?= json_encode($session); ?>;
        var _sessionId = <?= json_encode($sessionId); ?>;
        var _seenTutorial = <?= $seenTutorial ? 'true' : 'false'; ?>;
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

<?php require 'tutorials.inc.php'; ?>
<?php
$tutorialsFile = "examples-$fileType.inc.php";
if (file_exists($tutorialsFile)) {
    require($tutorialsFile);
}
?>

<div id="saveDialog" title="Configuration Saved" style="display:none">
    <div style="margin-bottom: 0.5em">
      <span>Please use this command to load your configuration: </span>
    </div>
    <div>
        <span class="code">
            <span class="configPrefix"></span>mconfig load <span id="sessionDiv"></span>
        </span>
    </div>
    <div style="padding-top: 1em">
        Note that you can also use
        <span class="code"><span class="configPrefix"></span>mconfig load</span>
        if you aren't using multiple editing sessions at once.
    </div>
    <div style="padding-top: 1em">
        Also note that you can use
        <span class="code"><span class="configPrefix"></span>mconfig apply</span>
        to stage the changes but not reload configurations.
    </div>
</div>
</body>
</html>
