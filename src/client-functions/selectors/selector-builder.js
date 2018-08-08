import { isNil as isNullOrUndefined, merge } from 'lodash';
import dedent from 'dedent';
import ClientFunctionBuilder from '../client-function-builder';
import { SelectorNodeTransform } from '../replicator';
import { ClientFunctionAPIError } from '../../errors/runtime';
import functionBuilderSymbol from '../builder-symbol';
import MESSAGE from '../../errors/runtime/message';
import { assertType, is } from '../../errors/runtime/type-assertions';
import { ExecuteSelectorCommand } from '../../test-run/commands/observation';
import defineLazyProperty from '../../utils/define-lazy-property';
import { addAPI, addCustomMethods } from './add-api';
import createSnapshotMethods from './create-snapshot-methods';

export default class SelectorBuilder extends ClientFunctionBuilder {
    constructor (fn, options, callsiteNames) {
        const apiFn                        = options && options.apiFn;
        const builderFromSelector          = fn && fn[functionBuilderSymbol];
        const builderFromPromiseOrSnapshot = fn && fn.selector && fn.selector[functionBuilderSymbol];
        let builder                        = builderFromSelector || builderFromPromiseOrSnapshot;

        builder = builder instanceof SelectorBuilder ? builder : null;

        if (builder) {
            fn = builder.fn;

            if (options === void 0 || typeof options === 'object')
                options = merge({}, builder.options, options, { sourceSelectorBuilder: builder });
        }

        super(fn, options, callsiteNames);

        if (!this.options.apiFnChain) {
            const fnType = typeof this.fn;
            const item = fnType === 'string' ? this.fn : `[${fnType}]`;

            this.options.apiFn    = item;
            this.options.apiFnChain = [item];
        }

        if (apiFn)
            this.options.apiFnChain.push(apiFn);

        this.options.apiFnID = this.options.apiFnChain.length - 1;
    }

    _getCompiledFnCode () {
        // OPTIMIZATION: if selector was produced from another selector and
        // it has same dependencies as source selector, then we can
        // avoid recompilation and just re-use already compiled code.
        const hasSameDependenciesAsSourceSelector = this.options.sourceSelectorBuilder &&
                                                    this.options.sourceSelectorBuilder.options.dependencies ===
                                                    this.options.dependencies;

        if (hasSameDependenciesAsSourceSelector)
            return this.options.sourceSelectorBuilder.compiledFnCode;

        const code = typeof this.fn === 'string' ?
            `(function(){return document.querySelectorAll(${JSON.stringify(this.fn)});});` :
            super._getCompiledFnCode();

        if (code) {
            return dedent(
                `(function(){
                    var __f$=${code};
                    return function(){
                        var args           = __dependencies$.boundArgs || arguments;
                        var selectorFilter = window['%testCafeSelectorFilter%'];
                        
                        var nodes = __f$.apply(this, args);
                        nodes     = selectorFilter.cast(nodes);
                        
                        if (!nodes.length && !selectorFilter.error)
                            selectorFilter.error = __dependencies$.apiInfo.apiFnID;

                        return selectorFilter.filter(nodes, __dependencies$.filterOptions, __dependencies$.apiInfo);
                    };
                 })();`
            );
        }

        return null;
    }

    _createInvalidFnTypeError () {
        return new ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, MESSAGE.selectorInitializedWithWrongType, typeof this.fn);
    }

    _executeCommand (args, testRun, callsite) {
        const resultPromise = super._executeCommand(args, testRun, callsite);

        this._addBoundArgsSelectorGetter(resultPromise, args);

        // OPTIMIZATION: use buffer function as selector not to trigger lazy property ahead of time
        addAPI(resultPromise, () => resultPromise.selector, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);

        return resultPromise;
    }

    getFunctionDependencies () {
        const dependencies   = super.getFunctionDependencies();

        const { filterVisible, filterHidden, counterMode, collectionMode, index } = this.options;
        const { customDOMProperties, customMethods, apiFnChain, boundArgs }       = this.options;

        let selectorAncestor = this;

        while (selectorAncestor.options.sourceSelectorBuilder)
            selectorAncestor = selectorAncestor.options.sourceSelectorBuilder;

        const apiFnID = selectorAncestor.options.apiFnID;

        return merge({}, dependencies, {
            filterOptions: {
                filterVisible,
                filterHidden,
                counterMode,
                collectionMode,
                index: isNullOrUndefined(index) ? null : index
            },
            apiInfo: {
                apiFnChain,
                apiFnID
            },
            boundArgs,
            customDOMProperties,
            customMethods
        });
    }

    _createTestRunCommand (encodedArgs, encodedDependencies) {
        return new ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode:                    this.compiledFnCode,
            args:                      encodedArgs,
            dependencies:              encodedDependencies,
            needError:                 this.options.needError,
            apiFnChain:                this.options.apiFnChain,
            visibilityCheck:           !!this.options.visibilityCheck,
            timeout:                   this.options.timeout
        });
    }

    _validateOptions (options) {
        super._validateOptions(options);

        if (!isNullOrUndefined(options.visibilityCheck))
            assertType(is.boolean, this.callsiteNames.instantiation, '"visibilityCheck" option', options.visibilityCheck);

        if (!isNullOrUndefined(options.timeout))
            assertType(is.nonNegativeNumber, this.callsiteNames.instantiation, '"timeout" option', options.timeout);
    }

    _getReplicatorTransforms () {
        const transforms = super._getReplicatorTransforms();

        transforms.push(new SelectorNodeTransform());

        return transforms;
    }

    _addBoundArgsSelectorGetter (obj, selectorArgs) {
        defineLazyProperty(obj, 'selector', () => {
            const builder = new SelectorBuilder(this.getFunction(), { boundArgs: selectorArgs });

            return builder.getFunction();
        });
    }

    _decorateFunction (selectorFn) {
        super._decorateFunction(selectorFn);

        addAPI(selectorFn, () => selectorFn, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);
    }

    _processResult (result, selectorArgs) {
        const snapshot = super._processResult(result, selectorArgs);

        if (snapshot && !this.options.counterMode) {
            this._addBoundArgsSelectorGetter(snapshot, selectorArgs);
            createSnapshotMethods(snapshot);

            if (this.options.customMethods)
                addCustomMethods(snapshot, () => snapshot.selector, SelectorBuilder, this.options.customMethods);
        }

        return snapshot;
    }
}

