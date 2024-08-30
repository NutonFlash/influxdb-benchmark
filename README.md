# InfluxDB Benchmarking Toolkit

This repository contains a suite of tools for generating, ingesting, and visualizing mock data in InfluxDB. It is designed to assist with performance testing and benchmarking of InfluxDB by providing a seamless workflow from data generation to visualization of results.

## Table of Contents

- [Overview](#overview)
- [Modules](#modules)
- [Usage Notes](#usage-notes)

## Overview

The InfluxDB Benchmarking Toolkit offers an integrated environment to generate mock data, send it to an InfluxDB server, and visualize the benchmark results. This repository includes modules for data generation, server handling, and result visualization.

## Modules

- **Data Generator**: Creates and dispatches mock data for benchmarking InfluxDB.
- **Node.js Express Server**: Receives and processes data, writing it into InfluxDB.
- **InfluxDB Benchmark Visualization**: Visualizes the benchmark results using logs generated during testing.

## Usage Notes

- **testRunner.js Configuration**: The `testRunner.js` script used for running tests relies on the correct path configuration to the server implementation. Ensure that the `SERVER_SCRIPT_PATH` variable in `testRunner.js` points to the `index.js` file of the server module.
  
- **Log File for Visualization**: The server of visualization module depends on `testLogs.txt` generated after running the tests. Ensure that you provide the appropriate log file for accurate visualization of the benchmark results.