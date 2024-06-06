const fncy = require('fancy-time');
const chalk = require('chalk');

const Logger = {
  /**
   * Logs an informational message.
   *
   * @param {string} message - The message to log.
   */
  info: function(message) {
    console.log(chalk.blue(fncy.timeStr(`[INFO] ${message}`)));
  },

  /**
   * Logs a warning message.
   *
   * @param {string} message - The message to log.
   */
  warn: function(message) {
    console.log(chalk.yellow(fncy.timeStr(`[WARN] ${message}`)));
  },

  /**
   * Logs an error message.
   *
   * @param {string} message - The message to log.
   */
  error: function(message) {
    console.log(chalk.red(fncy.timeStr(`[ERROR] ${message}`)));
  },

  /**
   * Logs a standard message.
   *
   * @param {string} message - The message to log.
   */
  std: function(message) {
    console.log(chalk.white(fncy.timeStr(message)));
  },

  /**
   * Logs JSON content.
   *
   * @param {Object} json - The JSON object to log.
   */
  json: function(json) {
    const formattedJson = JSON.stringify(json, null, 2); // Pretty print JSON
    console.log(chalk.green(fncy.timeStr(`[JSON] ${formattedJson}`)));
  }
};

module.exports = Logger;
