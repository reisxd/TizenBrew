"use strict";

const fetch = require('node-fetch');

function loadModules(moduleList) {
    const modulePromises = moduleList.map(module => {
        return fetch(`https://cdn.jsdelivr.net/${module}/package.json`)
            .then(res => res.json())
            .then(moduleJson => {
                let moduleData;
                const splitData = [
                    module.substring(0, module.indexOf('/')),
                    module.substring(module.indexOf('/') + 1)
                ];
                const moduleMetadata = {
                    name: splitData[1],
                    type: splitData[0]
                }
                if (moduleJson.packageType === 'app') {
                    moduleData = {
                        name: moduleMetadata.name,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        packageType: moduleJson.packageType,
                        serviceFile: moduleJson.serviceFile,
                        appPath: `http://127.0.0.1:8081/module/${encodeURIComponent(module)}/${moduleJson.appPath}`,
                        keys: moduleJson.keys || [],
                        moduleType: moduleMetadata.type
                    };
                } else if (moduleJson.packageType === 'service') {
                    moduleData = {
                        name: moduleMetadata.name,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        packageType: moduleJson.packageType,
                        serviceFile: moduleJson.serviceFile,
                        appPath: `http://127.0.0.1:8081/module/${encodeURIComponent(module)}/${moduleJson.appPath}`,
                        keys: moduleJson.keys || [],
                        moduleType: moduleMetadata.type
                    };
                } else {
                    moduleData = {
                        name: moduleMetadata.name,
                        appName: moduleJson.appName,
                        description: moduleJson.description,
                        appPath: moduleJson.websiteURL,
                        serviceFile: moduleJson.serviceFile,
                        packageType: moduleJson.packageType,
                        mainFile: moduleJson.main,
                        keys: moduleJson.keys || [],
                        tizenAppId: moduleJson.tizenAppId,
                        moduleType: moduleMetadata.type
                    };
                }
                return moduleData;
            })
            .catch(e => {
                console.error(e);

                const splitData = [
                    module.substring(0, module.indexOf('/')),
                    module.substring(module.indexOf('/') + 1)
                ];

                const moduleMetadata = {
                    name: splitData[1],
                    type: splitData[0]
                }

                return {
                    appName: 'Unknown Module',
                    name: module,
                    appPath: '',
                    keys: [],
                    moduleType: moduleMetadata.type,
                    packageType: 'app',
                    description: `Unknown module ${module}. Please check the module name and try again.`
                }
            });
    });

    return Promise.all(modulePromises)
        .then(modules => {
            return modules;
        });
}

module.exports = loadModules;