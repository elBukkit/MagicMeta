// Initialization
$(document).ready(initialize);

var metadata = null;
var _selectedDetails = [];
var _selectedTab = "spell_properties";
var _firstLoad = true;

function processMetadata(meta) {
    var properties = meta.properties;
    var filtered = {};

    for (var key in properties) {
        var property = properties[key];
        if (property.hasOwnProperty('alias')) {
            var aliased = properties[property.alias];
            if (aliased.hasOwnProperty('aliases')) {
                aliased.aliases.push(key)
            } else {
                aliased.aliases = [key];
            }
        } else {
            filtered[key] = property;
        }
    }
    meta.properties = filtered;
    return meta;
}

function makeSelectable(tab, details, populate, depth) {
    tab.selectable({
        selected: function(event, ui) {
            var selected = jQuery(".ui-selected", this);
            details.empty();
            populate(details, selected);
            _selectedDetails.length = depth;
            _selectedDetails[depth - 1] = selected.data('key');
            var hash = _selectedTab;
            for (var i = 0; i < _selectedDetails.length; i++) {
                hash += "." + _selectedDetails[i];
            }
            window.location.hash = hash;
        }
    });

    var currentHash = window.location.hash;
    if (currentHash != '' && _firstLoad) {
        var pieces = currentHash.split('.');
        if (pieces.length >= depth) {
            var key = pieces[depth];
            jQuery(tab).find('.ui-selectee').each(function() {
                var selected = $(this);
                if (selected.data('key') == key) {
                    selected.addClass('ui-selected');
                    details.empty();
                    populate(details, selected);
                }
            });
        }
    }
}

function populatePropertyList(list, sectionKey) {
    var properties = metadata.properties;
    var defaultValues = metadata.types[sectionKey].parameters;
    var section = Object.keys(defaultValues).sort();
    for (var i = 0; i < section.length; i++) {
        var key = section[i];
        if (!properties.hasOwnProperty(key)) continue;
        var parameter = properties[key];
        var item = getSelectable(parameter, key);
        item.data('default', defaultValues[key]);
        list.append(item);
    }
    sortList(list);
}

function makePropertySelector(selector, section, details) {
     populatePropertyList(selector, section);
     makeSelectable(selector, details, addParameterDetails, 1);
}

function addParameterDetails(container, listItem) {
    var key = listItem.data('key');
    var defaultValue = listItem.data('default');
    var property = metadata.properties[key];

    var title = $('<div class="titleBanner"/>').text(property.name);
    container.append(title);

    var propertyKey = $('<div class="propertyKeys"/>').text(property.field);
    if (property.hasOwnProperty("aliases")) {
        var aliases = $('<span class="propertyAlias">').text(', ' + property.aliases.join(', '));
        propertyKey.append(aliases);
    }
    container.append(propertyKey);

    var propertyDescription = $('<div class="propertyDescription"/>');
    var isEmpty = property.description.length == 0 || (property.description.length == 1 && property.description[0] == '');
    if (isEmpty) {
        if (user.id != '') {
            var describeSpan = $('<span>');
            describeSpan.addClass('addDescription');
            describeSpan.text("Help us out, add a description!");
            describeSpan.click(function() {
               addPropertyDescription(key, propertyDescription);
            });
            propertyDescription.append(describeSpan);
        }
    } else {
        for (var i = 0; i < property.description.length; i++) {
            propertyDescription.append($('<div class="descriptionLine"/>').html(property.description[i]));
        }
    }
    container.append(propertyDescription);

    if (defaultValue != null && defaultValue != '') {
        var defaultValueContainer = $('<div class="defaultValue"/>');
        defaultValueContainer.text("Default: " + defaultValue);
        container.append(defaultValueContainer);
    }

    if (property.category != '') {
        var category = metadata.categories[property.category];
        var categoryName = $('<div class="category"/>')
            .append($('<span class="prefix">').text('Category: '))
            .append($('<span>').text(category.name));
        container.append(categoryName);
    }

    var propertyType = metadata.types[property.type];
    var typeDescription = $('<div class="propertyType"/>')
        .append($('<span class="prefix">').text('Type: '))
        .append($('<span>').text(propertyType.name));
    container.append(typeDescription);

    var propertyTypeDetails = $('<div class="propertyTypeDetails"/>');
    var propertyTypeDescription = $('<div class="propertyTypeDescription"/>');
    for (var i = 0; i < propertyType.description.length; i++) {
        propertyTypeDescription.append($('<div class="descriptionLine"/>').html(propertyType.description[i]));
    }
    propertyTypeDetails.append(propertyTypeDescription);

    populateOptions(propertyType.options, propertyTypeDetails);
    if (propertyType.hasOwnProperty('key_type')) {
        populateOptions(metadata.types[propertyType.key_type].options, propertyTypeDetails, 'Map of ' + metadata.types[propertyType.key_type].name + ':');
        populateOptions(metadata.types[propertyType.value_type].options, propertyTypeDetails, 'to ' + metadata.types[propertyType.value_type].name + ':');
    } else if (propertyType.hasOwnProperty('value_type')) {
        populateOptions(metadata.types[propertyType.value_type].options, propertyTypeDetails, 'List of ' + metadata.types[propertyType.value_type].name + ':');
    }
    container.append(propertyTypeDetails);

    typeDescription.click(function() {
        propertyTypeDetails.toggle();
    });
}

function populateOptions(options, container, title) {
    var propertyTypeOptions = $('<div class="propertyTypeOptions"/>');
    var table = $('<table>');
    var tbody = $('<tbody>');
    table.append(tbody);
    var optionsCount = 0;
    for (var key in options) {
        if (!options.hasOwnProperty(key)) continue;

        var row = $('<tr>');
        var keyCell = $('<td>').text(key);
        var descriptionCell = $('<td>');
        if (options[key] != null) {
            descriptionCell.html(options[key]);
        }
        row.append(keyCell);
        row.append(descriptionCell);
        tbody.append(row);
        optionsCount++;
    }

    if (optionsCount == 0) return;

    if (title) {
        container.append($('<div>').addClass('optionsTitle').text(title));
    }

    propertyTypeOptions.append(table);
    container.append(propertyTypeOptions);
}

function populatePropertyHolderList(list, sectionKey) {
    var section = metadata.classed[sectionKey];
    for (var key in section) {
        if (!section.hasOwnProperty(key)) continue;
        var holder = section[key];
        var item = getSelectable(holder, key);
        list.append(item);
    }
    sortList(list);
}

function makePropertyHolderSelector(selector, section, details, baseProperties, category, categoryProperties) {
     populatePropertyHolderList(selector, section);
     makeSelectable(selector, details, function(details, listItem) {
         addPropertyHolderDetails(details, listItem.data('key'), section, baseProperties, category, categoryProperties);
     }, 1);
}

function sortProperties(list) {
    list.sort(function(a, b) {
        var aName = metadata.properties.hasOwnProperty(a) ? metadata.properties[a].name : a;
        var bName = metadata.properties.hasOwnProperty(b) ? metadata.properties[b].name : b;
        return a.localeCompare(b);
    });
}

function sortList(ul) {
    var listitems = ul.children('li').get();
    listitems.sort(function(a, b) {
       return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
    });
    $.each(listitems, function(idx, itm) { ul.append(itm); });
}

function addPropertyHolderDetails(container, key, section, baseProperties, targetCategory, categoryProperties) {
    var propertyHolder = metadata['classed'][section][key];

    var title = $('<div class="titleBanner"/>').text(propertyHolder.name);
    container.append(title);

    var propertyKey = $('<div class="propertyKeys"/>').text('class: ' + propertyHolder.short_class);
    container.append(propertyKey);

    var description = $('<div class="propertyTypeDescription"/>');
    for (var i = 0; i < propertyHolder.description.length; i++) {
        description.append($('<div class="descriptionLine"/>').html(propertyHolder.description[i]));
    }
    container.append(description);

    if (propertyHolder.category != '') {
        var category = metadata.categories[propertyHolder.category];
        var categoryName = $('<div class="category"/>')
            .append($('<span class="prefix">').text('Category: '))
            .append($('<span>').text(category.name));
        container.append(categoryName);
    }

    if (propertyHolder.examples.length > 0) {
        var exampleDiv = $('<div/>');
        exampleDiv.addClass('exampleContainer');
        exampleDiv.append("Examples: ");
        for (var i = 0; i < propertyHolder.examples.length; i++) {
            var example = propertyHolder.examples[i];
            var exampleLink = $('<a target="_blank">');
            exampleLink.prop('href', 'https://github.com/elBukkit/MagicPlugin/blob/master/Magic/src/main/resources/examples/survival/spells/' + example + '.yml');
            exampleLink.text(example);
            exampleDiv.append(exampleLink);
        }
        container.append(exampleDiv);
    }

    var parameterContainer = $('<div class="parameterContainer">');
    var parameterListContainer = $('<div class="parameterList">');
    var parameterList = $('<ul>');
    var properties = metadata.properties;

    var defaultValues = propertyHolder.parameters;
    var parameters = Object.keys(defaultValues);
    sortProperties(parameters);
    for (var i = 0; i < parameters.length; i++) {
        var propertyKey = parameters[i];
        if (!properties.hasOwnProperty(propertyKey)) continue;
        var property = properties[propertyKey];

        var parameterItem = getSelectable(property, propertyKey);
        parameterItem.data('default', defaultValues[propertyKey]);
        parameterList.append(parameterItem);
    }
    baseProperties = metadata['types'][baseProperties].parameters
    if (targetCategory && propertyHolder.hasOwnProperty('category') && propertyHolder.category == targetCategory) {
        baseProperties = jQuery.extend({}, baseProperties, metadata['types'][categoryProperties].parameters);
    }
    var baseParameters = Object.keys(baseProperties);
    sortProperties(baseParameters);
    for (var i = 0; i < baseParameters.length; i++) {
        var propertyKey = baseParameters[i];
        if (!properties.hasOwnProperty(propertyKey)) continue;
        var property = properties[propertyKey];

        var parameterItem = getSelectable(property, propertyKey);
        parameterItem.addClass('baseProperty');
        parameterItem.data('default', defaultValues.hasOwnProperty(propertyKey) ? defaultValues[propertyKey] : baseProperties[propertyKey]);
        parameterList.append(parameterItem);
    }
    var parameterDetails = jQuery('<div class="details">').text("Select a parameter for details");
    makeSelectable(parameterList, parameterDetails, addParameterDetails, 2);
    parameterListContainer.append(parameterList);
    parameterContainer.append(parameterListContainer);
    parameterContainer.append(parameterDetails);
    container.append(parameterContainer);
}

function getSelectable(selectable, key) {
    var parameterItem = $('<li>').text(selectable.name);
    if (selectable.importance >= 100) {
        parameterItem.addClass('importance-100');
    } else if (selectable.importance >= 75) {
        parameterItem.addClass('importance-75');
    } else if (selectable.importance >= 50) {
        parameterItem.addClass('importance-50');
    } else if (selectable.importance >= 25) {
        parameterItem.addClass('importance-25');
    } else if (selectable.importance < 0) {
        parameterItem.addClass('importance--');
    } else {
        parameterItem.addClass('importance-0');
    }
    parameterItem.addClass('ui-widget-content');
    parameterItem.data('key', key);
    return parameterItem;
}

function addPropertyDescription(key, descriptionContainer) {
    var property = metadata.properties[key];
    $('#describePropertyName').text(property.name);
    $('#describePropertyType').text(property.type);

    $("#addDescriptionDialog").dialog({
      modal: true,
      width: 'auto',
      buttons: {
        Cancel: function() {
            $(this).dialog("close");
        },
        "Describe": function() {
            $(this).dialog("close");
            var lines = $('#describePropertyText').val().split("\n");
            if (lines.length > 0 && lines[0] != '') {
                var nonEmpty = [];
                descriptionContainer.empty();
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (line == '') continue;
                    nonEmpty.push(line);
                    descriptionContainer.append($('<div class="descriptionLine"/>').html(line));
                }

                $.ajax( {
                    type: "POST",
                    url: "describe.php",
                    data: {
                        property: key,
                        description: nonEmpty
                    },
                    dataType: 'json'
                }).done(function(response) {
                    if (!response.success) {
                        alert("Describe failed: " + response.message + " ... sorry, thanks for trying!");
                    }
                });

            } else {
                alert("No description entered...");
            }
        }
      }
    });
}

function initialize() {
    $.ajax( {
        type: "GET",
        url: "common/meta.php",
        dataType: 'json'
    }).done(function(meta) {
        // Populate tabs
        metadata = processMetadata(meta);
        var parameters = meta.parameters;

        makePropertySelector($("#spellPropertyList"), "spell_properties", $('#spellPropertyDetails'));
        makePropertySelector($("#spellParameterList"), "spell_parameters", $('#spellParameterDetails'));
        makePropertySelector($("#wandParameterList"), "wand_properties", $('#wandParameterDetails'));
        makePropertySelector($("#mobParameterList"), "mob_properties", $('#mobParameterDetails'));
        makePropertySelector($("#effectParameterList"), "effect_properties", $('#effectParameterDetails'));
        makePropertySelector($("#classParameterList"), "class_properties", $('#classParameterDetails'));
        makePropertySelector($("#modifierParameterList"), "modifier_properties", $('#modifierParameterDetails'));
        makePropertySelector($("#craftingParameterList"), "crafting_properties", $('#craftingParameterDetails'));

        makePropertyHolderSelector($("#effectList"), "effectlib_effects", $('#effectDetails'), 'effectlib_properties');
        makePropertyHolderSelector($("#actionList"), "actions", $('#actionDetails'), 'action_parameters', 'compound', 'compound_action_parameters');

        // Kinda hacky but not sure how to work around this
        var currentHash = window.location.hash;
        if (currentHash != '') {
            var pieces = currentHash.split('.');
            _selectedTab = pieces[0];
            for (var i = 1; i < pieces.length; i++) {
                _selectedDetails[i - 1] = pieces[i];
            }
            window.location.hash = _selectedTab;
        }
        // Create tab list
        $("#tabs").tabs({
            beforeActivate: function (event, ui) {
                _selectedTab = ui.newPanel.selector;
                window.location.hash = _selectedTab;
            }
        }).show();
        window.location.hash = currentHash;
        _firstLoad = false;
    });
}