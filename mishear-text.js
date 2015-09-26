var callNextTick = require('call-next-tick');
var MishearPhrase = require('mishear-phrase');
var probable = require('probable');

var misheardWordCount = 0;

var mishearPhrase = MishearPhrase({
  shouldMishearWord: function shouldMishearWord(word, done) {
    var should = false;
    if (misheardWordCount < 3) {
      should = probable.roll(5) === 0;
    }
    if (should) {
      misheardWordCount += 1;
    }
    callNextTick(done, null, should);
  },
  pickMishearing: function pickMishearing(mishearings, done) {
    callNextTick(done, null, probable.pickFromArray(mishearings));
  }
});

function mishearText(text, done) {
  misheardWordCount = 0;
  mishearPhrase(text, done);
}

module.exports = mishearText;
