fixture `Double Click`;


test
    .page `http://localhost:3000/fixtures/api/es-next/console/pages/index.html`
('t.getConsoleMessages', async t => {
    let messages = await t.getConsoleMessages();

    await t
        .expect(messages.error).eql(['error1'])
        .expect(messages.warn).eql(['warn1'])
        .expect(messages.log).eql(['log1'])
        .expect(messages.info).eql(['info1'])

        .click('#trigger-messages')

        // Check the driver keeps the messages between page reloads
        .click('#reload');

    messages = await t.getConsoleMessages();

    await t
        .expect(messages.error).eql(['error1', 'error2'])
        .expect(messages.warn).eql(['warn1', 'warn2'])
        .expect(messages.log).eql(['log1', 'log2'])
        .expect(messages.info).eql(['info1', 'info2']);
});

test
    .page `http://localhost:3000/fixtures/api/es-next/console/pages/empty.html`
('messages formatting', async t => {
    /* eslint-disable no-console */
    await t.eval(() => console.log('a', 1, null, void 0, ['b', 2], { c: 3 }));
    /* eslint-enable no-console */

    const { log } = await t.getConsoleMessages();

    await t.expect(log[0]).eql('a 1 null undefined b,2 [object Object]');
});
