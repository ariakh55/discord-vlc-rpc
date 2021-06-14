const RPC = require('discord-rpc');
const config = require('../config');
const diff = require('../diff');
const format = require('./format');
const log = require('../logger');

const client = new RPC.Client({transport: 'ipc'});
let awake = true;
let timeInactive = 0;


const update = () => {
    diff((status, difference) => {
        if(difference){
            client.setActivity(format(status));
            console.log('Presence Updated');
            if(!awake){
                awake = true;
                timeInactive = 0;
            }
        }else if(awake) {
            if(status.state !== 'playing'){
                timeInactive += config.rpc.updateInterval;
                if((timeInactive >= config.rpc.sleepTime) || (!config.rpc.showStopped && status.state === 'stopped')){
                    log('VLC not playing; going to sleep.', true);
                    awake = false;
                    client.clearActivity();
                }else{
                    console.log('Presence Updated');
                    client.setActivity(format(status));
                    awake = false;
                }
            }
        }
    });
}

client.on('ready', () => {
    console.log('Logged in as', client.user.username);
});

const discordLogin = () => {
    console.log('Connecting to discord...');
    client.login({clientId: config.rpc.id})
        .then(() => {
            setInterval(update, config.rpc.updateInterval);
        })
        .catch(err => {
            if(err.toString() === "Error: Could not connect"){
                console.log('Failed to connect to Discord. Retrying in 20 seconds...');
                setTimeout(discordLogin, 20000);
            }else{
                console.log('An Unknown error occured');
                throw err;
            }
        });
}

discordLogin();