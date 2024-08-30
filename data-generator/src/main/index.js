const { genDataSample, genBatchDataSample } = require('./genData');
const config = require('./config');
const dispatcher = require('./dispatcher');
const { setTimeout } = require('timers/promises');

const { apiURL, tagConf } = config;

// Initialize the dispatcher with the provided API URL
dispatcher.init(apiURL);

/**
 * Generates and sends real-time data at regular intervals.
 * @param {number} reqInterval - Interval in milliseconds between each data generation.
 */
function startRealTimeDataGeneration(reqInterval) {
  setInterval(async () => {
    const data = genDataSample(tagConf, Date.now());
    await dispatcher.sendData(data);
  }, reqInterval);
}

/**
 * Generates a chunk of data for a specified time range and step interval.
 * @param {Object} tagConfig - Configuration for the data generation.
 * @param {string} startDate - ISO string representing the start date of the range.
 * @param {string} endDate - ISO string representing the end date of the range.
 * @param {number} stepMs - Step interval in milliseconds.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of data samples.
 */
async function generateDataChunk(tagConfig, startDate, endDate, stepMs) {
  const dataChunk = genBatchDataSample(tagConfig, startDate, endDate, stepMs);
  return dataChunk;
}

/**
 * Processes chunks of data for a specific time range and sends them in batches.
 * Handles server overloads by waiting until the server is ready.
 * @param {number} reqInterval - Interval between batch requests in milliseconds.
 */
async function startBatchDataGeneration(reqInterval) {
  const startDate = new Date('2021-10-01');
  const endDate = new Date('2024-10-01');
  const stepMs = 1000; // Time step between data points in milliseconds
  const chunkDurationSeconds = 60;
  const chunkSizeSeconds = 30 * 60;

  let currentStartDate = startDate;

  while (currentStartDate < endDate) {
    const currentEndDate = new Date(
      Math.min(currentStartDate.getTime() + chunkSizeSeconds * 1000, endDate.getTime())
    );

    const dataChunks = await generateChunksForDateRange(
      currentStartDate,
      currentEndDate,
      stepMs,
      chunkDurationSeconds
    );

    await sendDataWithRetry(dataChunks);

    await setTimeout(reqInterval);
    currentStartDate = new Date(currentEndDate.getTime() + stepMs);
  }
}

/**
 * Generates chunks of data for a specific date range.
 * @param {Date} start - The start date of the range.
 * @param {Date} end - The end date of the range.
 * @param {number} stepMs - Time step between data points in milliseconds.
 * @param {number} chunkDurationSeconds - Duration of each chunk in seconds.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of data samples.
 */
async function generateChunksForDateRange(start, end, stepMs, chunkDurationSeconds) {
  const dateRanges = [];

  let chunkStartDate = new Date(start);
  let chunkEndDate = new Date(chunkStartDate.getTime() + chunkDurationSeconds * 1000);

  while (chunkStartDate < end) {
    if (chunkEndDate > end) {
      chunkEndDate = end;
    }

    dateRanges.push([chunkStartDate.toISOString(), chunkEndDate.toISOString()]);

    chunkStartDate = new Date(chunkEndDate.getTime() + stepMs);
    chunkEndDate = new Date(chunkStartDate.getTime() + chunkDurationSeconds * 1000);
  }

  const dataChunks = await Promise.all(
    dateRanges.map(([start, end]) => generateDataChunk(tagConf, start, end, stepMs))
  );

  return dataChunks.flat();
}

/**
 * Sends data to the server and handles potential server overloads.
 * @param {Array<Object>} data - The data to be sent.
 */
async function sendDataWithRetry(data) {
  const result = await dispatcher.sendData(data);

  if (result.type === 'failed' && result.reason === 'overloaded') {
    console.warn('Server overloaded, retrying...');

    let isOverloaded = true;
    while (isOverloaded) {
      await setTimeout(15000); // Wait before retrying

      const { status } = await dispatcher.getServerStatus();
      if (status === 'ready') {
        isOverloaded = false;
        await dispatcher.sendData(data); // Retry sending data
      }
    }
  } else if (result.type === 'failed') {
    console.error('Failed to send data:', result.message);
  }
}

// Start real-time data generation with a 1-second interval
startRealTimeDataGeneration(1000);

// Start batch data generation with a 1-second interval between batches
startBatchDataGeneration(1000);
