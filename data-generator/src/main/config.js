// LOCAL
const apiURL = 'http://localhost:3000';
// AWS
// const apiURL = 'http://ec2-52-3-204-247.compute-1.amazonaws.com:3000';

const tagConf = {
  temperature: { tagIdPrefix: 'tmp', valueRange: [0, 100] },
  humidity: { tagIdPrefix: 'hum', valueRange: [0, 100] },
  light: { tagIdPrefix: 'lght', valueRange: [0, 100000] },
  CO2: { tagIdPrefix: 'cdx', valueRange: [400, 10000] },
  windSpeed: { tagIdPrefix: 'wnds', valueRange: [0, 30] },
  rainfall: { tagIdPrefix: 'rnfl', valueRange: [0, 200] },
  soilTemperature: { tagIdPrefix: 'stmp', valueRange: [-10, 40] },
  leafWetness: { tagIdPrefix: 'lfwn', valueRange: [0, 15] },
  pressure: { tagIdPrefix: 'pres', valueRange: [0, 1050] },
  frequency: { tagIdPrefix: 'frqn', valueRange: [0, 60] }
};

module.exports = {
  apiURL,
  tagConf
};
