'use strict';
var _ = require('lodash');
var rp = require('request-promise');

var ENDPOINT = 'http://services.faa.gov/airport/status/';
var APPLICATION_JSON = '?format=application/json';

function FAADataHelper() {}

FAADataHelper.prototype.requestAirportStatus = function(airportCode) {
    return this.getAirportStatus(airportCode).then(
        function(response) {
            console.log('success - received airport info for ' + airportCode);
            return response.body;
        }
    );
};

FAADataHelper.prototype.getAirportStatus = function(airportCode) {
    var options = {
        method: 'GET',
        uri: ENDPOINT + airportCode + APPLICATION_JSON,
        resolveWithFullResponse: true,
        json: true
    };
    return rp(options);
};

FAADataHelper.prototype.formatAirportStatus = function(airportStatus) {
    var weather = _.template('The current weather conditions are ${weather}, ${temp} and wind ${wind}.')({
        weather: airportStatus.weather.weather,
        temp: airportStatus.weather.temp,
        wind: airportStatus.weather.wind
    });
    if (airportStatus.delay === 'true') {
        var template = _.template('There is currently a delay for ${airport}. ' +
            'The average delay time is ${delay_time}. ' +
            'Delay is because of the following: ${delay_reason}. ${weather}');
        console.log('delay - template = ' + template);
        return template({
            airport: airportStatus.name,
            delay_time: airportStatus.status.avgDelay,
            delay_reason: airportStatus.status.reason,
            weather: weather
        });
    } else {
        return _.template('There is currently no delay at ${airport}. ${weather}')({
            airport: airportStatus.name,
            weather: weather
        });
    }
};

module.exports = FAADataHelper;