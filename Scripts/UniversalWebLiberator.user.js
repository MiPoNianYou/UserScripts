// ==UserScript==
// @name               Universal Web Liberator
// @name:zh-CN         网页枷锁破除
// @name:zh-TW         網頁枷鎖破除
// @description        Disable webpage restrictions on Right-Click / Selection / Copy / Drag | Restore a seamless interactive experience | Tap the dynamic indicator in the bottom-right corner | Use the shortcut Meta/Ctrl+Alt+L | Toggle state via the userscript menu
// @description:zh-CN  解除网页右键菜单/选择文本/拷贝粘贴/拖拽内容限制 恢复自由交互体验 轻点右下角灵动指示器 | 使用快捷键 Meta/Ctrl+Alt+L | 油猴菜单切换状态
// @description:zh-TW  解除網頁右鍵選單/選取文字/複製貼上/拖曳內容限制 恢復自由互動體驗 輕點右下角靈動指示器 | 使用快捷鍵 Meta/Ctrl+Alt+L | 油猴選單切換狀態
// @version            1.4.0
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

  const SCRIPT_SETTINGS = {
    DEFAULT_ACTIVATION_STATE: false,
    UI_FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    ANIMATION_DURATION_MS: 300,
    NOTIFICATION_VISIBILITY_DURATION_MS: 2000,
    INDICATOR_EXPANDED_DURATION_MS: 2000,
    STATE_TOGGLE_DEBOUNCE_MS: 200,
  };

  const RESTRICTION_OVERRIDES = {
    EVENTS_TO_INTERCEPT: [
      "contextmenu",
      "selectstart",
      "copy",
      "cut",
      "paste",
      "drag",
      "dragstart",
    ],
    INLINE_HANDLER_ATTRIBUTES_TO_CLEAR: [
      "onmousedown",
      "oncontextmenu",
      "onselect",
      "onselectstart",
      "oncopy",
      "oncut",
      "onpaste",
      "onbeforecopy",
      "onbeforecut",
      "onbeforepaste",
      "ondrag",
      "ondragstart",
    ],
  };

  const ELEMENT_IDS = {
    STATUS_NOTIFICATION: "WebLiberatorStatusNotification",
    EDGE_INDICATOR: "WebLiberatorEdgeIndicator",
    OVERRIDE_STYLE_SHEET: "WebLiberatorOverrideStyleSheet",
  };

  const CSS_CLASSES = {
    STATUS_NOTIFICATION_VISIBLE: "wl-status-notification--visible",
    STATUS_NOTIFICATION_ICON: "wl-status-notification-icon",
    STATUS_NOTIFICATION_CONTENT: "wl-status-notification-content",
    STATUS_NOTIFICATION_TITLE: "wl-status-notification-title",
    STATUS_NOTIFICATION_MESSAGE: "wl-status-notification-message",
    EDGE_INDICATOR_EXPANDED: "wl-edge-indicator--expanded",
    EDGE_INDICATOR_ACTIVE: "wl-edge-indicator--active",
  };

  const STORAGE_KEYS = {
    ACTIVATION_STATE_PREFIX: "webLiberator_state_",
    STATE_ENABLED_VALUE: "enabled",
    STATE_DISABLED_VALUE: "disabled",
  };

  const UI_TEXTS = {
    "zh-CN": {
      SCRIPT_TITLE: "网页枷锁破除",
      STATUS_ENABLED: "脚本已启用 ✅",
      STATUS_DISABLED: "脚本已禁用 ❌",
    },
    "zh-TW": {
      SCRIPT_TITLE: "網頁枷鎖破除",
      STATUS_ENABLED: "腳本已啟用 ✅",
      STATUS_DISABLED: "腳本已禁用 ❌",
    },
    "en-US": {
      SCRIPT_TITLE: "Universal Web Liberator",
      STATUS_ENABLED: "Liberator Activated ✅",
      STATUS_DISABLED: "Liberator Deactivated ❌",
    },
  };

  const SVG_ICON_MARKUP = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 125.834 145.398">
      <path d="M103.957 43.1334L103.957 102.362C103.957 112.616 98.9276 117.694 88.8202 117.694L36.9647 117.694C26.8573 117.694 21.828 112.616 21.828 102.362L21.828 67.3947C23.9408 69.2087 26.911 69.8726 29.6893 69.0624L29.6893 102.264C29.6893 107.147 32.2772 109.833 37.3554 109.833L88.4784 109.833C93.5077 109.833 96.0956 107.147 96.0956 102.264L96.0956 43.2311C96.0956 38.3482 93.5077 35.6627 88.4296 35.6627L44.2584 35.6627C44.1673 33.7229 43.3799 31.757 41.7499 30.0963L39.5161 27.8014L88.8202 27.8014C98.9276 27.8014 103.957 32.8795 103.957 43.1334Z" fill="currentColor"/>
      <path d="M83.3026 91.9127C83.3026 93.5728 82.0331 94.8424 80.2753 94.8424L44.3378 94.8424C42.58 94.8424 41.2616 93.5728 41.2616 91.9127C41.2616 90.2037 42.58 88.8365 44.3378 88.8365L80.2753 88.8365C82.0331 88.8365 83.3026 90.2037 83.3026 91.9127Z" fill="currentColor"/>
      <path d="M83.3026 72.6744C83.3026 74.3834 82.0331 75.7506 80.2753 75.7506L44.3378 75.7506C42.58 75.7506 41.2616 74.3834 41.2616 72.6744C41.2616 71.0143 42.58 69.7447 44.3378 69.7447L80.2753 69.7447C82.0331 69.7447 83.3026 71.0143 83.3026 72.6744Z" fill="currentColor"/>
      <path d="M83.3026 53.5826C83.3026 55.2916 82.0331 56.61 80.2753 56.61L44.3378 56.61C42.58 56.61 41.2616 55.2916 41.2616 53.5826C41.2616 51.9225 42.58 50.6041 44.3378 50.6041L80.2753 50.6041C82.0331 50.6041 83.3026 51.9225 83.3026 53.5826Z" fill="currentColor"/>
      <path d="M6.64247 47.5768C6.59365 49.4322 8.83974 50.067 10.0604 48.8463L17.5311 41.3756L25.6854 61.5904C26.0761 62.5182 27.0526 62.9576 27.9315 62.6158L32.8143 60.6627C33.6933 60.2721 34.0351 59.2467 33.5956 58.3189L25.0018 38.4459L35.4999 38.0064C37.3554 37.9088 38.2831 36.151 36.9159 34.735L10.2558 7.29355C9.03505 6.07285 7.13075 6.75644 7.08193 8.56308Z" fill="currentColor"/>
    </svg>`.trim();

  let isScriptActive = SCRIPT_SETTINGS.DEFAULT_ACTIVATION_STATE;
  let currentLocale = "en-US";
  let localizedStrings = UI_TEXTS["en-US"];
  let userScriptMenuCommandId = null;
  let overrideStyleSheetElement = null;
  let edgeIndicatorElement = null;
  let domMutationObserver = null;
  let statusNotificationTimer = null;
  let statusNotificationRemovalTimer = null;
  let indicatorCollapseTimer = null;
  const pageOrigin = window.location.origin;

  function injectCoreUIStyles() {
    const appleEaseOutQuint = "cubic-bezier(0.23, 1, 0.32, 1)";
    const appleEaseOutStandard = "cubic-bezier(0, 0, 0.58, 1)";
    const animationDuration = SCRIPT_SETTINGS.ANIMATION_DURATION_MS;
    const indicatorTransitionDuration = "0.25s";
    const iconTransitionDuration = "0.2s";
    const iconTransitionDelay = "0.1s";

    const baseCSS = `
        :root {
          --ctp-frappe-rosewater: #f2d5cf;
          --ctp-frappe-flamingo: #eebebe;
          --ctp-frappe-pink: #f4b8e4;
          --ctp-frappe-mauve: #ca9ee6;
          --ctp-frappe-red: #e78284;
          --ctp-frappe-maroon: #ea999c;
          --ctp-frappe-peach: #ef9f76;
          --ctp-frappe-yellow: #e5c890;
          --ctp-frappe-green: #a6d189;
          --ctp-frappe-teal: #81c8be;
          --ctp-frappe-sky: #99d1db;
          --ctp-frappe-sapphire: #85c1dc;
          --ctp-frappe-blue: #8caaee;
          --ctp-frappe-lavender: #babbf1;
          --ctp-frappe-text: #c6d0f5;
          --ctp-frappe-subtext1: #b5bfe2;
          --ctp-frappe-subtext0: #a5adce;
          --ctp-frappe-overlay2: #949cbb;
          --ctp-frappe-overlay1: #838ba7;
          --ctp-frappe-overlay0: #737994;
          --ctp-frappe-surface2: #626880;
          --ctp-frappe-surface1: #51576d;
          --ctp-frappe-surface0: #414559;
          --ctp-frappe-base: #303446;
          --ctp-frappe-mantle: #292c3c;
          --ctp-frappe-crust: #232634;

          --ctp-latte-rosewater: #dc8a78;
          --ctp-latte-flamingo: #dd7878;
          --ctp-latte-pink: #ea76cb;
          --ctp-latte-mauve: #8839ef;
          --ctp-latte-red: #d20f39;
          --ctp-latte-maroon: #e64553;
          --ctp-latte-peach: #fe640b;
          --ctp-latte-yellow: #df8e1d;
          --ctp-latte-green: #40a02b;
          --ctp-latte-teal: #179299;
          --ctp-latte-sky: #04a5e5;
          --ctp-latte-sapphire: #209fb5;
          --ctp-latte-blue: #1e66f5;
          --ctp-latte-lavender: #7287fd;
          --ctp-latte-text: #4c4f69;
          --ctp-latte-subtext1: #5c5f77;
          --ctp-latte-subtext0: #6c6f85;
          --ctp-latte-overlay2: #7c7f93;
          --ctp-latte-overlay1: #8c8fa1;
          --ctp-latte-overlay0: #9ca0b0;
          --ctp-latte-surface2: #acb0be;
          --ctp-latte-surface1: #bcc0cc;
          --ctp-latte-surface0: #ccd0da;
          --ctp-latte-base: #eff1f5;
          --ctp-latte-mantle: #e6e9ef;
          --ctp-latte-crust: #dce0e8;

          --wl-notify-bg-dark: rgba(48, 52, 70, 0.88);
          --wl-notify-text-dark: var(--ctp-frappe-text);
          --wl-notify-title-dark: var(--ctp-frappe-text);
          --wl-indicator-bg-dark: rgba(65, 69, 89, 0.3);
          --wl-indicator-hover-bg-dark: rgba(81, 87, 109, 0.5);
          --wl-indicator-expanded-bg-dark: rgba(48, 52, 70, 0.85);
          --wl-indicator-active-bg-dark: rgba(166, 209, 137, 0.88);
          --wl-border-dark: rgba(98, 104, 128, 0.2);
          --wl-icon-color-dark: var(--ctp-frappe-text);
          --wl-icon-active-color-dark: var(--ctp-frappe-crust);

          --wl-notify-bg-light: rgba(239, 241, 245, 0.88);
          --wl-notify-text-light: var(--ctp-latte-text);
          --wl-notify-title-light: var(--ctp-latte-text);
          --wl-indicator-bg-light: rgba(204, 208, 218, 0.3);
          --wl-indicator-hover-bg-light: rgba(188, 192, 204, 0.5);
          --wl-indicator-expanded-bg-light: rgba(239, 241, 245, 0.85);
          --wl-indicator-active-bg-light: rgba(64, 160, 43, 0.88);
          --wl-border-light: rgba(172, 176, 190, 0.2);
          --wl-icon-color-light: var(--ctp-latte-text);
          --wl-icon-active-color-light: var(--ctp-latte-base);

          --wl-shadow-dark:
            0 1px 3px rgba(0, 0, 0, 0.15),
            0 8px 15px rgba(0, 0, 0, 0.25);
          --wl-shadow-light:
            0 1px 3px rgba(90, 90, 90, 0.08),
            0 8px 15px rgba(90, 90, 90, 0.12);
        }
        #${ELEMENT_IDS.STATUS_NOTIFICATION} {
          position: fixed;
          top: 20px;
          right: -400px;
          z-index: 2147483646;
          display: flex;
          align-items: center;
          width: 310px;
          padding: 14px 18px;
          border: 1px solid var(--wl-border-dark);
          border-radius: 14px;
          background-color: var(--wl-notify-bg-dark);
          color: var(--wl-notify-text-dark);
          box-shadow: var(--wl-shadow-dark);
          box-sizing: border-box;
          opacity: 0;
          font-family: ${SCRIPT_SETTINGS.UI_FONT_STACK};
          text-align: left;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          transition: right ${animationDuration}ms ${appleEaseOutQuint},
                      opacity ${animationDuration * 0.8}ms ${appleEaseOutQuint};
        }
        #${ELEMENT_IDS.STATUS_NOTIFICATION}.${
      CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
    } {
          right: 20px;
          opacity: 1;
        }
        #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_ICON
    } {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          margin-right: 14px;
          flex-shrink: 0;
          color: var(--wl-icon-color-dark);
        }
        #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_ICON
    } svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_CONTENT
    } {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0;
        }
        #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_TITLE
    } {
          margin-bottom: 4px;
          color: var(--wl-notify-title-dark);
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE
    } {
          color: var(--wl-notify-text-dark);
          font-size: 13px;
          line-height: 1.45;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        #${ELEMENT_IDS.EDGE_INDICATOR} {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--wl-indicator-bg-dark);
          color: var(--wl-icon-color-dark);
          opacity: 0.4;
          overflow: hidden;
          cursor: pointer;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          transition: width ${indicatorTransitionDuration} ${appleEaseOutStandard},
                      height ${indicatorTransitionDuration} ${appleEaseOutStandard},
                      opacity ${indicatorTransitionDuration} ${appleEaseOutStandard},
                      background-color ${indicatorTransitionDuration} ${appleEaseOutStandard},
                      color ${indicatorTransitionDuration} ${appleEaseOutStandard},
                      backdrop-filter ${indicatorTransitionDuration} ${appleEaseOutStandard},
                      box-shadow ${indicatorTransitionDuration} ${appleEaseOutStandard},
                      transform ${iconTransitionDuration} ${appleEaseOutStandard};
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        #${ELEMENT_IDS.EDGE_INDICATOR}:hover {
          background-color: var(--wl-indicator-hover-bg-dark);
          opacity: 0.8;
          transform: scale(1.1);
        }
        #${ELEMENT_IDS.EDGE_INDICATOR}.${
      CSS_CLASSES.EDGE_INDICATOR_ACTIVE
    }:not(.${CSS_CLASSES.EDGE_INDICATOR_EXPANDED}) {
           background-color: var(--wl-indicator-active-bg-dark);
           opacity: 0.6;
        }
        #${ELEMENT_IDS.EDGE_INDICATOR}.${CSS_CLASSES.EDGE_INDICATOR_EXPANDED} {
          width: 44px;
          height: 44px;
          border: 1px solid var(--wl-border-dark);
          background-color: var(--wl-indicator-expanded-bg-dark);
          box-shadow: var(--wl-shadow-dark);
          opacity: 1;
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          transform: scale(1);
        }
         #${ELEMENT_IDS.EDGE_INDICATOR}.${
      CSS_CLASSES.EDGE_INDICATOR_EXPANDED
    }:hover {
            transform: scale(1.08);
         }
        #${ELEMENT_IDS.EDGE_INDICATOR}.${CSS_CLASSES.EDGE_INDICATOR_EXPANDED}.${
      CSS_CLASSES.EDGE_INDICATOR_ACTIVE
    } {
          background-color: var(--wl-indicator-active-bg-dark);
          color: var(--wl-icon-active-color-dark);
        }
        #${ELEMENT_IDS.EDGE_INDICATOR} svg {
          display: block;
          width: 22px;
          height: 22px;
          opacity: 0;
          transform: scale(0.5);
          transition: opacity ${iconTransitionDuration} ${appleEaseOutStandard} ${iconTransitionDelay},
                      transform ${iconTransitionDuration} ${appleEaseOutStandard} ${iconTransitionDelay};
          pointer-events: none;
        }
        #${ELEMENT_IDS.EDGE_INDICATOR}.${
      CSS_CLASSES.EDGE_INDICATOR_EXPANDED
    } svg {
          opacity: 1;
          transform: scale(1);
        }
        @media (prefers-color-scheme: light) {
          #${ELEMENT_IDS.STATUS_NOTIFICATION} {
            border: 1px solid var(--wl-border-light);
            background-color: var(--wl-notify-bg-light);
            color: var(--wl-notify-text-light);
            box-shadow: var(--wl-shadow-light);
          }
           #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_ICON
    } {
             color: var(--wl-icon-color-light);
           }
          #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_TITLE
    } {
            color: var(--wl-notify-title-light);
          }
          #${ELEMENT_IDS.STATUS_NOTIFICATION} .${
      CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE
    } {
            color: var(--wl-notify-text-light);
          }
          #${ELEMENT_IDS.EDGE_INDICATOR} {
            background-color: var(--wl-indicator-bg-light);
            color: var(--wl-icon-color-light);
          }
          #${ELEMENT_IDS.EDGE_INDICATOR}:hover {
             background-color: var(--wl-indicator-hover-bg-light);
          }
          #${ELEMENT_IDS.EDGE_INDICATOR}.${
      CSS_CLASSES.EDGE_INDICATOR_ACTIVE
    }:not(.${CSS_CLASSES.EDGE_INDICATOR_EXPANDED}) {
             background-color: var(--wl-indicator-active-bg-light);
             opacity: 0.6;
          }
           #${ELEMENT_IDS.EDGE_INDICATOR}.${
      CSS_CLASSES.EDGE_INDICATOR_EXPANDED
    } {
            border: 1px solid var(--wl-border-light);
            background-color: var(--wl-indicator-expanded-bg-light);
            box-shadow: var(--wl-shadow-light);
           }
           #${ELEMENT_IDS.EDGE_INDICATOR}.${
      CSS_CLASSES.EDGE_INDICATOR_EXPANDED
    }.${CSS_CLASSES.EDGE_INDICATOR_ACTIVE} {
            background-color: var(--wl-indicator-active-bg-light);
            color: var(--wl-icon-active-color-light);
           }
        }
      `;
    try {
      GM_addStyle(baseCSS);
    } catch (e) {}
  }

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

  function getActivationStateStorageKey() {
    const origin = String(pageOrigin || "").replace(/\/$/, "");
    return `${STORAGE_KEYS.ACTIVATION_STATE_PREFIX}${origin}`;
  }

  function loadActivationState() {
    const storageKey = getActivationStateStorageKey();
    const defaultStateString = SCRIPT_SETTINGS.DEFAULT_ACTIVATION_STATE
      ? STORAGE_KEYS.STATE_ENABLED_VALUE
      : STORAGE_KEYS.STATE_DISABLED_VALUE;
    let storedValue = defaultStateString;
    try {
      storedValue = GM_getValue(storageKey, defaultStateString);
    } catch (e) {}
    if (
      storedValue !== STORAGE_KEYS.STATE_ENABLED_VALUE &&
      storedValue !== STORAGE_KEYS.STATE_DISABLED_VALUE
    ) {
      storedValue = defaultStateString;
    }
    isScriptActive = storedValue === STORAGE_KEYS.STATE_ENABLED_VALUE;
  }

  function saveActivationState() {
    const storageKey = getActivationStateStorageKey();
    const valueToStore = isScriptActive
      ? STORAGE_KEYS.STATE_ENABLED_VALUE
      : STORAGE_KEYS.STATE_DISABLED_VALUE;
    try {
      GM_setValue(storageKey, valueToStore);
    } catch (e) {}
  }

  function stopPropagationHandler(event) {
    event.stopImmediatePropagation();
  }

  function registerEventInterceptors() {
    RESTRICTION_OVERRIDES.EVENTS_TO_INTERCEPT.forEach((type) => {
      document.addEventListener(type, stopPropagationHandler, {
        capture: true,
        passive: false,
      });
    });
  }

  function unregisterEventInterceptors() {
    RESTRICTION_OVERRIDES.EVENTS_TO_INTERCEPT.forEach((type) => {
      document.removeEventListener(type, stopPropagationHandler, {
        capture: true,
      });
    });
  }

  function injectRestrictionOverrideStyles() {
    if (
      overrideStyleSheetElement ||
      document.getElementById(ELEMENT_IDS.OVERRIDE_STYLE_SHEET)
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
    overrideStyleSheetElement = document.createElement("style");
    overrideStyleSheetElement.id = ELEMENT_IDS.OVERRIDE_STYLE_SHEET;
    overrideStyleSheetElement.textContent = css;
    (document.head || document.documentElement).appendChild(
      overrideStyleSheetElement
    );
  }

  function removeRestrictionOverrideStyles() {
    overrideStyleSheetElement?.remove();
    overrideStyleSheetElement = null;
    document.getElementById(ELEMENT_IDS.OVERRIDE_STYLE_SHEET)?.remove();
  }

  function clearElementInlineHandlers(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    for (const prop of RESTRICTION_OVERRIDES.INLINE_HANDLER_ATTRIBUTES_TO_CLEAR) {
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

  function clearInlineHandlersRecursively(rootNode) {
    if (!isScriptActive || !rootNode) return;
    try {
      if (rootNode.nodeType === Node.ELEMENT_NODE) {
        if (
          rootNode.id !== ELEMENT_IDS.EDGE_INDICATOR &&
          rootNode.id !== ELEMENT_IDS.STATUS_NOTIFICATION
        ) {
          clearElementInlineHandlers(rootNode);
        }
        if (rootNode.shadowRoot?.mode === "open")
          clearInlineHandlersRecursively(rootNode.shadowRoot);
      }
      const elements = rootNode.querySelectorAll?.("*");
      if (elements) {
        for (const element of elements) {
          if (
            element.id !== ELEMENT_IDS.EDGE_INDICATOR &&
            element.id !== ELEMENT_IDS.STATUS_NOTIFICATION &&
            !element.closest(`#${ELEMENT_IDS.EDGE_INDICATOR}`) &&
            !element.closest(`#${ELEMENT_IDS.STATUS_NOTIFICATION}`)
          ) {
            clearElementInlineHandlers(element);
            if (element.shadowRoot?.mode === "open")
              clearInlineHandlersRecursively(element.shadowRoot);
          }
        }
      }
    } catch (error) {}
  }

  function handleDOMMutation(mutations) {
    if (!isScriptActive) return;
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (
              node.id !== ELEMENT_IDS.EDGE_INDICATOR &&
              node.id !== ELEMENT_IDS.STATUS_NOTIFICATION &&
              !node.closest(`#${ELEMENT_IDS.EDGE_INDICATOR}`) &&
              !node.closest(`#${ELEMENT_IDS.STATUS_NOTIFICATION}`)
            ) {
              clearElementInlineHandlers(node);
              clearInlineHandlersRecursively(node);
            }
          }
        }
      }
    }
  }

  function initializeDOMObserver() {
    if (domMutationObserver || !document.documentElement) return;
    const observerOptions = { childList: true, subtree: true };
    domMutationObserver = new MutationObserver(handleDOMMutation);
    try {
      domMutationObserver.observe(document.documentElement, observerOptions);
    } catch (error) {
      domMutationObserver = null;
    }
  }

  function disconnectDOMObserver() {
    if (domMutationObserver) {
      domMutationObserver.disconnect();
      domMutationObserver = null;
    }
  }

  function activateRestrictionOverrides() {
    if (isScriptActive) return;
    isScriptActive = true;
    injectRestrictionOverrideStyles();
    registerEventInterceptors();
    clearInlineHandlersRecursively(document.documentElement);
    initializeDOMObserver();
  }

  function deactivateRestrictionOverrides() {
    if (!isScriptActive) return;
    isScriptActive = false;
    removeRestrictionOverrideStyles();
    unregisterEventInterceptors();
    disconnectDOMObserver();
  }

  function displayStatusNotification(messageKey) {
    if (statusNotificationTimer) clearTimeout(statusNotificationTimer);
    if (statusNotificationRemovalTimer)
      clearTimeout(statusNotificationRemovalTimer);
    statusNotificationTimer = null;
    statusNotificationRemovalTimer = null;

    const title = localizedStrings.SCRIPT_TITLE;
    const message = localizedStrings[messageKey] || messageKey;

    const renderNotification = () => {
      let notificationElement = document.getElementById(
        ELEMENT_IDS.STATUS_NOTIFICATION
      );
      if (!notificationElement && document.body) {
        notificationElement = document.createElement("div");
        notificationElement.id = ELEMENT_IDS.STATUS_NOTIFICATION;
        notificationElement.innerHTML = `
          <div class="${CSS_CLASSES.STATUS_NOTIFICATION_ICON}">${SVG_ICON_MARKUP}</div>
          <div class="${CSS_CLASSES.STATUS_NOTIFICATION_CONTENT}">
            <div class="${CSS_CLASSES.STATUS_NOTIFICATION_TITLE}"></div>
            <div class="${CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE}"></div>
          </div>`.trim();
        document.body.appendChild(notificationElement);
      } else if (!notificationElement) return;

      const titleElement = notificationElement.querySelector(
        `.${CSS_CLASSES.STATUS_NOTIFICATION_TITLE}`
      );
      const messageElement = notificationElement.querySelector(
        `.${CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE}`
      );
      if (titleElement) titleElement.textContent = title;
      if (messageElement) messageElement.textContent = message;

      notificationElement.classList.remove(
        CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
      );
      void notificationElement.offsetWidth;

      requestAnimationFrame(() => {
        const currentElement = document.getElementById(
          ELEMENT_IDS.STATUS_NOTIFICATION
        );
        if (currentElement) {
          setTimeout(() => {
            if (document.getElementById(ELEMENT_IDS.STATUS_NOTIFICATION)) {
              currentElement.classList.add(
                CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
              );
            }
          }, 20);
        }
      });

      statusNotificationTimer = setTimeout(() => {
        const currentElement = document.getElementById(
          ELEMENT_IDS.STATUS_NOTIFICATION
        );
        if (currentElement) {
          currentElement.classList.remove(
            CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
          );
          statusNotificationRemovalTimer = setTimeout(() => {
            document.getElementById(ELEMENT_IDS.STATUS_NOTIFICATION)?.remove();
            statusNotificationTimer = null;
            statusNotificationRemovalTimer = null;
          }, SCRIPT_SETTINGS.ANIMATION_DURATION_MS);
        } else {
          statusNotificationTimer = null;
          statusNotificationRemovalTimer = null;
        }
      }, SCRIPT_SETTINGS.NOTIFICATION_VISIBILITY_DURATION_MS);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderNotification, {
        once: true,
      });
    } else {
      renderNotification();
    }
  }

  function updateUserScriptMenuCommand() {
    if (userScriptMenuCommandId) {
      try {
        GM_unregisterMenuCommand(userScriptMenuCommandId);
      } catch (e) {}
      userScriptMenuCommandId = null;
    }
    const label = isScriptActive
      ? localizedStrings.STATUS_ENABLED
      : localizedStrings.STATUS_DISABLED;
    const fallbackLabel = isScriptActive
      ? UI_TEXTS["en-US"].STATUS_ENABLED
      : UI_TEXTS["en-US"].STATUS_DISABLED;
    const commandLabel = label || fallbackLabel;
    try {
      userScriptMenuCommandId = GM_registerMenuCommand(
        commandLabel,
        toggleActivationState
      );
    } catch (e) {
      userScriptMenuCommandId = null;
    }
  }

  function handleEdgeIndicatorClick(event) {
    event.stopPropagation();
    clearTimeout(indicatorCollapseTimer);

    toggleActivationState();

    const indicator =
      edgeIndicatorElement ||
      document.getElementById(ELEMENT_IDS.EDGE_INDICATOR);
    if (!indicator) return;

    indicator.classList.remove(CSS_CLASSES.EDGE_INDICATOR_EXPANDED);
    void indicator.offsetWidth;

    indicator.classList.add(CSS_CLASSES.EDGE_INDICATOR_EXPANDED);

    indicatorCollapseTimer = setTimeout(() => {
      indicator.classList.remove(CSS_CLASSES.EDGE_INDICATOR_EXPANDED);
      indicatorCollapseTimer = null;
    }, SCRIPT_SETTINGS.INDICATOR_EXPANDED_DURATION_MS);
  }

  function createEdgeIndicator() {
    if (!document.body || document.getElementById(ELEMENT_IDS.EDGE_INDICATOR))
      return;
    edgeIndicatorElement = document.createElement("div");
    edgeIndicatorElement.id = ELEMENT_IDS.EDGE_INDICATOR;
    edgeIndicatorElement.title = localizedStrings.SCRIPT_TITLE;
    edgeIndicatorElement.innerHTML = SVG_ICON_MARKUP;
    edgeIndicatorElement.addEventListener("click", handleEdgeIndicatorClick);
    edgeIndicatorElement.dataset.listenerAttached = "true";
    document.body.appendChild(edgeIndicatorElement);
  }

  function updateEdgeIndicatorPersistentState() {
    const indicator =
      edgeIndicatorElement ||
      document.getElementById(ELEMENT_IDS.EDGE_INDICATOR);
    if (indicator) {
      indicator.classList.toggle(
        CSS_CLASSES.EDGE_INDICATOR_ACTIVE,
        isScriptActive
      );
    }
  }

  function ensureEdgeIndicatorExists() {
    if (edgeIndicatorElement && document.body?.contains(edgeIndicatorElement)) {
      return;
    }
    let existingIndicator = document.getElementById(ELEMENT_IDS.EDGE_INDICATOR);
    if (existingIndicator) {
      edgeIndicatorElement = existingIndicator;
      if (!edgeIndicatorElement.dataset.listenerAttached) {
        edgeIndicatorElement.addEventListener(
          "click",
          handleEdgeIndicatorClick
        );
        edgeIndicatorElement.dataset.listenerAttached = "true";
      }
      return;
    }
    if (document.body) {
      createEdgeIndicator();
    } else {
      document.addEventListener("DOMContentLoaded", createEdgeIndicator, {
        once: true,
      });
    }
  }

  function toggleActivationState() {
    const wasActive = isScriptActive;
    if (wasActive) {
      deactivateRestrictionOverrides();
      displayStatusNotification("STATUS_DISABLED");
    } else {
      activateRestrictionOverrides();
      displayStatusNotification("STATUS_ENABLED");
    }
    saveActivationState();
    updateUserScriptMenuCommand();
    updateEdgeIndicatorPersistentState();
  }

  const debouncedToggleActivationState = debounce(
    toggleActivationState,
    SCRIPT_SETTINGS.STATE_TOGGLE_DEBOUNCE_MS
  );

  function handleKeyboardShortcut(event) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.altKey &&
      event.code === "KeyL"
    ) {
      event.preventDefault();
      event.stopPropagation();
      debouncedToggleActivationState();
    }
  }

  function initializeScript() {
    ensureEdgeIndicatorExists();
    updateEdgeIndicatorPersistentState();
    if (isScriptActive) {
      activateRestrictionOverrides();
    }
  }

  if (window.self === window.top) {
    try {
      injectCoreUIStyles();
      currentLocale = detectUserLanguage();
      localizedStrings = UI_TEXTS[currentLocale] || UI_TEXTS["en-US"];
      loadActivationState();
      updateUserScriptMenuCommand();
      document.addEventListener("keydown", handleKeyboardShortcut, {
        capture: true,
      });

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeScript, {
          once: true,
        });
      } else {
        initializeScript();
      }
    } catch (error) {}
  }
})();
