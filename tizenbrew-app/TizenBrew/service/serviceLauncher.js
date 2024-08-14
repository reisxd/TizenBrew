"use strict";

const vm = require('vm');
const fetch = require('node-fetch');

function startService(module, pkg) {
    let sandbox = {};

    Object.getOwnPropertyNames(global).forEach(prop => {
        const disAllowed = ['services', 'module', 'global', 'inDebug', 'currentClient', 'currentModule'];
        // Node.js v4.4.3 does not have Array.prototype.includes...
        if (disAllowed.indexOf(prop) >= 0) return;
        sandbox[prop] = global[prop];
    });
    
    sandbox['require'] = require;
    sandbox['module'] = { exports: {} };
    fetch(`https://cdn.jsdelivr.net/${pkg}/${module.serviceFile}`)
        .then(res => res.text())
        .then(script => {
            global.services.set(pkg, {
                context: vm.createContext(sandbox),
                hasCrashed: false,
                error: null
            });


            try {
                vm.runInContext(script, global.services.get(pkg).context);
            } catch (e) {
                global.services.get(pkg).hasCrashed = true;
                global.services.get(pkg).error = e;
            }
        })
        .catch(e => {
            if (global.services.has(pkg)) {
                global.services.get(pkg).hasCrashed = true;
                global.services.get(pkg).error = e;
            } else {
                global.services.set(pkg, {
                    context: null,
                    hasCrashed: true,
                    error: e
                });
            }
        });
}

module.exports = startService;