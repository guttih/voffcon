﻿/*
VoffCon is a system for controlling devices and appliances from anywhere.
It consists of two programs.  A "node server" and a "device server".
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

    Program for Board: NodeMCU 1.0 (ESP-12E Module)
*/

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#define INT_FIRSTNODEMCU 123

const int ERROR_NUMBER = -9999;

struct KeyVal {
    String key = "";
    long value = 0;
};

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

enum JSONTYPEKEY {
    KEYVALUE_STRING,
    KEYVALUE_INT,
    KEYVALUE_DOUBLE
};

/// <summary>
/// Possible types of a pin are:
/// <para/>PINTYPE_INPUT_ANALOG   : "Read method analogRead shall be used"
/// <para/>PINTYPE_INPUT_DIGITAL  : "Read method digitalRead shall be used"
/// <para/>PINTYPE_OUTPUT_ANALOG  : "Write method analogWrite shall be used"
/// <para/>PINTYPE_OUTPUT_DIGITAL : "Write method digitalWrite shall be used"
/// <para/>PINTYPE_OUTPUT_VIRTUAL : "A pin not connected to hardware, but can store values"
/// </summary>
enum PINTYPE {
    PINTYPE_INPUT_ANALOG,
    PINTYPE_INPUT_DIGITAL,
    PINTYPE_OUTPUT_ANALOG,
    PINTYPE_OUTPUT_DIGITAL,
    PINTYPE_OUTPUT_VIRTUAL 
};

/// <summary>
/// Class for handling GPIO pins
/// Use it to read from or write to a pin
/// </summary>
class GPin {
private:
    int mNumber;
    int mValue;
    PINTYPE mType;
    char *mName;
#ifdef ESP32 
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
    String toJsonKeyValue();
};

/// <summary>
/// This class stores GPin objects which connect the server to device hardware pins
///<para/>
/// </summary>
class GPins {
private:
    int mLength = 0;
#ifdef ESP32 
    int mChannelCount = 0;
#endif
    GPin *mPins[30];//todo: I make this dynamic, instead of a fixed size
    int indexOf(int pinNumber);

public:
    int addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue);
    boolean setValue(int pinNumber, int newValue);
    boolean exists(int pinNumber);
    GPin *get(int pinNumber);
    int getValue(int pinNumber);
    int count();
    String toJson();
    String JsonPinout();
    GPins();
};

#ifndef CODE_BLOCK_LinkedList

//do not remove the comment below this line
//INSERT_FROM_HERE

//   ---------------------------------------------------------------
//  LinkedList.h - V1.1 - Generic LinkedList implementation
//  For instructions, go to https://github.com/ivanseidel/LinkedList

//  Created by Ivan Seidel Gomes, March, 2013.
//  Released into the public domain.
//   ---------------------------------------------------------------

template<class T>
struct ListNode
{
    T data;
    ListNode<T> *next;
};

/// <summary>
/// A general linked list ready to be used or Inherited
/// </summary>
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
    /// <summary>
    /// The list constructor
    /// </summary>
    LinkedList();
    ~LinkedList();

    
    
    /// <summary>
    /// Returns current size of LinkedList
    /// </summary>
    /// <returns>a int number</returns>
    virtual int size();

    /// <summary>
    /// Adds a T object in the specified index;
    /// Unlinkand link the LinkedList correcly;
    /// Increment _size
    /// </summary>
    /// <param name="index">Where to add the object in the zero based index</param>
    /// <param name="T">The object to be added</param>
    /// <returns>Success: true.  Fail: false.</returns>
    virtual bool add(int index, T);

    /// <summary>
    /// Adds a T object in the end of the LinkedList;
    /// Increment _size;
    /// </summary>
    /// <param name="T">The object</param>
    virtual bool add(T);
    
    /// <summary>
    /// Adds a T object in the start of the LinkedList;
    /// Increment _size;
    /// </summary>
    /// <param name="T">The object to be added at beginning of list</param>
    /// <returns></returns>
    virtual bool unshift(T);

    /// <summary>
    /// Set the object at index, with T;
    /// Increment _size;
    /// </summary>
    /// <param name="index">Zero based index of where the object is</param>
    /// <param name="T">The object which values will be overwritten</param>
    /// <returns></returns>
    virtual bool set(int index, T);

    /// <summary>
    /// Remove object at index;
    /// If index is not reachable, returns false;
    /// else, decrement _size
    /// </summary>
    /// <param name="index"></param>
    /// <returns>Success: The object which was removed. Fail: an object created with the default constructor</returns>
    virtual T remove(int index);

    /// <summary>
    /// Remove last object;
    /// </summary>
    /// <returns>The data of the removed object</returns>
    virtual T pop();
    
    /// <summary>
    /// Remove first object;
    /// </summary>
    virtual T shift();
    
    /// /// <summary>
    /// Get the index'th element on the list;
    /// Return Element if accessible,
    /// else, return false;
    /// </summary>
    /// <param name="index">Zero based index if the object in the list</param>
    /// <returns>Success: the object.  Fail: A object created with a default constructor</returns>
    virtual T get(int index);

    /// <summary>
    /// Clear the entire array
    /// That is remove all objects from the list and delete them from memory
    /// </summary>
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

    return NULL;
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

/// <summary>
/// Used to store only Number and value of a pin
/// </summary>
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
    String jsonKeyValue(String key, int value);
    String jsonObjectType(unsigned int uiType);
    String makeStatusResponceJson(String jsonPins, String jsonWhitelist, String jsonDate);
    String makePostLogPinsJson(String deviceId, String jsonPins);
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
    String toJson();
};

/// <summary>
/// The errornumber to return when a numberfunction fails;
/// Like: toInt(), toFloat(), toLong(), toULong()
/// </summary>
#define JSONDATA_ERRORNUMBER 999999999;

//See informanation on JSON on https://www.json.org (nice pictures)
//See more info here : https://www.crockford.com/mckeeman.html
//todo: Hexadecimal digits can be represented as u and then 4 hexadecimal digits. (\u hex hex hex hex)
//      hex can be ('0'..'9' or 'A'..'F' or 'a'..'f')
//todo: Exponent numbers see second answser: https://stackoverflow.com/questions/19554972/json-standard-floating-point-numbers
//      example1: 1e-005 example2: 2.99792458e8   Exponent can be ('E' sign digits) or ('e' sign digits)
/// <summary>
/// Enumeration for which type of json object the json data is.
/// </summary>
enum JSONTYPE {
    JSONTYPE_INVALID,
    JSONTYPE_ARRAY,
    JSONTYPE_OBJECT,
    JSONTYPE_KEY_VALUE,
    JSONTYPE_STRING,
    JSONTYPE_ULONG,
    JSONTYPE_LONG,
    JSONTYPE_FLOAT,
    JSONTYPE_BOOL,
    JSONTYPE_NULL,
};

/// <summary>
/// Class for representing elements and objects in a json object.
/// You can use it to browse and get values and add and remove objects from a json.
/// </summary>
/// <example>
/// Example hello World:
/// @code{.xml}
///     // Create an json object with one key named "hello"
///     // and one value which is the string "world"
///     JsonData js("{\"hello\":\"world\"}");
/// @endcode
/// </example>
class JsonData
{

private:

    String        mValue;
    JSONTYPE      mType;
    JSONTYPE      mValueType;

    JsonData* mFirstChild{},
        * mNext{},
        * mParent{};

    JsonData(JSONTYPE type, JsonData* parent);
    JsonData(String jsonString, JsonData* parent);
    JsonData(String value, JSONTYPE type, JSONTYPE valueType, JsonData* parent);

    static bool          isClosingToken(char c);
    static char          getClosingToken(char openingToken);
    static int           getIndexOfClosingToken(String *string, bool ignoreStrings);
    static bool          isDigit(char c);
    static bool          removeLast(JsonData* pNode);
    static bool          destroyIncludingChildren(JsonData* pNode);
    static JSONTYPE      getValueTypeFromChar(char firstCharInValue);
    static JSONTYPE      getType(String strValue);
    static JsonData* getLastChild(JsonData* parent);
    static JsonData* getLastNode(JsonData* previous);
    static JsonData* getPointingNode(JsonData* findMe);
    static JsonData* findPointingNode(JsonData* startFrom, JsonData* findMe);
    static JsonData* getRootNode(JsonData* current);
    void                 init(JSONTYPE type, JSONTYPE valueType, JsonData* parent);
    void                 parse(const String jsonString, JsonData* parent);
    JsonData* setRootInvalid();
    String               valueToString();
    String               getValue()     const { return mValue; }

    JsonData* array(String* elements, JsonData* parent, bool canBeMoreThanOne);
    JsonData* object(String* members, JsonData* parent);
    JsonData* elements(String* values, JsonData* parent);
    bool                 getPairIndexes(String* pairs, bool& thereIsAnotherPair,
        int& keyIndexOfFirstChar, int& keyLength,
        int& valueIndexOfFirstChar, int& valueLength,
        int& pairLength);
    JsonData* members(String* pairs, JsonData* parent);
    JsonData* pair(String* keyValues, JsonData* parent);
    static bool          validateValue(const JSONTYPE jsonvaluetype, String string);
    JsonData* value(String* valuesString, JsonData* parent);
    static String       jsonTypeString(JSONTYPE type);
    String              toTree(JsonData* current, int level);
    static bool         isWhitespace(const char c);
public:
    JsonData(const char* jsonString);
    ~JsonData();
    String toString();
    String toTree();
    static String  trim(String jsonStringToTrim);
    bool           isValid() const;
    /// <summary>
    /// Checks if the current object has any child objects
    /// </summary>
    /// <returns>
    /// true if this object has one ore more child object(s).  Otherwize false
    /// </returns>
    bool          hasChildren() { return this->mFirstChild != NULL; };
    JsonData*     GetChildAt(unsigned int index);
    JsonData*     GetChild(String value);
    JsonData*     GetNext();
    float         toFloat();
    unsigned long toULong();
    long          toLong();
    int           toInt();
    JSONTYPE      getType();
    JSONTYPE      getValueType();
};

/// <summary>
/// A class for parsing json strings
/// </summary>
/// <example>
/// Example on how to create a json object from a string:
/// @code{.xml}
/// Json json("{\"hello\":\"world\",\"array\":[1,2,-4,-5.22,\"string in a array\"]}");
/// @endcode
/// </example>
class Json
{
    JsonData *mData;
public:
    Json(const char *jsonString);
    ~Json();
    String toString() const;
	String toTree() const;
    static String trim(String jsonStringToTrim);
    bool isValid() const;
    /// <summary>
    /// Use this function access the root JsonData object
    /// </summary>
    /// <returns>
    /// The root JsonData object.
    /// If the object is invalid NULL is returned.
    /// </returns>
    JsonData *getRootObject() { return mData == NULL || !mData->isValid()? NULL: mData; };
};

/// <summary>
/// Used to store time.
/// Depended on which constuctor is used, values can be eather a "date and time" or a "counter" up to 49 days. 
/// </summary>
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
    GTime(const GTime& gTime);
    GTime(unsigned long milliSeconds);
    void setTime(unsigned long milliSeconds);
    boolean setTime(String strTime);

   
    int strToMonth(String month);
    static int toNumber(String str);
    String toString();
   
    String toStreng();
   
    String toJson();
    int getYear(); 
    int getMonth();
    int getDay();
    int getHours();
    int getMinutes();
    int getSeconds();
};

/// <summary>
/// A list to store IP addresses
/// </summary>
class IPAddressList : public LinkedList<IPAddress*> {
private:
    void destory();

public:
    bool add(uint8_t first_octet, uint8_t second_octet, uint8_t third_octet, uint8_t fourth_octet);
    bool add(IPAddress address);
    bool add(const char* strIpAddress);
    bool exists(IPAddress address);
    bool exists(String strIpaddress);
    int indexOf(IPAddress address);
    bool isEmpty();
    bool remove(const char *strIpAddress);
    bool remove(IPAddress address);
    String toJson();
    ~IPAddressList();
};

/// <summary>
/// Used to monitor a pin.
/// Can monitor if a pin value changes more or less than something
/// and can monitor if a certain amount of time has passed.
/// </summary>
class PinWatch
{
    private:
        GPin* pin;
        unsigned long sampleSum       = 0;  // Sum of pin value samples
        unsigned int pinValueLast     = 0; // The pin value which was last logged.
        unsigned int pinValueMargin   = 0; // How much must a sampleSum / sampleCount change from pinValueLast to trigger a log.
        int          sampleCount      = 0; // How many times has the pinValueSum been summerized.
        int          sampleTotalCount = 0; // How many samples before we can average sampleSum and compare with pinValueLast
        unsigned long nextSampleTime;      // When should we get the next sample
        unsigned long sampleInterval;      // How long between samples
        unsigned long minLogInterval;      // The minimum time allowed to pass between logs. Set to 0 to disable
        unsigned long nextLogTime;         // If minLogInterval is > 0 then this will be the time when we must log
                                           // This time must be reset after each log. 

        void resetAllValues();
        void init(GPin* gPin, unsigned int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval);

    public:
        PinWatch(GPin* gPin, unsigned int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval);
        PinWatch(const PinWatch& pinWatch);
        void serialPrintValues();
        void serialPrintLnValues();
        
        bool check(unsigned long currentTimeInMillis);
        void reset(unsigned long currentTimeInMillis, bool updateLastPinValue = true, bool updateMinLogInterval = true);
        int getPinNumber();
        int getPinValue();
        int getPinType();
        bool isValidPin();
        String toJson();
};

/// <summary>
///  PinWatchList allows you to add one or more timers and/or monitor value changes on multiple pins
/// </summary>
/// <example>
/// Example:
/// @code{.xml}
///     PinWatchList watchList;
///     void setup(void) {
///         watchList.addPinValueMonitoring(devicePins.get(D0), 1, 1, 1000);
///         watchList.addPinValueMonitoringAndTimer(devicePins.get(D1), 2, 2, 1000, 1000 * 60 * 3);
///         watchList.addTimer(1000 * 30 * 9);
///     }
///     
///     void loop(void) {
///         if (watchList.isAnyPinWatchDo()) {
///             // One item did trigger so you could log
///             watchList.resetAllChecks();
///         }
///     }
/// @endcode
/// </example>
class PinWatchList : public LinkedList<PinWatch*> {

private:
        void destory();
        bool removeByIndex(int index);
        bool add(GPin* gPin, int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval);
        bool addJsonPinWatchToList(JsonData* jsonObject, GPins* devicePins);
        PinWatch* NewPinWatchFromJsonObject(JsonData* jsonObject, GPins* devicePins);

    public:
        bool add(PinWatch pinWatch);
        bool add(PinWatch* ptrPinWatch);
        bool update(int index, PinWatch pinWatch);
        bool addOrUpdate(PinWatch pinWatch);
        bool addTimer(unsigned long minLogInterval);
        bool addPinValueMonitoring(GPin* gPin, int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval);
        bool addPinValueMonitoringAndTimer(GPin* gPin, int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval);
        bool exists(int pinNumber);
        int  indexOfPin(int pinNumber);
        bool isEmpty();
        bool removePin(int pinNumber);
        bool isAnyPinWatchDo();
        int  getFirstPinWatchDo();
        int  getNextPinWatchDo(int index);
        void resetAllChecks();
        int updateMonitorFromJsonObject(JsonData* root, GPins *devicePins);
        int deleteMonitorFromJsonObject(JsonData* root);

        String toJson();
        ~PinWatchList();
};

//INSERT_FROM_FILE_Json.h

GTime startTime;
GPins devicePins;
IPAddressList whiteList;
GUrl  urlTool;
PinWatchList monitors;

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
                devicePins.setValue(pin, val);
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
                    urlTool.extractAndSetPinsAndValues(line.c_str(), &devicePins);
                }
            }
        }
    }
    String itemJson = urlTool.jsonRoot(OBJECTTYPE_PINS_ARRAY, "pins", devicePins.toJson());
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

    String str = urlTool.makeStatusResponceJson(devicePins.toJson(), whiteList.toJson(), startTime.toJson());
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
    server.send(200, "application/json", devicePins.JsonPinout());
}

void handleMonitors() {
    String uri = server.uri();
    Serial.println("Uri"); Serial.println(uri);
    if (     ( server.method() == HTTP_POST || server.method() == HTTP_DELETE )
          && server.hasArg("plain")                                               )
    {
        Json parser( server.arg("plain").c_str() );
        if (parser.isValid()) {
            if (server.method() == HTTP_POST) {
                Serial.println("Valid post object parsed");
                int iCount = monitors.updateMonitorFromJsonObject(parser.getRootObject(), &devicePins);
                Serial.print("updated "); Serial.print(iCount); Serial.println(iCount > 1 ? " PinWatches" : " PinWatch");
            }
            else if (server.method() == HTTP_DELETE) {
                Serial.println("Valid delete object parsed");
                int iCount = monitors.deleteMonitorFromJsonObject(parser.getRootObject());
                Serial.print("deleted "); Serial.print(iCount); Serial.println(iCount > 1 ? " PinWatches" : " PinWatch");
            }
        }
        else {
            Serial.println("Invalid Json object");
        }
    }
    
    Serial.println("client IP: " + server.client().remoteIP().toString());
    server.send(200, "application/json", monitors.toJson());
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
    Serial.println("Reporting in ");
    String ret = "Fri, 1 Jan 1971 00:00:00 GMT";
    String data = "{" +
        urlTool.jsonKeyValue("id", "\"" + String(deviceId) + "\",") +
        urlTool.jsonKeyValue("ip", "\"" + WiFi.localIP().toString() + "\",") +
        urlTool.jsonKeyValue("port", PORT) +
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

        String response = http.getString(); //Get the response to the request

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

void tellServerToSaveLog() {
    Serial.println("Telling server to log the device pins");

    HTTPClient http;
    String host = voffconServerIp.toString() + ":" + String(voffconServerPort);
    String url = "http://" + host + "/logs/pins/" + deviceId;
    http.begin(url);  
    http.addHeader("Connection", "close");
    Serial.print("Calling : "); Serial.println(url);
    int httpResponseCode = http.GET();   //make the request to server
    Serial.print("Responce code: "); Serial.println(httpResponseCode);   //return code
    Serial.println(http.getString());   //The response to the request
    http.end();  //Free resources
}

void tellServerToSendMonitors() {
    Serial.println("Telling server to send monitors");

    HTTPClient http;
    String host = voffconServerIp.toString() + ":" + String(voffconServerPort);
    String url = "http://" + host + "/monitors/update/" + deviceId;
    http.begin(url);
    http.addHeader("Connection", "close");
    Serial.print("Calling : "); Serial.println(url);
    int httpResponseCode = http.GET();   //make the request to server
    Serial.print("Responce code: "); Serial.println(httpResponseCode);   //return code
    Serial.println(http.getString());   //The response to the request
    http.end();  //Free resources
}

void SerialPrint(String str, int value) {
    Serial.print(str + " ");
    Serial.print(value);
}

void SerialPrintLn(String str, String value, bool setMarkerAtBeginningAndEndOfValue = false) {
    Serial.print(str + " ");
    if (setMarkerAtBeginningAndEndOfValue)
        value = "|" + value + "|";
    Serial.println(value);
}

void SerialPrintLn(String str, int value) {
    SerialPrint(str, value);
    Serial.println();
}

/// <summary>
/// Removes ArrayBrackets from a valid Json array
/// </summary>
/// <param name="validJsonArray">
/// Should contain a valid Json array.
/// </param>
/// <param name="out">
/// Will contain all content of validJsonArray without the surrounding brackets
/// Will be unchanged if the function returns false
/// </param>
/// <returns>
/// true : The string out will contain all content of validJsonArray without the surrounding brackets
///        Warning, it is considered a success if there is nothing between the brackets, resulting in a empty out String.
/// false: There are no surrounding brackets, The string out is unchanged".</returns>
bool removeArrayBrackets(String validJsonArray, String *out) {
    bool success;
    int start = validJsonArray.indexOf('[');
    int end = validJsonArray.indexOf(']');
    int len = validJsonArray.length();
    success = ((start == 0) && (start < end) && (end == len - 1));
    if (success)
        *out = validJsonArray.substring(start + 1, end);

    return success;
}

bool ExtractAndRemoveFirstArrayObject(String *arrayObjectList, String* out) {
    bool success;
    int start = (*arrayObjectList).indexOf('{');
    int end   = (*arrayObjectList).indexOf('}');
    int len   = (*arrayObjectList).length();
    success = (start == 0) && (start < end);
    if (!success)
        return false;

    *out = (*arrayObjectList).substring(start + 1, end);
    end++;
    if ((*arrayObjectList).charAt(end) == ',')
        end++;
    (*arrayObjectList).remove(0, end);
    return true;
}

// extracts an integer value from the first keyvalue pair
bool ExtractAndRemoveFirstKeyValuePair(String* arrayObject, String* key, long* value) {
    /* todo:    �etta fall �tti bara a� s�kja �ll value sem streng hvort sem �ar er 
    falli� �tti svo a� skila t�pu sem skilagildi hvort sem value var - tala e�a + tala e�a strengur*/

    String k, v = "";
    bool success = false;
    int start = 1, end, sign = 1;
    if ((*arrayObject).indexOf('\"') != 0) return false;
    end = (*arrayObject).indexOf('\"', start);
    if (end < 2) return false;
    k = (*arrayObject).substring(start, end);
    if ((*arrayObject).charAt(end + 1) != ':') return false;
    start = end + 2;
    if ((*arrayObject).charAt(start) == '\"') return false; //this is a string value not an integer value
    if ((*arrayObject).charAt(start) == '-') {
        sign = -1;
        start++;
    }
    int len = (*arrayObject).length();
    end = (*arrayObject).indexOf(',', start);
    if (end < start)
        end = len;

    if (start >= end)
        return false;

    int pos = start;

    char ch = (*arrayObject).charAt(pos);
    while (ch >= '0' && ch <= '9' && pos < end) {
        v += ch;
        if (pos + 1 >= end) {
            success = true;
            break;
        }
        ch = (*arrayObject).charAt(++pos);
    }
    if (success) {

        *key = k;
        *value = (atol(v.c_str()) * sign);
        if ((*arrayObject).charAt(end) == ',') end++;
        k = (*arrayObject).substring(end);
        (*arrayObject) = k;
    }

    return success;

}

int getIndex(String searchFor, KeyVal arr[], int sizeOfArr) {
    for (int i = 0; i < sizeOfArr; i++) {
        if (arr[i].key == searchFor)
            return i;
    }
    return -1;
}

//returns NULL on error or arrayObject is empty
//if not NULL you are responsible to delete the object from memory.
PinWatch *ExtractAndRemoveFirstPinWatch(GPins* devicePins, String *arrayObjectList) {

    String tempObjList = *arrayObjectList, tempObj;
    int i = 0;
    const int KEYVALS_COUNT = 10;
    KeyVal keyVals[KEYVALS_COUNT];

    if (!ExtractAndRemoveFirstArrayObject(&tempObjList, &tempObj))
        return NULL;
    
    
    while (i < KEYVALS_COUNT) {
        if (!ExtractAndRemoveFirstKeyValuePair(&tempObj, &keyVals[i].key, &keyVals[i].value))
            return NULL;
        i++;
    }

    int index_pin             = getIndex("pin"             , keyVals, KEYVALS_COUNT),
        index_pinValueMargin  = getIndex("pinValueMargin"  , keyVals, KEYVALS_COUNT),
        index_sampleTotalCount= getIndex("sampleTotalCount", keyVals, KEYVALS_COUNT),
        index_sampleInterval  = getIndex("sampleInterval"  , keyVals, KEYVALS_COUNT),
        index_minLogInterval  = getIndex("minLogInterval"  , keyVals, KEYVALS_COUNT);

    if (  index_pin              == -1 || index_pinValueMargin == -1 ||  index_sampleTotalCount == -1 ||
          index_sampleInterval   == -1 || index_minLogInterval == -1                                      )
    {
        Serial.println("Did not find all values needed to create a PinWatch");
        return NULL;
    }
    PinWatch *ptr = new PinWatch(
        (*devicePins).get(keyVals[index_pin].value),
        keyVals[index_pinValueMargin].value,
        keyVals[index_sampleTotalCount].value,
        keyVals[index_sampleInterval].value,
        keyVals[index_minLogInterval].value);

    *arrayObjectList = tempObjList;
    return ptr;
   
}

// clears all monitors and adds new ones
// success: returns number of monitors added
// fail: returns -1 on error
int setMonitorsFromJason(GPins* devicePins, String jsonArrayOfMonitors) {

    if (!removeArrayBrackets(jsonArrayOfMonitors, &jsonArrayOfMonitors))
    {
        Serial.println("Invalid monitors");
        Serial.println(jsonArrayOfMonitors);
        return false;
    }

    monitors.clear();
    PinWatch* pPinWatch = ExtractAndRemoveFirstPinWatch(devicePins, &jsonArrayOfMonitors);
    
    while (pPinWatch != NULL) {
        monitors.add(pPinWatch);
        pPinWatch = ExtractAndRemoveFirstPinWatch(devicePins, &jsonArrayOfMonitors);
    }

    return monitors.size();
}
void test(GPins *devicePins) {
    Serial.println("--------------------------  starting test()  --------------------------");
        bool success;
        String  jsonMonitors = "[{\"pin\":-1,\"sampleSum\":0,\"pinValueLast\":4294967295,\"pinValueMargin\":0,\"sampleCount\":0,\"sampleTotalCount\":0,\"nextSampleTime\":0,\"sampleInterval\":0,\"minLogInterval\":86400000,\"nextLogTime\":86411107},{\"pin\":5,\"sampleSum\":700,\"pinValueLast\":700,\"pinValueMargin\":1,\"sampleCount\":1,\"sampleTotalCount\":2,\"nextSampleTime\":881877,\"sampleInterval\":500,\"minLogInterval\":518400000,\"nextLogTime\":518411125}]";
       setMonitorsFromJason(devicePins, jsonMonitors);
        Serial.println(" M o n i t o r s ");
        Serial.println(monitors.toJson());

        /*
        SerialPrintLn("current", current, true);
        long lValue = 0;
        String key;
        success = ExtractAndRemoveFirstKeyValuePair(&current, &key, &lValue);
        SerialPrintLn("-----------------success", success);
        SerialPrintLn("key", key, true);
        SerialPrintLn("value", lValue);
        SerialPrintLn("current", current, true);*/

    Serial.println("-------------------------- ending test  --------------------------");
    while (true);
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
    
    server.on("/",         handleRoot);
    server.on("/pins",     handlePins);
    server.on("/whitelist",handleWhitelist);
    server.on("/started",  handleStarted);
    server.on("/status",   handleStatus);
    server.on("/setup",    handleSetup);
    server.on("/pinout",   handlePinout);
    server.on("/monitors", handleMonitors);
    
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
    devicePins.addPin("D0", type, D0, startState);
    devicePins.addPin("D1", type, D1, startState);
    devicePins.addPin("D2", PINTYPE_INPUT_ANALOG, D2, 512);
    devicePins.addPin("D3", PINTYPE_INPUT_DIGITAL, D3, startState);
    devicePins.addPin("D4", PINTYPE_OUTPUT_DIGITAL, D4, startState);
    devicePins.addPin("D5", type, D5, 123);
    devicePins.addPin("D6", type, D6, startState);
    devicePins.addPin("D7", type, D7, startState);
    devicePins.addPin("D8", PINTYPE_OUTPUT_VIRTUAL, D8, 456);
	//SETTING_UP_PINS_END

    Serial.println(devicePins.toJson());
    //monitors.addTimer(1000 * 60 * 60 * 24); //ones per day
    //monitors.addPinValueMonitoringAndTimer(devicePins.get(D1), 1, 2, 500, (1000 * 60 * 60 * 24 * 6));//the 6 day timer will never ve triggered because of the other 1 day timer
    tellServerToSendMonitors();
}

void loop(void) {
    if (monitors.isAnyPinWatchDo()) {
        // One item did trigger so you could log
        tellServerToSaveLog();
        monitors.resetAllChecks();
    }
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

/// <summary>
/// Constructor for the GPin object
/// You will need to porovide name, type, number and a starting value of the pin
/// </summary>
/// <param name="strPinName">Name of the pin</param>
/// <param name="pinType">Type of the pin
/// <para/>Possible types of a pin are:
/// <para/>PINTYPE_INPUT_ANALOG   : "Read method analogRead shall be used"
/// <para/>PINTYPE_INPUT_DIGITAL  : "Read method digitalRead shall be used"
/// <para/>PINTYPE_OUTPUT_ANALOG  : "Write method analogWrite shall be used"
/// <para/>PINTYPE_OUTPUT_DIGITAL : "Write method digitalWrite shall be used"
/// <para/>PINTYPE_OUTPUT_VIRTUAL : "A pin not connected to hardware, but can store values"
/// </param>
/// <param name="pinNumber">Number of the pin.  That is the GPIO number</param>
/// <param name="pinValue">The value to set the pin to</param>
/// <param name="pinChannel">Pin channel is needed only for the esp32.  todo: provide more decription</param>
GPin::GPin(const char*strPinName, PINTYPE pinType, int pinNumber, int pinValue, uint8_t pinChannel) {
    mChannel = pinChannel;
    init(strPinName, pinType, pinNumber, pinValue);
}
#else

/// <summary>
/// Constructor for the GPin object
/// You will need to porovide name, type, number and a starting value of the pin
/// </summary>
/// <param name="strPinName">Name of the pin</param>
/// <param name="pinType">Type of the pin
///   <para/>Possible pin types are:
///     <para/>PINTYPE_INPUT_ANALOG   : "Read method analogRead shall be used"
///     <para/>PINTYPE_INPUT_DIGITAL  : "Read method digitalRead shall be used"
///     <para/>PINTYPE_OUTPUT_ANALOG  : "Write method analogWrite shall be used"
///     <para/>PINTYPE_OUTPUT_DIGITAL : "Write method digitalWrite shall be used"
///     <para/>PINTYPE_OUTPUT_VIRTUAL : "A pin not connected to hardware, but can store values"
/// </param>
/// <param name="pinNumber">Number of the pin.  That is the GPIO number</param>
/// <param name="pinValue">The value to set the pin to</param>
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

/// <summary>
/// Deconstructor for the pin
/// </summary>
GPin::~GPin() { 
    this->destroy(); 
};
void GPin::set(int number, int value) {
    mNumber = number;
    setValue(value);
}

/// <summary>
/// Assigns a name to a specific pin
/// </summary>
/// <param name="strPinName">Name of the pin</param>
void GPin::setName(const char * strPinName) {
    if (strPinName == NULL)
        return;
    if (mName != NULL) 
        delete[] mName;
    mName = new char[strlen(strPinName) + 1];
    strcpy(mName, strPinName);
}

void GPin::destroy() {
    if (mName != NULL) {
        delete[] mName;
        mName = NULL;  //no need but feels good :)
    }
}

/// <summary>
/// Gets a pin name
/// </summary>
/// <returns>A String containing the pin name</returns>
String GPin::getName() {
    return String(this->mName);
}
/// <summary>
/// Sets a new value to a pin
/// If the pin is of the type PINTYPE_OUTPUT_ANALOG or PINTYPE_OUTPUT_DIGITAL
/// Then the GPIO pin of the device will be changed to this value.
/// </summary>
/// <param name="value">The new value to set</param>
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

/// <summary>
/// Read a pin value.
/// If input type is PINTYPE_INPUT_DIGITAL or PINTYPE_INPUT_ANALOG and readValueFromHardware is true
/// then a read will be maid directly to the hardwarepin. otherwise the old member value will be returned.
/// </summary>
/// <param name="readValueFromHardware"></param>
/// <returns>The value as an int</returns>
int GPin::getValue(bool readValueFromHardware) {
    if (readValueFromHardware && mType != PINTYPE_OUTPUT_VIRTUAL) {
        if (mType == PINTYPE_INPUT_DIGITAL)
            mValue = digitalRead(mNumber);
        else if (mType == PINTYPE_INPUT_ANALOG)
            mValue = analogRead(mNumber);
    }
    return mValue; 
}

/// <summary>
/// Get the number of a pin.
/// <para>You can then use this number to search for the index of the pin in the GPins object</para>
/// </summary>
/// <returns>The number of the pin.  ps. this is not the Index of a pin.</returns>
int GPin::getNumber() { 
    return mNumber; 
}

/// <summary>
/// Gets the type of the pin 
/// <para>Possible pin types are:</para>
/// <para>PINTYPE_INPUT_ANALOG   : "Read method analogRead shall be used"</para>
/// <para>PINTYPE_INPUT_DIGITAL  : "Read method digitalRead shall be used"</para>
/// <para>PINTYPE_OUTPUT_ANALOG  : "Write method analogWrite shall be used"</para>
/// <para>PINTYPE_OUTPUT_DIGITAL : "Write method digitalWrite shall be used"</para>
/// <para>PINTYPE_OUTPUT_VIRTUAL : "A pin not connected to hardware, but can store values"</para>
/// </summary>
/// <returns>The type of the pin</returns>
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

/// <summary>
/// Returns pin number and value as a Key value pair with no surrounding curly brackets
/// </summary>
/// <returns>A key value string which can be added to a Json object string</returns>
String GPin::toJsonKeyValue() {
    return jsonKeyValue(getName(), getNumber());
}

/// <summary>
/// Converts the pin -name, -number, -type and -value to a valid json object string
/// </summary>
/// <returns>A json object string with information about pin members</returns>
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

/// <summary>
/// Constructor for the GPins Object
/// </summary>
GPins::GPins() { 
    mLength = 0; 
}

/// <summary>
/// Sets the value of a pin with the given number.
/// </summary>
/// <param name="pinNumber">The number of the pin to search for</param>
/// <param name="newValue">The new value to be set</param>
/// <returns>True if value was set.  False if value was not set because no pin with given pin number was not found.</returns>
boolean GPins::setValue(int pinNumber, int newValue) {
    int i = indexOf(pinNumber);
    if (i < 0) return false;
    Serial.println("setting value of " + String(i) + " to " + String(newValue));
    mPins[i]->setValue(newValue);
    return true;
}
// todo: will we need a removePIn function?
#ifdef ESP32 
/// <summary>
/// Adds a pin
/// </summary>
/// <param name="strPinName">The name of the pin</param>
/// <param name="pinType">Type of the pin
/// <para/>Possible types of a pin are:
/// <para/>PINTYPE_INPUT_ANALOG   : "Read method analogRead shall be used"
/// <para/>PINTYPE_INPUT_DIGITAL  : "Read method digitalRead shall be used"
/// <para/>PINTYPE_OUTPUT_ANALOG  : "Write method analogWrite shall be used"
/// <para/>PINTYPE_OUTPUT_DIGITAL : "Write method digitalWrite shall be used"
/// <para/>PINTYPE_OUTPUT_VIRTUAL : "A pin not connected to hardware, but can store values"
/// </param>
/// <param name="pinNumber">Number of the pin (GPIO number)</param>
/// <param name="pinValue">Starting value of the pin.  If the pin type is an input pin then the value will be read from the hardware and this value ignored.</param>
/// <returns>The number of pins after the pin was added.</returns>
int GPins::addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue) {

    if (pinType == PINTYPE_OUTPUT_ANALOG) {
        mChannelCount++; //mChannel is only used when pin is of type PINTYPE_OUTPUT_ANALOG
    }
    mPins[mLength] = new GPin(strPinName, pinType, pinNumber, pinValue, mChannelCount - 1);
    mLength++;
    return mLength - 1;
}
#else
/// <summary>
/// Adds a pin
/// </summary>
/// <param name="strPinName">The name of the pin</param>
/// <param name="pinType">Type of the pin
/// <para/>Possible types of a pin are:
/// <para/>PINTYPE_INPUT_ANALOG   : "Read method analogRead shall be used"
/// <para/>PINTYPE_INPUT_DIGITAL  : "Read method digitalRead shall be used"
/// <para/>PINTYPE_OUTPUT_ANALOG  : "Write method analogWrite shall be used"
/// <para/>PINTYPE_OUTPUT_DIGITAL : "Write method digitalWrite shall be used"
/// <para/>PINTYPE_OUTPUT_VIRTUAL : "A pin not connected to hardware, but can store values"
/// </param>
/// <param name="pinNumber">Number of the pin (GPIO number)</param>
/// <param name="pinValue">Starting value of the pin.  If the pin type is an input pin then the value will be read from the hardware and this value ignored.</param>
/// <returns>The number of pins after the pin was added.</returns>
int GPins::addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue) {
    mPins[mLength] = new GPin(strPinName, pinType, pinNumber, pinValue);
    mLength++;
    return mLength - 1;
}
#endif

/// <summary>
/// Searches for a pin with a specific number and returns it's index in the array
/// </summary>
/// <param name="pinNumber">The pin number to search for</param>
/// <returns>If nothing is found the function returns -1</returns>
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

/// <summary>
/// Checks if a pin with a given number exits.
/// </summary>
/// <param name="pinNumber"></param>
/// <returns>true if a pin was found otherwise false</returns>
boolean GPins::exists(int pinNumber) {
    return (indexOf(pinNumber) > -1);
}

/// <summary>
/// Gets a pointer to a GPin
/// </summary>
/// <param name="pinNumber">The pin number to search for</param>
/// <returns>A pointer to the GPin ojbect. Returns NULL if pin is not found</returns>
GPin *GPins::get(int pinNumber) {
    int i = indexOf(pinNumber);
    if (i < 0) return NULL;
    return mPins[i];
}

/// <summary>
/// Gets a value of a pin
/// </summary>
/// <param name="pinNumber">The pin to get the value from</param>
/// <returns>The value of the given pin.<para/>  Returns -1 if pinNumber was not found</returns>
int GPins::getValue(int pinNumber) {
    
    GPin *pin = this->get(pinNumber);
    if (pin == NULL) return -1;
    return pin->getValue();
}

/// <summary>
/// Gets the number of pins.
/// </summary>
/// <returns>Number of GPin objects in the GPins object</returns>
int GPins::count() {
    return mLength;
}

/// <summary>
/// Returns all pin values in a json array
/// a key-value Json object with the '{' and '}' around it.
/// where first key is the first in the index with the key as the GPO key
/// and the value is the last value set to that key.
/// </summary>
/// <returns>A Json object string containing status of all pins in the GPins object</returns>
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
/// Creates a JSON object containg all pins name and their number.
/// </summary>
/// <returns>A string formatted as a JSON object which contains all pin names and number. </returns>
String GPins::JsonPinout() {
    String str = "[";
    int i;
    for (i = 0; i < mLength; i++) {
        if (i > 0) {
            str = str + ",";
        }
        str = str + mPins[i]->toJsonKeyValue();
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

/// <summary>
/// Creates a string with a key and a value, which can be used when populating a JSON object.
/// </summary>
/// <param name="key">Name of the key</param>
/// <param name="value">The integer value</param>
/// <returns>
/// A string with a key and a value.  
/// For example: 
/// "args":12
/// </returns>
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

/// <summary>
//  Get the key and value as a json pair string.
//on error "" is returned.
/// </summary>
/// <returns>Success: returns the key value pair as a String. Fail: returns ""</returns>
String KeyValue::toJson() {
    String val;
    return "\"" + mKey + "\":" + getValueString(true);
}
#endif //CODE_BLOCK_KeyValue_impl

#ifndef CODE_BLOCK_Gtime

/// <summary>
    /// Assignment constructor
    /// </summary>
    /// <example>
    /// @code{.xml}
    /// GTime x, y;
    /// x = y;
    /// @endcode
    /// </example>
GTime::GTime(const GTime& gTime) {
    mYear    = gTime.mYear;
    mMonth   = gTime.mMonth;
    mDay     = gTime.mDay;
    mHours   = gTime.mHours;
    mMinutes = gTime.mMinutes;
    mSeconds = gTime.mSeconds;
}

/// <summary>
/// Sets a new GTime by converting milliseconds to GTime 
/// Largest possible unsigned long is 4294967295, which is 49 days, 17:02:47
/// If there are more than 28 days then the month is not be increased so days can grow up to 49
/// But note, this is not a real GTime because this is more like a counter, 
/// so if milliseconds are less than one day year, month and day will all be 0
/// </summary>
/// <param name="milliSeconds">
/// There are 1000 milliSeconds in a second
/// </param>
void GTime::setTime(unsigned long milliSeconds) {
    unsigned long d=0, y, s, m, h, mi;
    y = ((unsigned long)60 * (unsigned long)60 * (unsigned long)1000);
    h = milliSeconds / y;
    m = (milliSeconds - (h * y)) / (y / 60);
    s = (milliSeconds - (h * y) - (m * (y / 60))) / 1000;
    mi = milliSeconds - (h * y) - (m * (y / 60)) - (s * 1000);

    if (h > 23)
    {
        d = h / 24;
        h -= (d * 24);
    }
    mYear = 0;
    mMonth = 0;
    mDay = d;

    mHours = h;
    mMinutes = m;
    mSeconds = s;
}
/// <summary>
/// Constructor for the GTime object 
/// Creates new GTime by converting milliseconds to GTime
/// Largest possible unsigned long is 4294967295, which is 49 days, 17:02:47
/// If there are more than 28 days then the month is not be increased so days can grow up to 49
/// But note, this is not a real GTime because this is more like a counter, 
/// so if milliseconds are less than one day year, month and day will all be 0
/// </summary>
/// <param name="milliSeconds">
/// There are 1000 milliSeconds in a second
/// </param>
GTime::GTime(unsigned long milliSeconds) {
    setTime(milliSeconds);
}

/// <summary>
/// Sets time values from a given string
/// </summary>
/// <param name="strTime">
/// A string with date and time.
/// The string needs to be formatted like this: 
/// Fri, 15 Jul 2016 11:08:12 GMT
/// </param>
/// <returns>Success: returns true if time was set successfully.  Fail: returns false.</returns>
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

/// <summary>
/// Converts a String to a number positive number.
/// Negative numbers are considered invalid.
/// </summary>
/// <param name="str">The string to be converted to a number.</param>
/// <returns>
/// Success: The converted number.
/// Fail   : -9999
/// </returns>
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

/// <summary>
/// Returns date and time values as a english date time string.
/// </summary>
/// <returns>Date and time string on the format "MM/DD/YY hh:mm:ss"</returns>
String GTime::toString() {
    return  String(mMonth) + "/" +
        String(mDay) + "/" +
        String(mYear) + " " +
        String(mHours) + ":" +
        String(mMinutes) + ":" +
        String(mSeconds);
}

/// <summary>
/// Returns date and time values as a icelandic date time string.
/// </summary>
/// <returns>Date and time string on the format "DD.MM.YY hh:mm:ss"</returns>
String GTime::toStreng() {
    return  String(mDay) + "." +
        String(mMonth) + "." +
        String(mYear) + " " +
        String(mHours) + ":" +
        String(mMinutes) + ":" +
        String(mSeconds);
}

/// <summary>
/// Returns the date and time values as an JSON object.
/// </summary>
/// <returns>A String formatted as an JSON object</returns>
String GTime::toJson() {
    String str = "{\"year\":" + String(mYear) + "," +
        "\"month\":" + String(mMonth) + "," +
        "\"day\":" + String(mDay) + "," +
        "\"hours\":" + String(mHours) + "," +
        "\"minutes\":" + String(mMinutes) + "," +
        "\"seconds\":" + String(mSeconds) + "}";
    return str;
}

/// <summary>
/// Get the year part of the GTime
/// </summary>
/// <returns>The year as a integer number</returns>
int GTime::getYear() { return mYear; }
/// <summary>
/// Get the month part of the GTime
/// </summary>
/// <returns>The month as a integer number</returns>
int GTime::getMonth() { return mMonth; }
/// <summary>
/// Get the day part of the GTime
/// </summary>
/// <returns>The day as a integer number</returns>
int GTime::getDay() { return mDay; }
/// <summary>
/// Get the hours part of the GTime
/// </summary>
/// <returns>The hours as a integer number</returns>
int GTime::getHours() { return mHours; }
/// <summary>
/// Get the minutes part of the GTime
/// </summary>
/// <returns>The minutes as a integer number</returns>
int GTime::getMinutes() { return mMinutes; }
/// <summary>
/// Get the seconds part of the GTime
/// </summary>
/// <returns>The seconds as a integer number</returns>
int GTime::getSeconds() { return mSeconds; }

#endif //CODE_BLOCK_Gtime

/// <summary>
/// Parses the json_string into a new JsonData object
/// </summary>
/// <example>
/// // Create an empty object
/// @code{.xml}
/// // Create an empty json object
///   JsonData jsEmptyObject("{}");
/// 
/// // Create an empty json array
///   JsonData jsEmptyArray("[]");
/// @endcode
/// </example>
/// <param name="jsonString">Must be a valid JSON string</param>
Json::Json(const char *jsonString)
{
    mData = new JsonData(jsonString);
}

/// <summary>
/// A deconstructor for the Json object.  It will free the object from memory.
/// This function fires automatically when this object is no longer needed.
/// </summary>
Json::~Json()
{
if (mData) {
        //cout << "Deleting " << mData->getKey().c_str() << ":" << mData->getValue().c_str() << endl;
        delete mData;
        mData = NULL;
    }
}

/// <summary>
/// Returns the object as a JSON string.  
/// This string should be a valid JSON string, ready to be sent over the wire.
/// </summary>
/// <returns>The current object returned as an JSON String.</returns>
String Json::toString() const
{
    return mData->toString();
}

/// <summary>
/// Showing objects and sub-objects In a treeview.
/// That is child objects have additional tabs relative to parent objects.
/// </summary>
/// <returns>The json object as a tree view string.</returns>
String Json::toTree() const
{
	return mData->toTree();
}

/// <summary>
/// Removes all unnecessary white spaces like tab end line and carriage return
/// </summary>
/// <param name="jsonStringToTrim">The input string that will be unchanged</param>
/// <returns>Copy of the input string without all white spaces</returns>
String Json::trim(String jsonStringToTrim)
{
    
    return JsonData::trim(jsonStringToTrim);
}

/// <summary>
/// Will tell you if the current object is invalid
/// </summary>
bool Json::isValid() const
{
    return mData->isValid();
}

/// <summary>
/// Parses the json_string into a new JsonData object
/// </summary>
/// <example>
/// Example one:
/// @code{.xml}
///     // Create an empty json object
///     JsonData jsEmptyObject("{}");
/// @endcode
/// Example two:
/// @code{.xml}
///     // Create an empty json array
///     JsonData jsEmptyArray("[]");
/// @endcode
/// </example>
/// <param name="jsonString">Must be a valid JSON string</param>
JsonData::JsonData(const char* jsonString)   // NOLINT(cppcoreguidelines-pro-type-member-init, hicpp-member-init)
{
    //parse calls init which will initialize members
    parse(jsonString, NULL);
}

/// <summary>
/// Parses a json string into a new JsonData object
/// </summary>
/// <param name="jsonString">A valid json string for the current object</param>
/// <param name="parent">Parent of this json object if no parent pass NULL</param>
JsonData::JsonData(const String jsonString, JsonData* parent)  // NOLINT(cppcoreguidelines-pro-type-member-init, hicpp-member-init)
{
    //parse calls init which will initialize members
    parse(jsonString, parent);
}

/// <summary>
/// Creates a new Json object with a invalid valueType
/// </summary>
/// <param name="type">The type of object this is</param>
/// <param name="parent">Parent of this json object if no parent pass NULL</param>
JsonData::JsonData(JSONTYPE type, JsonData* parent) {  // NOLINT(cppcoreguidelines-pro-type-member-init, hicpp-member-init)
    //init will initialize member values
    init(type, JSONTYPE_INVALID, parent);
}

/// <summary>
/// Initializes all member variables
/// </summary>
/// <param name="type">The type of this object</param>
/// <param name="valueType">The value type of this object</param>
/// <param name="parent">Parent of this json object if no parent pass NULL</param>
void JsonData::init(JSONTYPE type, JSONTYPE valueType, JsonData* parent) {
    this->mParent = parent;
    mType = type;
    mValueType = valueType;
    mFirstChild = NULL;
    mNext = NULL;
    if (parent) {
        if (type != parent->mValueType) {
            parent->mValueType = type;
        }
        JsonData* lastChild = getLastChild(parent);
        if (lastChild)
            lastChild->mNext = this;
        else
            parent->mFirstChild = this;
    }
}

/// <summary>
/// Initializes all member variables and parses the jsonString
/// </summary>
/// <param name="jsonString">Json string object</param>
/// <param name="parent">Parent, pass NULL if this is the root object (no parent)</param>
void JsonData::parse(const String jsonString, JsonData* parent) {
    // 
    String strJson(trim(jsonString));
    init(JSONTYPE_INVALID, JSONTYPE_INVALID, parent);
    const int len = strJson.length();
    if (len < 2)
        return;
    const char firstChar = strJson.charAt(0);
    if (strJson.charAt(len - 1) != getClosingToken(firstChar))
        return;//invalid json

    if (firstChar == '[')
        mType = JSONTYPE_ARRAY;
    else if (firstChar == '{')
        mType = JSONTYPE_OBJECT;
    else
        return;  //invalid json
    if (len == 2)
        return; //an empty json

    if (mType == JSONTYPE_ARRAY)
        array(&strJson, this, false);
    else  if (mType == JSONTYPE_OBJECT)
        object(&strJson, this);

}

/// <summary>
/// Searches for children of a given parent.
/// </summary>
/// <param name="parent">The parent to search for last child in.  Must not be NULL.</param>
/// <returns>A pointer to the last child of the parent object.  Return NULL if parent has not children</returns>
JsonData* JsonData::getLastChild(JsonData* parent) {
    if (parent->mFirstChild == NULL)
        return NULL;

    JsonData* child = parent->mFirstChild;
    while (child->mNext) {
        child = child->mNext;
    }

    return child;
}

/// <summary>
/// Searches for the last sibling of a node;
/// </summary>
/// <param name="previous">Will search for the last sibling after this node. </param>
/// <returns>Pointer to the last sibling after previous node.  Returns NULL if previous is the last node.</returns>
JsonData* JsonData::getLastNode(JsonData* previous) {

    if (!previous)
        return NULL;

    JsonData* pNode = previous->mNext;
    if (!pNode)
        return NULL;

    while (pNode->mNext) {
        pNode = pNode->mNext;
    }

    return pNode;
}
//key and val must have a parent

/// <summary>
/// Will create a new Object and set it's values according to the given parameters.
/// No parsing will take place.  Makes the last child of parent point to this one.
/// </summary>
/// <param name="value"></param>
/// <param name="type"></param>
/// <param name="valueType"></param>
/// <param name="parent">Parent of this json object if no parent pass NULL</param>
JsonData::JsonData(String value, JSONTYPE type, JSONTYPE valueType, JsonData* parent) {  // NOLINT
    init(type, valueType, parent);
    mValue = value;
}

/// <summary>
/// Checks if a character is any of the json closing tokens 
/// note quotes " are tricky, it can also be a starting token but we return true for that
/// </summary>
/// <param name="c">The Character to check</param>
/// <returns></returns>
bool JsonData::isClosingToken(const char c) {

    switch (c) {
    case ']':
    case '}':
    case '"':
    case ',': return true;

    default: return false;
    }
}

/// <summary>
/// Searches for an closing token of the given opening token
/// </summary>
/// <param name="openingToken">The opening token to find a closing token for</param>
/// <returns>The closing token for an opening token.   if '+' is returned then any of the closing tokens can be a closing token. If no closing token was found then ' ' is returned.</returns>
char JsonData::getClosingToken(const char openingToken) {
    switch (openingToken) {
    case '[':   return ']';
    case '{':   return '}';
    case '"':   return '"';
    case ':':   return '+';

    case '-':/*Fyrir integer or float*/
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
        //todo hvað með
    case '0': /*Fyrir floating point*/
    case 'f': /*Fyrir bool*/
    case 't':
    case 'n': /*Fyrir null*/
        return '+';

    default:   return ' ';
    }
}

/// <summary>
/// Searches for end of string.
/// </summary>
/// <param name="searchMe">a pointer to the string to search</param>
/// <param name="startAt">index of the first carater in the string.  That is first character afthe the "</param>
/// <param name="length">length of the searchMe.</param>
/// <returns>Index of where the string ends (index of the ")</returns>
int getIndexOfClosingString(String* searchMe, int startAt, int length) {
    int index = startAt;
    if (length < 2 || index < 1 || index >= length)
        return -1;
    char before,
        check = searchMe->charAt(index - 1);

    while (index < length) {
        before = check;
        check = searchMe->charAt(index);

        if (check == '\"' && before != '\\') {
            return index;
        }
        index++;
    }
    return -1;
}

/// <summary>
/// If one of these three start tokens [ { " are found at the beginning of
/// the string  the function returns the position of it's closing token.
/// </summary>
/// <param name="string">First char of this string will be used to search the same string for it's closing token</param>
/// <param name="ignoreStrings">If you are searching for a closing string token (first char is ") then set this parameter to false.</param>
/// <returns>
///     Success: Index of the closing token.  Fail: Returns -1 if startToken is not found.  
///     Returns -2 if startToken is found but no end token.
/// </returns>
int JsonData::getIndexOfClosingToken(String* string, bool ignoreStrings = true) {
    int length = string->length();
    if (length < 1)
        return -1;  //maybe this should be 2
    const char cStart = string->charAt(0);
    const char cEnd = getClosingToken(cStart);
    if (cEnd == ' ') return -1;

    char before, check;

    int index = 1,
        level = 1;
    char startToken = cStart,
        endToken = cEnd;

    if (!ignoreStrings && string->charAt(0) == '\"') {
        //read untill end of string
        return getIndexOfClosingString(string, 1, length);
    };

    while (index < length) {
        before = string->charAt(index - 1);
        check = string->charAt(index);
        if (check == startToken && startToken != endToken && endToken != '+') {
            if (!ignoreStrings && startToken == '\"' && before == '\\') // if \" is within a string it should be ignored
            {/*Ignore this case*/
            }
            else
                level++;
        }
        else if (check == endToken || (endToken == '+' && isClosingToken(check))) {
            if (!ignoreStrings && endToken == '\"' && before == '\\') // if \" is within a string it should be ignored
            {/*ignore this case*/
            }
            else
                level--;
        }

        if (level == 0)
            return index;
        index++;
    }
    return -1;
}

/// <summary>
/// Checks if the character is a digit.
/// </summary>
/// <param name="c">The character to check.</param>
/// <returns>True if it is a digit.  False it is not.</returns>
bool JsonData::isDigit(const char c) {
    return (c >= '0' && c <= '9');
}

/// <summary>
/// Searches for a value in the string, creates an object and removes that value from the string
/// Lexer: 
///        value     =  [ string | number | object | array | "true" | "false" | "null" ]
///        number    = [ @ignore("null") [int frac? exp?] ]
///        object    = [ '{' members? '}' ]
///        array     = [ '[' elements? ']' ]
///        string      = [ '"' text '"' ]
/// PS.
///    We are skipping "true" | "false" | "null" | frac | exp for now
/// </summary>
/// <param name="valuesString">A json string to search for the first value</param>
/// <param name="parent">There must be a parent of a value.</param>
/// <returns>A pointer to the object created.  If value was found, the function returns NULL</returns>
JsonData* JsonData::value(String* valuesString, JsonData* parent)
{
    if (!parent)
        return NULL;
    const int len = valuesString->length();
    if (len < 1)
        return NULL;

    String strKey, strValue;
    const char firstChr = valuesString->charAt(0);

    JSONTYPE valType = getValueTypeFromChar(firstChr);
    int endOfVal = getIndexOfClosingToken(valuesString);
    JsonData* pNewObject;
    switch (valType)
    {
    case JSONTYPE_OBJECT:
        return object(valuesString, parent);
    case JSONTYPE_ARRAY:
        return array(valuesString, parent, true);
    case JSONTYPE_STRING:
        pNewObject = pair(valuesString, parent);
        if (!pNewObject)
        {
            //this is a string
            endOfVal = getIndexOfClosingToken(valuesString, false);
            if (endOfVal < 1) return NULL;
            strValue = valuesString->substring(1, endOfVal);
            int delLen = endOfVal + 1;
            if (delLen + 1 < valuesString->length()) {
                delLen += valuesString->charAt(delLen) == ',';
            }
            *valuesString = valuesString->substring(delLen);

            if (!validateValue(valType, strValue))
                return setRootInvalid();
            pNewObject = new JsonData(strValue, valType, valType, parent);

        }
        return pNewObject;
    case JSONTYPE_ULONG:
    case JSONTYPE_LONG:
        if (endOfVal == -1)
        {
            JSONTYPE tempType = getType(*valuesString);
            if (tempType != valType && tempType != JSONTYPE_FLOAT) {
                return setRootInvalid();
            }
            else
                endOfVal = len;
        }
        strValue = valuesString->substring(0, endOfVal);
        if (endOfVal < valuesString->length()) {
            endOfVal += valuesString->charAt(endOfVal) == ',';
        }
        *valuesString = valuesString->substring(endOfVal);
        if (getType(strValue) == JSONTYPE_FLOAT) {
            valType = JSONTYPE_FLOAT;
        }

        if (!validateValue(valType, strValue))
            return setRootInvalid();
        pNewObject = new JsonData(strValue, valType, valType, parent);
        return pNewObject;
    case JSONTYPE_BOOL:
    case JSONTYPE_NULL:
        if (endOfVal == -1)
        {
            JSONTYPE tempType = getType(*valuesString);
            if (tempType != valType) {
                return setRootInvalid();
            }
            else
                endOfVal = len;
        }
        strValue = valuesString->substring(0, endOfVal);
        if (endOfVal < valuesString->length()) {
            endOfVal += valuesString->charAt(endOfVal) == ',';
        }
        *valuesString = valuesString->substring(endOfVal);

        if (!validateValue(valType, strValue))
            return setRootInvalid();
        pNewObject = new JsonData(strValue, valType, valType, parent);
        return pNewObject;
    default:
        return NULL;
    }
}

/// <summary>
/// Extracts the first value found in the string
/// Lexer: elements  = [ value [',' value]* ]
/// </summary>
/// <param name="strValues">Json string with one or more values</param>
/// <param name="parent">parent must not be NULL</param>
/// <returns></returns>
JsonData* JsonData::elements(String* strValues, JsonData* parent)
{
    // all values must be children of parent 

    const int len = strValues->length();
    if (parent == NULL)
        return setRootInvalid();
    if (len < 1)
        return NULL;
    JsonData* pLast, * p = NULL;
    do {
        pLast = p;
        p = value(strValues, parent);
    } while (p);
    return pLast;
}

/// <summary>
/// Processes one ore more pairs and adds them to parent.
/// Lexer: members   = [ pair [',' pair]* ]
/// </summary>
/// <param name="pairs">One ore move Pairs</param>
/// <param name="parent">Parent of all pairs.  Must not be NULL</param>
/// <returns>The last Pair object added to parent</returns>
JsonData* JsonData::members(String* pairs, JsonData* parent)
{
    const int len = pairs->length();
    if (parent == NULL ||
        len < 5 || // "x":1
        pairs->charAt(0) != '\"'
        )
        return NULL;

    JsonData* pLast;

    //hér þarf að finna út hvort object fari í child eða next

    int keyIndexOfFirstChar, keyLength, valueIndexOfFirstChar,
        valueLength, pairLength;
    bool thereIsAnotherPair;

    String firstPairString = "";

    JsonData* p = NULL;
    do {
        pLast = p;
        if (!getPairIndexes(pairs, thereIsAnotherPair, keyIndexOfFirstChar, keyLength, valueIndexOfFirstChar, valueLength, pairLength)
            || valueLength == 0)
        {
            break;
        }

        firstPairString = pairs->substring(0, pairLength);
        *pairs = pairs->substring(pairLength + thereIsAnotherPair);
        p = pair(&firstPairString, parent);

    } while (p);
    return pLast;
}

/// <summary>
/// Parses members of an object from a string.
/// Lexer: members   = [ pair [',' pair]* ]
///        pair      = [ string ':' value ]
/// </summary>
/// <param name="members">Json string which will be parsed.</param>
/// <param name="parent">Parent of all members.  Must not be NULL.</param>
/// <returns></returns>
JsonData* JsonData::object(String* members, JsonData* parent)
{
    const int len = members->length();
    if (parent == NULL || len < 2 || members->charAt(0) != '{')
        return NULL;

    //remove brackets around first object
    int endOf = getIndexOfClosingToken(members);
    if (endOf < 1)
        return NULL;
    String strArr = members->substring(1, endOf);
    endOf++;
    const bool moreItems = (endOf < len) && (members->charAt(endOf) == ',');
    if (moreItems)
        endOf++;
    *members = members->substring(endOf);
    JsonData* current = parent;
    if (parent != NULL)
    {
        if (strArr.length() == 0) {
            return new JsonData(JSONTYPE_OBJECT, parent);
        }
        if (parent->mType == JSONTYPE_ARRAY)
            current = new JsonData(JSONTYPE_OBJECT, parent);
        else if (strArr.length() > 0)
        {
            JSONTYPE objType = getValueTypeFromChar(strArr.charAt(0));
            if (parent->mType == JSONTYPE_KEY_VALUE)
                current = new JsonData(JSONTYPE_OBJECT, parent);
        }
        else
            return current;
    }
    return this->members(&strArr, current);
}

/// <summary>
/// Gets information about a pair, if it is a valid pair
/// </summary>
/// <param name="pairs">A string with one or more pairs with NO surrounding {}</param>
/// <param name="thereIsAnotherPair">true if there are more pairs in this string</param>
/// <param name="keyIndexOfFirstChar">Position of where the first char in the key</param>
/// <param name="keyLength">length of the key</param>
/// <param name="valueIndexOfFirstChar">Position of where the first char in the value</param>
/// <param name="valueLength">length of the value</param>
/// <param name="pairLength">Length of the pair</param>
/// <returns>true: All information about a pair was found and stored in parameters
///          False:Pair invalid no parameter value is unchanged</returns>
bool JsonData::getPairIndexes(String* pairs, bool& thereIsAnotherPair,
    int& keyIndexOfFirstChar, int& keyLength,
    int& valueIndexOfFirstChar, int& valueLength,
    int& pairLength)
{
    ///////////// start /////////////////
    const int len = pairs->length();
    if (len < 5 || // "x":1
        pairs->charAt(0) != '\"')
        return false;

    //we need to find end of value to find endOfPair
    const int indexOfKeyEnd = getIndexOfClosingToken(pairs, false);
    if (len < indexOfKeyEnd + 2 || indexOfKeyEnd < 1)  return false;
    //got end of key
    int endOfPair = pairs->indexOf(':', indexOfKeyEnd + 1);
    int startOfValue = endOfPair + 1;
    if (startOfValue - 1 != indexOfKeyEnd + 1 && endOfPair + 2 < len) return false;
    //got start of value;
    String strValue = pairs->substring(startOfValue);
    const int isStringValue = getValueTypeFromChar(strValue.charAt(0)) == JSONTYPE_STRING;
    int endOfValue = getIndexOfClosingToken(&strValue, !isStringValue);
    int iComma = strValue.indexOf(",");
    if (endOfValue == -1)
    {
        if (iComma > -1)
            endOfValue = iComma - 1;
        else
            endOfValue = strValue.length() - 1; //-1 hér er munur á parse
        JSONTYPE type = getType(strValue.substring(0, endOfValue + 1));
        if (type == JSONTYPE_INVALID) {
            return false;
        }
    }
    else {
        if (endOfValue + 1 < strValue.length()) {
            if (strValue.charAt(endOfValue) == ',')
                endOfValue--;
        }
    }
    endOfPair = startOfValue + endOfValue;
    bool morePares = false;
    if (endOfPair + 1 < len) {
        morePares = pairs->charAt(endOfPair + 1) == ',';
    }
    ///////////// endir /////////////////
    keyIndexOfFirstChar = 1;
    keyLength = indexOfKeyEnd - keyIndexOfFirstChar;
    valueIndexOfFirstChar = startOfValue;
    valueLength = endOfValue + 1;
    pairLength = endOfPair + 1;
    thereIsAnotherPair = morePares;

    return true;
}

/// <summary>
/// Extracts the first key value pair found in the members string and removes it from the string members
/// </summary>
/// <param name="keyValues">One or more pair.  Pairs must start with key like this "key ":</param>
/// <param name="parent">Parent to one or more pairs in members.  parent must not be NULL</param>
/// <returns>Returns a newly added pair to parent.  If a pair is not found the return values is NULL;</returns>
JsonData* JsonData::pair(String* keyValues, JsonData* parent)
{
    if (!parent)
        return setRootInvalid();

    bool thereIsAnotherPair;
    int     keyIndexOfFirstChar, keyLength,
        valueIndexOfFirstChar, valueLength,
        pairLength;

    if (!getPairIndexes(keyValues, thereIsAnotherPair,
        keyIndexOfFirstChar, keyLength,
        valueIndexOfFirstChar, valueLength,
        pairLength))
    {
        return NULL;
    }
    String strKeyX = keyValues->substring(keyIndexOfFirstChar, keyIndexOfFirstChar + keyLength);
    String strValX = keyValues->substring(valueIndexOfFirstChar, valueIndexOfFirstChar + valueLength);
    JSONTYPE valType = getValueTypeFromChar(strValX.charAt(0));
    bool isStringValue = valType == JSONTYPE_STRING;

    if (valType == JSONTYPE_INVALID)
        return setRootInvalid();

    JsonData* p = new JsonData(strKeyX, JSONTYPE_KEY_VALUE, valType, parent);

    value(&strValX, p);
    *keyValues = keyValues->substring(pairLength);
    return p;
}

/// <summary>
/// Check if a value is a valid JSONTYPE
/// </summary>
/// <param name="jsonValueType">The type of the value to check</param>
/// <param name="stringValue">The value</param>
/// <returns></returns>
bool JsonData::validateValue(const JSONTYPE jsonValueType, String stringValue)
{
    if (jsonValueType == JSONTYPE_STRING)
        return true; //all strings are valid

    //todo:: use JSONTYPE instead
    switch (jsonValueType)
    {
    case JSONTYPE_ARRAY: return JSONTYPE_ARRAY == getType(stringValue);
    case JSONTYPE_OBJECT: return JSONTYPE_OBJECT == getType(stringValue);
    case JSONTYPE_ULONG: return JSONTYPE_ULONG == getType(stringValue);
    case JSONTYPE_LONG: return JSONTYPE_LONG == getType(stringValue);
    case JSONTYPE_FLOAT: return JSONTYPE_FLOAT == getType(stringValue);
    case JSONTYPE_BOOL: return JSONTYPE_BOOL == getType(stringValue);
    case JSONTYPE_NULL: return JSONTYPE_NULL == getType(stringValue);
    case JSONTYPE_KEY_VALUE: return true;
    }

    return false;
}

/// <summary>
/// Parses elements of an array from a string, and creates objects from them.
/// Lexer: elements  = [ value [',' value]* ]
/// </summary>
/// <param name="strElements">Json string of elements which are one or more values</param>
/// <param name="parent">Parent of all values.  Must not be NULL.</param>
/// <param name="canBeMoreThanOne">todo: do I need this variable.</param>
/// <returns>A pointer to the last value created.  If nothing was created NULL will be returned.</returns>
JsonData* JsonData::array(String* strElements, JsonData* parent, bool canBeMoreThanOne)
{
    // all elements must be children of parent 
    const int len = strElements->length();
    if (parent == NULL || len < 2 || strElements->charAt(0) != '[')
        return setRootInvalid();

    if (!canBeMoreThanOne) {

        if (strElements->charAt(len - 1) != ']')
            return setRootInvalid();

        *strElements = strElements->substring(1, len - 1);
        return elements(strElements, parent);
    }

    //there can be more than array

    int endOf = getIndexOfClosingToken(strElements);
    if (endOf < 1)
        return setRootInvalid();

    String strArr = strElements->substring(1, endOf);
    endOf++;
    if (endOf < len)
        endOf += strElements->charAt(endOf) == ',';

    *strElements = strElements->substring(endOf);
    JsonData* pNew = new JsonData(JSONTYPE_ARRAY, parent);
    return elements(&strArr, pNew);

}

/// <summary>
/// Will tell you if the current object is invalid
/// </summary>
bool JsonData::isValid() const
{
    return (mType == JSONTYPE_KEY_VALUE && mValueType != JSONTYPE_INVALID) ||
        (mType != JSONTYPE_INVALID);
}

/// <summary>
/// Will return the value of the current object.
/// </summary>
/// <returns>A string showing the value. If value type is a string then quotation at the beginning and end of the returned string.</returns>
String JsonData::valueToString() {
    String strRet;
    if (mType == JSONTYPE_STRING || mValueType == JSONTYPE_STRING)
    {
        strRet = "\"";
        strRet += mValue.c_str();
        strRet += "\"";
        return strRet;
    }
    if (mValueType == JSONTYPE_ARRAY)
    {
        if (mFirstChild)
            strRet = mFirstChild->toString().c_str();
        return strRet;
    }
    else if (mValueType == JSONTYPE_OBJECT)
    {
        if (mFirstChild)
            strRet = mFirstChild->toString().c_str();
        return strRet;
    }

    strRet = mValue.c_str();
    return strRet;
}

/// <summary>
/// Returns the object as a JSON string.  
/// This string should be a valid JSON string, ready to be sent over the wire.
/// </summary>
/// <returns>The current object returned as an JSON String.</returns>
String JsonData::toString() {

    if (!isValid())
        return "";

    String str;
    switch (mType)
    {
    case JSONTYPE_ARRAY:
        str = "[";
        if (mFirstChild)
            str += mFirstChild->toString().c_str();
        break;
    case JSONTYPE_OBJECT:
        str = "{";
        if (mFirstChild)
            str += mFirstChild->toString().c_str();
        break;
    case JSONTYPE_KEY_VALUE:
        str = "\""; str += mValue.c_str(); str += "\":";
        str += mFirstChild->toString().c_str();
        break;
    case JSONTYPE_STRING:
    case JSONTYPE_ULONG:
    case JSONTYPE_LONG:
    case JSONTYPE_FLOAT:
    case JSONTYPE_BOOL:
    case JSONTYPE_NULL:
        str += valueToString().c_str();
        break;

    default:                //this should never happen
        return "";
    }

    if (mType == JSONTYPE_ARRAY)
        str += "]";
    else if (mType == JSONTYPE_OBJECT)
        str += "}";
    if (mNext != NULL) {
        str += ",";
        str += mNext->toString().c_str();
    }

    return str;
}

String JsonData::toTree(JsonData* current, int level)
{
    if (current == NULL)
        return "";

    String str = "";
    String tabs = "";
    String strCurrent((long)(current), HEX);
    String strParent((long)(current->mParent), HEX);
    String strFirstChild((long)(current->mFirstChild), HEX);
    String strNext((long)(current->mNext), HEX);

    for (int i = 0; i < level; i++) { tabs += "\t"; }

    str += "\n"; str += tabs; str += "Current  :"; str += strCurrent;   str += " firstChild:"; str += strFirstChild;   str += " next:"; str += strNext; str += " parent:"; str += strParent;
    str += "\n"; str += tabs; str += "Type     :";  str += jsonTypeString(current->mType);
    str += "\n"; str += tabs; str += "ValueType:";  str += jsonTypeString(current->mValueType);
    str += "\n"; str += tabs; str += "Value    :";  str += current->mValue;
    str += toTree(current->mFirstChild, level + 1);
    str += toTree(current->mNext, level);
    return str;
}

String JsonData::jsonTypeString(const JSONTYPE type)
{
    switch (type)
    {
    case JSONTYPE_ARRAY: return "JSONTYPE_ARRAY";
    case JSONTYPE_OBJECT: return "JSONTYPE_OBJECT";
    case JSONTYPE_KEY_VALUE: return "JSONTYPE_KEY_VALUE";
    case JSONTYPE_STRING: return "JSONTYPE_STRING";
    case JSONTYPE_ULONG: return "JSONTYPE_ULONG";
    case JSONTYPE_LONG: return "JSONTYPE_LONG";
    case JSONTYPE_FLOAT: return "JSONTYPE_FLOAT";
    case JSONTYPE_BOOL: return "JSONTYPE_BOOL";
    case JSONTYPE_NULL: return "JSONTYPE_NULL";
    }

    return "JSONTYPE_INVALID";
}

/// <summary>
/// Prints the object as a tree
/// </summary>
/// <returns>A string ready to be sent to the console</returns>
String JsonData::toTree()
{
    String str;
    return toTree(this, 0);
}

/// <summary>
/// Guesses the value type from a first char in a value.  
/// This method is not perfect but sometimes enough.
/// </summary>
/// <param name="firstCharInValue">This first char of value string</param>
/// <returns>Success: The selected value.  Fail: JSONTYPE_INVALID </returns>
JSONTYPE JsonData::getValueTypeFromChar(char firstCharInValue)
{
    JSONTYPE valType = JSONTYPE::JSONTYPE_INVALID;
    switch (firstCharInValue)
    {
    case '\"':
        valType = JSONTYPE_STRING;
        break;

    case '[':
        valType = JSONTYPE_ARRAY;
        break;

    case '{':
        valType = JSONTYPE_OBJECT;
        break;
    case '-':  //todo: do a better test
        valType = JSONTYPE_LONG;
        break;
    case 'f':  //todo: do a better test
    case 't':  //todo: do a better test
        valType = JSONTYPE_BOOL;
        break;
    case 'n': valType = JSONTYPE_NULL;
        break;

    default:
        if (isDigit(firstCharInValue))
            valType = JSONTYPE_ULONG; //to do a better test
    }
    return valType;
}

/// <summary>
/// Gets type type of a string (for array,ojbect and string only first char is checked to determine the type)
/// </summary>
/// <param name="strValue">The string to check if it is a number.  example1: "-2.12"  example2:"0.1" </param>
/// <returns>True if string is a floating point number otherwise false.</returns>
JSONTYPE JsonData::getType(String strValue) {

    const int len = strValue.length();
    if (len < 1)
        return JSONTYPE_INVALID;

    char c = strValue.charAt(0);

    switch (c)
    {
    case '\"':  return JSONTYPE_STRING;

    case '[':   return JSONTYPE_ARRAY;

    case '{':   return JSONTYPE_OBJECT;

    case 't':
    case 'f':
        if (strValue == "true" || strValue == "false")
            return JSONTYPE_BOOL;
        else
            return JSONTYPE_INVALID;
    case 'n':
        if (strValue == "null")
            return JSONTYPE_NULL;
        else
            return JSONTYPE_INVALID;
    }

    //check for numbers
    bool startsWithMinus = c == '-';

    if (startsWithMinus && len < 2)
        return JSONTYPE_INVALID;

    int i = strValue.charAt(0) == '-' ? 1 : 0;
    int foundDot = false;

    while (i < len)
    {
        c = strValue.charAt(i);
        if (!isdigit(c))
        {
            if (c == '.') {
                if (foundDot)
                    return JSONTYPE_INVALID;//only one dot is allowed and no char else
                foundDot = true;
            }
            else
                return JSONTYPE_INVALID; //not a digit
        }
        i++;
    }

    //is invalid int
    if (startsWithMinus && len > 1 && strValue.charAt(1) == '0' && !foundDot)
        return JSONTYPE_INVALID; //integer cannot start with "-0"

    //is invalid float
    if (len > 1 + startsWithMinus && strValue.charAt(startsWithMinus) == '0' && strValue.charAt(1 + startsWithMinus) != '.')
        return JSONTYPE_INVALID;  // valid is "0." and "-0.": invalid  are "01." and "-01."  

    if (foundDot)
        return JSONTYPE_FLOAT;

    if (startsWithMinus)
        return JSONTYPE_LONG;

    return JSONTYPE_ULONG;

}

/// <summary>
///  Sets the root object to an invalid object type.
/// </summary>
/// <returns>Always returns NULL.</returns>
JsonData* JsonData::setRootInvalid() {
    JsonData* current = this, * parent = this->mParent;

    while (parent) {
        current = parent;
        parent = current->mParent;
    }

    current->mType = JSONTYPE_INVALID;
    return NULL;
}

/// <summary>
/// Will remove the last sibling of a node.
/// </summary>
/// <param name="pNode">The previous node</param>
/// <returns>True if last sibling was removed.  False if pNode has no siblings.</returns>
bool JsonData::removeLast(JsonData* pNode) {

    JsonData* p = getLastNode(pNode);
    if (!p) return false; //there are no nodes left

    pNode->mNext = NULL;
    //cout << "Deleting " << p->mKey.c_str() << ":" << p->mValue.c_str() << endl;
    delete p;
    return true;
}

/// <summary>
/// Searches for the top node of the specified node.
/// </summary>
/// <param name="current">The node to search for the greatest ancestor of.</param>
/// <returns>Pointer to the root node.  If no parent or ancestor is found the return value is NULL.</returns>
JsonData* JsonData::getRootNode(JsonData* current) {

    if (!current)
        return NULL;
    JsonData* p = current->mParent;
    while (p) {
        if (p->mParent == NULL)
            return p;
        p = p->mParent;
    }

    return NULL;
}

JsonData* JsonData::getPointingNode(JsonData* findMe) {
    if (!findMe || !findMe->mParent)
        return NULL;

    return findPointingNode(getRootNode(findMe), findMe);
}

/// <summary>
/// Searches for the node pointing to this node.  A pointing node can be 
/// pointing to this node from the variables mFirstChild or mNext.
/// </summary>
/// <param name="startFrom">Where to start the search from</param>
/// <param name="findMe">The node to search for</param>
/// <returns>Pointer to the node pointing to the findMe node.</returns>
JsonData* JsonData::findPointingNode(JsonData* startFrom, JsonData* findMe) {

    if (!startFrom)
        return NULL;

    if (startFrom->mNext == findMe || startFrom->mFirstChild == findMe)
        return startFrom;

    JsonData* p = findPointingNode(startFrom->mNext, findMe);
    if (p)
        return p;
    return findPointingNode(startFrom->mFirstChild, findMe);

}

/// <summary>
/// Removes a node from memory and adjusts nodes which 
/// point to it so they will not point to it any more
/// </summary>
/// <param name="pNode">A node to remove from object chain/list and memory</param>
/// <returns>True if a node and it's children was deleted from memory.  False if the node was not deleted.</returns>
bool JsonData::destroyIncludingChildren(JsonData* pNode) {

    if (!pNode)
        return false;

    JsonData* pPrevious = getPointingNode(pNode);

    destroyIncludingChildren(pNode->mNext);
    destroyIncludingChildren(pNode->mFirstChild);

    if (pPrevious) {
        if (pNode == pPrevious->mNext)
            pPrevious->mNext = NULL;
        if (pNode == pPrevious->mFirstChild)
            pPrevious->mFirstChild = NULL;
    }

    delete pNode;
    return true;
}

/// <summary>
/// Deconstruct-or for the JsonData object
/// Will remove the object and it's children from memory
/// </summary>
JsonData::~JsonData()
{
    destroyIncludingChildren(mFirstChild);
    destroyIncludingChildren(mNext);
}

/// <summary>
/// Checks if a character is a white space character.
/// </summary>
/// <param name="c">The character to check</param>
/// <returns>True if it is a white space character otherwise false.</returns>
bool JsonData::isWhitespace(const char c) {
    switch (c) {
    case ' ':
    case '\t':
    case '\r':
    case '\n':
    case '\f':
    case '\b':
        return true;

    default:    return false;
    }
}

/// <summary>
/// Will remove all white space characters from a string.
/// The function will not touch sections of a string within quotation marks.
/// Comments will also be removed from the json object
/// </summary>
/// <param name="jsonStringToTrim">The string to remove whitespaces from</param>
/// <returns>A string without white spaces</returns>
String JsonData::trim(String jsonStringToTrim) {
    const int len = jsonStringToTrim.length();
    char* buffer = new char[len + 1];
    memset(buffer, 0, len + 1);

    int bufPos = 0;
    bool inString = false;
    for (int i = 0; i < len; i++) {
        char c = jsonStringToTrim.charAt(i);
        if (!inString) {
            //we are not inside a string, so here could be a comment
            if (c == '/' && i + 2 <= len)
            {   //here could be a comment
                const char nextChar = jsonStringToTrim.charAt(i + 1);
                int ignoreToIndex = -1;
                if (nextChar == '/') {
                    //We are inside a double slash comment.  We need to ignore all until end line
                    if (i + 2 == len)
                        break; //we are at end of string and the last two chars are //
                    ignoreToIndex = jsonStringToTrim.indexOf('\n', i + 2) + 1;
                    if (ignoreToIndex - i < 3) {
                        ignoreToIndex = -1;//invalid comment so let's do nothing
                    }
                }
                else if (nextChar == '*') {
                    //we are inside a slash star comment  /*some text*/
                    ignoreToIndex = jsonStringToTrim.indexOf("*/", i + 2) + 2; // /**/
                    if (ignoreToIndex - i < 5)
                        ignoreToIndex = -1;//invalid comment so let's do nothing
                }

                if (ignoreToIndex > -1 && ignoreToIndex < len) {

                    i = ignoreToIndex;
                    c = jsonStringToTrim.charAt(i);
                }
                else if (ignoreToIndex == len) {
                    break;//nothing more to copy
                }
            }

        } //if (!inString) {
        if (c == '\"')
        {
            if (i > 0 && jsonStringToTrim.charAt(i - 1) == '\\')
            {/*unchanged because \" should be ignored in strings*/
            }
            else
                inString = !inString;  //in or out of a string
        }

        if (inString || !isWhitespace(c))
        {
            buffer[bufPos++] = c;
        }
    }
    String strRet(buffer);
    delete[] buffer;
    return strRet;
}

/// <summary>
/// Gets a a pointer to a child at a specific index.  
/// If no child is found at given location NULL is returned
/// </summary>
/// <param name="index">Zero based index of the child to get</param>
/// <returns>Pointer to the object.  If no object is found NULL is returned</returns>
JsonData* JsonData::GetChildAt(unsigned int index)
{
    unsigned int i = 0;
    JsonData* current = mFirstChild;
    while (current != NULL) {
        if (i == index)
            return current;
        current = current->mNext;
        i++;
    }
    return NULL;
}

/// <summary>
/// Searches for a child with a specific value.  Good for searching 
/// for a spesific JSONTYPE_KEY_VALUE f.example
/// </summary>
/// <param name="value">Value to search for.  the search is case sensitive</param>
/// <returns>Pointer to the object.  If no object is found NULL is returned</returns>
JsonData* JsonData::GetChild(String value)
{
    JsonData* current = mFirstChild;
    while (current != NULL) {
        if (value == current->mValue)
            return current;
        current = current->mNext;
    }
    return NULL;
}

/// <summary>
/// Gets a a pointer to the next sibling of this object.  
/// If no sibling is found NULL is returned
/// </summary>
/// <returns>Pointer to the next sibling. If no sibling exists, NULL is returned.</returns>
JsonData* JsonData::GetNext()
{
    return mNext;
}

/// <summary>
/// Converts the value of an object from string to a float.
/// If the object is a JSONTYPE_KEY_VALUE then the child object value is returned as a number
/// </summary>
/// <returns>Success: Returns a float number.  Fail: returns a 999999999.
/// Or if conversion fails, a zero is returned. Data type: float.</returns>
float JsonData::toFloat()
{
    bool     useChild     = (mType == JSONTYPE_KEY_VALUE && mFirstChild);
    JSONTYPE typeOfValue  = (useChild) ? mValueType : mType;
    bool     valueIsValid = (typeOfValue == JSONTYPE_FLOAT || typeOfValue == JSONTYPE_ULONG || typeOfValue == JSONTYPE_LONG);

    if (!valueIsValid)
        return JSONDATA_ERRORNUMBER; //999999999

    if (useChild)
        return mFirstChild->toFloat();

    return mValue.toFloat();
}

/// <summary>
/// Converts the value of an object from string to a unsigned long.
/// If the object is a JSONTYPE_KEY_VALUE then the child object value is returned as a number 
/// Note the type of the value must be a positive number (JSONTYPE_ULONG). 
/// If a value is larger than 4294967295 then the conversion will be invalid 
/// </summary>
/// <returns>Succsess: A unsinged long number.  Fail:  999999999</returns>
unsigned long JsonData::toULong()
{
    bool     useChild     = (mType == JSONTYPE_KEY_VALUE && mFirstChild);
    JSONTYPE typeOfValue  = (useChild) ? mValueType : mType;
    bool     valueIsValid = (typeOfValue == JSONTYPE_ULONG);

    if (!valueIsValid)
        return JSONDATA_ERRORNUMBER; //999999999

    if (useChild)
        return strtoul(mFirstChild->mValue.c_str(), NULL, 10);

    return strtoul(mValue.c_str(), NULL, 10);
}

/// <summary>
/// Converts the value of an object from string to a long.
/// If the object is a JSONTYPE_KEY_VALUE then the child object value is returned as a number 
/// Note the type of the value can be be a positive or negative number. (JSONTYPE_LONG or JSONTYPE_ULONG). 
/// If a value is larger than 2147483647 then the conversion will be invalid 
/// Because it will become negative.
/// </summary>
/// <returns>Succsess: A unsinged long number.  Fail:  999999999</returns>
long JsonData::toLong()
{
    bool     useChild     = (mType == JSONTYPE_KEY_VALUE && mFirstChild);
    JSONTYPE typeOfValue  = (useChild) ? mValueType : mType;
    bool     valueIsValid = (typeOfValue == JSONTYPE_LONG || typeOfValue == JSONTYPE_ULONG);

    if (!valueIsValid)
        return JSONDATA_ERRORNUMBER; //999999999

    if (useChild)
        return atol(mFirstChild->mValue.c_str());

    return atol(mValue.c_str());
}
/// <summary>
/// Converts the value of an object from string to a int.
/// If the object is a JSONTYPE_KEY_VALUE then the child object value is returned as a number 
/// Note the type of the value can be be a positive or negative number. (JSONTYPE_LONG or JSONTYPE_ULONG). 
/// If a value is larger than  32767 then the conversion will be invalid and the function result invalid.
/// If a value is less   than -32768 then the conversion will be invalid and the function result invalid.
/// If no valid conversion could be performed because the String doesn’t start with a integer number, a zero is returned. 
/// </summary>
/// <returns>Success:int number.  Fail: 0 or 999999999</returns>
int JsonData::toInt()
{
    bool     useChild     = (mType == JSONTYPE_KEY_VALUE && mFirstChild);
    JSONTYPE typeOfValue  = (useChild) ? mValueType : mType;
    bool     valueIsValid = (typeOfValue == JSONTYPE_LONG || typeOfValue == JSONTYPE_ULONG);

    if (!valueIsValid)
        return JSONDATA_ERRORNUMBER; //999999999

    if (useChild)
        return mFirstChild->mValue.toInt();

    return mValue.toInt();
}

/// <summary>
/// Get the ValueType of the child object;
/// </summary>
/// <returns>The type of the child object</returns>
JSONTYPE JsonData::getValueType()
{
    return mValueType;
}

/// <summary>
/// Get Type type of the JsonData object
/// </summary>
/// <returns>the type</returns>
JSONTYPE JsonData::getType()
{
    return mType;
}

#ifndef CODE_BLOCK_IPAddressList

/// <summary>
/// The deconstructor, which cleans up when the list is no longer needed.
/// </summary>
IPAddressList::~IPAddressList() { 
    destory();
}

/// <summary>
/// Add an ip address to the list by providing a string with a valid IP address
/// </summary>
/// <param name="strIpAddress">
///     a string with a valid IP address.  
///     The ip address "0.0.0.0" will be considered as an invalid ipaddress
/// </param>
/// <returns>True if the add succeded, otherwise false</returns>
bool IPAddressList::add(const char *strIpAddress) {
    IPAddress *p = new IPAddress();
    p->fromString(strIpAddress);
    if (*p == IPAddress(0, 0, 0, 0) || exists(*p)) {
        delete p;
        return false; //we will not allow "0.0.0.0"
    }
    return LinkedList<IPAddress*>::add(p);
}

/// <summary>
/// Add an ip address by providing four numbers of the IP addres each in the range of 0 - 255
/// </summary>
/// <param name="first_octet">First number of the ip address </param>
/// <param name="second_octet">Second number of the ip address</param>
/// <param name="third_octet">Third number of the ip address </param>
/// <param name="fourth_octet">Fourth number of the ip address</param>
bool IPAddressList::add(uint8_t first_octet, uint8_t second_octet, uint8_t third_octet, uint8_t fourth_octet) { 
    return add(IPAddress(first_octet, second_octet, third_octet, fourth_octet)); 
};

/// <summary>
/// Add an ip address to the list by providing a IP address
/// </summary>
/// <param name="ipAddress">The IPAddress object to be added to the list</param>
bool IPAddressList::add(IPAddress ipAddress) {
    if (exists(ipAddress))
        return false;
    return LinkedList<IPAddress*>::add(new IPAddress(ipAddress));
}

/// <summary>
/// Checks if a ip address exists in the list
/// </summary>
/// <param name="address">The ip address to search for</param>
/// <returns>True if the add ip address was found in the list, otherwise false.</returns>
bool IPAddressList::exists(IPAddress address) { 
    return indexOf(address) > -1;
}

/// <summary>
/// Checks if a ip address exists in the list
/// </summary>
/// <param name="strIpAddress">The ip address to search for</param>
bool IPAddressList::exists(String strIpAddress) {
    IPAddress address;
    address.fromString(strIpAddress);
    return exists(address);
}

/// <summary>
/// Searches for the index of a ip address in the list.
/// </summary>
/// <param name="address">The ip address to search for.</param>
/// <returns>
/// Success:The index of the ip address in the list.  
/// fail   : -1 if string is not found.</returns>
int IPAddressList::indexOf(IPAddress ipAddress) {
    IPAddress *p;
    for (int i = 0; i < size(); i++) {
        p = get(i);
        if (*p == ipAddress)
            return i;
    }
    return -1;
}

/// <summary>
/// Removes a given IPAddress from the list
/// </summary>
/// <param name="strIpAddress">A string containing the ipAddress to be removed.</param>
/// <returns>Success: Returns true if the address was removed.  Fail: Returns false if the address was not removed</returns>
bool IPAddressList::remove(const char *strIpAddress) {
    IPAddress p;
    p.fromString(strIpAddress);
    if (p == IPAddress(0, 0, 0, 0)) {
        return false; //we will not allow "0.0.0.0"
    }
    return remove(p);
}

/// <summary>
/// Removes a given IPAddress from the list
/// </summary>
/// <param name="ipAddress">The ipAddress to be removed.</param>
/// <returns>Success: Returns true if the address was removed.  Fail: Returns false if the address was not removed</returns>
bool IPAddressList::remove(IPAddress ipAddress) {
    int i = indexOf(ipAddress);
    if (i>-1)
    {
        delete get(i);
        set(i, NULL);
    }
    return LinkedList<IPAddress*>::remove(i);
}

/// <summary>
/// Checks if there are any ip addresses in the list
/// </summary>
bool IPAddressList::isEmpty() {
    IPAddress *p = get(0);
    bool bRet = (p == NULL);
    return bRet;
}

/// <summary>
/// Bundles all Ip addresses into a JSON array string
/// </summary>
/// <returns>
/// A string containing a valid JSON array of ip addresses.
/// Example of a returned string: ["192.168.1.54","10.1.1.15","10.1.1.1","255.255.255.0"]</returns>
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

/// <summary>
/// //The cleanup function used by the list's deconstructor;
/// </summary>
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

#ifndef CODE_BLOCK_PinWatchList

////////////////////////////////////////////////////////////////////////////////////////////////////
///                                               PinWatch
////////////////////////////////////////////////////////////////////////////////////////////////////
/// 
/// <summary>
/// Constructor for a PinWatch
/// </summary>
/// <param name="gPin">Valid GPin to watch</param>
/// <param name="pinValueMargin">How much must a value of a pin change to recive a positive check</param>
/// <param name="sampleTotalCount">How many samples of a pin value should be averaged</param>
/// <param name="sampleInterval">How many milliseconds must pass between a sample is taken from a pin value</param>
/// <param name="minLogInterval">How many milliseconds between forsed positive checks (f.example how many milliseconds between logs)  Pin values are not taken into account here</param>
/// <returns>True if a PinWatch is added to the list, otherwise false</returns>
PinWatch::PinWatch(GPin* gPin, unsigned int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval)
{
    init(gPin, pinValueMargin, sampleTotalCount, sampleInterval, minLogInterval);
}

/// <summary>
/// Reset all values of the object.
/// Sets pin to NULL and all other values to 0.
/// This is ok because the object does not use malloc or the new operator for any value.
/// </summary>
void PinWatch::resetAllValues() {
    pin = NULL;
    sampleSum = 0;
    pinValueLast = 0;
    pinValueMargin = 0;
    sampleCount = 0;
    sampleTotalCount = 0;
    nextSampleTime = 0;
    sampleInterval = 0;
    minLogInterval = 0;
    nextLogTime = 0;
}

/// <summary>
/// A helper function for constructers
/// </summary>
/// <param name="gPin"></param>
/// <param name="pinValueMargin"></param>
/// <param name="sampleTotalCount"></param>
/// <param name="sampleInterval"></param>
/// <param name="minLogInterval"></param>
void PinWatch::init(GPin* gPin, unsigned int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval) {
    resetAllValues();
    pin = gPin;
    this->pinValueMargin = pinValueMargin;
    this->sampleTotalCount = sampleTotalCount;
    this->sampleInterval = sampleInterval;
    this->minLogInterval = minLogInterval;
    this->reset(millis());
    //serialPrintLnValues();
}

/// <summary>
/// Copy constructor, not used by default
/// </summary>
/// <param name="pinWatch">The other object to copy values from</param>
PinWatch::PinWatch(const PinWatch& pinWatch) {
    pin = pinWatch.pin;
    sampleSum = pinWatch.sampleSum;
    pinValueLast = pinWatch.pinValueLast;
    pinValueMargin = pinWatch.pinValueMargin;
    sampleCount = pinWatch.sampleCount;
    sampleTotalCount = pinWatch.sampleTotalCount;
    nextSampleTime = pinWatch.nextSampleTime;
    sampleInterval = pinWatch.sampleInterval;
    minLogInterval = pinWatch.minLogInterval;
    nextLogTime = pinWatch.nextLogTime;
}

/// <summary>
/// Checks if enough time has passed sinse the last check
/// </summary>
/// <param name="currentTimeInMillis">The time that must pass before a check returns true</param>
/// <returns>true if enough time has passed.  false if not.  </returns>
bool PinWatch::check(unsigned long currentTimeInMillis) {

    if (minLogInterval > 0 && currentTimeInMillis > nextLogTime) {
        reset(currentTimeInMillis, true, true);
        return true;
    }

    if (sampleInterval > 0) {

        if (currentTimeInMillis > nextSampleTime) {

            nextSampleTime = currentTimeInMillis + sampleInterval;
            sampleSum += getPinValue();
            sampleCount++;
            if (sampleCount >= sampleTotalCount) {
                int avg = sampleSum / sampleCount;
                int diff = abs(avg - pinValueLast);

                reset(currentTimeInMillis, false, false);
                if (diff >= pinValueMargin) {
                    return true;
                }
            }
        } 
    } 

    return false;
}

/// <summary>
/// Resets the timer sampleInterva
/// and if update parameters are both true, update the last pin value and the minLogInterval timer as well.
/// </summary>
/// <param name="currentTimeInMillis">Current time usually gotten with the millis() function</param>
/// <param name="updateLastPinValue">If true, the last pin value is updated with the current one and reset the minLogInterval as well </param>
/// <param name="updateMinLogInterval">If True, reset the minLogInterval as well </param>
/// <returns>
/// Success:The index of the pinWatch in the list.  
/// fail   : -1 if the pin number was not found.</returns>
void PinWatch::reset(unsigned long currentTimeInMillis, bool updateLastPinValue, bool updateMinLogInterval) {

    if (updateLastPinValue) {
        pinValueLast = getPinValue();
    }

    if (updateMinLogInterval) {
        if (minLogInterval > 0)
            nextLogTime = currentTimeInMillis + minLogInterval;
    }
    sampleSum = 0;
    sampleCount = 0;

    if (sampleInterval > 0)
        nextSampleTime = currentTimeInMillis + sampleInterval;
}

/// <summary>
/// Get a number of the pin (not the index of a pin)
/// </summary>
/// <returns>Success: Returns the number of the pin.  Fail: Returns -1</returns>
int PinWatch::getPinNumber() { 
    return pin == NULL ? -1 : pin->getNumber(); 
}

/// <summary>
/// Get a value of a pin
/// </summary>
/// <returns>Success: Returns the value of the pin.  Fail: Returns -1</returns>
int PinWatch::getPinValue() { 
    return pin == NULL ? -1 : pin->getValue(); 
}

/// <summary>
/// Get a pin type (PINTYPE) as a integer
/// </summary>
/// <returns>Success: Returns a positive integer value.  Fail: Returns -1</returns>
int PinWatch::getPinType() {
    return pin == NULL ? -1 : pin->getType(); 
}

/// <summary>
/// Checks if a pin is valid
/// </summary>
bool PinWatch::isValidPin() { 
    return pin != NULL; 
}

/// <summary>
/// Exports the object to a Json string
/// </summary>
/// <returns>A json object String</returns>
String PinWatch::toJson() {

    String str = "{\"pin\":" + String(getPinNumber()) + "," +
        "\"sampleSum\":" + String(sampleSum) + "," +
        "\"pinValueLast\":" + String(pinValueLast) + "," +
        "\"pinValueMargin\":" + String(pinValueMargin) + "," +
        "\"sampleCount\":" + String(sampleCount) + "," +
        "\"sampleTotalCount\":" + String(sampleTotalCount) + "," +
        "\"nextSampleTime\":" + String(nextSampleTime) + "," +
        "\"sampleInterval\":" + String(sampleInterval) + "," +
        "\"minLogInterval\":" + String(minLogInterval) + "," +
        "\"nextLogTime\":" + String(nextLogTime) + "}";
    return str;
}

void PinWatch::serialPrintValues() {

    Serial.print(" getPinNumber="); Serial.print(getPinNumber());
    Serial.print(" getPinValue="); Serial.print(getPinValue());
    Serial.print(" sampleCount="); Serial.print(sampleCount);
    Serial.print(" sampleSum="); Serial.print(sampleSum);
    Serial.print(" pinValueLast="); Serial.print(pinValueLast);
    Serial.print(" pinValueMargin="); Serial.print(pinValueMargin);
    Serial.print(" nextSampleTime="); Serial.print(nextSampleTime);
    Serial.print(" sampleTotalCount="); Serial.print(sampleTotalCount);
    Serial.print(" sampleInterval="); Serial.print(sampleInterval);
    Serial.print(" minLogInterval="); Serial.print(minLogInterval);
    Serial.print(" nextLogTime="); Serial.print(nextLogTime);
}
void PinWatch::serialPrintLnValues() {
    serialPrintValues(); Serial.println();
}

/// <summary>
/// The deconstructor, which cleans up when the list is no longer needed.
/// </summary>
PinWatchList::~PinWatchList() {
    destory();
}
////////////////////////////////////////////////////////////////////////////////////////////////////
///                                             PinWatchList
////////////////////////////////////////////////////////////////////////////////////////////////////
bool PinWatchList::add(GPin* gPin, int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval) {
   
    PinWatch * p = new PinWatch(gPin, pinValueMargin, sampleTotalCount, sampleInterval, minLogInterval);
    return LinkedList<PinWatch*>::add(p);
}

/// <summary>
/// Adds and a pinWatch that monitors the value of the pin and checks if it changes same or more than 
/// is specified in the pinValueMargin parameter
/// </summary>
/// <param name="gPin">Valid GPin to watch</param>
/// <param name="pinValueMargin">How mutch must a value of a pin change to recive a positive check</param>
/// <param name="sampleTotalCount">How many samples of a pin value should be averaged</param>
/// <param name="sampleInterval">How many milliseconds must pass between a sample is taken from a pin value</param>
/// <param name="minLogInterval">How many milliseconds between forsed positive checks (f.example how many milliseconds between logs)  Pin values are not taken into account here</param>
/// <returns>true if a PinWatch is added to the list, otherwise false</returns>
bool PinWatchList::addPinValueMonitoringAndTimer(GPin* gPin, int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval, unsigned long minLogInterval) {
    if (gPin == NULL || exists(gPin->getNumber()))
        return false;
    return add(gPin, pinValueMargin, sampleTotalCount, sampleInterval, minLogInterval);
}

/// <summary>
/// Adds a timer with a specific interval.
/// Timer will get the pin number -1.
/// So when deleting or updating timer use the pin number -1.
/// </summary>
/// <param name="minLogInterval">How many milliseconds between positive checks (f.example how many milliseconds between logs)</param>
/// <returns>True if a PinWatch is added to the list, otherwise false</returns>
bool PinWatchList::addTimer(unsigned long minLogInterval) {
    return add(NULL, 0, 0, 0, minLogInterval);
}

/// <summary>
/// Adds and a pinWatch that monitors the value of the pin and checks if it changes same or more than 
/// is specified in the pinValueMargin parameter
/// </summary>
/// <param name="gPin">Valid GPin to watch</param>
/// <returns>True if the add succeded, otherwise false</returns>
/// <param name="pinValueMargin">How mutch must a value of a pin change to recive a positive check</param>
/// <param name="sampleTotalCount">How many samples of a pin value should be averaged</param>
/// <param name="sampleInterval">How many milliseconds must pass between a sample is taken from a pin value</param>
/// <returns>True if a PinWatch is added to the list, otherwise false</returns>
bool PinWatchList::addPinValueMonitoring(GPin* gPin, int pinValueMargin, int sampleTotalCount, unsigned long sampleInterval) {
    if (gPin == NULL || exists(gPin->getNumber()))
        return false;
    return addPinValueMonitoringAndTimer(gPin, pinValueMargin, sampleTotalCount, sampleInterval, 0);
}

/// <summary>
/// Add an pinWatch to the list
/// </summary>
/// <param name="pinWatch">The PinWatch object to be added to the list</param>
/// <returns>True if the add succeded, otherwise false</returns>
bool PinWatchList::add(PinWatch pinWatch) {
    return LinkedList<PinWatch*>::add(new PinWatch(pinWatch));
}
bool PinWatchList::add(PinWatch *ptrPinWatch) {
    return LinkedList<PinWatch*>::add(ptrPinWatch);
}

/// <summary>
/// Updates an existing PinWatch
/// </summary>
/// <param name="index">zero based list index location</param>
/// <param name="pinWatch">Values to copy from</param>
/// <returns></returns>
bool PinWatchList::update(int index, PinWatch pinWatch) {

    PinWatch* p = get(index);
    if (p == NULL)
        return false; 
    *p = pinWatch;
    return true;
}

/// <summary>
/// Adds or Updates PinWatch
/// If a PinWatch with a specific GPin number already exists in the list
/// the values of the existing PinWatch are updated.
/// If a PinWatch with a specific GPin number does NOT exist in the list
/// a new PinWatch is added to the list.
/// </summary>
/// <param name="pinWatch">the PinWatch values</param>
/// <returns>Success: returns true if a PinWatch was added or updated.  Fail: Returns false if unable to update or add.</returns>
bool PinWatchList::addOrUpdate(PinWatch pinWatch) {

    int index = indexOfPin(pinWatch.getPinNumber());
    if (index < 0)
        return add(pinWatch);

    return update(index, pinWatch);
}

/// <summary>
/// Checks if a pinWatch with pinNumber exists in the list
/// </summary>
/// <param name="pinNumber">The pin number search for</param>
/// <returns>True if a pinWatch with the given pin number was found in the list, otherwise false.</returns>
bool PinWatchList::exists(int pinNumber) {

    return indexOfPin(pinNumber) > -1;
}

/// <summary>
/// Removes a PinWatch for a pin with a specific number from the list.
/// </summary>
/// <param name="pinNumber">The pin to search for</param>
/// <returns>true if pin was removed.  false if it is not in the list</returns>
bool PinWatchList::removePin(int pinNumber) {
    int i = indexOfPin(pinNumber);
    if (i < 0)
        return false;
    return removeByIndex(i);
}

/// <summary>
/// Checks if the value of of any pin in the list has changed enough.
/// Checks also if any PinWatch for a pin has reached minimum time beetween checks.
/// The function stops checking after the first PinWatch is do.
/// </summary>
/// <returns>
/// true    : At least one PinWatch is do.
/// false   : No PinWatch is do.
///</returns>
bool PinWatchList::isAnyPinWatchDo()
{
    
    return getFirstPinWatchDo() > -1;
}

/// <summary>
/// Checks if the value of of any pin in the list has changed enough.
/// Checks also if any PinWatch for a pin has reached minimum time beetween checks.
/// The function stops checking after the first PinWatch is do and returns 
/// the index of that pin.
/// </summary>
/// <returns>
/// success   : Returns the index of the first PinWatch which is do
/// fail      : When No PinWatch is do, the return value is -1
///</returns>
int PinWatchList::getFirstPinWatchDo()
{
    return getNextPinWatchDo(0);
}

/// <summary>
/// Checks if the value of of any pin in the list has changed enough.
/// Checks also if any PinWatch for a pin has reached minimum time beetween checks.
/// The function stops checking after the first PinWatch is do and returns 
/// the index of that pin.
/// </summary>
/// <param name="index">Where to start the search from</param>
/// <returns>
/// success   : Returns the index of the first PinWatch which is do
/// fail      : When No PinWatch is do, the return value is -1
///</returns>
int PinWatchList::getNextPinWatchDo(int index)
{
    if (index < 0)
        return -1;

    unsigned long time = millis();
    for (int i = index; i < size(); i++) {
        if (get(i)->check(time)) {
            return i;
        }
    }
    return -1;
}

/// <summary>
/// Resets all checks by updateing timers and resetting sampleSum and sampleCounts
/// </summary>
void PinWatchList::resetAllChecks()
{
    unsigned long time = millis();
    for (int i = 0; i < size(); i++) {
        get(i)->reset(time, true);
    }

}

bool PinWatchList::removeByIndex(int index) {
    if (index < 0)
        return false;
    
    delete get(index);
    set(index, NULL);
    LinkedList<PinWatch*>::remove(index);
    return true;
}

/// <summary>
/// Is the list empty?
/// </summary>
bool PinWatchList::isEmpty() {
    PinWatch* p = get(0);
    bool bRet = (p == NULL);
    return bRet;
}

/// <summary>
/// Searches for the index of pinWatch with a given pin number in the list.
/// </summary>
/// <param name="pinNumber">The pin number to search for.</param>
/// <returns>
/// Success:The index of the pinWatch in the list.  
/// fail   : -1 if the pin number was not found.</returns>
int PinWatchList::indexOfPin(int pinNumber) {

    for (int i = 0; i < size(); i++) {
        if (get(i)->getPinNumber() == pinNumber)
            return i;
    }
    return -1;
}

/// <summary>
/// The cleanup function used by the list's deconstructor;
/// Remove all PinWatch items from memory
/// </summary>
void PinWatchList::destory() {
    PinWatch* p;
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

/// <summary>
/// Updates the list with item values from Json
/// </summary>
/// <param name="root">The root object which can be an JSONTYPE_ARRAY or a JSONTYPE_OBJECT</param>
/// <returns>Success: the number of PinWatches updated.  Fail: 0</returns>
int PinWatchList::updateMonitorFromJsonObject(JsonData* root, GPins *devicePins)
{
    if (root == NULL || !root->isValid())
        return 0;
    int updateCount = 0;
    JsonData* current;
    if (root->getType() == JSONTYPE::JSONTYPE_OBJECT) {
        current = root;
        return addJsonPinWatchToList(current, devicePins);
    }
    else if (root->getType() != JSONTYPE::JSONTYPE_ARRAY) {
        return 0;
    }

    current = root->GetChildAt(0);
    while (current && current->getType() == JSONTYPE::JSONTYPE_OBJECT) {
        updateCount += addJsonPinWatchToList(current, devicePins);

        current = current->GetNext();
    }
    return updateCount;
}

/// <summary>
/// Deletes list items provided by from Json array
/// </summary>
/// <param name="root">The root JsonData object (must be a JSONTYPE::JSONTYPE_ARRAY)</param>
/// <returns>Number of items removed from the list.</returns>
int PinWatchList::deleteMonitorFromJsonObject(JsonData* root)
{
    if (root == NULL || !root->isValid())
        return 0;
    int delCount = 0;
    JsonData* current;
    if (root->getType() != JSONTYPE::JSONTYPE_ARRAY) {
        return 0;
    }
    int pinNumber, index;
    JsonData* child;
    current = root->GetChildAt(0);
    while (  current && (current->getType() == JSONTYPE::JSONTYPE_ULONG || 
                         current->getType() == JSONTYPE::JSONTYPE_LONG      )  ) 
    {
        pinNumber = current->toInt();
        delCount+=removePin(pinNumber);
        current = current->GetNext();
    }
    return delCount;
}

/// <summary>
/// Adds a jsonObject to the list.
/// </summary>
/// <param name="jsonObject">The Json object with PinWatch values to be extracted</param>
/// <param name="devicePins">The device pins this list is connected to.</param>
/// <returns></returns>
bool PinWatchList::addJsonPinWatchToList(JsonData* jsonObject, GPins *devicePins)
{
    PinWatch* pWatch = NewPinWatchFromJsonObject(jsonObject, devicePins);
    bool ret = false;
    if (pWatch) {
        ret = addOrUpdate(*pWatch);
        delete pWatch;
        return ret;
    }
    return ret;
}

/// <summary>
/// Extracts PinWatch values from a JsonData object.
/// Note: if the function does not return NULL then you will need to call
/// delete to free the object returned.  If you don't you will experiance memory leaks.
/// </summary>
/// <param name="jsonObject">A JsonData object containing PinWatch values</param>
/// <returns>Success: Returns a pointer to a PinWatch object. Fail: Returns NULL.</returns>
PinWatch* PinWatchList::NewPinWatchFromJsonObject(JsonData* jsonObject, GPins *devicePins)
{
    if (jsonObject == NULL)
        return NULL;
    int pinNumber, sampleTotalCount;
    unsigned long pinValueMargin, sampleInterval, minLogInterval;

    //Getting the required  values
    //if any of them are missing we return NULL
    JsonData* child = jsonObject->GetChild("pin");   if (!child) return NULL; pinNumber = child->toInt();
    child = jsonObject->GetChild("minLogInterval");  if (!child) return NULL; minLogInterval = child->toULong();
    
    if (pinNumber == -1) {
        //it's a timer other values are not needed, so setting them to zero
        pinValueMargin = sampleInterval = sampleTotalCount = 0;
    } else {
        child = jsonObject->GetChild("pinValueMargin");  if (!child) return NULL; pinValueMargin = child->toULong();
        child = jsonObject->GetChild("sampleInterval");  if (!child) return NULL; sampleInterval = child->toULong();
        child = jsonObject->GetChild("sampleTotalCount"); if (!child) return NULL; sampleTotalCount = child->toInt();
    }

    return new PinWatch(devicePins->get(pinNumber), pinValueMargin, sampleTotalCount, sampleInterval, minLogInterval);
}

/// <summary>
/// Exports all pinWatch values of the list to A Json array string.
/// </summary>
/// <returns>A string containing a valid JSON array of PinWatches.</returns>
String PinWatchList::toJson() {
    String str = "[";
    for (int i = 0; i < size(); i++) {
        if (i > 0)
            str += ",";
        str = str + get(i)->toJson();

    }
    return str + "]";
}
#endif //CODE_BLOCK_PinWatchList
