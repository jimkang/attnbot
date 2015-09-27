var getPopularTweets = require('get-popular-tweets');
var mishearText = require('./mishear-text');
var decorateMishearing = require('./decorate-mishearing');
var config = require('./config');
var async = require('async');
var callNextTick = require('call-next-tick');
var probable = require('probable');

async.waterfall(
  [
    getTweets,
    pickTweet,
    mishearTweet
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
  mishearText(tweet.text, done);
}

function reportDone(error, mishearing) {
  if (error) {
    console.log(error);
  }
  console.log(decorateMishearing(mishearing));
}
