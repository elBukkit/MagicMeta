<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Path"></textarea>
    <textarea id="templateBasic" class="template" data-label="Basic Path"># This is the key name of this mob
# It must be unique across the server, and is used in configs to refer to this path
#
# A path defines progression for a player. It determines what spells show up in the spellshop for that player,
# and can rank players up using an upgrade path.
#
# Paths can be used directly by wands, or (recommended) via a class. By assigning a path to a class, player
# progression is stored in player data rather than wand item data where it could get lost.
#
mypath:
    # Inheriting from the default path gets you some visual and audio effects on
    # rankup and upgrades.
    inherit: default
    # Paths can change the icon of wand to present it as evolving
    # If this is a class-based wand, it's a good idea to pair this with additional entries in
    # the "appearanceshop" spell (/mconfig editor spell appearanceshop) so players can switch to
    # this appearance if they weren't holding their wand at rankup.
    icon: stick{CustomModelData:18001}
    # When a player has collected all of the spells in this path, they can be ranked up to another path.
    upgrade: student
    # You can give an upgrade item at rankup time. This is generally used to configure the
    # player's class or wand in some way, such as adding more hotbars
    upgrade_item: student_upgrade
    # These are spells that are optional, appear in the spell shop but are not required for progression.
    extra_spells:
      - flare
      - aqualung
    # These spells appear in the spell shop and are required to progress to the next path.
    spells:
      - missile
      - arrow
      - blast
</textarea>
</div>