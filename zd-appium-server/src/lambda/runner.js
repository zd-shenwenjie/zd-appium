var vm = require('vm');
const zdapi = require('./zdapi')

class Runner {

    constructor(userId, scriptId) {
        this.userId = userId;
        this.scriptId = scriptId;
    }

    async run(script) {
        const sandbox = {
            ...zdapi,
            console
        }

        script = `
            async function run() {
                setUserId('${this.userId}');
                ${script}
            }
            
            try {
                run();
            } catch (error) {
                console.log(error.message);
            }
        `;
        await vm.runInNewContext(script, sandbox);
    }
}

module.exports = Runner;


