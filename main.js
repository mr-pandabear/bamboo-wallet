// Modules to control application life and create native browser window
const {app, dialog, ipcMain, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs');
const { send } = require('process');
const axios = require('axios');


CURRENT_KEY = null;
GLOBAL_WINDOW = null;
CURRENT_PEERS = null;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x:0,
    y:0,
    width: 800,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  GLOBAL_WINDOW = mainWindow;



  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')
  // Open the DevTools.
  mainWindow.openDevTools();
}


function wallet() {
  GLOBAL_WINDOW.loadFile('src/wallet.html').then(()=> {
    GLOBAL_WINDOW.webContents.send('key', CURRENT_KEY);
    GLOBAL_WINDOW.webContents.send('peers', CURRENT_PEERS);
  })
  GLOBAL_WINDOW.setSize(800, 400);
}

function login(key) {
  CURRENT_KEY = key;
  console.log('logged in:', CURRENT_KEY)
  wallet();
}

function logout() {
  CURRENT_KEY = null;
  GLOBAL_WINDOW.loadFile('src/index.html');
  GLOBAL_WINDOW.setSize(800, 400);
}

function sendFunds() {
  GLOBAL_WINDOW.loadFile('src/send.html').then(()=> {
    GLOBAL_WINDOW.webContents.send('key', CURRENT_KEY);
    GLOBAL_WINDOW.webContents.send('peers', CURRENT_PEERS);
  })
  GLOBAL_WINDOW.setBounds({ x: 0, y: 0, width: 800, height: 750 });
}

function validateKey(key) {
  // TODO: validate it!
  return true;
}


ipcMain.on('wallet', (event, arg) => {
  wallet();
})


ipcMain.on('send', (event, arg) => {
  sendFunds();
})

ipcMain.on('logout', (event, arg) => {
  logout();
})

ipcMain.on('open-file', (event, arg) => {
  const files = dialog.showOpenDialog({
    properties: ['openFile']
  }).then((success) => {
    let keyPath = success.filePaths;
    fs.readFile(keyPath[0], 'utf8', function (err,data) {
      if (err) {
        console.log("Could not load file");
      }
      let key = JSON.parse(data);
      if (validateKey(key)) {
        login(key);
      } else {
        console.log("Key file not valid")
      }
    });
  }, (failure) => {
    console.log("Could not load file");
  })
  if (!files) { return; }
});

ipcMain.on('save-file', (event, arg) => {
  let key = arg;
  dialog.showSaveDialog(null, { defaultPath: 'keys.json'}).then((result) => {
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(key, null, 4), 'utf-8'); 
      login(key);
    } catch (e) {
      console.log(e);
    }
  }, (rejected) => {
    alert("ERROR");
  });
  
  
});




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  axios.get('http://54.189.82.240:3000/peers').then((data) => {
    CURRENT_PEERS = data.data;
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })


})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

