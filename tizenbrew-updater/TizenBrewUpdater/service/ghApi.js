"use strict";

const fetch = require('node-fetch');

function getLatestRelease(type) {
    return fetch('https://api.github.com/repos/reisxd/TizenBrew/releases/latest')
        .then(res => res.json())
        .then(json => {
            const asset = json.assets.find(asset => asset.name === `TizenBrewStandalone-${type}.wgt`);
            return asset.browser_download_url;
        });
}

function getLatestReleaseTag() {
    return fetch('https://api.github.com/repos/reisxd/TizenBrew/releases/latest')
        .then(res => res.json())
        .then(json => json.tag_name);
}

function downloadLatestRelease(type) {
    return getLatestRelease(type)
        .then(url => fetch(url))
        .then(res => res.buffer())
}

module.exports = { downloadLatestRelease, getLatestReleaseTag };