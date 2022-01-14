$ = require('jquery')

const { ipcRenderer } = require('electron');


$(() => {
    $("#loadKeyButton").on('click', ()=> {
        ipcRenderer.send('loadKey', {});
    })

    $("#createKeyButton").on('click', ()=> {
        if (!window.bambooLoaded) alert("Please wait...");
        alert("[WARNING] Please keep a backup of this file on a thumb drive. If you lose this file, you lose your funds!")
        ipcRenderer.send('saveKey', generateKeyPair());
    })
})

