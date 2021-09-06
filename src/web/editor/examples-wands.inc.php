<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Wand"></textarea>
    <textarea id="templateBasic" class="template" data-label="Basic Wand"># This is the key name of this wand
# It must be unique across the server, and is used in commands such as /wand and /mgive to refer to this wand.
mywand:
  # Name and description may be added here and will appear in lore for this wand.
  name: My New Wand
  description: Basic Wand for Basic Wizard
  # Inherit from the base_wand template to get basic wand functionality
  # Such as spell inventory and key bindings
  # Other options include: basic_wand, base_bound, base_magic
  inherit: base_wand
  # Choose an icon, this is the item the wand will appear as
  icon: stick{CustomModelData:18001}
  # Give the wand some mana for casting
  mana_max: 100
  mana: 100
  # The wand regenerates this amount of mana every second
  mana_regeneration: 10
  # Give the wand some spells to cast
  spells:
  - missile
  - blink
  - fling
  - blast
</textarea>
    <textarea id="templateBasic" class="template" data-label="Path Wand"># This is the key name of this wand
# It must be unique across the server, and is used in commands such as /wand and /mgive to refer to this wand.
mywand:
  # Name and description may be added here and will appear in lore for this wand.
  name: My New Wand
  description: Basic Wand for Basic Wizard
  # Inherit from the base_wand template to get basic wand functionality
  # Such as spell inventory and key bindings
  # Other options include: basic_wand, base_bound, base_magic
  inherit: base_wand
  # Choose an icon, this is the item the wand will appear as
  icon: stick{CustomModelData:18001}
  # Give the wand some mana for casting
  mana_max: 100
  mana: 100
  # The wand regenerates this amount of mana every second
  mana_regeneration: 10
  # Allow this wand to progress along a path
  # The wand will track path and spell progress itself, if the player loses
  # the wand item their progress is lost.
  # Make a class wand instead if this is not what you want!
  path: beginner
  # Give the wand some spells to cast
  spells:
  - missile
  - blink
  - fling
  - blast
</textarea>
    <textarea id="templateClass" class="template" data-label="Class Wand"># This is the key name of this wand
# It must be unique across the server, and is used in commands such as /wand and /mgive to refer to this wand.
classwand:
  # Name and description may be added here and will appear in lore for this wand.
  name: The Wand
  description: The Only Wand You'll Ever need
  # Inherit from the base_wand template to get basic wand functionality
  # Such as spell inventory and key bindings
  # Other options include: basic_wand, base_bound, base_magic
  inherit: base_wand
  # Choose an icon, this is the item the wand will appear as
  icon: stick{CustomModelData:18001}
  # Assign this wand a class
  # The wand generally gets its mana, path and spells from the class
  # So there is not much more to add here.
  # Note that this works because of the "storage" property of the base class,
  # you can modify the mapping of what gets stored where if you wish.
  class: mage
</textarea>
    <textarea id="templateSword" class="template" data-label="Sword">mysword:
  name: My Sword
  description: Excaliber!
  # The base_wand template will set your sword up to quick-cast, so you can swing the
  # sword without casting
  inherit: base_sword
  # You don't *have* to use a sword icon, but you probably should
  icon: netherite_sword{CustomModelData:18009}
  # Give the wand some mana for casting
  mana_max: 100
  mana: 100
  # The wand regenerates this amount of mana every second
  mana_regeneration: 10
  spells:
  - arrow
  - missile
  - fireball
</textarea>
    <textarea id="templateBow" class="template" data-label="Bow">mybow:
  name: My Bow
  description: A magical bow
  # This sets up a bow that uses the drop button to toggle the inventory
  # and fires spells when loosing an arrow
  template: magic_bow
  icon: bow{CustomModelData:18001}
  spells:
  - arrow_regular
  - arrow_bomb
  - arrow_poison
</textarea>
    <textarea id="templateSphere" class="template" data-label="Wand Appearance Upgrade">myappearance:
    # This makes the appearance an upgrade item
    # This means it is not used like a wand, it is dropped on top of another wand to transform it
    # These are also often used in shops or path upgrades, where they are automatically
    # applied to a wand and the player never actually holds the item.
    upgrade: true
    # This is the icon used to represent this upgrade
    icon: stick{CustomModelData:18037}
    # This changes (upgrades) the icon of the target wand
    upgrade_icon: stick{CustomModelData:18037}
</textarea>
    <textarea id="templateConsumable" class="template" data-label="Consumable">myconsumable:
  name: Tasty Beverage
  description: Heals everyone around you
  # Potion icons can use custom colors
  icon: potion:FFD700
  # Casts a spell on consuming
  consume_spell: healing
</textarea>
    <textarea id="templateArmor" class="template" data-label="Armor">myarmor:
    icon: chainmail_boots
    # This is important for armor, it indicates that any attributes and effects
    # on this wand will only apply when the wand is worn, rather than held
    passive: true
    # Players can keep armor on death
    keep: true
    # This armor will boos the max mana and regen of the wearer
    mana_max_boost: 0.1
    mana_regeneration_boost: 0.05
    # Wands can not be enchanted by default, this lets it get enchanted just like
    # vanilla armor
    enchantable: true
    # Show all vanilla lore
    hide_flags: 0
    # Give a speed boost when worn
    potion_effects:
        speed: 0
    # Protect from magic damage
    protection:
      magic: 0.1
    # Indicate that this is part of an armor set.
    # These sets are defined in config.yml, use
    # /editor config wand_sets
    # They can be configured to apply set bonuses when some
    # number of set pieces are worn
    sets: wizard_armor
    # Override armor and toughness properties, making sure
    # to only apply these attributes when worn on the feet
    item_attribute_slot: feet
    item_attributes:
        generic_armor: 1
        generic_armor_toughness: 1
</textarea>
</div>