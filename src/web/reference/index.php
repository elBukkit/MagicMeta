<?php
require_once('../config.inc.php');
require_once('common/user.inc.php');
$version = 3;
?>
<html>
<head>
    <title><?= $title ?> Reference</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="common/css/smoothness/jquery-ui-1.10.3.custom.min.css"/>
    <link rel="stylesheet" href="common/css/common.css?v=<?=$version?>" />
    <link rel="stylesheet" href="common/css/loading.css?v=<?=$version?>" />
    <link rel="stylesheet" href="common/css/user.css?v=<?=$version?>" />
    <link rel="stylesheet" href="css/reference.css?v=<?=$version?>"/>
    <script src="common/js/jquery-1.10.2.min.js"></script>
    <script src="common/js/jquery-ui-1.10.3.custom.min.js"></script>
    <script src="common/js/loading.js?v=<?=$version?>"></script>
    <script src="js/reference.js?v=<?=$version?>"></script>
    <?php if ($analytics) echo $analytics; ?>
</head>
<body>
<div id="tabs" style="display:none">
    <div id="tabContainer">
        <ul id="tablist">
            <li><a href="#spellProperties">Spell Properties</a></li>
            <li><a href="#spellParameters">Spell Parameters</a></li>
            <li><a href="#actions">Actions</a></li>
            <li><a href="#effects">Effects</a></li>
            <li><a href="#effectlib">EffectLib</a></li>
            <li><a href="#wands">Wands</a></li>
            <li><a href="#classes">Classes</a></li>
            <li><a href="#modifiers">Modifiers</a></li>
            <li><a href="#mobs">Mobs</a></li>
            <li><a href="#crafting">Crafting</a></li>
        </ul>
    </div>
    <div id="spellProperties" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="spellPropertyList">
                </ol>
            </div>
            <div class="details" id="spellPropertyDetails">
                <div>
                These are the top-level configuration options for spells.
                <br/><br/>
                They cannot be overridden by wands or /cast parameters, and are generally considered immutable properties
                of a spell.
                <br/><br/>
                Some of these properties, such as "icon", are required for a spell to work properly in a wand.
                <br/><br/>
                Select a property for details.
                </div>
            </div>
        </div>
    </div>
    <div id="spellParameters" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="spellParameterList">
                </ol>
            </div>
            <div class="details" id="spellParameterDetails">
                <div>
                Spell parameters go in the "parameters" section of a spell's configuration.
                <br/><br/>
                These are general parameters that affect the basic workings of any spells.
                <br/><br>
                These can be modified directly in-game using the cast command, for instance:
                <br/><br>
                <span class="code">/cast blob undo 30000</span>
                <br/><br>
                They can also be modified by a wand with overrides on it, such as:
                <br/><br>
                <span class="code">/wand override blob.undo 0</span>
                <br/><br>
                Wand overrides can also be made to apply to all spells cast by that wand:
                <br/><br>
                <span class="code">/wand override undo 0</span>
                <br/><br>
                Select a parameter for details.
                </div>
            </div>
        </div>
    </div>
    <div id="actions" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="actionList">
                </ol>
            </div>
            <div class="details" id="actionDetails">
                <div>
                Actions are the building blocks of a spell's logic. Without actions, a spell does nothing except create
                particle effects or sounds.
                <br/></br/>
                Action parameters can go in the "parameters" section of a spell's configuration, alongside base spell
                parameters.<br/><br/>
                Action parameters in the "parameters" section can be overridden as normal by /cast commands or wand
                overrides, but actions placed directly in the actions list can not.
                <br/><br/>
                In general it is good practice to put all parameters in the "parameters" section for easy reading, but there
                are cases where it is necessary to put them in the actions list. Generally this would be because you have
                two of the same actions in the logic that you want to use different parameters.
                <br/><br/>
                They can also go directly underneath the corresponding action in the "actions" list.<br/><br/>
                Select an actions for details.
                </div>
            </div>
        </div>
    </div>
    <div id="effects" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="effectParameterList">
                </ol>
            </div>
            <div class="details" id="effectParameterDetails">
                <div>
                Effects are what make spells look and feel awesome. These are generally a combination of particle effects
                and sounds, though fireworks and base Minecraft effects (e.g. HURT) can also be used.
                <br/><br/>
                Here are the basic parameters that can be applied to top-level effects sections. These can be used for spawning
                individual particles or sounds.
                <br/><br/>
                For more complex effects, add an "effectlib" section and see the EffectLib tab for options.
                <br/><br/>
                Select a parameter for details.
                </div>
            </div>
        </div>
    </div>
    <div id="effectlib" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="effectList">
                </ol>
            </div>
            <div class="details" id="effectDetails">
                <div>
                EffectLib is integrated into Magic for complex special effects.
                <br/><br/>
                Simply add an "effectlib" section to any effect to create an EffectLib effect.
                <br/><br/>
                The only required parameter is "class", which will determine which effect is used.
                <br/><br/>
                Most affects have tweakable parameters, however, which will give your effects an extra customized look.
                <br/><br/>
                Use <span class="code">/cast fxdemo</span> in-game for a demo of all the builtin EffectLib effects.
                <br/><br/>
                Select an effect for details.
                </div>
            </div>
        </div>
    </div>
    <div id="wands" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="wandParameterList">
                </ol>
            </div>
            <div class="details" id="wandParameterDetails">
                <div>
                Wands in Magic are special items that can be used for casting spells, and may also grant the holder
                special effects or buffs.
                <br/><br/>
                Wands don't necessarily need to look or act like wands, they can take the form of armor, bows, swords or
                any other item.
                <br/><br/>
                Use the <span class="code">/wand configure</span> command in-game to directly modify properties of a wand
                item. Properties can also be added to wand template configurations in wands.yml, to make new wands that can
                be spawned in-game using the <span class="code">/mgive</span> command.
                <br/><br/>
                Select a wand property for details.
                </div>
            </div>
        </div>
    </div>
    <div id="classes" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="classParameterList">
                </ol>
            </div>
            <div class="details" id="classParameterDetails">
                <div>
                Classes in Magic are a way to associate a group of properties with a player. A player can have
                    multiple classes. Wands can be assigned to classes, which means they can cast spells
                    that a player has learned, rather than the spells being attached to a wand item.
                <br/><br/>
                Select a class property for details.
                </div>
            </div>
        </div>
    </div>
    <div id="modifiers" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="modifierParameterList">
                </ol>
            </div>
            <div class="details" id="modifierParameterDetails">
                <div>
                Modifiers in Magic are like a temporary (or not) add-on class. They can be applied to a player from
                    a wand or a spell using the Modifier action. Modifiers can change player attributes, add temporary
                    passive effects or do anything else a class could do.
                <br/><br/>
                Select a modifier property for details.
                </div>
            </div>
        </div>
    </div>
    <div id="mobs" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="mobParameterList">
                </ol>
            </div>
            <div class="details" id="mobParameterDetails">
                <div>
                Magic has a custom mob system for creating mobs that can cast spells or have other magical properties.
                <br/><br/>
                Mobs can be added to mobs.yml, and spawned in game using <span class="code">/mmob spawn</span>.
                <br/><br/>
                Select a mob property for details.
                </div>
            </div>
        </div>
    </div>
    <div id="crafting" class="flextab">
        <div class="flexContainer">
            <div class="scrollingTab">
                <ol id="craftingParameterList">
                </ol>
            </div>
            <div class="details" id="craftingParameterDetails">
                <div>
                Magic has a customizable crafting system allowing you to create custom recipes for magic and vanilla items.
                <br/><br/>
                Select a recipe property for details.
                </div>
            </div>
        </div>
    </div>
</div>

<div id="addDescriptionDialog" title="Describe Property" style="display: none">
    <div>
       Please describe the property <span id="describePropertyName"></span> of type <span id="describePropertyType"></span>
    </div>
    <div>
        HTML is ok but please use sparingly. Changes are logged, please don't be evil.
    </div>
    <div>
        <textarea id="describePropertyText" rows="10" cols="80"></textarea>
    </div>
</div>


<!-- Loading Indicator -->
<div class="modal"></div>
</body>
</html>
