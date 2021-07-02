<?php
require_once('../config.inc.php');

function getMetadata($legacyIcons)
{
    global $sessionFolder;
    $cacheFile = $sessionFolder . '/_meta';
    if ($legacyIcons) {
        $cacheFile .= '_legacy';
    }
    $cacheFile .= '.cache';
    $lockFile = fopen($cacheFile, 'c+');
    if ($lockFile === FALSE) {
        error_log("Could not create file at $lockFile");
        return generateMeta();
    }
    flock($lockFile, LOCK_EX);
    try {
        if (filesize($cacheFile) > 0) {
            $dataCreated = filemtime(dirname(__FILE__) . '/meta.json');
            $cacheCreated = filemtime($cacheFile);
            $codeChanged = filemtime(dirname(__FILE__) . '/meta.php');
            if ($cacheCreated >= $codeChanged && $cacheCreated >= $dataCreated) {
                return file_get_contents($cacheFile);
            }
        }
        $metadata = generateMeta();
        file_put_contents($cacheFile, $metadata);
        return $metadata;
    } catch (Exception $ex) {
        error_log("Error creating cache file", $ex);
        return generateMeta();
    } finally {
        // Release lock and close lock file
        flock($lockFile, LOCK_UN);
        fclose($lockFile);
    }
}

function getClassedOptions($meta, $type) {
    $options = array();
    $classes = $meta['classed'][$type];
    foreach ($classes as $class) {
        $description = implode("\n", $class['description']);
        $options[$class['short_class']] = $description;
    }
    return $options;
}

function makeIcon($texture, $className) {
    $icon = '';
    $texture = 'image/' . $texture;
    if (file_exists($texture)) {
        $icon = '<img src="common/' . $texture . '" class="' . $className . '"/>';
    }
    return $icon;
}

function generateMeta() {
    global $magicRootFolder;
    global $resourcePackFolder;
    global $legacyIcons;

    $meta = json_decode(file_get_contents('meta.json'), true);

    $spellIcons = array();
    $disabledIcons = array();
    $wandIcons = array();
    // Load resource pack textures
    if ($legacyIcons) {
        $spellJson = json_decode(file_get_contents($resourcePackFolder . '/default/assets/minecraft/models/item/diamond_axe.json'), true);
        $spellJson = $spellJson['overrides'];
        $diamondUses = 1562;
        foreach ($spellJson as $spellPredicate) {
            $durability = round($spellPredicate['predicate']['damage'] * $diamondUses);
            if ($durability == 0) continue;
            $texture = str_replace('item/', '', $spellPredicate['model']);
            $spellIcons['diamond_axe:' . $durability] = makeIcon($texture . '.png', 'spellIcon') . $texture;
            $disabledIcons['diamond_hoe:' . $durability] = makeIcon($texture . '.png', 'spellIcon') . $texture;
        }
    } else {
        $modelFolder = $resourcePackFolder . '/default/assets/minecraft/models/item/';
        foreach (new DirectoryIterator($modelFolder) as $fileInfo) {
            if ($fileInfo->isDot()) continue;
            if ($fileInfo->isDir()) continue;
            $filename = $fileInfo->getFilename();
            if (pathinfo($filename, PATHINFO_EXTENSION) !== 'json') continue;
            $itemJson = json_decode(file_get_contents($modelFolder . '/' . $filename), true);
            $itemJson = $itemJson['overrides'];
            foreach ($itemJson as $itemPredicate) {
                if (!isset($itemPredicate['predicate'])) continue;
                if (!isset($itemPredicate['predicate']['custom_model_data'])) continue;
                $texture = str_replace('item/', '', $itemPredicate['model']);
                $customData = $itemPredicate['predicate']['custom_model_data'];
                $itemName = basename($filename, '.json');

                if (strpos($texture, 'spells') === FALSE && strpos($texture, 'brushes') === FALSE) {
                    $wandIcons[$itemName . '{' . $customData . '}'] = $texture;
                } else {
                    $icon = makeIcon($texture . '.png', 'spellIcon');
                    if (strpos($texture, '_disabled') !== FALSE) {
                        $disabledIcons[$itemName . '{' . $customData . '}'] = $icon . $texture;
                    } else {
                        $spellIcons[$itemName . '{' . $customData . '}'] = $icon . $texture;
                    }
                }
            }
        }
    }
    if (isset($meta['types']) && isset($meta['types']['material']) && isset($meta['types']['material']['options'])) {
        if (isset($meta['types']) && isset($meta['types']['item']) && isset($meta['types']['item']['options'])) {
            $meta['types']['item']['options'] = array_merge($meta['types']['item']['options'], $meta['types']['material']['options']);
        }

        foreach ($meta['types']['material']['options'] as $material => $nothing) {
            $icon = makeIcon('material/' . $material . '.png', 'spellIcon');
            $meta['types']['material']['options'][$material] = $icon;
            $wandIcons[$material] = $icon;
        }
    }
    $meta['types']['spell_icon']['options'] = $spellIcons;
    $meta['types']['spell_icon_disabled']['options'] = $disabledIcons;
    $meta['types']['icon']['options'] = $wandIcons;

    // Load URL textures
    $textureConfig = $magicRootFolder . '/../../resource-pack/common/source/image_map.yml';
    if (file_exists($textureConfig)) {
        $textures = yaml_parse_file($textureConfig);
        $textureOptions = array();
        foreach ($textures as $texture) {
            $textureOptions[$texture] = '<span style="background-image: url(' . $texture . ')" class="textureIcon"/>';
        }
        $meta['types']['texture']['options'] = $textureOptions;
    }

    // Add particle previews
    $particles = $meta['types']['particle']['options'];
    foreach ($particles as $particle => $empty) {
        $meta['types']['particle']['options'][$particle] = '<img src="common/image/particle/' . $particle . '.gif" class="particlePreview"/>';
    }

    // Create colors
    // From http://www.w3schools.com/HTML/html_colornames.asp
    $colorMap = array("aliceblue"=>"f0f8ff","antiquewhite"=>"faebd7","aqua"=>"00ffff","aquamarine"=>"7fffd4","azure"=>"f0ffff",
        "beige"=>"f5f5dc","bisque"=>"ffe4c4","black"=>"000000","blanchedalmond"=>"ffebcd","blue"=>"0000ff","blueviolet"=>"8a2be2","brown"=>"a52a2a","burlywood"=>"deb887",
        "cadetblue"=>"5f9ea0","chartreuse"=>"7fff00","chocolate"=>"d2691e","coral"=>"ff7f50","cornflowerblue"=>"6495ed","cornsilk"=>"fff8dc","crimson"=>"dc143c","cyan"=>"00ffff",
        "darkblue"=>"00008b","darkcyan"=>"008b8b","darkgoldenrod"=>"b8860b","darkgray"=>"a9a9a9","darkgreen"=>"006400","darkkhaki"=>"bdb76b","darkmagenta"=>"8b008b","darkolivegreen"=>"556b2f",
        "darkorange"=>"ff8c00","darkorchid"=>"9932cc","darkred"=>"8b0000","darksalmon"=>"e9967a","darkseagreen"=>"8fbc8f","darkslateblue"=>"483d8b","darkslategray"=>"2f4f4f","darkturquoise"=>"00ced1",
        "darkviolet"=>"9400d3","deeppink"=>"ff1493","deepskyblue"=>"00bfff","dimgray"=>"696969","dodgerblue"=>"1e90ff",
        "firebrick"=>"b22222","floralwhite"=>"fffaf0","forestgreen"=>"228b22","fuchsia"=>"ff00ff",
        "gainsboro"=>"dcdcdc","ghostwhite"=>"f8f8ff","gold"=>"ffd700","goldenrod"=>"daa520","gray"=>"808080","green"=>"008000","greenyellow"=>"adff2f",
        "honeydew"=>"f0fff0","hotpink"=>"ff69b4",
        "indianred "=>"cd5c5c","indigo"=>"4b0082","ivory"=>"fffff0","khaki"=>"f0e68c",
        "lavender"=>"e6e6fa","lavenderblush"=>"fff0f5","lawngreen"=>"7cfc00","lemonchiffon"=>"fffacd","lightblue"=>"add8e6","lightcoral"=>"f08080","lightcyan"=>"e0ffff","lightgoldenrodyellow"=>"fafad2",
        "lightgrey"=>"d3d3d3","lightgreen"=>"90ee90","lightpink"=>"ffb6c1","lightsalmon"=>"ffa07a","lightseagreen"=>"20b2aa","lightskyblue"=>"87cefa","lightslategray"=>"778899","lightsteelblue"=>"b0c4de",
        "lightyellow"=>"ffffe0","lime"=>"00ff00","limegreen"=>"32cd32","linen"=>"faf0e6",
        "magenta"=>"ff00ff","maroon"=>"800000","mediumaquamarine"=>"66cdaa","mediumblue"=>"0000cd","mediumorchid"=>"ba55d3","mediumpurple"=>"9370d8","mediumseagreen"=>"3cb371","mediumslateblue"=>"7b68ee",
        "mediumspringgreen"=>"00fa9a","mediumturquoise"=>"48d1cc","mediumvioletred"=>"c71585","midnightblue"=>"191970","mintcream"=>"f5fffa","mistyrose"=>"ffe4e1","moccasin"=>"ffe4b5",
        "navajowhite"=>"ffdead","navy"=>"000080",
        "oldlace"=>"fdf5e6","olive"=>"808000","olivedrab"=>"6b8e23","orange"=>"ffa500","orangered"=>"ff4500","orchid"=>"da70d6",
        "palegoldenrod"=>"eee8aa","palegreen"=>"98fb98","paleturquoise"=>"afeeee","palevioletred"=>"d87093","papayawhip"=>"ffefd5","peachpuff"=>"ffdab9","peru"=>"cd853f","pink"=>"ffc0cb","plum"=>"dda0dd","powderblue"=>"b0e0e6","purple"=>"800080",
        "red"=>"ff0000","rosybrown"=>"bc8f8f","royalblue"=>"4169e1",
        "saddlebrown"=>"8b4513","salmon"=>"fa8072","sandybrown"=>"f4a460","seagreen"=>"2e8b57","seashell"=>"fff5ee","sienna"=>"a0522d","silver"=>"c0c0c0","skyblue"=>"87ceeb","slateblue"=>"6a5acd","slategray"=>"708090","snow"=>"fffafa","springgreen"=>"00ff7f","steelblue"=>"4682b4",
        "tan"=>"d2b48c","teal"=>"008080","thistle"=>"d8bfd8","tomato"=>"ff6347","turquoise"=>"40e0d0",
        "violet"=>"ee82ee",
        "wheat"=>"f5deb3","white"=>"ffffff","whitesmoke"=>"f5f5f5",
        "yellow"=>"ffff00","yellowgreen"=>"9acd32");

    $colorHints = array();
    foreach ($colorMap as $name => $color) {
        $colorHints['"#' . $color . '"'] = '<span class="colorSwatch" style="background-color: #' . $color . '">&nbsp;</span>' . $name;
    }
    $meta['types']['color']['options'] = $colorHints;

    // Load sounds
    $soundsJson = json_decode(file_get_contents($resourcePackFolder . '/default/assets/minecraft/sounds.json'), true);
    $sounds = array_keys($soundsJson);
    $sounds = array_fill_keys($sounds, null);
    $meta['types']['sound']['options'] = array_merge($meta['types']['sound']['options'], $sounds);

    // Populate action, effect and effectlib class types
    $meta['types']['action_class']['options'] = getClassedOptions($meta, 'actions');
    $meta['types']['effectlib_class']['options'] = getClassedOptions($meta, 'effectlib_effects');

    // Merge entity properties into the SpawnEntity action
    $entityData = $meta['types']['mob_properties']['parameters'];
    $meta['classed']['actions']['spawn_entity']['parameters'] = array_merge($meta['classed']['actions']['spawn_entity']['parameters'], $entityData);

    return json_encode($meta);
}