#ifndef Gurl_h
#define Gurl_h

#include "Arduino.h"

#include <LinkedList.h>

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


#endif
