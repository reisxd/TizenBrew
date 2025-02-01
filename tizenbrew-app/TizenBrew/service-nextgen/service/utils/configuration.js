"use strict";

const fs = require('fs');

function readConfig() {
    if (!fs.existsSync('/home/owner/share/tizenbrewConfig.json')) {
        return {
            modules: ["npm/@foxreis/tizentube"],
            autoLaunchServiceList: [],
            autoLaunchModule: '', 
        };
    }
    return JSON.parse(fs.readFileSync('/home/owner/share/tizenbrewConfig.json', 'utf8'));
}

function writeConfig(config) {
    fs.writeFileSync('/home/owner/share/tizenbrewConfig.json', JSON.stringify(config, null, 4));
}

module.exports = {
    readConfig,
    writeConfig
};