<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Recipe"></textarea>
    <textarea id="templateBasic" class="template" data-label="Vanilla Recipe"># This is the key name of this recipe
# It must be unique across the server, and is used in configs to refer to this recipe
# This is also how the server tracks if a player has discovered this recipe, so changing the recipe key
# or disabling the recipe may cause players to forget about it.
myrecipe:
  # This defines the recipe output
  output: elytra

  # This defines the materials that will be required to craft this wand
  materials:
    o: emerald
    i: stick
    p: phantom_membrane

  # This defines the shape of the recipe, row_1 is the top. Each row may
  # have up to 3 characters that map to the materials listed above.
  # You may need to use quotes for the spaces to be read correctly!
  row_1: " o "
  row_2: "ipi"
  row_3: "ppp"

</textarea>
    <textarea id="templateWand" class="template" data-label="Wand Recipe"># This is the key name of this recipe
# It must be unique across the server, and is used in configs to refer to this recipe
# This is also how the server tracks if a player has discovered this recipe, so changing the recipe key
# or disabling the recipe may cause players to forget about it.
myrecipe:
  # This defines the recipe output
  output: talisman
  # Make sure we get a wand item from this recipe
  # This is only needed if there is a spell or other item with the same name
  output_type: wand

  # Players learn this recipe on join
  auto_discover: true

  # Recipes that will be discovered when crafting this one
  discover:
    - magicbow
    - goggles

  # This defines the materials that will be required to craft this wand
  # Note that they can be wands or items from the items configuration
  materials:
    o: magicheart

  # This defines the shape of the recipe, row_1 is the top. Each row may
  # have up to 3 characters that map to the materials listed above.
  row_1: o
  row_2: o
  row_3: ""

</textarea>
    <textarea id="templateReplace" class="template" data-label="Replace Vanilla Recipe">
torchrecipe:
  # This defines the recipe output
  output: torch

  # This disables any default recipes for this output
  disable_default: true

  # This defines the materials that will be required to craft this item
  materials:
    o: dirt
    i: stick

  # This defines the shape of the recipe, row_1 is the top. Each row may
  # have up to 3 characters that map to the materials listed above.
  row_1: o
  row_2: i
  row_3: ""

</textarea>

    <textarea id="templateFurnace" class="template" data-label="Furnace Recipe">
furnacerecipe:
  # This is a smelting (furnace) recipe
  # Note that these only work in Magic 9.2 and Spigot 1.14 or higher
  # This could also be smoking, campfire or blasting
  # The parameters of these types are interchangeable
  type: furnace
  # Will show in players' knowledge books
  auto_discover: true
  # Produces leather
  output: leather
  # Requires zombie flesh
  ingredient: rotten_flesh
  # How long it takes to cook
  cooking_time: 30 seconds
  # How much experience is earned per item smelted
  experience: 5
</textarea>

    <textarea id="templateStonecutting" class="template" data-label="Stonecutting Recipe">
stonecuttingrecipe:
  # This is a stonecuttong recipe
  type: stonecutting
  # Will show in players' knowledge books
  auto_discover: true
  # Produces brown mushrooms
  output: brown_mushroom
  # Requires mushroom stems
  ingredient: mushroom_stem
</textarea>

    <textarea id="templateSmithing" class="template" data-label="Smithing Recipe">
smithingRecipe:
  # This is a smithing table recipe
  type: smithing
  # Produces a diamond chestplate
  output: diamond_chestplate
  # Requires an iron chestplate
  ingredient: iron_chestplate
  # And a diamond
  addition: diamond
</textarea>
</div>