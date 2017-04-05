var path = require('path');
var parse = require('./parse.js');
var data = require('./data.json');

var datastring = JSON.stringify(data);

var s = Date.now();
var sss = parse(datastring);
var e = Date.now() - s;

console.log('>>>>',e);

console.log(sss);