!function(e, t){
    console.log("Loading client...");
    var n = "a.wasm.js";
    if(!e.WebAssembly){
        n = "a.js"
    }
    console.log("Script set to " + n);
    var o = t.createElement("script");
    o.async = !0, o.type = "text/javascript", o.src = n, o.onerror = function(t) {
        console.error("Script Error"), console.error(t), setTimeout(function() {
            e.location.reload(!0)
        }, 3e3)
    };
    var r = t.getElementsByTagName("script")[0];
    r.parentNode.insertBefore(o, r)
}(window, document);

function loadBamboo() {
    window.bambooLoaded = false;
    try {
        let _generateKeyPair = Module.cwrap('generateKeyPair', 'string', null);
        window.generateKeyPair = function() {
            return JSON.parse(_generateKeyPair());
        }

        let _createTransaction = Module.cwrap('createTransaction', 'string', ['array'])

        window.createTransaction = function(data) {
            const encoder = new TextEncoder();
            const view = encoder.encode(JSON.stringify(data));
            return JSON.parse(_createTransaction(view));
        }
        window.bambooLoaded = true;
    } catch(e) {
        setTimeout(loadBamboo, 100);
    }
}

loadBamboo();