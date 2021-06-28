const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;
let entry = null;
let textureenty = null;
let persistentFolder = null;

function findNestedObj(entireObj, keyToFind) {
    let foundObj;
    JSON.stringify(entireObj, (_, nestedValue) => {
        if (nestedValue && nestedValue[keyToFind]) {
            foundObj = nestedValue;
        }
        return nestedValue;
    });
    return foundObj;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function getParentDir(filePath) {
    if (filePath.indexOf("/") == -1) { // windows
        return filePath.substring(0, filePath.lastIndexOf('\\'));
    } else { // unix
        return filePath.substring(0, filePath.lastIndexOf('/'));
    }
}

function shortenDir(path) {
    const pth = path.split('\\');
    const newname = [pth[0], "\\..\\", pth[pth.length - 3], "\\", pth[pth.length - 2]]
    return newname.join("");
}


async function selectLayer(layername) {
    //const app = require("photoshop").app;
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
        //const app = require('photoshop').app;
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
    //const app = require("photoshop").app;
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

    //const app = require('photoshop').app;
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
    //const app = require('photoshop').app;
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
    //const app = require('photoshop').app;
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

    const sharpen = {
        "_obj": "sharpen",
        "_isCommand": true
    }
    const highpass = {
        "_obj": "highPass",
        "radius": {
            "_unit": "pixelsUnit",
            "_value": 0.8
        },
        "_isCommand": true
    }
    const curves = {
        "_obj": "curves",
        "presetKind": {
            "_enum": "presetKindType",
            "_value": "presetKindCustom"
        },
        "adjustment": [{
            "_obj": "curvesAdjustment",
            "channel": {
                "_ref": "channel",
                "_enum": "channel",
                "_value": "composite"
            },
            "curve": [{
                    "_obj": "paint",
                    "horizontal": 0,
                    "vertical": 6
                },
                {
                    "_obj": "paint",
                    "horizontal": 62,
                    "vertical": 52
                },
                {
                    "_obj": "paint",
                    "horizontal": 193,
                    "vertical": 201
                },
                {
                    "_obj": "paint",
                    "horizontal": 255,
                    "vertical": 255
                }
            ]
        }],
        "_isCommand": true
    }
    const unsharpedmask = {
        "_obj": "unsharpMask",
        "amount": {
            "_unit": "percentUnit",
            "_value": 500
        },
        "radius": {
            "_unit": "pixelsUnit",
            "_value": 1.1
        },
        "threshold": 8,
        "_isCommand": true
    }
    const diffuse = {
        "_obj": "diffuse",
        "mode": {
            "_enum": "diffuseMode",
            "_value": "normal"
        },
        "_isCommand": true
    }
    const denoise = {
        "_obj": "denoise",
        "colorNoise": {
            "_unit": "percentUnit",
            "_value": 45
        },
        "sharpen": {
            "_unit": "percentUnit",
            "_value": 25
        },
        "removeJPEGArtifact": false,
        "channelDenoise": [{
            "_obj": "channelDenoiseParams",
            "channel": {
                "_ref": "channel",
                "_enum": "channel",
                "_value": "composite"
            },
            "amount": 6,
            "edgeFidelity": 60
        }],
        "_isCommand": true
    }
    const smartSharpen = {
        "_obj": "smartSharpen",
        "presetKind": {
            "_enum": "presetKindType",
            "_value": "presetKindCustom"
        },
        "useLegacy": true,
        "amount": {
            "_unit": "percentUnit",
            "_value": 50
        },
        "radius": {
            "_unit": "pixelsUnit",
            "_value": 0.7
        },
        "moreAccurate": false,
        "blur": {
            "_enum": "blurType",
            "_value": "gaussianBlur"
        },
        "_isCommand": true
    }
    const denoise2 = {
        "_obj": "smartSharpen",
        "presetKind": {
            "_enum": "presetKindType",
            "_value": "presetKindCustom"
        },
        "useLegacy": true,
        "amount": {
            "_unit": "percentUnit",
            "_value": 50
        },
        "radius": {
            "_unit": "pixelsUnit",
            "_value": 0.7
        },
        "moreAccurate": false,
        "blur": {
            "_enum": "blurType",
            "_value": "gaussianBlur"
        },
        "_isCommand": true
    }


}

Array.from(document.querySelectorAll(".sp-tab")).forEach((theTab) => {
    theTab.onclick = () => {
        localStorage.setItem("currentTab", theTab.getAttribute("id"));
        Array.from(document.querySelectorAll(".sp-tab")).forEach((aTab) => {
            if (aTab.getAttribute("id") === theTab.getAttribute("id")) {
                aTab.classList.add("selected");
            } else {
                aTab.classList.remove("selected");
            }
        });
        Array.from(document.querySelectorAll(".sp-tab-page")).forEach((tabPage) => {
            if (tabPage.getAttribute("id").startsWith(theTab.getAttribute("id"))) {
                tabPage.classList.add("visible");
            } else {
                tabPage.classList.remove("visible");
            }
        });
    };
});

function showLayerNames() {
    //const app = window.require("photoshop").app;
    const allLayers = app.activeDocument.layers;
    const allLayerNames = allLayers.map((layer) => layer.name);
    const sortedNames = allLayerNames.sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0
    );
    document.getElementById("layers").innerHTML = `
      <ul>${sortedNames.map((name) => `<li>${name}</li>`).join("")}</ul>`;
}
document.getElementById(
  "texts"
).value = `Lorem Ipsum\rDolor Sit Amet\rWhat the actual Fuck!!!`;

document.getElementById("btnPopulate").addEventListener("click", () => {
  console.log("HMM");
  (async () => {
    const pluginFolder = await fs.getPluginFolder();
    const theTemplate = await pluginFolder.getEntry("template.psd");
    //const app = require("photoshop").app;
    let token = fs.createSessionToken(theTemplate);
    (async () => {
      await require("photoshop").action.batchPlay(
        [
          {
            _obj: "placeEvent",
            target: {
              _path: token,
              _kind: "local",
            },
          },
          _alignhor(),
        ],
        {
          synchronousExecution: true,
          modalBehavior: "fail",
        }
      );
      await require("photoshop").action.batchPlay(
        [
          {
            _obj: "placedLayerConvertToLayers",
            _isCommand: true,
          },
        ],
        {
          synchronousExecution: true,
          modalBehavior: "fail",
        }
      );
    })();
    sleep(3000);

    const allLayers = app.activeDocument.layers;
    const alltext = allLayers.filter((layer) => layer.name === "dcsmstext");
    const newtexts = document.getElementById("texts").value.trim().split("\r");
    (async () => {
      selectmainlayer();
      await doInserText(newtexts);
      await alignalltext();
    })();
  })();
});

async function selectmainlayer() {
  const deftext = await selectLayer("dcsmstext");
  deftext.delete();
}
document.getElementById("btnExplode").addEventListener("click", async () => {
  const activeLayer = app.activeDocument.activeLayers[0];
  const gettemp = await require("photoshop").action.batchPlay(
    [_get(activeLayer._id)],
    {
      synchronousExecution: true,
      modalBehavior: "fail",
    }
  );

  if (activeLayer.kind != 3) return;

  const result = await cekmultilinetext(activeLayer);
  const newtxt = result[0].textKey["textKey"].trim().split("\r");
  if (newtxt.length > 1) {
    await doTexts(newtxt, findNestedObj(gettemp, "textStyle"));
    // (async () => {
    //   await doInserText(newtxt);
    //   await alignalltext();
    // })();
  }

  //
});
document.getElementById("btnSave").addEventListener("click", () => {
  try {
    doSaveFile();
  } catch (error) {
    console.log(error);
  }
});
document.getElementById("btnDoStuff").addEventListener("click", doStuff);

const dropdown = document.querySelector(".template-items");
let template = "template.psd";
async function addElementToDropdown(templates) {
  while (dropdown.firstChild) dropdown.removeChild(dropdown.firstChild);
  await templates.forEach((tmplt) => {
    const element = document.createElement("sp-menu-item");
    element.classList = "dropdown-item";
    element.value = tmplt.name;
    element.innerText = tmplt.name.replace(".psd", "").toUpperCase();
    dropdown.appendChild(element);
  });
  dropdown.selectedIndex = 0;
  template = dropdown.childNodes[0].value;
}
document.querySelector(".template").addEventListener("change", (evt) => {
  template = dropdown.childNodes[evt.target.selectedIndex].value;
  console.log(template);
});

document.addEventListener("DOMContentLoaded", (event) => {
  (async () => {
    await getPersistentToken(false); //await fs.getPluginFolder();
    await getTextureToken();
  })();
});
const batchPlay = require("photoshop").action.batchPlay;
require("photoshop").app.Layer.prototype.CenterAlign = async () => {
  return await batchPlay(
    [
      _selectname("colorfill"),
      _lock(false),
      _selectname("masterlayer"),
      _alignhor(),
      _alignhor(ALIGNME.HOR),
      _selectname("colorfill"),
      _lock(true),
    ],
    {
      synchronousExecution: true,
      modalBehavior: "fail",
    }
  );
};

require("photoshop").app.Layer.prototype.PlaceTemplate = async (token) => {
  return await batchPlay(
    [
      {
        _obj: "placeEvent",
        target: {
          _path: token,
          _kind: "local",
        },
      },
      {
        _obj: "placedLayerConvertToLayers",
        _isCommand: true,
      },
      {
        _obj: "select",
        _target: [
          {
            _ref: "layer",
            _name: "dcsmstext",
          },
        ],
        makeVisible: false,
        _isCommand: true,
        _options: {
          dialogOptions: "dontDisplay",
        },
      },
      {
        _obj: "get",
        _target: [
          {
            _ref: "layer",
            _name: "dcsmstext",
          },
        ],
        _options: {
          dialogOptions: "dontDisplay",
        },
      },
    ],
    {
      synchronousExecution: true,
      modalBehavior: "fail",
    }
  );
};
require("photoshop").app.Layer.prototype.AddText = async (
  newtexts,
  txtstyle
) => {
  let newcommand = [];
  newtexts.forEach((text) => {
    newcommand.push(_maketext(text, txtstyle));
    newcommand.push(_rename());
    newcommand.push(
      _alignhor(),
      _alignhor(ALIGNME.HOR),
      _alignhor(ALIGNME.TOP)
    );
  });

  return await batchPlay(newcommand, {
    synchronousExecution: true,
    modalBehavior: "fail",
  });
};

async function doStuff() {
  const pluginFolder = await getPersistentToken(false, true);
  const theTemplate = await pluginFolder.getEntry(template);
  //const app = require("photoshop").app;
  let token = fs.createSessionToken(theTemplate);
  const newtexts = document.getElementById("texts").value.trim().split("\r");
  const result =
    await require("photoshop").app.activeDocument.activeLayers[0].PlaceTemplate(
      token
    );
  const style = findNestedObj(result[result.length - 1], "textStyle");
  doTexts(newtexts, style);
}

async function doTexts(newtexts, style) {
  await require("photoshop").app.activeDocument.activeLayers[0].delete();
  await require("photoshop").app.activeDocument.activeLayers[0].AddText(
    newtexts,
    style["textStyle"]
  );
  const allLayers = app.activeDocument.layers;
  const textlayers = allLayers
    .filter((layer) => layer.name === "dcsmstext")
    .reverse();
  let top = 0;
  for (const text of textlayers) {
    await scaleTextLayer();
    await movealltext(text, top);
    top += (await text.boundsNoEffects.bottom) - text.boundsNoEffects.top + 20;
  }
  await require("photoshop").app.activeDocument.activeLayers[0].CenterAlign();
}

async function resetEntry() {
  curpath.innerHTML = `null`;
  entry = null;
}

async function getTextureToken() {

  const te = localStorage.getItem("texture-token");

  try {
    textureenty = await fs.getEntryForPersistentToken(te);
  } catch (error) {
    textureenty = await fs.getFolder();
    localStorage.setItem(
      "texture-token",
      await fs.createPersistentToken(textureenty)
    );
    console.log(error)
  }

  (async () => {
    //const templates = await textureenty.getEntries();
    try{
    const templates = await textureenty.getEntry("thumb/data.json");
    const readme = await templates.read();
    const jsonobj = JSON.parse(readme);
    for (const j of jsonobj){
      const texture = document.querySelector(".textures");
      const element = document.createElement("img");
      element.classList = "img";
      element.setAttribute("value",j.name);      
      element.src =`data:image/${j.ext};base64,${j.base64}`
      texture.appendChild(element);
    }
    }catch(error){console.log(error)}
    const texture = document.querySelector(".textures");
    
    const imgs = texture.childNodes;
   
    for (const t of imgs) {
     
      t.addEventListener("click", async(evt) => {
  
        const namafile = evt.target.getAttribute("value");     
        
        const texture = await textureenty.getEntry(namafile);       
        let token = fs.createSessionToken(texture)
        await require("photoshop").action.batchPlay([{
          _obj: "placeEvent",
          target: {
            _path: token,
            _kind: "local",
          },
        },
        {
          _obj: "placedLayerConvertToLayers",
          _isCommand: true,
        },_alignhor(ALIGNME.VER), _alignhor(ALIGNME.HOR)],
        {
                    "synchronousExecution": true,
                    "modalBehavior": "fail"
                });
                runcmdFitLayer(true);
      });
    }

  })();
}

async function getPersistentToken(reset = true, get = false) {
  if (reset) localStorage.clear();
  const te = localStorage.getItem("persistent-token");
  let entry = null;

  try {
    entry = await fs.getEntryForPersistentToken(te);
  } catch (error) {
    entry = await fs.getFolder();
    localStorage.setItem(
      "persistent-token",
      await fs.createPersistentToken(entry)
    );
  }
  if (get) return entry;
  (async () => {
    const templates = (await entry.getEntries())
      .filter((tmplt) => tmplt.name.indexOf("psd") > 0)
      .reverse();
    addElementToDropdown(templates);
  })();
}
const curpath = document.getElementById("currentpath");
const buttonmenu = document.getElementById("aligngroup");
const childs = buttonmenu.childNodes;
for (let button of childs) {
  button.addEventListener("click", async (e) => {
    switch (e.target.getAttribute("value")) {
      case "openfile":
        if (persistentFolder == null) persistentFolder = await fs.getFolder();
        entry = await fs.getFileForOpening({
          initialLocation: persistentFolder,
        });

        if (!entry) {
          // no file selected
          return;
        }

        //entry = await require('uxp').storage.localFileSystem.getFileForOpening();
        const path = entry.nativePath.split("\\");
        curpath.innerHTML = persistentFolder.name;
        await app.open(entry);
        document.getElementById("actualdir").innerHTML = shortenDir(
          app.activeDocument.path
        );
        break;
      case "selectsubject":
        await require("photoshop").action.batchPlay(
          [
            {
              _obj: "autoCutout",
              sampleAllLayers: true,
              _isCommand: true,
            },
          ],
          {
            synchronousExecution: true,
            modalBehavior: "fail",
          }
        );
        break;
      case "paste":
        await require("photoshop").action.batchPlay(
          [
            {
              _obj: "paste",
              antiAlias: {
                _enum: "antiAliasType",
                _value: "antiAliasNone",
              },
              as: {
                _class: "pixel",
              },
              _isCommand: true,
            },
            _alignhor(ALIGNME.VER),
            _alignhor(ALIGNME.HOR),
          ],
          {
            synchronousExecution: true,
            modalBehavior: "fail",
          }
        );

        runcmdFitLayer(true);
        break;
      case "posterize":
        (async () => {
          await getPersistentToken(false); //await fs.getPluginFolder();
          await getTextureToken();
        })();
        await doPosterize();
        break;
      default:
    }
  });
}

document.getElementById("btnDoFit").addEventListener("click", async () => {
  await require("photoshop").action.batchPlay(
    [_alignhor(ALIGNME.VER), _alignhor(ALIGNME.HOR)],
    {
      synchronousExecution: true,
      modalBehavior: "fail",
    }
  );
  runcmdFitLayer(false);
});
/** listener
 *
 *
 * **/
var listener = (e, d) => {
  if (e == "select") {
    document.getElementById("actualdir").innerHTML = shortenDir(
      app.activeDocument.path
    );
  }
};
require("photoshop").action.addNotificationListener(
  [
    {
      event: "select",
    },
    {
      event: "open",
    }, // any other events...
  ],
  listener
);