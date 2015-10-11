var http = require('http');
var url = require('url');
var qs = require('qs');
var _ = require('lodash');
var MishearText = require('./mishear-text');
var decorateMishearing = require('./decorate-mishearing');
var simpleShouldMishearWord = require('./simple-should-mishear-word');

var port = 7575;

console.log('The mishearing web server is running.');

var mishearText = MishearText({
  shouldMishearWord: simpleShouldMishearWord
});

// TODO: Put this function in its own module.
function takeRequest(req, res) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end('OK');
  }
  else if (req.method === 'GET') {
    respondToRequest(req, res, headers);
  }
  else {
    res.writeHead(304, headers);
    res.end();
  }
}

function respondToRequest(req, res, headers) {
  headers['Content-Type'] = 'text/json';

  var text;
  var parsed = url.parse(req.url);
  if (parsed.query) {
    var params = qs.parse(parsed.query);
    text = params.text;
  }
  
  if (typeof text === 'string') {
    mishearText(text, respondWithMishearing);
  }
  else {
    res.writeHead(500, headers);
    var response = {
      error: 'Request is missing the text param.'
    };
    res.end(JSON.stringify(response));
  }

  function respondWithMishearing(error, mishearing) {
    var response = {};
    var statusCode = 200;

    if (error) {
      console.log(error);
      response.error = error.message;
      statusCode = 404;
    }
    else {
      response.reply = decorateMishearing(mishearing);
    }
    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(response));
  }
}

http.createServer(takeRequest).listen(port);

console.log('Web server listening at port:', port);
