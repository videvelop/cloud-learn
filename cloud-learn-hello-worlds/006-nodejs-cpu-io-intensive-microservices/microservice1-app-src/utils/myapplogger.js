import winston from 'winston';
import dotenv from 'dotenv';
dotenv.config(); 

console.log(`Loglevel set is ${process.env.LOGLEVEL}`);
export const logger = winston.createLogger({
  level: process.env.LOGLEVEL || 'info',
  meta: true,
  defaultMeta: { service: 'MICRO-SVC1' },
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss Z'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()  ),

  transports: [
    //
    // - Write to all logs with level `info` and below to all log.
    // - Write all logs error (and below) to error log.
    //
    new winston.transports.File({ filename: `${process.env.LOGFILE_ERROR || 'server-err.log'}`, level: 'error' }),
    new winston.transports.File({ filename: `${process.env.LOGFILE_ALL || 'server-all.log'}` }),
    
  ]
});

if (process.env.NODE_ENV !== 'prod') {
  logger.add(new winston.transports.Console({ }));
}
logger.info ({msgid: 1, msg: "logger setup"});
