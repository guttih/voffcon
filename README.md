# ardos
A System for controlling your devices and appliances from anywere.  It is made up from two components.  A node server and A device web server.

##The node server
Is a server created with node.js.  This server can be accessable from where ever you want.  It uses the  [Passport link](http://passportjs.org/docs) authentication middleware to keep your devices from being controlled by everyone. 

###The Esp8266 module
---------------------
Is a small and cheap device which allows you to control a real world devices and appliances with a WiFi connection.
I created a web server which needs to be uploaded to this device.  This webserver will only allow request to it if the request comes from a client which is on the same subnet.  In fact the webserver will check for the fist 3 numbers in the calling ipaddress and if they match the deivces ipaddress numbers then the caller will be considered save and his requests will be acted upon.
#####
<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">

###The arduino module
---------------------
has not been tested or implemented yet


The server provides connections to many devices and uses passport to make sure that the user is authenticated before he is able to give commands to the wifi servers.

The device I will be using is the NodeMcu Module with ESP8266 WiFi on board.

##The basics
### Setting up the app
```shell
npm install
```
### Runing the app
```shell
node app
```
### developing the app
```shell
grunt
```
###Overview
This app is intended to run on a local computer where it can access esp8266 devices running a special server program which was developed for this app in mind.  
  <img src="/docs/images/diagram_ardos.png" width="500" alt="Overnew image of the whole system ">


