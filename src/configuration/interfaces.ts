export interface FilterOption {
    testGrep?: string | RegExp | undefined;
    fixtureGrep?: string | RegExp | undefined;
}

export interface ReporterOption {
    name: string;
    output? : string | Buffer;
}

export interface Dictionary<T> {
    [key: string]: T;
}

export interface SkipJsErrorsOptions {
    stack?: string;
    message?: string;
    pageUrl?: string;
}

export type SkipJsErrorsCallback = ({ stack, pageUrl, message }: SkipJsErrorsOptions) => boolean;

export interface RunnerRunOptions {
    skipJsErrors?: boolean | SkipJsErrorsOptions | SkipJsErrorsCallback;
    skipUncaughtErrors?: boolean;
    debugMode?: boolean;
    debugOnFail?: boolean;
    selectorTimeout?: number;
    assertionTimeout?: number;
    pageLoadTimeout?: number;
    browserInitTimeout?: number;
    testExecutionTimeout?: number;
    runExecutionTimeout?: number;
    speed?: number;
    stopOnFirstFail?: boolean;
    disablePageCaching?: boolean;
    disablePageReloads?: boolean;
    disableScreenshots?: boolean;
    disableMultipleWindows?: boolean;
    pageRequestTimeout?: number;
    ajaxRequestTimeout?: number;
    retryTestPages?: boolean;
    hooks?: GlobalHooks;
    baseUrl?: string;
}

export interface GetOptionConfiguration {
    optionsSeparator?: string;
    keyValueSeparator?: string;
    skipOptionValueTypeConversion?: boolean;
    onOptionParsed?: Function;
}

export interface TypeScriptCompilerOptions {
    configPath?: string;
    customCompilerModulePath?: string;
    options?: Dictionary<boolean | number>;
}

