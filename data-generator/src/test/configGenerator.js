const fs = require('fs');
const path = require('path');

const ROWS_RECEIVED_VALUES = [10000, 50000, 250000, 500000, 1000000];

const BATCH_SIZES = {
  10000: [100, 500, 1000, 5000],
  50000: [500, 1000, 5000, 10000],
  250000: [1000, 5000, 10000, 25000],
  500000: [5000, 10000, 25000, 50000],
  1000000: [10000, 25000, 50000, 100000]
};

const CONCURRENCY_LIMITS = {
  10000: [1, 2, 5, 10],
  50000: [2, 5, 10, 20],
  250000: [5, 10, 20, 50],
  500000: [10, 20, 50, 100],
  1000000: [20, 50, 100, 200]
};

/**
 * Generates an array of test configurations by combining different values
 * of rows received, batch sizes, and concurrency limits.
 * @returns {Array<Object>} - An array of configuration objects.
 */
const generateTestConfigs = () => {
  let configs = [];

  // Iterate over each possible value of rows received
  for (const rowsReceived of ROWS_RECEIVED_VALUES) {
    // For each rowsReceived value, iterate over the possible batch sizes
    for (const batchSize of BATCH_SIZES[rowsReceived]) {
      // For each batch size, iterate over the possible concurrency limits
      for (const concurrencyLimit of CONCURRENCY_LIMITS[rowsReceived]) {
        // Create a configuration object and push it to the configs array
        configs.push({
          CONCURRENCY_LIMIT: concurrencyLimit,
          BATCH_SIZE: batchSize,
          ROWS_RECEIVED: rowsReceived,
          REQUESTS: 20 // Constant value representing the number of requests
        });
      }
    }
  }

  return configs;
};

// Generate the test configurations
const testConfigs = generateTestConfigs();

// Write the generated configurations to a JSON file
fs.writeFileSync(__dirname + '/testConfigs.json', JSON.stringify(testConfigs, null, 2));

console.log('Test configurations generated successfully.');
