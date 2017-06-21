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
            'AIRPORTCODE': 'FAACODES'
        },
        'utterances': [
            '{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}'
        ]
    },
    function(request, response) {
        //get the slot
        var airportCode = request.slot('AIRPORTCODE');
        var reprompt = 'Tell me an airport code to get delay information.';
        if (_.isEmpty(airportCode)) {
            var prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
            response.say(prompt).reprompt(reprompt).shouldEndSession(false);
            return true;
        } else {
            var faaHelper = new FAADataHelper();
            faaHelper.requestAirportStatus(airportCode).then(function(airportStatus) {
                console.log(airportStatus);
                response.say(faaHelper.formatAirportStatus(airportStatus)).send();
            }).catch(function(err) {
                console.log(err.statusCode);
                var prompt = 'I didn\'t have data for an airport code of ' + airportCode;
                //https://github.com/matt-kruse/alexa-app/blob/master/index.js#L171
                response.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
            });
            return false;
        }
    }
);
//hack to support custom utterances in utterance expansion string
console.log(app.utterances().replace(/\{\-\|/g, '{'));
module.exports = app;