// ==UserScript==
// @name         网页限制解除器
// @description  深度解除网页复制内容限制 智能恢复右键菜单/文本选择/剪贴板操作/拖拽功能
// @version      1.1.0
// @author       念柚
// @namespace    https://github.com/MiPoNianYou/UserScripts
// @license      GPL-3.0
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

class EnhancedLiberator {
    constructor() {
        this.InitializeObserver();
        this.ExecuteCoreFeatures();
        this.HijackEventListeners();
    }

    ExecuteCoreFeatures() {
        this.RemoveEventListeners(document);
        this.RemoveEventListeners(document.body);
        this.InjectLiberationStyles();
        this.BindGlobalEventHandlers();
        this.ProcessExistingElements();
    }

    BindGlobalEventHandlers() {
        const events = [
            ['contextmenu', e => e.stopImmediatePropagation()],
            ['selectstart', e => e.stopImmediatePropagation()],
            ['copy', e => e.stopImmediatePropagation()],
            ['cut', e => e.stopImmediatePropagation()],
            ['paste', e => e.stopImmediatePropagation()]
        ];
        events.forEach(([type, handler]) => {
            document.addEventListener(type, handler, {capture: true, passive: true});
        });
    }

    InjectLiberationStyles() {
        const css = `*,*::before,*::after{
            -webkit-user-select:text!important;
            user-select:text!important;
            -webkit-user-drag:auto!important;
            user-drag:auto!important;
        }`;
        if (!document.getElementById('liberator-style')) {
            const style = document.createElement('style');
            style.id = 'liberator-style';
            style.textContent = css;
            (document.head || document.documentElement).append(style);
        }
    }

    ProcessExistingElements() {
        try {
            const walker = document.createTreeWalker(
                document.documentElement,
                NodeFilter.SHOW_ELEMENT
            );
            let node;
            while ((node = walker.nextNode())) {
                this.RemoveEventListeners(node);
            }
        } catch (e) { console.debug('Liberator:', e); }
    }

    RemoveEventListeners(element) {
        if (!element || !element.addEventListener) return;

        // 清除属性事件
        ['oncontextmenu','onselectstart','oncopy','oncut','onpaste','ondrag','ondragstart']
            .forEach(prop => { element[prop] = null; });

        // 劫持addEventListener
        const nativeAdd = EventTarget.prototype.addEventListener;
        element.addEventListener = function(type, listener, options) {
            if (['contextmenu','selectstart','copy','cut','paste','drag','dragstart']
                .includes(type)) return;
            nativeAdd.call(this, type, listener, options);
        };
    }

    HijackEventListeners() {
        const nativeAdd = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (['contextmenu','selectstart','copy','cut','paste','drag','dragstart']
                .includes(type)) return;
            nativeAdd.call(this, type, listener, options);
        };
    }

    InitializeObserver() {
        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        this.RemoveEventListeners(node);
                        this.ProcessExistingElements();
                    }
                });
            });
        }).observe(document, {
            childList: true,
            subtree: true
        });
    }
}

new EnhancedLiberator();
