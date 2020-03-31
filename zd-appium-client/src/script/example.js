// const devices = await getDevices(); // get all android devices
// const pkgs = await getPackages(); // get all packages in android device
const pkg = 'de.eso.car.audi'; // car.apk package name 
const model = await getModel(); // get android model as device name
const platform = await getPlatform(); // get platform version
const activity = await getLauncher(pkg); // get launcher activity by package

await createSession(model, platform, pkg, activity);
const curActivity = await getCurrentActivity();
const curPackage = await getCurrentPackage();

await killSession();