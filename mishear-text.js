var callNextTick = require('call-next-tick');
var MishearPhrase = require('mishear-phrase');
var probable = require('probable');
var WordPOS = require('wordpos');
var wordpos = new WordPOS();

var misheardWordCount = 0;
var wordsSeen = 0;

var mishearPhrase = MishearPhrase({
  shouldMishearWord: function shouldMishearWord(word, done) {
    if ((wordsSeen < 1 || misheardWordCount < 1) ||
      1.0 * misheardWordCount / wordsSeen < 0.3) {

      wordpos.getPOS(word, testPartOfSpeech);

      function testPartOfSpeech(posReport) {
        var isOK = posReport.nouns.length > 0 || posReport.verbs.length > 0;
          // posReport.adjectives.length > 0 || posReport.adverbs.length > 0;
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

module.exports = mishearText;
