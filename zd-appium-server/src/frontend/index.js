const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { logger } = require('../logger');
const path = require('path');

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

app.use(express.static(path.join(__dirname, 'res')));