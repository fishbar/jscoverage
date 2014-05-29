/*!
 * jscoverage: reporter/summary.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-10 16:23:23
 * CopyRight 2014 (c) Fish And Other Contributors
 */

/**
 * summary reporter
 * @param  {[type]} _$jscoverage coverage object
 * @param  {[type]} stats        coverage stats
 * @param  {Object} covmin       coverage level {high, middle, low}
 */
exports.process = function (_$jscoverage, stats, covlevel) {
  var arr = [];
  Object.keys(stats).forEach(function (file) {
    var msg = '[JSCOVERAGE] ' + file + ': hits[' + stats[file].hits + '], sloc[' + stats[file].sloc + '] coverage[' + stats[file].percent + ']';
    var coverage = stats[file].coverage;
    var type;
    if (coverage >= covlevel.high) {
      type = "GREEN";
    } else if (coverage >= covlevel.middle) {
      type = null;
    } else if (coverage >= covlevel.low) {
      type = 'YELLOW';
    } else {
      type = 'RED';
    }
    msg = colorful(msg, type);
    arr.push(msg);
  });
  console.log('\n')
  console.log(arr.join('\n'));
};

function colorful(str, type) {
  if (!type) {
    return str;
  }
  var head = '\x1B[', foot = '\x1B[0m';
  var color = {
    LINENUM : 36,
    GREEN  : 32,
    YELLOW  : 33,
    RED : 31
  };
  return head + color[type] + 'm' + str + foot;
}