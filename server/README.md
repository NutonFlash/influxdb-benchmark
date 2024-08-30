# Node.js Express Server with InfluxDB Integration

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Endpoints](#endpoints)
  - [Logging](#logging)
  - [Data Generator Module](#data-generator-module)

## Overview

This repository contains a Node.js server implementation using ExpressJS. The server is designed to handle data ingestion for IoT sensor data, writing it into InfluxDB. It features routes for data ingestion and status checking, batch processing, and logging of performance metrics. The server integrates with a data generator module that simulates real-world IoT sensors, generating data for testing and development purposes.

## Features

- **ExpressJS Server**: Handles incoming HTTP requests with routes for data ingestion and server status.
- **/write-data Route**: Receives data in the request body, slices it into batches, and queues it for processing by worker threads.
- **/status Route**: Provides information about the server's current memory usage and readiness to process more data.
- **InfluxDB Integration**: Writes processed data batches to InfluxDB using a customizable concurrency model.
- **Worker Threads**: Manages concurrent processing of data batches to optimize performance.
- **Performance Logging**: Logs metrics such as processing time, memory usage, and other useful details to a log file for analysis.

## Setup

### Installation

1. **Install InfluxDB**
   - Follow the guide on the InfluxDB [website](https://www.influxdata.com/downloads/)

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and configure the necessary environment variables:

    ```bash
    CONCURRENCY_LIMIT=5         # Number of worker threads to run concurrently
    BATCH_SIZE=500              # Number of data points to process per batch
    FLUSH_INTERVAL=10000        # Flush interval for writing data to InfluxDB in milliseconds
    SERVER_PORT=3000            # Port for the Express server
    INFLUX_TOKEN=your-influxdb-token
    INFLUX_URL=http://localhost:8086
    INFLUX_ORG=your-org-name
    INFLUX_BUCKET=your-bucket-name
    ```

4. **Start the Server**
    ```bash
    npm start
    ```

## Usage

### Endpoints

#### POST /write-data

- **Description**: Accepts data to be written to InfluxDB. The server slices the data into batches and queues them for processing by worker threads.
- **Request Body**: JSON array containing data points to be written.
- **Response**: `200 OK` on successful data processing, `503 Service Unavailable` if the server is overloaded, or `500 Internal Server Error` if an error occurs.

  **Example Request**:
    ```bash
    curl -X POST http://localhost:3000/write-data \
         -H "Content-Type: application/json" \
         -d '[{"measurement": "sensor1", "tagId": "sensor-01", "value": 23.4, "timestamp": 1625227200000}, ...]'
    ```

#### GET /status

- **Description**: Provides the current status of the server, indicating whether it is ready to process more data or is currently overloaded.
- **Response**: JSON object with a `status` field (`"ready"` or `"overloaded"`).

  **Example Request**:
    ```bash
    curl http://localhost:3000/status
    ```

  **Example Response**:
    ```json
    {
      "status": "ready"
    }
    ```

### Logging

- **Log File Location**: Logs are written to a file named `testLogs.txt` in the root directory of the project.
- **Logged Metrics**: Includes processing time, memory usage, number of data points processed, and other useful metrics.

### Data Generator Module

This server works with a data generator module that simulates real-world data from IoT sensors. The generator creates data points that can be ingested by the `/write-data` route, allowing for testing and development without needing actual sensor data.
