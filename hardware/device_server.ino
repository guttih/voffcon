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
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>


////////////////  LinkedList.h library start of /////
/*
  LinkedList.h - V1.1 - Generic LinkedList implementation
  Works better with FIFO, because LIFO will need to
  search the entire List to find the last one;

  For instructions, go to https://github.com/ivanseidel/LinkedList

  Created by Ivan Seidel Gomes, March, 2013.
  Released into the public domain.
*/


#include <stddef.h>

template<class T>
struct ListNode
{
  T data;
  ListNode<T> *next;
};

template <typename T>
class LinkedList{

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
  root=NULL;
  last=NULL;
  _size=0;

  lastNodeGot = root;
  lastIndexGot = 0;
  isCached = false;
}

// Clear Nodes and free Memory
template<typename T>
LinkedList<T>::~LinkedList()
{
  ListNode<T>* tmp;
  while(root!=NULL)
  {
    tmp=root;
    root=root->next;
    delete tmp;
  }
  last = NULL;
  _size=0;
  isCached = false;
}

/*
  Actualy "logic" coding
*/

template<typename T>
ListNode<T>* LinkedList<T>::getNode(int index){

  int _pos = 0;
  ListNode<T>* current = root;

  // Check if the node trying to get is
  // immediatly AFTER the previous got one
  if(isCached && lastIndexGot <= index){
    _pos = lastIndexGot;
    current = lastNodeGot;
  }

  while(_pos < index && current){
    current = current->next;

    _pos++;
  }

  // Check if the object index got is the same as the required
  if(_pos == index){
    isCached = true;
    lastIndexGot = index;
    lastNodeGot = current;

    return current;
  }

  return false;
}

template<typename T>
int LinkedList<T>::size(){
  return _size;
}

template<typename T>
bool LinkedList<T>::add(int index, T _t){

  if(index >= _size)
    return add(_t);

  if(index == 0)
    return unshift(_t);

  ListNode<T> *tmp = new ListNode<T>(),
         *_prev = getNode(index-1);
  tmp->data = _t;
  tmp->next = _prev->next;
  _prev->next = tmp;

  _size++;
  isCached = false;

  return true;
}

template<typename T>
bool LinkedList<T>::add(T _t){

  ListNode<T> *tmp = new ListNode<T>();
  tmp->data = _t;
  tmp->next = NULL;
  
  if(root){
    // Already have elements inserted
    last->next = tmp;
    last = tmp;
  }else{
    // First element being inserted
    root = tmp;
    last = tmp;
  }

  _size++;
  isCached = false;

  return true;
}

template<typename T>
bool LinkedList<T>::unshift(T _t){

  if(_size == 0)
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
bool LinkedList<T>::set(int index, T _t){
  // Check if index position is in bounds
  if(index < 0 || index >= _size)
    return false;

  getNode(index)->data = _t;
  return true;
}

template<typename T>
T LinkedList<T>::pop(){
  if(_size <= 0)
    return T();
  
  isCached = false;

  if(_size >= 2){
    ListNode<T> *tmp = getNode(_size - 2);
    T ret = tmp->next->data;
    delete(tmp->next);
    tmp->next = NULL;
    last = tmp;
    _size--;
    return ret;
  }else{
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
T LinkedList<T>::shift(){
  if(_size <= 0)
    return T();

  if(_size > 1){
    ListNode<T> *_next = root->next;
    T ret = root->data;
    delete(root);
    root = _next;
    _size --;
    isCached = false;

    return ret;
  }else{
    // Only one left, then pop()
    return pop();
  }

}

template<typename T>
T LinkedList<T>::remove(int index){
  if (index < 0 || index >= _size)
  {
    return T();
  }

  if(index == 0)
    return shift();
  
  if (index == _size-1)
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
T LinkedList<T>::get(int index){
  ListNode<T> *tmp = getNode(index);

  return (tmp ? tmp->data : T());
}

template<typename T>
void LinkedList<T>::clear(){
  while(size() > 0)
    shift();
}

////////////////  LinkedList.h library end of   /////

////////////////  Gpins ////////////////////////////
class Response {
  
  private:
    unsigned int mCode;
    String mValueString;
     String makeHeaderCodeString(unsigned int uiCode){
          String strCode;
          switch (uiCode){
              case 200:   strCode = String(uiCode) + " OK";
                          break;           
              case 400:   strCode = String(uiCode) + "  Bad request";
                          break;
              case 416:   strCode = String(uiCode) + " Range Not Satisfiable";
                          break;
              default:    strCode = "";
                          break;
          }
              return strCode;
     }
    /*creates a jason string response string from the given parameters
      no errorchecking is done in this method */
     String makeJsonResponseString(unsigned int uiCode, String jsonString){
      String str =  "HTTP/1.1 " +
                    makeHeaderCodeString(uiCode) +
                    "\r\nAccess-Control-Allow-Origin:*\r\nContent-Type: application/json\r\n\r\n" + 
                    jsonString + "\n";
     return str;
    }
  public:
    Response(){mCode = 0; mValueString = "";}

    
    void setJson(unsigned int uiCode, String jsonString){
      mCode = uiCode;
      mValueString = jsonString;
    }    
   
    //checks if a responce is a valid responce from it's responce code
    boolean isValid(){
      boolean bRet;
      switch (mCode){
        case 200:   
        case 400:                  
        case 416: bRet = true;
                  break;
        default:  bRet = false;
                  break;
      }
      return bRet;
    }
    //creates a fully qualified http responce string adding the given jsonString
    String makeJsonResponse(){      
      return makeJsonResponseString(mCode, mValueString);
      // s = "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin:*\r\nContent-Type: application/json\r\n\r\n"+ jsonString + "\n";
    }


    
    
};

class GPin {
  private:
    int mNumber;
    int mValue;
    int mMode;
    void set(int number, int value){
      mNumber = number;
      mValue = value;  
      //digitalWrite(mNumber, mValue);
      analogWrite(mNumber, mValue);
    }
  public:    
    GPin(int mode, int PinNumber, int pinValue) {
      mMode = mode;
      pinMode(PinNumber, mMode);
      set(PinNumber, pinValue);         
    }
    void setValue(int value)          {mValue = value;                    analogWrite(mNumber, mValue);/*digitalWrite(mNumber, mValue);*/   }
    int getValue()                    { return mValue;    /*todo: if mode == INPUT then we should use analogRead...*/                       }
    int getNumber()                   { return mNumber;                                                     }
    //String toJson() {                   String str = "{\"" + String(mNumber) + "\":" + String(mValue) + "}";
    String toJson() {
      String str = "{\"pin\":" + String(mNumber) + "," +
                    "\"val\":" + String(mValue)  + "," +
                    "\"m\":"   + String(mMode)   + "}";
             return str;
   }
};

class GPins {

  private:
    int mLength = 0;
    GPin *mPins[50];//todo: make this dynamic not a fixed size
    
//má þetta ekki?  GPin **mPins; 
  public:
    GPins() { mLength = 0;  }
    int addPin(int mode, int pinNumber, int pinValue);

    //sets the value of a pin with the given number.
    boolean setValue(int pinNumber, int newValue);
    //searches for a pin of a specific number and returns it's index in the array
    int indexOf(int pinNumber);
    //returns true if a pin with the specific number exists in the array
    boolean exists(int pinNumber);
    //returns NULL if pin is not found at a given index
     GPin *get(int pinNumber);
    int count(){return mLength;}
    
    //retuns a key-value JSON object with the '{' and '}' around it.
    //where first key is the first in the index with the key as the GPO key
    //and the value is the last value set to that key.
    String toJSON();
};


boolean GPins::setValue(int pinNumber, int newValue){
         int i = indexOf(pinNumber);
          if (i < 0) return false;
       Serial.println("setting value of "+String(i) + " to " + String(newValue));
       mPins[i]->setValue(newValue);
       return true;
}
// todo: vantar ekki removePIn?
int GPins::addPin(int mode, int pinNumber, int pinValue) {
      mPins[mLength] = new GPin(mode, pinNumber, pinValue);
      mLength++;
      return mLength - 1;
}

//searches for a pin of a specific number and returns it's index in the array
//if nothing is found the function returns -1
int GPins::indexOf(int pinNumber){
      Serial.print("index of " + String(pinNumber) + " :");
      if (pinNumber < 0) return -1;
      for(int i=0; i<mLength; i++){
        if (pinNumber == mPins[i]->getNumber()){
            Serial.println(i);
          return i;
        }
      }
      Serial.println(-1);
      return -1;
}
//returns true if a pin with the specific number exists in the array
boolean GPins::exists(int pinNumber){
  return (indexOf(pinNumber) > -1);
}

// returns a pin with a specific number
GPin *GPins::get(int pinNumber){
      int i = indexOf(pinNumber);
      if (i < 0) return NULL;
      return mPins[i];
}

String GPins::toJSON() {
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
////////////////  GPins  end  ////////////////////////////
////////////////  GUrl  start ////////////////////////////

enum OBJECTTYPE {
     OBJECTTYPE_KEYVALUE_STRING,
    OBJECTTYPE_KEYVALUE_INT,
    OBJECTTYPE_PINS_ARRAY,
    OBJECTTYPE_PIN,
    OBJECTTYPE_PINS,
    OBJECTTYPE_DATE,
    OBJECTTYPE_WHITELIST_ARRAY,
    OBJECTTYPE_STATUS,
    /*add next type here*/
    OBJECTTYPE_COUNT
};

enum JSONTYPE{
  KEYVALUE_STRING, 
  KEYVALUE_INT,
  KEYVALUE_DOUBLE
};

/////////////////////////////////////////////////////////////
class KeyValue {
///////////////////////////////////////////////////////////
  private:
    unsigned int mKeyValueType;
    String mKey;
    String mstrValue;
    int    miValue;
    double  mdValue;
    void set(unsigned int keyValueType, String key, String strValue, int iValue, double dValue){
      mKeyValueType = keyValueType;
      mKey          = key;
      mstrValue     = strValue;
      miValue       = iValue;
      mdValue       = dValue;
   }
  public:
  
  KeyValue(String key, String value){set(KEYVALUE_STRING, key, value, 0,     0    ); }
  KeyValue(String key, int value)   {set(KEYVALUE_INT,    key, "",    value, 0    );   }
  KeyValue(String key, double value){set(KEYVALUE_DOUBLE, key, "",    0,     value);}    
  String getKey() {return mKey;}
  
  String getValueString(boolean addDoubleQuotationIfString){
    switch(mKeyValueType){
      case KEYVALUE_STRING:  
                            if (addDoubleQuotationIfString)
                                  return "\"" + mstrValue + "\"";
                             else
                                  return mstrValue;
                             break;
      case KEYVALUE_INT   :  
                             return String(miValue);
                             break;                 
      case KEYVALUE_DOUBLE:  return String( mdValue, 3);
                             break;                                                           
    }
    return "";
  }

  //returns a keyvalue string pair.
  //on error "" is returned.
  String toJson(){
    String val;
    return "\""+mKey + "\":" + getValueString(true);
   }
};

/////////////////////////////////////////////////////////////
class JSON: public LinkedList<KeyValue*> {
///////////////////////////////////////////////////////////
  private:
    //LinkedList<KeyValue*> mList;
  public:
    JSON(){
      //mList = LinkedList<KeyValue*>();
    }
     ~JSON(){destory();}

   bool add(String key, String value){return LinkedList<KeyValue*>::add(new KeyValue(key, value));}
   bool add(String key, int value)   {return LinkedList<KeyValue*>::add(new KeyValue(key, value));}
   bool add(String key, double value){return LinkedList<KeyValue*>::add(new KeyValue(key, value));}
    String toJson(){
     
      String str = "{";
      KeyValue *p;
      for(int i = 0; i < size(); i++){
        p = get(i);
        if (p != NULL)
        {
          if (i>0) str +=",";
          str += p->toJson();
        }
      }
     return str + "}";
    }
    //deletes all objects and destoys the list;
    void destory(){
      KeyValue *p;
      for(int i = 0; i < size(); i++){
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
};

const int ERROR_NUMBER = -9999;

/////////////////////////////////////////////////////////////
class Gurl {
///////////////////////////////////////////////////////////
  private:
    int mLength = 0;
  public:
    Gurl() { }
    String getAfter(String str, String afterMe);
    int toNumber(String str);
    int getUrlPinValue(String str);
    int getUrlPinIndex(String str, boolean FailIfNoValue);
    String removeLastSpaceIfExists(String str);
    String jsonKeyValue(String key, String value);
    String jsonObjectType(unsigned int uiType);
    String jsonRoot(unsigned int uiType, String key, String value);
};

/////////////////////////////////////////////////////////////
class Gtime {
///////////////////////////////////////////////////////////
  private:
    int mYear = 0;
    int mMonth = 0;
    int mDay = 0;
    int mHours = 0;
    int mMinutes = 0;
    int mSeconds = 0;
  public:
    Gtime() { }
    // sets time values from a given string which is formatted like this one
    // Fri, 15 Jul 2016 11:08:12 GMT
    boolean setTime(String strTime){
        String str;
        String num;
        int i;
        Gurl u;
        Serial.println("strTime: "+strTime);
        i = strTime.indexOf(", "); if (i < 0) return false; else i+=2;
        str = strTime.substring(i);           
    
        //todo: make following into a function always the
    
        //get the day
        i = str.indexOf(' '); if (i < 1) return false; i+=1;
        num = str.substring(0, i-1);      
        mDay = u.toNumber(num);
        str = str.substring(i);           
    
        //get the month
        i = str.indexOf(' '); if (i < 1) return false; i+=1;
        num = str.substring(0, i-1);      
        mMonth = strToMonth(num);
        str = str.substring(i);           
    
         //get the year
        i = str.indexOf(' '); if (i < 1) return false; i+=1;
        num = str.substring(0, i-1);      
        mYear = u.toNumber(num);
        str = str.substring(i);           
    
         //get the hour
        i = str.indexOf(':'); if (i < 1) return false; i+=1;
        num = str.substring(0, i-1);      
        mHours = u.toNumber(num);
        str = str.substring(i);           
         //get the minute
        i = str.indexOf(':'); if (i < 1) return false; i+=1;
        num = str.substring(0, i-1);      
        mMinutes = u.toNumber(num);
        str = str.substring(i);           
    
        //get the second
        i = str.indexOf(' '); if (i < 1) return false; i+=1;
        num = str.substring(0, i-1);      
        mSeconds = u.toNumber(num);
        str = str.substring(i);      

        
    }
    // converts a 3 letter english month name to the number of the month in the year.
    // returns -1 on error;
    int strToMonth(String month){
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
    String toString(){
      return  String(mMonth) + "/" +              
              String(mDay) + "/" +
              String(mYear) + " " +
              String(mHours) + ":" +
              String(mMinutes) + ":" +
              String(mSeconds);
    }
    String toStreng(){
      return  String(mDay) + "." +
              String(mMonth) + "." +
              String(mYear) + " " +
              String(mHours) + ":" +
              String(mMinutes) + ":" +
              String(mSeconds);
    }
    String toJson() {
      String str = "{\"year\":" + String(mYear) + "," +
                    "\"month\":" + String(mMonth)  + "," +
                    "\"day\":" + String(mDay)  + "," +
                    "\"hours\":" + String(mHours)  + "," +
                    "\"minutes\":" + String(mMinutes)  + "," +
                    "\"seconds\":"   + String(mSeconds)   + "}";
             return str;
   }
};

/////////////////////////////////////////////////////////////
class StringList: public LinkedList<String*> {
///////////////////////////////////////////////////////////
//todo: maybe whiteList should be a IPAddress not String
  public:

    bool add(String str){return LinkedList<String*>::add(new String(str));}
    
    //checks if a string exists in the list
    bool exists(String str){return indexOf(str) > -1;}
    
    //finds the index of a string in the list.  Returns -1 if string is not found.
    int indexOf(String str){
      String *p;
      for(int i = 0; i < size(); i++){
        p = get(i);
        if (*p == str)
          return i;
      }
      return -1;
    }
     bool remove(String str){
       int i = indexOf(str);
       if (i>-1)
       {  
          delete get(i);
          set(i, NULL);
        }
       return LinkedList<String*>::remove(i);}
    
    //returns the list as a jsonObject array
    String toJson(){
        String str = "[";
        String *p;
        for(int i = 0; i < size(); i++){
            p = get(i);
            if (i>0)
            str +=",";
            //str +="{"+String(i) + ": " + *p+"}";
            
            str+="\""+*p+"\"";
        }
        str +="]";
        return str;
    }
   ~StringList(){destory();}
   //deletes all objects and destoys the list;
    void destory(){
      String *p;
      for(int i = 0; i < size(); i++){
        p = get(i);
        if (p != NULL)
        {
          Serial.print("destoying: " + *p);
          delay(10);
          delete p;
          set(i, NULL);
        }
      }
      clear();
    }
};

//returns "" if nothing is found after given string
String Gurl::getAfter(String str, String afterMe) {
  int index = str.indexOf(afterMe);

  if (index > -1) {
    index += afterMe.length();
    return str.substring(index);
  }
  return "";
}

//return  ERROR_NUMBER (which is the number -9999) if a string is not a number
int Gurl::toNumber(String str) {
  int iLen = str.length();
  if (iLen < 1) return ERROR_NUMBER;
  for (int i = 0; i < iLen; i++) {
    if (!isDigit(str[i]))
      return ERROR_NUMBER;
  }
  return str.toInt();
}

int Gurl::getUrlPinValue(String str) {
  int index = str.lastIndexOf('/');

  if (index > -1) {
    return toNumber(str.substring(index + 1 ));
  }
  return ERROR_NUMBER;
}
int Gurl::getUrlPinIndex(String str, boolean FailIfNoValue) {
  String p1 = getAfter(str, "/pins/");
  if (p1.length() < 1) return -1;
  int index = p1.indexOf('/');
  int iRet = -1;
  String p2;
  if (index > -1)
    p2 = p1.substring(0, index);
  else
  {
    if (FailIfNoValue == true) return ERROR_NUMBER;
    p2 = p1;
  }
  iRet = toNumber(p2);
  return iRet;
}



String Gurl::removeLastSpaceIfExists(String str){
  Serial.println();
  int lSpace = str.lastIndexOf(" ");
  if (lSpace > 0)
  { Serial.println("remove last space: " + String(lSpace));
    str = str.substring(0, lSpace);
   }
  return str;
}


String Gurl::jsonKeyValue(String key, String value){
  String   str = "\"" + key + "\":" + value;
  return str;
}

String Gurl::jsonObjectType(unsigned int uiType){
  String str;
  if (  uiType < OBJECTTYPE_COUNT  )
    str = String(uiType);
  else
    str = "-1";

  return jsonKeyValue("type", str);
}

String Gurl::jsonRoot(unsigned int uiType, String key, String value){
  if (uiType == OBJECTTYPE_KEYVALUE_STRING)
    value = "\""+ value + "\"";
  String str = "{"+ 
               jsonObjectType(uiType) + 
               "," +
               jsonKeyValue(key, value) +
               "}";
  
  return str;
}
////////////////  GUrl  end   ////////////////////////////





    //////////////////////////////////////////////////////////////////////////////////////////////
   //                                                                                          //
  //             T H E   V A L U E S   T H A T   M U S T   B E   C H A N G E D                //
 //                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
                                                                                          //
     const char* ssid      = "WIFI_ACCESSPOINT"; //name of the wifi (accesspoint)network //
                                                                                        //
     const char* password  = "WIFI_PASSWORD"; //wifi password                          //
                                                                                      //
                  //example: 5100                                                    //
     const int PORT        = PORT_NUMBER;           //port number which this device //
                                             //will be operating on                //
                  //example: 192,168,1,154                                        //
     IPAddress        myIp( IPV4_IPADDRESS ),//ip address which this device      // 
                                             //will be operating on             //
                  //example: 192,168,1,1                                       //
                   gateway( IPV4_GATEWAY   ),  //the default gatway on this   // 
                                             //netword.                      //
                                             //On windows goto command      //
                                             //prompt and type "ipconfig"  //
                  //example: 255,255,255,0                                //
                    subnet( IPV4_SUBNET    );                            //
                                                                        //
                                                                       //
////////////////////////////////////////////////////////////////////////

/*If the device is NOT connected, it's light is faint.
  If the device is     connected it's light is bright.*/

// if you want a special address to be whiteListed you can add it here. 
// remove "//" in the next line, if you want to allow requests(commands) from a specific ipaddress.
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
              
              while(iCol>0 && iCom>2)
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
