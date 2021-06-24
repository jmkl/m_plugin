async function selectLayer(layername) {
    const app = require("photoshop").app;
    await require("photoshop").action.batchPlay(
        [{
            "_obj": "select",
            "_target": [{
                "_ref": "layer",
                "_name": layername
            }],
            "makeVisible": false,

            "_isCommand": true
        }], {
            "synchronousExecution": true,
            "modalBehavior": "fail"
        });
    const doc = app.activeDocument;
    return doc.activeLayers[0];
}

let posy = 0;
async function doInserText(texts) {
    posy = 0;

    for (const text of texts) {
        (async() => {

            await require('photoshop').action.batchPlay([_maketext(text), _rename()], { "synchronousExecution": true });
            //console.log(`making text ${text}`)
            await scaleTextLayer();


        })()
    }


}
let iswidth = false;
async function runcmdFitLayer(forcewidth = false) {
    if (forcewidth)
        iswidth = true
    const app = require('photoshop').app;
    const doc = app.activeDocument;
    const dh = doc.height;
    const dw = doc.width;
    const activeLayer = doc.activeLayers;
    if (activeLayer[0].kind == 1) {
        const { left, top, bottom, right } = activeLayer[0].bounds;
        const imgw = right - left;
        const imgh = bottom - top
            //console.log(iswidth)

        if (iswidth) {
            //activeLayer[0].scale((dw / imgw) * 100, (dw / imgw) * 100)
            require("photoshop").action.batchPlay([_scale((dw / imgw) * 100)], {
                "synchronousExecution": false
            });
            iswidth = false;
        } else {
            require("photoshop").action.batchPlay([_scale((dh / imgh) * 100)], {
                "synchronousExecution": false
            });
            //activeLayer[0].scale((dh / imgh) * 100, (dh / imgh) * 100)
            iswidth = true;
        }
        console.log(activeLayer[0].kind)

    }

}

function _scale(persen) {
    return {
        "_obj": "transform",
        "_target": [{
            "_ref": "layer",
            "_enum": "ordinal",
            "_value": "targetEnum"
        }],
        "freeTransformCenterState": {
            "_enum": "quadCenterState",
            "_value": "QCSAverage"
        },
        "offset": {
            "_obj": "offset",
            "horizontal": {
                "_unit": "pixelsUnit",
                "_value": 0
            },
            "vertical": {
                "_unit": "pixelsUnit",
                "_value": 0
            }
        },
        "width": {
            "_unit": "percentUnit",
            "_value": persen
        },
        "height": {
            "_unit": "percentUnit",
            "_value": persen
        },
        "linked": true,
        "interfaceIconFrameDimmed": {
            "_enum": "interpolationType",
            "_value": "bicubicAutomatic"
        },
        "_isCommand": true
    }
}

function _maketext(theText, mstyle = null) {
    const textstyle = {
        "_obj": "textStyle",
        "styleSheetHasParent": true,
        "fontPostScriptName": "BebasNeuePro-Bold",
        "fontName": "Bebas Neue Pro",
        "fontStyleName": "Bold",
        "fontAvailable": true,
        "tracking": -40,
        "impliedFontSize": {
            "_unit": "pixelsUnit",
            "_value": 120
        },
        "fontCaps": {
            "_enum": "fontCaps",
            "_value": "allCaps"
        },
        "color": {
            "_obj": "RGBColor",
            "red": 255,
            "green": 255,
            "blue": 255
        },
    }
    if (mstyle == null)
        mstyle = textstyle;
    return {
        "_obj": "make",
        "_target": [{
            "_ref": "textLayer"
        }],
        "using": {
            "_obj": "textLayer",
            "name": "dcsmstext",
            "textKey": theText,
            "textStyleRange": [{
                "_obj": "textStyleRange",
                "from": 0,
                "to": theText.length,
                "textStyle": mstyle
            }],
            "_isCommand": true
        }
    }
}

function _rename() {
    return {
        "_obj": "set",
        "_target": [{
            "_ref": "layer",
            "_enum": "ordinal",
            "_value": "targetEnum"
        }],
        "to": {
            "_obj": "layer",
            "name": "dcsmstext"
        },
        "_isCommand": true
    }
}


function _move(id, val) {
    return {
        "_obj": "transform",
        "_target": [{
            "_ref": "layer",
            "_enum": "ordinal",
            "_value": "targetEnum"
        }],
        "freeTransformCenterState": {
            "_enum": "quadCenterState",
            "_value": "QCSAverage"
        },
        "offset": {
            "_obj": "offset",
            "horizontal": {
                "_unit": "pixelsUnit",
                "_value": 0
            },
            "vertical": {
                "_unit": "pixelsUnit",
                "_value": val
            }
        },
        "interfaceIconFrameDimmed": {
            "_enum": "interpolationType",
            "_value": "bilinear"
        },
        "_isCommand": true
    }
}

function _lock(lockme) {
    return {
        "_obj": "applyLocking",
        "_target": [{
            "_ref": "layer",
            "_enum": "ordinal",
            "_value": "targetEnum"
        }],
        "layerLocking": {
            "_obj": "layerLocking",
            "protectAll": lockme
        },
        "_isCommand": true
    }
}

function _get(id) {
    return {
        _obj: 'get',
        _target: { _ref: 'layer', _id: id },
    }
}

function _select(id) {
    return {
        _obj: 'select',
        _target: { _ref: 'layer', _id: id },
    }
}

function _selectname(name) {
    return {
        _obj: 'select',
        _target: { _ref: 'layer', _name: name },
    }
}

const ALIGNME = {
    VER: "ADSCentersV",
    HOR: "ADSCentersH",
    TOP: "ADSTops"
}

function _alignhor(isH = ALIGNME.VER) {
    return {
        "_obj": "align",
        "_target": [{
            "_ref": "layer",
            "_enum": "ordinal",
            "_value": "targetEnum"
        }],
        "using": {
            "_enum": "alignDistributeSelector",
            "_value": isH
        },
        "alignToCanvas": true,
        "_isCommand": true
    }
}

function cekmultilinetext(activeLayer) {
    const batchPlay = require("photoshop").action.batchPlay;
    const result = batchPlay(
        [{
            _obj: "get",
            _target: [{
                _ref: "layer",
                _name: activeLayer.name,
                _id: activeLayer._id,
            }, ],

            _options: {
                dialogOptions: "dontDisplay",
            },
        }, ], {
            synchronousExecution: false,
            modalBehavior: "fail",
        }
    );
    return result;
}

function calculatesizeafter(w, h, percentage) {
    return [(percentage * w) / 100, (percentage * h) / 100]

}

async function scaleTextLayer() {
    const app = require("photoshop").app;
    const maxsize = 180;
    //console.log(`scaling layer`)
    const doc = app.activeDocument;
    const slctdLayer = doc.activeLayers;
    const layer = slctdLayer[0]
    const { left, top, bottom, right } = layer.boundsNoEffects;
    const w = right - left;
    const h = bottom - top;
    const nw = ((1280 / w) * 100);
    const nh = ((720 / h) * 100);
    const maxh = ((maxsize / h) * 100);
    const calc = calculatesizeafter(w, h, nw);
    //console.log(calc)
    if (calc[1] > maxsize) {
        const pr = .8;
        layer.scale(maxh * pr, maxh * pr)
            //layer.scale(nw * pr, nw * pr);
    } else {
        layer.scale(nw, nw)
            //console.log(`DIG ${nw}`)
    }










}


async function alignalltext() {


    const allLayers = app.activeDocument.layers;
    const alltext = allLayers.filter(layer => layer.name === "dcsmstext").reverse();
    let top = 0;
    alltext.forEach(text => {
        //console.log("start")
        movealltext(text, top);
        top += (text.boundsNoEffects.bottom - text.boundsNoEffects.top) + 20;
        //console.log("finish")
    });



}
async function movealltext(text, top) {

    const returnvalue = require('photoshop').action.batchPlay([_select(text._id), _alignhor(), _alignhor(ALIGNME.HOR), _alignhor(ALIGNME.TOP), _move(text._id, top)], { "synchronousExecution": true, "modalBehavior": "fail" });

    //console.log(`function movealltext ${top}`);

}



/**
 * 
 * saving file 
 * 
 */
async function doSaveFile() {

    const app = require('photoshop').app;
    let _mid = 12;

    // var saveFolder = await require("uxp").storage.localFileSystem.getFolder();
    // //console.log(saveFolder.name)
    const doc = app.activeDocument;

    if (persistentFolder == null || entry == null) {
        persistentFolder = await fs.getFolder();
        entry = await persistentFolder.getEntries();
        const curpath = document.getElementById("currentpath");
        curpath.innerHTML = persistentFolder.name;


    } else if (getParentDir(doc.path) != null && getParentDir(doc.path) != persistentFolder.name) {
        persistentFolder = await fs.getFolder();
        entry = await persistentFolder.getEntries();
        const curpath = document.getElementById("currentpath");
        curpath.innerHTML = persistentFolder.name;

        if (getParentDir(doc.path) != persistentFolder.name) {
            if (doc.title.indexOf("Untitled") > 0) {
                document.getElementById("actualdir").innerHTML = shortenDir(doc.path)
                return;
            }
        }
    }













    if (doc.title.indexOf("psd") > 0) {
        document.getElementById("docID").innerHTML = doc.title.replace(".psd", "");

        _mid = document.getElementById("docID").innerHTML;
    } else {
        _mid = await getMaxName(entry) + 1;
        document.getElementById("docID").innerHTML = _mid.toString();
    }


    const newJPG = await persistentFolder.createFile(_mid + ".jpeg", { overwrite: true });
    const newPSD = await persistentFolder.createFile(_mid + ".psd", { overwrite: true });
    const saveJPEG = await fs.createSessionToken(newJPG);
    const savePSD = await fs.createSessionToken(newPSD);
    const result = require("photoshop").action.batchPlay([cmdSavePSD(savePSD), cmdSave(saveJPEG)], {
        "synchronousExecution": true,
        "modalBehavior": "fail"
    });

}

function cmdSavePSD(token) {
    const app = require('photoshop').app;
    return {
        "_obj": "save",
        "as": {
            "_obj": "photoshop35Format",
            "maximizeCompatibility": true
        },
        "in": {
            "_path": token,
            "_kind": "local"
        },
        "documentID": app.activeDocument._id,
        "lowerCase": true,
        "saveStage": {
            "_enum": "saveStageType",
            "_value": "saveBegin"
        },
        "_isCommand": false
    }
}

function cmdSave(token) {
    const app = require('photoshop').app;
    return {
        "_obj": "save",
        "as": {
            "_obj": "JPEG",
            "extendedQuality": 10,
            "matteColor": {
                "_enum": "matteColor",
                "_value": "none"
            }
        },
        "in": {
            "_path": token,
            "_kind": "local"
        },
        "documentID": app.activeDocument._id,
        "copy": true,
        "lowerCase": true,
        "saveStage": {
            "_enum": "saveStageType",
            "_value": "saveBegin"
        },
        "_isCommand": false
    }
}

async function getMaxName(ntries) {
    const files = ntries.filter(e => e.name.indexOf('psd') > 0);
    const names = []
    files.forEach(child => {
        try {
            names.push(parseInt(child.name.replace('.psd', '')));
        } catch (error) {

        }

        //console.log(child.name)
    })
    return Math.max(...names);
}


async function doPosterize() {
    const adaptCorrect = {
        "_obj": "adaptCorrect",
        "shadowMode": {
            "_obj": "adaptCorrectTones",
            "amount": {
                "_unit": "percentUnit",
                "_value": 10
            },
            "width": {
                "_unit": "percentUnit",
                "_value": 50
            },
            "radius": 30
        },
        "highlightMode": {
            "_obj": "adaptCorrectTones",
            "amount": {
                "_unit": "percentUnit",
                "_value": 2
            },
            "width": {
                "_unit": "percentUnit",
                "_value": 50
            },
            "radius": 30
        },
        "blackClip": 0.01,
        "whiteClip": 0.01,
        "center": 0,
        "colorCorrection": 20,
        "_isCommand": true
    }
}