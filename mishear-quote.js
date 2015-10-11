var getRandomQuote = require('./get-random-quote');
var mishearText = require('./mishear-text');
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

var selectedQuote;

function runAttempt() {
  async.waterfall(
    [
      getRandomQuote,
      passQuoteText,
      mishearText,
      // callDecorateMishearing,
      postMishearing
    ],
    reportDone
  );
}

// function callDecorateMishearing(mishearing, done) {
//   // if (!done && typeof mishearing === 'function') {
//   //   done = mishearing;
//   // }
//   callNextTick(done, null, decorateMishearing(mishearing));
// }

function passQuoteText(quote, done) {
  if (!quote || !quote.text) {
    done(new Error('No quote given.'));
  }
  else if (quote.text.length + quote.author.length + 3 > 140) {
    done(new Error('Could not get line under 140 characters.'));
  }
  else {
    selectedQuote = quote;
    callNextTick(done, null, selectedQuote.text);
  }
}

function postMishearing(textMishearing, done) {
  var text;
  var allowableLength = 140 - selectedQuote.author.length - 3;
  if (textMishearing.length > allowableLength) {
    text = textMishearing.substr(0, allowableLength - 1) + '…';
  }
  else {
    text = textMishearing;
  }

  text += ('\n--' + selectedQuote.author);

  // if (text.length < 140 - 5) {
  //   text = 'FWD: ' + text;
  // }

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
