$ = require('jquery')

const { ipcRenderer } = require('electron');

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


function isValidAddress(x) {
    var re = /[0-9A-Fa-f]{6}/g;
    return (re.test(x) && x.length == 50);
}

let KEYFILE = null;

$(() => {
    let TRANSACTION_VALID = false;
    function updateTotal() {
        let cleanAmt = $("#amountInput").val() || 0;
        let raw = parseInt(cleanAmt) / 10000;
        $("#amountTotal").text(numberWithCommas(raw) + " BMB")

        let cleanFees = $("#feeInput").val() || 0;
        let tot = parseInt(cleanFees) / 10000;
        $("#finalTotal").text(numberWithCommas(tot) + " BMB")
    }

    function updateWallet() {
        let addr = $("#toInput").val();
        if (isValidAddress(addr)) {
            TRANSACTION_VALID = true;
            $("#addressStatus").text('')
        } else {
            $("#addressStatus").text(' [INVALID] ')
            TRANSACTION_VALID = false;
        }
        $("#toAddress").text(addr);
    }

    $("#amountInput").on('keyup', ()=> {
        updateTotal()
    })

    $("#toInput").on('keyup', ()=> {
        updateWallet();
    })


    $("#feeInput").on('keyup', ()=> {
        updateTotal()
    })


    ipcRenderer.on('key', function (event, keyFile) {
        if (!keyFile) {
            alert("ERROR: No Keyfile");
            ipcRenderer.send('logout', {});
        }
        KEY_FILE = keyFile;
        $("#fromAddress").val(keyFile.wallet);
    });

    $("#sendButton").on('click', ()=> {
        if (!TRANSACTION_VALID) {
            alert("Please enter a valid recepient address");
        } else {
            let data= {}
            var seconds = new Date().getTime() / 1000;
            data["timestamp"] = seconds;
            data["publicKey"] = KEY_FILE["publicKey"];
            data["privateKey"] = KEY_FILE["privateKey"];
            data["amount"] = parseInt($("#amountInput").val()) || 0
            data["fee"] = parseInt($("#feeInput").val()) || 0
            data["from"] = KEY_FILE["wallet"];
            data["to"] = $("#toAddress").text();
            let output = createTransaction(data);
            alert(output);
        }
    })

    $("#backButton").on('click', ()=> {
        ipcRenderer.send('wallet', {});
    })
})

