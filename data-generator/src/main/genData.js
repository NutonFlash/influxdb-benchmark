/**
 * Generates a unique tag ID by combining a prefix with a random 4-digit number.
 * @param {string} prefix - The prefix for the tag ID.
 * @returns {string} - The generated tag ID.
 */
function genTagId(prefix) {
  const randomNum = Math.round(Math.random() * 1000 + 1);
  const idBody = randomNum.toString().padStart(4, '0'); // Ensure the number is always 4 digits.
  return `${prefix}_${idBody}`;
}

/**
 * Generates a random value within the specified range, formatted to two decimal places.
 * @param {Array<number>} range - An array containing the max and min values.
 * @returns {string} - The generated random value as a string.
 */
function genRandomtTagValue([max, min]) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

/**
 * Generates a data sample based on the provided tag configuration and timestamp.
 * @param {Object} tagConfig - Configuration object mapping measurement names to tag settings.
 * @param {number} timestamp - The timestamp for the data sample.
 * @returns {Array<Object>} - An array of data sample objects.
 */
function genDataSample(tagConfig, timestamp) {
  const data = [];
  for (const prop in tagConfig) {
    const measurement = prop;
    const { tagIdPrefix, valueRange } = tagConfig[prop];
    const tagId = genTagId(tagIdPrefix); // Generate a tag ID using the prefix.
    const value = genRandomtTagValue(valueRange); // Generate a random value within the range.
    data.push({ measurement, tagId, value, timestamp });
  }
  return data;
}

/**
 * Generates a batch of data samples over a time range with a specific step interval.
 * @param {Object} tagConfig - Configuration object for tag settings.
 * @param {string} startDateStr - The start date of the data generation period.
 * @param {string} endDateStr - The end date of the data generation period.
 * @param {number} stepMs - The time step in milliseconds between each data sample.
 * @returns {Array<Object>} - An array of data sample objects for the entire batch.
 */
function genBatchDataSample(tagConfig, startDateStr, endDateStr, stepMs) {
  let currentDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  let batchDataSample = [];
  while (currentDate < endDate) {
    const dataSample = genDataSample(tagConfig, currentDate.getTime()); // Generate a data sample for the current timestamp.
    batchDataSample = [...batchDataSample, ...dataSample]; // Append the generated data sample to the batch.
    currentDate = new Date(currentDate.getTime() + stepMs); // Increment the current date by the specified step.
  }
  return batchDataSample;
}

module.exports = {
  genDataSample,
  genBatchDataSample
};
