import express from 'express';
import os from 'os';
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config();

var hostname = os.hostname();

const server_port = process.env.MICROSERVICE_APP1_SERVER_PORT || 9001;

const app = express();
var reqSeq = 0;

function mylog (logmsg) {
    var curtime = new Date().toISOString();
    
    console.log(`Req<${reqSeq}> H<${hostname}> T<${Date.now()}>  T<${curtime}>  ${logmsg}`);
}

app.listen(server_port, () =>
    mylog(`Server started at port ${server_port}. Try http://${hostname}:${server_port}/`)
);

app.use(cors({ credentials: true, origin: true }));

app.use(function (req, res, next) {
    
    mylog(`Req entry point. URL=${req.originalUrl}; method=${req.method} :: reqSeq incremented - ${reqSeq++}`);

   
       // Set to true if you need the website to include cookies in the requests sent
       // to the API (e.g. in case you use sessions)
       res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  })

// show a response
app.get('/', (req, res) => {
    mylog(`Processing URL ${req.baseUrl} max listeners set ${app.getMaxListeners()}`);
    res.status(200).send(`Hello World!<br/> Sample nodejs express app.  The only service available is <a href=http://${hostname}:${server_port}/healthcheck>http://${hostname}:${server_port}/healthcheck </a>
     <br/>`);
});

app.get('/healthcheck', (req, res) => {
    res.setHeader('content-type', "text/plain")
    mylog(`Processing URL ${req.baseUrl} max listeners set ${app.getMaxListeners()}`);
    res.status(200).send(`HEALTHY from ${os.hostname}`);
});

async function closeGracefully (signal) {
	console.log ("I'll close gracefully!....\n");
	process.exit (1);
}
process.on('SIGINT', closeGracefully);

