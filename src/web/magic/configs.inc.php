<?php

function getConfigs($example) {
    global $sessionFolder;
    global $magicRootFolder;

    $cacheFile = "$sessionFolder/_configs_$example.cache";
    $lockFile = fopen($cacheFile, 'c+');
    if ($lockFile === FALSE) {
        error_log("Could not create file at $lockFile");
        return loadConfigs($example);
    }
    flock($lockFile, LOCK_EX);
    try {
        if (filesize($cacheFile) > 0) {
            $configsUpdated = filemtime($magicRootFolder);
            $cacheCreated = filemtime($cacheFile);
            $codeUpdated = filemtime(__FILE__);
            if ($cacheCreated >= $configsUpdated && $cacheCreated >= $codeUpdated) {
                return json_decode(file_get_contents($cacheFile), true);
            }
        }
        $configs = loadConfigs($example);
        file_put_contents($cacheFile, json_encode($configs));
        return $configs;
    } catch (Exception $ex) {
        error_log("Error creating configs cache file", $ex);
        return loadConfigs($example);
    } finally {
        // Release lock and close lock file
        flock($lockFile, LOCK_UN);
        fclose($lockFile);
    }
}

function loadConfigs($example) {
    // Load and parse Magic configuration files
    $texturePath = 'default';
    try {
        global $magicRootFolder;
        global $magicDefaultsFolder;
        global $resourcePackFolder;
        global $enchanting;
        global $enchantingConfig;

        // Using survival configs in place of defaults now!
        $magicDefaultsFolder = "$magicRootFolder/examples/survival";

        // Look for path override
        $isExample = $example && $example != 'survival';
        if ($isExample) {
            $path = $example;
            $magicRootFolder = "$magicRootFolder/examples/$path";

            // special-case hackiness to show painterly icons
            if ($path === 'painterly') $texturePath = 'painterly';
            else if ($path === 'potter') $texturePath = 'potter';
        }

        $general = parseConfigFile('config', true);
        $skipDefaultSpells = isset($general['skip_inherited']) && in_array('spells', $general['skip_inherited']);
        $skipDefaultWands = isset($general['skip_inherited']) && in_array('wands', $general['skip_inherited']);
        $skipDefaultCrafting = isset($general['skip_inherited']) && in_array('crafting', $general['skip_inherited']);
        $skipDefaultPaths = isset($general['skip_inherited']) && in_array('paths', $general['skip_inherited']);

        $disableDefaultSpells = isset($general['disable_inherited']) && in_array('spells', $general['disable_inherited']);
        $disableDefaultWands = isset($general['disable_inherited']) && in_array('wands', $general['disable_inherited']);

        // Another hack, if we're not inheriting then don't load any defaults
        if ($isExample && !isset($general['inherit'])) {
            $skipDefaultSpells = true;
            $skipDefaultWands = true;
            $skipDefaultCrafting = true;
            $skipDefaultPaths = true;
        }

        $allSpells = parseConfigFile('spells', !$skipDefaultSpells, $disableDefaultSpells);
        $wands = parseConfigFile('wands', !$skipDefaultWands, $disableDefaultWands);
        $crafting = parseConfigFile('crafting', !$skipDefaultCrafting);
        $enchantingConfig = parseConfigFile('paths', !$skipDefaultPaths);
        $mobConfig = parseConfigFile('mobs', true);
        $messages = parseConfigFile('messages', true);

        $language = isset($_REQUEST['lang']) ? $_REQUEST['lang'] : '';
        if ($language) {
            $localizationFile = "$magicRootFolder/examples/localizations/messages.$language.yml";
            if (!file_exists($localizationFile)) {
                die("Can't find localization file for language $language");
            }
            $localization = yaml_parse_file($localizationFile);
            $messages = array_replace_recursive($messages, $localization);
        }

        // load meta textures
        $spellIcons = array();
        $metadata = getMetadata(false);
        $metadata = $metadata ? json_decode($metadata, true) : null;
        if ($metadata) {
            $iconOptions = $metadata['types']['spell_icon']['options'];
            foreach ($iconOptions as $itemKey => $description) {
                // Kind hacky, if description format ever changes this could break
                $texture = explode('/', $description);
                if (count($texture) < 3) continue;
                if (strpos($texture[count($texture) - 2], "spells") === -1) continue;
                $texture = 'spells/' . $texture[count($texture) - 1];
                array_push($spellIcons,
                    array('texture' => $texture, 'item' => $itemKey)
                );
                asort($spellIcons);
            }
        } else {
            // Load resource pack textures
            $spellJson = json_decode(file_get_contents($resourcePackFolder . '/default/assets/minecraft/models/item/diamond_axe.json'), true);
            $spellJson = $spellJson['overrides'];
            $diamondUses = 1562;
            foreach ($spellJson as $spellPredicate) {
                $durability = round($spellPredicate['predicate']['damage'] * $diamondUses);
                $texture = str_replace('item/', '', $spellPredicate['model']);
                array_push($spellIcons,
                    array('texture' => $texture, 'item' => 'diamond_axe:' . $durability)
                );
            }
        }

    } catch (Exception $ex) {
        die($ex->getMessage());
    }

    $upgrades = array();

    // Look up localizations
    $spells = array();
    foreach ($allSpells as $key => $spell) {
        if ($key == 'default' || (isset($spell['hidden']) && $spell['hidden']) || (isset($spell['enabled']) && !$spell['enabled'])) {
            continue;
        }
        $spell['key'] = $key;

        $spell['upgrade_description'] = isset($messages['spells'][$key]['upgrade_description']) ? $messages['spells'][$key]['upgrade_description'] : '';
        if (strpos($key, '|') !== FALSE) {
            $spellPieces = explode('|', $key);
            $baseKey = $spellPieces[0];
            $level = $spellPieces[1];
            $spellLevel = $allSpells[$key];
            if (isset($spells[$baseKey])) {
                $spellLevel['key'] = $key;
                $baseSpell = &$spells[$baseKey];
                if (!isset($baseSpell['spell_levels'])) {
                    $baseSpell['spell_levels'] = array($level => $spellLevel);
                } else {
                    $baseSpell['spell_levels'][$level] = $spellLevel;
                }
            }
            continue;
        }

        if (isset($spell['inherit']) && $spell['inherit'])
        {
            $inheritKey = $spell['inherit'];
            // this is a little hacky but should be good enough!
            if (strpos($inheritKey, '|') !== FALSE) {
                $spellPieces = explode('|', $inheritKey);
                $baseKey = $spellPieces[0];
                if (isset($allSpells[$baseKey])) {
                    $spell = array_merge($spell, $allSpells[$baseKey]);
                }
            }

            // We are missing the default configs which include base classes such as base_passivem
            // so we are not even going to warn about this.
            if (isset($allSpells[$inheritKey])) {
                $spell = array_merge($spell, $allSpells[$inheritKey]);
            }
            $spell['enabled'] = true;
        }
        if ((isset($spell['hidden']) && $spell['hidden']) || (isset($spell['enabled']) && !$spell['enabled'])) {
            continue;
        }
        if (!isset($spell['name']))
        {
            $spell['name'] = isset($messages['spells'][$key]['name']) ? $messages['spells'][$key]['name'] : $key;
        }

        if (!isset($spell['description']))
        {
            $spell['description'] = isset($messages['spells'][$key]['description']) ? $messages['spells'][$key]['description'] : '';
        }
        $spell['extended_description'] = isset($messages['spells'][$key]['extended_description']) ? $messages['spells'][$key]['extended_description'] : '';
        $spell['usage'] = isset($messages['spells'][$key]['usage']) ? $messages['spells'][$key]['usage'] : '';
        $spells[$key] = $spell;
    }

    ksort($spells);

    $mobs = array();
    foreach ($mobConfig as $key => $mob) {
        if (isset($mob['hidden']) && $mob['hidden']) {
            continue;
        }

        // This is kind of a hack, but we don't load in the actual defaults
        if (isset($mob['inherit']) && $mob['inherit'] == 'base_npc') {
            continue;
        }
        if (isset($mob['inherit']) && isset($mobConfig[$mob['inherit']])) {
            $inherit = $mobConfig[$mob['inherit']];
            if (isset($inherit['hidden']) && $inherit['hidden']) {
                continue;
            }
        }
        $mob['key'] = $key;
        if (!isset($mob['name'])) {
            $mob['name'] = isset($messages['mobs'][$key]['name']) ? $messages['mobs'][$key]['name'] : $key;
        }
        if (!isset($mob['description'])) {
            $mob['description'] = isset($messages['mobs'][$key]['description']) ? $messages['mobs'][$key]['description'] : '';
        }
        $mobs[$key] = $mob;
    }
    ksort($mobs);

    // Filter and link enchanting paths
    $enchanting = array();
    foreach ($enchantingConfig as $key => $path) {
        getPath($key);
    }

    // Two-passes for inheritance
    foreach ($enchanting as $key => $path) {
        if ($key == 'default' || (isset($path['hidden']) && $path['hidden'])) {
            unset($enchanting[$key]);
            continue;
        }
        $path['name'] = isset($messages['paths'][$key]['name']) ? $messages['paths'][$key]['name'] : '';
        $path['description'] = isset($messages['paths'][$key]['description']) ? $messages['paths'][$key]['description'] : '';
        $enchanting[$key] = $path;
    }

    ksort($enchanting);

    // Process economy data
    $worthItems = array();

    if (isset($general['currency'])) {
        $tempWorth = array();
        foreach ($general['currency'] as $item => $data) {
            $tempWorth[$data['worth']] = $item;
        }
        krsort($tempWorth);
        foreach ($tempWorth as $amount => $item) {
            $worthItems[] = array('item' => $item, 'amount' => $amount);
        }
    }

    // Look up category naming info
    $categories = isset($messages['categories']) ? $messages['categories'] : array();

    $worthBase = isset($general['worth_base']) ? $general['worth_base'] : 1;

    // Parse wand properties needed for cost validation
    $useModifier = isset($general['worth_use_multiplier']) ? $general['worth_use_multiplier'] : 1;
    $worthBrush = isset($general['worth_brush']) ? $general['worth_brush'] : 0;
    $worthMana = isset($general['worth_mana']) ? $general['worth_mana'] : 0;
    $worthManaMax = isset($general['worth_mana_max']) ? $general['worth_mana_max'] : 0;
    $worthManaRegeneration = isset($general['worth_mana_regeneration']) ? $general['worth_mana_regeneration'] : 0;
    $worthDamageReduction = isset($general['worth_damage_reduction']) ? $general['worth_damage_reduction'] : 0;
    $worthDamageReductionExplosions = isset($general['worth_damage_reduction_explosions']) ? $general['worth_damage_reduction_explosions'] : 0;
    $worthDamageReductionFalling = isset($general['worth_damage_reduction_falling']) ? $general['worth_damage_reduction_falling'] : 0;
    $worthDamageReductionPhysical = isset($general['worth_damage_reduction_physical']) ? $general['worth_damage_reduction_physical'] : 0;
    $worthDamageReductionFire = isset($general['worth_damage_reduction_fire']) ? $general['worth_damage_reduction_fire'] : 0;
    $worthDamageReductionProjectiles = isset($general['worth_damage_reduction_projectiles']) ? $general['worth_damage_reduction_projectiles'] : 0;
    $worthCostReduction = isset($general['worth_cost_reduction']) ? $general['worth_cost_reduction'] : 0;
    $worthCooldownReduction = isset($general['worth_cooldown_reduction']) ? $general['worth_cooldown_reduction'] : 0;
    $worthEffectColor = isset($general['worth_effect_color']) ? $general['worth_effect_color'] : 0;
    $worthEffectParticle = isset($general['worth_effect_particle']) ? $general['worth_effect_particle'] : 0;
    $worthEffectSound = isset($general['worth_effect_sound']) ? $general['worth_effect_sound'] : 0;

    // Wand limits for scaled displays
    $maxXpRegeneration = isset($general['max_mana_regeneration']) ? $general['max_mana_regeneration'] : 0;
    $maxXp = isset($general['max_mana']) ? $general['max_mana'] : 0;

    // Process wands
    // Look up localizations
    // Calculate worth
    // Hide hidden wands, organize upgrades
    foreach ($wands as $key => $wand) {
        if ((isset($wand['hidden']) && $wand['hidden']) || (isset($wand['enabled']) && !$wand['enabled'])) {
            unset($wands[$key]);
            continue;
        }

        $wand['name'] = isset($messages['wands'][$key]['name']) ? $messages['wands'][$key]['name'] : '';
        $wand['description'] = isset($messages['wands'][$key]['description']) ? $messages['wands'][$key]['description'] : '';
        if (isset($messages['wands'][$key]['upgrade_item_description'])) {
            if ($wand['description']) {
                $wand['description'] .= "\n";
            }
            $wand['description'] .= $messages['wands'][$key]['upgrade_item_description'];
        }
        $wandsSpells = isset($wand['spells']) ? $wand['spells'] : array();
        if (!is_array($wandsSpells)) {
            $wandsSpells = array();
        }
        $worth = 0;
        foreach ($wandsSpells as $wandSpell) {
            if (isset($spells[$wandSpell]) && isset($spells[$wandSpell]['worth'])) {
                $worth += $spells[$wandSpell]['worth'];
            }
        }

        $wandBrushes = isset($wand['materials']) ? $wand['materials'] : array();
        $worth += (count($wandBrushes) * $worthBrush);
        $worth += (isset($wand['xp']) ? $wand['xp'] : 0) * $worthMana;
        $worth += (isset($wand['xp_max']) ? $wand['xp_max'] : 0) * $worthManaMax;
        $worth += (isset($wand['xp_regeneration']) ? $wand['xp_regeneration'] : 0) * $worthManaRegeneration;
        $worth += (isset($wand['damage_reduction']) ? $wand['damage_reduction'] : 0) * $worthDamageReduction;
        $worth += (isset($wand['damage_reduction_physical']) ? $wand['damage_reduction_physical'] : 0) * $worthDamageReductionPhysical;
        $worth += (isset($wand['damage_reduction_falling']) ? $wand['damage_reduction_falling'] : 0) * $worthDamageReductionFalling;
        $worth += (isset($wand['damage_reduction_fire']) ? $wand['damage_reduction_fire'] : 0) * $worthDamageReductionFire;
        $worth += (isset($wand['damage_reduction_projectiles']) ? $wand['damage_reduction_projectiles'] : 0) * $worthDamageReductionProjectiles;
        $worth += (isset($wand['damage_reduction_explosions']) ? $wand['damage_reduction_explosions'] : 0) * $worthDamageReductionExplosions;
        $worth += (isset($wand['cost_reduction']) ? $wand['cost_reduction'] : 0) * $worthCostReduction;
        $worth += (isset($wand['cooldown_reduction']) ? $wand['cooldown_reduction'] : 0) * $worthCooldownReduction;
        $worth += (isset($wand['effect_particle']) && strlen($wand['effect_particle']) > 0 ? $worthEffectParticle : 0);
        $worth += (isset($wand['effect_color']) && strlen($wand['effect_color']) > 0 ? $worthEffectColor : 0);
        $worth += (isset($wand['effect_sound']) && strlen($wand['effect_sound']) > 0 ? $worthEffectSound : 0);

        if (isset($wand['uses']) && $wand['uses'] > 0) {
            $worth *= $useModifier;
        }

        $wand['worth'] = $worth;
        $wand['spells'] = $wandsSpells;

        if (isset($wand['upgrade']) && $wand['upgrade']) {
            unset($wands[$key]);
            $upgrades[$key] = $wand;
        } else {
            $wands[$key] = $wand;
        }
    }
    ksort($wands);
    ksort($upgrades);

    // Look up craftable wands
    foreach ($crafting as $key => &$recipe) {
        if (!isset($recipe['output_type']) || $recipe['output_type'] != 'wand')
        {
            $recipe['wand'] = null;
            continue;
        }
        $recipeOutput = $recipe['output'];
        if (isset($wands[$recipeOutput])) {
            $recipe['wand'] = $wands[$recipeOutput];
        } else if (isset($upgrades[$recipeOutput])) {
            $recipe['wand'] = $upgrades[$recipeOutput];
        }
    }

    $enchantingEnabled = isset($general['enable_enchanting']) ? $general['enable_enchanting'] : false;
    $combiningEnabled = isset($general['enable_combining']) ? $general['enable_combining'] : false;

    $wandItem = isset($general['wand_item']) ? $general['wand_item'] : '';
    $craftingEnabled = isset($general['enable_crafting']) ? $general['enable_crafting'] : true;
    $rightClickCycles = isset($general['right_click_cycles']) ? $general['right_click_cycles'] : true;

    $eraseMaterial = isset($general['erase_item']) ? $general['erase_item'] : 'sulphur';
    $copyMaterial = isset($general['copy_item']) ? $general['copy_item'] : 'sugar';
    $replicateMaterial = isset($general['replicate_item']) ? $general['replicate_item'] : 'nether_stalk';
    $cloneMaterial = isset($general['clone_item']) ? $general['clone_item'] : 'pumpkin_seeds';

    $books = array();
    global $infoBookRootConfig;
    if (file_exists($infoBookRootConfig)) {
        $booksConfigKeys = array('version-check', 'onlogin', 'protected');
        $booksConfig = yaml_parse_file($infoBookRootConfig);
        foreach ($booksConfig as $key => $book) {
            // Hacky.. InfoBook has a weird config :\
            if (!in_array($booksConfig, $booksConfigKeys)) {
                $books[$key] = $book;
            }
        }
    }

    $textures = array();
    $textureConfig = $resourcePackFolder . '/common/source/image_map.yml';
    if (file_exists($textureConfig)) {
        $textures = array_values(yaml_parse_file($textureConfig));
    }

    return array(
        'wands' => $wands,
        'crafting' => $crafting,
        'spellIcons' => $spellIcons,
        'textures' => $textures,
        'upgrades' => $upgrades,
        'spells' => $spells,
        'mobs' => $mobs,
        'enchanting' => $enchanting,
        'worthItems' => $worthItems,
        'maxXpRegeneration' => $maxXpRegeneration,
        'maxXp' => $maxXp,
        'categories' => $categories,
        'worthBase' => $worthBase,
        'wands' => $wands,
        'books' => $books,
        'enchantingEnabled' => $enchantingEnabled,
        'combiningEnabled' => $combiningEnabled,
        'wandItem' => $wandItem,
        'craftingEnabled' => $craftingEnabled,
        'rightClickCycles' => $rightClickCycles,
        'eraseMaterial' => $eraseMaterial,
        'copyMaterial' => $copyMaterial,
        'replicateMaterial' => $replicateMaterial,
        'cloneMaterial' => $cloneMaterial,
        'texturePath' => $texturePath
    );
}

function parseConfigFile($name, $loadDefaults, $disableDefaults = false) {
    global $magicDefaultsFolder;
    global $magicRootFolder;

    $baseFile = "$magicDefaultsFolder/$name.yml";
    $overrideFile = "$magicRootFolder/$name.yml";

    if ($loadDefaults) {
        $config = yaml_parse_file($baseFile);
        if (file_exists($overrideFile)) {
            $override = @yaml_parse_file($overrideFile);
            if ($override) {
                if ($disableDefaults) {
                    foreach ($config as $key => &$spell) {
                        $spell['enabled'] = false;
                    }
                }
                $config = array_replace_recursive($config, $override);
            }
        }
    } else {
        $config = @yaml_parse_file($overrideFile);
    }

    if (!$config || (count($config) == 1 && $config[0] == 0)) {
        $config = array();
    }

    return $config;
}

function getPath($key) {
    global $enchanting;
    global $enchantingConfig;

    if (!isset($enchanting[$key])) {
        if (!isset($enchantingConfig[$key])) {
            return null;
        }
        $config = $enchantingConfig[$key];
        $pathSpells = isset($config['spells']) ? $config['spells'] : array();
        $requiredSpells = isset($config['required_spells']) ? $config['required_spells'] : array();
        if (isset($config['inherit'])) {
            $baseConfig = getPath($config['inherit']);
            if ($baseConfig) {
                unset($baseConfig['hidden']);
                $spells = $config['spells'];
                $config = array_replace_recursive($baseConfig, $config);
                if ($baseConfig['spells']) {
                    $config['spells'] = array_merge($spells, $baseConfig['spells']);
                }
            }
        }
        $config['required_spells'] = $requiredSpells;
        $config['path_spells'] = $pathSpells;
        $enchanting[$key] = $config;
    }

    return $enchanting[$key];
}