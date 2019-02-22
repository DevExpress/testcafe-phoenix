const { expect }    = require('chai');
const VideoRecorder = require('../../lib/video-recorder');
const AsyncEmitter  = require('../../lib/utils/async-event-emitter');
const WarningLog    = require('../../lib/notifications/warning-log');

const VIDEOS_BASE_PATH = '__videos__';

describe('Video Recorder', () => {
    it('Should not start video recording for legacy tests', () => {
        const browserJobMock = new AsyncEmitter();
        const videoRecorder  = new VideoRecorder(browserJobMock, VIDEOS_BASE_PATH, {}, {});

        const testRunCreateEventDataMock = {
            testRun:    {},
            legacy:     true,
            index:      1,
            test:       {},
            quarantine: null
        };

        return browserJobMock
            .emit('start')
            .then(() => browserJobMock.emit('test-run-created', testRunCreateEventDataMock))
            .then(() => {
                expect(videoRecorder.testRunInfo).to.be.empty;
            });
    });

    it('Should correctly format the warning message about no suitable path pattern placeholders', () => {
        const browserJobMock = new AsyncEmitter();
        const warningLog     = new WarningLog();
        const videoRecorder  = new VideoRecorder(browserJobMock, VIDEOS_BASE_PATH, {}, {}, warningLog);

        videoRecorder._addProblematicPlaceholdersWarning(['${TEST_INDEX}']);
        expect(warningLog.messages).eql([
            '"${TEST_INDEX}" path pattern placeholder is not suitable for the video recording\'s "pathPattern" option.' +
            '\n\n' +
            'Its value will be replaced with an empty string.'
        ]);
        warningLog.messages = [];

        videoRecorder._addProblematicPlaceholdersWarning(['${TEST_INDEX}', '${FIXTURE}']);
        expect(warningLog.messages).eql([
            '"${TEST_INDEX}", "${FIXTURE}" path pattern placeholders are not suitable for the video recording\'s "pathPattern" option.' +
            '\n\n' +
            'Their values will be replaced with an empty string.'
        ]);
    });
});
