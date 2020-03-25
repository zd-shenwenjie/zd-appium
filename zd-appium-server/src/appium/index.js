const {
    setAppiumSender,
    connectStartServer,
    connectStopServer,
    appiumServerStatus,
    readLogFile,
    createSession,
    killSession,
    connectKeepAlive
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
            console.log('remove ' + socket.id)
        }
    })
})

function saveUser(socket) {
    const addr = socket.handshake.address;;
    console.log('addr->' + addr);
    const ip = addr.replace('::ffff:', '');
    users[socket.id] = ip;
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
                io.emit('appium-log-line', args);
                break;
            case 'new_session':
                io.emit('appium-new-session');
                break;
            case 'kill_session':
                io.emit('appium-kill-session');
                break;
            case 'session_invalid':
                if (io.sockets.connected[args]) {
                    io.sockets.connected[args].emit('appium-session-invalid');
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
    await killSession();
    res.status(200).json({
        code: 200,
        msg: `kill session ${sessionId}`
    })
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