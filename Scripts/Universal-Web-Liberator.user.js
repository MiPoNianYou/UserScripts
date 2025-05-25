// ==UserScript==
// @name               Universal Web Liberator
// @name:zh-CN         网页枷锁破除
// @name:zh-TW         網頁枷鎖破除
// @description        Disable webpage restrictions on Right-Click / Selection / Copy / Drag | Restore a seamless interactive experience | Tap the dynamic indicator in the bottom-right corner | Use the shortcut Meta/Ctrl+Alt+L | Toggle state via the userscript menu
// @description:zh-CN  解除网页右键菜单/选择文本/拷贝粘贴/拖拽内容限制 恢复自由交互体验 轻点右下角灵动指示器 | 使用快捷键 Meta/Ctrl+Alt+L | 油猴菜单切换状态
// @description:zh-TW  解除網頁右鍵選單/選取文字/複製貼上/拖曳內容限制 恢復自由互動體驗 輕點右下角靈動指示器 | 使用快捷鍵 Meta/Ctrl+Alt+L | 油猴選單切換狀態
// @version            1.5.0
// @icon               
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

  const Config = {
    SCRIPT_SETTINGS: {
      DEFAULT_ACTIVATION_STATE: false,
      UI_FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      ANIMATION_DURATION_MS: 300,
      NOTIFICATION_VISIBILITY_DURATION_MS: 2000,
      INDICATOR_EXPANDED_DURATION_MS: 2000,
      STATE_TOGGLE_DEBOUNCE_MS: 200,
    },
    RESTRICTION_OVERRIDES: {
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
    },
    ELEMENT_IDS: {
      STATUS_NOTIFICATION: "WebLiberatorStatusNotification",
      EDGE_INDICATOR: "WebLiberatorEdgeIndicator",
      OVERRIDE_STYLE_SHEET: "WebLiberatorOverrideStyleSheet",
    },
    CSS_CLASSES: {
      STATUS_NOTIFICATION_VISIBLE: "wl-status-notification--visible",
      STATUS_NOTIFICATION_DISABLED: "wl-status-notification--disabled",
      BREATHING_DOT: "wl-breathing-dot",
      STATUS_NOTIFICATION_MESSAGE: "wl-status-notification-message",
      EDGE_INDICATOR_EXPANDED: "wl-edge-indicator--expanded",
      EDGE_INDICATOR_ACTIVE: "wl-edge-indicator--active",
    },
    STORAGE_KEYS: {
      ACTIVATION_STATE_PREFIX: "webLiberator_state_",
      STATE_ENABLED_VALUE: "enabled",
      STATE_DISABLED_VALUE: "disabled",
    },
    UI_TEXTS: {
      "zh-CN": {
        STATUS_ENABLED: "枷锁限制破除",
        STATUS_DISABLED: "枷锁限制恢复",
        MENU_CMD_ENABLED: "枷锁限制破除已启用 ✅",
        MENU_CMD_DISABLED: "枷锁限制破除已禁用 ❌",
      },
      "zh-TW": {
        STATUS_ENABLED: "枷鎖限制破除",
        STATUS_DISABLED: "枷鎖限制恢復",
        MENU_CMD_ENABLED: "枷鎖限制破除已啟用 ✅",
        MENU_CMD_DISABLED: "枷鎖限制破除已禁用 ❌",
      },
      "en-US": {
        STATUS_ENABLED: "Restrictions Bypassed",
        STATUS_DISABLED: "Restrictions Restored",
        MENU_CMD_ENABLED: "Restrictions Bypassed Activated ✅",
        MENU_CMD_DISABLED: "Restrictions Bypassed Deactivated ❌",
      },
    },
    SVG_ICON_MARKUP_EDGE_INDICATOR: `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 125.834 145.398">
        <path d="M103.957 43.1334L103.957 102.362C103.957 112.616 98.9276 117.694 88.8202 117.694L36.9647 117.694C26.8573 117.694 21.828 112.616 21.828 102.362L21.828 67.3947C23.9408 69.2087 26.911 69.8726 29.6893 69.0624L29.6893 102.264C29.6893 107.147 32.2772 109.833 37.3554 109.833L88.4784 109.833C93.5077 109.833 96.0956 107.147 96.0956 102.264L96.0956 43.2311C96.0956 38.3482 93.5077 35.6627 88.4296 35.6627L44.2584 35.6627C44.1673 33.7229 43.3799 31.757 41.7499 30.0963L39.5161 27.8014L88.8202 27.8014C98.9276 27.8014 103.957 32.8795 103.957 43.1334Z" fill="currentColor"/>
        <path d="M83.3026 91.9127C83.3026 93.5728 82.0331 94.8424 80.2753 94.8424L44.3378 94.8424C42.58 94.8424 41.2616 93.5728 41.2616 91.9127C41.2616 90.2037 42.58 88.8365 44.3378 88.8365L80.2753 88.8365C82.0331 88.8365 83.3026 90.2037 83.3026 91.9127Z" fill="currentColor"/>
        <path d="M83.3026 72.6744C83.3026 74.3834 82.0331 75.7506 80.2753 75.7506L44.3378 75.7506C42.58 75.7506 41.2616 74.3834 41.2616 72.6744C41.2616 71.0143 42.58 69.7447 44.3378 69.7447L80.2753 69.7447C82.0331 69.7447 83.3026 71.0143 83.3026 72.6744Z" fill="currentColor"/>
        <path d="M83.3026 53.5826C83.3026 55.2916 82.0331 56.61 80.2753 56.61L44.3378 56.61C42.58 56.61 41.2616 55.2916 41.2616 53.5826C41.2616 51.9225 42.58 50.6041 44.3378 50.6041L80.2753 50.6041C82.0331 50.6041 83.3026 51.9225 83.3026 53.5826Z" fill="currentColor"/>
        <path d="M6.64247 47.5768C6.59365 49.4322 8.83974 50.067 10.0604 48.8463L17.5311 41.3756L25.6854 61.5904C26.0761 62.5182 27.0526 62.9576 27.9315 62.6158L32.8143 60.6627C33.6933 60.2721 34.0351 59.2467 33.5956 58.3189L25.0018 38.4459L35.4999 38.0064C37.3554 37.9088 38.2831 36.151 36.9159 34.735L10.2558 7.29355C9.03505 6.07285 7.13075 6.75644 7.08193 8.56308Z" fill="currentColor"/>
      </svg>`.trim(),
  };

  const State = {
    isScriptActive: Config.SCRIPT_SETTINGS.DEFAULT_ACTIVATION_STATE,
    currentLocale: "en-US",
    localizedStrings: Config.UI_TEXTS["en-US"],
    pageOrigin: window.location.origin,

    loadAndSetInitialState() {
      this.currentLocale = this.detectUserLanguage();
      this.localizedStrings =
        Config.UI_TEXTS[this.currentLocale] || Config.UI_TEXTS["en-US"];
      this.loadActivationState();
    },
    detectUserLanguage() {
      const languages = navigator.languages || [navigator.language];
      for (const lang of languages) {
        const langLower = lang.toLowerCase();
        if (langLower === "zh-cn") return "zh-CN";
        if (
          langLower === "zh-tw" ||
          langLower === "zh-hk" ||
          langLower === "zh-mo" ||
          langLower === "zh-hant"
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
    },
    getActivationStateStorageKey() {
      const origin = String(this.pageOrigin || "").replace(/\/$/, "");
      return `${Config.STORAGE_KEYS.ACTIVATION_STATE_PREFIX}${origin}`;
    },
    loadActivationState() {
      const storageKey = this.getActivationStateStorageKey();
      const defaultStateString = Config.SCRIPT_SETTINGS.DEFAULT_ACTIVATION_STATE
        ? Config.STORAGE_KEYS.STATE_ENABLED_VALUE
        : Config.STORAGE_KEYS.STATE_DISABLED_VALUE;
      let storedValue = defaultStateString;
      try {
        storedValue = GM_getValue(storageKey, defaultStateString);
      } catch (e) {}
      if (
        storedValue !== Config.STORAGE_KEYS.STATE_ENABLED_VALUE &&
        storedValue !== Config.STORAGE_KEYS.STATE_DISABLED_VALUE
      ) {
        storedValue = defaultStateString;
      }
      this.isScriptActive =
        storedValue === Config.STORAGE_KEYS.STATE_ENABLED_VALUE;
    },
    saveActivationState() {
      const storageKey = this.getActivationStateStorageKey();
      const valueToStore = this.isScriptActive
        ? Config.STORAGE_KEYS.STATE_ENABLED_VALUE
        : Config.STORAGE_KEYS.STATE_DISABLED_VALUE;
      try {
        GM_setValue(storageKey, valueToStore);
      } catch (e) {}
    },
    toggleActivation() {
      this.isScriptActive = !this.isScriptActive;
      this.saveActivationState();
      return this.isScriptActive;
    },
    getLocalizedString(key, useOwnStrings = true) {
      const strings = useOwnStrings
        ? this.localizedStrings
        : Config.UI_TEXTS["en-US"];
      const fallbackStrings = Config.UI_TEXTS["en-US"];
      return strings[key] ?? fallbackStrings[key] ?? `${key}?`;
    },
  };

  const UserInterface = {
    statusNotificationTimer: null,
    statusNotificationRemovalTimer: null,
    edgeIndicatorElement: null,
    indicatorCollapseTimer: null,
    userScriptMenuCommandId: null,

    injectCoreStyles() {
      const easeOutQuint = "cubic-bezier(0.23, 1, 0.32, 1)";
      const appleEaseOutStandard = "cubic-bezier(0, 0, 0.58, 1)";
      const animationDuration = Config.SCRIPT_SETTINGS.ANIMATION_DURATION_MS;
      const indicatorTransitionDuration = "0.25s";
      const iconTransitionDuration = "0.2s";
      const iconTransitionDelay = "0.1s";

      const baseCSS = `
        :root {
          --ctp-frappe-rosewater: rgb(242, 213, 207);
          --ctp-frappe-flamingo: rgb(238, 190, 190);
          --ctp-frappe-pink: rgb(244, 184, 228);
          --ctp-frappe-mauve: rgb(202, 158, 230);
          --ctp-frappe-red: rgb(231, 130, 132);
          --ctp-frappe-maroon: rgb(234, 153, 156);
          --ctp-frappe-peach: rgb(239, 159, 118);
          --ctp-frappe-yellow: rgb(229, 200, 144);
          --ctp-frappe-green: rgb(166, 209, 137);
          --ctp-frappe-teal: rgb(129, 200, 190);
          --ctp-frappe-sky: rgb(153, 209, 219);
          --ctp-frappe-sapphire: rgb(133, 193, 220);
          --ctp-frappe-blue: rgb(140, 170, 238);
          --ctp-frappe-lavender: rgb(186, 187, 241);
          --ctp-frappe-text: rgb(198, 208, 245);
          --ctp-frappe-subtext1: rgb(181, 191, 226);
          --ctp-frappe-subtext0: rgb(165, 173, 206);
          --ctp-frappe-overlay2: rgb(148, 156, 187);
          --ctp-frappe-overlay1: rgb(131, 139, 167);
          --ctp-frappe-overlay0: rgb(115, 121, 148);
          --ctp-frappe-surface2: rgb(98, 104, 128);
          --ctp-frappe-surface1: rgb(81, 87, 109);
          --ctp-frappe-surface0: rgb(65, 69, 89);
          --ctp-frappe-base: rgb(48, 52, 70);
          --ctp-frappe-mantle: rgb(41, 44, 60);
          --ctp-frappe-crust: rgb(35, 38, 52);

          --ctp-latte-rosewater: rgb(220, 138, 120);
          --ctp-latte-flamingo: rgb(221, 120, 120);
          --ctp-latte-pink: rgb(234, 118, 203);
          --ctp-latte-mauve: rgb(136, 57, 239);
          --ctp-latte-red: rgb(210, 15, 57);
          --ctp-latte-maroon: rgb(230, 69, 83);
          --ctp-latte-peach: rgb(254, 100, 11);
          --ctp-latte-yellow: rgb(223, 142, 29);
          --ctp-latte-green: rgb(64, 160, 43);
          --ctp-latte-teal: rgb(23, 146, 153);
          --ctp-latte-sky: rgb(4, 165, 229);
          --ctp-latte-sapphire: rgb(32, 159, 181);
          --ctp-latte-blue: rgb(30, 102, 245);
          --ctp-latte-lavender: rgb(114, 135, 253);
          --ctp-latte-text: rgb(76, 79, 105);
          --ctp-latte-subtext1: rgb(92, 95, 119);
          --ctp-latte-subtext0: rgb(108, 111, 133);
          --ctp-latte-overlay2: rgb(124, 127, 147);
          --ctp-latte-overlay1: rgb(140, 143, 161);
          --ctp-latte-overlay0: rgb(156, 160, 176);
          --ctp-latte-surface2: rgb(172, 176, 190);
          --ctp-latte-surface1: rgb(188, 192, 204);
          --ctp-latte-surface0: rgb(204, 208, 218);
          --ctp-latte-base: rgb(239, 241, 245);
          --ctp-latte-mantle: rgb(230, 233, 239);
          --ctp-latte-crust: rgb(220, 224, 232);

          --wl-notify-bg-dark: rgb(from var(--ctp-frappe-base) r g b / 0.85);
          --wl-notify-text-dark: var(--ctp-frappe-text);
          --wl-notify-border-dark: rgb(from var(--ctp-frappe-surface2) r g b / 0.25);
          --wl-notify-dot-color-enabled-dark: var(--ctp-frappe-green);
          --wl-notify-dot-color-disabled-dark: var(--ctp-frappe-red);
          --wl-notify-dot-glow-enabled-dark: rgb(from var(--ctp-frappe-green) r g b / 0.35);
          --wl-notify-dot-glow-disabled-dark: rgb(from var(--ctp-frappe-red) r g b / 0.35);
          --wl-indicator-inactive-bg-dark: var(--ctp-frappe-surface2);
          --wl-indicator-inactive-opacity-dark: 0.55;
          --wl-indicator-hover-bg-dark: rgb(from var(--ctp-frappe-surface1) r g b / 0.5);
          --wl-indicator-expanded-bg-dark: rgb(from var(--ctp-frappe-base) r g b / 0.85);
          --wl-indicator-active-bg-dark: rgb(from var(--ctp-frappe-green) r g b / 0.88);
          --wl-indicator-border-dark: rgb(from var(--ctp-frappe-surface2) r g b / 0.2);
          --wl-icon-color-dark: var(--ctp-frappe-text);
          --wl-icon-active-color-dark: var(--ctp-frappe-crust);

          --wl-notify-bg-light: rgb(from var(--ctp-latte-base) r g b / 0.85);
          --wl-notify-text-light: var(--ctp-latte-text);
          --wl-notify-border-light: rgb(from var(--ctp-latte-surface2) r g b / 0.25);
          --wl-notify-dot-color-enabled-light: var(--ctp-latte-green);
          --wl-notify-dot-color-disabled-light: var(--ctp-latte-red);
          --wl-notify-dot-glow-enabled-light: rgb(from var(--ctp-latte-green) r g b / 0.35);
          --wl-notify-dot-glow-disabled-light: rgb(from var(--ctp-latte-red) r g b / 0.35);
          --wl-indicator-inactive-bg-light: var(--ctp-latte-overlay0);
          --wl-indicator-inactive-opacity-light: 0.65;
          --wl-indicator-hover-bg-light: rgb(from var(--ctp-latte-surface1) r g b / 0.5);
          --wl-indicator-expanded-bg-light: rgb(from var(--ctp-latte-base) r g b / 0.85);
          --wl-indicator-active-bg-light: rgb(from var(--ctp-latte-green) r g b / 0.88);
          --wl-indicator-border-light: rgb(from var(--ctp-latte-surface2) r g b / 0.2);
          --wl-icon-color-light: var(--ctp-latte-text);
          --wl-icon-active-color-light: var(--ctp-latte-base);

          --wl-shadow-dark:
            0 1px 2px rgba(0, 0, 0, 0.1),
            0 6px 12px rgba(0, 0, 0, 0.2);
          --wl-shadow-light:
            0 1px 2px rgba(90, 90, 90, 0.06),
            0 6px 12px rgba(90, 90, 90, 0.12);
        }

        @keyframes wl-breathing-animation {
          0%, 100% {
            transform: scale(0.85);
            opacity: 0.7;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }

        #${Config.ELEMENT_IDS.STATUS_NOTIFICATION} {
          position: fixed;
          bottom: 20px;
          left: 50%;
          z-index: 2147483646;
          display: flex;
          align-items: center;
          padding: 10px 16px;
          border: 1px solid var(--wl-notify-border-dark);
          border-radius: 20px;
          background-color: var(--wl-notify-bg-dark);
          color: var(--wl-notify-text-dark);
          box-shadow: var(--wl-shadow-dark);
          box-sizing: border-box;
          opacity: 0;
          font-family: ${Config.SCRIPT_SETTINGS.UI_FONT_STACK};
          text-align: left;
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          transform: translate(-50%, calc(100% + 40px));
          transition: transform ${animationDuration}ms ${easeOutQuint},
                      opacity ${animationDuration * 0.8}ms ${easeOutQuint};
        }

        #${Config.ELEMENT_IDS.STATUS_NOTIFICATION}.${
        Config.CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
      } {
          transform: translate(-50%, 0);
          opacity: 1;
        }

        #${Config.ELEMENT_IDS.STATUS_NOTIFICATION} .${
        Config.CSS_CLASSES.BREATHING_DOT
      } {
          width: 8px;
          height: 8px;
          margin-right: 10px;
          border-radius: 50%;
          background-color: var(--wl-notify-dot-color-enabled-dark);
          box-shadow: 0 0 8px 3px var(--wl-notify-dot-glow-enabled-dark);
          flex-shrink: 0;
          animation: wl-breathing-animation 2000ms ease-in-out infinite;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        #${Config.ELEMENT_IDS.STATUS_NOTIFICATION}.${
        Config.CSS_CLASSES.STATUS_NOTIFICATION_DISABLED
      } .${Config.CSS_CLASSES.BREATHING_DOT} {
          background-color: var(--wl-notify-dot-color-disabled-dark);
          box-shadow: 0 0 8px 3px var(--wl-notify-dot-glow-disabled-dark);
        }

        #${Config.ELEMENT_IDS.STATUS_NOTIFICATION} .${
        Config.CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE
      } {
          color: var(--wl-notify-text-dark);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR} {
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
          background-color: var(--wl-indicator-inactive-bg-dark);
          color: var(--wl-icon-color-dark);
          opacity: var(--wl-indicator-inactive-opacity-dark);
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
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR}:hover {
          background-color: var(--wl-indicator-hover-bg-dark);
          opacity: 0.8;
          transform: scale(1.1);
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_ACTIVE
      }:not(.${Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED}) {
           background-color: var(--wl-indicator-active-bg-dark);
           opacity: 0.6;
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED
      } {
          width: 44px;
          height: 44px;
          border: 1px solid var(--wl-indicator-border-dark);
          background-color: var(--wl-indicator-expanded-bg-dark);
          box-shadow: var(--wl-shadow-dark);
          opacity: 1;
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          transform: scale(1);
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED
      }:hover {
          transform: scale(1.08);
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED
      }.${Config.CSS_CLASSES.EDGE_INDICATOR_ACTIVE} {
          background-color: var(--wl-indicator-active-bg-dark);
          color: var(--wl-icon-active-color-dark);
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR} svg {
          display: block;
          width: 22px;
          height: 22px;
          opacity: 0;
          transform: scale(0.5);
          transition: opacity ${iconTransitionDuration} ${appleEaseOutStandard} ${iconTransitionDelay},
                      transform ${iconTransitionDuration} ${appleEaseOutStandard} ${iconTransitionDelay};
          pointer-events: none;
        }

        #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED
      } svg {
          opacity: 1;
          transform: scale(1);
        }

        @media (prefers-color-scheme: light) {
          #${Config.ELEMENT_IDS.STATUS_NOTIFICATION} {
            border: 1px solid var(--wl-notify-border-light);
            background-color: var(--wl-notify-bg-light);
            color: var(--wl-notify-text-light);
          }

          #${Config.ELEMENT_IDS.STATUS_NOTIFICATION} .${
        Config.CSS_CLASSES.BREATHING_DOT
      } {
            background-color: var(--wl-notify-dot-color-enabled-light);
            box-shadow: 0 0 8px 3px var(--wl-notify-dot-glow-enabled-light);
          }

          #${Config.ELEMENT_IDS.STATUS_NOTIFICATION}.${
        Config.CSS_CLASSES.STATUS_NOTIFICATION_DISABLED
      } .${Config.CSS_CLASSES.BREATHING_DOT} {
            background-color: var(--wl-notify-dot-color-disabled-light);
            box-shadow: 0 0 8px 3px var(--wl-notify-dot-glow-disabled-light);
          }

          #${Config.ELEMENT_IDS.STATUS_NOTIFICATION} .${
        Config.CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE
      } {
            color: var(--wl-notify-text-light);
          }

          #${Config.ELEMENT_IDS.EDGE_INDICATOR} {
            background-color: var(--wl-indicator-inactive-bg-light);
            color: var(--wl-icon-color-light);
            opacity: var(--wl-indicator-inactive-opacity-light);
          }

          #${Config.ELEMENT_IDS.EDGE_INDICATOR}:hover {
            background-color: var(--wl-indicator-hover-bg-light);
          }

          #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_ACTIVE
      }:not(.${Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED}) {
             background-color: var(--wl-indicator-active-bg-light);
             opacity: 0.6;
          }

          #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED
      } {
            border: 1px solid var(--wl-indicator-border-light);
            background-color: var(--wl-indicator-expanded-bg-light);
            box-shadow: var(--wl-shadow-light);
          }

          #${Config.ELEMENT_IDS.EDGE_INDICATOR}.${
        Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED
      }.${Config.CSS_CLASSES.EDGE_INDICATOR_ACTIVE} {
            background-color: var(--wl-indicator-active-bg-light);
            color: var(--wl-icon-active-color-light);
          }
        }
      `;
      try {
        GM_addStyle(baseCSS);
      } catch (e) {}
    },

    displayStatusNotification(statusMessageKey) {
      if (this.statusNotificationTimer)
        clearTimeout(this.statusNotificationTimer);
      if (this.statusNotificationRemovalTimer)
        clearTimeout(this.statusNotificationRemovalTimer);
      this.statusNotificationTimer = null;
      this.statusNotificationRemovalTimer = null;

      const message = State.getLocalizedString(statusMessageKey);

      const renderNotification = () => {
        let notificationElement = document.getElementById(
          Config.ELEMENT_IDS.STATUS_NOTIFICATION
        );
        if (!notificationElement && document.body) {
          notificationElement = document.createElement("div");
          notificationElement.id = Config.ELEMENT_IDS.STATUS_NOTIFICATION;
          notificationElement.innerHTML = `
            <div class="${Config.CSS_CLASSES.BREATHING_DOT}"></div>
            <div class="${Config.CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE}"></div>
          `.trim();
          document.body.appendChild(notificationElement);
        } else if (!notificationElement) {
          return;
        }

        if (!State.isScriptActive) {
          notificationElement.classList.add(
            Config.CSS_CLASSES.STATUS_NOTIFICATION_DISABLED
          );
        } else {
          notificationElement.classList.remove(
            Config.CSS_CLASSES.STATUS_NOTIFICATION_DISABLED
          );
        }

        const messageElement = notificationElement.querySelector(
          `.${Config.CSS_CLASSES.STATUS_NOTIFICATION_MESSAGE}`
        );
        if (messageElement) messageElement.textContent = message;

        notificationElement.classList.remove(
          Config.CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
        );
        void notificationElement.offsetWidth;

        requestAnimationFrame(() => {
          const currentElement = document.getElementById(
            Config.ELEMENT_IDS.STATUS_NOTIFICATION
          );
          if (currentElement) {
            currentElement.classList.add(
              Config.CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
            );
          }
        });

        this.statusNotificationTimer = setTimeout(() => {
          const currentElement = document.getElementById(
            Config.ELEMENT_IDS.STATUS_NOTIFICATION
          );
          if (currentElement) {
            currentElement.classList.remove(
              Config.CSS_CLASSES.STATUS_NOTIFICATION_VISIBLE
            );
            this.statusNotificationRemovalTimer = setTimeout(() => {
              document
                .getElementById(Config.ELEMENT_IDS.STATUS_NOTIFICATION)
                ?.remove();
              this.statusNotificationTimer = null;
              this.statusNotificationRemovalTimer = null;
            }, Config.SCRIPT_SETTINGS.ANIMATION_DURATION_MS);
          } else {
            this.statusNotificationTimer = null;
            this.statusNotificationRemovalTimer = null;
          }
        }, Config.SCRIPT_SETTINGS.NOTIFICATION_VISIBILITY_DURATION_MS);
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderNotification, {
          once: true,
        });
      } else {
        renderNotification();
      }
    },

    updateUserScriptMenuCommand() {
      if (this.userScriptMenuCommandId) {
        try {
          GM_unregisterMenuCommand(this.userScriptMenuCommandId);
        } catch (e) {}
        this.userScriptMenuCommandId = null;
      }
      const labelKey = State.isScriptActive
        ? "MENU_CMD_ENABLED"
        : "MENU_CMD_DISABLED";
      const commandLabel = State.getLocalizedString(labelKey);
      try {
        this.userScriptMenuCommandId = GM_registerMenuCommand(
          commandLabel,
          ScriptManager.toggleActivationWithDebounce
        );
      } catch (e) {
        this.userScriptMenuCommandId = null;
      }
    },

    createEdgeIndicator() {
      if (
        !document.body ||
        document.getElementById(Config.ELEMENT_IDS.EDGE_INDICATOR)
      )
        return;
      this.edgeIndicatorElement = document.createElement("div");
      this.edgeIndicatorElement.id = Config.ELEMENT_IDS.EDGE_INDICATOR;
      this.edgeIndicatorElement.innerHTML =
        Config.SVG_ICON_MARKUP_EDGE_INDICATOR;
      document.body.appendChild(this.edgeIndicatorElement);
      this.updateEdgeIndicatorStateVisuals();
    },

    ensureEdgeIndicatorExists() {
      if (
        this.edgeIndicatorElement &&
        document.body?.contains(this.edgeIndicatorElement)
      ) {
        this.updateEdgeIndicatorStateVisuals();
        return;
      }
      let existingIndicator = document.getElementById(
        Config.ELEMENT_IDS.EDGE_INDICATOR
      );
      if (existingIndicator) {
        this.edgeIndicatorElement = existingIndicator;
        this.updateEdgeIndicatorStateVisuals();
        return;
      }
      if (document.body) {
        this.createEdgeIndicator();
      } else {
        document.addEventListener(
          "DOMContentLoaded",
          () => this.createEdgeIndicator(),
          { once: true }
        );
      }
    },

    updateEdgeIndicatorStateVisuals() {
      const indicator =
        this.edgeIndicatorElement ||
        document.getElementById(Config.ELEMENT_IDS.EDGE_INDICATOR);
      if (indicator) {
        indicator.classList.toggle(
          Config.CSS_CLASSES.EDGE_INDICATOR_ACTIVE,
          State.isScriptActive
        );
      }
    },

    expandAndCollapseEdgeIndicator() {
      const indicator =
        this.edgeIndicatorElement ||
        document.getElementById(Config.ELEMENT_IDS.EDGE_INDICATOR);
      if (!indicator) return;
      clearTimeout(this.indicatorCollapseTimer);
      indicator.classList.remove(Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED);
      void indicator.offsetWidth;
      requestAnimationFrame(() => {
        indicator.classList.add(Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED);
        this.indicatorCollapseTimer = setTimeout(() => {
          indicator.classList.remove(
            Config.CSS_CLASSES.EDGE_INDICATOR_EXPANDED
          );
          this.indicatorCollapseTimer = null;
        }, Config.SCRIPT_SETTINGS.INDICATOR_EXPANDED_DURATION_MS);
      });
    },
  };

  const RestrictionManager = {
    overrideStyleSheetElement: null,
    applyOverrides() {
      this.injectRestrictionOverrideStyles();
      EventManager.registerEventInterceptors();
    },
    removeOverrides() {
      this.removeRestrictionOverrideStyles();
      EventManager.unregisterEventInterceptors();
    },
    injectRestrictionOverrideStyles() {
      if (
        this.overrideStyleSheetElement ||
        document.getElementById(Config.ELEMENT_IDS.OVERRIDE_STYLE_SHEET)
      )
        return;
      const css = `
        *, *::before, *::after {
          user-select: text !important; -webkit-user-select: text !important; -moz-user-select: text !important; -ms-user-select: text !important;
          cursor: auto !important;
          -webkit-user-drag: auto !important; user-drag: auto !important;
        }
        body { cursor: auto !important; }
        ::selection { background-color: highlight !important; color: highlighttext !important; }
        ::-moz-selection { background-color: highlight !important; color: highlighttext !important; }
      `;
      this.overrideStyleSheetElement = document.createElement("style");
      this.overrideStyleSheetElement.id =
        Config.ELEMENT_IDS.OVERRIDE_STYLE_SHEET;
      this.overrideStyleSheetElement.textContent = css;
      (document.head || document.documentElement).appendChild(
        this.overrideStyleSheetElement
      );
    },
    removeRestrictionOverrideStyles() {
      this.overrideStyleSheetElement?.remove();
      this.overrideStyleSheetElement = null;
      document
        .getElementById(Config.ELEMENT_IDS.OVERRIDE_STYLE_SHEET)
        ?.remove();
    },
    clearElementInlineHandlers(element) {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
      for (const prop of Config.RESTRICTION_OVERRIDES
        .INLINE_HANDLER_ATTRIBUTES_TO_CLEAR) {
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
    },
    clearInlineHandlersRecursively(rootNode) {
      if (!State.isScriptActive || !rootNode) return;

      const processSingleNode = (element) => {
        if (element.nodeType !== Node.ELEMENT_NODE) return;

        if (
          element.id === Config.ELEMENT_IDS.EDGE_INDICATOR ||
          element.id === Config.ELEMENT_IDS.STATUS_NOTIFICATION ||
          element.closest(`#${Config.ELEMENT_IDS.EDGE_INDICATOR}`) ||
          element.closest(`#${Config.ELEMENT_IDS.STATUS_NOTIFICATION}`)
        ) {
          return;
        }

        this.clearElementInlineHandlers(element);

        if (element.shadowRoot?.mode === "open") {
          for (const childInShadow of Array.from(element.shadowRoot.children)) {
            processSingleNode(childInShadow);
          }
        }

        for (const child of Array.from(element.children)) {
          processSingleNode(child);
        }
      };

      try {
        if (
          rootNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
          rootNode.nodeType === Node.DOCUMENT_NODE
        ) {
          for (const child of Array.from(rootNode.children)) {
            processSingleNode(child);
          }
        } else if (rootNode.nodeType === Node.ELEMENT_NODE) {
          processSingleNode(rootNode);
        }
      } catch (error) {}
    },
  };

  const EventManager = {
    domMutationObserver: null,
    init() {
      this.initializeGlobalEventListeners();
    },
    stopPropagationHandler(event) {
      event.stopImmediatePropagation();
    },
    registerEventInterceptors() {
      Config.RESTRICTION_OVERRIDES.EVENTS_TO_INTERCEPT.forEach((type) => {
        document.addEventListener(type, this.stopPropagationHandler, {
          capture: true,
          passive: false,
        });
      });
    },
    unregisterEventInterceptors() {
      Config.RESTRICTION_OVERRIDES.EVENTS_TO_INTERCEPT.forEach((type) => {
        document.removeEventListener(type, this.stopPropagationHandler, {
          capture: true,
        });
      });
    },
    handleDOMMutation(mutations) {
      if (!State.isScriptActive) return;
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            RestrictionManager.clearInlineHandlersRecursively(node);
          }
        }
      }
    },
    initializeDOMObserver() {
      if (this.domMutationObserver || !document.documentElement) return;
      const observerOptions = { childList: true, subtree: true };
      this.domMutationObserver = new MutationObserver(
        this.handleDOMMutation.bind(this)
      );
      try {
        this.domMutationObserver.observe(
          document.documentElement,
          observerOptions
        );
      } catch (error) {
        this.domMutationObserver = null;
      }
    },
    disconnectDOMObserver() {
      if (this.domMutationObserver) {
        this.domMutationObserver.disconnect();
        this.domMutationObserver = null;
      }
    },
    handleEdgeIndicatorClick(event) {
      event.stopPropagation();
      UserInterface.expandAndCollapseEdgeIndicator();
      ScriptManager.toggleActivationWithDebounce();
    },
    handleKeyboardShortcut(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.altKey &&
        event.code === "KeyL"
      ) {
        event.preventDefault();
        event.stopPropagation();
        ScriptManager.toggleActivationWithDebounce();
      }
    },
    initializeGlobalEventListeners() {
      document.addEventListener(
        "keydown",
        this.handleKeyboardShortcut.bind(this),
        { capture: true }
      );

      const indicator = UserInterface.edgeIndicatorElement;
      if (indicator && !indicator.dataset.listenerAttached) {
        indicator.addEventListener(
          "click",
          this.handleEdgeIndicatorClick.bind(this)
        );
        indicator.dataset.listenerAttached = "true";
      } else if (!indicator) {
        const checkAndBind = () => {
          const ind = document.getElementById(
            Config.ELEMENT_IDS.EDGE_INDICATOR
          );
          if (ind && !ind.dataset.listenerAttached) {
            ind.addEventListener(
              "click",
              this.handleEdgeIndicatorClick.bind(this)
            );
            ind.dataset.listenerAttached = "true";
          }
        };
        if (document.body) {
          checkAndBind();
        } else {
          document.addEventListener("DOMContentLoaded", checkAndBind, {
            once: true,
          });
        }
      }
    },
  };

  const ScriptManager = {
    init() {
      try {
        State.loadAndSetInitialState();
        UserInterface.injectCoreStyles();
        UserInterface.ensureEdgeIndicatorExists();
        UserInterface.updateUserScriptMenuCommand();

        if (State.isScriptActive) {
          RestrictionManager.applyOverrides();
          RestrictionManager.clearInlineHandlersRecursively(
            document.documentElement
          );
          EventManager.initializeDOMObserver();
        }
        EventManager.init();
      } catch (error) {}
    },
    toggleActivation() {
      const isActiveNow = State.toggleActivation();
      if (isActiveNow) {
        RestrictionManager.applyOverrides();
        RestrictionManager.clearInlineHandlersRecursively(
          document.documentElement
        );
        EventManager.initializeDOMObserver();
        UserInterface.displayStatusNotification("STATUS_ENABLED");
      } else {
        RestrictionManager.removeOverrides();
        EventManager.disconnectDOMObserver();
        UserInterface.displayStatusNotification("STATUS_DISABLED");
      }
      UserInterface.updateUserScriptMenuCommand();
      UserInterface.updateEdgeIndicatorStateVisuals();
    },
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    toggleActivationWithDebounce: null,
  };
  ScriptManager.toggleActivationWithDebounce = ScriptManager.debounce(
    ScriptManager.toggleActivation,
    Config.SCRIPT_SETTINGS.STATE_TOGGLE_DEBOUNCE_MS
  );

  if (window.self === window.top) {
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => ScriptManager.init(),
        { once: true }
      );
    } else {
      ScriptManager.init();
    }
  }
})();
