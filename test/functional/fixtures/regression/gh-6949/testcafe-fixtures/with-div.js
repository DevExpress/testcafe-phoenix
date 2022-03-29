import { Selector } from 'testcafe';

fixture`Getting Started`
    .page`http://localhost:3000/fixtures/regression/gh-6949/pages/with-div.html`;

test('Click div inside checkbox label', async t => {
    const div = Selector('#clickable-element');
    const checkBox = Selector('#checkbox');

    await t.click(div);
    await t.expect(checkBox.checked).eql(true);
});
