import SocketClient from 'socket.io-client';
import axios from 'axios';

const SERVER_IP = '192.168.3.82';

const URL_APPIUM_SERVER = `http://${SERVER_IP}:7001`;
const URL_LAMBDA_SERVER = `http://${SERVER_IP}:7002`;
const URL_ANDROID_SERVER = `http://${SERVER_IP}:7004`;

const URL_APPIUM_STATUS = URL_APPIUM_SERVER + '/appiumServerStatus';
const URL_APPIUM_START = URL_APPIUM_SERVER + '/connectStartServer';
const URL_APPIUM_STOP = URL_APPIUM_SERVER + '/connectStopServer';
const URL_APPIUM_LOG = URL_APPIUM_SERVER + '/log';
const URL_APPIUM_CREATE_SESSION = URL_APPIUM_SERVER + '/createSession';
const URL_APPIUM_KILL_SESSION = URL_APPIUM_SERVER + '/killSession';
const URL_APPIUM_SOURCE = URL_APPIUM_SERVER + '/source';
const URL_APPIUM_SCREENSHOT = URL_APPIUM_SERVER + '/screenshot';
const URL_APPIUM_WINDOW = URL_APPIUM_SERVER + '/windowSize';
const URL_APPIUM_TAP = URL_APPIUM_SERVER + '/tap';
const URL_APPIUM_SWIPE = URL_APPIUM_SERVER + '/swipe';

const URL_ANDROID_DEVICE = URL_ANDROID_SERVER + '/devcies';
const URL_ANDROID_PLATFORM = URL_ANDROID_SERVER + '/platform';
const URL_ANDROID_MODEL = URL_ANDROID_SERVER + '/model';
const URL_ANDROID_PACKAGE = URL_ANDROID_SERVER + '/packages';
const URL_ANDROID_ACTIVITY = URL_ANDROID_SERVER + '/activity';

const URL_LAMBDA_SCRIPT = URL_LAMBDA_SERVER + '/script';

let appiumClient = null;
const appiumClientListeners = [];
const appiumLogListeners = [];
const appiumSessionListeners = [];
const appiumServerListeners = [];

export function connection() {
    appiumClient = new SocketClient(URL_APPIUM_SERVER);
    appiumClient.on('connect_error', (error) => {
        for (const appiumClientListener of appiumClientListeners) {
            if (typeof appiumClientListener == 'function') {
                appiumClientListener('error', error);
            }
        }
    });

    appiumClient.on('connect_timeout', (timeout) => {
        for (const appiumClientListener of appiumClientListeners) {
            if (typeof appiumClientListener == 'function') {
                appiumClientListener('timeout', timeout);
            }
        }
    });

    appiumClient.on('reconnect', (attemptNumber) => {
        for (const appiumClientListener of appiumClientListeners) {
            if (typeof appiumClientListener == 'function') {
                appiumClientListener('reconnect', attemptNumber);
            }
        }
    });

    appiumClient.on('appium-connection-user', (id) => {
        for (const appiumClientListener of appiumClientListeners) {
            if (typeof appiumClientListener == 'function') {
                appiumClientListener('uid', id);
            }
        }
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

    appiumClient.on('appium-new-session', (owner) => {
        for (const appiumSessionListener of appiumSessionListeners) {
            if (typeof appiumSessionListener == 'function') {
                appiumSessionListener('new', owner);
            }
        }
    })

    appiumClient.on('appium-kill-session', (killer) => {
        for (const appiumSessionListener of appiumSessionListeners) {
            if (typeof appiumSessionListener == 'function') {
                appiumSessionListener('kill', killer);
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
}

export function addAppiumClientListener(listener) {
    if (typeof listener == 'function') {
        appiumClientListeners.push(listener);
    }
}

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

export function runKeepAlive(sessionId) {
    if (appiumClient && sessionId) {
        if (keepAliveHandler) {
            killKeepAlive();
            console.log('keep alive loop  is already running');
        }
        keepAliveHandler = setInterval(() => {
            appiumClient.emit('appium-session-alive', sessionId);
            console.log(`start keep ${sessionId} alive.`);
        }, KEEP_SESSIOND_ALIVE);
    }
}

export function killKeepAlive() {
    if (keepAliveHandler) {
        clearInterval(keepAliveHandler);
        keepAliveHandler = null;
        console.log(`kill keep alive loop.`);
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

export function createSession(model, platform, pkg, activity, userId) {
    return axios.post(URL_APPIUM_CREATE_SESSION, {
        model,
        platform,
        pkg,
        activity,
        userId
    });
}

export function killSession(userId) {
    return axios.post(URL_APPIUM_KILL_SESSION, {
        userId
    });
}

export function readAppSource(sessionId) {
    return axios.get(URL_APPIUM_SOURCE, {
        params: { sessionId }
    });
}

export function takeAppScreenshot(sessionId) {
    return axios.get(URL_APPIUM_SCREENSHOT, {
        params: { sessionId }
    });
}

export function windowSize(sessionId) {
    return axios.get(URL_APPIUM_WINDOW, {
        params: { sessionId }
    });
}

export function tap(sessionId, x, y) {
    return axios.post(URL_APPIUM_TAP, {
        sessionId, x, y
    });
}

export function swipe(sessionId, from, to) {
    return axios.post(URL_APPIUM_SWIPE, {
        sessionId, from, to
    });
}

export function runScript(userId, script) {
    return axios.post(URL_LAMBDA_SCRIPT, {
        userId,
        script
    });
}