const axios = require('axios');

class Dispatcher {
  constructor() {
    this.axiosInstance = null; // Axios instance will be initialized in the init method.
  }

  /**
   * Initializes the Axios instance with the provided base URL.
   * @param {string} baseURL - The base URL for Axios requests.
   */
  init(baseURL) {
    this.axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
        proxy: false
      },
      timeout: 60000 // Set a default timeout of 60 seconds for requests.
    });
  }

  /**
   * Sends data to the server using a POST request.
   * @param {Object} dataSample - The data to be sent to the server.
   * @returns {Promise<Object>} - An object indicating success or failure.
   * @throws {Error} - If the Dispatcher is not initialized.
   */
  async sendData(dataSample) {
    if (!this.axiosInstance) {
      throw new Error('Dispatcher not initialized. Call init(baseURL) first.');
    }

    try {
      const { data } = await this.axiosInstance.post(
        '/write-data',
        dataSample,
        {
          timeout: 5 * 60 * 1000 // Override timeout for this specific request to 5 minutes.
        }
      );

      return { type: 'success', data }; // Return success with the received data.
    } catch (error) {
      if (error.response && error.response.status === 503) {
        console.error('Server is overloaded');
        return { type: 'failed', reason: 'overloaded' }; // Specific handling for server overload.
      }
      console.error('Error sending data');
      return { type: 'failed', reason: 'error', message: error.message }; // General error handling.
    }
  }

  /**
   * Retrieves the server status using a GET request.
   * @returns {Promise<Object>} - The server status data.
   * @throws {Error} - If the Dispatcher is not initialized.
   */
  async getServerStatus() {
    if (!this.axiosInstance) {
      throw new Error('Dispatcher not initialized. Call init(baseURL) first.');
    }

    try {
      const response = await this.axiosInstance.get('/status');
      return response.data; // Return the server status data.
    } catch (error) {
      console.error('Error retrieving server status:', error);
    }
  }
}

// Create a singleton instance of the Dispatcher class.
const dispatcher = new Dispatcher();

module.exports = dispatcher;
