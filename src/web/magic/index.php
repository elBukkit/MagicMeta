<?php

require_once('../config.inc.php');
require_once('common/meta.inc.php');
require_once("configs.inc.php");

function convertColorCodes($line) {
    $chatColors  = array(
        '0' => 'black',
        '1' => 'dark_blue',
        '2' => 'dark_green',
        '3' => 'dark_aqua',
        '4' => 'dark_red',
        '5' => 'dark_purple',
        '6' => 'gold',
        '7' => 'gray',
        '8' => 'dark_gray',
        '9' => 'blue',
        'a' => 'green',
        'b' => 'aqua',
        'c' => 'red',
        'd' => 'mediumpurple',
        'e' => 'yellow',
        'f' => 'white',
        'k' => '',
        'l' => '',
        'm' => '',
        'n' => '',
        'o' => '',
        'r' => 'white');
	$tagCount = 1;
	$line = "<span style=\"color:black\">". $line;
	foreach ($chatColors as $c => $color) {
		$replaceStyle = "";
		if ($c == 'i') {
			$replaceStyle = "font-style: italic";
		} else if ($c == 'l') {
			$replaceStyle = "font-weight: bold";
		} else if ($c == 'n') {
			$replaceStyle = "text-decoration: underline";
		} else {
			if ($color != "") {
				$replaceStyle = "color:" . $color;
			}
		}
		$replaceCount = 0;
		$line = str_replace("&" . $c,  "<span style=\"$replaceStyle\">", $line, $replaceCount);
		$tagCount += $replaceCount;
	}
	for ($i = 0; $i < $tagCount; $i++) {
		$line .= "</span>";
	}

	return $line;
}

function underscoreToReadable($s) {
	if (!$s) return $s;
	return strtoupper($s[0]) . preg_replace_callback('/_([a-z])/', function($c) {
        return ' ' . strtoupper($c[1]);
    }, substr($s, 1));
}

function printMaterial($materialKey, $iconOnly = null) {
	$materialName = underscoreToReadable($materialKey);
	$imagePath = 'image/material';
	$imageDir = dirname(__FILE__) . '/' . $imagePath;
	$materialKey = explode(':', $materialKey);
	$materialKey = $materialKey[0];
	$materialIcon = str_replace('_', '', $materialKey) . '.png';
	$materialFilename = $imageDir . '/' . $materialIcon;
	if (file_exists($materialFilename)) {
		return $icon = '<span title="' . $materialName . '" class="materal_icon" style="background-image: url(' . $imagePath . '/' . $materialIcon . ')">&nbsp;</span>';
	} else {
		if ($iconOnly) {
			return '<span title="' . $materialName . '" class="materal_icon">&nbsp;</span>';
		}
	}
	return '<span class="material">' . $materialName . '</span>';
}

function prinSpelltIcon($iconUrl, $title) {
    return $icon = '<span title="' . $title . '" class="materal_icon" style="background-image: url(' . $iconUrl . ')">&nbsp;</span>';
}

function printIcon($iconUrl, $title) {
    return $icon = '<span title="' . $title . '" class="url_icon materal_icon" style="background-image: url(' . $iconUrl . ')">&nbsp;</span>';
}

function findAndPrintIcon($name, $iconItem, $iconUrl, $spellKey = null) {
    $icon = '';
    if ($spellKey) {
        global $resourcePackFolder;
        $iconFile = 'default/assets/magic/textures/icons/spells/' . $spellKey . '.png';
        if (file_exists($resourcePackFolder . $iconFile)) {
            $icon = prinSpelltIcon('pack/' . $iconFile, $name);
        }
    }
    if (!$icon && $iconUrl) {
        $icon = printIcon($iconUrl, $name);
    }
    if (!$icon && $iconItem) {
        $icon = printMaterial($iconItem, true);
    }
    return $icon;
}

$configData = getConfigs($_REQUEST['example'] ?? 'survival');
if (!$configData) {
    die("Sorry, the site is currently unavailable!");
}

$wands = $configData['wands'];
$crafting = $configData['crafting'];
$spellIcons = $configData['spellIcons'];
$textures = $configData['textures'];
$upgrades = $configData['upgrades'];
$spells = $configData['spells'];
$mobs = $configData['mobs'];
$enchanting = $configData['enchanting'];
$worthItems = $configData['worthItems'];
$maxXpRegeneration = $configData['maxXpRegeneration'];
$maxXp = $configData['maxXp'];
$categories = $configData['categories'];
$worthBase = $configData['worthBase'];
$wands = $configData['wands'];
$books = $configData['books'];
$enchantingEnabled = $configData['enchantingEnabled'];
$combiningEnabled = $configData['combiningEnabled'];
$wandItem = $configData['wandItem'];
$craftingEnabled = $configData['craftingEnabled'];
$rightClickCycles = $configData['rightClickCycles'];
$eraseMaterial = $configData['eraseMaterial'];
$copyMaterial = $configData['copyMaterial'];
$replicateMaterial = $configData['replicateMaterial'];
$cloneMaterial = $configData['cloneMaterial'];
$texturePath = $configData['texturePath'];

?>
<html>
	<head>
		<title><?= $title ?></title>
		<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
		<link rel="stylesheet" href="common/css/smoothness/jquery-ui-1.10.3.custom.min.css" />
		<link rel="stylesheet" href="common/css/common.css?v=1" />
		<link rel="stylesheet" href="css/magic.css?v=1" />
		<script src="common/js/jquery-1.10.2.min.js"></script>
		<script src="common/js/jquery-ui-1.10.3.custom.min.js"></script>
		<script>
			var spells = <?= json_encode($spells); ?>;
			var paths = <?= json_encode($enchanting); ?>;
			var recipes = <?= json_encode($crafting); ?>;
			var wands = <?= json_encode($wands); ?>;
			var upgrades = <?= json_encode($upgrades); ?>;
			var eraseMaterial = '<?= $eraseMaterial ?>';
			var copyMaterial = '<?= $copyMaterial ?>';
			var cloneMaterial = '<?= $cloneMaterial ?>';
			var replicateMaterial = '<?= $replicateMaterial ?>';
			var books = <?= json_encode($books); ?>;
			var mobs = <?= json_encode($mobs); ?>;
			var worthItems = <?= json_encode($worthItems); ?>;
			var worthBase = <?= $worthBase ?>;
			var maxXpRegeneration = <?= $maxXpRegeneration ?>;
			var maxXp = <?= $maxXp ?>;
            var categories = <?= json_encode($categories) ?>;
		</script>
		<script src="js/magic.js?v=1"></script>
		<?php if ($analytics) echo $analytics; ?>
	</head>
	<body>
		<div id="heading"><?= $pageOverview ?></div>
		<div id="tabs" style="display:none">
			<ul>
				<li><a href="#overview">Overview</a></li>
				<li><a href="#spells">Spells</a></li>
				<li><a href="#crafting">Crafting</a></li>
				<li><a href="#enchanting">Paths</a></li>
				<li><a href="#wands">Wands and Items</a></li>
				<li><a href="#upgrades">Upgrades</a></li>
				<li><a href="#mobs">Mobs</a></li>
				<li id="booksTab"><a href="#books">Books</a></li>
                <li><a href="#textures">Textures</a></li>
				<li><a href="#icons">Icons</a></li>
				<li><a href="#examples">Examples</a></li>
			</ul>
			<div id="overview">
			  <div class="scrollingTab">
				<h2>Obtaining a Wand</h2>
				<div>
				In order to cast spells, you must obtain a wand. Each wand is unique and knows one or more spells. Wands can also be imbued with
				special properties and materials.<br/><br/>
				You may obtain a wand in one of the following ways:
				<ul>
					<?php if ($howToGetWands) {
						foreach ($howToGetWands as $item) {
							echo "<li>$item</li>"; 
						}
					}?>
					<?php if ($craftingEnabled) {
						echo '<li>You can craft a wand (See: the Crafting tab)</li>';
					}?>
				</ul>
				</div>
				<?php 
				if ($enchantingEnabled) {
					?>
					<div>You may upgrade your wands on an enchanting table.</div>
				<?php
				} ?>
				<?php 
				if ($combiningEnabled) {
					?>
					<div>You may combine two wands on an anvil. (Click the empty result slot, it's WIP!)</div>
				<?php 
				} ?>
                <div>There are also <?= count($wands); ?> wand templates, which may be purchasable or given my admins.</div>

                <h2>Wand Spells</h2>
                <div>
                    Wands contain one or more spells in their inventory. You can use an enchanting table to learn new spells.
                </div>
                <br/>
                <div>
                    There are currently <?= count($spells) ?> spells available.
                </div>


				<h2>Using a Wand</h2>
				<div>
					A wand is considered "active" when you are holding it. Any special effects a wand gives are only applied while the wand is active.<br.>
					<br/><br/>
					Swing a wand (left-click) to cast its active spell. Some wands may have more than one spell. If a wand has multiple spells, you use the
					interact (right-click) action to cycle spells, and the drop (Q) action to open/close the spell inventory
					<br/><br/>

						For detailed instructions, see this video:<br/><br/>
						<iframe width="640" height="360" src="//www.youtube.com/embed/<?= $youTubeVideo ?>" frameborder="0" allowfullscreen></iframe>
						<br/><br/>
					    Wands may function in one of three modes:<br/>
					    <b>Chest Mode</b><br/>
					    In the default mode, right-clicking with your wand will pop up a chest inventory. Click on a spell icon to activate it.<br/><br/>
					    If your wand has a lot of spells, click outside of the inventory window to move to the next page. Right-click outside of the inventory to move back a page.
					    <br/><br/>
					    <b>Inventory Mode</b><br/>
						Right-click with your wand to toggle the wand inventory. When the wand's inventory is active, your survival items are stored
						and your player's inventory will change to show the spells and materials bound to your active wand:
						<br/><br/>
						<img src="image/WandHotbar.png" alt="Wand hotbar image"/>
						<br/><br/>
						With the wand inventory active, each spell is represented by an icon. You can quickly change spells using the hotbar buttons (1-9).
						<br/><br/>
						You can also open your inventory ('E' by default) to see all of the spells and materials your wand has, with detailed descriptions:
						<br/><br/>
						<img src="image/WandInventory.png" alt="Wand inventory image"/>
						<br/><br/>
						While in this view, you can re-arrange your spells and materials, deciding which ones to put in the hotbar.
						<br/><br/>
						Right-click again to deactivate the wand inventory and restore your items. Any items you
						collected while the wand inventory was active will be in your survival inventory.
						<br/><br/>
						For wands with more than 35 spells, clicking outside of the inventory will cycle to the next "page" of spells.
                        Right-clicking outside of the inventory will go to the previous page.
                        Renaming a wand on an anvil will organize its inventory,
						should it get too cluttered.
						<br/><br/>
						A spell or material can be quick-selected from an open wand inventory using right-click.
						<br/><br/>
						<b>Cycle Mode</b><br/>
						This mode only works well with low-powered wands, ones that only have a few spells. In this mode
						you right-click to cycle through available spells- there is no menu, and no icons.
				</div>
				<h2>Costs</h2>
				<div>
					Casting costs vary by spell, wand, and server configuration.<br/><br/>
					The most common setup is the "mana" system. In this mode, each wand has a mana pool that 
					regenerates over time. While a wand is active, your mana is represented by the XP bar. (Your gathered XP will
					be saved and restored when the wand deactivates).<br/><br/>
					Other configurations could range from consuming actual XP, reagent items, or just being free.
					<br/><br/>
					Some wands may also have a limited number of uses, after which time they will self-destruct.
				</div>
			  </div>
			</div>
			<div id="spells">
			  <div class="scrollingTab">
			  	<div class="navigation">
				<ol id="spellList">
				<?php 
					foreach ($spells as $key => $spell) {
                        $name = isset($spell['name']) ? $spell['name'] : "($key)";
                        $icon = findAndPrintIcon($name, isset($spell['icon']) ? $spell['icon'] : null, isset($spell['icon_url']) ? $spell['icon_url'] : null, $key);
						echo '<li class="ui-widget-content" id="spell-' . $key . '">' . $icon . '<span class="spellTitle">' . $name . '</span></li>';
					}
				?>
				</ol>
			  </div>
			  </div>
			  <div class="details" id="spellDetails">
			  	Select a spell for details.
			  </div>
			</div>
			<div id="crafting">
			  <div class="scrollingTab">
			  	<div class="navigation">
				<ol id="craftingList">
				<?php
					foreach ($crafting as $key => $craftingRecipe)
                    {
						$wand = $craftingRecipe['wand'];
						if ($wand) {
							$name = isset($wand['name']) && $wand['name'] ? $wand['name'] : "($key)";
						} else {
							$name = $key;
						}
						$nameSpan = $name;
						if (isset($craftingRecipe['enabled']) && !$craftingRecipe['enabled']) {
							$nameSpan = '<span class="disabled">' . $name . '</span>';
						}
						$icon = $craftingRecipe['output'];
						if ($wand && isset($wand['icon']))
						{
							$icon = $wand['icon'];
							if (strpos($icon, 'skull_item:') !== FALSE) {
								$icon = trim(substr($icon, 11));
								$icon = printIcon($icon, $name);
							} else {
								$icon = printMaterial($icon, true);
							}
						} else {
							$icon = printMaterial($icon, true);
						}
						echo '<li class="ui-widget-content" id="recipe-' . $key . '">' . $icon . '<span class="recipeTitle">' . $nameSpan . '</span></li>';
					}
				?>
				</ol>
			  </div>
			  </div>
			  <div class="details" id="craftingDetails">
			  	Select a recipe for details.
			  </div>
			</div>
			<div id="enchanting">
			  <div class="scrollingTab">
			  	<div class="navigation">
				<ol id="enchantingList">
				<?php
					foreach ($enchanting as $key => $path) {
                        $name = isset($path['name']) ? $path['name'] : "($key)";
                        $name = convertColorCodes($name);

						echo '<li class="ui-widget-content" id="path-' . $key . '"><span class="pathTitle">' . $name . '</span></li>';
					}
				?>
				</ol>
			  </div>
			  </div>
			  <div class="details" id="enchantingDetails">
			  	Select a progression path for details.
			  </div>
			</div>
			<div id="wands">
			  <div class="scrollingTab">
				<div class="navigation">
				<ol id="wandList">
				<?php 
					foreach ($wands as $key => $wand) {
						$extraStyle = '';
						if (isset($wand['effect_color'])) {
							$effectColor = $wand['effect_color'];
							if ($effectColor == 'FFFFFF') {
								$effectColor = 'DDDDDD';
							}
							$extraStyle = 'font-weight: bold; color: #' . $effectColor;
						}
						$name = isset($wand['name']) && $wand['name'] ? $wand['name'] : "($key)";
						$wandClass = ($key == 'random') ? 'randomWandTitle' : 'wandTitle';

                        $icon = 'wand';
                        if (isset($wand['icon']))
                        {
                            $icon = $wand['icon'];
                            if (strpos($icon, 'skull_item:') !== FALSE) {
                                $icon = trim(substr($icon, 11));
                                $icon = printIcon($icon, $name);
                            } else {
                                $icon = printMaterial($icon, true);
                            }
                        } else {
                            $icon = printMaterial($icon, true);
                        }

						echo '<li class="ui-widget-content" style="' . $extraStyle . '" id="wand-' . $key . '">' . $icon . '<span class="' . $wandClass . '">' . $name . '</span></li>';
					}
				?>
				</ol>
			  </div>
			  </div>
			  <div class="details" id="wandDetails">
			  	Select a wand for details.
			  </div>
			</div>
			<div id="upgrades">
              <div class="scrollingTab">
                <div class="navigation">
                <ol id="upgradeList">
                <?php
                    foreach ($upgrades as $key => $upgrade) {
                        $extraStyle = '';
                        if (isset($upgrade['effect_color'])) {
                            $effectColor = $upgrade['effect_color'];
                            if ($effectColor == 'FFFFFF') {
                                $effectColor = 'DDDDDD';
                            }
                            $extraStyle = 'font-weight: bold; color: #' . $effectColor;
                        }
                        $name = isset($upgrade['name']) && $upgrade['name'] ? $upgrade['name'] : "($key)";
                        $icon = isset($upgrade['icon']) ? $upgrade['icon'] : 'nether_star';
                        $icon = printMaterial($icon, true);
                        echo '<li class="ui-widget-content" style="' . $extraStyle . '" id="wand-' . $key . '">' . $icon . '<span class="wandTitle">' . $name . '</span></li>';
                    }
                ?>
                </ol>
              </div>
              </div>
              <div class="details" id="upgradeDetails">
                Select an item for details.
              </div>
            </div>
			<div id="mobs">
			  <div class="scrollingTab">
			  	<div class="navigation">
				<ol id="mobList">
				<?php
					foreach ($mobs as $key => $mob)
                    {
						$nameSpan = $mob['name'];
						$nameSpan = convertColorCodes($nameSpan);
						if (isset($mob['enabled']) && !$mob['enabled']) {
							$nameSpan = '<span class="disabled">' . $nameSpan . '</span>';
						} else if (isset($mob['hidden']) && !$mob['hidden']) {
							$nameSpan = '<span class="hidden">' . $nameSpan . '</span>';
						}
						echo '<li class="ui-widget-content" id="mob-' . $key . '"><span class="mobTitle">' . $nameSpan . '</span></li>';
					}
				?>
				</ol>
			  </div>
			  </div>
			  <div class="details" id="mobDetails">
			  	Select a mob for details.
			  </div>
			</div>
			<div id="books">
			  <div class="scrollingTab">
				<div class="navigation">
				<ol id="bookList">
				<?php 
					foreach ($books as $key => $book) {
						if (!isset($book['title'])) continue;
						echo '<li class="ui-widget-content" id="book-' . $key . '">' .'<span class="bookTitle">' . $book['title'] . '</span></li>';
					}
				?>
				</ol>
			  </div>
			  </div>
			  <div class="details" id="bookDetails">
			  	Select a book to read.
			  </div>
			</div>
            <div id="icons">
                <div class="scrollingTab">
                    <div>
                        <div class="title">
                            There are <?= count($spellIcons) ?> spell icons available in the Magic RP, each with a representative vanilla item chosen to represent a specific spell:
                        </div>
                        <ul id="iconList">
                            <?php
                            foreach ($spellIcons as $spellIcon) {
                                if ($spellIcon['item']) {
                                    echo '<li class="ui-widget-content"><img class="icon" src="pack/' . $texturePath . '/assets/minecraft/textures/item/' . $spellIcon['texture'] . '.png"> <span class="iconItem">' . $spellIcon['item'] . '</span><span class="iconName">(' . $spellIcon['texture'] . ')</span></li>';
                                }
                            }
                            ?>
                        </ul>
                    </div>
                </div>
            </div>
            <div id="examples">
                <div class="scrollingTab">
                    <div>
                        <div class="title">
                            Click below to load up any of the builtin examples.
                        </div>
                        <ul>
                            <li><a href="?example=survival">Survival (survival, The default example)</a></li>
                            <li><a href="?example=engineering">Engineering (engineering)</a></li>
                            <li><a href="?example=potter">Harry Potter (potter)</a></li>
                            <li><a href="?example=stars">Star Wars (stars)</a></li>
                            <li><a href="?example=bending">Avatar Bending (bending)</a></li>
                        </ul>
                    </div>
                </div>
            </div>
			<div id="textures">
				<div class="scrollingTab">
					<div>
						<div class="title">
							Legacy configs use player skulls for icons, here are <?= count($textures) ?> that have been made or chosen specifically for Magic.
						</div>
						<ul id="textureList">
							<?php
							foreach ($textures as $texture) {
								$icon = printIcon($texture, $texture);
								echo '<li class="ui-widget-content">' . $icon . '<span class="textureURL">' . $texture . '</span></li>';
							}
							?>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>