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

var doNotMishearList = [
  'will',
  'love',
  'can\'t'
];

function MishearText(opts) {
  var shouldMishearWord;

  if (opts) {
    shouldMishearWord = opts.shouldMishearWord;
  }

  if (!shouldMishearWord) {
    shouldMishearWord = function defaultShouldMishearWord(word, done) {
      if (misheardWordCount < maxMisheard &&
       (wordsSeen < 1 || 1.0 * misheardWordCount / wordsSeen < 0.7)) {

        if (doNotMishearList.indexOf(word.toLowerCase()) !== -1) {
          callNextTick(done, null, false);
        }
        else {
          wordnok.getPartsOfSpeech(word, testPartOfSpeech);
        }

        function testPartOfSpeech(error, pos) {
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
    };
  }

  var mishearPhrase = MishearPhrase({
    shouldMishearWord: shouldMishearWord,
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

  return mishearText;
}

function isVerb(partOfSpeech) {
  return partOfSpeech === 'verb';
}

function isNoun(partOfSpeech) {
  return partOfSpeech === 'noun';
}

module.exports = MishearText;
