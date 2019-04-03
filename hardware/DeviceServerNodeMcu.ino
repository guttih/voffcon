/*
VoffCon is a system for controlling devices and appliances from anywhere.
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

/*
    Board: NodeMCU 1.0 (ESP-12E Module)
*/

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#define INT_FIRSTNODEMCU 123

const int ERROR_NUMBER = -9999;

enum OBJECTTYPE {
    OBJECTTYPE_KEYVALUE_STRING,
    OBJECTTYPE_KEYVALUE_INT,
    OBJECTTYPE_PINS_ARRAY,
    OBJECTTYPE_PIN,
    OBJECTTYPE_PINS,
    OBJECTTYPE_DATE,
    OBJECTTYPE_WHITELIST_ARRAY,
    OBJECTTYPE_STATUS,
    OBJECTTYPE_LOG_PINS,
    OBJECTTYPE_INFORMATION,
    OBJECTTYPE_WARNING,
    OBJECTTYPE_ERROR,
    /*add next type above this line*/
    OBJECTTYPE_COUNT
};

enum JSONTYPE {
    KEYVALUE_STRING,
    KEYVALUE_INT,
    KEYVALUE_DOUBLE
};

/// <summary>
/// Possible types of a pin
/// </summary>
enum PINTYPE {
    PINTYPE_INPUT_ANALOG,   /* Read method analogRead shall be used    */
    PINTYPE_INPUT_DIGITAL,  /* Read method digitalRead shall be used   */
    PINTYPE_OUTPUT_ANALOG,  /* Write method analogWrite shall be used  */
    PINTYPE_OUTPUT_DIGITAL, /* Write method digitalWrite shall be used */
    PINTYPE_OUTPUT_VIRTUAL  /* A pin not connected to hardware         */
};

class GPin {
private:
    int mNumber;
    int mValue;
    PINTYPE mType;
    char *mName;
#ifdef ESP32 
    //#define LEDC_TIMER_13_BIT  13
    //#define LEDC_BASE_FREQ     8100
    #define LEDC_TIMER_13_BIT  13
    #define LEDC_BASE_FREQ     8100
    int mChannel;
    void ledcAnalogWrite(uint8_t channel, uint32_t value, uint32_t valueMax = 255);
    void analogWriteEsp32();
#endif
    void init(const char*strPinName, PINTYPE pinType, int pinNumber, int pinValue);
    void set(int number, int value);
    String jsonKeyValue(String key, int value);
    void destroy();
public:
#ifdef ESP32 
    GPin(const char*strPinName, PINTYPE pinType, int pinNumber, int pinValue, uint8_t pinChannel);
#else
    GPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue);
#endif    
    ~GPin();
    
    void setName(const char*strPinName);
    String getName();
    void setValue(int value);
    int getValue(bool readValueFromHardware = true);
    int getNumber();
    int getType();
    String toJson();
    String toJsonPinout();
};

/// <summary>
/// This class stores all pins
/// </summary>
class GPins {

private:
    int mLength = 0;
#ifdef ESP32 
    int mChannelCount = 0;
#endif
    GPin *mPins[30];//todo: I make this dynamic, instead of a fixed size

public:
    GPins() { mLength = 0; }
    //todo: I' don't need a deconstructur but I should make one
#ifdef ESP32 
    int addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue);
#else
    int addPin(const char *strName, PINTYPE pinType, int pinNumber, int pinValue);
#endif
    //sets the value of a pin with the given number.
    boolean setValue(int pinNumber, int newValue);
    //searches for a pin of a specific number and returns it's index in the array
    int indexOf(int pinNumber);
    //returns true if a pin with the specific number exists in the array
    boolean exists(int pinNumber);
    //returns NULL if pin is not found at a given index
    GPin *get(int pinNumber);
    //returns the value of the given pin.  Returns -1 if pinNumber was not found
    int getValue(int pinNumber);
    int count() { return mLength; }

    /// <summary>
    /// Returns all pin values in a json array
    /// a key-value Json object with the '{' and '}' around it.
    /// where first key is the first in the index with the key as the GPO key
    /// and the value is the last value set to that key.
    /// </summary>
    /// <returns></returns>
    String toJson();

    /// <summary>
    /// Creates a JSON object containg all pins name and their number.
    /// </summary>
    /// <returns>A string formatted as a JSON object which contains all pin names and number. </returns>
    String JsonPinout();
};

#ifndef CODE_BLOCK_LinkedList
/*
LinkedList.h - V1.1 - Generic LinkedList implementation
For instructions, go to https://github.com/ivanseidel/LinkedList

Created by Ivan Seidel Gomes, March, 2013.
Released into the public domain.
*/

//do not remove the comment below this line
//INSERT_FROM_HERE

/*
    LinkedList.h - V1.1 - Generic LinkedList implementation
    For instructions, go to https://github.com/ivanseidel/LinkedList

    Created by Ivan Seidel Gomes, March, 2013.
    Released into the public domain.
*/

template<class T>
struct ListNode
{
    T data;
    ListNode<T> *next;
};

template <typename T>
class LinkedList {

protected:
    int _size;
    ListNode<T> *root;
    ListNode<T> *last;

    // Helps "get" method, by saving last position
    ListNode<T> *lastNodeGot;
    int lastIndexGot;
    // isCached should be set to FALSE
    // everytime the list suffer changes
    bool isCached;

    ListNode<T>* getNode(int index);

public:
    LinkedList();
    ~LinkedList();

    /*
    Returns current size of LinkedList
    */
    virtual int size();
    /*
    Adds a T object in the specified index;
    Unlink and link the LinkedList correcly;
    Increment _size
    */
    virtual bool add(int index, T);
    /*
    Adds a T object in the end of the LinkedList;
    Increment _size;
    */
    virtual bool add(T);
    /*
    Adds a T object in the start of the LinkedList;
    Increment _size;
    */
    virtual bool unshift(T);
    /*
    Set the object at index, with T;
    Increment _size;
    */
    virtual bool set(int index, T);
    /*
    Remove object at index;
    If index is not reachable, returns false;
    else, decrement _size
    */
    virtual T remove(int index);
    /*
    Remove last object;
    */
    virtual T pop();
    /*
    Remove first object;
    */
    virtual T shift();
    /*
    Get the index'th element on the list;
    Return Element if accessible,
    else, return false;
    */
    virtual T get(int index);

    /*
    Clear the entire array
    */
    virtual void clear();

};

// Initialize LinkedList with false values
template<typename T>
LinkedList<T>::LinkedList()
{
    root = NULL;
    last = NULL;
    _size = 0;

    lastNodeGot = root;
    lastIndexGot = 0;
    isCached = false;
}

// Clear Nodes and free Memory
template<typename T>
LinkedList<T>::~LinkedList()
{
    ListNode<T>* tmp;
    while (root != NULL)
    {
        tmp = root;
        root = root->next;
        delete tmp;
    }
    last = NULL;
    _size = 0;
    isCached = false;
}

/*
Actualy "logic" coding
*/

template<typename T>
ListNode<T>* LinkedList<T>::getNode(int index) {

    int _pos = 0;
    ListNode<T>* current = root;

    // Check if the node trying to get is
    // immediatly AFTER the previous got one
    if (isCached && lastIndexGot <= index) {
        _pos = lastIndexGot;
        current = lastNodeGot;
    }

    while (_pos < index && current) {
        current = current->next;

        _pos++;
    }

    // Check if the object index got is the same as the required
    if (_pos == index) {
        isCached = true;
        lastIndexGot = index;
        lastNodeGot = current;

        return current;
    }

    return false;
}

template<typename T>
int LinkedList<T>::size() {
    return _size;
}

template<typename T>
bool LinkedList<T>::add(int index, T _t) {

    if (index >= _size)
        return add(_t);

    if (index == 0)
        return unshift(_t);

    ListNode<T> *tmp = new ListNode<T>(),
        *_prev = getNode(index - 1);
    tmp->data = _t;
    tmp->next = _prev->next;
    _prev->next = tmp;

    _size++;
    isCached = false;

    return true;
}

template<typename T>
bool LinkedList<T>::add(T _t) {

    ListNode<T> *tmp = new ListNode<T>();
    tmp->data = _t;
    tmp->next = NULL;

    if (root) {
        // Already have elements inserted
        last->next = tmp;
        last = tmp;
    }
    else {
        // First element being inserted
        root = tmp;
        last = tmp;
    }

    _size++;
    isCached = false;

    return true;
}

template<typename T>
bool LinkedList<T>::unshift(T _t) {

    if (_size == 0)
        return add(_t);

    ListNode<T> *tmp = new ListNode<T>();
    tmp->next = root;
    tmp->data = _t;
    root = tmp;

    _size++;
    isCached = false;

    return true;
}

template<typename T>
bool LinkedList<T>::set(int index, T _t) {
    // Check if index position is in bounds
    if (index < 0 || index >= _size)
        return false;

    getNode(index)->data = _t;
    return true;
}

template<typename T>
T LinkedList<T>::pop() {
    if (_size <= 0)
        return T();

    isCached = false;

    if (_size >= 2) {
        ListNode<T> *tmp = getNode(_size - 2);
        T ret = tmp->next->data;
        delete(tmp->next);
        tmp->next = NULL;
        last = tmp;
        _size--;
        return ret;
    }
    else {
        // Only one element left on the list
        T ret = root->data;
        delete(root);
        root = NULL;
        last = NULL;
        _size = 0;
        return ret;
    }
}

template<typename T>
T LinkedList<T>::shift() {
    if (_size <= 0)
        return T();

    if (_size > 1) {
        ListNode<T> *_next = root->next;
        T ret = root->data;
        delete(root);
        root = _next;
        _size--;
        isCached = false;

        return ret;
    }
    else {
        // Only one left, then pop()
        return pop();
    }

}

template<typename T>
T LinkedList<T>::remove(int index) {
    if (index < 0 || index >= _size)
    {
        return T();
    }

    if (index == 0)
        return shift();

    if (index == _size - 1)
    {
        return pop();
    }

    ListNode<T> *tmp = getNode(index - 1);
    ListNode<T> *toDelete = tmp->next;
    T ret = toDelete->data;
    tmp->next = tmp->next->next;
    delete(toDelete);
    _size--;
    isCached = false;
    return ret;
}

template<typename T>
T LinkedList<T>::get(int index) {
    ListNode<T> *tmp = getNode(index);

    return (tmp ? tmp->data : T());
}

template<typename T>
void LinkedList<T>::clear() {
    while (size() > 0)
        shift();
}
#endif //CODE_BLOCK_LinkedList

struct PinValue
{
    int pinNumber;
    int pinValue;

};

class GUrl {
private:
    int mLength = 0;
public:
    GUrl() { }
    String getAfter(String str, String afterMe);
    int toNumber(String str);
    boolean extractAndSetPinsAndValues(const char *unParsedJson, GPins *pinnar);
    uint8_t extractPinValues(const char *unParsedJson, PinValue pinValuesArray[], uint8_t arrayLength);
    String removeLastSpaceIfExists(String str);
    String jsonKeyValue(String key, String value);
    /// <summary>
    /// Creates a string with a key and a value, which can be used when populating a JSON object.
    /// </summary>
    /// <param name="name">Name of the key</param>
    /// <param name="value">The integer value</param>
    /// <returns>
    /// A string with a key and a value.  
    /// For example: 
    /// "args":12
    /// </returns>
    String jsonKeyValue(String key, int value);
    String jsonObjectType(unsigned int uiType);
    String makeStatusResponceJson(String jsonPins, String jsonWhitelist, String jsonDate);
    String makePostLogPinsJson(String deviceId, String jsonPins);
    /// <summary>
    /// Formats a http status code
    /// </summary>
    /// <param name="uiStatusCode">Number of the http status code to format</param>
    /// <returns>A string with the http statuscode number and the status text.</returns>
    String makeHttpStatusCodeString(unsigned int uiStatusCode);
    String extractAndReturnIPaddress(const char *unParsedJson);
    String jsonRoot(unsigned int uiType, String key, String value);
};

class KeyValue {
private:
    unsigned int mKeyValueType;
    String mKey;
    String mstrValue;
    int    miValue;
    double  mdValue;
    void set(unsigned int keyValueType, String key, String strValue, int iValue, double dValue);
public:

    KeyValue(String key, String value);
    KeyValue(String key, int value);
    KeyValue(String key, double value);
    String getKey();
    String getValueString(boolean addDoubleQuotationIfString);
    //returns a keyvalue string pair.
    //on error "" is returned.
    String toJson();
};

class Json : public LinkedList<KeyValue*> {

private:
public:
    Json();
    ~Json();

    bool add(String key, String value) { return LinkedList<KeyValue*>::add(new KeyValue(key, value)); }
    bool add(String key, int value) { return LinkedList<KeyValue*>::add(new KeyValue(key, value)); }
    bool add(String key, double value) { return LinkedList<KeyValue*>::add(new KeyValue(key, value)); }
    String toJson();
    //deletes all objects and destoys the list;
    void destory();
};

class GTime {
    ///////////////////////////////////////////////////////////
private:
    int mYear = 0;
    int mMonth = 0;
    int mDay = 0;
    int mHours = 0;
    int mMinutes = 0;
    int mSeconds = 0;
public:
    GTime() { }
    /// <summary>
    /// Sets time values from a given string
    /// </summary>
    /// <param name="strTime">
    /// A string with date and time.
    /// The string needs to be formatted like this: 
    /// Fri, 15 Jul 2016 11:08:12 GMT
    /// </param>
    /// <returns></returns>
    boolean setTime(String strTime);
    /// <summary>
    /// Converts a 3 letter english month name to the number of the month in the year.
    /// </summary>
    /// <param name="month">
    /// A string of length 3, which represents the month.  
    /// For example "JAN" for january.</param>
    /// <returns>
    /// success : the number of the month, where 1 is january.
    /// fail    : -1 
    /// </returns>  
    int strToMonth(String month);
    /// <summary>
    /// Converts a String to a number positive number.
    /// Negative numbers are considered invalid.
    /// </summary>
    /// <param name="str">The string to be converted to a number.</param>
    /// <returns>
    /// Success: The converted number.
    /// Fail   : -9999
    /// </returns>
    static int toNumber(String str);
    /// <summary>
    /// Returns date and time values as a english date time string.
    /// </summary>
    /// <returns>Date and time string on the format "MM/DD/YY hh:mm:ss"</returns>
    String toString();
    /// <summary>
    /// Returns date and time values as a icelandic date time string.
    /// </summary>
    /// <returns>Date and time string on the format "DD.MM.YY hh:mm:ss"</returns>
    String toStreng();
    /// <summary>
    /// Returns the date and time values as an JSON object.
    /// </summary>
    /// <returns>A String formatted as an JSON object</returns>
    String toJson();
};

class IPAddressList : public LinkedList<IPAddress*> {
private:
    /// <summary>
    /// //The cleanup function used by the list's deconstructor;
    /// </summary>
    void destory();

public:
    /// <summary>
    /// Add an ip address by providing four numbers of the IP addres each in the range of 0 - 255
    /// </summary>
    /// <param name="first_octet">First number of the ip address </param>
    /// <param name="second_octet">Second number of the ip address</param>
    /// <param name="third_octet">Third number of the ip address </param>
    /// <param name="fourth_octet">Fourth number of the ip address</param>
    /// <returns></returns>
    bool add(uint8_t first_octet, uint8_t second_octet, uint8_t third_octet, uint8_t fourth_octet) { return add(IPAddress(first_octet, second_octet, third_octet, fourth_octet)); };
    /// <summary>
    /// Add an ip address to the list by providing a IP address
    /// </summary>
    /// <param name="address">The IPAddress object to be added to the list</param>
    /// <returns>True if the add succeded, otherwise false</returns>
    bool add(IPAddress address);
    /// <summary>
    /// Add an ip address to the list by providing a string with a valid IP address
    /// </summary>
    /// <param name="strIpAddress">
    ///     a string with a valid IP address.  
    ///     The ip address "0.0.0.0" will be considered as an invalid ipaddress
    /// </param>
    /// <returns>True if the add succeded, otherwise false</returns>
    bool add(const char* strIpAddress);
    /// <summary>
    /// Checks if a ip address exists in the list
    /// </summary>
    /// <param name="address">The ip address to search for</param>
    /// <returns>True if the add ip address was found in the list, otherwise false.</returns>
    bool exists(IPAddress address);
    bool exists(String strIpaddress);

    /// <summary>
    /// Searches for the index of a ip address in the list.
    /// </summary>
    /// <param name="address">The ip address to search for.</param>
    /// <returns>
    /// Success:The index of the ip address in the list.  
    /// fail   : -1 if string is not found.</returns>
    int indexOf(IPAddress address);
    bool isEmpty();
    bool remove(const char *strIpAddress);
    bool remove(IPAddress address);

    //returns the list as a jsonObject array

    /// <summary>
    /// Bundles all Ip addresses into a JSON array
    /// </summary>
    /// <returns>
    /// A string containing a valid JSON array of ip addresses.
    /// Example of a returned string: ["192.168.1.54","10.1.1.15","10.1.1.1","255.255.255.0"]</returns>
    String toJson();

    /// <summary>
    /// The deconstructor, which cleans up when the list is no longer needed.
    /// </summary>
    ~IPAddressList();
};

GTime startTime;
GPins pinnar;
GUrl  urlTool;
///StringList whiteList; //todo: maybe whiteList should be a IPAddress not String
IPAddressList whiteList;

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
//             T H E   V A L U E S   T H A T   M U S T   B E   C H A N G E D                //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
const char* deviceId = DEVICE_ID;
// Name of the wifi (accesspoint)network
// example: "guttisWiFi"
const char* ssid = WIFI_ACCESSPOINT;
// Wifi password
// example: "mypasswordToTheWifi"
const char* password = WIFI_PASSWORD;
// port number which this device will be operating on.
// example: 5100
const int   PORT = PORT_NUMBER;
// example: 6100
const int   voffconServerPort = VOFFCON_SERVER_PORT;

IPAddress   

// ip address which this device will be operating on.
// Example: "192.168.1.158"     
myIp(IPV4_IPADDRESS),

//the default gateway which this device will be operating on.
// example: "192.168.1.254"
gateway(IPV4_GATEWAY),

// the default gatway on this network.
// On windows goto command
// prompt and type "ipconfig"
// example: "255.255.255.0"
subnet(IPV4_SUBNET),

// example: "192.168.1.127"
voffconServerIp(VOFFCON_SERVER_IP);
// Additional information

// If the device is NOT connected, it's light is faint.
// If the device is     connected it's light is bright.

// if you want a special address to be whiteListed you can add it here. 
// remove "//" in the next line, if you want to allow requests(commands) from a specific ipaddress.
// #define WHITELIST_ADDRESS "89.17.157.231"

// boolean grantAccessToEverybody:
// Set to true if you want to allow all clients where the first 3 numbers
// in a client IP address are the same same as myIp (this server IP address).

boolean grantAccessToEverybody = true;

//boolean grantAccessToAllClientsOnSameSubnet:
//Set to true if you want to allow all clients where the first 3 numbers
//in a client IP address are the same same as myIp (this server IP address).
//
boolean grantAccessToAllClientsOnSameSubnet = true;

// boolean grantAccessToFirstCaller:
// set to true if you want to allow the first client to call the "/setup" method
// to be automaticly granted access.  that is, client IP address will be whitelisted.
boolean grantAccessToFirstCaller = true;

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

void handleNotFound() {
    String message = "File Not Found\n\n";
    message += "URI: ";
    message += server.uri();
    message += "\nMethod: ";
    switch (server.method())
    {
        case HTTP_GET:   message += "GET";   break;
        case HTTP_POST:  message += "POST";  break;
        case HTTP_DELETE:message += "DELETE";break;
        case HTTP_PUT:   message += "PUT";   break;
        default: message += "UNKNOWN";
    }
    message += "\nArguments: ";
    message += server.args();
    message += "\n";
    for (uint8_t i = 0; i<server.args(); i++) {
        message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
    }
    server.send(404, "text/plain", message);
}

void handlePins() {
    Serial.println("handlePins client IP: " + server.client().remoteIP().toString());
    if (!isAuthorized()) return;
    int pin;
    int val;
    if (server.method() == HTTP_POST)
    {
        Serial.println("HTTP_POST");
        String name;

        Serial.println("arg count " + String(server.args()));
        for (uint8_t i = 0; i<server.args(); i++) {
            Serial.println("Set pin " + server.argName(i) + ": " + server.arg(i));
            pin = urlTool.toNumber(server.argName(i));
            val = urlTool.toNumber(server.arg(i));
            if (pin > -1 && val > -1) {
                pinnar.setValue(pin, val);
            }
            else
            {
                Serial.println("Error converting number!!!!");
                String name = server.argName(i);
                String line = server.arg(i);
                if (name.equals("plain") &&
                    line.indexOf("{\"") == 0 &&
                    line.indexOf('}') + 1 == line.length()// We will not handle nested objects
                    )
                {
                    urlTool.extractAndSetPinsAndValues(line.c_str(), &pinnar);
                }
            }
        }
    }
    String itemJson = urlTool.jsonRoot(OBJECTTYPE_PINS_ARRAY, "pins", pinnar.toJson());
    server.send(200, "application/json", itemJson);
}

void handleStatus() {
    Serial.println("handleStatus");
    if (!isAuthorized()) return;
    int pin;
    int val;
    if (!server.method() == HTTP_GET)
    {
        sendText(401, "Method not supported!");
        return;
    }

    String str = urlTool.makeStatusResponceJson(pinnar.toJson(), whiteList.toJson(), startTime.toJson());
    sendJson(200, str.c_str());
    Serial.println("Sending back");
    Serial.println(str);
}

void handleWhitelist() {
    Serial.println("handleWhitelist ");
    if (!isAuthorized()) return;
    if (server.method() == HTTP_GET)
    {
        sendJson(200, whiteList.toJson().c_str());
        return;
    }
    String key;
    String value;
    if (server.method() == HTTP_POST || server.method() == HTTP_DELETE)
    {
        Serial.print("server.method() == HTTP_POST :");
        Serial.print("server.args():"); Serial.println(server.args());
        if (server.args() == 1) 
        {
            int i = 0;
            Serial.println(" " + server.argName(i) + ": " + server.arg(i));
            key = server.argName(i);
            if (key == "plain") {
                value = urlTool.extractAndReturnIPaddress(server.arg(i).c_str());
                Serial.println("ip: \"" + value + "\"");
                
                boolean bExists = whiteList.exists(value);
                if (server.method() == HTTP_POST) {
                    if (!bExists) {
                        if (value.length() > 6 && whiteList.add(value.c_str()))
                            Serial.println("Whitelisting " + value);
                    }
                }
                else if (server.method() == HTTP_DELETE) {
                    if (whiteList.remove(value.c_str()))
                            Serial.println("Removing from whitelist: " + value);
                }
            }
        }
    }//if (server.method() == HTTP_POST || server.method() == HTTP_DELETE)

    sendJson(200, whiteList.toJson().c_str());
}

String getTime() {
    WiFiClient client;
    while (!!!client.connect("google.com", 80)) {
        Serial.println("connection failed, retrying...");
    }

    client.print("HEAD / HTTP/1.1\r\n\r\n");

    while (!!!client.available()) {
        yield();
    }

    while (client.available()) {
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

void handleStarted() {
    Serial.println("client IP: " + server.client().remoteIP().toString());
    String itemJson = urlTool.jsonRoot(OBJECTTYPE_DATE, "date", startTime.toJson());
    server.send(200, "application/json", itemJson);
}

// show the mappings of the pins
void handlePinout() {
    Serial.println("client IP: " + server.client().remoteIP().toString());
    server.send(200, "application/json", pinnar.JsonPinout());
}

//returns:
//true :  if the calling client is autorized;
// false:  if calling client is not autorized and send the text
// "You are not authorized to use this function" to the client

boolean isAuthorized() {

    //todo: remove next line when you want everybody to be able to access the server
    if (grantAccessToEverybody) return true;

    //todo: remove next line when you want to make this save
    if (grantAccessToAllClientsOnSameSubnet) {

        Serial.println("client[0]" + server.client().remoteIP()[0]);
        Serial.println("server[0]" + WiFi.localIP()[0]);
        if (server.client().remoteIP()[0] == WiFi.localIP()[0] &&
            server.client().remoteIP()[1] == WiFi.localIP()[1] &&
            server.client().remoteIP()[2] == WiFi.localIP()[2])
        {
            Serial.println("First 3 ip digits match");
            return true;
        }
    }
    String strIP = server.client().remoteIP().toString();
    Serial.println("Client IP: " + strIP);
    delay(10);

    if (whiteList.exists(strIP)) {
        Serial.println("whitelisted ip: " + strIP);
        return true;
    }
    sendText(401, "You are not authorized to use this function");
    return false;
}

void handleSetup() {

    if (grantAccessToFirstCaller && whiteList.size() == 0)
        whiteList.add(server.client().remoteIP().toString().c_str());  //first one who calls this method will be whitelisted
    
    if (!isAuthorized()) return;
    
    sendText(200, "Todo: this function, maybe allow add pins later");
}

String reportIn() {
    GUrl lib;
    Serial.println("Reporting in ");
    String ret = "Fri, 1 Jan 1971 00:00:00 GMT";
    String data = "{" +
        lib.jsonKeyValue("id", "\"" + String(deviceId) + "\",") +
        lib.jsonKeyValue("ip", "\"" + WiFi.localIP().toString() + "\",") +
        lib.jsonKeyValue("port", PORT) +
        "}";

    HTTPClient http;
    String host = voffconServerIp.toString() + ":" + String(voffconServerPort);
    String url = "http://" + host + "/devices/reportin";
    http.begin(url);  //Specify destination for HTTP request
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Connection", "close");
    Serial.println("sending");
    Serial.println(data);

    int httpResponseCode = http.POST(data);   //Send the actual POST request

    if (httpResponseCode>0) {

        String response = http.getString();                       //Get the response to the request

        Serial.println(httpResponseCode);   //Print return code
        Serial.println(response);           //Print request answer
        ret = response; //responce should contain date.toUTCString()

    }
    else {

        Serial.print("Error on sending POST: ");
        Serial.println(httpResponseCode);

    }

    http.end();  //Free resources
    return ret;
}

void setup(void) {
    

    Serial.begin(115200);
    Serial.println("Connecting to : " + String(ssid));
    //WiFi.begin(ssid);
   
     
    //WiFi.config(myIp, gateway, subnet); //this line can be skipped.  only use if you want a specific ip address
    
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.println("");
    // Wait for connectionc
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("");
    Serial.print("Connected to ");
    Serial.println(ssid);
    Serial.print("IP  address: "); Serial.println(WiFi.localIP());
    Serial.print("Mac address: "); Serial.println(WiFi.macAddress());

    /*if (MDNS.begin("esp8266")) {
        Serial.println("MDNS responder started");
    }*/

    //SETTING_UP_WHITELIST_START
    //Do not remove line, here whitelist ip's will be added by VoffCon Node server
    //SETTING_UP_WHITELIST_END

    startTime.setTime(reportIn());
    
    server.on("/", handleRoot);
    server.on("/pins", handlePins);
    server.on("/whitelist", handleWhitelist);
    server.on("/started", handleStarted);
    server.on("/status", handleStatus);
    server.on("/setup", handleSetup);
    server.on("/pinout", handlePinout);
    //todo: spurning um hvort við bætum við /addpins eða    /add
    //todo: spurning um hvort við bætum við /removepins eða /remove

    server.on("/inline", []() {
        server.send(200, "text/plain", "this works as well");
    });

    server.onNotFound(handleNotFound);

    server.begin();
    Serial.println("HTTP server started");
    int startState = 700;
	//SETTING_UP_PINS_START
    PINTYPE type = PINTYPE_OUTPUT_ANALOG;
    pinnar.addPin("D0", type, D0, startState);
    pinnar.addPin("D1", type, D1, startState);
    pinnar.addPin("D2", PINTYPE_INPUT_ANALOG, D2, 512);
    pinnar.addPin("D3", PINTYPE_INPUT_DIGITAL, D3, startState);
    pinnar.addPin("D4", PINTYPE_OUTPUT_DIGITAL, D4, startState);
    pinnar.addPin("D5", type, D5, 123);
    pinnar.addPin("D6", type, D6, startState);
    pinnar.addPin("D7", type, D7, startState);
    pinnar.addPin("D8", PINTYPE_OUTPUT_VIRTUAL, D8, 456);
	//SETTING_UP_PINS_END
    Serial.println(pinnar.toJson());
}

void loop(void) {
    server.handleClient();
}

#ifndef CODE_BLOCK_GPin_impl
#ifdef ESP32
void GPin::ledcAnalogWrite(uint8_t channel, uint32_t value, uint32_t valueMax) {
    // calculate duty
    
    uint32_t duty = (LEDC_BASE_FREQ / valueMax) * ((value) < (valueMax) ? (value) : (valueMax));
    //todo: remove all Serial.prints in this class
    Serial.println("Analog Writing duty " + String(duty) + " to channel " + String(channel));
    
    // write duty to LEDC
    ledcWrite(channel, duty);
}
// writes the current value of the pin to the GPO
void GPin::analogWriteEsp32() {
    Serial.println("ledcAnalogWrite " + String(mValue) +" to pin " + String(mNumber) + " on channel " + String(mChannel));

    if (mValue == 0) {
        //sometimes ledcAnalogWrite duty = 0 will not have any effect pins D0 - D7 seem to be ok, but others will have no effect
        ledcAnalogWrite(mChannel, 1, 255);
    }
    ledcAnalogWrite(mChannel, mValue, 255);
    //sigmaDeltaWrite(mChannel, mValue);
    
    
    
}
GPin::GPin(const char*strPinName, PINTYPE pinType, int pinNumber, int pinValue, uint8_t pinChannel) {
    mChannel = pinChannel;
    init(strPinName, pinType, pinNumber, pinValue);
}
#else
GPin::GPin(const char*strPinName, PINTYPE pinType, int pinNumber, int pinValue) {
    init(strPinName, pinType, pinNumber, pinValue);
}
#endif

void GPin::init(const char*strPinName, PINTYPE pinType, int pinNumber, int pinValue) {
        mName = NULL;
        setName(strPinName);
        mType = pinType;
        if (mType == PINTYPE_INPUT_ANALOG || mType == PINTYPE_INPUT_DIGITAL){
            pinMode(pinNumber, INPUT);
            mNumber = pinNumber;
            getValue();//to set the member mValue
        } 
#ifdef ESP32
        else if (pinType == PINTYPE_OUTPUT_ANALOG) {
            ledcSetup(mChannel, LEDC_BASE_FREQ, LEDC_TIMER_13_BIT); //setup the LEDC_CHANNEL which is index
            ledcAttachPin(pinNumber, mChannel); //connect the pin and the LEDC_CHANNEL
            /*sigmaDeltaSetup(mChannel, 312500);
            sigmaDeltaAttachPin(pinNumber, mChannel);*/
            set(pinNumber, pinValue);
        }
#endif
        else { //TYPE IS PINTYPE_OUTPUT_DIGITAL or it is (ESP8266 && PINTYPE_OUTPUT_ANALOG) or PINTYPE_OUTPUT_VIRTUAL
            if (mType != PINTYPE_OUTPUT_VIRTUAL)
                pinMode(pinNumber, OUTPUT);
            set(pinNumber, pinValue);
        }
        
}
GPin::~GPin() { 
    this->destroy(); 
};
void GPin::set(int number, int value) {
    mNumber = number;
    setValue(value);
}
void GPin::setName(const char *newPinName) {
    if (newPinName == NULL) 
        return;
    if (mName != NULL) 
        delete[] mName;
    mName = new char[strlen(newPinName) + 1];
    strcpy(mName, newPinName);
}

void GPin::destroy() {
    if (mName != NULL) {
        delete[] mName;
        mName = NULL;  //no need but feels good :)
    }
}

//String GPin::getName() { return this->getName(); }
String GPin::getName() {
    return String(this->mName);
}
void GPin::setValue(int value) { 
    if (mType == PINTYPE_INPUT_ANALOG || mType == PINTYPE_INPUT_DIGITAL) {
        getValue();  //we cannot set value of a input pin, so we will read instead to set the value
        return;
    }
    if (mType == PINTYPE_OUTPUT_DIGITAL) {
        value = (value > 0) ? HIGH : LOW;
        mValue = value;
        digitalWrite(mNumber, mValue);
        return;
    }

    mValue = value; 

    if (mType == PINTYPE_OUTPUT_VIRTUAL)
        return;

#ifdef ESP32 
    analogWriteEsp32();
#else
    analogWrite(mNumber, mValue);
#endif // ESP8266

    
}

//If input type is PINTYPE_INPUT_DIGITAL or PINTYPE_INPUT_ANALOG and readValueFromHardware is true
//then a read will be maid directly to the hardwarepin. otherwise the old member value will be returned.
int GPin::getValue(bool readValueFromHardware) {
    if (readValueFromHardware && mType != PINTYPE_OUTPUT_VIRTUAL) {
        if (mType == PINTYPE_INPUT_DIGITAL)
            mValue = digitalRead(mNumber);
        else if (mType == PINTYPE_INPUT_ANALOG)
            mValue = analogRead(mNumber);
    }
    return mValue; 
}
int GPin::getNumber() { 
    return mNumber; 
}
int GPin::getType() {
    
    return mType; 
}

/// <summary>
/// Creates a string with a key and a value, which can be used when populating a JSON object.
/// </summary>
/// <param name="name">Name of the key</param>
/// <param name="value">The integer value</param>
/// <returns>
/// A string with a key and a value.  
/// For example: 
/// "args":12
/// </returns>
String GPin::jsonKeyValue(String key, int value) {
    String str = "\"" + key + "\":" + String(value);
    return str;
}
String GPin::toJsonPinout() {
    return jsonKeyValue(getName(), getNumber());
}
String GPin::toJson() {
    //todo: use jsonKeyValue function here
    String str = "{\"pin\":" + String(mNumber) + "," +
        "\"val\":" + String(getValue()) + "," +
        "\"m\":" + String(mType) + "," +
        "\"name\":\"" + getName() + "\"}";
    return str;
}
#endif //#ifndef CODE_BLOCK_GPin_impl

#ifndef CODE_BLOCK_GPins_impl
boolean GPins::setValue(int pinNumber, int newValue) {
    int i = indexOf(pinNumber);
    if (i < 0) return false;
    Serial.println("setting value of " + String(i) + " to " + String(newValue));
    mPins[i]->setValue(newValue);
    return true;
}
// todo: will we need a removePIn function?
#ifdef ESP32 
int GPins::addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue) {

    if (pinType == PINTYPE_OUTPUT_ANALOG) {
        mChannelCount++; //mChannel is only used when pin is of type PINTYPE_OUTPUT_ANALOG
    }
    mPins[mLength] = new GPin(strPinName, pinType, pinNumber, pinValue, mChannelCount - 1);
    mLength++;
    return mLength - 1;
}
#else
int GPins::addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue) {
    mPins[mLength] = new GPin(strPinName, pinType, pinNumber, pinValue);
    mLength++;
    return mLength - 1;
}
#endif

//searches for a pin of a specific number and returns it's index in the array
//if nothing is found the function returns -1
int GPins::indexOf(int pinNumber) {
    Serial.print("index of " + String(pinNumber) + " :");
    if (pinNumber < 0) return -1;
    for (int i = 0; i<mLength; i++) {
        if (pinNumber == mPins[i]->getNumber()) {
            Serial.println(i);
            return i;
        }
    }
    Serial.println(-1);
    return -1;
}
//returns true if a pin with the specific number exists in the array
boolean GPins::exists(int pinNumber) {
    return (indexOf(pinNumber) > -1);
}

// returns a pin with a specific number
GPin *GPins::get(int pinNumber) {
    int i = indexOf(pinNumber);
    if (i < 0) return NULL;
    return mPins[i];
}

// returns a pin value with a specific number
int GPins::getValue(int pinNumber) {
    
    GPin *pin = this->get(pinNumber);
    if (pin == NULL) return -1;
    return pin->getValue();
}

//returns all values of the GPins as an JSON array
String GPins::toJson() {
    String str = "[";
    int i;
    for (i = 0; i < mLength; i++) {
        if (i > 0) {
            str = str + ",";
        }
        str = str + mPins[i]->toJson();
    }
    return str + "]";
}
/// <summary>
/// Returns a name and a number of a pin.
/// </summary>
/// <returns>a key-value string of a name and a pin number ready for an json object</returns>
String GPins::JsonPinout() {
    String str = "[";
    int i;
    for (i = 0; i < mLength; i++) {
        if (i > 0) {
            str = str + ",";
        }
        str = str + mPins[i]->toJsonPinout();
    }
    return str + "]";
}
#endif //CODE_BLOCK_GPins_impl

#ifndef CODE_BLOCK_GUrl_impl
//returns "" if nothing is found after given string
String GUrl::getAfter(String str, String afterMe) {
    int index = str.indexOf(afterMe);

    if (index > -1) {
        index += afterMe.length();
        return str.substring(index);
    }
    return "";
}

//return  -9999 if a string is not a number
int GUrl::toNumber(String str) {
    const int ERROR_NUMBER = -9999;
    int iLen = str.length();
    if (iLen < 1) return ERROR_NUMBER;
    for (int i = 0; i < iLen; i++) {
        if (!isDigit(str[i]))
            return ERROR_NUMBER;
    }
    return str.toInt();
}

String GUrl::removeLastSpaceIfExists(String str) {
    Serial.println();
    int lSpace = str.lastIndexOf(" ");
    if (lSpace > 0)
    {
        Serial.println("remove last space: " + String(lSpace));
        str = str.substring(0, lSpace);
    }
    return str;
}

String GUrl::jsonKeyValue(String key, String value) {
    String   str = "\"" + key + "\":" + value;
    return str;
}
String GUrl::jsonKeyValue(String key, int value) {
    String str = "\"" + key + "\":" + String(value);
    return str;
}

String GUrl::jsonObjectType(unsigned int uiType) {
    String str;
    if (uiType < OBJECTTYPE_COUNT)
        str = String(uiType);
    else
        str = "-1";

    return jsonKeyValue("type", str);
}

String GUrl::makeStatusResponceJson(String jsonPins, String jsonWhitelist, String jsonDate) {
    String str = "{" +
        jsonObjectType(OBJECTTYPE_STATUS) + "," +
        jsonKeyValue("pins", jsonPins) + "," +
        jsonKeyValue("whitelist", jsonWhitelist) + "," +
        jsonKeyValue("date", jsonDate) +
        "}";
    return str;
}
String GUrl::makePostLogPinsJson(String deviceId, String jsonPins) {
    String str = "{" +
        jsonObjectType(OBJECTTYPE_LOG_PINS) + "," +
        jsonKeyValue("pins", jsonPins) + "," +
        jsonKeyValue("deviceId", "\""+deviceId+ "\"") +
        "}";
    return str;
}
/// <summary>
/// Formats a http status code
/// </summary>
/// <param name="uiStatusCode">Number of the http status code to format</param>
/// <returns>A string with the http statuscode number and the status text.</returns>
String GUrl::makeHttpStatusCodeString(unsigned int uiStatusCode) {
    String strCode;
    switch (uiStatusCode) {
    case 200:   strCode = String(uiStatusCode) + " OK";
        break;
    case 400:   strCode = String(uiStatusCode) + "  Bad request";
        break;
    case 416:   strCode = String(uiStatusCode) + " Range Not Satisfiable";
        break;
    default:    strCode = "";
        break;
    }
    return strCode;
}

/// <summary>
/// Extracts pin numbers and values from the given string
/// and sets the pin values according to what was extracted.
/// </summary>
/// <param name="unParsedJson">A endline seperated json values on the form { "3":220}</param>
/// <returns>true if successful otherwhise false</returns>
boolean GUrl::extractAndSetPinsAndValues(const char *unParsedJson, GPins *pinnar) {
    boolean ret = false;
    String line = String(unParsedJson);
    String strPin, strValue;
    int pin, val, iCol, iCom;
    Serial.println("extractAndSetPinsAndValues");
    Serial.println("0" + line);
    line = line.substring(1, line.length() - 1);
    Serial.println("1:" + line);
    line += ",";
    Serial.println("2:" + line);
    line.replace("\"", "");
    line.replace("\"", "");
    Serial.println("3:Line:" + line);
    iCol = line.indexOf(':');
    iCom = line.indexOf(',');
    Serial.println("iCol:" + String(iCol) + "iCom:" + String(iCom));
    while (iCol>0 && iCom>2)
    {
        strPin = line.substring(0, iCol);
        strValue = line.substring(iCol + 1, iCom);
        line.remove(0, iCom + 1);
        Serial.print("Pin  :" + strPin);
        Serial.print("    Value:" + strValue);
        pin = toNumber(strPin);
        val = toNumber(strValue);

        if (pin > -1 && val > -1) {
            if (pinnar->setValue(pin, val))
                Serial.print("    new values set");
            ret = true;
        }
        Serial.println();
        iCol = line.indexOf(':');
        iCom = line.indexOf(',');
    }
    return ret;
}

/// <summary>
/// Extracts pin numbers and values from the given string
/// and adds theyr number to the 
/// </summary>
/// <param name="unParsedJson">A endline seperated json values on the form { "3":220}</param>
/// <param name="pinValues">A container to use when storing pinValues</param>
/// <returns>The number of PinValues saved to the Array</returns>
    uint8_t GUrl::extractPinValues(const char *unParsedJson, PinValue pinValuesArray[], uint8_t arrayLength) {
    uint8_t index = 0;
    String line = String(unParsedJson);
    String strPin, strValue;
    int pin, val, iCol, iCom;
    Serial.println("extractPinValues");
    Serial.println("0" + line);
    line = line.substring(1, line.length() - 1);
    Serial.println("1:" + line);
    line += ",";
    Serial.println("2:" + line);
    line.replace("\"", "");
    line.replace("\"", "");
    Serial.println("3:Line:" + line);
    iCol = line.indexOf(':');
    iCom = line.indexOf(',');
    Serial.println("iCol:" + String(iCol) + "iCom:" + String(iCom));
    while (iCol>0 && iCom>2)
    {
        strPin = line.substring(0, iCol);
        strValue = line.substring(iCol + 1, iCom);
        line.remove(0, iCom + 1);
        Serial.print("Pin  :" + strPin);
        Serial.print("    Value:" + strValue);
        pin = toNumber(strPin);
        val = toNumber(strValue);

        if (pin > -1 && val > -1) {
            pinValuesArray[index].pinNumber = pin;
            pinValuesArray[index].pinValue = val;
            index++;
        }
        Serial.println();
        iCol = line.indexOf(':');
        iCom = line.indexOf(',');
    }
    return index;
}

String GUrl::extractAndReturnIPaddress(const char *unParsedJson) {

    String line = String(unParsedJson);
    int iStart, iEnd;
    iStart = line.indexOf("{\"ipaddress\":\"");
    if (iStart < 0) return "";
    iStart = iStart + 14; //length of {"ipaddress":"
    iEnd = line.indexOf("\"}", iStart);

    if (iEnd <= iStart + 6) return "";//shortest valid ip address is 0.0.0.0
    line = line.substring(iStart, iEnd);
    if (line.length() < 7 || line.length() > 15) return ""; // longest ip address 255.255.255.255
    Serial.println("Processed \"" + line + "\" len=" + String(line.length()));
    return line;
}

String GUrl::jsonRoot(unsigned int uiType, String key, String value) {
    if (uiType == OBJECTTYPE_KEYVALUE_STRING)
        value = "\"" + value + "\"";
    String str = "{" +
        jsonObjectType(uiType) +
        "," +
        jsonKeyValue(key, value) +
        "}";

    return str;
}
#endif //#ifndef CODE_BLOCK_GUrl_impl

#ifndef CODE_BLOCK_KeyValue_impl
KeyValue::KeyValue(String key, String value) { set(KEYVALUE_STRING, key, value, 0, 0); }
KeyValue::KeyValue(String key, int value) { set(KEYVALUE_INT, key, "", value, 0); }
KeyValue::KeyValue(String key, double value) { set(KEYVALUE_DOUBLE, key, "", 0, value); }
String KeyValue::getKey() { return mKey; }

void KeyValue::set(unsigned int keyValueType, String key, String strValue, int iValue, double dValue) {
    mKeyValueType = keyValueType;
    mKey = key;
    mstrValue = strValue;
    miValue = iValue;
    mdValue = dValue;
}
String KeyValue::getValueString(boolean addDoubleQuotationIfString) {
    switch (mKeyValueType) {
    case KEYVALUE_STRING:
        if (addDoubleQuotationIfString)
            return "\"" + mstrValue + "\"";
        else
            return mstrValue;
        break;
    case KEYVALUE_INT:
        return String(miValue);
        break;
    case KEYVALUE_DOUBLE:  return String(mdValue, 3);
        break;
    }
    return "";
}

//returns a keyvalue string pair.
//on error "" is returned.
String KeyValue::toJson() {
    String val;
    return "\"" + mKey + "\":" + getValueString(true);
}
#endif //CODE_BLOCK_KeyValue_impl

#ifndef CODE_BLOCK_Json_impl
Json::Json() {}
Json::~Json() { 
    destory(); 
}
String Json::toJson() {

    String str = "{";
    KeyValue *p;
    for (int i = 0; i < size(); i++) {
        p = get(i);
        if (p != NULL)
        {
            if (i>0) str += ",";
            str += p->toJson();
        }
    }
    return str + "}";
}
//deletes all objects and destoys the list;
void Json::destory() {
    KeyValue *p;
    for (int i = 0; i < size(); i++) {
        p = get(i);
        if (p != NULL)
        {
            Serial.print("destoying: " + p->getKey());
            delay(10);
            delete p;
            Serial.println("setting to 0: ");
            set(i, NULL);
        }
    }
    clear();
}
#endif //CODE_BLOCK_Json_impl

#ifndef CODE_BLOCK_Gtime
boolean GTime::setTime(String strTime) {
    String str;
    String num;
    int i;
    Serial.println("strTime: " + strTime);
    i = strTime.indexOf(", "); if (i < 0) return false; else i += 2;
    str = strTime.substring(i);

    //todo: make following into a function always the

    //get the day
    i = str.indexOf(' '); if (i < 1) return false; i += 1;
    num = str.substring(0, i - 1);
    mDay = toNumber(num);
    str = str.substring(i);

    //get the month
    i = str.indexOf(' '); if (i < 1) return false; i += 1;
    num = str.substring(0, i - 1);
    mMonth = strToMonth(num);
    str = str.substring(i);

    //get the year
    i = str.indexOf(' '); if (i < 1) return false; i += 1;
    num = str.substring(0, i - 1);
    mYear = toNumber(num);
    str = str.substring(i);

    //get the hour
    i = str.indexOf(':'); if (i < 1) return false; i += 1;
    num = str.substring(0, i - 1);
    mHours = toNumber(num);
    str = str.substring(i);
    //get the minute
    i = str.indexOf(':'); if (i < 1) return false; i += 1;
    num = str.substring(0, i - 1);
    mMinutes = toNumber(num);
    str = str.substring(i);

    //get the second
    i = str.indexOf(' '); if (i < 1) return false; i += 1;
    num = str.substring(0, i - 1);
    mSeconds = toNumber(num);
    str = str.substring(i);
}

int GTime::toNumber(String str) {
    const int ERROR_NUMBER = -9999;
    int iLen = str.length();
    if (iLen < 1) return ERROR_NUMBER;
    for (int i = 0; i < iLen; i++) {
        if (!isDigit(str[i]))
            return ERROR_NUMBER;
    }
    return str.toInt();
}
int GTime::strToMonth(String month) {
    if (month.length() != 3) return -1;
    month.toLowerCase();
    if (month == "jan") return  1;
    if (month == "feb") return  2;
    if (month == "mar") return  3;
    if (month == "apr") return  4;
    if (month == "may") return  5;
    if (month == "jun") return  6;
    if (month == "jul") return  7;
    if (month == "aug") return  8;
    if (month == "sep") return  9;
    if (month == "oct") return 10;
    if (month == "nov") return 11;
    if (month == "dec") return 12;
    return -1;
}
String GTime::toString() {
    return  String(mMonth) + "/" +
        String(mDay) + "/" +
        String(mYear) + " " +
        String(mHours) + ":" +
        String(mMinutes) + ":" +
        String(mSeconds);
}
String GTime::toStreng() {
    return  String(mDay) + "." +
        String(mMonth) + "." +
        String(mYear) + " " +
        String(mHours) + ":" +
        String(mMinutes) + ":" +
        String(mSeconds);
}
String GTime::toJson() {
    String str = "{\"year\":" + String(mYear) + "," +
        "\"month\":" + String(mMonth) + "," +
        "\"day\":" + String(mDay) + "," +
        "\"hours\":" + String(mHours) + "," +
        "\"minutes\":" + String(mMinutes) + "," +
        "\"seconds\":" + String(mSeconds) + "}";
    return str;
}
#endif //CODE_BLOCK_Gtime

#ifndef CODE_BLOCK_IPAddressList

IPAddressList::~IPAddressList() { 
    destory();
}

bool IPAddressList::add(const char *strIpAddress) {
    IPAddress *p = new IPAddress();
    p->fromString(strIpAddress);
    if (*p == IPAddress(0, 0, 0, 0) || exists(*p)) {
        delete p;
        return false; //we will not allow "0.0.0.0"
    }
    return LinkedList<IPAddress*>::add(p);
}
bool IPAddressList::add(IPAddress ipAddress) {
    if (exists(ipAddress))
        return false;
    return LinkedList<IPAddress*>::add(new IPAddress(ipAddress));
}
bool IPAddressList::exists(String strIpAddress) {
    IPAddress address;
    address.fromString(strIpAddress);
    return exists(address);
}
bool IPAddressList::exists(IPAddress address) { 
    return indexOf(address) > -1;
}

int IPAddressList::indexOf(IPAddress ipAddress) {
    IPAddress *p;
    for (int i = 0; i < size(); i++) {
        p = get(i);
        if (*p == ipAddress)
            return i;
    }
    return -1;
}
bool IPAddressList::remove(const char *strIpAddress) {
    IPAddress p;
    p.fromString(strIpAddress);
    if (p == IPAddress(0, 0, 0, 0)) {
        return false; //we will not allow "0.0.0.0"
    }
    return remove(p);
}
bool IPAddressList::remove(IPAddress ipAddress) {
    int i = indexOf(ipAddress);
    if (i>-1)
    {
        delete get(i);
        set(i, NULL);
    }
    return LinkedList<IPAddress*>::remove(i);
}

bool IPAddressList::isEmpty() {
    IPAddress *p = get(0);
    bool bRet = (p == NULL);
    return bRet;
}

String IPAddressList::toJson() {
    String str = "[";
    IPAddress *p;
    for (int i = 0; i < size(); i++) {
        p = get(i);
        if (i>0)
            str += ",";
        str += "\"" + p->toString() + "\"";
    }
    str += "]";
    return str;
}

void IPAddressList::destory() {
    IPAddress *p;
    for (int i = 0; i < size(); i++) {
        p = get(i);
        if (p != NULL)
        {
            delay(10);
            delete p;
            set(i, NULL);
        }
    }
    clear();
}
#endif //CODE_BLOCK_IPAddressList
