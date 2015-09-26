var probable = require('probable');

var decorators = [
  {
    prefix: 'I\'ve heard that "',
    suffix: '"'
  },
  {
    prefix: 'OH: ',
    suffix: ''
  },
  {
    prefix: '"',
    suffix: '" – or so I\'ve heard!'
  },
  {
    prefix: 'ITEM! "',
    suffix: '"'
  },
  {
    prefix: 'It\'s my understanding that "',
    suffix: '"'
  },
];

function decorateMishearing(text) {
  var decorator = probable.pickFromArray(decorators);
  return decorator.prefix + text + decorator.suffix;
}

module.exports = decorateMishearing;
