
const path = require('path');
const appium = require('appium');
const { fs, tempDir } = require('appium-support');
const { getDefaultArgs } = require('appium/build/lib/parser');
const { logger } = require('../logger');
const { DOMParser } = require('xmldom');
const XPath = require('xpath');
const AppiumHandler = require('./handler')

const LOG_SEND_INTERVAL_MS = 250;

let appiumServer = null;
let appiumHandler = null;
let appiumSender = null;
let appiumOwner = null;
let logWatcher = null;
let logFile = null;
let batchedLogs = [];
let isStarted = false;

async function createSession(cfg, caps, owner) {
    let sessionId = null;
    try {
        const handler = new AppiumHandler();
        handler.addListener(appiumHandlerListener);
        await handler.initialize(cfg, caps);
        appiumHandler = handler;
        appiumOwner = owner;
        sessionId = appiumHandler.sessionId;
        if (typeof appiumSender == 'function') {
            appiumSender('new_session', owner);
        }
    } catch (error) {
        logger.error('createSession err->' + error.message);
    }
    return sessionId;
}

async function killSession(killer = { ip: '127.0.0.1' }) {
    if (appiumHandler) {
        await appiumHandler.close();
        appiumHandler = null;
        appiumOwner = null;
        if (typeof appiumSender == 'function') {
            appiumSender('kill_session', killer);
        }
    }
}

const appiumHandlerListener = function (status) {
    if (status == 'invalid' || status == 'error') {
        killSession();
        if (appiumOwner && appiumOwner.hasOwnProperty('socketId')) {
            appiumSender('session_invalid', appiumOwner.socketId);
        }
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
    let owner = {};
    if (appiumOwner) {
        owner = {
            ip: appiumOwner.ip
        }
    }
    return {
        isStarted,
        handler,
        owner
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

async function readAppSource(sessionId) {
    let sourceObject = {};
    if (appiumHandler && checkSession(sessionId)) {
        try {
            const source = await appiumHandler.source();
            if (source) {
                sourceObject = XML2JSON(source);
            }
        } catch (error) {
            logger.error(error.message);
        }
    }
    return sourceObject;
}

function XML2JSON(source) {
    const doc = (new DOMParser()).parseFromString(source, 'application/xml');
    const parseAttributes = function (attributes) {
        const attrObject = {};
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            if (attribute.nodeType == 2) {
                attrObject[attribute.nodeName] = attribute.nodeValue;
            }
        }
        return attrObject;
    }
    const parseXPath = function (doc, domNode) {
        let xpath = '';
        try {
            if (domNode.nodeType == 1) {
                const uniqueAttributes = [
                    'resource-id',
                    'content-desc'
                ];
                for (let attrName of uniqueAttributes) {
                    const attrValue = domNode.getAttribute(attrName);
                    // console.log(attrName, '=', attrValue);
                    if (attrValue) {
                        xpath = `//${domNode.nodeName || '*'}[@${attrName}="${attrValue}"]`;
                        let othersWithAttr;
                        try {
                            othersWithAttr = XPath.select(xpath, doc);
                        } catch (err) {
                            console.error('xpath select errp.');
                            continue;
                        }
                        if (othersWithAttr.length > 1) {
                            let index = othersWithAttr.indexOf(domNode);
                            xpath = `(${xpath})[${index + 1}]`;
                        }
                        return xpath;
                    }
                }
                xpath = `/${domNode.tagName}`;
                if (domNode.parentNode) {
                    const childNodes = Array.prototype.slice.call(domNode.parentNode.childNodes, 0).filter((childNode) => (
                        childNode.nodeType === 1 && childNode.tagName === domNode.tagName
                    ));
                    if (childNodes.length > 1) {
                        let index = childNodes.indexOf(domNode);
                        xpath += `[${index + 1}]`;
                    }
                }
                xpath = parseXPath(doc, domNode.parentNode) + xpath;
                return xpath;
            }
        } catch (error) {
            console.log('parse xpath err.')
        }
        return xpath;
    }
    const parseChildNodes = function (childNodes) {
        const eleObject = {};
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            if (childNode.nodeType == 1) {
                const tagName = childNode.tagName;
                const attributes = parseAttributes(childNode.attributes);
                const children = parseChildNodes(childNode.childNodes);
                const xpath = parseXPath(doc, childNode);
                const key = tagName + '_' + attributes['index'];
                eleObject[key] = { attributes, children, xpath }
            }
        }
        return eleObject;
    }
    return parseChildNodes(doc.childNodes);
}

async function takeAppScreenshot(sessionId) {
    let screenshot;
    if (appiumHandler && checkSession(sessionId)) {
        screenshot = await appiumHandler.takeScreenshot();
    }
    return screenshot;
}

async function windowSize(sessionId) {
    let size;
    if (appiumHandler && checkSession(sessionId)) {
        size = await appiumHandler.windowSize();
    }
    return size;
}

async function tapByCoordinates(sessionId, x, y) {
    if (appiumHandler && checkSession(sessionId)) {
        await appiumHandler.tap(x, y);
        return true;
    }
    return false;
}

async function swipeByCoordinates(sessionId, from, to) {
    if (appiumHandler && checkSession(sessionId)) {
        await appiumHandler.swipe(from, to);
        return true;
    }
    return false;
}

async function click(sessionId, { resource_id, content_desc, class_name, xpath, index = 0, isWaitFor = false }) {
    if (appiumHandler && checkSession(sessionId) && (resource_id || content_desc || class_name || xpath)) {
        let element = null;
        if (resource_id) {
            element = isWaitFor ? await waitForElementById(resource_id) : await elementById(sessionId, resource_id);
        } else if (content_desc) {
            const elements = isWaitFor ? await waitForElementsByAccessibilityId(content_desc) : await elementsByAccessibilityId(sessionId, content_desc);
            if (elements) {
                element = elements[index];
            }
        } else if (class_name) {
            const elements = isWaitFor ? await waitForElementsByClassName(class_name) : await elementsByClassName(sessionId, class_name);
            if (elements) {
                element = elements[index];
            }
        } else if (xpath) {
            const elements = isWaitFor ? await waitForElementsByXPath(xpath) : await elementsByXPath(sessionId, xpath);
            if (elements) {
                element = elements[index];
            }
        }
        if (element) {
            await element.click();
            return true;
        }
    }
    return false;
}

async function sendKeys(sessionId, { resource_id, content_desc, class_name, xpath, index = 0, isWaitFor = false }, keys) {
    if (appiumHandler && checkSession(sessionId) && (resource_id || content_desc || class_name || xpath) && keys) {
        let element = null;
        if (resource_id) {
            element = isWaitFor ? await waitForElementById(resource_id) : await elementById(sessionId, resource_id);
        } else if (content_desc) {
            const elements = isWaitFor ? await waitForElementsByAccessibilityId(content_desc) : await elementsByAccessibilityId(sessionId, content_desc);
            if (elements) {
                element = elements[index];
            }
        } else if (class_name) {
            const elements = isWaitFor ? await waitForElementsByClassName(class_name) : await elementsByClassName(sessionId, class_name);
            if (elements) {
                element = elements[index];
            }
        } else if (xpath) {
            const elements = isWaitFor ? await waitForElementsByXPath(xpath) : await elementsByXPath(sessionId, xpath);
            if (elements) {
                element = elements[index];
            }
        }
        if (element) {
            await element.sendKeys(keys);
            return true;
        }
        return true;
    }
    return false;
}

async function getText(sessionId, { resource_id, content_desc, class_name, xpath, index = 0, isWaitFor = false }) {
    let text = '';
    if (appiumHandler && checkSession(sessionId) && (resource_id || content_desc || class_name || xpath)) {
        let element = null;
        if (resource_id) {
            element = isWaitFor ? await waitForElementById(resource_id) : await elementById(sessionId, resource_id);
        } else if (content_desc) {
            const elements = isWaitFor ? await waitForElementsByAccessibilityId(content_desc) : await elementsByAccessibilityId(sessionId, content_desc);
            if (elements) {
                element = elements[index];
            }
        } else if (class_name) {
            const elements = isWaitFor ? await waitForElementsByClassName(class_name) : await elementsByClassName(sessionId, class_name);
            if (elements) {
                element = elements[index];
            }
        } else if (xpath) {
            const elements = isWaitFor ? await waitForElementsByXPath(xpath) : await elementsByXPath(sessionId, xpath);
            if (elements) {
                element = elements[index];
            }
        }
        if (element) {
            text = await element.text();
        }
    }
    return text;
}

async function elementById(sessionId, id) {
    let element = null;
    if (appiumHandler && checkSession(sessionId)) {
        element = await appiumHandler.elementById(id);
    }
    return element;
}

async function waitForElementById(sessionId, id) {
    let element = null;
    if (appiumHandler && checkSession(sessionId)) {
        element = await appiumHandler.waitForElementById(id);
    }
    return element;
}

async function elementsByAccessibilityId(sessionId, content_desc) {
    let elements = [];
    if (appiumHandler && checkSession(sessionId)) {
        elements = await appiumHandler.elementsByAccessibilityId(content_desc);
    }
    return elements;
}

async function waitForElementsByAccessibilityId(sessionId, content_desc) {
    let elements = [];
    if (appiumHandler && checkSession(sessionId)) {
        elements = await appiumHandler.waitForElementsByAccessibilityId(content_desc);
    }
    return elements;
}

async function elementsByClassName(sessionId, class_name) {
    let elements = [];
    if (appiumHandler && checkSession(sessionId)) {
        elements = await appiumHandler.elementsByClassName(class_name);
    }
    return elements;
}

async function waitForElementsByClassName(sessionId, class_name) {
    let elements = [];
    if (appiumHandler && checkSession(sessionId)) {
        elements = await appiumHandler.waitForElementsByClassName(class_name);
    }
    return elements;
}

async function elementsByXPath(sessionId, xpath) {
    let elements = [];
    if (appiumHandler && checkSession(sessionId)) {
        elements = await appiumHandler.elementsByXPath(xpath);
    }
    return elements;
}

async function waitForElementsByXPath(sessionId, xpath) {
    let elements = [];
    if (appiumHandler && checkSession(sessionId)) {
        elements = await appiumHandler.waitForElementsByXPath(xpath);
    }
    return elements;
}

async function getCurrentActivity(sessionId) {
    let activity = '';
    if (appiumHandler && checkSession(sessionId)) {
        activity = await appiumHandler.getCurrentActivity();
    }
    return activity;
}

async function getCurrentPackage(sessionId) {
    let pkg = '';
    if (appiumHandler && checkSession(sessionId)) {
        pkg = await appiumHandler.getCurrentPackage();
    }
    return pkg;
}

async function startActivity(sessionId, pkg, activity) {
    if (appiumHandler && checkSession(sessionId)) {
        await appiumHandler.startActivity(pkg, activity);
    }
    return false;
}

module.exports = {
    readLogFile,
    createSession,
    killSession,
    connectStartServer,
    connectStopServer,
    appiumServerStatus,
    connectKeepAlive,
    setAppiumSender,
    readAppSource,
    takeAppScreenshot,
    windowSize,
    tapByCoordinates,
    swipeByCoordinates,
    click,
    sendKeys,
    getText,
    getCurrentActivity,
    getCurrentPackage,
    startActivity
};