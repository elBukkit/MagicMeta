<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Class"></textarea>
    <textarea id="templateBasic" class="template" data-label="Basic Class"># This is the key name of this class
# It must be unique across the server, and is used in configs to refer to this class
#
# A class is a place to store attributes and other data on a player.
# Classes can track lists of spells learned, mana and regeneration earned,
# path progression, and anything else a wand can track.
#
# Use a class alongside a wand when you want player's progression to not get lost
# if they lose or switch wands.
#
# This also lets players switch between different wand mechanics, such as the spell book or magic sword,
# while keeping the same progress.
#
# A player can only have one active class at a time, though classes can have passive effects that
# are always present.
#
myclass:
    # Inheriting from the base class will map mana and spells to this class.
    # This is mainly important if using /wand commands on the wand to change spells or mana,
    # so you do not override the class mana and spells.
    # Look at base.storage for more info.
    inherit: base
    # Classes can be locked, meaning they must be unlocked via an NPC or some other interaction.
    # The "/mage unlock <class>" command can be used to manually unlock a class.
    # If unlocked, a player will acquire this class just by holding a wand that uses it.
    locked: false
    # Classes can track mana progression
    mana_max: 50
    # How much mana the player gets every second
    mana_regeneration: 5
    # This will start the player off with full mana as soon as they unlock this class
    mana: 50
    # The player will start with one spell
    spells:
    - missile
    </textarea>
</div>