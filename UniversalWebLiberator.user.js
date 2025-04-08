// ==UserScript==
// @name         网页枷锁破除
// @description  深度破除网页内容限制 智能恢复全功能操作：右键菜单复活｜文本自由选择｜剪贴板无阻操作｜元素拖拽解放｜动态加载监控｜样式强制覆盖
// @version      1.1.0
// @author       念柚
// @namespace    https://github.com/MiPoNianYou/UserScripts
// @license      GPL-3.0
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

class WebLiberator {
  constructor() {
    this.InitMutationObserver();
    this.ExecuteCoreFeatures();
  }

  ExecuteCoreFeatures() {
    this.PurgeEventListeners(document.documentElement);
    this.InjectLiberationStyles();
    this.BindGlobalEvents();
    this.ProcessExistingNodes();
  }

  BindGlobalEvents() {
    const EventHandlers = [
      { type: "contextmenu", handler: this.HandleContextMenu },
      { type: "selectstart", handler: this.HandleSelection },
      { type: "copy", handler: this.HandleClipboard },
      { type: "cut", handler: this.HandleClipboard },
      { type: "paste", handler: this.HandleClipboard },
    ];

    EventHandlers.forEach(({ type, handler }) => {
      document.addEventListener(type, handler.bind(this), true);
    });
  }

  HandleContextMenu(event) {
    event.stopImmediatePropagation();
  }

  HandleSelection(event) {
    event.stopImmediatePropagation();
  }

  HandleClipboard(event) {
    event.stopImmediatePropagation();
  }

  InjectLiberationStyles() {
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(`
            *, *::before, *::after {
                user-select: text !important;
                -webkit-user-drag: auto !important;
                user-drag: auto !important;
            }
        `);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
  }

  ProcessExistingNodes() {
    this.PurgeEventListeners(document.body);
    requestIdleCallback(() => {
      document.querySelectorAll("*").forEach((node) => {
        this.PurgeEventListeners(node);
      });
    });
  }

  PurgeEventListeners(element) {
    if (!element?.nodeType) return;

    const restrictedeventprops = [
      "oncontextmenu",
      "onselectstart",
      "oncopy",
      "oncut",
      "onpaste",
      "ondrag",
      "ondragstart",
    ];

    restrictedeventprops.forEach((prop) => {
      element[prop] = null;
    });
  }

  HandleMutation(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.PurgeEventListeners(node);
            node.querySelectorAll?.("*").forEach((child) => {
              this.PurgeEventListeners(child);
            });
          }
        });
      }
    });
  }

  InitMutationObserver() {
    this.observer = new MutationObserver(this.HandleMutation.bind(this));
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
    });
  }
}

new WebLiberator();
