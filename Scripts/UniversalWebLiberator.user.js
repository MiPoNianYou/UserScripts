// ==UserScript==
// @name               Universal Web Liberator
// @name:zh-CN         网页枷锁破除
// @name:zh-TW         網頁枷鎖破除
// @description        Regain Control: Unlocks RightClick/Selection/CopyPaste/Drag On Any Website
// @description:zh-CN  解除网页右键/选择/复制及拖拽限制 恢复自由交互体验
// @description:zh-TW  解除網頁右鍵/選取/複製及拖曳限制 恢復自由互動體驗
// @version            1.2.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/UniversalWebLiberatorIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              *://*/*
// @grant              none
// @run-at             document-start
// ==/UserScript==

class WebLiberator {
  static EventsToStop = [
    "contextmenu",
    "selectstart",
    "copy",
    "cut",
    "paste",
    "dragstart",
    "drag",
  ];

  static InlineEventPropsToClear = [
    "oncontextmenu",
    "onselectstart",
    "oncopy",
    "oncut",
    "onpaste",
    "ondrag",
    "ondragstart",
    "onmousedown",
    "onselect",
    "onbeforecopy",
    "onbeforecut",
    "onbeforepaste",
  ];

  observer = null;

  constructor() {
    this.injectLiberationStyles();
    this.bindGlobalEventHijackers();
    this.initMutationObserver();

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        this.processExistingNodes.bind(this)
      );
    } else {
      this.processExistingNodes();
    }
  }

  stopImmediatePropagationHandler(event) {
    event.stopImmediatePropagation();
  }

  bindGlobalEventHijackers() {
    WebLiberator.EventsToStop.forEach((type) => {
      document.addEventListener(
        type,
        this.stopImmediatePropagationHandler,
        true
      );
    });
  }

  injectLiberationStyles() {
    const css = `
            *, *::before, *::after {
                user-select: text !important;
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                cursor: auto !important;
                -webkit-user-drag: auto !important;
                user-drag: auto !important;
            }
        `;
    try {
      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(css);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        styleSheet,
      ];
    } catch (e) {
      const style = document.createElement("style");
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  processExistingNodes() {
    if (document.documentElement) {
      this.clearHandlersRecursive(document.documentElement);
    }
  }

  clearSingleElementHandlers(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    for (const prop of WebLiberator.InlineEventPropsToClear) {
      if (element[prop]) {
        try {
          element[prop] = null;
        } catch (e) {}
      }
      if (element.hasAttribute(prop)) {
        try {
          element.removeAttribute(prop);
        } catch (e) {}
      }
    }
  }

  clearHandlersRecursive(rootNode) {
    try {
      if (rootNode.nodeType === Node.ELEMENT_NODE) {
        this.clearSingleElementHandlers(rootNode);
        if (rootNode.shadowRoot && rootNode.shadowRoot.mode === "open") {
          this.clearHandlersRecursive(rootNode.shadowRoot);
        }
      }

      const elements = rootNode.querySelectorAll("*");
      for (const element of elements) {
        this.clearSingleElementHandlers(element);
        if (element.shadowRoot && element.shadowRoot.mode === "open") {
          this.clearHandlersRecursive(element.shadowRoot);
        }
      }
    } catch (error) {
    }
  }

  handleMutation(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.clearHandlersRecursive(node);
          }
        }
      }
    }
  }

  initMutationObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = new MutationObserver(this.handleMutation.bind(this));
    try {
      this.observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    } catch (error) {
    }
  }
}

try {
  new WebLiberator();
} catch (error) {
}
