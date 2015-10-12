var config = require('./config/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var MishearText = require('./mishear-text');
// var decorateMishearing = require('./decorate-mishearing');
var betterKnow = require('better-know-a-tweet');
var isCool = require('iscool')();
var simpleShouldMishearWord = require('./simple-should-mishear-word');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var mishearText = MishearText({
  shouldMishearWord: simpleShouldMishearWord
});

var botUsername = 'gr8_note_taker';
var twit = new Twit(config.twitter);
var stream = twit.stream('user');

stream.on('tweet', reactToTweet);

function reactToTweet(tweet) {
  var attribution;

  if (tweet.user.screen_name !== botUsername &&
    !betterKnow.isRetweetOfUser(botUsername, tweet)) {

    var mentioned = betterKnow.whosInTheTweet(tweet).slice(1);

    if (mentioned.length > 0 && mentioned[0] === botUsername &&
      isCool(tweet.text)) {

      attribution = 'Note from @' + tweet.user.screen_name + ': ';
      var tweetText = tweet.text.replace('@' + botUsername + ' ', '');
      mishearText(tweetText, processMishearing);
    }
  }

  function processMishearing(error, mishearing) {
    var replyText;

    if (error) {
      console.log(error);
    }
    else if (!mishearing) {
      replyText = tweet.text;
    }
    else if (mishearing.length > 140) {
      replyText = mishearing.slice(0, 140);
    }
    else {
      replyText = mishearing;
    }

    if (replyText.length + attribution.length < 141) {
      replyText = attribution + replyText;
    }

    if (dryRun) {
      console.log(replyText);
    }
    else {
      var body = {
        status: replyText
      };
      twit.post('statuses/update', body, reportPosting);
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
