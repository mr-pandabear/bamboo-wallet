$ = require('jquery')

const { ipcRenderer, clipboard } = require('electron');

var KEY_FILE = null;
var PEER_LIST = null;

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


$(() => {

    function refreshTotalBalance() {
        let randIdx = Math.floor(Math.random() * PEER_LIST.length);
        $.get(PEER_LIST[randIdx] + '/ledger/' + KEY_FILE.wallet).then((data) => {
            if (data.error) {
                $("#walletTotal").text("0.00")
            } else {
                $("#walletTotal").text( numberWithCommas(data.balance/10000) + " BMB")
            }
        });
    }
    
    $("#sendButton").on('click', ()=> {
        ipcRenderer.send('send', {});
    });

    $("#copyButton").on('click', ()=> {
        clipboard.writeText($("#walletAddress").text())
    })

    $("#refreshWallet").on('click', ()=> {
        $("#walletTotal").text("Loading...")
        if (!PEER_LIST) {
            alert("Not connected.");
            return;
        }
        refreshTotalBalance()
    });

    $("#backButton").on('click', ()=> {
        ipcRenderer.send('logout', {});
    });

    ipcRenderer.on('key', function (event, keyFile) {
        if (!keyFile) {
            alert("ERROR: No Keyfile");
            ipcRenderer.send('logout', {});
        }
        KEY_FILE = keyFile;
        $("#walletAddress").text(keyFile.wallet);
    });

    ipcRenderer.on('peers', function (event, peers) {
        PEER_LIST = peers;
        refreshTotalBalance()
    });


    
})

