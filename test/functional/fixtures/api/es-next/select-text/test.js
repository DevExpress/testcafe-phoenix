var expect = require('chai').expect;


describe('[API] Select text', function () {
    describe('t.selectText', function () {
        it('Should select text in input', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Select text in input', { only: 'chrome' });
        });

        it('Should validate selector argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect selector in selectText', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('Action selector error:  Selector code is expected to be specified as a function or string, but "object" was passed.');
                    expect(errs[0]).contains('> 51 |    await t.selectText(null, 2, 4);');
                });
        });

        it('Should validate startPos argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect startPos in selectText', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The startPos argument is expected to be a positive integer, but it was -1.');
                    expect(errs[0]).contains('> 55 |    await t.selectText(\'#input\', -1, 4);');
                });
        });

        it('Should validate endPos argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect endPos in selectText', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The endPos argument is expected to be a positive integer, but it was NaN.');
                    expect(errs[0]).contains('> 59 |    await t.selectText(\'#input\', 2, NaN);');
                });
        });
    });

    describe('t.selectTextAreaContent', function () {
        it('Should select content in textarea', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Select content in textarea', { only: 'chrome' });
        });

        it('Should validate selector argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect selector in selectTextAreaContent', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('Action selector error:  Selector code is expected to be specified as a function or string, but "object" was passed.');
                    expect(errs[0]).contains('> 63 |    await t.selectTextAreaContent({}, 0, 2, 1, 3);');
                });
        });

        it('Should validate startLine argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect startLine in selectTextAreaContent', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The startLine argument is expected to be a positive integer, but it was 3.1.');
                    expect(errs[0]).contains('> 67 |    await t.selectTextAreaContent(\'#textarea\', 3.1, 2, 1, 3);');
                });
        });

        it('Should validate startPos argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect startPos in selectTextAreaContent', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The startPos argument is expected to be a positive integer, but it was string.');
                    expect(errs[0]).contains('> 71 |    await t.selectTextAreaContent(\'#textarea\', 0, \'2\', 1, 3);');
                });
        });

        it('Should validate endLine argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect endLine in selectTextAreaContent', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The endLine argument is expected to be a positive integer, but it was -1.');
                    expect(errs[0]).contains('> 75 |    await t.selectTextAreaContent(\'#textarea\', 0, 2, -1, 3);');
                });
        });

        it('Should validate endPos argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect endPos in selectTextAreaContent', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The endPos argument is expected to be a positive integer, but it was boolean.');
                    expect(errs[0]).contains('> 79 |    await t.selectTextAreaContent(\'#textarea\', 0, 2, 1, false);');
                });
        });
    });

    describe('t.selectTextAreaContent', function () {
        it('Should select editable content', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Select editable content', { only: 'chrome' });
        });

        it('Should validate startSelector argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect startSelector in selectEditableContent', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The startSelector argument is expected to be a string, but it was boolean.');
                    expect(errs[0]).contains('> 83 |    await t.selectEditableContent(false, \'#p2\');');
                });
        });

        it('Should validate startSelector argument', function () {
            return runTests('./testcafe-fixtures/select-test.js', 'Incorrect endSelector in selectEditableContent', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The endSelector argument is expected to be a string, but it was number.');
                    expect(errs[0]).contains('> 87 |    await t.selectEditableContent(\'#p1\', 42);');
                });
        });
    });
});
