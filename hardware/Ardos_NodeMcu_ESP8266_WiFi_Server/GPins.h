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
#ifndef GPins_h
#define GPins_h

#include "Arduino.h"


//todo: the Response class should be in a file?
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
#endif
