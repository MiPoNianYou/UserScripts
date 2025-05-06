// ==UserScript==
// @name               Password Revealer
// @name:zh-CN         密码显示助手
// @name:zh-TW         密碼顯示助手
// @description        Password Field Content Via - Reveal On Focus / Preview On Hover / Toggle On Double-Click / Always Visible | Switch Display Mode Via Menu Or Shortcut (Meta/Ctrl+Alt+P)
// @description:zh-CN  密码输入框内容可聚焦即显 / 悬浮即览 / 双击切换 / 始终可见 | 通过菜单或快捷键（Meta/Ctrl+Alt+P）切换显示模式
// @description:zh-TW  密碼輸入框內容可聚焦即顯 / 懸停即覽 / 雙擊切換 / 始終可見 | 透過選單或快速鍵（Meta/Ctrl+Alt+P）切換顯示模式
// @version            1.4.0
// @icon               https://raw.githubusercontent.com/MiPoNianYou/UserScripts/refs/heads/main/Icons/PasswordRevealerIcon.svg
// @author             念柚
// @namespace          https://github.com/MiPoNianYou/UserScripts
// @supportURL         https://github.com/MiPoNianYou/UserScripts/issues
// @license            GPL-3.0
// @match              *://*/*
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_registerMenuCommand
// @grant              GM_unregisterMenuCommand
// @grant              GM_addStyle
// @run-at             document-idle
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_SETTINGS = {
    UI_FONT_STACK: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    ANIMATION_DURATION_MS: 300,
    NOTIFICATION_VISIBILITY_DURATION_MS: 2000,
  };

  const MODES = {
    FOCUS: "Focus",
    HOVER: "Hover",
    DBLCLICK: "DoubleClick",
    ALWAYS_SHOW: "AlwaysShow",
  };

  const VALID_MODES = [
    MODES.FOCUS,
    MODES.HOVER,
    MODES.DBLCLICK,
    MODES.ALWAYS_SHOW,
  ];

  const ELEMENT_IDS = {
    MODE_NOTIFICATION: "PasswordRevealerModeNotification",
  };

  const CSS_CLASSES = {
    MODE_NOTIFICATION_VISIBLE: "pr-mode-notification--visible",
    MODE_NOTIFICATION_ICON: "pr-mode-notification-icon",
    MODE_NOTIFICATION_CONTENT: "pr-mode-notification-content",
    MODE_NOTIFICATION_TITLE: "pr-mode-notification-title",
    MODE_NOTIFICATION_MESSAGE: "pr-mode-notification-message",
  };

  const STORAGE_KEYS = {
    MODE_KEY: "PasswordDisplayMode",
  };

  const SVG_ICON_MARKUP = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.6055 95.6543">
      <g>
        <path d="M3.90625 31.1523C6.49414 31.1523 7.86133 29.6875 7.86133 27.1484L7.86133 15.625C7.86133 10.5469 10.5469 7.95898 15.4297 7.95898L27.2461 7.95898C29.834 7.95898 31.25 6.54297 31.25 4.00391C31.25 1.46484 29.834 0.0976562 27.2461 0.0976562L15.332 0.0976562C5.12695 0.0976562 0 5.12695 0 15.1855L0 27.1484C0 29.6875 1.41602 31.1523 3.90625 31.1523ZM91.6504 31.1523C94.2383 31.1523 95.6055 29.6875 95.6055 27.1484L95.6055 15.1855C95.6055 5.12695 90.4785 0.0976562 80.2734 0.0976562L68.3105 0.0976562C65.7715 0.0976562 64.3555 1.46484 64.3555 4.00391C64.3555 6.54297 65.7715 7.95898 68.3105 7.95898L80.127 7.95898C84.9609 7.95898 87.7441 10.5469 87.7441 15.625L87.7441 27.1484C87.7441 29.6875 89.1602 31.1523 91.6504 31.1523ZM15.332 95.6543L27.2461 95.6543C29.834 95.6543 31.25 94.2383 31.25 91.748C31.25 89.209 29.834 87.793 27.2461 87.793L15.4297 87.793C10.5469 87.793 7.86133 85.2051 7.86133 80.127L7.86133 68.6035C7.86133 66.0156 6.44531 64.5996 3.90625 64.5996C1.36719 64.5996 0 66.0156 0 68.6035L0 80.5176C0 90.625 5.12695 95.6543 15.332 95.6543ZM68.3105 95.6543L80.2734 95.6543C90.4785 95.6543 95.6055 90.5762 95.6055 80.5176L95.6055 68.6035C95.6055 66.0156 94.1895 64.5996 91.6504 64.5996C89.1113 64.5996 87.7441 66.0156 87.7441 68.6035L87.7441 80.127C87.7441 85.2051 84.9609 87.793 80.127 87.793L68.3105 87.793C65.7715 87.793 64.3555 89.209 64.3555 91.748C64.3555 94.2383 65.7715 95.6543 68.3105 95.6543Z" fill="currentColor"/>
        <path d="M47.8516 18.0664C38.8184 18.0664 31.6406 25.293 31.6406 34.2285C31.6406 41.0645 35.6934 46.9727 41.9434 49.4141L41.9434 74.4629C41.9922 75.0977 42.2363 75.5859 42.7246 76.0742L46.9238 80.3223C47.4609 80.8105 48.1445 80.8594 48.6816 80.3223L56.7383 72.3145C57.3242 71.7773 57.3242 70.9961 56.7383 70.5078L51.7578 65.5273L58.6426 58.7402C59.1309 58.3008 59.082 57.5195 58.5449 56.9336L51.7578 50.0977C59.6191 46.9727 63.9648 41.2109 63.9648 34.2285C63.9648 25.3418 56.7383 18.0664 47.8516 18.0664ZM47.8027 25.6836C50.5371 25.6836 52.7344 27.9297 52.7344 30.6641C52.7344 33.4961 50.5371 35.7422 47.8027 35.7422C45.0684 35.7422 42.7734 33.4961 42.7734 30.6641C42.7734 27.9297 45.0195 25.6836 47.8027 25.6836Z" fill="currentColor"/>
      </g>
    </svg>`.trim();

  const ATTRIBUTES = {
    PROCESSED: "data-password-revealer-processed",
  };

  const UI_TEXTS = {
    "zh-CN": {
      SCRIPT_TITLE: "密码显示助手",
      MENU_CMD_FOCUS: "「聚焦即显」模式",
      MENU_CMD_HOVER: "「悬浮即览」模式",
      MENU_CMD_DBLCLICK: "「双击切换」模式",
      MENU_CMD_ALWAYS_SHOW: "「始终可见」模式",
      ALERT_MSG_FOCUS: "模式已切换为「聚焦即显」",
      ALERT_MSG_HOVER: "模式已切换为「悬浮即览」",
      ALERT_MSG_DBLCLICK: "模式已切换为「双击切换」",
      ALERT_MSG_ALWAYS_SHOW: "模式已切换为「始终可见」",
    },
    "zh-TW": {
      SCRIPT_TITLE: "密碼顯示助手",
      MENU_CMD_FOCUS: "「聚焦即顯」模式",
      MENU_CMD_HOVER: "「懸停即覽」模式",
      MENU_CMD_DBLCLICK: "「雙擊切換」模式",
      MENU_CMD_ALWAYS_SHOW: "「始終可見」模式",
      ALERT_MSG_FOCUS: "模式已切換為「聚焦即顯」",
      ALERT_MSG_HOVER: "模式已切換為「懸停即覽」",
      ALERT_MSG_DBLCLICK: "模式已切換為「雙擊切換」",
      ALERT_MSG_ALWAYS_SHOW: "模式已切換為「始終可見」",
    },
    "en-US": {
      SCRIPT_TITLE: "Password Revealer",
      MENU_CMD_FOCUS: "「Reveal On Focus」Mode",
      MENU_CMD_HOVER: "「Preview On Hover」Mode",
      MENU_CMD_DBLCLICK: "「Toggle On Double-Click」Mode",
      MENU_CMD_ALWAYS_SHOW: "「Always Visible」Mode",
      ALERT_MSG_FOCUS: "Mode Switched To 「Reveal On Focus」",
      ALERT_MSG_HOVER: "Mode Switched To 「Preview On Hover」",
      ALERT_MSG_DBLCLICK: "Mode Switched To 「Toggle On Double-Click」",
      ALERT_MSG_ALWAYS_SHOW: "Mode Switched To 「Always Visible」",
    },
  };

  const MODE_MENU_TEXT_KEYS = {
    [MODES.FOCUS]: "MENU_CMD_FOCUS",
    [MODES.HOVER]: "MENU_CMD_HOVER",
    [MODES.DBLCLICK]: "MENU_CMD_DBLCLICK",
    [MODES.ALWAYS_SHOW]: "MENU_CMD_ALWAYS_SHOW",
  };

  const MODE_ALERT_TEXT_KEYS = {
    [MODES.FOCUS]: "ALERT_MSG_FOCUS",
    [MODES.HOVER]: "ALERT_MSG_HOVER",
    [MODES.DBLCLICK]: "ALERT_MSG_DBLCLICK",
    [MODES.ALWAYS_SHOW]: "ALERT_MSG_ALWAYS_SHOW",
  };

  let currentMode = MODES.HOVER;
  let currentLocale = "en-US";
  let localizedStrings = UI_TEXTS["en-US"];
  let registeredMenuCommandIds = [];
  let notificationTimer = null;
  let notificationRemovalTimer = null;
  let domMutationObserver = null;

  function injectCoreUIStyles() {
    const appleEaseOutQuint = "cubic-bezier(0.23, 1, 0.32, 1)";
    const animationDuration = SCRIPT_SETTINGS.ANIMATION_DURATION_MS;

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

          --pr-notify-bg-dark: rgba(48, 52, 70, 0.88);
          --pr-notify-text-dark: var(--ctp-frappe-text);
          --pr-notify-title-dark: var(--ctp-frappe-text);
          --pr-icon-color-dark: var(--ctp-frappe-text);
          --pr-border-dark: rgba(98, 104, 128, 0.2);

          --pr-notify-bg-light: rgba(239, 241, 245, 0.88);
          --pr-notify-text-light: var(--ctp-latte-text);
          --pr-notify-title-light: var(--ctp-latte-text);
          --pr-icon-color-light: var(--ctp-latte-text);
          --pr-border-light: rgba(172, 176, 190, 0.2);

          --pr-shadow-dark:
            0 1px 3px rgba(0, 0, 0, 0.15),
            0 8px 15px rgba(0, 0, 0, 0.25);
          --pr-shadow-light:
            0 1px 3px rgba(90, 90, 90, 0.08),
            0 8px 15px rgba(90, 90, 90, 0.12);
        }
        #${ELEMENT_IDS.MODE_NOTIFICATION} {
          position: fixed;
          top: 20px;
          right: -400px;
          z-index: 2147483646;
          display: flex;
          align-items: center;
          width: 310px;
          padding: 14px 18px;
          border: 1px solid var(--pr-border-dark);
          border-radius: 14px;
          background-color: var(--pr-notify-bg-dark);
          color: var(--pr-notify-text-dark);
          box-shadow: var(--pr-shadow-dark);
          box-sizing: border-box;
          opacity: 0;
          font-family: ${SCRIPT_SETTINGS.UI_FONT_STACK};
          text-align: left;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          transition: right ${animationDuration}ms ${appleEaseOutQuint},
                      opacity ${animationDuration * 0.8}ms ${appleEaseOutQuint};
        }
        #${ELEMENT_IDS.MODE_NOTIFICATION}.${
      CSS_CLASSES.MODE_NOTIFICATION_VISIBLE
    } {
          right: 20px;
          opacity: 1;
        }
        #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_ICON
    } {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          margin-right: 14px;
          flex-shrink: 0;
          color: var(--pr-icon-color-dark);
        }
        #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_ICON
    } svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_CONTENT
    } {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          min-width: 0;
        }
        #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_TITLE
    } {
          margin-bottom: 4px;
          color: var(--pr-notify-title-dark);
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_MESSAGE
    } {
          color: var(--pr-notify-text-dark);
          font-size: 13px;
          line-height: 1.45;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        @media (prefers-color-scheme: light) {
          #${ELEMENT_IDS.MODE_NOTIFICATION} {
            border: 1px solid var(--pr-border-light);
            background-color: var(--pr-notify-bg-light);
            color: var(--pr-notify-text-light);
            box-shadow: var(--pr-shadow-light);
          }
           #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_ICON
    } {
             color: var(--pr-icon-color-light);
           }
          #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_TITLE
    } {
            color: var(--pr-notify-title-light);
          }
          #${ELEMENT_IDS.MODE_NOTIFICATION} .${
      CSS_CLASSES.MODE_NOTIFICATION_MESSAGE
    } {
            color: var(--pr-notify-text-light);
          }
        }
      `;
    try {
      GM_addStyle(baseCSS);
    } catch (e) {}
  }

  function detectUserLanguage() {
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
  }

  function getLocalizedString(key, fallbackLang = "en-US") {
    const primaryLangData = localizedStrings || UI_TEXTS[fallbackLang];
    const fallbackLangData = UI_TEXTS[fallbackLang];
    return primaryLangData[key] ?? fallbackLangData[key] ?? `${key}?`;
  }

  function loadDisplayMode() {
    let storedValue;
    try {
      storedValue = GM_getValue(STORAGE_KEYS.MODE_KEY, MODES.HOVER);
    } catch (e) {
      storedValue = MODES.HOVER;
    }
    if (!VALID_MODES.includes(storedValue)) {
      storedValue = MODES.HOVER;
    }
    currentMode = storedValue;
  }

  function saveDisplayMode() {
    try {
      GM_setValue(STORAGE_KEYS.MODE_KEY, currentMode);
    } catch (e) {}
  }

  function displayModeNotification(messageKey) {
    if (notificationTimer) clearTimeout(notificationTimer);
    if (notificationRemovalTimer) clearTimeout(notificationRemovalTimer);
    notificationTimer = null;
    notificationRemovalTimer = null;

    const title = getLocalizedString("SCRIPT_TITLE");
    const message = getLocalizedString(messageKey) || messageKey;

    const renderNotification = () => {
      let notificationElement = document.getElementById(
        ELEMENT_IDS.MODE_NOTIFICATION
      );
      if (!notificationElement && document.body) {
        notificationElement = document.createElement("div");
        notificationElement.id = ELEMENT_IDS.MODE_NOTIFICATION;
        notificationElement.innerHTML = `
          <div class="${CSS_CLASSES.MODE_NOTIFICATION_ICON}">
            ${SVG_ICON_MARKUP}
          </div>
          <div class="${CSS_CLASSES.MODE_NOTIFICATION_CONTENT}">
            <div class="${CSS_CLASSES.MODE_NOTIFICATION_TITLE}"></div>
            <div class="${CSS_CLASSES.MODE_NOTIFICATION_MESSAGE}"></div>
          </div>`.trim();
        document.body.appendChild(notificationElement);
      } else if (!notificationElement) return;

      const titleElement = notificationElement.querySelector(
        `.${CSS_CLASSES.MODE_NOTIFICATION_TITLE}`
      );
      const messageElement = notificationElement.querySelector(
        `.${CSS_CLASSES.MODE_NOTIFICATION_MESSAGE}`
      );
      if (titleElement) titleElement.textContent = title;
      if (messageElement) messageElement.textContent = message;

      notificationElement.classList.remove(
        CSS_CLASSES.MODE_NOTIFICATION_VISIBLE
      );
      void notificationElement.offsetWidth;

      requestAnimationFrame(() => {
        const currentElement = document.getElementById(
          ELEMENT_IDS.MODE_NOTIFICATION
        );
        if (currentElement) {
          setTimeout(() => {
            if (document.getElementById(ELEMENT_IDS.MODE_NOTIFICATION)) {
              currentElement.classList.add(
                CSS_CLASSES.MODE_NOTIFICATION_VISIBLE
              );
            }
          }, 20);
        }
      });

      notificationTimer = setTimeout(() => {
        const currentElement = document.getElementById(
          ELEMENT_IDS.MODE_NOTIFICATION
        );
        if (currentElement) {
          currentElement.classList.remove(
            CSS_CLASSES.MODE_NOTIFICATION_VISIBLE
          );
          notificationRemovalTimer = setTimeout(() => {
            document.getElementById(ELEMENT_IDS.MODE_NOTIFICATION)?.remove();
            notificationTimer = null;
            notificationRemovalTimer = null;
          }, SCRIPT_SETTINGS.ANIMATION_DURATION_MS);
        } else {
          notificationTimer = null;
          notificationRemovalTimer = null;
        }
      }, SCRIPT_SETTINGS.NOTIFICATION_VISIBILITY_DURATION_MS);
    };

    renderNotification();
  }

  function processPasswordInput(input, mode) {
    if (
      !(input instanceof HTMLInputElement) ||
      input.type === "hidden" ||
      input.getAttribute(ATTRIBUTES.PROCESSED) === mode
    ) {
      return;
    }

    if (mode === MODES.ALWAYS_SHOW) {
      input.type = "text";
    } else {
      if (input.type !== "password") {
        input.type = "password";
      }
    }
    input.setAttribute(ATTRIBUTES.PROCESSED, mode);
  }

  function findAndProcessNewInputs(rootNode, mode) {
    try {
      const query = `input[type="password"]:not([${ATTRIBUTES.PROCESSED}="${mode}"])`;
      rootNode.querySelectorAll(query).forEach((input) => {
        processPasswordInput(input, mode);
      });

      rootNode.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) {
          findAndProcessNewInputs(el.shadowRoot, mode);
        }
      });
    } catch (e) {}
  }

  function applyCurrentModeToAllInputs() {
    try {
      const query = `input[${ATTRIBUTES.PROCESSED}], input[type="password"]:not([${ATTRIBUTES.PROCESSED}="${currentMode}"])`;
      document.querySelectorAll(query).forEach((input) => {
        processPasswordInput(input, currentMode);
      });

      document.querySelectorAll("body *, html *").forEach((el) => {
        if (el.shadowRoot) {
          const shadowQuery = `input[${ATTRIBUTES.PROCESSED}], input[type="password"]:not([${ATTRIBUTES.PROCESSED}="${currentMode}"])`;
          el.shadowRoot.querySelectorAll(shadowQuery).forEach((input) => {
            processPasswordInput(input, currentMode);
          });
        }
      });
    } catch (e) {}
  }

  function updateUserScriptMenuCommands() {
    registeredMenuCommandIds.forEach((id) => {
      try {
        GM_unregisterMenuCommand(id);
      } catch (e) {}
    });
    registeredMenuCommandIds = [];

    VALID_MODES.forEach((mode) => {
      const menuKey = MODE_MENU_TEXT_KEYS[mode];
      const baseText = getLocalizedString(menuKey);
      const commandText = baseText + (mode === currentMode ? " ✅" : "");

      try {
        const commandId = GM_registerMenuCommand(commandText, () =>
          setMode(mode)
        );
        registeredMenuCommandIds.push(commandId);
      } catch (e) {}
    });
  }

  function setMode(newMode) {
    if (currentMode === newMode || !VALID_MODES.includes(newMode)) {
      return;
    }

    currentMode = newMode;
    saveDisplayMode();

    const alertMessageKey = MODE_ALERT_TEXT_KEYS[currentMode];
    displayModeNotification(alertMessageKey);

    applyCurrentModeToAllInputs();
    updateUserScriptMenuCommands();
  }

  function showPasswordOnHover(event) {
    const input = event.target;
    if (
      currentMode === MODES.HOVER &&
      input instanceof HTMLInputElement &&
      input.matches(
        `input[type="password"][${ATTRIBUTES.PROCESSED}="${MODES.HOVER}"]`
      )
    ) {
      input.type = "text";
    }
  }

  function hidePasswordOnLeave(event) {
    const input = event.target;
    if (
      currentMode === MODES.HOVER &&
      input instanceof HTMLInputElement &&
      input.matches(
        `input[type="text"][${ATTRIBUTES.PROCESSED}="${MODES.HOVER}"]`
      )
    ) {
      input.type = "password";
    }
  }

  function togglePasswordOnDoubleClick(event) {
    const input = event.target;
    if (
      currentMode === MODES.DBLCLICK &&
      input instanceof HTMLInputElement &&
      input.matches(`input[${ATTRIBUTES.PROCESSED}="${MODES.DBLCLICK}"]`)
    ) {
      input.type = input.type === "password" ? "text" : "password";
    }
  }

  function handleFocusIn(event) {
    const input = event.target;
    if (
      currentMode === MODES.FOCUS &&
      input instanceof HTMLInputElement &&
      input.matches(
        `input[type="password"][${ATTRIBUTES.PROCESSED}="${MODES.FOCUS}"]`
      )
    ) {
      input.type = "text";
    }
  }

  function handleFocusOut(event) {
    const input = event.target;
    if (
      currentMode === MODES.FOCUS &&
      input instanceof HTMLInputElement &&
      input.matches(
        `input[type="text"][${ATTRIBUTES.PROCESSED}="${MODES.FOCUS}"]`
      )
    ) {
      input.type = "password";
    }
  }

  function handleKeyboardShortcut(event) {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.altKey &&
      event.code === "KeyP"
    ) {
      event.preventDefault();
      event.stopPropagation();

      const currentIndex = VALID_MODES.indexOf(currentMode);
      const nextIndex = (currentIndex + 1) % VALID_MODES.length;
      const nextMode = VALID_MODES[nextIndex];

      setMode(nextMode);
    }
  }

  function handleDOMMutation(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          try {
            if (
              node.matches &&
              node.matches('input[type="password"]') &&
              node.getAttribute(ATTRIBUTES.PROCESSED) !== currentMode
            ) {
              processPasswordInput(node, currentMode);
            }

            if (node.querySelector && node.querySelector("input")) {
              findAndProcessNewInputs(node, currentMode);
            } else if (node.shadowRoot) {
              findAndProcessNewInputs(node.shadowRoot, currentMode);
            }
          } catch (e) {}
        });
      } else if (
        mutation.type === "attributes" &&
        mutation.attributeName === "type"
      ) {
        const targetInput = mutation.target;
        if (
          targetInput.nodeType === Node.ELEMENT_NODE &&
          targetInput.matches &&
          targetInput.matches('input[type="password"]') &&
          targetInput.getAttribute(ATTRIBUTES.PROCESSED) !== currentMode
        ) {
          try {
            processPasswordInput(targetInput, currentMode);
          } catch (e) {}
        }
      }
    }
  }

  function initializeDOMObserver() {
    if (domMutationObserver) return;
    const observerOptions = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["type"],
    };
    domMutationObserver = new MutationObserver(handleDOMMutation);
    if (document.body) {
      try {
        domMutationObserver.observe(document.body, observerOptions);
      } catch (error) {
        domMutationObserver = null;
      }
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          if (document.body) {
            try {
              domMutationObserver.observe(document.body, observerOptions);
            } catch (error) {
              domMutationObserver = null;
            }
          }
        },
        { once: true }
      );
    }
  }

  function initializeEventListeners() {
    document.body.addEventListener("mouseenter", showPasswordOnHover, true);
    document.body.addEventListener("mouseleave", hidePasswordOnLeave, true);
    document.body.addEventListener("dblclick", togglePasswordOnDoubleClick);
    document.addEventListener("focus", handleFocusIn, true);
    document.addEventListener("blur", handleFocusOut, true);
    document.addEventListener("keydown", handleKeyboardShortcut, true);
  }

  function initializeScript() {
    applyCurrentModeToAllInputs();
    initializeEventListeners();
    initializeDOMObserver();
  }

  try {
    injectCoreUIStyles();
    currentLocale = detectUserLanguage();
    localizedStrings = UI_TEXTS[currentLocale] || UI_TEXTS["en-US"];
    loadDisplayMode();
    updateUserScriptMenuCommands();
    initializeScript();
  } catch (error) {}
})();
