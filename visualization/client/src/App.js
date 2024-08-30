import React, { useEffect, useState } from "react";
import ProcessTimeVsWorkers from "./components/ProcessTimeVsWorkers";
import MemoryUsageVsWorkers from "./components/MemoryUsageVsWorkers";
import ProcessTimeVsBatchSize from "./components/ProcessTimeVsBatchSize";
import MemoryUsageDistribution from "./components/MemoryUsageDistribution";
import TimePerRowVsWorkers from "./components/TimePerRowVsWorkers";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [tagsAmount, setTagsAmount] = useState(0);
  const [workersNumMemDistr, setWorkersNumMemDistr] = useState(0);

  const [uniqueTagsAmount, setUniqueTagsAmount] = useState([]);
  const [uniqueWorkersNum, setUniqueWorkersNum] = useState([]);

  useEffect(() => {
    fetch("/logs")
      .then((rawResponse) => rawResponse.json())
      .then((jsonResponse) => {
        if (jsonResponse.type === "success") {
          const { data } = jsonResponse;
          console.log("data recevied: ", data);
          setData(data);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  useEffect(() => {
    if (data.length) {
      const tagsAmountList = data.map((tag) => tag.rowsReceived);
      const uniqueTagsAmount = [...new Set(tagsAmountList)];

      const [entryLog] = data;
      const { rowsReceived: initTagsAmount } = entryLog;

      const workersNumList = data
        .filter((log) => log.rowsReceived === initTagsAmount)
        .map((log) => log.workersNum);
      const uniqueWorkersNum = [...new Set(workersNumList)];

      setUniqueTagsAmount(uniqueTagsAmount);
      setUniqueWorkersNum(uniqueWorkersNum);
      setTagsAmount(initTagsAmount);
      setWorkersNumMemDistr(uniqueWorkersNum[0]);

      console.log("Data has been updated:");
      console.log("uniqueTagsAmount: ", uniqueTagsAmount);
      console.log("uniqueWorkersNum: ", uniqueWorkersNum);
      console.log("initTagsAmount: ", initTagsAmount);
      console.log("workersNumMemDistr: ", uniqueWorkersNum[0]);
    }
  }, [data]);

  useEffect(() => {
    if (data.length && tagsAmount) {
      const filteredData = data.filter(
        (log) => log.rowsReceived === tagsAmount
      );

      const workerNumsList = filteredData.map((log) => log.workersNum);
      const uniqueWorkersNum = [...new Set(workerNumsList)];

      console.log("filteredData: ", filteredData);
      console.log("workersNumMemDistr: ", uniqueWorkersNum[0]);
      console.log("uniqueWorkersNum: ", uniqueWorkersNum);

      setFilteredData(filteredData);
      setWorkersNumMemDistr(uniqueWorkersNum[0]);
      setUniqueWorkersNum(uniqueWorkersNum);
    }
  }, [tagsAmount, data]);

  return (
    <div id='content-wrapper'>
      <h1 style={{ fontSize: 36 }}>Performance Metrics</h1>
      <div style={{ margin: "2rem 0" }}>
        <label>Select Tags Amount:</label>
        <select
          value={tagsAmount}
          onChange={(e) => setTagsAmount(parseInt(e.target.value, 10))}
        >
          {uniqueTagsAmount.map((tagAmount) => (
            <option key={`key-${tagAmount}`} value={tagAmount}>
              {tagAmount}
            </option>
          ))}
        </select>
      </div>
      <div className="charts-common-container">
        <div className="charts-row-container">
          <div>
            <h3 className="graph-header">Process Time Vs Workers</h3>
            <ProcessTimeVsWorkers data={filteredData} />
          </div>
          <div>
            <h3 className="graph-header">Memory Usage Vs Workers</h3>
            <MemoryUsageVsWorkers data={filteredData} />
          </div>
        </div>
        <div className="charts-row-container">
          <div>
            <h3 className="graph-header">Process Time Vs Batch Size</h3>
            <ProcessTimeVsBatchSize data={filteredData} />
          </div>
          <div id="mem-distrub-container">
            <div>
              <h3 className="graph-header">Memory Usage Distribution</h3>
              <label>Select Workers Number:</label>
              <select
                value={workersNumMemDistr}
                onChange={(e) => {
                  const newWorkersNum = parseInt(e.target.value, 10);
                  console.log("newWorkersNum: ", newWorkersNum);
                  setWorkersNumMemDistr(newWorkersNum);
                }}
              >
                {uniqueWorkersNum.map((workerNum) => (
                  <option key={`key-${workerNum}`} value={workerNum}>
                    {workerNum}
                  </option>
                ))}
              </select>
            </div>
            <div id="mem-distrub-graph-container">
              <MemoryUsageDistribution
                data={filteredData}
                workersNum={workersNumMemDistr}
              />
            </div>
          </div>
        </div>
        <div className="charts-row-container">
          <div  style={{ margin: 0 }}>
            <h3 className="graph-header">Time Per Row Vs Workers</h3>
            <TimePerRowVsWorkers data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
