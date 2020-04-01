const axios = require('axios');

const URL_APPIUM_SERVER = 'http://localhost:7001';
const URL_ANDROID_SERVER = 'http://localhost:7004';

const URL_APPIUM_CREATE_SESSION = URL_APPIUM_SERVER + '/createSession';
const URL_APPIUM_KILL_SESSION = URL_APPIUM_SERVER + '/killSession';
const URL_APPIUM_TAP = URL_APPIUM_SERVER + '/tap';
const URL_APPIUM_SWIPE = URL_APPIUM_SERVER + '/swipe';
const URL_APPIUM_CLICK = URL_APPIUM_SERVER + '/click';
const URL_APPIUM_SEND = URL_APPIUM_SERVER + '/sendKeys';
const URL_APPIUM_TEXT = URL_APPIUM_SERVER + '/getText';
const URL_APPIUM_ACTIVITY = URL_APPIUM_SERVER + '/getCurrentActivity';
const URL_APPIUM_PACKAGE = URL_APPIUM_SERVER + '/getCurrentPackage';
const URL_APPIUM_START_ACTIVITY = URL_APPIUM_SERVER + '/startActivity';

const URL_ANDROID_DEVICE = URL_ANDROID_SERVER + '/devcies';
const URL_ANDROID_PLATFORM = URL_ANDROID_SERVER + '/platform';
const URL_ANDROID_MODEL = URL_ANDROID_SERVER + '/model';
const URL_ANDROID_PACKAGE = URL_ANDROID_SERVER + '/packages';
const URL_ANDROID_LAUNCHER = URL_ANDROID_SERVER + '/activity';

let userId = null;
let sessionId = null;

const http = {
    async get(url, data) {
        try {
            const res = await axios.get(url, { params: data })
            return new Promise((resolve, reject) => {
                if (res.status === 200) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            })
        } catch (err) {
            console.log(err.message);
        }
    },
    async post(url, data) {
        try {
            const res = await axios.post(url, data)
            return new Promise((resolve, reject) => {
                if (res.status === 200) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            })
        } catch (err) {
            console.log(err.message);
        }
    },
}

function setUserId(id) {
    userId = id;
    console.log(`set uid = ${id}`);
}

async function getDevices() {
    const result = await http.get(URL_ANDROID_DEVICE);
    const devcies = result.data;
    return devcies;

}

async function getModel() {
    const result = await http.get(URL_ANDROID_MODEL);
    const model = result.data;
    return model;
}

async function getPlatform() {
    const result = await http.get(URL_ANDROID_PLATFORM);
    const platform = result.data;
    return platform;
}

async function getPackages() {
    const result = await http.get(URL_ANDROID_PACKAGE);
    const pkgs = result.data;
    return pkgs;
}

async function getLauncher(pkg) {
    const result = await http.get(URL_ANDROID_LAUNCHER, { pkg });
    const activity = result.data;
    return activity;
}

async function createSession(model, platform, pkg, activity) {
    const result = await http.post(URL_APPIUM_CREATE_SESSION, {
        model,
        platform,
        pkg,
        activity,
        userId
    });
    sessionId = result.data;
    return sessionId;
}

async function killSession() {
    await http.post(URL_APPIUM_KILL_SESSION, {
        userId
    });
}

async function click({ resource_id, content_desc, class_name, xpath, index, isWaitFor }) {
    await http.post(URL_APPIUM_CLICK, {
        sessionId,
        resource_id,
        content_desc,
        class_name,
        xpath,
        index,
        isWaitFor
    });
}

async function sendKeys({ resource_id, content_desc, class_name, xpath, index, isWaitFor }, keys) {
    await http.post(URL_APPIUM_SEND, {
        sessionId,
        resource_id,
        content_desc,
        class_name,
        xpath,
        index,
        isWaitFor,
        keys
    })
}

async function getText({ resource_id, content_desc, class_name, xpath, index, isWaitFor }) {
    let text = '';
    const result = await http.post(URL_APPIUM_TEXT, {
        sessionId,
        resource_id,
        content_desc,
        class_name,
        xpath,
        index,
        isWaitFor
    })
    if (result && result.data) {
        text = result.data;
    }
    return text;
}

async function tap(x, y) {
    await http.post(URL_APPIUM_TAP, {
        sessionId, x, y
    });
}

async function swipe(from, to) {
    await http.post(URL_APPIUM_SWIPE, {
        sessionId, from, to
    });
}

async function getCurrentActivity() {
    const result = await http.post(URL_APPIUM_ACTIVITY, { sessionId });
    const activity = result.data;
    return activity;
}

async function getCurrentPackage() {
    const result = await http.post(URL_APPIUM_PACKAGE, { sessionId });
    const pkg = result.data;
    return pkg;
}

async function startActivity() {
    await http.post(URL_APPIUM_START_ACTIVITY, { sessionId })
}


module.exports = {
    setUserId,
    getDevices,
    getModel,
    getPlatform,
    getPackages,
    getLauncher,
    createSession,
    killSession,
    tap,
    swipe,
    click,
    sendKeys,
    getText,
    getCurrentActivity,
    getCurrentPackage,
    startActivity
}