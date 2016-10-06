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
#include "Arduino.h"
#include "GPins.h"

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
