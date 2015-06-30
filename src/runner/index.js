import RunnerBootstrapper from './bootstrapper';
import concatFlattened from '../utils/array-concat-flattened';

export default class Runner {
    constructor () {
        this.bootstrapper = new RunnerBootstrapper();

        this.opts = {
            screenshotPath:        null,
            takeScreenshotOnFails: false,
            failOnJsErrors:        true,
            quarantineMode:        false
        };
    }

    // API
    src (...sources) {
        this.bootstrapper.src = concatFlattened(this.bootstrapper.src, sources);
    }

    browsers (...browserList) {
        this.bootstrapper.browsers = concatFlattened(this.bootstrapper.browsers, browserList);
    }

    reporter (reporter, outStream = null) {
        this.bootstrapper.reporter        = reporter;
        this.bootstrapper.reportOutStream = outStream;
    }

    filter (fn) {
        this.bootstrapper.filter = fn;
    }

    screenshots (path, takeOnFails = false) {
        this.opts.screenshotPath        = path;
        this.opts.takeScreenshotOnFails = takeOnFails;
    }

    async run ({ failOnJsErrors = true, quarantineMode = false }) {
        this.opts.failOnJsErrors = failOnJsErrors;
        this.opts.quarantineMode = quarantineMode;

        // TODO
        // var config = await this.bootstrapper.createRunnableConfiguration();
    }
}
