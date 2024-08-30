const express = require('express');
const cors = require('cors');

const InfluxDBService = require('../influx-utils/InfluxDBService');
const Logger = require('./Logger');
const MemoryMonitor = require('./MemoryMonitor');

const { SERVER_PORT } = require('../config');

const CONCURRENCY_LIMIT = parseInt(process.env.CONCURRENCY_LIMIT) || 1;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;
const FLUSH_INTERVAL = 10000;  // Interval in milliseconds for flushing data to InfluxDB
const MEMORY_THRESHOLD_MB = 200;  // Minimum memory threshold in MB

class App {
  constructor() {
    this.app = express();
    this.port = SERVER_PORT || 3000;

    // Initialize services
    this.influxDBService = new InfluxDBService(
      CONCURRENCY_LIMIT,
      BATCH_SIZE,
      FLUSH_INTERVAL
    );
    this.logger = new Logger();
    this.memoryMonitor = new MemoryMonitor(MEMORY_THRESHOLD_MB);

    // Setup middleware and routes
    this.setupMiddlewares();
    this.setupRoutes();

    // Handle process termination to gracefully shut down the InfluxDB service
    process.on('SIGINT', async () => {
      await this.influxDBService.destroy();
      process.exit();
    });
  }

  /**
   * Setup middleware for the Express application.
   */
  setupMiddlewares() {
    this.app.use(express.json({ limit: '10gb' }));
    this.app.use(express.text());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }

  /**
   * Setup routes for the Express application.
   */
  setupRoutes() {
    // Route to handle data writing to InfluxDB
    this.app.post('/write-data', async (req, res) => {
      try {
        // Check if there is enough memory to process the request
        if (!this.memoryMonitor.isMemorySufficient()) {
          console.error('Not enough memory to process request.');
          return res
            .status(503)
            .send('Server is overloaded. Please try again later.');
        }

        const data = req.body;

        // Write the received data to InfluxDB
        await this.writeDataToInflux(data);

        console.log(`Server wrote ${data.length} points`);

        return res.sendStatus(200);
      } catch (error) {
        console.error('Error writing data to InfluxDB:', error);
        return res.sendStatus(500);
      }
    });

    // Route to check server status
    this.app.get('/status', async (req, res) => {
      const status = this.memoryMonitor.isMemorySufficient() ? 'ready' : 'overloaded';
      return res.json({ status });
    });
  }

  /**
   * Processes and writes data to InfluxDB in batches.
   * @param {Array} data - The data to be written to InfluxDB.
   */
  async writeDataToInflux(data) {
    const startTime = new Date();

    // Split data into batches
    const batches = [];
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      batches.push(batch);
    }

    // Add batches to the InfluxDB service queue
    this.influxDBService.addDataToQueue(batches);

    // Process all batches in the queue
    await this.influxDBService.processQueue();

    const endTime = new Date();
    const processTime = (endTime - startTime) / 1000;  // Process time in seconds
    const avgProcessTime = processTime / data.length;  // Average time per row

    // Log the processing results
    const log = {
      workersNum: CONCURRENCY_LIMIT,
      batchSize: BATCH_SIZE,
      flushInterval: FLUSH_INTERVAL,
      processTime,
      rowsReceived: data.length,
      timePerRow: avgProcessTime,
      startTime: startTime.toISOString().replace('T', ' ').substring(0, 19),
      endTime: endTime.toISOString().replace('T', ' ').substring(0, 19)
    };

    await this.logger.logTestResults(log);
  }

  /**
   * Starts the Express application and listens on the configured port.
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`);
    });
  }
}

module.exports = App;
