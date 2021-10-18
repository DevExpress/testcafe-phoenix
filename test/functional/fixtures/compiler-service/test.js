const delay               = require('../../../../lib/utils/delay');
const { DEFAULT_TIMEOUT } = require('../../../../lib/configuration/default-values');

describe('Compiler service', () => {
    describe('Sync selectors', () => {
        it('API', async () => {
            await runTests('testcafe-fixtures/synchronous-selectors.js', 'API');
        });

        it('selector timeout', async () => {
            await runTests('testcafe-fixtures/synchronous-selectors.js', 'timeout', { selectorTimeout: DEFAULT_TIMEOUT.selector });
        });

        it('error', async () => {
            await runTests('testcafe-fixtures/synchronous-selectors.js', 'error');
        });
    });

    describe('proxy globals on client side (produced by "esm" module)', () => {
        it('Selector', async () => {
            await runTests('testcafe-fixtures/proxy-globals.js', 'Selector');
        });

        it('ClientFunction', async () => {
            await runTests('testcafe-fixtures/proxy-globals.js', 'ClientFunction');
        });
    });

    it('debug', async () => {
        let resolver = null;

        const result = new Promise(resolve => {
            resolver = resolve;
        });

        runTests('testcafe-fixtures/debug.js')
            .then(() => resolver());

        setTimeout(async () => {
            const client = global.testCafe.runner.compilerService.cdp;

            await client.Debugger.resume();

            await delay(1000);

            await client.Debugger.resume();
        }, 10000);


        return result;
    });
});


