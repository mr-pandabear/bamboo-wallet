$ = require('jquery')

const { ipcRenderer } = require('electron');


ipcRenderer.on('tx-status', function (event, message) {
    $("#status").text(message);
});


$(() => {
    $("#doneButton").on('click', ()=> {
        ipcRenderer.send('wallet', {});
    })
});