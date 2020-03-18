const { connectStartServer, connectStopServer } = require('./handler');
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

app.listen(port, () => {
    logger.info(`App is listening on port ${port}`);
});

router.route('/connectStartServer').post(async(req, res) => {
    const args = req.body.args;
    await connectStartServer(args);
    res.status(200).json({
        code: 200,
        msg: 'start appium server.'
    });
});

router.route('/connectStopServer').post(async(req, res) => {
    await connectStopServer();
    res.status(200).json({
        code: 200,
        msg: 'stop appium server.'
    })
});