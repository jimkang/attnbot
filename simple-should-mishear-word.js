var callNextTick = require('call-next-tick');

function simpleShouldMishearWord(word, done) {
  callNextTick(done, null, true);
}

module.exports = simpleShouldMishearWord;
