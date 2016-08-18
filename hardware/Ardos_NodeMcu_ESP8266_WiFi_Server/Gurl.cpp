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




