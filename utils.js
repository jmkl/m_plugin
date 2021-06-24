const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;
let entry = null;
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