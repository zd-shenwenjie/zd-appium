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
            caps = Object.assign(ANDROID_CAPS, caps);
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

    async source() {
        const source = await this.driver.source();
        return source;
    }

    async takeScreenshot() {
        const screenshot = await this.driver.takeScreenshot();
        return screenshot;
    }

    async windowSize() {
        const size = await this.driver.getWindowSize();
        return size
    }

    async tap(x, y) {
        await (new wd.TouchAction(this.driver))
            .tap({ x, y })
            .perform();
    }

    async swipe(from, to) {
        await (new wd.TouchAction(this.driver))
            .press({ x: from.x, y: from.y })
            .wait(500)
            .moveTo({ x: to.x, y: to.y })
            .release()
            .perform();
    }

    async elementById(id) {
        return await this.driver.elementById(id);
    }

    async waitForElementById(id) {
        return await this.driver.waitForElementById(id);
    }

    async elementsByAccessibilityId(content_desc) {
        return await this.driver.elementsByAccessibilityId(content_desc);
    }

    async waitForElementsByAccessibilityId(content_desc) {
        return await driver.waitForElementsByAccessibilityId(content_desc);
    }

    async elementsByClassName(class_name) {
        return await this.driver.elementsByClassName(class_name);
    }

    async waitForElementsByClassName(class_name) {
        return await this.driver.waitForElementsByClassName(class_name);
    }

    async elementsByXPath(xpath) {
        return await this.driver.elementsByXPath(xpath);
    }

    async waitForElementsByXPath(xpath) {
        return await this.driver.waitForElementsByXPath(xpath)
    }

    async getCurrentActivity() {
        return await this.driver.getCurrentActivity();
    }

    async getCurrentPackage() {
        return await this.driver.getCurrentPackage();
    }

    async startActivity(pkg, activity) {
        return await this.driver.startActivity({appPackage: pkg, appActivity: activity});
    }

}

module.exports = AppiumHandler