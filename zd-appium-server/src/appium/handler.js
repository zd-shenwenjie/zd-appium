const wd = require('wd');
const { logger } = require('../logger');
const { SEREVER_CONFIG, ANDROID_CAPS } = require('./config');

const KEEP_ALIVE_PING_INTERVAL = 5 * 1000;
const NO_NEW_COMMAND_LIMIT = 30 * 1000
class AppiumHandler {

    constructor() {
        this.driver = null;
        this.keepAlive = null;
        this.sessionId = '';
        this.serverConfig = {};
        this.capabilities = {};
        this._lastActiveMoment = +(new Date());
        this.listener = null;
    }

    async initialize(cfg, caps) {
        try {
            cfg = Object.assign(SEREVER_CONFIG, cfg);
            caps = Object.assign(ANDROID_CAPS, caps)
            this.driver = await wd.promiseChainRemote(cfg);
            await this.driver.init(caps);
            this.serverConfig = cfg;
            this.capabilities = caps;
            this.sessionId = await this.driver.getSessionId();
            this.runKeepAliveLoop();
        } catch (error) {
            logger.error('initialize->' + error.message);
        }
    }

    async close() {
        try {
            this.killKeepAliveLoop();
            await this.driver.quit();
        } catch (error) {
            logger.error(error.message)
        }
    }

    keepSessionAlive() {
        this._lastActiveMoment = +(new Date());
        logger.warn('@@@@@' + this._lastActiveMoment);
    }

    runKeepAliveLoop() {
        this.keepAlive = setInterval(() => {
            try {
                this.driver.sessionCapabilities();
                const now = +(new Date());
                if (now - this._lastActiveMoment > NO_NEW_COMMAND_LIMIT) {
                    if (typeof this.listener == 'function') {
                        this.listener('invalid');
                    }
                }
            } catch (error) {
                logger.info(error.message);
                if (typeof this.listener == 'function') {
                    this.listener('error');
                }
            }
        }, KEEP_ALIVE_PING_INTERVAL);
    }

    killKeepAliveLoop() {
        clearInterval(this.keepAlive);
    }

    addListener(listener) {
        if (typeof listener == 'function') {
            this.listener = listener;
        }
    }

    // async fetchElement(strategy, selector) {

    // }

    // async fetchElements(strategy, selector) {

    // }

    // async execute({ elementId, methodName, args, skipScreenshotAndSource }) {

    // }

}

module.exports = AppiumHandler