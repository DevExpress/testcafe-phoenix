import TYPE from './type';

import {
    ClickCommand,
    RightClickCommand,
    DoubleClickCommand,
    HoverCommand,
    DragCommand,
    DragToElementCommand,
    TypeTextCommand,
    SelectTextCommand,
    SelectTextAreaContentCommand,
    SelectEditableContentCommand,
    PressKeyCommand,
    NavigateToCommand,
    UploadFileCommand,
    ClearUploadCommand
} from './actions';

import {
    TakeScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand
} from './window-manipulation';

import { WaitCommand } from './observation';


// Create command from object
export default function createCommandFromObject (obj) {
    /* eslint-disable indent*/
    // TODO: eslint raises an 'incorrect indent' error here. We use
    // an old eslint version (v1.x.x). We should migrate to v2.x.x
    switch (obj.type) {
        case TYPE.click:
            return new ClickCommand(obj);

        case TYPE.rightClick:
            return new RightClickCommand(obj);

        case TYPE.doubleClick:
            return new DoubleClickCommand(obj);

        case TYPE.hover:
            return new HoverCommand(obj);

        case TYPE.drag:
            return new DragCommand(obj);

        case TYPE.dragToElement:
            return new DragToElementCommand(obj);

        case TYPE.typeText:
            return new TypeTextCommand(obj);

        case TYPE.selectText:
            return new SelectTextCommand(obj);

        case TYPE.selectTextAreaContent:
            return new SelectTextAreaContentCommand(obj);

        case TYPE.selectEditableContent:
            return new SelectEditableContentCommand(obj);

        case TYPE.pressKey:
            return new PressKeyCommand(obj);

        case TYPE.wait:
            return new WaitCommand(obj);

        case TYPE.navigateTo:
            return new NavigateToCommand(obj);

        case TYPE.uploadFile:
            return new UploadFileCommand(obj);

        case TYPE.clearUpload:
            return new ClearUploadCommand(obj);

        case TYPE.takeScreenshot:
            return new TakeScreenshotCommand(obj);

        case TYPE.resizeWindow:
            return new ResizeWindowCommand(obj);

        case TYPE.resizeWindowToFitDevice:
            return new ResizeWindowToFitDeviceCommand(obj);
    }
    /* eslint-enable indent*/
}
