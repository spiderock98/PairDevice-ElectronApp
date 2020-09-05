// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { PythonShell } = require("python-shell");
const path = require("path");
const fs = require("fs");
const { spawn, execFile, exec } = require("child_process");

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
    if (err) console.log("[ERROR] ", err);
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
    if (err) console.log("[ERROR] ", err);
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

  /////// find saved password on ssid click ///////
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
    if (err) console.log("[ERROR] ", err);
  });

  $("#inputGroupSelectSSID").change(() => {
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
    let uid = await getCurrentUID();
    let buildFolder = `${path.join(__dirname, "ArduinoBuilder")}`;
    let fileName = "ArduinoBuilder.ino";
    let inoPath = `${path.join(buildFolder, `${fileName}`)}`;
    let customLibPath = `${path.join(buildFolder, "user_libraries")}`;
    let addURLs =
      "https://arduino.esp8266.com/stable/package_esp8266com_index.json";
    let configPath = `${path.join(__dirname, "config", "arduino-cli.yaml")}`;
    let binPath = `${path.join(buildFolder, "build", `${fileName}.bin`)}`;

    console.log("[INFO] Editing ino file ...");

    let espSrcCode = fs.readFileSync(inoPath, { encoding: "utf-8" })
    let oriData = espSrcCode;
    let replaceData = oriData
        .replace("taikhoan", ssid)
        .replace("matkhau", psk)
        .replace("dinhdanh", uid)
        .replace("physicalID", name)

    fs.writeFileSync(inoPath, replaceData)
    console.log("[INFO] Building ...");
        switch (process.platform) {
          case "win32":
            //!==========================//WINDOWS Buggy//==========================!//
            console.log("[INFO] Windows Deteted");
            let cmdBuild = spawn(
              `cd ${buildFolder} & arduino-cli.exe core update-index --additional-urls ${addURLs} & arduino-cli.exe compile --additional-urls ${addURLs} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=${baud} ${buildFolder}`,
              { shell: true },
              (err) => {
                if (err) {
                  console.error(err);
                  fs.writeFile(inoPath, oriData, (err) => {
                    if (err) console.error(err);
                    console.log("[INFO] Recovered .ino file");
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

              fs.writeFile(inoPath, oriData, (err) => {
                if (err) console.error(err);
                console.log("[INFO] Recovered .ino file");
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
                  console.log("Redirect to home");
                  location.href = "/";
                },
              });
            });
            break;

          case "darwin":
            //!==========================//MACOS a bit laggy//==========================!//
            let terminalBuild = spawn(
              `cd ${buildFolder} && ./arduino-cli core update-index --additional-urls ${addURLs} && ./arduino-cli compile --additional-urls ${addURLs} --libraries ${customLibPath} --upload --verbose --port ${port} --fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=${baud} ${buildFolder}`,
              { shell: true, maxBuffer: 1024 * 1024 * 500 },
              (err) => {
                if (err) {
                  console.error(err);
                  fs.writeFile(inoPath, oriData, (err) => {
                    if (err) console.error(err);
                    console.log("[INFO] Recovered .ino file");
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

              fs.writeFile(inoPath, oriData, (err) => {
                if (err) console.error(err);
                console.log("[INFO] Recovered .ino file");
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
                  console.log("Redirect to home");
                  location.href = "/";
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
