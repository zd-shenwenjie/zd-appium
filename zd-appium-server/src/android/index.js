const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { logger } = require('../logger');
const { execSync } = require('child_process');
const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

const args = process.argv.splice(2);
const port = args[0];

app.listen(port, () => {
    logger.info(`App is listening on port ${port}`);
});

router.route('/devcies').get((req, res) => {
    const buf = execSync('adb devices');
    const devices = buf.toString()
        .replace('List of devices attached', '')
        .split('\r\n')
        .filter(i => { return i.indexOf('device') != -1 })
        .map(i => { return i.replace('\t', '') });
    res.status(200).json({
        code: 200,
        msg: 'adb devices',
        data: devices
    })
});

router.route('/model').get((req, res) => {
    const buf = execSync('adb shell getprop ro.product.model');
    const platform = buf.toString().replace('\r\n','');
    res.status(200).json({
        code: 200,
        msg: 'adb shell getprop ro.product.model',
        data: platform
    })
});

router.route('/platform').get((req, res) => {
    const buf = execSync('adb shell getprop ro.build.version.release');
    const platform = buf.toString().replace('\r\n','');
    res.status(200).json({
        code: 200,
        msg: 'adb shell getprop ro.build.version.release',
        data: platform
    })
});

