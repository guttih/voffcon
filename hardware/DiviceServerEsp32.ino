#include <WiFi.h>
//#include <stddef.h>  //for linked list
/*
    Board: ESP32 DEV Module
*/

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
const int   ardosServerPort = ARDOS_SERVER_PORT;

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
ardosServerIp(ARDOS_SERVER_IP);

/*boolean grantAccessToEverybody:
* Set to true if you want to allow all clients where the first 3 numbers
* in a client IP address are the same same as myIp (this server IP address).
.*/
boolean grantAccessToEveryone = false;

boolean grantAccessToAllClientsOnSameSubnet = true;
/*boolean grantAccessToFirstCaller:
* set to true if you want to allow the first client to call the "/setup" method
* to be automaticly granted access.  that is, client IP address will be whitelisted.
.*/

WiFiServer server(PORT);

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

/// <summary>
/// Possible types of a pin
/// </summary>
enum PINTYPE {
    PINTYPE_INPUT_ANALOG,   /*Read method analogRead shall be used*/
    PINTYPE_INPUT_DIGITAL,  /*Read method digitalRead shall be used*/
    PINTYPE_OUTPUT_ANALOG,  /*Write method analogWrite shall be used*/
    PINTYPE_OUTPUT_DIGITAL /*Write method digitalWrite shall be used*/
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
    int addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue, uint8_t pinChannel);
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

class GUrl {
private:
    int mLength = 0;
public:
    GUrl() { }
    String getAfter(String str, String afterMe);
    int toNumber(String str);
    boolean extractAndSetPinsAndValues(const char *unParsedJson, GPins *pinnar);
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
    /// <summary>
    /// Formats a http status code
    /// </summary>
    /// <param name="uiStatusCode">Number of the http status code to format</param>
    /// <returns>A string with the http statuscode number and the status text.</returns>
    String makeHttpStatusCodeString(unsigned int uiStatusCode);
    const char * extractAndReturnIPaddress(const char *unParsedJson);
    String jsonRoot(unsigned int uiType, String key, String value);
};

enum METHODS {
    METHOD_NOTSET,
    METHOD_GET,
    METHOD_POST,
    METHOD_DELETE
};

enum COMMANDS {
    COMMANDS_NOTSET,
    COMMANDS_POST_PINS,
    COMMANDS_POST_WHITELIST,
    COMMANDS_DELETE_WHITELIST
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
    /*add next type above this line*/
    OBJECTTYPE_COUNT
};

int contentLength = 0;
METHODS method = METHOD_NOTSET;
COMMANDS command = COMMANDS_NOTSET;

////////   GLOBAL VARIABLES   /////////////////////////////////////////////////////
GPins pinnar;
IPAddressList whiteList;
GTime startTime;
GUrl lib;
char linebuf[580];
int charcount = 0;

/// <summary>
/// Setup all pins by selecting their index/channel, number, initial value and type.
/// </summary>
void setupPins() {    
    Serial.println("----------------------------------------");
    Serial.println(pinnar.toJson());
    Serial.println("----------------------------------------");
        //uint8_t index, uint8_t number, uint8_t value, PINTYPE type = PINTYPE_ANALOG
    PINTYPE type, type2;
    //type = PINTYPE_ANALOG;
    /*Pins D0 - D7 can be turned compleately off with OUTPUT_ANALOG*/
    type = PINTYPE_OUTPUT_ANALOG;
    type2 = PINTYPE_OUTPUT_DIGITAL;

	//SETTING_UP_PINS_START
    pinnar.addPin("D0", type, 15, 1, 0);
    pinnar.addPin("D1", type, 2, 3, 1);
    pinnar.addPin("D2", type, 4, 6, 2);
    pinnar.addPin("D3", type, 5, 9, 3);
    pinnar.addPin("D4", type, 18, 16, 4);
    pinnar.addPin("D5", type, 19, 25, 5);
    pinnar.addPin("D6", type, 21, 40, 6);
    pinnar.addPin("D7", type, 23, 60, 7);

    pinnar.addPin("D8", type2, 13, 80, 8);
    pinnar.addPin("D9", type2, 12, 90, 9);
    pinnar.addPin("D10", type2, 14, 100, 10);
    pinnar.addPin("D11", type2, 27, 130, 11);
    pinnar.addPin("D12", type2, 26, 150, 12);
    pinnar.addPin("D13", type2, 25, 180, 13);
    pinnar.addPin("D14", type2, 33, 210, 14);
    pinnar.addPin("D15", type2, 32, 255, 15);
	//SETTING_UP_PINS_END
}

/// <summary>
/// Creates a JSON message ready to be sent to a client.
/// Node: the jsonString must be a valid JSON message.
/// </summary>
/// <param name="uiCode"></param>
/// <param name="jsonString"></param>
/// <returns></returns>
String makeJsonResponseString(unsigned int uiCode, String jsonString) {
    String str = "HTTP/1.1 " +
        lib.makeHttpStatusCodeString(uiCode) +
        "\r\nContent-Length: " + jsonString.length() +
        "\r\nAccess-Control-Allow-Origin:*\r\nContent-Type: application/json\r\n\r\n" +
        jsonString + "\n";
    return str;
}
String makeTextResponseString(unsigned int uiCode, String textString) {
    String str = "HTTP/1.1 " +
        lib.makeHttpStatusCodeString(uiCode) +
        "\r\nContent-Length: " + textString.length() +
        "\r\nAccess-Control-Allow-Origin:*\r\nContent-Type: text/plain\r\n\r\n" +
        textString + "\n";
    return str;
}

/// <summary>
/// connects to google.com:80 and gets the current date and time.
/// </summary>
/// <returns>
/// Success : A string containing the current date and time.
/// Fail    : This string: "Fri, 1 Jan 1971 00:00:00 GMT".</returns>
String getTime() {
    WiFiClient client;
    uint8_t connectionAttempt = 0;
    uint8_t RETRYS = 1;
    //String strUrl = "google.com"; // This will not work because function WiFi.config will disable DHCP, dns lookup will fail
    String strUrl = ardosServerIp.toString();
    int port = ardosServerPort;
    Serial.println(String("Getting current date and time from " + strUrl +":" + port +" (Ardos server)"));
    
    while (!client.connect(strUrl.c_str(), port) && connectionAttempt < RETRYS) {
        ++connectionAttempt;
        switch (connectionAttempt) {
            case 1: strUrl = "google.com"; break;
            case 2: strUrl = "172.217.20.78"; break;
            case 3: strUrl = "78.40.249.170"; break;
            case 4: strUrl = "172.217.20.110"; break;
                
            default: strUrl = "178.40.249.155"; break;
        }
        port = 80;
        Serial.println("connection retry attempt (" + String(connectionAttempt)+ ") now trying connection to \"" + strUrl + ":" + port+"\"");
        delay(1000);
    }
    if (connectionAttempt == RETRYS) {
        String strDate = "Fri, 1 Jan 1971 00:00:00 GMT";
        Serial.println("Unable to get the time, so making the start date \"" + strDate +"\" up.");
        return strDate;
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
/*

*/
/// <summary>
/// this function will always return true
/// </summary>
/// <param name="unParsedJson"></param>
/// <returns></returns>
void extractAndAddToWhitelist(const char *unParsedJson) {
    
    whiteList.add(lib.extractAndReturnIPaddress(unParsedJson));
}
void extractAndRemoveFromWhitelist(const char *unParsedJson) {
    
    whiteList.remove(lib.extractAndReturnIPaddress(unParsedJson));
}

/// <summary>
/// Sends a JSON message with all pin- numbers, values to a client.
///  string.
/// </summary>
/// <param name="client">The client which this message should be sent to.</param>
void handlePins(WiFiClient *client) {
    String str = "{\"type\": 2, \"pins\":" + pinnar.toJson() + "}";
    client->println(makeJsonResponseString(200, str));
    Serial.println("did handlePins my man -----");
    Serial.println(str);
    Serial.println("---------------------------");
}

bool isAuthorized(WiFiClient *client) {
    bool bRet;
    if (grantAccessToEveryone) 
        return true;

    if (grantAccessToAllClientsOnSameSubnet) {
        Serial.println("client[0]" + client->remoteIP().toString());
        Serial.println("device   " + WiFi.localIP().toString());
        if (client->remoteIP()[0] == WiFi.localIP()[0] &&
            client->remoteIP()[1] == WiFi.localIP()[1] &&
            client->remoteIP()[2] == WiFi.localIP()[2])
        {
            Serial.println("First 3 ip digits match");
            return true;
        }
    }
    bRet = whiteList.exists(client->remoteIP());
    return bRet;
}

void handleStatus(WiFiClient *client) {
    
    //if (!isAuthorized()) return;
    int pin;
    int val;
    
    if (whiteList.isEmpty()){
        whiteList.add(ardosServerIp);
    }
    
    String str = lib.makeStatusResponceJson(pinnar.toJson(), whiteList.toJson(), startTime.toJson());
    client->println(makeJsonResponseString(200, str));
}

/// <summary>
/// Sends a JSON message with all pins name and number to a client
/// </summary>
/// <param name="client">The client which this message should be sent to.</param>
void handleGetPinout(WiFiClient *client) {
    Serial.println("handleGetPinout");
    client->println(makeJsonResponseString(200, pinnar.JsonPinout()));
}

void sendText(WiFiClient *client, int statusCode, const char *strSend) {
    client->println(makeTextResponseString(statusCode, strSend));
}

void printWiFiInfo() {
    Serial.println("----------------------------------");
    Serial.print  ("WiFi.localIP   :"); Serial.println(WiFi.localIP().toString());
    Serial.print  ("WiFi.dnsIP     :"); Serial.println(WiFi.dnsIP().toString());
    Serial.print  ("WiFi SSID      :"); Serial.println(WiFi.SSID());
    Serial.print  ("WiFi gatewayIP :"); Serial.println(WiFi.gatewayIP());
    Serial.print  ("WiFi subnetMask:"); Serial.println(WiFi.subnetMask());
    //This is the network password
    //Serial.print  ("WiFi psk       :"); Serial.println(WiFi.psk());  
    Serial.print  ("WiFi.BSSIDstr  :"); Serial.println(WiFi.BSSIDstr());
    Serial.print  ("WiFi status    :"); Serial.println(WiFi.status());
    Serial.println("----------------------------------");
}
bool connectWifiHelper(String ssid, String password, uint32_t uiDelay) {
    Serial.println();
    Serial.print("Connecting to ");
    if (password.length() < 1){
        WiFi.begin(ssid.c_str());
        Serial.println(ssid  + ".");
    }
    else {
        Serial.println(ssid + " with password");
        WiFi.begin(ssid.c_str(), password.c_str());
    }
    // attempt to connect to Wifi network:
    int iTriesLeft = 10;
    wl_status_t status = WiFi.status();
    while (status != WL_CONNECTED && iTriesLeft > 0) {
        // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
        Serial.print(status);
        delay(uiDelay);
        iTriesLeft--;
        status = WiFi.status();
    }
    Serial.println();
    if (status == WL_CONNECTED) {
        return true;
    }
    WiFi.disconnect();
    return false;
}
bool connectWifi() {
/*
    WiFi.begin(ssid, password);
    //Next line can be skipped.  only use if you want a specific ip address.  This will disable DHCP so you can not use dns names like google.com.
    //if (!WiFi.config(myIp, gateway, subnet, IPAddress(8,8,8,8))) { Serial.print("Wifi.config returned false "); } 
    // attempt to connect to Wifi network:
    int iTriesLeft = 5;
    wl_status_t status = WiFi.status();
    while (status != WL_CONNECTED && iTriesLeft > 0) {
        // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
        delay(500);
        Serial.print(status);
        iTriesLeft--;
    }
*/
    if (connectWifiHelper(ssid, password, 600))
        return true;
       
    Serial.println("WiFi scanning!");
    int ssIdCount = WiFi.scanNetworks();
    Serial.println("scanning done");
    //WiFi.mode(WIFI_STA);
    Serial.print("Available SSID's:");
    for (int i = 0; i < ssIdCount; i++) {
        if (i > 0) Serial.print(", ");
        Serial.print("\""+WiFi.SSID(i)+"\"");
    }
    Serial.println();
    
    if ((strlen(password)> 0) && connectWifiHelper(ssid, String(password), 600))
        return true;
    if (connectWifiHelper(ssid, String(""), 600))
        return true;
    for (int i = 0; i < ssIdCount; i++) {
        if ((strlen(password)> 0) && connectWifiHelper(WiFi.SSID(i), String(password), 600))
            return true;
        if (connectWifiHelper(WiFi.SSID(i), String(""), 600))
            return true;
    }
    
    return false;
}

/// <summary>
/// This function is only run ones in the beginning of the device startup
/// </summary>
void printHeapSize(String strAddInfront=String("")) {
    Serial.println(strAddInfront + " ESP32 SDK version:" + String(system_get_sdk_version()) + ", RAM left " + String(esp_get_free_heap_size()) + "\n");
}
void test() {
    Serial.println("starting test()");
    
    Serial.println("ending test");
    while (true);
}
void setup() {
    //Initialize serial and wait for port to open:
    Serial.begin(115200);
    while (!Serial) {
        ; // wait for serial port to connect. Needed for native USB port only
    }
    Serial.println(whiteList.toJson());
    
     Serial.println("");
    if (connectWifi())
        Serial.println("WiFi connected");
    else
    {
        Serial.println("UNABLE to connect WiFi!");
        while (true);
    }
    printWiFiInfo();
    startTime.setTime(getTime());
    Serial.println("Start time:" + startTime.toString());
    setupPins();
    Serial.println("The device can be accessed at this path ");
    String subPath = "://" + WiFi.localIP().toString() + ":" + String(PORT) + "\"";
    Serial.println();
    Serial.println("\"http" + subPath + ".");
    server.begin();
}

/// <summary>
/// The program main loop which repeats forever.
/// </summary>

void loop() {
    // listen for incoming clients
    WiFiClient client = server.available();
    if (client) {
        Serial.println("New client");
        memset(linebuf, 0, sizeof(linebuf));
        charcount = 0;
        // an http request ends with a blank line
        boolean currentLineIsBlank = true;
        while (client.connected()) {

            if (client.available()) {
                char c = client.read();
                Serial.write(c);
                //read char by char HTTP request
                linebuf[charcount] = c;
                if (charcount<sizeof(linebuf) - 1) charcount++;
                // if you've gotten to the end of the line (received a newline
                // character) and the line is blank, the http request has ended,
                // so you can send a reply
                if (c == '\n' && currentLineIsBlank) {
                    
                    if (client.available() > 0) {
                        // we still got data to read, there is something after the header
                        // that is there was data after the header
                        if ((method == METHOD_POST || method == METHOD_DELETE) && contentLength > 0) {
                            //Here should contentLength == client.available()
                            for (int ix = 0; ix < contentLength; ix++) {
                                char ch = client.read();
                                linebuf[ix] = ch;
                            }
                            Serial.println(linebuf);

                            if ( command == COMMANDS_POST_PINS && lib.extractAndSetPinsAndValues(linebuf, &pinnar)) {
                                //client.println(makeJsonResponseString(200, pinsToJson()));
                                handlePins(&client);
                            } else if (command == COMMANDS_POST_WHITELIST) {
                                if ( isAuthorized(&client) )
                                    extractAndAddToWhitelist(linebuf);
                                client.println(makeJsonResponseString(200, whiteList.toJson()));
                            } else if (command == COMMANDS_DELETE_WHITELIST) {
                                if (isAuthorized(&client)) 
                                    extractAndRemoveFromWhitelist(linebuf);
                                client.println(makeJsonResponseString(200, whiteList.toJson()));
                            }
                        } // if (method == METHOD_POST && contentLength > 0) 
                    }
                    if (command == COMMANDS_NOTSET)
                        handleGetPinout(&client);// send a standard http response header
                    break;
                }
                if (c == '\n') {
                    // you're starting a new line
                    currentLineIsBlank = true;
                    if (strstr(linebuf, "GET /started") > 0) {
                        Serial.println(" /started");

                        String str = "{\"date\":";
                        String itemJson = startTime.toJson();
                        str += itemJson;
                        str += "}";

                        Serial.println("timi");
                        Serial.println(str);
                        client.println(makeJsonResponseString(200, str));
                        method == METHOD_GET;
                        break;
                    }

                    else if (strstr(linebuf, "GET /pinout") > 0) {
                        handleGetPinout(&client);
                        method = METHOD_GET;
                        break;
                    }
                    else if (strstr(linebuf, "GET /pins") > 0) {
                        handlePins(&client);
                        method == METHOD_GET;
                        break;
                    }
                    else if (strstr(linebuf, "GET /status") > 0) {
                        handleStatus(&client);
                        method == METHOD_GET;
                        break;
                    }
                    else if (strstr(linebuf, "POST /pins") > 0) {
                        Serial.println("Method is POST /pins");
                        method = METHOD_POST;
                        command = COMMANDS_POST_PINS;
                    }
                    else if (strstr(linebuf, "POST /whitelist") > 0) {
                        Serial.println("Method is POST /whitelist");
                        method = METHOD_POST;
                        command = COMMANDS_POST_WHITELIST;
                    }
                    else if (strstr(linebuf, "DELETE /whitelist") > 0) {
                        Serial.println("Method is POST /whitelist");
                        method = METHOD_DELETE;
                        command = COMMANDS_DELETE_WHITELIST;
                    }
                    else if (strstr(linebuf, "Content-Length: ") > 0) {
                        String strTemp = String(strstr(linebuf, "Content-Length: ") + 16);
                        strTemp.replace("\r", ""); strTemp.replace("\n", "");
                        contentLength = GTime::toNumber(strTemp);
                    }

                    // you're starting a new line
                    currentLineIsBlank = true;
                    memset(linebuf, 0, sizeof(linebuf));
                    charcount = 0;
                }
                else if (c != '\r') {
                    // you've gotten a character on the current line
                    currentLineIsBlank = false;
                }
            }//if (client.available())
        }//while (client.connected()) 
            // give the web browser time to receive the data
        delay(1);
        // close the connection:
        method = METHOD_NOTSET;
        command = COMMANDS_NOTSET;
        client.stop();
        contentLength = 0;
        Serial.println("client disconnected");
    }
}
///////////////////////////////////// IMPLEMENTATION OF ALL CLASSES  /////////////////////////////////////

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
        else { //TYPE IS PINTYPE_OUTPUT_DIGITAL or it is (ESP8266 && PINTYPE_OUTPUT_ANALOG)
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

#ifdef ESP32 
    analogWriteEsp32();
#else
    analogWrite(mNumber, mValue);
#endif // ESP8266

    
}

//If input type is PINTYPE_INPUT_DIGITAL or PINTYPE_INPUT_ANALOG and readValueFromHardware is true
//then a read will be maid directly to the hardwarepin. otherwise the old member value will be returned.
int GPin::getValue(bool readValueFromHardware) {
    if (readValueFromHardware){
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
        "\"val\":" + String(mValue) + "," +
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
int GPins::addPin(const char *strPinName, PINTYPE pinType, int pinNumber, int pinValue, uint8_t pinChannel) {
    mPins[mLength] = new GPin(strPinName, pinType, pinNumber, pinValue, mChannelCount++);
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

const char * GUrl::extractAndReturnIPaddress(const char *unParsedJson) {

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
    return line.c_str();
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

