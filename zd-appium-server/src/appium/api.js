const { createSession } = require('./handler');

async function main() {
    const handler = await createSession({ port: 4723 }, { appPackage: "io.appium.android.apis", appActivity: ".ApiDemos" });
    await handler.close();
}

main();