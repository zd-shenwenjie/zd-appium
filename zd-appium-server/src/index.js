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

const servers = controller.servers();

if (servers) {
    servers.forEach(server => {
        const routerPath = `/api/${server.name}`;
        const target = `http://localhost:${server.port}`;
        const changeOrigin = true;
        const pathRewrite = {};
        pathRewrite['^' + routerPath] = '';
        var options = {
            target,
            changeOrigin,
            pathRewrite
        };
        app.use(routerPath, proxy(options));
    });
}

const port = 7000;
app.listen(port, () => {
    logger.info(`App is listening on port ${port}`);
});