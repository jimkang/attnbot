var createMicroserver = require('slack-webhook-microserver');
var callNextTick = require('call-next-tick');
var MishearText = require('./mishear-text');
var decorateMishearing = require('./decorate-mishearing');
var simpleShouldMishearWord = require('./simple-should-mishear-word');

var port = process.env.PORT;
if (!port) {
  port = 5678;
}

var mishearText = MishearText({
  shouldMishearWord: simpleShouldMishearWord
});
var lastThingSaid;

function getResponse(params, done) {
  console.log('params:', JSON.stringify(params, null, '  '));

  if (params.user_name === 'slackbot' && lastThingSaid === params.text) {
    callNextTick(done);
  }
  else {
    mishearText(params.text, respondWithMishearing);
  }

  function respondWithMishearing(error, mishearing) {
    if (error) {
      done(error);
    }
    else {
      var response = {
        text: mishearing // decorateMishearing(mishearing)
      };
      var shouldDelay = (lastThingSaid !== undefined);
      lastThingSaid = response.text;

      function callDone() {
        done(error, response);
      }
      setTimeout(callDone, shouldDelay ? 5000 : 0);
    }
  }
}

var server = createMicroserver({
  validWebhookTokens: ['j8usmz1wCSdHJf1edOhsJp0q'],
  getResponseObject: getResponse,
  port: port,
  log: console.log
});
