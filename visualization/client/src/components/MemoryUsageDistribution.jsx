import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { roundToOneNonZeroDigit } from "../utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const aggregateData = (data) => {
  const aggregated = data.reduce(
    (acc, curr) => {
      acc.influxDBMemSum += curr.influxDB;
      acc.serverMemSum += curr.server;
      acc.generatorMemSum += curr.generator;
      acc.count += 1;
      return acc;
    },
    { influxDBMemSum: 0, serverMemSum: 0, generatorMemSum: 0, count: 0 }
  );

  return [
    {
      name: "avgInfluxDBMem",
      value:
        roundToOneNonZeroDigit(aggregated.influxDBMemSum / aggregated.count) ||
        0,
    },
    {
      name: "avgServerMem",
      value:
        roundToOneNonZeroDigit(aggregated.serverMemSum / aggregated.count) || 0,
    },
    {
      name: "avgGeneratorMem",
      value:
        roundToOneNonZeroDigit(aggregated.generatorMemSum / aggregated.count) ||
        0,
    },
  ];
};

const MemoryUsageDistribution = ({ data, workersNum }) => {
  const [processData, setProcessData] = useState([]);

  useEffect(() => {
    if (data.length && workersNum) {
      console.log(data);
      const filteredData = data.filter((log) => log.workersNum === workersNum);
      const memoryData = filteredData.map((d) => ({
        influxDB: d.memUsageMB.influxDB,
        server: d.memUsageMB.server,
        generator: d.memUsageMB.generator,
      }));

      const proccessData = aggregateData(memoryData);
      console.log("UPDATED proccessData: ", proccessData);
      setProcessData(proccessData);
    }
  }, [data, workersNum]);

  const renderCustomizedLabel = ({ name, value }) => {
    return `${name.replace("avg", "").replace("Mem", "")} (${value} mb)`;
  };

  return (
    <PieChart
      width={400}
      height={300}
      margin={{ top: 25, right: 50, left: 50, bottom: 25 }}
    >
      <Pie
        data={processData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        labelLine={false}
        label={renderCustomizedLabel}
      >
        {processData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value, name) => [
          value,
          name.replace("avg", "").replace("Mem", ""),
        ]}
      />
    </PieChart>
  );
};

export default MemoryUsageDistribution;
