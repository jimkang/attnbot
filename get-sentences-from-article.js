var _ = require('lodash');

var wikiLinkRe = /\[\[([\w\s']+)\]\]/g;
var pipeSeparatedRe = /([\w\s']+)\|([\w\s']+)/g;
var superscriptRe = /<sup>(\w+)<\/sup>/g;
var subscriptRe = /<sub>(\w+)<\/sub>/g;

function getSentencesFromArticle(article) {
  var withoutLinks = desubscript(desuperscript(removeLinks(article)));
  var lines = withoutLinks.split('\n').filter(isTextLine);
  return _.flatten(lines.map(parseSentences));
}

function removeLinks(s) {
  var removed = s.replace(wikiLinkRe, '$1');
  removed = removed.replace(pipeSeparatedRe, '$1');
  return removed;
}

function isTextLine(line) {
  var isTextLine = false;
  if (line.length > 0 && line[0] !== ':') {
    isTextLine = true;
    if (line.length > 1) {
      var firstTwoChars = line.substr(0, 2);
      if (firstTwoChars === '==' || line.indexOf('[[') !== -1) {
        isTextLine = false;
      }
    }
  }
  return isTextLine;
}

function desuperscript(s) {
  return s.replace(superscriptRe, '^$1');
}

function desubscript(s) {
  return s.replace(subscriptRe, '$1');
}

function parseSentences(s) {
  return s.split(/[\.!?]\s/);
}

module.exports = getSentencesFromArticle;
