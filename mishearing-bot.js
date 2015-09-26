var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var MishearPhrase = require('mishear-phrase');
var probable = require('probable');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var mishearPhrase = MishearPhrase({
  shouldMishearWord: function shouldMishearWord(word, done) {
    callNextTick(done, null, word.length < 8 || probable.roll(3) === 0);
  },
  pickMishearing: function pickMishearing(mishearings, done) {
    callNextTick(done, null, probable.pickFromArray(mishearings));
  }
});

var twit = new Twit(config.twitter);
var stream = twit.stream('user');

stream.on('tweet', reactToTweet);

function reactToTweet(tweet) {
  // console.log(tweet.user.screen_name);
  console.log(tweet.text);
  if (tweet.user.screen_name !== 'mishearingbot') {
    attemptToMishear(tweet.text, tweet.user.screen_name);
  }
}

function attemptToMishear(text, username) {
  mishearPhrase(text, packageMishearing);

  function packageMishearing(error, mishearing) {
    if (error) {
      console.log(error);
    }
    else if (text === mishearing) {
      console.log('Could not mishear', text);
    }
    else {
      var response = 'OH ' + username + ': ' + mishearing;
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
