const axios = require('axios');

const URL_APPIUM_SERVER = 'http://localhost:7001';
const URL_ANDROID_SERVER = 'http://localhost:7004';

const URL_APPIUM_CREATE_SESSION = URL_APPIUM_SERVER + '/createSession';
const URL_APPIUM_KILL_SESSION = URL_APPIUM_SERVER + '/killSession';

const URL_ANDROID_DEVICE = URL_ANDROID_SERVER + '/devcies';
const URL_ANDROID_PLATFORM = URL_ANDROID_SERVER + '/platform';
const URL_ANDROID_MODEL = URL_ANDROID_SERVER + '/model';
const URL_ANDROID_PACKAGE = URL_ANDROID_SERVER + '/packages';
const URL_ANDROID_ACTIVITY = URL_ANDROID_SERVER + '/activity';

let userId = null;

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

async function getActivity(pkg) {
    const result = await http.get(URL_ANDROID_ACTIVITY, { pkg });
    const activity = result.data;
    return activity;
}

async function createSession(model, platform, pkg, activity) {
    return await axios.post(URL_APPIUM_CREATE_SESSION, {
        model,
        platform,
        pkg,
        activity,
        userId
    });
}

async function killSession() {
    return await axios.post(URL_APPIUM_KILL_SESSION, {
        userId
    });
}

module.exports = {
    setUserId,
    getDevices,
    getModel,
    getPlatform,
    getPackages,
    getActivity,
    createSession,
    killSession
}