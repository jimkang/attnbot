var getRandomQuote = require('./get-random-quote');
var mishearText = require('./mishear-text');
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

var author;

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

// function callDecorateMishearing(mishearing, done) {
//   // if (!done && typeof mishearing === 'function') {
//   //   done = mishearing;
//   // }
//   callNextTick(done, null, decorateMishearing(mishearing));
// }

function passQuoteText(quote, done) {
  author = quote.author;
  callNextTick(done, null, quote.text);
}

function postMishearing(textMishearing, done) {
  if (!textMishearing) {
    callNextTick(done, new Error('Could not get a mishearing.'));
  }
  else {
    var text;
    var allowableLength = 140 - author.length - 3;
    if (textMishearing.length > allowableLength) {
      text = textMishearing.substr(0, allowableLength - 1) + '…';
    }
    else {
      text = textMishearing;
    }

    text += ('\n--' + author);

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
}

function reportDone(error, mishearing) {
  if (error) {
    console.log(error);
  }
  console.log(mishearing);
}

function isUnder141Chars(s) {
  return s.length < 141;
}
