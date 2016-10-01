# How to setup the Esp8266
Description on how to setup the device NodeMcu Module with ESP8266 WiFi on board.

<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">

## Install the Arduino IDE
- [Click here](https://www.arduino.cc/en/Main/Software)  and Download the Arduino Software.
- Install it.

## ESP8266 core for Arduino

"Esp8266 by [ESP8266 community](https://github.com/esp8266)" is the [library](https://github.com/esp8266/Arduino/tree/633e48f3aec5f1c3c11d4498fc90d378d49e6e9f/libraries/ESP8266WiFi/src) I used to program the NodeMCu module.  You will need to installed it.  Easiest way to do that is to use the Arduino IDE Board mangager.
source code for the Arduino computing platform

how to install it:
1) Open the Arduino IDE
2) Open the preferences window, o to File > Preferences
3) Enter http://arduino.esp8266.com/stable/package_esp8266com_index.json into Additional Board Manager URLs field and
4) Click “OK” button
5) select from menu > Tools > Board: "Arduino/Genuino Uno" > Boards Manager...
6) type 82 into the text box to find the "esp8266 by ESP8266 Community" click it and press the "install" button.
7) select from menu > Tools > Board: "Arduino/Genuino Uno" > NodeMCU 1.0 (ESP-12E Module)
8) now you can have fun with a lot of examples for the ESP8266 in File > Examples > ESP8266*

Now we should be able to send our device server program to the device via a usb port. 

If you want to develop the device server further you can get [documentation](http://esp8266.github.io/Arduino/versions/2.2.0/doc/libraries.html) for the ESP8266 Community libraries. 

