<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank Modifier"></textarea>
    <textarea id="templateBasic" class="template" data-label="Vanilla Attribute Modifier"># This is the key name of this modifier
# It must be unique across the server, and is used in configs to refer to this modifier
# Most often this would be by using the Modifier action to add or remove a modifier.
mymodifier:
  # Apply some vanilla attributes
  entity_attributes:
    generic_knockback_resistance:
      value: 2
      operation: base
    </textarea>
</div>