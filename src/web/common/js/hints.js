function Hints(fileType) {
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
    this.fileType = fileType;

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
        if (this.cm == null) return false;
        this.metadata = this.cm.metadata;
        this.cursor = this.cm.getCursor();
        if (this.metadata == null) return false;
        this.hierarchy = this.getHierarchy();
        this.parent = this.hierarchy.length > 1 ? this.hierarchy[this.hierarchy.length - 2] : null;
        return true;
    };

    this.onPickHint = function(cm, data, completion) {
        let text = completion.text;
        let from = completion.from || data.from;
        let to = completion.to || data.to;

        // First determine if this is a list item that we need to fix up
        if (!this.initialize(cm)) return;
        if (this.metadata == null) return;
        // There is a hacky check here for "additional" picks, which at this point always means choosing a key
        // value of a parent's map, when we are in a maybe-list.
        if (this.context != null && this.context.value == '' && !this.context.isListItem && this.parent != null && !completion.additional) {
            let isInList = false;
            if (this.parent.isList) {
                isInList = true;
            } else if (this.parent.isObject || this.parent.isMap) {
                // Objects and maps inside of lists will have an anonymous parent, so the first
                // line of their properties needs to act like the first list item
                // Avoid this if this is not the first line, though, in which case the
                // parent will be a list item
                if (!this.parent.isListItem && this.parent.parent != null && this.parent.parent.isList) {
                    isInList  = true;
                }
            }
            if (isInList) {
                let length = from.ch - to.ch;
                if (this.parent.isListItem) {
                    from.ch = this.parent.indent;
                } else {
                    let existingItem = this.getNextLine(this.parent.lineNumber);
                    if (existingItem != null && existingItem.lineNumber == this.context.lineNumber) {
                        existingItem = this.getNextLine(this.context.lineNumber);
                    }
                    if (existingItem != null && existingItem.indent >= this.parent.indent) {
                        from.ch = existingItem.indent;
                    } else {
                        from.ch = this.parent.indent + 2;
                    }
                }
                cm.replaceRange('- ', from, to, "complete");
                from.ch += 2;
                to.ch = from.ch;
            }
        }

        // Now do initial replacement and rebuild hierarchy for further checks
        cm.replaceRange(text, from, to, "complete");
        this.initialize(cm);
        if (this.context != null && this.context.value == '') {
            from.ch += text.length;
            to.ch += text.length;

            // Check to see if this is the start of a new key
            // If that is the case we are going to add a colon suffix and go to the next line
            let inObject = this.parent != null && this.parent.isObject;
            if (this.context.isList || this.context.isMap || this.context.isObject) {
                cm.replaceRange(':', from, to, "complete");
                cm.execCommand('magicNewlineAndIndent');
            } else if (this.context.value == '' && (!this.context.isListItem || inObject)) {
                // If this is a key, just put a colon after
                cm.replaceRange(': ', from, to, "complete");
            }
            cm.execCommand("autocomplete");
        }
    };

    this.newlineAndIndent = function(cm) {
        if (!this.initialize(cm)) return CodeMirror.Pass;
        if (this.metadata == null) return CodeMirror.Pass;
        if (cm.getOption("disableInput")) return CodeMirror.Pass;
        let current = this.context;
        if (current.isComment || current.isEmpty) return CodeMirror.Pass;
        let parent = this.parent;

        // Special behavior for pressing enter after a main config key, we'll almost always want to indent
        if (parent == null) {
            // Make sure we're really at the first line
            let previousLine = this.getPreviousLine(current.lineNumber);
            if (previousLine == null) {
                // Find a good indent
                let nextLine = this.getNextLine(current.lineNumber);
                let indent = current.indent + 2;
                if (nextLine != null) {
                    indent = nextLine.indent;
                }
                let replacement = " ".repeat(indent);
                cm.replaceSelections(["\n" + replacement]);
                cm.execCommand("autocomplete");
                return;
            }
        }

        let parentIsList = this.isList(parent);
        let currentIsList = this.isList(current);
        let parentIsObject = parent != null && (parent.isObject || parent.isMap);
        let currentIsObject = current.isMap || current.isObject;

        // See if the next line is a list item
        let addListItem = false;
        if (parentIsList && current.isListItem) {
            addListItem = true;
        } else if (currentIsList && current.isSectionStart) {
            addListItem = true;
        }

        if (addListItem) {
            let indent = current.indent;

            // if we were already on a list item, add another one at that same indent
            if (!current.isListItem) {
                // otherwise this should be the list parent, so indent twice
                indent += 2;
                // unless there's already a list item we're inserting in front of ..
                let nextLine = this.getNextLine(current.lineNumber);
                if (nextLine.isListItem && nextLine.listIndent > parent.listIndent) {
                    indent = nextLine.indent;
                }
            }
            let replacement = " ".repeat(indent) + "- ";
            cm.replaceSelections(["\n" + replacement]);
            cm.execCommand("autocomplete");
            return;
        }

        // See if we need a new sub-key of a map or object)
        if (currentIsObject && current.isSectionStart) {
            let nextLine = this.getNextLine(current.lineNumber);
            let indent = current.listIndent + 2;
            if (nextLine != null && nextLine.indent >= indent) {
                indent = nextLine.indent;
            }
            let replacement = " ".repeat(indent);
            cm.replaceSelections(["\n" + replacement]);
            cm.execCommand("autocomplete");
            return;
        }

        // If the parent is an object, we want to indent to match any existing keys
        if (parentIsObject) {
            let nextLine = this.getNextLine(parent.lineNumber);
            if (nextLine.lineNumber == current.lineNumber) {
                nextLine = this.getNextLine(current.lineNumber);
            }
            let indent = parent.indent + 2;
            if (nextLine != null && nextLine.listIndent >= indent) {
                indent = nextLine.listIndent;
            }
            let replacement = " ".repeat(indent);
            cm.replaceSelections(["\n" + replacement]);
            cm.execCommand("autocomplete");
            return;
        }
        cm.execCommand("newlineAndIndent");
    };

    this.onCursorActivity = function(cm) {
        if (!this.initialize(cm)) return;
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
            if (this.context.isComment) {
                path.append(this.context.token);
                this.navigationPanel.empty();
                this.navigationPanel.append(path);
                return;
            }
            if (this.fileType) {
                path.append($('<span>').text(this.fileType));
                if (hierarchy.length > 0) {
                    path.append($('<span>').addClass('delimiter').text(' / '));
                }
            }
            for (let i = 0; i < hierarchy.length; i++) {
                let token = hierarchy[i].display;
                if (hierarchy[i].isListItem) {
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
        if (!this.initialize(cm)) return;

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
                if (this.context.isList || this.context.isAlternateList) {
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
            let classType = 'properties';
            let values = parent.properties;
            let inherited = parent.inherited;
            let additional = null;
            let additionalClassType = null;

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

                // This is a special check for a list being at the same indent as its key, in which
                // case we have another option, adding more keys from the parent of the list
                if (this.context.indent == this.parent.indent && this.parent.parent != null) {
                    // This really only happens with action handlers, so this is not as generic as it could be
                    if (this.parent.parent.isMap) {
                        let keyType = parent.parent.type.key_type;
                        if (this.metadata.types.hasOwnProperty(keyType)) {
                            keyType = this.metadata.types[keyType];
                            if (keyType.hasOwnProperty('parameters')) {
                                additional = this.getProperties(keyType);
                            } else {
                                additionalClassType = '';
                                additional = keyType.options;
                            }
                        }
                    }
                }
            }

            // Filter out duplicate list and map suggestions
            let siblings = this.getSiblings(this.context);
            values = filterMap(values, siblings);
            if (inherited != null) {
                inherited = filterMap(inherited, siblings);
            }
            if (additional != null) {
                additional = filterMap(additional, siblings);
            }
            // Filter and sort list, adding suggestions based on class type
            suggestions = this.getSortedKeys(values, inherited, additional, null, currentToken.word, this.metadata, classType, additionalClassType, null);
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
        let foundDefault = true;this.matchProperties(values, defaultValue, currentInput, 'properties', valueType, false, false, startsWith, contains);

        if (defaultValue != null && !foundDefault) {
            this.checkMatch(defaultValue, '', currentInput, 'properties', valueType, false, false, true, startsWith, contains);
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

    this.checkMatch = function(value, description, currentInput, classType, valueType, inherited, additional, isDefault, startsWith, contains) {
        let trimmedDescription = trimTags(description);
        let match = value + trimmedDescription;
        match = match.toLowerCase();
        currentInput = currentInput.toLowerCase();
        if (match.indexOf(currentInput) !== -1) {
            let hint = this.convertHint(value, description, this.metadata, classType, valueType, inherited, additional, isDefault);
            if (match.startsWith(currentInput)) {
                startsWith.push(hint);
            } else {
                contains.push(hint);
            }
        }
    };

    // Returns true if the default value was found
    this.matchProperties = function(values, defaultValue, currentInput, classType, valueType, inherited, additional, startsWith, contains) {
        let foundDefault = false;
        for (let kw in values) {
            let isDefault = defaultValue == kw;
            let description = values[kw];
            if (isDefault) foundDefault = true;
            this.checkMatch(kw, description, currentInput, classType, valueType, inherited, additional, isDefault, startsWith, contains);
        }
        return foundDefault;
    };

    this.getSortedKeys = function(values, inheritedValues, additionalValues, defaultValue, currentInput, metadata, classType, additionalClassType, valueType) {
        let startsWith = [];
        let contains = [];
        additionalClassType = additionalClassType == null ? classType : additionalClassType;
        this.matchProperties(values, defaultValue, currentInput, classType, valueType, false, false, startsWith, contains);
        if (inheritedValues != null) {
            this.matchProperties(inheritedValues, defaultValue, currentInput, classType, valueType, true, false, startsWith, contains);
        }
        if (additionalValues != null) {
            this.matchProperties(additionalValues, defaultValue, currentInput, additionalClassType, valueType, false, true, startsWith, contains);
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

    this.convertHint = function(text, value, metadata, classType, valueType, inherited, additional, defaultValue) {
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
            additional: additional,
            isDefault: defaultValue
        };
        return hint;
    };

    this.getChildren = function(context) {
        let children = {};
        let firstLine = this.getNextLine(context.lineNumber);
        if (firstLine == null || firstLine.indent <= context.indent) return children;
        children[firstLine.token] = firstLine.value;
        let nextLine = this.getNextLine(firstLine);
        while (nextLine != null && nextLine.indent >= firstLine.indent) {
            if (nextLine.indent == firstLine.indent) {
                children[nextLine.token] = nextLine.value;
            }
            nextLine = this.getNextLine(nextLine);
        }
        return children;
    };

    this.getSiblings = function(context) {
        let siblings = {};
        let currentLine = context.lineNumber;
        let current = context;
        let parent = context.parent;
        let isInList = parent != null && parent.isList && current.isListItem;

        // Don't use list indent if we are in a list
        // This helps align object properties in lists with the first item in the list
        // And also helps align new list items which don't have a manual - in front, this will
        // be added when the hint is picked.
        let indentType = isInList ? 'indent' : 'listIndent';
        while (true) {
            let previous = this.getPreviousLine(currentLine);
            if (previous == null) break;
            if (previous.listIndent < context.listIndent) break;
            // Don't move across lists
            if (previous[indentType] < context[indentType]) break;
            if (context.isListItem && !previous.isListItem) break;
            // Ok if this might be a new key that is a sibling with a list, but not ok
            // if this is a sub-key of an object in a list
            if (current.isListItem && !previous.isListItem && previous.indent > context.indent) break;

            // Objects in lists look for key siblings, not list item siblings
            if (context.isObject && current.isListItem) break;
            if (parent != null && parent.isObject && current.isListItem) break;

            if (previous[indentType] == context[indentType]) {
                siblings[previous.token] = previous.value;
            }
            currentLine = previous.lineNumber;
            current = previous;
        }
        currentLine = context.lineNumber;
        while (true) {
            let next = this.getNextLine(currentLine);
            if (next == null) break;
            if (parent != null && parent.isObject && next.isListItem) break;
            if (next.indent < context.indent) break;
            if (next.isListItem && next.value != '') break;

            // Objects in lists look for key siblings, not list item siblings
            if (context.isObject) {
                if (!current.isListItem && next.isListItem) break;
            } else {
                if (context.isListItem && !next.isListItem) break;
            }

            if (next[indentType] == context[indentType]) {
                siblings[next.token] = next.value;
            }
            currentLine = next.lineNumber;
            current = next;
        }

        // Yet another special case here, if we're adding a new item at the same level as the parent indent,
        // and this is an object and the parent is a list, then we may consider siblings as object keys
        // or as items in the parent list.
        if (context.parent != null && context.parent.indent == context.indent && context.parent.isList && context.isObject) {
            siblings = $.extend(siblings, this.getSiblings(context.parent));
            siblings[context.parent.token] = '';
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
        let contextType = this.fileType;
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
        let indent = line.length - trimmed.length;
        let isKey = false;
        let isSectionStart = false;
        let token = trimmed;
        let isListItem = token.startsWith('-');
        if (isListItem) {
            token = token.substring(1).trimLeft();
        }
        let listIndent = line.length - token.length;
        token = token.trimRight();
        let value = '';
        if (token.indexOf(':') >= 0) {
            isKey = true;
            isSectionStart = token.endsWith(':');
            let keyValue = token.split(':');
            token = keyValue[0];
            if (keyValue.length > 1) {
                value = keyValue[1].trim();
            }
        }
        return {
            token: token,
            display: token,
            value: value,
            line: line,
            lineNumber: lineNumber,
            trimmed: trimmed,
            isComment: trimmed.startsWith('#'),
            isEmpty: trimmed == '',
            isListItem: isListItem,
            isKey: isKey,
            isSectionStart: isSectionStart,
            indent: indent,
            listIndent: listIndent
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

        if (!valueType && parent.inherited && parent.inherited.hasOwnProperty(fieldName)) {
            let propertyKey = parent.inherited[fieldName];
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
            valueType = parent.type.item_type;
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
        let nextLine = this.getNextLine(context);
        return nextLine != null && nextLine.listIndent > context.listIndent ? nextLine : null;
    };

    this.getHierarchy = function() {
        this.context = this.getCurrentContext();
        let hierarchy = [this.context];
        let currentLine = this.context;
        let previousLine = this.getPreviousLine(this.context.lineNumber);
        let isInList = currentLine.isListItem;
        let listIndent = currentLine.indent;
        let lookForInlineList = true;
        while (previousLine != null) {
            // Check indent
            let isNewParent = false;
            if (previousLine.listIndent < currentLine.listIndent) {
                isNewParent = true;
            } else if (previousLine.indent == listIndent && isInList && !previousLine.isListItem) {
                isNewParent = true;
            }

            if (isNewParent) {
                hierarchy.unshift(previousLine);
                currentLine = previousLine;
                isInList = currentLine.isListItem;
                listIndent = currentLine.indent;
                lookForInlineList = false;
            }
            if (!isInList && previousLine.isListItem && lookForInlineList) {
                isInList = true;
                listIndent = previousLine.indent;
            }

            // Go to previous step
            previousLine = this.getPreviousLine(previousLine.lineNumber);
        }

        // Walk down the tree to figure out types of everything in the path
        let parent = hierarchy[0];
        this.setContextType(parent, this.getBasePropertyType());
        for (let i = 1; i < hierarchy.length; i++) {
            parent = hierarchy[i - 1];
            let current = hierarchy[i];
            let key = current.token;

            // Object properties in lists have anonymous parents to represent the object itself
            if (parent.isList && parent.type.hasOwnProperty('item_type')) {
                let itemType = parent.type.item_type;
                if (this.metadata.types.hasOwnProperty(itemType)) {
                    itemType = this.metadata.types[itemType];
                    if (itemType.class_name == 'org.bukkit.configuration.ConfigurationSection' || itemType.class_name == 'java.util.Map') {
                        let objectWrapper = current;
                        while (!objectWrapper.isListItem && objectWrapper.lineNumber > 0 && objectWrapper.listIndent >= current.listIndent) {
                            objectWrapper = this.getPreviousLine(objectWrapper.lineNumber);
                        }

                        // Skip this if it doesn't align, this helps the pick function align it and listify if needed,
                        // since it is getting the hierarchy in a potentially intermediate state
                        if (objectWrapper.indent < current.indent - 1 || objectWrapper.lineNumber == current.lineNumber) {
                            objectWrapper = this.getContext(objectWrapper.line, objectWrapper.lineNumber);
                            objectWrapper.isObject = true;
                            // Force using anonymous display
                            objectWrapper.display = '';
                            this.setContextType(objectWrapper, itemType, parent);
                            parent = objectWrapper;
                            hierarchy.splice(i, 0, objectWrapper);
                            i++;
                        }
                    }
                }
            }

            // Find type from parent property map
            let propertyType = this.getPropertyType(parent, key);
            if (propertyType) {
                this.setContextType(current, propertyType, parent);
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

    this.setContextType = function(context, type, parent) {
        if (parent) {
            context.parent = parent;
        }
        if (type == null) {
            context.properties = {};
            return;
        }
        context.type = type;
        context.inherited = null;
        context.properties = this.getProperties(type);
        if (type.classed) {
            let classType = this.getCurrentClass(context);
            if (classType != null && this.metadata.classed.hasOwnProperty(type.classed)) {
                context.classed_class = classType;
                classType = this.getMappedClass(type.classed, classType);
                if (classType != null) {
                    context.inherited = context.properties;
                    context.properties = $.extend({}, classType.properties);
                    if (classType.hasOwnProperty('category') && classType.category == 'compound') {
                        let compoundType = this.metadata.types['compound_action_parameters'];
                        context.properties = $.extend(context.properties, this.getProperties(compoundType));
                    }
                }
            }
        }

        // Change navbar to use class type if available
        if (context.hasOwnProperty('classed_class')) {
            if (context.display != '') {
                context.display += ":";
            }
            context.display += context.classed_class;
        } else if (context.display == '') {
            context.display = '...';
        }

        // Set some flags based on type
        if (context.type.class_name == 'java.util.Map') {
            context.isMap = true;
        }
        if (context.type.class_name == 'org.bukkit.configuration.ConfigurationSection') {
            context.isObject = true;
        }
        if (context.type.class_name == 'java.util.List') {
            context.isList = true;
        } else if (context.type.hasOwnProperty("alternate_class_name") && context.type.alternate_class_name == 'java.util.List') {
            context.isAlternateList = true;
        }
    };

    this.getCurrentClass = function(context) {
        let currentClass = null;
        if (context.token == 'class') {
            currentClass = context.value;
        } else if (context.isListItem) {
            let siblings = this.getSiblings(context);
            if (siblings.hasOwnProperty("class")) {
                currentClass = siblings['class'];
            }
        } else {
            let children = this.getChildren(context);
            if (children.hasOwnProperty("class")) {
                currentClass = children['class'];
            }
        }
        return currentClass;
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

    this.isList = function(context) {
        if (!context) return false;
        let isList = context.isList;
        // Types can be both lists and maps, but we will only consider this one a list if
        // it already has list items
        if (context.isMap || context.isObject) {
            isList = false;
            let nextLine = this.getNextLine(context);
            if (nextLine != null && nextLine.listIndent > context.indent && nextLine.isListItem) {
                isList = true;
            }
        }
        return isList;
    };
}