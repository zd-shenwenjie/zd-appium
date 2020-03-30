const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { logger } = require('../logger');
const Looper = require('./looper');

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

router.route('/script').post((req, res) => {
    const userId = req.body.userId;
    const script = req.body.script;
    if (userId && script) {
        const scriptId = Looper.getInstance().enqueue(userId, script);
        if (scriptId) {
            res.status(200).json({
                code: 200,
                msg: `The script has entered the queue.${scriptId}`,
                data: scriptId
            });
        } else {
            res.status(400).json({
                code: 400,
                msg: 'The script entered the queue error.',
            });
        }
    } else {
        res.status(400).json({
            code: 400,
            msg: 'The parameter is incorrect.'
        });
    }
});