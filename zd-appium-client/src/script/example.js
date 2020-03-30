const devices = await getDevices();
const pkgs = await getPackages();
const pkg = 'de.eso.car.audi';
const model = await getModel();
const platform = await getPlatform();
const activity = await getActivity(pkg);

await createSession(model, platform, pkg, activity);

await killSession();