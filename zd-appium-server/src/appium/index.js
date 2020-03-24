const {
    connectStartServer,
    connectStopServer,
    isAppiumServerStarted,
    setLogSender,
    readLogFile,
    createSession,
    killSession
} = require('./handler');
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

const socket = require('socket.io');
const io = socket(server);
io.on('connection', function (socket) {
    // console.log('a client connected.', socket.id);
    socket.on('disconnect', function () {
        // console.log('client disconnected.', socket.id);
    });
})

setLogSender(function sendAppiumLog(batchedLogs) {
    io.emit('appium-log-line', batchedLogs);
});

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

router.route('/isAppiumServerStarted').get((req, res) => {
    const status = isAppiumServerStarted();
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

router.route('/createSession').post(async (req, res) => {
    const appiumServerConfig = {};
    const { model, platform, pkg, activity } = req.body;
    console.log(model, platform, pkg, activity)
    if (model && platform && pkg && activity) {
        const sessionId = await createSession(appiumServerConfig, {
            platformVersion: platform,
            deviceName: model,
            appActivity: activity,
            appPackage: pkg
        });
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
    const sessionId = req.body.sessionId;
    await killSession(sessionId);
    res.status(200).json({
        code: 200,
        msg: `kill session ${sessionId}`
    })
});

