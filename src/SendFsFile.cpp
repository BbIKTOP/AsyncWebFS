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

class FileAsyncChunkedResponse : public AsyncChunkedResponse
{
    fs::File file;
    String filename = "";
    String contentType = "text/plain";
    IPAddress remote;

    int totalRead = 0;

public:
    size_t readFileChunk(uint8_t *buffer, size_t maxLen, size_t index)
    {
        /*         if (totalRead == 0)
        {
            Serial.printf("File [%s] for [%s]\n", filename.c_str(), remote.toString().c_str());
        }
 */
        if (!file)
        {
            Serial.printf("is not opened!!!\n");
            return (0);
        }
        // Serial.printf("Chunk read, len=%d, index=%d, buffer=%ld, ", maxLen, index, (unsigned long)buffer);
        int readBytes = file.read(buffer, maxLen);
        if (readBytes < 0)
        {
            Serial.printf("File [%s] reading error!!! ", filename.c_str());
            readBytes = 0;
        }
        totalRead += readBytes;
        if (readBytes == 0)
        {
            Serial.printf("File [%s]: %d bytes sent to [%s]\n", filename.c_str(), totalRead, remote.toString().c_str());
        }
        return (readBytes);
    }

    String getContentTypeByFilename()
    {
        filename.toLowerCase();
        if (filename.endsWith(".html"))
        {
            contentType = "text/html";
            return (contentType);
        }
        if (filename.endsWith(".htm"))
        {
            contentType = "text/html";
            return (contentType);
        }
        if (filename.endsWith(".css"))
        {
            contentType = "text/css";
            return (contentType);
        }
        if (filename.endsWith(".js"))
        {
            contentType = "text/javascript";
            return (contentType);
        }
        if (filename.endsWith(".ttf"))
        {
            contentType = "font/ttf";
            return (contentType);
        }
        if (filename.endsWith(".ico"))
        {
            contentType = "image/vnd.microsoft.icon";
            return (contentType);
        }
        if (filename.endsWith(".png"))
        {
            contentType = "image/png";
            return (contentType);
        }
        if (filename.endsWith(".svg"))
        {
            contentType = "image/svg+xml";
            return (contentType);
        }
        if (filename.endsWith(".jpg"))
        {
            contentType = "image/jpeg";
            return (contentType);
        }
        if (filename.endsWith(".gif"))
        {
            contentType = "image/gif";
            return (contentType);
        }

        contentType = "text/plain";
        return (contentType);
    }

    FileAsyncChunkedResponse(const String &filename, const IPAddress &remoteIP)
        : AsyncChunkedResponse("",
                               std::bind(&FileAsyncChunkedResponse::readFileChunk,
                                         this,
                                         std::placeholders::_1,
                                         std::placeholders::_2,
                                         std::placeholders::_3),
                               (AwsTemplateProcessor) nullptr),
          file(LittleFS.open(filename, "r")),
          remote(IPAddress(remoteIP))
    {
        this->filename = filename;
        setContentType(getContentTypeByFilename());
    }
};

void sendData(AsyncWebServerRequest *request)
{
    String filename = request->url();

    // Serial.printf("Requested file %s\n", filename.c_str());

    /* Dir dir = LittleFS.openDir("/");
    while (dir.next())
    {
        Serial.println("\"" + dir.fileName() + "\" : " +
                       dir.fileSize() + " bytes");
    } */

    if (filename == "/")
    {
        String defaultFilenames[] = {"/index.html", "/index.htm"};
        for (unsigned int i = 0; i < sizeof(defaultFilenames); i++)
        {
            if (LittleFS.exists(defaultFilenames[i]))
            {
                filename = defaultFilenames[i];
                break;
            }
        }
    }
    if (!LittleFS.exists(filename))
    {
        filename = "404.html";
    }

    if (!LittleFS.exists(filename))
    {
        request->send(404, "text/plain", "Not found");
        Serial.printf("File %s not found\n", filename.c_str());

        return;
    }

    IPAddress remote = request->client()->remoteIP();
    FileAsyncChunkedResponse *response = new FileAsyncChunkedResponse(filename, remote);
    request->send(response);
}
