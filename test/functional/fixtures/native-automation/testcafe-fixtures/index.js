import { proxyUrlTest, nativeUrlTest } from '../common/tests.js';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/native-automation/pages/index.html');

proxyUrlTest();

nativeUrlTest();

