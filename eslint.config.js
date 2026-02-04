import globals from 'globals';
import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';


/** @type {import('eslint').Linter.Config[]} */
export default [{

    plugins: {
        '@stylistic/js': stylisticJs
    },
    ignores: [
        "test/examples/*.js",
        "test/performance/examples/*.js",
        "helper/database/QAAutomationDatabaseModule.js",
        "helper/database/QAAutomationDatabaseModule.js.map",
        "setup/modifyUsers.mjs"
    ]},
{ languageOptions: { globals: {
    ...globals.browser
} } },
pluginJs.configs.recommended,


{
    rules: {
        '@stylistic/js/indent': ['error', 4],
        '@stylistic/js/semi': ["error", "always"],
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-template': 'error',
        'no-unused-vars': 'error',
        'no-undef': 'error',
        'no-duplicate-imports': 'error',
        'no-const-assign': 'error',

        '@stylistic/js/space-in-parens': ['error', 'always', {
            exceptions: ['()', 'empty', '{}', '[]'],
        }],

        '@stylistic/js/object-curly-spacing': ['error', 'always', {
            arraysInObjects: false,
        }],

        '@stylistic/js/no-trailing-spaces': ['error', {
            ignoreComments: true,
        }],

        '@stylistic/js/space-before-function-paren': ['error', 'never'],

        '@stylistic/js/space-infix-ops': 'error',

        '@stylistic/js/no-extra-parens': ['error', 'all', {
            conditionalAssign: false,
        }],

        "@stylistic/js/no-multi-spaces": "error",

        '@stylistic/js/key-spacing': ['error', {
            afterColon: true,
        }],

        '@stylistic/js/padded-blocks': ['error', 'never'],
        '@stylistic/js/nonblock-statement-body-position': ['error', 'below'],
        '@stylistic/js/keyword-spacing': ["error", { "after": true }],
        '@stylistic/js/space-before-blocks': 'error',
        'curly': 'error',

        '@stylistic/js/comma-spacing': ['error', {
            before: false,
            after: true,
        }],
    }
}
];
