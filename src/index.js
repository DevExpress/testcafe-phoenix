/* eslint-disable */
import { GeneralError } from './errors/runtime';
import { RUNTIME_ERRORS } from './errors/types';
import embeddingUtils from './embedding-utils';
import exportableLib from './api/exportable-lib';
import TestCafeConfiguration from './configuration/testcafe-configuration';
import OPTION_NAMES from './configuration/option-names';
import ProcessTitle from './services/process-title';
import userVariables from './api/user-variables';

const lazyRequire   = require('import-lazy')(require);
const TestCafe      = lazyRequire('./testcafe');
const endpointUtils = lazyRequire('endpoint-utils');
const setupExitHook = lazyRequire('async-exit-hook');

// Validations
async function getValidHostname (hostname) {
    if (hostname) {
        const valid = await endpointUtils.isMyHostname(hostname);

        if (!valid)
            throw new GeneralError(RUNTIME_ERRORS.invalidHostname, hostname);
    }
    else
        hostname = endpointUtils.getIPAddress();

    return hostname;
}

async function getValidPort (port) {
    if (port) {
        const isFree = await endpointUtils.isFreePort(port);

        if (!isFree)
            throw new GeneralError(RUNTIME_ERRORS.portIsNotFree, port);
    }
    else
        port = await endpointUtils.getFreePort();

    return port;
}

// API
async function getConfiguration (args) {
    let configuration;

    if (args.length === 1 && typeof args[0] === 'object') {
        configuration = new TestCafeConfiguration(args[0]?.configFile);

        await configuration.init(args[0]);
    }
    else {
        // NOTE: Positional arguments support is left only for backward compatibility.
        // It should be removed in future TestCafe versions.
        // All new APIs should be enabled through the configuration object in the upper clause.
        // Please do not add new APIs here.
        const [hostname, port1, port2, ssl, developmentMode, retryTestPages, cache, configFile] = args;

        configuration = new TestCafeConfiguration(configFile);

        await configuration.init({
            hostname,
            port1,
            port2,
            ssl,
            developmentMode,
            retryTestPages,
            cache,
        });
    }

    return configuration;
}

// API
async function createTestCafe (...args) {
    process.title = ProcessTitle.main;

    const configuration = await getConfiguration(args);

    const [hostname, port1, port2] = await Promise.all([
        getValidHostname(configuration.getOption(OPTION_NAMES.hostname)),
        getValidPort(configuration.getOption(OPTION_NAMES.port1)),
        getValidPort(configuration.getOption(OPTION_NAMES.port2)),
    ]);

    const userVariablesOption = configuration.getOption(OPTION_NAMES.userVariables);

    if (userVariablesOption)
        userVariables.value = userVariablesOption;

    configuration.mergeOptions({ hostname, port1, port2 });

    const testcafe = new TestCafe(configuration);

    setupExitHook(cb => {
        console.log(`file: index.js:98 -> createTestCafe -> setupExitHook:`);

        return testcafe.close()
            .then((...exitArgs) => {
                console.log(`file: index.js:100 -> .then -> then:`);
                return cb(...exitArgs);
            })
            .catch(err => {
                console.log(`file: index.js:105 -> createTestCafe -> catch:`);
                console.log(err);
            });
    });

    return testcafe;
}

// Embedding utils
createTestCafe.embeddingUtils = embeddingUtils;

// Common API
Object.keys(exportableLib).forEach(key => {
    Object.defineProperty(createTestCafe, key, { get: () => exportableLib[key] });
});

export default createTestCafe;
