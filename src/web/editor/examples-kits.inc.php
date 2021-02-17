<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Kit"></textarea>
    <textarea id="templateBasic" class="template" data-label="Starter kit"># This is the key name of the kit
# It must be unique across the server, and is used in the /mkit command and other configs
# to refer to this kit
starter:
  # This kit (will be given on first join to every player
  starter: true
  # Items can be a single item key, or a section specifying a specific slot to try
  # to put the item in.
  items:
    - wooden_sword
    - wooden_pickaxe
    - wooden_shovel
    - wooden_axe
    - wooden_pickaxe
    # Item amounts can be specified using the "@" syntax
    # This can also be done by putting an `amount` property in the sectoin
    - item: bread@32
      slot: 8
    - item: leather_helmet
      slot: helmet
    - item: leather_chestplate
      slot: chestplate
    - item: leather_leggings
      slot: leggings
    - item: leather_boots
      slot: boots</textarea>
    <textarea id="templateAdmin" class="template" data-label="Admin kit"># This is the key name of the kit
# It must be unique across the server, and is used in the /mkit command and other configs
# to refer to this kit
admin:
  # This kit will be given to players with the permission Magic.admin
  requirements:
    - permission: Magic.admin

  # On login, players will be given any items in this kit that they are
  # missing.
  keep: true
  # If they no longer meet the above requirements (permissions) any
  # items in this kit will be taken away from them.
  # This should really only be used with kits that have special items in them items taken are *not* tracked
  # Meaning if you use this on a kit with diamonds in it, the player will always have all of their diamonds
  # Removed on join
  remove: true

  # In general items in this kit should be undroppable and probably unstashable as well.
  items:
    - admintool</textarea>
</div>