<?php
require_once('../config.inc.php');
if (!$sandboxServer) die('No sandbox server defined');
$version = 3;

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
if (!$session && isset($_REQUEST['type'])) {
    $fileType = $_REQUEST['type'];
}
$legacyIcons = $session && isset($session['isLegacyIcons']) ? $session['isLegacyIcons'] : false;
$seenTutorial = isset($_COOKIE['tutorial']);
setcookie('tutorial', true, time()+60*60*24*30);

?>

<html>
<head>
    <title><?= $title ?> Editor</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"/>
    <link rel="stylesheet" href="common/css/codemirror.css"/>
    <link rel="stylesheet" href="common/css/darcula.css"/>
    <link rel="stylesheet" href="common/css/show-hint.css"/>
    <link rel="stylesheet" href="common/css/dialog.css"/>
    <link rel="stylesheet" href="common/css/lint.css"/>
    <link rel="stylesheet" href="common/css/foldgutter.css"/>
    <link rel="stylesheet" href="common/css/trailingspace.css"/>

    <link rel="stylesheet" href="common/css/common.css?v=<?=$version?>" />
    <link rel="stylesheet" href="common/css/loading.css?v=<?=$version?>" />
    <link rel="stylesheet" href="common/css/user.css?v=<?=$version?>"/>
    <link rel="stylesheet" href="css/editor.css?v=<?=$version?>"/>
    <link rel="stylesheet" href="css/tutorial.css?v=<?=$version?>"/>

    <script src="//code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <script src="common/js/jquery.cookie.js"></script>
    <script src="common/js/codemirror.js"></script>
    <script src="common/js/show-hint.js"></script>
    <script src="common/js/js-yaml.min.js"></script>
    <script src="common/js/yaml.js"></script>
    <script src="common/js/lint.js"></script>
    <script src="common/js/yaml-lint.js"></script>
    <script src="common/js/dialog.js"></script>
    <script src="common/js/searchcursor.js"></script>
    <script src="common/js/search.js"></script>
    <script src="common/js/trailingspace.js"></script>
    <script src="common/js/trailingspace.js"></script>
    <script src="common/js/yaml-mode.js"></script>
    <script src="common/js/indent-fold.js"></script>
    <script src="common/js/foldcode.js"></script>
    <script src="common/js/foldgutter.js"></script>

    <script src="common/js/formatters.js?v=<?=$version?>"></script>
    <script src="common/js/hints.js?v=<?=$version?>"></script>
    <script src="js/editor.js?v=<?=$version?>"></script>
    <script src="js/tutorial.js?v=<?=$version?>"></script>
    <script src="js/main.js?v=<?=$version?>"></script>

    <script type="text/javascript">
        var referenceURL = '//<?= $referenceURL ?>';
        var _session = <?= json_encode($session); ?>;
        var _sessionId = <?= json_encode($sessionId); ?>;
        var _fileType = '<?=$fileType?>';
        var _seenTutorial = <?= $seenTutorial ? 'true' : 'false'; ?>;
        var _legacyIcons = <?= $legacyIcons ? 'true' : 'false'; ?>;
    </script>
    <?php if ($analytics) echo $analytics; ?>
</head>
<body>
<div id="container" style="display: none">
    <div id="header">
        <span id="saveButtonContainer">
            <button type="button" id="saveButton" title="Save your spell and reload the sandbox server configs">Save</button>
        </span>
        <span class="controlgroup">
            <button tyoe="button" id="undoButton" title="Undo your last change">Undo</button>
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
            <span id="themeControls">
                <span id="darkMode">Dark Mode</span>
            </span>
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

    <div id="footer">
        <span id="navigation"></span>
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
        <span class="code clipboard" title="Click to copy to clipboard">
            <span class="configPrefix"></span>mconfig load <span id="sessionDiv"></span>
        </span>
        <span><input id="copyCode" style="display:none"></span>
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
