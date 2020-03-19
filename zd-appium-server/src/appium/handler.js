const path = require('path');
const wd = require('wd');
const appium = require('appium');
const { getDefaultArgs } = require('appium/build/lib/parser');
const { SEREVER_CONFIG, ANDROID_CAPS } = require('./config');
const { fs, tempDir } = require('appium-support');
const { logger } = require('../logger');
const SocketClient = require('socket.io-client');
const client = new SocketClient('http://localhost:7001');

const LOG_SEND_INTERVAL_MS = 250;
let appiumServer = null;
let logWatcher = null;
let logFile = null;
let batchedLogs = [];

async function createSession(cfg, caps) {
    const handler = new AppiumMethodHandler(Object.assign(SEREVER_CONFIG, cfg), Object.assign(ANDROID_CAPS, caps));
    await handler.initialize();
    return handler;
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
                const log = batchedLogs.map((log) => `[${log.level}] ${log.msg}`).join('\n');
                await fs.writeFile(logFile, log, { flag: 'a' });
                client.emit('log', log);
            } catch (ign) { }
            batchedLogs.splice(0, batchedLogs.length);
        }
    }, LOG_SEND_INTERVAL_MS);
    appiumServer = await appium.main(args);
}

async function connectStopServer() {
    await appiumServer.close();
    clearInterval(logWatcher);
}

class AppiumMethodHandler {

    constructor(cfg, caps) {
        this.driver = null;
        this.serverConfig = cfg;
        this.desiredCapabilities = caps;
    }

    async initialize() {
        this.driver = await wd.promiseChainRemote(this.serverConfig);
        await this.driver.init(this.desiredCapabilities);
    }

    async fetchElement(strategy, selector) {

    }

    async fetchElements(strategy, selector) {

    }

    async execute({ elementId, methodName, args, skipScreenshotAndSource }) {

    }

    async close() {
        await this.driver.quit()
    }

}

module.exports = {
    createSession,
    connectStartServer,
    connectStopServer
};