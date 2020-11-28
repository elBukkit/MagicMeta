<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Effects"></textarea>
    <textarea id="templateBasic" class="template" data-label="Fountain Effects"># This is the key name of this effect list
# It must be unique across the server, and is used in configs to refer to this effects list
# Most often this would be by using the PlayyEffects action, or in place of an effects list in
# wand or spell configs.
myfountain:
 # Unlike most other configuration types in Magic, these are lists, not maps.
 # Each item in the list is an individual effect player
 - effectlib:
     class: Fountain
     duration: 86400000
     particles_spout: 15
     particles_strand: 20
     particle_offset_x: 0.1
     particle_offset_y: 0.1
     particle_offset_z: 0.1
     particle_count: 5
</textarea>
</div>