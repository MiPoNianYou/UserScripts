// ==UserScript==
// @name               Universal Web Liberator
// @name:zh-CN         网页枷锁破除
// @name:zh-TW         網頁枷鎖破除
// @description        Regain Control Unlocks RightClick/Selection/CopyPaste/Drag On Any Website
// @description:zh-CN  解除网页右键/选择/复制及拖拽限制 恢复自由交互体验
// @description:zh-TW  解除網頁右鍵/選取/複製及拖曳限制 恢復自由互動體驗
// @version            1.1.2
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
  static EventsToStop = ["contextmenu", "selectstart", "copy", "cut", "paste"];

  static RestrictedEventProps = [
    "oncontextmenu",
    "onselectstart",
    "oncopy",
    "oncut",
    "onpaste",
    "ondrag",
    "ondragstart",
  ];

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

  StopImmediatePropagationHandler(event) {
    event.stopImmediatePropagation();
  }

  BindGlobalEvents() {
    WebLiberator.EventsToStop.forEach((type) => {
      document.addEventListener(
        type,
        this.StopImmediatePropagationHandler,
        true
      );
    });
  }

  InjectLiberationStyles() {
    const StyleSheet = new CSSStyleSheet();
    StyleSheet.replaceSync(`
            *, *::before, *::after {
                user-select: text !important;
                -webkit-user-drag: auto !important;
                user-drag: auto !important;
            }
        `);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, StyleSheet];
  }

  ProcessExistingNodes() {
    requestIdleCallback(() => {
      if (document.body) {
        this.PurgeEventListeners(document.body);
        const elements = document.body.querySelectorAll("*");
        for (const element of elements) {
          this.PurgeEventListeners(element);
        }
      }
    });
  }

  PurgeEventListeners(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    for (const prop of WebLiberator.RestrictedEventProps) {
      element[prop] = null;
    }
  }

  HandleMutation(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.PurgeEventListeners(node);
            const descendants = node.querySelectorAll("*");
            for (const child of descendants) {
              this.PurgeEventListeners(child);
            }
          }
        }
      }
    }
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
