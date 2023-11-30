#!/usr/bin/env node
'use strict';

var tslib = require('tslib');
var chalk = require('chalk');
var commandLineArgs = require('command-line-args');
var fsPromises = require('fs/promises');
var path = require('path');
var cosmiconfig = require('cosmiconfig');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var commandLineArgs__default = /*#__PURE__*/_interopDefaultLegacy(commandLineArgs);
var fsPromises__default = /*#__PURE__*/_interopDefaultLegacy(fsPromises);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

// Based on https://github.com/Polyconseil/easygettext/blob/master/src/compile.js
var Pofile = require("pofile");
/**
 * Returns a sanitized po data dictionary where:
 * - no fuzzy or obsolete strings are returned
 * - no empty translations are returned
 *
 * @param poItems items from the PO catalog
 * @returns jsonData: sanitized PO data
 */
var sanitizePoData = function (poItems) {
    var messages = {};
    for (var _i = 0, poItems_1 = poItems; _i < poItems_1.length; _i++) {
        var item = poItems_1[_i];
        var ctx = item.msgctxt || "";
        if (item.msgstr[0] && item.msgstr[0].length > 0 && !item.flags.fuzzy && !item.obsolete) {
            if (!messages[item.msgid]) {
                messages[item.msgid] = {};
            }
            // Add an array for plural, a single string for singular.
            messages[item.msgid][ctx] = item.msgstr.length === 1 ? item.msgstr[0] : item.msgstr;
        }
    }
    // Strip context from messages that have no context.
    for (var key in messages) {
        if (Object.keys(messages[key]).length === 1 && messages[key][""]) {
            messages[key] = messages[key][""];
        }
    }
    return messages;
};
var po2json = function (poContent) {
    var catalog = Pofile.parse(poContent);
    if (!catalog.headers.Language) {
        throw new Error("No Language headers found!");
    }
    return {
        headers: catalog.headers,
        messages: sanitizePoData(catalog.items),
    };
};
var compilePoFiles = function (localesPaths) { return tslib.__awaiter(void 0, void 0, void 0, function () {
    var translations;
    return tslib.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                translations = {};
                return [4 /*yield*/, Promise.all(localesPaths.map(function (lp) { return tslib.__awaiter(void 0, void 0, void 0, function () {
                        var fileContent, data, lang;
                        return tslib.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fsPromises__default["default"].readFile(lp, { encoding: "utf-8" })];
                                case 1:
                                    fileContent = _a.sent();
                                    data = po2json(fileContent);
                                    lang = data.headers.Language;
                                    if (lang && !translations[lang]) {
                                        translations[lang] = data.messages;
                                    }
                                    else {
                                        Object.assign(translations[data.headers.Language], data.messages);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                _a.sent();
                return [2 /*return*/, translations];
        }
    });
}); };

var loadConfig = function (cliArgs) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var moduleName = "gettext";
    var explorer = cosmiconfig.cosmiconfigSync(moduleName, {
        searchPlaces: ["".concat(moduleName, ".config.js"), "".concat(moduleName, ".config.json")],
    });
    var configRes;
    if (cliArgs === null || cliArgs === void 0 ? void 0 : cliArgs.config) {
        configRes = explorer.load(cliArgs.config);
        if (!configRes) {
            throw new Error("Config not found: ".concat(cliArgs.config));
        }
    }
    else {
        configRes = explorer.search();
    }
    var config = configRes === null || configRes === void 0 ? void 0 : configRes.config;
    var languagePath = ((_a = config.output) === null || _a === void 0 ? void 0 : _a.path) || "./src/language";
    var joinPath = function (inputPath) { return path__default["default"].join(languagePath, inputPath); };
    var joinPathIfRelative = function (inputPath) {
        if (!inputPath) {
            return undefined;
        }
        return path__default["default"].isAbsolute(inputPath) ? inputPath : path__default["default"].join(languagePath, inputPath);
    };
    return {
        input: {
            path: ((_b = config.input) === null || _b === void 0 ? void 0 : _b.path) || "./src",
            include: ((_c = config.input) === null || _c === void 0 ? void 0 : _c.include) || ["**/*.js", "**/*.ts", "**/*.vue"],
            exclude: ((_d = config.input) === null || _d === void 0 ? void 0 : _d.exclude) || [],
        },
        output: {
            path: languagePath,
            potPath: joinPathIfRelative((_e = config.output) === null || _e === void 0 ? void 0 : _e.potPath) || joinPath("./messages.pot"),
            jsonPath: joinPathIfRelative((_f = config.output) === null || _f === void 0 ? void 0 : _f.jsonPath) ||
                (((_g = config.output) === null || _g === void 0 ? void 0 : _g.splitJson) ? joinPath("./") : joinPath("./translations.json")),
            locales: ((_h = config.output) === null || _h === void 0 ? void 0 : _h.locales) || ["en"],
            flat: ((_j = config.output) === null || _j === void 0 ? void 0 : _j.flat) === undefined ? false : config.output.flat,
            linguas: ((_k = config.output) === null || _k === void 0 ? void 0 : _k.linguas) === undefined ? true : config.output.linguas,
            splitJson: ((_l = config.output) === null || _l === void 0 ? void 0 : _l.splitJson) === undefined ? false : config.output.splitJson,
        },
    };
};

var optionDefinitions = [{ name: "config", alias: "c", type: String }];
var options;
try {
    options = commandLineArgs__default["default"](optionDefinitions);
}
catch (e) {
    console.error(e);
    process.exit(1);
}
var config = loadConfig(options);
console.info("Language directory: ".concat(chalk__default["default"].blueBright(config.output.path)));
console.info("Locales: ".concat(chalk__default["default"].blueBright(config.output.locales)));
console.info();
var localesPaths = config.output.locales.map(function (loc) {
    return config.output.flat ? path__default["default"].join(config.output.path, "".concat(loc, ".po")) : path__default["default"].join(config.output.path, "".concat(loc, "/app.po"));
});
(function () { return tslib.__awaiter(void 0, void 0, void 0, function () {
    var jsonRes, outputPath;
    return tslib.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fsPromises__default["default"].mkdir(config.output.path, { recursive: true })];
            case 1:
                _a.sent();
                return [4 /*yield*/, compilePoFiles(localesPaths)];
            case 2:
                jsonRes = _a.sent();
                console.info("".concat(chalk__default["default"].green("Compiled json"), ": ").concat(chalk__default["default"].grey(JSON.stringify(jsonRes))));
                console.info();
                if (!config.output.splitJson) return [3 /*break*/, 4];
                return [4 /*yield*/, Promise.all(config.output.locales.map(function (locale) { return tslib.__awaiter(void 0, void 0, void 0, function () {
                        var outputPath;
                        var _a;
                        return tslib.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    outputPath = path__default["default"].join(config.output.jsonPath, "".concat(locale, ".json"));
                                    return [4 /*yield*/, fsPromises__default["default"].writeFile(outputPath, JSON.stringify((_a = {},
                                            _a[locale] = jsonRes[locale],
                                            _a)))];
                                case 1:
                                    _b.sent();
                                    console.info("".concat(chalk__default["default"].green("Created"), ": ").concat(chalk__default["default"].blueBright(outputPath)));
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4:
                outputPath = config.output.jsonPath;
                return [4 /*yield*/, fsPromises__default["default"].writeFile(outputPath, JSON.stringify(jsonRes))];
            case 5:
                _a.sent();
                console.info("".concat(chalk__default["default"].green("Created"), ": ").concat(chalk__default["default"].blueBright(outputPath)));
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); })();
