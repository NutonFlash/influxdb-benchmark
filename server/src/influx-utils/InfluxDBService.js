const { Worker } = require('worker_threads');
const path = require('path');
const { setTimeout } = require('timers/promises');

class InfluxDBService {
  constructor(concurrencyLimit = 10, batchSize = 5000, flushInterval = 10000) {
    // Configuration for concurrency, batch size, and flush interval
    this.concurrencyLimit = concurrencyLimit;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;

    // Initialize queue and worker tracking
    this.queue = [];
    this.workers = [];
    this.activeWorkers = 0;
    this.isRunning = false;

    // Initialize workers based on the concurrency limit
    this.initWorkers();
  }

  /**
   * Initializes the worker threads and sets up their event handlers.
   */
  initWorkers() {
    const workerScriptPath = path.resolve(__dirname, '../app/worker.js');

    for (let i = 0; i < this.concurrencyLimit; i++) {
      const workerNumber = i + 1;

      // Create a new worker thread
      const worker = new Worker(workerScriptPath, {
        env: { WORKER_NUMBER: workerNumber }
      });

      // Set a higher limit for event listeners to avoid potential memory leaks
      worker.setMaxListeners(this.concurrencyLimit + 5);

      // Handle messages from the worker
      worker.on('message', (message) => {
        const { type, workerNumber, error } = message;
        if (type === 'done' || type === 'error') {
          this.activeWorkers--;
          this.workers[workerNumber - 1].isBusy = false;
          this.processQueue();
        }
        if (type === 'error') {
          console.error(`Worker ${workerNumber} encountered an error: ${error}`);
        }
      });

      // Handle errors occurring in the worker
      worker.on('error', (error) => {
        console.error(`Worker ${workerNumber} encountered an error:`, error);
        this.activeWorkers--;
        this.workers[workerNumber - 1].isBusy = false;
        this.processQueue();
      });

      // Handle worker exits
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${workerNumber} stopped with exit code ${code}`);
        }
        this.activeWorkers--;
        this.workers[workerNumber - 1].isBusy = false;
        this.processQueue();
      });

      // Initialize the worker with batch size and flush interval
      worker.postMessage({
        type: 'init',
        data: {
          batchSize: this.batchSize,
          flushInterval: this.flushInterval
        }
      });

      // Add the worker to the workers array
      this.workers.push(worker);
    }
  }

  /**
   * Sends a batch of data to a specific worker for writing.
   * @param {Array} points - The data points to write.
   * @param {number} workerNumber - The worker to handle the batch.
   * @returns {Promise} - Resolves when the worker completes the batch.
   */
  async writeBatch(points, workerNumber) {
    return new Promise((resolve, reject) => {
      const worker = this.workers[workerNumber - 1];
      worker.isBusy = true;
      this.activeWorkers++;

      worker.once('message', resolve);
      worker.once('error', reject);

      worker.postMessage({
        type: 'write',
        data: points
      });
    });
  }

  /**
   * Adds a set of data batches to the processing queue.
   * @param {Array} batches - The data batches to queue.
   */
  addDataToQueue(batches) {
    this.queue.push(...batches);
    // Start processing the queue if it's not already running
    this.processQueue();
  }

  /**
   * Processes the queue by assigning batches to available workers.
   */
  async processQueue() {
    // Check if there are batches in the queue and available workers
    while (this.queue.length > 0 && this.activeWorkers < this.concurrencyLimit) {
      const batch = this.queue.shift();

      // Find the first available worker
      const availableWorkerIndex = this.workers.findIndex(
        (worker) => !worker.isBusy
      );

      if (availableWorkerIndex === -1) {
        // No available worker, put the batch back in the queue and exit loop
        this.queue.unshift(batch);
        break;
      }

      // Assign the batch to the available worker
      await this.writeBatch(batch, availableWorkerIndex + 1).catch((error) =>
        console.error(`Worker ${availableWorkerIndex + 1} encountered an error while processing batch:`, error)
      );
    }
  }

  /**
   * Gracefully shuts down the service by ensuring all workers complete their tasks.
   */
  async destroy() {
    // Wait for all active workers to finish their tasks
    while (this.activeWorkers > 0) {
      await setTimeout(100);
    }

    // Send a destroy message to all workers to terminate them
    this.workers.forEach((worker) => {
      worker.postMessage({
        type: 'destroy'
      });
    });

    console.log('InfluxDBService has gracefully shut down.');
  }
}

module.exports = InfluxDBService;
