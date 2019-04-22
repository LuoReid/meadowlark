
var fortunesCookies = [
  'Conquer your fears or they will conquer you.',
  'Rivers need springs.',
  "Do not fear what you don't know.",
  "You will have a pleasant surprise.",
  "Whenever possible, keep it simple."
];

exports.getFortune = function () {
  var idx = Math.floor(Math.random() * fortunesCookies.length);
  return fortunesCookies[idx];
};

var tours = [
  { id: 0, name: 'Hood River', price: 99.99 },
  { id: 1, name: 'Oregon Coast', price: 149.95 }
];

exports.getTours = function () {
  return tours;
}

exports.getWeatherData = function () {
  return {
    locations: [
      { name: 'Portland', forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html', iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif', weather: 'Overcast', temp: '54.1 F（12.3 C）' },
      { name: 'Bend', forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html', iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif', weather: 'Partly Cloudy', temp: '55.0 F（12.8 C）' },
      { name: 'Manzanita', forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html', iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif', weather: 'Light Rain', temp: '55.0 F（12.8 C）' }
    ]
  }
}