<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Generator"></textarea>
    <textarea id="templateTower" class="template" data-label="Bedrock layer"># This is the key name of the generator, it must be unique across the server
bedrock:
  class: Bedrock</textarea>
    <textarea id="templateBasic" class="template" data-label="Perlin Terrain"># This is the key name of the generator, it must be unique across the server
rainbow_ground:
  # The Perlin noise class can be used to make realistic-ish terrain
  class: Perlin
  biome: lush_caves
  noise: 0.05
  blocks: concretes
  max_elevation: 20
  min_elevation: 0</textarea>
    <textarea id="templateSequence" class="template" data-label="Sequence"># This is the key name of the generator, it must be unique across the server
full_terrain:
  # The sequence class combines multiple other generators
  class: Sequence
  generators:
    - bedrock
    - rainbow_ground</textarea>
</div>