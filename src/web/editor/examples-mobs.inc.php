<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Mob"></textarea>
    <textarea id="templateBasic" class="template" data-label="Basic Mob"># This is the key name of this mob
# It must be unique across the server, and is used in configs and commands such as /mgive to refer to this mob
mymob:
  # Display name of this mob
  name: My Mob
  # The base entity type of this mob
  type: zombie
  health: 200
  # Give the mob some items
  item: diamond_sword
  chestplate: diamond_chestplate
  leggings: diamond_leggings
  helmet: diamond_helmet
  boots: diamond_boots
  # Don't allow this mob to transform into another mob type
  # For instance, zombies to drowned
  transformable: false
  # Turn off the default mob drops
  default_drops: false
  # Loot table
  drops:
  # One item from each group is chosen
  # Weights can be used, the numbers to the right are the weight
  # The higher the weight, the more likely that item is to be chosen
  - diamond: 10
    emerald: 15
    gold_nugget@18: 50
    gold_nugget@16: 100
    gold_nugget@12: 50
    gold_nugget@8: 20
  - sp:16
</textarea>
    <textarea id="templateSpellcaster" class="template" data-label="Spellcasting Mob">spellmob:
  type: zombie
  # How often the mob will cast a spell, in seconds
  interval: 1000
  # Mobs can react to things via triggers
  # Here we are using the "interval" trigger, which just runs every X seconds
  triggers:
    interval:
      # A weighted list of spells to cast
      # One will be chosen every interval, higher weights have a bigger chance of being chosen
      # If "none" is chosen no spell is cast this interval. This can be used to provide some randomization
      # so the mob doesn't noticeably cast every single second.
      cast:
        missile: 20
        poison: 30
        pull: 100
        curse: 100
        blob: 20
        lava: 10
        shell: 20
        none: 300
</textarea>
    <textarea id="templateDisguise" class="template" data-label="Disguised Mob">disguisedmob:
  name: Mr. Wolf
  type: villager
  disguise:
    type: player
    skin: NathanWolf
  item: madscientist_wand
</textarea>
    <textarea id="templateStaticDisguise" class="template" data-label="Static Disguise">disguisedmob:
  name: Iron Man
  type: zombie
  disguise:
    type: player
    name: Iron Man
    # These strings can be obtained using "/mage skin"
    # Once you copy this string, you can change your skin back to whatever you want without affecting
    # this disguise.
    skin: '{"id":"4cb358ae-719c-4423-93c7-8769ce46e9c3","name":"NathanWolf","properties":[{"name":"textures","value":"ewogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJpZCIgOiAiMTFmYTVkZjc1YWEzNDI3NWJhYzY3N2VmZTk1MWYyY2YiLAogICAgICAidHlwZSIgOiAiU0tJTiIsCiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTZlNWI2YmU5Y2E0ZDgwMWM4YTY3OTdiYmE5NTYzNDhlZDRjMDlmZGQwOGRmZDRmMDU4MzY4MzJjNjg3MzQxNSIsCiAgICAgICJwcm9maWxlSWQiIDogIjRjYjM1OGFlNzE5YzQ0MjM5M2M3ODc2OWNlNDZlOWMzIiwKICAgICAgInRleHR1cmVJZCIgOiAiZTZlNWI2YmU5Y2E0ZDgwMWM4YTY3OTdiYmE5NTYzNDhlZDRjMDlmZGQwOGRmZDRmMDU4MzY4MzJjNjg3MzQxNSIKICAgIH0KICB9LAogICJza2luIiA6IHsKICAgICJpZCIgOiAiMTFmYTVkZjc1YWEzNDI3NWJhYzY3N2VmZTk1MWYyY2YiLAogICAgInR5cGUiIDogIlNLSU4iLAogICAgInVybCIgOiAiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS9lNmU1YjZiZTljYTRkODAxYzhhNjc5N2JiYTk1NjM0OGVkNGMwOWZkZDA4ZGZkNGYwNTgzNjgzMmM2ODczNDE1IiwKICAgICJwcm9maWxlSWQiIDogIjRjYjM1OGFlNzE5YzQ0MjM5M2M3ODc2OWNlNDZlOWMzIiwKICAgICJ0ZXh0dXJlSWQiIDogImU2ZTViNmJlOWNhNGQ4MDFjOGE2Nzk3YmJhOTU2MzQ4ZWQ0YzA5ZmRkMDhkZmQ0ZjA1ODM2ODMyYzY4NzM0MTUiCiAgfSwKICAiY2FwZSIgOiBudWxsCn0=","signature":"IEukMP2jcECju2t19zfYSeUCkM4XfTzvLUgz8CaJdbnzBi1c7te1C7Ym/zx8hUHtok3wxkUtVoMjjbiE1lh9o/YrNaDcwAcgloeNBTYtBrBYdgqGnzxcdjyBkcOuNIy+gcv0yT4uB+FOHXkYPGXOJFBXH5vnF1Hz+Ig5cXFO7SseC7dcvYMriesEXOU5wDzPCUYY3HkRSbcZxptgT4VKboPT0mDXwzjKLgX+tFJQDW7PmkrNcZana7opSOEPatWmEeLoJasV4gXJvCUlyO+W49JebWV/StMnH0j/BUF9JB8xjq7XgLiNXFz9EaS/nR2PYRIxVLv2KLRSPwOB7IcaDAm7MuSipbk395JawLrJJumb9oOcwZYhYEMAOGulKx37b+7jMABcTSJ00dcBtWzLT423eN++RdMOBy9ngQOF4iM9+GeDsxPEn1Aw1GKjq3fWPwIo/CZvb75eoVV8qOqzjrO8ZYZZTlxtNxlApPJIWK03RKUPp8hdkJj98SV82+n52sV1FMgdKgNx1dxtnspHZdvwVCCXdslib7WzzYhNMfea1ARLYsGO4nGIEFXO2b0HxELOUzz7QnzN1K16kdcNHMo40PmpzeVjwGbMRlgD0NX/4vuOytKcbD7qrLLzVjX2feklXhnO2msi1QyCMNEH0Xa9ffvOjdT37iVLnaLstqk="}],"legacy":false}'
</textarea>
    <textarea id="templateNPC" class="template" data-label="NPC">mynpc:
  name: Spell Master
  # This sets up a mob that won't move or make sound
  inherit: base_npc
  # This spell will be cast when a player right-clicks on this mob
  interact_spell: spellshop
  # The NPC will talk to nearby players
  dialog:
    - Buy my spells!
</textarea>
</div>