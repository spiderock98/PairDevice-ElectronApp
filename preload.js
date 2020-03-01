// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { PythonShell } = require('python-shell')
const path = require('path')

const replaceText = (selector, text) => {
  const element = document.getElementById(selector)
  if (element) element.innerText = text
}



function detectSSIDs() {
  let opts = {
    scriptPath: path.join(__dirname, '/engine/'),
    // pythonPath: 'C:/Program Files/Python37'
  }
  let wifi = new PythonShell('detect-network.py', opts)

  wifi.on('message', message => {
    let txtMore = '<option>' + message + '</option>'
    $("#inputGroupSelectSSID").append(txtMore)
  })
  wifi.end((err) => { if (err) console.log(err) })
}

window.addEventListener('DOMContentLoaded', () => {
  const Swal = require('sweetalert2') // here because suddenly error when load first :(
  // for (const type of ['chrome', 'node', 'electron']) {
  //   replaceText(`${type}-version`, process.versions[type])
  // }

  // when home site loaded => not in auth site
  if (document.getElementById('inputGroupSelectSSID')) {
    detectSSIDs()
  }

  $("#btnReSSID").click(() => detectSSIDs())

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
  wifi.end((err) => { if (err) console.log(err) })

  $("#inputGroupSelectSSID").change(() => {
    let ssid = document.getElementById('inputGroupSelectSSID').value
    if (ssid == 'Other') {
      // Swal.fire('hello world')
      $("#showhideInputTextSSID").removeClass('d-none')
    } else {
      $("#showhideInputTextSSID").addClass('d-none')
    }
    
    indexSSID = $.inArray(ssid, arrSaved)
    if (indexSSID != -1) { // when found psk of corresponding ssid
      document.getElementById('psk').value = arrSaved[indexSSID + 1]
    }
    else { document.getElementById('psk').value = "" }
  })
})