// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { PythonShell } = require("python-shell");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const config = require(path.join(__dirname, "config", "config.json"));
const player = require('node-wav-player');


const replaceText = (selector, text) => {
  const element = document.getElementById(selector);
  if (element) element.innerText = text;
};

//!=======================/ verify user uid /=======================!//
const getCurrentUID = () => {
  return new Promise(resolve => {
    $.ajax({
      url: "/auth/getCurrentUID",
      method: "POST",
      success: (uid) => {
        resolve(uid);
      },
    });
  });
}

const getCurrentPhysicalID = () => {
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


let opts = {
  scriptPath: path.join(__dirname, "/engine/"),
  // pythonPath: 'C:/Users/nguye/AppData/Local/Programs/Python/Python39'
  // pythonPath: 'C:/Program Files/Python39'
};


const detectSSIDs = () => {
  let wifi = new PythonShell("detect-network.py", opts);

  $("#inputGroupSelectSSID .manual").remove();
  wifi.on("message", (message) => {
    let txtMore = '<option class="manual">' + message + "</option>";
    $("#inputGroupSelectSSID").append(txtMore);
  });
  wifi.end((err) => {
    if (err) console.error(err);
  });
}

const detectPORT = () => {
  let port = new PythonShell("detect-port.py", opts);

  $("#inputGroupSelectPORT option").remove();
  port.on("message", (message) => {
    let txtMore = "<option>" + message + "</option>";
    $("#inputGroupSelectPORT").append(txtMore);
  });
  port.end((err) => {
    if (err) console.error(err);
  });
}

const confirmDelEsp = () => {
  let ackDelEsp = new PythonShell("delEsp32.py", opts);
  ackDelEsp.end((err) => {
    if (err) console.error(err);
  });
}

const findSavedPsk = () => {
  //!==================/ find SAVED PASSWORD on ssid combo changed /==================!//
  let wifi = new PythonShell("saved-network.py", opts);

  var arrSaved = [];
  wifi.on("message", (message) => {
    arrSaved.push(message);
  });
  wifi.end((err) => {
    if (err) console.error(err);
  });

  $("#inputGroupSelectSSID").on("change", () => {
    let ssid = document.getElementById("inputGroupSelectSSID").value;
    let indexSSID = $.inArray(ssid, arrSaved);
    if (indexSSID != -1) {
      // when found psk of corresponding ssid
      document.getElementById("psk").value = arrSaved[indexSSID + 1];
    } else {
      document.getElementById("psk").value = "";
    }
  });
}

const newGarden = (uid, ssid, psk, port) => {
  PythonShell.run("newGarden.py",
    {
      mode: 'text',
      scriptPath: path.join(__dirname, "/engine/"),
      args: [uid, ssid, psk, port],
    },
    (err) => {
      if (err) console.error(err);
    }
  )
}

window.addEventListener("DOMContentLoaded", () => {
  // put this line here because suddenly error when load in header :(
  // const Swal = require("sweetalert2");

  //?=============/here is when HOME site loaded => not in AUTH site/=============?//

  //!==============/ refresh port and ssid when select or refresh /==============!//
  if (document.getElementById("inputGroupSelectSSID")) {
    detectSSIDs();
    $("#btnRefreshSSID").on('click', () => {
      detectSSIDs();
      detectPORT();
    });
  }
  if (document.getElementById("inputGroupSelectPORT")) {
    detectPORT();
  }
  findSavedPsk();

  //!============/ collect modal info of new GARDEN and POST new GARDEN /============!//
  $("#formGarden").on("submit", async (event) => {
    event.preventDefault();
    let ssid =
      $("#formGarden").find("input[name='ssid']").val() ||
      $("#formGarden").find("select[name='ssid']").val();
    let psk = $("#formGarden").find("input[name='psk']").val();
    let name = $("#formGarden").find("input[name='name']").val();
    let baud = $("#formGarden").find("select[name='baud']").val();
    let port = $("#formGarden").find("select[name='port']").val();
    let board = $("#formGarden").find("select[name='board']").val();
    let latCoor = $("#hidLatCoor").text()
    let lngCoor = $("#hidLngCoor").text()
    let uid = await getCurrentUID();
    let buildFolderPath = path.join(__dirname, "ArduinoBuilder");
    let inoPath = path.join(buildFolderPath, "ArduinoBuilder.ino");
    let customLibPath = path.join(buildFolderPath, "user_libraries");

    newGarden(uid, ssid, psk, port); // run python shell script
    player.play({ path: path.join(__dirname, "engine", "noti.wav") });
    console.log("[INFO] Adding New Device To Firebase ...");
    $.ajax({
      url: "/devices/updateGarden",
      method: "POST",
      data: {
        gardenName: $("#formGarden").find("input[name='name']").val(),
        latCoor: latCoor,
        lngCoor: lngCoor,
        place: $("#formGarden").find("input[name='locat']").val(),
        // ssid:
        //   $("#formGarden").find("input[name='ssid']").val() ||
        //   $("#formGarden").find("select[name='ssid']").val(),
        // psk: $("#formGarden").find("input[name='psk']").val(),
        // baud: $("#formGarden").find("select[name='baud']").val(),
        // port: $("#formGarden").find("select[name='port']").val(),
      },
      success: () => {
        location.href = "/devices";
      },
    });


    //! comment0
    // console.log("[INFO] Editing ino file ...");
    // let espSrcCode = fs.readFileSync(inoPath, { encoding: "utf-8" });
    // let replaceData = espSrcCode
    //   .replace("taikhoan", ssid)
    //   .replace("matkhau", psk)
    //   .replace("dinhdanh", uid)
    //   .replace("physicalID", name);
    // fs.writeFileSync(inoPath, replaceData);
    // console.log("[INFO] Building ...");
    // let chosenMCU, chosenCore, chosenBaudrate, enumId;

    //! comment1
    // switch (board) {
    //   case "NodeMCU ESP8266 v1.0":
    //     chosenMCU = config.addURLsESP8266;
    //     chosenCore = "esp8266:esp8266";
    //     chosenBaudrate = `,baud=${baud}`;
    //     enumId = 1;
    //     break;

    //   case "AI Thinker ESP32-CAM":
    //     chosenMCU = config.addURLsESP32;
    //     chosenCore = "esp32:esp32";
    //     chosenBaudrate = "";
    //     enumId = 2;
    //     break;

    //   case "WeMos ESP8266 D1 R1":
    //     chosenMCU = config.addURLsESP8266;
    //     chosenCore = "esp8266:esp8266";
    //     chosenBaudrate = `,baud=${baud}`;
    //     enumId = 3;
    //     break;

    //   case "ESP32 Dev Module":
    //     chosenMCU = config.addURLsESP32;
    //     chosenCore = "esp32:esp32";
    //     chosenBaudrate = `,UploadSpeed=${baud}`;
    //     enumId = 4;
    //     break;

    //   default:
    //     break;
    // }

    //! comment2

    // switch (process.platform) {
    //   case "win32":
    //     //!======================/ WINDOWS /======================!//
    //     console.log("[INFO] Windows Deteted");

    //     let cmdBuild = spawn(
    //       `cd ${buildFolderPath} & arduino-cli.exe core install arduino:avr & arduino-cli.exe core update-index --additional-urls ${chosenMCU} & arduino-cli.exe core install ${chosenCore} --additional-urls ${chosenMCU} & arduino-cli.exe compile --additional-urls ${chosenMCU} --libraries ${customLibPath} --fqbn=${config[board]}${chosenBaudrate} ${buildFolderPath}`,
    //       { shell: true },
    //       (err) => {
    //         if (err) {
    //           console.error(err);
    //           fs.writeFile(inoPath, espSrcCode, (err) => {
    //             if (err) console.error(err);
    //             else console.log("[INFO] Recovered .ino file");
    //           });
    //           return;
    //         }
    //       }
    //     );

    //     // Async Listener
    //     cmdBuild.stdout.on("data", (log) => {
    //       console.log(log);
    //     });
    //     cmdBuild.stderr.on("data", (err) => { console.error(err); });
    //     cmdBuild.on("close", (code) => {
    //       //? ======/ no error >> continue /====== ?//
    //       if (code == 0) {
    //         player.play({ path: path.join(__dirname, "engine", "noti.wav") });
    //         console.log(
    //           `[SUCCESS] child process COMPILED exited with code ${code}`
    //         );

    //         fs.writeFile(inoPath, espSrcCode, (err) => {
    //           if (err) console.error(err);
    //           else console.log("[INFO] Recovered .ino file");
    //         });

    //         console.log("[INFO] Uploading ...");
    //         let cmdUpload = spawn(
    //           `cd ${buildFolderPath} & arduino-cli.exe upload --verbose --port ${port} --fqbn=${config[board]}${chosenBaudrate} ${buildFolderPath}`,
    //           { shell: true },
    //           (err) => {
    //             if (err) {
    //               console.error(err);
    //               return;
    //             }
    //           }
    //         );
    //         // Async Listener
    //         cmdUpload.stdout.on("data", (log) => {
    //           console.log(log);
    //         });
    //         cmdUpload.stderr.on("data", (err) => { console.error(err); });
    //         cmdUpload.on("close", (code) => {
    //           //?=========/ when everything is done successfully /=========?//
    //           if (code == 0) {
    //             console.log(`[SUCCESS] child process UPLOADING exited with code ${code}`);
    //             // request ESP32 clear EEPROM via UART
    //             // confirmDelEsp();

    //             player.play({ path: path.join(__dirname, "engine", "noti.wav") });
    //             console.log("[INFO] Adding New Device To Firebase ...");
    //             $.ajax({
    //               url: "/devices/updateGarden",
    //               method: "POST",
    //               data: {
    //                 gardenName: $("#formGarden").find("input[name='name']").val(),
    //                 latCoor: latCoor,
    //                 lngCoor: lngCoor,
    //                 place: $("#formGarden").find("input[name='locat']").val(),
    //                 // ssid:
    //                 //   $("#formGarden").find("input[name='ssid']").val() ||
    //                 //   $("#formGarden").find("select[name='ssid']").val(),
    //                 // psk: $("#formGarden").find("input[name='psk']").val(),
    //                 // baud: $("#formGarden").find("select[name='baud']").val(),
    //                 // port: $("#formGarden").find("select[name='port']").val(),
    //               },
    //               success: () => {
    //                 location.href = "/devices";
    //               },
    //             });
    //           }
    //           else {
    //             console.log(`[FAILED] child process UPLOADING exited with code ${code}`);
    //             player.play({ path: path.join(__dirname, "engine", "noti.wav") });
    //           }
    //         })
    //       }
    //       else {
    //         console.log(`[FAILED] child process COMPILED exited with code ${code}`);
    //         player.play({ path: path.join(__dirname, "engine", "noti.wav") });
    //         fs.writeFile(inoPath, espSrcCode, (err) => {
    //           if (err) console.error(err);
    //           else console.log("[INFO] Recovered .ino file");
    //         });
    //       }
    //     });
    //     break;

    //   //TODO: fix cmd macos like winodows
    //   case "darwin":
    //     //!======================/ MACOS /======================!//
    //     console.log("[INFO] MacOS Deteted");
    //     let terminalBuild = spawn(
    //       `cd ${buildFolderPath} && ./arduino-cli core install arduino:avr && ./arduino-cli core update-index --additional-urls ${chosenMCU} && ./arduino-cli core install ${chosenCore} --additional-urls ${chosenMCU} && ./arduino-cli compile --additional-urls ${chosenMCU} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=${config[board]}${chosenBaudrate} ${buildFolderPath}`,
    //       { shell: true, maxBuffer: 1024 * 1024 * 500 },
    //       (err) => {
    //         if (err) {
    //           console.error(err);
    //           fs.writeFile(inoPath, espSrcCode, (err) => {
    //             if (err) console.error(err);
    //             else console.log("[INFO] Recovered .ino file");
    //           });
    //           //TODO: log error
    //           return;
    //         }
    //       }
    //     );
    //     let countOutTerminal = 0;
    //     let countErrTerminal = 0;
    //     // Async Listener
    //     terminalBuild.stdout.on("data", (data) => {
    //       countOutTerminal = countOutTerminal + 1;
    //       console.log(`stdout[${countOutTerminal}]: ${data}`);
    //       $("#progressCompiler").attr(
    //         "style",
    //         `width: ${(countOutTerminal / 125) * 100}%`
    //       );
    //       // document.getElementById('compilerLog').innerHTML = data
    //     });
    //     terminalBuild.stderr.on("data", (data) => {
    //       console.error(`stderr: ${data}`);
    //       countErrTerminal = countErrTerminal + 1;
    //     });
    //     terminalBuild.on("close", (code) => {
    //       console.log(
    //         `[SUCCESS] child process COMPILER exited with code ${code}`
    //       );
    //       console.log(
    //         `[INFO] countOut: ${countOutTerminal}, countErr: ${countErrTerminal}`
    //       );

    //       //?===================/ when everything is done successfully /===================?//

    //       fs.writeFile(inoPath, espSrcCode, (err) => {
    //         if (err) console.error(err);
    //         else console.log("[INFO] Recovered .ino file");
    //       });

    //       $.ajax({
    //         url: "/devices/updateGarden",
    //         method: "POST",
    //         data: {
    //           gardenName: $("#formGarden").find("input[name='name']").val(),
    //           latCoor: latCoor,
    //           lngCoor: lngCoor,
    //           place: $("#formGarden").find("input[name='locat']").val(),
    //           // ssid:
    //           //   $("#formGarden").find("input[name='ssid']").val() ||
    //           //   $("#formGarden").find("select[name='ssid']").val(),
    //           // psk: $("#formGarden").find("input[name='psk']").val(),
    //           // baud: $("#formGarden").find("select[name='baud']").val(),
    //           // port: $("#formGarden").find("select[name='port']").val(),
    //         },
    //         success: () => {
    //           location.href = "/devices";
    //         },
    //       });
    //     });
    //     break;

    //   default:
    //     console.error("[INFO] Your Operating System is not supported");
    //     break;
    // }
  });

  //!============/ collect modal info of new DEVICE and POST new DEVICE /============!//
  $("#formDevice").on('submit', (event) => {
    event.preventDefault();

    const deviceName = $("#formDevice").find("input[name='deviceName']").val();

  })
});
