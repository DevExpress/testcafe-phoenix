import { ClientFunction } from 'testcafe';

const testPage   = `http://localhost:3000/fixtures/api/es-next/hooks/onEachPage/pages/index.html`;
const iframePage = `http://localhost:3000/fixtures/api/es-next/hooks/onEachPage/pages/iframe.html`;

const getClickState = ClientFunction(() => window.state);

const increaseHookCounter = ClientFunction(() => {
    window.hookCounter = window.hookCounter || 0;

    window.hookCounter++;
});

const getAndResetHookCounter = ClientFunction(() => {
    var counter = window.hookCounter;

    window.hookCounter = 0;

    return counter;
});

const getPageUrl = ClientFunction(() => document.location.href);

// Fixture.onEachPage
fixture `Run "fixture.onEachPage" hook and continue test`
    .page `${testPage}`
    .onEachPage(async () => {
        await increaseHookCounter();
    });

test('Run "fixture.onEachPage" hook and continue test', async t => {
    await t
        .expect(getAndResetHookCounter()).eql(1)
        .click('#target')
        .expect(getClickState()).ok()
        .click('#reload')
        .expect(getAndResetHookCounter()).eql(1);
});

fixture `Break test and run "fixture.afterEach" if hook failed`
    .page `${testPage}`
    .onEachPage(() => {
        throw new Error('Yo!');
    })
    .afterEach(() => {
        throw new Error('Yo!');
    });

test('Break test and run "fixture.afterEach" if hook failed', async t => {
    await t.click('body');

    throw new Error('Should be unreachable');
});

fixture `Run hook in the current window context`
    .page `${testPage}`
    .onEachPage(async () => {
        await increaseHookCounter();
    });

test('Run hook in the current window context', async t => {
    await t
        .expect(getAndResetHookCounter()).eql(1)
        .switchToIframe('iframe')
        .click('#reload')
        .expect(getAndResetHookCounter()).eql(1)
        .switchToMainWindow()
        .click('#reload')
        .expect(getAndResetHookCounter()).eql(1);
});

fixture `Looping "fixture.onEachPage"`
    .page `${testPage}`
    .onEachPage(async t => {
        var pageUrl = await getPageUrl();

        if (pageUrl.indexOf('index') > -1) {
            await t.navigateTo(`${iframePage}`);

            throw new Error('Should be unreachable');
        }
    });

test('Restart hook if reload occurs during its execution', async t => {
    await t.expect(getPageUrl()).contains('iframe');
});

fixture `Run hook in "fixture.beforeEach" and "fixture.afterEach"`
    .page `${testPage}`
    .onEachPage(async () => {
        await increaseHookCounter();
    })
    .beforeEach(async t => {
        await t.expect(getAndResetHookCounter()).eql(1);
    })
    .afterEach(async t => {
        await t
            .navigateTo(`${testPage}`)
            .expect(getAndResetHookCounter()).eql(1);
    });

test('Run "fixture.beforeEach" and "fixture.afterEach"', async () => {

});

fixture `Share t.ctx and t.fixtureCtx between test and hooks`
    .page `${testPage}`
    .before(ctx => {
        ctx.foo = 'bar';
    })
    .onEachPage(async t => {
        await t.expect(t.fixtureCtx.foo).eql('bar');

        t.fixtureCtx.foo = 'baz';
        t.ctx.foo        = 'bar';
    });

test('Share t.ctx and t.fixtureCtx between test and hooks', async t => {
    await t.click('body');
    await t.expect(t.fixtureCtx.foo).eql('baz');
});

fixture `Switch hook after command "t.wait" is executed`
    .page `${testPage}`
    .onEachPage(async t => {
        await t.wait(500);
        t.ctx.actionSequence.push('hook wait');
        await t.click('body');
        t.ctx.actionSequence.push('hook click');
    });

test('Switch hook after command "t.wait" is executed', async t => {
    t.ctx.actionSequence = [];

    await t.wait(500);
    t.ctx.actionSequence.push('test wait');
    await t.click('body');
    t.ctx.actionSequence.push('test click');

    await t.expect(t.ctx.actionSequence).eql(['test wait', 'hook wait', 'hook click', 'test click']);
});

// Test.onEachPage
fixture `"test.onEachPage" hook`
    .page `${testPage}`;

test.onEachPage(async () => {
    await increaseHookCounter();
})('Run "test.onEachPage" hook', async t => {
    await t.expect(getAndResetHookCounter()).eql(1);
});

fixture `Override "fixture.onEachPage"`
    .page `${testPage}`
    .onEachPage(async () => {
        throw new Error('Should be unreachable');
    });

test.onEachPage(async () => {
    await increaseHookCounter();
})('Override "fixture.onEachPage"', async t => {
    await t.expect(getAndResetHookCounter()).eql(1);
});

// t.onEachPage
fixture `Hook for test controller`
    .page `${testPage}`;

test('Hook for test controller', async t => {
    await t
        .onEachPage(async () => await increaseHookCounter())
        .navigateTo(`${testPage}`)
        .expect(getAndResetHookCounter()).eql(1);
});

let isTestStarted = false;

fixture `Override "fixture.onEachPage" and "test.onEachPage"`
    .page `${testPage}`
    .onEachPage(async () => {
        if (isTestStarted)
            throw new Error('Should be unreachable');
    });

test.onEachPage(async () => {
    if (isTestStarted)
        throw new Error('Should be unreachable');
})('Override "fixture.onEachPage" and "test.onEachPage', async t => {
    await t.click('body');

    isTestStarted = true;

    await t
        .onEachPage(async () => await increaseHookCounter())
        .expect(getAndResetHookCounter()).eql(0)
        .navigateTo(`${testPage}`)
        .expect(getAndResetHookCounter()).eql(1);
});
