$ = require('jquery')

const { ipcRenderer } = require('electron');


$(() => {
    $("#loadKeyButton").on('click', ()=> {
        ipcRenderer.send('open-file', {});
    })

    $("#createKeyButton").on('click', ()=> {
        var a = confirm("[WARNING] Please keep a backup of this file on a thumb drive. If you lose this file, you lose your funds!")
        if (a) ipcRenderer.send('save-file', generateKeyPair());
    })
})

