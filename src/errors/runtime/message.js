export default {
    browserDisconnected:                 'The {userAgent} browser disconnected. This problem may appear when a browser hangs or is closed, or due to network issues.',
    cantRunAgainstDisconnectedBrowsers:  'The following browsers disconnected: {userAgents}. Tests will not be run.',
    cantEstablishBrowserConnection:      'Unable to establish one or more of the specified browser connections. This can be caused by network issues or remote device failure.',
    cantFindBrowser:                     'Unable to find the browser. "{browser}" is not a browser alias or path to an executable file.',
    browserNotSet:                       'No browser selected to test against.',
    testSourcesNotSet:                   'No test file specified.',
    noTestsToRun:                        'No tests to run. Either the test files contain no tests or the filter function is too restrictive.',
    cantFindReporterForAlias:            'The provided "{name}" reporter does not exist. Check that you have specified the report format correctly.',
    optionValueIsNotValidRegExp:         'The "{optionName}" option value is not a valid regular expression.',
    portNumberIsNotInteger:              'A port number should be a valid integer.',
    selectorTimeoutIsNotAnInteger:       'Selector timeout should be an integer.',
    portsOptionRequiresTwoNumbers:       'The "--ports" option requires two numbers to be specified.',
    portIsNotFree:                       'The specified {portNum} port is already in use by another program.',
    invalidHostname:                     'The specified "{hostname}" hostname cannot be resolved to the current machine.',
    cantFindSpecifiedTestSource:         'Cannot find a test source file at "{path}".',
    cannotParseRawFile:                  'Cannot parse a test source file in the raw format at "{path}" due to an error.\n\n{errMessage}',
    cannotPrepareTestsDueToError:        'Cannot prepare tests due to an error.\n\n{errMessage}',
    fixtureNameIsNotAString:             'The fixture name is expected to be a string, but it was {type}.',
    fixturePageIsNotAString:             'The page URL is expected to be a string, but it was {type}.',
    testNameIsNotAString:                'The test name is expected to be a string, but it was {type}.',
    testBodyIsNotAFunction:              'The test body is expected to be a function, but it was {type}.',
    beforeEachIsNotAFunction:            `Fixture's "beforeEach" method takes a function, but {type} was passed.`,
    afterEachIsNotAFunction:             `Fixture's "afterEach" method takes a function, but {type} was passed.`,
    clientFunctionCodeIsNotAFunction:    '{#instantiationCallsiteName} code is expected to be specified as a function, but {type} was passed.',
    selectorInitializedWithWrongType:    '{#instantiationCallsiteName} is expected to be initialized with a function, CSS selector string, another Selector, node snapshot or a Promise returned by a Selector, but {type} was passed.',
    clientFunctionCantResolveTestRun:    "{#instantiationCallsiteName} cannot implicitly resolve the test run in context of which it should be executed. If you need to call {#instantiationCallsiteName} from the Node.js API callback, pass the test controller manually via {#instantiationCallsiteName}'s `.with({ boundTestRun: t })` method first. Note that you cannot execute {#instantiationCallsiteName} outside the test code.",
    regeneratorInClientFunctionCode:     `{#instantiationCallsiteName} code, arguments or dependencies cannot contain generators or "async/await" syntax (use Promises instead).`,
    invalidClientFunctionTestRunBinding: 'The "boundTestRun" option value is expected to be a test controller.',
    optionsArgumentIsNotAnObject:        '"options" argument is expected to be an object, but it was {type}.',
    optionValueIsNotABoolean:            '"{name}" option is expected to be a boolean, but it was {type}.',
    optionValueIsNotANonNegativeNumber:  '"{name}" option is expected to be a non-negative number, but it was {type}.',
    optionValueIsNotAnObject:            '"{name}" option is expected to be an object, but it was {type}.'
};
