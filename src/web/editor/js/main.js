$(document).ready(initialize);
var editor = null;

function initialize() {
    editor = new Editor();

    $("#loadButton").button().click(function() { editor.load(); });
    $("#newButton").button().click(function() { editor.startNew("Basic"); });
    $("#saveButton").button().click(function() { editor.save(); });
    $('#referenceButton').button().click(function() { editor.openReference(); });
    $('#downloadButton').button().click(function() { editor.download(); });
    $('#helpButton').button().click(function() { editor.startTutorial(); });
    $('#deleteButton').button().click(function() { editor.deleteSpell(); });
    $('#forkButton').button().click(function() { editor.fork(); });
    $('#modeSelector input[type=radio]').change(function() { editor.checkMode(); });
    $("#loadSpellList").selectable({filter: 'tr'});
    $("#newSelector").selectmenu({
      classes: {
        "ui-selectmenu-button": "ui-button-icon-only demo-splitbutton-select"
      },
      change: function(){
        editor.startNew(this.value);
      }
    });

    $('.controlgroup').controlgroup();
    if (_session != null) {
        if (_session.hasOwnProperty('contents') && _session.contents != null && _session.contents != '') {
            editor.setSpellConfig(_session.contents);
        } else {
            if (_session.hasOwnProperty('key') && _session.key != null) {
                editor.startNamed("Basic", _session.key);
            } else {
                editor.startNew("Basic");
            }
        }

        if (_session.hasOwnProperty('player') && _session.player != null) {
            let user = _session.player;
            $('#userName').text(user.name);
            $('#userSkin').css('background-image', 'url("' + user.skinUrl + '")');
            $('#userOverlay').css('background-image', 'url("' + user.skinUrl + '")');
        }
    } else {
        editor.startNew("Basic");
    }

    $.ajax( {
        type: "GET",
        url: "common/meta.php?context",
        dataType: 'json'
    }).done(function(meta) {
        editor.setMetadata(meta);
    });

    if (!_seenTutorial) {
        editor.startTutorial();
    }
}

function dumpYaml(object) {
    return jsyaml.dump(object, {lineWidth: 200, noRefs: true});
}