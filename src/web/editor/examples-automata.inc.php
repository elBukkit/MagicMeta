<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Class"></textarea>
    <textarea id="templateBasic" class="template" data-label="Mob Spawner"># This is the key name of this automaton
# It must be unique across the server, and is used in configs to refer to this automaton
#
# An automaton assigns some behavior to a specific block in the world.
# This can be used to make mob spawners, visual or sound effects,
# or cast spells at players.
#
myspawner:
  name: Magic Mob Spawner
  description: A simple mob spawner, can be customized via the "spawn.mobs" parameter, among others.
  # How often this automaton wakes up and checks for a spawn
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
    <textarea id="templateFound" class="template" data-label="Found"># This is the key name of this automaton
# It must be unique across the server, and is used in configs to refer to this automaton
#
# An automaton assigns some behavior to a specific block in the world.
# This can be used to make mob spawners, visual or sound effects,
# or cast spells at players.
#
myfountain:
  name: Fountain
  description: A water fountain
  # This refers to some effects that can be edited with "/mconfig editor effects fountain"
  effects: fountain

    </textarea>
</div>