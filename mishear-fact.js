var getRandomArticle = require('./get-random-article');
var getSentencesFromArticle = require('./get-sentences-from-article');
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
    getRandomArticle,
    pickSentence,
    mishearText,
    callDecorateMishearing,
    postMishearing
  ],
  reportDone
);

function pickSentence(article, done) {
  var sentences = getSentencesFromArticle(article);
  if (!sentences || sentences.length < 1) {
    callNextTick(done, new Error('Could not get sentences from article.'));
  }
  else {
    // console.log('sentences:', sentences);
    var sentence = sentences[0];
    if (probable.roll(3) === 0) {
      sentence = probable.pickFromArray(sentences);
    }
    console.log('sentence:', sentence);
    callNextTick(done, null, sentence);
  }
}

function callDecorateMishearing(mishearing, done) {
  callNextTick(done, null, decorateMishearing(mishearing));
}

function postMishearing(mishearing, done) {
  if (!mishearing) {
    callNextTick(done, new Error('Could not get a mishearing.'));
  }
  else if (dryRun) {
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
