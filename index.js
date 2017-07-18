'use strict';
var Alexa = require("alexa-sdk");
var appId = 'YOUR_APP_ID';

exports.handler = function(event, context, callback) {
	console.log(event);
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(mainHandlers);
    alexa.execute();
};

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

var mainHandlers = {
    'calculateExchange': function() {
        
        var amountVal = parseInt(this.event.request.intent.slots.Amount.value);
        var currencyVal = this.event.request.intent.slots.Currency.value;
        
        if(isInt(amountVal) && (currencyVal=="dollars" || currencyVal=="euros")) {
        var myCont = this;
       
        var http = require('http');

        var currencyDict = {};
        
		// currency rates api
		// ref: http://fixer.io
        var options = {
          host: 'api.fixer.io',
          path: '/latest?base=TRY'
        };
        
        var callbackQ = function(response) {
          var strResult = '';
        
          response.on('data', function (chunk) {
        	strResult += chunk;
          });
        
          response.on('end', function () {
        	try {
        		var ratesData = JSON.parse(strResult);
        	} catch(e) {
                throw new Error('Parse error:' + e);
            }
        	
        	currencyDict['euros'] = ratesData.rates.EUR;
        	currencyDict['dollars'] = ratesData.rates.USD;

        	var speechOutput = amountVal+" "+currencyVal+" equals to "+Math.round(amountVal/currencyDict[currencyVal])+" Turkish Liras.";
            myCont.attributes['tweetCache'] = speechOutput;
			myCont.emit(':ask', speechOutput);  
        
          });
        };
        
        http.request(options, callbackQ).end();
        } else {
            this.emit(':ask', "I didn't understand currency and amount, may you ask again?");  
        }
    },
	'tweetResult': function() {
		var myCont = this;
      	var accessToken = this.event.session.user.accessToken;
		if (accessToken === null) {
			this.emit(':tell', "Your twitter account isn't linked. Please link your account with alexa app.");
		} else {
			accessToken = accessToken.split(',');
			
			var Twitter = require('twitter');
			var client = new Twitter({
				consumer_key: 'YOUR_KEY_HERE',
				consumer_secret: 'YOUR_SECRET_HERE',
				access_token_key: accessToken[0],
				access_token_secret: accessToken[1]
			});
			
			client.post('statuses/update', {status: this.attributes['tweetCache']},  function(error, tweet, response) {
			  if(error)  {
				  console.log(error[0]);
				  if(error[0]['code']==187) {
					myCont.emit(':ask', "This tweet is already sent. You can try another.");
				  } else if(error[0]['code']==89) {
					myCont.emit(':tell', "Please link your account to the skill using Alexa App.");
				  }else {
					myCont.emit(':tell', "Hmmm, there is a problem while tweeting; \""+error[0]['message']+"\"");
				  }
				} else { 
					console.log(response);
					myCont.emit(':tell', "I have just tweeted that; "+myCont.attributes['tweetCache']);
				}
			});
			
		}
	},
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },'LaunchRequest': function () {
        this.emit(":ask", "Welcome to exchange calculator. You can ask any exchange to Turkish liras.");
    },'Unhandled': function () {
        this.emit(':ask', "Ask by saying like; \"convert 10 dollars\".");
    }

};