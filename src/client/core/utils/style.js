import hammerhead from '../deps/hammerhead';
import * as domUtils from './dom';
import { filter, some } from './array';


const styleUtils   = hammerhead.utils.style;
const browserUtils = hammerhead.utils.browser;

export var getBordersWidth      = hammerhead.utils.style.getBordersWidth;
export var getComputedStyle     = hammerhead.utils.style.getComputedStyle;
export var getElementMargin     = hammerhead.utils.style.getElementMargin;
export var getElementPadding    = hammerhead.utils.style.getElementPadding;
export var getElementScroll     = hammerhead.utils.style.getElementScroll;
export var getOptionHeight      = hammerhead.utils.style.getOptionHeight;
export var getSelectElementSize = hammerhead.utils.style.getSelectElementSize;
export var isElementVisible     = hammerhead.utils.style.isElementVisible;
export var isSelectVisibleChild = hammerhead.utils.style.isVisibleChild;
export var getWidth             = hammerhead.utils.style.getWidth;
export var getHeight            = hammerhead.utils.style.getHeight;
export var getInnerWidth        = hammerhead.utils.style.getInnerWidth;
export var getInnerHeight       = hammerhead.utils.style.getInnerHeight;
export var getScrollLeft        = hammerhead.utils.style.getScrollLeft;
export var getScrollTop         = hammerhead.utils.style.getScrollTop;
export var setScrollLeft        = hammerhead.utils.style.setScrollLeft;
export var setScrollTop         = hammerhead.utils.style.setScrollTop;
export var get                  = hammerhead.utils.style.get;

const SCROLLABLE_OVERFLOW_STYLE_RE               = /auto|scroll/i;
const DEFAULT_IE_SCROLLABLE_OVERFLOW_STYLE_VALUE = 'visible';

const getScrollable = function (el) {
    const overflowX            = get(el, 'overflowX');
    const overflowY            = get(el, 'overflowY');
    let scrollableHorizontally = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowX);
    let scrollableVertically   = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowY);

    // IE11 bug: There are two properties: overflow-x and overflow-y.
    // If one property is set so that the browser may show scrollbars (`auto` or `scroll`) and the second one is set to 'visible',
    // then the second one will work as if it had the 'auto' value.
    if (browserUtils.isIE11) {
        if (!scrollableHorizontally && scrollableVertically && overflowX === DEFAULT_IE_SCROLLABLE_OVERFLOW_STYLE_VALUE)
            scrollableHorizontally = true;
        if (!scrollableVertically && scrollableHorizontally && overflowY === DEFAULT_IE_SCROLLABLE_OVERFLOW_STYLE_VALUE)
            scrollableVertically = true;
    }

    return { scrollableHorizontally, scrollableVertically };
};

var getAncestors = function (node) {
    var ancestors = [];

    while (node.parentNode) {
        ancestors.unshift(node.parentNode);
        node = node.parentNode;
    }

    return ancestors;
};

var getAncestorsAndSelf = function (node) {
    return getAncestors(node).concat([node]);
};

var isVisibilityHiddenNode = function (node) {
    var ancestors = getAncestorsAndSelf(node);

    return some(ancestors, ancestor => domUtils.isElementNode(ancestor) && get(ancestor, 'visibility') === 'hidden');
};

var isHiddenNode = function (node) {
    var ancestors = getAncestorsAndSelf(node);

    return some(ancestors, ancestor => domUtils.isElementNode(ancestor) && get(ancestor, 'display') === 'none');
};

export function isFixedElement (node) {
    return domUtils.isElementNode(node) && get(node, 'position') === 'fixed';
}

export function isNotVisibleNode (node) {
    return !domUtils.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenNode(node);
}

export function getScrollableParents (element) {
    var parentsArray = domUtils.getParents(element);

    if (domUtils.isElementInIframe(element)) {
        var iFrameParents = domUtils.getParents(domUtils.getIframeByElement(element));

        parentsArray.concat(iFrameParents);
    }

    return filter(parentsArray, hasScroll);
}

function hasBodyScroll (el) {
    var overflowX              = get(el, 'overflowX');
    var overflowY              = get(el, 'overflowY');
    var scrollableHorizontally = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowX);
    var scrollableVertically   = SCROLLABLE_OVERFLOW_STYLE_RE.test(overflowY);

    var documentElement = domUtils.findDocument(el).documentElement;

    return (scrollableHorizontally || scrollableVertically) &&
           el.scrollHeight > documentElement.scrollHeight;
}

function hasHTMLElementScroll (el) {
    var overflowX = get(el, 'overflowX');
    var overflowY = get(el, 'overflowY');
    //T174562 - wrong scrolling in iframes without src and others iframes
    var body      = el.getElementsByTagName('body')[0];

    //T303226
    if (overflowX === 'hidden' && overflowY === 'hidden')
        return false;

    var hasHorizontalScroll = el.scrollHeight > el.clientHeight;
    var hasVerticalScroll   = el.scrollWidth > el.clientWidth;

    if (hasHorizontalScroll || hasVerticalScroll)
        return true;

    if (body) {
        if (hasBodyScroll(body))
            return false;

        var clientWidth  = Math.min(el.clientWidth, body.clientWidth);
        var clientHeight = Math.min(el.clientHeight, body.clientHeight);

        return body.scrollHeight > clientHeight || body.scrollWidth > clientWidth;
    }

    return false;
}

export function hasScroll (el) {
    const { scrollableHorizontally, scrollableVertically } = getScrollable(el);

    if (domUtils.isBodyElement(el))
        return hasBodyScroll(el);

    if (domUtils.isHtmlElement(el))
        return hasHTMLElementScroll(el);

    if (!scrollableHorizontally && !scrollableVertically)
        return false;

    var hasVerticalScroll   = scrollableVertically && el.scrollHeight > el.clientHeight;
    var hasHorizontalScroll = scrollableHorizontally && el.scrollWidth > el.clientWidth;

    return hasHorizontalScroll || hasVerticalScroll;
}

export function hasDimensions (el) {
    //NOTE: it's like jquery ':visible' selector (http://blog.jquery.com/2009/02/20/jquery-1-3-2-released/)
    return el && !(el.offsetHeight <= 0 && el.offsetWidth <= 0);
}

export function set (el, style, value) {
    if (typeof style === 'string')
        styleUtils.set(el, style, value);

    for (var property in style) {
        if (style.hasOwnProperty(property))
            styleUtils.set(el, property, style[property]);
    }
}

function getViewportDimension (windowDimension, documentDimension, bodyDimension) {
    if (documentDimension > windowDimension)
        return bodyDimension;

    if (bodyDimension > windowDimension)
        return documentDimension;

    return Math.max(bodyDimension, documentDimension);
}

export function getViewportDimensions () {
    return {
        width:  getViewportDimension(window.innerWidth, document.documentElement.clientWidth, document.body.clientWidth),
        height: getViewportDimension(window.innerHeight, document.documentElement.clientHeight, document.body.clientHeight)
    };
}

