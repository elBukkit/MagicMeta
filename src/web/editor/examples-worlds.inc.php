<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank World"></textarea>
    <textarea id="templateBasic" class="template" data-label="Copy Main World"># This is the key name of the world
# It must be unique across the server, a world folder will be created with this name when the world is first
# used, or if autoload is set to true.
world_other:
    # Copy the main overworld to start this world
    copy: world
    # Load this world on server startup
    autoload: true</textarea>
    <textarea id="templateAmplifiedNether" class="template" data-label="Amplified Nether World"># This is the key name of the world
# It must be unique across the server, a world folder will be created with this name when the world is first
# used, or if autoload is set to true.
world_nether_amplified:
    type: amplified
    environment: nether
    # Load this world on server startup
    autoload: true</textarea>
</div>