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
    this.parent = null;
    this.hierarchy = null;
    this.metadata = null;
    this.navigationPanel = null;

    this.register = function(editor) {
        let cm = editor.getCodeMirror();
        CodeMirror.registerHelper('hint', 'yaml', this.generateHints.bind(this));
        CodeMirror.commands.magicNewlineAndIndent = this.newlineAndIndent.bind(this);
        CodeMirror.keyMap['basic']['Enter'] = 'magicNewlineAndIndent';
        cm.on('change', function onChange(editor, input) {
            if (input.from.line != input.to.line) return;
            let line = cm.getLine(input.from.line);
            if (line.indexOf(':') > 0 && !line.endsWith(' ')) return;
            if (line.trim().startsWith('-') && !line.endsWith(' ')) return;
            CodeMirror.commands.autocomplete(cm, null, {
                // closeOnUnfocus: false,
                completeSingle: false
            });
        });
    };

    this.initialize = function(cm) {
        if (cm) {
            if (cm.metadata == null) {
                alert("Sorry, failed to load metadata- the editor will not work!");
                return;
            }
            this.cm = cm;
        }
        if (this.cm == null) return;
        this.metadata = this.cm.metadata;
        this.cursor = this.cm.getCursor();
        this.hierarchy = this.getHierarchy();
        this.parent = this.hierarchy.length > 1 ? this.hierarchy[this.hierarchy.length - 2] : null;
    };

    this.onPickHint = function(cm, data, completion) {
        let text = completion.text;
        let from = completion.from || data.from;
        let to = completion.to || data.to;
        cm.replaceRange(text, from, to, "complete");
        from.ch += text.length;
        to.ch += text.length;
        this.initialize(cm);
        if (this.context != null) {
            if (this.context.isList || this.context.isMap || this.context.isListStart || this.context.isListItem) {
                let indent = this.context.indent;
                let prefix = '';
                if (!this.context.isListItem) {
                    indent += 2;
                    prefix = ':';
                }
                indent = " ".repeat(indent);
                if (!this.context.isMap) {
                    indent = indent + '- ';
                }
                cm.replaceRange(prefix + '\n' + indent, from, to, "complete");
            } else if (this.context.value == '') {
                cm.replaceRange(': ', from, to, "complete");
            }
            cm.execCommand("autocomplete");
        }
    };

    this.newlineAndIndent = function(cm) {
        this.initialize(cm);
        if (cm.getOption("disableInput")) return CodeMirror.Pass;
        let hierarchy = this.hierarchy;
        let parent = null;
        if (hierarchy.length > 1) {
            parent = hierarchy[hierarchy.length - 1];
        }
        let parentIsList = parent != null && parent.isList && parent.value == '';
        if (this.context.isSectionStart || (parent != null && parent.isMap) || parentIsList) {
            let indent = this.context.indent;
            let nextLine = this.getNextLine(this.context.lineNumber);
            if (nextLine && nextLine.indent > indent) {
                indent = nextLine.indent;
            } else {
                indent += 2;
            }
            let replacement = " ".repeat(indent);
            if (parentIsList) {
                replacement += "- ";
            }
            cm.replaceSelections(["\n" + replacement]);
            cm.execCommand("autocomplete");
            return;
        }
        cm.execCommand("newlineAndIndent");
        return;
    };

    this.generateHints = function(cm) {
        this.initialize(cm);

        // No hints for first line
        if (this.cursor.line == 0) return;

        // Or for comments
        if (this.context.isComment) return;

        // Get hierarchy
        let hierarchy = this.hierarchy;
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

        if (hierarchy.length < 2) {
            return;
        }
        let parent = hierarchy[hierarchy.length - 2];
        if (!parent.hasOwnProperty('properties')) {
            return;
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

        // Don't suggest creating mis-aligned lists or maps
        if (parent.isSectionStart && this.context.indent > parent.indent) {
            let firstChild = this.getFirstChild(parent);
            if (firstChild && firstChild.indent != this.context.indent) {
                return;
            }
        }

        // Determine if we are populating keys or values
        if (this.LEAF_KV.test(this.context.trimmed)) {
            let fieldName = hierarchy[hierarchy.length - 1].token;
            valueType = this.getPropertyType(parent, fieldName);
            if (valueType) {
                values = valueType.options;
            }
        } else {
            classType = 'properties';
            values = parent.properties;

            // Add in parameters from actions (or other things, maybe, in the future, but probably not)
            if (parent.hasOwnProperty('populatedProperties')) {
                // Style base properties as inherited
                inherited = values;
                values = parent.populatedProperties;
            } else if (parent.isMap) {
                let keyType = parent.type.key_type;
                if (this.metadata.types.hasOwnProperty(keyType)) {
                    keyType = this.metadata.types[keyType];
                    values = keyType.options;
                }
            } else if (parent.isList) {
                let valueType = parent.type.value_type;
                if (this.metadata.types.hasOwnProperty(valueType)) {
                    valueType = this.metadata.types[valueType];
                    values = valueType.options;
                }
            }
        }

        // Filter out duplicate map suggestions
        if (!this.context.isListItem) {
            let siblings = this.getSiblings(this.context);
            values = filterMap(values, siblings);
            if (inherited != null) {
                inherited = filterMap(inherited, siblings);
            }
        }

        // Filter and sort list, adding suggestions based on class type
        let result = this.getSorted(values, inherited, defaultValue, currentToken.word, this.metadata, classType, valueType);

        // Generate suggestions
        let suggestion = false;
        let hintCompleteCallback = this.onPickHint.bind(this);
        for (let key in result) {
            if (result.hasOwnProperty(key)) {
                if (result[key].text != currentToken.word) {
                    suggestion = true;
                }
                result[key].hint = hintCompleteCallback;
            }
        }
        if (suggestion) {
            let suggest = {
                list: result,
                from: CodeMirror.Pos(this.cursor.line, currentToken.start),
                to: CodeMirror.Pos(this.cursor.line, currentToken.end)
            };
            return suggest;
        }
    };

    this.getMappedClass = function(classType, key) {
        if (!this.metadata.classed.hasOwnProperty(classType)) {
            return null;
        }
        let classedSection = this.metadata.classed[classType];

        // TODO: Make this fully generic
        if (classType == 'actions') {
            if (!key.endsWith("Action")) {
                key = key + "Action";
            }
        } else if (classType == 'effectlib_effects') {
            if (!key.endsWith("Effect")) {
                key = key + "Effect";
            }
        }

        // Create a map from class names to keys
        if (!this.metadata.hasOwnProperty('mapped_classes')) {
            this.metadata['mapped_classes'] = {};
        }
        if (!this.metadata.mapped_classes.hasOwnProperty(classType)) {
            this.metadata.mapped_classes[classType] = {};
            for (let key in classedSection) {
                if (classedSection.hasOwnProperty(key)) {
                    this.metadata.mapped_classes[classType][classedSection[key]['class_name']] = key;
                }
            }
        }

        // Map class name to key
        if (!this.metadata.mapped_classes[classType].hasOwnProperty(key)) {
            return null;
        }
        key = this.metadata.mapped_classes[classType][key];

        // Look up class parameters
        if (classedSection.hasOwnProperty(key)) {
            let classed = this.metadata.classed[classType][key];

            // Need to map properties here
            if (!classed.hasOwnProperty('properties')) {
                classed.properties = {};
                let properties = this.metadata.properties;
                for (let key in classed.parameters) {
                    if (classed.parameters.hasOwnProperty(key) && properties.hasOwnProperty(key)) {
                        let property = properties[key];
                        if (!property.hasOwnProperty('alias') && property.importance >= 0) {
                            classed.properties[property['field']] = key;
                        }
                    }
                }
            }
            return classed;
        }
        return null;
    };

    this.getSorted = function(values, inheritedValues, defaultValue, word, metadata, classType, valueType) {
        let includeContains = true;
        let suffix = '';
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

    this.getSiblings = function(context) {
        let siblings = {};
        let currentLine = context.lineNumber;
        while (true) {
            let previous = this.getPreviousLine(currentLine);
            if (previous == null) break;
            if (previous.indent < context.indent) break;

            if (previous.indent == context.indent) {
                siblings[previous.token] = previous.value;
            }
            currentLine = previous.lineNumber;
        }
        currentLine = context.lineNumber;
        while (true) {
            let next = this.getNextLine(currentLine);
            if (next == null) break;
            if (next.indent < context.indent) break;

            if (next.indent == context.indent) {
                siblings[next.token] = next.value;
            }
            currentLine = next.lineNumber;
        }
        return siblings;
    };

    this.getProperties = function(propertyType) {
        if (!propertyType.hasOwnProperty('mapped_properties')) {
            let properties = this.metadata.properties;
            let context = {};
            for (let key in propertyType.options) {
                if (propertyType.options.hasOwnProperty(key) && properties.hasOwnProperty(key)) {
                    let property = properties[key];
                    if (!property.hasOwnProperty('alias') && property.importance >= 0) {
                        context[property['field']] = key;
                    }
                }
            }
            propertyType.mapped_properties = context;
        }
        return propertyType.mapped_properties;
    };

    this.getBasePropertyType = function() {
        let contextType = _fileType;
        // Remove the "s", kind of hacky
        contextType = depluralize(contextType);
        contextType = contextType + '_properties';
        if (this.metadata.types.hasOwnProperty(contextType)) {
            return this.metadata.types[contextType];
        }
        return null;
   };

    this.getContext = function(line, lineNumber) {
        let trimmed = line.trimStart();
        let isKey = false;
        let isSectionStart = false;
        let token = line.trim();
        let value = '';
        token = token.replace('- ', '');
        if (token.indexOf(':') >= 0) {
            isKey = true;
            isSectionStart = token.endsWith(':');
            let keyValue = token.split(':');
            token = keyValue[0];
            if (keyValue.length > 1) {
                value = keyValue[1].trim();
            }
        }
        let isListStart = trimmed.startsWith('-');
        let indent = line.length - trimmed.length;
        return {
            token: token,
            value: value,
            line: line,
            lineNumber: lineNumber,
            trimmed: trimmed,
            isComment: trimmed.startsWith('#'),
            isEmpty: trimmed == '',
            isListStart: isListStart,
            isListItem: isListStart,
            isKey: isKey,
            isSectionStart: isSectionStart,
            indent: indent,
            listIndent: isListStart ? indent - 2 : indent
        }
    };

    this.getPropertyType = function(parent, fieldName) {
        let valueType = null;
        if (parent.properties.hasOwnProperty(fieldName)) {
            let propertyKey = parent.properties[fieldName];
            if (this.metadata.properties.hasOwnProperty(propertyKey)) {
                valueType = this.metadata.properties[propertyKey].type;
            }
        }

        // Add in parameter values from actions (or other things, maybe, in the future, but probably not)
        if (!valueType && parent.hasOwnProperty('populatedProperties') && parent.populatedProperties.hasOwnProperty(fieldName)) {
            let propertyKey = parent.populatedProperties[fieldName];
            if (this.metadata.properties.hasOwnProperty(propertyKey)) {
                valueType = this.metadata.properties[propertyKey].type;
            }
        }
        if (!valueType && parent.isMap) {
            valueType = parent.type.value_type;
        }
        if (valueType) {
            if (this.metadata.types.hasOwnProperty(valueType)) {
                let key = valueType;
                valueType = this.metadata.types[valueType];
                valueType.key = key;
            } else {
                valueType = null;
            }
        }
        return valueType;
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

    this.getNextLine = function(lineNumber) {
        let nextLineNumber = lineNumber;
        while (nextLineNumber < this.cm.lineCount() - 1) {
            let testLine = this.cm.getLine(++nextLineNumber);
            let context = this.getContext(testLine, nextLineNumber);
            if (!context.isEmpty && !context.isComment) {
                return context;
            }
        }
        return null;
    };

    this.getFirstChild = function(context) {
        let lineNumber = context.lineNumber;
        while (true) {
            let next = this.getNextLine(lineNumber);
            if (next == null) break;
            if (next.indent > context.indent) return next;
            lineNumber = next.lineNumber;
        }
        return null;
    };

    this.getHierarchy = function() {
        this.context = this.getCurrentContext();
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

        // Walk down the tree to figure out types of everything in the path
        let parent = hierarchy[0];
        parent.type = this.getBasePropertyType();
        parent.properties = this.getProperties(parent.type);
        if (this.metadata['types'].hasOwnProperty(parent.type)) {
            parent.type = this.metadata['types'][parent.type];
        }
        for (let i = 1; i < hierarchy.length; i++) {
            parent = hierarchy[i - 1];
            let current = hierarchy[i];
            let key = current.token;

            // Find type from parent property map
            let propertyType = this.getPropertyType(parent, key);
            if (propertyType) {
                current.type = propertyType;
                current.properties = this.getProperties(propertyType);
                if (current.type.class_name == 'java.util.Map') {
                    current.isMap = true;
                }
                if (current.type.class_name == 'java.util.List') {
                    current.isList = true;
                }
            } else {
                break;
            }

            // See if this inherits properties from a classed set of objects elsewhere in the config
            // The only current use-case for this is spell parameters and the action lists
            if (current.hasOwnProperty('type') && current.type.hasOwnProperty('populate_from')) {
                let populateFrom = current.type.populate_from;
                if (this.metadata.classed.hasOwnProperty(populateFrom)) {
                    let allSections = this.getAllClasses(populateFrom);
                    let populatedProperties = {};
                    for (let i = 0; i < allSections.length; i++) {
                        let section = allSections[i];
                        let classType = this.getMappedClass(populateFrom, section);
                        if (classType != null) {
                            populatedProperties = $.extend(populatedProperties, classType.properties);
                        }
                    }
                    current.populatedProperties = populatedProperties;
                }
            }
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

    this.setNavigationPanel = function(panel) {
        this.navigationPanel = panel;
    };

    this.getAllClasses = function(fromSection) {
        let cm = this.cm;
        let sectionStart = 0;
        let sectionIndent = 0;
        for (let i = 1; i < cm.lineCount(); i++) {
            let line = cm.getLine(i);
            let context = this.getContext(line, i);
            sectionIndent = context.indent;
            if (context.trimmed == fromSection + ":") {
                sectionStart = i;
                break;
            }
        }

        let classes = [];
        let current = sectionStart + 1;
        while (current < cm.lineCount()) {
            let line = cm.getLine(current);
            let context = this.getContext(line, current);
            let indent = context.indent;
            if (indent <= sectionIndent) break;
            line = line.replace("-", "").trim();
            if (line.startsWith("class:")) {
                let sectionClass = line.replace("class: ", "");
                classes.push(sectionClass);
            }
            current++;
        }

        return classes;
    };
}