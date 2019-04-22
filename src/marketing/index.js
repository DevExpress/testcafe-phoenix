import DataFile from './data-file';
import MESSAGES from './messages';
import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from '../notifications/warning-message';
import debug from 'debug';

export const NUMBER_RUNS_BETWEEN_SHOW_MESSAGE = 20;

const DEBUG_LOGGER = debug('testcafe:marketing');

// For testing purposes
export const _dataFile = new DataFile();

export async function showMessageWithLinkToTestCafeStudio () {
    const data = await _dataFile.load();

    // NOTE: Don't show messages in case of the IO errors
    if (!data)
        return;

    data.runCount++;

    const shouldDisplayMessage = data.runCount % NUMBER_RUNS_BETWEEN_SHOW_MESSAGE === 0;

    if (shouldDisplayMessage) {
        const targetMsg = MESSAGES[data.displayedMessageIndex];

        if (!targetMsg) {
            const message = renderTemplate(WARNING_MESSAGES.cannotCalculateMarketingMessage, data.displayedMessageIndex);

            DEBUG_LOGGER(message);
        }
        /*eslint-disable no-console*/
        console.log(targetMsg);
        /*eslint-enable no-console*/

        data.displayedMessageIndex = (data.displayedMessageIndex + 1) % MESSAGES.length;
    }

    await _dataFile.save(data);
}
