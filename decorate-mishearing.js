var probable = require('probable');

var decorators = [
  {
    prefix: 'Oh, yeah, right – ',
    suffix: ''
  },
  {
    prefix: 'Of course! Everyone knows that ',
    suffix: ''
  },
  {
    prefix: '"',
    suffix: '" – or so I\'ve heard!'
  },
  {
    prefix: 'Yeah, yeah – ',
    suffix: 'Exactly.'
  },
  // {
  //   prefix: 'It\'s my understanding that "',
  //   suffix: '"'
  // },
];

function decorateMishearing(text, url) {
  var decorator = probable.pickFromArray(decorators);
  var decorated = decorator.prefix + text + decorator.suffix;
  if (url) {
    decorated += (' ' + url);
  }
  return decorated;
}

module.exports = decorateMishearing;
