const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {logger} = require('../logger');
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
    const script = req.body.script; 
    if (address && config && script) {
        const id = AppiumManager.getInstance().enqueue({ script });
        if (id > 0) {
            res.status(200).json({
                code: 200,
                msg: 'The script has entered the queue.',
                data: id
            });
        } else {
            res.status(500).json({
                code: 500,
                msg: 'Entry queue error.'
            });
        }
    } else {
        res.status(400).json({
            code: 400,
            msg: 'The parameter is incorrect.'
        });
    }
});