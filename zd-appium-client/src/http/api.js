import SocketClient from 'socket.io-client';
import axios from 'axios';

const URL_SERVER_BASE = 'http://localhost:7000/api';
const URL_APPIUM_SERVER = URL_SERVER_BASE + '/appium'
const URL_APPIUM_STATUS = URL_APPIUM_SERVER + '/isAppiumServerStarted';
const URL_APPIUM_START = URL_APPIUM_SERVER + '/connectStartServer';
const URL_APPIUM_STOP = URL_APPIUM_SERVER + '/connectStopServer';
const URL_ANDROID_SERVER = URL_SERVER_BASE + '/android';
const URL_ANDROID_DEVICE = URL_ANDROID_SERVER + '/devcies';
const URL_ANDROID_PLATFORM = URL_ANDROID_SERVER + '/platform';
const URL_ANDROID_MODEL = URL_ANDROID_SERVER + '/model';


const appiumClient = new SocketClient('http://localhost:7001');

export function startAppiumServer() {
    return axios.post(URL_APPIUM_START);
}

export function stopAppiumServer() {
    return axios.post(URL_APPIUM_STOP);
}

export function isAppiumServerStarted() {
    return axios.get(URL_APPIUM_STATUS);
}

export function setAppiumLogHandler(handler) {
    appiumClient.on('appium-log-line', (batchedLogs) => {
        if (handler) {
            handler(batchedLogs);
        }
    })
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