function CodeEditor(container)
{
    this.editor = CodeMirror.fromTextArea(container.get(0), {
        mode: 'yaml',
        styleActiveLine: true,
        lineNumbers: true,
        showTrailingSpace: true,
        foldGutter: true,
        lint: true,
        gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        extraKeys: {
            "Ctrl-S": function() { editor.save(); },
            "Cmd-S": function() { editor.save(); },
            'Shift-Tab': 'indentLess',
            'Tab': 'indentMore',
            "Ctrl-Space": "autocomplete"
        }
    });
    this.editor.metadata = null;
};

CodeEditor.prototype.setValue = function(yaml)
{
    this.editor.setValue(yaml);
};

CodeEditor.prototype.getValue = function()
{
    return this.editor.getValue();
};

CodeEditor.prototype.setMetadata = function(meta)
{
    this.editor.metadata = meta;
};

CodeEditor.prototype.isValid = function() {
    var errors = CodeMirror.lint.yaml(this.getValue());
    return errors.length == 0;
};

CodeEditor.prototype.undo = function()
{
    return this.editor.undo();
};

