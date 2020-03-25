import SocketClient from 'socket.io-client';
import axios from 'axios';

// const URL_SERVER_BASE = 'http://localhost:7000/api';
// const URL_APPIUM_SERVER = URL_SERVER_BASE + '/appium'
// const URL_ANDROID_SERVER = URL_SERVER_BASE + '/android';
const URL_APPIUM_SERVER = 'http://localhost:7001'
const URL_ANDROID_SERVER = 'http://localhost:7004';

const URL_APPIUM_STATUS = URL_APPIUM_SERVER + '/appiumServerStatus';
const URL_APPIUM_START = URL_APPIUM_SERVER + '/connectStartServer';
const URL_APPIUM_STOP = URL_APPIUM_SERVER + '/connectStopServer';
const URL_APPIUM_LOG = URL_APPIUM_SERVER + '/log';
const URL_APPIUM_CREATE_SESSION = URL_APPIUM_SERVER + '/createSession';
const URL_APPIUM_KILL_SESSION = URL_APPIUM_SERVER + '/killSession';
const URL_ANDROID_DEVICE = URL_ANDROID_SERVER + '/devcies';
const URL_ANDROID_PLATFORM = URL_ANDROID_SERVER + '/platform';
const URL_ANDROID_MODEL = URL_ANDROID_SERVER + '/model';
const URL_ANDROID_PACKAGE = URL_ANDROID_SERVER + '/packages';
const URL_ANDROID_ACTIVITY = URL_ANDROID_SERVER + '/activity';

const appiumClient = new SocketClient('http://localhost:7001');
let appiumLogListeners = [];
let appiumSessionListeners = [];
let appiumServerListeners = [];
let useId = null;
appiumClient.on('appium-connection-user', (id) => {
    useId = id;
    console.log('uid->' + id)
})

appiumClient.on('appium-start-server', () => {
    for (const appiumServerListener of appiumServerListeners) {
        if (typeof appiumServerListener == 'function') {
            appiumServerListener('start');
        }
    }
})

appiumClient.on('appium-stop-server', () => {
    for (const appiumServerListener of appiumServerListeners) {
        if (typeof appiumServerListener == 'function') {
            appiumServerListener('stop');
        }
    }
})

appiumClient.on('appium-new-session', () => {
    for (const appiumSessionListener of appiumSessionListeners) {
        if (typeof appiumSessionListener == 'function') {
            appiumSessionListener('new');
        }
    }
})

appiumClient.on('appium-kill-session', () => {
    for (const appiumSessionListener of appiumSessionListeners) {
        if (typeof appiumSessionListener == 'function') {
            appiumSessionListener('kill');
        }
    }
})

appiumClient.on('appium-session-invalid', () => {
    for (const appiumSessionListener of appiumSessionListeners) {
        if (typeof appiumSessionListener == 'function') {
            appiumSessionListener('invalid');
        }
    }
})

appiumClient.on('appium-log-line', (batchedLogs) => {
    for (const appiumLogListener of appiumLogListeners) {
        if (typeof appiumLogListener == 'function') {
            appiumLogListener(batchedLogs);
        }
    }
})

export function addAppiumLogListener(listener) {
    if (typeof listener == 'function') {
        appiumLogListeners.push(listener);
    }
}

export function addAppiumServerLister(listener) {
    if (typeof listener == 'function') {
        appiumServerListeners.push(listener);
    }
}
export function addSessionListener(listener) {
    if (typeof listener == 'function') {
        appiumSessionListeners.push(listener);
    }
}

const KEEP_SESSIOND_ALIVE = 10 * 1000;
let keepAliveHandler = null;

export function startAppiumServer() {
    return axios.post(URL_APPIUM_START);
}

export function keepAlive(sessionId) {
    keepAliveHandler = setInterval(() => {
        if (sessionId) {
            appiumClient.emit('appium-session-alive', sessionId);
        }
    }, KEEP_SESSIOND_ALIVE);
}

export function killKeepAlive(sessionId) {
    if (keepAliveHandler) {
        clearInterval(keepAliveHandler);
        keepAliveHandler = null;
    }
}

export function stopAppiumServer() {
    return axios.post(URL_APPIUM_STOP);
}

export function appiumServerStatus() {
    return axios.get(URL_APPIUM_STATUS);
}

export function getDevices() {
    return axios.get(URL_ANDROID_DEVICE);
}

export function getModel() {
    return axios.get(URL_ANDROID_MODEL)
}

export function getPlatform() {
    return axios.get(URL_ANDROID_PLATFORM);
}

export function getPackages() {
    return axios.get(URL_ANDROID_PACKAGE)
}

export function getActivity(pkg) {
    return axios.get(URL_ANDROID_ACTIVITY, {
        params: {
            pkg
        }
    });
}

export function getAppiumLog() {
    return axios.get(URL_APPIUM_LOG);
}

export function createSession(model, platform, pkg, activity) {
    return axios.post(URL_APPIUM_CREATE_SESSION, {
        // model: 'SCM-W09',
        // platform: '9.0',
        // pkg: 'de.eso.car.audi',
        // activity: 'de.eso.car.ui.MainActivity'
        model, platform, pkg, activity
    });
}

export function killSession() {
    return axios.post(URL_APPIUM_KILL_SESSION);
}