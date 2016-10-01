# How to setup the Esp8266
Description on how to setup the device NodeMcu Module with ESP8266 WiFi on board.
<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">

## Why we need to setup the device
In order to be able to communicate with the device using Ardos, you will need to setup your computer so you can use it to send a program to the device.  This program is called the Device server.  The device server will allow the Node server to view and change values on the device it self.  To get the device server onto the device you will need to follow the instructions below.  


## Install the Arduino IDE
- [Click here](https://www.arduino.cc/en/Main/Software)  and Download the Arduino Software.
- Install it.

## ESP8266 core for Arduino

"Esp8266 by [ESP8266 community](https://github.com/esp8266)" is the [library](https://github.com/esp8266/Arduino/tree/633e48f3aec5f1c3c11d4498fc90d378d49e6e9f/libraries/ESP8266WiFi/src) I used to write the Device server.  You will need to installed it.  Easiest way to do that is to use the Arduino IDE Board manager.
source code for the Arduino computing platform

### Follow these steps to install the ESP8266 core for Arduino:
 1. Open the Arduino IDE
 2. Open the preferences window, go to File > Preferences
 3. Enter http://arduino.esp8266.com/stable/package_esp8266com_index.json into Additional Board Manager URLs field and
 4. Click “OK” button
 5. select from menu > Tools > Board: "Arduino/Genuino Uno" > Boards Manager...
 6. type 82 into the text box to find the "esp8266 by ESP8266 Community" click it and press the "install" button.
 7. select from menu > Tools > Board: "Arduino/Genuino Uno" > NodeMCU 1.0 (ESP-12E Module).
 8. now you can have fun with a lot of examples for the ESP8266 in File > Examples > ESP8266*

Now we should be able to send our device server program to the device via a usb port. 

## Programming the device
We will need to send the Device server program to the device.  We can do that by
 1. Connected the device to your computer using a USB cable.  
 2. Get the Device Server [here](https://github.com/guttih/ardos/tree/master/hardware/Ardos_NodeMcu_ESP8266_WiFi_Server)
   - todo: what is the best way to provide the server.  Now the server is a five file program.  Best would be to merge the five files into one. 
 3. When you've opened the program and gotten it to build you will need to change a few values in the program. 

        IP              : provide an ip address (IPV4) which you want the device to ask operating system for.
        Port            : provide the port number you want the device to listen and serve from
        Default Gateway : The device needs to know the default gateway it will be using.
        Subnet mask     : The subnet mask it is on.
        SSID            : Service set identifier of the wifi network the device will be connecting to.
        SSID password   : The password to your wifi network. 
        

If you want to develop the device server further you can get [documentation](http://esp8266.github.io/Arduino/versions/2.2.0/doc/libraries.html) for the ESP8266 Community libraries. 

