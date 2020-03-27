const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

function servers() {
    let servers = [];
    try {
        const config = fs.readJSONSync(path.join(__dirname, 'config.json'));
        if (config.servers) {
            for (const server of config.servers) {
                if (server.enabled) {
                    servers.push(server);
                    startServer(server)
                }
            }
        }
    } catch (error) {
        console.error(error.message);
    }
    return servers;
}

function startServer(server) {
    const name = server.name;
    const port = server.port;
    const script = path.join(__dirname, name, 'index.js');
    exec(`node ${script} ${port}`, (err, stdout, stderr) => {
        console.log(err, stdout, stderr);
    });
}

module.exports = {
    servers
};
