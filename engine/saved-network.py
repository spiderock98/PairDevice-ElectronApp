# window OS
import subprocess
# dctSaveWifi = dict()
data = subprocess.check_output(
    ['netsh', 'wlan', 'show', 'profiles']).decode('utf-8').split('\n')
# print((data))
profiles = [i.split(":")[1][1:-1] for i in data if "All User Profile" in i]
for i in profiles:
    results = subprocess.check_output(
        ['netsh', 'wlan', 'show', 'profile', i, 'key=clear']).decode('utf-8').split('\n')
    results = [b.split(":")[1][1:-1] for b in results if "Key Content" in b]
    try:
        # dctSaveWifi[i] = results[0]
        print(i)
        print(results[0])
    except IndexError:
        # dctSaveWifi[i] = ""
        print("")
# print(dctSaveWifi)
