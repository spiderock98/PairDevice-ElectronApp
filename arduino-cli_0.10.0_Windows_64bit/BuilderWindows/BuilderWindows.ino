#include <ESP8266WiFi.h>
#include <SocketIOClient.h>
#include <ArduinoJson.h>

#define STASSID "taikhoan"
#define STAPSK "matkhau"
#define UID "dinhdanh"
#define HOST "192.168.1.2" //HOME local ip
// #define HOST "171.233.31.91" //HOME public ip
// #define HOST "127.0.0.1" // UTC2
// #define HOST "192.168.1.234" // UTC2

const char *ssid = STASSID;
const char *password = STAPSK;
const char *uid = UID;

SocketIOClient client;
String jsonOut;
extern String RID;
extern String Rname;
extern String Rcontent;

void setup()
{
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(115200);

    StaticJsonDocument<200> doc;

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        digitalWrite(LED_BUILTIN, 1);
        delay(250);
        digitalWrite(LED_BUILTIN, 0);
        delay(250);
    }
    digitalWrite(LED_BUILTIN, 0);

    Serial.println("");

    WiFi.printDiag(Serial);

    doc["MAC"] = WiFi.macAddress();
    doc["IP"] = WiFi.localIP().toString();
    doc["SSID"] = WiFi.SSID();
    doc["PSK"] = WiFi.psk();
    doc["UID"] = uid;

    serializeJson(doc, jsonOut);

    if (!client.connect(HOST, 8080))
    {
        Serial.println("Failed to connect to host");
        return;
    }

    if (client.connected())
    {
        Serial.print("Succesful connected to ");
        Serial.println(WiFi.hostname());
        client.sendJSON("nodemcu", jsonOut);
        Serial.println("sent json string: " + jsonOut);
    }
}

void loop()
{
    if (client.monitor())
    {
        if (RID == "led")
        {
            Serial.print("Rname is: ");
            Serial.println(Rname);
            if (Rname == "n\"]")
            {
                digitalWrite(LED_BUILTIN, 0);
            }
            if (Rname == "ff\"]")
            {
                digitalWrite(LED_BUILTIN, 1);
            }
        }
    }
    if (!client.connected())
        client.reconnect(HOST, 8080);
}