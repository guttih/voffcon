
## Log when variable as changed much enough or log when a specific time has passed 
```c
struct pinWatch
{
     int pinNumber;
     unsigned long sampleSum;        // Sum of pin value samples
     unsigned int pinValueLastLogged // The pin value which was last logged.
     unsigned int pinValueMargin     // How much must a sampleSum / sampleCount change from pinValueLastLogged to trigger a log.
     int sampleCount;                // How many times has the pinValueSum been summerized.
     int sampleTotalCount;           // How many samples before we can average sampleSum and compare with pinValueLastLogged
     unsigned long nextSampleTime;   // When should we get the next sample
     unsigned long sampleInterval;   // How long between samples
     unsigned long minLogInterval;   // The minimum time allowed to pass between logs. Set to 0 to disable
     unsigned long nextLogTime;      // If minLogInterval is > 0 then this will be the time when we must log
                                     // This time must be reset after each log. 
};
```

	
þegar card krassar þá má það alls ekki krassa servernum, eins og gerist þegtar 
	device4 = new Device('57e2a6f74a43074811a0720f', maxValue);
	hefur rangt id á device-i.

Búa til síðu sem inniheldur forritið sem hlaða ská upp á tækið
	sú síða býður þér uppá að skrifa inn ip addressu, password á wifi-ið og nafn fyrir tækið.
	generate code takki. sem mun búa til kóða sem copy peista má inn í arduino IDE.

make more nice dashbord, eggxpecially for user who are normal users.

do documentation on built, in objects


	
Þessi eigindi ættu að vera til á öllum hlutum vistaðir í gagnagrunn.
	last modified	: dateTime
	last created	: dateTime
	og það er spurning um hvort ekki yrði líka bætt við tveimur eigindum í viðbót
		last modified by : userID
		created by : userID

todo: when user changes his own access and he looses the access to change, 
the user interface shows him like he can change the access but he cannot change anyting
this is because the middleware authenticateControlOwnerUrl reports an error but
the client javascript does not pick that kind of error, that is req.flash( error.
when he removes his own access we need to direct him to the control list page 

