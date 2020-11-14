
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
        if (!LEAF_KV.test(curLine)) {
            // else, do suggestions for new property keys
            var inherited = null;
            var suffix = '';
            var properties = metadata.types.material.options;
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