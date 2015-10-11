var mishearText = require('./mishear-text');
var config = require('./config/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var _ = require('lodash');
var toTitleCase = require('titlecase');
var fetchHeadlines = require('fetch-headlines');
var isCool = require('iscool')();
var probable = require('probable');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);

var usedHeadlines = [];

function runAttempt() {
  async.waterfall(
    [
      startFetchHeadlines,
      pickHeadline,
      mishearText,
      postMishearing
    ],
    reportDone
  );
}

function startFetchHeadlines(done) {
  fetchHeadlines(
    {
      isCool: isCool
    },
    done
  );
}

function pickHeadline(headlines, done) {
  var unused = _.difference(headlines, usedHeadlines);
  if (unused.length < 1) {
    callNextTick(done, new Error('No suitable headlines.'));
  }
  else {
    var headline = probable.pickFromArray(headlines);
    usedHeadlines.push(headline);
    console.log('Raw headline:', headline);
    callNextTick(done, null, headline);
  }
}

function postMishearing(misheardHeadline, done) {
  text = toTitleCase(misheardHeadline);
  text = text.replace(/(\W)Us(\W)/g, '$1US$2');

  if (dryRun) {
    console.log('Would have tweeted:', text);
    callNextTick(done, null);
  }
  else {
    var body = {
      status: text
    };
    twit.post('statuses/update', body, done);
  }
}

function reportDone(error, mishearing) {
  if (error) {
    console.log(error);
    if (error.message !== 'No suitable headlines.') {
      console.log('Retrying.');
      callNextTick(runAttempt);
    }
  }
  else {
    console.log(mishearing);
  }
}

runAttempt();
