const fs = require('fs');
const path = require('path');

class Logger {
  /**
   * Constructs a Logger instance, setting the log file path.
   * The log file is stored in the same directory as this script.
   */
  constructor() {
    this.logFilePath = path.join(__dirname, '../../../testLogs.txt');
  }

  /**
   * Logs a test result to the log file.
   * The log entry is serialized to JSON and appended to the file.
   * @param {Object} logEntry - The log entry to be recorded.
   */
  async logTestResults(logEntry) {
    const logString = JSON.stringify(logEntry) + '\n';  // Convert log entry to a JSON string with a newline

    // Use fs.promises.appendFile for consistent async/await handling
    try {
      await fs.promises.appendFile(this.logFilePath, logString);
      console.log('Test results logged successfully');
    } catch (err) {
      console.error('Error writing log entry:', err.message);  // Log an error message if writing fails
    }
  }
}

module.exports = Logger;
