const { parentPort } = require('worker_threads');
const { Point } = require('@influxdata/influxdb-client');
const InfluxDBClient = require('../influx-utils/InfluxDBClient');

let influxDBClient;  // Instance of the InfluxDB client
let writeApi;  // Write API for sending data points to InfluxDB
const workerNumber = process.env.WORKER_NUMBER;  // Worker number from environment variable

/**
 * Initializes the InfluxDB client and Write API with the specified settings.
 * @param {Object} data - Initialization data containing batchSize and flushInterval.
 */
function init(data) {
  const { batchSize, flushInterval } = data;
  try {
    // Initialize the InfluxDB client
    influxDBClient = new InfluxDBClient();
    influxDBClient.init(batchSize, flushInterval);

    // Get the Write API from the client
    writeApi = influxDBClient.writeApi;
    console.log(`Worker ${workerNumber} was initialized successfully.`);
  } catch (error) {
    console.error(`Worker ${workerNumber} initialization error:`, error);
    // Notify parent about the initialization error
    parentPort.postMessage({
      type: 'error',
      workerNumber,
      error: error.message
    });
  }
}

/**
 * Destroys the InfluxDB client and cleans up resources.
 */
async function destroy() {
  try {
    if (influxDBClient) {
      await influxDBClient.destroy();  // Close the Write API and clean up
    }
    console.log(`Worker ${workerNumber} was destroyed.`);
    process.exit(0);  // Exit the worker thread
  } catch (error) {
    console.error(`Worker ${workerNumber} destruction error:`, error);
    // Notify parent about the destruction error
    parentPort.postMessage({
      type: 'error',
      workerNumber,
      error: error.message
    });
  }
}

/**
 * Writes a batch of data points to InfluxDB.
 * @param {Array<Object>} pointsRaw - The raw data points to write.
 */
async function writePoints(pointsRaw) {
  try {
    // Convert raw data points to InfluxDB Point objects
    const points = pointsRaw.map((item) => {
      return new Point(item.measurement)
        .tag('tagId', item.tagId)
        .floatField('value', item.value)
        .timestamp(new Date(item.timestamp));
    });

    // Write points to InfluxDB
    writeApi.writePoints(points);
    await writeApi.flush();  // Ensure all points are flushed to InfluxDB

    // Notify parent that the writing process is done
    parentPort.postMessage({ type: 'done', workerNumber });
  } catch (error) {
    console.error(`Worker ${workerNumber} error writing batch: ${error.message}`);
    // Notify parent about the error encountered during writing
    parentPort.postMessage({
      type: 'error',
      workerNumber,
      error: error.message
    });
  }
}

// Listen for messages from the parent thread
parentPort.on('message', async (message) => {
  const { type, data } = message;

  switch (type) {
    case 'init':
      init(data);  // Initialize the worker with provided data
      break;
    case 'destroy':
      await destroy();  // Clean up and exit the worker
      break;
    case 'write':
      await writePoints(data);  // Write the provided points to InfluxDB
      break;
    default:
      console.error(`Worker ${workerNumber} received unknown message type: ${type}`);
  }
});
