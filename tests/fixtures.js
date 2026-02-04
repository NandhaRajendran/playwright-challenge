/* eslint-disable no-empty-pattern */
import base from '@playwright/test';
import ExecutionHelper from '../helper/execution/executionHelper.js';
import Logger from '../helper/logger/logHelper.js';

const test = base.test.extend({
    logger: async({}, use, testInfo ) => {
        const logger = new Logger( testInfo.title );
        await use( logger );
    },
    executionHelper: async({}, use, testInfo ) => {
        const logger = new Logger( testInfo.title );
        const helper = new ExecutionHelper( logger );
        await use( helper );
    },
});

export const expect = base.expect;
export default test;
