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
    const app = window.require("photoshop").app;
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
    const app = require("photoshop").app;
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
  const app = require("photoshop").app;
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
    const templates = await textureenty.getEntries();

    for (const d of templates) {
      if (d.isFolder) {
        const thumb = await d.getEntries();
        const texture = document.querySelector(".textures");
        for (const t of thumb) {
          const element = document.createElement("img");
          element.classList = "img";
          element.value = t.name;
          element.src = "texturelab/thumb/" + t.name;
          texture.appendChild(element);
        }

        const imgs = texture.childNodes;
        for (const t of imgs) {
          t.addEventListener("click", async(evt) => {
            const namafile = evt.target.value;     
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
      }
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