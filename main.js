document.getElementById("btnPlace").addEventListener("click", placeTemplate)
document.getElementById("btnEdit").addEventListener("click", editTemplate)
const txtarea = document.getElementById("texts");
async function placeTemplate() {
    const pluginFolder = await fs.getPluginFolder();
    const theTemplate = await pluginFolder.getEntry("template.psd");
    const app = require("photoshop").app;
    let token = fs.createSessionToken(theTemplate);
    await require("photoshop").action.batchPlay(
        [{
                _obj: "placeEvent",
                target: {
                    _path: token,
                    _kind: "local",
                },
            },
            {
                _obj: "placedLayerConvertToLayers",
                _isCommand: true,
            }
        ], {
            "synchronousExecution": true,
            "modalBehavior": "fail"
        }
    );
}

async function editTemplate() {
    const app = window.require("photoshop").app;
    const allLayers = app.activeDocument.layers;
    const texts = allLayers.filter((layer) => layer.name === "dcsmstext");
    console.log(texts)
    await require("photoshop").action.batchPlay([{
        "_obj": "select",
        "_target": [{
            "_ref": "layer",
            "_name": "dcsmstext"
        }],
        "makeVisible": false,
        "layerID": [
            6
        ],
        "_isCommand": true,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }], {
        "synchronousExecution": true,
        "modalBehavior": "fail"
    });
    const text = await require("photoshop").action.batchPlay([{
        "_obj": "get",
        "_target": [{
            "_ref": "layer",
            "_name": "dcsmstext"
        }],
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }], {
        "synchronousExecution": true,
        "modalBehavior": "fail"
    });
    console.log(text);
}