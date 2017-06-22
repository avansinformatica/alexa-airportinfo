module.change_code = 1;
'use strict';

var Alexa = require('alexa-app');
var _ = require('lodash');

var app = new Alexa.app('airportinfo');
var FAADataHelper = require('./faa_data_helper');

app.launch(function(request, response) {
    var prompt = 'For delay information, tell me an Airport code.';
    response
        .say(prompt)
        .reprompt(prompt)
        .shouldEndSession(false);
});

app.error = function(exception, request, response) {
    console.log(exception)
    console.log(request);
    console.log(response);
    response.say('Sorry an error occured ' + error.message);
};

app.intent('airportinfo', {
        'slots': {
            'AIRPORTCODE': 'AMAZON.Airport'
        },
        'utterances': [
            '{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}'
        ]
    },
    function(request, response) {
        var airportCode = request.slot('AIRPORTCODE');
        var reprompt = 'Tell me an airport code to get delay information.';
        if (_.isEmpty(airportCode)) {
            var prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
            response
                .say(prompt)
                .reprompt(reprompt)
                .shouldEndSession(false);
            return true;
        } else {
            var faaHelper = new FAADataHelper();
            return faaHelper
                .requestAirportStatus(airportCode)
                .then(function(airportStatus) {
                    var template = faaHelper.formatAirportStatus(airportStatus);
                    console.log('received response: template = ' + template);
                    response
                        .say(template)
                        .reprompt(reprompt)
                        .shouldEndSession(false)
                        .send();
                })
                .catch(function(err) {
                    console.log(err.statusCode);
                    var prompt = 'I didn\'t have data for an airport code of ' + airportCode;
                    response
                        .say(prompt)
                        .reprompt(reprompt)
                        .shouldEndSession(false)
                        .send();
                });
        }
    }
);

module.exports = app;