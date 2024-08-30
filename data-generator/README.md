# Data Generator for InfluxDB Benchmarking

This module is designed to generate mock data and send it to a server where it will be written into InfluxDB. The module includes mechanisms for data generation, logging, and dispatching requests to the server. Additionally, it provides a test suite to automate the benchmarking process across different configurations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)

## Overview

The `data-generator` module serves as a tool for generating mock data that can be used to test and benchmark InfluxDB performance. It automates the process of sending generated data to a server, where it is written into InfluxDB. This tool is particularly useful for stress testing and performance analysis of InfluxDB with varying configurations of data rows, worker counts, and batch sizes.

## Features

- **Data Generator**: Create mock data for benchmarking purposes.
- **Logger**: Logs the benchmark results and system performance metrics.
- **Dispatcher**: Sends generated data to the server for InfluxDB writing.
- **Automated Testing**: Iterates over different configurations to benchmark InfluxDB performance, logging results for each configuration.

## Installation

1. **Install Dependencies**
    ```bash
    npm install
    ```

## Usage

To use the `data-generator` module, you can run the data generation and dispatch processes as follows:

1. **Generate Data**:
   Use the data generator mechanism to create mock data. Customize the data generation process as needed.

2. **Dispatch Data**:
   Use the dispatcher to send the generated data to your server where it will be written into InfluxDB.

3. **Log Results**:
   The logger will automatically capture and store benchmark results, including writing speed and system performance metrics.

For detailed instructions on how to customize and use each feature, refer to the module's documentation and code comments.

## Testing

The module includes a test suite to automate benchmarking across different configurations. The test suite allows you to configure the following parameters:

- **Number of Data Rows**: Specify how many data rows to generate and send to the server per request.
- **Number of Workers**: Define how many workers the server should use to write data.
- **Batch Size**: Set the batch size for data writing.

### Running Tests

To run the tests:

1. Navigate to the `test` folder and configure the test parameters as needed.
2. Run the test suite:
   ```bash
   node testRunner.js

Carefully check **`SERVER_SCRIPT_PATH`** var in `testRunner.js` file. It should refer to the `index.js` file of the server module.
