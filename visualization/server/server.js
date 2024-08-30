const express = require("express");
const path = require("path");
const { parseLogsFromFile } = require("./parser");

const app = express();
const PORT = 5000;

const filePath = path.resolve(__dirname, "testLogs.txt");
const logs = parseLogsFromFile(filePath);

app.use(express.static(path.join(__dirname, "../client/", "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/", "build"));
});

app.get("/logs", (req, res) => {
  if (logs) {
    console.log(`Send ${logs.length} logs`);
    return res.json({ type: "success", data: logs });
  }
  console.error(`No logs were found`);
  return res.json({ type: "failed", message: "Couldn't parse logs" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
