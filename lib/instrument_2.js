
/**
 * instrument code
 * @example
 *   var ist = new Instrument();
 *   var resCode = ist.process(str);
 */
var debug = require('debug')('cov:instrument');
var esprima = require('esprima');
var escodegen = require('escodegen');
var syntax = esprima.Syntax;
var estraverse = require('estraverse');

function Instrument() {
  /**
   * filename needed
   * @type {String}
   */
  this.filename = null;
  /**
   * store injected code
   * @type {String}
   */
  this.code = null;
  /**
   * 储存line信息
   * @type {Array}
   */
  this.lines = [];
  /**
   * 储存condition信息
   * @type {Object}
   */
  this.branches = {};
  /**
   * 储存function信息
   * @type {Object}
   */
  this.functions = {};
  /**
   * 储存statement信息
   * @type {Object}
   */
  this.statements = {};
  /**
   * source code in array
   * @type {Array}
   */
  this.source = null;
  /**
   * injected source
   * @type {Array}
   */
  this.injectedSource = [];

  this.injectInfos = {};
}

Instrument.prototype = {
  // 行类型
  T_LINE: 'line',
  T_BRANCH: 'branch', //  used to be cond
  T_STMT: 'statement',
  T_FUNC: 'function',
  T_BLOCK_WRAP: 'blockWrap',
  T_LITERAL: 'literal',

  /**
   * process code
   * @public
   * @param  {String} code source code
   * @return {String} injected code
   */
  process: function (filename, code) {
    if (!filename) {
      throw new Error('[jscoverage]instrument need filename!');
    }

    var ist = this;
    // parse ast
    var ast = esprima.parse(code, {
      loc: true,
      range: true,
      attachComment: true
    });
    var lineCursor = 0;

    this.filename = filename;
    this.source = code.split(/\r?\n/);
    /**
     * should cover:
     *   Statements
     *   Functions
     *   Branchs
     *   Lines
     */
    estraverse.traverse(ast, {
      enter: function (node, parent) {
        var loc = node.loc;
        var lineStart = loc.start.line;
        var lineEnd = loc.end.line;

        var start, end;
        var type = node.type;

        if (type === 'Program') {
          return ;
        }
        if (parent.__covignore) {
          node.__covignore = true;
          return;
        }
        if (ist.checkIfIgnore(node)) {
          node.__covignore = true;
          return;
        }
        /**
         * wrap content
         */
        switch(type) {
          case syntax.ArrowFunctionExpression:
          case syntax.ForInStatement:
          case syntax.ForStatement:
            if (node.body.type !== syntax.BlockStatement) {
              ist.inject(ist.T_BLOCK_WRAP, node.body.loc);
            }
            break;
          case syntax.IfStatement:
            if (node.consequent.type !== syntax.BlockStatement) {
              ist.inject(ist.T_BLOCK_WRAP, node.consequent.loc)
            }
            if (node.alternate && node.alternate.type !== syntax.BlockStatement && node.alternate.type !== syntax.IfStatement) {
              ist.inject(ist.T_BLOCK_WRAP, node.alternate.loc);
            }
            break;
        }

        switch (type) {
          case syntax.LogicalExpression:
            /**
             * a || (b && c)
             */
            var left = node.left;
            var right = node.right;
            [left, right].forEach(function (n) {
              if (
                n.type === syntax.Identifier ||
                n.type === syntax.Literal ||
                n.type === syntax.UnaryExpression
              ) {
                start = n.loc.start;
                end = n.loc.end;
                ist.inject(
                  ist.T_BRANCH,
                  {
                    start: start,
                    end: end
                  }
                )
              }
            });
            break;
          case syntax.BinaryExpression:
            /**
             * a >= b
             */
            if (
              parent.type !== syntax.ConditionalExpression &&
              parent.type !== syntax.IfStatement &&
              parent.type !== syntax.LogicalExpression
            ) {
              break;
            }
            start = node.loc.start;
            end = node.loc.end;
            ist.inject(
              ist.T_BRANCH,
              {
                start: start,
                end: end
              }
            );
            break;

          case syntax.ConditionalExpression:
            ist.inject(ist.T_BRANCH, node.consequent.loc);
            ist.inject(ist.T_BRANCH, node.alternate.loc);
            break;
          case syntax.FunctionDeclaration:
          case syntax.FunctionExpression:
            start = node.body.loc.start;
            end = node.body.loc.end;
            ist.inject(ist.T_FUNC, {
              start: {
                line: start.line,
                column: start.column + 1
              },
              end: {
                line: end.line,
                column: end.column - 1
              }
            });
            break;
          case syntax.ArrowFunctionExpression:
            start = node.body.loc.start;
            end = node.body.loc.end;
            if (node.body.type !== syntax.BlockStatement) {
              ist.inject(ist.T_LITERAL, node.body.loc, 'return ');
            } else {
              start = {
                line: start.line,
                column: start.column + 1
              };
              end = {
                line: end.line,
                column: end.column - 1
              }
            }
            ist.inject(ist.T_FUNC, {
              start: start,
              end: end
            });
            break;
          case syntax.IfStatement:
          case syntax.DoWhileStatement:
          case syntax.WhileStatement:
            if (
              node.test.type !== syntax.LogicalExpression &&
              node.test.type !== syntax.BinaryExpression
              ) {
              ist.inject(ist.T_BRANCH, node.test.loc);
            }
            break;
        }
        /**
         * instrument statements and lines
         */
        if (
          /Statement$/.test(type) ||
          type === syntax.VariableDeclaration ||
          type === syntax.FunctionDeclaration
        ) {
          if (
            (type === syntax.IfStatement && parent.type === syntax.IfStatement) ||
            (type === syntax.VariableDeclaration && parent.type === syntax.ForStatement) ||
            (type === syntax.VariableDeclaration && parent.type === syntax.ForInStatement)
          ) {
            ; // DO NOTHING
          } else if (type === syntax.BlockStatement) {
            start = node.loc.start;
            end = node.loc.end;
            ist.inject(ist.T_STMT, {
              start: {
                line: start.line,
                column: start.column + 1
              },
              end: {
                line: end.line,
                column: end.column - 1
              }
            });
          } else {
            ist.inject(ist.T_STMT, node.loc);

            if (lineStart > lineCursor) {
              ist.inject(ist.T_LINE, {
                start: {
                  line: lineStart,
                  column: loc.start.column
                }
              });
            }
          }
        }
        /**
         * for line cov inject
         * if lineStart > line means  this node start a new line
         * if lineEnd > line
         */
        /*
        if (lineStart > lineCursor) {
          if (
              type !== syntax.Property && // 多行对象
              type !== syntax.SwitchCase &&  // switch case
              type !== syntax.BlockStatement && // 块状
              type !== syntax.SequenceExpression && // 序列执行
              type !== syntax.VariableDeclarator // 声明序列
          ) {
            if (
              (parent.test === node)  ||
              (parent.type === syntax.LogicalExpression) ||
              (type === syntax.IfStatement && parent.type === syntax.IfStatement) ||
              (parent.type === syntax.DoWhileStatement && parent.test === node) ||
              (parent.type === syntax.CallExpression )
            ) {
              ;
            } else {
              ist.inject(ist.T_LINE, {
                start: {
                  line: lineStart,
                  column: loc.start.column
                }
              });
            }
          }
        }
        */
        lineCursor = lineStart;
      },
      leave: function (node, parent) {

      }
    });
    // rebuild file
    this.code = this.genCode();
    return this;
  },
  /**
   * 注入覆盖率查询方法
   * @private
   * @param  {String} type  inject type, line | conds
   * @param  {pos} pos
   * @param  {Object} expr  any expression, or node, or statement
   * @return {AST_Func} Object
   */
  inject: function (type, pos, literal) {
  // inject: function (type, line, expr) {
    var args = [];

    var lineStart = pos.start.line;
    var columnStart = pos.start.column;
    var lineEnd, columnEnd;
    var info, infoEnd;

    if (!this.injectInfos[lineStart]) {
      this.injectInfos[lineStart] = {};
    }
    if (pos.end) {
      lineEnd = pos.end.line;
      columnEnd = pos.end.column;
      if (!this.injectInfos[lineEnd]) {
        this.injectInfos[lineEnd] = {};
      }
      infoEnd = this.injectInfos[lineEnd];
      if (!infoEnd[columnEnd]) {
        infoEnd[columnEnd] = {};
      }
    }

    info = this.injectInfos[lineStart];
    var key;
    if (!info[columnStart]) {
      info[columnStart] = {};
    }
    switch (type) {
      case this.T_LINE:
        key = lineStart;
        // only once
        if (this.lines[key] !== undefined) {
          break;
        }
        this.lines[key] = 0;
        info[columnStart][type] = '_$jscmd("' + this.filename + '", "' + type + '", ' + key + ');';
        break;
      case this.T_FUNC:
        key = lineStart + ':' + columnStart + '_' + lineEnd + ':' + columnEnd;
        this.functions[key] = 0;
        info[columnStart][type] = '_$jscmd("' + this.filename + '", "' + type + '", "' + key + '");';
        break;
      case this.T_STMT:
        key = lineStart + ':' + columnStart;
        this.statements[key] = 0;
        info[columnStart][type] = '_$jscmd("' + this.filename + '", "' + type + '", "' + key + '");';
        break;
      case this.T_BRANCH:
        var key = lineStart + ':' + columnStart + '_' + lineEnd + ':' + columnEnd;
        // mark the branch that need to be covered
        this.branches[key] = 0;
        // inject start
        if (!info[columnStart][type]) {
          info[columnStart][type] = [];
        }
        info[columnStart][type].push('_$jscmd("' + this.filename + '", "' + type +'", "' + key + '", ');

        // inject end
        if (!infoEnd[columnEnd].branchEnd) {
          infoEnd[columnEnd].branchEnd = [];
        }
        infoEnd[columnEnd].branchEnd.push(')');
        break;
      case this.T_BLOCK_WRAP:
        info[columnStart][type] = '{';
        infoEnd[columnEnd].blockWrapEnd = '}';
        break;
      case this.T_LITERAL:
        if (!info[columnStart][type]) {
          info[columnStart][type] = [];
        }
        info[columnStart][type].push(literal);
        break;
    }
  },
  genCode: function () {
    // console.log(JSON.stringify(this.injectInfos, null, 2));
    var self = this;
    this.source.forEach(function (source, _line) {
      var line = _line + 1;
      var info = self.injectInfos[line];
      if (!info) {
        self.injectedSource[_line] = source;
        return;
      }

      var cursors = Object.keys(info);
      var result = [];
      var offset = 0;
      self.injectedSource[_line] = source;
      cursors.forEach(function (cursor) {
        var injectInfo = info[cursor];
        // push the leading code first
        if (offset !== cursor) {
          result.push(source.substring(offset, cursor));
        }
        /**
         * then
         *   - branch end
         *   - function
         *   - line
         *   - statement
         *   - branch
         */
        if (injectInfo.blockWrap) {
          result.push(injectInfo.blockWrap);
        }
        if (injectInfo.branchEnd) {
          result.push(injectInfo.branchEnd.join(''));
        }
        if (injectInfo.function) {
          result.push(injectInfo.function);
        }
        if (injectInfo.line) {
          result.push(injectInfo.line);
        }
        if (injectInfo.statement) {
          result.push(injectInfo.statement);
        }
        if (injectInfo.branch) {
          result.push(injectInfo.branch.join(''));
        }
        if (injectInfo.literal) {
          result.push(injectInfo.literal.join(''));
        }
        if (injectInfo.blockWrapEnd) {
          result.push(injectInfo.blockWrapEnd);
        }
        offset = cursor;
      });
      if (offset < source.length) {
        result.push(source.substr(offset));
      }
      self.injectedSource[_line] = result.join('');
    });
    return this.injectedSource.join('\n');
  },
  /**
   * check if need inject
   * @param  {AST_Node} node
   * @return {Boolean}
   */
  /*
  ifExclude: function (node) {
    if (node instanceof Uglify.AST_LoopControl) {
      return false;
    }
    if (
      node instanceof Uglify.AST_IterationStatement ||
      node instanceof Uglify.AST_StatementWithBody ||
      node instanceof Uglify.AST_Block
    ) {
      return true;
    }
  },
  */
  checkIfIgnore: function (node) {
    var cmt;
    var comments = node.leadingComments;
    var flag = false;
    comments && comments.forEach(function (cmt) {
      if (/@covignore\b/.test(cmt.value)) {
        flag = true;
      }
    });
    return flag;
  },
  // protect something like `multiline(function(){/* asd */})`
  protectEmptyBlock: function (node) {

  }
};

module.exports = Instrument;