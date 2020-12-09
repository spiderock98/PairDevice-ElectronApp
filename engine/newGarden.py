import sys
import glob
import serial
from time import sleep

# sendStr = '{"ev":"newGarden","uid":"' + str(sys.argv[1]) + '","ssid":"' + str(
#     sys.argv[2]) + '","psk":"' + str(sys.argv[3]) + '"}\n'
# # print(sendStr)

# if sys.platform.startswith('win'):
#     ports = ['COM%s' % (i + 1) for i in range(256)]
# elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
#     # this excludes your current terminal "/dev/tty"
#     ports = glob.glob('/dev/tty[A-Za-z]*')
# elif sys.platform.startswith('darwin'):
#     ports = glob.glob('/dev/tty.*')
# else:
#     raise EnvironmentError('Unsupported platform')

# for port in ports:
#     try:
#         # scanner try to open every port
#         ser = serial.Serial(port, 115200)
#         ser.write(sendStr.encode())
#         ser.close()

#         # wait for ack
#         # captureSerial = ord(ser.read(1))
#         # if (captureSerial == 110):
#         #     break

#     except (OSError, serial.SerialException):
#         pass


sendStr = '{"ev":"newGarden","uid":"' + str(sys.argv[1]) + '","ssid":"' + str(
    sys.argv[2]) + '","psk":"' + str(sys.argv[3]) + '"}\n'

try:
    ser = serial.Serial(str(sys.argv[4]), 115200)
    ser.write(sendStr.encode())
    ser.close()

    # wait for ack
    # captureSerial = ord(ser.read(1))
    # if (captureSerial == 110):
    #     break

except (OSError, serial.SerialException):
    pass
