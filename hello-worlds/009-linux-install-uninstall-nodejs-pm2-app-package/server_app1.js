var http = require('http');

http.createServer(function (req, res) {
  res.write(`Hello World! serving from ${process.env.PORT} PID=${process.pid}`);
  res.end();
  console.log(`PORT=${process.env.PORT} PID=${process.pid} New hello! `);
  }).listen(process.env.PORT || 3001);