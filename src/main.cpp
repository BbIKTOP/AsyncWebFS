#include <Arduino.h>
#include <LittleFS.h>
#ifdef ESP32
#include <WiFi.h>
#include <AsyncTCP.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#endif
#include <ESPAsyncWebServer.h>

#include <wifi_creds.h>

extern void sendData(AsyncWebServerRequest *request);

AsyncWebServer webServer(80);

const char *ssid = WIFI_SSID;
const char *password = WIFI_PASSWD;

void notFound(AsyncWebServerRequest *request)
{
  request->send(404, "text/plain", "Not found");
}

void setup()
{
  Serial.begin(115200);
  Serial.println("\n");

  LittleFS.begin();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {

    Serial.printf(".");
    delay(100);
  }

  Serial.print("\nIP Address: ");
  Serial.println(WiFi.localIP());

  webServer.on("/", sendData);
  webServer.on("/*.html", sendData);
  webServer.on("/*.css", sendData);
  webServer.on("/*.js", sendData);
  webServer.on("/*.ttf", sendData);
  webServer.on("/*.ico", sendData);
  webServer.on("/*.png", sendData);
  webServer.on("/*.svg", sendData);

  webServer.onNotFound(notFound);

  webServer.begin();
}

void loop()
{
  delay(1000);
}
