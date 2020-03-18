var vm = require('vm');
const api = require('../appium/api')

class AppiumClient {
    /**
     * {
     *  address: shenwenjie:127.0.0.1,
     *  config: {platformName: 'Android', automationName: 'UiAutomator2', deviceName: 'Android Emulator', platformVersion: '8.1' }
     * } 
     */
    constructor({ address, config }) {
        // console.log(`address = ${address}`);
        // console.log(`config = ${config}`)
    }

    async run(script) {
        script = `
            async function run() {
                await init();
                ${script}
                await exit();
            }
            
            run().catch(e => {
                console.log(e.message)
            });
        `;
        await vm.runInNewContext(script, api);
    }

}



module.exports = AppiumClient;


