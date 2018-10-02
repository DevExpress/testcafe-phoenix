import hammerhead from '../deps/hammerhead';
import { domUtils, styleUtils, positionUtils, promiseUtils, scrollController, sendRequestToFrame } from '../deps/testcafe-core';


const Promise        = hammerhead.Promise;
const messageSandbox = hammerhead.eventSandbox.message;

const DEFAULT_MAX_SCROLL_MARGIN   = 50;
const SCROLL_MARGIN_INCREASE_STEP = 20;

const SCROLL_REQUEST_CMD  = 'automation|scroll|request';
const SCROLL_RESPONSE_CMD = 'automation|scroll|response';


// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === SCROLL_REQUEST_CMD) {
        const { offsetX, offsetY, maxScrollMargin } = e.message;
        const element                               = domUtils.findIframeByWindow(e.source);
        const scroll                                = new ScrollAutomation(element, { offsetX, offsetY });

        scroll.maxScrollMargin = maxScrollMargin;

        scroll
            .run()
            .then(() => messageSandbox.sendServiceMsg({ cmd: SCROLL_RESPONSE_CMD }, e.source));
    }
});

export default class ScrollAutomation {
    constructor (element, scrollOptions) {
        this.element          = element;
        this.offsetX          = scrollOptions.offsetX;
        this.offsetY          = scrollOptions.offsetY;
        this.scrollToCenter   = scrollOptions.scrollToCenter;
        this.skipParentFrames = scrollOptions.skipParentFrames;

        this.maxScrollMargin = { left: DEFAULT_MAX_SCROLL_MARGIN, top: DEFAULT_MAX_SCROLL_MARGIN };
    }

    _isScrollValuesChanged (scrollElement, originalScroll) {
        return styleUtils.getScrollLeft(scrollElement) !== originalScroll.left
               || styleUtils.getScrollTop(scrollElement) !== originalScroll.top;
    }

    _setScroll (element, { left, top }) {
        const scrollElement = domUtils.isHtmlElement(element) ? domUtils.findDocument(element) : element;

        const originalScroll = {
            left: styleUtils.getScrollLeft(scrollElement),
            top:  styleUtils.getScrollTop(scrollElement)
        };

        left = Math.max(left, 0);
        top  = Math.max(top, 0);

        const scrollPromise = scrollController.waitForScroll();

        styleUtils.setScrollLeft(scrollElement, left);
        styleUtils.setScrollTop(scrollElement, top);

        if (!this._isScrollValuesChanged(scrollElement, originalScroll)) {
            scrollPromise.cancel();

            return Promise.resolve();
        }

        return scrollPromise;
    }

    _getScrollToPoint (elementDimensions, maxScrollMargin, { x, y }) {
        const horizontalCenter = Math.floor(elementDimensions.width / 2);
        const verticalCenter   = Math.floor(Math.floor(elementDimensions.height / 2));
        const leftScrollMargin = this.scrollToCenter ? horizontalCenter : Math.min(maxScrollMargin.left, horizontalCenter);
        const topScrollMargin  = this.scrollToCenter ? verticalCenter : Math.min(maxScrollMargin.top, verticalCenter);

        const needForwardScrollLeft  = x >= elementDimensions.scroll.left + elementDimensions.width - leftScrollMargin;
        const needBackwardScrollLeft = x <= elementDimensions.scroll.left + leftScrollMargin;

        const needForwardScrollTop  = y >= elementDimensions.scroll.top + elementDimensions.height - topScrollMargin;
        const needBackwardScrollTop = y <= elementDimensions.scroll.top + topScrollMargin;

        let left = elementDimensions.scroll.left;
        let top  = elementDimensions.scroll.top;

        if (needForwardScrollLeft)
            left = x - elementDimensions.width + leftScrollMargin;
        else if (needBackwardScrollLeft)
            left = x - leftScrollMargin;

        if (needForwardScrollTop)
            top = y - elementDimensions.height + topScrollMargin;
        else if (needBackwardScrollTop)
            top = y - topScrollMargin;

        return { left, top };
    }

    _getScrollToFullChildView (parentDimensions, childDimensions, maxScrollMargin) {
        let fullViewScrollLeft = null;
        let fullViewScrollTop  = null;

        const canShowFullElementWidth  = parentDimensions.width >= childDimensions.width;
        const canShowFullElementHeight = parentDimensions.height >= childDimensions.height;

        const relativePosition = positionUtils.calcRelativePosition(childDimensions, parentDimensions);

        if (canShowFullElementWidth) {
            const availableLeftScrollMargin = parentDimensions.width - childDimensions.width;
            let leftScrollMargin            = Math.min(maxScrollMargin.left, availableLeftScrollMargin);

            if (this.scrollToCenter)
                leftScrollMargin = availableLeftScrollMargin / 2;

            if (relativePosition.left < leftScrollMargin) {
                fullViewScrollLeft = Math.round(parentDimensions.scroll.left + relativePosition.left -
                                                leftScrollMargin);
            }
            else if (relativePosition.right < leftScrollMargin) {
                fullViewScrollLeft = Math.round(parentDimensions.scroll.left +
                                                Math.min(relativePosition.left, -relativePosition.right) +
                                                leftScrollMargin);
            }
        }

        if (canShowFullElementHeight) {
            const availableTopScrollMargin = parentDimensions.height - childDimensions.height;
            let topScrollMargin            = Math.min(maxScrollMargin.top, availableTopScrollMargin);

            if (this.scrollToCenter)
                topScrollMargin = availableTopScrollMargin / 2;

            if (relativePosition.top < topScrollMargin)
                fullViewScrollTop = Math.round(parentDimensions.scroll.top + relativePosition.top - topScrollMargin);
            else if (relativePosition.bottom < topScrollMargin) {
                fullViewScrollTop = Math.round(parentDimensions.scroll.top +
                                               Math.min(relativePosition.top, -relativePosition.bottom) +
                                               topScrollMargin);
            }
        }

        return {
            left: fullViewScrollLeft,
            top:  fullViewScrollTop
        };
    }

    _getScrollPosition (parentDimensions, childDimensions, maxScrollMargin, offsetX, offsetY) {
        const childPoint = {
            x: childDimensions.left - parentDimensions.left + parentDimensions.scroll.left +
               childDimensions.border.left + offsetX,
            y: childDimensions.top - parentDimensions.top + parentDimensions.scroll.top +
               childDimensions.border.top + offsetY
        };

        const scrollToPoint    = this._getScrollToPoint(parentDimensions, maxScrollMargin, childPoint);
        const scrollToFullView = this._getScrollToFullChildView(parentDimensions, childDimensions, maxScrollMargin);

        const left = Math.max(scrollToFullView.left === null ? scrollToPoint.left : scrollToFullView.left, 0);
        const top  = Math.max(scrollToFullView.top === null ? scrollToPoint.top : scrollToFullView.top, 0);

        return { left, top };
    }

    _getChildPointAfterScroll (parentDimensions, childDimensions, left, top) {
        const x = Math.round(childDimensions.left + parentDimensions.scroll.left - left + childDimensions.width / 2);
        const y = Math.round(childDimensions.top + parentDimensions.scroll.top - top + childDimensions.height / 2);

        return { x, y };
    }

    _isChildFullyVisible (parentDimensions, childDimensions, offsetX, offsetY) {
        const { left, top } = this._getScrollPosition(parentDimensions, childDimensions, { left: 0, top: 0 }, offsetX, offsetY);

        return left === parentDimensions.scroll.left && top === parentDimensions.scroll.top;
    }

    _scrollToChild (parent, child, { offsetX, offsetY }) {
        const parentDimensions = positionUtils.getClientDimensions(parent);
        const childDimensions  = positionUtils.getClientDimensions(child);
        const windowWidth      = styleUtils.getInnerWidth(window);
        const windowHeight     = styleUtils.getInnerHeight(window);
        let scrollPos          = {};
        let needScroll         = true;

        if (this._isChildFullyVisible(parentDimensions, childDimensions, offsetX, offsetY))
           return Promise.resolve();

        while (needScroll) {
            scrollPos = this._getScrollPosition(parentDimensions, childDimensions, this.maxScrollMargin, offsetX, offsetY);

            const { x, y }         = this._getChildPointAfterScroll(parentDimensions, childDimensions, scrollPos.left, scrollPos.top);
            const isTargetObscured = this._isTargetElementObscuredInPoint(x, y);

            this.maxScrollMargin.left += SCROLL_MARGIN_INCREASE_STEP;

            if (this.maxScrollMargin.left >= windowWidth) {
                this.maxScrollMargin.left = DEFAULT_MAX_SCROLL_MARGIN;

                this.maxScrollMargin.top += SCROLL_MARGIN_INCREASE_STEP;
            }

            needScroll = isTargetObscured && this.maxScrollMargin.top < windowHeight;
        }

        this.maxScrollMargin = { left: DEFAULT_MAX_SCROLL_MARGIN, top: DEFAULT_MAX_SCROLL_MARGIN };

        return this._setScroll(parent, scrollPos);
    }

    _scrollElement () {
        if (!styleUtils.hasScroll(this.element))
            return Promise.resolve();

        const elementDimensions = positionUtils.getClientDimensions(this.element);
        const scroll            = this._getScrollToPoint(elementDimensions, this.maxScrollMargin, {
            x: this.offsetX,
            y: this.offsetY
        });

        return this._setScroll(this.element, scroll);
    }

    _scrollParents () {
        const parents = styleUtils.getScrollableParents(this.element);

        let currentChild     = this.element;
        let currentOffsetX   = this.offsetX - Math.round(styleUtils.getScrollLeft(currentChild));
        let currentOffsetY   = this.offsetY - Math.round(styleUtils.getScrollTop(currentChild));
        let childDimensions  = null;
        let parentDimensions = null;

        const scrollParentsPromise = promiseUtils.times(parents.length, i => {
            return this
                ._scrollToChild(parents[i], currentChild, {
                    offsetX: currentOffsetX,
                    offsetY: currentOffsetY
                })
                .then(() => {
                    childDimensions  = positionUtils.getClientDimensions(currentChild);
                    parentDimensions = positionUtils.getClientDimensions(parents[i]);

                    currentOffsetX += childDimensions.left - parentDimensions.left + parentDimensions.border.left;
                    currentOffsetY += childDimensions.top - parentDimensions.top + parentDimensions.border.top;

                    currentChild = parents[i];
                });
        });

        return scrollParentsPromise
            .then(() => {
                if (window.top !== window && !this.skipParentFrames) {
                    return sendRequestToFrame({
                        cmd:             SCROLL_REQUEST_CMD,
                        offsetX:         currentOffsetX,
                        offsetY:         currentOffsetY,
                        maxScrollMargin: this.maxScrollMargin
                    }, SCROLL_RESPONSE_CMD, window.parent);
                }

                return Promise.resolve();
            });
    }

    _isTargetElementObscuredInPoint (x, y) {
        const elementInPoint = positionUtils.getElementFromPoint(x, y);
        let el               = elementInPoint;
        let fixedElement     = null;

        while (el && !fixedElement) {
            if (styleUtils.isFixedElement(el))
                fixedElement = el;

            el = el.parentNode;
        }

        return elementInPoint && fixedElement && !fixedElement.contains(this.element);
    }

    run () {
        return this
            ._scrollElement()
            .then(() => this._scrollParents());
    }
}
