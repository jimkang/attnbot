var request = require('request');
var parseVerse = require('./parse-verse');
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

var citation;

function runAttempt() {
  async.waterfall(
    [
      getVerse,
      parseResponse,
      mishearText,
      postMishearing
    ],
    reportDone
  );
}

function getVerse(done) {
  request('http://labs.bible.org/api/?passage=random', done);
}

function parseResponse(response, body, done) {
  var parsed = parseVerse(body);

  if (parsed.citation.length + 2 + parsed.text.length > 140) {
    done(new Error('Verse is too long.'));
  }
  else {
    citation = parsed.citation;
    done(null, parsed.text);
  }
}

function postMishearing(text, done) {
  var status = citation + ': ' + text;

  if (dryRun) {
    callNextTick(done, null, status);
  }
  else {
    var body = {
      status: status
    };
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
