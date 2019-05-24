const FLAGS = [
    'debug',
    '--debug',
    '--debug-brk',
    '--inspect',
    '--inspect-brk',
    '--expose-gc',
    '--gc-global',
    '--es_staging',
    '--no-deprecation',
    '--prof',
    '--log-timer-events',
    '--throw-deprecation',
    '--trace-deprecation',
    '--use_strict',
    '--allow-natives-syntax',
    '--perf-basic-prof',
    '--experimental-repl-await'
];

const FLAG_PREFIXES = [
    '--harmony',
    '--trace',
    '--icu-data-dir',
    '--max-old-space-size',
    '--preserve-symlinks'
];

function isNodeFlagPrefix (arg) {
    return FLAG_PREFIXES.some(flagPrefix => {
        return arg.indexOf(flagPrefix) === 0;
    });
}

export default function (cliArgs) {
    const args    = [];
    const v8Flags = [];

    cliArgs.forEach(arg => {
        const flag = arg.split('=')[0];

        if (FLAGS.indexOf(flag) > -1 || isNodeFlagPrefix(arg))
            v8Flags.push(arg);
        else
            args.push(arg);
    });

    return { args, v8Flags: v8Flags.length ? v8Flags : void 0 };
}
