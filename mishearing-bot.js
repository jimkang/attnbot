var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);
// var wordnok = createWordnok({
//   apiKey: config.wordnikAPIKey,
//   logger: {
//     log: function noOp() {}
//   }
// });

var stream = twit.stream('user');

stream.on('tweet', function (tweet) {
  console.log(tweet.user.screen_name);
  console.log(tweet.text);
});
