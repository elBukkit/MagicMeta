<?php
?>
<html>
<head>
    <title>Resource Pack Merger</title>
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" href="css/smoothness/jquery-ui-1.10.3.custom.min.css" />
    <link rel="stylesheet" href="css/merge.css" />
    <script src="js/jquery-1.10.2.min.js"></script>
    <script src="js/jquery-ui-1.10.3.custom.min.js"></script>
    <script src="js/jszip.min.js"></script>
    <script src="js/FileSaver.min.js"></script>
    <script src="js/merge.js"></script>
</head>
<body>
Select the resource packs you want to merge.<br/>
Note that your browser may hang for a bit while zips are processed!<br/>
<br/><br/>
RP1: <input type="file" id="rpInput1" accept=".zip"/><br/>
RP2: <input type="file" id="rpInput2" accept=".zip"/><br/>
<br/><br/>
<div id="logOutput">

</div>
</body>
</html>
