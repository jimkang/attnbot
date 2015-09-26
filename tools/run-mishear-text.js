var mishearText = require('../mishear-text');
var decorateMishearing = require('../decorate-mishearing');

if (process.argv.length < 3) {
  console.log('Usage: node tools/run-mishear-text "Your text here."');
  process.exit();
}

var text = process.argv[2];

mishearText(text, logMishearing);

function logMishearing(error, mishearing) {
  if (error) {
    console.log(error);
  }
  console.log(decorateMishearing(mishearing));
}
