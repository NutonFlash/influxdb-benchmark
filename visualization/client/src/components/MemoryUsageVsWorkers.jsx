import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { roundToOneNonZeroDigit} from '../utils';

const MemoryUsageVsWorkers = ({ data }) => {
  const memoryData = data.map(d => ({
    workersNum: d.workersNum,
    influxDB: d.memUsageMB.influxDB,
    server: d.memUsageMB.server,
    generator: d.memUsageMB.generator,
  }));

  const aggregateData = (data) => {
    const aggregated = data.reduce((acc, curr) => {
      if (!acc[curr.workersNum]) {
        acc[curr.workersNum] = { workersNum: curr.workersNum, influxDBMemSum: 0, serverMemSum: 0, generatorMemSum: 0, count: 0 };
      }
      acc[curr.workersNum].influxDBMemSum += curr.influxDB;
      acc[curr.workersNum].serverMemSum += curr.server;
      acc[curr.workersNum].generatorMemSum += curr.generator;
      acc[curr.workersNum].count += 1;
      return acc;
    }, {});

    return Object.values(aggregated).map(item => ({
      workersNum: item.workersNum,
      avgInfluxDBMem: roundToOneNonZeroDigit(item.influxDBMemSum / item.count) || 0,
      avgServerMem: roundToOneNonZeroDigit(item.serverMemSum / item.count) || 0,
      avgGeneratorMem: roundToOneNonZeroDigit(item.generatorMemSum / item.count) || 0,
    }));
  };

  const processData = aggregateData(memoryData);

  return (
    <LineChart width={650}
    height={300}
    data={processData}
    margin={{ top: 15, right: 20, left: 20, bottom: 25 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="workersNum">
      <Label value="Number of Workers" offset={-20} position="insideBottom" />
      </XAxis>
      <YAxis>
      <Label value="Average Memory Usage (MB)" offset={-10} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
      </YAxis>
      <Tooltip formatter={(value, name) => [value, name.replace('avg', '').replace('Mem', '')]}/>
      <Legend verticalAlign="top" height={36} formatter={(value) => value.replace('avg', '').replace('Mem', '')}/>
      <Line type="monotone" dataKey="avgInfluxDBMem" stroke="#8884d8" />
      <Line type="monotone" dataKey="avgServerMem" stroke="#82ca9d" />
      <Line type="monotone" dataKey="avgGeneratorMem" stroke="#ffc658" />
    </LineChart>
  );
};

export default MemoryUsageVsWorkers;
