"use strict";

let translations = {};
let translationLoaded = false;

const languages = {
    "en": "English",
    "tr_TR": "Turkish (Türkçe)",
    "da_DK": "Danish (Dansk)",
    "fr_FR": "French (Français)",
    "es_BO": "Spanish (Español)",
    "de_DE": "German (Deutsch)",
    "nl_NL": "Dutch (Nederlands)",
    "vi_VN": "Vietnamese (Tiếng Việt)",
    "pl_PL": "Polish (Polski)",
    "zh_TW": "Chinese Traditional (Taiwan)",
    "el_GR": "Greek (Ελληνικά)",
    "pt_BR": "Brazilian Portuguese (Português Brasileiro)",
    "hu_HU": "Hungarian (Magyar)",
    "th_TH": "Thai (ไทย)",
    "ru_RU": "Russian (Русский)",
    "it_IT": "Italian (Italiano)",
    "fi_FI": "Finnish (Suomi)"
};

function loadTranslation(lang) {
    const langFile = "lang/" + lang + ".json";
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", langFile, true);
        xhr.onload = function () {
            try {
                var data = JSON.parse(xhr.responseText);
                translations = data;
                translationLoaded = true;
                window.dispatchEvent(new Event("translationLoaded"));
                resolve(translations);
            } catch (e) {
                reject(e);
            }
        };
        xhr.onerror = function () {
            if (lang !== "en") {
                loadTranslation("en").then(resolve).catch(reject);
            } else {
                resolve(false);
            }
        };
        xhr.send();
    });
}

function template(str, values) {
    return str.replace(/\{([\w.]+)\}/g, function (match, key) {
        const value = values[key];
        if (key.includes(".")) {
            return t(key);
        }
        return value || match;
    });
}

function updateTranslations() {
    Array.from(document.querySelectorAll("[data-i18n]")).forEach(element => {
        const key = element.getAttribute("data-i18n");
        const values = key.split(".");
        const templateValues = element.getAttribute("data-i18n-values");
        let parsedTemplateValues = {};
        if (templateValues) {
            parsedTemplateValues = templateValues.split("&").reduce((o, i) => {
                const splitArray = i.split("=");
                o[splitArray[0]] = splitArray[1];
                return o;
            }, {});
        }
        const string = values.reduce((o, i) => o[i], translations);
        element.innerHTML = template(string, parsedTemplateValues);
    });
}

function t(key, templateValues) {
    const values = key.split(".");
    const value = values.reduce((o, i) => o[i], translations);
    if (templateValues) {
        return template(value, templateValues);
    } else return value;
}

window.i18n = {
    loadTranslation,
    updateTranslations,
    template,
    t
}
