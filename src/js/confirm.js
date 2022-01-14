$ = require('jquery')

const { ipcRenderer } = require('electron');

$(() => {
    ipcRenderer.on('currTx', function (event, currTx) {
        $("#toAddress").text(currTx.to);
        $("#amountTotal").text(numberWithCommas(currTx.amount / BMB_SCALE_FACTOR) + " BMB")
        $("#feesTotal").text(numberWithCommas(currTx.fee / BMB_SCALE_FACTOR) + " BMB")

    });

    $("#cancelButton").on('click', ()=> {
        ipcRenderer.send('wallet', {});
    });

    $("#confirmButton").on('click', ()=> {
        ipcRenderer.send('confirmTx');
    });
})

