const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

function servers() {
    let servers = [];
    try {
        const config = fs.readJSONSync(path.join(__dirname, 'config.json'));
        if (config.servers) {
            for (const server of config.servers) {
                if (server.enabled) {
                    servers.push(server);
                    startServer(server);
                }
            }
        }
    } catch (error) {
        console.error(error.message);
    }
    return servers;
}

function startServer(server) {
    if (server && server.hasOwnProperty('name') && server.hasOwnProperty('port')) {
        const name = server.name;
        const port = server.port;
        const script = path.join(__dirname, name, 'index.js');
        const cmd = `pm2 start ${script} --name ${name} -- ${port}`;
        const buf = execSync(`pm2 start ${script} --name ${name} -- ${port}`);
        console.log(cmd, buf.toString());
    }
}

module.exports = {
    servers
};
