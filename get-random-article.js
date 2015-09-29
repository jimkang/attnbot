var Mediawiki = require('nodemw');
var jsonfile = require('jsonfile');
var probable = require('probable');

function getRandomArticle(done) {
  var topics = jsonfile.readFileSync(__dirname + '/data/topics.json');
  var topic = probable.pickFromArray(topics);

  var simpleWikipedia = new Mediawiki({
    server: 'simple.wikipedia.org',
    path: '/w',
    debug: false
  });

  simpleWikipedia.getArticle(topic, done);
}

module.exports = getRandomArticle;
