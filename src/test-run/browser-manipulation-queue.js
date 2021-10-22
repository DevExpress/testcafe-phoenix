import { getViewportSize } from 'device-specs';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';
import WARNING_MESSAGE from '../notifications/warning-message';
import { WindowDimensionsOverflowError } from '../errors/test-run/';
import { TEST_RUN_ERRORS } from '../errors/types';


export default class BrowserManipulationQueue {
    constructor (browserConnection, screenshotCapturer, warningLog) {
        this.commands           = [];
        this.browserId          = browserConnection.id;
        this.browserProvider    = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog         = warningLog;
    }

    async _resizeWindow (width, height, currentWidth, currentHeight, command) {
        const canResizeWindow = await this.browserProvider.canResizeWindowToDimensions(this.browserId, width, height);

        if (!canResizeWindow)
            throw new WindowDimensionsOverflowError();

        try {
            return await this.browserProvider.resizeWindow(this.browserId, width, height, currentWidth, currentHeight);
        }
        catch (err) {
            this.warningLog.addWarning({ message: WARNING_MESSAGE.resizeError, actionId: command.actionId }, err.message);
            return null;
        }
    }

    async _resizeWindowToFitDevice (device, portrait, currentWidth, currentHeight, command) {
        const { landscapeWidth, portraitWidth } = getViewportSize(device);

        const width  = portrait ? portraitWidth : landscapeWidth;
        const height = portrait ? landscapeWidth : portraitWidth;

        return await this._resizeWindow(width, height, currentWidth, currentHeight, command);
    }

    async _maximizeWindow (command) {
        try {
            return await this.browserProvider.maximizeWindow(this.browserId);
        }
        catch (err) {
            this.warningLog.addWarning({ message: WARNING_MESSAGE.maximizeError, actionId: command.actionId }, err.message);
            return null;
        }
    }

    async _takeScreenshot (capture, command) {
        try {
            return await capture();
        }
        catch (err) {
            if (err.code === TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError)
                throw err;

            this.warningLog.addWarning({ message: WARNING_MESSAGE.screenshotError, actionId: command.actionId }, err.stack);
            return null;
        }
    }

    async executePendingManipulation (driverMsg) {
        const command = this.commands.shift();

        switch (command.type) {
            case COMMAND_TYPE.takeElementScreenshot:
            case COMMAND_TYPE.takeScreenshot:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureAction({
                    customPath:     command.path,
                    pageDimensions: driverMsg.pageDimensions,
                    cropDimensions: driverMsg.cropDimensions,
                    markSeed:       command.markSeed,
                    fullPage:       command.fullPage,
                    thumbnails:     command.thumbnails,
                }), command);

            case COMMAND_TYPE.takeScreenshotOnFail:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureError({
                    pageDimensions: driverMsg.pageDimensions,
                    markSeed:       command.markSeed,
                    fullPage:       command.fullPage,
                }), command);

            case COMMAND_TYPE.resizeWindow:
                return await this._resizeWindow(command.width, command.height, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight, command);

            case COMMAND_TYPE.resizeWindowToFitDevice:
                return await this._resizeWindowToFitDevice(command.device, command.options.portraitOrientation, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight, command);

            case COMMAND_TYPE.maximizeWindow:
                return await this._maximizeWindow(command);
        }

        return null;
    }

    push (command) {
        this.commands.push(command);
    }

    removeAllNonServiceManipulations () {
        this.commands = this.commands.filter(command => isServiceCommand(command));
    }
}
