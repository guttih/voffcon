//Event queue 
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
   * adds a timer to the event queue
   * returns true if the added event is the first timer in the queue
   * @param {Timer} timer 
   */
module.exports.addTimer = function addTimer(timer) {
	//set timeoute bla removea úr array og gera eitthvað	
	var now = new Date();
	if (timer.date === undefined || timer.date < now) {
		//time has passed
		console.log('timer has passed : ' + timer.id);
		return false;
	}
	module.events.push(timer);
	module.events.sort(module.compareEvent);
	var thisIsTheFirstTimer = module.events[0].id ===timer.id;
	if (!thisIsTheFirstTimer) {
		//this timer is not the first one
		return false; 
	}

	module.addSetTimeout();
	return true;
}

module.exports.getFirst = function getFirst(){
	return module.events[0]; 
}

module.exports.copyEvents = function copyEvents(){
	var arr = {};
	module.events.foreach(m, i =>{
		console.log(i);
		arr.push(m);
	});
	return arr;
}

module.compareEvent = function compareEvent(a, b) {
	var at = a.date.getTime(), bt = b.date.getTime();
	if (at < bt) {
	  return -1;
	} else if (at > bt) {
	  return 1;
	}
	
	return 0;
}
/**
 * Remove the first trigger from the queue and run it's action
 */
module.runFirstTrigger = function runFirstTrigger() {
	var trigger = module.events[0];
	module.events.shift();
	console.log('RUNNING FIRST TRIGGER:');
	console.log(trigger);
}

module.addSetTimeout = function addSetTimeout() {
	if (module.timerVariable !== 0){
		clearTimeout(module.timerVariable); //cancel the previously first timer
	}
	if (module.events.length < 1) {
		return;
	}

	var currentTime = new Date();
	var millisecondsUntilTimerEvent = module.events[0].date.getTime()-currentTime.getTime();

	if (millisecondsUntilTimerEvent < 1) {
		//we need to run the trigger now
		module.runFirstTrigger();
		module.addSetTimeout();
		return;
	}
	
	console.log('Next timer runs after "'+ millisecondsUntilTimerEvent+'" millis');

	module.timerVariable = setTimeout(function() {  
		console.log('I am a timeout');
		module.runFirstTrigger();
		module.addSetTimeout();
	}, millisecondsUntilTimerEvent);
};


