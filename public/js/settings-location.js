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

var	SERVER;

///////////////    Start of ---  Calculate Sunrise, Solar noon and Sunset  ///////////////

function calcSolNoon(jd, longitude, timezone, dst)
{
	var tnoon = calcTimeJulianCent(jd - longitude/360.0);
	var eqTime = calcEquationOfTime(tnoon);
	var solNoonOffset = 720.0 - (longitude * 4) - eqTime; // in minutes
	var newt = calcTimeJulianCent(jd + solNoonOffset/1440.0);
	eqTime = calcEquationOfTime(newt);
	solNoonLocal = 720 - (longitude * 4) - eqTime + (timezone*60.0);// in minutes
	if(dst) solNoonLocal += 60.0;
	while (solNoonLocal < 0.0) {
		solNoonLocal += 1440.0;
	}
	while (solNoonLocal >= 1440.0) {
		solNoonLocal -= 1440.0;
	}
	return minutesToTime(solNoonLocal, 3);
	//document.getElementById("noonbox").value = timeString(solNoonLocal, 3)
}

function zeroPad(n, digits) {
	n = n.toString();
	while (n.length < digits) {
	n = '0' + n;
	}
	return n;
}

function timeDateString(JD, minutes)
{
	var output = timeString(minutes, 2) + " " + dayString(JD, 0, 2);
	return output;
}
	

function minutesToTime(minutes, flag)
// timeString returns a zero-padded string (HH:MM:SS) given time in minutes
// flag=2 for HH:MM, 3 for HH:MM:SS
{
	var output;
	if ( (minutes >= 0) && (minutes < 1440) ) {
		var floatHour = minutes / 60.0;
		var hour = Math.floor(floatHour);
		var floatMinute = 60.0 * (floatHour - Math.floor(floatHour));
		var minute = Math.floor(floatMinute);
		var floatSec = 60.0 * (floatMinute - Math.floor(floatMinute));
		var second = Math.floor(floatSec + 0.5);
		if (second > 59) {
			second = 0;
			minute += 1;
		}
		if ((flag == 2) && (second >= 30)) minute++;
		if (minute > 59) {
			minute = 0;
			hour += 1;
		}
		output = {
			hour: hour,
			minute: minute,
			second: second,
			flag: flag
		};
	} 
	return output;
}

function timeString(minutes, flag){
	return timeValuesToString(minutesToTime(minutes, flag));
}

function timeValuesToString(timeValues, flag){
	if (timeString === undefined) {
		return '';
	}
	if (flag === undefined) {
		flag = timeValues.flag;
	}
	var output = zeroPad(timeValues.hour,2) + ":" + zeroPad(timeValues.minute,2);
	if (flag > 2) {
		output = output + ":" + zeroPad(timeValues.second,2);
	}
	return output;
}

function isNumber(inputVal) 
{
	var oneDecimal = false;
	var inputStr = "" + inputVal;
	for (var i = 0; i < inputStr.length; i++) 
	{
	var oneChar = inputStr.charAt(i);
	if (i == 0 && (oneChar == "-" || oneChar == "+"))
	{
		continue;
	}
	if (oneChar == "." && !oneDecimal) 
	{
		oneDecimal = true;
		continue;
	}
	if (oneChar < "0" || oneChar > "9")
	{
		return false;
	}
	}
	return true;
}

function calcHourAngleSunrise(lat, solarDec)
{
	var latRad = degToRad(lat);
	var sdRad  = degToRad(solarDec);
	var HAarg = (Math.cos(degToRad(90.833))/(Math.cos(latRad)*Math.cos(sdRad))-Math.tan(latRad) * Math.tan(sdRad));
	var HA = Math.acos(HAarg);
	return HA;		// in radians (for sunset, use -HA)
}

function calcSunriseSet(rise, JD, latitude, longitude, timezone, dst)
	// rise = 1 for sunrise, 0 for sunset
{
	var ret;
	
	var timeUTC = calcSunriseSetUTC(rise, JD, latitude, longitude);
	var newTimeUTC = calcSunriseSetUTC(rise, JD + timeUTC/1440.0, latitude, longitude); 
	if (isNumber(newTimeUTC)) {
		var timeLocal = newTimeUTC + (timezone * 60.0);
		timeLocal += ((dst) ? 60.0 : 0.0);
		if ( (timeLocal >= 0.0) && (timeLocal < 1440.0) ) {
			ret = minutesToTime(timeLocal,2);
		} else  {
			var jday = JD;
			var increment = ((timeLocal < 0) ? 1 : -1);
			while ((timeLocal < 0.0)||(timeLocal >= 1440.0)) {
				timeLocal += increment * 1440.0;
				jday -= increment;
			}
			ret = minutesToTime(jday,timeLocal);
		}
	} else { // no sunrise/set found
		var doy = calcDoyFromJD(JD);
		if ( ((latitude > 66.4) && (doy > 79) && (doy < 267)) || ((latitude < -66.4) && ((doy < 83) || (doy > 263))) ) {
			//previous sunrise/next sunset
			if (rise) { // find previous sunrise
				jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone, dst);
			} else { // find next sunset
				jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone, dst);
			}
			ret = dayString(jdy,0,3);
			
		} else {   //previous sunset/next sunrise
			if (rise == 1) { // find previous sunrise
				jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone, dst);
			} else { // find next sunset
				jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone, dst);
			}
			ret = dayString(jdy,0,3);
		}
	}
	return ret;
}

function calcSunriseSetUTC(rise, JD, latitude, longitude)
{
	var t = calcTimeJulianCent(JD);
	var eqTime = calcEquationOfTime(t);
	var solarDec = calcSunDeclination(t);
	var hourAngle = calcHourAngleSunrise(latitude, solarDec);
	//alert("HA = " + radToDeg(hourAngle));
	if (!rise) hourAngle = -hourAngle;
	var delta = longitude + radToDeg(hourAngle);
	var timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes
	return timeUTC;
}

function calcSunTrueAnomaly(t)
{
	var m = calcGeomMeanAnomalySun(t);
	var c = calcSunEqOfCenter(t);
	var v = m + c;
	return v;		// in degrees
}

function calcSunEqOfCenter(t)
{
	var m = calcGeomMeanAnomalySun(t);
	var mrad = degToRad(m);
	var sinm = Math.sin(mrad);
	var sin2m = Math.sin(mrad+mrad);
	var sin3m = Math.sin(mrad+mrad+mrad);
	var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
	return C;		// in degrees
}

function calcSunTrueLong(t)
{
	var l0 = calcGeomMeanLongSun(t);
	var c = calcSunEqOfCenter(t);
	var O = l0 + c;
	return O;		// in degrees
}

function calcSunApparentLong(t)
{
	var o = calcSunTrueLong(t);
	var omega = 125.04 - 1934.136 * t;
	var lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
	return lambda;		// in degrees
}

function calcGeomMeanAnomalySun(t)
{
	var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
	return M;		// in degrees
}

function calcEccentricityEarthOrbit(t)
{
	var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
	return e;		// unitless
}

function calcGeomMeanLongSun(t)
{
	var L0 = 280.46646 + t * (36000.76983 + t*(0.0003032));
	while(L0 > 360.0) {
		L0 -= 360.0;
	}
	while(L0 < 0.0) {
		L0 += 360.0;
	}
	return L0;		// in degrees
}


function radToDeg(angleRad) 
{
	return (180.0 * angleRad / Math.PI);
}

function degToRad(angleDeg) 
{
	return (Math.PI * angleDeg / 180.0);
}

function calcMeanObliquityOfEcliptic(t)
{
	var seconds = 21.448 - t*(46.8150 + t*(0.00059 - t*(0.001813)));
	var e0 = 23.0 + (26.0 + (seconds/60.0))/60.0;
	return e0;		// in degrees
}

function calcObliquityCorrection(t)
{
	var e0 = calcMeanObliquityOfEcliptic(t);
	var omega = 125.04 - 1934.136 * t;
	var e = e0 + 0.00256 * Math.cos(degToRad(omega));
	return e;		// in degrees
}

function calcSunRadVector(t)
{
	var v = calcSunTrueAnomaly(t);
	var e = calcEccentricityEarthOrbit(t);
	var R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(degToRad(v)));
	return R;		// in AUs
}

function calcSunDeclination(t)
{
	var e = calcObliquityCorrection(t);
	var lambda = calcSunApparentLong(t);

	var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
	var theta = radToDeg(Math.asin(sint));
	return theta;		// in degrees
}

function calcEquationOfTime(t)
{
	var epsilon = calcObliquityCorrection(t);
	var l0 = calcGeomMeanLongSun(t);
	var e = calcEccentricityEarthOrbit(t);
	var m = calcGeomMeanAnomalySun(t);

	var y = Math.tan(degToRad(epsilon)/2.0);
	y *= y;

	var sin2l0 = Math.sin(2.0 * degToRad(l0));
	var sinm   = Math.sin(degToRad(m));
	var cos2l0 = Math.cos(2.0 * degToRad(l0));
	var sin4l0 = Math.sin(4.0 * degToRad(l0));
	var sin2m  = Math.sin(2.0 * degToRad(m));

	var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
	return radToDeg(Etime)*4.0;	// in minutes of time
}

function calcAzEl(output, T, localtime, latitude, longitude, zone)
{
	var eqTime = calcEquationOfTime(T);
	var theta  = calcSunDeclination(T);
	

	//todo: I do not need this
	var resultOutput = {
		EquationOfTime: value = Math.floor(eqTime*100 +0.5)/100.0,
		SolarDeclination:value = Math.floor(theta*100+0.5)/100.0
	};
	var solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone;
	var earthRadVec = calcSunRadVector(T);
	var trueSolarTime = localtime + solarTimeFix;
	while (trueSolarTime > 1440) {
		trueSolarTime -= 1440;
	}
	var hourAngle = trueSolarTime / 4.0 - 180.0;
	if (hourAngle < -180) {
		hourAngle += 360.0;
	}
	var haRad = degToRad(hourAngle);
	var csz = Math.sin(degToRad(latitude)) * Math.sin(degToRad(theta)) + Math.cos(degToRad(latitude)) * Math.cos(degToRad(theta)) * Math.cos(haRad);
	if (csz > 1.0) {
		csz = 1.0;
	} else if (csz < -1.0) { 
		csz = -1.0;
	}
	var zenith = radToDeg(Math.acos(csz));
	var azDenom = ( Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith)) );
	var azimuth;
	if (Math.abs(azDenom) > 0.001) {
		azRad = (( Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith)) ) - Math.sin(degToRad(theta))) / azDenom;
		if (Math.abs(azRad) > 1.0) {
			if (azRad < 0) {
				azRad = -1.0;
			} else {
				azRad = 1.0;
			}
		}
		azimuth = 180.0 - radToDeg(Math.acos(azRad));
		if (hourAngle > 0.0) {
			azimuth = -azimuth;
		} 
	} else {
		if (latitude > 0.0) {
			azimuth = 180.0;
		} else { 
			azimuth = 0.0;
		}
	}
	if (azimuth < 0.0) {
		azimuth += 360.0;
	}
	var exoatmElevation = 90.0 - zenith;

// Atmospheric Refraction correction
var refractionCorrection;
	if (exoatmElevation > 85.0) {
		refractionCorrection = 0.0;
	} else {
		var te = Math.tan (degToRad(exoatmElevation));
		if (exoatmElevation > 5.0) {
			refractionCorrection = 58.1 / te - 0.07 / (te*te*te) + 0.000086 / (te*te*te*te*te);
		} else if (exoatmElevation > -0.575) {
			refractionCorrection = 1735.0 + exoatmElevation * (-518.2 + exoatmElevation * (103.4 + exoatmElevation * (-12.79 + exoatmElevation * 0.711) ) );
		} else {
			refractionCorrection = -20.774 / te;
		}
		refractionCorrection = refractionCorrection / 3600.0;
	}

	var solarZen = zenith - refractionCorrection;

	if ((output) && (solarZen > 108.0) ) {
		resultOutput.azbox="dark";
		resultOutput.elbox= "dark";
	} else if (output) {
		resultOutput.azbox = Math.floor(azimuth*100 +0.5)/100.0;
		resultOutput.elbox = Math.floor((90.0-solarZen)*100+0.5)/100.0;
	}
	return (azimuth);
}

function calcTimeJulianCent(jd)
{
	var T = (jd - 2451545.0)/36525.0;
	return T;
}

function getTimeLocal(date)
{
	var dochr = date.getHours();
	var docmn = date.getMinutes();
	var docsc = date.getSeconds();
	var mins = dochr * 60 + docmn + docsc/60.0;
	return mins;

}

function getJD(date)
{
	console.log("  function getJD(date)");
	var docmonth = date.getMonth() + 1;
	var docday =   date.getDate();
	var docyear =  date.getFullYear();
	var A = Math.floor(docyear/100);
	var B = 2 - A + Math.floor(A/4);
	var JD = Math.floor(365.25*(docyear + 4716)) + Math.floor(30.6001*(docmonth+1)) + docday + B - 1524.5;
	return JD;
}
function calculateSun(latitude, longitude, date, timeZone, dayLightSavings) {
	if (isNaN(latitude) || isNaN(longitude) || Object.prototype.toString.call(date) !== '[object Date]') {
		return;
	}
	var jday = getJD(date);
	var tl = getTimeLocal(date);
	var tz = timeZone;
	var dst = dayLightSavings;
	var total = jday + tl/1440.0 - tz/24.0;
	var T = calcTimeJulianCent(total);
	var lat = parseFloat(latitude);
	var lng = parseFloat(longitude);
	calcAzEl(1, T, tl, lat, lng, tz);
	
	return {
		sunrise: calcSunriseSet(1, jday, lat, lng, tz, dst),
		solarNoon: calcSolNoon(jday, lng, tz, dst),
		sunset : calcSunriseSet(0, jday, lat, lng, tz, dst)
		
	};
}

///////////////    End   of ---  Calculate Sunrise, Solar noon and Sunset  ///////////////

function onSunRiseInputChange(){
	var values = {
		lat  : Number($('#latitude').val()),
		long : Number($('#longitude').val()),
		date : $('#datepicker1').datepicker('getDate')
	};
	console.log(values);
	var ret = calculateSun(values.lat, values.long, values.date, 0, false);
	if (ret === undefined) {
		$('#sunrise'   ).text('');
		$('#solar-noon').text('');
		$('#sunset'    ).text('');
		return;
	}
	$('#sunrise'   ).text(timeValuesToString(ret.sunrise,3));
	$('#solar-noon').text(timeValuesToString(ret.solarNoon,3));
	$('#sunset'    ).text(timeValuesToString(ret.sunset,3));


	console.log(ret);
	

}

function setPositionToInputs(position) {
	$('#latitude').val(position.coords.latitude);
	$('#longitude').val(position.coords.longitude);
	console.log(position.coords.latitude);
	console.log(position.coords.longitude);
	onSunRiseInputChange();
}


function showError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED    :   alert('Error: User denied the request for Geolocation.');    break;
		case error.POSITION_UNAVAILABLE :   alert('Error: Location information is unavailable.');        break;
		case error.TIMEOUT              :   alert('Error: The request to get user location timed out.'); break;
		case error.UNKNOWN_ERROR        :   alert('Error: An unknown error occurred.');                  break;
	}
}


function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(setPositionToInputs, showError);
	} else { 
		alert('Geolocation is not supported by this browser.');
	}
}

function saveLocation(){

		var sendObj = {
						latitude : $('#latitude').val(),
						longitude: $('#longitude').val()
			};
			var posting = $.post( 'settings-location', sendObj);
		posting
			.done(function(data){
				console.log(data);
				showModal("Successfully saved", "Server location has been saved.");
			})
			.fail(function(data){
				console.log("Error saving ");
				console.log(data);
				showModalErrorText('Not saved', 'There was an error saving the server location');
			});
	
}



function hideMyLocationButtonIfNotSupported() {

	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	var isOpera = (navigator.userAgent.indexOf("Opera") > -1 || navigator.userAgent.indexOf("OPR") > -1) ;
	if (isChrome === true && !isOpera) {
		if (location.protocol !== 'https:') {
			console.log('Hide geoLocation button because chrome does not support geoLocation if protocol is not https');
		} else {
			$('.hidden-if-not-https').removeClass('hidden-if-not-https'); // chrome and protocol is https so chrome supports	
		}
	} else {
		console.log('make location button visible');
		$('.hidden-if-not-https').removeClass('hidden-if-not-https');
	}
}

function init(){
	console.log('init()');
	console.log(geoLocation);
	$('#latitude').val(geoLocation.latitude);
	$('#longitude').val(geoLocation.longitude);

	$('#latitude,#longitude,#datepicker1').on('change keyup', function(){
		onSunRiseInputChange();
	});


	hideMyLocationButtonIfNotSupported();
	$('#button-location').on('click tap', function(){
		getLocation();
	});
	$('#button-save').on('click tap', function(){
		saveLocation();
	});

	onSunRiseInputChange();
}

$(function () {  
	init();//when script loads this runs.
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
});
