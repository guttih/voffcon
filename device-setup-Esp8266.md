# How to setup the Esp8266
Description on how to setup the device NodeMcu Module with ESP8266 WiFi on board.

<img src="/docs/images/esp8266.png" width="200" alt="The esp8266 module">




### Later additions to the system / nice to have
- Make it easier to program the devices. Best would be to make the node server create the program from a template and inject needed
  needed values into the program (deviceserver.ino) and then allow the user to copy and paste the program into the 
  Arduino Integrated development environment (IDE).  From there the user can send the program to the device.  The needed values are
  ip address and port for the device.  Default gateway and the subnet mask.  The system can find the Default gateway and the subnet mask
  for the user.  But he will need to provide the ip address, port, wifi password, and the wich access point to use.
- Write device programs for different types of deivces.  The program should allow the same commands and as the Esp8266 device server.
  
 - Create a visual/drag'n drop editor, allowing power users create cards more easier.
 - Create a visual/drag'n drop editor, allowing power users controls more easier.
