"use strict";

const fetch = require('node-fetch');

function loadModules(moduleList) {
    const modulePromises = moduleList.map(module => {
        return fetch(`https://cdn.jsdelivr.net/${module.type}/${module.name}/package.json`)
            .then(res => res.json())
            .then(moduleJson => {
                let moduleData;
                if (moduleJson.packageType === 'app') {
                    moduleData = {
                        name: module.name,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        packageType: moduleJson.packageType,
                        appPath: `http://127.0.0.1:8081/module/${module.type}/${encodeURIComponent(module.name)}/${moduleJson.appPath}`,
                        keys: moduleJson.keys || [],
                        moduleType: module.type
                    };
                } else if (moduleJson.packageType === 'service') {
                    moduleData = {
                        name: module.name,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        packageType: moduleJson.packageType,
                        serviceFile: moduleJson.serviceFile,
                        appPath: `http://127.0.0.1:8081/module/${module.type}/${encodeURIComponent(module.name)}/${moduleJson.appPath}`,
                        keys: moduleJson.keys || [],
                        moduleType: module.type
                    };
                } else {
                    moduleData = {
                        name: module.name,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        appPath: moduleJson.websiteURL,
                        serviceFile: moduleJson.serviceFile,
                        packageType: moduleJson.packageType,
                        mainFile: moduleJson.main,
                        keys: moduleJson.keys || [],
                        tizenAppId: moduleJson.tizenAppId,
                        moduleType: module.type
                    };
                }
                return moduleData;
            })
            .catch(e => {
                return {
                    appName: module.name,
                    name: module.name,
                    appPath: 'file://index.html',
                    keys: [],
                    moduleType: module.type,
                    packageType: 'app',
                    description: `Unknown module ${module.name}. Please check the module name and try again.`
                }
            });
    });

    return Promise.all(modulePromises)
        .then(modules => {
            return modules;
        });
}

module.exports = loadModules;