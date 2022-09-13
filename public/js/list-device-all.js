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
/*client javascript file for the list-device page*/
var SERVER;

function setDevicelistValues(deviceList) {

    deviceList.forEach(device => {
        doQuery(device.id)
            .then(id => {
                var $elm = $(`#${id}`);
                $elm.removeClass('dead').addClass('live');
                // $elm.html(`<a href="${SERVER}/devices/run/${id}"></a>`);
                $elm.click(function() {
                    var id = $(this).attr("id");
                    // location.href = `/devices/run/${id}`;
                    window.open(`/devices/run/${id}`);
                });
            })
            .catch(id => {
                $(`#${id}`).removeClass('live').addClass('dead');
                $($elm).attr("onclick", "").unbind("click");
            })
    });
}

function doQuery(deviceId) {
    var thatId = deviceId;
    var timeout = allDevices.length * 1000;
    if (timeout > 30000) { timeout = 30000 };
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${SERVER}/devices/started/${deviceId}`,
            type: 'GET',
            success: function(data) {
                resolve(thatId)
            },
            error: function(error) {
                reject(thatId)
            },
            timeout: timeout
        })
    })
}



$(function() {
    SERVER = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    setDevicelistValues(allDevices)
});