# ardos
A System for controlling your devices using arduino or esp8266.

###The Esp8266 module
I a small and cheap device which allows you to control a real live devices and appliances.
<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">

This node application is a web server which can connect to many esp2866 web servers.
Esp2866 web server is connected to a router using WiFi. this modlue is able to control devices in the real world taking commands from a server running on the same subnet.  

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


