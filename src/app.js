const { spawn } = require('child_process');
const fs = require('fs');
const config = require('./config');
const log = require('./logger');
require('./rpc/client');

const platformDefaults = {
    win32: 'C:/Program Files/VideoLAN/VLC/vlc.exe',
    winalt: 'C:/Program Files (x86)/VideoLAN/VLC/vlc.exe',
    linux: '/usr/bin/vlc',
    unix: '/usr/bin/vlc',
    darwin: '/Applications/VLC.app/Contents/MacOS/VLC'
}

const randomPassword = () => (
    Math.random().toString().slice(-8)
)

if (config.vlc.password === "") config.vlc.password = randomPassword();

log('Started, config', config);
if(!(config.rpc.detached || process.argv.includes('detached'))) {
    if(process.platform === 'win32')
        if(!fs.existsSync(platformDefaults.win32))
            platformDefaults.win32 = platformDefaults.winalt;
    
    const command = config.vlcPath || platformDefaults[process.platform] || 'vlc';
    const child = spawn(command, ['--extraintf', 'http', '--http-host', config.vlc.address, '--http-password',
                                    config.vlc.password, '--http-port', config.vlc.port]);
    child.on('exit', () => {
        console.log('VLC closed; exiting.');
    });

    child.on('error', () => {
        console.log('Error: A problem occurred!');
        setTimeout(process.exit,20000,1);
    });
}