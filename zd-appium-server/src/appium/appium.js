
const path = require('path');
const appium = require('appium');
const { fs, tempDir } = require('appium-support');
const { getDefaultArgs } = require('appium/build/lib/parser');
const { logger } = require('../logger');
const AppiumHandler = require('./handler')

const LOG_SEND_INTERVAL_MS = 250;

let appiumServer = null;
let appiumHandler = null;
let appiumSender = null;
let logWatcher = null;
let logFile = null;
let batchedLogs = [];
let isStarted = false;

async function createSession(cfg, caps) {
    let sessionId = null;
    try {
        const handler = new AppiumHandler();
        handler.addListener(appiumHandlerListener);
        await handler.initialize(cfg, caps);
        appiumHandler = handler;
        sessionId = appiumHandler.sessionId;
        if (typeof appiumSender == 'function') {
            appiumSender('new_session');
        }
    } catch (error) {
        logger.error('createSession err->' + error.message);
    }
    return sessionId;
}

async function killSession() {
    if (appiumHandler) {
        await appiumHandler.close();
        appiumHandler = null;
        if (typeof appiumSender == 'function') {
            appiumSender('kill_session');
        }
    }
}

const appiumHandlerListener = function (status) {
    if(status == 'invalid' || status == 'error') {
        killSession();
        appiumSender('session_invalid');
    }
}

function checkSession(sessionId) {
    if (appiumHandler && appiumHandler.sessionId && sessionId) {
        return sessionId == appiumHandler.sessionId;
    }
    return false;
}

function connectKeepAlive(sessionId) {
    if (checkSession(sessionId)) {
        appiumHandler.keepSessionAlive();
    }
}

async function connectStartServer(args) {
    args = Object.assign(getDefaultArgs(), args);
    try {
        const dir = await tempDir.openDir();
        logFile = path.resolve(dir, 'appium-server-logs.txt');
        logger.info('logFile ->' + logFile);
    } catch (error) {
        logger.error('logFile error ->' + error.message);
    }

    if (args.defaultCapabilities && Object.keys(args.defaultCapabilities).length === 0) {
        delete args.defaultCapabilities;
    }
    args.logHandler = (level, msg) => {
        batchedLogs.push({ level, msg });
    };
    args.throwInsteadOfExit = true;
    logWatcher = setInterval(async () => {
        if (batchedLogs.length) {
            try {
                await fs.writeFile(
                    logFile,
                    batchedLogs.map((log) => `[${log.level}] ${log.msg}`).join('\n'),
                    { flag: 'a' }
                );
                if (typeof appiumSender == 'function') {
                    appiumSender('send_log', batchedLogs);
                }
            } catch (error) {
                logger.error(error.message);
            }
            batchedLogs.splice(0, batchedLogs.length);
        }
    }, LOG_SEND_INTERVAL_MS);
    appiumServer = await appium.main(args);
    isStarted = true;
    if (typeof appiumSender == 'function') {
        appiumSender('start_server');
    }
}

async function connectStopServer() {
    await killSession();
    await appiumServer.close();
    clearInterval(logWatcher);
    isStarted = false;
    if (typeof appiumSender == 'function') {
        appiumSender('stop_server');
    }
}

function appiumServerStatus() {
    let handler = {};
    if (appiumHandler) {
        handler = {
            cfg: appiumHandler.serverConfig,
            caps: appiumHandler.capabilities
        };
    }
    return {
        isStarted,
        handler
    };
}

function setAppiumSender(sender) {
    if (typeof sender == 'function') {
        appiumSender = sender
    }
}

async function readLogFile() {
    let log = '';
    if (logFile) {
        const buf = await fs.readFile(logFile);
        log = buf.toString();
    }
    return log;
}

module.exports = {
    readLogFile,
    createSession,
    killSession,
    connectStartServer,
    connectStopServer,
    appiumServerStatus,
    connectKeepAlive,
    setAppiumSender
};