# VoffCon - How to setup the devices 
<img src="images/logo.png" width="100" height="100"/>

 [Readme](https://guttih.github.io/voffcon) | [Device setup](https://guttih.github.com/voffcon/docs/device-setup.html) | [YouTube channel](https://www.youtube.com/channel/UCmZFs6SCoeuphnKucBkvcEg)
:-------------------------:|:-------------------------:|:-------------------------:
<br/><br/>


 

NodeMcu             |  Esp32
:-------------------------:|:-------------------------:
<img src="images/esp8266.png" width="200" alt="The esp8266 module">  |  <img src="images/esp32DevModule.PNG" width="200" alt="The esp8266 module">
**NodeMCU 1.0 (ESP-12E Module)** which has the Esp8266 wifi chip on board.|**ESP32 DEV Module** which has the Esp32 Wifi and bluetooth chip on board

## Why we need to setup a device
In order to be able to communicate with the device using VoffCon, you will need to setup your computer so you can use it to send a program to the device.  This program is called the Device server.  The device server will allow the Node server to view and change values on the device it self.  To get the device server onto the device you will need to follow the instructions below.

Please see [Video tutorial](https://youtu.be/UtBYKEz3RVs) on how to setup VoffCon.

### Provide Wifi informatin
These are the same values you need to connect your smart mobile phone to your wifi.  The node server will create a program (the device server) and upload it to the device.  These values will be injected into the program allowing the device to connect to your wifi network.

After running VoffCon, you will need to 
 - start a web browser on the same computer, VoffCon is running on.  
 - In the address bar type the url `http://localhost:6100/`.
 - Hover the mouse over and click Settings-> General server settings.
 - Provide the name and password of your wifi access point.
 - Click Save settings

### Location
If you want to be able to automate commands (TriggerActions) based on when there is sunrise or sunset VoffCon will need to know your location, or a location near you.  This location is used to calculate when sunrise, solar-noon and sunset.
Hover the mouse over and click Settings-> Server location.
 

## Install the Arduino IDE
- [Click here](https://www.arduino.cc/en/Main/Software), download the Arduino Software and install it.

You could also checkout these three video tutorials on how install the Arduino Ide and needed libraries for the two suppored devices.
 - [Installing Arduino IDE on Windows 10](https://youtu.be/6uPTaGaAUjk)
 - [How to install needed library for NodeMcu](https://youtu.be/hQYEQ4Hrih8)
 - [How to install needed library for Esp32](https://youtu.be/4gLXqaICsvQ)


### ESP32 Arduino Core
If you will be using the ESP32 Development Module you will need the ESP32 Arduino Core.  

### Installing the esp32 core for Arduino
 1. Open the Arduino IDE
 2. Open the preferences window, go to File > Preferences
 3. Enter `https://dl.espressif.com/dl/package_esp32_index.json` into Additional Board Manager URLs field.
    - note, if you already have a path there, add a comma and a single space behind the last path and then add the path.
 4. Click “OK” button
 5. select from menu > Tools > Board: "Arduino/Genuino Uno" > Boards Manager...
 6. type esp32 into the text box to find the "esp8266 by ESP8266 Community" click it and press the "install" button.
 7. select from menu > Tools > Board: "Arduino/Genuino Uno" > NodeMCU 1.0 (ESP-12E Module).
 8. now you can have fun with a lot of examples for the ESP8266 in File > Examples > ESP8266*
#### Tutorial
Click [click](https://randomnerdtutorials.com/installing-the-esp32-board-in-arduino-ide-windows-instructions/) to view a good tutorial. 

##### The old method
[Click here](https://learn.sparkfun.com/tutorials/esp32-thing-hookup-guide/installing-the-esp32-arduino-core) to get information on how get the ESP32 Arduino Core.
- Follow them to install the Core.

## ESP8266 core for Arduino
If you will be using the NodeMCU 1.0 (ESP-12E Module) you will need the ESP8266 Arduino Core.

"Esp8266 by [ESP8266 community](https://github.com/esp8266)" is the [library](https://github.com/esp8266/Arduino/tree/633e48f3aec5f1c3c11d4498fc90d378d49e6e9f/libraries/ESP8266WiFi/src) I used to write the Device server.  You will need to install it.  Easiest way to do that is to use the Arduino IDE Board manager.

### Installing the ESP8266 core for Arduino
 1. Open the Arduino IDE
 2. Open the preferences window, go to File > Preferences
 3. Enter `http://arduino.esp8266.com/stable/package_esp8266com_index.json` into Additional Board Manager URLs field.
     - note, if you already have a path there, add a comma and a single behind the last path and then add the path.
 4. Click “OK” button
 5. select from menu > Tools > Board: "Arduino/Genuino Uno" > Boards Manager...
 6. type 82 into the text box to find the "esp8266 by ESP8266 Community" click it and press the "install" button.
 7. select from menu > Tools > Board: "Arduino/Genuino Uno" > NodeMCU 1.0 (ESP-12E Module).
 8. now you can have fun with a lot of examples for the ESP8266 in File > Examples > ESP8266*

Now we should be able to send our device server program to the device via a usb port. 

## Programming the device
We will need to send the Device server program to the device.  We can do that by doing the following
 1. Browse to the the VoffCon system.
 2. Create a device, by going to menu -> Devices ->  Register a new device.
 3. Save the device, to add it to the VoffCon database.
 4. Press the "> Run" button and click the "Get program" button.
 5. Save the program to you local hard disk. 
 6. Open the Arduino IDE.
 7. Select the device you will be programming
    - for **NodeMCU 1.0** select from menu > Tools > Board: "Arduino/Genuino Uno" > NodeMCU 1.0 (ESP-12E Module).
    - for **ESP32 DEV Module** select from menu > Tools > Board: "Arduino/Genuino Uno" > ESP32 DEV Module
 8. Connect the device to your computer using a USB cable.
 9. Select the COM port the device is connected to.
 10. Select from the menu File -> New to create a new sketch.
 11. Open the .ino program you downloaded.
 12. Copy all text in the downloaded file and paste it into the new sketch in the arduino IDE.  
 13. Compile, build and send the Device Server program to the device.
  
  Now the device has been setup and you should be able to connect to it.

  Checkout these two tutorials on how to program the devices
  - [Add a device to VoffCon](https://youtu.be/3ypXcRsjKF0)
  - [Add device and change pins](https://youtu.be/uwkq1JAt5bY)


## The Device server

### General information
As noted above this program needs to be uploaded on the device you want to control from the node server.
This server will only allow request to it, if the request comes from a client which is on the same subnet. In fact the Device server will check for the first 3 numbers in the calling ip address and if all 3 match the device ip address numbers then the caller will be considered as save and his requests will be acted upon.  Exeptions to this can be made by whitelisting specific ip addresses.


### Device server commands
Some of the commands a client (the Node server) can send to the device.

- /pins
  - __get__ Get status of all pins
  - __post__ Change the value of a pin, that is, turn off or on or set a pins value from 0 - 1023
- /whitelist
   - __get__ Get all whitelisted ip addresses
  - __post__ Add a new ip address to the whitelist
  - __delete__ Remove a existing ip address from the whitelist
- /started
    - __get__ Get when the server was turned on
- /status
    - __get__ Get the status of the pins, whitelist and when the server was started, all in one request.  (good for beginning of a page)
- /setup
  - __get__ whitelists the first caller to the device.  (todo: this is a sequrity risk, should be removed after development)
- /pinout
  - __get__ returns the pin mappings of the device.  That is f.example "D0" on the device is mapped to the pin number 16.
  - /monitors
  - __get__ returns all the pin monitors which monitor pin values and if a cetain time has passed.
  - __post__ Updates the monitor list with monitors from the Json object provided in the body.
  - __delete__ Deletes list items provided by from Json array

### Device server Documentation
#### NodeMcu
Here are all the [classes](http://voffcon.com/docs/hardware/nodeMcuDocs/html/annotated.html) you have access to from the [NodeMcu VoffCon device server](https://github.com/guttih/voffcon/blob/master/hardware/DeviceServerNodeMcu.ino).
In the device server code, there is a variable called __server__ which is of the type [ESP8266WebServer](https://links2004.github.io/Arduino/d3/d58/class_e_s_p8266_web_server.html)

See also:
  - [esp8266 documentation](http://esp8266.github.io/Arduino/versions/2.2.0/doc/libraries.html) from the ESP8266 Community libraries.
  - [ESP8266 Class libary](https://links2004.github.io/Arduino/annotated.html) from the [ESP8266 core](https://github.com/esp8266/Arduino)

#### Esp32
Here are all the [classes](http://voffcon.com/docs/hardware/esp32Docs/html/annotated.html) you have access to from the [Esp32 device server](https://github.com/guttih/voffcon/blob/master/hardware/DeviceServerEsp32.ino).
 The esp32 device server is built using [Arduino-esp32](https://github.com/espressif/arduino-esp32) which is intended to provide an arduino compatible environment on the esp32 hardware. The basic arduino functional documentation can be found [here](https://www.arduino.cc/reference/en/).
 
