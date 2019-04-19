
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

exports.getTours = function(){
  return tours;
}