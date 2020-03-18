const AppiumClient = require('./runner');
const crypto = require("crypto");

class Looper {

    constructor() {
        //[{id, script}, ...]
        this.queue = [];
        this.isExecuting = false;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new AppiumManager();
        }
        return this.instance;
    }

    enqueue({ address, config, script }) {
        const scriptId = crypto.randomBytes(16).toString("hex").substr(0, 6);
        this.queue.push({ scriptId, address, config, script });
        console.log(`The scriptId = ${scriptId} has entered the queue.`);
        if (!this.isExecuting) {
            this.execute({ scriptId, address, config, script });
        }
        return scriptId;
    }

    dequeue() {
        const { scriptId } = this.queue.shift();
        console.log(`The scriptId = ${scriptId} has removed the queue.`);
    }

    async execute({ scriptId, address, config, script }) {
        this.isExecuting = true;
        const client = new AppiumClient({ address, config });
        await client.run(script);
        this.isExecuting = false;
        this.dequeue();
        if (!this.isEmpty()) {
            await this.execute(this.queue[0])
        } else {
            console.log('the queue is empty.')
        }
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    clear() {
        this.queue = [];
    }

    size() {
        return this.queue.length;
    }

}

module.exports = Looper