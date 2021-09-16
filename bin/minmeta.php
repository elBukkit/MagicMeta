<?php

if (PHP_SAPI !== 'cli') {
    die('Nope.');
}

if (count($argv) < 3) {
    die("Usage: minmeta.php <meta.json> <out.json>\n");
}

$inFile = $argv[1];
$outFile = $argv[2];

$in = json_decode(file_get_contents($inFile), true);
$out = array('classed' => $in['classed']);
file_put_contents($outFile, json_encode($out));