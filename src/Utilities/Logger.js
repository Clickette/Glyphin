const fncy = require('fancy-time');
const chalk = require('chalk');

const Logger = {
  info: function(message) {
    console.log(chalk.blue(fncy.timeStr(`[INFO] ${message}`)));
  },
  warn: function(message) {
    console.log(chalk.yellow(fncy.timeStr(`[WARN] ${message}`)));
  },
  error: function(message) {
    console.log(chalk.red(fncy.timeStr(`[ERROR] ${message}`)));
  },
  std: function(message) {
    console.log(chalk.white(fncy.timeStr(message)));
  }
};

module.exports = Logger;
