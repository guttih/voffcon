/*
        Ardos is a system for controlling devices and appliances from anywhere.
        It consists of two programs.  A “node server” and a “device server”.
        Copyright (C) 2016  Gudjon Holm Sigurdsson

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, version 3 of the License.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>. 
        
You can contact the author by sending email to gudjonholm@gmail.com or 
by regular post to the address Haseyla 27, 260 Reykjanesbar, Iceland.
*/
var pin1, pin2,
	switch1, meter1, diode1, slider1, text1,
	switch2, meter2, diode2, slider2, text2;
var timer1;
const TIMEOUT = 1000;
function onClickCAllback(obj){
	var pin = obj.pinObject;
	var value = obj.getPinValue();
	//todo: gray everything and call a function which queries from the server
	// and the result will set the pins value.
	pin.setValue(value);
}

function onLoad(){
	var host = 'http://192.168.1.151:5100';
	pin1    = new Pin(1, 999, host, 1023);
	pin2    = new Pin(2, 444, host, 1023);
	
	text1   = new TextCtrl(540,3,pin1);
	diode1  = new DiodeCtrl(100,0,pin1);
	meter1  = new ThermoCtrl(200, 0, pin1, 25);
	switch1 = new SwitchCtrl(300, 0, pin1);
	slider1 = new SliderCtrl(400, 0, pin1, 1023);

	diode2  = new DiodeCtrl(100,250,pin2);
	text2   = new TextCtrl(540,250,pin2);
	meter2  = new ThermoCtrl(200, 250, pin2, 20);
	switch2 = new SwitchCtrl(300, 250, pin2);
	slider2 = new SliderCtrl(400, 250, pin2, 1023);
	
	pin2.rotate(90);
	
	pin1.active(false);
	//displays values as they are inactive.
	
	meter1.addTicks(4);
	pin1.registerClicks(onClickCAllback);
	pin2.registerClicks(onClickCAllback);
	$('#test').append('<div id="tester" class="tester" style="position:absolute">\n'+
			'<svg width="131"  height="82" class="control">\n'+
			'	<circle class="knob-background" r="40" cx="41" cy="41" style="fill:#ff0000; stroke: #bbbbbb; stroke-width: 1px;"></circle>\n'+
			'	<line x1="41" y1="1" x2="90" y2="1" style="stroke:blue;stroke-width:1" />\n'+
			'	<line x1="41" y1="81" x2="90" y2="81" style="stroke:purple;stroke-width:1" />\n'+
			'	<circle class="knob" r="37" cx="41" cy="41" style="fill:#cyan; stroke: yellow; stroke-width: 1px;"></circle>\n'+
		'	</svg>\n'+
	'	</div>');	
		
}
