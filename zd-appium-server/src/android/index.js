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
        .split('\n') // .split('\r\n')
        .filter(i => { return i.indexOf('device') != -1 })
        .map(i => { return i.replace('\t', '').replace('device', '') });
    res.status(200).json({
        code: 200,
        msg: 'adb devices',
        data: devices
    });
    // console.log(devices);
});

router.route('/model').get((req, res) => {
    const buf = execSync('adb shell getprop ro.product.model');
    const model = buf.toString().replace('\n', '');
    // const model = buf.toString().replace('\r\n', '');
    res.status(200).json({
        code: 200,
        msg: 'adb shell getprop ro.product.model',
        data: model
    });
    // console.log(model);
});

router.route('/platform').get((req, res) => {
    const buf = execSync('adb shell getprop ro.build.version.release');
    const platform = buf.toString().replace('\n', '');
    // const platform = buf.toString().replace('\r\n', '');
    res.status(200).json({
        code: 200,
        msg: 'adb shell getprop ro.build.version.release',
        data: platform
    });
    // console.log(platform);
});

router.route('/packages').get((req, res) => {
    const buf = execSync('adb shell pm list packages');
    const packages = buf.toString()
        .split('\n') // .split('\r\n')
        .filter(p => {
            return p.indexOf('package') != -1
        })
        .map(p => {
            const arr = p.split(':')
            return arr[1];
        })
    res.status(200).json({
        code: 200,
        msg: 'adb shell pm list packages',
        data: packages
    });
    // console.log(packages);
});

router.route('/activity').get((req, res) => {
    const pkg = req.query.pkg;
    if(pkg) {
        const buf = execSync(`adb shell dumpsys package ${pkg}`);
        const str = buf.toString();
        const arr = str.split('\n'); // .split('\r\n')
        const start = arr.findIndex(str => { return str.indexOf('android.intent.action.MAIN:') != -1 })
        const end = arr.findIndex(str => { return str.indexOf('Category: "android.intent.category.LAUNCHER"') != -1 });
        if (start != -1 && end != -1) {
            const info = arr.slice(start, end).find(s => s.indexOf(pkg) != -1).replace(/\s+/g, '');
            if (info && info.indexOf('/') != -1 && info.indexOf('filter') != -1) {
                const activity = info.substring(info.indexOf('/') + 1, info.indexOf('filter'));
                res.status(200).json({
                    code: 200,
                    msg: `adb shell dumpsys package ${pkg}`,
                    data: activity
                });
                // console.log(activity);
            } else {
                res.status(500).json({
                    code: 500,
                    msg: `adb shell dumpsys package ${pkg}`,
                    data: 'Parse Error.'
                })
            }
        } else {
            res.status(200).json({
                code: 200,
                msg: `Not Found`
            })
        }
    } else {
        res.status(400).json({
            code: 400,
            msg: `adb shell dumpsys package ${pkg}`,
            data: 'pkg is null.'
        })
    }
});