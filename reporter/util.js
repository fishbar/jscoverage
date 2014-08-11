exports.colorful = function (str, type) {
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
};