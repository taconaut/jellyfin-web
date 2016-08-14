﻿define(['dom', 'scroller', 'browser', 'registerElement', 'css!./emby-tabs', 'scrollStyles'], function (dom, scroller, browser) {

    var EmbyTabs = Object.create(HTMLDivElement.prototype);
    var buttonClass = 'emby-tab-button';
    var activeButtonClass = buttonClass + '-active';

    function getBoundingClientRect(elem) {

        // Support: BlackBerry 5, iOS 3 (original iPhone)
        // If we don't have gBCR, just use 0,0 rather than error
        if (elem.getBoundingClientRect) {
            return elem.getBoundingClientRect();
        } else {
            return { top: 0, left: 0 };
        }
    }

    function getButtonSelectionBar(tabButton) {
        var elem = tabButton.querySelector('.' + buttonClass + '-selection-bar');

        if (!elem) {
            elem = document.createElement('div');
            elem.classList.add(buttonClass + '-selection-bar');
            tabButton.appendChild(elem);
        }

        return elem;
    }

    function hideButtonSelectionBar(tabButton) {

        var elem = getButtonSelectionBar(tabButton);

        elem.classList.add('hide');
        elem.classList.remove('emby-tab-button-selection-bar-active');
    }

    function showButtonSelectionBar(tabButton) {
        var elem = getButtonSelectionBar(tabButton);

        elem.classList.remove('hide');
        elem.classList.add('emby-tab-button-selection-bar-active');
    }

    function animtateSelectionBar(bar, start, pos, duration) {

        var endTransform = pos ? ('translateX(' + pos + 'px)') : 'none';
        var startTransform = start ? ('translateX(' + start + 'px)') : 'none';

        if (!duration || !bar.animate) {
            bar.style.transform = endTransform;
            return;
        }

        bar.style.transform = startTransform;

        var keyframes = [
          { transform: 'translateX(' + start + 'px)', offset: 0 },
          { transform: endTransform, offset: 1 }];

        bar.animate(keyframes, {
            duration: duration,
            iterations: 1,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }

    function moveSelectionBar(tabs, newButton, oldButton, animate) {

        if (oldButton) {
            hideButtonSelectionBar(oldButton);
        }
        hideButtonSelectionBar(newButton);

        var selectionBar = tabs.selectionBar;

        if (selectionBar) {
            selectionBar.style.width = newButton.offsetWidth + 'px';
            selectionBar.classList.remove('hide');
        }

        var tabsOffset = getBoundingClientRect(tabs);
        var startOffset = tabs.currentOffset || 0;

        if (oldButton) {
            if (tabs.scroller) {
                startOffset = tabs.scroller.getCenterPosition(oldButton);
            } else {
                startOffset = getBoundingClientRect(oldButton).left - tabsOffset.left;
            }
        }

        var endPosition;
        if (tabs.scroller) {
            endPosition = tabs.scroller.getCenterPosition(newButton);
        } else {
            var tabButtonOffset = getBoundingClientRect(newButton);
            endPosition = tabButtonOffset.left - tabsOffset.left;
        }

        var delay = animate ? 180 : 0;
        if (selectionBar) {
            animtateSelectionBar(selectionBar, startOffset, endPosition, delay);
        }
        tabs.currentOffset = endPosition;

        newButton.classList.add(activeButtonClass);

        setTimeout(function () {

            showButtonSelectionBar(newButton);
            if (selectionBar) {
                selectionBar.classList.add('hide');
            }

        }, delay);
    }

    function onClick(e) {

        var tabs = this;

        var current = tabs.querySelector('.' + activeButtonClass);
        var tabButton = dom.parentWithClass(e.target, buttonClass);

        if (tabButton && tabButton != current) {

            if (current) {
                current.classList.remove(activeButtonClass);
            }

            var previousIndex = current ? parseInt(current.getAttribute('data-index')) : null;

            moveSelectionBar(tabs, tabButton, current, true);
            var index = parseInt(tabButton.getAttribute('data-index'));

            tabs.dispatchEvent(new CustomEvent("beforetabchange", {
                detail: {
                    selectedTabIndex: index,
                    previousIndex: previousIndex
                }
            }));

            // If toCenter is called syncronously within the click event, it sometimes ends up canceling it
            setTimeout(function () {

                tabs.selectedTabIndex = index;

                tabs.dispatchEvent(new CustomEvent("tabchange", {
                    detail: {
                        selectedTabIndex: index,
                        previousIndex: previousIndex
                    }
                }));
            }, 120);

            if (tabs.scroller) {
                tabs.scroller.toCenter(tabButton, false);
            }

        }
    }

    function initScroller(tabs) {

        if (tabs.scroller) {
            return;
        }

        var contentScrollSlider = tabs.querySelector('.emby-tabs-slider');
        if (contentScrollSlider) {
            tabs.scroller = new scroller(tabs, {
                horizontal: 1,
                itemNav: 0,
                mouseDragging: 1,
                touchDragging: 1,
                slidee: contentScrollSlider,
                smart: true,
                releaseSwing: true,
                scrollBy: 200,
                speed: 120,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1,
                hiddenScroll: true,

                // In safari the transform is causing the headers to occasionally disappear or flicker
                requireAnimation: !browser.safari
            });
            tabs.scroller.init();
        } else {
            tabs.classList.add('hiddenScrollX');
        }
    }

    function initSelectionBar(tabs) {

        if (!browser.animate) {
            return;
        }

        var contentScrollSlider = tabs.querySelector('.emby-tabs-slider');

        if (!contentScrollSlider) {
            return;
        }

        var elem = document.createElement('div');
        elem.classList.add('emby-tabs-selection-bar');

        contentScrollSlider.appendChild(elem);
        tabs.selectionBar = elem;
    }

    EmbyTabs.createdCallback = function () {

        if (this.classList.contains('emby-tabs')) {
            return;
        }
        this.classList.add('emby-tabs');

        dom.addEventListener(this, 'click', onClick, {
            passive: true
        });

        initSelectionBar(this);
    };

    EmbyTabs.attachedCallback = function () {

        initScroller(this);

        var current = this.querySelector('.' + activeButtonClass);
        var currentIndex = current ? parseInt(current.getAttribute('data-index')) : 0;

        var newTabButton = this.querySelectorAll('.' + buttonClass)[currentIndex];

        if (newTabButton) {
            moveSelectionBar(this, newTabButton, current, false);
        }
    };

    EmbyTabs.detachedCallback = function () {

        if (this.scroller) {
            this.scroller.destroy();
            this.scroller = null;
        }

        dom.removeEventListener(this, 'click', onClick, {
            passive: true
        });
        this.selectionBar = null;
    };

    EmbyTabs.selectedIndex = function (selected) {

        var tabs = this;

        if (selected == null) {

            return tabs.selectedTabIndex || 0;
        }

        var current = tabs.selectedIndex();

        tabs.selectedTabIndex = selected;

        var tabButtons = tabs.querySelectorAll('.' + buttonClass);

        if (current == selected) {

            tabs.dispatchEvent(new CustomEvent("beforetabchange", {
                detail: {
                    selectedTabIndex: selected
                }
            }));
            tabs.dispatchEvent(new CustomEvent("tabchange", {
                detail: {
                    selectedTabIndex: selected
                }
            }));

            moveSelectionBar(tabs, tabButtons[selected], tabButtons[selected], false);
        } else {
            tabButtons[selected].click();
        }
    };

    EmbyTabs.triggerBeforeTabChange = function (selected) {

        var tabs = this;

        tabs.dispatchEvent(new CustomEvent("beforetabchange", {
            detail: {
                selectedTabIndex: tabs.selectedIndex()
            }
        }));
    };

    EmbyTabs.triggerTabChange = function (selected) {

        var tabs = this;

        tabs.dispatchEvent(new CustomEvent("tabchange", {
            detail: {
                selectedTabIndex: tabs.selectedIndex()
            }
        }));
    };

    document.registerElement('emby-tabs', {
        prototype: EmbyTabs,
        extends: 'div'
    });
});