# ardos
A System for controlling devices and appliances from anywere.  It is made up from two components.  A node server and A device web server.

##The node server
Is a server created with node.js.  This server can be accessable from where ever you want.  It uses the  [Passport](http://passportjs.org/docs) authentication middleware to keep your devices from being controlled by everyone. 

The server provides connections to many devices and uses passport to make sure that the user is authenticated before he is able to give commands to the wifi servers.

##The basics for the node server
###requirements
You will need to install the following if you haven't already.
+ [MongoDb](https://www.mongodb.com) To store user- and device information
+ [Node.js](https://nodejs.org/en/) To run the Node server


### Setting up the node server
```shell
npm install
```
### Runing the node server
```shell
node app
```
### developing the app
```shell
grunt
```
###Overview
This application is a server intended to run on a computer where it can access esp8266 devices running a special server program which was developed for this server in mind.

  <img src="/docs/images/diagram_ardos.png" width="500" alt="Overnew image of the whole system ">
  
##Devices
###The Esp8266 module
Is the NodeMcu Module with ESP8266 WiFi on board.  It is a small and cheap device which allows you to control real world devices and appliances via a WiFi connection.  A device web server needs to be uploaded to this device so the Node server and the Device can comunicate. 
#####
<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">

###The arduino module
has not been tested or implemented yet

##The device web server
This program needs to be uploaded on the device you want to control from the node server.
The webserver will only allow request to it, if the request comes from a client which is on the same subnet. In fact the webserver will check for the first 3 numbers in the calling ipaddress and if they match the deivces ipaddress numbers then the caller will be considered save and his requests will be acted upon.

Possible commands
- /pins
  - __get__ Get status of all pins
  - __post__ Change the value of a pin, that is turn off or on or set a pins value from 0 - 1023
- /whitelist
-   - __get__ Get all whitlisted ip addresses
  - __post__ 
    - __add__ whitelist a new ip address.
    - __remove__ remove a ip address from the whitelist
- /started
    - __get__ Get when the server was turned on
- /status
    - __get__ Get the status of the pins, whitelist and when the server was started, all in one request.  (good for beginning of a page)
- /setup
  - __get__ whitelists the first caller to the device.  (todo: this is a sequrity risk, should be removed after development)
- /pinout
  -__get__ returns the pin mappings of the device.  That is f.example "D0" on the device is mapped to the pin number 16.

