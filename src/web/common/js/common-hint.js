var WHITESPACE = /\s+/;
var WORD = /[\w\.]+/;
var OBJECT_KEY = /^[\s-]*?(\w+)\s*?:\s*?$/;
var LEAF_KV = /^[\s-]*?(\w+)\s*?:\s*?/;
var WORD_OR_COLON = /\w+|:/;
var WORD_OR_COLON_OR_DASH = /-\w+|:/;

function rstrip(line) {
    return line.replace(/\s*$/g, '');
}

function getIndentation(line, tabSizeInSpaces) {
    var s = 0;
    while (s < line.length && !WORD_OR_COLON.test(line.charAt(s))) s++;
    line = line.slice(0, s);
    // change tabs to spaces
    line = line.replace(/\t/g, tabSizeInSpaces);
    // return the number of spaces
    return line.length;
}

function getListIndentation(line, tabSizeInSpaces) {
    var s = 0;
    while (s < line.length && !WORD_OR_COLON_OR_DASH.test(line.charAt(s))) s++;
    line = line.slice(0, s);
    // change tabs to spaces
    line = line.replace(/\t/g, tabSizeInSpaces);
    // return the number of spaces
    return line.length;
}

function getKeyFromLine(line) {
    var m = line.match(LEAF_KV);
    if (m) {
        return m[1];
    }
    return "";
}

function getKeyValue(line) {
    line = line.replace('- ', '');
    var kv = line.split(':');
    kv[0] = kv[0].trim();
    if (kv.length == 0) {
        kv[1] = '';
    } else {
        kv[1] = kv[1].trim();
    }
    return kv;
}

function getParent(pos, indent, cm, tabSizeInSpaces) {
    if (pos.line == 0) return null;
    var thisLine = cm.getLine(pos.line);
    var currentLine = pos.line;
    currentLine--;
    while (currentLine > 0) {
        thisLine = cm.getLine(currentLine);
        var thisIndent = getIndentation(thisLine, tabSizeInSpaces);
        if (thisIndent < indent)
            return thisLine.trim().replace(':', '');
        currentLine--;
    }

    return null;
}

function getPreviousSibling(pos, indent, cm, tabSizeInSpaces) {
    if (pos.line == 0) return null;
    var currentLine = pos.line;
    currentLine--;
    while (currentLine > 0) {
        var thisLine = cm.getLine(currentLine);
        var thisIndent = getListIndentation(thisLine, tabSizeInSpaces);
        if (thisIndent == indent) return thisLine.trim().replace(':', '');
        currentLine--;
    }

    return null;
}

function getSiblings(pos, indent, cm, tabSizeInSpaces) {
    var siblings = {};
    if (pos.ch < indent) indent = pos.ch;
    var startLine = pos.line;
    var currentLine = pos.line;
    currentLine--;
    while (currentLine > 0) {
        var thisLine = cm.getLine(currentLine);
        var trimmed = thisLine.trim();
        var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        var isObject = thisLine.indexOf(':') > 0;
        var thisIndent = getIndentation(thisLine, tabSizeInSpaces);

        if (!isEmpty && thisIndent < indent) break;
        if (isObject && thisIndent == indent) {
            var kv = getKeyValue(thisLine);
            siblings[kv[0]] = kv[1];
        }
        if (thisIndent <= indent && trimmed.startsWith("-")) break;
        currentLine--;
    }
    currentLine = startLine;
    while (currentLine < cm.lineCount()) {
        var thisLine = cm.getLine(currentLine);
        var trimmed = thisLine.trim();
        if (trimmed.startsWith("-")) break;
        var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        var isObject = thisLine.indexOf(':') > 0;
        var thisIndent = getIndentation(thisLine, tabSizeInSpaces);

        if (!isEmpty && thisIndent < indent) break;
        if (isObject && thisIndent == indent) {
            var kv = getKeyValue(thisLine);
            siblings[kv[0]] = kv[1];
        }
        currentLine++;
    }
    return siblings;
}

function walkUp(pos, indent, cm, tabSizeInSpaces) {
    var currentLine = pos.line;
    currentLine --;
    var thisLine = cm.getLine(currentLine);
    var trimmed = thisLine.trim();
    var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
    while (currentLine > 0 && (!OBJECT_KEY.test(thisLine) || getIndentation(thisLine, tabSizeInSpaces) >= indent || isEmpty)) {
        // while this isn't the line we're looking for, move along
        currentLine --;
        thisLine = cm.getLine(currentLine);
        trimmed = thisLine.trim();
        isEmpty = trimmed.length == 0 || trimmed[0] == '#';
    }
    return currentLine;
}

function getHierarchy(pos, cm, tabSizeInSpaces) {
    var hierarchy = [];
    var thisLine = cm.getLine(pos.line);

    var isHighestContext = (getIndentation(thisLine, tabSizeInSpaces) === 0);
    var isIndentedBlock = (pos.ch !== 0 && getIndentation(thisLine, tabSizeInSpaces) !== 0);

    var thisIndentation = getIndentation(thisLine, tabSizeInSpaces);
    while (pos.ch !== 0 && thisIndentation) {
        // while not at beginning of line (highest point in hierarchy)
        // OR we have reached highest hierarchy (no indentation)
        var k = getKeyFromLine(thisLine);
        if (k !== undefined) {
            hierarchy.push(k);
        }
        var line = walkUp(pos, thisIndentation, cm, tabSizeInSpaces);
        thisLine = cm.getLine(line);
        thisIndentation = getIndentation(thisLine, tabSizeInSpaces);
    }

    if (!isHighestContext || isIndentedBlock) {
        // is an indented block, add the above level's key
        hierarchy.push(getKeyFromLine(thisLine));
    }

    return hierarchy;
}

function filterMap(map, toRemove) {
    var newMap = map;
    for (var key in toRemove) {
        if (toRemove.hasOwnProperty(key) && map.hasOwnProperty(key)) {
            if (newMap == map) {
                newMap = $.extend({}, map);
            }
            delete newMap[key];
        }
    }
    return newMap;
}

function removeSuffix(text, suffix) {
    if (suffix && text.endsWith(suffix)) {
        text = text.substring(0, text.length - suffix.length);
    }
    return text;
}

function addSuffix(text, suffix) {
    if (suffix && !text.endsWith(suffix)) {
        text = text + suffix;
    }
    return text;
}

function isInList(pos, indent, cm, tabSizeInSpaces) {
    if (pos.ch < indent) indent = pos.ch;
    var currentLine = pos.line;
    while (currentLine > 0) {
        var thisLine = cm.getLine(currentLine);
        var trimmed = thisLine.trim();
        if (trimmed.startsWith('-')) return true;
        var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        var thisIndent = getIndentation(thisLine, tabSizeInSpaces);

        if (!isEmpty && thisIndent < indent) break;
        if (thisIndent < indent) break;
        currentLine--;
    }
    return false;
}

function getCurrentClass(pos, indent, cm, tabSizeInSpaces, suffix) {
    var siblings = getSiblings(pos, indent, cm, tabSizeInSpaces);
    var currentClass = null;
    if (siblings.hasOwnProperty("class")) {
        currentClass = siblings['class'];
        currentClass = addSuffix(currentClass, suffix);
    }
    return currentClass;
}

function renderHint(element, pos, hint) {
    var titleCell = $('<td>').text(hint.text);
    if (hint.inherited) {
        titleCell.addClass('inheritedProperty');
    }
    if (hint.isDefault) {
        titleCell.addClass('defaultProperty');
    }
    $(element).append(titleCell);
    var description = $('<div>');
    if (hint.description != null && hint.description.length > 0) {
        for (var i = 0; i < hint.description.length; i++) {
            if (i != 0) {
                description.append($('<br/>'));
            }
            description.append($('<span>').html(hint.description[i]));
        }
    }
    $(element).append($('<td>').append(description));
}

function RGBToHSV(hex) {
    // Remove quotes
    hex = hex.substring(1, hex.length - 1);

    // Get the RGB values to calculate the Hue.
    var r = parseInt(hex.substring(0,2),16)/255;
    var g = parseInt(hex.substring(2,4),16)/255;
    var b = parseInt(hex.substring(4,6),16)/255;

    // Getting the Max and Min values for Chroma.
    var max = Math.max.apply(Math, [r,g,b]);
    var min = Math.min.apply(Math, [r,g,b]);

    // Variables for HSV value of hex color.
    var chr = max-min;
    var hue = 0;
    var val = max;
    var sat = 0;

    if (val > 0) {
        // Calculate Saturation only if Value isn't 0.
        sat = chr/val;
        if (sat > 0) {
            if (r == max) {
                hue = 60*(((g-min)-(b-min))/chr);
                if (hue < 0) {hue += 360;}
            } else if (g == max) {
                hue = 120+60*(((b-min)-(r-min))/chr);
            } else if (b == max) {
                hue = 240+60*(((r-min)-(g-min))/chr);
            }
        }
    }

    return [hue, sat, val];
}

function convertHint(text, value, metadata, classType, valueType, inherited, defaultValue) {
    var description = null;
    var importance = 0;
    if (classType && metadata && value && metadata[classType].hasOwnProperty(value)) {
        var dataType = metadata[classType][value];
        description = dataType['description'];
        importance = dataType['importance'];
    } else {
        description = value == null ? null : [value]
    }

    if (importance == 0 && valueType == 'color') {
        importance = RGBToHSV(text)[0];
    }

    var hint = {
        text: text,
        description: description,
        render: renderHint,
        importance: importance,
        inherited: inherited,
        isDefault: defaultValue
    };
    return hint;
}

function trimTags(description) {
    if (description == null) return description;
    var index = description.lastIndexOf('>');
    if (index > 0 && index < description.length - 1) {
        description = description.substring(index + 1);
    }

    return description;
}

function getSorted(values, inheritedValues, defaultValue, word, suffix, metadata, classType, valueType) {
    var includeContains = true;
    switch (valueType) {
        case 'milliseconds':
        case 'percentage':
            includeContains = false;
            break;
        case 'integer':
            includeContains = false;
            values = $.extend({}, values);
            if (defaultValue != null) {
                addMultiples(defaultValue, values, 0);
            }
            if (word != '') {
                values[word] = null;
                addPowersOfTen(parseInt(word), values);
            }
            break;
        case 'double':
            includeContains = false;
            values = $.extend({}, values);
            if (defaultValue != null) {
                addMultiples(defaultValue, values, 5);
            }
            if (word != '') {
                values[word] = null;
                addPowersOfTen(parseInt(word), values);
            }
            break;
    }

    var startsWith = [];
    var contains = [];
    var foundDefault = false;
    for (var kw in values) {
        var isDefault = defaultValue == kw;
        var description = values[kw];
        var trimmedDescription = trimTags(description);
        var match = kw + trimmedDescription;
        if (isDefault) foundDefault = true;
        if (match.indexOf(word) !== -1) {
            var hint = convertHint(kw + suffix, description, metadata, classType, valueType, false, isDefault);
            if (match.startsWith(word)) {
                startsWith.push(hint);
            } else {
                contains.push(hint);
            }
        }
    }
    if (inheritedValues != null) {
        for (var kw in inheritedValues) {
            var isDefault = defaultValue == kw;
            var description = inheritedValues[kw];
            var trimmedDescription = trimTags(description);
            var match = kw + trimmedDescription;
            if (isDefault) foundDefault = true;
            if (match.indexOf(word) !== -1) {
                var hint = convertHint(kw + suffix, description, metadata, classType, valueType, true, isDefault);
                if (match.startsWith(word)) {
                    startsWith.push(hint);
                } else {
                    contains.push(hint);
                }
            }
        }
    }

    if (defaultValue != null && !foundDefault && defaultValue.indexOf(word) !== -1) {
        if (defaultValue.startsWith(word)) {
            startsWith.push(convertHint(defaultValue + suffix, null, metadata, classType, valueType, false, true));
        } else {
            contains.push(convertHint(defaultValue + suffix, null, metadata, classType, valueType, false, true));
        }
    }

    function sortProperties(a, b) {
        if (a == word) {
            return -1;
        }
        if (b == word) {
            return 1;
        }
        if (a.isDefault && !b.isDefault) {
            return -1;
        }
        if (!a.isDefault && b.isDefault) {
            return 1;
        }
        if (a.inherited && !b.inherited) {
            return 1;
        }
        if (!a.inherited && b.inherited) {
            return -1;
        }
        if (a.importance == b.importance) {
            return a.text.localeCompare(b.text);
        }
        return b.importance - a.importance;
    }
    startsWith.sort(sortProperties);
    contains.sort(sortProperties);
    if (includeContains) {
        startsWith = startsWith.concat(contains);;
    }
    return startsWith;
}

function addMultiples(value, values, decimalLimit) {
    if (!$.isNumeric(value)) return;
    values[value * 2] = null;
    values[value * 10] = null;
    var lessValue = value;
    while (decimalLimit >= 0) {
        lessValue /= 2;
        values[Math.floor(lessValue)] = null;
        if (lessValue < 1) decimalLimit--;
    }
    lessValue = value;
    while (decimalLimit >= 0) {
        lessValue /= 10;
        values[Math.floor(lessValue)] = null;
        if (lessValue < 1) decimalLimit--;
    }
}

function addPowersOfTen(value, values) {
    if (!$.isNumeric(value)) return;
    for (var i = 0; i < 3; i++) {
        value *= 10;
        values[value] = null;
    }
}

function makeList(properties, thisLine) {
    var prefix = "- ";
    if (thisLine != null) {
        var trimmed = thisLine.trim();
        if (trimmed.startsWith('-')) {
            if (!thisLine.endsWith(' ')) {
                prefix = " ";
            } else {
                return properties;
            }
        }
    }
    var list = properties;
    properties = {};
    for (var key in list) {
        if (list.hasOwnProperty(key)) {
            properties[prefix + key] = list[key];
        }
    }
    return properties;
}

function checkList(properties, pos, indent, cm, tabSizeInSpaces) {
    if (!isInList(pos, indent, cm, tabSizeInSpaces)) {
        properties = makeList(properties, null);
    }

    return properties
}

function checkForListProperty(metadata, valueType, values) {
    valueType = metadata.types[valueType];
    var listValueType = null;
    if (valueType.class_name == 'java.util.List') {
        listValueType = valueType.value_type;
    } else if (valueType.hasOwnProperty("alternate_class_name") && valueType.alternate_class_name == 'java.util.List') {
        listValueType = valueType.key_type;
    }
    if (listValueType != null) {
        values = metadata.types[listValueType].options;
    }
    return values;
}

function checkForMapProperty(pos, indent, cm, tabSizeInSpaces, thisLine, metadata, properties, suffix) {
    var inMap = false;
    var parent = getParent(pos, indent, cm, tabSizeInSpaces);
    if (metadata.properties.hasOwnProperty(parent)) {
        var parentType = metadata.properties[parent].type;
        parentType = metadata.types[parentType];
        if (parentType.class_name == "java.util.List") {
            var valueType = metadata.types[parentType.value_type];
            properties = valueType.options;
            suffix = '';
        } else if (parentType.class_name == "java.util.Map" && parentType.hasOwnProperty("key_type")) {
            if (parentType.hasOwnProperty("alternate_class_name")
                && parentType.alternate_class_name == "java.util.List"
                && isInList(pos, indent, cm, tabSizeInSpaces) )
            {
                var valueType = metadata.types[parentType.key_type];
                properties = valueType.options;
                suffix = '';
            } else {
                inMap = true;
                var valueType = metadata.types[parentType.key_type];
                properties = valueType.options;
            }
        }
    }

    if (!inMap) {
        properties = makeList(properties, thisLine);
    }

    return {properties: properties, suffix: suffix};
}