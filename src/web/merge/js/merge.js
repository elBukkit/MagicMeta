
var _resourcePacks = [null, null];
var _log = null;
var _merging = 0;

function initialize() {
    $('#rpInput1').change(readRP1);
    $('#rpInput2').change(readRP2);
    _log = $('#logOutput');
}

function log(message) {
    _log.append($('<div>').html(message));
}

function readRP1() {
    readRP($(this), 1);
}

function readRP2() {
    readRP($(this), 2);
}

function readRP(fileInput, number) {
    let reader = new FileReader();
    $(reader).load(function(e) {
        readRPFile(e.target.result, number);
    });
    reader.readAsArrayBuffer(fileInput.get(0).files[0]);
}

function readRPFile(fileInput, number) {
    let zip = new JSZip();
    zip.loadAsync(fileInput)
    .then(function(zip) {
        _resourcePacks[number - 1] = zip;
        if (_resourcePacks[0] != null && _resourcePacks[1] != null) {
            mergeRPs(_resourcePacks[0], _resourcePacks[1]);
        }
    });
}

function loadRP2File(rp1File, rp2File, result, relativePath, fileName) {
    rp2File.async('string').then(function success(content) {
        rp2File.content = content;
        mergeFiles(rp1File, rp2File, result, relativePath, fileName);
    }, function error(e) {
        log("Error loading RP2: " + rp2File.name);
    });
}

function mergeFiles(rp1File, rp2File, result, relativePath, fileName) {
    _merging--;

    // So, apparently, people put empty json files in their resource packs for some reason.
    let rp1Parsed = {};
    if (rp1File.content != '') {
        try {
            rp1Parsed = JSON.parse(rp1File.content);
        } catch (error) {
            log("Error reading file from RP1: " + rp1File.name);
            return;
        }
    }
    let rp2Parsed = {};
    if (rp2File.content != '') {
        try {
            rp2Parsed = JSON.parse(rp2File.content);
        } catch (error) {
            log("Error reading file from RP2 " + rp2File.name);
            return;
        }
    }

    if (fileName == 'assets/minecraft/sounds.json') {
        for (let key in rp2Parsed) {
            if (rp2Parsed.hasOwnProperty(key) && !rp1Parsed.hasOwnProperty(key)) {
                rp1Parsed[key] = rp2Parsed[key];
            }
        }
        let resultFile = JSON.stringify(rp1Parsed, null, 2);
        result.file(relativePath, resultFile);
        checkFinish(result);
        return;
    }

    if (rp2Parsed.hasOwnProperty('overrides')) {
        if (rp1Parsed.hasOwnProperty('overrides')) {
            let overrides1 = rp1Parsed['overrides'];
            let overrides2 = rp2Parsed['overrides'];
            let customModelData1 = {};
            let damage1 = {};
            for (let i = 0; i < overrides1.length; i++) {
                let override1 = overrides1[i];
                if (override1.hasOwnProperty('predicate')) {
                    let predicate1 = override1['predicate'];
                    if (predicate1.hasOwnProperty('custom_model_data')) {
                        customModelData1[predicate1['custom_model_data']] = true;
                    } else if (predicate1.hasOwnProperty('damage')) {
                        damage1[predicate1['damage']] = true;
                    }
                }
            }
            for (let i = 0; i < overrides2.length; i++) {
                let override2 = overrides2[i];
                if (override2.hasOwnProperty('predicate')) {
                    let predicate2 = override2['predicate'];
                    if (predicate2.hasOwnProperty('custom_model_data')) {
                        if (customModelData1.hasOwnProperty(predicate2['custom_model_data'])) {
                            log("File has same custom model data in both files, second RP will be skipped: " + rp1File.name + "{CustomModelData:" + predicate2['custom_model_data'] + "}");
                        } else {
                            overrides1.push(override2);
                        }
                    } else if (predicate2.hasOwnProperty('damage')) {
                        if (customModelData1.hasOwnProperty(predicate2['damage'])) {
                            log("File has same damage predicate in both files, second RP will be skipped: " + rp1File.name + ":" + predicate2['damage']);
                        } else {
                            overrides1.push(override2);
                        }
                    }
                }
            }

            overrides1.sort(function(a, b) {
                if (a.hasOwnProperty('predicate')) {
                    if (!b.hasOwnProperty(('predicate'))) return -1;
                    let ap = a.predicate;
                    let bp = b.predicate;
                    if (ap.hasOwnProperty('custom_model_data')) {
                        if (!bp.hasOwnProperty('custom_model_data')) return -1;
                        return ap.custom_model_data < bp.custom_model_data ? -1 :
                            (ap.custom_model_data > bp.custom_model_data ? 1 : 0);
                    }
                    if (ap.hasOwnProperty('damaged')) {
                        if (!bp.hasOwnProperty('damaged')) return -1;
                        return ap.damaged < bp.damaged ? -1 :
                            (ap.damaged > bp.damaged ? 1 : 0);
                    }
                    if (bp.hasOwnProperty('damaged')) {
                        return 1;
                    }
                    if (ap.hasOwnProperty('damage')) {
                        if (!bp.hasOwnProperty('damage')) return -1;
                        return ap.damage < bp.damage ? -1 :
                            (ap.damage > bp.damage ? 1 : 0);
                    }
                    if (bp.hasOwnProperty('damage') || bp.hasOwnProperty('custom_model_data')) {
                        return 1;
                    }
                    return 0;
                }
                if (b.hasOwnProperty('predicate')) return 1;
                return 0;
            });
        } else {
            rp1Parsed['overrides'] = rp2Parsed['overrides'];
        }
        let resultFile = JSON.stringify(rp1Parsed, null, 2);
        result.file(relativePath, resultFile);
    }

    checkFinish(result);
}

function mergeRPs(rp1, rp2) {
    _log.empty();
    let result = new JSZip();
    let outputFolders = {};
    rp1.forEach(function (relativePath, rp1File){
        if (rp1File.dir) {
            outputFolders[relativePath] = true;
            result.folder(relativePath);
        } else {
            let rp2File = rp2.file(rp1File.name);
            if (rp2File != null) {
                if (rp2File.name.endsWith(".json")) {
                    _merging++;
                    rp1File.async('string').then(function success(content) {
                        rp1File.content = content;
                        loadRP2File(rp1File, rp2File, result, relativePath, rp1File.name);
                    }, function error(e) {
                        log("Error loading RP1: " + rp1File.name);
                    });
                    return;
                } else {
                    log("Non-JSON file exists in both zips, second RP version will be skipped: " + rp1File.name);
                }
            }
            result.file(relativePath, rp1File._data);
        }
    });

    rp2.forEach(function (relativePath, rp2File){
        if (rp2File.dir && !outputFolders.hasOwnProperty(relativePath)) {
            result.folder(relativePath);
        } else {
            let rp1File = rp1.file(rp2File.name);
            if (rp1File == null) {
                result.file(relativePath, rp2File._data);
            }
        }
    });
    checkFinish(result);
}

function checkFinish(result) {
    if (_merging == 0) {
        log("&nbsp;");
        log("Finished merging! You should get a download prompt shortly. Shortly-ish. It might take a while, actually.");
        result.generateAsync({type:"blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }},
            updateCallback)
        .then(function(content) {
            saveAs(content, "merged.zip");
        });
    }
}

function updateCallback(metadata) {
    document.getElementById('progressBar').style.width = (metadata.percent * 2) + 'px';
}

$(document).ready(initialize);