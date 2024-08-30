const fs = require("fs");

function parseLogsFromFile(filePath) {
  // Read the file content
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Split the content by new lines to get each log entry
  const logEntries = fileContent
    .split("\n")
    .filter((line) => line.trim() !== "");

  // Parse each log entry as JSON and filter out flushInterval
  const parsedLogs = logEntries.map((logEntry) => {
    const log = JSON.parse(logEntry);
    const { flushInterval, ...rest } = log;
    return rest;
  });

  return parsedLogs;
}

module.exports = {
  parseLogsFromFile,
};
