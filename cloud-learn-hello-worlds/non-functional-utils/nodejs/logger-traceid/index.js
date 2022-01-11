import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  meta: true,
  defaultMeta: { service: 'MICRO-SVC1' },
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss Z'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json() ),

  transports: [
    new winston.transports.File({ filename: 'server-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'server-all.log' })
  ]
});



// if not production, log into the console also
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ }));
}
logger.info ({msgid: 1, msg: "logger setup"});
logger.info ({msgid: 1, msg: "logger setup"});
logger.info("abc", {"x": "ox", "y": "oy"});
logger.warn(new Error('Error passed as info'));
logger.info('Found %s at %s', 'error', new Error('chill winston'));
logger.error('Found %s at %s', 'error', new Error('chill winston'));

/*
logger.log({
  level: 'info',
  message: 'Pass an object and this works'
});

logger.info("info message");

logger.log('info', 'Pass a message and this works', {
    additional: 'properties',
    are: 'passed along'
  });


logger.info({
  message: 'Use a helper method if you want',
  additional: 'properties',
  are: 'passed along'
});


// info: test message my string {}
logger.log('info', 'test message %s', 'my string');

// info: test message 123 {}
logger.log('info', 'test message %d', 123);

// info: test message first second {number: 123}
logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });

// prints "Found error at %s"
logger.info('Found %s at %s', 'error', new Date());
logger.info('Found %s at %s', 'error', new Error('chill winston'));
logger.info('Found %s at %s', 'error', /WUT/);
logger.info('Found %s at %s', 'error', true);
logger.info('Found %s at %s', 'error', 100.00);
logger.info('Found %s at %s', 'error', ['1, 2, 3']);

// ***************
// Allows for logging Error instances
// ***************


logger.log('error', new Error('Error passed as message'));

logger.warn('Maybe important error: ', new Error('Error passed as meta'));
logger.log('error', 'Important error: ', new Error('Error passed as meta'));

logger.error(new Error('Error as info'));
*/