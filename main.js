// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView, webContents } = require("electron");
const path = require("path");
// const { execSync, exec, spawnSync, spawn } = require('child_process')
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  let content = mainWindow.webContents;
  // content.loadURL("http://localhost:8880/");
  content.loadURL("http://115.76.144.9/");
  // content.loadURL("http://spiderock.xyz/");


  mainWindow.webContents.openDevTools();
  // mainWindow.setMenu(null)
  content.on("did-start-loading", () => {
    fs.copyFile(
      "./tmp/ArduinoBuilder-Recovery.ino",
      "./ArduinoBuilder/ArduinoBuilder.ino",
      (err) => {
        if (err) console.log(err);
        else {
          console.log("[ElectronJS] Did-Start-Loading >> Recovery .ino File");
        }
      }
    );
  })

  //!===================/ Emitted when the window is closed /===================!//
  mainWindow.on("closed", function () {
    fs.copyFile(
      "./tmp/ArduinoBuilder-Recovery.ino",
      "./ArduinoBuilder/ArduinoBuilder.ino",
      (err) => {
        if (err) console.log(err);
        else {
          console.log("[INFO] Suddenly Stopped >> Recovery .ino File");
        }
      }
    );
    mainWindow = null;
  });

  //TODO: Save current switch state to firebase
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.allowRendererProcessReuse = true;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
