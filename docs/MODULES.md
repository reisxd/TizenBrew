# Making a module

There are two types of modules: apps and mods. The modules are normal NPM modules, but they only have files for the app or mods.

## Package.json format

The format is pretty same as a normal package.json file, but with some differences. There are some properties that are required for the module to work.

`packageType`: The type of the module. Can be `app` or `mods`. Required.

`appName`: The name of the module (user friendly, like "TizenTube"). Required.

`appPath`: The path to the app folder. Required if `packageType` is `app`.

`websiteURL`: The URL of the website. Required if `packageType` is `mods`.

`main`: The main file of the mods module. Required if `packageType` is `mods`.

`keys`: The keys that should be registered using the [TVInputDevice](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvinputdevice-api.html) API. Not required.

Here's an example mods module:
```json
{
    "name": "@foxreis/tizentube",
    "appName": "TizenTube",
    "version": "1.0.0",
    "description": "TizenTube is an ad-free and sponsor-free solution for your favourite streaming website on your Tizen (Samsung) TVs.",
    "main": "userScript.js",
    "packageType": "mods",
    "websiteURL": "https://example.com"
}
```