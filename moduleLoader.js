import { readFileSync } from 'node:fs';
import Config from './config.json' assert { type: 'json' };

async function loadModules() {
    const modules = [];

    for (const module of Config.modules) {
        let moduleJson;
        try {
            moduleJson = JSON.parse(readFileSync(`node_modules/${module}/package.json`, 'utf-8'));
        } catch (error) {
            console.error(`Error reading package.json for ${module}:`, error.message);
            continue;
        }
        if (moduleJson.packageType === 'app') {
            modules.push({
                name: module,
                appName: moduleJson.appName,
                description: moduleJson.description,
                packageType: moduleJson.packageType,
                appPath: moduleJson.appPath,
            });
        } else {
            modules.push({
                name: module,
                appName: moduleJson.appName,
                description: moduleJson.description,
                appPath: moduleJson.websiteURL,
                packageType: moduleJson.packageType,
                mainFile: moduleJson.main,
            });
        }
    }

    return modules;
}

export default loadModules;