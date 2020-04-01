const {
    getDevices,
    getPackages,
    getModel,
    getPlatform,
    getLauncher,
    createSession,
    getCurrentActivity,
    getCurrentPackage,
    tap,
    swipe,
    click,
    getText
} = require('../src/lambda/zdapi');
const SocketClient = require('socket.io-client');
const events = require('events');
const emitter = new events.EventEmitter();

const SERVER_IP = '192.168.0.184';
const URL_APPIUM_SERVER = `http://${SERVER_IP}:7001`;

function connection() {
    appiumClient = new SocketClient(URL_APPIUM_SERVER);
    appiumClient.on('connect_error', (error) => {
        console.log('connect_error', error.message);
    });

    appiumClient.on('connect_timeout', (timeout) => {
        console.log('connect_timeout', timeout);
    });

    appiumClient.on('reconnect', (attemptNumber) => {
        console.log('reconnect', attemptNumber);
    });

    appiumClient.on('appium-connection-user', (id) => {
        console.log('appium-connection-user', id);
        emitter.emit('connection', id);
    })

    appiumClient.on('appium-start-server', () => {
        console.log('appium-start-server');
    })

    appiumClient.on('appium-stop-server', () => {
        console.log('appium-stop-server');
    })

    appiumClient.on('appium-new-session', (owner) => {
        console.log('appium-new-session', owner);
    })

    appiumClient.on('appium-kill-session', (killer) => {
        console.log('appium-kill-session', killer);
    })

    appiumClient.on('appium-session-invalid', () => {
        console.log('appium-session-invalid');
    })

    appiumClient.on('appium-log-line', (batchedLogs) => {
        console.log('appium-log-line', batchedLogs);
    })
}

connection();

emitter.on('connection', async function (userId) {
    setUserId(userId);
    const devices = await getDevices();
    console.log(devices);
    const pkgs = await getPackages();
    console.log(pkgs);
    const pkg = 'de.eso.car.audi';
    const model = await getModel();
    console.log('model->' + model);
    const platform = await getPlatform();
    console.log('platform->' + platform);
    const activity = await getLauncher(pkg);
    console.log('activity->' + activity);
    const sessionId = await createSession(model, platform, pkg, activity);
    console.log('sessionId->' + sessionId);
    const curActivity = await getCurrentActivity();
    console.log('curActivity->' + curActivity);
    const curPackage = await getCurrentPackage();
    console.log('curPackage->' + curPackage);

    await tap(709, 220);
    await click({ content_desc: 'e-tron' });
    await swipe({ x: 1905, y: 245 }, { x: 825, y: 245 });
    await click({ content_desc: 'Sound' });
    await click({ class_name: 'androidx.appcompat.app.ActionBar.Tab', index: 1 });
    await click({ xpath: '//androidx.appcompat.app.ActionBar.Tab[@content-desc="Sound"]/android.widget.TextView' });
    const text = await getText({ xpath: '//androidx.appcompat.app.ActionBar.Tab[@content-desc="Sound"]/android.widget.TextView', index: 0 })
    console.log('text->' + text);
    await killSession();
    appiumClient.close();
});


