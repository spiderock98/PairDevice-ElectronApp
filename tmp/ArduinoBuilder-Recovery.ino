#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>

#define STASSID "VIETTEL"
#define STAPSK "Sherlock21vtag"
// bApb0Ypwg5YszGanWOBKre39zlg1
#define UID "bApb0Ypwg5YszGanWOBKre39zlg1"
#define NODENAME "DHT11"
#define HOST "192.168.1.3" //HOME local ip
#define PORT 8880

const char *ssid = STASSID;
const char *password = STAPSK;
const char *uid = UID;
const char *nodename = NODENAME;

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

// 0: ON | 1: OFF
bool preState = 0;

#define USE_SERIAL Serial

void socketIOEvent(socketIOmessageType_t type, uint8_t *payload, size_t length)
{
    switch (type)
    {
    case sIOtype_DISCONNECT:
        // USE_SERIAL.printf("[IOc] Disconnected!\n");
        break;
    case sIOtype_CONNECT:
        // USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);
        break;

        //!================//Incoming SocketIO Event//================!//
    case sIOtype_EVENT:
    {
        // USE_SERIAL.printf("[IOc] get event: %s\n", payload);
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, payload, length);
        if (error)
        {
            // USE_SERIAL.print(F("deserializeJson() failed: "));
            // USE_SERIAL.println(error.c_str());
            return;
        }
        String eventName = doc[0];
        String eventVal = doc[1];

        if (eventName == String(nodename))
        {
            if (eventVal == "on")
            {
                digitalWrite(LED_BUILTIN, 0);
                preState = 0;
            }

            else if (eventVal == "off")
            {
                digitalWrite(LED_BUILTIN, 1);
                preState = 1;
            }
        }
    }
    break;

    case sIOtype_ACK:
        // USE_SERIAL.printf("[IOc] get ack: %u\n", length);
        hexdump(payload, length);
        break;
    case sIOtype_ERROR:
        // USE_SERIAL.printf("[IOc] get error: %u\n", length);
        hexdump(payload, length);
        break;
    case sIOtype_BINARY_EVENT:
        // USE_SERIAL.printf("[IOc] get binary: %u\n", length);
        hexdump(payload, length);
        break;
    case sIOtype_BINARY_ACK:
        // USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
        hexdump(payload, length);
        break;
    }
}

void setup()
{
    pinMode(LED_BUILTIN, OUTPUT);
    USE_SERIAL.begin(115200);
    USE_SERIAL.setDebugOutput(true);

    //!================//Internet Config//================!//
    // for (uint8_t t = 4; t > 0; t--)
    // {
    //   // USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    //   // USE_SERIAL.flush();
    //   delay(1000);
    // }
    // disable AP
    if (WiFi.getMode() & WIFI_AP)
    {
        WiFi.softAPdisconnect(true);
    }
    WiFiMulti.addAP(ssid, password);
    //WiFi.disconnect();
    while (WiFiMulti.run() != WL_CONNECTED)
    {
        //TODO: add a buzzer
        digitalWrite(LED_BUILTIN, 1);
        delay(100);
        digitalWrite(LED_BUILTIN, 0);
        delay(100);
    }

    //!================//Init SocketIO Connection Config//================!//
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();
    array.add("regEsp");
    JsonObject param1 = array.createNestedObject(); // add payload (parameters) for the event
    param1["MAC"] = WiFi.macAddress();
    param1["IP"] = WiFi.localIP().toString();
    param1["SSID"] = WiFi.SSID();
    param1["PSK"] = WiFi.psk();
    param1["UID"] = uid;
    String jsonOut;
    serializeJson(doc, jsonOut);

    //!================//SocketIO Config//================!//
    socketIO.begin(HOST, PORT);      // server address, port and URL
    socketIO.onEvent(socketIOEvent); // event handler
    while (!socketIO.isConnected())
    {
        socketIO.loop();
        //TODO: add a buzzer
        digitalWrite(LED_BUILTIN, 1);
        delay(100); // cannot delay longer in socketIO.loop() thread
        digitalWrite(LED_BUILTIN, 0);
        delay(100); // cannot delay longer in socketIO.loop() thread
    }
    socketIO.sendEVENT(jsonOut); // Send event
}

unsigned long messageTimestamp = 0;
void loop()
{
    // uint64_t now = millis();

    // if (now - messageTimestamp > 100)
    // {
    //   messageTimestamp = now;

    //   DynamicJsonDocument doc(1024);
    //   JsonArray array = doc.to<JsonArray>();
    //   array.add("controller");
    //   JsonObject param = array.createNestedObject();
    //   if (analogRead(A0) > 1000)
    //   {
    //     // on | 0
    //     if (!preState)
    //     { // off
    //       param["state"] = "off";
    //       param["physicalName"] = nodename;
    //       preState = 1;
    //       digitalWrite(LED_BUILTIN, 1);
    //       Serial.println("led OFF");
    //       String jsonOut;
    //       serializeJson(doc, jsonOut);
    //       // Send event
    //       socketIO.sendEVENT(jsonOut);
    //     }
    //     // off | 1
    //     else
    //     {
    //       // on
    //       param["state"] = "on";
    //       param["physicalName"] = nodename;
    //       preState = 0;
    //       digitalWrite(LED_BUILTIN, 0);
    //       Serial.println("led ON");
    //       String jsonOut;
    //       serializeJson(doc, jsonOut);
    //       // Send event
    //       socketIO.sendEVENT(jsonOut);
    //     }
    //   }
    // }
    socketIO.loop();
}