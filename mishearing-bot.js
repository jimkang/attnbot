var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var mishearText = require('./mishear-text');
var decorateMishearing = require('./decorate-mishearing');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);
var stream = twit.stream('user');

stream.on('tweet', reactToTweet);

function reactToTweet(tweet) {
  // console.log(tweet.user.screen_name);
  // console.log(tweet.text);
  if (tweet.user.screen_name !== 'mishearingbot') {
    mishearText(tweet.text, processMishearing);
  }

  function processMishearing(error, mishearing) {
    if (error) {
      console.log(error);
    }
    else if (!mishearing) {
      console.log('No mishearing for "' + tweet.text + '".');
    }
    else if (mishearing.length > 140) {
      console.log('Mishearing "' + mishearing + '" is too long.');
    }
    else {
      var response = decorateMishearing(mishearing);
      for (var i = 0; i < 5; ++i) {
        if (response < 141) {
          break;
        }
        response = decorateMishearing(mishearing);
      }

      if (dryRun) {
        console.log(response);
      }
      else {
        var body = {
          status: response
        };
        twit.post('statuses/update', body, reportPosting);
      }
    }
  }
}

function reportPosting(error, data) {
  if (error) {
    console.log(error);
  }
  else {
    console.log('Posted', data.text);
  }
}
