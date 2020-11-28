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
</div>