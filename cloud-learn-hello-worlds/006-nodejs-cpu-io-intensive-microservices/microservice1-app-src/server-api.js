import express from 'express';
import { logger } from './utils/myapplogger.js';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';

dotenv.config(); // all env specified in .env file will be availabe to the app

logger.info({ msgid: "main-1", msg: "Logger working here too" });
logger.debug("process env", process.env);
logger.debug ({ filename: `${process.env.LOGFILE_ERROR || 'server-err.log'}`, level: 'error' })

const server_port = process.env.SERVER_PORT || 9001;
const app = express();
var reqSeq = 0;
const hostname = os.hostname();

app.use(express.json());

app.listen(server_port, () => {
    console.log(`Server started at ${server_port}`);
    logger.info({ msgid: "main-3", msg: "server started", port: `${server_port}` });
});

app.use(function (req, res, next) {
    reqSeq ++;
    
    logger.info({ msgid: "main-3", msg: "Req received",  reqSeq, hostname });
    next();
});

app.get('/cpuintensive/:fibonum', (req, res) => {
    logger.info({ msgid: "main-4", msg: "cpuintensive calc req received", reqId: `${reqSeq}`, fibonum: `${req.params.fibonum}` });
    try {
        const fibonacci_res = fibonacci(req.params.fibonum);
        logger.info({ msgid: "main-5", msg: "fibonacci calculated", fibonacci_res: `${fibonacci_res}` });
        res.send(`Hello World! Calculated fibonacci of ${req.params.fibonum}  is ${fibonacci_res} <br/>`);
    } catch (err) {
        logger.error('fibonacci calc error', err, { msgid: "main-3", msg: "refer error stack", reqId: `${reqSeq}` });
        return res.status(500).send();
    }

});

//cpu intensive function
function fibonacci(n) {

    if (n < 2)
        return 1;
    else return fibonacci(n - 2) + fibonacci(n - 1);
}


app.get('/iointensive/:filename', (req, res) => {
    logger.info({ msgid: "main-6", msg: "iointensive - read large fil req received", reqId: `${reqSeq}`, filename: `${req.params.filename}` });
     const chunkRead = readLargeFile(req.params.filename)
     .catch((err)=> {
         logger.error("req failed in read file", err);
         res.send("Err");
        })
     .then((retval)=> {
         logger.info(`chun count received ${retval}`);
        res.send(`Hello World! I finished reading the file. Chunks read ${retval} <br/>`);
        });

});

async function readLargeFile(inputfile) {
    //create large file in windows using this command
    //fsutil file  createNew largefile 8024000111

    var chunkCount = 0;
    const reader = fs.createReadStream('C:\\Temp\\largefile');
    return new Promise((resolve, reject) => {
        reader
            .on('data', (chunk) => {
                chunkCount++;
                //console.log(chunk.toString());
                if ((chunkCount % 10000) === 0) {
                    logger.info({ msg: `READING FILE CONTINUING... chunkCount ${chunkCount}`, msgid: `${reqSeq}` });
                }
            })
            .on('end', () => { logger.info({ msg: `reading ended ${chunkCount}`, msgid: `${reqSeq}` }); resolve(chunkCount); })
            .on('close', () => { logger.info({ msg: `closed file ${chunkCount}`, msgid: `${reqSeq}` }); })
            .on('error', (readerr) => { logger.error("failed", readerr, { msg: `reading failed ${chunkCount}`, msgid: `${reqSeq}` }); reject(); });
        logger.info({ msg: `reading finished chunkCount ${chunkCount}`, msgid: `${reqSeq}` });
    });

}

