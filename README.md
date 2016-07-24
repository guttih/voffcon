# ardos
A System for controlling your devices and appliances from anywere.  It is made up from two components.  A node server and A device web server.

##The node server
Is a server created with node.js.  This server can be accessable from where ever you want.  It uses the  [Passport](http://passportjs.org/docs) authentication middleware to keep your devices from being controlled by everyone. 

The server provides connections to many devices and uses passport to make sure that the user is authenticated before he is able to give commands to the wifi servers.

The device I will be using is the NodeMcu Module with ESP8266 WiFi on board.

##The basics for the node server
###Requrements
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
  
###The device web server

##Devices
###The Esp8266 module
Is a small and cheap device which allows you to control real world devices and appliances via a WiFi connection.
I created a web server which needs to be uploaded to this device.  This webserver will only allow request to it, if the request comes from a client which is on the same subnet.  In fact the webserver will check for the first 3 numbers in the calling ipaddress and if they match the deivces ipaddress numbers then the caller will be considered save and his requests will be acted upon.
#####
<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">

###The arduino module
has not been tested or implemented yet
