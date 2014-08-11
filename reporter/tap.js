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
  var totalSloc = 0;
  var totalHits = 0;
  Object.keys(stats).forEach(function (file) {
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
    var msg = 'Coverage ' + file + ': hits[' + stats[file].hits + '], sloc[' + stats[file].sloc + '] coverage[' + colorful(stats[file].percent, type) + ']';
    msg = '  ' + colorful('\u204D', type) + ' ' +  colorful(msg, 'DEFAULT');
    arr.push(msg);
    totalSloc += stats[file].sloc;
    totalHits += stats[file].hits;
  });
  console.log('\n')
  console.log(arr.join('\n'));
  console.log('# coverage %s%', Math.ceil(totalHits * 10000 / totalSloc)/ 100);
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
    RED : 31,
    DEFAULT: 0
  };
  return head + color[type] + 'm' + str + foot;
}