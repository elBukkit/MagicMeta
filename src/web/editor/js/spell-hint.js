
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

    var WHITESPACE = /\s+/;
    var WORD = /\w+/;
    var OBJECT_KEY = /^\s*?(\w+)\s*?:\s*?$/;
    var LEAF_KV = /^\s*?(\w+)\s*?:\s*?/;
    var WORD_OR_COLON = /\w+|:/;

    function addUnique(kw, result) {
        // add if not already in result set
        if (!kw || result.indexOf(kw) !== -1) {
            return;
        }
        result.push(kw);
    }

    function rstrip(line) {
        return line.replace(/\s*$/g, '');
    }

    function getIndentation(line, tabSizeInSpaces) {
        if (!line.match(/^\s*?$/)) {
            // only strip if line isn't all whitespace
            line = rstrip(line);
        }

        // walk left from right until whitespace or eol
        var s = line.length;
        while (s && WORD_OR_COLON.test(line.charAt(s - 1))) --s;
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

    function walkUp(pos, indent, cm, tabSizeInSpaces) {
        pos.line --;
        var thisLine = cm.getLine(pos.line);
        var trimmed = thisLine.trim();
        var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        while (pos.line > 0 && (!OBJECT_KEY.test(thisLine) || getIndentation(thisLine, tabSizeInSpaces) >= indent || isEmpty)) {
            // while this isn't the line we're looking for, move along
            pos.line --;
            thisLine = cm.getLine(pos.line);
            trimmed = thisLine.trim();
            isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        }
        pos.ch = cm.getLine(pos.line);
        return pos;
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
            pos = walkUp(pos, thisIndentation, cm, tabSizeInSpaces);
            thisLine = cm.getLine(pos.line);
            thisIndentation = getIndentation(thisLine, tabSizeInSpaces);
        }

        if (!isHighestContext || isIndentedBlock) {
            // is an indented block, add the above level's key
            hierarchy.push(getKeyFromLine(thisLine));
        }

        return hierarchy;
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
        if (LEAF_KV.test(curLine)) {
            // if we'e on a line with a key get values for that key
            var values = [];

            var valueKeywords = values.concat(values);
            for (var c in valueKeywords) {
                var kw = valueKeywords[c];
                if (kw.indexOf(word) !== -1) {
                    addUnique(kw, result);
                }
            }
        } else {
            // else, do suggestions for new property keys
            var properties = [];
            if (hierarchy.length == 2 && hierarchy[1] == '') {
                // Add base parameters
                properties = metadata.spell_context.properties;
            }

            for (var i in properties) {
                var kw = properties[i];
                if (kw.indexOf(word) !== -1) {
                    addUnique(kw + ": ", result);
                }
            }
        }

        if (result.length) {
            return {
                list: result,
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            };
        }
    });
});