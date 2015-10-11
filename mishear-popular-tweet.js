var getPopularTweets = require('get-popular-tweets');
var MishearText = require('./mishear-text');
var decorateMishearing = require('./decorate-mishearing');
var config = require('./config/config');
var async = require('async');
var callNextTick = require('call-next-tick');
var probable = require('probable');
var Twit = require('twit');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var attempts = 0;

var twit = new Twit(config.twitter);
var mishearText = MishearText();

function runAttempt() {
  async.waterfall(
    [
      getTweets,
      pickTweet,
      mishearTweet,
      postMishearing
    ],
    reportDone
  );
}

function getTweets(done) {
  var opts = {
    twitterCreds: config.twitter,
    woeid: 23424977 // US
  };

  getPopularTweets(opts, done);
}

function pickTweet(tweets, done) {
  callNextTick(done, null, probable.pickFromArray(tweets));
}

function mishearTweet(tweet, done) {
  console.log('tweet.text:', tweet.text);
  console.log('–', tweet.user.screen_name);

  mishearText(tweet.text, decorateTweet);

  function decorateTweet(error, mishearing) {
    if (error) {
      done(error);
    }
    else {
      // done(error, decorateMishearing(mishearing, tweet.url));
      done(error, mishearing);
    }
  }
}

function postMishearing(mishearing, done) {
  if (!mishearing) {
    callNextTick(done, new Error('Could not get a mishearing.'));
  }
  else {
    var replyText;
    if (mishearing.length > 140) {
      replyText = mishearing.slice(0, 140);
    }
    else {
      replyText = mishearing;
    }
    if (dryRun) {
      console.log(mishearing);
      callNextTick(done, null, mishearing);
    }
    else {
      var body = {
        status: replyText
      };
      twit.post('statuses/update', body, done);
    }
  }
}

function reportDone(error, mishearing) {
  attempts += 1;

  if (error) {
    console.log(error);
    if (attempts < 10 &&
      error.message === 'Could not come up with a mishearing.') {

      console.log('Retrying.');
      callNextTick(runAttempt);
    }   
  }
  console.log(mishearing);
}

runAttempt();
