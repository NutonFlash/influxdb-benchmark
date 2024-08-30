import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
} from "recharts";
import { roundToOneNonZeroDigit} from '../utils';

const ProcessTimeVsBatchSize = ({ data }) => {
  const aggregateData = (data) => {
    const aggregated = data.reduce((acc, curr) => {
      if (!acc[curr.batchSize]) {
        acc[curr.batchSize] = {
          batchSize: curr.batchSize,
          processTimeSum: 0,
          count: 0,
        };
      }
      acc[curr.batchSize].processTimeSum += curr.processTime;
      acc[curr.batchSize].count += 1;
      return acc;
    }, {});

    return Object.values(aggregated).map((item) => ({
      batchSize: item.batchSize,
      avgProcessTime: roundToOneNonZeroDigit(item.processTimeSum / item.count) || 0,
    }));
  };

  const processData = aggregateData(data);

  return (
    <LineChart
      width={650}
      height={300}
      data={processData}
      margin={{ top: 15, right: 20, left: 20, bottom: 15 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="batchSize">
        <Label value="Batch Size" offset={-10} position="insideBottom" />
      </XAxis>
      <YAxis>
        <Label
          value="Average Process Time (sec)"
          offset={-10}
          angle={-90}
          position="insideLeft"
          style={{ textAnchor: "middle" }}
        />
      </YAxis>
      <Tooltip formatter={(value) => [value, 'Process Time']}/>
      <Legend verticalAlign="top" height={36} formatter={(value) => 'Process Time'}/>
      <Line type="monotone" dataKey="avgProcessTime" stroke="#8884d8" />
    </LineChart>
  );
};

export default ProcessTimeVsBatchSize;
