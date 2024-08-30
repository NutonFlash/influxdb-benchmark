const { InfluxDB } = require('@influxdata/influxdb-client');
const {
  INFLUX_TOKEN,
  INFLUX_URL,
  INFLUX_ORG,
  INFLUX_BUCKET
} = require('../config');

class InfluxDBClient {
  constructor() {
    // Store configuration settings
    this.token = INFLUX_TOKEN;
    this.url = INFLUX_URL;
    this.org = INFLUX_ORG;
    this.bucket = INFLUX_BUCKET;

    // Initialize InfluxDB client and API instances to null
    this.client = null;
    this.writeApi = null;
    this.queryApi = null;
  }

  /**
   * Initializes the InfluxDB client and sets up write and query APIs.
   * @param {number} batchSize - Maximum number of points to write in a single batch.
   * @param {number} flushInterval - Time interval (in ms) to flush data.
   * @returns {InfluxDB} - The initialized InfluxDB client instance.
   */
  init(batchSize = 5000, flushInterval = 10000) {
    // Create an instance of InfluxDB with the provided URL and token
    this.client = new InfluxDB({
      url: this.url,
      token: this.token
    });

    if (this.client) {
      // Initialize the Write API with default batch and flush settings
      this.writeApi = this.client.getWriteApi(this.org, this.bucket, 'ns', {
        batchSize,
        flushInterval
      });

      // Set a default tag for all points written to the database
      this.writeApi.useDefaultTags({ dataSource: 'testGenerator' });

      // Initialize the Query API
      this.queryApi = this.client.getQueryApi(this.org);
    } else {
      throw new Error('Failed to initialize InfluxDB client.');
    }

    return this.client;
  }

  /**
   * Closes the write API connection gracefully.
   * Ensures that all data is flushed before closing.
   */
  async destroy() {
    if (this.writeApi) {
      try {
        await this.writeApi.close();
        console.log('InfluxDBClient has closed writeAPI.');
      } catch (error) {
        console.error('Error closing InfluxDB writeAPI:', error);
      }
    }
  }

  /**
   * Returns the Write API instance, initializing it if necessary.
   * @returns {WriteApi} - The Write API instance.
   */
  getWriteApi() {
    if (!this.writeApi) {
      this.init();
    }
    return this.writeApi;
  }

  /**
   * Returns the Query API instance, initializing it if necessary.
   * @returns {QueryApi} - The Query API instance.
   */
  getQueryApi() {
    if (!this.queryApi) {
      this.init();
    }
    return this.queryApi;
  }
}

module.exports = InfluxDBClient;
