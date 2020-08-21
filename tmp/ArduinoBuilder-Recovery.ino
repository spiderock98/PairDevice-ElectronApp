/*
 * WebSocketClientSocketIO.ino
 *
 *  Created on: 06.06.2016
 *
 */

// #include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>

#define STASSID "taikhoan"
#define STAPSK "matkhau"
#define UID "dinhdanh"
#define NODENAME "physicalID"
#define HOST "192.168.1.14" //HOME local ip

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
        USE_SERIAL.printf("[IOc] Disconnected!\n");
        break;
    case sIOtype_CONNECT:
        USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);
        break;
    case sIOtype_EVENT:
    {
        // USE_SERIAL.printf("[IOc] get event: %s\n", payload);
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, payload, length);
        if (error)
        {
            USE_SERIAL.print(F("deserializeJson() failed: "));
            USE_SERIAL.println(error.c_str());
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
        USE_SERIAL.printf("[IOc] get ack: %u\n", length);
        hexdump(payload, length);
        break;
    case sIOtype_ERROR:
        USE_SERIAL.printf("[IOc] get error: %u\n", length);
        hexdump(payload, length);
        break;
    case sIOtype_BINARY_EVENT:
        USE_SERIAL.printf("[IOc] get binary: %u\n", length);
        hexdump(payload, length);
        break;
    case sIOtype_BINARY_ACK:
        USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
        hexdump(payload, length);
        break;
    }
}

void setup()
{
    pinMode(LED_BUILTIN, OUTPUT);

    USE_SERIAL.begin(115200);

    USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    for (uint8_t t = 4; t > 0; t--)
    {
        USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }

    // disable AP
    if (WiFi.getMode() & WIFI_AP)
    {
        WiFi.softAPdisconnect(true);
    }

    WiFiMulti.addAP(ssid, password);

    //WiFi.disconnect();
    while (WiFiMulti.run() != WL_CONNECTED)
    {
        digitalWrite(LED_BUILTIN, 1);
        delay(100);
        digitalWrite(LED_BUILTIN, 0);
        delay(100);
    }

    // timeClient.begin();
    String ip = WiFi.localIP().toString();
    USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin(HOST, 8880);

    // event handler
    socketIO.onEvent(socketIOEvent);

    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();
    array.add("regEsp");

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1["MAC"] = WiFi.macAddress();
    param1["IP"] = WiFi.localIP().toString();
    param1["SSID"] = WiFi.SSID();
    param1["PSK"] = WiFi.psk();
    param1["UID"] = uid;
    String jsonOut;
    serializeJson(doc, jsonOut);

    // Send event
    while (!socketIO.isConnected())
    {
        socketIO.loop();
        Serial.print('.');
        delay(500);
    }
    socketIO.sendEVENT(jsonOut);
}

unsigned long messageTimestamp = 0;
void loop()
{
    socketIO.loop();

    uint64_t now = millis();

    if (now - messageTimestamp > 100)
    {
        messageTimestamp = now;

        DynamicJsonDocument doc(1024);
        JsonArray array = doc.to<JsonArray>();
        array.add("controller");
        JsonObject param = array.createNestedObject();
        if (analogRead(A0) > 1000)
        {
            // on | 0
            if (!preState)
            { // off
                param["state"] = "off";
                param["physicalName"] = nodename;
                preState = 1;
                digitalWrite(LED_BUILTIN, 1);
                Serial.println("led OFF");
                String jsonOut;
                serializeJson(doc, jsonOut);
                // Send event
                socketIO.sendEVENT(jsonOut);
            }
            // off | 1
            else
            {
                // on
                param["state"] = "on";
                param["physicalName"] = nodename;
                preState = 0;
                digitalWrite(LED_BUILTIN, 0);
                Serial.println("led ON");
                String jsonOut;
                serializeJson(doc, jsonOut);
                // Send event
                socketIO.sendEVENT(jsonOut);
            }
        }
    }
}