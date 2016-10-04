# Ardos
A System for controlling devices and appliances from anywere.  It is made up by two components.  A node server and A device server.  The main benefits of this system is your ability to create your own controls and cards, which other users logged in to your system can use to control devices you deside to put on your cards.

# Licence  
        Ardos is a system for controlling devices and appliances from anywhere.
        It consists of two programs.  A “node server” and a “device server”.
        Copyright (C) 2016  Gudjon Holm Sigurdsson

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>.
        
[Click here](https://github.com/guttih/ardos/blob/master/public/COPYING.txt) for a copy of the licence.

You can contact the author by sending email to gudjonholm@gmail.com or 
by regular post to the address Haseyla 27, 260 Reykjanesbar, Iceland.




##The node server
Is a server created with node.js.  This server creates webpages which can be viewed in a web browser like Google Chrome, Microsoft Edge and Internet Explorer. If you portforward the server out to the internet you will be able to accsess your devices from anywhere.  It uses the  [Passport](http://passportjs.org/docs) authentication middleware to keep your devices from being controlled by everyone. 
The server provides connections to many devices and uses passport to make sure that the user is authenticated before he is able to give commands to web servers running on the devices.

##The basics for the node server
###requirements:
You will need to install the following if you haven't already.
+ [MongoDb](https://www.mongodb.com) To store user- and device information
+ [Node.js](https://nodejs.org/en/) To run the Node server

### Windows 7 problem when installing mongoDB
If you are having problem installing mongoDB on windows 7, then you could try the following.

1. Do not have spaces in the installation folder for example do NOT install to "C:\Program Files\MongoDB", better would be "C:\MongoDB"
2. Try to run Run : "C:\MongoDB\Server\3.2\bin\mongod.exe"
3. If you get a hotfix error when running Mongo, install this [Hotifx](http://hotfixv4.microsoft.com/Windows%207/Windows%20Server2008%20R2%20SP1/sp2/Fix405791/7600/free/451413_intl_x64_zip.exe)  and goto step 2.
4. if you are still having problems then this worked for me.  Open the command window (cmd) and do the following.
```shell
C:
cd C:\MongoDB\Server\3.2
mkdir data
mkdir data\db
mkdir log
cd bin
mongod.exe --directoryperdb --dbpath C:\MongoDB\Server\3.2\data\db --logpath C:\MongoDB\Server\3.2\log\mongodb.log --logappend
```

### Run the mongodb server
+ for windows
+ - do not have spaces in the installation folder for example do NOT install to "C:\Program Files\MongoDB", better would be "C:\MongoDB"
+  Run : "C:\MongoDB\Server\3.2\bin\mongod.exe"


### Setting up the node server
```shell
npm install
```
### Runing the node server
```shell
node app
```
### developing the app (Node server)
```shell
grunt
```
###Overview
This application is a server intended to run on a computer where it can access esp8266 devices running a special server program which was developed for this server in mind.

  <img src="/docs/images/diagram_ardos.png" width="500" alt="Overnew image of the whole system">
  
##Devices
###The Esp8266 module
Is the NodeMcu Module with ESP8266 WiFi on board.  It is a small and cheap device which allows you to control real world devices and appliances via a WiFi connection.  A device server needs to be uploaded to this device so the Node server and the Device can comunicate. 

## Setting up the device server.
[Click here](https://github.com/guttih/ardos/blob/master/docs/device-setup.md) to get instructions on how to setup the device server.


#### 
<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">

###The arduino module
has not been tested or implemented yet



### More about the system
####Users
There are three kinds of users (actors). "administrator", "power user/card creator" and a "normal user".

#####Administrator
Has the power to change/modify or delete all cards, and devices. He can also give a user access to a card, or a device, just like a card creator. This user is the only one who can upgrade, downgrade or delete users. He can f.example change a normal user to "administrator" or a "power user". He can also change a power user back to a normal user. He has total control of everything.


#####Power user 
Is a person who is able to change or create cards or devices. He needs to know how to upload programs to the devices. He needs to know what a subnet is and basic information about networking. He needs to have access to the routers so he can setup IP addresses for the devices. He is the one who will be adding the available devices for everybody. This person will also be creating control-cards. A power user will become a Card creator when he has created a Card or has been given access to change a card.

#####Card creator
A card creator is a power user which has created a control card. He has the power to grant others access to his card. He can grant a normal user access to his card and that will allow the normal user to use his card. The normal user will also be able to press or view controls on his card. A card creator can also grant another power user to have a card creator privileges for his card. 

#####User (normal user)
He knows how to use a browser and he also has recived information from the power user on how the control-cards work. He knows what the cards control and Do's and Don'ts about a device he Is able to control using the control-cards. All knowledge about the control-cards should be supplied by the power user. 

####Control card
A control card is a web-page which the normal user works with. On this card there are buttons or controls which allow the user to change or view the state of the different devices. One card can include controls for many devices. 
This control card is created by a power user. The creator of the card will also be the one who will give other users access to a card. By default only the user which created the card will have access to the card he created. The creator user can select any user and grant him an access to his card. The card creator is the only one who can modify it(with the exeption of the Administrator). He can grant other power user access to his card giving them the card-creator privileges. No other power user can access his card without the card-creator’s permission.

####Control
A Control is a control class which can be used when creating a card.  These Controls can be thought of as a library.  One control could be f.example DiodeCtrl.  DiodeCtrl could be a class which shows an image of a diode which a Card creator can use to display a pins values as a diode.  Another control could be a slider which allows the Card creator to provide the user an easy control of a pins value by allowing the user to drag a button on a slider around to change a device pin value.  The same user access rules apply to Control as where descriped in the Control Card section above. 

####Access to devices
If a user wants to access a device then the system will grant him access if the user is a power user. The system will only give a normal user access to a device through a control card that controls the device.

### Later additions to the system / nice to have
- Make it easier to program the devices. Best would be to make the node server create the program from a template and inject needed
  needed values into the program (deviceserver.ino) and then allow the user to copy and paste the program into the 
  Arduino Integrated development environment (IDE).  From there the user can send the program to the device.  The needed values are
  ip address and port for the device.  Default gateway and the subnet mask.  The system can find the Default gateway and the subnet mask
  for the user.  But he will need to provide the ip address, port, wifi password, and the wich access point to use.
- Write device programs for different types of deivces.  The program should allow the same commands and as the Esp8266 device server.
- Create a visual/drag'n drop editor, allowing power users create cards more easier.
- Create a visual/drag'n drop editor, allowing power users controls more easier.
- Show running cards without the Ardos menu.
