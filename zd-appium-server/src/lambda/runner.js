var vm = require('vm');
const zdapi = require('./zdapi')

class Runner {

    constructor(userId, scriptId) {
        this.userId = userId;
        this.scriptId = scriptId;
    }

    async run(script) {
        script = `
            async function run() {
                setUserId('${this.userId}');
                ${script}
            }
            
            run().catch(e => {
                console.log(e.message)
            });
        `;
        await vm.runInNewContext(script, zdapi);
    }
}

module.exports = Runner;


