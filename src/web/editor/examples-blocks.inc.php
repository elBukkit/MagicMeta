<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Magic Block"></textarea>
    <textarea id="templateBasic" class="template" data-label="Mob Spawner"># This is the key name of this magic block
# It must be unique across the server, and is used in configs to refer to this magic block
#
# An magic block assigns some behavior to a specific block in the world.
# This can be used to make mob spawners, visual or sound effects,
# or cast spells at players.
#
myspawner:
  name: Magic Mob Spawner
  description: A simple mob spawner, can be customized via the "spawn.mobs" parameter, among others.
  # How often this magic block wakes up and checks for a spawn
  interval: 5000
  # Define how this spawner spawns mobs
  spawn:
    player_range: 24
    min_players: 1
    limit_range: 32
    vertical_range: 8
    limit: 1
    count: 1
    interval: 60000
    probability: 1
    radius: 8
    vertical_radius: 1
    parameters:
      persist: false
    mobs:
      warlock: 100
      dark_wizard: 5
      dark_spider: 20
      mega_spider: 30

</textarea>
    <textarea id="templateFountain" class="template" data-label="Fountain"># This is the key name of this magic block
# It must be unique across the server, and is used in configs to refer to this magic block
#
# A magic block assigns some behavior to a specific block in the world.
# This can be used to make mob spawners, visual or sound effects,
# or cast spells at players.
#
myfountain:
  name: Fountain
  description: A water fountain
  # This refers to some effects that can be edited with "/mconfig editor effects fountain"
  effects: fountain

</textarea>
    <textarea id="templateSpell" class="template" data-label="Spell Block"># This is the key name of this magic block
# It must be unique across the server, and is used in configs to refer to this magic block
#
# A magic block assigns some behavior to a specific block in the world. In this case it will cast a spell on an interval.
#
spellblock:
    name: Spellcaster
    interval: 5000
    cast:
        spells: flare pdx 0 pdz 0 pdy 1 quiet true
</textarea>
</div>