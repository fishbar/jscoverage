var util = require('./util');

var colorful = util.colorful;

var symbols = {
  ok: '✓',
  warn: '⁍',
  err: '✱'
};

// With node.js on Windows: use symbols available in terminal default fonts
if ('win32' === process.platform) {
  symbols.ok = '\u221A';
  symbols.warn = '\u204D';
  symbols.err = '\u2731';
}

var indents = 1;
function indent() {
  return Array(indents).join('  ');
}

exports.process = function (_$jscoverage, stats, covlevel) {
  var arr = [];
  console.log('\n');
  console.log(colorful('%s%s', 'DEFAULT'), indent(), 'Coverage result');
  indents ++;
  Object.keys(stats).forEach(function (file) {
    var coverage = stats[file].coverage;
    var type;
    var head;
    if (coverage >= covlevel.high) {
      type = 'GREEN';
      head = symbols.ok;
    } else if (coverage >= covlevel.middle) {
      type = null;
      head = symbols.ok;
    } else if (coverage >= covlevel.low) {
      type = 'YELLOW';
      head = symbols.warn;
    } else {
      type = 'RED';
      head = symbols.err;
    }
    var msg = file +
      ': hits[' + stats[file].hits + '], sloc[' + stats[file].sloc + '] coverage[' + colorful(stats[file].percent, type) + ']';
    msg = indent() + colorful(head, type) + ' ' + colorful(msg, 'DEFAULT');
    arr.push(msg);
  });
  console.log(arr.join('\n'));
};