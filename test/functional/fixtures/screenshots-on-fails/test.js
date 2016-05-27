var expect                        = require('chai').expect;
var config                        = require('../../config.js');
var errorInEachBrowserContains    = require('../../assertion-helper.js').errorInEachBrowserContains;
var errorInEachBrowserNotContains = require('../../assertion-helper.js').errorInEachBrowserNotContains;
var checkScreenshotsCreated       = require('../../assertion-helper.js').checkScreenshotsCreated;


<<<<<<< HEAD
<<<<<<< 1c90f95a121f2fda659a8449048ad28b21020f96
<<<<<<< e8cb9c35813fdf7814793df0504da89b0e0966ab
var SCREENSHOT_PATH_MESSAGE_TEXT = 'Screenshot: ___test-screenshots___';
=======
var SCREENSHOT_PATH_MESSAGE_TEXT = 'Screenshot: test\\functional\\fixtures\\screenshots';
>>>>>>> TakeScreenshot, TakeScreenshotOnFail commands (part of #441, part of #240) (#552)
=======
var SCREENSHOT_PATH_MESSAGE_TEXT = 'Screenshot: ___test-screenshots___';
>>>>>>> fix problems after merge TakeScreenshotCommand PR (#558)
=======
var SCREENSHOT_PATH_MESSAGE_TEXT = 'Screenshot: ___test-screenshots___';
>>>>>>> 9089b3f8cf2f815abd863913636403286f43aac2
var testOnTravis                 = config.isTravisTask;
var testErrors                   = null;


describe('Screenshots on fails', function () {
    it('Should take a screenshot if the ensureElement method fails', function () {
        return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
            {
                shouldFail:                 true,
                screenshotsOnFails:         true,
                elementAvailabilityTimeout: 0,
                setScreenshotPath:          true,
                only:                       'local'
            })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated();
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                }
            });
    });

    it('Should take a screenshot if an error on the page is raised', function () {
        return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on page error',
            { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated();
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                }
            });
    });

    it('Should take a screenshot if an error in test code is raised', function () {
        return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on test code error',
            { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated();
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                }
            });
    });

    it('Should take a screenshot if an assertion fails', function () {
        return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the assertion fail',
            { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated();
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                }
            });
    });

    it('Should take a screenshot if beforeEach raises an error', function () {
        return runTests('./testcafe-fixtures/fail-in-before-each.js', 'Screenshot on a beforeEach error',
            { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated();
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                }
            });
    });

    it('Should take screenshots if a test error occurs and if afterEach raises an error', function () {
        return runTests('./testcafe-fixtures/fail-in-test-and-after-each.js', 'Screenshots on afterEach and test errors',
            { shouldFail: true, screenshotsOnFails: true, setScreenshotPath: true, only: 'local' })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated(false, 4);
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    errorInEachBrowserContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 1);
                    expect(success).eql(true);
                }
            });
    });

    it('Should not take a screenshot if the ensureElement method fails with no screenshotsOnFails flag set', function () {
        return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
            { shouldFail: true, elementAvailabilityTimeout: 0, setScreenshotPath: true, only: 'local' })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated(true);
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserNotContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                }
            });
    });

    it('Should not take a screenshot if the ensureElement method fails with no screenshotPath specified', function () {
        return runTests('./testcafe-fixtures/screenshots-on-fails.js', 'Screenshot on the ensureElement method fail',
            { shouldFail: true, elementAvailabilityTimeout: 0, screenshotsOnFails: true, only: 'local' })
            .catch(function (errs) {
                testErrors = errs;
                return checkScreenshotsCreated(true);
            })
            .then(function (success) {
                if (!testOnTravis) {
                    errorInEachBrowserNotContains(testErrors, SCREENSHOT_PATH_MESSAGE_TEXT, 0);
                    expect(success).eql(true);
                }
            });
    });
});
