/*!
 * jscoverage: reporter/html.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-10 16:23:23
 * CopyRight 2014 (c) Fish And Other Contributors
 */

/**
 * Module dependencies.
 */

var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

/**
 * Initialize a new `JsCoverage` reporter.
 *
 * @param {Runner} runner
 * @param {Boolean} output
 * @api public
 */

exports.process = function (_$jscoverage, stats, covlevel) {
  var result = map(_$jscoverage, stats);
  var file = __dirname + '/templates/coverage.ejs';
  var str = fs.readFileSync(file, 'utf8').toString();

  var html = ejs.render(str, {
    debug: true,
    cov: result,
    coverageClass: function (n) {
      n = n / 100;
      if (n >= covlevel.high) {
        return 'high';
      }
      if (n >= covlevel.middle) {
        return 'medium';
      }
      if (n >= covlevel.low) {
        return 'low';
      }
      return 'terrible';
    },
    filename: path.join(__dirname, './templates/cached.ejs')
  });

  fs.writeFileSync(process.cwd() + '/covreporter.html', html);
  console.log('[REPORTER]: ', process.cwd() + '/covreporter.html');
};

/**
 * Map jscoverage data to a JSON structure
 * suitable for reporting.
 *
 * @param {Object} cov
 * @return {Object}
 * @api private
 */

function map(cov, stats) {
  var ret = {
    instrumentation: 'jscoverage',
    sloc: 0,
    hits: 0,
    misses: 0,
    coverage: 0,
    files: []
  };

  for (var filename in cov) {
    if (!cov[filename] || !cov[filename].length) {
      continue;
    }
    var data = coverage(filename, cov[filename], stats[filename]);
    ret.files.push(data);
    ret.hits += data.hits;
    ret.misses += data.misses;
    ret.sloc += data.sloc;
  }

  ret.files.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });

  if (ret.sloc > 0) {
    ret.coverage = (ret.hits / ret.sloc) * 100;
  }

  return ret;
};

/**
 * Map jscoverage data for a single source file
 * to a JSON structure suitable for reporting.
 *
 * @param {String} filename name of the source file
 * @param {Object} data jscoverage coverage data
 * @return {Object}
 * @api private
 */

function coverage(filename, data, stats) {
  var ret = {
    filename: filename,
    coverage: stats.coverage * 100,
    hits: stats.hits,
    misses: stats.sloc - stats.hits,
    sloc: stats.sloc,
    source: []
  };
  data.source.forEach(function(line, num){
    num++;
    var conds = stats.condition[num];
    var splits = [];
    if (conds) {
      conds.forEach(function (v) {
        if (!splits[v[0]]) {
          splits[v[0]] = {start:[], end:[]};
        }
        if (!splits[v[0] + v[1]]) {
          splits[v[0] + v[1]] = {start: [], end: []};
        }
        splits[v[0]].start.push('<i class="cond-miss">');
        splits[v[0] + v[1]].end.push('</i>');
      });
      var res = [];
      var offset = 0;
      splits.forEach(function (v, i) {
        if (!v) {
          return;
        }
        res.push(line.substr(offset, i - offset));
        res.push(v.end.join(''));
        res.push(v.start.join(''));
        offset = i;
      });
      res.push(line.substr(offset));
      line = res.join('');
    }
    ret.source[num] = {
      source: line,
      coverage: data[num] === undefined ? '' : data[num],
      condition: conds && conds.length ? true : false
    };
  });
  return ret;
}
