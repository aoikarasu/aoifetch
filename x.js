const si = await import('systeminformation');

si.battery().then(data => {
    console.log('Battery Data:', data);
});

si.osInfo().then(data => {
    console.log('OS Info:', data);
});

const { getBatteryInfo } = await import('node-system-stats');
getBatteryInfo().then(battery => {
    console.log('Battery:', battery);
});

const os = await import('os');
console.log(os.platform());
console.log(os.release());
