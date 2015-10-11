var callNextTick = require('call-next-tick');
var MishearPhrase = require('mishear-phrase');
var probable = require('probable');
var createWordnok = require('wordnok').createWordnok;
var config = require('./config/config');

var wordnok = createWordnok({
  apiKey: config.wordnikAPIKey
});

var misheardWordCount = 0;
var wordsSeen = 0;
var maxMisheard = 0;

var mishearPhrase = MishearPhrase({
  shouldMishearWord: function shouldMishearWord(word, done) {
    callNextTick(done, null, true);
    return;
    // if (misheardWordCount < maxMisheard &&
    //  (wordsSeen < 1 || 1.0 * misheardWordCount / wordsSeen < 0.7)) {

      wordnok.getPartsOfSpeech(word, testPartOfSpeech);

      function testPartOfSpeech(error, pos) {
        var isOK = pos.length > 1 && (pos.every(isNoun) || pos.every(isVerb));

        if (isOK) {
          misheardWordCount += 1;
        }
        wordsSeen += 1;
        done(null, isOK);
      }
    // }
    // else {
    //   wordsSeen += 1;
    //   callNextTick(done, null, false);
    // }
  },
  pickMishearing: function pickMishearing(mishearings, done) {
    callNextTick(done, null, probable.pickFromArray(mishearings));
  }
});

function mishearText(text, done) {
  if (text) {
    var wordTotal = text.split(' ').length;
    maxMisheard = Math.round(wordTotal / 2);
    if (maxMisheard < 1) {
      maxMisheard = 1;
    }
    misheardWordCount = 0;
    wordsSeen = 0;
    mishearPhrase(text, done);
  }
  else {
    callNextTick(done, new Error('No text provided to mishearText.'));
  }
}

function isVerb(partOfSpeech) {
  return partOfSpeech === 'verb';
}

function isNoun(partOfSpeech) {
  return partOfSpeech === 'noun';
}

module.exports = mishearText;
