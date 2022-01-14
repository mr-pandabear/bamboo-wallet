// Modules to control application life and create native browser window
const {app, dialog, ipcMain, getCurrentWindow, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs');
const { send } = require('process');
const axios = require('axios');


CURRENT_KEY = null;
CURRENT_TX = null;
GLOBAL_WINDOW = null;
CURRENT_PEERS = null;

// Initializes the specified window with current state 
function sendCurrentState(loadPromise) {
  loadPromise.then(()=> {
    GLOBAL_WINDOW.webContents.send('key', CURRENT_KEY);
    GLOBAL_WINDOW.webContents.send('peers', CURRENT_PEERS);
    GLOBAL_WINDOW.webContents.send('currTx', CURRENT_TX);
  })
  return loadPromise;
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    x:0,
    y:0,
    width: 800,
    height: 420,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  GLOBAL_WINDOW = mainWindow;
  // mainWindow.openDevTools()
  home();
}

/*

    Pages

*/

/* Show the home page */
function home() {
  sendCurrentState(GLOBAL_WINDOW.loadFile('src/index.html'));
  GLOBAL_WINDOW.setSize(800, 420);
}

/* Show the status page */
function status() {
  sendCurrentState(GLOBAL_WINDOW.loadFile('src/status.html')).then(()=> {
    let data = Buffer(CURRENT_TX.encoded, 'hex');
    let randomPeer = CURRENT_PEERS[Math.floor(Math.random()*CURRENT_PEERS.length)];
    GLOBAL_WINDOW.webContents.send('tx-status', 'Sending transaction to peer: ' + randomPeer);
    axios.post(randomPeer + '/add_transaction', data).then((response) => {
      GLOBAL_WINDOW.webContents.send('tx-status', 'Received response: ' + JSON.stringify(response.data));
    });
  });
  GLOBAL_WINDOW.setSize(800, 290);
}

/* Show the wallet page */
function wallet() {
  sendCurrentState(GLOBAL_WINDOW.loadFile('src/wallet.html'))
  GLOBAL_WINDOW.setSize(800, 420);
}

/* Show the send funds page */
function sendFunds() {
  sendCurrentState(GLOBAL_WINDOW.loadFile('src/send.html'))
  GLOBAL_WINDOW.setBounds({ x: 0, y: 0, width: 800, height: 750 });
}


ipcMain.on('setTx', (event, arg) => {
  // send tx to all peers
  CURRENT_TX = arg;
  sendCurrentState(GLOBAL_WINDOW.loadFile('src/confirm.html'));
  GLOBAL_WINDOW.setSize(800, 475);
})

ipcMain.on('wallet', (event, arg) => {
  wallet();
})

ipcMain.on('confirmTx', (event, arg) => {
  status();
})

ipcMain.on('send', (event, arg) => {
  sendFunds();
})

ipcMain.on('logout', (event, arg) => {
  CURRENT_KEY = null;
  home();
})




/**
 * Handle requests to either open a key file or create a new one  
 **/

ipcMain.on('loadKey', (event, arg) => {
  const files = dialog.showOpenDialog({
    properties: ['openFile']
  }).then((success) => {
    let keyPath = success.filePaths;
    fs.readFile(keyPath[0], 'utf8', function (err,data) {
      if (err) {
        console.log("Could not load file");
      }
      let key = JSON.parse(data);
      CURRENT_KEY = key;
      wallet();
    });
  }, (failure) => {
    console.log("Could not load file");
  })
  if (!files) { return; }
});

ipcMain.on('saveKey', (event, arg) => {
  let key = arg;
  dialog.showSaveDialog(GLOBAL_WINDOW, { defaultPath: 'keys.json'}).then((result) => {
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(key, null, 4), 'utf-8'); 
      CURRENT_KEY = key;
      wallet();
    } catch (e) {
      console.log(e);
    }
  }, (rejected) => {
    alert("ERROR");
  });
});

// Connect to peers then create window
app.whenReady().then(() => {
  axios.get('http://54.189.82.240:3000/peers').then((data) => {
    CURRENT_PEERS = data.data;
    createWindow();
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
})

app.on('window-all-closed', function () {
  app.quit()
})
