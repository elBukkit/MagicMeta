function Editor()
{
    this.tutorial = new Tutorial($('#tutorialMask'));
    this.saving = false;
    this.metadata = null;
    this.codeEditor = null;
};

Editor.prototype.getSpellConfig = function() {
    return this.getActiveEditor().getValue();
};

Editor.prototype.setSpellConfig = function(spellConfig) {
    spellConfig = !spellConfig ? '' : spellConfig;
    this.getActiveEditor().setValue(spellConfig);
};

Editor.prototype.simpleParse = function(spellConfig) {
    var lines = spellConfig.split("\n");
    var keyLine = 0;
    var key = null;
    var keyCount = 0;
    while (keyLine < lines.length) {
        var line = lines[keyLine++];
        var isSpace = line.startsWith(' ');
        line = line.trim();
        if (line.startsWith("#") || line.length == 0) continue;
        if (keyCount == 0) {
            key = line;
        } else if (isSpace) {
            continue;
        }
        keyCount++;
    }
    keyLine--;
    if (key != null) {
        key = key.substring(0, key.length - 1);
    }
    return {
        key: key,
        keyLine: keyLine,
        lines: lines,
        keyCount: keyCount
    }
};

Editor.prototype.save = function() {
    if (this.saving) return;
    if (_session == null || _sessionId == null) {
        alert("You did not load this page from an editor session, please download your config if you want to save it");
        return;
    }

    if (!this.getActiveEditor().isValid()) {
        alert("You have errors in your code, please fix them before saving!");
        return;
    }

    var spellConfig = this.getSpellConfig();

    var parsed = this.simpleParse(spellConfig);
    if (_session.type != 'config' && _session.type != 'messages') {
        if (parsed.keyCount == 1 || _session.key == null || _session.key == "") {
            _session.key = parsed.key;
        }
    }
    _session.contents = spellConfig;

    this.saving = true;
    var me = this;
    $("#saveButton").button('disable');
    $.ajax( {
        type: "POST",
        url: "save.php",
        data: {
            session: JSON.stringify(_session),
            id: _sessionId
        },
        dataType: 'json'
    }).done(function(response) {
        $("#saveButton").button('enable');
        me.saving = false;
        if (!response.success) {
            alert("Save failed: " + response.message);
        } else {
            let isPlayer = _session != null && _session.hasOwnProperty('player') && _session.player != null;
            if (isPlayer) {
                $('.configPrefix').text('/');
            } else {
                $('.configPrefix').text('');
            }
            $('#sessionDiv').text(_sessionId);
            $("#saveDialog").dialog({
              modal: true,
              width: '640px',
              buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
              }
            }).show();
        }
    });
};

Editor.prototype.startNamed = function(template, name) {
    let config = $('#template' + template).val();
    if (!config) {
        this.setSpellConfig('');
        return;
    }
    let lines = config.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > 0 && lines[i][0] != '#') {
            lines[i] = name + ":";
            if (_session && _session.hasOwnProperty("player") && lines.length > i && !lines[i + 1].trim().startsWith("creator")) {
                let indent = 4;
                if (lines.length > i + 1) {
                    let nextLine = lines[i + 1];
                    indent = 0;
                    while (indent < nextLine.length && nextLine[indent] == ' ') indent++;
                }
                indent = " ".repeat(indent);
                lines.splice(i + 1, 0, indent + "# These track who created what spells, you can remove them if you want");
                lines.splice(i + 2, 0, indent + "creator: " + _session.player.name);
                lines.splice(i + 3, 0, indent + "creator_id: " + _session.player.id);
            }
            break;
        }
    }
    this.setSpellConfig(lines.join("\n"));
};

Editor.prototype.startNew = function(template) {
    let contents = $('#template' + template).val();
    if (!contents) {
        contents  = '';
    } else {
        let currentConfig = this.getSpellConfig();
        if (currentConfig && currentConfig.length > 0) {
            let lines = currentConfig.split("\n");
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].length > 0 && lines[i][0] != '#') {
                    this.startNamed(template, lines[i].split(':')[0]);
                    return;
                }
            }
        }
    }
    this.setSpellConfig(contents);
};

Editor.prototype.getActiveEditor = function() {
    return this.getCodeEditor();
};

Editor.prototype.getCodeEditor = function() {
    if (this.codeEditor == null) {
        this.codeEditor = new CodeEditor($('#editor'));
        if (this.metadata != null) {
            this.codeEditor.setMetadata(this.metadata);
        }
    }

    return this.codeEditor;
};

Editor.prototype.openReference = function() {
    window.open(referenceURL, '_blank');
};

Editor.prototype.download = function() {
    var spellConfig = this.getSpellConfig();
    var key = this.simpleParse(spellConfig).key;
    if (key == null || key == '') {
        alert("Nothing to download... ?");
        return;
    }

    var downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/yaml;charset=utf-8,' + encodeURIComponent(spellConfig));
    downloadLink.setAttribute('download', key + ".yml");
    downloadLink.click();
};

Editor.prototype.setMetadata = function(meta) {
    if (meta == null) {
        alert("Error loading metadata, please reload and try again.");
        return;
    }

    // Import custom lists from session
    if (_session) {
        if (_session.hasOwnProperty('spells')) {
            meta.types.attribute.options = _session.attributes.reduce((a,b)=> (a[b]=null,a),{});
            meta.types.entity_type.options = $.extend(meta.types.entity_type.options, _session.mobs.reduce((a,b)=> (a[b]=null,a),{}));
            meta.types.material.options = $.extend(meta.types.material.options, _session.items.reduce((a,b)=> (a[b]=null,a),{}));
            meta.types.material_list.options = $.extend(meta.types.material_list.options, _session.materials.reduce((a,b)=> (a[b]=null,a),{}));
            meta.types.mage_class.options = _session.classes.reduce((a,b)=> (a[b]=null,a),{});
            meta.types.path.options = _session.paths.reduce((a,b)=> (a[b]=null,a),{});
            meta.types.spell.options = _session.spells.reduce((a,b)=> (a[b]=null,a),{});
        }
    }

    this.metadata = meta;
    if (this.codeEditor != null) {
        this.codeEditor.setMetadata(meta);
    }
    if (this.guiEditor != null) {
        this.guiEditor.setMetadata(meta);
    }
};

Editor.prototype.startTutorial = function() {
    this.tutorial.start($('#welcomeTutorial'));
};

Editor.prototype.undo = function() {
    this.getActiveEditor().undo();
};
