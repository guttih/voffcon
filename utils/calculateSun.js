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

/**
 * Calculates sunrise, solar noon and sunset from a given location and date 
 *
 * @param {Number}   latitude        - Latitude part of the location
 * @param {Number}   longitude       - Longitude part of the location
 * @param {Date}     date            - Only the date part is used, time is ignored.
 * @param {Number}   timeZone        - Which timezone to use see: https://en.wikipedia.org/wiki/Time_zone
 * @param {Boolean}  dayLightSavings - Should daylight savings be used? https://en.wikipedia.org/wiki/Daylight_saving_time
 * 
 * @returns {Object} - A object with three keys: sunrise, solarNoon and sunset. Each value has three keys: hour, minute, second
 */
module.exports.calculateSun = function calculateSun(latitude, longitude, date, timeZone, dayLightSavings) {
	if (isNaN(latitude) || isNaN(longitude) || Object.prototype.toString.call(date) !== '[object Date]') {
		return;
	}
	var jday = module.getJD(date);
	var tl = module.getTimeLocal(date);
	var tz = timeZone;
	var dst = dayLightSavings;
	var total = jday + tl/1440.0 - tz/24.0;
	var T = module.calcTimeJulianCent(total);
	var lat = parseFloat(latitude);
	var lng = parseFloat(longitude);
	module.calcAzEl(1, T, tl, lat, lng, tz);
	
	return {
		sunrise: module.calcSunriseSet(1, jday, lat, lng, tz, dst),
		solarNoon: module.calcSolNoon(jday, lng, tz, dst),
		sunset : module.calcSunriseSet(0, jday, lat, lng, tz, dst)
	};
};

/**
 * Returns a time string
 *
 * @param {Object} timeValues - the time object {hour, minute, second}
 * @param {Number} flag - if flag > 2 then seconds are added to the time string
 * @returns {string} on the format "00:00" or "00:00:00"
 */
module.exports.timeValuesToString = function timeValuesToString(timeValues, flag){
	if (timeValues === undefined) {
		return '';
	}
	if (flag === undefined) {
		flag = timeValues.flag;
	}
	var output = module.zeroPad(timeValues.hour,2) + ":" + module.zeroPad(timeValues.minute,2);
	if (flag > 2) {
		output = output + ":" + module.zeroPad(timeValues.second,2);
	}
	return output;
};

module.calcSolNoon = function calcSolNoon(jd, longitude, timezone, dst)
{
	var tnoon = module.calcTimeJulianCent(jd - longitude/360.0);
	var eqTime = module.calcEquationOfTime(tnoon);
	var solNoonOffset = 720.0 - (longitude * 4) - eqTime; // in minutes
	var newt = module.calcTimeJulianCent(jd + solNoonOffset/1440.0);
	eqTime = module.calcEquationOfTime(newt);
	solNoonLocal = 720 - (longitude * 4) - eqTime + (timezone*60.0); // in minutes
	if(dst) solNoonLocal += 60.0;
	while (solNoonLocal < 0.0) {
		solNoonLocal += 1440.0;
	}
	while (solNoonLocal >= 1440.0) {
		solNoonLocal -= 1440.0;
	}
	return module.minutesToTime(solNoonLocal, 3);
};

module.zeroPad = function zeroPad(n, digits) {
	n = n.toString();
	while (n.length < digits) {
	n = '0' + n;
	}
	return n;
};

module.timeDateString = function timeDateString(JD, minutes)
{
	var output = timeString(minutes, 2) + " " + dayString(JD, 0, 2);
	return output;
};
	

module.minutesToTime = function minutesToTime(minutes, flag)
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
};

module.timeString = function timeString(minutes, flag){
	return module.export.timeValuesToString(module.minutesToTime(minutes, flag));
};



module.isNumber = function isNumber(inputVal) 
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
};

module.calcHourAngleSunrise = function calcHourAngleSunrise(lat, solarDec)
{
	var latRad = module.degToRad(lat);
	var sdRad  = module.degToRad(solarDec);
	var HAarg = (Math.cos(module.degToRad(90.833))/(Math.cos(latRad)*Math.cos(sdRad))-Math.tan(latRad) * Math.tan(sdRad));
	var HA = Math.acos(HAarg);
	return HA;		// in radians (for sunset, use -HA)
};

module.calcSunriseSet = function calcSunriseSet(rise, JD, latitude, longitude, timezone, dst)
	// rise = 1 for sunrise, 0 for sunset
{
	var ret;
	
	var timeUTC = module.calcSunriseSetUTC(rise, JD, latitude, longitude);
	var newTimeUTC = module.calcSunriseSetUTC(rise, JD + timeUTC/1440.0, latitude, longitude); 
	if (module.isNumber(newTimeUTC)) {
		var timeLocal = newTimeUTC + (timezone * 60.0);
		timeLocal += ((dst) ? 60.0 : 0.0);
		if ( (timeLocal >= 0.0) && (timeLocal < 1440.0) ) {
			ret = module.minutesToTime(timeLocal,2);
		} else  {
			var jday = JD;
			var increment = ((timeLocal < 0) ? 1 : -1);
			while ((timeLocal < 0.0)||(timeLocal >= 1440.0)) {
				timeLocal += increment * 1440.0;
				jday -= increment;
			}
			ret = module.minutesToTime(jday,timeLocal);
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
};

module.calcSunriseSetUTC = function calcSunriseSetUTC(rise, JD, latitude, longitude)
{
	var t = module.calcTimeJulianCent(JD);
	var eqTime = module.calcEquationOfTime(t);
	var solarDec = module.calcSunDeclination(t);
	var hourAngle = module.calcHourAngleSunrise(latitude, solarDec);
	if (!rise) hourAngle = -hourAngle;
	var delta = longitude + module.radToDeg(hourAngle);
	var timeUTC = 720 - (4.0 * delta) - eqTime;	// in minutes
	return timeUTC;
};

module.calcSunTrueAnomaly = function calcSunTrueAnomaly(t)
{
	var m = module.calcGeomMeanAnomalySun(t);
	var c = module.calcSunEqOfCenter(t);
	var v = m + c;
	return v;		// in degrees
};

module.calcSunEqOfCenter = function calcSunEqOfCenter(t)
{
	var m = module.calcGeomMeanAnomalySun(t);
	var mrad = module.degToRad(m);
	var sinm = Math.sin(mrad);
	var sin2m = Math.sin(mrad+mrad);
	var sin3m = Math.sin(mrad+mrad+mrad);
	var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
	return C;		// in degrees
};

module.calcSunTrueLong = function calcSunTrueLong(t)
{
	var l0 = module.calcGeomMeanLongSun(t);
	var c = module.calcSunEqOfCenter(t);
	var O = l0 + c;
	return O;		// in degrees
};

module.calcSunApparentLong = function calcSunApparentLong(t)
{
	var o = module.calcSunTrueLong(t);
	var omega = 125.04 - 1934.136 * t;
	var lambda = o - 0.00569 - 0.00478 * Math.sin(module.degToRad(omega));
	return lambda;		// in degrees
};

module.calcGeomMeanAnomalySun = function calcGeomMeanAnomalySun(t)
{
	var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
	return M;		// in degrees
};

module.calcEccentricityEarthOrbit = function calcEccentricityEarthOrbit(t)
{
	var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
	return e;		// unitless
};

module.calcGeomMeanLongSun = function calcGeomMeanLongSun(t)
{
	var L0 = 280.46646 + t * (36000.76983 + t*(0.0003032));
	while(L0 > 360.0) {
		L0 -= 360.0;
	}
	while(L0 < 0.0) {
		L0 += 360.0;
	}
	return L0;		// in degrees
};


module.radToDeg = function radToDeg(angleRad) 
{
	return (180.0 * angleRad / Math.PI);
};

module.degToRad = function degToRad(angleDeg) 
{
	return (Math.PI * angleDeg / 180.0);
};

module.calcMeanObliquityOfEcliptic = function calcMeanObliquityOfEcliptic(t)
{
	var seconds = 21.448 - t*(46.8150 + t*(0.00059 - t*(0.001813)));
	var e0 = 23.0 + (26.0 + (seconds/60.0))/60.0;
	return e0;		// in degrees
};

module.calcObliquityCorrection = function calcObliquityCorrection(t)
{
	var e0 = module.calcMeanObliquityOfEcliptic(t);
	var omega = 125.04 - 1934.136 * t;
	var e = e0 + 0.00256 * Math.cos(module.degToRad(omega));
	return e;		// in degrees
};

module.calcSunRadVector = function calcSunRadVector(t)
{
	var v = module.calcSunTrueAnomaly(t);
	var e = module.calcEccentricityEarthOrbit(t);
	var R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(module.degToRad(v)));
	return R;		// in AUs
};

module.calcSunDeclination = function calcSunDeclination(t)
{
	var e = module.calcObliquityCorrection(t);
	var lambda = module.calcSunApparentLong(t);

	var sint = Math.sin(module.degToRad(e)) * Math.sin(module.degToRad(lambda));
	var theta = module.radToDeg(Math.asin(sint));
	return theta;		// in degrees
};

module.calcEquationOfTime = function calcEquationOfTime(t)
{
	var epsilon = module.calcObliquityCorrection(t);
	var l0 = module.calcGeomMeanLongSun(t);
	var e = module.calcEccentricityEarthOrbit(t);
	var m = module.calcGeomMeanAnomalySun(t);

	var y = Math.tan(module.degToRad(epsilon)/2.0);
	y *= y;

	var sin2l0 = Math.sin(2.0 * module.degToRad(l0));
	var sinm   = Math.sin(module.degToRad(m));
	var cos2l0 = Math.cos(2.0 * module.degToRad(l0));
	var sin4l0 = Math.sin(4.0 * module.degToRad(l0));
	var sin2m  = Math.sin(2.0 * module.degToRad(m));

	var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
	return module.radToDeg(Etime)*4.0;	// in minutes of time
};

module.calcAzEl = function calcAzEl(output, T, localtime, latitude, longitude, zone)
{
	var eqTime = module.calcEquationOfTime(T);
	var theta  = module.calcSunDeclination(T);
	
	//todo: I do not need this
	var resultOutput = {
		EquationOfTime: value = Math.floor(eqTime*100 +0.5)/100.0,
		SolarDeclination:value = Math.floor(theta*100+0.5)/100.0
	};
	var solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone;
	var earthRadVec = module.calcSunRadVector(T);
	var trueSolarTime = localtime + solarTimeFix;
	while (trueSolarTime > 1440) {
		trueSolarTime -= 1440;
	}
	var hourAngle = trueSolarTime / 4.0 - 180.0;
	if (hourAngle < -180) {
		hourAngle += 360.0;
	}
	var haRad = module.degToRad(hourAngle);
	var csz = Math.sin(module.degToRad(latitude)) * Math.sin(module.degToRad(theta)) + Math.cos(module.degToRad(latitude)) * Math.cos(module.degToRad(theta)) * Math.cos(haRad);
	if (csz > 1.0) {
		csz = 1.0;
	} else if (csz < -1.0) { 
		csz = -1.0;
	}
	var zenith = module.radToDeg(Math.acos(csz));
	var azDenom = ( Math.cos(module.degToRad(latitude)) * Math.sin(module.degToRad(zenith)) );
	var azimuth;
	if (Math.abs(azDenom) > 0.001) {
		azRad = (( Math.sin(module.degToRad(latitude)) * Math.cos(module.degToRad(zenith)) ) - Math.sin(module.degToRad(theta))) / azDenom;
		if (Math.abs(azRad) > 1.0) {
			if (azRad < 0) {
				azRad = -1.0;
			} else {
				azRad = 1.0;
			}
		}
		azimuth = 180.0 - module.radToDeg(Math.acos(azRad));
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
		var te = Math.tan (module.degToRad(exoatmElevation));
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
};

module.calcTimeJulianCent = function calcTimeJulianCent(jd)
{
	var T = (jd - 2451545.0)/36525.0;
	return T;
};

module.getTimeLocal = function getTimeLocal(date)
{
	var dochr = date.getHours();
	var docmn = date.getMinutes();
	var docsc = date.getSeconds();
	var mins = dochr * 60 + docmn + docsc/60.0;
	return mins;

};

module.getJD = function getJD(date)
{
	var docmonth = date.getMonth() + 1;
	var docday =   date.getDate();
	var docyear =  date.getFullYear();
	var A = Math.floor(docyear/100);
	var B = 2 - A + Math.floor(A/4);
	var JD = Math.floor(365.25*(docyear + 4716)) + Math.floor(30.6001*(docmonth+1)) + docday + B - 1524.5;
	return JD;
};
