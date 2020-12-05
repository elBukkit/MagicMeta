$(document).ready(initialize);
var editor = null;
var preferences = {};

function initialize() {
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
    $('#darkMode').button({
        text: false,
        icon: "ui-icon-lightbulb"
    }).click(toggleTheme);

    var loadSpell = null;
    var currentHash = window.location.hash;
    if (currentHash != '') {
        loadSpell = currentHash.substring(1);
    }
    $('.controlgroup').controlgroup();

    // Register hints and create editor
    let hints = new Hints('spells');
    hints.setNavigationPanel($('#navigation'));
    editor = new Editor($('#editor'));
    hints.register(editor);

    if (loadSpell != null) {
        editor.loadFile(loadSpell);
    } else {
        editor.startNew("Basic");
    }

    let preferencesData = $.cookie('preferences');
    if (preferencesData) {
        loadPreferences(preferencesData);
    }

    $.ajax( {
        type: "GET",
        url: "common/meta.php?context",
        dataType: 'json'
    }).done(function(meta) {
        editor.setMetadata(meta);
    });

    if (user.id == '') {
        editor.startTutorial();
    }
}

function selectTheme(theme) {
    if (preferences.hasOwnProperty('theme') && preferences.theme != theme) {
        $('body').removeClass(preferences.theme);
    }
    preferences.theme = theme;
    $('body').addClass(preferences.theme);
    editor.setTheme(theme);
    savePreferences();
}

function savePreferences() {
    $.cookie("preferences", JSON.stringify(preferences));
}

function loadPreferences(preferencesData) {
    preferences = JSON.parse(preferencesData);
    selectTheme(preferences.theme);
}

function toggleTheme() {
    if (preferences.hasOwnProperty('theme') && preferences.theme == 'darcula') {
        selectTheme('default');
    } else {
        selectTheme('darcula');
    }
}

function dumpYaml(object) {
    return jsyaml.dump(object, {lineWidth: 200, noRefs: true});
}