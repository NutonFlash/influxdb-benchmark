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
import { roundToOneNonZeroDigit } from "../utils";

const ProcessTimeVsWorkers = ({ data }) => {
  // Function to aggregate data by worker number and calculate avg process time
  const aggregateData = (data) => {
    const aggregated = data.reduce((acc, curr) => {
      if (curr.processTime) {
        if (!acc[curr.workersNum]) {
          acc[curr.workersNum] = {
            workersNum: curr.workersNum,
            processTimeSum: 0,
            count: 0,
          };
        }
        acc[curr.workersNum].processTimeSum += curr.processTime;
        acc[curr.workersNum].count += 1;
      }
      return acc;
    }, {});

    return Object.values(aggregated).map((item) => ({
      workersNum: item.workersNum,
      avgProcessTime:
        parseFloat(roundToOneNonZeroDigit(item.processTimeSum / item.count)) ||
        console.log("error in process time: ", item.processTimeSum, item.count),
    }));
  };

  const processData = aggregateData(data);

  return (
    <LineChart
      width={650}
      height={300}
      data={processData}
      margin={{ top: 15, right: 15, left: 40, bottom: 30 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="workersNum">
        <Label value="Number of Workers" offset={-20} position="insideBottom" />
      </XAxis>
      <YAxis>
        <Label
          value="Average Process Time (sec)"
          offset={-20}
          angle={-90}
          position="insideLeft"
          style={{ textAnchor: "middle" }}
        />
      </YAxis>
      <Tooltip formatter={(value) => [value, "Process Time"]} />
      <Legend
        verticalAlign="top"
        height={36}
        formatter={(value) => "Process Time"}
      />
      <Line type="monotone" dataKey="avgProcessTime" stroke="#8884d8" />
    </LineChart>
  );
};

export default ProcessTimeVsWorkers;
