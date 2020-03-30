var vm = require('vm');
const api = require('./zdapi')

class Runner {

    constructor(scriptId) {
        this.scriptId = scriptId;
    }

    async run(script) {
        script = `
            async function run() {
                ${script}
            }
            
            run().catch(e => {
                console.log(e.message)
            });
        `;
        await vm.runInNewContext(script, api);
    }

}



module.exports = Runner;


