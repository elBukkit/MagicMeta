
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
// Modified from:
// https://github.com/Wiredcraft/cm-yaml-autocomplete/blob/develop/lib/yaml-hint.js

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"), require("../../mode/css/css"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror", "../../mode/css/css"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.registerHelper('hint', 'yaml', function(cm, opts) {
        if (cm.metadata == null) {
            return;
        }
        var metadata = cm.metadata;var cur = cm.getCursor(),
            curLine = cm.getLine(cur.line),
            token = cm.getTokenAt(cur);

        if (curLine.trim().startsWith("#")) return;

        var start = token.end,
            end = token.end;

        // walk `start` back until whitespace char or end of line
        while (start && WORD.test(curLine.charAt(start - 1))) --start;
        // walk `end` forwards until non-word or end of line
        while (end < curLine.length && WORD.test(curLine.charAt(end))) ++end;

        var word = curLine.slice(start, end);
        var result = [];

        // get context of hierarchy
        var hierarchy = getHierarchy(CodeMirror.Pos(cur.line, cur.ch), cm).reverse();
        if (cm.debug) console.log(hierarchy);
        var pos = CodeMirror.Pos(cur.line, cur.ch);
        var thisLine = cm.getLine(pos.line);
        var indent = getIndentation(thisLine);
        indent = Math.min(indent, cur.ch);
        if (LEAF_KV.test(curLine)) {
            // if we'e on a line with a key get values for that key
            var values = {};
            var classType = '';
            var valueType = null;
            var defaultValue = null;
            var fieldName = hierarchy[hierarchy.length - 1];
            if (hierarchy.length == 2) {
                // Base property values
                if (metadata.context.class_properties.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.context.class_properties[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = metadata.properties[propertyKey].type;
                        values = metadata.types[valueType].options;

                        if (values == null || values.length == 0) {
                            values = checkForListProperty(metadata, valueType, values);
                        }
                    }
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects' && fieldName == 'class') {
                // Effectlib classes
                values = metadata.context.effectlib_classes;
                classType = 'effectlib_effects';
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects') {
                // Effect parameter values
                if (metadata.context.effect_parameters.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.context.effect_parameters[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = metadata.properties[propertyKey].type;
                        values = metadata.types[valueType].options;
                    }
                }
            }
            result = getSorted(values, null, defaultValue, word, '', metadata, classType, valueType);
        } else {
            // else, do suggestions for new property keys
            var properties = {};
            var inherited = null;
            var suffix = ': ';
            if (isMisalignedListItem(pos, indent, cm)) {
                // Nothing
            } else if (hierarchy.length == 2 && hierarchy[1] == '') {
                // Add base parameters
                properties = metadata.context.class_properties;
            } else if (hierarchy.length == 4 && hierarchy[3] == '' && hierarchy[1] == 'effects') {
                // Base effect parameters
                properties = metadata.context.effect_parameters;

                // Check if this is at the same indent level as a list, if so add - to suggestions
                var previousSibling = getPreviousSibling(pos, indent, cm);
                if (previousSibling != null && previousSibling.startsWith('-')) {
                    properties = makeList(properties, thisLine);
                } else {
                    properties = checkList(properties, pos, indent, cm);
                }
            } else if (hierarchy.length >= 5 && hierarchy[hierarchy.length - 1] == '' && hierarchy[3] == 'effectlib') {
                // Effectlib parameters
                inherited = metadata.context.effectlib_parameters;
                var effectClass = getCurrentClass(pos, indent, cm, "Effect");
                if (effectClass != null) {
                    if (metadata.context.effects.hasOwnProperty(effectClass)) {
                        properties = metadata.context.effects[effectClass];
                    }
                }
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'effects') {
                // Effect triggers
                properties = {
                    'randomize': 'randomize_effect_list', 'replace': 'replace_effect_list',
                    'spell_blocked': 'spell_blocked_effect_list', 'spell_reflected': 'spell_reflected_effect_list',
                    'cycle': 'cycle_effect_list', 'open': 'open_effect_list', 'close': 'close_effect_list',
                    'deactivate': 'deactivate_effect_list', 'activate': 'activate_effect_list'
                };

                var parent = getParent(pos, indent, cm);
                if (parent != "effects") {
                    properties['- location'] = "Add a new effect to this list";
                }
            } else {
                inherited = [];
                var mapResults = checkForMapProperty(pos, indent, cm, thisLine, metadata, properties, suffix);
                properties = mapResults.properties;
                suffix = mapResults.suffix;
            }
            var siblings = getSiblings(pos, indent, cm);
            properties = filterMap(properties, siblings);
            if (inherited != null) {
                inherited = filterMap(inherited, siblings);
            }
            result = getSorted(properties, inherited, null, word, suffix, metadata, 'properties', null);
        }

        var suggestion = false;
        for (var key in result) {
            if (result.hasOwnProperty(key) && result[key].text != word) {
                suggestion = true;
                break;
            }
        }
        if (suggestion) {
            return {
                list: result,
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            };
        }
    });
});