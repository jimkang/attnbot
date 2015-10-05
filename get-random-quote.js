var lineChomper = require('line-chomper');
var jsonfile = require('jsonfile');
var probable = require('probable');
var callNextTick = require('call-next-tick');

function getLine(done) {
  var lineOffsets = jsonfile.readFileSync(__dirname + '/data/quotes-offsets.json');
  var offsetToGet = probable.pickFromArray(lineOffsets);

  lineChomper.chomp(
    __dirname + '/data/quotes_all.csv',
    {
      lineOffsets: lineOffsets,
      fromLine: offsetToGet.line,
      lineCount: 1
    },
    passLine
  );

  function passLine(error, lines) {
    var line;
    if (error) {
      done(error);
    }
    else if (!lines || !Array.isArray(lines) || lines.length < 1) {
      done(new Error('Could not get valid line for offset ' + offsetToGet));
    }
    else {
      line = lines[0];
      var parts = line.split(';');
      if (parts[0].length + parts[1].length + 3 > 140) {
        // callNextTick(getLine, done);
        done(new Error('Could not get line under 140 characters.'));
      }
      else {
        done(error, line);
      }
    }
  }
}

function getRandomQuote(done) {
  getLine(parseLine);

  function parseLine(error, line) {
    if (error) {
      done(error);
    }
    else {
      var parts = line.split(';');
      var quote = {
        text: parts[0],
        author: parts[1]
      }
      done(error, quote);
    }
  }
}

module.exports = getRandomQuote;
