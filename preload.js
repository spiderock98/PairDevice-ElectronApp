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

// verify user uid
function getCurrentUID() {
  return new Promise((resolve) => {
    $.ajax({
      url: "/auth/getCurrentUID",
      method: "POST",
      success: (uid) => {
        resolve(uid);
      },
    });
  });
}

// function getCurrentPhysicalID() {
//   return new Promise(resolve => {
//     $.ajax({
//       url: "/auth/getCurrentUID",
//       method: "POST",
//       success: (uid) => {
//         resolve(uid)
//       }
//     })
//   })
// }

function detectSSIDs() {
  let opts = {
    scriptPath: path.join(__dirname, "/engine/"),
    // pythonPath: 'C:/Program Files/Python37'
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

function detectPORT() {
  let opts = {
    scriptPath: path.join(__dirname, "/engine/"),
    // pythonPath: 'C:/Program Files/Python37'
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

window.addEventListener("DOMContentLoaded", () => {
  // put this line here because suddenly error when load in header :(
  const Swal = require("sweetalert2");

  // for (const type of ['chrome', 'node', 'electron']) {
  //   replaceText(`${type}-version`, process.versions[type])
  // }

  // when home site loaded => not in auth site
  if (document.getElementById("inputGroupSelectSSID")) {
    detectSSIDs();
    $("#btnReSSID").click(() => {
      detectSSIDs();
      detectPORT();
    });
  }
  if (document.getElementById("inputGroupSelectPORT")) {
    detectPORT();
  }

  //!==================//find saved password on ssid click//==================!//
  let opts = {
    scriptPath: path.join(__dirname, "/engine/"),
    // pythonPath: 'C:/Program Files/Python37'
  };
  let wifi = new PythonShell("saved-network.py", opts);

  var arrSaved = new Array();
  wifi.on("message", (message) => {
    arrSaved.push(message);
  });
  wifi.end((err) => {
    if (err) console.error(err);
  });

  $("#inputGroupSelectSSID").on("change", () => {
    let ssid = document.getElementById("inputGroupSelectSSID").value;
    indexSSID = $.inArray(ssid, arrSaved);
    if (indexSSID != -1) {
      // when found psk of corresponding ssid
      document.getElementById("psk").value = arrSaved[indexSSID + 1];
    } else {
      document.getElementById("psk").value = "";
    }
  });

  $("#formDevice").on("submit", async (event) => {
    event.preventDefault();
    let ssid =
      $("#formDevice").find("input[name='ssid']").val() ||
      $("#formDevice").find("select[name='ssid']").val();
    let psk = $("#formDevice").find("input[name='psk']").val();
    let name = $("#formDevice").find("input[name='name']").val();
    let baud = $("#formDevice").find("select[name='baud']").val();
    let port = $("#formDevice").find("select[name='port']").val();
    let board = $("#formDevice").find("select[name='board']").val();
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
    switch (process.platform) {
      case "win32":
        //!==========================//WINDOWS//==========================!//
        console.log("[INFO] Windows Deteted");
        let cmdBuild = spawn(
          `cd ${buildFolderPath} & arduino-cli.exe core update-index --additional-urls ${config.addURLsESP8266} & arduino-cli.exe compile --additional-urls ${config.addURLsESP8266} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=${config[board]},baud=${baud} ${buildFolderPath}`,
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
            `[SUCCESS] child process COMPILER exited with code ${code}`
          );
          console.log(
            `[INFO] countOut: ${countOutCmd}, countErr: ${countErrCmd}`
          );

          fs.writeFile(inoPath, espSrcCode, (err) => {
            if (err) console.error(err);
            else console.log("[INFO] Recovered .ino file");
          });

          // when everything is done successfully
          $.ajax({
            url: "/home/newDevices",
            method: "POST",
            data: {
              name: $("#formDevice").find("input[name='name']").val(),
              loc: $("#formDevice").find("input[name='loc']").val(),
              //TODO: ssid is <input> or <select>
              ssid:
                $("#formDevice").find("input[name='ssid']").val() ||
                $("#formDevice").find("select[name='ssid']").val(),
              psk: $("#formDevice").find("input[name='psk']").val(),
              baud: $("#formDevice").find("select[name='baud']").val(),
              port: $("#formDevice").find("select[name='port']").val(),
            },
            success: () => {
              location.href = "/devices";
            },
          });
        });
        break;

      case "darwin":
        //!==========================//MACOS//==========================!//
        let terminalBuild = spawn(
          `cd ${buildFolderPath} && ./arduino-cli core update-index --additional-urls ${config.addURLsESP8266} && ./arduino-cli compile --additional-urls ${config.addURLsESP8266} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=${config[board]},baud=${baud} ${buildFolderPath}`,
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

          fs.writeFile(inoPath, espSrcCode, (err) => {
            if (err) console.error(err);
            else console.log("[INFO] Recovered .ino file");
          });

          // when everything is done successfully
          $.ajax({
            url: "/home/newDevices",
            method: "POST",
            data: {
              name: $("#formDevice").find("input[name='name']").val(),
              loc: $("#formDevice").find("input[name='loc']").val(),
              //TODO: ssid is <input> or <select>
              ssid:
                $("#formDevice").find("input[name='ssid']").val() ||
                $("#formDevice").find("select[name='ssid']").val(),
              psk: $("#formDevice").find("input[name='psk']").val(),
              baud: $("#formDevice").find("select[name='baud']").val(),
              port: $("#formDevice").find("select[name='port']").val(),
            },
            success: () => {
              location.href = "/devices";
            },
          });
        });
        break;

      default:
        console.error("Your Operating System is not supported");
        break;
    }
  });
});
