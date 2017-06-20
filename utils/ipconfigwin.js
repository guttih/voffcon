/*
        VoffCon is a system for controlling devices and appliances from anywhere.
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
const exec = require('child_process').exec;



//calls dos command ipconfig and searches for the first match of a attribute
//you can f.example search for Default GateWay like this

module.exports.getFirstWindowsIpConfigValue = function getFirstWindowsIpConfigValue(strMatchMe, callback, callbackError){
		
	module.exports.getWindowsIpConfig(function(output){
		var str;
		output.forEach(function(item){

			var key = Object.keys(item)[0];
			str = item[key][strMatchMe];
			if (str !== undefined){
				callback(str);
				return;
			}
		}, this);
	}, callbackError);
};

module.exports.geKeyValueFromLine = function geKeyValueFromLine(element){
	if (element.length<1){
		return null;
	}
	var res = element.split(" : ", 2);
	if (res.length > 0 ){
		var i = res[0].indexOf(" .");
		var x = res[0].indexOf(". ");
		if (x > -1 && x < i) { i = x;}
		//x = res[0].indexOf("  .");
		if (i > 1){
			res[0]  = res[0].substring(0,i); 
		}
		var key = res[0].trim();
		var value = "";
		if (res.length > 1 && res[1].length){
			value = res[1];
		}
		return {key : key, value : value};
	}
	return null;
};

//reads first object from ipconfig output lines and returns it.
//when function has proccessed the object the lines from the array will be delteted. 
module.exports.getObjectFromLines = function getObjectFromLines(lineArray){
	
	if (lineArray.length < 4      || 
		lineArray[0].length !== 0 ||
		lineArray[2].length !== 0) {
		return null;
	}

	var i = 1;
	var key = lineArray[1].substring(0, lineArray[1].length-1);
	var obj = {};

	obj[key] = {};
	var i = 3, res, item;
	item = module.exports.geKeyValueFromLine(lineArray[i]);
	while(item){
		if (item.value.length>0){
			obj[key][item.key] = item.value;
		}
		i++;
		item = module.exports.geKeyValueFromLine(lineArray[i]);
	}
	lineArray.splice(0, i);
	return obj;
}
//runs the dos command ipconfig and returns all elements reported by it in a array.
module.exports.getWindowsIpConfig = function getWindowsIpConfig(callback, callbackError){
		
	var shellCommand = 'ipconfig';
	var gateways = [];
	var errStr;
	var objects;
		//running the dos command ipconfig, and parsing the result
		exec(shellCommand, function(err, out, code) {
			if (err !== null){
				errStr = ' : ' + err.message + 'Code : ' + err.code; 
				console.log(errStr);
				if (callbackError !== undefined){
					callbackError("Error extracting data from ipconfig!");//returns undefined
				}
			} else {
				
				var lines = out.split("\r\n");
				if (lines.length < 8 || lines[1] !== 'Windows IP Configuration') {
					if (callbackError){
						callbackError("unable to get output from ipconfig.");
						return;
					}
				}
				lines.splice(0, 3);
			
				var item = module.exports.getObjectFromLines(lines);
				if (item !== null ){
					objects = [];
					while(item !== null){
						objects.push(item);
						item = module.exports.getObjectFromLines(lines);	
					}
				}
				if (objects === undefined){
					if  (callbackError !== undefined){
							callbackError("Error extracting data from ipconfig!");
					}
				} else {
					callback(objects);
				}
			}
		});
};


module.exports.printWindowsIpConfig = function printWindowsIpConfig(output){
			output.forEach(function(item){
				var key = Object.keys(item)[0];
				console.log(key);
				var keys = Object.keys(item[key]);
				keys.forEach(function(subkey) {
					console.log("\t"+subkey+ '\t : \t' + item[key][subkey]);
				}, this);
			});
};
