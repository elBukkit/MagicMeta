function Hints() {
    this.WHITESPACE = /\s+/;
    this.WORD = /[\w\.]+/;
    this.OBJECT_KEY = /^[\s-]*?(\w+)\s*?:\s*?$/;
    this.LEAF_KV = /^[\s-]*?(\w+)\s*?:\s*?/;
    this.WORD_OR_COLON = /\w+|:/;
    this.WORD_OR_COLON_OR_DASH = /\-|\w+|:/;

    this.cm = null;
    this.cursor = null;
    this.context = null;
    this.metadata = null;
    this.navigationPanel = null;

    this.setNavigationPanel = function(panel) {
        this.navigationPanel = panel;
    };

    this.getContext = function(line, lineNumber) {
        let trimmed = line.trimStart();
        let token = line.trim();
        let isListStart = trimmed.startsWith('-');
        let isKey = token.endsWith(':');
        let indent = line.length - trimmed.length;
        if (isListStart) {
            token = token.substring(2);
        }
        if (isKey) {
            token = token.substr(0, token.length - 1);
        }
        return {
            token: token,
            line: line,
            lineNumber: lineNumber,
            trimmed: trimmed,
            isComment: trimmed.startsWith('#'),
            isEmpty: trimmed == '',
            isListStart: isListStart,
            isKey: isKey,
            indent: indent,
            listIndent: isListStart ? indent - 2 : indent
        }
    };

    this.getCurrentContext = function() {
        let currentLine = this.cm.getLine(this.cursor.line);
        let context = this.getContext(currentLine, this.cursor.line);
        context.indent = Math.min(context.indent, this.cursor.ch);
        return context;
    };

    this.getPreviousLine = function(lineNumber) {
        let previousLineNumber = lineNumber;
        while (previousLineNumber > 0) {
            let testLine = this.cm.getLine(--previousLineNumber);
            let context = this.getContext(testLine, previousLineNumber);
            if (!context.isEmpty && !context.isComment) {
                return context;
            }
        }
        return null;
    };

    this.getHierarchy = function() {
        let hierarchy = [this.context];
        let currentLine = this.context;
        let previousLine = this.getPreviousLine(this.context.lineNumber);
        while (previousLine != null) {
            // Check indent
            let isNewParent = false;
            if (previousLine.indent < currentLine.indent) {
                isNewParent = true;
            } else if (previousLine.indent == currentLine.indent && currentLine.isListStart && !previousLine.isListStart) {
                isNewParent = true;
            } else if (!currentLine.isListStart && currentLine.listIndent == previousLine.listIndent && previousLine.isListStart) {
                isNewParent = true;
            }

            if (isNewParent) {
                hierarchy.unshift(previousLine);
                currentLine = previousLine;
            }

            // Go to previous step
            previousLine = this.getPreviousLine(previousLine.lineNumber);
        }
        return hierarchy;
    };

    this.getCurrentToken = function() {
        let token = this.cm.getTokenAt(this.cursor);
        let start = token.end;
        let end = token.end;
        let currentLine = this.context.line;

        // walk `start` back until whitespace char or end of line
        while (start && this.WORD.test(currentLine.charAt(start - 1))) --start;
        // walk `end` forwards until non-word or end of line
        while (end < currentLine.length && this.WORD.test(currentLine.charAt(end))) ++end;

        return {
            word: currentLine.slice(start, end),
            token: token,
            start: start,
            end: end
        };
    };

    this.hintHelper = function(cm, opts) {
        if (cm.metadata == null) {
            return;
        }
        this.cm = cm;
        this.metadata = cm.metadata;
        this.cursor = cm.getCursor();

        // No hints for first line
        if (this.cursor.line == 0) return;

        // Or for comments
        this.context = this.getCurrentContext();
        if (this.context.isComment) return;

        // Get hierarchy
        let hierarchy = this.getHierarchy();
        if (this.navigationPanel) {
            let path = '';
            if (_fileType) {
                path = _fileType;
                if (hierarchy.length > 0) {
                    path += '<span class="delimiter"> / </span>';
                }
            }
            for (let i = 0; i < hierarchy.length; i++) {
                let token = hierarchy[i].token;
                if (hierarchy[i].isListStart) {
                    token = "[" + token + "]";
                }
                path += token;
                if (i < hierarchy.length - 1) {
                    path += '<span class="delimiter"> . </span>';
                }
            }
            this.navigationPanel.html(path);
        }

        // Get the current parsed token
        let currentToken = this.getCurrentToken();

        // Determine the list of options to show
        // Optionally provide class types and other information that helps suggestions and sorting
        let values = {};
        let classType = '';
        let valueType = null;
        let defaultValue = null;
        let inherited = null;
        let suffix = '';

        // Determine if we are populating keys or values
        if (this.LEAF_KV.test(this.context.trimmed)) {
            // Look for values to populate
            let fieldName = hierarchy[hierarchy.length - 1].token;
            if (hierarchy.length == 2) {
                // Base spell property values
                if (this.metadata.base_properties.hasOwnProperty(fieldName)) {
                    let propertyKey = this.metadata.base_properties[fieldName];
                    if (this.metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = this.metadata.properties[propertyKey].type;
                        values = this.metadata.types[valueType].options;
                    }
                }
            }
        } else {
            suffix = ': ';
            classType = 'properties';

            // Look for new property keys or list items
            if (hierarchy.length == 2) {
                // Add base properties
                values = this.metadata.base_properties;
            }

            //var siblings = getSiblings(pos, indent, cm);
            //properties = filterMap(properties, siblings);
            //if (inherited != null) {
            //    inherited = filterMap(inherited, siblings);
            //}
        }

        // Filter and sort list, adding suggestions based on class type
        let result = this.getSorted(values, inherited, defaultValue, currentToken.word, suffix, this.metadata, classType, valueType);

        // Generate suggestions
        let suggestion = false;
        for (let key in result) {
            if (result.hasOwnProperty(key) && result[key].text != currentToken.word) {
                suggestion = true;
                break;
            }
        }
        if (suggestion) {
            return {
                list: result,
                from: CodeMirror.Pos(this.cursor.line, currentToken.start),
                to: CodeMirror.Pos(this.cursor.line, currentToken.end)
            };
        }
    };

    this.getSorted = function(values, inheritedValues, defaultValue, word, suffix, metadata, classType, valueType) {
        let includeContains = true;
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

        let startsWith = [];
        let contains = [];
        let foundDefault = false;
        for (let kw in values) {
            let isDefault = defaultValue == kw;
            let description = values[kw];
            let trimmedDescription = trimTags(description);
            let match = kw + trimmedDescription;
            if (isDefault) foundDefault = true;
            if (match.indexOf(word) !== -1) {
                let hint = this.convertHint(kw + suffix, description, metadata, classType, valueType, false, isDefault);
                if (match.startsWith(word)) {
                    startsWith.push(hint);
                } else {
                    contains.push(hint);
                }
            }
        }
        if (inheritedValues != null) {
            for (let kw in inheritedValues) {
                let isDefault = defaultValue == kw;
                let description = inheritedValues[kw];
                let trimmedDescription = trimTags(description);
                let match = kw + trimmedDescription;
                if (isDefault) foundDefault = true;
                if (match.indexOf(word) !== -1) {
                    let hint = this.convertHint(kw + suffix, description, metadata, classType, valueType, true, isDefault);
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
    };
    this.renderHint = function(element, pos, hint) {
        let titleCell = $('<td>').text(hint.text);
        if (hint.inherited) {
            titleCell.addClass('inheritedProperty');
        }
        if (hint.isDefault) {
            titleCell.addClass('defaultProperty');
        }
        $(element).append(titleCell);
        let description = $('<div>');
        if (hint.description != null && hint.description.length > 0) {
            for (var i = 0; i < hint.description.length; i++) {
                if (i != 0) {
                    description.append($('<br/>'));
                }
                description.append($('<span>').html(hint.description[i]));
            }
        }
        $(element).append($('<td>').append(description));
    };

    this.convertHint = function(text, value, metadata, classType, valueType, inherited, defaultValue) {
        let description = null;
        let importance = 0;
        if (classType && metadata && value && metadata[classType].hasOwnProperty(value)) {
            let dataType = metadata[classType][value];
            description = dataType['description'];
            importance = dataType['importance'];
        } else {
            description = value == null ? null : [value]
        }

        if (importance == 0 && valueType == 'color') {
            importance = RGBToHSV(text)[0];
        }

        let hint = {
            text: text,
            description: description,
            render: this.renderHint,
            importance: importance,
            inherited: inherited,
            isDefault: defaultValue
        };
        return hint;
    };
}