import express from 'express';
import os from 'os';

var hostname = os.hostname();

const server_port = process.env.SERVER_PORT || 9001;

const app = express();
var reqSeq = 0;

function mylog (logmsg) {
    var curtime = new Date().toTimeString();
    
    console.log(`Req<${reqSeq}> H<${hostname}> T<${Date.now()}>  T<${curtime}>  ${logmsg}`);
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
    res.send('Hello World!<br/> Sample nodejs express app <br/>');
});

async function closeGracefully (signal) {
	console.log ("I'll close gracefully!....\n");
	process.exit (1);
}
process.on('SIGINT', closeGracefully);