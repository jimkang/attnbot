var probable = require('probable');

var decorators = [
  {
    prefix: 'Yes, yes. Absolutely. I hear you:',
    suffix: ''
  },
  {
    prefix: 'Yup, yup.',
    suffix: 'Right!'
  },
  {
    prefix: 'I totally agree.',
    suffix: '100%.'
  },
  {
    prefix: 'Fellow human, it\'s good to hear that. I\'d say the same to you!',
    suffix: ''
  },
  {
    prefix: 'Right!',
    suffix: 'Everyone knows that.'
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
