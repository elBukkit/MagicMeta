<?php ?>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank" class="template" data-label="Blank List"></textarea>
    <textarea id="templateBasic" class="template" data-label="Special Transparency"># Material lists can be lists of blocks or other lists
mytransparent:
# This is a builtin material list of blocks you can see through
- transparent
# We can add whatever we want on top of this
- iron_bars
# There are lots of builtin lists that group blocks together
- fences
    </textarea>
    <textarea id="templateNegated" class="template" data-label="Negated lists"># Material lists can negate other lists
nottransparent:
# This is a builtin material list of blocks you can see through
# Here are negating it, meaning this material list will contain all blocks not in the "transparent" list
- !transparent
    </textarea>
</div>