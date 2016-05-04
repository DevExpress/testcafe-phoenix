import { wrapDomAccessors } from 'testcafe-hammerhead';
import asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import { noop, escapeRegExp as escapeRe } from 'lodash';
import loadBabelLibs from './load-babel-libs';
import NODE_VER from '../../utils/node-version';
import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';

const ANONYMOUS_FN_RE                = /^function\*?\s*\(/;
const USE_STRICT_RE                  = /^('|")use strict('|");?/;
const TRAILING_SEMICOLON_RE          = /;\s*$/;
const REGENERATOR_FOOTPRINTS_RE      = /(_regenerator(\d+).default|regeneratorRuntime).wrap\(function _callee\$\(_context\)/;
const ASYNC_TO_GENERATOR_OUTPUT_CODE = asyncToGenerator(noop).toString();


var babelArtifactPolyfills = {
    'Promise': {
        re:                 /_promise(\d+)\.default/,
        create:             match => `var _promise${match[1]} = { default: Promise };`,
        removeMatchingCode: false
    },

    'Object.keys()': {
        re:                 /_keys(\d+)\.default/,
        create:             match => `var _keys${match[1]} = { default: Object.keys };`,
        removeMatchingCode: false
    },

    'JSON.stringify()': {
        re:                 /_stringify(\d+)\.default/,
        create:             match => `var _stringify${match[1]} = { default: JSON.stringify };`,
        removeMatchingCode: false
    },

    'typeof (Node.js 10)': {
        re:                 /_typeof(\d+)\.default/,
        create:             match => `var _typeof${match[1]} = { default: function(obj) { return typeof obj; } };`,
        removeMatchingCode: false
    },

    'typeof': {
        re: new RegExp(escapeRe(
            'var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? ' +
            'function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" ' +
            '&& obj.constructor === Symbol ? "symbol" : typeof obj;};'
        )),

        create:             () => 'var _typeof = function(obj) { return typeof obj; };',
        removeMatchingCode: true
    }
};


function getBabelOptions () {
    var { presetES2015Loose } = loadBabelLibs();

    return {
        presets:       [presetES2015Loose],
        sourceMaps:    false,
        retainLines:   true,
        ast:           false,
        babelrc:       false,
        highlightCode: false
    };
}

function downgradeES (fnCode) {
    var { babel } = loadBabelLibs();

    var opts     = getBabelOptions();
    var compiled = babel.transform(fnCode, opts);

    return compiled.code
        .replace(USE_STRICT_RE, '')
        .trim();
}

function addBabelArtifactsPolyfills (fnCode) {
    var polyfills = Object
        .values(babelArtifactPolyfills)
        .reduce((polyfillsCode, polyfill) => {
            var match = fnCode.match(polyfill.re);

            if (match) {
                if (polyfill.removeMatchingCode)
                    fnCode = fnCode.replace(polyfill.re, '');

                return polyfillsCode + polyfill.create(match);
            }

            return polyfillsCode;
        }, '');

    return `(function(){${polyfills} return ${fnCode}})();`;
}

export default function compileHybridFunction (fnCode) {
    if (fnCode === ASYNC_TO_GENERATOR_OUTPUT_CODE)
        throw new APIError('Hybrid', MESSAGE.regeneratorInClientCode);

    if (ANONYMOUS_FN_RE.test(fnCode))
        fnCode = `(${fnCode})`;

    // NOTE: we need to recompile ES6 code for the browser if we are on newer versions of Node.
    if (NODE_VER >= 4)
        fnCode = downgradeES(fnCode);

    fnCode = wrapDomAccessors(fnCode, true);

    // NOTE: check compiled code for regenerator injection: we have either generator
    // recompiled in Node.js 4+ for client or async function declared in function code.
    if (REGENERATOR_FOOTPRINTS_RE.test(fnCode))
        throw new APIError('Hybrid', MESSAGE.regeneratorInClientCode);

    if (!TRAILING_SEMICOLON_RE.test(fnCode))
        fnCode += ';';

    return addBabelArtifactsPolyfills(fnCode);
}
