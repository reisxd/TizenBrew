# Creating modules for TizenBrew

There are three types of modules: applications, site modifications and services. The modules itself are normal NPM/Node modules but special.

## Application Modules

Application modules are simply web pages without any modifications. They are not installed on the TV, but are served from a server. The module should contain a `package.json` file with the following properties:

- `packageType`: The type of the module. Should be `app`.
- `appName`: The name of the module (user friendly, like "TizenTube").
- `appPath`: The path to the index.html file. (like `app/index.html`)
- `keys`: The keys that should be registered using the [TVInputDevice](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvinputdevice-api.html) API.

## Site Modification Modules

Site modification modules are basically the same as application modules, but they are used to modify a website. The modifications are basically JavaScript code that is injected into a website. The module should contain a `package.json` file with the following properties:

- `packageType`: The type of the module. Should be `mods`
- `appName`: The name of the module (user friendly, like "TizenTube").
- `websiteURL`: The URL of the website.
- `serviceFile`: The main JavaScript file of the service. Used if exists.
- `main`: The JavaScript file to be injected to the website.
- `keys`: The keys that should be registered using the [TVInputDevice](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvinputdevice-api.html) API.
- `tizenAppId`: The Tizen application ID of the application that should be modified. Will be used if it exists.

## Service Modules

Service modules are ran in the background using Node.js. They can be used to interact with the TV in the background.

Service modules is also an application module, but with a special property called `serviceFile`. This property should contain the path to the main JavaScript file of the service.

The module should contain a `package.json` file with the following properties:

- `packageType`: The type of the module. Should be `service`.
- `appName`: The name of the module (user friendly, like "TizenTube").
- `serviceFile`: The main JavaScript file of the service.
- `appPath`: The path to the index.html file. (like `app/index.html`)
- `keys`: The keys that should be registered using the [TVInputDevice](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvinputdevice-api.html) API.


## Examples

See [TizenTube](https://github.com/reisxd/TizenTube) for an example of an site modification module and [Jellyfin-Tizen](https://github.com/GlenLowland/jellyfin-tizen-npm-publish) for an example of an application module.