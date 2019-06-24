
var TriggerAction = require('../models/triggerAction');

module.events = []; 
module.exports.consoleLogEvents = function consoleLogEvents() {
	console.log('Server date: '+(new Date()).toUTCString());
	console.log('------------------  Events  ------------------');
	console.log(module.events);
	console.log('----------------------------------------------');
}; 

module.timerVariable = 0;
 
/**
 * Clears the eventQueue, cancels all active timers and loads all TriggerAction time events into the event queue.
 */
module.exports.initialize = function initialize() {
	if (module.timerVariable !== 0){
		clearTimeout(module.timerVariable); //cancel the previously first timer
	}
	module.events = [];
	TriggerAction.listTimeTriggered(function (err, list) {
		list.forEach(item => {
			var timer = TriggerAction.copyValues(item, true,true);
			module.exports.addTimer(timer);
		});
	});
};

/**
* Adds a timer to the event queue
* 
* @param {Timer} timer 
* @returns true if the added event is the first timer in the queue otherwise false
*/
module.exports.addTimer = function addTimer(timer) {
	//set timeoute bla removea úr array og gera eitthvað	
	var now = new Date();
	if (timer.triggerTime === undefined) {
		console.log('triggerTime is missing: ' + timer.id);
		return false;
	}
	if (timer.triggerTime < now) {
		//time has passed
		console.log('triggerTime '+timer.triggerTime.toISOString()+' has passed type:' + timer.type + ' id:' + timer.id);
		return false;
	}
	module.events.push(timer);
	module.events.sort(module.compareEvent);
	var thisIsTheFirstTimer = module.events[0].id ===timer.id;
	if (!thisIsTheFirstTimer) {
		//this timer is not the first one, our job is done
		return false; 
	}

	//This timer is the first timer, we need to cancel the older first timer and add this one in stead
	module.addSetTimeout();
	return true;
};

/**
   * Modifies a existing timer in the event queue
   * @param {Timer} timer 
   * @returns Success: returns true if the timer was modified
   * @returns Fail: returns false if timer was not found or not modified
   */
   module.exports.modifyTimer = function modifyTimer(timer) {
	var index = -1;
	var tId = timer.id.toString();
	for(var i = 0; i<module.events.length; i++) {
		if (module.events[i].id.toString() === tId) {
			index = i;
			break;
		}
	}
	if (index === -1) {
		return false;
	}
	module.events[i] = timer;
	
	module.events.sort(module.compareEvent);
	var thisIsTheFirstTimer = module.events[0].id ===timer.id;
	if (!thisIsTheFirstTimer) {
		//this timer is not the first one, our job is done
		return false; 
	}

	//This timer is the first timer, we need to cancel the older first timer and add this one in stead
	module.addSetTimeout();
	return true;
};

/**
* Deletes a existing timer from the event queue
* @param {timerId} id of the TriggerAction Timer to delete 
* @returns Success: returns true if the timer was found and deleted
* @returns Fail: returns false if timer was not deleted
*/
module.exports.deleteTimer = function DELETE(timerId) {
	console.log('DELETE THE TIMER DUDE');
	var index = -1;
	for(var i = 0; i<module.events.length; i++) {
		if (module.events[i].id.toString() === timerId) {
			index = i;
			break;
		}
	}
	if (index === -1) {
		return false;
	}
	if (index === 0) {
		module.events.shift();
		module.addSetTimeout();
		return true;
	}

	module.events = module.events.splice(index,1);
	//no need to call module.addSetTimeout() because the first one was not removed.
	return true;
};

module.exports.getFirst = function getFirst(){
	return module.events[0]; 
};

module.exports.copyEvents = function copyEvents(){
	var arr = [];


	module.events.forEach(item => {
		arr.push(item);
	});
	return arr;
};

module.compareEvent = function compareEvent(a, b) {
	var at = a.triggerTime.getTime(), bt = b.triggerTime.getTime();
	if (at < bt) {
	  return -1;
	} else if (at > bt) {
	  return 1;
	}
	return 0;
};


/**
 * Remove the first trigger from the queue and run it's action
 */
module.runFirstTriggerAndSetTimeout = function runFirstTriggerAndSetTimeout() {
	timer = module.events.shift();
	console.log('Running event "'+timer.id+'" at '+ (new Date).toISOString());
	//Add this ActionTrigger back to the queue with a newly calculated trigger time. 
	var timerToRun = TriggerAction.cloneRawObject(timer);
	timer.triggerTime = TriggerAction.getTriggerTime(timer);
	if (!module.exports.addTimer(timer)){
		//addTimer did not call addSetTimeout because this new timer is not the first one
		module.addSetTimeout();
	}

	TriggerAction.run(timerToRun);
	
	
};

module.addSetTimeout = function addSetTimeout() {
	if (module.timerVariable !== 0){
		clearTimeout(module.timerVariable); //cancel the previously first timer
	}
	if (module.events.length < 1) {
		return;
	}

	var currentTime = new Date();
	var millisecondsUntilTimerEvent = module.events[0].triggerTime.getTime()-currentTime.getTime();

	if (millisecondsUntilTimerEvent < 1) {
		//we need to run the trigger now
		module.runFirstTriggerAndSetTimeout();
		return;
	}
	
	console.log('Next timer runs at '+module.events[0].triggerTime.toISOString()+' which is after "'+ millisecondsUntilTimerEvent+'" millis.'+'('+module.exports.msToStr(millisecondsUntilTimerEvent,true)+')' );

	module.timerVariable = setTimeout(function() {  
		console.log('I am a timeout');
		module.runFirstTriggerAndSetTimeout();
	}, millisecondsUntilTimerEvent);
};

module.leadingZeros = function leadingZeros(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

module.exports.msToStr = function msToStr(durationInMillis, showMilliseconds) {
	var milliseconds = parseInt((durationInMillis%1000)/1), 
		seconds = parseInt((durationInMillis/1000)%60),
		minutes = parseInt((durationInMillis/(1000*60))%60), 
		hours   = parseInt((durationInMillis/(1000*60*60))%24),
		days    = parseInt((durationInMillis/(1000*60*60*24)));
	if (durationInMillis < 60000) {
		//fixing precision problem
		days=hours=minutes=0;
	}

	days         = module.leadingZeros(days, 2);
	hours        = module.leadingZeros(hours, 2);
	minutes      = module.leadingZeros(minutes, 2);
	seconds      = module.leadingZeros(seconds, 2);
	milliseconds = module.leadingZeros(milliseconds, 3);
	
	var str = "";
	str = days + "d:" + hours + "h:" + minutes + "m:" + seconds + "s";
	if (showMilliseconds !== undefined && showMilliseconds === true){
		str+= ':'+milliseconds + "ms";
	}
	return str;
};


