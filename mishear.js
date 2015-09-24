var hph = require('homophonizer');
var phomophonizer = hph.phoneme.createHomophonizer();
var mhomophonizer = hph.metaphone.createHomophonizer();
var WordPOS = require('wordpos');
var wordpos = new WordPOS();
var async = require('async');
var callNextTick = require('call-next-tick');
var _ = require('lodash');

function mishear(word, doneMishearing) {
  var homophones = [];
  var wordPartsOfSpeechList = [];

  async.waterfall(
    [
      getWordPOS,
      getPhonemes,
      getImperfectHomophonesForPhonemeString,
      savePhonemeHomophones,
      getMetaphoneHomophones,
      saveMetaphoneHomophones,
      getPOSMatchingHomophones
    ],
    doneMishearing
  );

  function getWordPOS(done) {
    wordpos.getPOS(word, saveWordPOS);    
  
    function saveWordPOS(partsOfSpeech) {
      for (var part in partsOfSpeech) {
        if (partsOfSpeech[part].length > 0) {
          wordPartsOfSpeechList.push(part);
        }
      }
      done();
    }
  }

  function getPhonemes(done) {
    phomophonizer.getPhonemesInWord(word, done);
  }

  function getImperfectHomophonesForPhonemeString(phonemeString, done) {
    phomophonizer.getImperfectHomophones(
      {
        word: word,
        varyPhonemesAtPositions: phonemeString.split(' ').map(getPosition)
      },
      done
    );
  }

  function getMetaphoneHomophones(done) {
    mhomophonizer.getHomophones(word, done);
  }

  function savePhonemeHomophones(theHomophones, done) {
    homophones = homophones.concat(theHomophones.filter(isNotOriginalWord));
    callNextTick(done);
  }

  function saveMetaphoneHomophones(theHomophones, done) {
    debugger;
    homophones = homophones.concat(
      theHomophones.primary.filter(isNotOriginalWord)
    );
    // TODO: Think about including secondary?
    callNextTick(done);
  }

  function getPOSMatchingHomophones(done) {
    wordpos.getPOS(homophones.join(' '), matchHomophonesByPOS);

    function matchHomophonesByPOS(homophonesPOS) {
      debugger;

      var homophonesForMatchingPOS = _.pick.apply(
        _.pick, [homophonesPOS].concat(wordPartsOfSpeechList)
      );
      var matchingHomophones = _.union.apply(
        _.union, _.values(homophonesForMatchingPOS)
      );
      done(null, matchingHomophones);
    }
  }

  function isNotOriginalWord(w) {
    return word.toLowerCase() !== w.toLowerCase();
  }
}

function getPosition(ph, i) {
  return i;
}

module.exports = mishear;
