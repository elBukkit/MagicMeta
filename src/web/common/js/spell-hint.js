
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

    function getAllActions(cm, tabSizeInSpaces) {
        var actionsStart = 0;
        var actionsIndent = 0;
        for (var i = 1; i < cm.lineCount(); i++) {
            var line = cm.getLine(i);
            actionsIndent = getIndentation(line, tabSizeInSpaces);
            if (line.trim() == 'actions:') {
                actionsStart = i;
                break;
            }
        }

        var actions = [];
        var current = actionsStart + 1;
        while (current < cm.lineCount()) {
            var line = cm.getLine(current);
            var indent = getIndentation(line, tabSizeInSpaces);
            if (indent <= actionsIndent) break;
            line = line.replace("-", "").trim();
            if (line.startsWith("class:")) {
                var action = line.replace("class: ", "");
                if (!action.endsWith("Action")) {
                    action = action + "Action";
                }
                actions.push(action);
            }
            current++;
        }

        return actions;
    }

    CodeMirror.registerHelper('hint', 'yaml', function(cm, opts) {
        if (cm.metadata == null) {
            return;
        }
        var metadata = cm.metadata;

        var tabSizeInSpaces = new Array(cm.options.tabSize + 1).join(' ');

        var cur = cm.getCursor(),
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
        var hierarchy = getHierarchy(CodeMirror.Pos(cur.line, cur.ch), cm, tabSizeInSpaces).reverse();
        if (cm.debug) console.log(hierarchy);
        var pos = CodeMirror.Pos(cur.line, cur.ch);
        var thisLine = cm.getLine(pos.line);
        var indent = getIndentation(thisLine, tabSizeInSpaces);
        if (LEAF_KV.test(curLine)) {
            // if we'e on a line with a key get values for that key
            var values = {};
            var classType = '';
            var valueType = null;
            var defaultValue = null;
            var fieldName = hierarchy[hierarchy.length - 1];
            if (hierarchy.length == 2) {
                // Base spell property values
                if (metadata.spell_context.properties.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.properties[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = metadata.properties[propertyKey].type;
                        values = metadata.types[valueType].options;
                    }
                }
            } else if (hierarchy.length == 3 && hierarchy[1] == 'parameters') {
                // Base spell parameter values
                if (metadata.spell_context.parameters.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.parameters[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = metadata.properties[propertyKey].type;
                        values = metadata.types[valueType].options;
                    }
                } else {
                    // Action-specific parameter values
                    var actions = getAllActions(cm, tabSizeInSpaces);
                    for (var i = 0; i < actions.length; i++) {
                        var action = actions[i];
                        if (metadata.spell_context.actions.hasOwnProperty(action) && metadata.spell_context.actions[action].hasOwnProperty(fieldName)) {
                            var propertyKey =  metadata.spell_context.actions[action][fieldName];
                            if (metadata.properties.hasOwnProperty(propertyKey)) {
                                valueType = metadata.properties[propertyKey].type;
                                values = metadata.types[valueType].options;
                            }
                        }
                    }
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'actions' && fieldName == 'class') {
                // Action classes
                values = metadata.spell_context.action_classes;
                classType = 'actions';
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects' && fieldName == 'class') {
                // Effectlib classes
                values = metadata.spell_context.effectlib_classes;
                classType = 'effectlib_effects';
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'actions') {
                // Action parameter values
                var propertyKey = null;
                if (metadata.spell_context.action_parameters.hasOwnProperty(fieldName)) {
                    propertyKey = metadata.spell_context.action_parameters[fieldName];
                    if (metadata.action_parameters.hasOwnProperty(propertyKey)) {
                        defaultValue = metadata.action_parameters[propertyKey];
                    }
                }
                var shortClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces);
                if (shortClass != null) {
                    var actionClass = addSuffix(shortClass, "Action");
                    if (propertyKey == null && metadata.spell_context.actions.hasOwnProperty(actionClass)) {
                        propertyKey = metadata.spell_context.actions[actionClass][fieldName];
                    }

                    if (propertyKey != null && metadata.spell_context.action_classes.hasOwnProperty(shortClass)) {
                        var classKey = metadata.spell_context.action_classes[shortClass];
                        if (metadata.actions[classKey].parameters.hasOwnProperty(propertyKey)) {
                            defaultValue = metadata.actions[classKey].parameters[propertyKey];
                        }
                    }
                }
                if (propertyKey != null && metadata.properties.hasOwnProperty(propertyKey)) {
                    valueType = metadata.properties[propertyKey].type;
                    values = metadata.types[valueType].options;
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects' && hierarchy[hierarchy.length - 2] == 'effectlib') {
                // Effectlib parameter values
                var propertyKey = null;
                if (metadata.spell_context.effectlib_parameters.hasOwnProperty(fieldName)) {
                    propertyKey = metadata.spell_context.effectlib_parameters[fieldName];
                    if (metadata.effectlib_parameters.hasOwnProperty(propertyKey)) {
                        defaultValue = metadata.effectlib_parameters[propertyKey];
                    }
                }
                var shortClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces);
                if (shortClass != null) {
                    var effectClass = addSuffix(shortClass, "Effect");
                    if (propertyKey == null && metadata.spell_context.effects.hasOwnProperty(effectClass)) {
                        propertyKey = metadata.spell_context.effects[effectClass][fieldName];
                    }

                    if (propertyKey != null && metadata.spell_context.effectlib_classes.hasOwnProperty(shortClass)) {
                        var classKey = metadata.spell_context.effectlib_classes[shortClass];
                        if (metadata.effectlib_effects[classKey].parameters.hasOwnProperty(propertyKey)) {
                            defaultValue = metadata.effectlib_effects[classKey].parameters[propertyKey];
                        }
                    }
                }
                if (propertyKey != null && metadata.properties.hasOwnProperty(propertyKey)) {
                    valueType = metadata.properties[propertyKey].type;
                    values = metadata.types[valueType].options;
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects') {
                // Effect parameter values
                if (metadata.spell_context.effect_parameters.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.effect_parameters[fieldName];
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
            if (hierarchy.length == 2 && hierarchy[1] == '') {
                // Add base parameters
                properties = metadata.spell_context.properties;
            } else if (hierarchy.length >= 3 && hierarchy[hierarchy.length - 1] == '' && hierarchy[1] == 'parameters') {
                // Add base parameters
                var actions = getAllActions(cm, tabSizeInSpaces);
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];
                    if (metadata.spell_context.actions.hasOwnProperty(action)) {
                        properties = $.extend(properties, metadata.spell_context.actions[action]);
                    }
                }
                if (hierarchy.length == 3) {
                    inherited = metadata.spell_context.parameters;
                } else {
                    // Search for map property
                    for (var field in properties) {
                        if (properties.hasOwnProperty(field) && field == hierarchy[hierarchy.length - 2]) {
                            var propertyKey = properties[field];
                            var propertyType = metadata.properties[propertyKey].type;
                            propertyType = metadata.types[propertyType];
                            if (propertyType.hasOwnProperty('key_type')) {
                                propertyType = metadata.types[propertyType.key_type];
                                properties = propertyType.options;
                            } else if (propertyType.hasOwnProperty('value_type')) {
                                propertyType = metadata.types[propertyType.value_type];
                                properties = propertyType.options;
                                properties = checkList(properties, pos, indent, cm, tabSizeInSpaces);
                                suffix = '';
                            }
                        }
                    }
                }
            } else if (hierarchy.length == 4 && hierarchy[3] == '' && hierarchy[1] == 'effects') {
                // Base effect parameters
                properties = metadata.spell_context.effect_parameters;

                // Check if this is at the same indent level as a list, if so add - to suggestions
                var previousSibling = getPreviousSibling(pos, indent, cm, tabSizeInSpaces);
                if (previousSibling != null && previousSibling.startsWith('-')) {
                    properties = makeList(properties, thisLine);
                } else {
                    properties = checkList(properties, pos, indent, cm, tabSizeInSpaces);
                }
            } else if (hierarchy.length >= 5 && hierarchy[hierarchy.length - 1] == '' && hierarchy[3] == 'effectlib') {
                // Effectlib parameters
                inherited = metadata.spell_context.effectlib_parameters;
                var effectClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces, "Effect");
                if (effectClass != null) {
                    if (metadata.spell_context.effects.hasOwnProperty(effectClass)) {
                        properties = metadata.spell_context.effects[effectClass];
                    }
                }
            } else if (hierarchy.length >= 4 && hierarchy[hierarchy.length - 1] == '' && hierarchy[1] == 'actions') {
                // Action parameters
                inherited = metadata.spell_context.action_parameters;
                var actionClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces, "Action");
                if (actionClass != null) {
                    if (metadata.spell_context.actions.hasOwnProperty(actionClass)) {
                        properties = metadata.spell_context.actions[actionClass];
                    }

                    inherited = checkList(inherited, pos, indent, cm, tabSizeInSpaces);
                    properties = checkList(properties, pos, indent, cm, tabSizeInSpaces);
                } else {
                    inherited = makeList(inherited, thisLine);
                    properties = makeList(properties, thisLine);
                }
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && (hierarchy[1] == 'costs' || hierarchy[1] == 'active_costs')) {
                // Costs
                properties = metadata.types.cost_type.options;
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'actions') {
                // Action triggers
                properties = {'cast': 'cast_actions', 'alternate_up': 'alternate_up_actions',
                    'alternate_down': 'alternate_down_actions', 'alternate_sneak': 'alternate_sneak_actions'};
                var parent = getParent(pos, indent, cm, tabSizeInSpaces);
                if (parent != "actions") {
                    properties['- class'] = "Add a new action to this list";
                }
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'effects') {
                // Effect triggers
                properties = {'cast': 'cast_effect_list', 'tick': 'tick_effect_list', 'hit': 'hit_effect_list',
                'hit_entity': 'hit_entity_effect_list', 'hit_block': 'hit_block_effect_list',
                'blockmiss': 'blockmiss_effect_list', 'prehit': 'prehit_effect_list',
                'step': 'step_effect_list', 'reflect': 'reflect_effect_list',
                'miss': 'miss_effect_list', 'headshot': 'headshot_effect_list',
                'projectile': 'projectile_effect_list'};

                var parent = getParent(pos, indent, cm, tabSizeInSpaces);
                if (parent != "effects") {
                    properties['- location'] = "Add a new effect to this list";
                }
            }
            var siblings = getSiblings(pos, indent, cm, tabSizeInSpaces);
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