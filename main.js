// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView, WebContents } = require('electron')
const path = require('path')
// const { execSync, exec, spawnSync, spawn } = require('child_process')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  let content = mainWindow.webContents
  content.loadURL('http://localhost:8080/')
  // content.loadURL('http://171.233.31.91:8080/')


  // content.on('did-finish-load', () => {
  //   content.executeJavaScript("document.getElementById('btnOut').innerHTML = 'hacked'")
  //     .catch(error => console.log(error))
  // })
  // console.log(mainWindow.webContents.isLoading());


  ////////////////////////////// Emit on dowload //////////////////////////////
  // content.session.on('will-download', (event, item, webContents) => {
  //   item.setSavePath(`${path.join(__dirname, 'tmp', 'ArduinoBuilder.ino.bin')}`)

  //   item.on('updated', (event, state) => {
  //     if (state === 'interrupted') {
  //       console.log('Download is interrupted but can be resumed')
  //     } else if (state === 'progressing') {
  //       if (item.isPaused()) {
  //         console.log('Download is paused')
  //       }
  //     }
  //   })
  //   item.once('done', (event, state) => {
  //     if (state === 'completed') {
  //       console.log('[INFO] Download .bin successfully')
  //       // UPLOAD to board
  //       fs.readFile('config/config.json', (err, data) => {
  //         if (err) console.log(err)
  //         else {
  //           let jsonData = JSON.parse(data)
  //           let port = jsonData.PORT
  //           let baud = jsonData.BAUD
  //           let esptoolPath = path.join(__dirname, 'esptool', 'esptool.py')
  //           let buildFolder = `${path.join(__dirname, 'ArduinoBuilder')}`;
  //           let fileName = 'ArduinoBuilder.ino';
  //           let inoPath = `${path.join(buildFolder, `${fileName}`)}`;
  //           let binPath = `${path.join(buildFolder, 'build', `${fileName}.bin`)}`

  //           console.log('[INFO] Building ...');


  //           //////////WINDOWS-buggy//////////
  //           // exec(`D: && cd ${buildFolder} && .\\arduino-builder -compile -logger=machine -hardware .\\hardware -hardware .\\packages -tools .\\tools-builder -tools .\\avr -tools .\\packages -built-in-libraries .\\build_in_libraries -libraries .\\user_libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=0000_0000 -ide-version=10811 -build-path $(pwd)\\build -warnings=none -build-cache $(pwd)\\.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=.\\01_2.5.0-4-b40a506 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=.\\01_2.5.0-4-b40a506 -prefs=runtime.tools.python3.path=.\\02_3.7.2-post1 -prefs=runtime.tools.python3-3.7.2-post1.path=.\\02_3.7.2-post1 -prefs=runtime.tools.mkspiffs.path=.\\03_2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=.\\03_2.5.0-4-b40a506 -prefs=runtime.tools.mklittlefs.path=.\\04_2.5.0-4-69bd9e6 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=.\\04_2.5.0-4-69bd9e6 -verbose $(pwd)\\ArduinoBuilder.ino && python3 ${esptoolPath} --chip esp8266 --port ${port} --baud ${baud} --before default_reset --after hard_reset write_flash 0x0 ${binPath}`, err => {
  //           //   if (err) console.log('[INFO] ', err)
  //           //   else {
  //           //     console.log('[INFO] Done Compile and Uploading');
  //           //   }
  //           // })




  //           //////////MACOS too laggy//////////
  //           var ls = spawn(`cd ${buildFolder} && ./arduino-builder -compile -logger=machine -hardware ./hardware -hardware ./packages -tools ./tools-builder -tools ./avr -tools ./packages -built-in-libraries ./build_in_libraries -libraries ./user_libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=0000_0000 -ide-version=10811 -build-path $(pwd)/build -warnings=none -build-cache $(pwd)/.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=./01_2.5.0-4-b40a506 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=./01_2.5.0-4-b40a506 -prefs=runtime.tools.python3.path=./02_3.7.2-post1 -prefs=runtime.tools.python3-3.7.2-post1.path=./02_3.7.2-post1 -prefs=runtime.tools.mkspiffs.path=./03_2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=./03_2.5.0-4-b40a506 -prefs=runtime.tools.mklittlefs.path=./04_2.5.0-4-69bd9e6 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=./04_2.5.0-4-69bd9e6 -verbose $(pwd)/ArduinoBuilder.ino && python3 ${esptoolPath} --chip esp8266 --port ${port} --baud ${baud} --before default_reset --after hard_reset write_flash 0x0 ${binPath}`, { shell: true, maxBuffer: 1024 * 1024 * 500 }, (err) => {
  //             if (err) console.log(err)
  //             else {
  //               console.log('[INFO] Done Compile and Uploading');
  //             }
  //           })
  //           ls.stdout.on('data', (data) => {
  //             console.log(`stdout: ${data}`);
  //           });
  //           ls.stderr.on('data', (data) => {
  //             console.error(`stderr: ${data}`);
  //           });
  //           ls.on('close', (code) => {
  //             console.log(`child process exited with code ${code}`);
  //           });



  //           //////////LINUX too laggy//////////
  //           // var ls = spawn(`cd /media/spiderock/DATA/Desktop/pair-electron-app/BuilderLinux && ./arduino-builder -compile -logger=machine -hardware ./hardware -hardware ./packages -tools ./tools-builder -tools ./avr -tools ./packages -built-in-libraries ./libraries-build-in -libraries ./user_libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=10C4_EA60 -ide-version=10811 -build-path ./build -warnings=none -build-cache ./.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=./2.5.0-4-b40a506-1 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=./2.5.0-4-b40a506-1 -prefs=runtime.tools.mklittlefs.path=./2.5.0-4-69bd9e6-2 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=./2.5.0-4-69bd9e6-2 -prefs=runtime.tools.mkspiffs.path=./2.5.0-4-b40a506-3 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=./2.5.0-4-b40a506-3 -prefs=runtime.tools.python3.path=./3.7.2-post1-4 -prefs=runtime.tools.python3-3.7.2-post1.path=./3.7.2-post1-4 -verbose ./BuilderLinux.ino`, { shell: true, maxBuffer: 1024 * 1024 * 500 }, (err) => {
  //           //   if (err) console.log(err)
  //           //   else {
  //           //     console.log('[INFO] Done Compile and Uploading');
  //           //   }
  //           // })
  //           // ls.stdout.on('data', (data) => {
  //           //   console.log(`stdout: ${data}`);
  //           // });
  //           // ls.stderr.on('data', (data) => {
  //           //   console.error(`stderr: ${data}`);
  //           // });
  //           // ls.on('close', (code) => {
  //           //   console.log(`child process exited with code ${code}`);
  //           // });




  //           //////////BACKUP MACOS just uploading//////////
  //           // exec(`python3 ${esptoolPath} --chip esp8266 --port ${port} --baud ${baud} --before default_reset --after hard_reset write_flash 0x0 ArduinoBuilder/build/ArduinoBuilder.ino.bin`, err => {
  //           //   if (err) console.log('[INFO] ', err)
  //           //   else {
  //           //     console.log('[INFO] Done Uploading');
  //           //   }
  //           // })
  //         }
  //       })
  //     } else { console.log(`[INFO] Download failed: ${state}`) }
  //   })
  // })
  //////////////////////////////////////////////////////////////////////////////////////////


  mainWindow.webContents.openDevTools()
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    //* Recover original .ino from ./tmp

    fs.copyFile('./tmp/ArduinoBuilder-Recovery.ino', './ArduinoBuilder/ArduinoBuilder.ino', (err) => {
      if (err) console.log(err)
      else {
        console.log('[INFO] Suddenly Stopped >> Recovery .ino File');
      }
    })
    fs.copyFile('./tmp/ArduinoBuilder-Recovery.ino', './BuilderLinux/BuilderLinux.ino', (err) => {
      if (err) console.log(err)
      else {
        console.log('[INFO] Suddenly Stopped >> Recovery .ino File');
      }
    })
    fs.copyFile(`${path.join(__dirname, "tmp", "ArduinoBuilder-Recovery.ino")}`, `${path.join(__dirname, "arduino-cli_0.9.0_Windows_64bit", "BuilderWindows", "BuilderWindows.ino")}`, (err) => {
      if (err) console.log(err)
      else {
        console.log('[INFO] Suddenly Stopped >> Recovery .ino File');
      }
    })

    mainWindow = null
  })

  // TODO: Save current switch state to firebase
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
