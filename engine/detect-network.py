# import sys
# print ("This is the name of the script: ", sys.argv[0])
# print ("Number of arguments: ", len(sys.argv))
# print ("The arguments are: " , str(sys.argv))

# I tried to use the pip install wifi but it really didn't work.
# So created this

# macos
# import subprocess
# process = subprocess.Popen(
#     ['/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport', '-s', '--xml'], stdout=subprocess.PIPE)
# (out, err) = process.communicate()
# process.wait()
# print(process)
import subprocess
import sys

if sys.platform.startswith('win'):
    resultWin = subprocess.check_output(["netsh", "wlan", "show", "network"])
    resultWin = resultWin.decode("latin1")  # needed in python 3
    resultWin = resultWin.replace("\r", "")
    lstWin = resultWin.split("\n")
    lstWin = lstWin[4:]
    dctAroundSSIDs = dict()
    count = 0
    while count < len(lstWin)-5:
        if count % 5 == 0:
            ssid = lstWin[count].split(': ')
            # dctAroundSSIDs[str(count)] = ssid[1]
            print(ssid[1])
        count += 1
elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
    # this excludes your current terminal "/dev/tty"
    resultLinux = subprocess.check_output(["nmcli", "device", "wifi"])
    resultLinux = resultLinux.decode("latin1") # needed in python 3
    resultLinux = resultLinux.replace("\r","")
    lstLinux = resultLinux.split("\n")
    lstLinux = lstLinux[1:]
    for wifi in lstLinux:
        # wifi = wifi.split('     ')
        # wifi = wifi.split(' ')
        wifi = wifi[7:wifi.find('Infra')]
        try:
            print(wifi)
        except:
            pass
elif sys.platform.startswith('darwin'):
    pass
else:
    raise EnvironmentError('Unsupported platform')


# print(dctAroundSSIDs)


# data = subprocess.check_output(['netsh', 'wlan', 'show', 'network'])
# data = str(data, encoding='latin1')
# print(data)
# print(type(str(data)))
