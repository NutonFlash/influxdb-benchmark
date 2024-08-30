# InfluxDB Benchmark Visualization

This repository contains a client-server application designed to visualize the results of an InfluxDB benchmark test. The benchmark evaluates the writing speed and memory usage with varying numbers of workers and batch sizes. The results are visualized through a series of React components utilizing the Recharts library.

## Table of Contents

- [Overview](#overview)
- [Client](#client)
- [Server](#server)
- [Installation](#installation)
- [Usage](#usage)

## Overview

This project aims to provide insightful visualizations of the InfluxDB benchmark data, helping users understand how different parameters such as the number of workers and batch size impact the writing speed and memory usage. The application is divided into two main parts:

1. **Client**: A React-based front end that visualizes benchmark results using various components.
2. **Server**: A backend service responsible for reading log files containing benchmark data, including memory usage and writing speed, and serving this data to the client.

## Client

The client side of the application is built using **React** and **Recharts**. It consists of five main components, each dedicated to visualizing a specific aspect of the benchmark results.

### Components

- **MemoryUsageDistribution.jsx**  
  Displays the distribution of memory usage across different configurations.
  
- **MemoryUsageVsWorkers.jsx**  
  Compares memory usage against the number of workers to show how scaling workers impacts memory consumption.
  
- **ProcessTimeVsBatchSize.jsx**  
  Visualizes the relationship between the batch size and the processing time, helping to identify the optimal batch size for performance.
  
- **ProcessTimeVsWorkers.jsx**  
  Shows how the number of workers affects the processing time, providing insights into scalability and efficiency.
  
- **TimePerRowVsWorkers.jsx**  
  Highlights the time taken per row with varying numbers of workers, offering a detailed view of per-row performance.

## Server

The server component is designed to read log files generated during the InfluxDB benchmark tests. These logs contain essential data such as memory usage, writing speed, and other related metrics. The server processes these logs and exposes endpoints that the client can call to retrieve and display the data.

## Installation

To get started with this project, follow these steps:

1. **Install client dependencies**: Navigate to the **`client`** directory and install the dependencies:
    ```bash
    cd client
    npm install

2. **Install server dependencies**: Navigate to the **`server`** directory and install the dependencies:
    ```bash
    cd ../server
    npm install

## Usage

To run the application locally:

1. **Start the server**:
   Navigate to the `server` directory and start the server:
   ```bash
   npm start

2. **Start the client**: In another terminal, navigate to the **`client`** directory and start the client:
   ```bash
   npm start

3. Open your browser and navigate to **`http://localhost:3000`** to view the visualizations.