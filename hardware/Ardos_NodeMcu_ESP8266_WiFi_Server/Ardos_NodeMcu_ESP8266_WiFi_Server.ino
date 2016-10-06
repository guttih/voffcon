/*
        Ardos is a system for controlling devices and appliances from anywhere.
        It consists of two programs.  A “node server” and a “device server”.
        Copyright (C) 2016  Gudjon Holm Sigurdsson

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, version 3 of the License.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>. 
        
You can contact the author by sending email to gudjonholm@gmail.com or 
by regular post to the address Haseyla 27, 260 Reykjanesbar, Iceland.
*/
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#include <LinkedList.h>

#include "GPins.h"
#include "Gurl.h"

const char* ssid = "WIFI_ACCESSPOINT";
const char* password = "WIFI_PASSWORD";
IPAddress myIp(192,168,1,151),
          gateway(192,168,1,254),
          subnet(255,255,255,0);
const int PORT = 5100;

// if you do not want a special address to be whiteListed you can add it here. 
// comment this next line out if you do not want this exception
// #define WHITELIST_ADDRESS "89.17.157.231"


/*boolean   grantAccessToEverybody:
 * Set to true if you want to allow all clients where the first 3 numbers
 * in a client IP address are the same same as myIp (this server IP address).
.*/
boolean   grantAccessToEverybody = true; 

/*boolean   grantAccessToAllClientsOnSameSubnet:
 * Set to true if you want to allow all clients where the first 3 numbers
 * in a client IP address are the same same as myIp (this server IP address).
.*/
boolean   grantAccessToAllClientsOnSameSubnet = true; 
/*boolean   grantAccessToFirstCaller:
 * set to true if you want to allow the first client to call the "/setup" method  
 * to be automaticly granted access.  that is, client IP address will be whitelisted.
.*/
boolean   grantAccessToFirstCaller = false; 

ESP8266WebServer server(PORT);


void handleRoot() {
  sendText(200, "hello from esp8266!");
}


void sendText(int statusCode, const char *strSend) {
  server.send(statusCode, "text/plain", strSend);
}
void sendJson(int statusCode, const char *strJsonString) {
  server.send(200, "application/json", strJsonString);
}

void handleNotFound(){
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}

/////////////////////////////////////////////////////////////////


////////   GLOBAL VARIABLES   /////////////////////////////////////////////////////
GPins pinnar;
Gurl  urlTool;
int code = 0;
Response response;
int item = -1;
Gtime startTime;
StringList whiteList; //todo: maybe whiteList should be a IPAddress not String
/////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
void handlePins(){
  Serial.println("handlePins client IP: " + server.client().remoteIP().toString());
  if (!isAuthorized()) return;
  int pin;
  int val;
  if (server.method() == HTTP_POST)
  {   Serial.println("HTTP_POST");
    String name;
    
    Serial.println("arg count " + String(server.args()));
    for (uint8_t i=0; i<server.args(); i++){
      Serial.println("Set pin " + server.argName(i) + ": " + server.arg(i));
      pin = urlTool.toNumber(server.argName(i));
      val = urlTool.toNumber(server.arg(i));
      if (pin > -1 && val > -1){
        pinnar.setValue(pin, val);
      } else 
      { 
        Serial.println("Error converting number!!!!");
        String name = server.argName(i);
        String line = server.arg(i);
        if (  name.equals("plain")   && 
              line.indexOf("{\"") == 0 &&
              line.indexOf('}')+1 == line.length()/*We will not handle nested objects*/
            )
        {
              //let's try to parse a json
              String strPin, strValue; 
              Serial.println("let's try to parse a json");
              int iCol=1, iCom;
              Serial.println("0" + line);
              line = line.substring(1, line.length()-1);
              Serial.println("1:" + line);
              line+=",";
              Serial.println("2:" + line);
              line.replace("\"", "");
              line.replace("\"", "");
              Serial.println("3:Line:" + line);
              iCol = line.indexOf(':');
              iCom = line.indexOf(',');
              
              while(iCol>0 && iCom>3)
              {
                strPin = line.substring(0, iCol);
                strValue = line.substring(iCol+1, iCom);
                line.remove(0, iCom+1);
                Serial.println("Pin  :" + strPin);
                Serial.println("Value:" + strValue);
                pin = urlTool.toNumber(strPin);
                val = urlTool.toNumber(strValue);
                if (pin > -1 && val > -1){
                  pinnar.setValue(pin, val);
                }
                iCol = line.indexOf(':');
                iCom = line.indexOf(',');
               }
              
              


              
          
        }
        
        
        //String str = server.arg(i);
      }
    }
  }


  
  String itemJson = urlTool.jsonRoot(OBJECTTYPE_PINS_ARRAY, "pins", pinnar.toJSON());
  server.send(200, "application/json", itemJson);
  
}


void handleStatus(){
  Serial.println("handleStatus");
  if (!isAuthorized()) return;
  int pin;
  int val;
  if (!server.method() == HTTP_GET)
  {
      sendText(401, "Method not supported!");
      return;
  }
   
  String strPins      = urlTool.jsonKeyValue("pins",      pinnar.toJSON());
  String strWhitelist = urlTool.jsonKeyValue("whitelist", whiteList.toJson());
  String strTime      = urlTool.jsonKeyValue("date",      startTime.toJson());
  String str = "{"+ 
                   urlTool.jsonObjectType(OBJECTTYPE_STATUS) + "," +
                   strPins      + "," +
                   strWhitelist + "," +
                   strTime      +
               "}";
  sendJson(200, str.c_str());
  
  
}
void handleWhitelist(){
  if (!isAuthorized()) return;
  if (server.method() == HTTP_GET)
  {
    sendJson(200, urlTool.jsonRoot(OBJECTTYPE_WHITELIST_ARRAY, "whitelist", whiteList.toJson()).c_str());
    return;
  }
  String key;
  String value;
  if (server.method() == HTTP_POST)
  { 
    for (uint8_t i=0; i<server.args(); i++){
      Serial.println(" " + server.argName(i) + ": " + server.arg(i));
      key = server.argName(i);
      value = server.arg(i);
      //todo: check if ip is a valid ip valid
      boolean bExists = whiteList.exists(value);
      if (key == "add")
      {
         if (!bExists)
         {  if (whiteList.add(value))
              Serial.println("Whitelisting " + value);
            
         }        
      } else if (key == "remove"){
        int i = whiteList.indexOf(value);
        if (i > -1)
          if (whiteList.remove(value))
            Serial.println("Removing from whitelist: " + value);
      }
      
    }
  }
   sendJson(200, urlTool.jsonRoot(OBJECTTYPE_WHITELIST_ARRAY, "whitelist", whiteList.toJson()).c_str());
}


// returns pin index if it exists in the array otherwhise -1
// todo: do I really need this function?
int getPin(String str){
  Serial.print("(\"" + str + "\")");
  int pinNumber = urlTool.getUrlPinIndex(str, false);
  boolean bExits = pinnar.exists(pinNumber);
  Serial.print  ("   pinNumber:" + String(pinNumber));
  Serial.print  ("   Exits:" + String(bExits));
  if (bExits)
    return pinNumber;
  return -1;
}

int setPin(String str){
  
  Serial.print("(\"" + str + "\")");
  int pinNumber = urlTool.getUrlPinIndex(str, true);
  int pinValue = urlTool.getUrlPinValue(str);
  
  
  Serial.print  ("   pinNumber:" + String(pinNumber));
  Serial.println("   pinValue:" + String(pinValue));
  if (  (pinNumber > -1) && 
        (pinValue > -1) &&
        (pinnar.setValue(pinNumber, pinValue))  ){
          
          return pinNumber;
  }
  //bad request
  return -1;

}

String getTime() {
  WiFiClient client;
  while (!!!client.connect("google.com", 80)) {
    Serial.println("connection failed, retrying...");
  }

  client.print("HEAD / HTTP/1.1\r\n\r\n");
 
  while(!!!client.available()) {
     yield();
  }

  while(client.available()){
    if (client.read() == '\n') {    
      if (client.read() == 'D') {    
        if (client.read() == 'a') {    
          if (client.read() == 't') {    
            if (client.read() == 'e') {    
              if (client.read() == ':') {    
                client.read();
                String theDate = client.readStringUntil('\r');
                client.stop();
                return theDate;
              }
            }
          }
        }
      }
    }
  }
  return "";
}

void handleStarted(){
  Serial.println("client IP: " + server.client().remoteIP().toString());
  String itemJson = urlTool.jsonRoot(OBJECTTYPE_DATE, "date", startTime.toJson());
  server.send(200, "application/json", itemJson);
}

// show the mappings of the pins
void handlePinout(){
  Serial.println("client IP: " + server.client().remoteIP().toString());
  JSON json;
  json.add("D0", D0); 
  json.add("D1", D1); 
  json.add("D2", D2);
  json.add("D3", D3); 
  json.add("D4", D4);
  json.add("D5", D5); 
  json.add("D6", D6);
  json.add("D7", D7); 
  json.add("D8", D8);
  json.add("D9", D9); 
  json.add("D10", D10); 
  
  server.send(200, "application/json", json.toJson());
}

/*returns: 
    true :  if the calling client is autorized;
    false:  if calling client is not autorized and send the text 
            "You are not authorized to use this function" to the client
*/

boolean isAuthorized(){

    //todo: remove next line when you want everybody to be able to access the server
    if (grantAccessToEverybody) return true;
    
    //todo: remove next line when you want to make this save
    if (grantAccessToAllClientsOnSameSubnet){
      /*to be able to get client IP as local local you will call:
       * from brower address link: http://192.168.1.10/projects/arduino/wifiServer/
       * from the javascript set : SERVERURL = 'http://192.168.1.151:5100';
       */

      Serial.println("client[0]" + server.client().remoteIP()[0]);
      Serial.println("server[0]" + WiFi.localIP()[0]);
      if (server.client().remoteIP()[0] == WiFi.localIP()[0] &&
          server.client().remoteIP()[1] == WiFi.localIP()[1] &&
          server.client().remoteIP()[2] == WiFi.localIP()[2]  )
      {
        Serial.println("First 3 ip digits match");
        return true;
      }  
    }
    String strIP = server.client().remoteIP().toString();
    Serial.println("Client IP: "+strIP);
    delay(10);

    if (whiteList.exists(strIP)){ 
      return true;
    }
    sendText(401, "You are not authorized to use this function");
    return false;
}

void handleSetup(){

  if (grantAccessToFirstCaller && whiteList.size() == 0)
    whiteList.add(server.client().remoteIP().toString());  //first one who calls this method will be whitelisted

  if (!isAuthorized()) return;
  
  sendText(200, "Todo: this function, maybe allow add pins later");
 
}

void setup(void){
  #ifdef WHITELIST_ADDRESS
      whiteList.add(WHITELIST_ADDRESS);
  #endif
    
  Serial.begin(115200);
  WiFi.begin(ssid, password);
 
  WiFi.config(myIp, gateway, subnet); //this line can be skipped.  only use if you want a specific ip address
  Serial.println("");
    // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP  address: "); Serial.println(WiFi.localIP());
  Serial.print("Mac address: "); Serial.println(WiFi.macAddress());

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }

  startTime.setTime(getTime());

  server.on("/", handleRoot);
  
  server.on("/pins", handlePins);
  server.on("/whitelist", handleWhitelist);
  server.on("/started", handleStarted);
  server.on("/status", handleStatus);
  
  server.on("/setup", handleSetup);
  server.on("/pinout", handlePinout);
  //todo: spurning um hvort við bætum við /addpins eða    /add
  //todo: spurning um hvort við bætum við /removepins eða /remove

  server.on("/inline", [](){
    server.send(200, "text/plain", "this works as well");
  });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
  int startState = 700;
  //todo: make client add these pins
  pinnar.addPin(OUTPUT, D0, startState);
  pinnar.addPin(OUTPUT, D1, startState);
  pinnar.addPin(OUTPUT,  D2, 512);
  pinnar.addPin(OUTPUT, D3, startState);
  pinnar.addPin(OUTPUT, D4, startState);
  pinnar.addPin(INPUT,  D5,  123);
  pinnar.addPin(OUTPUT, D6, startState);
  pinnar.addPin(OUTPUT, D7, startState);
  pinnar.addPin(OUTPUT, D8, startState);

}

void loop(void){
  server.handleClient();
}
