$ = require('jquery')

const { ipcRenderer } = require('electron');


$(() => {
    $("#button").on('click', ()=> {
        console.log(generateKeyPair())
        ipcRenderer.send('open-file', {});
    })
})

