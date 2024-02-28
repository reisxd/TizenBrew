"use strict";

const fetch = require('node-fetch');

function loadModules(moduleList) {
    const modulePromises = moduleList.map(module => {
        return fetch(`https://cdn.jsdelivr.net/npm/${module}/package.json`)
            .then(res => res.json())
            .then(moduleJson => {
                let moduleData;
                if (moduleJson.packageType === 'app') {
                    moduleData = {
                        name: module,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        packageType: moduleJson.packageType,
                        appPath: moduleJson.appPath,
                    };
                } else {
                    moduleData = {
                        name: module,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        appPath: moduleJson.websiteURL,
                        packageType: moduleJson.packageType,
                        mainFile: moduleJson.main,
                    };
                }
                return moduleData;
            })
            .catch(e => {
                console.log(`Error loading module ${module}: ${e}`);
            });
    });

    return Promise.all(modulePromises)
        .then(modules => {
            return modules;
        });
}

module.exports = loadModules;