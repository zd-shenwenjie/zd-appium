const {
    setAppiumSender,
    connectStartServer,
    connectStopServer,
    appiumServerStatus,
    readLogFile,
    createSession,
    killSession,
    connectKeepAlive,
    readAppSource,
    takeAppScreenshot,
    windowSize,
    tap,
    swipe,
    click,
    sendKeys,
    getText,
    elementById,
    waitForElementById,
    elementsByAccessibilityId,
    waitForElementByAccessibilityId,
    elementsByClassName,
    waitForElementByClassName,
    elementsByXPath,
    waitForElementByXPath,
    getCurrentActivity,
    getCurrentPackage,
    startActivity
} = require('./appium');

const { logger } = require('../logger');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

const args = process.argv.splice(2);
const port = args[0];

const server = app.listen(port, () => {
    logger.info(`App is listening on port ${port}`);
});

const io = require('socket.io')(server);
const users = {}; //{socketId:ip}

io.on('connection', function (socket) {

    saveUser(socket);
    socket.emit('appium-connection-user', socket.id);

    socket.on('appium-session-alive', function (sessionId) {
        connectKeepAlive(sessionId);
        console.log('alive->' + sessionId)
    });

    socket.on('disconnect', function () {
        if (users.hasOwnProperty(socket.id)) {
            delete users[socket.id];
            console.log('delete user: ' + socket.id);
            console.log('user num:', Object.keys(users).length);
        }
    })
})

function saveUser(socket) {
    const address = socket.handshake.address;
    const ip = address.replace('::ffff:', '');
    users[socket.id] = ip;
    console.log('save user:', socket.id, ip);
    console.log('user num:', Object.keys(users).length);
}

setAppiumSender(
    function (event, args) {
        switch (event) {
            case 'start_server':
                io.emit('appium-start-server');
                break;
            case 'stop_server':
                io.emit('appium-stop-server');
                break;
            case 'send_log':
                io.emit('appium-log-line', args); // args-> log message include level and msg
                break;
            case 'new_session':
                io.emit('appium-new-session', args); // args-> who create the session
                break;
            case 'kill_session':
                io.emit('appium-kill-session', args); // args -> who kill the session
                break;
            case 'session_invalid':
                const socketId = args;
                if (io.sockets.connected[socketId]) {
                    io.sockets.connected[socketId].emit('appium-session-invalid'); // only send the socket who created it.
                }
                break;
        }
    }
);

router.route('/connectStartServer').post(async (req, res) => {
    const args = req.body.args;
    await connectStartServer(args);
    res.status(200).json({
        code: 200,
        msg: 'start appium server.'
    });
});

router.route('/connectStopServer').post(async (req, res) => {
    await connectStopServer();
    res.status(200).json({
        code: 200,
        msg: 'stop appium server.'
    })
});

router.route('/createSession').post(async (req, res) => {
    const { model, platform, pkg, activity, userId } = req.body;
    if (model && platform && pkg && activity && userId && users.hasOwnProperty(userId)) {
        const appiumServerConfig = {};
        const owner = {
            socketId: userId,
            ip: users[userId]
        }
        const sessionId = await createSession(
            appiumServerConfig,
            {
                platformVersion: platform,
                deviceName: model,
                appActivity: activity,
                appPackage: pkg
            },
            owner
        );
        if (sessionId) {
            res.status(200).json({
                code: 200,
                msg: 'create session.',
                data: sessionId
            })
        } else {
            res.status(500).json({
                code: 500,
                msg: 'create session error.'
            })
        }
    } else {
        res.status(400).json({
            code: 400,
            msg: `create session error. ${model} ${platform} ${pkg} ${activity}`
        })
    }
});

router.route('/killSession').post(async (req, res) => {
    const { userId } = req.body;
    if (userId && users.hasOwnProperty(userId)) {
        const killer = {
            socketId: userId,
            ip: users[userId]
        }
        await killSession(killer);
        res.status(200).json({
            code: 200,
            msg: `kill session ${sessionId}`
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'kill session error'
        })
    }
});

router.route('/appiumServerStatus').get((req, res) => {
    const status = appiumServerStatus();
    res.status(200).json({
        code: 200,
        msg: 'get appium server status.',
        data: status
    })
});

router.route('/log').get(async (req, res) => {
    const log = await readLogFile();
    res.status(200).json({
        code: 200,
        msg: 'read log file.',
        data: log
    })
});

router.route('/source').get(async (req, res) => {
    const sessionId = req.query.sessionId;
    const source = await readAppSource(sessionId);
    if (source) {
        res.status(200).json({
            code: 200,
            msg: 'read app source.',
            data: source
        })
    } else {
        res.status(500).json({
            code: 500,
            msg: 'read app source error.'
        })
    }
});

router.route('/screenshot').get(async (req, res) => {
    const sessionId = req.query.sessionId;
    const screenshot = await takeAppScreenshot(sessionId);
    if (screenshot) {
        res.status(200).json({
            code: 200,
            msg: 'take app screenshot.',
            data: screenshot
        })
    } else {
        res.status(500).json({
            code: 500,
            msg: 'take app screenshot error.'
        })
    }
});

router.route('/windowSize').get(async (req, res) => {
    const sessionId = req.query.sessionId;
    const size = await windowSize(sessionId);
    if (size) {
        res.status(200).json({
            code: 200,
            msg: 'get window size.',
            data: size
        })
    } else {
        res.status(500).json({
            code: 500,
            msg: 'get window size.'
        })
    }
});

router.route('/tap').post(async (req, res) => {
    const { sessionId, x, y } = req.body;
    if (sessionId && x && y) {
        const result = await tap(sessionId, x, y);
        if (result) {
            res.status(200).json({
                code: 200,
                msg: `tap ${x},${y}`,
                data: result
            })
        } else {
            res.status(500).json({
                code: 500,
                msg: `tap error `,
                data: result
            })
        }
    } else {
        res.status(400).json({
            code: 500,
            msg: 'tap args error.'
        })
    }
});

router.route('/swipe').post(async (req, res) => {
    const { sessionId, from, to } = req.body;
    if (sessionId &&
        from && from.hasOwnProperty('x') && from.hasOwnProperty('y') &&
        to && to.hasOwnProperty('x') && to.hasOwnProperty('y')) {
        const result = await swipe(sessionId, from, to);
        if (result) {
            res.status(200).json({
                code: 200,
                msg: `swipe ${JSON.stringify(from)} , ${JSON.stringify(to)}`,
                data: result
            })
        } else {
            res.status(500).json({
                code: 500,
                msg: `swipe ${JSON.stringify(from)} , ${JSON.stringify(to)}`,
                data: result
            })
        }
    } else {
        res.status(400).json({
            code: 500,
            msg: 'swipe args erro.'
        })
    }
});

router.route('/click').post(async (req, res) => {
    const { sessionId, element } = req.body;
    if (sessionId && element) {
        await click(sessionId, element);
        res.status(200).json({
            code: 200,
            msg: 'click',
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'click args erro.'
        })
    }
});

router.route('/sendKeys').post(async (req, res) => {
    const { sessionId, element, keys } = req.body;
    if (sessionId && element && keys) {
        await sendKeys(sessionId, element, keys);
        res.status(200).json({
            code: 200,
            msg: 'sendKeys',
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'sendKeys args error.'
        })
    }
});

router.route('/getText').post(async (req, res) => {
    const { sessionId, element } = req.body;
    if (sessionId && element) {
        const text = await getText(sessionId, element);
        res.status(200).json({
            code: 200,
            msg: 'getText',
            data: text
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'getText args error.'
        })
    }
});

router.route('/getCurrentActivity').post(async (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) {
        const activity = await getCurrentActivity(sessionId);
        res.status(200).json({
            code: 200,
            msg: 'getCurrentActivity',
            data: activity
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'getCurrentActivity args error.'
        })
    }
});

router.route('/getCurrentPackage').post(async (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) {
        const pkg = await getCurrentPackage(sessionId);
        res.status(200).json({
            code: 200,
            msg: 'getCurrentPackage',
            data: pkg
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'getCurrentPackage args error.'
        })
    }
});

router.route('/startActivity').post(async (req, res) => {
    const { sessionId, pkg, activity } = req.body;
    if (sessionId && pkg && activity) {
        await startActivity(sessionId, pkg, activity);
        res.status(200).json({
            code: 200,
            msg: 'startActivity'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'startActivity args error.'
        })
    }
});

router.route('/elementById').post(async (req, res) => {
    const { sessionId, id } = req.body;
    if (sessionId && id) {
        await elementById(sessionId, id);
        res.status(200).json({
            code: 200,
            msg: 'elementById'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'elementById args error.'
        })
    }
});

router.route('/waitForElementById').post(async (req, res) => {
    const { sessionId, id } = req.body;
    if (sessionId && id) {
        await waitForElementById(sessionId, id);
        res.status(200).json({
            code: 200,
            msg: 'waitForElementById'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'waitForElementById args error.'
        })
    }
});

router.route('/elementsByAccessibilityId').post(async (req, res) => {
    const { sessionId, desc } = req.body;
    if (sessionId && desc) {
        await elementsByAccessibilityId(sessionId, desc);
        res.status(200).json({
            code: 200,
            msg: 'elementsByAccessibilityId'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'elementsByAccessibilityId args error.'
        })
    }
});

router.route('/waitForElementByAccessibilityId').post(async (req, res) => {
    const { sessionId, desc } = req.body;
    if (sessionId && desc) {
        await waitForElementByAccessibilityId(sessionId, desc);
        res.status(200).json({
            code: 200,
            msg: 'waitForElementByAccessibilityId'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'waitForElementByAccessibilityId args error.'
        })
    }
});

router.route('/elementsByClassName').post(async (req, res) => {
    const { sessionId, name } = req.body;
    if (sessionId && name) {
        await elementsByClassName(sessionId, name);
        res.status(200).json({
            code: 200,
            msg: 'elementsByClassName'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'elementsByClassName args error.'
        })
    }
});

router.route('/waitForElementByClassName').post(async (req, res) => {
    const { sessionId, name } = req.body;
    if (sessionId && name) {
        await waitForElementByClassName(sessionId, name);
        res.status(200).json({
            code: 200,
            msg: 'waitForElementByClassName'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'waitForElementByClassName args error.'
        })
    }
});

router.route('/elementsByXPath').post(async (req, res) => {
    const { sessionId, xpath } = req.body;
    if (sessionId && xpath) {
        await elementsByXPath(sessionId, xpath);
        res.status(200).json({
            code: 200,
            msg: 'elementsByXPath'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'elementsByXPath args error.'
        })
    }
});

router.route('/waitForElementByXPath').post(async (req, res) => {
    const { sessionId, xpath } = req.body;
    if (sessionId && xpath) {
        await waitForElementByXPath(sessionId, xpath);
        res.status(200).json({
            code: 200,
            msg: 'waitForElementByXPath'
        })
    } else {
        res.status(400).json({
            code: 400,
            msg: 'waitForElementByXPath args error.'
        })
    }
});

