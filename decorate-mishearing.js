var probable = require('probable');

var decorators = [
  {
    prefix: '',
    suffix: 'Of course. Everyone knows that!'
  },
  {
    prefix: 'Like every human, I know that',
    suffix: ''
  },
  {
    prefix: 'Everyone knows that',
    suffix: ''
  },
  {
    prefix: 'Fellow human, it\'s great we both know that',
    suffix: ''
  },
  {
    prefix: '',
    suffix: 'Of course I know that! I\'m not some alien!'
  }
];

function decorateMishearing(text, url) {
  if (!text) {
    return text;
  }
  var decorator = probable.pickFromArray(decorators);
  if (decorator.prefix) {
    text = text.substr(0, 1).toLowerCase() + text.substr(1);
  }
  var decorated = decorator.prefix + ' ' +  text + ' ' + decorator.suffix;
  if (url) {
    decorated += (' ' + url);
  }
  return decorated;
}

module.exports = decorateMishearing;
