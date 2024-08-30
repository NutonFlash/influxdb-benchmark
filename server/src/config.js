const SERVER_PORT = 3000;

const INFLUX_URL =
  'http://ec2-50-19-174-162.compute-1.amazonaws.com:8086/';
const INFLUX_TOKEN =
  '-1dusZuRgmP38SbHJIgz54LEVTpoCkq7DNojOCd2e8sqrH5PvwMk9L-Pet3J5CiLtBcuH7f5CfVFV3nkoZqD8w==';
const INFLUX_ORG = 'KREPS';
const INFLUX_BUCKET = 'sensorsData';

module.exports = {
  SERVER_PORT,
  INFLUX_URL,
  INFLUX_TOKEN,
  INFLUX_ORG,
  INFLUX_BUCKET
};
