// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { PythonShell } = require('python-shell')
const path = require('path')
const fs = require('fs')
const { spawn, execFile, exec } = require('child_process')

const replaceText = (selector, text) => {
  const element = document.getElementById(selector)
  if (element) element.innerText = text
}

// verify user uid
function getCurrentUID() {
  return new Promise(resolve => {
    $.ajax({
      url: "/auth/getCurrentUID",
      method: "POST",
      success: (uid) => {
        resolve(uid)
      }
    })
  })
}

function detectSSIDs() {
  let opts = {
    scriptPath: path.join(__dirname, '/engine/'),
    // pythonPath: 'C:/Program Files/Python37'
  }
  let wifi = new PythonShell('detect-network.py', opts)

  $("#inputGroupSelectSSID .manual").remove()
  wifi.on('message', message => {
    let txtMore = '<option class="manual">' + message + '</option>'
    $("#inputGroupSelectSSID").append(txtMore)
  })
  wifi.end((err) => { if (err) console.log('[ERROR] ', err) })
}

function detectPORT() {
  let opts = {
    scriptPath: path.join(__dirname, '/engine/'),
    // pythonPath: 'C:/Program Files/Python37'
  }
  let port = new PythonShell('detect-port.py', opts)

  $("#inputGroupSelectPORT option").remove()
  port.on('message', message => {
    let txtMore = '<option>' + message + '</option>'
    $("#inputGroupSelectPORT").append(txtMore)
  })
  port.end((err) => { if (err) console.log('[ERROR] ', err) })
}

window.addEventListener('DOMContentLoaded', () => {
  // put this line here because suddenly error when load in header :(
  const Swal = require('sweetalert2')

  // for (const type of ['chrome', 'node', 'electron']) {
  //   replaceText(`${type}-version`, process.versions[type])
  // }

  // when home site loaded => not in auth site
  if (document.getElementById('inputGroupSelectSSID')) {
    detectSSIDs()
    $("#btnReSSID").click(() => {
      detectSSIDs()
      detectPORT()
    })
  }
  if (document.getElementById('inputGroupSelectPORT')) {
    detectPORT()
  }

  /////// find saved password on ssid click ///////
  let opts = {
    scriptPath: path.join(__dirname, '/engine/'),
    // pythonPath: 'C:/Program Files/Python37'
  }
  let wifi = new PythonShell('saved-network.py', opts)

  var arrSaved = new Array()
  wifi.on('message', message => {
    arrSaved.push(message)
  })
  wifi.end((err) => { if (err) console.log('[ERROR] ', err) })

  $("#inputGroupSelectSSID").change(() => {
    let ssid = document.getElementById('inputGroupSelectSSID').value
    indexSSID = $.inArray(ssid, arrSaved)
    if (indexSSID != -1) { // when found psk of corresponding ssid
      document.getElementById('psk').value = arrSaved[indexSSID + 1]
    }
    else { document.getElementById('psk').value = "" }
  })

  $("#formDevice").on('submit', async (event) => {
    event.preventDefault()
    // DONE: ssid is < input > or < select >
    let ssid = $('#formDevice').find("input[name='ssid']").val() || $('#formDevice').find("select[name='ssid']").val()
    let psk = $('#formDevice').find("input[name='psk']").val()
    let baud = $('#formDevice').find("select[name='baud']").val()
    let port = $('#formDevice').find("select[name='port']").val()
    let esptoolPath = path.join(__dirname, 'esptool', 'esptool.py')
    let uid = await getCurrentUID()

    // let buildFolder = `${path.join(__dirname, 'BuilderLinux')}`
    // let fileName = 'BuilderLinux.ino'

    /////////////////////COMMENT FROM HERE
    let buildFolder = `${path.join(__dirname, 'ArduinoBuilder')}`
    let fileName = 'ArduinoBuilder.ino'

    let inoPath = `${path.join(buildFolder, `${fileName}`)}`
    let customLibPath = `${path.join(buildFolder, "user_libraries")}`
    let addURLs = "https://arduino.esp8266.com/stable/package_esp8266com_index.json"
    let configPath = `${path.join(__dirname, "config", "arduino-cli.yaml")}`
    let binPath = `${path.join(buildFolder, 'build', `${fileName}.bin`)}`

    console.log('[INFO] Editing .ino info');

    fs.readFile(inoPath, { encoding: 'utf-8' }, (err, data) => {
      if (err) { console.log('[ErrInfo] ', err); return; }
      let oriData = data
      let replaceData = oriData.replace('taikhoan', ssid).replace('matkhau', psk).replace('dinhdanh', uid)
      fs.writeFile(inoPath, replaceData, err => {
        if (err) { console.log('[ErrInfo] ', err); return; }

        //!MACOS a bit laggy
        console.log('[INFO] Building ...')
        let terminalBuild = spawn(`cd ${buildFolder} && ./arduino-cli core update-index --additional-urls ${addURLs} && ./arduino-cli compile --additional-urls ${addURLs} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=${baud} ${buildFolder}`, { shell: true, maxBuffer: 1024 * 1024 * 500 }, (err) => {
          if (err) {
            console.log('[ERROR] ', err)
            fs.writeFile(inoPath, oriData, (err) => {
              if (err) console.log('[ERROR] ', err)
              console.log('[INFO] Recovered .ino file')
            })
            //TODO: log error
            return
          }
        })

        let countOut = 0
        let countErr = 0

        // Async Listener
        terminalBuild.stdout.on('data', (data) => {
          countOut = countOut + 1
          console.log(`stdout[${countOut}]: ${data}`)
          $("#progressCompiler").attr('style', `width: ${countOut / 98 * 100}%`)
          // document.getElementById('compilerLog').innerHTML = data
        });
        terminalBuild.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`)
          countErr = countErr + 1
        });
        terminalBuild.on('close', (code) => {
          console.log(`[SUCCESS] child process COMPILER exited with code ${code}`)
          console.log(`[INFO] countOut: ${countOut}, countErr: ${countErr}`)

          fs.writeFile(inoPath, oriData, (err) => {
            if (err) console.log('[ERROR] ', err)
            console.log('[INFO] Recovered .ino file')
          })

          // when everything is done successfully
          $.ajax({
            url: '/home/newDevices',
            method: 'POST',
            data: {
              name: $('#formDevice').find("input[name='name']").val(),
              loc: $('#formDevice').find("input[name='loc']").val(),
              //TODO: ssid is <input> or <select>
              ssid: $('#formDevice').find("input[name='ssid']").val() || $('#formDevice').find("select[name='ssid']").val(),
              psk: $('#formDevice').find("input[name='psk']").val(),
              baud: $('#formDevice').find("select[name='baud']").val(),
              port: $('#formDevice').find("select[name='port']").val(),
            },
            success: () => {
              console.log("Redirect to home");
              location.href = '/'
            }
          })
        })
      })
    })
    /////////////////////////////////


    // !Linux a bit laggy
    // console.log('[INFO] Building ...')
    // let terminalBuild = spawn(`cd ${buildFolder} && ./arduino-builder -compile -logger=machine -hardware ./hardware -hardware ./packages -tools ./tools-builder -tools ./avr -tools ./packages -built-in-libraries ./libraries-build-in -libraries ./user_libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=${baud} -vid-pid=10C4_EA60 -ide-version=10811 -build-path ./build -warnings=none -build-cache ./.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=./2.5.0-4-b40a506-1 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=./2.5.0-4-b40a506-1 -prefs=runtime.tools.mklittlefs.path=./2.5.0-4-69bd9e6-2 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=./2.5.0-4-69bd9e6-2 -prefs=runtime.tools.mkspiffs.path=./2.5.0-4-b40a506-3 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=./2.5.0-4-b40a506-3 -prefs=runtime.tools.python3.path=./3.7.2-post1-4 -prefs=runtime.tools.python3-3.7.2-post1.path=./3.7.2-post1-4 -verbose ${inoPath}`, { shell: true, maxBuffer: 1024 * 1024 * 500 }, (err) => {
    //   if (err) {
    //     console.log('[ERROR] ', err)
    //     fs.writeFile(inoPath, oriData, (err) => {
    //       if (err) console.log('[ERROR] ', err)
    //       console.log('[INFO] Recovered .ino file')
    //     })
    //     //TODO: log error
    //     return
    //   }
    // })

    // let countOut = 0
    // let countErr = 0

    // // Async Listener
    // terminalBuild.stdout.on('data', (data) => {
    //   countOut = countOut + 1
    //   // console.log(`stdout[${countOut}]: ${data}`)
    //   $("#progressCompiler").attr('style', `width: ${countOut / 90 * 100}%`)
    //   // document.getElementById('compilerLog').innerHTML = data
    // });
    // terminalBuild.stderr.on('data', (data) => {
    //   console.error(`stderr: ${data}`)
    //   countErr = countErr + 1
    // });
    // terminalBuild.on('close', (code) => {
    //   console.log(`[SUCCESS] child process COMPILER exited with code ${code}`)
    //   console.log(`[INFO] countOut: ${countOut}, countErr: ${countErr}`)

    //   fs.writeFile(inoPath, oriData, (err) => {
    //     if (err) console.log('[ERROR] ', err)
    //     console.log('[INFO] Recovered .ino file')
    //   })

    //   console.log('[INFO] Start Uploading ...');
    //   let terminalUpload = spawn(`cd ${buildFolder} && python3 ${esptoolPath} --chip esp8266 --port ${port} --baud ${baud} --before default_reset --after hard_reset write_flash 0x0 ${binPath}`, { shell: true }, (err) => {
    //     if (err) console.log('[ERROR] ', err)
    //   })

    //   // Async Listener
    //   terminalUpload.stdout.on('data', (data) => {
    //     console.log(`stdout: ${data}`);
    //   });
    //   terminalUpload.stderr.on('data', (data) => {
    //     console.error(`stderr: ${data}`);
    //   });
    //   terminalUpload.on('close', (code) => {
    //     console.log(`[SUCCESS] child process UPLOAD exited with code ${code}`);

    //     // Everything is done
    //     $.ajax({
    //       url: '/home/newDevices',
    //       method: 'POST',
    //       data: {
    //         name: $('#formDevice').find("input[name='name']").val(),
    //         loc: $('#formDevice').find("input[name='loc']").val(),
    //         //TODO: ssid is <input> or <select>
    //         ssid: $('#formDevice').find("input[name='ssid']").val(),
    //         psk: $('#formDevice').find("input[name='psk']").val(),
    //         baud: $('#formDevice').find("select[name='baud']").val(),
    //         port: $('#formDevice').find("select[name='port']").val(),
    //       },
    //       success: () => {
    //         location.href = '/'
    //       }
    //     })
    //   });
    // });
    /////////////////////////////////


    //////////WINDOWS-buggy//////////
    // let buildFolder = `${path.join(__dirname, "arduino-cli_0.9.0_Windows_64bit")}`
    // let fileName = 'BuilderWindows.ino'
    // let folderName = 'BuilderWindows'

    // let inoPath = `${path.join(buildFolder, folderName, `${fileName}`)}`

    // console.log('[INFO] Editing .ino info');
    // fs.readFile(inoPath, { encoding: 'utf-8' }, (err, data) => {
    //   if (err) { console.log('[INFO] ', err); return; }
    //   let oriData = data
    //   let replaceData = oriData.replace('taikhoan', ssid).replace('matkhau', psk).replace('dinhdanh', uid)
    //   fs.writeFile(inoPath, replaceData, err => {
    // if (err) { console.log('[INFO] ', err); return; }

    //     let terminalBuild = spawn(`cd ${buildFolder} && ./arduino-cli core update-index --additional-urls ${addURLs} && ./arduino-cli compile --additional-urls ${addURLs} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=${baud} ${buildFolder}`, { shell: true, maxBuffer: 1024 * 1024 * 500 }, (err) => {
    //     console.log('[INFO] Building ...')
    //     let terminalBuild = spawn(`cd ${buildFolder} && ./arduino-cli.exe compile -p ${port} --fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none ${fileName}`, { maxBuffer: 1024 * 1024 * 500 }, (err) => {
    //       if (err) {
    //         console.log('[ERROR] ', err)
    //         fs.writeFile(inoPath, oriData, (err) => {
    //           if (err) console.log('[ERROR] ', err)
    //           console.log('[INFO] Recovered .ino file')
    //         })
    //         //TODO: log error
    //         return
    //       }
    //     })

    //     let countOut = 0
    //     let countErr = 0

    //     // Async Listener
    //     terminalBuild.stdout.on('data', (data) => {
    //       countOut = countOut + 1
    //       console.log(`stdout[${countOut}]: ${data}`)
    //       $("#progressCompiler").attr('style', `width: ${countOut / 90 * 100}%`)
    //       // document.getElementById('compilerLog').innerHTML = data
    //     });
    //     terminalBuild.stderr.on('data', (data) => {
    //       console.error(`stderr: ${data}`)
    //       countErr = countErr + 1
    //     });
    //     terminalBuild.on('close', (code) => {
    //       console.log(`[SUCCESS] child process COMPILER exited with code ${code}`)
    //       console.log(`[INFO] countOut: ${countOut}, countErr: ${countErr}`)

    //       fs.writeFile(inoPath, oriData, (err) => {
    //         if (err) console.log('[ERROR] ', err)
    //         console.log('[INFO] Recovered .ino file')
    //       })

    //       console.log('[INFO] Start Uploading ...');
    //       let terminalUpload = exec(`cd ${buildFolder} && ./arduino-cli.exe upload -p ${port} --fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=${baud}`, { windowsHide: true, maxBuffer: 1024 * 1024 * 500 }, (err) => {
    //         if (err) console.log('[ERROR] ', err)
    //       })

    //       // Async Listener
    //       terminalUpload.stdout.on('data', (data) => {
    //         console.log(`stdout: ${data}`);
    //       });
    //       terminalUpload.stderr.on('data', (data) => {
    //         console.error(`stderr: ${data}`);
    //       });
    //       terminalUpload.on('close', (code) => {
    //         // TODO: child process COMPILER exited with code 126 // .ino file error
    //         console.log(`[SUCCESS] child process UPLOAD exited with code ${code}`);

    //         // when everything is done successfully
    //         $.ajax({
    //           url: '/home/newDevices',
    //           method: 'POST',
    //           data: {
    //             name: $('#formDevice').find("input[name='name']").val(),
    //             loc: $('#formDevice').find("input[name='loc']").val(),
    //             //TODO: ssid is <input> or <select>
    //             ssid: $('#formDevice').find("input[name='ssid']").val() || $('#formDevice').find("select[name='ssid']").val(),
    //             psk: $('#formDevice').find("input[name='psk']").val(),
    //             baud: $('#formDevice').find("select[name='baud']").val(),
    //             port: $('#formDevice').find("select[name='port']").val(),
    //           },
    //           success: () => { location.href = '/' }
    //         })
    //       })
    //     })
    //   })
    // })
    /////////////////////////////////




    //////////LINUX too laggy//////////
    // var ls = spawn(`cd /media/spiderock/DATA/Desktop/pair-electron-app/BuilderLinux && ./arduino-builder -compile -logger=machine -hardware ./hardware -hardware ./packages -tools ./tools-builder -tools ./avr -tools ./packages -built-in-libraries ./libraries-build-in -libraries ./user_libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=10C4_EA60 -ide-version=10811 -build-path ./build -warnings=none -build-cache ./.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=./2.5.0-4-b40a506-1 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=./2.5.0-4-b40a506-1 -prefs=runtime.tools.mklittlefs.path=./2.5.0-4-69bd9e6-2 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=./2.5.0-4-69bd9e6-2 -prefs=runtime.tools.mkspiffs.path=./2.5.0-4-b40a506-3 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=./2.5.0-4-b40a506-3 -prefs=runtime.tools.python3.path=./3.7.2-post1-4 -prefs=runtime.tools.python3-3.7.2-post1.path=./3.7.2-post1-4 -verbose ./BuilderLinux.ino`, { shell: true, maxBuffer: 1024 * 1024 * 500 }, (err) => {
    //   if (err) console.log('[ERROR] ', err)
    //   else {
    //     console.log('[INFO] Done Compile and Uploading');
    //   }
    // })
    // ls.stdout.on('data', (data) => {
    //   console.log(`stdout: ${data}`);
    // });
    // ls.stderr.on('data', (data) => {
    //   console.error(`stderr: ${data}`);
    // });
    // ls.on('close', (code) => {
    //   console.log(`child process exited with code ${code}`);
    // });
    /////////////////////////////////



    //////////BACKUP MACOS just uploading//////////
    // exec(`python3 ${esptoolPath} --chip esp8266 --port ${port} --baud ${baud} --before default_reset --after hard_reset write_flash 0x0 ArduinoBuilder/build/ArduinoBuilder.ino.bin`, err => {
    //   if (err) console.log('[INFO] ', err)
    //   else {
    //     console.log('[INFO] Done Uploading');
    //   }
    // })
    /////////////////////////////////

    // var jsonStr = JSON.stringify({
    //   "PORT": port,
    //   "BAUD": baud
    // })
    // fs.writeFile('config/config.json', jsonStr, (err) => {
    //   if (err) console.log(err)
    //   else { console.log('[INFO] Done update config.json') }
    // })
  })
})