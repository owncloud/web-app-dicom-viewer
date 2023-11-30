"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = void 0;
exports.configs = {
    recommended: {
        /**
         * extends `eslint-config-prettier`
         */
        extends: ['prettier'],
        /**
         * use this plugin
         */
        plugins: ['prettier-vue'],
        /**
         * use prettier rules
         */
        rules: {
            'prettier-vue/prettier': 'error',
        },
    },
};
