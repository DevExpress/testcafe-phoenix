const expect            = require('chai').expect;
const proxyquire        = require('proxyquire');
const AsyncEventEmitter = require('../../lib/utils/async-event-emitter');
const TestRun           = require('../../lib/test-run');
const TestController    = require('../../lib/api/test-controller');
const TestRunController = require('../../lib/runner/test-run-controller');
const Task              = require('../../lib/runner/task');
const Reporter          = require('../../lib/reporter');
const { Role }          = require('../../lib/api/exportable-lib');

class TestRunMock extends TestRun {
    constructor () {
        super({ name: 'test-name', fixture: { path: 'dummy' } }, {}, {}, {}, {});

        this.browserConnection = {
            browserInfo: {
                alias: 'test-browser'
            },
            isHeadlessBrowser: () => false
        };
    }

    _addInjectables () {
    }

    _initRequestHooks () {
    }

    executeCommand () {
        return Promise.resolve();
    }
}

class TestRunControllerMock extends TestRunController {
    constructor () {
        super(void 0, void 0, void 0, void 0, void 0, void 0, { TestRunCtor: TestRunMock });
    }

    _createTestRun () {
        if (!this.testRun)
            this.testRun = new TestRunMock();

        return this.testRun;
    }
}

class TestControllerMock extends TestController {
    constructor (testRun) {
        super(testRun);

        testRun.controller = this;
    }
}

class TaskMock extends AsyncEventEmitter {
    constructor () {
        super();

        this.tests                   = [];
        this.browserConnectionGroups = [];
        this.opts                    = {};
    }

    _assignBrowserJobEventHandlers (job) {
        Task.prototype._assignBrowserJobEventHandlers.call(this, job);
    }
}

const BrowserJob = proxyquire('../../lib/runner/browser-job', { './test-run-controller': TestRunControllerMock });

const options = {
    caretPos:  1,
    modifiers: {
        alt:   true,
        ctrl:  true,
        meta:  true,
        shift: true
    },
    offsetX:            1,
    offsetY:            2,
    destinationOffsetX: 3,
    destinationOffsetY: 4,
    speed:              1,
    replace:            true,
    paste:              true,
};

const commands = {
    click:                     ['#target', options],
    rightClick:                ['#target', options],
    doubleClick:               ['#target', options],
    hover:                     ['#target', options],
    drag:                      ['#target', 100, 200, options],
    dragToElement:             ['#target', '#target', options],
    typeText:                  ['#input', 'test', options],
    selectText:                ['#input', 1, 3, options],
    selectTextAreaContent:     ['#textarea', 1, 2, 3, 4, options],
    selectEditableContent:     ['#contenteditable', '#contenteditable', options],
    pressKey:                  ['enter', options],
    wait:                      [1],
    navigateTo:                ['./index.html'],
    setFilesToUpload:          ['#file', '../test.js'],
    clearUpload:               ['#file'],
    takeScreenshot:            [{ path: 'screenshotPath', fullPage: true }],
    takeElementScreenshot:     ['#target', 'screenshotPath'],
    resizeWindow:              [200, 200],
    resizeWindowToFitDevice:   ['Sony Xperia Z', { portraitOrientation: true }],
    maximizeWindow:            [],
    switchToIframe:            ['#iframe'],
    switchToMainWindow:        [],
    setNativeDialogHandler:    [() => true],
    getNativeDialogHistory:    [],
    getBrowserConsoleMessages: [],
    debug:                     [],
    setTestSpeed:              [1],
    setPageLoadTimeout:        [1],
    useRole:                   [new Role('http://example.com', async () => {}, { preserveUrl: true })],
};

describe('TestController action events', () => {
    it('TestController actions should emit reporter events', () => {
        const startLog = [];
        const doneLog  = [];

        const task              = new TaskMock();
        const job               = new BrowserJob([], []);
        const testRunController = job._createTestRunController();
        const testRun           = testRunController._createTestRun({});
        const testController    = new TestControllerMock(testRun);

        task._assignBrowserJobEventHandlers(job);
        testRunController._assignTestRunEvents(testRun);

        /* eslint-disable no-new */
        new Reporter({
            async reportTestRunCommandStart (name) {
                startLog.push(name);
            },

            async reportTestRunCommandDone (name, { command, test, browser }) {
                const item = { name, command, test, browser };

                doneLog.push(item);
            }
        }, task);

        // eval and expect has their functional tests
        // addRequestHooks/removeRequestHooks are not logged
        const exceptions = ['eval', 'expect', 'addRequestHooks', 'removeRequestHooks'];

        const props = TestController.API_LIST
            .filter(prop => !prop.accessor)
            .map(prop => prop.apiProp)
            .filter(prop => exceptions.indexOf(prop) === -1)
            .filter(prop => typeof testController[prop] === 'function');

        props.forEach(prop => {
            if (!commands[prop])
                throw new Error(`Describe the '${prop}' command`);
        });

        return Promise.all(props.map(prop => testController[prop].apply(testController, commands[prop])))
            .then(() => {
                expect(Object.keys(commands).length).eql(startLog.length);
                expect(Object.keys(commands).length).eql(doneLog.length);
                expect(startLog.sort()).eql(props.sort());

                const expected = require('./data/test-controller-reporter-expected');

                expect(doneLog.sort()).eql(expected);
            });
    });
});
