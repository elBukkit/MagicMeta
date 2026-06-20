<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Populator"></textarea>
    <textarea id="templateTower" class="template" data-label="Random Towers"># This is the key name of the populator, it must be unique across the server
tower:
  class: Tower
  blocks: concretes
  # this format specifies a randomized range
  height: 32 | 128
  # this longer format is also supported
  taper:
    min: 0
    max: 0.2
  width: 24 | 48
  noise: 0.1 | 0.5</textarea>
    <textarea id="templateBasic" class="template" data-label="Build Schematic"># This is the key name of the populator, it must be unique across the server
build_schematic:
  class: Schematic
  # Block populators can cover a 3x3 chunk space
  # This will randomize the x and z placement positions to span anywhere in that space
  position: -16 | 31
  schematic: church</textarea>
    <textarea id="templateMobs" class="template" data-label="Spawn Mobs"># This is the key name of the populator, it must be unique across the server
spawn_mobs:
  class: Spawn
  types:
    warlock: 0.1
    zombie: 0.5
    none: 1
</textarea>
    <textarea id="templateFood" class="template" data-label="Farm Plots"># This is the key name of the populator, it must be unique across the server
food:
  class: Crops
  # This is a special-case example of farm plots that are harvestable by players in adventure mode
  # It works by causing a block update when a player steps near, breaking the crops because they are not on soil
  border: pale_oak_pressure_plate
  crops: carrots,potatoes
  support: white_concrete
  soil: glowstone
  age: 0.2 | 1
  width: 1 | 3
  position: 0 | 14</textarea>
</div>