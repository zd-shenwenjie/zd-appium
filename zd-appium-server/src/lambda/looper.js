const Runner = require('./runner');
const crypto = require("crypto");

class Looper {

    constructor() {
        this.queue = [];
        this.isExecuting = false;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Looper();
        }
        return this.instance;
    }

    enqueue(userId, script) {
        const scriptId = crypto.randomBytes(16).toString("hex").substr(0, 6);
        this.queue.push({ userId, scriptId, script });
        console.log(`The scriptId = ${scriptId} has entered the queue.`);
        if (!this.isExecuting) {
            this.execute(this.queue[0]);
        }
        return scriptId;
    }

    dequeue() {
        const { scriptId } = this.queue.shift();
        console.log(`The scriptId = ${scriptId} has removed the queue.`);
    }

    async execute({ userId, scriptId, script }) {
        this.isExecuting = true;
        const runner = new Runner(userId, scriptId);
        await runner.run(script);
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