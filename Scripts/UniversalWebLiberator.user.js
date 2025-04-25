// ==UserScript==
// @name               Universal Web Liberator
// @name:zh-CN         网页枷锁破除
// @name:zh-TW         網頁枷鎖破除
// @description        Regain Control: Unlocks RightClick/Selection/CopyPaste/Drag On Any Website, Toggle Status With Bottom-Right Button or Ctrl/Meta+Alt+L or Menu Command.
// @description:zh-CN  解除网页右键/选择/复制及拖拽限制 恢复自由交互体验 单击右下角图标或使用 Ctrl/Meta+Alt+L 或油猴菜单切换状态
// @description:zh-TW  解除網頁右鍵/選取/複製及拖曳限制 恢復自由互動體驗 單擊右下角圖標或使用 Ctrl/Meta+Alt+L 或油猴菜單切換狀態
// @version            1.3.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/UniversalWebLiberatorIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              *://*/*
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_addStyle
// @grant              GM_registerMenuCommand
// @grant              GM_unregisterMenuCommand
// @run-at             document-start
// ==/UserScript==

(function () {
  "use strict";

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const localizedStrings = {
    "zh-CN": {
      scriptTitle: "网页枷锁破除",
      stateEnabledText: "脚本已启用 ✅",
      stateDisabledText: "脚本已禁用 ❌",
    },
    "zh-TW": {
      scriptTitle: "網頁枷鎖破除",
      stateEnabledText: "腳本已啟用 ✅",
      stateDisabledText: "腳本已禁用 ❌",
    },
    "en-US": {
      scriptTitle: "Universal Web Liberator",
      stateEnabledText: "Liberator Activated ✅",
      stateDisabledText: "Liberator Deactivated ❌",
    },
  };

  function detectUserLanguage() {
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      const langLower = lang.toLowerCase();
      if (langLower === "zh-cn") return "zh-CN";
      if (
        langLower === "zh-tw" ||
        langLower === "zh-hk" ||
        langLower === "zh-mo"
      )
        return "zh-TW";
      if (langLower === "en-us") return "en-US";
      if (langLower.startsWith("zh-")) return "zh-CN";
      if (langLower.startsWith("en-")) return "en-US";
    }
    for (const lang of languages) {
      const langLower = lang.toLowerCase();
      if (langLower.startsWith("zh")) return "zh-CN";
      if (langLower.startsWith("en")) return "en-US";
    }
    return "en-US";
  }

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
    static ScriptIconUrl =
      "https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/UniversalWebLiberatorIcon.svg";
    static NotificationId = "WebLiberatorNotification";
    static MenuButtonId = "WebLiberatorMenuButton";
    static NotificationTimeout = 2500;
    static AnimationDuration = 300;
    static STORAGE_KEY_PREFIX = "webLiberator_state_";
    static DEFAULT_ACTIVE_STATE = false;

    observer = null;
    liberationStyleElement = null;
    menuButtonElement = null;
    isActive = WebLiberator.DEFAULT_ACTIVE_STATE;
    boundStopHandler = null;
    notificationTimer = null;
    removalTimer = null;
    currentOrigin = window.location.origin;
    locale = "en-US";
    strings = {};
    menuCommandId = null;

    constructor() {
      this.locale = detectUserLanguage();
      this.strings = localizedStrings[this.locale] || localizedStrings["en-US"];
      this.boundStopHandler = this.stopImmediatePropagationHandler.bind(this);
    }

    getOriginStorageKey() {
      const origin = String(this.currentOrigin || "").replace(/\/$/, "");
      return `${WebLiberator.STORAGE_KEY_PREFIX}${origin}`;
    }

    loadState() {
      const storageKey = this.getOriginStorageKey();
      const defaultStateString = WebLiberator.DEFAULT_ACTIVE_STATE
        ? "enabled"
        : "disabled";
      let storedValue = defaultStateString;
      try {
        storedValue = GM_getValue(storageKey, defaultStateString);
      } catch (e) {}
      if (storedValue !== "enabled" && storedValue !== "disabled") {
        storedValue = defaultStateString;
      }
      this.isActive = storedValue === "enabled";
      return this.isActive;
    }

    saveState() {
      const storageKey = this.getOriginStorageKey();
      const valueToStore = this.isActive ? "enabled" : "disabled";
      try {
        GM_setValue(storageKey, valueToStore);
      } catch (e) {}
    }

    activate() {
      if (this.isActive) return;
      this.isActive = true;
      this.injectLiberationStyles();
      this.bindGlobalEventHijackers();
      this.processExistingNodes(document.documentElement);
      this.initMutationObserver();
      this.updateMenuStatus();
    }

    deactivate() {
      if (!this.isActive) return;
      this.isActive = false;
      this.removeLiberationStyles();
      this.unbindGlobalEventHijackers();
      this.disconnectMutationObserver();
      this.updateMenuStatus();
    }

    toggle() {
      const wasActive = this.isActive;
      if (wasActive) {
        this.deactivate();
        this.showNotification("stateDisabledText");
      } else {
        this.activate();
        this.showNotification("stateEnabledText");
      }
      this.saveState();
      this.updateMenuCommand();
    }

    injectBaseStyles() {
      const notificationCSS = `
        :root {
          --wl-notify-bg-light: rgba(242, 242, 247, 0.85);
          --wl-notify-text-light: rgba(60, 60, 67, 0.9);
          --wl-notify-title-light: rgba(0, 0, 0, 0.9);
          --wl-notify-bg-dark: rgba(44, 44, 46, 0.85);
          --wl-notify-text-dark: rgba(235, 235, 245, 0.8);
          --wl-notify-title-dark: rgba(255, 255, 255, 0.9);
          --wl-shadow-light: 0 6px 20px rgba(100, 100, 100, 0.12);
          --wl-shadow-dark: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        #${WebLiberator.NotificationId} {
          position: fixed;
          top: 20px;
          right: -400px;
          width: 310px;
          background-color: var(--wl-notify-bg-dark);
          color: var(--wl-notify-text-dark);
          padding: 14px 18px;
          border-radius: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          z-index: 2147483646;
          box-shadow: var(--wl-shadow-dark);
          display: flex;
          align-items: center;
          opacity: 0;
          transition: right ${
            WebLiberator.AnimationDuration
          }ms cubic-bezier(0.32, 0.72, 0, 1),
                      opacity ${
                        WebLiberator.AnimationDuration * 0.8
                      }ms ease-out;
          box-sizing: border-box;
          backdrop-filter: blur(18px) saturate(180%);
          -webkit-backdrop-filter: blur(18px) saturate(180%);
          text-align: left;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        #${WebLiberator.NotificationId}.visible {
          right: 20px;
          opacity: 1;
        }
        #${WebLiberator.NotificationId} .wl-icon {
          width: 30px;
          height: 30px;
          margin-right: 14px;
          flex-shrink: 0;
        }
        #${WebLiberator.NotificationId} .wl-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0;
        }
        #${WebLiberator.NotificationId} .wl-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--wl-notify-title-dark);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        #${WebLiberator.NotificationId} .wl-message {
          font-size: 13px;
          line-height: 1.45;
          color: var(--wl-notify-text-dark);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        @media (prefers-color-scheme: light) {
          #${WebLiberator.NotificationId} {
            background-color: var(--wl-notify-bg-light);
            color: var(--wl-notify-text-light);
            box-shadow: var(--wl-shadow-light);
            border: 1px solid rgba(60, 60, 67, 0.1);
          }
          #${WebLiberator.NotificationId} .wl-title {
            color: var(--wl-notify-title-light);
          }
          #${WebLiberator.NotificationId} .wl-message {
            color: var(--wl-notify-text-light);
          }
        }
      `;

      const menuCSS = `
        :root {
          --wl-menu-bg-light: rgba(242, 242, 247, 0.8);
          --wl-menu-bg-dark: rgba(44, 44, 46, 0.8);
          --wl-shadow-light: 0 4px 15px rgba(100, 100, 100, 0.1);
          --wl-shadow-dark: 0 4px 15px rgba(0, 0, 0, 0.25);
        }
        #${WebLiberator.MenuButtonId} {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 44px;
          height: 44px;
          background-color: var(--wl-menu-bg-dark);
          border-radius: 50%;
          cursor: pointer;
          z-index: 2147483647;
          box-shadow: var(--wl-shadow-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1),
                      background-color 0.2s ease,
                      opacity 0.2s ease;
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          opacity: 0.7;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        #${WebLiberator.MenuButtonId}:hover {
          transform: scale(1.08);
          opacity: 1;
        }
        #${WebLiberator.MenuButtonId} img {
          width: 22px;
          height: 22px;
          display: block;
          opacity: 0.9;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        @media (prefers-color-scheme: light) {
          #${WebLiberator.MenuButtonId} {
            border: 1px solid rgba(60, 60, 67, 0.15);
            box-shadow: var(--wl-shadow-light);
            background-color: var(--wl-menu-bg-light);
          }
          #${WebLiberator.MenuButtonId} img {
            opacity: 0.8;
          }
        }
      `;

      try {
        GM_addStyle(notificationCSS);
        GM_addStyle(menuCSS);
      } catch (e) {}
    }

    injectLiberationStyles() {
      if (
        this.liberationStyleElement ||
        document.getElementById("web-liberator-styles")
      )
        return;
      const css = `
        *,
        *::before,
        *::after {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          cursor: auto !important;
          -webkit-user-drag: auto !important;
          user-drag: auto !important;
          pointer-events: auto !important;
        }
        body {
          cursor: auto !important;
        }
        ::selection {
          background-color: highlight !important;
          color: highlighttext !important;
        }
        ::-moz-selection {
          background-color: highlight !important;
          color: highlighttext !important;
        }
      `;
      this.liberationStyleElement = document.createElement("style");
      this.liberationStyleElement.id = "web-liberator-styles";
      this.liberationStyleElement.textContent = css;
      (document.head || document.documentElement).appendChild(
        this.liberationStyleElement
      );
    }

    removeLiberationStyles() {
      this.liberationStyleElement?.remove();
      this.liberationStyleElement = null;
      document.getElementById("web-liberator-styles")?.remove();
    }

    ensureElementsCreated() {
      if (
        this.menuButtonElement &&
        document.body?.contains(this.menuButtonElement)
      ) {
        this.updateMenuStatus();
        return;
      }
      let existingButton = document.getElementById(WebLiberator.MenuButtonId);
      if (existingButton) {
        this.menuButtonElement = existingButton;
        if (!this.menuButtonElement.dataset.listenerAttached) {
          this.menuButtonElement.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggle();
          });
          this.menuButtonElement.dataset.listenerAttached = "true";
        }
        this.updateMenuStatus();
        return;
      }
      if (document.body) {
        this.createMenuElements();
      } else {
        document.addEventListener(
          "DOMContentLoaded",
          () => {
            this.ensureElementsCreated();
          },
          { once: true }
        );
      }
    }

    createMenuElements() {
      if (!document.body || document.getElementById(WebLiberator.MenuButtonId))
        return;
      this.menuButtonElement = document.createElement("div");
      this.menuButtonElement.id = WebLiberator.MenuButtonId;
      this.menuButtonElement.title = this.strings.scriptTitle;
      this.menuButtonElement.innerHTML = `<img src="${WebLiberator.ScriptIconUrl}" alt="Icon">`;
      this.menuButtonElement.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });
      this.menuButtonElement.dataset.listenerAttached = "true";
      document.body.appendChild(this.menuButtonElement);
      this.updateMenuStatus();
    }

    updateMenuStatus() {
      const button =
        this.menuButtonElement ||
        document.getElementById(WebLiberator.MenuButtonId);
      if (!button) return;
      if (!this.menuButtonElement) this.menuButtonElement = button;
      const isActive = this.isActive;
      const isLightMode = window.matchMedia?.(
        "(prefers-color-scheme: light)"
      ).matches;
      const iconImg = button.querySelector("img");
      let buttonBgColor,
        iconOpacity,
        buttonOpacity = "0.7";
      if (isActive) {
        buttonBgColor = isLightMode
          ? "rgba(52, 199, 89, 0.8)"
          : "rgba(48, 209, 88, 0.8)";
        iconOpacity = "0.95";
        buttonOpacity = "1";
      } else {
        buttonBgColor = isLightMode
          ? "var(--wl-menu-bg-light)"
          : "var(--wl-menu-bg-dark)";
        iconOpacity = isLightMode ? "0.8" : "0.7";
      }
      button.style.backgroundColor = buttonBgColor;
      button.style.opacity = buttonOpacity;
      if (iconImg) iconImg.style.opacity = iconOpacity;
    }

    showNotification(messageKey) {
      if (this.notificationTimer) clearTimeout(this.notificationTimer);
      if (this.removalTimer) clearTimeout(this.removalTimer);
      this.notificationTimer = null;
      this.removalTimer = null;
      const title = this.strings.scriptTitle;
      const message = this.strings[messageKey] || messageKey;
      const displayNotification = () => {
        let notificationElement = document.getElementById(
          WebLiberator.NotificationId
        );
        if (!notificationElement && document.body) {
          notificationElement = document.createElement("div");
          notificationElement.id = WebLiberator.NotificationId;
          notificationElement.innerHTML =
            `<img src="${WebLiberator.ScriptIconUrl}" alt="Icon" class="wl-icon"><div class="wl-content"><div class="wl-title"></div><div class="wl-message"></div></div>`.trim();
          document.body.appendChild(notificationElement);
        } else if (!notificationElement) return;
        const titleElement = notificationElement.querySelector(".wl-title");
        const messageElement = notificationElement.querySelector(".wl-message");
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        notificationElement.classList.remove("visible");
        void notificationElement.offsetWidth;
        requestAnimationFrame(() => {
          const currentElement = document.getElementById(
            WebLiberator.NotificationId
          );
          if (currentElement) {
            setTimeout(() => {
              if (document.getElementById(WebLiberator.NotificationId)) {
                currentElement.classList.add("visible");
              }
            }, 20);
          }
        });
        this.notificationTimer = setTimeout(() => {
          const currentElement = document.getElementById(
            WebLiberator.NotificationId
          );
          if (currentElement) {
            currentElement.classList.remove("visible");
            this.removalTimer = setTimeout(() => {
              document.getElementById(WebLiberator.NotificationId)?.remove();
              this.notificationTimer = null;
              this.removalTimer = null;
            }, WebLiberator.AnimationDuration);
          } else {
            this.notificationTimer = null;
            this.removalTimer = null;
          }
        }, WebLiberator.NotificationTimeout);
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", displayNotification, {
          once: true,
        });
      } else {
        displayNotification();
      }
    }

    stopImmediatePropagationHandler(event) {
      event.stopImmediatePropagation();
    }

    bindGlobalEventHijackers() {
      WebLiberator.EventsToStop.forEach((type) => {
        document.addEventListener(type, this.boundStopHandler, {
          capture: true,
          passive: false,
        });
      });
    }

    unbindGlobalEventHijackers() {
      WebLiberator.EventsToStop.forEach((type) => {
        document.removeEventListener(type, this.boundStopHandler, {
          capture: true,
        });
      });
    }

    processExistingNodes(rootNode) {
      if (!this.isActive || !rootNode) return;
      this.clearHandlersRecursive(rootNode);
    }

    clearSingleElementHandlers(element) {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
      for (const prop of WebLiberator.InlineEventPropsToClear) {
        if (
          prop in element &&
          (typeof element[prop] === "function" || element[prop] !== null)
        ) {
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
      if (!this.isActive || !rootNode) return;
      try {
        if (rootNode.nodeType === Node.ELEMENT_NODE) {
          if (
            rootNode.id !== WebLiberator.MenuButtonId &&
            rootNode.id !== WebLiberator.NotificationId
          ) {
            this.clearSingleElementHandlers(rootNode);
          }
          if (rootNode.shadowRoot?.mode === "open")
            this.clearHandlersRecursive(rootNode.shadowRoot);
        }
        const elements = rootNode.querySelectorAll?.("*");
        if (elements) {
          for (const element of elements) {
            if (
              element.id !== WebLiberator.MenuButtonId &&
              element.id !== WebLiberator.NotificationId &&
              !element.closest(`#${WebLiberator.MenuButtonId}`) &&
              !element.closest(`#${WebLiberator.NotificationId}`)
            ) {
              this.clearSingleElementHandlers(element);
              if (element.shadowRoot?.mode === "open")
                this.clearHandlersRecursive(element.shadowRoot);
            }
          }
        }
      } catch (error) {}
    }

    handleMutation(mutations) {
      if (!this.isActive) return;
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.id !== WebLiberator.MenuButtonId &&
                node.id !== WebLiberator.NotificationId &&
                !node.closest(`#${WebLiberator.MenuButtonId}`) &&
                !node.closest(`#${WebLiberator.NotificationId}`)
              ) {
                this.clearSingleElementHandlers(node);
              }
            }
          }
        }
      }
    }

    initMutationObserver() {
      if (this.observer || !document.documentElement) return;
      const observerOptions = { childList: true, subtree: true };
      this.observer = new MutationObserver(this.handleMutation.bind(this));
      try {
        this.observer.observe(document.documentElement, observerOptions);
      } catch (error) {
        this.observer = null;
      }
    }

    disconnectMutationObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }

    updateMenuCommand() {
      if (this.menuCommandId) {
        try {
          GM_unregisterMenuCommand(this.menuCommandId);
        } catch (e) {}
        this.menuCommandId = null;
      }
      const label = this.isActive
        ? this.strings.stateEnabledText
        : this.strings.stateDisabledText;
      const fallbackLabel = this.isActive
        ? "Liberator Activated ✅"
        : "Liberator Deactivated ❌";
      const commandLabel = label || fallbackLabel;
      try {
        this.menuCommandId = GM_registerMenuCommand(commandLabel, () => {
          this.toggle();
        });
      } catch (e) {
        this.menuCommandId = null;
      }
    }
  }

  if (window.self !== window.top) {
    return;
  }

  try {
    const liberator = new WebLiberator();
    liberator.injectBaseStyles();
    liberator.loadState();
    liberator.updateMenuCommand();

    const debouncedToggle = debounce(() => liberator.toggle(), 200);

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.altKey &&
          event.code === "KeyL"
        ) {
          event.preventDefault();
          event.stopPropagation();
          debouncedToggle();
        }
      },
      { capture: true }
    );

    const onDOMContentLoaded = () => {
      liberator.ensureElementsCreated();
      if (liberator.isActive) {
        liberator.activate();
      } else {
        liberator.updateMenuStatus();
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDOMContentLoaded, {
        once: true,
      });
    } else {
      onDOMContentLoaded();
    }
  } catch (error) {}
})();
