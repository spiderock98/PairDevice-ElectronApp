# electron-quick-start

**Clone and run for a quick way to see Electron in action.**

This is a minimal Electron application based on the [Quick Start Guide](https://electronjs.org/docs/tutorial/quick-start) within the Electron documentation.

**Use this app along with the [Electron API Demos](https://electronjs.org/#get-started) app for API code examples to help you get started.**

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](https://electronjs.org/docs/tutorial/quick-start).

## Prerequires
```
pip3 install -r requirement.txt
```

## Reference to package code to execute file
```
electron-packager . mdpreview --platform=win32 --version
```

## Some tools to upload code
```
/////////////////// Windows ///////////////////
"C:\Program Files (x86)\Arduino\arduino-builder.exe" -compile -warnings=default -verbose -logger=humantags -build-options-file=D:\Desktop\Blink\build.options.json -build-path=D:\Desktop\Blink\build -build-cache=D:\Desktop\Blink\.cache D:\Desktop\Blink\Blink.ino


/////////////////// MacOS ///////////////////
// Failed => Consulting
/Applications/Arduino.app/Contents/Java/arduino-builder -compile -warnings=default -verbose -logger=humantags -build-options-file=$(pwd)/build-macos.options.json -build-path=$(pwd)/build -build-cache=$(pwd)/.cache $(pwd)/Blink.ino


// OK Windows/DATA/Desktop/Blink
/Applications/Arduino.app/Contents/Java/arduino-builder -compile -logger=machine -hardware /Applications/Arduino.app/Contents/Java/hardware -hardware /Users/spiderock/Library/Arduino15/packages -tools /Applications/Arduino.app/Contents/Java/tools-builder -tools /Applications/Arduino.app/Contents/Java/hardware/tools/avr -tools /Users/spiderock/Library/Arduino15/packages -built-in-libraries /Applications/Arduino.app/Contents/Java/libraries -libraries /Users/spiderock/Documents/Arduino/libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=0000_0000 -ide-version=10811 -build-path $(pwd)/build -warnings=none -build-cache $(pwd)/.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.mklittlefs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.python3.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -prefs=runtime.tools.python3-3.7.2-post1.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -verbose $(pwd)/ArduinoBuilder.ino


// upload using upload.py
python3 /Users/spiderock/Library/Arduino15/packages/esp8266/hardware/esp8266/2.6.3/tools/upload.py --chip esp8266 --port /dev/cu.SLAB_USBtoUART --baud 115200 --before default_reset --after hard_reset write_flash 0x0 $(pwd)/build/Blink.ino.bin


// upload using esptool.py
python3 /Users/spiderock/Library/Arduino15/packages/esp8266/hardware/esp8266/2.6.3/tools/esptool/esptool.py --chip esp8266 --port /dev/cu.SLAB_USBtoUART --baud 115200 --before default_reset --after hard_reset write_flash 0x0 $(pwd)/build/Blink.ino.bin


// OK MACOS/Desktop/Blink
/Applications/Arduino.app/Contents/Java/arduino-builder -compile -logger=machine -hardware /Applications/Arduino.app/Contents/Java/hardware -hardware /Users/spiderock/Library/Arduino15/packages -tools /Applications/Arduino.app/Contents/Java/tools-builder -tools /Applications/Arduino.app/Contents/Java/hardware/tools/avr -tools /Users/spiderock/Library/Arduino15/packages -built-in-libraries /Applications/Arduino.app/Contents/Java/libraries -libraries /Users/spiderock/Documents/Arduino/libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=0000_0000 -ide-version=10811 -build-path $(pwd)/build -warnings=none -build-cache $(pwd)/.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.python3.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -prefs=runtime.tools.python3-3.7.2-post1.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -prefs=runtime.tools.mkspiffs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.mklittlefs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -verbose $(pwd)/ArduinoBuilder.ino


cd /Users/spiderock/Desktop/compiler && /Applications/Arduino.app/Contents/Java/arduino-builder -compile -logger=machine -hardware /Applications/Arduino.app/Contents/Java/hardware -hardware /Users/spiderock/Library/Arduino15/packages -tools /Applications/Arduino.app/Contents/Java/tools-builder -tools /Applications/Arduino.app/Contents/Java/hardware/tools/avr -tools /Users/spiderock/Library/Arduino15/packages -built-in-libraries /Applications/Arduino.app/Contents/Java/libraries -libraries /Users/spiderock/Documents/Arduino/libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=0000_0000 -ide-version=10811 -build-path $(pwd)/build -warnings=none -build-cache $(pwd)/.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.python3.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -prefs=runtime.tools.python3-3.7.2-post1.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -prefs=runtime.tools.mkspiffs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.mklittlefs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -verbose $(pwd)/compiler.ino


// nodejs quick && command
cd /Volumes/DATA/Desktop/Blink/ && /Applications/Arduino.app/Contents/Java/arduino-builder -compile -logger=machine -hardware /Applications/Arduino.app/Contents/Java/hardware -hardware /Users/spiderock/Library/Arduino15/packages -tools /Applications/Arduino.app/Contents/Java/tools-builder -tools /Applications/Arduino.app/Contents/Java/hardware/tools/avr -tools /Users/spiderock/Library/Arduino15/packages -built-in-libraries /Applications/Arduino.app/Contents/Java/libraries -libraries /Users/spiderock/Documents/Arduino/libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=${baud} -vid-pid=0000_0000 -ide-version=10811 -build-path $(pwd)/build -warnings=none -build-cache $(pwd)/.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.mklittlefs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mklittlefs/2.5.0-4-69bd9e6 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/xtensa-lx106-elf-gcc/2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/mkspiffs/2.5.0-4-b40a506 -prefs=runtime.tools.python3.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -prefs=runtime.tools.python3-3.7.2-post1.path=/Users/spiderock/Library/Arduino15/packages/esp8266/tools/python3/3.7.2-post1 -verbose $(pwd)/Blink.ino && python3 /Users/spiderock/Library/Arduino15/packages/esp8266/hardware/esp8266/2.6.3/tools/esptool/esptool.py --chip esp8266 --port ${port} --baud ${baud} --before default_reset --after hard_reset write_flash 0x0 $(pwd)/build/Blink.ino.bin


////// LOCAL BUILDER ///////
./arduino-builder -compile -logger=machine -hardware ./hardware -hardware ./packages -tools ./tools-builder -tools ./avr -tools ./packages -built-in-libraries ./build_in_libraries -libraries ./user_libraries -fqbn=esp8266:esp8266:nodemcuv2:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,led=2,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200 -vid-pid=0000_0000 -ide-version=10811 -build-path $(pwd)/build -warnings=none -build-cache $(pwd)/.cache -prefs=build.warn_data_percentage=75 -prefs=runtime.tools.xtensa-lx106-elf-gcc.path=./01_2.5.0-4-b40a506 -prefs=runtime.tools.xtensa-lx106-elf-gcc-2.5.0-4-b40a506.path=./01_2.5.0-4-b40a506 -prefs=runtime.tools.python3.path=./02_3.7.2-post1 -prefs=runtime.tools.python3-3.7.2-post1.path=./02_3.7.2-post1 -prefs=runtime.tools.mkspiffs.path=./03_2.5.0-4-b40a506 -prefs=runtime.tools.mkspiffs-2.5.0-4-b40a506.path=./03_2.5.0-4-b40a506 -prefs=runtime.tools.mklittlefs.path=./04_2.5.0-4-69bd9e6 -prefs=runtime.tools.mklittlefs-2.5.0-4-69bd9e6.path=./04_2.5.0-4-69bd9e6 -verbose $(pwd)/ArduinoBuilder.ino
```

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## Resources for Learning Electron

- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation
- [electronjs.org/community#boilerplates](https://electronjs.org/community#boilerplates) - sample starter apps created by the community
- [electron/electron-quick-start](https://github.com/electron/electron-quick-start) - a very basic starter Electron app
- [electron/simple-samples](https://github.com/electron/simple-samples) - small applications with ideas for taking them further
- [electron/electron-api-demos](https://github.com/electron/electron-api-demos) - an Electron app that teaches you how to use Electron
- [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps) - small demo apps for the various Electron APIs

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
