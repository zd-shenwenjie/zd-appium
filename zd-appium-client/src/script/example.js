// get all android devices
const devices = await getDevices(); 
console.log('devices->'+ devices);
// get all packages in android device
const pkgs = await getPackages(); 
// console.log(pkgs);
 // car.apk package name is de.eso.car.audi
const pkg = 'de.eso.car.audi';
// get android model as device name
const model = await getModel(); 
console.log('model->'+ model);
// get platform version
const platform = await getPlatform(); 
console.log('platform->'+ platform);
// get launcher activity by package
const activity = await getLauncher(pkg); 
console.log('activity->'+ activity);
// create session by model, platform, pkg, activity
await createSession(model, platform, pkg, activity);
// get the current activity
const curActivity = await getCurrentActivity();
console.log('curActivity->'+ curActivity);
// get the the current package
const curPackage = await getCurrentPackage();
console.log('curPackage->'+ curPackage);
// kill session and exit
await killSession();