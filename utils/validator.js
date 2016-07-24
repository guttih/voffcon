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
	return true;
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