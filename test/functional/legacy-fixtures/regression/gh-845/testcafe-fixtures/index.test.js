'@fixture gh-845';
'@page ./index.html';

var MAX_UNLOADING_TIMEOUT_WITH_INDENT = 15 * 1000 + 5000;

'@test'['Click on a download link'] = {
    '1.Click': function () {
        this.startTime = Date.now();
        act.click('#link');
    },

    '2.Check delay': function () {
        var delay = Date.now() - this.startTime;

        ok(delay < MAX_UNLOADING_TIMEOUT_WITH_INDENT);
    }
};

'@test'['Click on a download link in iframe'] = {
    '1.Click': inIFrame('#iframe', function () {
        this.startTime = Date.now();
        act.click('#link');
    }),

    '2.Check delay': function () {
        var delay = Date.now() - this.startTime;

        ok(delay < MAX_UNLOADING_TIMEOUT_WITH_INDENT);
    }
};

