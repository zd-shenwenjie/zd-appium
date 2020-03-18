const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const controller = require('./controller');
const proxy = require('http-proxy-middleware');
const { logger } = require('./logger');

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

const port = 7000;
app.listen(port, () => {
    logger.info(`App is listening on port ${port}`);
    const servers = controller.servers();
    if (servers) {
        servers.forEach(server => {
            const routePath = `/api/${server.name}`;
            app.use(routePath, proxy({
                changeOrigin: true,
                target: `http://localhost:${server.port}`,
            }));
        });
    }
});