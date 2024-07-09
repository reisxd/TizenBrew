"use strict";

const vm = require('vm');
const fetch = require('node-fetch');

function startService(module, pkg) {
    let sandbox = {};

    Object.getOwnPropertyNames(global).forEach(prop => {
        const disAllowed = ['services', 'module', 'global', 'inDebug', 'currentClient', 'currentModule'];
        if (disAllowed.includes(prop)) return;
        sandbox[prop] = global[prop];
    });
    
    sandbox['require'] = require;
    sandbox['module'] = { exports: {} };
    
    fetch(`https://cdn.jsdelivr.net/${pkg.type}/${pkg.name}/${module.serviceFile}`)
        .then(res => res.text())
        .then(script => {
            global.services.set(pkg.name, {
                context: vm.createContext(sandbox),
                hasCrashed: false
            });

            try {
                vm.runInContext(script, global.services.get(pkg.name).context);
            } catch (e) {
                console.error(e);
                global.services.get(pkg.name).hasCrashed = true;
            }
        });
}

module.exports = startService;