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

    this.register = function() {
        CodeMirror.registerHelper('hint', 'yaml', this.generateHints.bind(this));
        CodeMirror.commands.magicNewlineAndIndent = this.newlineAndIndent.bind(this);
        CodeMirror.keyMap['basic']['Enter'] = 'magicNewlineAndIndent';
    };

    this.initialize = function(cm) {
        if (cm.metadata == null) {
            alert("Sorry, failed to load metadata- the editor will not work!");
            return;
        }
        this.cm = cm;
        this.metadata = cm.metadata;
        this.cursor = cm.getCursor();
    };

    this.newlineAndIndent = function(cm) {
        this.initialize(cm);
        if (cm.getOption("disableInput")) return CodeMirror.Pass;
        let context = this.getCurrentContext();
        if (context.isSectionStart) {
            let indent = context.indent;
            let nextLine = this.getNextLine(context.lineNumber);
            if (nextLine && nextLine.indent > indent) {
                indent = nextLine.indent;
            }
            let replacement = " ".repeat(indent);
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
        let prefix = '';
        let suffix = '';

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
            if (parent.properties.hasOwnProperty(fieldName)) {
                let propertyKey = parent.properties[fieldName];
                if (this.metadata.properties.hasOwnProperty(propertyKey)) {
                    valueType = this.metadata.properties[propertyKey].type;
                    values = this.metadata.types[valueType].options;
                }
            }
        } else {
            suffix = ': ';
            classType = 'properties';
            values = parent.properties;

            // Check for some special cases that will include options based on other sections
            if (parent.hasOwnProperty('type') && parent.type.hasOwnProperty('populate_from')) {
                let populateFrom = parent.type.populate_from;
                let allSections = this.getAllClasses(populateFrom);
                if (this.metadata.classed.hasOwnProperty(populateFrom)) {
                    for (let i = 0; i < allSections.length; i++) {
                        let section = allSections[i];
                        let classType = this.getMappedClass(populateFrom, section);
                        if (classType != null) {
                            inherited = values;
                            values = $.extend(values, classType.properties);
                        }
                    }
                }
            }

            // If we just started a new map, indent the suggestions
            let previousLine = this.getPreviousLine(this.context.lineNumber);
            if (parent.lineNumber == previousLine.lineNumber) {
                let nextLine = this.getNextLine(this.context.lineNumber);
                // Use indentation from next line if it is a child
                if (nextLine.indent > parent.indent) {

                } else {
                    prefix = '  ';
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
        let result = this.getSorted(values, inherited, defaultValue, currentToken.word, prefix, suffix, this.metadata, classType, valueType);

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

    this.getSorted = function(values, inheritedValues, defaultValue, word, prefix, suffix, metadata, classType, valueType) {
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
                let hint = this.convertHint(prefix + kw + suffix, description, metadata, classType, valueType, false, isDefault);
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
                    let hint = this.convertHint(prefix + kw + suffix, description, metadata, classType, valueType, true, isDefault);
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
                startsWith.push(convertHint(prefix + defaultValue + suffix, null, metadata, classType, valueType, false, true));
            } else {
                contains.push(convertHint(prefix + defaultValue + suffix, null, metadata, classType, valueType, false, true));
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

    this.getProperties = function(typeName) {
        if (!this.metadata.hasOwnProperty('mapped_properties')) {
            this.metadata['mapped_properties'] = {};
        }
        if (!this.metadata.mapped_properties.hasOwnProperty(typeName)) {
            let properties = this.metadata.properties;
            let context = {};
            if (this.metadata.types.hasOwnProperty(typeName)) {
                let type = this.metadata.types[typeName];
                for (let key in type.options) {
                    if (type.options.hasOwnProperty(key) && properties.hasOwnProperty(key)) {
                        let property = properties[key];
                        if (!property.hasOwnProperty('alias') && property.importance >= 0) {
                            context[property['field']] = key;
                        }
                    }
                }
            }
            this.metadata.mapped_properties[typeName] = context;
        }
        return this.metadata.mapped_properties[typeName];
    };

    this.getBasePropertyKey = function() {
        let contextType = _fileType;
        // Remove the "s", kind of hacky
        contextType = depluralize(contextType);
        return contextType + '_properties';
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
                value = keyValue[1];
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
        parent.type = this.getBasePropertyKey();
        parent.properties = this.getProperties(parent.type);
        for (let i = 1; i < hierarchy.length; i++) {
            let key = hierarchy[i].token;
            if (parent.properties.hasOwnProperty(key)) {
                let property = parent.properties[key];
                if (this.metadata.properties.hasOwnProperty(property)) {
                    let typeKey = this.metadata.properties[property].type;
                    hierarchy[i].type = this.metadata['types'][typeKey];
                    hierarchy[i].properties = this.getProperties(typeKey);
                }
            } else {
                break;
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