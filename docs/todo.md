# VoffCon - Todo
________________
## Allow devices to save data 
 - Log device data will be called onDataUpdate event
 - Control access to logged data.  User who can change access device data must have "Owner" device access.
     - Grant devie 1 access to data from device 2 via voffcon page
     - Grant everybody access to data from device 1
     - Grant a specific ip address access to device 1
     - Add url to call when onDataUpdate event occurs.
         - this will allow devices and webpages to poll new data when as soons as it is updated
 - On Device diagnostic card page, create a sceduler for when to log device data
     - something like:
         - when pin values change more than X
         - every hh:mm:ss where h is hour mm is minute and ss is seconds
         - daly at hh:mm:ss 
         - weekly every monday, tuesday, friday at hh:mm:ss
         - every x week at at hh:mm:ss 
         - monthly at d hh:mm:ss
         - every x month at at hh:mm:ss
         
     
     
  
