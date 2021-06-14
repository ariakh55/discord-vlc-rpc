const VLC = require('vlc.js');
const log = require('./logger');
const config = require('./config');

var detectVLC = true;
const VClient = new VLC.Client(config.vlc);

const last = {
    filename: '',
    now_playing: '',
    state: '',
    time: 0
};

module.exports = (callback) => {
    VClient.getStatus()
        .then(status => {
            if(status.information){
                detectVLC = true;
                const { meta } = status.information.category;
                if(meta.now_playing !== last.now_playing){
                    log('Stream updated');
                    callback(status, true);
                }else if(meta.filename !== last.filename){
                    log('Filename updated');
                    callback(status, true);
                } else if (status.state !== last.state) {
                log('VLC\'s state updated');
                callback(status, true);
                } else if (status.time - (last.time + config.rpc.updateInterval / 1000)
                            > 3 || last.time > status.time) {
                log('Playback time updated');
                callback(status, true);
                } else if (status.volume !== last.volume) {
                log('Volume updated');
                callback(status, true);
                last.volume = status.volume;
                } else callback(status, false);
                last.filename = status.information ? meta.filename : undefined;
                last.now_playing = meta.now_playing;
            } else callback(status);
            last.state = status.state;
            last.time = status.time;
        })
        .catch(err => {
            if(err.code === "ECONNREFUSED") {
                if(detectVlc) {
                    console.log("Failed to reach VLC. Is it open?");
                    callback({state:"stopped"}, false);
                }
                } else {
                throw err;
                }
                detectVlc = false;
        });
};