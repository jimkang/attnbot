var shakesnippet = require('shakesnippet');
var MishearText = require('./mishear-text');
var config = require('./config/config');
var async = require('async');
var callNextTick = require('call-next-tick');
var probable = require('probable');
var Twit = require('twit');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);

var mishearText = MishearText();

var selectedQuote;

function runAttempt() {
  async.waterfall(
    [
      getSnippet,
      mishearText,
      postMishearing
    ],
    reportDone
  );
}

function getSnippet(done) {
  shakesnippet(
    {
      numberOfLines: probable.rollDie(4)
    },
    done
  );
}

var attribution = ' –W. S.';

function postMishearing(text, done) {
  if (text.length > 140) {
    text = text.substr(0, 140);
  }
  else if (text.length <= 140 - attribution.length) {
    text += attribution;
  }

  if (dryRun) {
    callNextTick(done, null, text);
  }
  else {
    var body = {
      status: text
    };
    console.log(body);
    twit.post('statuses/update', body, done);
  }
}

function reportDone(error, mishearing) {
  if (error) {
    console.log(error);
    console.log('Retrying.');
    callNextTick(runAttempt);
  }
  else {
    console.log(mishearing);
  }
}

runAttempt();
