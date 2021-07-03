function logger(message) {
    console.log(message);
}

function test(data) {

}
async function showDialog(title, message, handler) { // dialog handling
    const dialog = document.querySelector("#alertDialog");
    const t = dialog.querySelector(".title");
    const m = dialog.querySelector(".content");
    t.innerHTML = title;
    m.innerHTML = message;
    dialog.uxpShowModal({
        title: "Dialog Example",
        resize: "none", // "both", "horizontal", "vertical",
        size: {
            width: 480,
            height: 240
        }
    });
    Array.from(document.querySelectorAll("#alertDialog sp-button")).forEach(button => {
        button.onclick = async() => {
            handler = test(button.className)
            dialog.close();


        }
    });

};



let button_dialog = false;

module.exports = {
    logger,
    showDialog,
    button_dialog
}