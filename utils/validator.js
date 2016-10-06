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
// A validator for the Mooshak API,


//"use strict";
const fs = require('fs');

// Returns true if file exists otherwise it returns false.
function fileExists(filePath){
	try
	{
		return fs.statSync(filePath).isFile();
	}
	catch (err)
	{
		return false;
	}
}

// Returns true if a path exits and it is a directory.
function dirExists(path) {   
	var ret = false;
	try {
		ret = fs.lstatSync(path).isDirectory();
		return ret;
	} catch (e) {		
		return false;
	}
}

// Returns true if all parameters checkout otherwise false.
function validateParameters(arrParams) {
	if(typeof arrParams !== "object") {
		return false;
	}
	for(var i = 0; i < arrParams.length; i++){
		var testSubject = arrParams[i];
		if(testSubject === null) {
			return false;
		} 
		if(testSubject === "") {
			return false;
		}
	}
	return true;
}

module.exports = {
	fileExists: fileExists,
	dirExists: dirExists,
	validateParameters: validateParameters
};
