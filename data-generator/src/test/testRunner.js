const { spawn, exec } = require('child_process');
const path = require('path');
const { setTimeout } = require('timers/promises');

const { genBatchDataSample } = require('../genData');
const dispatcher = require('../dispatcher');
const config = require('../config');
const logger = require('../logger');

const testConfigs = require('./testConfigs.json');

const SERVER_SCRIPT_PATH = path.resolve('../../../server/', 'src/index.js');
const { apiURL, tagConf } = config;

// Function to run the server with specific configuration
function runServer(config) {
  const { CONCURRENCY_LIMIT, BATCH_SIZE } = config;
  return spawn('node', [SERVER_SCRIPT_PATH], {
    env: {
      ...process.env,
      CONCURRENCY_LIMIT: CONCURRENCY_LIMIT.toString(),
      BATCH_SIZE: BATCH_SIZE.toString()
    },
    stdio: 'inherit'
  });
}

// Function to stop the server
function stopServer(serverProcess) {
  return new Promise((resolve, reject) => {
    serverProcess.kill('SIGINT');
    serverProcess.on('exit', resolve);
    serverProcess.on('error', reject);
  });
}

// Function to generate a chunk of data based on the configuration
async function generateDataChunk(tagConfig, startDate, endDate, stepMs) {
  return genBatchDataSample(tagConfig, startDate, endDate, stepMs);
}

// Function to get memory usage for a given process by PID
function getMemUsageByPID(PID, name) {
  return new Promise((resolve, reject) => {
    exec(`tasklist /FI "PID eq ${PID}" /FO LIST`, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(`Error getting memory usage for ${name} process: ${error?.message || stderr}`);
        return reject(error || new Error(stderr));
      }

      const memUsageLine = stdout.split('\n').find(line => line.startsWith('Mem Usage:'));
      if (memUsageLine) {
        const memUsageStr = memUsageLine.split(':')[1].replace(/K|,/g, '').trim();
        const memUsageMB = Math.round(parseInt(memUsageStr, 10) / 1024);
        resolve(memUsageMB);
      } else {
        reject(new Error('Memory usage not found.'));
      }
    });
  });
}

// Function to get memory usage for server, influxDB, and the current process
async function getMemoryUsage(serverPID, influxPID) {
  const serverMemMB = await getMemUsageByPID(serverPID, 'server');
  const influxdbMemMB = await getMemUsageByPID(influxPID, 'influxDB');
  const generatorMemMB = Math.round(process.memoryUsage().rss / (1024 * 1024));

  return {
    memUsageMB: {
      influxDB: influxdbMemMB,
      server: serverMemMB,
      generator: generatorMemMB
    }
  };
}

// Function to process chunks of data for a specific time range and send it to the server
async function processChunksForRange(start, end, rowsPerRequest, stepMs, tagConfig) {
  const chunkSizeSeconds = 60;
  const dateRanges = [];
  let totalRows = 0;

  let chunkStartDate = new Date(start);
  let chunkEndDate = new Date(chunkStartDate.getTime() + chunkSizeSeconds * 1000);

  while (totalRows < rowsPerRequest && chunkStartDate < end) {
    if (chunkEndDate > end) chunkEndDate = end;

    dateRanges.push([chunkStartDate.toISOString(), chunkEndDate.toISOString()]);
    totalRows += (chunkEndDate - chunkStartDate) / stepMs;

    chunkStartDate = new Date(chunkEndDate.getTime() + stepMs);
    chunkEndDate = new Date(chunkStartDate.getTime() + chunkSizeSeconds * 1000);
  }

  const dataChunks = await Promise.all(dateRanges.map(
    ([start, end]) => generateDataChunk(tagConfig, start, end, stepMs)
  ));

  return dataChunks.flat().slice(0, rowsPerRequest); // Ensure exactly rowsPerRequest rows
}

// Function to generate and send data batches
async function batchGenerator(rowsPerRequest, numberOfRequests, reqInterval, logger, serverPID, influxPID) {
  const startDate = new Date('2021-10-01');
  const endDate = new Date('2024-10-01');
  const stepMs = 1000; // Step in milliseconds for data points

  let currentStartDate = startDate;
  let requestCount = 0;

  while (requestCount < numberOfRequests) {
    const currentEndDate = new Date(
      Math.min(currentStartDate.getTime() + stepMs * rowsPerRequest, endDate.getTime())
    );

    const data = await processChunksForRange(currentStartDate, currentEndDate, rowsPerRequest, stepMs, tagConf);

    console.log(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] Send ${data.length} rows for date range: ${currentStartDate.toISOString().substring(0, 10)}/${currentEndDate.toISOString().substring(0, 10)}`);

    const result = await dispatcher.sendData(data);

    if (result.type === 'failed' && result.reason === 'overloaded') {
      console.log('Server is overloaded, waiting...');
      await handleServerOverload(data);
    } else if (result.type === 'failed') {
      await setTimeout(15000); // Pause before retrying in case of other failures
    } else {
      const memUsage = await getMemoryUsage(serverPID, influxPID);
      const log = { ...result.data, ...memUsage };
      await logger.logTestResults(log);
    }

    await setTimeout(reqInterval);
    currentStartDate = new Date(currentStartDate.getTime() + stepMs * rowsPerRequest);
    requestCount++;
  }
}

// Function to handle server overload and retry sending data when ready
async function handleServerOverload(data) {
  let isOverloaded = true;

  while (isOverloaded) {
    await setTimeout(15000);
    const { status } = await dispatcher.getServerStatus();
    if (status === 'ready') {
      isOverloaded = false;
      console.log('Server is ready, resending data...');
      await dispatcher.sendData(data);
    }
  }
}

// Function to run the test suite for all configurations
async function runTests() {
  dispatcher.init(apiURL);
  const influxPID = 4976;

  for (const config of testConfigs) {
    console.log(`Running test with config: ${JSON.stringify(config)}`);

    const serverProcess = runServer(config);

    await setTimeout(5000); // Allow server to start

    const { status: serverStatus } = await dispatcher.getServerStatus();
    if (serverStatus !== 'ready') {
      console.error('Server is not ready. Aborting test.');
      await stopServer(serverProcess);
      continue;
    }

    await batchGenerator(
      config.ROWS_RECEIVED,
      config.REQUESTS,
      15000,
      logger,
      serverProcess.pid,
      influxPID
    );

    await stopServer(serverProcess);
  }

  console.log('All tests completed.');
}

// Run the tests and handle any errors that occur
runTests().catch((error) => console.error('Error running tests:', error));
