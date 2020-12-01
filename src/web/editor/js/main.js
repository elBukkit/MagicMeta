$(document).ready(initialize);
var editor = null;
var preferences = {};

function initialize() {
    $("#loadButton").button().click(function() { editor.load(); });
    $("#newButton").button().click(function() { editor.startNew("Basic"); });
    $("#saveButton").button().click(function() { editor.save(); });
    $("#undoButton").button().click(function() { editor.undo(); });
    $('#referenceButton').button().click(function() { editor.openReference(); });
    $('#downloadButton').button().click(function() { editor.download(); });
    $('#helpButton').button().click(function() { editor.startTutorial(); });
    $('.clipboard').click(function() { copyTextToClipboard($(this)); });
    $('.template').each(function() {
        var newOption = $('<option>').val($(this).prop('id').replace('template', '')).text($(this).data('label'));
        $('#newSelector').append(newOption);
    });
    $('#darkMode').button({
        text: false,
        icon: "ui-icon-lightbulb"
    }).click(toggleTheme);

    // Register hints
    let hints = new Hints();
    hints.setNavigationPanel($('#navigation'));
    hints.register();

    if ($("#newSelector").children().length == 0) {
        $("#newSelector").remove();
    } else {
        $("#newSelector").selectmenu({
          classes: {
            "ui-selectmenu-button": "ui-button-icon-only demo-splitbutton-select"
          },
          change: function(){
            editor.startNew(this.value);
          }
        });
    }
    $('.controlgroup').controlgroup();

    $('#container').show();
    editor = new Editor();

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

        let title = 'Magic Editor (' + _session['type'];
        if (_session.hasOwnProperty('key') && _session.key != null) {
            title = title + "." + _session.key;
        }
        title += ')';
        document.title = title;

        if (_session.hasOwnProperty('player') && _session.player != null) {
            let user = _session.player;
            $('#userName').text(user.name);
            $('#userSkin').css('background-image', 'url("' + user.skinUrl + '")');
            $('#userOverlay').css('background-image', 'url("' + user.skinUrl + '")');
        }
    } else {
        editor.startNew("Basic");
    }

    let preferencesData = $.cookie('preferences');
    if (preferencesData) {
        loadPreferences(preferencesData);
    }

    $.ajax( {
        type: "GET",
        url: "common/meta.php",
        data: {
            legacyIcons: _legacyIcons
        },
        dataType: 'json',

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

function copyTextToClipboard(element) {
    copyToClipboard(element.text().trim());
    $('#copyCode').show();
    element.hide(0).delay(3000).show(0);
    var destination = element.offset();
    var tempDiv = $('<div class="copied">').text("Copied!");
    tempDiv.css({top: destination.top - 48, left: destination.left, zIndex: 1000});
    tempDiv.appendTo(element.parent());
    tempDiv.fadeOut(3000);
}

function copyToClipboard(text) {
    $('#copyCode').show(0).delay(3000).hide(0);
    $('#copyCode').val(text);
    $('#copyCode').select();
    document.execCommand("copy");
}

function toggleTheme() {
    if (preferences.hasOwnProperty('theme') && preferences.theme == 'darcula') {
        selectTheme('default');
    } else {
        selectTheme('darcula');
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