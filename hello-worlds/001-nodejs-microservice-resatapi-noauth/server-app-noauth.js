import express from 'express';
import os from 'os';

var hostname = os.hostname();

const server_port = process.env.SERVER_PORT || 9001;

const app = express();
var reqSeq = 0;

function mylog (logmsg) {
    
    console.log(`Req<${reqSeq}> H<${hostname}>  T<${new Date().toISOString()}>  ${logmsg}`);
}

app.listen(server_port, () =>
    mylog(`Server started at port ${server_port}. Try http://localhost:${server_port}/
    working routes 
    http://localhost:${server_port}/
    http://localhost:${server_port}/healthcheck`)
);


app.use(function (req, res, next) {
    mylog(`Req entry point. URL=${req.originalUrl}; method=${req.method} :: reqSeq incremented - ${reqSeq++}`);
    next();
  })

// show a response
app.get('/', (req, res) => {
    mylog(`Processing URL ${req.baseUrl}`);
    res.send(`Hello World!<br/> Sample nodejs express app <br/> 
    working routes 
   <div><a href="http://localhost:${server_port}/">/</a></div>
   <div><a href="http://localhost:${server_port}/healthcheck">/healthcheck</a></div>
    `);
});

// show a response
app.get('/healthcheck', (req, res) => {
    mylog(`Processing URL ${req.baseUrl}`);
    res.send('HEALTHY');
});

async function closeGracefully (signal) {
	console.log ("I'll close gracefully!....\n");
	process.exit (1);
}
process.on('SIGINT', closeGracefully);