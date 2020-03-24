const path = require('path');
const wd = require('wd');
const appium = require('appium');
const { getDefaultArgs } = require('appium/build/lib/parser');
const { SEREVER_CONFIG, ANDROID_CAPS } = require('./config');
const { fs, tempDir } = require('appium-support');
const { logger } = require('../logger');
const crypto = require("crypto");

const LOG_SEND_INTERVAL_MS = 250;
const KEEP_ALIVE_PING_INTERVAL = 5 * 1000;

let appiumServer = null;
let logSender = null;
let logWatcher = null;
let logFile = null;
let batchedLogs = [];
let appiumServerStatus = false;
let appiumHandlers = {};

async function createSession(cfg, caps) {
    let id = null;
    try {
        const handler = new AppiumMethodHandler(Object.assign(SEREVER_CONFIG, cfg), Object.assign(ANDROID_CAPS, caps));
        await handler.initialize();
        id = crypto.randomBytes(16).toString("hex").substr(0, 6);
        appiumHandlers[id] = handler;
    } catch (error) {
        logger.error('createSession err->' + error.message);
    }
    return id;
}

async function killSession(handlerId) {
    if (appiumHandlers.hasOwnProperty(handlerId)) {
        const handler = appiumHandlers[handlerId];
        await handler.close();
        delete appiumHandlers[handlerId];
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
                if (typeof logSender == 'function') {
                    logSender(batchedLogs);
                }
            } catch (error) {
                logger.error(error.message);
            }
            batchedLogs.splice(0, batchedLogs.length);
        }
    }, LOG_SEND_INTERVAL_MS);
    appiumServer = await appium.main(args);
    appiumServerStatus = true;
}

async function connectStopServer() {
    await appiumServer.close();
    clearInterval(logWatcher);
    appiumServerStatus = false
}

function isAppiumServerStarted() {
    return appiumServerStatus;
}

function setLogSender(sender) {
    logSender = sender;
}

async function readLogFile() {
    let log = '';
    if (logFile) {
        const buf = await fs.readFile(logFile);
        log = buf.toString();
    }
    return log;
}

class AppiumMethodHandler {

    constructor(cfg, caps) {
        this.driver = null;
        this.keepAlive = null;
        this.serverConfig = cfg;
        this.desiredCapabilities = caps;
    }

    async initialize() {
        this.driver = await wd.promiseChainRemote(this.serverConfig);
        const p = this.driver.init(this.desiredCapabilities);
        await p;
        this.runKeepAliveLoop();
    }

    async close() {
        try {
            this.killKeepAliveLoop();
            await this.driver.quit();
        } catch (error) {
            logger.error(error.message)
        }
    }

    runKeepAliveLoop() {
        this.keepAlive =  setInterval(() => {
            try {
                this.driver.sessionCapabilities();
            } catch (error) {
                logger.info(error.message);
                this.close();
            }
        }, KEEP_ALIVE_PING_INTERVAL);
    }

    killKeepAliveLoop() {
        clearInterval(this.keepAlive);
    }

    async fetchElement(strategy, selector) {

    }

    async fetchElements(strategy, selector) {

    }

    async execute({ elementId, methodName, args, skipScreenshotAndSource }) {

    }

}

module.exports = {
    setLogSender,
    readLogFile,
    createSession,
    killSession,
    connectStartServer,
    connectStopServer,
    isAppiumServerStarted,
};