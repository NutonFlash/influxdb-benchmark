const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    /**
     * Initializes the Logger by setting the path for the log file.
     * The log file is located in the 'test' directory and named 'testLogs.txt'.
     */
    this.logFilePath = path.resolve(__dirname, '../../testLogs.txt');
  }

  /**
   * Logs test results to the specified log file.
   * Appends the log entry to the log file as a new line.
   * @param {Object} logEntry - The test result entry to be logged.
   */
  async logTestResults(logEntry) {
    const logString = JSON.stringify(logEntry) + '\n'; // Convert log entry to a JSON string and add a newline.
    fs.appendFile(this.logFilePath, logString, (err) => {
      if (err) {
        console.error('Error writing log entry:', err.message); // Log an error message if writing fails.
      } else {
        console.log('Test results logged successfully'); // Confirm successful logging.
      }
    });
  }
}

module.exports = new Logger();
