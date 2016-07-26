import hammerhead from './deps/hammerhead';

import ERROR_TYPE from '../../legacy/test-run-error/type';
import COMMAND from '../../legacy/test-run/command';
import KEY_MAPS from './utils/key-maps';
import RequestBarrier from './request-barrier';
import * as pageUnloadBarrier from './page-unload-barrier';
import preventRealEvents from './prevent-real-events';

import * as serviceUtils from './utils/service';
import * as domUtils from './utils/dom';
import * as contentEditable from './utils/content-editable';
import * as positionUtils from './utils/position';
import * as styleUtils from './utils/style';
import * as eventUtils from './utils/event';
import * as arrayUtils from './utils/array';
import * as textSelection from './utils/text-selection';
import waitFor from './utils/wait-for';
import delay from './utils/delay';
import noop from './utils/noop';
import getKeyArray from './utils/get-key-array';
import getSanitizedKey from './utils/get-sanitized-key';
import parseKeySequence from './utils/parse-key-sequence';
import sendRequestToFrame from './utils/send-request-to-frame';

exports.COMMAND               = COMMAND;
exports.ERROR_TYPE            = ERROR_TYPE;
exports.RequestBarrier        = RequestBarrier;
exports.pageUnloadBarrier     = pageUnloadBarrier;
exports.preventRealEvents     = preventRealEvents;

exports.serviceUtils       = serviceUtils;
exports.domUtils           = domUtils;
exports.contentEditable    = contentEditable;
exports.positionUtils      = positionUtils;
exports.styleUtils         = styleUtils;
exports.eventUtils         = eventUtils;
exports.arrayUtils         = arrayUtils;
exports.textSelection      = textSelection;
exports.waitFor            = waitFor;
exports.delay              = delay;
exports.noop               = noop;
exports.getKeyArray        = getKeyArray;
exports.getSanitizedKey    = getSanitizedKey;
exports.parseKeySequence   = parseKeySequence;
exports.sendRequestToFrame = sendRequestToFrame;
exports.KEY_MAPS           = KEY_MAPS;

exports.get = require;

Object.defineProperty(window, '%testCafeCore%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        exports
});

hammerhead.on(hammerhead.EVENTS.evalIframeScript, e => initTestCafeCore(e.iframe.contentWindow, true));
