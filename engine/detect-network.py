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

result2 = subprocess.check_output(["netsh", "wlan", "show", "network"])
result2 = result2.decode("latin1") # needed in python 3
result2 = result2.replace("\r","")
ls = result2.split("\n")
ls = ls[4:]
dctAroundSSIDs = dict()
x = 0
while x < len(ls)-5:
    if x % 5 == 0:
        ssid = ls[x].split(': ')
        # dctAroundSSIDs[str(x)] = ssid[1]
        print(ssid[1])
    x += 1
# print(dctAroundSSIDs)


# data = subprocess.check_output(['netsh', 'wlan', 'show', 'network'])
# data = str(data, encoding='latin1')
# print(data)
# print(type(str(data)))