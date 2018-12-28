import Promise from 'pinkie';
import TestRun from '../test-run';
import { TEST_RUN_STATE } from './test-run-state';
import COMMAND_TYPE from '../test-run/commands/type';

const UNLOCK_PAGE_COMMAND      = 'unlock-page';
const TEST_RUN_ABORTED_MESSAGE = 'Test run aborted';

export const TestRunCtorFactory = function (callbacks) {
    const { created, started, done, readyToNext } = callbacks;

    return class LiveModeTestRun extends TestRun {
        constructor (test, browserConnection, screenshotCapturer, warningLog, opts) {
            super(test, browserConnection, screenshotCapturer, warningLog, opts);

            created(this, test);

            this.state                = TEST_RUN_STATE.created;
            this.finish               = null;
            this.stopping             = false;
            this.isInRoleInitializing = false;
            this.stopped              = false;
        }

        start () {
            started(this);
            super.start.apply(this, arguments);
        }

        stop () {
            this.stopped = true;
        }

        _useRole (...args) {
            this.isInRoleInitializing = true;

            return super._useRole.apply(this, args)
                .then(res => {
                    this.isInRoleInitializing = false;

                    return res;
                })
                .catch(err => {
                    this.isInRoleInitializing = false;

                    throw err;
                });
        }

        executeCommand (commandToExec, callsite, forced) {
            // NOTE: don't close the page and the session when the last test in the queue is done
            if (commandToExec.type === COMMAND_TYPE.testDone && !forced) {
                done(this, this.stopped)
                    .then(() => this.executeCommand(commandToExec, callsite, true))
                    .then(() => readyToNext(this));

                this.executeCommand({ type: UNLOCK_PAGE_COMMAND }, null);

                return Promise.resolve();
            }

            if (this.stopped && !this.stopping &&
                !this.isInRoleInitializing) {
                this.stopping = true;

                return Promise.reject(new Error(TEST_RUN_ABORTED_MESSAGE));
            }

            return super.executeCommand(commandToExec, callsite);
        }
    };
};
