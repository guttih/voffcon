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
#include "Gurl.h"

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




