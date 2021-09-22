<?php

if (PHP_SAPI !== 'cli') {
    die('Nope.');
}

if (count($argv) < 3) {
    die("Usage: minmeta.php <meta.json> <out.json>\n");
}

$inFile = $argv[1];
$outFile = $argv[2];

$out = array();
$in = json_decode(file_get_contents($inFile), true);
$properties = $in['properties'];
foreach ($in['classed'] as $classType => $classes) {
    $mapped = array();
    foreach ($classes as $key => $value) {
        $parameters = $value['parameters'];
        $mappedParameters = array();
        foreach ($parameters as $parameter => $defaultVAlue) {
            $property = $properties[$parameter];
            // Note this is not a literal return
            $description = implode($property['description'], '\n');
            $mappedParameters[$property['field']] = $description;
        }
        $value['parameters'] = $mappedParameters;
        $mapped[$key] = $value;
    }
    $out[$classType] = $mapped;
}
file_put_contents($outFile, json_encode($out, JSON_PRETTY_PRINT));