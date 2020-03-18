const log4js = require('log4js');

log4js.configure({
    appenders: {
        consoleLog: {
            type: 'console'
        },
        dateFileLog: {
            type: 'console'
        },
    },
    categories: {
        default: {
            appenders: ['consoleLog', 'dateFileLog'],
            level: 'all',
            enableCallStack: true
        },
        dev: {
            appenders: ['consoleLog'],
            level: 'all',
            enableCallStack: true
        },
        pro: {
            appenders: ['consoleLog', 'dateFileLog'],
            level: 'info'
        },
    }
});

const category = process.env.NODE_ENV === 'production' ? 'pro' : 'dev';
const logger = log4js.getLogger(category);
logger.level = 'all';

module.exports = { logger };