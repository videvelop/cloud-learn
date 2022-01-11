import express from 'express';
import os from 'os';

var hostname = os.hostname();

const server_port = process.env.SERVER_PORT || 9001;

const app = express();
var reqSeq = 0;

function mylog (logmsg) {
    console.log(`Req<${reqSeq}> H<${hostname}> T<${Date.now()}> ${logmsg}`);
}

app.listen(server_port, () =>
    mylog(`Server started at port ${server_port}. Try http://${hostname}:${server_port}/`)
);


app.use(function (req, res, next) {
    mylog(`Req entry point. URL=${req.originalUrl}; method=${req.method} :: reqSeq incremented - ${reqSeq++}`);
    next();
  })

// show a response
app.get('/', (req, res) => {
    mylog(`Processing URL ${req.baseUrl}`);
    res.send(`Hello World!<br/> Sample nodejs express app ${hostname} <br/>`);
});