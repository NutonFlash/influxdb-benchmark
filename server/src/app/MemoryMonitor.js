const os = require('os');

class MemoryMonitor {
  /**
   * Constructs a MemoryMonitor instance with a specified memory threshold.
   * @param {number} thresholdMB - The minimum amount of free memory (in MB) required.
   */
  constructor(thresholdMB) {
    if (thresholdMB <= 0) {
      throw new Error('Threshold must be a positive number.');
    }
    this.thresholdMB = thresholdMB;
  }

  /**
   * Returns the amount of free memory available on the system in megabytes (MB).
   * @returns {number} - Free memory in MB.
   */
  getFreeMemoryMB() {
    const freeMemoryBytes = os.freemem();
    const freeMemoryMB = freeMemoryBytes / (1024 * 1024);  // Convert bytes to MB
    return freeMemoryMB;
  }

  /**
   * Checks if the system has more free memory than the specified threshold.
   * @returns {boolean} - True if free memory is above the threshold, otherwise false.
   */
  isMemorySufficient() {
    const freeMemoryMB = this.getFreeMemoryMB();
    return freeMemoryMB > this.thresholdMB;  // Return true if free memory exceeds the threshold
  }
}

module.exports = MemoryMonitor;
