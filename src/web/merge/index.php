<?php
$version = 2;
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
    <script src="js/merge.js?v=<?=$version?>"></script>
</head>
<body>
Select the resource packs you want to merge.<br/>
Note that your browser may hang for a bit while zips are processed!<br/>
<br/><br/>
RP1: <input type="file" id="rpInput1" accept=".zip"/><br/>
RP2: <input type="file" id="rpInput2" accept=".zip"/><br/>
<br/><br/>
<div id="progressContainer" style="position: relative; width: 200px; height: 30px; border: 1px solid black">
    <div id="progressBar" style="position: relative; width: 0px; height: 30px; background-color: cyan; "></div>
</div>
<div id="logOutput" style="margin-top: 2em">

</div>
</body>
</html>
