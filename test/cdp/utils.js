const CDP              = require('chrome-remote-interface');
const express          = require('express');
const { readFileSync } = require('fs');
const { join }         = require('path');
const { start }        = require('../../lib/browser/provider/built-in/dedicated/chrome/local-chrome');
const delay            = require('../../lib/utils/delay');
const ExecutionContext = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');
const { getFreePort }  = require('endpoint-utils');
const { makeTmpDir }   = require('chrome-launcher/dist/utils');


// const ChromeLauncher          = require('chrome-launcher');

const page  = readFileSync(join(__dirname, './position-utils-test-page.html')).toString();
const frame = readFileSync(join(__dirname, './position-utils-test-iframe.html')).toString();

const flags = [
    '--disable-features=Translate',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-client-side-phishing-detection',
    '--disable-sync',
    '--metrics-recording-only',
    '--disable-default-apps',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
    '--disable-ipc-flooding-protection',
    '--password-store=basic',
    '--use-mock-keychain',
    '--force-fieldtrials=*BackgroundTracing/default/',
    '--disable-gpu',
    'about:blank',
];

let server = null;
let client = null;

function createServer () {
    const app  = express();
    const port = 3000;

    app.get('/', (req, res) => {
        res.send(page);
    });

    app.get('/frame', (req, res) => {
        res.send(frame);
    });

    return app.listen(port, () => {
    });
}

async function before () {
    server = createServer();

    const port = await getFreePort();
    // const dir = join(__dirname, 'tmp');

    // if (!existsSync(dir))
    //     mkdirSync(dir);

    const runtimeInfo = { config: { headless: true, userArgs: flags.join(' ') }, cdpPort: port, browserName: 'chrome', tempProfileDir: { path: makeTmpDir() } };

    await start('about:blank', runtimeInfo);

    // const chrome = await ChromeLauncher.launch({
    //     startingUrl: 'about:blank',
    //     chromeFlags: ['--disable-gpu'],
    // });

    await delay(2000);


    // client = await CDP({ port });
    client = await CDP({ port: port });

    await client.Runtime.enable();
    await client.Page.enable();
    await client.DOM.enable();
    await client.CSS.enable();

    ExecutionContext.initialize(client);

    await client.Page.navigate({ url: 'http://localhost:3000' });

    await delay(2000);
}

async function after () {
    await client.Browser.close();
    await server.close();
}

async function beforeEach () {
    await setScroll(client, 'window', { top: 0, left: 0 });
    await setScroll(client, 'document.querySelector(\'#scrollableDiv\')', { top: 0, left: 0 });
    await setScroll(client, 'document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 0, top: 0 });
}

async function setScroll ({ Runtime }, selector, { top, left }) {
    await Runtime.evaluate({ expression: `${selector}.scrollTo({ top: ${top}, left: ${left} });` });
}

module.exports.createServer = createServer;
module.exports.before       = before;
module.exports.after        = after;
module.exports.beforeEach   = beforeEach;
module.exports.setScroll    = setScroll;
module.exports.getClient    = () => client;
