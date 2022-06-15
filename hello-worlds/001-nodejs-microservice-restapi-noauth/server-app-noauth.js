import express from 'express';
import os from 'os';

var hostname = os.hostname();

const server_port = process.env.SERVER_PORT || 9001;

const app = express();
var reqSeq = 0;

function mylog (logmsg) {
    
    console.log(`Req<${reqSeq}> H<${hostname}>  T<${new Date().toISOString()}>  ${logmsg}`);
}

function nwIPs () {
    var ret="";
    const nets = os.networkInterfaces();

    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
            ret=ret+`IP address is ${results[name]}\n`);
        }
    }
    }
return ret;
}

app.listen(server_port, () => {
    mylog(`Server started at port ${server_port}. Try http://localhost:${server_port}/
    working routes 
    http://localhost:${server_port}/
    http://localhost:${server_port}/healthcheck`);
    nwIPs ();
}
);


app.use(function (req, res, next) {
    mylog(`Req entry point. URL=${req.originalUrl}; method=${req.method} :: reqSeq incremented - ${reqSeq++}`);
    next();
  })

// show a response
app.get('/', (req, res) => {
    const myip = nwIPs();
    mylog(`Processing URL ${req.baseUrl}`);
    res.send(`Hello World!<br/> Sample nodejs express app <br/> 
    working routes 
   <div><a href="http://localhost:${server_port}/">/</a></div>
   <div><a href="http://localhost:${server_port}/healthcheck">/healthcheck</a></div>
  <div> IP address of this machine ${myip} </div> 
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