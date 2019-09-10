// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export const TEST_RUN_ERRORS = {
    uncaughtErrorOnPage:                                   'E1',
    uncaughtErrorInTestCode:                               'E2',
    uncaughtNonErrorObjectInTestCode:                      'E3',
    uncaughtErrorInClientFunctionCode:                     'E4',
    uncaughtErrorInCustomDOMPropertyCode:                  'E5',
    unhandledPromiseRejection:                             'E6',
    uncaughtException:                                     'E7',
    missingAwaitError:                                     'E8',
    actionIntegerOptionError:                              'E9',
    actionPositiveIntegerOptionError:                      'E10',
    actionBooleanOptionError:                              'E11',
    actionSpeedOptionError:                                'E12',
    actionOptionsTypeError:                                'E14',
    actionBooleanArgumentError:                            'E15',
    actionStringArgumentError:                             'E16',
    actionNullableStringArgumentError:                     'E17',
    actionStringOrStringArrayArgumentError:                'E18',
    actionStringArrayElementError:                         'E19',
    actionIntegerArgumentError:                            'E20',
    actionRoleArgumentError:                               'E21',
    actionPositiveIntegerArgumentError:                    'E22',
    actionSelectorError:                                   'E23',
    actionElementNotFoundError:                            'E24',
    actionElementIsInvisibleError:                         'E26',
    actionSelectorMatchesWrongNodeTypeError:               'E27',
    actionAdditionalElementNotFoundError:                  'E28',
    actionAdditionalElementIsInvisibleError:               'E29',
    actionAdditionalSelectorMatchesWrongNodeTypeError:     'E30',
    actionElementNonEditableError:                         'E31',
    actionElementNotTextAreaError:                         'E32',
    actionElementNonContentEditableError:                  'E33',
    actionElementIsNotFileInputError:                      'E34',
    actionRootContainerNotFoundError:                      'E35',
    actionIncorrectKeysError:                              'E36',
    actionCannotFindFileToUploadError:                     'E37',
    actionUnsupportedDeviceTypeError:                      'E38',
    actionIframeIsNotLoadedError:                          'E39',
    actionElementNotIframeError:                           'E40',
    actionInvalidScrollTargetError:                        'E41',
    currentIframeIsNotLoadedError:                         'E42',
    currentIframeNotFoundError:                            'E43',
    currentIframeIsInvisibleError:                         'E44',
    nativeDialogNotHandledError:                           'E45',
    uncaughtErrorInNativeDialogHandler:                    'E46',
    setTestSpeedArgumentError:                             'E47',
    setNativeDialogHandlerCodeWrongTypeError:              'E48',
    clientFunctionExecutionInterruptionError:              'E49',
    domNodeClientFunctionResultError:                      'E50',
    invalidSelectorResultError:                            'E51',
    cannotObtainInfoForElementSpecifiedBySelectorError:    'E52',
    externalAssertionLibraryError:                         'E53',
    pageLoadError:                                         'E54',
    windowDimensionsOverflowError:                         'E55',
    forbiddenCharactersInScreenshotPathError:              'E56',
    invalidElementScreenshotDimensionsError:               'E57',
    roleSwitchInRoleInitializerError:                      'E58',
    assertionExecutableArgumentError:                      'E59',
    assertionWithoutMethodCallError:                       'E60',
    assertionUnawaitedPromiseError:                        'E61',
    requestHookNotImplementedError:                        'E62',
    requestHookUnhandledError:                             'E63',
    uncaughtErrorInCustomClientScriptCode:                 'E64',
    uncaughtErrorInCustomClientScriptCodeLoadedFromModule: 'E65',
    uncaughtErrorInCustomScript:                           'E66'
};

export const RUNTIME_ERRORS = {
    cannotCreateMultipleLiveModeRunners:                              'E1000',
    cannotRunLiveModeRunnerMultipleTimes:                             'E1001',
    browserDisconnected:                                              'E1002',
    cannotRunAgainstDisconnectedBrowsers:                             'E1003',
    cannotEstablishBrowserConnection:                                 'E1004',
    cannotFindBrowser:                                                'E1005',
    browserProviderNotFound:                                          'E1006',
    browserNotSet:                                                    'E1007',
    testSourcesNotSet:                                                'E1008',
    noTestsToRun:                                                     'E1009',
    cannotFindReporterForAlias:                                       'E1010',
    multipleStdoutReporters:                                          'E1011',
    optionValueIsNotValidRegExp:                                      'E1012',
    optionValueIsNotValidKeyValue:                                    'E1013',
    invalidSpeedValue:                                                'E1014',
    invalidConcurrencyFactor:                                         'E1015',
    cannotDivideRemotesCountByConcurrency:                            'E1016',
    portsOptionRequiresTwoNumbers:                                    'E1017',
    portIsNotFree:                                                    'E1018',
    invalidHostname:                                                  'E1019',
    cannotFindSpecifiedTestSource:                                    'E1020',
    clientFunctionCodeIsNotAFunction:                                 'E1021',
    selectorInitializedWithWrongType:                                 'E1022',
    clientFunctionCannotResolveTestRun:                               'E1023',
    regeneratorInClientFunctionCode:                                  'E1024',
    invalidClientFunctionTestRunBinding:                              'E1025',
    invalidValueType:                                                 'E1026',
    unsupportedUrlProtocol:                                           'E1027',
    testControllerProxyCannotResolveTestRun:                          'E1028',
    timeLimitedPromiseTimeoutExpired:                                 'E1029',
    cannotUseScreenshotPathPatternWithoutBaseScreenshotPathSpecified: 'E1030',
    cannotSetVideoOptionsWithoutBaseVideoPathSpecified:               'E1031',
    multipleAPIMethodCallForbidden:                                   'E1032',
    invalidReporterOutput:                                            'E1033',
    cannotReadSSLCertFile:                                            'E1034',
    cannotPrepareTestsDueToError:                                     'E1035',
    cannotParseRawFile:                                               'E1036',
    testedAppFailedWithError:                                         'E1037',
    unableToOpenBrowser:                                              'E1038',
    requestHookConfigureAPIError:                                     'E1039',
    forbiddenCharatersInScreenshotPath:                               'E1040',
    cannotFindFFMPEG:                                                 'E1041',
    compositeArgumentsError:                                          'E1042',
    cannotFindTypescriptConfigurationFile:                            'E1043',
    clientScriptInitializerIsNotSpecified:                            'E1044',
    clientScriptBasePathIsNotSpecified:                               'E1045',
    clientScriptInitializerMultipleContentSources:                    'E1046',
    cannotLoadClientScriptFromPath:                                   'E1047',
    clientScriptModuleEntryPointPathCalculationError:                 'E1048'
};
