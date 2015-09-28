var getPopularTweets = require('get-popular-tweets');
var mishearText = require('./mishear-text');
var decorateMishearing = require('./decorate-mishearing');
var config = require('./config');
var async = require('async');
var callNextTick = require('call-next-tick');
var probable = require('probable');
var Twit = require('twit');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);

async.waterfall(
  [
    getTweets,
    pickTweet,
    mishearTweet,
    postMishearing
  ],
  reportDone
);

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
      done(error, decorateMishearing(mishearing, tweet.url));
    }
  }
}

function postMishearing(mishearing, done) {
  if (!mishearing) {
    callNextTick(done, new Error('Could not get a mishearing.'));
  }
  else if (dryRun) {
    console.log(mishearing);
    callNextTick(done, null, mishearing);
  }
  else {
    var body = {
      status: mishearing
    };
    twit.post('statuses/update', body, done);
  }
}

function reportDone(error, mishearing) {
  if (error) {
    console.log(error);
  }
  console.log(mishearing);
}
