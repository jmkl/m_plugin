// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { logger, showDialog, button_dialog } = require("./mlib.js");

const COL = {
    red: ' red',
    orange: ' orange',
    yellow: ' yellow',
    green: ' green',
    turquoise: ' turquoise',
    blue: ' blue',
    violet: ' violet',
    pink: ' pink',
    brown: ' brown',
    black: ' black',
    gray: ' gray',
    white: ' white'
}
const ORIENTATION = {
    landscape: "landscape",
    portrait: "portrait",
    square: "square"
}
const api_key = "563492ad6f91700001000001b7f8998eacb449ceba4325318182d154";
const api_url = "https://api.pexels.com/v1/search"

const images = document.querySelector(".images");
const searchfield = document.getElementById("carigambar");
const loading = document.getElementById("loading");

async function getImages(keyword, imageholder) {
    const url = `${api_url}?query=${keyword.replace(" ","+")}&per_page=60`;
    console.log(url)
    try {
        const response = await xhrRequest(url, 'GET').then(resp => {
            const response = JSON.parse(resp)
            const photos = response.photos;
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                const img = createImage(photo.src.tiny, photo.src.original);
                images.appendChild(img);
                img.addEventListener("click", async(evt) => {
                    loading.style.display = "none";
                    const urlfile = evt.target.getAttribute("value");
                    const namafile = urlfile.split('/').pop();
                    loading.style.display = "block";
                    fetch(urlfile).then(function(response) {
                        if (!response.ok)
                            throw new Error("Http ERrror " + response.status)
                        return response.arrayBuffer();
                    }).then(function(buffer) {
                        try {
                            (async() => {
                                let token;
                                try {
                                    const entry = await pexelPersistentFolder.getEntry(namafile)
                                    token = await fs.createSessionToken(entry);
                                } catch (error) {
                                    const newJPG = await pexelPersistentFolder.createFile(namafile, { overwrite: true });
                                    await newJPG.write(buffer, { format: require('uxp').storage.formats.binary });
                                    token = await fs.createSessionToken(newJPG);
                                }



                                loading.style.display = "none"
                                const place = await require("photoshop").action.batchPlay(
                                    [{
                                            _obj: "placeEvent",
                                            target: {
                                                _path: token,
                                                _kind: "local",
                                            },
                                        },
                                        _alignhor(),
                                    ], {
                                        synchronousExecution: true,
                                        modalBehavior: "fail",
                                    }
                                );
                                runcmdFitLayer(true);
                            })()
                        } catch (error) {
                            console.log(error)
                            loading.style.display = "none"
                        }


                    });
                })





            }
            imageholder.disabled = false;
        })

    } catch (error) {
        console.log(error);
    }

}

// XHR helper function
async function xhrRequest(url, method) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();

        req.timeout = 6000;
        req.onload = () => {
            if (req.status === 200) {
                try {
                    resolve(req.response);
                } catch (err) {
                    reject(`Couldn't parse response. ${err.message}, ${req.response}`);
                }
            } else {
                reject(`Request had an error: ${req.status}`);
            }
        }
        req.ontimeout = () => {
            console.log("polling..")
            resolve(xhrRequest(url, method))
        }
        req.onerror = (err) => {
            console.log(err)
            reject(err)
        }
        req.open(method, url, true);
        req.setRequestHeader('Authorization', api_key);
        req.send();
    });
}

function createImage(thumb, original) {
    const element = document.createElement("img");
    element.classList = "images";
    element.setAttribute("value", original);
    element.src = thumb;
    return element;
}



searchfield.addEventListener('keyup', async(event) => {
    if (event.key == 'Enter') {
        if (pexelPersistentFolder == null) {
            pexelPersistentFolder = getPexelPersisten();

        }
        while (images.firstChild)
            images.removeChild(images.firstChild);
        event.target.disabled = true;
        getImages(searchfield.value, event.target);
    }
});


async function getPexelPersisten() {
    const te = localStorage.getItem("persistent-pexel-token");
    try {
        pexelPersistentFolder = await fs.getEntryForPersistentToken(te);
    } catch (error) {
        pexelPersistentFolder = await fs.getFolder();
        localStorage.setItem("persistent-pexel-token", await fs.createPersistentToken(pexelPersistentFolder));
    }
    return pexelPersistentFolder;
}