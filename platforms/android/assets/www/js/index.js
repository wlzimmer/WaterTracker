// (c) 2013 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, tempFahrenheit, tempCelsius, closeButton */
/* global rfduino, alert */
'use strict';
/*
var arrayBufferToFloat = function (ab) {
    var a = new Uint16Array(ab);
    return a[0];
};
*/
var soilZero = 255.;
var soilSlope = -1.4;
// .4   --> 8    --> 60
//  7.0 --> 11.5 --> 670

var lightZero = 0.;
var lightSlope = 25/100.;

var app = {
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        closeButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        $("#devicelist").hide();
        $("#notfound").show();
        deviceList.innerHTML = ''; // empties the list
        rfduino.discover(5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        $("#notfound").hide();
        $("#devicelist").show();
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                device.uuid;
        listItem.setAttribute('uuid', device.uuid);
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var uuid = e.target.getAttribute('uuid'),
            onConnect = function() {
                rfduino.onData(app.onData, app.onError);
                app.showDetailPage();
                deviceUUID.innerHTML = uuid+"<br>";
            };

        rfduino.connect(uuid, onConnect, app.onError);
    },
    onData: function(data) {
        console.log(data);
        var a = new Uint16Array(data);
//wlz.innerHTML = "Data=" + a[0];
        if      (a[0] < 1024) {data0.innerHTML = a[0]/10.;}
        else if (a[0] < 2048) {data1.innerHTML = (a[0]-1024);}
        else if (a[0] < 3072) {data2.innerHTML = Math.max(0,Math.round((a[0]-2048-soilZero)/soilSlope));}
        else                  {data3.innerHTML = Math.max(0,Math.round((a[0]-3072-lightZero)/lightSlope*10)/10);}
    },
    disconnect: function() {
        deviceUUID.innerHTML = "Water Tracker";
        rfduino.disconnect(app.showMainPage, app.onError);
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
        alert(reason); // real apps should use notification.alert
    }
};