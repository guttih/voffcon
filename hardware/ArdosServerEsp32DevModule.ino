#include <WiFi.h>

/*
    Board: ESP32 DEV Module
*/


/*
    todo: implement this.
    const char* ssid     = "WIFI_ACCESSPOINT"; //name of the wifi (accesspoint)network 
    const char* password = "WIFI_PASSWORD"; //wifi password 
    const int PORT       = PORT_NUMBER;           // port number which this device, will be operating on. Example: 80
    IPAddress            myIp(IPV4_IPADDRESS), //  Ip address which this device will be operating on.  Example: 192,168,1,154
                            gateway(IPV4_GATEWAY),//  Default gatway on this network.  Example: 192,168,1,1
                            subnet(IPV4_SUBNET);  //  Subnet mask.  Example: 255,255,255,0
*/

const char* ssid     = "WIFI_ACCESSPOINT";
const char* password = "WIFI_PASSWORD";
const int   PORT     = PORT_NUMBER;/*
IPAddress myIp(192, 168, 1, 149),      // Ip address which this device will be operating on
                                        // example: 192, 168, 1, 154


    gateway(192, 168, 1, 254),         // the default gatway on this network.
                                        // On windows goto command
                                        // prompt and type "ipconfig"
                                        // example: 192,168,1,1

    subnet(255, 255, 255, 0);          // example: 255,255,255,0
*/

IPAddress myIp(IPV4_IPADDRESS),      // Ip address which this device will be operating on
                                        // example: 192, 168, 1, 154


    gateway(IPV4_GATEWAY),         // the default gatway on this network.
                                        // On windows goto command
                                        // prompt and type "ipconfig"
                                        // example: 192,168,1,1

    subnet(IPV4_SUBNET);          // example: 255,255,255,0


WiFiServer server(PORT);

/// <summary>
/// The struct that holds information about a pin
/// </summary>
struct PIN {
    uint8_t num;
    uint8_t val;
    uint8_t type;
};

enum PINTYPE {
    PINTYPE_ANALOG,
    PINTYPE_DIGITAL
};

enum METHODS {
    METHOD_NOTSET,
    METHOD_GET,
    METHOD_POST
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
uint8_t method = METHOD_NOTSET;

/// the count of all pins
const uint8_t pinCount = 16;

/// <summary>
/// The array that holds information about all pins, their number, value and type.
/// </summary>
PIN pins[pinCount + 5];

/// <summary>
/// This function selects the lower value
/// </summary>
/// <param name="a">First value</param>
/// <param name="b">Second value</param>
/// <returns>The lower value</returns>
int min(int a, int b) { if (a<b) return a; else return b; }

#define LEDC_TIMER_13_BIT  13
#define LEDC_BASE_FREQ     5000

/// <summary>
///    Arduino like analogWrite
/// Note, to be able to use a channel, 
/// Output pin must have been initialized to that channel before you can use this function
/// Use initOutputPin to initialized a channel to a pin.
/// </summary>
/// <param name="channel">The channel you wish to change the PWM value. </param>
/// <param name="value">The duty value (PWM) you want to set on the connected pin.</param>
/// <param name="valueMax">
/// The max duty value.
/// That is the value you consider a full ON value.
/// This value is default at 255
/// </param>
void ledcAnalogWrite(uint8_t channel, uint32_t value, uint32_t valueMax = 255) {
    // calculate duty
    uint32_t duty = (LEDC_BASE_FREQ / valueMax) * min(value, valueMax);

    // write duty to LEDC
    ledcWrite(channel, duty);
}

/// <summary>
/// Searches for a pin number and returns it's value.
/// </summary>
/// <param name="pinNumber">The pin number to search for</param>
/// <returns>The value of the pin.</returns>
int getPinValue(uint8_t pinNumber) {
    int index = getPinIndex(pinNumber);
    if (index < 0) return -1;   //todo: make return ERROR_NUMBER....
    return pins[index].val;
}

/// <summary>
/// Sets a new value on the specified pin.
/// The value is saved and the harware output pin value is also changed.
/// </summary>
/// <param name="pinNumber">Number of the pin.</param>
/// <param name="pinNewValue">The new value of the pin.</param>
/// <returns>
/// true: If the value of the pin was successfully changed.
/// false: If the value of the pin was not changed.
/// </returns>
boolean setPinValue(uint8_t pinNumber, uint8_t pinNewValue) {
    int index = getPinIndex(pinNumber);
    if (index < 0) return false;
    pins[index].val = pinNewValue;
    if (pins[index].type == PINTYPE_DIGITAL) {
        pins[index].val = (pinNewValue > 0 ? HIGH : LOW);
        Serial.print("Digital write ");
        Serial.println(pins[index].val);
        digitalWrite(pins[index].num, pins[index].val);
    }
    else {//PINTYPE_ANALOG        
        Serial.print("Analog writing  ");
        Serial.println(pins[index].val);
        ledcAnalogWrite(index /*index is the channel*/, pins[index].val);
    }
    return true;
}
// 

/// <summary>
/// Searches for the index of a pin.
/// </summary>
/// <param name="pinNumber">Number of the pin to search for</param>
/// <returns>
/// Success: Index of the pin with the specified number
/// Error  : -1 If pin is not found
/// </returns>
int getPinIndex(uint8_t pinNumber) {
    for (uint8_t i = 0; i < pinCount; i++) {
        if (pinNumber == pins[i].num)
            return i;
    }
    return -1;
}

/// <summary>
/// Initializes an Output pin.
/// </summary>
/// <param name="index">
/// The index of the pin.  
/// If this pin is also an PINTYPE_ANALOG then this is it's channel also
/// </param>
/// <param name="number">The hardware pin number of the pin</param>
/// <param name="value">the duty value (pwm) to be set on that pin</param>
/// <param name="type">
/// The type of the pin.
/// Possible values:
/// PINTYPE_ANALOG  : This pin shall be initalized as a analog output pin, allowing dimming on that pin (PWM)
/// PINTYPE_DIGITAL : This pin shall be initalized as a digital output pin allowing only full on (HIGH) or full OFF (LOW)
/// </param>
/// <returns>true if successful, otherwise false.</returns>
boolean initOutputPin(uint8_t index, uint8_t number, uint8_t value, PINTYPE type = PINTYPE_ANALOG) {
    if (pinCount>index)
    {
        pins[index].type = type;
        pins[index].num = number;

        if (type == PINTYPE_ANALOG) {
            ledcSetup(index, LEDC_BASE_FREQ, LEDC_TIMER_13_BIT); //setup the LEDC_CHANNEL which is index
            ledcAttachPin(pins[index].num, index); //connect the pin and the LEDC_CHANNEL
        }
        else { // type==PINTYPE_DIGITAL
            pinMode(pins[index].num, OUTPUT);
        }
        setPinValue(pins[index].num, value);
        Serial.print("i: " + String(index));
        Serial.print(" type: " + String(pins[index].type));
        Serial.print(" num: " + String(pins[index].num));
        Serial.println(" val: " + String(pins[index].val));

        return true;
    }
    return false;
}

/// <summary>
/// Setup all pins by selecting their index/channel, number, initial value and type.
/// </summary>
void setupPins() {
    PINTYPE type;
    //type = PINTYPE_ANALOG;
    type = PINTYPE_ANALOG;
    initOutputPin(0, 15, 1, type);
    initOutputPin(1, 2, 3, type);
    initOutputPin(2, 4, 6, type);
    initOutputPin(3, 5, 9, type);
    initOutputPin(4, 18, 16, type);
    initOutputPin(5, 19, 25, type);
    initOutputPin(6, 21, 40, type);
    initOutputPin(7, 23, 60, type);
    initOutputPin(8, 13, 80, type);
    initOutputPin(9, 12, 90, type);
    initOutputPin(10, 14, 100, type);
    initOutputPin(11, 27, 130, type);
    initOutputPin(12, 26, 150, type);
    initOutputPin(13, 25, 180, type);
    initOutputPin(14, 33, 210, type);
    initOutputPin(15, 32, 255, type);

    //printing all pin values
    int num;
    for (uint8_t i = 0; i < pinCount; i++) {
        Serial.print("i:" + String(i));
        Serial.print(" .num:" + String(pins[i].num));
        Serial.print(" .val:" + String(pins[i].val));
        num = pins[i].num;
        Serial.print(" index of num:" + String(getPinIndex(num)));
        Serial.println(" value:" + String(getPinValue(num)));
    }
}


char linebuf[580];
int charcount = 0;

const int ERROR_NUMBER = -9999;

/// <summary>
/// Converts a String to a number positive number.
/// Negative numbers are considered invalid.
/// </summary>
/// <param name="str">The string to be converted to a number.</param>
/// <returns>
/// Success: The converted number.
/// Fail   : ERROR_NUMBER (-9999)
/// </returns>
int toNumber(String str) {
    int iLen = str.length();
    if (iLen < 1) return ERROR_NUMBER;
    for (int i = 0; i < iLen; i++) {
        if (!isDigit(str[i]))
            return ERROR_NUMBER;
    }
    return str.toInt();
}

/// <summary>
/// A class for storing date and time
/// </summary>
class Gtime {
private:
    int mYear = 0;
    int mMonth = 0;
    int mDay = 0;
    int mHours = 0;
    int mMinutes = 0;
    int mSeconds = 0;
public:
    Gtime() { }
    // 
    // 

    /// <summary>
    /// Sets time values from a given string
    /// </summary>
    /// <param name="strTime">
    /// A string with date and time.
    /// The string needs to be formatted like this: 
    /// Fri, 15 Jul 2016 11:08:12 GMT
    /// </param>
    /// <returns></returns>
    boolean setTime(String strTime) {
        String str;
        String num;
        int i;
        //Serial.println("strTime: " + strTime);
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
    int strToMonth(String month) {
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
    String toString() {
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
    String toStreng() {
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
    String toJson() {
        String str = "{\"year\":" + String(mYear) + "," +
            "\"month\":" + String(mMonth) + "," +
            "\"day\":" + String(mDay) + "," +
            "\"hours\":" + String(mHours) + "," +
            "\"minutes\":" + String(mMinutes) + "," +
            "\"seconds\":" + String(mSeconds) + "}";
        return str;
    }
};

/// <summary>
/// Formats a http status code
/// </summary>
/// <param name="uiStatusCode">Number of the http status code to format</param>
/// <returns>A string with the http statuscode number and the status text.</returns>
String makeHttpStatusCodeString(unsigned int uiStatusCode) {
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
/// Creates a string with a key and a value, which can be used when populating a JSON object.
/// </summary>
/// <param name="name">Name of the key</param>
/// <param name="value">The integer value</param>
/// <returns>
/// A string with a key and a value.  
/// For example: 
/// "args":12
/// </returns>
String jsonKeyValue(String key, int value) {
    String str = "\"" + key + "\":" + String(value);
    return str;
}

String jsonKeyValue(String key, String value) {
    String   str = "\"" + key + "\":" + value;
    return str;
}

String jsonObjectType(unsigned int uiType) {
    String str;
    if (uiType < OBJECTTYPE_COUNT)
        str = String(uiType);
    else
        str = "-1";

    return jsonKeyValue("type", str);
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
        makeHttpStatusCodeString(uiCode) +
        "\r\nContent-Length: " + jsonString.length() +
        "\r\nAccess-Control-Allow-Origin:*\r\nContent-Type: application/json\r\n\r\n" +
        jsonString + "\n";
    return str;
}

/// <summary>
/// Creates a JSON object containg all pins and their number.
/// </summary>
/// <returns>A string formatted as a JSON object which contains all pin names and number. </returns>
String pinOut() {
    String str = "{";
    for (int i = 0; i < pinCount; i++) {
        if (i > 0) str += ",";
        str += jsonKeyValue("D" + String(pins[i].num), pins[i].num);
    }
    str += "}";
    return str;
}

/// <summary>
/// Wraps pin number, pin value and a pin type into a JSON object string.
/// </summary>
/// <param name="index">Index of the pin in the pins array.</param>
/// <returns>A JSON string containing the pin- number, value and type.</returns>
String pinToJson(int index) {
    String str = "{\"pin\":" + String(pins[index].num) +
        ",\"val\":" + String(pins[index].val) +
        ",\"m\":1}";
    return str;
}

/// <summary>
/// Wraps all pin- numbers, values and types into a JSON object string.
/// </summary>
/// <returns>JSON object string containing information on all pins.</returns>
String pinsToJson() {
    String str = "{\"type\": 2, \"pins\":[";
    for (int i = 0; i < pinCount; i++) {
        if (i > 0) str += ",";
        str += pinToJson(i);
    }
    str += "]}";
    return str;
}



Gtime startTime;

/// <summary>
/// connects to google.com:80 and gets the current date and time.
/// </summary>
/// <returns>
/// Success : A string containing the current date and time.
/// Fail    : This string: "Fri, 1 Jan 1971 00:00:00 GMT".</returns>
String getTime() {
    WiFiClient client;
    int connectionAttempt = 0;
    const int RETRYS = 5;
    //String strUrl = "google.com"; // This will not work because function WiFi.config will disable DHCP, dns lookup will fail
    String strUrl = "172.217.20.110"; //no dns lookup needed here.
    Serial.println("Getting current date and time from " + strUrl);
    while (!client.connect(strUrl.c_str(), 80) && connectionAttempt < RETRYS) {
        Serial.println("connection attempt " + String(++connectionAttempt) + " to " + strUrl + " (google.com) failed, retrying...");
        delay(1000);
    }

    if (connectionAttempt == RETRYS) {
        String strDate = "Fri, 1 Jan 1971 00:00:00 GMT";
        Serial.println("Unable to connect to the google.com on the internet so making the start date \"" + strDate +"\" up.");
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

/// <summary>
/// Extracts pin numbers and values from the given string
/// and sets the pin values according to what was extracted.
/// </summary>
/// <param name="unParsedJson">A endline seperated json values (I think) on the form { "3":220}</param>
/// <returns>true if successful otherwhise false</returns>
boolean extractAndSetPinsAndValues(char *unParsedJson) {
    boolean ret = false;
    String line = String(unParsedJson);
    String strPin, strValue;
    int pin, val, iCol, iCom;
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
            if (setPinValue(pin, val))
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
/// Sends a JSON message with all pin- numbers, values to a client.
///  string.
/// </summary>
/// <param name="client">The client which this message should be sent to.</param>
void handlePins(WiFiClient *client) {
    String str = pinsToJson();
    client->println(makeJsonResponseString(200, str));
    Serial.println("did handlePins my man -----");
    Serial.println(str);
    Serial.println("---------------------------");
}

void handleStatus(WiFiClient *client) {
    Serial.println("handleStatus ran, but is not tested");
    //if (!isAuthorized()) return;
    int pin;
    int val;
    
    String strPins = jsonKeyValue("pins", pinsToJson());
    String strWhitelist = jsonKeyValue("whitelist", "{}");
    String strTime = jsonKeyValue("date", startTime.toJson());
    String str = "{" +
        jsonObjectType(OBJECTTYPE_STATUS) + "," +
        strPins + "," +
        strWhitelist + "," +
        strTime +
        "}";
    client->println(makeJsonResponseString(200, str));
}

/// <summary>
/// Sends a JSON message with all pins name and number to a client
/// </summary>
/// <param name="client">The client which this message should be sent to.</param>
void handleGetPinout(WiFiClient *client) {
    Serial.println("handleGetPinout");
    client->println(makeJsonResponseString(200, pinOut()));
}

/// <summary>
/// This function is only run ones in the beginning of the device startup
/// </summary>
void setup() {
    //Initialize serial and wait for port to open:
    Serial.begin(115200);
    while (!Serial) {
        ; // wait for serial port to connect. Needed for native USB port only
    }

    setupPins();

    // We start by connecting to a WiFi network
    Serial.println();
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);
    
    //Next line can be skipped.  only use if you want a specific ip address.  This will disable DHCP so you can not use dns names like google.com.
    if (!WiFi.config(myIp, gateway, subnet, gateway)) { Serial.print("Wifi.config returned false "); } 

    // attempt to connect to Wifi network:
    while (WiFi.status() != WL_CONNECTED) {
        // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.print("WiFi connected");
    Serial.println(".  The device can be accessed at this path ");
    String subPath = "://" + WiFi.localIP().toString() + ":" + String(PORT)+ "\"";
    Serial.println("\"http" + subPath + " or " + "\"https" + subPath + ".");
    startTime.setTime(getTime());
    Serial.println("Start time:" + startTime.toString());
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
                        if (method == METHOD_POST && contentLength > 0) {
                            //Here should contentLength == client.available()
                            for (int ix = 0; ix < contentLength; ix++) {
                                char ch = client.read();
                                linebuf[ix] = ch;
                            }
                            Serial.println(linebuf);
                            if (extractAndSetPinsAndValues(linebuf)) {
                                client.println(makeJsonResponseString(200, pinsToJson()));
                            }
                        }
                    }
                    
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
                        Serial.println("Method is post");
                        method = METHOD_POST;
                    }
                    else if (strstr(linebuf, "Content-Length: ") > 0) {
                        String strTemp = String(strstr(linebuf, "Content-Length: ") + 16);
                        strTemp.replace("\r", ""); strTemp.replace("\n", "");
                        contentLength = toNumber(strTemp);
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
        client.stop();
        contentLength = 0;
        Serial.println("client disconnected");
    }
}