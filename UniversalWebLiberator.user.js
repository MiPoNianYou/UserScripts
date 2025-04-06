// ==UserScript==
// @name         网页限制解除器
// @description  深度解除网页复制内容限制 智能恢复右键菜单/文本选择/剪贴板操作/拖拽功能
// @version      1.0.0
// @author       念柚
// @namespace    https://github.com/MiPoNianYou/
// @license      GPL-3.0
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

class CopyRestrictionRemover {
    constructor() {
        this.InitializeObserver();
        this.ExecuteCoreFeatures();
    }

    ExecuteCoreFeatures() {
        this.RemoveEventListeners(document);
        this.RemoveEventListeners(document.body);
        this.InjectLiberationStyles();
        this.BindGlobalEventHandlers();
        this.ProcessExistingElements();
    }

    BindGlobalEventHandlers() {
        const EventConfigurations = [
            ['contextmenu', this.HandleContextMenu],
            ['selectstart', this.HandleSelection],
            ['copy', this.HandleClipboard],
            ['cut', this.HandleClipboard],
            ['paste', this.HandleClipboard]
        ];

        EventConfigurations.forEach(([eventType, handler]) => {
            document.addEventListener(eventType, handler.bind(this), true);
        });
    }

    HandleContextMenu(event) {
        event.stopPropagation();
        return true;
    }

    HandleSelection(event) {
        event.stopPropagation();
        return true;
    }

    HandleClipboard(event) {
        event.stopPropagation();
        return true;
    }

    InjectLiberationStyles() {
        const StyleDeclaration = `
            * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
                -webkit-user-drag: auto !important;
                -moz-user-drag: auto !important;
                user-drag: auto !important;
            }
        `;

        const StyleElement = document.createElement('style');
        StyleElement.textContent = StyleDeclaration;
        document.head.appendChild(StyleElement);
    }

    ProcessExistingElements() {
        document.querySelectorAll('*').forEach(element => {
            this.RemoveEventListeners(element);
        });
    }

    RemoveEventListeners(element) {
        if (!element) return;

        const RestrictedProperties = [
            'oncontextmenu', 'onselectstart',
            'oncopy', 'oncut', 'onpaste',
            'ondrag', 'ondragstart'
        ];

        RestrictedProperties.forEach(property => {
            element[property] = null;
        });
    }

    InitializedMutationHandler(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.RemoveEventListeners(node);
                        node.querySelectorAll('*').forEach(child => {
                            this.RemoveEventListeners(child);
                        });
                    }
                });
            }
        }
    }

    InitializeObserver() {
        this.DomObserver = new MutationObserver(this.InitializedMutationHandler.bind(this));
        this.DomObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    }
}

new CopyRestrictionRemover();