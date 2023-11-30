'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var EVALUATION_RE = /[[\].]{1,2}/g;
/* Interpolation RegExp.
 *
 * Because interpolation inside attributes are deprecated in Vue 2 we have to
 * use another set of delimiters to be able to use `translate-plural` etc.
 * We use %{ } delimiters.
 *
 * /
 *   %\{                => Starting delimiter: `%{`
 *     (                => Start capture
 *       (?:.|\n)       => Non-capturing group: any character or newline
 *       +?             => One or more times (ungreedy)
 *     )                => End capture
 *   \}                 => Ending delimiter: `}`
 * /g                   => Global: don't return after first match
 */
var INTERPOLATION_RE = /%\{((?:.|\n)+?)\}/g;
var MUSTACHE_SYNTAX_RE = /\{\{((?:.|\n)+?)\}\}/g;
/**
 * Evaluate a piece of template string containing %{ } placeholders.
 * E.g.: 'Hi %{ user.name }' => 'Hi Bob'
 *
 * This is a vm.$interpolate alternative for Vue 2.
 * https://vuejs.org/v2/guide/migration.html#vm-interpolate-removed
 *
 * @param {String} msgid - The translation key containing %{ } placeholders
 * @param {Object} context - An object whose elements are put in their corresponding placeholders
 *
 * @return {String} The interpolated string
 */
var interpolate = function (plugin) {
    return function (msgid, context, disableHtmlEscaping, parent) {
        if (context === void 0) { context = {}; }
        if (disableHtmlEscaping === void 0) { disableHtmlEscaping = false; }
        var silent = plugin.silent;
        if (!silent && MUSTACHE_SYNTAX_RE.test(msgid)) {
            console.warn("Mustache syntax cannot be used with vue-gettext. Please use \"%{}\" instead of \"{{}}\" in: ".concat(msgid));
        }
        var result = msgid.replace(INTERPOLATION_RE, function (_match, token) {
            var expression = token.trim();
            var evaluated;
            var escapeHtmlMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            };
            // Avoid eval() by splitting `expression` and looping through its different properties if any, see #55.
            function getProps(obj, expression) {
                var arr = expression.split(EVALUATION_RE).filter(function (x) { return x; });
                while (arr.length) {
                    obj = obj[arr.shift()];
                }
                return obj;
            }
            function evalInContext(context, expression, parent) {
                try {
                    evaluated = getProps(context, expression);
                }
                catch (e) {
                    // Ignore errors, because this function may be called recursively later.
                }
                if (evaluated === undefined || evaluated === null) {
                    if (parent) {
                        // Recursively climb the parent chain to allow evaluation inside nested components, see #23 and #24.
                        return evalInContext(parent.ctx, expression, parent.parent);
                    }
                    else {
                        console.warn("Cannot evaluate expression: ".concat(expression));
                        evaluated = expression;
                    }
                }
                var result = evaluated.toString();
                if (disableHtmlEscaping) {
                    // Do not escape HTML, see #78.
                    return result;
                }
                // Escape HTML, see #78.
                return result.replace(/[&<>"']/g, function (m) { return escapeHtmlMap[m]; });
            }
            return evalInContext(context, expression, parent);
        });
        return result;
    };
};
// Store this values as function attributes for easy access elsewhere to bypass a Rollup
// weak point with `export`:
// https://github.com/rollup/rollup/blob/fca14d/src/utils/getExportMode.js#L27
interpolate.INTERPOLATION_RE = INTERPOLATION_RE;
interpolate.INTERPOLATION_PREFIX = "%{";

/**
 * Plural Forms
 *
 * This is a list of the plural forms, as used by Gettext PO, that are appropriate to each language.
 * http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html
 *
 * This is a replica of angular-gettext's plural.js
 * https://github.com/rubenv/angular-gettext/blob/master/src/plural.js
 */
var plurals = {
    getTranslationIndex: function (languageCode, n) {
        n = Number(n);
        n = typeof n === "number" && isNaN(n) ? 1 : n; // Fallback to singular.
        // Extract the ISO 639 language code. The ISO 639 standard defines
        // two-letter codes for many languages, and three-letter codes for
        // more rarely used languages.
        // https://www.gnu.org/software/gettext/manual/html_node/Language-Codes.html#Language-Codes
        if (languageCode.length > 2 && languageCode !== "pt_BR") {
            languageCode = languageCode.split("_")[0];
        }
        switch (languageCode) {
            case "ay": // Aymará
            case "bo": // Tibetan
            case "cgg": // Chiga
            case "dz": // Dzongkha
            case "fa": // Persian
            case "id": // Indonesian
            case "ja": // Japanese
            case "jbo": // Lojban
            case "ka": // Georgian
            case "kk": // Kazakh
            case "km": // Khmer
            case "ko": // Korean
            case "ky": // Kyrgyz
            case "lo": // Lao
            case "ms": // Malay
            case "my": // Burmese
            case "sah": // Yakut
            case "su": // Sundanese
            case "th": // Thai
            case "tt": // Tatar
            case "ug": // Uyghur
            case "vi": // Vietnamese
            case "wo": // Wolof
            case "zh": // Chinese
                // 1 form
                return 0;
            case "is": // Icelandic
                // 2 forms
                return n % 10 !== 1 || n % 100 === 11 ? 1 : 0;
            case "jv": // Javanese
                // 2 forms
                return n !== 0 ? 1 : 0;
            case "mk": // Macedonian
                // 2 forms
                return n === 1 || n % 10 === 1 ? 0 : 1;
            case "ach": // Acholi
            case "ak": // Akan
            case "am": // Amharic
            case "arn": // Mapudungun
            case "br": // Breton
            case "fil": // Filipino
            case "fr": // French
            case "gun": // Gun
            case "ln": // Lingala
            case "mfe": // Mauritian Creole
            case "mg": // Malagasy
            case "mi": // Maori
            case "oc": // Occitan
            case "pt_BR": // Brazilian Portuguese
            case "tg": // Tajik
            case "ti": // Tigrinya
            case "tr": // Turkish
            case "uz": // Uzbek
            case "wa": // Walloon
                // 2 forms
                return n > 1 ? 1 : 0;
            case "lv": // Latvian
                // 3 forms
                return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
            case "lt": // Lithuanian
                // 3 forms
                return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
            case "be": // Belarusian
            case "bs": // Bosnian
            case "hr": // Croatian
            case "ru": // Russian
            case "sr": // Serbian
            case "uk": // Ukrainian
                // 3 forms
                return n % 10 === 1 && n % 100 !== 11
                    ? 0
                    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
                        ? 1
                        : 2;
            case "mnk": // Mandinka
                // 3 forms
                return n === 0 ? 0 : n === 1 ? 1 : 2;
            case "ro": // Romanian
                // 3 forms
                return n === 1 ? 0 : n === 0 || (n % 100 > 0 && n % 100 < 20) ? 1 : 2;
            case "pl": // Polish
                // 3 forms
                return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
            case "cs": // Czech
            case "sk": // Slovak
                // 3 forms
                return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
            case "csb": // Kashubian
                // 3 forms
                return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
            case "sl": // Slovenian
                // 4 forms
                return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
            case "mt": // Maltese
                // 4 forms
                return n === 1 ? 0 : n === 0 || (n % 100 > 1 && n % 100 < 11) ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3;
            case "gd": // Scottish Gaelic
                // 4 forms
                return n === 1 || n === 11 ? 0 : n === 2 || n === 12 ? 1 : n > 2 && n < 20 ? 2 : 3;
            case "cy": // Welsh
                // 4 forms
                return n === 1 ? 0 : n === 2 ? 1 : n !== 8 && n !== 11 ? 2 : 3;
            case "kw": // Cornish
                // 4 forms
                return n === 1 ? 0 : n === 2 ? 1 : n === 3 ? 2 : 3;
            case "ga": // Irish
                // 5 forms
                return n === 1 ? 0 : n === 2 ? 1 : n > 2 && n < 7 ? 2 : n > 6 && n < 11 ? 3 : 4;
            case "ar": // Arabic
                // 6 forms
                return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
            default:
                // Everything else
                return n !== 1 ? 1 : 0;
        }
    },
};

var translate = function (language) { return ({
    /*
     * Get the translated string from the translation.json file generated by easygettext.
     *
     * @param {String} msgid - The translation key
     * @param {Number} n - The number to switch between singular and plural
     * @param {String} context - The translation key context
     * @param {String} defaultPlural - The default plural value (optional)
     * @param {String} language - The language ID (e.g. 'fr_FR' or 'en_US')
     *
     * @return {String} The translated string
     */
    getTranslation: function (msgid, n, context, defaultPlural, languageKey, parameters, disableHtmlEscaping) {
        if (n === void 0) { n = 1; }
        if (context === void 0) { context = null; }
        if (defaultPlural === void 0) { defaultPlural = null; }
        if (disableHtmlEscaping === void 0) { disableHtmlEscaping = false; }
        if (languageKey === undefined) {
            languageKey = language.current;
        }
        var interp = function (message, parameters) {
            return parameters ? language.interpolate(message, parameters, disableHtmlEscaping) : message;
        };
        // spacing needs to be consistent even if a web template designer adds spaces between lines
        msgid = msgid.trim();
        if (!msgid) {
            return ""; // Allow empty strings.
        }
        var silent = languageKey ? language.silent || language.muted.indexOf(languageKey) !== -1 : false;
        // Default untranslated string, singular or plural.
        var untranslated = defaultPlural && plurals.getTranslationIndex(languageKey, n) > 0 ? defaultPlural : msgid;
        // `easygettext`'s `gettext-compile` generates a JSON version of a .po file based on its `Language` field.
        // But in this field, `ll_CC` combinations denoting a language’s main dialect are abbreviated as `ll`,
        // for example `de` is equivalent to `de_DE` (German as spoken in Germany).
        // See the `Language` section in https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html
        // So try `ll_CC` first, or the `ll` abbreviation which can be three-letter sometimes:
        // https://www.gnu.org/software/gettext/manual/html_node/Language-Codes.html#Language-Codes
        var pluginTranslations = language.translations;
        var translations = pluginTranslations[languageKey] || pluginTranslations[languageKey.split("_")[0]];
        if (!translations) {
            if (!silent) {
                console.warn("No translations found for ".concat(languageKey));
            }
            return interp(untranslated, parameters);
        }
        var getTranslationFromArray = function (arr) {
            var translationIndex = plurals.getTranslationIndex(languageKey, n);
            // Do not assume that the default value of n is 1 for the singular form of all languages. E.g. Arabic
            if (arr.length === 1 && n === 1) {
                translationIndex = 0;
            }
            if (!arr[translationIndex]) {
                throw new Error(msgid + " " + translationIndex + " " + language.current + " " + n);
            }
            return interp(arr[translationIndex], parameters);
        };
        var getUntranslatedMsg = function () {
            if (!silent) {
                var msg = "Untranslated ".concat(languageKey, " key found: ").concat(msgid);
                if (context) {
                    msg += " (with context: ".concat(context, ")");
                }
                console.warn(msg);
            }
            return interp(untranslated, parameters);
        };
        var translateMsg = function (msg, context) {
            if (context === void 0) { context = null; }
            if (msg instanceof Object) {
                if (Array.isArray(msg)) {
                    return getTranslationFromArray(msg);
                }
                var msgContext = context !== null && context !== void 0 ? context : "";
                var ctxVal = msg[msgContext];
                return translateMsg(ctxVal);
            }
            if (context) {
                return getUntranslatedMsg();
            }
            if (!msg) {
                return getUntranslatedMsg();
            }
            return interp(msg, parameters);
        };
        var translated = translations[msgid];
        return translateMsg(translated, context);
    },
    /*
     * Returns a string of the translation of the message.
     * Also makes the string discoverable by gettext-extract.
     *
     * @param {String} msgid - The translation key
     * @param {Object} parameters - The interpolation parameters
     * @param {Boolean} disableHtmlEscaping - Disable html escaping
     *
     * @return {String} The translated string
     */
    gettext: function (msgid, parameters, disableHtmlEscaping) {
        if (disableHtmlEscaping === void 0) { disableHtmlEscaping = false; }
        return this.getTranslation(msgid, undefined, undefined, undefined, undefined, parameters, disableHtmlEscaping);
    },
    /*
     * Returns a string of the translation for the given context.
     * Also makes the string discoverable by gettext-extract.
     *
     * @param {String} context - The context of the string to translate
     * @param {String} msgid - The translation key
     * @param {Object} parameters - The interpolation parameters
     * @param {Boolean} disableHtmlEscaping - Disable html escaping
     *
     * @return {String} The translated string
     */
    pgettext: function (context, msgid, parameters, disableHtmlEscaping) {
        if (disableHtmlEscaping === void 0) { disableHtmlEscaping = false; }
        return this.getTranslation(msgid, 1, context, undefined, undefined, parameters, disableHtmlEscaping);
    },
    /*
     * Returns a string of the translation of either the singular or plural,
     * based on the number.
     * Also makes the string discoverable by gettext-extract.
     *
     * @param {String} msgid - The translation key
     * @param {String} plural - The plural form of the translation key
     * @param {Number} n - The number to switch between singular and plural
     * @param {Object} parameters - The interpolation parameters
     * @param {Boolean} disableHtmlEscaping - Disable html escaping
     *
     * @return {String} The translated string
     */
    ngettext: function (msgid, plural, n, parameters, disableHtmlEscaping) {
        if (disableHtmlEscaping === void 0) { disableHtmlEscaping = false; }
        return this.getTranslation(msgid, n, null, plural, undefined, parameters, disableHtmlEscaping);
    },
    /*
     * Returns a string of the translation of either the singular or plural,
     * based on the number, for the given context.
     * Also makes the string discoverable by gettext-extract.
     *
     * @param {String} context - The context of the string to translate
     * @param {String} msgid - The translation key
     * @param {String} plural - The plural form of the translation key
     * @param {Number} n - The number to switch between singular and plural
     * @param {Object} parameters - The interpolation parameters
     * @param {Boolean} disableHtmlEscaping - Disable html escaping
     *
     * @return {String} The translated string
     */
    npgettext: function (context, msgid, plural, n, parameters, disableHtmlEscaping) {
        if (disableHtmlEscaping === void 0) { disableHtmlEscaping = false; }
        return this.getTranslation(msgid, n, context, plural, undefined, parameters, disableHtmlEscaping);
    },
}); };

var GetTextSymbol = Symbol("GETTEXT");

function normalizeTranslationKey(key) {
    return key
        .replace(/\r?\n|\r/, "")
        .replace(/\s\s+/g, " ")
        .trim();
}
function normalizeTranslations(translations) {
    var newTranslations = {};
    Object.keys(translations).forEach(function (lang) {
        var langData = translations[lang];
        var newLangData = {};
        Object.keys(langData).forEach(function (key) {
            newLangData[normalizeTranslationKey(key)] = langData[key];
        });
        newTranslations[lang] = newLangData;
    });
    return newTranslations;
}
var useGettext = function () {
    var gettext = vue.inject(GetTextSymbol, null);
    if (!gettext) {
        throw new Error("Failed to inject gettext. Make sure vue3-gettext is set up properly.");
    }
    return gettext;
};

/**
 * Translate content according to the current language.
 * @deprecated
 */
var Component = vue.defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names, vue/component-definition-name-casing
    name: "translate",
    props: {
        tag: {
            type: String,
            default: "span",
        },
        // Always use v-bind for dynamically binding the `translateN` prop to data on the parent,
        // i.e.: `:translate-n`.
        translateN: {
            type: Number,
            default: null,
        },
        translatePlural: {
            type: String,
            default: null,
        },
        translateContext: {
            type: String,
            default: null,
        },
        translateParams: {
            type: Object,
            default: null,
        },
        translateComment: {
            type: String,
            default: null,
        },
    },
    setup: function (props, context) {
        var _a, _b, _c;
        var isPlural = props.translateN !== undefined && props.translatePlural !== undefined;
        if (!isPlural && (props.translateN || props.translatePlural)) {
            throw new Error("`translate-n` and `translate-plural` attributes must be used together: ".concat((_c = (_b = (_a = context.slots).default) === null || _b === void 0 ? void 0 : _b.call(_a)[0]) === null || _c === void 0 ? void 0 : _c.children, "."));
        }
        var root = vue.ref();
        var plugin = useGettext();
        var msgid = vue.ref(null);
        vue.onMounted(function () {
            if (!msgid.value && root.value) {
                msgid.value = root.value.innerHTML.trim();
            }
        });
        var translation = vue.computed(function () {
            var _a;
            var translatedMsg = translate(plugin).getTranslation(msgid.value, props.translateN, props.translateContext, isPlural ? props.translatePlural : null, plugin.current);
            return interpolate(plugin)(translatedMsg, props.translateParams, undefined, (_a = vue.getCurrentInstance()) === null || _a === void 0 ? void 0 : _a.parent);
        });
        // The text must be wraped inside a root HTML element, so we use a <span> by default.
        return function () {
            if (!msgid.value) {
                return vue.h(props.tag, { ref: root }, context.slots.default ? context.slots.default() : "");
            }
            return vue.h(props.tag, { ref: root, innerHTML: translation.value });
        };
    },
});

var updateTranslation = function (language, el, binding, vnode) {
    var _a;
    var attrs = vnode.props || {};
    var msgid = el.dataset.msgid;
    var translateContext = attrs["translate-context"];
    var translateN = attrs["translate-n"];
    var translatePlural = attrs["translate-plural"];
    var isPlural = translateN !== undefined && translatePlural !== undefined;
    var disableHtmlEscaping = attrs["render-html"] === "true";
    if (!isPlural && (translateN || translatePlural)) {
        throw new Error("`translate-n` and `translate-plural` attributes must be used together:" + msgid + ".");
    }
    if (!language.silent && attrs["translate-params"]) {
        console.warn("`translate-params` is required as an expression for v-translate directive. Please change to `v-translate='params'`: ".concat(msgid));
    }
    var translation = translate(language).getTranslation(msgid, translateN, translateContext, isPlural ? translatePlural : null, language.current);
    var context = Object.assign((_a = binding.instance) !== null && _a !== void 0 ? _a : {}, binding.value);
    var msg = interpolate(language)(translation, context, disableHtmlEscaping, null);
    el.innerHTML = msg;
};
/**
 * A directive to translate content according to the current language.
 *
 * Use this directive instead of the component if you need to translate HTML content.
 * It's too tricky to support HTML content within the component because we cannot get the raw HTML to use as `msgid`.
 *
 * This directive has a similar interface to the <translate> component, supporting
 * `translate-comment`, `translate-context`, `translate-plural`, `translate-n`.
 *
 * `<p v-translate translate-comment='Good stuff'>This is <strong class='txt-primary'>Sparta</strong>!</p>`
 *
 * If you need interpolation, you must add an expression that outputs binding value that changes with each of the
 * context variable:
 * `<p v-translate="fullName + location">I am %{ fullName } and from %{ location }</p>`
 * @deprecated
 */
function directive(language) {
    var update = function (el, binding, vnode) {
        // Store the current language in the element's dataset.
        el.dataset.currentLanguage = language.current;
        updateTranslation(language, el, binding, vnode);
    };
    return {
        beforeMount: function (el, binding, vnode) {
            // Get the raw HTML and store it in the element's dataset (as advised in Vue's official guide).
            if (!el.dataset.msgid) {
                el.dataset.msgid = el.innerHTML;
            }
            vue.watch(language, function () {
                update(el, binding, vnode);
            });
            update(el, binding, vnode);
        },
        updated: function (el, binding, vnode) {
            update(el, binding, vnode);
        },
    };
}

var defaultOptions = {
    /** all the available languages of your application. Keys must match locale names */
    availableLanguages: { en: "English" },
    defaultLanguage: "en",
    mutedLanguages: [],
    silent: false,
    translations: {},
    setGlobalProperties: true,
    provideDirective: true,
    provideComponent: true,
};
function createGettext(options) {
    if (options === void 0) { options = {}; }
    Object.keys(options).forEach(function (key) {
        if (Object.keys(defaultOptions).indexOf(key) === -1) {
            throw new Error("".concat(key, " is an invalid option for the translate plugin."));
        }
    });
    var mergedOptions = __assign(__assign({}, defaultOptions), options);
    var translations = vue.ref(normalizeTranslations(mergedOptions.translations));
    var gettext = vue.reactive({
        available: mergedOptions.availableLanguages,
        muted: mergedOptions.mutedLanguages,
        silent: mergedOptions.silent,
        translations: vue.computed({
            get: function () {
                return translations.value;
            },
            set: function (val) {
                translations.value = normalizeTranslations(val);
            },
        }),
        current: mergedOptions.defaultLanguage,
        install: function (app) {
            // TODO: is this needed?
            app[GetTextSymbol] = gettext;
            app.provide(GetTextSymbol, gettext);
            if (mergedOptions.setGlobalProperties) {
                var globalProperties = app.config.globalProperties;
                globalProperties.$gettext = gettext.$gettext;
                globalProperties.$pgettext = gettext.$pgettext;
                globalProperties.$ngettext = gettext.$ngettext;
                globalProperties.$npgettext = gettext.$npgettext;
                globalProperties.$gettextInterpolate = gettext.interpolate;
                globalProperties.$language = gettext;
            }
            if (mergedOptions.provideDirective) {
                app.directive("translate", directive(gettext));
            }
            if (mergedOptions.provideComponent) {
                // eslint-disable-next-line vue/multi-word-component-names, vue/component-definition-name-casing
                app.component("translate", Component);
            }
        },
    });
    var translate$1 = translate(gettext);
    var interpolate$1 = interpolate(gettext);
    gettext.$gettext = translate$1.gettext.bind(translate$1);
    gettext.$pgettext = translate$1.pgettext.bind(translate$1);
    gettext.$ngettext = translate$1.ngettext.bind(translate$1);
    gettext.$npgettext = translate$1.npgettext.bind(translate$1);
    gettext.interpolate = interpolate$1.bind(interpolate$1);
    gettext.directive = directive(gettext);
    gettext.component = Component;
    return gettext;
}
var defineGettextConfig = function (config) {
    return config;
};

exports.createGettext = createGettext;
exports.defineGettextConfig = defineGettextConfig;
exports.useGettext = useGettext;
