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
        cm.on('cursorActivity', this.onCursorActivity.bind(this));
    };

    this.initialize = function(cm) {
        if (cm) {
            this.cm = cm;
        }
        if (this.cm == null) return;
        this.metadata = this.cm.metadata;
        this.cursor = this.cm.getCursor();
        if (this.metadata == null) return;
        this.hierarchy = this.getHierarchy();
        this.parent = this.hierarchy.length > 1 ? this.hierarchy[this.hierarchy.length - 2] : null;
    };

    this.onPickHint = function(cm, data, completion) {
        let text = completion.text;
        let from = completion.from || data.from;
        let fromChar = from.ch;
        let to = completion.to || data.to;
        let toChar = to.ch;
        cm.replaceRange(text, from, to, "complete");
        this.initialize(cm);
        if (this.metadata == null) return;
        if (this.context != null && this.context.value == '') {
            // Check to see if this should start a new list
            if (this.parent != null && !this.context.isListStart && this.parent.isList) {
                from.ch -= 2;
                cm.replaceRange('- ', from, to, "complete");
            }

            from.ch = fromChar + text.length;
            to.ch = toChar + text.length;

            // Check to see if this is the start of a new key
            // If that is the case we are going to add a colon suffix and go to the next line
            if (this.context.isList || this.context.isMap) {
                let prefix = '';
                let indent = this.context.indent;
                if (!this.context.isListItem) {
                    indent += 2;
                    prefix = ':';
                }
                indent = " ".repeat(indent);
                if (!this.context.isMap) {
                    // Start a new list item in this list
                    indent = indent + '- ';
                }
                cm.replaceRange(prefix + '\n' + indent, from, to, "complete");
            } else if (this.context.value == '' && !this.context.isListItem) {
                // If this is a key, just put a colon after
                cm.replaceRange(': ', from, to, "complete");
            }
            cm.execCommand("autocomplete");
        }
    };

    this.newlineAndIndent = function(cm) {
        this.initialize(cm);
        if (this.metadata == null) return;
        if (cm.getOption("disableInput")) return CodeMirror.Pass;
        let hierarchy = this.hierarchy;
        let parent = null;
        if (hierarchy.length > 1) {
            parent = hierarchy[hierarchy.length - 1];
        }
        let parentIsList = parent != null && parent.isList && parent.value == '';
        if (!parentIsList && !parent.isMap && parent.isListStart) {
            parentIsList = true;
        }
        let parentIsMap = parent != null && parent.isMap;
        if (this.context.isSectionStart || parentIsMap || parentIsList) {
            let indent = this.context.indent;
            let nextLine = this.getNextLine(this.context.lineNumber);
            if (nextLine && nextLine.indent >= indent) {
                indent = nextLine.indent;
            } else if (!parent.isListStart) {
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

    this.onCursorActivity = function(cm) {
        this.initialize(cm);
        if (this.cursor == null || this.metadata == null) return;
        let hierarchy = this.hierarchy;

        // Update navigation bar
        if (this.navigationPanel) {
            let lineNumber = this.cursor.line + 1;
            let chNumber = this.cursor.ch + 1;
            let path = $('<div>');
            path.append($('<span>').addClass("cursorLocation")
                .append($('<span>').addClass('delimiter').text('('))
                .append($('<span>').text(lineNumber))
                .append($('<span>').addClass('delimiter').text(','))
                .append($('<span>').text(chNumber))
                .append($('<span>').addClass('delimiter').text(')'))
            );
            if (_fileType) {
                path.append($('<span>').text(_fileType));
                if (hierarchy.length > 0) {
                    path.append($('<span>').addClass('delimiter').text(' / '));
                }
            }
            for (let i = 0; i < hierarchy.length; i++) {
                let token = hierarchy[i].token;
                if (hierarchy[i].isListStart) {
                    token = "[" + token + "]";
                }
                let title = '';
                if (hierarchy[i].hasOwnProperty('type')) {
                    let type = hierarchy[i].type;
                    title = type.name;
                    if (type.description.length > 0) {
                        title = title + ": " + type.description;
                    }
                }
                path.append($('<span>').prop('title', title).text(token));
                if (i < hierarchy.length - 1) {
                    path.append($('<span>').addClass('delimiter').text(' . '));
                }
            }
            this.navigationPanel.empty();
            this.navigationPanel.append(path);
        }
    };

    this.generateHints = function(cm) {
        this.initialize(cm);

        // No hints for first line
        if (this.cursor.line == 0) return;

        // Or for comments
        if (this.context.isComment) return;

        // Don't show hints for the first line
        let hierarchy = this.hierarchy;
        if (hierarchy.length < 2) {
            return;
        }

        // We won't be able to identify this if we haven't identified the parent
        let parent = this.parent;
        if (!parent.hasOwnProperty('properties')) {
            return;
        }

        // Don't suggest creating mis-aligned lists or maps
        if (parent.isSectionStart && this.context.indent > parent.indent) {
            let firstChild = this.getFirstChild(parent);
            if (firstChild && firstChild.indent != this.context.indent) {
                return;
            }
        }

        // Get the current parsed token
        let currentToken = this.getCurrentToken();

        // Determine the list of options to show
        let suggestions = null;

        // Determine if we are populating keys or values
        if (this.LEAF_KV.test(this.context.trimmed)) {
            let fieldName = hierarchy[hierarchy.length - 1].token;
            let defaultValue = null;
            let valueType = this.getPropertyType(parent, fieldName);
            if (valueType) {
                let values = valueType.options;

                // We assume most lists in magic can also be expressed as a single string
                if (this.context.isList) {
                    let itemType = this.context.type.item_type;
                    if (this.metadata.types.hasOwnProperty(itemType)) {
                        valueType = this.metadata.types[itemType];
                        values = $.extend({}, values);
                        values = $.extend(values, valueType.options);
                    }
                }

                // Filter and sort list, adding suggestions based on value type
                suggestions = this.getSortedValues(values, defaultValue, currentToken.word, valueType.key);
            }
        } else {
            let inherited = null;
            let classType = 'properties';
            let values = parent.properties;

            // Add in parameters from actions (or other things, maybe, in the future, but probably not)
            if (parent.hasOwnProperty('populatedProperties')) {
                // Style base properties as inherited
                inherited = values;
                values = parent.populatedProperties;
            } else if (parent.isMap) {
                let keyType = parent.type.key_type;
                if (this.metadata.types.hasOwnProperty(keyType)) {
                    keyType = this.metadata.types[keyType];
                    if (keyType.hasOwnProperty('parameters')) {
                        values = this.getProperties(keyType);
                    } else {
                        classType = '';
                        values = keyType.options;
                    }
                }
            } else if (parent.isList) {
                let valueType = parent.type.item_type;
                if (this.metadata.types.hasOwnProperty(valueType)) {
                    valueType = this.metadata.types[valueType];
                    if (valueType.hasOwnProperty('parameters')) {
                        values = this.getProperties(valueType);
                    } else {
                        classType = '';
                        values = valueType.options;
                    }
                }
            }

            // Filter out duplicate list and map suggestions
            let siblings = this.getSiblings(this.context);
            values = filterMap(values, siblings);
            if (inherited != null) {
                inherited = filterMap(inherited, siblings);
            }

            // Filter and sort list, adding suggestions based on class type
            suggestions = this.getSortedKeys(values, inherited, null, currentToken.word, this.metadata, classType, null);
        }

        // If we didn't find any suggestions, just return
        if (suggestions == null) {
            return null;
        }

        // Generate suggestions
        let suggestion = false;
        let hintCompleteCallback = this.onPickHint.bind(this);
        for (let key in suggestions) {
            if (suggestions.hasOwnProperty(key)) {
                // Don't show hints unless we have something that's not what they've already typed
                if (suggestions[key].text != currentToken.word) {
                    suggestion = true;
                }
                suggestions[key].hint = hintCompleteCallback;
            }
        }
        if (suggestion) {
            let suggest = {
                list: suggestions,
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

    this.getSortedValues = function(values, defaultValue, currentInput, valueType) {
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
                if (currentInput != '') {
                    values[currentInput] = null;
                    addPowersOfTen(parseInt(currentInput), values);
                }
                break;
            case 'double':
                includeContains = false;
                values = $.extend({}, values);
                if (defaultValue != null) {
                    addMultiples(defaultValue, values, 5);
                }
                if (currentInput != '') {
                    values[currentInput] = null;
                    addPowersOfTen(parseInt(currentInput), values);
                }
                break;
        }

        let startsWith = [];
        let contains = [];
        let foundDefault = true;this.matchProperties(values, defaultValue, currentInput, 'properties', valueType, false, startsWith, contains);

        if (defaultValue != null && !foundDefault) {
            this.checkMatch(defaultValue, '', currentInput, 'properties', valueType, false, true, startsWith, contains);
        }
        this.sortProperties(startsWith);
        this.sortProperties(contains);
        if (includeContains) {
            startsWith = startsWith.concat(contains);;
        }
        return startsWith;
    };

    this.sortProperties = function(properties, currentInput) {
        function sortProperties(a, b) {
            if (a == currentInput) {
                return -1;
            }
            if (b == currentInput) {
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
        properties.sort(sortProperties);
    };

    this.checkMatch = function(value, description, currentInput, classType, valueType, inherited, isDefault, startsWith, contains) {
        let trimmedDescription = trimTags(description);
        let match = value + trimmedDescription;
        if (match.indexOf(currentInput) !== -1) {
            let hint = this.convertHint(value, description, this.metadata, classType, valueType, inherited, isDefault);
            if (match.startsWith(currentInput)) {
                startsWith.push(hint);
            } else {
                contains.push(hint);
            }
        }
    };

    // Returns true if the default value was found
    this.matchProperties = function(values, defaultValue, currentInput, classType, valueType, inherited, startsWith, contains) {
        let foundDefault = false;
        for (let kw in values) {
            let isDefault = defaultValue == kw;
            let description = values[kw];
            if (isDefault) foundDefault = true;
            this.checkMatch(kw, description, currentInput, classType, valueType, inherited, isDefault, startsWith, contains);
        }
        return foundDefault;
    };

    this.getSortedKeys = function(values, inheritedValues, defaultValue, currentInput, metadata, classType, valueType) {
        let startsWith = [];
        let contains = [];
        this.matchProperties(values, defaultValue, currentInput, classType, valueType, false, startsWith, contains);
        if (inheritedValues != null) {
            this.matchProperties(inheritedValues, defaultValue, currentInput, classType, valueType, true, startsWith, contains);
        }
        this.sortProperties(startsWith);
        this.sortProperties(contains);
        startsWith = startsWith.concat(contains);
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
            if (context.isListStart) break;

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
            if (context.isListStart && next.isListStart) break;

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
            if (propertyType.hasOwnProperty('parameters')) {
                for (let key in propertyType.parameters) {
                    if (propertyType.parameters.hasOwnProperty(key) && properties.hasOwnProperty(key)) {
                        let property = properties[key];
                        if (!property.hasOwnProperty('alias') && property.importance >= 0) {
                            context[property['field']] = key;
                        }
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
            // This is where the key/value starts, should be two spaces after "-" in a list
            listIndent: isListStart ? indent + 2 : indent
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
            if (fieldName == '') {
                valueType = parent.type.key_type;
            } else {
                valueType = parent.type.value_type;
            }
        }
        if (!valueType && parent.isList) {
            let itemType = parent.type.item_type;
            if (this.metadata.types.hasOwnProperty(itemType)) {
                itemType = this.metadata.types[itemType];
                let itemProperties = this.getProperties(itemType);
                if (itemProperties.hasOwnProperty(fieldName)) {
                    let propertyKey = itemProperties[fieldName];
                    if (this.metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = this.metadata.properties[propertyKey].type;
                    }
                }
            }
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
            current.parent = parent;
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
                } else if (current.type.hasOwnProperty("alternate_class_name") && current.type.alternate_class_name == 'java.util.List') {
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