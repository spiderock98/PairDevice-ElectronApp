// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { PythonShell } = require("python-shell");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const config = require(path.join(__dirname, "config", "config.json"));

const replaceText = (selector, text) => {
  const element = document.getElementById(selector);
  if (element) element.innerText = text;
};

//!=======================/verify user uid/=======================!//
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

const detectSSIDs = () => {
  let opts = {
    scriptPath: path.join(__dirname, "/engine/"),
    // pythonPath: 'C:/Users/nguye/AppData/Local/Programs/Python/Python38-32'
    // pythonPath: 'C:/Python38'
  };
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
  let opts = {
    scriptPath: path.join(__dirname, "/engine/"),
    // pythonPath: 'C:/Users/nguye/AppData/Local/Programs/Python/Python38-32'
    // pythonPath: 'C:/Python38'
  };
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

const findSavedPsk = () => {
  //!==================/find SAVED PASSWORD on ssid combo changed/==================!//
  let opts = {
    scriptPath: path.join(__dirname, "/engine/"),
    // pythonPath: 'C:/Users/nguye/AppData/Local/Programs/Python/Python38-32'
    // pythonPath: 'C:/Python38'
  };
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

window.addEventListener("DOMContentLoaded", () => {
  // put this line here because suddenly error when load in header :(
  const Swal = require("sweetalert2");

  //!=============/here is when HOME site loaded => not in AUTH site/=============!//


  //!==============/refresh port and ssid when select or refresh/==============!//
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

    console.log("[INFO] Editing ino file ...");

    let espSrcCode = fs.readFileSync(inoPath, { encoding: "utf-8" });
    let replaceData = espSrcCode
      .replace("taikhoan", ssid)
      .replace("matkhau", psk)
      .replace("dinhdanh", uid)
      .replace("physicalID", name);

    fs.writeFileSync(inoPath, replaceData);
    console.log("[INFO] Building ...");
    // init some stuff
    // let chosenMCU = (board == "ESP32 Dev Module") ? config.addURLsESP32 : config.addURLsESP8266
    // let chosenCore = (board == "ESP32 Dev Module") ? "esp32:esp32" : "esp8266:esp8266"
    // let chosenBaudrate = (board == "ESP32 Dev Module") ? `UploadSpeed=${baud}` : `baud=${baud}`

    let chosenMCU, chosenCore, chosenBaudrate, enumId;
    switch (board) {
      case "NodeMCU ESP8266 v1.0":
        chosenMCU = config.addURLsESP8266;
        chosenCore = "esp8266:esp8266";
        chosenBaudrate = `,baud=${baud}`;
        enumId = 1;
        break;

      case "AI Thinker ESP32-CAM":
        chosenMCU = config.addURLsESP32;
        chosenCore = "esp32:esp32";
        chosenBaudrate = "";
        enumId = 2;
        break;

      case "WeMos ESP8266 D1 R1":
        chosenMCU = config.addURLsESP8266;
        chosenCore = "esp8266:esp8266";
        chosenBaudrate = `,baud=${baud}`;
        enumId = 3;
        break;

      case "ESP32 Dev Module":
        chosenMCU = config.addURLsESP32;
        chosenCore = "esp32:esp32";
        chosenBaudrate = `,UploadSpeed=${baud}`;
        enumId = 4;
        break;

      default:
        break;
    }


    switch (process.platform) {
      case "win32":
        //!======================//WINDOWS//======================!//
        console.log("[INFO] Windows Deteted");

        let cmdBuild = spawn(
          // `cd ${buildFolderPath} & arduino-cli.exe core install arduino:avr & arduino-cli.exe core update-index --additional-urls ${chosenMCU} & arduino-cli.exe core install ${chosenCore} --additional-urls ${chosenMCU} & arduino-cli.exe compile --additional-urls ${chosenMCU} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=${config[board]}${enumId == 2 ? "" : ","}${chosenBaudrate} ${buildFolderPath}`,
          `cd ${buildFolderPath} & arduino-cli.exe core install arduino:avr & arduino-cli.exe core update-index --additional-urls ${chosenMCU} & arduino-cli.exe core install ${chosenCore} --additional-urls ${chosenMCU} & arduino-cli.exe compile --additional-urls ${chosenMCU} --libraries ${customLibPath} --verbose --fqbn=${config[board]}${chosenBaudrate} ${buildFolderPath}`,
          { shell: true },
          (err) => {
            if (err) {
              console.error(err);
              fs.writeFile(inoPath, espSrcCode, (err) => {
                if (err) console.error(err);
                else console.log("[INFO] Recovered .ino file");
              });
              //TODO: log error
              return;
            }
          }
        );

        let countOutCmd = 0;
        let countErrCmd = 0;
        // Async Listener
        cmdBuild.stdout.on("data", (log) => {
          countOutCmd = countOutCmd + 1;
          console.log(`stdout[${countOutCmd}]: ${log}`);
          $("#progressCompiler").attr(
            "style",
            `width: ${(countOutCmd / 125) * 100}%`
          );
        });
        cmdBuild.stderr.on("data", (err) => {
          console.error(`stderr: ${err}`);
          countErrCmd = countErrCmd + 1;
        });
        cmdBuild.on("close", (code) => {
          console.log(
            `[SUCCESS] child process COMPILE exited with code ${code}`
          );
          console.log(
            `[INFO] countOut: ${countOutCmd}, countErr: ${countErrCmd}`
          );

          fs.writeFile(inoPath, espSrcCode, (err) => {
            if (err) console.error(err);
            else console.log("[INFO] Recovered .ino file");
          });

          console.log("[INFO] Begin Uploading ...");
          let cmdUpload = spawn(
            `cd ${buildFolderPath} & arduino-cli.exe upload --verbose --port ${port} --fqbn=${config[board]}${chosenBaudrate} ${buildFolderPath}`,
            { shell: true },
            (err) => {
              if (err) {
                console.error(err);
                return;
              }
            }
          );
          // Async Listener
          cmdUpload.stdout.on("data", (log) => {
            countOutCmd = countOutCmd + 1;
            console.log(`stdout[${countOutCmd}]: ${log}`);
            $("#progressCompiler").attr(
              "style",
              `width: ${(countOutCmd / 125) * 100}%`
            );
          });
          cmdUpload.stderr.on("data", (err) => {
            console.error(`stderr: ${err}`);
            countErrCmd = countErrCmd + 1;
          });
          cmdUpload.on("close", (code) => {
            console.log(`[SUCCESS] child process UPLOADING exited with code ${code}`);

            //?===================/when everything is done successfully/===================?//
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
          })
        });
        break;

      case "darwin":
        //!======================/ MACOS /======================!//
        console.log("[INFO] MacOS Deteted");
        let terminalBuild = spawn(
          `cd ${buildFolderPath} && ./arduino-cli core install arduino:avr && ./arduino-cli core update-index --additional-urls ${chosenMCU} && ./arduino-cli core install ${chosenCore} --additional-urls ${chosenMCU} && ./arduino-cli compile --additional-urls ${chosenMCU} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=${config[board]}${chosenBaudrate} ${buildFolderPath}`,
          { shell: true, maxBuffer: 1024 * 1024 * 500 },
          (err) => {
            if (err) {
              console.error(err);
              fs.writeFile(inoPath, espSrcCode, (err) => {
                if (err) console.error(err);
                else console.log("[INFO] Recovered .ino file");
              });
              //TODO: log error
              return;
            }
          }
        );
        let countOutTerminal = 0;
        let countErrTerminal = 0;
        // Async Listener
        terminalBuild.stdout.on("data", (data) => {
          countOutTerminal = countOutTerminal + 1;
          console.log(`stdout[${countOutTerminal}]: ${data}`);
          $("#progressCompiler").attr(
            "style",
            `width: ${(countOutTerminal / 125) * 100}%`
          );
          // document.getElementById('compilerLog').innerHTML = data
        });
        terminalBuild.stderr.on("data", (data) => {
          console.error(`stderr: ${data}`);
          countErrTerminal = countErrTerminal + 1;
        });
        terminalBuild.on("close", (code) => {
          console.log(
            `[SUCCESS] child process COMPILER exited with code ${code}`
          );
          console.log(
            `[INFO] countOut: ${countOutTerminal}, countErr: ${countErrTerminal}`
          );

          //?===================/ when everything is done successfully /===================?//

          fs.writeFile(inoPath, espSrcCode, (err) => {
            if (err) console.error(err);
            else console.log("[INFO] Recovered .ino file");
          });

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
        });
        break;

      default:
        console.error("[INFO] Your Operating System is not supported");
        break;
    }
  });

  //!============/ collect modal info of new DEVICE and POST new DEVICE /============!//
  $("#formDevice").on('submit', (event) => {
    event.preventDefault();

    const deviceName = $("#formDevice").find("input[name='deviceName']").val();

  })
});
