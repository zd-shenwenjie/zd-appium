const wd = require('wd');
const appium = require('appium');
const { getDefaultArgs } = require('appium/build/lib/parser');
const { SEREVER_CONFIG, ANDROID_CAPS } = require('./config');

let appiumServer = null;

async function createSession(cfg, caps) {
    const handler = new AppiumMethodHandler(Object.assign(SEREVER_CONFIG, cfg), Object.assign(ANDROID_CAPS, caps));
    await handler.initialize();
    return handler;
}

async function connectStartServer(args) {
    appiumServer = await appium.main(Object.assign(getDefaultArgs(), args));
}

async function connectStopServer() {
    await appiumServer.close();
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