import React from "react";
import {
  LineChart,
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Legend,
} from "recharts";
import { roundToOneNonZeroDigit } from "../utils";

const TimePerRowVsWorkers = ({ data }) => {
  const aggregateData = (data) => {
    const aggregated = data.reduce((acc, curr) => {
      if (!acc[curr.workersNum]) {
        acc[curr.workersNum] = {
          workersNum: curr.workersNum,
          timePerRowSum: 0,
          count: 0,
        };
      }
      acc[curr.workersNum].timePerRowSum += curr.timePerRow;
      acc[curr.workersNum].count += 1;
      return acc;
    }, {});

    return Object.values(aggregated).map((item) => ({
      workersNum: item.workersNum,
      avgTimePerRow: roundToOneNonZeroDigit(item.timePerRowSum / item.count) || 0,
    }));
  };

  const processData = aggregateData(data);
  console.log(processData);

  return (
    <LineChart
      width={650}
      height={300}
      data={processData}
      margin={{ top: 15, right: 15, left: 50 , bottom: 30 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="workersNum">
        <Label value="Number of Workers" offset={-20} position="insideBottom" />
      </XAxis>
      <YAxis>
        <Label value="Average Process Time (sec)" offset={-40} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
      </YAxis>
      <Tooltip formatter={(value) => [value, 'Time per Row']}/>
      <Legend verticalAlign="top" height={36} formatter={() => 'Time per Row'}/>
      <Line type="monotone" dataKey="avgTimePerRow" stroke="#8884d8" />
    </LineChart>
  );
};

export default TimePerRowVsWorkers;
