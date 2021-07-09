import CommandType from '../../../../../test-run/commands/type';

import {
    ExecuteClientFunctionCommand,
    ExecuteSelectorCommand,
    WaitCommand,
} from '../../../../../test-run/commands/observation';

import {
    ClearUploadCommand,
    ClickCommand,
    DispatchEventCommand,
    DoubleClickCommand,
    DragCommand,
    DragToElementCommand,
    ExecuteAsyncExpressionCommand,
    ExecuteExpressionCommand,
    HoverCommand,
    NavigateToCommand,
    PressKeyCommand,
    RightClickCommand,
    ScrollByCommand,
    ScrollCommand,
    ScrollIntoViewCommand,
    SelectEditableContentCommand,
    SelectTextAreaContentCommand,
    SelectTextCommand,
    SetFilesToUploadCommand,
    SetNativeDialogHandlerCommand,
    SetPageLoadTimeoutCommand,
    SetTestSpeedCommand,
    SwitchToIframeCommand,
    TypeTextCommand,
    UseRoleCommand,
} from '../../../../../test-run/commands/actions';

import AssertionCommand from '../../../../../test-run/commands/assertion';
import { CommandConstructor } from './types';

import {
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand,
    TakeElementScreenshotCommand,
    TakeScreenshotCommand,
} from '../../../../../test-run/commands/browser-manipulation';


const COMMAND_CONSTRUCTORS = new Map<string, CommandConstructor>([
    [CommandType.executeSelector, ExecuteSelectorCommand],
    [CommandType.executeClientFunction, ExecuteClientFunctionCommand],
    [CommandType.wait, WaitCommand],
    [CommandType.click, ClickCommand],
    [CommandType.doubleClick, DoubleClickCommand],
    [CommandType.navigateTo, NavigateToCommand],
    [CommandType.typeText, TypeTextCommand],
    [CommandType.setNativeDialogHandler, SetNativeDialogHandlerCommand],
    [CommandType.switchToIframe, SwitchToIframeCommand],
    [CommandType.setTestSpeed, SetTestSpeedCommand],
    [CommandType.setPageLoadTimeout, SetPageLoadTimeoutCommand],
    [CommandType.pressKey, PressKeyCommand],
    [CommandType.dragToElement, DragToElementCommand],
    [CommandType.selectEditableContent, SelectEditableContentCommand],
    [CommandType.hover, HoverCommand],
    [CommandType.assertion, AssertionCommand],
    [CommandType.useRole, UseRoleCommand],
    [CommandType.executeExpression, ExecuteExpressionCommand],
    [CommandType.executeAsyncExpression, ExecuteAsyncExpressionCommand],
    [CommandType.drag, DragCommand],
    [CommandType.rightClick, RightClickCommand],
    [CommandType.selectText, SelectTextCommand],
    [CommandType.selectTextAreaContent, SelectTextAreaContentCommand],
    [CommandType.setFilesToUpload, SetFilesToUploadCommand],
    [CommandType.clearUpload, ClearUploadCommand],
    [CommandType.takeScreenshot, TakeScreenshotCommand],
    [CommandType.takeElementScreenshot, TakeElementScreenshotCommand],
    [CommandType.resizeWindow, ResizeWindowCommand],
    [CommandType.resizeWindowToFitDevice, ResizeWindowToFitDeviceCommand],
    [CommandType.dispatchEvent, DispatchEventCommand],
    [CommandType.scroll, ScrollCommand],
    [CommandType.scrollBy, ScrollByCommand],
    [CommandType.scrollIntoView, ScrollIntoViewCommand],
]);

export default COMMAND_CONSTRUCTORS;
