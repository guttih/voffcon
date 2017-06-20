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

var SERVER;
var chartData;
function getDeviceLogs(){
	var url = SERVER+'/logs/list/'+device.id;
		var request = $.get(url);
	request.done(function( data ) {
		setDeviceLogsToChart(data);
		}).fail(function( data ) {
			if (data.status===401){
				showModal("You need to be logged in!", data.responseText);
			}
		});
}



////////////////////////////////////////////////// STARTOF CHART /////////////////////////////////////////////////////////
function getColor(i) {
    switch (i) {
        case 0:
            return "red";
        case 1:
            return "green";
        case 2:
            return "blue";
        case 3:
            return "cyan";
        case 4:
            return "purple";
        case 5:
            return "pink";
        case 6:
            return "orange";
        case 7:
            return "brown";
        case 8:
            return "gray";
        case 9:
            return "chartreuse";
        case 10:
            return "burlywood";
        case 11:
            return "#c4aca2";
        case 12:
            return "#b0b249";
        case 13:
            return "#301e17";
		case 14:
            return "maroon";
		case 15:
            return "#4a6b69";
    }
    return "black";
}

function InitChart(dataIn, yScaleMax) {
	document.getElementById("visualisation").innerHTML = "";
    var YscaleMax;
    yScaleMax === undefined ? (YscaleMax = 215) : (YscaleMax = yScaleMax);

    var minMax = getMinMax(dataIn);
    var iso = d3.time.format.utc("%Y-%m-%d %H:%M:%S");
    var vis = d3.select("#visualisation"),
        WIDTH = 1000,
        HEIGHT = 500,
        MARGINS = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        },
        xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]);
    xScale.domain([minMax.minDate, minMax.maxDate]);

    (yScale = d3.scale
        .linear()
        .range([HEIGHT - MARGINS.top, MARGINS.bottom])
        .domain([0, minMax.maxVal])), (xAxis = d3.svg
        .axis()
        .scale(xScale)), (yAxis = d3.svg.axis().scale(yScale).orient("left"));
    xAxis.tickFormat(function(d) {
        return iso(new Date(d));
    });
    vis
        .append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
        .call(xAxis);
    /*vis
        .append("svg:g")
        .attr("class", "xaxis") // give it a class so it can be used to select only xaxis labels  below
        .attr("transform", "translate(0," + (HEIGHT - 120) + ")")
        .call(xAxis);*/
    vis
        .append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + MARGINS.left + ",0)")
        .call(yAxis);

    var lineGen = d3.svg
        .line()
        .x(function(d) {
            return xScale(d.datetime);
        })
        .y(function(d) {
            return yScale(d.val);
        })
        //.interpolate("linear");
        // .interpolate("cardinal");
        .interpolate("monotone");

    var tip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([-7, 0])
        .html(function(d) {
            return (
                '<span class="tip-key">Name</span><span class="tip-value">' +
                d.name +
                "</span><br>" +
                '<span class="tip-key">Date</span><span class="tip-value">' +
                iso(new Date(d.datetime)) +
                "</span><br>" +
                '<span class="tip-key">Pin</span><span class="tip-value">' +
                d.pin +
                "</span><br>" +
                '<span class="tip-key">Value</span><span class="tip-value">' +
                d.val +
                "</span><br>"
            );
        });

    vis.call(tip);

    //adding the lines
    var keys = Object.keys(dataIn);
    var color = d3.scale.category20();
    keys.forEach(function logArrayElements(key, i) {
		if (!dataIn[key].hideKey){
			vis
				.append("svg:path")
				.attr("d", lineGen(dataIn[key]))
				.attr("stroke", getColor(i))
				.attr("stroke-width", 2)
				.attr("fill", "none");
			vis
				.selectAll("dot")
				.data(dataIn[key])
				.enter()
				.append("circle")
				.attr("stroke", "white")
				.attr("fill", getColor(i))
				.attr("r", 4)
				.attr("cx", function(d, i) {
					return xScale(d.datetime);
				})
				.attr("cy", function(d, i) {
					return yScale(d.val);
				})
				.on("mouseover", tip.show)
				.on("mouseout", tip.hide);
		}
    });
	addLegend(keys);
}
var hideAllLines = false;
function toggleLegend(){
	var keys = Object.keys(chartData);
	hideAllLines = !hideAllLines;
	keys.forEach(function(key, index){
		chartData[key].hideKey = hideAllLines;
	});
	InitChart(chartData);
}
function addLegend(keys){

	var LEGENTSTROKEWIDTH = "3",
		LEGENTSTROKE_ON = 'gray',
		LEGENTSTROKE_OFF = 'white',
		posX = 45,
		allPosX = posX-45,
		posY = 10,
		width = 15,
		height = 15;
	var leg = d3.select("#legend");

	var strokeColor = (hideAllLines === true)?LEGENTSTROKE_OFF:LEGENTSTROKE_ON;
		leg.append("rect")
			.attr("x", (allPosX))
			.attr("y", posY)
			.attr("width", width)
			.attr("height", height)
			.attr("stroke", strokeColor)
			.attr("stroke-width", LEGENTSTROKEWIDTH)
			.attr("fill", 'yellow')
			.on("click", function(){
				toggleLegend();
			});

			leg.append("text")
			.attr("x", (allPosX + 18))
			.attr("y", posY+3)
			.attr("dy", "10px")
			.text(function(d) { return "All"; });








	keys.forEach(function(key, index){
		var strokeColor = (chartData[key].hideKey === true)?LEGENTSTROKE_OFF:LEGENTSTROKE_ON;
		leg.append("rect")
			.attr("x", (posX+(index*50)))
			.attr("y", posY)
			.attr("width", width)
			.attr("data-key", key)
			.attr("height", height)
			.attr("stroke", strokeColor)
			.attr("stroke-width", LEGENTSTROKEWIDTH)
			.attr("fill", getColor(index))
			.on("click", function(){
				var dataKey = this.getAttribute('data-key');
				if (!chartData[dataKey].hideKey){
					//hide line
					chartData[dataKey].hideKey = true;
					this.setAttribute("stroke", LEGENTSTROKE_OFF);
				} else {
					//show line
					chartData[dataKey].hideKey = false;
					this.setAttribute("stroke", LEGENTSTROKE_ON);
				}
				InitChart(chartData);
			});
			leg.append("text")
			.attr("x", (posX + 18 + (index*50)))
			.attr("y", posY+3)
			.attr("dy", "10px")
			.text(function(d) { return key; });
	});
	
}

//converst logs object to a chartPinObject which will allow d3 to draw a chart for all pin values.
function logsToChartPins(logs) {
    var i, x, pins;
    var ret = {};
    for (i = 0; i < logs.length; i++) {
        log = logs[i];
        for (x = 0; x < log.pins.length; x++) {
            if (ret[log.pins[x].name] === undefined) {
                ret[log.pins[x].name] = [];
            }
            ret[log.pins[x].name].push({
                datetime: log.datetime,
                pin: log.pins[x].pin,
                val: log.pins[x].val,
                name: log.pins[x].name
            });
        }
    }
    return ret;
}

function getMinMax(dataIn) {
    var now = new Date();
    var tmp = {};
    var keys = Object.keys(dataIn);
    keys.forEach(function logArrayElements(element) {
        var pin = dataIn[element];
        var len = pin.length;
        for (x = 0; x < len; x++) {
            if (tmp.minDate === undefined) {
                tmp.minDate = tmp.maxDate = pin[x].datetime;
                tmp.minVal = tmp.maxVal = pin[x].val;
            } else if (dataIn[element][x].datetime < tmp.minDate) {
                tmp.minDate = dataIn[element][x].datetime;
            } else if (dataIn[element][x].datetime > tmp.maxDate) {
                tmp.maxDate = dataIn[element][x].datetime;
            }

            if (dataIn[element][x].val < tmp.minVal) {
                tmp.minVal = dataIn[element][x].val;
            } else if (dataIn[element][x].val > tmp.maxVal) {
                tmp.maxVal = dataIn[element][x].val;
            }
        }
    });
    return {
        minVal: tmp.minVal,
        maxVal: tmp.maxVal,
        minDate: tmp.minDate,
        maxDate: tmp.maxDate
    };
}
//////////////////////////////////////////////////  ENDOF CHART /////////////////////////////////////////////////////////

function getPinIndexByName(strName, pins){
	for(var i = 0; i<pins.length; i++){
		if (strName === pins[i].name){
			return i;
		}
	}
	return -1;
}

function modeToTypeString(mode) {
	switch(mode){
		case 0: return "INPUT_ANALOG";
		case 1: return "INPUT_DIGITAL";
		case 2: return "OUTPUT_ANALOG";
		case 3: return "OUTPUT_DIGITAL";
	}
	return "?";
};

function pinsToTd(headers, pins){
	var index;
	var str = "";
	for(var i = 0; i<headers.length; i++) {
		index = getPinIndexByName(headers[i], pins);
		if (index > -1) {
			str+='<td class="pin-type-'+pins[index].m+'" rel="tooltip" title="Pin number: '+ pins[index].pin +' , pin type: '+ modeToTypeString(pins[index].m) +'">' + pins[index].val;
			str+='</td>';
		} else {
			str+='<td></td>';
		}
	}
	return str;
}

function monthToShortStr(month){
	switch(month){
		case 0: return "jan";
		case 1: return "feb";
		case 2: return "mar";
		case 3: return "apr";
		case 4: return "may";
		case 5: return "jun";
		case 6: return "jul";
		case 7: return "aug";
		case 8: return "sep";
		case 9: return "oct";
		case 10: return "nov";
		case 11: return "dec";
	}
	return "";
};

function addToTable(headers, logs){
	var i;
	var $elm = $('#table-log thead');
	var row = '<tr>';
	
	//	adding header
	row+='<td>Time</td>';
	for(i = 0; i<headers.length; i++){
		row+='<td>'+ headers[i] + '</td>';
	}
	row+='</tr>';
	$elm.append(row);

	//now add data
	$elm = $('#table-log tbody');
	for(i = 0; i<logs.length; i++){
		row='<tr id="'+ logs[i].id +'">';
		row+='<td class="datetime-td">' + 
		' <a href="javascript:deleteLogItem(\''+ logs[i].id +'\');"><span class="glyphicon glyphicon glyphicon-remove" rel="tooltip" title="Delete this log record" style="color:red" aria-hidden="true"></span></a>' +

		'<span>' +
		formaTima(new Date(logs[i].datetime)); +'</span></td>';
		row+=pinsToTd(headers, logs[i].pins);
		row+='</tr>';
		$elm.append(row);
	}
	$elm = $('#table-log tfoot');
	row='<tr>';
	row+='<td>Records</td>'
	row+='<td id="record-count" colspan="' + (headers.length) + '">'+logs.length+'</td>';
	row+="</tr>";
	$elm.append(row);
	


}

function setDeviceLogsToChart(deviceLogs){
	var logs = [];
	var headers = [];
	for(var i = 0; i < deviceLogs.length; i++){
		logs.push({
			id:deviceLogs[i]._id,
			datetime:new Date(deviceLogs[i].datetime),
			pins: JSON.parse(deviceLogs[i].data)
		});
		
		// add headers
		var head;
		for(var x = 0; x<logs[i].pins.length; x++){
			head = logs[i].pins[x].name;
			if (headers.indexOf(head) < 0){
				headers.push(head);
			}
		}
	};
	//addToTable(headers, logs);

	chartData = logsToChartPins(logs);
	InitChart(chartData);
}

function deleteLogItem(logItemID){
	var sendObj = {
			"id":logItemID
		};

	var url = SERVER+'/logs/'+logItemID;
		var deleting = $.delete( url, sendObj);

		deleting.done(function(data){
			if (data.id !== undefined) {
				$( "#"+data.id ).remove();
				var elCount = $("#record-count");
				var number =  Number(elCount.text());
				if (isNaN(number) || number < 1){
					number = 0;
				} else {
					number--;
				}
				elCount.text(number);
			}
		});
}

$(function () {  
	/* this is the *$( document ).ready(function( $ ) but jshint does not like that*/
	SERVER = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
	getDeviceLogs();
});
