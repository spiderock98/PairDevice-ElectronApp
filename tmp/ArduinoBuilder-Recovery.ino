/*
 * WebSocketClientSocketIO.ino
 *
 *  Created on: 06.06.2016
 *
 */

// #include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiUdp.h>

#include <ArduinoJson.h>
#include <NTPClient.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>

// #include <Hash.h>

#define STASSID "taikhoan"
#define STAPSK "matkhau"
#define UID "dinhdanh"
#define NODENAME "physicalID"
#define HOST "192.168.1.3" //HOME local ip
// #define HOST "171.233.31.91" //HOME public ip
// #define HOST "192.168.1.234" // UTC2
// #define HOST "192.168.1.234" // UTC2

#define lamp_1 16
#define lamp_2 5

const char *ssid = STASSID;
const char *password = STAPSK;
const char *uid = UID;
const char *nodename = NODENAME;

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

String jsonOut;

#define USE_SERIAL Serial

const long utcOffsetInSeconds = 25200; // GMT*60*60
unsigned int count = 1;
int hour_start = 16;
int hour_convert = 16;
int hour_end = 16;
int minute_start = 33;
int minute_convert = 34;
int minute_end = 35;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

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
        // DynamicJsonDocument doc(2048);
        StaticJsonDocument<2048> doc;
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
                digitalWrite(LED_BUILTIN, 0);
            else if (eventVal == "off")
                digitalWrite(LED_BUILTIN, 1);
            else
            {
                hour_start = doc[1]["0"];
                minute_start = doc[1]["1"];
                hour_convert = doc[1]["2"];
                minute_convert = doc[1]["3"];
                hour_end = doc[1]["4"];
                minute_end = doc[1]["5"];
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
    pinMode(lamp_1, OUTPUT);
    pinMode(lamp_2, OUTPUT);

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
        delay(100);
    }

    timeClient.begin();
    String ip = WiFi.localIP().toString();
    USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin(HOST, 8080);

    // event handler
    socketIO.onEvent(socketIOEvent);

    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();
    array.add("nodemcu");

    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1["MAC"] = WiFi.macAddress();
    param1["IP"] = WiFi.localIP().toString();
    param1["SSID"] = WiFi.SSID();
    param1["PSK"] = WiFi.psk();
    param1["UID"] = uid;
    serializeJson(doc, jsonOut);

    // Send event
    while (!socketIO.isConnected())
    {
        socketIO.loop();
        Serial.print('.');
    }
    socketIO.sendEVENT(jsonOut);
}

unsigned long messageTimestamp = 0;
void loop()
{
    socketIO.loop();

    timeClient.update();

    if (timeClient.getHours() == hour_start && timeClient.getMinutes() == minute_start)
    {
        if (count == 65000)
            count = 0;
        count++;
        digitalWrite(lamp_1, 1);
        digitalWrite(lamp_2, 1);
        delay(100);
        Serial.println("2 den sang");
    }
    if (timeClient.getHours() == hour_convert && timeClient.getMinutes() == minute_convert)
    {
        if (count % 2 == 0)
        {
            delay(100);
            digitalWrite(lamp_1, 0);
            Serial.println(" den 1 tat");
        }
        else
        {
            delay(100);
            digitalWrite(lamp_2, 0);
            Serial.println(" den 2 tat");
        }
    }
    if (timeClient.getHours() == hour_end && timeClient.getMinutes() == minute_end)
    {
        digitalWrite(lamp_1, 0);
        delay(100);
        digitalWrite(lamp_2, 0);
        delay(100);
        Serial.println(" 2 den tat");
    }
}