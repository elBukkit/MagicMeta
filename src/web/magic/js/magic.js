
function getIcon(url)
{
    iconOnly = (typeof iconOnly === 'undefined') ? false : iconOnly;
    var icon = $('<span class="materal_icon url_icon" style="background-image: url(' + url + ')">&nbsp;</span>');
    return icon;
}

var _materialMap = {
	"stained_glass": "white_stained_glass",
	"wool": "white_wool",
	"dispenser": "dispenser_front",
	"daylight_detector": "daylight_detector_front",
	"ink_sack:15": "black_dye",
	"hard_clay": "terracotta"
};

function getSpellIcon(iconKey) {
	var imagePath = 'pack/default/assets/magic/textures/icons/spells';
	var enclosingSpan = $('<span/>');
	var icon = $('<span title="' + iconKey + '" class="materal_icon" style="background-image: url(' + imagePath + '/' + iconKey + '.png)">&nbsp;</span>');
	enclosingSpan.append(icon);
	return enclosingSpan;
}

function getMaterial(materialKey, iconOnly)
{
	if (_materialMap.hasOwnProperty(materialKey)) {
		materialKey = _materialMap[materialKey];
	}
	if (materialKey == null || materialKey.length == 0) return "";

    if (materialKey.indexOf("skull_item:") != -1)
    {
        return getIcon(materialKey.substring(11).trim());
    }
	
	iconOnly = (typeof iconOnly === 'undefined') ? false : iconOnly;
	var materialName = materialKey.replace(/_/g, ' ');
	if (materialKey == 'copy') {
		materialKey = copyMaterial;
		materialName = 'Copy';
		iconOnly = false;
	} else if (materialKey == 'erase') {
		materialKey = eraseMaterial;
		materialName = 'Erase';
		iconOnly = false;
	} else if (materialKey == 'replicate') {
		materialKey = replicateMaterial;
		materialName = 'Replicate';
		iconOnly = false;
	} else if (materialKey == 'clone') {
		materialKey = cloneMaterial;
		materialName = 'Clone';
		iconOnly = false;
	}
	var imagePath = 'common/image/material';
	var materialIcon = materialKey.split(':')[0] + '.png';
	var enclosingSpan = $('<span/>');
	var icon = $('<span title="' + materialName + '" class="materal_icon" style="background-image: url(' + imagePath + '/' + materialIcon + ')">&nbsp;</span>');
	enclosingSpan.append(icon);
	if (!iconOnly) {
		var text = $('<span class="material"/>').text(materialName);
		enclosingSpan.append(text);
	}
	return enclosingSpan;
}

function getWorth(worth)
{
    worth = worth * worthBase;
    var worthSpan = $('<span title="' + worth + '" class="worth"></span>');
    var remainder = worth;
    var itemIndex = 0;
    var text = "";
    for (var index in worthItems)
    {
        var itemAmount = worthItems[index].amount;
        var itemKey = worthItems[index].item;
        if (itemAmount < remainder) {
            var amount = Math.floor(remainder / itemAmount);
            remainder = remainder % itemAmount;
            var currencySpan = jQuery('<span/>');
            currencySpan.append(getMaterial(itemKey, true));
            currencySpan.append(jQuery('<span>x' + amount + '</span>'));
            currencySpan.append(jQuery('<span>&nbsp;&nbsp;&nbsp;</span>'));
            worthSpan.append(currencySpan);
        }
    }
    worthSpan.append(jQuery('<span> ($' + worth.toFixed(2) + ')</span>'));
    return worthSpan;
}

function getSpellDetails(key, showTitle, useMana, costReduction, probabilityString)
{
    if (!(key in spells)) {
        return $('<span/>').text("Sorry, something went wrong!");
    }
    var spell = spells[key];
    return createSpellDetails(spell, showTitle, useMana, costReduction, probabilityString)
}

function createSpellDetails(spell, showTitle, useMana, costReduction, probabilityString)
{
	showTitle = (typeof showTitle === 'undefined') ? true : showTitle;
	useMana = (typeof useMana === 'undefined') ? false : useMana;
	costReduction = (typeof costReduction === 'undefined') ? 0 : costReduction;
	var key = spell.key;
	var spellDiv = $('<div/>');
	if (showTitle) {
		var title = $('<div class="spellTitleBanner"/>').text(spell.name);
        spellDiv.append(title);
	}

	if (spell.hasOwnProperty('example_link') && spell.example_link.indexOf('gfycat.com') > 0) {
		var urlPieces = spell.example_link.split('/');
		var slug = urlPieces[urlPieces.length - 1];
		var iframe = $("<iframe src='https://gfycat.com/ifr/" + slug + "' frameborder='0' scrolling='no' width='480px' height='320px' style='position:absolute;top:0;left:0;' allowfullscreen>");
		var thumbnailDiv = $('<div class="thumbnailContainer"/>');
		thumbnailDiv.append(iframe);
		spellDiv.append(thumbnailDiv);
	} else if (spell.hasOwnProperty('example_thumbnail')) {
		var thumbnail = "https://thumbs.gfycat.com/VillainousInfantileEmeraldtreeskink-size_restricted.gif";
		var link = "https://thumbs.gfycat.com/VillainousInfantileEmeraldtreeskink";

		var thumbnailDiv = $('<div class="thumbnailContainer"/>');
		var thumbnailImage = $('<img>').prop('src', spell['example_thumbnail']);
		if (spell.hasOwnProperty('example_link')) {
			var thumbnailLink = $('<a target="_blank"/>').prop('href', spell['example_link']);
			thumbnailLink.append(thumbnailImage);
			thumbnailDiv.append(thumbnailLink);
		} else {
			thumbnailDiv.append(thumbnailImage);
		}
		spellDiv.append(thumbnailDiv);
	}

    var detailsDiv = $('<div class="spellContainer"/>');
    spellDiv.append(detailsDiv);
	var description = $('<div class="spellDescription"/>').text(spell.description);
    detailsDiv.append(description);

    if ('category' in spell) {
        var category = spell.category;
        if (category in categories)
        {
            category = categories[spell.category];
        }
        var categoryDiv = $('<div class="spellCategory"/>').text(category.name);
        detailsDiv.append(categoryDiv);
    }

    if ('usage' in spell) {
        var usage = $('<div class="spellUsage"/>').text(spell.usage);
        detailsDiv.append(usage);
    }

    if ('extended_description' in spell) {
        var extended = $('<div class="spellExtendedDescription"/>').text(spell.extended_description);
        detailsDiv.append(extended);
    }

    var icon = $('<div class="spellIcon"/>');
    icon.append($('<span/>').text('Icon: '));
    if (spell.icon_url != null && spell.icon_url.length > 0)
    {
        icon.append(getIcon(spell.icon_url));
    }
    else
    {
        icon.append(getSpellIcon(spell.icon));
    }
	detailsDiv.append(icon);

    // Check for path availability
    for (var pathIndex in paths) {
		var spAmount = spell.hasOwnProperty('worth') ? spell['worth'] : 0;
        var path = paths[pathIndex];
        if ('path_spells' in path && path.path_spells != null && path.path_spells.indexOf(key) >= 0) {
        	var pathSpan = $('<span>');
        	pathSpan.append($('<span>').text('Available to: '));
        	pathSpan.append(convertColorCodes(path.name));
			pathSpan.append($('<span>').text(' for ' + spAmount + " SP"));
            var availability = $('<div class="spellPathAvailability"/>').append(pathSpan);
            detailsDiv.append(availability);
            break;
        }
        if ('required_spells' in path && path.required_spells != null && path.required_spells.indexOf(key) >= 0) {
			var pathSpan = $('<span>');
			pathSpan.append($('<span>').text('Required at: '));
			pathSpan.append(convertColorCodes(path.name));
			pathSpan.append($('<span>').text(' for ' + spAmount + " SP"));
            var requirement = $('<div class="spellPathRequirement"/>').append(pathSpan);
            detailsDiv.append(requirement);
            break;
        }
    }

	// Check for rarity
	if (probabilityString != null && probabilityString.length > 0) {
		var rarityClass = 'spellCommon';
		var rarityDescription = 'Common';
		var overallWeight = 0;
		var pieces = probabilityString.split(',');
		for (var index in pieces) {
			overallWeight += parseInt(pieces[index]);
		}

		if (overallWeight < 5) {
			rarityClass = 'spellVeryRare';
			rarityDescription = 'Very Rare';
		} else if (overallWeight < 20) {
			rarityClass = 'spellRare';
			rarityDescription = 'Rare';
		} else if (overallWeight < 100) {
			rarityClass = 'spellUncommon';
			rarityDescription = 'Uncommon';
		}

		var probabilityDescription = $('<div class="spellProbability ' + rarityClass + '"/>')
			.text(rarityDescription);

		detailsDiv.append(probabilityDescription);
	}

    // List worth, if present
    if ('worth' in spell && spell.worth > 0) {
		detailsDiv.append($('<div class="worthHeading"/>').text('Suggested Price'));
        detailsDiv.append(getWorth(spell.worth));
    }

    appendSpellDetails(detailsDiv, spell, useMana, costReduction);

    if ('spell_levels' in spell) {
        var levelsList = $('<div/>');
        var spellLevels = spell['spell_levels'];
        for (var spellLevel in spellLevels)
        {
            var level = spellLevels[spellLevel];
			
			// This can happen when inheriting from a spell that has levels :|
			if (level == null) continue;
			
            levelsList.append($('<h3/>').text("Level " + spellLevel));
            var levelDiv = $('<div/>');

            var descriptionText = "";
            if ('upgrade_description' in level)
            {
                descriptionText = level.upgrade_description;
            }
            if (descriptionText == "" && 'upgrade_description' in spell)
            {
                descriptionText = spell.upgrade_description;
            }
            if (descriptionText != "") {
                var tempDiv = $('<div/>').html(descriptionText);
                descriptionText = tempDiv.text();
                var description = $('<div class="spellDescription"/>').append(decodeColors(descriptionText));
                levelDiv.append(description);
            }
            appendSpellDetails(levelDiv, level, useMana, costReduction);
            appendSpellAdmin(levelDiv, level, 'adminuseLevel');
            levelsList.append($('<div/>').append(levelDiv));
        }
        levelsList.accordion({ heightStyle: 'content'} );
        detailsDiv.append(levelsList);
    }

    if (showTitle) {
        appendSpellAdmin(spellDiv, spell, 'adminuse');
    }
    return spellDiv;
}
function appendSpellAdmin(detailsDiv, spell, divClass)
{
    var admin = $('<div class="' + divClass + '"/>').text("Admin use: /wand add " + spell.key);
    detailsDiv.append(admin);
}

function appendSpellDetails(detailsDiv, spell, useMana, costReduction)
{
	var firstCost = true;
	if ('costs' in spell) {
		detailsDiv.append($('<div class="spellHeading"/>').text('Costs'));
		var costList = $('<ul/>');
		for (var costKey in spell.costs) {
			var amount = spell.costs[costKey];
			if (costReduction > 0) {
				if (costReduction > 1) costReduction = 1;
				amount = amount * (1 - costReduction);
			}
            if (costKey == 'mana') {
                costList.append($('<li/>').text("Mana: " + amount));
            } else if (costKey == 'xp') {
                costList.append($('<li/>').text("XP: " + amount));
			} else {
				costList.append($('<li/>').append(getMaterial(costKey, true)).append($('<span/>').text(': ' + amount)));
			}
		}
		detailsDiv.append(costList);
	}
	if ('active_costs' in spell) {
		detailsDiv.append($('<div class="spellHeading"/>').text('Active Costs (per Second)'));
		var costList = $('<ul/>');
		for (var costKey in spell.active_costs) {
			var amount = spell.active_costs[costKey];
			if (costReduction > 0) {
				if (costReduction > 1) costReduction = 1;
				amount = amount * (1 - costReduction);
			}
			if (costKey == 'mana') {
				costList.append($('<li/>').text("Mana: " + amount));
            } else if (costKey == 'xp') {
				costList.append($('<li/>').text("XP: " + amount));
			} else {
				costList.append($('<li/>').append(getMaterial(costKey, true)).append($('<span/>').text(': ' + amount)));
			}
		}
		detailsDiv.append(costList);
	}
}

function getLevelString(prefix, amount)
{
	var suffix = "I";

	if (amount > 1) {
		suffix = "X";
	} else if (amount > 0.8) {
		suffix = "V";
	} else if (amount > 0.6) {
		suffix = "IV";
	} else if (amount > 0.4) {
		suffix = "III";
	} else if (amount > 0.2) {
		suffix = "II";
	}
	return prefix + " " + suffix;
}

function getBookDetails(key)
{
	if (!(key in books)) {
		return $('<span/>').text("Sorry, something went wrong!");
	}
	var book = books[key];
	var detailsDiv = $('<div/>');
	var title = $('<div class="bookTitleBanner"/>').text(book.title);
	var scrollingContainer = $('<div class="bookContainer"/>');	
	
	detailsDiv.append(title);
	detailsDiv.append(scrollingContainer);

	if ('description' in book && book.description.length > 0) {
		var description = $('<div class="bookDescription"/>');
		for (var descriptionIndex in book.description) {
			var descriptionLine = book.description[descriptionIndex];
			description.append(descriptionLine).append(jQuery('<br/>'));
		}
		scrollingContainer.append(description);
	}
	
	var pages = $('<div class="bookPages"/>');
	for (var pageIndex in book.pages) {
		var page = book.pages[pageIndex];
		var lines = page.split("&x");
		for (var lineIndex in lines) {
            var line = lines[lineIndex];
			var lineSpan = decodeColors(line);
			pages.append(lineSpan).append(jQuery('<br/>'));
		}
		
		pages.append(jQuery('<br/>')).append(jQuery('<hr/>')).append(jQuery('<br/>'));
	}
	scrollingContainer.append(pages);

	return detailsDiv;
}

function getMobDetails(key)
{
	if (!(key in mobs)) {
		return $('<span/>').text("Sorry, something went wrong!");
	}
	var mob = mobs[key];
	var detailsDiv = $('<div/>');
	var mobName = key;
	if (mob.hasOwnProperty('name')) {
		mobName = mob.name;
	}
	mobName = convertColorCodes(mobName);
	var title = $('<div class="mobTitleBanner"/>').html(mobName);
	var scrollingContainer = $('<div class="mobContainer"/>');
	scrollingContainer.append("No mob info yet.. maybe eventually?");
	var admin = $('<div class="adminuse"/>').text("Admin use: /mmob spawn " + key);
	detailsDiv.append(title);
	detailsDiv.append(scrollingContainer);
	detailsDiv.append(admin);

	return detailsDiv;
}

function decodeColors(line)
{
    var lineStyle = "";
    line = line.replace(/\&(.)/g, function (match, capture) {
        lineStyle += getLineStyle(capture);
        return "";
    });

    var lineSpan = jQuery('<span style="' + lineStyle + '"/>');
    lineSpan.text(line);
    return lineSpan;
}

function getLineStyle(chatChar)
{
	if (chatChar == 'l') {
		return 'font-weight: bold;';
	}
	if (chatChar == 'n') {
		return 'text-decoration: underline;';
	}
	if (chatChar == 'o') {
		return 'font-style: italic;';
	}
	var color = chatColorToHex(chatChar.toLowerCase());
	if (color.length > 0) {
		return 'color: #' + color + ';';
	}
	
	return '';
}

function chatColorToHex(chatChar)
{
	switch (chatChar) {
		case '0': return '000000';
		case '1': return '0000AA';
		case '2': return '00AA00';
		case '3': return '00AAAA';
		case '4': return 'AA0000';
		case '5': return 'AA00AA';
		case '6': return 'FFAA00';
		case '7': return 'AAAAAA';
		case '8': return '555555';
		case '9': return '5555FF';
		case 'a': return '55FF55';
		case 'b': return '55FFFF';
		case 'c': return 'FF5555';
		case 'd': return 'FF55FF';
		case 'e': return 'FFFF55';
		case 'f': return 'FFFFFF';
	}
	
	return '';
}

function getPathDetails(key)
{
    if (!(key in paths)) {
        return $('<span/>').text("Sorry, something went wrong!");
    }
    var wand = paths[key];
    return getWandItemDetails(key, wand);
}

function formatRecipeLine(line) {
    if (line == "" || line == null) {
        return "   ";
    }
    if (line.length == 1) {
        return " " + line + " ";
    }
    if (line.length == 2) {
        return line + " ";
    }
    return line;
}

function getRecipeDetails(key)
{
    if (!(key in recipes)) {
        return $('<span/>').text("Sorry, something went wrong!");
    }
    var recipe = recipes[key];
    var wand = recipe['wand'];
	if (!wand) {
		var scrollingContainer = $('<div class="wandContainer"/>');

		var detailsDiv = $('<div/>');
		var title = $('<div class="wandTitleBanner"/>').text(key);
		var scrollingContainer = $('<div class="wandContainer"/>');
		var description = $('<div class="wandDescription"/>').text("A custom crafting recipe");

		detailsDiv.append(title);
		scrollingContainer.append(description);
		detailsDiv.append(scrollingContainer);
		
		if (recipe) {
			scrollingContainer.append(createCraftingTable(recipe));

			if (recipe.hasOwnProperty('enabled') && !recipe.enabled) {
				scrollingContainer.append($('<div class="disabled">').text("Recipe is disabled by default. Enable with"));
				scrollingContainer.append($('<div class="command">').text("/mconfig enable recipe " + key));
			} else {
				scrollingContainer.append($('<div class="disabled">').text("Disable recipe with"));
				scrollingContainer.append($('<div class="command">').text("/mconfig disable recipe " + key));
			}
		}
		
		return detailsDiv;
	}
    return getWandItemDetails(recipe['output'], wand, recipe);
}

function createCraftingTable(recipe)
{
    var craftingContainer = $('<div class="craftingContainer"/>');
    if (recipe.hasOwnProperty('type')) {
    	craftingContainer.append($('<div class="craftingType">').text(recipe['type'] + " recipe"));
	}

    var craftingTable = $('<div class="craftingTable"/>');
    craftingContainer.append(craftingTable);
    var craftingOutput = $('<div class="craftingOutput"/>');
    var wandIcon = recipe['output'];
    wandIcon = getMaterial(wandIcon == null || wandIcon == "" ? "wand" : wandIcon, true);
    craftingOutput.append(wandIcon);
    craftingContainer.append(craftingOutput);

    if (!recipe.hasOwnProperty('row_1')) return craftingContainer;

    var rows = [
        formatRecipeLine(recipe['row_1']),
        formatRecipeLine(recipe['row_2']),
        formatRecipeLine(recipe['row_3'])
    ];

    var materials;
    if (recipe.hasOwnProperty('materials')) {
    	materials = recipe.materials;
	} else if (recipe.hasOwnProperty('ingredients')) {
    	materials = recipe.ingredients;
	} else {
    	return craftingContainer;
	}

    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 3; x++)
        {
            var ingredient = rows[y].substring(x, x + 1);
            var left = 56 + x * 36;
            var top = 32 + y * 36;
            var input = $('<div class="craftingSlot" style="left:' + left + 'px; top: ' + top + 'px"/>');
            if (ingredient)
            {
                input.append(getMaterial(materials[ingredient], true));
            }
            craftingContainer.append(input);
        }
    }
    return craftingContainer;
}

function getWandDetails(key)
{
    if (!(key in wands)) {
		return $('<span/>').text("Sorry, something went wrong!");
	}
	var wand = wands[key];
	return getWandItemDetails(key, wand);
}

function getWandUpgradeDetails(key)
{
    if (!(key in upgrades)) {
		return $('<span/>').text("Sorry, something went wrong!");
	}
	var wand = upgrades[key];
	return getWandItemDetails(key, wand);
}

function getWandItemDetails(key, wand, recipe)
{
	var detailsDiv = $('<div/>');
	var title = $('<div class="wandTitleBanner"/>').html(convertColorCodes(wand.name));
	var scrollingContainer = $('<div class="wandContainer"/>');
	var description = $('<div class="wandDescription"/>').html(convertColorCodes(wand.description));
	var admin = $('<div class="adminuse"/>').text("Admin use: /mgive " + key);
	var costReduction = ('cost_reduction' in wand) ? wand['cost_reduction'] : 0;
	var cooldownReduction = ('cooldown_reduction' in wand) ? wand['cooldown_reduction'] : 0;
	var xpRegeneration = ('xp_regeneration' in wand) ? wand['xp_regeneration'] : 0;
	var xpMax = ('xp_max' in wand) ? wand['xp_max'] : 0;
	var hungerRegeneration = ('hunger_regeneration' in wand) ? wand['hunger_regeneration'] : 0;
	var healthRegeneration = ('health_regeneration' in wand) ? wand['health_regeneration'] : 0;
	var uses = ('uses' in wand) ? wand['uses'] : 0;
	var protection = ('protection' in wand) ? wand['protection'] : 0;
	var protectionPhysical = ('protection_physical' in wand) ? wand['protection_physical'] : 0;
	var protectionProjectiles = ('protection_projectiles' in wand) ? wand['protection_projectiles'] : 0;
	var protectionFalling = ('protection_falling' in wand) ? wand['protection_falling'] : 0;
	var protectionFire = ('protection_fire' in wand) ? wand['protection_fire'] : 0;
	var protectionExplosion = ('protection_explosion' in wand) ? wand['protection_explosion'] : 0;
	var power = ('power' in wand) ? wand['power'] : 0;
	var haste = ('haste' in wand) ? wand['haste'] : 0;
	
	detailsDiv.append(title);
	
	scrollingContainer.append(description);

    if (recipe) {
        scrollingContainer.append(createCraftingTable(recipe));

		if (recipe.hasOwnProperty('enabled') && !recipe.enabled) {
			scrollingContainer.append($('<div class="disabled">').text("Recipe is disabled by default. Enable with"));
			scrollingContainer.append($('<div class="command">').text("/mconfig enable recipe " + key));
		} else {
			scrollingContainer.append($('<div class="disabled">').text("Disable recipe with"));
			scrollingContainer.append($('<div class="command">').text("/mconfig disable recipe " + key));
		}
    }

    // List worth, if present
    if ('worth' in wand && wand.worth > 0) {
		scrollingContainer.append($('<div class="worthHeading"/>').text('Suggested Price'));
        scrollingContainer.append(getWorth(wand.worth));
    }
	
	if (xpRegeneration > 0 && xpMax > 0) {
		scrollingContainer.append($('<div class="mana"/>').text('Mana: ' + xpMax));
		scrollingContainer.append($('<div class="regeneration"/>').text(getLevelString('Mana Regeneration', xpRegeneration / maxXpRegeneration)));
	}
	if (uses > 0) {
		scrollingContainer.append($('<div class="uses"/>').text('Uses: ' + uses));
	}
	if (costReduction > 0) {
		scrollingContainer.append($('<div class="costReduction"/>').text(getLevelString('Cost Reduction', costReduction)));
	}
	if (cooldownReduction > 0) {
		scrollingContainer.append($('<div class="cooldownReduction"/>').text(getLevelString('Cooldown Reduction', cooldownReduction)));
	}
	if (power > 0) {
		scrollingContainer.append($('<div class="power"/>').text(getLevelString('Power', power)));
	}
	if (haste > 0) {
		scrollingContainer.append($('<div class="haste"/>').text(getLevelString('Haste', haste)));
	}
	if (protection > 0) {
		scrollingContainer.append($('<div class="protection"/>').text(getLevelString('Protection', protection)));
	}
	if (protection < 1) {
		if (protectionPhysical > 0) scrollingContainer.append($('<div class="protection"/>').text(getLevelString('Physical Protection', protectionPhysical)));
		if (protectionProjectiles > 0) scrollingContainer.append($('<div class="protection"/>').text(getLevelString('Projectile Protection', protectionProjectiles)));
		if (protectionFalling > 0) scrollingContainer.append($('<div class="protection"/>').text(getLevelString('Falling Protection', protectionFalling)));
		if (protectionFire > 0) scrollingContainer.append($('<div class="protection"/>').text(getLevelString('Fire Protection', protectionFire)));
		if (protectionExplosion > 0) scrollingContainer.append($('<div class="protection"/>').text(getLevelString('Blast Protection', protectionExplosion)));		
	}
	if (healthRegeneration > 0) {
		scrollingContainer.append($('<div class="regeneration"/>').text(getLevelString('Health Regeneration', healthRegeneration)));
	}
	if (hungerRegeneration > 0) {
		scrollingContainer.append($('<div class="regeneration"/>').text(getLevelString('Hunger Regeneration', hungerRegeneration)));
	}
		
	var wandSpells = wand.spells;
	if (wandSpells.length > 0) {
		wandSpells.sort();
		var spellHeader = $('<div class="wandHeading">Spells (' + wandSpells.length + ')</div>');
		var spellListContainer = $('<div id="wandSpellList"/>');
		var spellList = $('<div/>');
		var usesMana = xpRegeneration > 0 || key == 'random';
		for (var spellIndex in wandSpells)
		{
			var key = wand.spells[spellIndex];
			key = key.split('|')[0];
			if (!(key in spells)) continue;
			var spell = spells[key];
			var probabilityString = "";
			if ('spell_probabilities' in wand && key in wand['spell_probabilities']) {
				probabilityString = wand['spell_probabilities'][key];
			}
			spellList.append($('<h3/>').text(spell.name));
			spellList.append($('<div/>').append(getSpellDetails(key, false, usesMana, costReduction, probabilityString)));
		}
		spellList.accordion({ heightStyle: 'content'} );
		spellListContainer.append(spellList);
		scrollingContainer.append(spellHeader);
		scrollingContainer.append(spellListContainer);
	}

    if ('required_spells' in wand && wand.required_spells != null && wand.required_spells.length > 0) {
        var requiredSpells = wand.required_spells;
        requiredSpells.sort();
        var spellHeader = $('<div class="wandHeading">Required To Advance (' + requiredSpells.length + ')</div>');
        var spellListContainer = $('<div id="wandRequiredSpellList"/>');
        var spellList = $('<div/>');
        var usesMana = xpRegeneration > 0 || key == 'random';
        for (var spellIndex in requiredSpells)
        {
            var key = wand.required_spells[spellIndex];
            if (!(key in spells)) continue;
            var spell = spells[key];
            spellList.append($('<h3/>').text(spell.name));
            spellList.append($('<div/>').append(getSpellDetails(key, false, usesMana, costReduction, "")));
        }
        spellList.accordion({ heightStyle: 'content'} );
        spellListContainer.append(spellList);
        scrollingContainer.append(spellHeader);
        scrollingContainer.append(spellListContainer);
    }
	
	if ('materials' in wand && wand.materials.length > 0) {
		var materialHeader = $('<div class="wandHeading">Materials</div>');
		var materialListContainer = $('<ul/>');
		var wandMaterials = wand.materials;
		wandMaterials.sort();
		for (var materialIndex in wandMaterials)
		{
			var key = wandMaterials[materialIndex];
			materialListContainer.append($('<li/>').append(getMaterial(key)));
		}
		scrollingContainer.append(materialHeader);
		scrollingContainer.append(materialListContainer);
	}
	
	detailsDiv.append(scrollingContainer);
	if (!recipe) {
		detailsDiv.append(admin);
	}
	return detailsDiv;
}
 
$(document).ready(function() {
	$("#tabs").tabs();
	if (books.length == 0) {
		$('#booksTab').hide(); 
	} else {
		$("#bookList").selectable({
			selected: function(event, ui) {
				var selected = jQuery(".ui-selected", this);
				var key = selected.prop('id').substr(5);
				$('#bookDetails').empty();
				$('#bookDetails').append(getBookDetails(key));
			}
	    });
	}
    $("#spellList").selectable({
		selected: function(event, ui) {
			var selected = jQuery(".ui-selected", this);
			var key = selected.prop('id').substr(6);
			$('#spellDetails').empty();
			$('#spellDetails').append(getSpellDetails(key));
		}
    });
    $("#craftingList").selectable({
        selected: function(event, ui) {
            var selected = jQuery(".ui-selected", this);
            var key = selected.prop('id').substr(7);
            $('#craftingDetails').empty();
            $('#craftingDetails').append(getRecipeDetails(key));
        }
    });
    $("#enchantingList").selectable({
        selected: function(event, ui) {
            var selected = jQuery(".ui-selected", this);
            var key = selected.prop('id').substr(5);
            $('#enchantingDetails').empty();
            $('#enchantingDetails').append(getPathDetails(key));
        }
    });
    $("#wandList").selectable({
		selected: function(event, ui) {
			var selected = jQuery(".ui-selected", this);
			var key = selected.prop('id').substr(5);
			$('#wandDetails').empty();
			$('#wandDetails').append(getWandDetails(key));
		}
    });
    $("#upgradeList").selectable({
		selected: function(event, ui) {
			var selected = jQuery(".ui-selected", this);
			var key = selected.prop('id').substr(5);
			$('#upgradeDetails').empty();
			$('#upgradeDetails').append(getWandUpgradeDetails(key));
		}
    });
    $("#mobList").selectable({
		selected: function(event, ui) {
			var selected = jQuery(".ui-selected", this);
			var key = selected.prop('id').substr(4);
			$('#mobDetails').empty();
			$('#mobDetails').append(getMobDetails(key));
		}
    });

    $("#tabs").show();
});

var _chatColors  = {
	'0': 'black',
	'1': 'darkblue',
	'2': 'darkgreen',
	'3': 'darkcyan',
	'4': 'darkred',
	'5': 'darkmagenta',
	'6': 'gold',
	'7': 'gray',
	'8': 'darkgray',
	'9': 'blue',
	'a': 'green',
	'b': 'aqua',
	'c': 'red',
	'd': 'mediumpurple',
	'e': 'yellow',
	'f': 'white',
	'k': '',
	'l': '',
	'm': '',
	'n': '',
	'o': '',
	'r': 'white'
};

function convertColorCodes(line) {
	var tagCount = 1;
	line = "<span style=\"color:white\">" + line;
	for (var c in _chatColors) {
		if (!_chatColors.hasOwnProperty(c)) continue;
		var replaceStyle = "";
		if (c == 'i') {
			replaceStyle = "font-style: italic";
		} else if (c == 'l') {
			replaceStyle = "font-weight: bold";
		} else if (c == 'n') {
			replaceStyle = "text-decoration: underline";
		} else {
			var color = _chatColors[c];
			if (color != "") {
				replaceStyle = "color:" + color;
			}
		}
		var re = new RegExp("&" + c,"g");
		line = line.replace(re, function(x)
			{
				if (replaceStyle == "") return "";
				tagCount += 1;
				return "<span style=\"" + replaceStyle + "\">"
			});
	}
	for (var i = 0; i < tagCount; i++) {
		line += "</span>";
	}

	return line;
}