#include "Arduino.h"
#include "GPins.h"

boolean GPins::setValue(int pinNumber, int newValue){
         int i = indexOf(pinNumber);
          if (i < 0) return false;
       Serial.println("setting value of "+String(i));
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
