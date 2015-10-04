var callNextTick = require('call-next-tick');
var MishearPhrase = require('mishear-phrase');
var probable = require('probable');
var createWordnok = require('wordnok').createWordnok;
var config = require('./config');

var wordnok = createWordnok({
  apiKey: config.wordnikAPIKey
});

var misheardWordCount = 0;
var wordsSeen = 0;

var mishearPhrase = MishearPhrase({
  shouldMishearWord: function shouldMishearWord(word, done) {
    if ((wordsSeen < 1 || misheardWordCount < 1) ||
      1.0 * misheardWordCount / wordsSeen < 0.2) {

      wordnok.getPartsOfSpeech(word, testPartOfSpeech);

      function testPartOfSpeech(error, pos) {
        console.log(word, pos);

        var isOK = pos.length > 1 && (pos.every(isNoun) || pos.every(isVerb));

        if (isOK) {
          misheardWordCount += 1;
        }
        wordsSeen += 1;
        done(null, isOK);
      }
    }
    else {
      wordsSeen += 1;
      callNextTick(done, null, false);
    }
  },
  pickMishearing: function pickMishearing(mishearings, done) {
    callNextTick(done, null, probable.pickFromArray(mishearings));
  }
});

function mishearText(text, done) {
  if (text) {
    misheardWordCount = 0;
    wordsSeen = 0;
    mishearPhrase(text, done);
  }
  else {
    callNextTick(done);
  }
}

function isVerb(partOfSpeech) {
  return partOfSpeech === 'verb';
}

function isNoun(partOfSpeech) {
  return partOfSpeech === 'noun';
}

module.exports = mishearText;
